// ============================================
// Database Types (mirrors Supabase schema)
// ============================================

export type ExpansionType = 
  | "base" 
  | "seafarers" 
  | "cities_knights" 
  | "seafarers_cities_knights";

export interface Player {
  id: string;
  name: string;
  preferred_color: string;  // Hex color (e.g., "#E74C3C")
  avatar_seed: string | null;  // Seed for DiceBear avatar
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  started_at: string;
  ended_at: string | null;
  expansion: ExpansionType;
  target_vp: number;
  winner_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface MatchParticipant {
  id: string;
  match_id: string;
  player_id: string;
  score: number;
  has_longest_road: boolean;
  has_largest_army: boolean;
  turn_order: number;
}

// ============================================
// Extended Types (with joins)
// ============================================

export interface MatchParticipantWithPlayer extends MatchParticipant {
  player?: Player;
}

export interface MatchWithDetails extends Match {
  participants: MatchParticipantWithPlayer[];
}

// ============================================
// View Types (from player_stats view)
// ============================================

export interface PlayerStats {
  id: string;
  name: string;
  preferred_color: string;
  avatar_seed: string | null;
  games_played: number;
  wins: number;
  win_rate: number;
  avg_score: number;
  longest_road_count: number;
  largest_army_count: number;
}

// ============================================
// Form / Input Types
// ============================================

export interface CreatePlayerInput {
  name: string;
  preferred_color: string;
  avatar_seed?: string;
}

export interface UpdatePlayerInput {
  name?: string;
  preferred_color?: string;
  avatar_seed?: string;
}

export interface CreateMatchInput {
  expansion: ExpansionType;
  target_vp: number;
  player_ids: string[];
}

export interface UpdateScoreInput {
  participant_id: string;
  score: number;
}

// ============================================
// Game State Types
// ============================================

export interface GameState {
  match: Match | null;
  participants: MatchParticipantWithPlayer[];
  isLoading: boolean;
  error: string | null;
}

// ============================================
// Player Color Type
// ============================================

export interface PlayerColor {
  name: string;
  hex: string;
  textColor: string;
  resource?: string;
}
