"use client";

import { motion } from "framer-motion";
import { Trophy, Loader2, Gamepad2, TrendingUp, Award, Route, Swords } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { LeaderboardTable } from "@/components/stats/leaderboard-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStats } from "@/hooks/use-stats";
import Link from "next/link";

export default function LeaderboardPage() {
  const { leaderboard, history, isLoading, error, refresh } = useStats();

  // Calculate some fun stats
  const totalGames = history.length;
  const totalVPScored = history.reduce((sum, match) => {
    return sum + match.participants.reduce((pSum, p) => {
      return pSum + p.score + (p.has_longest_road ? 2 : 0) + (p.has_largest_army ? 2 : 0);
    }, 0);
  }, 0);

  const mostWins = leaderboard.length > 0 
    ? leaderboard.reduce((max, p) => p.wins > max.wins ? p : max, leaderboard[0])
    : null;

  const mostRoads = leaderboard.length > 0
    ? leaderboard.reduce((max, p) => p.longest_road_count > max.longest_road_count ? p : max, leaderboard[0])
    : null;

  const mostArmies = leaderboard.length > 0
    ? leaderboard.reduce((max, p) => p.largest_army_count > max.largest_army_count ? p : max, leaderboard[0])
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Leaderboard" 
        subtitle="Who rules Catan?"
        action={
          <Button variant="ghost" size="sm" onClick={refresh}>
            Refresh
          </Button>
        }
      />

      <main className="flex-1 px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading stats...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={refresh}>Try Again</Button>
          </div>
        ) : leaderboard.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No stats yet</h2>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Complete a game to see who&apos;s leading the pack
            </p>
            <Button asChild>
              <Link href="/game/new">
                <Gamepad2 className="w-5 h-5 mr-2" />
                Start a Game
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gradient-to-br from-catan-wheat/20 to-catan-wheat/5">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-catan-wheat" />
                  <p className="text-2xl font-bold font-mono">{totalGames}</p>
                  <p className="text-xs text-muted-foreground">Games Played</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-catan-brick/20 to-catan-brick/5">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-6 h-6 mx-auto mb-2 text-catan-brick" />
                  <p className="text-2xl font-bold font-mono">{totalVPScored}</p>
                  <p className="text-xs text-muted-foreground">Total VP Scored</p>
                </CardContent>
              </Card>
            </div>

            {/* Records */}
            {(mostWins || mostRoads || mostArmies) && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="w-5 h-5 text-catan-wheat" />
                    Records
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {mostWins && mostWins.wins > 0 && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-catan-wheat" />
                        <span className="text-sm">Most Wins</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{mostWins.name}</span>
                        <span className="text-sm text-muted-foreground">({mostWins.wins})</span>
                      </div>
                    </div>
                  )}
                  {mostRoads && mostRoads.longest_road_count > 0 && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Route className="w-4 h-4 text-catan-wood" />
                        <span className="text-sm">Most Longest Roads</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{mostRoads.name}</span>
                        <span className="text-sm text-muted-foreground">({mostRoads.longest_road_count})</span>
                      </div>
                    </div>
                  )}
                  {mostArmies && mostArmies.largest_army_count > 0 && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Swords className="w-4 h-4 text-catan-ore" />
                        <span className="text-sm">Most Largest Armies</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{mostArmies.name}</span>
                        <span className="text-sm text-muted-foreground">({mostArmies.largest_army_count})</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Main Leaderboard */}
            <LeaderboardTable stats={leaderboard} />
          </div>
        )}
      </main>
    </div>
  );
}
