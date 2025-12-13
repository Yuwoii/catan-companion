"use client";

import { PageHeader } from "@/components/layout/page-header";

export default function NewGamePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="New Game" subtitle="Set up your Catan match" />
      <main className="flex-1 p-4">
        {/* Game setup form will be implemented in Phase 2 */}
        <p className="text-muted-foreground">Game setup coming soon...</p>
      </main>
    </div>
  );
}

