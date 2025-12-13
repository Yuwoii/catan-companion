"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Player, CreatePlayerInput, UpdatePlayerInput } from "@/types";

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all players
  const fetchPlayers = useCallback(async () => {
    if (!supabase) {
      setError("Supabase not configured");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("players")
      .select("*")
      .order("name");

    if (fetchError) {
      setError(fetchError.message);
      setPlayers([]);
    } else {
      setPlayers(data || []);
    }

    setIsLoading(false);
  }, []);

  // Create a new player
  const createPlayer = async (input: CreatePlayerInput): Promise<Player | null> => {
    if (!supabase) {
      setError("Supabase not configured");
      return null;
    }

    const { data, error: createError } = await supabase
      .from("players")
      .insert({
        name: input.name,
        preferred_color: input.preferred_color,
        avatar_seed: input.avatar_seed || input.name.toLowerCase().replace(/\s+/g, "-"),
      })
      .select()
      .single();

    if (createError) {
      setError(createError.message);
      return null;
    }

    setPlayers((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    return data;
  };

  // Update a player
  const updatePlayer = async (
    id: string,
    updates: UpdatePlayerInput
  ): Promise<Player | null> => {
    if (!supabase) {
      setError("Supabase not configured");
      return null;
    }

    const { data, error: updateError } = await supabase
      .from("players")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return null;
    }

    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? data : p)).sort((a, b) => a.name.localeCompare(b.name))
    );
    return data;
  };

  // Delete a player
  const deletePlayer = async (id: string): Promise<boolean> => {
    if (!supabase) {
      setError("Supabase not configured");
      return false;
    }

    const { error: deleteError } = await supabase
      .from("players")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return false;
    }

    setPlayers((prev) => prev.filter((p) => p.id !== id));
    return true;
  };

  // Clear error
  const clearError = () => setError(null);

  // Load players on mount
  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return {
    players,
    isLoading,
    error,
    fetchPlayers,
    createPlayer,
    updatePlayer,
    deletePlayer,
    clearError,
  };
}
