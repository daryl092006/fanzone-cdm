-- ═══════════════════════════════════════════════════════════════════════════
-- ÉTAPE 1 : Supprimer les 34 matchs parasites (fantômes + doublons)
-- ═══════════════════════════════════════════════════════════════════════════

DELETE FROM public.matches WHERE id IN (
  -- 32 matchs fantômes knockout (placeholders)
  'd7832d9f-79f5-4cbe-841b-552c22d2a278',
  '347de73b-3ae2-4098-9005-61dd3ba74aca',
  '895d72e5-dd74-4de2-8ca7-dee165f77f35',
  '3cd03586-f08a-4cd8-8f74-87cf4331b187',
  '12849f9d-f3ff-49bb-8bda-3db8c9c211e4',
  '9e042cb2-3170-4506-a897-2fe3824d45e5',
  'f2148d30-8047-4611-9eaf-c2909ad157a8',
  'e9232511-458b-454c-adc5-d212e82ce08e',
  '34a99f9b-bead-47fc-b7e0-be5446ccc71f',
  '6e078934-fb3c-4f09-b46b-0d399f49f1d5',
  '8d4337d0-1a5d-4a26-a0b5-08cbb5431bc5',
  '1a8a9fb8-9e22-4e93-85ac-9f0e6526132c',
  '5f33db1e-8971-4b95-afef-f206cc035af8',
  'c27b61b2-8fda-400a-b210-d010003976b2',
  'f70fecff-c976-410b-a9cf-db6f97d3ab31',
  '9b576de6-7c72-4f80-8897-6e59f39400a2',
  '61e8a997-28b1-43a6-9089-d87dd0d30b62',
  'c16150e5-5641-4399-a12a-b61a5233b355',
  'f82aa387-2bc5-4402-89bc-7dffc5cd8423',
  '7de8e0d1-9aa0-4129-9b7e-cabd6eb92db9',
  '330750c5-277b-48a8-92b9-11927025db20',
  '769c11ed-7f09-4fbe-a2d6-11b634d25e89',
  'a0a5649f-0e18-41b0-928c-2548f9fe3a69',
  'a1d10b7c-fc0b-41c9-be25-4b94a5c74878',
  '3339da6c-b33b-4fe3-a4db-f083bddc9c2d',
  '31fb5e87-56ae-4997-88f3-4151d06e4e11',
  'dee45d43-74ef-4a72-ac2a-76e0a6354c76',
  'b122c090-63d7-4ca3-9e9e-10c8c19c9b6c',
  'de647906-7322-4157-81e4-8b864cc2ea36',
  '23f24c3b-e77d-4f29-a0a0-bdafed2b6ebe',
  '35e80d5c-ebea-40e5-8863-61032879b3ef',
  'adf71c92-dead-4299-a9ac-df6563e39a14',
  -- 2 doublons
  '42533fd6-3406-46e0-8575-49950d9b03c2',
  'ffab84f5-9c81-4f6f-aa3c-e4048a7726f3'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- ÉTAPE 2 : Corriger les noms d'équipes mal encodés / en français
-- ═══════════════════════════════════════════════════════════════════════════
-- Problème : certains noms ont été insérés en français (Belgique, Espagne,
-- Autriche) ou avec un encodage cassé (T├╝rkiye, Cura├ºao).
-- Ces noms ne sont pas reconnus par le système → matchs "inexistants".

-- Noms en français → anglais
UPDATE public.matches SET team_home = 'Belgium' WHERE team_home = 'Belgique';
UPDATE public.matches SET team_away = 'Belgium' WHERE team_away = 'Belgique';

UPDATE public.matches SET team_home = 'Spain' WHERE team_home = 'Espagne';
UPDATE public.matches SET team_away = 'Spain' WHERE team_away = 'Espagne';

UPDATE public.matches SET team_home = 'Austria' WHERE team_home = 'Autriche';
UPDATE public.matches SET team_away = 'Austria' WHERE team_away = 'Autriche';

-- Encodage cassé → UTF-8 correct
UPDATE public.matches SET team_home = 'Türkiye' WHERE team_home LIKE 'T%rkiye';
UPDATE public.matches SET team_away = 'Türkiye' WHERE team_away LIKE 'T%rkiye';

UPDATE public.matches SET team_home = 'Curaçao' WHERE team_home LIKE 'Cura%ao';
UPDATE public.matches SET team_away = 'Curaçao' WHERE team_away LIKE 'Cura%ao';

-- ═══════════════════════════════════════════════════════════════════════════
-- VÉRIFICATION FINALE
-- ═══════════════════════════════════════════════════════════════════════════
-- Doit retourner exactement 72 matchs
SELECT count(*) as total FROM public.matches;

-- Vérifier qu'il ne reste plus de noms problématiques
SELECT DISTINCT team_home, team_away FROM public.matches
WHERE team_home IN ('Belgique','Espagne','Autriche')
   OR team_away IN ('Belgique','Espagne','Autriche')
   OR team_home LIKE 'T%rkiye' OR team_away LIKE 'T%rkiye'
   OR team_home LIKE 'Cura%ao' OR team_away LIKE 'Cura%ao';
-- → doit retourner 0 lignes
