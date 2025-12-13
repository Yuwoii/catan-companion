"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, PartyPopper } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Player } from "@/types";

interface WinnerModalProps {
  winner: Player | null;
  score: number;
  open: boolean;
  onClose: () => void;
  onEndGame: () => void;
}

export function WinnerModal({ 
  winner, 
  score, 
  open, 
  onClose, 
  onEndGame 
}: WinnerModalProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  useEffect(() => {
    if (open) {
      // Generate confetti particles
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
      }));
      setConfetti(particles);
    }
  }, [open]);

  if (!winner) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="text-center overflow-hidden">
        {/* Confetti Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AnimatePresence>
            {confetti.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  left: `${particle.x}%`,
                  backgroundColor: ["#E8B84A", "#C75B39", "#8FB339", "#6B7280"][
                    particle.id % 4
                  ],
                }}
                initial={{ top: "-10%", opacity: 1, rotate: 0 }}
                animate={{ 
                  top: "110%", 
                  opacity: 0, 
                  rotate: 360,
                  x: [0, 20, -20, 0],
                }}
                transition={{ 
                  duration: 2.5, 
                  delay: particle.delay,
                  ease: "linear",
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        <DialogHeader>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="mx-auto mb-4"
          >
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ backgroundColor: winner.preferred_color }}
            >
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <DialogTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <PartyPopper className="w-8 h-8 text-accent" />
            {winner.name} Wins!
            <PartyPopper className="w-8 h-8 text-accent" />
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="py-6 space-y-4"
        >
          <p className="text-5xl font-bold" style={{ color: winner.preferred_color }}>
            {score} VP
          </p>
          <p className="text-muted-foreground">
            Congratulations on your victory!
          </p>
        </motion.div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Keep Playing
          </Button>
          <Button className="flex-1" onClick={onEndGame}>
            End Game
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

