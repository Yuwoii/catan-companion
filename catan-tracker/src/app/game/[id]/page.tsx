"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  AlertCircle, 
  Clock,
  Target,
  ArrowLeft,
  X,
  Wifi,
  WifiOff,
} from "lucide-react";
import { CompactScoreCard } from "@/components/game/compact-score-card";
import { WinnerModal } from "@/components/game/winner-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGame } from "@/hooks/use-game";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { EXPANSIONS } from "@/lib/constants";
import type { Player } from "@/types";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const {
    match,
    participants,
    isLoading,
    error,
    updateScore,
    toggleSpecialCard,
    endGame,
  } = useGame(gameId);

  const [winner, setWinner] = useState<{ player: Player; score: number } | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Keep screen awake during active game
  const wakeLock = useWakeLock(match?.is_active ?? false);

  // Calculate total scores for each participant
  const participantScores = useMemo(() => {
    return participants
      .map((p) => ({
        ...p,
        totalScore: p.score + (p.has_longest_road ? 2 : 0) + (p.has_largest_army ? 2 : 0),
      }))
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [participants]);

  // Check for winner
  useEffect(() => {
    if (!match || !match.is_active) return;

    const potentialWinner = participantScores.find(
      (p) => p.totalScore >= match.target_vp
    );

    if (potentialWinner && potentialWinner.player) {
      setWinner({
        player: potentialWinner.player,
        score: potentialWinner.totalScore,
      });
      setShowWinnerModal(true);
    }
  }, [participantScores, match]);

  // Persistent timer using started_at from database
  useEffect(() => {
    if (!match?.started_at || !match.is_active) return;

    const startTime = new Date(match.started_at).getTime();
    
    const updateElapsed = () => {
      const now = Date.now();
      setElapsed(Math.floor((now - startTime) / 1000));
    };

    // Update immediately
    updateElapsed();

    // Then update every second
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [match?.started_at, match?.is_active]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleScoreChange = (participantId: string, currentScore: number, delta: number) => {
    const newScore = Math.max(0, currentScore + delta);
    updateScore(participantId, newScore);
  };

  const handleToggleLongestRoad = (participantId: string) => {
    toggleSpecialCard(participantId, "has_longest_road");
  };

  const handleToggleLargestArmy = (participantId: string) => {
    toggleSpecialCard(participantId, "has_largest_army");
  };

  const handleEndGame = async () => {
    if (winner) {
      await endGame(winner.player.id);
      router.push("/history");
    }
  };

  const handleKeepPlaying = () => {
    setShowWinnerModal(false);
  };

  const handleQuit = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background p-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Game Not Found</h2>
        <p className="text-muted-foreground text-center mb-4">
          {error || "This game doesn't exist or has been deleted."}
        </p>
        <Button onClick={() => router.push("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      </div>
    );
  }

  const expansionInfo = EXPANSIONS.find((e) => e.value === match.expansion);
  const playerCount = participantScores.length;
  
  // Determine grid layout based on player count
  const getGridClass = () => {
    switch (playerCount) {
      case 3:
        return "grid-cols-1 sm:grid-cols-3";
      case 4:
        return "grid-cols-2";
      case 5:
        return "grid-cols-2 sm:grid-cols-3";
      case 6:
        return "grid-cols-2 sm:grid-cols-3";
      default:
        return "grid-cols-2";
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Compact Header */}
      <header className="shrink-0 border-b bg-card/95 backdrop-blur px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleQuit}
            >
              <X className="h-4 w-4" />
            </Button>
            <span className="text-lg">{expansionInfo?.icon}</span>
            <span className="font-medium text-sm hidden sm:inline">
              {expansionInfo?.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Subtle sync indicator */}
            <div className="w-4 h-4 flex items-center justify-center">
              {error ? (
                <WifiOff className="w-3 h-3 text-destructive" />
              ) : (
                <Wifi className="w-3 h-3 text-muted-foreground/50" />
              )}
            </div>
            <Badge variant="outline" className="gap-1 font-mono">
              <Clock className="w-3 h-3" />
              {formatTime(elapsed)}
            </Badge>
            <Badge className="gap-1 bg-primary font-mono">
              <Target className="w-3 h-3" />
              {match.target_vp} VP
            </Badge>
          </div>
        </div>
      </header>

      {/* Game Grid - Fills remaining space, no scroll */}
      <main className="flex-1 p-2 sm:p-3 overflow-hidden">
        <div className={`grid ${getGridClass()} gap-2 sm:gap-3 h-full auto-rows-fr`}>
          <AnimatePresence mode="popLayout">
            {participantScores.map((participant, index) => {
              if (!participant.player) return null;

              return (
                <CompactScoreCard
                  key={participant.id}
                  player={participant.player}
                  participant={participant}
                  targetVP={match.target_vp}
                  rank={index + 1}
                  onScoreChange={(delta) => 
                    handleScoreChange(participant.id, participant.score, delta)
                  }
                  onToggleLongestRoad={() => handleToggleLongestRoad(participant.id)}
                  onToggleLargestArmy={() => handleToggleLargestArmy(participant.id)}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      {/* Winner Modal */}
      <WinnerModal
        winner={winner?.player || null}
        score={winner?.score || 0}
        open={showWinnerModal}
        onClose={handleKeepPlaying}
        onEndGame={handleEndGame}
      />
    </div>
  );
}
