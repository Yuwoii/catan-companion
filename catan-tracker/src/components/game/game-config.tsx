"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EXPANSIONS, generateAvatarUrl } from "@/lib/constants";
import { Check, Users } from "lucide-react";
import type { ExpansionType, Player } from "@/types";

interface GameConfigProps {
  expansion: ExpansionType;
  targetVP: number;
  onExpansionChange: (expansion: ExpansionType) => void;
  onTargetVPChange: (vp: number) => void;
  selectedPlayers: Player[];
}

export function GameConfig({ 
  expansion,
  targetVP,
  onExpansionChange,
  onTargetVPChange,
  selectedPlayers,
}: GameConfigProps) {
  return (
    <div className="space-y-4">
      {/* Players Summary */}
      <Card className="catan-parchment">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-primary" />
            Players ({selectedPlayers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-3">
            {selectedPlayers.map((player, index) => {
              const initials = player.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
              const avatarUrl = player.avatar_seed 
                ? generateAvatarUrl(player.avatar_seed, "adventurer") 
                : null;
              
              return (
                <div 
                  key={player.id}
                  className="flex items-center gap-2"
                >
                  <div className="relative">
                    <div 
                      className="clip-hexagon-rounded"
                      style={{ 
                        width: 40, 
                        height: 40, 
                        backgroundColor: player.preferred_color,
                        padding: 2,
                      }}
                    >
                      <Avatar className="w-full h-full clip-hexagon-rounded">
                        {avatarUrl && <AvatarImage src={avatarUrl} alt={player.name} />}
                        <AvatarFallback 
                          style={{ backgroundColor: player.preferred_color }}
                          className="text-white font-semibold text-xs"
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <span 
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border-2 border-border flex items-center justify-center text-xs font-mono"
                    >
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{player.name}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Expansion Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Game Mode</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2">
            {EXPANSIONS.map((exp) => (
              <Button
                key={exp.value}
                variant={expansion === exp.value ? "default" : "outline"}
                className={`h-auto py-3 flex flex-col gap-1 relative ${
                  expansion === exp.value ? "" : "hover:bg-muted"
                }`}
                onClick={() => onExpansionChange(exp.value)}
              >
                {expansion === exp.value && (
                  <Check className="absolute top-2 right-2 w-4 h-4" />
                )}
                <span className="text-2xl">{exp.icon}</span>
                <span className="text-sm font-medium">{exp.label}</span>
                <span className="text-xs opacity-70">{exp.defaultVP} VP</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Victory Points Goal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Victory Points to Win</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min={5}
              max={20}
              value={targetVP}
              onChange={(e) => onTargetVPChange(Math.min(20, Math.max(5, Number(e.target.value))))}
              className="text-center text-2xl font-bold font-mono h-14 w-24"
            />
            <div className="flex-1">
              <Label className="text-muted-foreground">
                First player to reach {targetVP} VP wins!
              </Label>
            </div>
          </div>
          
          <div className="flex gap-2">
            {[10, 12, 13, 14].map((vp) => (
              <Button
                key={vp}
                variant={targetVP === vp ? "secondary" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => onTargetVPChange(vp)}
              >
                {vp}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">Ready to start</p>
            <p className="text-lg font-semibold">
              {EXPANSIONS.find(e => e.value === expansion)?.label} • {targetVP} VP Goal
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedPlayers.map(p => p.name).join(", ")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
