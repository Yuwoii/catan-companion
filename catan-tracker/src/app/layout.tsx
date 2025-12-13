import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Crimson_Text } from "next/font/google";
import { NavBar } from "@/components/layout/nav-bar";
import "./globals.css";

// Sans-serif for body text
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Monospace for code/numbers
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Serif display font for headers (Catan theme)
const crimsonText = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Catan Companion",
  description: "Track scores, stats, and leaderboards for your Catan games",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Catan Companion",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FDF6E3" },
    { media: "(prefers-color-scheme: dark)", color: "#1C1410" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${crimsonText.variable} font-sans antialiased min-h-screen bg-hex-pattern`}
      >
        <div className="pb-20">
          {children}
        </div>
        <NavBar />
      </body>
    </html>
  );
}
