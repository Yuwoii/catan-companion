"use client";

import { motion } from "framer-motion";
import { History, Loader2, Calendar, Gamepad2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { MatchHistoryItem } from "@/components/stats/match-history-item";
import { Button } from "@/components/ui/button";
import { useStats } from "@/hooks/use-stats";
import Link from "next/link";

export default function HistoryPage() {
  const { history, isLoading, error, refresh } = useStats();

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Match History" 
        subtitle="Your Catan journey"
        action={
          <Button variant="ghost" size="sm" onClick={refresh}>
            Refresh
          </Button>
        }
      />

      <main className="flex-1 px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading history...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={refresh}>Try Again</Button>
          </div>
        ) : history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <History className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No games played yet</h2>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Start your first game to begin building your history
            </p>
            <Button asChild>
              <Link href="/game/new">
                <Gamepad2 className="w-5 h-5 mr-2" />
                Start a Game
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{history.length} completed game{history.length !== 1 ? "s" : ""}</span>
            </div>

            <motion.div
              className="space-y-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
            >
              {history.map((match, index) => (
                <motion.div
                  key={match.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <MatchHistoryItem match={match} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
