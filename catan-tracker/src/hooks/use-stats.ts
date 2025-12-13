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
    const { data, error: fetchError } = await supabase
      .from("player_stats")
      .select("*")
      .order("win_rate", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      return [];
    }

    return data || [];
  }, []);

  // Fetch match history with participants
  const fetchHistory = useCallback(async (limit = 20) => {
    // First, fetch completed matches
    const { data: matchesData, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .eq("is_active", false)
      .order("ended_at", { ascending: false })
      .limit(limit);

    if (matchesError) {
      setError(matchesError.message);
      return [];
    }

    if (!matchesData || matchesData.length === 0) {
      return [];
    }

    // Fetch participants for all matches
    const matchIds = matchesData.map((m) => m.id);
    const { data: participantsData, error: participantsError } = await supabase
      .from("match_participants")
      .select("*, player:players(*)")
      .in("match_id", matchIds)
      .order("turn_order");

    if (participantsError) {
      setError(participantsError.message);
      return [];
    }

    // Combine matches with their participants
    const matchesWithDetails: MatchWithDetails[] = matchesData.map((match) => ({
      ...match,
      participants: (participantsData || []).filter((p) => p.match_id === match.id),
    }));

    return matchesWithDetails;
  }, []);

  // Load all stats
  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [leaderboardData, historyData] = await Promise.all([
      fetchLeaderboard(),
      fetchHistory(),
    ]);

    setLeaderboard(leaderboardData);
    setHistory(historyData);
    setIsLoading(false);
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
  };
}

