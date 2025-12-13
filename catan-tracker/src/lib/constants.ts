import type { ExpansionType } from "@/types";

// ============================================
// Catan Resource Colors
// ============================================

export const CATAN_COLORS = {
  wheat: "#E8B84A",
  brick: "#C75B39",
  sheep: "#8FB339",
  ore: "#6B7280",
  wood: "#2D5016",
  desert: "#D4A574",
  paper: "#FDF6E3",
} as const;

// ============================================
// Player Color Options
// Classic Catan player colors + resource-inspired options
// ============================================

export const PLAYER_COLORS = [
  { name: "Red", hex: "#E74C3C", textColor: "white" },
  { name: "Blue", hex: "#3498DB", textColor: "white" },
  { name: "Orange", hex: "#F39C12", textColor: "white" },
  { name: "White", hex: "#F5F5F5", textColor: "#333333" },
  { name: "Green", hex: "#27AE60", textColor: "white" },
  { name: "Brown", hex: "#8B4513", textColor: "white" },
] as const;

// Resource-themed colors (alternative options)
export const RESOURCE_PLAYER_COLORS = [
  { name: "Wheat", hex: "#E8B84A", textColor: "white", resource: "wheat" },
  { name: "Brick", hex: "#C75B39", textColor: "white", resource: "brick" },
  { name: "Sheep", hex: "#8FB339", textColor: "white", resource: "sheep" },
  { name: "Ore", hex: "#6B7280", textColor: "white", resource: "ore" },
  { name: "Wood", hex: "#2D5016", textColor: "white", resource: "wood" },
] as const;

// All available colors for player selection
export const ALL_PLAYER_COLORS = [...PLAYER_COLORS, ...RESOURCE_PLAYER_COLORS];

// ============================================
// Game Configuration
// ============================================

export const DEFAULT_VP = 10;
export const MIN_VP = 5;
export const MAX_VP = 20;
export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 6;

// ============================================
// Expansion Configuration
// ============================================

export const EXPANSIONS: {
  value: ExpansionType;
  label: string;
  icon: string;
  defaultVP: number;
}[] = [
  {
    value: "base",
    label: "Base Game",
    icon: "🏠",
    defaultVP: 10,
  },
  {
    value: "seafarers",
    label: "Seafarers",
    icon: "⛵",
    defaultVP: 12,
  },
  {
    value: "cities_knights",
    label: "Cities & Knights",
    icon: "🏰",
    defaultVP: 13,
  },
  {
    value: "seafarers_cities_knights",
    label: "Seafarers + C&K",
    icon: "🌊",
    defaultVP: 14,
  },
];

// ============================================
// Special Cards
// ============================================

export const SPECIAL_CARDS = {
  LONGEST_ROAD: {
    name: "Longest Road",
    points: 2,
    icon: "🛣️",
    description: "5+ connected road segments",
  },
  LARGEST_ARMY: {
    name: "Largest Army",
    points: 2,
    icon: "⚔️",
    description: "3+ knight cards played",
  },
} as const;

// ============================================
// Avatar Seeds (for generating unique avatars)
// Using DiceBear or similar - these are style options
// ============================================

export const AVATAR_STYLES = [
  "adventurer",
  "adventurer-neutral", 
  "avataaars",
  "big-ears",
  "bottts",
  "croodles",
  "fun-emoji",
  "icons",
  "identicon",
  "initials",
  "lorelei",
  "micah",
  "miniavs",
  "personas",
  "pixel-art",
  "shapes",
  "thumbs",
] as const;

// Generate avatar URL using DiceBear
export function generateAvatarUrl(seed: string, style: string = "adventurer"): string {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}
