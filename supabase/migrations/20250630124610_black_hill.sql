/*
  # Fix user creation trigger function

  1. Problem
    - The handle_new_user trigger function is failing during user signup
    - This causes a 500 error when trying to create new users
    - The function likely has issues extracting metadata or inserting data

  2. Solution
    - Drop and recreate the handle_new_user function with proper error handling
    - Ensure it correctly extracts username and full_name from raw_user_meta_data
    - Add proper null checks and fallbacks
    - Recreate the trigger on auth.users table

  3. Security
    - Maintain existing RLS policies on users table
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the handle_new_user function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    username,
    full_name,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      ''
    ),
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If username already exists, append a random suffix
    INSERT INTO public.users (
      id,
      email,
      username,
      full_name,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(
        NEW.raw_user_meta_data->>'username',
        split_part(NEW.email, '@', 1)
      ) || '_' || substr(gen_random_uuid()::text, 1, 8),
      COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        ''
      ),
      NOW(),
      NOW()
    );
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error and re-raise it
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the function has proper permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;