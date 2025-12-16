"use client";

import { Route, Swords, Shield, Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAvatarUrl } from "@/lib/constants";
import type { MatchParticipant, Player } from "@/types";

interface CompactScoreCardProps {
  player: Player;
  participant: MatchParticipant;
  targetVP: number;
  rank: number;
  isSelected: boolean;
  onClick: () => void;
  isCitiesKnights?: boolean;
}

export function CompactScoreCard({
  player,
  participant,
  targetVP,
  rank,
  isSelected,
  onClick,
  isCitiesKnights = false,
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
    (isCitiesKnights ? (participant.has_defender ? 2 : 0) : (participant.has_largest_army ? 2 : 0)) +
    (participant.has_trade_metropolis ? 2 : 0) +
    (participant.has_politics_metropolis ? 2 : 0) +
    (participant.has_science_metropolis ? 2 : 0);

  const isWinning = totalScore >= targetVP;
  const isLeading = rank === 1 && totalScore > 0;

  const metropolisCount = 
    (participant.has_trade_metropolis ? 1 : 0) +
    (participant.has_politics_metropolis ? 1 : 0) +
    (participant.has_science_metropolis ? 1 : 0);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`relative rounded-xl bg-card p-1.5 cursor-pointer text-left w-full h-full flex flex-col overflow-hidden ${
        isSelected
          ? "border-4 border-primary"
          : isWinning 
            ? "border-2 border-accent" 
            : isLeading 
              ? "border-2 border-primary/50" 
              : "border border-border"
      }`}
    >
      {/* Player Info Row */}
      <div className="flex items-center gap-2">
        <div 
          className="relative shrink-0 clip-hexagon-rounded"
          style={{ 
            width: 32, 
            height: 32, 
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

        <p className="font-bold text-base truncate leading-tight flex-1">{player.name}</p>
      </div>

      {/* Giant Score */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div
          className="text-4xl sm:text-5xl font-black font-mono tabular-nums leading-none"
          style={{ color: player.preferred_color }}
        >
          {totalScore}
        </div>
      </div>

      {/* City Levels for C&K - Larger with colored backgrounds */}
      {isCitiesKnights && (
        <div className="flex justify-center gap-1 mb-1">
          <span className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-1.5 rounded text-sm font-bold">
            T:{participant.trade_level ?? 0}
          </span>
          <span className="bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 rounded text-sm font-bold">
            P:{participant.politics_level ?? 0}
          </span>
          <span className="bg-green-500/20 text-green-600 dark:text-green-400 px-1.5 rounded text-sm font-bold">
            S:{participant.science_level ?? 0}
          </span>
        </div>
      )}

      {/* Special Card Badges - Icon only, larger */}
      <div className="flex justify-center gap-1.5 mt-auto">
        {/* Longest Road */}
        <div 
          className={`flex items-center justify-center w-7 h-7 rounded-full ${
            participant.has_longest_road
              ? "bg-catan-wood text-white"
              : "bg-muted/30 text-muted-foreground/50"
          }`}
        >
          <Route className="w-4 h-4" />
        </div>

        {/* Army or Defender */}
        {isCitiesKnights ? (
          <div 
            className={`flex items-center justify-center w-7 h-7 rounded-full ${
              participant.has_defender
                ? "bg-catan-ore text-white"
                : "bg-muted/30 text-muted-foreground/50"
            }`}
          >
            <Shield className="w-4 h-4" />
          </div>
        ) : (
          <div 
            className={`flex items-center justify-center w-7 h-7 rounded-full ${
              participant.has_largest_army
                ? "bg-catan-ore text-white"
                : "bg-muted/30 text-muted-foreground/50"
            }`}
          >
            <Swords className="w-4 h-4" />
          </div>
        )}

        {/* Metropolis - with count badge */}
        {isCitiesKnights && (
          <div 
            className={`relative flex items-center justify-center w-7 h-7 rounded-full ${
              metropolisCount > 0
                ? "bg-amber-500 text-white"
                : "bg-muted/30 text-muted-foreground/50"
            }`}
          >
            <Building2 className="w-4 h-4" />
            {metropolisCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-white text-amber-600 text-[10px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center border border-amber-500">
                {metropolisCount}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
