"use client";

import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateAvatarUrl } from "@/lib/constants";
import type { PlayerStats } from "@/types";

interface LeaderboardTableProps {
  stats: PlayerStats[];
}

export function LeaderboardTable({ stats }: LeaderboardTableProps) {
  const sortedStats = [...stats].sort((a, b) => {
    // Sort by win rate, then by games played
    if (b.win_rate !== a.win_rate) return b.win_rate - a.win_rate;
    return b.games_played - a.games_played;
  });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-catan-wheat" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center text-muted-foreground font-mono">{index + 1}</span>;
    }
  };

  return (
    <Card className="catan-parchment">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-catan-wheat" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedStats.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No games played yet. Start a match to see stats!
            </p>
          </div>
        ) : (
          sortedStats.map((stat, index) => {
            const initials = stat.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            const avatarUrl = stat.avatar_seed 
              ? generateAvatarUrl(stat.avatar_seed, "adventurer")
              : null;

            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="w-6 flex justify-center">
                  {getRankIcon(index)}
                </div>

                <div 
                  className="relative clip-hexagon-rounded"
                  style={{ 
                    width: 44, 
                    height: 44, 
                    backgroundColor: stat.preferred_color,
                    padding: 2,
                  }}
                >
                  <Avatar className="w-full h-full clip-hexagon-rounded">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={stat.name} />}
                    <AvatarFallback 
                      style={{ backgroundColor: stat.preferred_color }}
                      className="text-white font-semibold text-sm"
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{stat.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {stat.games_played} games • Avg: {stat.avg_score.toFixed(1)} VP
                  </p>
                </div>

                <div className="text-right">
                  <p 
                    className="text-lg font-bold font-mono"
                    style={{ color: stat.preferred_color }}
                  >
                    {stat.win_rate.toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.wins}W / {stat.games_played - stat.wins}L
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
