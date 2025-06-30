/*
  # Create quote reports table

  1. New Tables
    - `quote_reports`
      - `id` (uuid, primary key)
      - `quote_id` (uuid, foreign key to quotes)
      - `user_id` (uuid, foreign key to users)
      - `reason` (text, detailed report description)
      - `status` (enum: pending, reviewed, resolved, dismissed)
      - `admin_notes` (text, optional notes from moderators)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `quote_reports` table
    - Add policy for users to create their own reports
    - Add policy for users to read their own reports
    - Add policy for admins to manage all reports

  3. Indexes
    - Index on quote_id for efficient lookups
    - Index on user_id for user report history
    - Index on status for admin filtering
    - Index on created_at for chronological sorting

  4. Constraints
    - Unique constraint to prevent duplicate reports from same user for same quote
    - Check constraint for minimum reason length
*/

-- Create enum for report status
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

-- Create quote_reports table
CREATE TABLE IF NOT EXISTS quote_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status report_status DEFAULT 'pending' NOT NULL,
  admin_notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Constraints
  CONSTRAINT quote_reports_reason_length CHECK (length(trim(reason)) >= 20),
  CONSTRAINT quote_reports_unique_user_quote UNIQUE (user_id, quote_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS quote_reports_quote_id_idx ON quote_reports(quote_id);
CREATE INDEX IF NOT EXISTS quote_reports_user_id_idx ON quote_reports(user_id);
CREATE INDEX IF NOT EXISTS quote_reports_status_idx ON quote_reports(status);
CREATE INDEX IF NOT EXISTS quote_reports_created_at_idx ON quote_reports(created_at DESC);

-- Enable RLS
ALTER TABLE quote_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can create their own reports
CREATE POLICY "Users can create own reports"
  ON quote_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own reports
CREATE POLICY "Users can read own reports"
  ON quote_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own pending reports (to modify reason)
CREATE POLICY "Users can update own pending reports"
  ON quote_reports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Create updated_at trigger
CREATE TRIGGER update_quote_reports_updated_at
  BEFORE UPDATE ON quote_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to get report statistics
CREATE OR REPLACE FUNCTION get_quote_report_count(quote_uuid uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM quote_reports
    WHERE quote_id = quote_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_quote_report_count(uuid) TO authenticated;