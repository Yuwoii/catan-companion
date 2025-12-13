"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ALL_PLAYER_COLORS } from "@/lib/constants";
import { Check } from "lucide-react";

interface PlayerFormProps {
  onSubmit: (name: string, color: string) => void;
  onCancel?: () => void;
  initialName?: string;
  initialColor?: string;
  isLoading?: boolean;
}

export function PlayerForm({ 
  onSubmit, 
  onCancel,
  initialName = "", 
  initialColor = ALL_PLAYER_COLORS[0].hex,
  isLoading = false,
}: PlayerFormProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter a name");
      return;
    }
    
    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    setError(null);
    onSubmit(trimmedName, color);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Input */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-base font-medium">
          Player Name
        </Label>
        <Input
          id="name"
          placeholder="Enter name..."
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          maxLength={50}
          className="text-lg h-12"
          autoFocus
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      {/* Color Selection */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Choose Color</Label>
        
        {/* Classic Catan Colors */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Classic Colors</p>
          <div className="flex flex-wrap gap-2">
            {ALL_PLAYER_COLORS.slice(0, 6).map((c) => (
              <button
                key={c.hex}
                type="button"
                className={`relative w-12 h-12 rounded-lg border-2 transition-all hover:scale-110 ${
                  color === c.hex 
                    ? "ring-2 ring-offset-2 ring-primary scale-110 border-primary" 
                    : "border-border"
                }`}
                style={{ backgroundColor: c.hex }}
                onClick={() => setColor(c.hex)}
                title={c.name}
              >
                {color === c.hex && (
                  <Check 
                    className="absolute inset-0 m-auto w-5 h-5" 
                    style={{ color: c.textColor }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Colors */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Resource Colors</p>
          <div className="flex flex-wrap gap-2">
            {ALL_PLAYER_COLORS.slice(6).map((c) => (
              <button
                key={c.hex}
                type="button"
                className={`relative w-12 h-12 rounded-lg border-2 transition-all hover:scale-110 ${
                  color === c.hex 
                    ? "ring-2 ring-offset-2 ring-primary scale-110 border-primary" 
                    : "border-border"
                }`}
                style={{ backgroundColor: c.hex }}
                onClick={() => setColor(c.hex)}
                title={c.name}
              >
                {color === c.hex && (
                  <Check 
                    className="absolute inset-0 m-auto w-5 h-5" 
                    style={{ color: c.textColor }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1 h-12"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          className="flex-1 h-12"
          disabled={isLoading || !name.trim()}
        >
          {isLoading ? "Adding..." : "Add Player"}
        </Button>
      </div>
    </form>
  );
}
