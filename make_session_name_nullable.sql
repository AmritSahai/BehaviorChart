-- Make session_name column nullable in board_sessions table
-- This allows creating sessions without requiring a session name

ALTER TABLE public.board_sessions 
ALTER COLUMN session_name DROP NOT NULL;

-- Add a default value for existing and new sessions
ALTER TABLE public.board_sessions 
ALTER COLUMN session_name SET DEFAULT 'Untitled Session';
