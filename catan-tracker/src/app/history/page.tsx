"use client";

import { PageHeader } from "@/components/layout/page-header";

export default function HistoryPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Match History" subtitle="Review past games" />
      <main className="flex-1 p-4">
        {/* Match history list will be implemented in Phase 4 */}
        <p className="text-muted-foreground">Match history coming soon...</p>
      </main>
    </div>
  );
}

