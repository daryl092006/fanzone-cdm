'use server';

import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Team {
    id: string;
    name: string;
    flag: string;
    group_letter: string;
    created_at: string;
}

// ─── Constantes FIFA 2026 pour le seeder ──────────────────────────────────────

const FIFA_2026_TEAMS: Omit<Team, 'id' | 'created_at'>[] = [
    // Group A
    { name: "Mexico", flag: "🇲🇽", group_letter: "A" },
    { name: "South Africa", flag: "🇿🇦", group_letter: "A" },
    { name: "Korea Republic", flag: "🇰🇷", group_letter: "A" },
    { name: "Czechia", flag: "🇨🇿", group_letter: "A" },
    // Group B
    { name: "Canada", flag: "🇨🇦", group_letter: "B" },
    { name: "Switzerland", flag: "🇨🇭", group_letter: "B" },
    { name: "Qatar", flag: "🇶🇦", group_letter: "B" },
    { name: "Bosnia-Herzegovina", flag: "🇧🇦", group_letter: "B" },
    // Group C
    { name: "Brazil", flag: "🇧🇷", group_letter: "C" },
    { name: "Morocco", flag: "🇲🇦", group_letter: "C" },
    { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group_letter: "C" },
    { name: "Haiti", flag: "🇭🇹", group_letter: "C" },
    // Group D
    { name: "USA", flag: "🇺🇸", group_letter: "D" },
    { name: "Paraguay", flag: "🇵🇾", group_letter: "D" },
    { name: "Australia", flag: "🇦🇺", group_letter: "D" },
    { name: "Türkiye", flag: "🇹🇷", group_letter: "D" },
    // Group E
    { name: "Germany", flag: "🇩🇪", group_letter: "E" },
    { name: "Ecuador", flag: "🇪🇨", group_letter: "E" },
    { name: "Ivory Coast", flag: "🇨🇮", group_letter: "E" },
    { name: "Curaçao", flag: "🇨🇼", group_letter: "E" },
    // Group F
    { name: "Netherlands", flag: "🇳🇱", group_letter: "F" },
    { name: "Japan", flag: "🇯🇵", group_letter: "F" },
    { name: "Tunisia", flag: "🇹🇳", group_letter: "F" },
    { name: "Sweden", flag: "🇸🇪", group_letter: "F" },
    // Group G
    { name: "Belgium", flag: "🇧🇪", group_letter: "G" },
    { name: "Iran", flag: "🇮🇷", group_letter: "G" },
    { name: "Egypt", flag: "🇪🇬", group_letter: "G" },
    { name: "New Zealand", flag: "🇳🇿", group_letter: "G" },
    // Group H
    { name: "Spain", flag: "🇪🇸", group_letter: "H" },
    { name: "Uruguay", flag: "🇺🇾", group_letter: "H" },
    { name: "Saudi Arabia", flag: "🇸🇦", group_letter: "H" },
    { name: "Cape Verde", flag: "🇨🇻", group_letter: "H" },
    // Group I
    { name: "France", flag: "🇫🇷", group_letter: "I" },
    { name: "Senegal", flag: "🇸🇳", group_letter: "I" },
    { name: "Norway", flag: "🇳🇴", group_letter: "I" },
    { name: "Iraq", flag: "🇮🇶", group_letter: "I" },
    // Group J
    { name: "Argentina", flag: "🇦🇷", group_letter: "J" },
    { name: "Austria", flag: "🇦🇹", group_letter: "J" },
    { name: "Algeria", flag: "🇩🇿", group_letter: "J" },
    { name: "Jordan", flag: "🇯🇴", group_letter: "J" },
    // Group K
    { name: "Portugal", flag: "🇵🇹", group_letter: "K" },
    { name: "Colombia", flag: "🇨🇴", group_letter: "K" },
    { name: "Uzbekistan", flag: "🇺🇿", group_letter: "K" },
    { name: "DR Congo", flag: "🇨🇩", group_letter: "K" },
    // Group L
    { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group_letter: "L" },
    { name: "Croatia", flag: "🇭🇷", group_letter: "L" },
    { name: "Panama", flag: "🇵🇦", group_letter: "L" },
    { name: "Ghana", flag: "🇬🇭", group_letter: "L" },
];

// ─── CRUD Actions ─────────────────────────────────────────────────────────────

/** Récupérer toutes les équipes */
export async function getTeams() {
    const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('group_letter', { ascending: true })
        .order('name', { ascending: true });

    if (error) {
        console.error('[Teams] Error fetching teams:', error);
        return { success: false, error: 'Impossible de récupérer les équipes.', teams: [] as Team[] };
    }
    return { success: true, teams: (data || []) as Team[] };
}

/** Récupérer les équipes d'un groupe spécifique */
export async function getTeamsByGroup(groupLetter: string) {
    const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('group_letter', groupLetter.toUpperCase())
        .order('name', { ascending: true });

    if (error) {
        console.error('[Teams] Error fetching group teams:', error);
        return { success: false, error: 'Impossible de récupérer les équipes du groupe.', teams: [] as Team[] };
    }
    return { success: true, teams: (data || []) as Team[] };
}

/** Créer une nouvelle équipe */
export async function createTeam(name: string, flag: string, groupLetter: string) {
    if (!name.trim() || !groupLetter.trim()) {
        return { success: false, error: 'Le nom et le groupe sont obligatoires.' };
    }

    const { data, error } = await supabase
        .from('teams')
        .insert({ name: name.trim(), flag: flag.trim() || '🏳️', group_letter: groupLetter.toUpperCase().trim() })
        .select()
        .single();

    if (error) {
        console.error('[Teams] Error creating team:', error);
        if (error.code === '23505') {
            return { success: false, error: `L'équipe "${name}" existe déjà.` };
        }
        return { success: false, error: "Impossible de créer l'équipe." };
    }
    return { success: true, team: data as Team };
}

/** Mettre à jour une équipe */
export async function updateTeam(id: string, name: string, flag: string, groupLetter: string) {
    if (!name.trim() || !groupLetter.trim()) {
        return { success: false, error: 'Le nom et le groupe sont obligatoires.' };
    }

    const { data, error } = await supabase
        .from('teams')
        .update({ name: name.trim(), flag: flag.trim() || '🏳️', group_letter: groupLetter.toUpperCase().trim() })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('[Teams] Error updating team:', error);
        return { success: false, error: "Impossible de mettre à jour l'équipe." };
    }
    return { success: true, team: data as Team };
}

/** Supprimer une équipe */
export async function deleteTeam(id: string) {
    const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('[Teams] Error deleting team:', error);
        return { success: false, error: "Impossible de supprimer l'équipe." };
    }
    return { success: true };
}

/** Réinitialiser les équipes avec les 48 équipes officielles de la FIFA 2026 */
export async function seedDefaultTeams() {
    try {
        // Supprimer toutes les équipes existantes
        await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // Insérer les 48 équipes officielles
        const { error } = await supabase
            .from('teams')
            .insert(FIFA_2026_TEAMS);

        if (error) throw error;
        return { success: true, message: `${FIFA_2026_TEAMS.length} équipes FIFA 2026 initialisées avec succès.` };
    } catch (e: any) {
        console.error('[Teams] Seed error:', e);
        return { success: false, error: "Erreur lors de l'initialisation des équipes." };
    }
}
