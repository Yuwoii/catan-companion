"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { 
  Match, 
  MatchParticipant, 
  MatchParticipantWithPlayer,
  CreateMatchInput,
  ExpansionType 
} from "@/types";

interface GameState {
  match: Match | null;
  participants: MatchParticipantWithPlayer[];
  isLoading: boolean;
  error: string | null;
}

export function useGame(matchId?: string) {
  const [state, setState] = useState<GameState>({
    match: null,
    participants: [],
    isLoading: true,
    error: null,
  });

  // Fetch game data
  const fetchGame = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    // Fetch match
    const { data: matchData, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .eq("id", id)
      .single();

    if (matchError) {
      setState((prev) => ({ 
        ...prev, 
        isLoading: false, 
        error: matchError.message 
      }));
      return;
    }

    // Fetch participants with player data
    const { data: participantData, error: participantError } = await supabase
      .from("match_participants")
      .select("*, player:players(*)")
      .eq("match_id", id)
      .order("turn_order");

    if (participantError) {
      setState((prev) => ({ 
        ...prev, 
        isLoading: false, 
        error: participantError.message 
      }));
      return;
    }

    setState({
      match: matchData,
      participants: participantData || [],
      isLoading: false,
      error: null,
    });
  }, []);

  // Create a new game
  const createGame = async (input: CreateMatchInput): Promise<string | null> => {
    // Create the match
    const { data: matchData, error: matchError } = await supabase
      .from("matches")
      .insert({
        expansion: input.expansion,
        target_vp: input.target_vp,
        is_active: true,
      })
      .select()
      .single();

    if (matchError || !matchData) {
      setState((prev) => ({ ...prev, error: matchError?.message || "Failed to create match" }));
      return null;
    }

    // Create participants
    const participants = input.player_ids.map((player_id, index) => ({
      match_id: matchData.id,
      player_id,
      turn_order: index + 1,
      score: 0,
      has_longest_road: false,
      has_largest_army: false,
    }));

    const { error: participantError } = await supabase
      .from("match_participants")
      .insert(participants);

    if (participantError) {
      // Rollback: delete the match
      await supabase.from("matches").delete().eq("id", matchData.id);
      setState((prev) => ({ ...prev, error: participantError.message }));
      return null;
    }

    return matchData.id;
  };

  // Update a participant's score
  const updateScore = async (participantId: string, newScore: number) => {
    const { error } = await supabase
      .from("match_participants")
      .update({ score: Math.max(0, newScore) })
      .eq("id", participantId);

    if (error) {
      setState((prev) => ({ ...prev, error: error.message }));
      return false;
    }

    setState((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.id === participantId ? { ...p, score: Math.max(0, newScore) } : p
      ),
    }));

    return true;
  };

  // Toggle special card (handles the "only one player can have it" logic)
  const toggleSpecialCard = async (
    participantId: string,
    cardType: "has_longest_road" | "has_largest_army"
  ) => {
    const currentHolder = state.participants.find((p) => p[cardType]);
    const targetParticipant = state.participants.find((p) => p.id === participantId);

    if (!targetParticipant) return false;

    // If already has it, remove it
    if (targetParticipant[cardType]) {
      const { error } = await supabase
        .from("match_participants")
        .update({ [cardType]: false })
        .eq("id", participantId);

      if (error) {
        setState((prev) => ({ ...prev, error: error.message }));
        return false;
      }

      setState((prev) => ({
        ...prev,
        participants: prev.participants.map((p) =>
          p.id === participantId ? { ...p, [cardType]: false } : p
        ),
      }));
      return true;
    }

    // Transfer from current holder to new player
    if (currentHolder) {
      const { error: removeError } = await supabase
        .from("match_participants")
        .update({ [cardType]: false })
        .eq("id", currentHolder.id);

      if (removeError) {
        setState((prev) => ({ ...prev, error: removeError.message }));
        return false;
      }
    }

    const { error: addError } = await supabase
      .from("match_participants")
      .update({ [cardType]: true })
      .eq("id", participantId);

    if (addError) {
      setState((prev) => ({ ...prev, error: addError.message }));
      return false;
    }

    setState((prev) => ({
      ...prev,
      participants: prev.participants.map((p) => ({
        ...p,
        [cardType]: p.id === participantId,
      })),
    }));

    return true;
  };

  // End the game
  const endGame = async (winnerId: string) => {
    if (!state.match) return false;

    const { error } = await supabase
      .from("matches")
      .update({
        is_active: false,
        ended_at: new Date().toISOString(),
        winner_id: winnerId,
      })
      .eq("id", state.match.id);

    if (error) {
      setState((prev) => ({ ...prev, error: error.message }));
      return false;
    }

    setState((prev) => ({
      ...prev,
      match: prev.match
        ? {
            ...prev.match,
            is_active: false,
            ended_at: new Date().toISOString(),
            winner_id: winnerId,
          }
        : null,
    }));

    return true;
  };

  // Load game on mount if matchId is provided
  useEffect(() => {
    if (matchId) {
      fetchGame(matchId);
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [matchId, fetchGame]);

  // Set up realtime subscription for live updates
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_participants",
          filter: `match_id=eq.${matchId}`,
        },
        () => {
          // Refetch on any change
          fetchGame(matchId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, fetchGame]);

  return {
    ...state,
    createGame,
    updateScore,
    toggleSpecialCard,
    endGame,
    refetch: matchId ? () => fetchGame(matchId) : undefined,
  };
}

