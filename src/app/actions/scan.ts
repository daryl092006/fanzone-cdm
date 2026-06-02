'use server';

import { supabase } from '@/lib/supabase';

export async function processScan(badgeCode: string) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    try {
        // 1. Chercher le badge
        const { data: badge, error: badgeError } = await supabase
            .from('badges')
            .select('id, badge_code, status')
            .eq('badge_code', badgeCode)
            .single();

        if (badgeError || !badge) {
            await supabase.from('scan_logs').insert({
                badge_code: badgeCode,
                result: 'INCONNU',
                message: 'Badge non trouvé',
            });
            return { error: "Badge inconnu. Accès refusé." };
        }

        if (badge.status === 'LIBRE') {
            await supabase.from('scan_logs').insert({
                badge_code: badgeCode,
                result: 'LIBRE',
                message: 'Badge non encore attribué',
            });
            return { error: "Badge non attribué. Inscrivez d'abord le participant." };
        }

        if (badge.status === 'INACTIF') {
            return { error: "Badge désactivé. Veuillez voir l'administration." };
        }

        // 2. Chercher le participant lié
        const { data: participant, error: participantError } = await supabase
            .from('participants')
            .select('id, first_name, last_name, phone, profession')
            .eq('badge_id', badge.id)
            .single();

        if (participantError || !participant) {
            return { error: "Participant introuvable pour ce badge." };
        }

        // 3. Compter les visites totales
        const { count: totalVisits } = await supabase
            .from('attendances')
            .select('*', { count: 'exact', head: true })
            .eq('participant_id', participant.id);

        // 4. Dernière visite avant aujourd'hui
        const { data: lastAttendance } = await supabase
            .from('attendances')
            .select('date')
            .eq('participant_id', participant.id)
            .lt('date', today)
            .order('date', { ascending: false })
            .limit(1)
            .single();

        // 5. Déjà scanné aujourd'hui ?
        const { data: alreadyScanned } = await supabase
            .from('attendances')
            .select('id')
            .eq('participant_id', participant.id)
            .eq('date', today)
            .maybeSingle();

        if (alreadyScanned) {
            await supabase.from('scan_logs').insert({
                participant_id: participant.id,
                badge_code: badgeCode,
                result: 'DEJA_SCANNE',
                message: "Déjà venu aujourd'hui",
            });
            return {
                warning: "Déjà scanné aujourd'hui !",
                participant: {
                    firstName: participant.first_name,
                    lastName: participant.last_name,
                    badgeCode,
                    profession: participant.profession,
                },
                totalVisits: totalVisits ?? 0,
                lastVisit: lastAttendance?.date || null,
            };
        }

        // 6. Enregistrer la présence
        await supabase.from('attendances').insert({
            participant_id: participant.id,
            date: today,
            status: 'VALIDE',
        });

        await supabase.from('scan_logs').insert({
            participant_id: participant.id,
            badge_code: badgeCode,
            result: 'SUCCES',
            message: 'Entrée validée',
        });

        return {
            success: true,
            participant: {
                firstName: participant.first_name,
                lastName: participant.last_name,
                badgeCode,
                profession: participant.profession,
            },
            totalVisits: (totalVisits ?? 0) + 1,
            lastVisit: lastAttendance?.date || null,
        };

    } catch (error) {
        console.error("Erreur Scan:", error);
        return { error: "Erreur technique lors du scan." };
    }
}
