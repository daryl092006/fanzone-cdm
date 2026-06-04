-- ─── Table des équipes de la Coupe du Monde ──────────────────────────────────
-- À exécuter dans l'éditeur SQL de votre tableau de bord Supabase

CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    flag TEXT NOT NULL DEFAULT '🏳️',
    group_letter TEXT NOT NULL, -- ex: 'A', 'B', ..., 'L'
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS pour teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to teams"
ON public.teams FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow full access to admin for teams"
ON public.teams FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
