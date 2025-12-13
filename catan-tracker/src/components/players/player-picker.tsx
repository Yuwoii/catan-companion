"use client";

import { PlayerCard } from "./player-card";
import type { Player } from "@/types";

interface PlayerPickerProps {
  players: Player[];
  selectedIds: string[];
  onToggle: (playerId: string) => void;
  minPlayers?: number;
  maxPlayers?: number;
}

export function PlayerPicker({
  players,
  selectedIds,
  onToggle,
  minPlayers = 3,
  maxPlayers = 6,
}: PlayerPickerProps) {
  const canSelectMore = selectedIds.length < maxPlayers;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Select {minPlayers}-{maxPlayers} players
        </span>
        <span className={`font-medium ${
          selectedIds.length >= minPlayers ? "text-primary" : "text-muted-foreground"
        }`}>
          {selectedIds.length} selected
        </span>
      </div>

      <div className="grid gap-2">
        {players.map((player) => {
          const isSelected = selectedIds.includes(player.id);
          const isDisabled = !isSelected && !canSelectMore;

          return (
            <div
              key={player.id}
              className={isDisabled ? "opacity-50 pointer-events-none" : ""}
            >
              <PlayerCard
                player={player}
                selected={isSelected}
                onClick={() => onToggle(player.id)}
              />
            </div>
          );
        })}
      </div>

      {players.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No players yet. Add some friends first!
          </p>
        </div>
      )}
    </div>
  );
}
