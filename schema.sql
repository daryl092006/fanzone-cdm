-- Script de création des tables pour les Pronostics et Tirages au sort
-- À exécuter dans l'éditeur SQL de votre tableau de bord Supabase

-- 1. Table des matchs
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_home TEXT NOT NULL,
    team_away TEXT NOT NULL,
    match_date TIMESTAMPTZ NOT NULL,
    score_home INTEGER,
    score_away INTEGER,
    status TEXT NOT NULL DEFAULT 'UPCOMING', -- 'UPCOMING', 'LIVE', 'FINISHED'
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) pour matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to matches"
ON public.matches FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow full access to admin"
ON public.matches FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true); -- En production, limitez cela au rôle de service ou admin. Pour l'instant, tout accès est autorisé pour simplifier le prototype.

-- 2. Table des pronostics
CREATE TABLE IF NOT EXISTS public.predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id TEXT REFERENCES public.participants(id) ON DELETE CASCADE NOT NULL,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
    pred_score_home INTEGER NOT NULL,
    pred_score_away INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_participant_match UNIQUE (participant_id, match_id)
);

-- RLS pour predictions
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to predictions"
ON public.predictions FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow insert/update access to predictions"
ON public.predictions FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 3. Table des gagnants du tirage au sort (Draw Winners)
CREATE TABLE IF NOT EXISTS public.draw_winners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
    participant_id TEXT REFERENCES public.participants(id) ON DELETE CASCADE NOT NULL,
    drawn_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_match_winner UNIQUE (match_id)
);

-- RLS pour draw_winners
ALTER TABLE public.draw_winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to draw_winners"
ON public.draw_winners FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow insert/update access to draw_winners"
ON public.draw_winners FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);


