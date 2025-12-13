"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Live Game" subtitle="Track your scores" />
      <main className="flex-1 p-4">
        {/* Live scoreboard will be implemented in Phase 3 */}
        <p className="text-muted-foreground">Game ID: {gameId}</p>
        <p className="text-muted-foreground">Live scoreboard coming soon...</p>
      </main>
    </div>
  );
}

