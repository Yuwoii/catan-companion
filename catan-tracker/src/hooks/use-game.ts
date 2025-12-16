"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import type { 
  Match, 
  MatchParticipantWithPlayer,
  CreateMatchInput,
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
    isLoading: !!matchId,
    error: null,
  });
  
  // Track if initial load is done
  const initialLoadDone = useRef(false);

  // Fetch game data - showLoading controls whether to show loading spinner
  const fetchGame = useCallback(async (id: string, showLoading = true) => {
    if (!supabase) {
      setState((prev) => ({ ...prev, isLoading: false, error: "Supabase not configured" }));
      return;
    }

    // Only show loading on initial load, not on background syncs
    if (showLoading && !initialLoadDone.current) {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
    }

    try {
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
        .select(`
          *,
          player:players(*)
        `)
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

      initialLoadDone.current = true;
      
      setState({
        match: matchData,
        participants: participantData || [],
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to fetch game data",
      }));
    }
  }, []);

  // Create a new game
  const createGame = async (input: CreateMatchInput): Promise<string | null> => {
    if (!supabase) {
      setState((prev) => ({ ...prev, error: "Supabase not configured" }));
      return null;
    }

    try {
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
    } catch (err) {
      setState((prev) => ({ ...prev, error: "Failed to create game" }));
      return null;
    }
  };

  // Update a participant's score - fully optimistic, no blocking
  const updateScore = useCallback((participantId: string, newScore: number) => {
    if (!supabase) return;

    // Optimistic update - happens immediately, no await
    setState((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.id === participantId ? { ...p, score: Math.max(0, newScore) } : p
      ),
    }));

    // Fire and forget - update database in background
    supabase
      .from("match_participants")
      .update({ score: Math.max(0, newScore) })
      .eq("id", participantId)
      .then(({ error }) => {
        if (error) {
          console.error("Failed to sync score:", error);
          // Could show a toast here, but don't block UI
        }
      });
  }, []);

  // Toggle special card - fully optimistic
  const toggleSpecialCard = useCallback((
    participantId: string,
    cardType: "has_longest_road" | "has_largest_army"
  ) => {
    if (!supabase) return;

    const currentHolder = state.participants.find((p) => p[cardType]);
    const targetParticipant = state.participants.find((p) => p.id === participantId);

    if (!targetParticipant) return;

    // Optimistic update - happens immediately
    setState((prev) => ({
      ...prev,
      participants: prev.participants.map((p) => {
        if (p.id === participantId) {
          return { ...p, [cardType]: !p[cardType] };
        }
        // Remove from current holder if giving to new player
        if (currentHolder && p.id === currentHolder.id && !targetParticipant[cardType]) {
          return { ...p, [cardType]: false };
        }
        return p;
      }),
    }));

    // Fire and forget - update database in background
    const updateDatabase = async () => {
      try {
        if (targetParticipant[cardType]) {
          // Remove from target
          await supabase
            .from("match_participants")
            .update({ [cardType]: false })
            .eq("id", participantId);
        } else {
          // Remove from current holder first
          if (currentHolder && currentHolder.id !== participantId) {
            await supabase
              .from("match_participants")
              .update({ [cardType]: false })
              .eq("id", currentHolder.id);
          }
          // Add to target
          await supabase
            .from("match_participants")
            .update({ [cardType]: true })
            .eq("id", participantId);
        }
      } catch (err) {
        console.error("Failed to sync special card:", err);
      }
    };

    updateDatabase();
  }, [state.participants]);

  // Update city improvement level (Cities & Knights) - fully optimistic
  const updateCityImprovement = useCallback((
    participantId: string,
    type: "trade_level" | "politics_level" | "science_level",
    newLevel: number
  ) => {
    if (!supabase) return;

    const clampedLevel = Math.max(0, Math.min(5, newLevel));

    // Optimistic update
    setState((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.id === participantId ? { ...p, [type]: clampedLevel } : p
      ),
    }));

    // Fire and forget
    supabase
      .from("match_participants")
      .update({ [type]: clampedLevel })
      .eq("id", participantId)
      .then(({ error }) => {
        if (error) {
          console.error("Failed to sync city improvement:", error);
        }
      });
  }, []);

  // Toggle metropolis (Cities & Knights) - fully optimistic
  const toggleMetropolis = useCallback((
    participantId: string,
    type: "has_trade_metropolis" | "has_politics_metropolis" | "has_science_metropolis"
  ) => {
    if (!supabase) return;

    const currentHolder = state.participants.find((p) => p[type]);
    const targetParticipant = state.participants.find((p) => p.id === participantId);

    if (!targetParticipant) return;

    // Optimistic update
    setState((prev) => ({
      ...prev,
      participants: prev.participants.map((p) => {
        if (p.id === participantId) {
          return { ...p, [type]: !p[type] };
        }
        if (currentHolder && p.id === currentHolder.id && !targetParticipant[type]) {
          return { ...p, [type]: false };
        }
        return p;
      }),
    }));

    // Fire and forget
    const updateDatabase = async () => {
      try {
        if (targetParticipant[type]) {
          await supabase
            .from("match_participants")
            .update({ [type]: false })
            .eq("id", participantId);
        } else {
          if (currentHolder && currentHolder.id !== participantId) {
            await supabase
              .from("match_participants")
              .update({ [type]: false })
              .eq("id", currentHolder.id);
          }
          await supabase
            .from("match_participants")
            .update({ [type]: true })
            .eq("id", participantId);
        }
      } catch (err) {
        console.error("Failed to sync metropolis:", err);
      }
    };

    updateDatabase();
  }, [state.participants]);

  // Toggle Defender of Catan (Cities & Knights) - fully optimistic
  const toggleDefender = useCallback((participantId: string) => {
    if (!supabase) return;

    const currentHolder = state.participants.find((p) => p.has_defender);
    const targetParticipant = state.participants.find((p) => p.id === participantId);

    if (!targetParticipant) return;

    // Optimistic update
    setState((prev) => ({
      ...prev,
      participants: prev.participants.map((p) => {
        if (p.id === participantId) {
          return { ...p, has_defender: !p.has_defender };
        }
        if (currentHolder && p.id === currentHolder.id && !targetParticipant.has_defender) {
          return { ...p, has_defender: false };
        }
        return p;
      }),
    }));

    // Fire and forget
    const updateDatabase = async () => {
      try {
        if (targetParticipant.has_defender) {
          await supabase
            .from("match_participants")
            .update({ has_defender: false })
            .eq("id", participantId);
        } else {
          if (currentHolder && currentHolder.id !== participantId) {
            await supabase
              .from("match_participants")
              .update({ has_defender: false })
              .eq("id", currentHolder.id);
          }
          await supabase
            .from("match_participants")
            .update({ has_defender: true })
            .eq("id", participantId);
        }
      } catch (err) {
        console.error("Failed to sync defender:", err);
      }
    };

    updateDatabase();
  }, [state.participants]);

  // End the game
  const endGame = async (winnerId: string) => {
    if (!supabase || !state.match) return false;

    // Optimistic update
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

    return true;
  };

  // Load game on mount if matchId is provided
  useEffect(() => {
    if (matchId) {
      initialLoadDone.current = false;
      fetchGame(matchId, true);
    }
  }, [matchId, fetchGame]);

  // Set up realtime subscription for live updates from OTHER clients
  useEffect(() => {
    if (!matchId || !supabase) return;

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
          // Background sync - don't show loading spinner
          fetchGame(matchId, false);
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
    updateCityImprovement,
    toggleMetropolis,
    toggleDefender,
    endGame,
    refetch: matchId ? () => fetchGame(matchId, false) : undefined,
  };
}
