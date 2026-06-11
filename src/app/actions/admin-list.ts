'use server';

import { supabase } from '@/lib/supabase';

export async function getParticipants(search: string = '') {
    try {
        let query = supabase
            .from('participants')
            .select('*, badges(badge_code, status, print_batch), attendances(id)')
            .order('created_at', { ascending: false });

        if (search) {
            query = query.or(
                `first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%`
            );
        }

        const { data: participants, error } = await query;

        if (error) throw error;

        // Enrichir avec le nombre de présences
        const enriched = participants?.map(p => ({
            ...p,
            badgeCode: p.badges?.badge_code ?? null,
            attendanceCount: p.attendances?.length ?? 0,
        }));

        return { success: true, participants: enriched };
    } catch (error) {
        console.error("Fetch Participants Error:", error);
        return { error: "Erreur lors de la récupération des participants." };
    }
}

export async function getPresences(dateFilter: string = '') {
    try {
        let query = supabase
            .from('attendances')
            .select('*, participants(first_name, last_name, badges(badge_code))')
            .order('scan_time', { ascending: false });

        if (dateFilter) {
            query = query.eq('date', dateFilter);
        } else {
            query = query.limit(50);
        }

        const { data: presences, error } = await query;

        // Mapper les données vers le format camelCase attendu par la page
        const mapped = presences?.map((att: any) => {
            const p = att.participants;
            return {
                id: att.id,
                scanTime: att.scan_time,
                date: att.date || '—',
                status: att.status || 'VALIDE',
                participant: {
                    firstName: p?.first_name ?? 'Visiteur',
                    lastName: p?.last_name ?? 'Anonyme',
                    registrationNumber: p?.badges?.badge_code ?? '—'
                }
            };
        }) || [];

        return { success: true, presences: mapped };
    } catch (error) {
        console.error("Error in getPresences:", error);
        return { error: "Erreur lors de la récupération des présences." };
    }
}
