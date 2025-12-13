"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreControls } from "./score-controls";
import { SpecialToggle } from "./special-toggle";
import { generateAvatarUrl } from "@/lib/constants";
import type { MatchParticipant, Player } from "@/types";

interface ScoreCardProps {
  player: Player;
  participant: MatchParticipant;
  targetVP: number;
  onScoreChange: (delta: number) => void;
  onToggleLongestRoad: () => void;
  onToggleLargestArmy: () => void;
}

export function ScoreCard({
  player,
  participant,
  targetVP,
  onScoreChange,
  onToggleLongestRoad,
  onToggleLargestArmy,
}: ScoreCardProps) {
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`transition-all ${
          isWinning ? "winner-glow ring-2 ring-accent" : ""
        }`}
      >
        <CardContent className="p-4 space-y-4">
          {/* Player Header */}
          <div className="flex items-center gap-3">
            <div 
              className="relative clip-hexagon-rounded"
              style={{ 
                width: 60, 
                height: 60, 
                backgroundColor: player.preferred_color,
                padding: 3,
              }}
            >
              <Avatar className="w-full h-full clip-hexagon-rounded">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={player.name} />}
                <AvatarFallback 
                  style={{ backgroundColor: player.preferred_color }}
                  className="text-white font-bold text-lg"
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1">
              <p className="font-semibold text-lg">{player.name}</p>
              <div className="flex gap-1 flex-wrap">
                {participant.has_longest_road && (
                  <Badge variant="secondary" className="text-xs">🛣️ Road</Badge>
                )}
                {participant.has_largest_army && (
                  <Badge variant="secondary" className="text-xs">⚔️ Army</Badge>
                )}
              </div>
            </div>

            <motion.div
              key={totalScore}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold font-mono"
              style={{ color: player.preferred_color }}
            >
              {totalScore}
            </motion.div>
          </div>

          {/* Score Controls */}
          <ScoreControls
            score={participant.score}
            onChange={onScoreChange}
          />

          {/* Special Cards */}
          <div className="flex gap-2">
            <SpecialToggle
              label="Longest Road"
              icon="🛣️"
              active={participant.has_longest_road}
              onToggle={onToggleLongestRoad}
            />
            <SpecialToggle
              label="Largest Army"
              icon="⚔️"
              active={participant.has_largest_army}
              onToggle={onToggleLargestArmy}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
