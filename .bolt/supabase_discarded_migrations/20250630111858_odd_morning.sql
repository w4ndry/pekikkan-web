/*
  # Fix quotes table RLS policies for public access

  1. Policy Changes
    - Allow public read access to quotes (unauthenticated users can view quotes)
    - Maintain secure write access (only authenticated users can create/update/delete)
  
  2. Security
    - Public users can SELECT quotes
    - Only authenticated users can INSERT/UPDATE/DELETE their own quotes
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
  ON quotes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);