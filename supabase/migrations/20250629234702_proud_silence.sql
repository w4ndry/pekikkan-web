/*
  # Create interactions table

  1. New Tables
    - `interactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `quote_id` (uuid, references quotes)
      - `type` (enum: like, save, report)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `interactions` table
    - Add policies for users to manage their own interactions
*/

-- Create enum for interaction types
DO $$ BEGIN
  CREATE TYPE interaction_type AS ENUM ('like', 'save', 'report');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE NOT NULL,
  type interaction_type NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, quote_id, type)
);

-- Enable RLS
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own interactions"
  ON interactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own interactions"
  ON interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interactions"
  ON interactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS interactions_user_id_idx ON interactions(user_id);
CREATE INDEX IF NOT EXISTS interactions_quote_id_idx ON interactions(quote_id);
CREATE INDEX IF NOT EXISTS interactions_type_idx ON interactions(type);
CREATE INDEX IF NOT EXISTS interactions_user_quote_type_idx ON interactions(user_id, quote_id, type);