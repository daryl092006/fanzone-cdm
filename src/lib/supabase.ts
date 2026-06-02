import { createBrowserClient } from '@supabase/ssr';

// Client Supabase côté navigateur (Client Components)
export function createSupabaseBrowserClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// Client simple pour les Server Actions (sans gestion de session)
// Utiliser supabase-server.ts pour les actions qui nécessitent l'authentification
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
