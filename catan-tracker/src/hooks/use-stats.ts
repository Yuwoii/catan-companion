"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { PlayerStats, MatchWithDetails } from "@/types";

export function useStats() {
  const [leaderboard, setLeaderboard] = useState<PlayerStats[]>([]);
  const [history, setHistory] = useState<MatchWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard from player_stats view
  const fetchLeaderboard = useCallback(async () => {
    if (!supabase) return [];

    const { data, error: fetchError } = await supabase
      .from("player_stats")
      .select("*")
      .order("win_rate", { ascending: false });

    if (fetchError) {
      console.error("Leaderboard error:", fetchError);
      return [];
    }

    return (data || []).map(row => ({
      ...row,
      games_played: Number(row.games_played) || 0,
      wins: Number(row.wins) || 0,
      win_rate: Number(row.win_rate) || 0,
      avg_score: Number(row.avg_score) || 0,
      longest_road_count: Number(row.longest_road_count) || 0,
      largest_army_count: Number(row.largest_army_count) || 0,
    }));
  }, []);

  // Fetch match history with participants
  const fetchHistory = useCallback(async (limit = 20) => {
    if (!supabase) return [];

    // First, fetch completed matches
    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .eq("is_active", false)
      .order("ended_at", { ascending: false })
      .limit(limit);

    if (matchesError) {
      console.error("History error:", matchesError);
      return [];
    }

    if (!matchesData || matchesData.length === 0) {
      return [];
    }

    // Fetch participants for all matches
    const matchIds = matchesData.map((m) => m.id);
    const { data: participantsData, error: participantsError } = await supabase
      .from("match_participants")
      .select(`
        *,
        player:players(*)
      `)
      .in("match_id", matchIds)
      .order("turn_order");

    if (participantsError) {
      console.error("Participants error:", participantsError);
      return [];
    }

    // Combine matches with their participants
    const matchesWithDetails: MatchWithDetails[] = matchesData.map((match) => ({
      ...match,
      participants: (participantsData || []).filter((p) => p.match_id === match.id),
    }));

    return matchesWithDetails;
  }, []);

  // Fetch active games
  const fetchActiveGames = useCallback(async () => {
    if (!supabase) return [];

    const { data, error: fetchError } = await supabase
      .from("matches")
      .select(`
        *,
        participants:match_participants(
          *,
          player:players(*)
        )
      `)
      .eq("is_active", true)
      .order("started_at", { ascending: false });

    if (fetchError) {
      console.error("Active games error:", fetchError);
      return [];
    }

    return data || [];
  }, []);

  // Load all stats
  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [leaderboardData, historyData] = await Promise.all([
        fetchLeaderboard(),
        fetchHistory(),
      ]);

      setLeaderboard(leaderboardData);
      setHistory(historyData);
    } catch (err) {
      setError("Failed to load statistics");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchLeaderboard, fetchHistory]);

  // Load on mount
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    leaderboard,
    history,
    isLoading,
    error,
    refresh: loadStats,
    fetchActiveGames,
  };
}
