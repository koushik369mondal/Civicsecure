-- Temporary script to confirm all emails for development
-- Run this only in development environment
UPDATE auth.users 
SET email_confirmed_at = CURRENT_TIMESTAMP 
WHERE email_confirmed_at IS NULL;

-- Check the result
SELECT email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC;