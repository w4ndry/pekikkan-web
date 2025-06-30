/*
  # Fix quotes visibility for public access

  1. Security Changes
    - Update quotes table policy to allow public read access
    - Keep write operations restricted to authenticated users
    - Maintain data security while enabling public viewing

  2. Changes Made
    - Modified "Anyone can read quotes" policy to allow public access
    - All other policies remain unchanged for security
*/

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can read quotes" ON quotes;

-- Create new policy that allows public read access
CREATE POLICY "Public can read quotes"
  ON quotes
  FOR SELECT
  TO public
  USING (true);

-- Ensure other policies remain secure (authenticated users only)
-- These policies should already exist, but let's make sure they're correct

-- Users can create quotes (authenticated only)
DROP POLICY IF EXISTS "Users can create quotes" ON quotes;
CREATE POLICY "Users can create quotes"
  ON quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update own quotes (authenticated only)
DROP POLICY IF EXISTS "Users can update own quotes" ON quotes;
CREATE POLICY "Users can update own quotes"
  ON quotes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete own quotes (authenticated only)
DROP POLICY IF EXISTS "Users can delete own quotes" ON quotes;
CREATE POLICY "Users can delete own quotes"
  FOR DELETE
  ON quotes
  TO authenticated
  USING (auth.uid() = user_id);