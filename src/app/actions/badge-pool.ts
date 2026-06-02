'use server';

import { supabase } from '@/lib/supabase';

// ─── Générer un lot de badges pré-imprimés ─────────────────────────────────
export async function generateBadgePool(
    count: number,
    prefix: string = 'A',
    batchName: string = `lot-${new Date().toISOString().slice(0, 10)}`
) {
    if (count < 1 || count > 2000) {
        return { error: 'Le nombre de badges doit être entre 1 et 2000.' };
    }

    // Trouver le dernier numéro utilisé pour ce préfixe
    const { data: existing } = await supabase
        .from('badges')
        .select('badge_code')
        .like('badge_code', `FZ26-${prefix}%`)
        .order('badge_code', { ascending: false })
        .limit(1);

    let startNum = 1;
    if (existing && existing.length > 0) {
        const lastCode = existing[0].badge_code; // ex: FZ26-A042
        const lastNum = parseInt(lastCode.replace(`FZ26-${prefix}`, ''), 10);
        if (!isNaN(lastNum)) startNum = lastNum + 1;
    }

    const badges = Array.from({ length: count }, (_, i) => ({
        badge_code: `FZ26-${prefix}${String(startNum + i).padStart(3, '0')}`,
        status: 'LIBRE',
        print_batch: batchName,
    }));

    const { data, error } = await supabase
        .from('badges')
        .insert(badges)
        .select();

    if (error) {
        console.error('Erreur génération badges:', error);
        return { error: 'Erreur lors de la génération des badges.' };
    }

    return { success: true, count: data.length, batch: batchName };
}

// ─── Statistiques du pool ───────────────────────────────────────────────────
export async function getBadgeStats() {
    const { data, error } = await supabase
        .from('badges')
        .select('status');

    if (error) return { error: 'Impossible de charger les statistiques.' };

    const libre = data.filter(b => b.status === 'LIBRE').length;
    const assigne = data.filter(b => b.status === 'ASSIGNE').length;
    const inactif = data.filter(b => b.status === 'INACTIF').length;

    return { success: true, total: data.length, libre, assigne, inactif };
}

// ─── Lister les badges (avec filtres) ──────────────────────────────────────
export async function getBadgeList(status?: string, batch?: string) {
    let query = supabase
        .from('badges')
        .select('*, participants(first_name, last_name, phone)')
        .order('badge_code', { ascending: true });

    if (status) query = query.eq('status', status);
    if (batch) query = query.eq('print_batch', batch);

    const { data, error } = await query;
    if (error) return { error: 'Impossible de charger les badges.' };

    return { success: true, badges: data };
}

// ─── Lister les lots d'impression ──────────────────────────────────────────
export async function getBatchList() {
    const { data, error } = await supabase
        .from('badges')
        .select('print_batch')
        .not('print_batch', 'is', null)
        .order('print_batch', { ascending: false });

    if (error) return { batches: [] };

    const unique = [...new Set(data.map(b => b.print_batch))];
    return { batches: unique };
}

// ─── Désactiver un badge ────────────────────────────────────────────────────
export async function deactivateBadge(badgeCode: string) {
    const { error } = await supabase
        .from('badges')
        .update({ status: 'INACTIF' })
        .eq('badge_code', badgeCode);

    if (error) return { error: 'Impossible de désactiver ce badge.' };
    return { success: true };
}
