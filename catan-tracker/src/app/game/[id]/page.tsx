"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Loader2, 
  AlertCircle, 
  Clock,
  Target,
  ArrowLeft,
  X,
  Wifi,
  WifiOff,
  Minus,
  Plus,
  Route,
  Swords,
  Shield,
  Building2,
  TrendingUp,
  Scale,
  FlaskConical,
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
    updateCityImprovement,
    toggleMetropolis,
    toggleDefender,
    endGame,
  } = useGame(gameId);

  const isCitiesKnights = match?.expansion === "cities_knights" || 
                          match?.expansion === "seafarers_cities_knights";

  const [winner, setWinner] = useState<{ player: Player; score: number } | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  useWakeLock(match?.is_active ?? false);

  const participantScores = useMemo(() => {
    return participants
      .map((p) => ({
        ...p,
        totalScore: p.score + 
          (p.has_longest_road ? 2 : 0) + 
          (isCitiesKnights ? (p.has_defender ? 2 : 0) : (p.has_largest_army ? 2 : 0)) +
          (p.has_trade_metropolis ? 2 : 0) +
          (p.has_politics_metropolis ? 2 : 0) +
          (p.has_science_metropolis ? 2 : 0),
      }))
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [participants, isCitiesKnights]);

  useEffect(() => {
    if (!match || !match.is_active) return;
    const potentialWinner = participantScores.find((p) => p.totalScore >= match.target_vp);
    if (potentialWinner && potentialWinner.player) {
      setWinner({ player: potentialWinner.player, score: potentialWinner.totalScore });
      setShowWinnerModal(true);
    }
  }, [participantScores, match]);

  useEffect(() => {
    if (!match?.started_at || !match.is_active) return;
    const startTime = new Date(match.started_at).getTime();
    const updateElapsed = () => setElapsed(Math.floor((Date.now() - startTime) / 1000));
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [match?.started_at, match?.is_active]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const selectedParticipant = useMemo(() => {
    if (!selectedParticipantId) return null;
    return participantScores.find((p) => p.id === selectedParticipantId) || null;
  }, [selectedParticipantId, participantScores]);

  const handleScoreChange = (delta: number) => {
    if (!selectedParticipant) return;
    updateScore(selectedParticipant.id, Math.max(0, selectedParticipant.score + delta));
  };

  const handleToggleLongestRoad = () => {
    if (selectedParticipantId) toggleSpecialCard(selectedParticipantId, "has_longest_road");
  };

  const handleToggleLargestArmy = () => {
    if (selectedParticipantId) toggleSpecialCard(selectedParticipantId, "has_largest_army");
  };

  const handleCityImprovementChange = (type: "trade_level" | "politics_level" | "science_level", delta: number) => {
    if (!selectedParticipant) return;
    updateCityImprovement(selectedParticipant.id, type, (selectedParticipant[type] ?? 0) + delta);
  };

  const handleToggleMetropolis = (type: "has_trade_metropolis" | "has_politics_metropolis" | "has_science_metropolis") => {
    if (selectedParticipantId) toggleMetropolis(selectedParticipantId, type);
  };

  const handleToggleDefender = () => {
    if (selectedParticipantId) toggleDefender(selectedParticipantId);
  };

  const handleEndGame = async () => {
    if (winner) {
      await endGame(winner.player.id);
      router.push("/history");
    }
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
  
  const getGridClass = () => {
    switch (playerCount) {
      case 3: return "grid-cols-3";
      case 4: return "grid-cols-2";
      case 5: return "grid-cols-3";
      case 6: return "grid-cols-3";
      default: return "grid-cols-2";
    }
  };

  const getRowCount = () => {
    switch (playerCount) {
      case 3: return 1;
      case 4: return 2;
      case 5: return 2;
      case 6: return 2;
      default: return 2;
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b bg-card px-2 py-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push("/")}>
              <X className="h-4 w-4" />
            </Button>
            <span className="text-base">{expansionInfo?.icon}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 flex items-center justify-center">
              {error ? <WifiOff className="w-2.5 h-2.5 text-destructive" /> : <Wifi className="w-2.5 h-2.5 text-muted-foreground/50" />}
            </div>
            <Badge variant="outline" className="gap-0.5 font-mono text-[10px] px-1 py-0">
              <Clock className="w-2.5 h-2.5" />
              {formatTime(elapsed)}
            </Badge>
            <Badge className="gap-0.5 bg-primary font-mono text-[10px] px-1 py-0">
              <Target className="w-2.5 h-2.5" />
              {match.target_vp}
            </Badge>
          </div>
        </div>
      </header>

      {/* Game Grid */}
      <main className="flex-1 p-1 overflow-hidden min-h-0" onClick={() => setSelectedParticipantId(null)}>
        <div 
          className={`grid ${getGridClass()} gap-1 h-full`}
          style={{ gridTemplateRows: `repeat(${getRowCount()}, 1fr)` }}
        >
          {participantScores.map((participant, index) => {
            if (!participant.player) return null;
            return (
              <CompactScoreCard
                key={participant.id}
                player={participant.player}
                participant={participant}
                targetVP={match.target_vp}
                rank={index + 1}
                isSelected={selectedParticipantId === participant.id}
                onClick={() => setSelectedParticipantId(participant.id)}
                isCitiesKnights={isCitiesKnights}
              />
            );
          })}
        </div>
      </main>

      {/* Bottom Control Bar */}
      <div className="shrink-0 bg-card border-t" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {selectedParticipant && selectedParticipant.player ? (
          <div className="p-1 flex items-center gap-1 overflow-x-auto">
            {/* Deselect */}
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setSelectedParticipantId(null)}>
              <X className="h-4 w-4" />
            </Button>
            
            {/* Player indicator */}
            <div className="w-1.5 h-6 rounded-full shrink-0" style={{ backgroundColor: selectedParticipant.player.preferred_color }} />
            <span className="font-semibold text-xs truncate max-w-[60px] shrink-0">{selectedParticipant.player.name}</span>

            <div className="w-px h-6 bg-border shrink-0" />

            {/* VP Controls */}
            <div className="flex items-center gap-0.5 shrink-0">
              <Button variant="outline" className="h-8 w-8" onClick={() => handleScoreChange(-1)} disabled={selectedParticipant.score <= 0}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-sm font-bold font-mono w-6 text-center">{selectedParticipant.score}</span>
              <Button variant="outline" className="h-8 w-8" onClick={() => handleScoreChange(1)}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border shrink-0" />

            {/* Road */}
            <button
              onClick={handleToggleLongestRoad}
              className={`h-8 w-8 rounded flex items-center justify-center shrink-0 ${
                selectedParticipant.has_longest_road ? "bg-catan-wood text-white" : "bg-muted/50 text-muted-foreground"
              }`}
            >
              <Route className="h-4 w-4" />
            </button>

            {/* Army or Defender */}
            {isCitiesKnights ? (
              <button
                onClick={handleToggleDefender}
                className={`h-8 w-8 rounded flex items-center justify-center shrink-0 ${
                  selectedParticipant.has_defender ? "bg-catan-ore text-white" : "bg-muted/50 text-muted-foreground"
                }`}
              >
                <Shield className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleToggleLargestArmy}
                className={`h-8 w-8 rounded flex items-center justify-center shrink-0 ${
                  selectedParticipant.has_largest_army ? "bg-catan-ore text-white" : "bg-muted/50 text-muted-foreground"
                }`}
              >
                <Swords className="h-4 w-4" />
              </button>
            )}

            {/* C&K Controls */}
            {isCitiesKnights && (
              <>
                <div className="w-px h-6 bg-border shrink-0" />
                
                {/* Trade */}
                <div className="flex items-center shrink-0">
                  <button
                    onClick={() => handleCityImprovementChange("trade_level", -1)}
                    disabled={(selectedParticipant.trade_level ?? 0) <= 0}
                    className="h-6 w-6 rounded bg-muted/50 text-muted-foreground disabled:opacity-30 flex items-center justify-center"
                  >
                    <Minus className="h-2.5 w-2.5" />
                  </button>
                  <div className="flex flex-col items-center w-6">
                    <TrendingUp className="h-2.5 w-2.5 text-yellow-500" />
                    <span className="text-[10px] font-bold">{selectedParticipant.trade_level ?? 0}</span>
                  </div>
                  <button
                    onClick={() => handleCityImprovementChange("trade_level", 1)}
                    disabled={(selectedParticipant.trade_level ?? 0) >= 5}
                    className="h-6 w-6 rounded bg-muted/50 text-muted-foreground disabled:opacity-30 flex items-center justify-center"
                  >
                    <Plus className="h-2.5 w-2.5" />
                  </button>
                </div>

                {/* Politics */}
                <div className="flex items-center shrink-0">
                  <button
                    onClick={() => handleCityImprovementChange("politics_level", -1)}
                    disabled={(selectedParticipant.politics_level ?? 0) <= 0}
                    className="h-6 w-6 rounded bg-muted/50 text-muted-foreground disabled:opacity-30 flex items-center justify-center"
                  >
                    <Minus className="h-2.5 w-2.5" />
                  </button>
                  <div className="flex flex-col items-center w-6">
                    <Scale className="h-2.5 w-2.5 text-blue-500" />
                    <span className="text-[10px] font-bold">{selectedParticipant.politics_level ?? 0}</span>
                  </div>
                  <button
                    onClick={() => handleCityImprovementChange("politics_level", 1)}
                    disabled={(selectedParticipant.politics_level ?? 0) >= 5}
                    className="h-6 w-6 rounded bg-muted/50 text-muted-foreground disabled:opacity-30 flex items-center justify-center"
                  >
                    <Plus className="h-2.5 w-2.5" />
                  </button>
                </div>

                {/* Science */}
                <div className="flex items-center shrink-0">
                  <button
                    onClick={() => handleCityImprovementChange("science_level", -1)}
                    disabled={(selectedParticipant.science_level ?? 0) <= 0}
                    className="h-6 w-6 rounded bg-muted/50 text-muted-foreground disabled:opacity-30 flex items-center justify-center"
                  >
                    <Minus className="h-2.5 w-2.5" />
                  </button>
                  <div className="flex flex-col items-center w-6">
                    <FlaskConical className="h-2.5 w-2.5 text-green-500" />
                    <span className="text-[10px] font-bold">{selectedParticipant.science_level ?? 0}</span>
                  </div>
                  <button
                    onClick={() => handleCityImprovementChange("science_level", 1)}
                    disabled={(selectedParticipant.science_level ?? 0) >= 5}
                    className="h-6 w-6 rounded bg-muted/50 text-muted-foreground disabled:opacity-30 flex items-center justify-center"
                  >
                    <Plus className="h-2.5 w-2.5" />
                  </button>
                </div>

                <div className="w-px h-6 bg-border shrink-0" />

                {/* Metropolis */}
                <button
                  onClick={() => handleToggleMetropolis("has_trade_metropolis")}
                  className={`h-7 w-7 rounded flex flex-col items-center justify-center shrink-0 text-[8px] ${
                    selectedParticipant.has_trade_metropolis ? "bg-yellow-500 text-white" : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <Building2 className="h-3 w-3" />
                  <span>T</span>
                </button>
                <button
                  onClick={() => handleToggleMetropolis("has_politics_metropolis")}
                  className={`h-7 w-7 rounded flex flex-col items-center justify-center shrink-0 text-[8px] ${
                    selectedParticipant.has_politics_metropolis ? "bg-blue-500 text-white" : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <Building2 className="h-3 w-3" />
                  <span>P</span>
                </button>
                <button
                  onClick={() => handleToggleMetropolis("has_science_metropolis")}
                  className={`h-7 w-7 rounded flex flex-col items-center justify-center shrink-0 text-[8px] ${
                    selectedParticipant.has_science_metropolis ? "bg-green-500 text-white" : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <Building2 className="h-3 w-3" />
                  <span>S</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="py-1.5 text-center">
            <p className="text-xs text-muted-foreground">Tap a player to edit scores</p>
          </div>
        )}
      </div>

      {/* Winner Modal */}
      <WinnerModal
        winner={winner?.player || null}
        score={winner?.score || 0}
        open={showWinnerModal}
        onClose={() => setShowWinnerModal(false)}
        onEndGame={handleEndGame}
      />
    </div>
  );
}
