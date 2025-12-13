"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScoreControlsProps {
  score: number;
  onChange: (delta: number) => void;
  min?: number;
  max?: number;
}

export function ScoreControls({ 
  score, 
  onChange, 
  min = 0, 
  max = 20 
}: ScoreControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="outline"
        size="lg"
        className="h-14 w-14 rounded-full"
        onClick={() => onChange(-1)}
        disabled={score <= min}
      >
        <Minus className="h-6 w-6" />
      </Button>

      <div className="text-center min-w-[60px]">
        <span className="text-2xl font-semibold">{score}</span>
        <p className="text-xs text-muted-foreground">Base VP</p>
      </div>

      <Button
        variant="outline"
        size="lg"
        className="h-14 w-14 rounded-full"
        onClick={() => onChange(1)}
        disabled={score >= max}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}

