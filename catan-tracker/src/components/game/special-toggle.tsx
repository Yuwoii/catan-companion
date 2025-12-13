"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SpecialToggleProps {
  label: string;
  icon: string;
  active: boolean;
  onToggle: () => void;
}

export function SpecialToggle({ label, icon, active, onToggle }: SpecialToggleProps) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      className={cn(
        "flex-1 h-12 gap-2 transition-all",
        active && "bg-accent text-accent-foreground hover:bg-accent/90"
      )}
      onClick={onToggle}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
      {active && <span className="text-xs opacity-75">+2</span>}
    </Button>
  );
}

