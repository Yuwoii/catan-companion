"use client";

import { Calendar, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateAvatarUrl } from "@/lib/constants";
import type { MatchWithDetails } from "@/types";

interface MatchHistoryItemProps {
  match: MatchWithDetails;
}

export function MatchHistoryItem({ match }: MatchHistoryItemProps) {
  const formattedDate = match.ended_at 
    ? new Date(match.ended_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "In Progress";

  const winner = match.participants.find(
    (p) => p.player_id === match.winner_id
  );

  const expansionLabels: Record<string, string> = {
    base: "Base Game",
    seafarers: "Seafarers",
    cities_knights: "Cities & Knights",
    seafarers_cities_knights: "Seafarers + C&K",
  };

  return (
    <Card className="catan-parchment">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {formattedDate}
          </div>
          <Badge variant="outline">
            {expansionLabels[match.expansion] || match.expansion}
          </Badge>
        </div>

        {/* Winner */}
        {winner && winner.player && (
          <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-accent/10">
            <Trophy className="w-5 h-5 text-catan-wheat" />
            
            <div 
              className="relative clip-hexagon-rounded"
              style={{ 
                width: 36, 
                height: 36, 
                backgroundColor: winner.player.preferred_color,
                padding: 2,
              }}
            >
              <Avatar className="w-full h-full clip-hexagon-rounded">
                {winner.player.avatar_seed && (
                  <AvatarImage 
                    src={generateAvatarUrl(winner.player.avatar_seed, "adventurer")} 
                    alt={winner.player.name} 
                  />
                )}
                <AvatarFallback 
                  style={{ backgroundColor: winner.player.preferred_color }}
                  className="text-white font-semibold text-xs"
                >
                  {winner.player.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <span className="font-medium">{winner.player.name}</span>
            <span className="ml-auto font-bold font-mono">
              {winner.score + (winner.has_longest_road ? 2 : 0) + (winner.has_largest_army ? 2 : 0)} VP
            </span>
          </div>
        )}

        {/* All Participants */}
        <div className="flex flex-wrap gap-3">
          {match.participants
            .filter((p) => p.player_id !== match.winner_id)
            .map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                {participant.player && (
                  <>
                    <div 
                      className="w-6 h-6 rounded-full border border-border overflow-hidden"
                      style={{ backgroundColor: participant.player.preferred_color }}
                    >
                      {participant.player.avatar_seed && (
                        <img 
                          src={generateAvatarUrl(participant.player.avatar_seed, "adventurer")}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span>{participant.player.name}</span>
                    <span className="font-medium font-mono">
                      {participant.score + (participant.has_longest_road ? 2 : 0) + (participant.has_largest_army ? 2 : 0)}
                    </span>
                  </>
                )}
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
