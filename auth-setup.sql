-- Enable OAuth providers in Supabase Auth
ALTER TABLE auth.identities
ADD COLUMN IF NOT EXISTS provider_id TEXT,
ADD COLUMN IF NOT EXISTS provider_user_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS identities_provider_id_provider_user_id_idx
ON auth.identities(provider_id, provider_user_id);

-- Update RLS policies to allow access via OAuth
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own data" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update their own data" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- Add OAuth provider columns to track provider info
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS oauth_provider TEXT,
ADD COLUMN IF NOT EXISTS oauth_id TEXT;

-- Create unique constraint on oauth provider and id
CREATE UNIQUE INDEX IF NOT EXISTS users_oauth_provider_oauth_id_idx
ON public.users(oauth_provider, oauth_id);

-- Enable realtime for users table
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;