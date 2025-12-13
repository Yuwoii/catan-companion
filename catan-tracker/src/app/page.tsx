"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Users, 
  Gamepad2, 
  History, 
  Trophy, 
  Hexagon, 
  Play,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlayers } from "@/hooks/use-players";
import { supabase } from "@/lib/supabase/client";
import { generateAvatarUrl, EXPANSIONS } from "@/lib/constants";
import type { Match, MatchParticipantWithPlayer } from "@/types";

interface ActiveGame extends Match {
  participants: MatchParticipantWithPlayer[];
}

const features = [
  {
    href: "/players",
    icon: Users,
    title: "Friends",
    description: "Manage your crew",
    color: "#8FB339",
  },
  {
    href: "/history",
    icon: History,
    title: "History",
    description: "Past matches",
    color: "#6B7280",
  },
  {
    href: "/leaderboard",
    icon: Trophy,
    title: "Stats",
    description: "Leaderboard",
    color: "#E8B84A",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const { players } = usePlayers();
  const [activeGames, setActiveGames] = useState<ActiveGame[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [recentWinner, setRecentWinner] = useState<ActiveGame | null>(null);

  // Fetch active games - games where is_active = true AND winner_id is null
  useEffect(() => {
    const fetchActiveGames = async () => {
      if (!supabase) {
        setIsLoadingGames(false);
        return;
      }

      setIsLoadingGames(true);

      try {
        // Fetch active games (is_active = true, no winner yet)
        const { data: matchesData, error: matchesError } = await supabase
          .from("matches")
          .select("*")
          .eq("is_active", true)
          .is("winner_id", null)
          .order("started_at", { ascending: false });

        if (matchesError) {
          console.error("Error fetching active games:", matchesError);
          setActiveGames([]);
          setIsLoadingGames(false);
          return;
        }

        if (!matchesData || matchesData.length === 0) {
          setActiveGames([]);
          setIsLoadingGames(false);
          return;
        }

        // Fetch participants for active games
        const matchIds = matchesData.map((m) => m.id);
        const { data: participantsData } = await supabase
          .from("match_participants")
          .select(`*, player:players(*)`)
          .in("match_id", matchIds)
          .order("turn_order");

        const gamesWithParticipants: ActiveGame[] = matchesData.map((match) => ({
          ...match,
          participants: (participantsData || []).filter((p) => p.match_id === match.id),
        }));

        setActiveGames(gamesWithParticipants);
      } catch (err) {
        console.error("Error:", err);
        setActiveGames([]);
      } finally {
        setIsLoadingGames(false);
      }
    };

    // Fetch recent winner (last completed game)
    const fetchRecentWinner = async () => {
      if (!supabase) return;

      try {
        const { data: matchData } = await supabase
          .from("matches")
          .select("*")
          .eq("is_active", false)
          .not("winner_id", "is", null)
          .order("ended_at", { ascending: false })
          .limit(1)
          .single();

        if (matchData) {
          const { data: participantsData } = await supabase
            .from("match_participants")
            .select(`*, player:players(*)`)
            .eq("match_id", matchData.id)
            .order("turn_order");

          setRecentWinner({
            ...matchData,
            participants: participantsData || [],
          });
        }
      } catch (err) {
        // No recent winner
      }
    };

    fetchActiveGames();
    fetchRecentWinner();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="relative overflow-hidden px-4 pt-12 pb-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-4 left-4">
            <Hexagon className="w-24 h-24 text-primary" />
          </div>
          <div className="absolute top-8 right-8">
            <Hexagon className="w-16 h-16 text-accent" />
          </div>
          <div className="absolute bottom-4 left-1/3">
            <Hexagon className="w-20 h-20 text-primary" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-2xl bg-primary/10">
            <Hexagon className="w-12 h-12 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Catan Companion
          </h1>
          <p className="text-muted-foreground">
            Track scores & settle like a pro
          </p>
        </motion.div>
      </header>

      {/* Quick Actions */}
      <main className="flex-1 px-4 pb-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4"
        >
          {/* Active Games - Show prominently if any exist */}
          {isLoadingGames ? (
            <motion.div variants={item}>
              <Card className="border-2 border-dashed">
                <CardContent className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            </motion.div>
          ) : activeGames.length > 0 ? (
            activeGames.map((game) => {
              const expansionInfo = EXPANSIONS.find(e => e.value === game.expansion);
              const elapsedMinutes = Math.floor(
                (Date.now() - new Date(game.started_at).getTime()) / 60000
              );
              
              return (
                <motion.div key={game.id} variants={item}>
                  <Link href={`/game/${game.id}`}>
                    <Card className="border-2 border-accent bg-card text-card-foreground shadow-md hover:shadow-lg transition-all cursor-pointer relative overflow-hidden">
                      {/* Accent stripe */}
                      <div className="absolute inset-y-0 left-0 w-1.5 bg-accent" />
                      <CardContent className="p-4 pl-5">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-accent gap-1 shadow-sm" style={{ color: '#ffffff' }}>
                            <Play className="w-3 h-3" />
                            Resume Game
                          </Badge>
                          <span className="text-2xl text-foreground">{expansionInfo?.icon}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {game.participants.slice(0, 4).map((p) => (
                                <div
                                  key={p.id}
                                  className="w-8 h-8 rounded-full border-2 border-card overflow-hidden"
                                  style={{ backgroundColor: p.player?.preferred_color }}
                                >
                                  {p.player?.avatar_seed && (
                                    <img 
                                      src={generateAvatarUrl(p.player.avatar_seed, "adventurer")}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                              ))}
                              {game.participants.length > 4 && (
                                <div className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-medium text-foreground">
                                  +{game.participants.length - 4}
                                </div>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {game.participants.length} players
                            </span>
                          </div>
                          <div className="text-right text-sm">
                            <span className="font-mono text-foreground">{game.target_vp} VP</span>
                            <span className="mx-1 text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{elapsedMinutes}m ago</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })
          ) : null}

          {/* Primary CTA - Start New Game */}
          <motion.div variants={item}>
            <Link href="/game/new">
              <Card className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-center gap-4 p-6">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/20">
                    <Gamepad2 className="w-7 h-7" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-semibold">Start New Game</h2>
                    <p className="text-primary-foreground/80 text-sm">
                      {players.length > 0 
                        ? `${players.length} players ready`
                        : "Set up a match with friends"
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* No active games message */}
          {!isLoadingGames && activeGames.length === 0 && (
            <motion.div variants={item}>
              <Card className="border-dashed border-2 bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                  <Hexagon className="w-8 h-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No active games
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Feature Grid */}
          <div className="grid grid-cols-3 gap-3">
            {features.map((feature) => (
              <motion.div key={feature.href} variants={item}>
                <Link href={feature.href}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="flex flex-col items-center text-center gap-2 p-4">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-xl"
                        style={{ backgroundColor: `${feature.color}20` }}
                      >
                        <feature.icon
                          className="w-5 h-5"
                          style={{ color: feature.color }}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Recent Winner */}
          {recentWinner && recentWinner.winner_id && (
            <motion.div variants={item}>
              <Card className="bg-gradient-to-r from-catan-wheat/20 to-catan-wheat/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-catan-wheat" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Last Winner</p>
                      {(() => {
                        const winner = recentWinner.participants.find(
                          p => p.player_id === recentWinner.winner_id
                        );
                        if (!winner?.player) return null;
                        return (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: winner.player.preferred_color }}
                            />
                            <span className="font-semibold">{winner.player.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {winner.score + (winner.has_longest_road ? 2 : 0) + (winner.has_largest_army ? 2 : 0)} VP
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/history">View All</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
