'use server';

import { supabase } from '@/lib/supabase';

export async function processScan(badgeCode: string) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    try {
        // 1. Récupérer le badge, le participant et l'historique en une SEULE requête optimisée
        const { data: badge, error: badgeError } = await supabase
            .from('badges')
            .select(`
                id,
                badge_code,
                status,
                participants (
                    id,
                    first_name,
                    last_name,
                    phone,
                    profession,
                    attendances (
                        id,
                        date
                    )
                )
            `)
            .eq('badge_code', badgeCode)
            .maybeSingle();

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

        // Récupérer le participant lié (peut être un tableau ou un objet seul)
        const participantArray = badge.participants as any;
        const participant = Array.isArray(participantArray) ? participantArray[0] : participantArray;

        if (!participant) {
            return { error: "Participant introuvable pour ce badge." };
        }

        const attendances = participant.attendances || [];
        const totalVisits = attendances.length;

        // Vérifier si déjà scanné aujourd'hui
        const alreadyScanned = attendances.some((att: any) => att.date === today);

        if (alreadyScanned) {
            await supabase.from('scan_logs').insert({
                participant_id: participant.id,
                badge_code: badgeCode,
                result: 'DEJA_SCANNE',
                message: "Déjà venu aujourd'hui",
            });

            // Trouver la dernière visite avant aujourd'hui
            const pastAttendances = attendances
                .filter((att: any) => att.date < today)
                .sort((a: any, b: any) => b.date.localeCompare(a.date));
            const lastVisitDate = pastAttendances[0]?.date || null;

            return {
                warning: "Ce badge a déjà été scanné aujourd'hui.",
                participant: {
                    firstName: participant.first_name,
                    lastName: participant.last_name,
                    badgeCode,
                    profession: participant.profession,
                },
                totalVisits: totalVisits,
                lastVisit: lastVisitDate,
            };
        }

        // 2. Enregistrer la présence
        await supabase.from('attendances').insert({
            participant_id: participant.id,
            date: today,
            status: 'VALIDE',
        });

        // Enregistrer le log
        await supabase.from('scan_logs').insert({
            participant_id: participant.id,
            badge_code: badgeCode,
            result: 'SUCCES',
            message: 'Entrée validée',
        });

        // Trouver la dernière visite avant aujourd'hui
        const pastAttendances = attendances
            .filter((att: any) => att.date < today)
            .sort((a: any, b: any) => b.date.localeCompare(a.date));
        const lastVisitDate = pastAttendances[0]?.date || null;

        return {
            success: true,
            participant: {
                firstName: participant.first_name,
                lastName: participant.last_name,
                badgeCode,
                profession: participant.profession,
            },
            totalVisits: totalVisits + 1,
            lastVisit: lastVisitDate,
        };

    } catch (error) {
        console.error("Erreur Scan:", error);
        return { error: "Erreur technique lors du scan." };
    }
}

export async function registerPresenceByPhone(phone: string) {
    const today = new Date().toISOString().split('T')[0];
    const cleanPhone = phone.trim();

    try {
        // 1. Récupérer le participant par son téléphone
        const { data: participant, error: pError } = await supabase
            .from('participants')
            .select(`
                id,
                first_name,
                last_name,
                phone,
                profession,
                attendances (
                    id,
                    date
                )
            `)
            .eq('phone', cleanPhone)
            .maybeSingle();

        if (pError || !participant) {
            return { error: "Aucun participant trouvé avec ce numéro de téléphone." };
        }

        const attendances = participant.attendances || [];
        const alreadyScanned = attendances.some((att: any) => att.date === today);

        if (alreadyScanned) {
            return {
                warning: "La présence de ce participant a déjà été enregistrée aujourd'hui.",
                participant: {
                    firstName: participant.first_name,
                    lastName: participant.last_name,
                    phone: participant.phone,
                    profession: participant.profession
                }
            };
        }

        // 2. Insérer la présence
        const { error: insertError } = await supabase
            .from('attendances')
            .insert({
                participant_id: participant.id,
                date: today,
                status: 'VALIDE'
            });

        if (insertError) throw insertError;

        return {
            success: true,
            participant: {
                firstName: participant.first_name,
                lastName: participant.last_name,
                phone: participant.phone,
                profession: participant.profession
            }
        };
    } catch (e: any) {
        console.error("Register Presence Phone Error:", e);
        return { error: "Erreur technique lors de l'enregistrement de la présence." };
    }
}

