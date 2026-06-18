'use server';

import { supabase } from '@/lib/supabase';

export async function getDashboardStats() {
    try {
        const today = new Date().toISOString().split('T')[0];

        const [
            { count: totalParticipants },
            { count: totalAttendances },
            { count: attendancesToday },
            { count: badgesTotal },
            { count: badgesLibres },
        ] = await Promise.all([
            supabase.from('participants').select('*', { count: 'exact', head: true }),
            supabase.from('attendances').select('*', { count: 'exact', head: true }),
            supabase.from('attendances').select('*', { count: 'exact', head: true }).eq('date', today),
            supabase.from('badges').select('*', { count: 'exact', head: true }),
            supabase.from('badges').select('*', { count: 'exact', head: true }).eq('status', 'LIBRE'),
        ]);

        // Participants qui sont déjà venus au moins une fois
        const { data: participantsWithAttendances } = await supabase
            .from('attendances')
            .select('participant_id')
            .limit(10000);
        const uniqueParticipants = new Set(participantsWithAttendances?.map(a => a.participant_id)).size;

        // Répartition par profession
        const { data: allParticipants } = await supabase
            .from('participants')
            .select('profession');

        const professionMap: Record<string, number> = {};
        allParticipants?.forEach(p => {
            professionMap[p.profession] = (professionMap[p.profession] || 0) + 1;
        });
        const professionStats = Object.entries(professionMap).map(([name, value]) => ({ name, value }));

        // Top participants fidèles
        const { data: topRaw } = await supabase
            .from('attendances')
            .select('participant_id, participants(first_name, last_name, profession, badges(badge_code))');

        const visitMap: Record<string, { firstName: string; lastName: string; profession: string; badgeCode: string; count: number }> = {};
        topRaw?.forEach((row: any) => {
            const pid = row.participant_id;
            if (!visitMap[pid]) {
                visitMap[pid] = {
                    firstName: row.participants?.first_name,
                    lastName: row.participants?.last_name,
                    profession: row.participants?.profession,
                    badgeCode: row.participants?.badges?.badge_code,
                    count: 0,
                };
            }
            visitMap[pid].count++;
        });
        const topParticipants = Object.values(visitMap)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Derniers scans
        const { data: recentScans } = await supabase
            .from('scan_logs')
            .select('*, participants(first_name, last_name)')
            .order('scan_time', { ascending: false })
            .limit(10);

        const mappedScans = (recentScans ?? []).map((scan: any) => {
            const part = Array.isArray(scan.participants) ? scan.participants[0] : scan.participants;
            return {
                id: scan.id,
                badgeCode: scan.badge_code,
                result: scan.result,
                message: scan.message,
                scanTime: scan.scan_time,
                participant: part ? {
                    firstName: part.first_name,
                    lastName: part.last_name
                } : null
            };
        });

        return {
            success: true,
            stats: {
                totalParticipants: totalParticipants ?? 0,
                totalAttendances: totalAttendances ?? 0,
                attendancesToday: attendancesToday ?? 0,
                participantsComing: uniqueParticipants,
                badgesTotal: badgesTotal ?? 0,
                badgesLibres: badgesLibres ?? 0,
                conversionRate: (totalParticipants ?? 0) > 0
                    ? (uniqueParticipants / (totalParticipants ?? 1) * 100).toFixed(1)
                    : 0,
            },
            professionStats,
            recentScans: mappedScans,
            topParticipants,
        };
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return { error: "Impossible de charger les statistiques." };
    }
}

export async function getDailyStats() {
    try {
        const { data: participants, error: pError } = await supabase
            .from('participants')
            .select('id, created_at');

        if (pError) throw pError;

        const { data: attendances, error: aError } = await supabase
            .from('attendances')
            .select('participant_id, date, status');

        if (aError) throw aError;

        const statsByDate: Record<string, { date: string; registrations: number; uniquePresent: Set<string>; totalScans: number }> = {};

        participants?.forEach(p => {
            if (!p.created_at) return;
            const dateStr = p.created_at.split('T')[0];
            if (!statsByDate[dateStr]) {
                statsByDate[dateStr] = { date: dateStr, registrations: 0, uniquePresent: new Set(), totalScans: 0 };
            }
            statsByDate[dateStr].registrations++;
        });

        attendances?.forEach(a => {
            const dateStr = a.date;
            if (!dateStr) return;
            if (!statsByDate[dateStr]) {
                statsByDate[dateStr] = { date: dateStr, registrations: 0, uniquePresent: new Set(), totalScans: 0 };
            }
            if (a.participant_id) {
                statsByDate[dateStr].uniquePresent.add(a.participant_id);
            }
            statsByDate[dateStr].totalScans++;
        });

        const reports = Object.values(statsByDate)
            .map(item => ({
                date: item.date,
                registrations: item.registrations,
                uniquePresent: item.uniquePresent.size,
                totalScans: item.totalScans
            }))
            .sort((a, b) => b.date.localeCompare(a.date));

        return { success: true, reports };
    } catch (error) {
        console.error("Daily Stats Error:", error);
        return { error: "Erreur lors de la récupération des rapports journaliers." };
    }
}

