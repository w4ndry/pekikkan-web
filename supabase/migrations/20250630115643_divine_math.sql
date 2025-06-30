/*
  # Fix users table timestamp defaults

  1. Schema Changes
    - Set proper default values for `created_at` and `updated_at` columns in users table
    - Ensure both columns are NOT NULL with DEFAULT now()
  
  2. Security
    - No changes to existing RLS policies
  
  This migration fixes the "Database error saving new user" issue by ensuring
  timestamp columns have proper default values when inserting new user records.
*/

-- Update the users table to have proper defaults for timestamp columns
ALTER TABLE users 
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE users 
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET NOT NULL;

-- Update any existing NULL values to current timestamp
UPDATE users 
SET created_at = now() 
WHERE created_at IS NULL;

UPDATE users 
SET updated_at = now() 
WHERE updated_at IS NULL;