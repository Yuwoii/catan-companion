"use client";

import { Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateAvatarUrl } from "@/lib/constants";
import type { Player } from "@/types";

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
  onDelete?: () => void;
  selected?: boolean;
  showDelete?: boolean;
}

export function PlayerCard({ 
  player, 
  onClick, 
  onDelete,
  selected,
  showDelete = false,
}: PlayerCardProps) {
  const initials = player.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const avatarUrl = player.avatar_seed 
    ? generateAvatarUrl(player.avatar_seed, "adventurer")
    : null;

  return (
    <Card 
      className={`transition-all ${onClick ? "cursor-pointer hover:scale-[1.02]" : ""} ${
        selected ? "ring-2 ring-primary shadow-md" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-3 p-4">
        {/* Hexagonal Avatar */}
        <div 
          className="relative clip-hexagon-rounded"
          style={{ 
            width: 56, 
            height: 56, 
            backgroundColor: player.preferred_color,
            padding: 3,
          }}
        >
          <Avatar className="w-full h-full clip-hexagon-rounded">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={player.name} />}
            <AvatarFallback 
              style={{ backgroundColor: player.preferred_color }}
              className="text-white font-semibold"
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-lg truncate">{player.name}</p>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full border border-border"
              style={{ backgroundColor: player.preferred_color }}
            />
            <span className="text-xs text-muted-foreground">
              Ready to settle
            </span>
          </div>
        </div>

        {/* Delete Button */}
        {showDelete && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
