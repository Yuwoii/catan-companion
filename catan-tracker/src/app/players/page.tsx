"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PlayerCard } from "@/components/players/player-card";
import { PlayerForm } from "@/components/players/player-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePlayers } from "@/hooks/use-players";
import type { Player } from "@/types";

export default function PlayersPage() {
  const { 
    players, 
    isLoading, 
    error, 
    createPlayer, 
    deletePlayer,
    fetchPlayers,
    clearError,
  } = usePlayers();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);

  const handleAddPlayer = async (name: string, color: string) => {
    setIsSubmitting(true);
    const result = await createPlayer({ 
      name, 
      preferred_color: color,
      avatar_seed: name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
    });
    setIsSubmitting(false);
    
    if (result) {
      setIsAddDialogOpen(false);
    }
  };

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;
    
    await deletePlayer(playerToDelete.id);
    setPlayerToDelete(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Friends" 
        subtitle="Your Catan crew awaits" 
      />

      <main className="flex-1 px-4 py-6">
        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Error</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearError}
              className="text-destructive hover:text-destructive"
            >
              Dismiss
            </Button>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading players...</p>
          </div>
        ) : players.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No players yet</h2>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Add your friends to start tracking Catan games together
            </p>
            <Button 
              size="lg" 
              onClick={() => setIsAddDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              Add First Player
            </Button>
          </motion.div>
        ) : (
          /* Player List */
          <div className="space-y-4">
            {/* Header with count and refresh */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {players.length} player{players.length !== 1 ? "s" : ""} ready to settle
              </p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => fetchPlayers()}
                className="gap-1 text-muted-foreground"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>

            {/* Player Cards Grid */}
            <motion.div 
              className="grid gap-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
            >
              <AnimatePresence mode="popLayout">
                {players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PlayerCard
                      player={player}
                      showDelete
                      onDelete={() => setPlayerToDelete(player)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      {!isLoading && players.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-24 right-4 z-40"
        >
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>
      )}

      {/* Add Player Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Add New Player
            </DialogTitle>
            <DialogDescription>
              Add a friend to your Catan group. Choose their name and favorite color.
            </DialogDescription>
          </DialogHeader>
          
          <PlayerForm
            onSubmit={handleAddPlayer}
            onCancel={() => setIsAddDialogOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!playerToDelete} 
        onOpenChange={(open) => !open && setPlayerToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Player?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{playerToDelete?.name}</strong> from your group? 
              Their game history will be preserved, but they won&apos;t appear in new games.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlayer}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
