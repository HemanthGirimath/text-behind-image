-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for users"
ON public.profiles
FOR SELECT
USING (
    auth.uid() = id
);

CREATE POLICY "Enable insert access for users"
ON public.profiles
FOR INSERT
WITH CHECK (
    auth.uid() = id
);

CREATE POLICY "Enable update access for users"
ON public.profiles
FOR UPDATE
USING (
    auth.uid() = id
);
