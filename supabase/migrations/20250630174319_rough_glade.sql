/*
  # Fix quotes table policies for public access

  1. Security Changes
    - Drop existing restrictive policy if it exists
    - Create public read access policy (with IF NOT EXISTS equivalent)
    - Ensure authenticated user policies are properly configured
    - Maintain security for write operations (authenticated users only)

  2. Policy Updates
    - Public users can read all quotes
    - Authenticated users can create, update, and delete their own quotes
*/

-- Drop the existing restrictive policy if it exists
DROP POLICY IF EXISTS "Anyone can read quotes" ON quotes;

-- Create new policy that allows public read access (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'quotes' 
    AND policyname = 'Public can read quotes'
  ) THEN
    CREATE POLICY "Public can read quotes"
      ON quotes
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Ensure other policies remain secure (authenticated users only)
-- Users can create quotes (authenticated only)
DROP POLICY IF EXISTS "Users can create quotes" ON quotes;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'quotes' 
    AND policyname = 'Users can create quotes'
  ) THEN
    CREATE POLICY "Users can create quotes"
      ON quotes
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Users can update own quotes (authenticated only)
DROP POLICY IF EXISTS "Users can update own quotes" ON quotes;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'quotes' 
    AND policyname = 'Users can update own quotes'
  ) THEN
    CREATE POLICY "Users can update own quotes"
      ON quotes
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Users can delete own quotes (authenticated only)
DROP POLICY IF EXISTS "Users can delete own quotes" ON quotes;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'quotes' 
    AND policyname = 'Users can delete own quotes'
  ) THEN
    CREATE POLICY "Users can delete own quotes"
      ON quotes
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;