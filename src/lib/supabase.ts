import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are properly set.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          full_name: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          full_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          full_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      quotes: {
        Row: {
          id: string;
          content: string;
          author: string;
          user_id: string;
          like_count: number;
          save_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          author: string;
          user_id: string;
          like_count?: number;
          save_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          author?: string;
          user_id?: string;
          like_count?: number;
          save_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      interactions: {
        Row: {
          id: string;
          user_id: string;
          quote_id: string;
          type: 'like' | 'save' | 'report';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quote_id: string;
          type: 'like' | 'save' | 'report';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          quote_id?: string;
          type?: 'like' | 'save' | 'report';
          created_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
    };
  };
};