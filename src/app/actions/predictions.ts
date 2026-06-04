'use server';

import { supabase } from '@/lib/supabase';

// Structure d'un participant identifié
export interface AuthParticipant {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    badgeCode: string;
}

// Fonction d'identification (par badge ou téléphone)
export async function loginParticipant(identifier: string): Promise<{ success: boolean; participant?: AuthParticipant; error?: string }> {
    if (!identifier || identifier.trim().length < 3) {
        return { success: false, error: "Identifiant trop court." };
    }

    const cleanId = identifier.trim();

    try {
        // 1. Recherche par badge_code
        let { data: badgeData, error: badgeError } = await supabase
            .from('badges')
            .select('id, badge_code, status, participant_id')
            .eq('badge_code', cleanId.toUpperCase())
            .maybeSingle();

        if (badgeData && badgeData.participant_id) {
            // Récupérer le participant
            const { data: participantData } = await supabase
                .from('participants')
                .select('id, first_name, last_name, phone')
                .eq('id', badgeData.participant_id)
                .maybeSingle();

            if (participantData) {
                return {
                    success: true,
                    participant: {
                        id: participantData.id,
                        firstName: participantData.first_name,
                        lastName: participantData.last_name,
                        phone: participantData.phone,
                        badgeCode: badgeData.badge_code
                    }
                };
            }
        }

        // 2. Recherche par téléphone
        const { data: participantData, error: participantError } = await supabase
            .from('participants')
            .select('id, first_name, last_name, phone, badges(badge_code)')
            .eq('phone', cleanId)
            .limit(1)
            .maybeSingle();

        if (participantData) {
            const badgeCode = Array.isArray(participantData.badges) 
                ? participantData.badges[0]?.badge_code 
                : (participantData.badges as any)?.badge_code || 'ONLINE';

            return {
                success: true,
                participant: {
                    id: participantData.id,
                    firstName: participantData.first_name,
                    lastName: participantData.last_name,
                    phone: participantData.phone,
                    badgeCode: badgeCode
                }
            };
        }

        return { success: false, error: "Aucun participant actif trouvé avec ce numéro ou code badge." };
    } catch (e: any) {
        console.error("Login Error:", e);
        return { success: false, error: "Erreur de connexion. Vérifiez si les tables de la base de données existent." };
    }
}

// Récupérer les matchs et pronostics d'un supporter
export async function getMatchesAndPredictions(participantId: string) {
    try {
        // Récupérer tous les matchs
        const { data: matches, error: matchesError } = await supabase
            .from('matches')
            .select('*')
            .order('match_date', { ascending: true });

        if (matchesError) throw matchesError;

        // Récupérer les pronostics du supporter
        const { data: predictions, error: predError } = await supabase
            .from('predictions')
            .select('*')
            .eq('participant_id', participantId);

        if (predError) throw predError;

        // Récupérer tous les tirages gagnants
        const { data: winners, error: winnersError } = await supabase
            .from('draw_winners')
            .select('*, participants(first_name, last_name, phone)')
            .limit(100);

        // Fusionner les données
        const results = (matches || []).map((m: any) => {
            const pred = (predictions || []).find((p: any) => p.match_id === m.id);
            const winner = (winners || []).find((w: any) => w.match_id === m.id);

            return {
                id: m.id,
                teamHome: m.team_home,
                teamAway: m.team_away,
                matchDate: m.match_date,
                scoreHome: m.score_home,
                scoreAway: m.score_away,
                status: m.status, // 'UPCOMING', 'LIVE', 'FINISHED'
                prediction: pred ? {
                    id: pred.id,
                    predScoreHome: pred.pred_score_home,
                    predScoreAway: pred.pred_score_away,
                    createdAt: pred.created_at
                } : null,
                winner: winner ? {
                    firstName: winner.participants?.first_name,
                    lastName: winner.participants?.last_name,
                    phone: winner.participants?.phone ? '**** ' + winner.participants.phone.slice(-4) : '',
                    drawnAt: winner.drawn_at
                } : null
            };
        });

        return { success: true, matches: results };
    } catch (e: any) {
        console.error("Fetch Matches & Predictions Error:", e);
        return { success: false, error: "Impossible de récupérer les matchs. Avez-vous exécuté le script SQL schema.sql dans Supabase ?" };
    }
}

