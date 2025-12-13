"use client";

import { PageHeader } from "@/components/layout/page-header";

export default function PlayersPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Friends" subtitle="Manage your Catan crew" />
      <main className="flex-1 p-4">
        {/* Player list and form will be implemented in Phase 2 */}
        <p className="text-muted-foreground">Player management coming soon...</p>
      </main>
    </div>
  );
}

