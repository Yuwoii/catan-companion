"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EXPANSIONS, DEFAULT_VP } from "@/lib/constants";
import type { ExpansionType } from "@/types";

interface GameConfigProps {
  onConfigure: (expansion: ExpansionType, targetVP: number) => void;
}

export function GameConfig({ onConfigure }: GameConfigProps) {
  const [expansion, setExpansion] = useState<ExpansionType>("base");
  const [targetVP, setTargetVP] = useState(DEFAULT_VP);

  const handleSubmit = () => {
    onConfigure(expansion, targetVP);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Expansion Selection */}
        <div className="space-y-2">
          <Label>Game Mode</Label>
          <div className="grid grid-cols-2 gap-2">
            {EXPANSIONS.map((exp) => (
              <Button
                key={exp.value}
                variant={expansion === exp.value ? "default" : "outline"}
                className="h-auto py-3 flex flex-col gap-1"
                onClick={() => setExpansion(exp.value)}
              >
                <span className="text-lg">{exp.icon}</span>
                <span className="text-sm">{exp.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Victory Points Goal */}
        <div className="space-y-2">
          <Label htmlFor="targetVP">Victory Points to Win</Label>
          <div className="flex items-center gap-4">
            <Input
              id="targetVP"
              type="number"
              min={5}
              max={20}
              value={targetVP}
              onChange={(e) => setTargetVP(Number(e.target.value))}
              className="text-center text-xl font-semibold"
            />
            <div className="flex gap-1">
              {[10, 12, 14].map((vp) => (
                <Button
                  key={vp}
                  variant="outline"
                  size="sm"
                  onClick={() => setTargetVP(vp)}
                >
                  {vp}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Button className="w-full" size="lg" onClick={handleSubmit}>
          Start Game
        </Button>
      </CardContent>
    </Card>
  );
}

