"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Gamepad2, History, Trophy, Hexagon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  {
    href: "/players",
    icon: Users,
    title: "Friends",
    description: "Manage your Catan crew",
    color: "var(--color-sheep)",
  },
  {
    href: "/game/new",
    icon: Gamepad2,
    title: "New Game",
    description: "Start a new match",
    color: "var(--color-brick)",
  },
  {
    href: "/history",
    icon: History,
    title: "History",
    description: "View past matches",
    color: "var(--color-ore)",
  },
  {
    href: "/leaderboard",
    icon: Trophy,
    title: "Leaderboard",
    description: "See who rules Catan",
    color: "var(--color-wheat)",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="relative overflow-hidden px-4 pt-12 pb-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4">
            <Hexagon className="w-24 h-24 text-primary" />
          </div>
          <div className="absolute top-8 right-8">
            <Hexagon className="w-16 h-16 text-accent" />
          </div>
          <div className="absolute bottom-4 left-1/3">
            <Hexagon className="w-20 h-20 text-primary" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-2xl bg-primary/10">
            <Hexagon className="w-12 h-12 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Catan Companion
          </h1>
          <p className="text-muted-foreground">
            Track scores & settle like a pro
          </p>
        </motion.div>
      </header>

      {/* Quick Actions */}
      <main className="flex-1 px-4 pb-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4"
        >
          {/* Primary CTA */}
          <motion.div variants={item}>
            <Link href="/game/new">
              <Card className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/20">
                    <Gamepad2 className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">Start New Game</h2>
                    <p className="text-primary-foreground/80 text-sm">
                      Set up a match with your friends
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature) => (
              <motion.div key={feature.href} variants={item}>
                <Link href={feature.href}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="flex flex-col items-center text-center gap-3 p-4">
                      <div
                        className="flex items-center justify-center w-12 h-12 rounded-xl"
                        style={{ backgroundColor: `${feature.color}20` }}
                      >
                        <feature.icon
                          className="w-6 h-6"
                          style={{ color: feature.color }}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Active Game Banner (placeholder) */}
          <motion.div variants={item}>
            <Card className="border-dashed border-2 bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Hexagon className="w-10 h-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No active games
                </p>
                <Button variant="link" asChild className="mt-1">
                  <Link href="/game/new">Start one now</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
