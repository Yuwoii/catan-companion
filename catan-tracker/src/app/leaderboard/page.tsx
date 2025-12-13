"use client";

import { PageHeader } from "@/components/layout/page-header";

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Leaderboard" subtitle="Who rules Catan?" />
      <main className="flex-1 p-4">
        {/* Leaderboard table will be implemented in Phase 4 */}
        <p className="text-muted-foreground">Leaderboard coming soon...</p>
      </main>
    </div>
  );
}

