"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Settings, 
  Play, 
  Loader2, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Shuffle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PlayerPicker } from "@/components/players/player-picker";
import { GameConfig } from "@/components/game/game-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePlayers } from "@/hooks/use-players";
import { useGame } from "@/hooks/use-game";
import { EXPANSIONS, MIN_PLAYERS, MAX_PLAYERS } from "@/lib/constants";
import type { ExpansionType } from "@/types";

type Step = "players" | "config";

export default function NewGamePage() {
  const router = useRouter();
  const { players, isLoading: playersLoading } = usePlayers();
  const { createGame } = useGame();

  const [step, setStep] = useState<Step>("players");
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [expansion, setExpansion] = useState<ExpansionType>("base");
  const [targetVP, setTargetVP] = useState(10);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canProceedToConfig = selectedPlayerIds.length >= MIN_PLAYERS;
  const canStartGame = selectedPlayerIds.length >= MIN_PLAYERS && selectedPlayerIds.length <= MAX_PLAYERS;

  const handleTogglePlayer = (playerId: string) => {
    setSelectedPlayerIds((prev) => {
      if (prev.includes(playerId)) {
        return prev.filter((id) => id !== playerId);
      }
      if (prev.length >= MAX_PLAYERS) {
        return prev;
      }
      return [...prev, playerId];
    });
  };

  const handleShufflePlayers = () => {
    setSelectedPlayerIds((prev) => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  };

  const handleExpansionChange = (exp: ExpansionType) => {
    setExpansion(exp);
    // Update default VP based on expansion
    const expConfig = EXPANSIONS.find((e) => e.value === exp);
    if (expConfig) {
      setTargetVP(expConfig.defaultVP);
    }
  };

  const handleStartGame = async () => {
    if (!canStartGame) return;

    setIsCreating(true);
    setError(null);

    try {
      const gameId = await createGame({
        expansion,
        target_vp: targetVP,
        player_ids: selectedPlayerIds,
      });

      if (gameId) {
        router.push(`/game/${gameId}`);
      } else {
        setError("Failed to create game. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const selectedPlayers = players.filter((p) => selectedPlayerIds.includes(p.id));

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="New Game" 
        subtitle={step === "players" ? "Select your settlers" : "Configure the match"}
        showBack
      />

      <main className="flex-1 px-4 py-6">
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive flex-1">{error}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setError(null)}
              className="text-destructive"
            >
              Dismiss
            </Button>
          </motion.div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            step === "players" 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          }`}>
            <Users className="w-4 h-4" />
            Players
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            step === "config" 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          }`}>
            <Settings className="w-4 h-4" />
            Settings
          </div>
        </div>

        {/* Loading State */}
        {playersLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading players...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {step === "players" ? (
              /* Step 1: Player Selection */
              <motion.div
                key="players"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {players.length === 0 ? (
                  <Card className="catan-parchment">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <Users className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Players Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Add some friends before starting a game
                      </p>
                      <Button onClick={() => router.push("/players")}>
                        Add Players
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <PlayerPicker
                      players={players}
                      selectedIds={selectedPlayerIds}
                      onToggle={handleTogglePlayer}
                      minPlayers={MIN_PLAYERS}
                      maxPlayers={MAX_PLAYERS}
                    />

                    {/* Selected Players Preview */}
                    {selectedPlayerIds.length > 0 && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium">Turn Order</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleShufflePlayers}
                              className="gap-1"
                            >
                              <Shuffle className="w-4 h-4" />
                              Shuffle
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedPlayers.map((player, index) => (
                              <div
                                key={player.id}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                                style={{ 
                                  backgroundColor: `${player.preferred_color}20`,
                                  borderLeft: `3px solid ${player.preferred_color}`,
                                }}
                              >
                                <span className="font-mono text-xs text-muted-foreground">
                                  {index + 1}
                                </span>
                                <span className="font-medium">{player.name}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </motion.div>
            ) : (
              /* Step 2: Game Configuration */
              <motion.div
                key="config"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <GameConfig
                  expansion={expansion}
                  targetVP={targetVP}
                  onExpansionChange={handleExpansionChange}
                  onTargetVPChange={setTargetVP}
                  selectedPlayers={selectedPlayers}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Bottom Actions */}
      {!playersLoading && players.length > 0 && (
        <div className="sticky bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <div className="flex gap-3 max-w-lg mx-auto">
            {step === "config" && (
              <Button
                variant="outline"
                size="lg"
                className="flex-1 h-14"
                onClick={() => setStep("players")}
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back
              </Button>
            )}
            
            {step === "players" ? (
              <Button
                size="lg"
                className="flex-1 h-14"
                disabled={!canProceedToConfig}
                onClick={() => setStep("config")}
              >
                Continue
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            ) : (
              <Button
                size="lg"
                className="flex-1 h-14 gap-2"
                disabled={!canStartGame || isCreating}
                onClick={handleStartGame}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start Game
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
