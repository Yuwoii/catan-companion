/**
 * Supabase Database Types
 * 
 * These types are manually defined to match the Supabase schema.
 * For production, consider using `supabase gen types typescript` to auto-generate.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      players: {
        Row: {
          id: string;
          name: string;
          color: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          started_at: string;
          ended_at: string | null;
          expansion: "base" | "seafarers" | "cities_knights" | "seafarers_cities_knights";
          target_vp: number;
          winner_id: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          started_at?: string;
          ended_at?: string | null;
          expansion?: "base" | "seafarers" | "cities_knights" | "seafarers_cities_knights";
          target_vp?: number;
          winner_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          started_at?: string;
          ended_at?: string | null;
          expansion?: "base" | "seafarers" | "cities_knights" | "seafarers_cities_knights";
          target_vp?: number;
          winner_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      match_participants: {
        Row: {
          id: string;
          match_id: string;
          player_id: string;
          score: number;
          has_longest_road: boolean;
          has_largest_army: boolean;
          turn_order: number;
        };
        Insert: {
          id?: string;
          match_id: string;
          player_id: string;
          score?: number;
          has_longest_road?: boolean;
          has_largest_army?: boolean;
          turn_order: number;
        };
        Update: {
          id?: string;
          match_id?: string;
          player_id?: string;
          score?: number;
          has_longest_road?: boolean;
          has_largest_army?: boolean;
          turn_order?: number;
        };
      };
    };
    Views: {
      player_stats: {
        Row: {
          id: string;
          name: string;
          color: string;
          games_played: number;
          wins: number;
          win_rate: number;
          avg_score: number;
          longest_road_count: number;
          largest_army_count: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: {
      expansion_type: "base" | "seafarers" | "cities_knights" | "seafarers_cities_knights";
    };
  };
};

