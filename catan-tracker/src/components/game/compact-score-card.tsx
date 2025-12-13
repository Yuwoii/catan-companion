"use client";

import { motion } from "framer-motion";
import { Minus, Plus, Route, Swords } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { generateAvatarUrl } from "@/lib/constants";
import type { MatchParticipant, Player } from "@/types";

interface CompactScoreCardProps {
  player: Player;
  participant: MatchParticipant;
  targetVP: number;
  rank: number;
  onScoreChange: (delta: number) => void;
  onToggleLongestRoad: () => void;
  onToggleLargestArmy: () => void;
}

export function CompactScoreCard({
  player,
  participant,
  targetVP,
  rank,
  onScoreChange,
  onToggleLongestRoad,
  onToggleLargestArmy,
}: CompactScoreCardProps) {
  const initials = player.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const avatarUrl = player.avatar_seed 
    ? generateAvatarUrl(player.avatar_seed, "adventurer")
    : null;

  const totalScore = 
    participant.score + 
    (participant.has_longest_road ? 2 : 0) + 
    (participant.has_largest_army ? 2 : 0);

  const isWinning = totalScore >= targetVP;
  const isLeading = rank === 1 && totalScore > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-xl border bg-card p-2 transition-all ${
        isWinning 
          ? "ring-2 ring-accent shadow-lg winner-glow" 
          : isLeading 
            ? "ring-1 ring-primary/50" 
            : ""
      }`}
      style={{ borderColor: `${player.preferred_color}40` }}
    >
      {/* Header: Avatar + Name + Score */}
      <div className="flex items-center gap-2 mb-2">
        <div 
          className="relative shrink-0 clip-hexagon-rounded"
          style={{ 
            width: 36, 
            height: 36, 
            backgroundColor: player.preferred_color,
            padding: 2,
          }}
        >
          <Avatar className="w-full h-full clip-hexagon-rounded">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={player.name} />}
            <AvatarFallback 
              style={{ backgroundColor: player.preferred_color }}
              className="text-white font-bold text-xs"
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate leading-tight">{player.name}</p>
          <div className="flex gap-1">
            {participant.has_longest_road && (
              <span className="text-xs">🛣️</span>
            )}
            {participant.has_largest_army && (
              <span className="text-xs">⚔️</span>
            )}
          </div>
        </div>

        <motion.div
          key={totalScore}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
          className="text-2xl font-bold font-mono tabular-nums"
          style={{ color: player.preferred_color }}
        >
          {totalScore}
        </motion.div>
      </div>

      {/* Score Controls Row */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-lg shrink-0"
          onClick={() => onScoreChange(-1)}
          disabled={participant.score <= 0}
        >
          <Minus className="h-5 w-5" />
        </Button>

        <div className="flex-1 text-center">
          <span className="text-lg font-semibold font-mono">{participant.score}</span>
          <span className="text-xs text-muted-foreground ml-1">base</span>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-lg shrink-0"
          onClick={() => onScoreChange(1)}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Special Cards Row */}
      <div className="flex gap-1 mt-2">
        <button
          onClick={onToggleLongestRoad}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all ${
            participant.has_longest_road
              ? "bg-catan-wood text-white"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          <Route className="w-3 h-3" />
          <span>Road</span>
          {participant.has_longest_road && <span className="opacity-75">+2</span>}
        </button>

        <button
          onClick={onToggleLargestArmy}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all ${
            participant.has_largest_army
              ? "bg-catan-ore text-white"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          <Swords className="w-3 h-3" />
          <span>Army</span>
          {participant.has_largest_army && <span className="opacity-75">+2</span>}
        </button>
      </div>
    </motion.div>
  );
}

