/*
  # Fix quote policies to allow public read access

  1. Security Changes
    - Drop existing policies to avoid conflicts
    - Create new policy for public read access to quotes
    - Maintain secure policies for authenticated users (create, update, delete)
    
  2. Policy Updates
    - Public users can read all quotes
    - Authenticated users can create quotes
    - Users can only update/delete their own quotes
*/

-- Drop all existing policies first to avoid conflicts
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