// Soumettre un pronostic
export async function submitPrediction(participantId: string, matchId: string, predScoreHome: number, predScoreAway: number) {
    try {
        // Vérifier si le match existe et est toujours modifiable (UPCOMING)
        const { data: match, error: matchError } = await supabase
            .from('matches')
            .select('status')
            .eq('id', matchId)
            .single();

        if (matchError || !match) {
            return { success: false, error: "Match introuvable." };
        }

        if (match.status !== 'UPCOMING') {
            return { success: false, error: "Le pronostic n'est plus modifiable car le match a débuté ou est terminé." };
        }

        // Upsert du pronostic
        const { data, error } = await supabase
            .from('predictions')
            .upsert({
                participant_id: participantId,
                match_id: matchId,
                pred_score_home: predScoreHome,
                pred_score_away: predScoreAway,
                created_at: new Date().toISOString()
            }, {
                onConflict: 'participant_id,match_id'
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, prediction: data };
    } catch (e: any) {
        console.error("Submit Prediction Error:", e);
        return { success: false, error: "Impossible d'enregistrer le pronostic." };
    }
}

// --- ACTIONS ADMIN ---

// Créer ou ajouter un match
export async function adminAddMatch(teamHome: string, teamAway: string, matchDateStr: string) {
    try {
        const { data, error } = await supabase
            .from('matches')
            .insert({
                team_home: teamHome,
                team_away: teamAway,
                match_date: new Date(matchDateStr).toISOString(),
                status: 'UPCOMING'
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, match: data };
    } catch (e: any) {
        console.error("Admin Add Match Error:", e);
        return { success: false, error: "Impossible d'ajouter le match." };
    }
}

// Mettre à jour le score d'un match
export async function adminUpdateMatchScore(matchId: string, scoreHome: number, scoreAway: number, status: string) {
    try {
        const { data, error } = await supabase
            .from('matches')
            .update({
                score_home: scoreHome,
                score_away: scoreAway,
                status: status // 'UPCOMING', 'LIVE', 'FINISHED'
            })
            .eq('id', matchId)
            .select()
            .single();

        if (error) throw error;
        return { success: true, match: data };
    } catch (e: any) {
        console.error("Admin Update Match Error:", e);
        return { success: false, error: "Impossible de mettre à jour le match." };
    }
}

// Tirage au sort parmi les pronostics corrects
export async function adminDrawWinner(matchId: string) {
    try {
        // 1. Récupérer le match avec son score final
        const { data: match, error: matchError } = await supabase
            .from('matches')
            .select('*')
            .eq('id', matchId)
            .single();

        if (matchError || !match) {
            return { success: false, error: "Match introuvable." };
        }

        if (match.status !== 'FINISHED' || match.score_home === null || match.score_away === null) {
            return { success: false, error: "Le match doit être terminé avec un score renseigné pour lancer le tirage." };
        }

        // 2. Vérifier si un gagnant a déjà été tiré
        const { data: existingWinner } = await supabase
            .from('draw_winners')
            .select('*, participants(first_name, last_name, phone)')
            .eq('match_id', matchId)
            .maybeSingle();

        if (existingWinner) {
            return {
                success: true,
                alreadyDrawn: true,
                winner: {
                    firstName: existingWinner.participants?.first_name,
                    lastName: existingWinner.participants?.last_name,
                    phone: existingWinner.participants?.phone,
                    drawnAt: existingWinner.drawn_at
                }
            };
        }

        // 3. Récupérer tous les pronostics qui ont le score exact
        const { data: correctPredictions, error: predError } = await supabase
            .from('predictions')
            .select('*, participants(first_name, last_name, phone)')
            .eq('match_id', matchId)
            .eq('pred_score_home', match.score_home)
            .eq('pred_score_away', match.score_away);

        if (predError) throw predError;

        if (!correctPredictions || correctPredictions.length === 0) {
            return { success: false, error: "Aucun participant n'a trouvé le score exact de ce match." };
        }

        // 4. Sélectionner un gagnant au hasard
        const randomIndex = Math.floor(Math.random() * correctPredictions.length);
        const luckyDraw = correctPredictions[randomIndex];

        // 5. Enregistrer le gagnant
        const { data: drawRecord, error: drawError } = await supabase
            .from('draw_winners')
            .insert({
                match_id: matchId,
                participant_id: luckyDraw.participant_id,
                drawn_at: new Date().toISOString()
            })
            .select()
            .single();

        if (drawError) throw drawError;

        return {
            success: true,
            alreadyDrawn: false,
            winner: {
                firstName: luckyDraw.participants?.first_name,
                lastName: luckyDraw.participants?.last_name,
                phone: luckyDraw.participants?.phone,
                drawnAt: drawRecord.drawn_at
            }
        };
    } catch (e: any) {
        console.error("Admin Draw Error:", e);
        return { success: false, error: "Erreur lors du tirage au sort." };
    }
}

// Synchronisation avec l'API de football désactivée
export async function adminSyncMatchesWithApi(): Promise<{ success: boolean; message?: string; error?: string }> {
    return { success: false, error: "La synchronisation avec l'API de football a été désactivée." };
}
