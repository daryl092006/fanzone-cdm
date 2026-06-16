'use server';

import { supabase } from '@/lib/supabase';
import { advanceToKnockout } from '@/app/actions/standings-engine';

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

// Récupérer la dernière date de synchronisation
export async function getLastSyncTime(): Promise<string | null> {
    try {
        const { data } = await supabase
            .from('matches')
            .select('match_date')
            .eq('id', '00000000-0000-0000-0000-000000000000')
            .maybeSingle();
        return data?.match_date || null;
    } catch {
        return null;
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

        // Récupérer toutes les présences pour pouvoir valider la présence physique des gagnants
        const { data: attendances } = await supabase
            .from('attendances')
            .select('participant_id, date');

        // Récupérer tous les tirages gagnants
        const { data: winners, error: winnersError } = await supabase
            .from('draw_winners')
            .select('*, participants(id, first_name, last_name, phone)')
            .limit(200);

        // Fusionner les données (en excluant le match système de métadonnées)
        const results = (matches || [])
            .filter((m: any) => m.id !== '00000000-0000-0000-0000-000000000000')
            .map((m: any) => {
                const pred = (predictions || []).find((p: any) => p.match_id === m.id);
                
                // Récupérer les gagnants par type de tirage
                const matchWinners = (winners || []).filter((w: any) => w.match_id === m.id);
                const winnerPresence = matchWinners.find((w: any) => w.draw_type === 'PRESENCE');
                const winnerPrediction = matchWinners.find((w: any) => w.draw_type === 'PREDICTION' || !w.draw_type);

                const checkPresence = (pId: string, matchDate: string) => {
                    const d = new Date(matchDate).toISOString().split('T')[0];
                    return (attendances || []).some((a: any) => a.participant_id === pId && a.date === d);
                };

                const mapWinner = (w: any) => w ? {
                    firstName: w.participants?.first_name,
                    lastName: w.participants?.last_name,
                    phone: w.participants?.phone ? '**** ' + w.participants.phone.slice(-4) : '',
                    drawnAt: w.drawn_at,
                    isPresent: checkPresence(w.participant_id, m.match_date)
                } : null;

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
                    winnerPresence: mapWinner(winnerPresence),
                    winnerPrediction: mapWinner(winnerPrediction),
                    // Rétrocompatibilité
                    winner: mapWinner(winnerPrediction || winnerPresence)
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
        // Vérifier si le match existe, son statut et sa date de début
        const { data: match, error: matchError } = await supabase
            .from('matches')
            .select('status, match_date')
            .eq('id', matchId)
            .single();

        if (matchError || !match) {
            return { success: false, error: "Match introuvable." };
        }

        const now = new Date();
        const matchDate = new Date(match.match_date);

        if (match.status !== 'UPCOMING' || now >= matchDate) {
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
        const cleanDateStr = matchDateStr.endsWith('Z') ? matchDateStr : `${matchDateStr}Z`;
        const { data, error } = await supabase
            .from('matches')
            .insert({
                team_home: teamHome,
                team_away: teamAway,
                match_date: new Date(cleanDateStr).toISOString(),
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

// Supprimer un match
export async function adminDeleteMatch(matchId: string) {
    try {
        const { error } = await supabase
            .from('matches')
            .delete()
            .eq('id', matchId);

        if (error) throw error;
        return { success: true };
    } catch (e: any) {
        console.error("Admin Delete Match Error:", e);
        return { success: false, error: "Impossible de supprimer le match." };
    }
}

// Supprimer TOUS les matchs (pour nettoyer la base)
export async function adminClearAllMatches() {
    try {
        const { error } = await supabase
            .from('matches')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Supprime tout sauf un éventuel ID vide de test

        if (error) throw error;
        return { success: true };
    } catch (e: any) {
        console.error("Admin Clear Matches Error:", e);
        return { success: false, error: "Impossible de vider la liste des matchs." };
    }
}

// Mettre à jour le score d'un match + déclencher l'avancement automatique KO
export async function adminUpdateMatchScore(matchId: string, scoreHome: number, scoreAway: number, status: string, matchDateStr?: string) {
    try {
        const updateData: any = {
            score_home: scoreHome,
            score_away: scoreAway,
            status: status // 'UPCOMING', 'LIVE', 'FINISHED'
        };

        if (matchDateStr) {
            const cleanDateStr = matchDateStr.endsWith('Z') ? matchDateStr : `${matchDateStr}Z`;
            updateData.match_date = new Date(cleanDateStr).toISOString();
        }

        const { data, error } = await supabase
            .from('matches')
            .update(updateData)
            .eq('id', matchId)
            .select()
            .single();

        if (error) throw error;

        // ── Qualification automatique ─────────────────────────────────────────
        // Si le match est terminé, on recalculcule les classements et on avance
        // les équipes qualifiées dans le bracket KO si le groupe est complet.
        let knockoutMessage: string | undefined;
        if (status === 'FINISHED') {
            const advancement = await advanceToKnockout(matchId);
            if (advancement.groupsAdvanced.length > 0) {
                knockoutMessage = advancement.message;
            }
        }

        return { success: true, match: data, knockoutMessage };
    } catch (e: any) {
        console.error("Admin Update Match Error:", e);
        return { success: false, error: "Impossible de mettre à jour le match." };
    }
}

// Tirage au sort parmi les participants PRÉSENTS
export async function adminDrawPresenceWinner(matchId: string) {
    try {
        // 1. Récupérer le match
        const { data: match, error: matchError } = await supabase
            .from('matches')
            .select('*')
            .eq('id', matchId)
            .single();
 
        if (matchError || !match) {
            return { success: false, error: "Match introuvable." };
        }
 
        const matchDateStr = new Date(match.match_date).toLocaleDateString('fr-CA', { timeZone: 'Africa/Lome' });

        // Récupérer tous les matchs de cette journée pour évaluer l'éligibilité globale du jour
        const { data: allMatches, error: allMatchesError } = await supabase
            .from('matches')
            .select('*');
        if (allMatchesError) throw allMatchesError;

        const dayMatches = (allMatches || []).filter((m: any) => {
            const dStr = new Date(m.match_date).toLocaleDateString('fr-CA', { timeZone: 'Africa/Lome' });
            return dStr === matchDateStr && m.id !== '00000000-0000-0000-0000-000000000000';
        });

        // 1. Trier les matchs de la journée par ordre chronologique
        dayMatches.sort((a: any, b: any) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());
        const lastMatch = dayMatches[dayMatches.length - 1];

        // 2. Vérifier si le dernier match de la journée a commencé (LIVE ou FINISHED)
        if (lastMatch.status !== 'LIVE' && lastMatch.status !== 'FINISHED') {
            return { success: false, error: "Le tirage de présence n'est possible qu'à partir du début (mi-temps) du dernier match de la journée." };
        }

        // 2. Vérifier si au moins un match de la journée ne commence pas entre 00h et 08h
        const hasPresenceSupport = dayMatches.some((m: any) => {
            const matchHour = parseInt(new Date(m.match_date).toLocaleTimeString('fr-FR', { timeZone: 'Africa/Lome', hour: '2-digit', hour12: false }));
            return !(matchHour >= 0 && matchHour < 8);
        });
        if (!hasPresenceSupport) {
            return { success: false, error: "Les matchs programmés entre 00h et 08h ne gèrent pas de tirage de présence." };
        }

        // 3. Vérifier si un gagnant de type PRESENCE a déjà été tiré pour ce jour-là (tous matchs de ce jour-là confondus)
        const { data: dayPresenceWinners, error: dpError } = await supabase
            .from('draw_winners')
            .select('*, matches(match_date)')
            .eq('draw_type', 'PRESENCE');

        if (dpError) throw dpError;

        const alreadyDrawnForThisDay = (dayPresenceWinners || []).some((w: any) => {
            if (!w.matches) return false;
            const wDateStr = new Date(w.matches.match_date).toLocaleDateString('fr-CA', { timeZone: 'Africa/Lome' });
            return wDateStr === matchDateStr;
        });

        if (alreadyDrawnForThisDay) {
            return { success: false, error: `Un tirage de présence a déjà été effectué pour la journée du ${matchDateStr.split('-').reverse().join('/')}.` };
        }

        // 3. Récupérer les présences du jour du match (les gens venus ce jour-là)
        const { data: attendances, error: attError } = await supabase
            .from('attendances')
            .select('*, participants(id, first_name, last_name, phone)')
            .eq('date', matchDateStr);
 
        if (attError) throw attError;
 
        if (!attendances || attendances.length === 0) {
            return { success: false, error: `Aucun participant enregistré présent à la FanZone le ${matchDateStr.split('-').reverse().join('/')}.` };
        }
 
        // 4. Filtrer les participants uniques
        const uniqueParticipants = Array.from(new Set(attendances.map(a => a.participants?.id)))
            .map(id => attendances.find(a => a.participants?.id === id)?.participants)
            .filter(Boolean);
 
        if (uniqueParticipants.length === 0) {
            return { success: false, error: "Aucun participant valide trouvé parmi les présents." };
        }
 
        // 5. Tirer au sort
        const randomIndex = Math.floor(Math.random() * uniqueParticipants.length);
        const luckyWinner = uniqueParticipants[randomIndex] as any;
 
        // 6. Enregistrer le gagnant
        const { data: drawRecord, error: drawError } = await supabase
            .from('draw_winners')
            .insert({
                match_id: matchId,
                participant_id: luckyWinner.id,
                draw_type: 'PRESENCE',
                drawn_at: new Date().toISOString()
            })
            .select()
            .single();
 
        if (drawError) throw drawError;
 
        return {
            success: true,
            alreadyDrawn: false,
            winner: {
                firstName: luckyWinner.first_name,
                lastName: luckyWinner.last_name,
                phone: luckyWinner.phone,
                drawnAt: drawRecord.drawn_at
            }
        };
    } catch (e: any) {
        console.error("Admin Draw Presence Error:", e);
        return { success: false, error: "Erreur lors du tirage au sort des présents." };
    }
}

// Tirage au sort parmi les PRONOSTICS CORRECTS de la journée
export async function adminDrawPredictionWinner(matchId: string) {
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

        const matchDateStr = new Date(match.match_date).toLocaleDateString('fr-CA', { timeZone: 'Africa/Lome' });

        // Récupérer tous les matchs de cette journée
        const { data: allMatches, error: allMatchesError } = await supabase
            .from('matches')
            .select('*');
        if (allMatchesError) throw allMatchesError;

        const dayMatches = (allMatches || []).filter((m: any) => {
            const dStr = new Date(m.match_date).toLocaleDateString('fr-CA', { timeZone: 'Africa/Lome' });
            return dStr === matchDateStr && m.id !== '00000000-0000-0000-0000-000000000000';
        });

        // Vérifier si au moins un match de la journée est terminé avec un score renseigné
        const isAnyMatchFinished = dayMatches.some((m: any) => m.status === 'FINISHED' && m.score_home !== null && m.score_away !== null);
        if (!isAnyMatchFinished) {
            return { success: false, error: "Au moins un match de la journée doit être terminé avec un score renseigné." };
        }

        // 2. Vérifier si un gagnant de type PREDICTION a déjà été tiré pour ce jour-là
        const { data: dayPredictionWinners, error: dpError } = await supabase
            .from('draw_winners')
            .select('*, matches(match_date)')
            .eq('draw_type', 'PREDICTION');

        if (dpError) throw dpError;

        const alreadyDrawnForThisDay = (dayPredictionWinners || []).some((w: any) => {
            if (!w.matches) return false;
            const wDateStr = new Date(w.matches.match_date).toLocaleDateString('fr-CA', { timeZone: 'Africa/Lome' });
            return wDateStr === matchDateStr;
        });

        if (alreadyDrawnForThisDay) {
            return { success: false, error: `Un tirage de pronostics a déjà été effectué pour la journée du ${matchDateStr.split('-').reverse().join('/')}.` };
        }

        // 3. Récupérer tous les candidats pronostics corrects pour la journée
        const resCandidates = await getDrawCandidates(matchId, 'PREDICTION');
        if (!resCandidates.success || !resCandidates.candidates || resCandidates.candidates.length === 0) {
            return { success: false, error: "Aucun participant n'a trouvé de score exact pour les matchs de cette journée." };
        }

        const candidates = resCandidates.candidates;

        // 4. Sélectionner un gagnant au hasard
        const randomIndex = Math.floor(Math.random() * candidates.length);
        const luckyDraw = candidates[randomIndex];

        // 5. Enregistrer le gagnant
        const { data: drawRecord, error: drawError } = await supabase
            .from('draw_winners')
            .insert({
                match_id: matchId,
                participant_id: luckyDraw.id,
                draw_type: 'PREDICTION',
                drawn_at: new Date().toISOString()
            })
            .select()
            .single();

        if (drawError) throw drawError;

        return {
            success: true,
            alreadyDrawn: false,
            winner: {
                firstName: luckyDraw.firstName,
                lastName: luckyDraw.lastName,
                phone: luckyDraw.phone,
                drawnAt: drawRecord.drawn_at
            }
        };
    } catch (e: any) {
        console.error("Admin Draw Prediction Error:", e);
        return { success: false, error: "Erreur lors du tirage au sort des pronostics." };
    }
}

// ─── Scraper de scores via Google / DuckDuckGo Search ─────────────────────────

function normalizeTeamName(name: string): string {
    if (!name) return "";
    let clean = name.toLowerCase().trim();
    if (clean.includes('south korea') || clean.includes('corée du sud') || clean.includes('korea republic')) return 'korea republic';
    if (clean.includes('czech republic') || clean.includes('république tchèque') || clean.includes('rep. tcheque') || clean.includes('czechia')) return 'czechia';
    if (clean.includes('democratic republic of the congo') || clean.includes('rd congo') || clean.includes('dr congo')) return 'dr congo';
    if (clean.includes('united states') || clean.includes('états unis') || clean.includes('etats unis') || clean.includes('usa')) return 'usa';
    if (clean.includes('turkey') || clean.includes('türkiye') || clean.includes('turquie')) return 'türkiye';
    if (clean.includes('bosnia')) return 'bosnia-herzegovina';
    if (clean.includes('ivory coast') || clean.includes('côte d\'ivoire')) return 'ivory coast';
    if (clean.includes('espagne') || clean.includes('spain') || clean.includes('españa')) return 'spain';
    if (clean.includes('belgique') || clean.includes('belgium')) return 'belgium';
    return clean.replace(/and/g, '&').replace(/-/g, ' ').replace(/\s+/g, ' ').replace(/republic/g, 'rep.');
}

function matchesAlign(apiHome: string, apiAway: string, dbHome: string, dbAway: string): boolean {
    const ah = normalizeTeamName(apiHome);
    const aa = normalizeTeamName(apiAway);
    const dh = normalizeTeamName(dbHome);
    const da = normalizeTeamName(dbAway);
    
    return (ah === dh && aa === da) || (ah === da && aa === dh);
}

export async function adminSyncScoresFromGoogle() {
    let updatedCount = 0;
    try {
        const res = await fetch('https://worldcup26.ir/get/games');
        if (!res.ok) {
            throw new Error(`Impossible de contacter la base de données des scores : Status ${res.status}`);
        }
        const data = await res.json();
        const apiGames: any[] = data.games || [];

        const { data: dbMatches, error: matchesError } = await supabase
            .from('matches')
            .select('*');

        if (matchesError) throw matchesError;

        for (const m of (dbMatches || [])) {
            if (m.id === '00000000-0000-0000-0000-000000000000') continue;
            
            const apiGame = apiGames.find(g => matchesAlign(g.home_team_name_en, g.away_team_name_en, m.team_home, m.team_away));
            
            if (apiGame) {
                const isFinished = apiGame.finished === 'TRUE';
                const isLive = apiGame.finished === 'FALSE' && apiGame.time_elapsed !== 'notstarted';

                if (isFinished) {
                    const homeScore = apiGame.home_score !== 'null' ? parseInt(apiGame.home_score) : null;
                    const awayScore = apiGame.away_score !== 'null' ? parseInt(apiGame.away_score) : null;

                    if (homeScore !== null && awayScore !== null) {
                        if (m.score_home !== homeScore || m.score_away !== awayScore || m.status !== 'FINISHED') {
                            const { error: updateError } = await supabase
                                .from('matches')
                                .update({
                                    score_home: homeScore,
                                    score_away: awayScore,
                                    status: 'FINISHED'
                                })
                                .eq('id', m.id);

                            if (!updateError) {
                                await advanceToKnockout(m.id);
                                updatedCount++;
                            }
                        }
                    }
                } else if (isLive) {
                    const homeScore = apiGame.home_score !== 'null' ? parseInt(apiGame.home_score) : null;
                    const awayScore = apiGame.away_score !== 'null' ? parseInt(apiGame.away_score) : null;

                    if (homeScore !== null && awayScore !== null) {
                        if (m.score_home !== homeScore || m.score_away !== awayScore || m.status !== 'LIVE') {
                            const { error: updateError } = await supabase
                                .from('matches')
                                .update({
                                    score_home: homeScore,
                                    score_away: awayScore,
                                    status: 'LIVE'
                                })
                                .eq('id', m.id);

                            if (!updateError) {
                                updatedCount++;
                            }
                        }
                    }
                } else {
                    // Match has not started (UPCOMING)
                    if (m.status !== 'UPCOMING' || m.score_home !== null || m.score_away !== null) {
                        const { error: updateError } = await supabase
                            .from('matches')
                            .update({
                                  score_home: null,
                                  score_away: null,
                                  status: 'UPCOMING'
                            })
                            .eq('id', m.id);
                        if (!updateError) {
                            updatedCount++;
                        }
                    }
                }
            }
        }

        return { success: true, message: `${updatedCount} match(s) synchronisé(s) avec succès !` };
    } catch (e: any) {
        console.error("Sync Scores Error:", e);
        return { success: false, error: "Erreur de synchronisation : " + e.message };
    } finally {
        // Toujours mettre à jour la date de dernière tentative de synchronisation
        try {
            await supabase
                .from('matches')
                .upsert({
                    id: '00000000-0000-0000-0000-000000000000',
                    team_home: 'SYSTEM',
                    team_away: 'METADATA',
                    match_date: new Date().toISOString(),
                    status: 'FINISHED'
                });
        } catch (dbErr) {
            console.error("Failed to update system metadata match date:", dbErr);
        }
    }
}

// Récupérer la liste des candidats éligibles pour un tirage au sort (présence aujourd'hui ou pronostics corrects)
export async function getDrawCandidates(matchId: string, type: 'PRESENCE' | 'PREDICTION') {
    try {
        const { data: match, error: matchError } = await supabase
            .from('matches')
            .select('*')
            .eq('id', matchId)
            .single();

        if (matchError || !match) {
            return { success: false, error: "Match introuvable." };
        }

        if (type === 'PRESENCE') {
            // Vérifier si le match a lieu entre 00h et 08h (Afrique/Lomé)
            const matchHour = parseInt(new Date(match.match_date).toLocaleTimeString('fr-FR', { timeZone: 'Africa/Lome', hour: '2-digit', hour12: false }));
            if (matchHour >= 0 && matchHour < 8) {
                return { success: false, error: "Les matchs programmés entre 00h et 08h ne gèrent pas de tirage de présence." };
            }

            const matchDateStr = new Date(match.match_date).toLocaleDateString('fr-CA', { timeZone: 'Africa/Lome' });
            const { data: attendances, error: attError } = await supabase
                .from('attendances')
                .select('*, participants(id, first_name, last_name, phone)')
                .eq('date', matchDateStr);

            if (attError) throw attError;

            if (!attendances || attendances.length === 0) {
                return { success: true, candidates: [] };
            }

            const uniqueParticipants = Array.from(new Set(attendances.map(a => a.participants?.id)))
                .map(id => attendances.find(a => a.participants?.id === id)?.participants)
                .filter(Boolean)
                .map((p: any) => ({
                    id: p.id,
                    firstName: p.first_name,
                    lastName: p.last_name,
                    phone: p.phone
                }));

            return { success: true, candidates: uniqueParticipants };
        } else {
            const matchDateStr = new Date(match.match_date).toLocaleDateString('fr-CA', { timeZone: 'Africa/Lome' });
            
            // Récupérer tous les matchs de cette journée
            const { data: allMatches, error: matchesError } = await supabase
                .from('matches')
                .select('*');
            
            if (matchesError) throw matchesError;

            const dayMatches = (allMatches || []).filter((m: any) => {
                const dStr = new Date(m.match_date).toLocaleDateString('fr-CA', { timeZone: 'Africa/Lome' });
                return dStr === matchDateStr && m.status === 'FINISHED' && m.score_home !== null && m.score_away !== null;
            });

            let allCandidates: any[] = [];
            for (const dm of dayMatches) {
                const { data: correctPredictions } = await supabase
                    .from('predictions')
                    .select('*, participants(id, first_name, last_name, phone)')
                    .eq('match_id', dm.id)
                    .eq('pred_score_home', dm.score_home)
                    .eq('pred_score_away', dm.score_away);
                
                if (correctPredictions) {
                    correctPredictions.forEach((p: any) => {
                        if (p.participants) {
                            allCandidates.push({
                                id: p.participants.id,
                                firstName: p.participants.first_name,
                                lastName: p.participants.last_name,
                                phone: p.participants.phone
                            });
                        }
                    });
                }
            }

            // Unicité des candidats par ID de participant
            const uniqueCandidates = Array.from(new Set(allCandidates.map(c => c.id)))
                .map(id => allCandidates.find(c => c.id === id))
                .filter(Boolean);

            return { success: true, candidates: uniqueCandidates };
        }
    } catch (e: any) {
        console.error("Get Draw Candidates Error:", e);
        return { success: false, error: "Erreur lors de la récupération des candidats." };
    }
}

// Action de réinitialisation générale (tirages, inscriptions, pronostics, badges, présences)
export async function adminResetDrawsAndParticipants() {
    try {
        // 1. Suppression des gagnants des tirages
        await supabase.from('draw_winners').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        // 2. Suppression des présences enregistrées
        await supabase.from('attendances').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        // 3. Suppression des pronostics (predictions)
        await supabase.from('predictions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        // 4. Suppression des badges
        await supabase.from('badges').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        // 5. Suppression des participants (inscriptions)
        await supabase.from('participants').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        return { success: true };
    } catch (e: any) {
        console.error("Admin Reset Database Error:", e);
        return { success: false, error: "Erreur lors de la réinitialisation de la base : " + e.message };
    }
}

// Vérifier si le participant est présent aujourd'hui
export async function checkTodayPresence(participantId: string) {
    const today = new Date().toISOString().split('T')[0];
    try {
        const { data, error } = await supabase
            .from('attendances')
            .select('id')
            .eq('participant_id', participantId)
            .eq('date', today)
            .maybeSingle();
        return { success: true, isPresent: !!data };
    } catch (e) {
        console.error("checkTodayPresence error:", e);
        return { success: false, isPresent: false };
    }
}

// Valider la présence avec le code agent (escen / ecen)
export async function validatePresenceWithCode(participantId: string, agentCode: string) {
    const code = agentCode.trim();
    if (code !== 'escen' && code !== 'ecen') {
        return { success: false, error: "Code agent invalide." };
    }
    const today = new Date().toISOString().split('T')[0];
    try {
        const { data: existing } = await supabase
            .from('attendances')
            .select('id')
            .eq('participant_id', participantId)
            .eq('date', today)
            .maybeSingle();

        if (existing) {
            return { success: true, isPresent: true, message: "Présence déjà validée aujourd'hui." };
        }

        const { error } = await supabase
            .from('attendances')
            .insert({
                participant_id: participantId,
                date: today,
                status: 'VALIDE'
            });

        if (error) throw error;
        return { success: true, isPresent: true, message: "Votre présence a été validée avec succès !" };
    } catch (e) {
        console.error("validatePresenceWithCode error:", e);
        return { success: false, error: "Erreur technique lors de la validation." };
    }
}
