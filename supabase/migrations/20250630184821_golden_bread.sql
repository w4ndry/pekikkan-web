/*
  # Fix quotes table policies

  1. Security Updates
    - Ensure public read access to quotes
    - Maintain secure write access for authenticated users only
    - Update existing policies without conflicts

  2. Changes
    - Drop and recreate all policies to ensure consistency
    - Public read access for quotes table
    - Authenticated user restrictions for write operations
*/

-- Drop all existing policies for quotes table
DROP POLICY IF EXISTS "Anyone can read quotes" ON quotes;
DROP POLICY IF EXISTS "Public can read quotes" ON quotes;
DROP POLICY IF EXISTS "Users can create quotes" ON quotes;
DROP POLICY IF EXISTS "Users can update own quotes" ON quotes;
DROP POLICY IF EXISTS "Users can delete own quotes" ON quotes;

-- Create new policy that allows public read access
CREATE POLICY "Public can read quotes"
  ON quotes
  FOR SELECT
  TO public
  USING (true);

-- Users can create quotes (authenticated only)
CREATE POLICY "Users can create quotes"
  ON quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update own quotes (authenticated only)
CREATE POLICY "Users can update own quotes"
  ON quotes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete own quotes (authenticated only)
CREATE POLICY "Users can delete own quotes"
  ON quotes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);