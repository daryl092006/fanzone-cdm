const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://ntvvlkosaakgpkrrjzxq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50dnZsa29zYWFrZ3BrcnJqenhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTA2OTgsImV4cCI6MjA5NTk2NjY5OH0.57ux7WKKgx9pN5h3LPLXlPrFvzVGH7om8C28fplPiwI';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Normalisation des noms d'équipes ─────────────────────────────────────────
function normalizeTeamName(name) {
    if (!name) return '';
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

function matchesAlign(apiHome, apiAway, dbHome, dbAway) {
    const ah = normalizeTeamName(apiHome);
    const aa = normalizeTeamName(apiAway);
    const dh = normalizeTeamName(dbHome);
    const da = normalizeTeamName(dbAway);
    return (ah === dh && aa === da) || (ah === da && aa === dh);
}

// ─── Matchs éliminatoires connus depuis l'API ─────────────────────────────────
// QF résultats (terminés)
const QF_RESULTS = [
    { home: 'Argentina',  away: 'Switzerland', scoreHome: 3, scoreAway: 1, date: '2026-07-11T20:00:00Z' },
    { home: 'France',     away: 'Morocco',     scoreHome: 2, scoreAway: 0, date: '2026-07-09T16:00:00Z' },
    { home: 'Spain',      away: 'Belgium',     scoreHome: 2, scoreAway: 1, date: '2026-07-10T12:00:00Z' },
    { home: 'Norway',     away: 'England',     scoreHome: 1, scoreAway: 2, date: '2026-07-11T17:00:00Z' },
];
// SF résultats (terminés) — l'API dit France 0 - Spain 2 et England 1 - Argentina 2
const SF_RESULTS = [
    { home: 'France',   away: 'Spain',      scoreHome: 0, scoreAway: 2, date: '2026-07-14T14:00:00Z' },
    { home: 'England',  away: 'Argentina',  scoreHome: 1, scoreAway: 2, date: '2026-07-15T15:00:00Z' },
];
// Troisième place (pas encore terminé selon l'API)
const THIRD = { home: 'France', away: 'England', scoreHome: 0, scoreAway: 0, status: 'LIVE', date: '2026-07-18T17:00:00Z' };
// Finale (pas encore terminée selon l'API)
const FINAL = { home: 'Spain', away: 'Argentina', status: 'UPCOMING', date: '2026-07-19T15:00:00Z' };

// Placeholder DB → correspondance bracket
const PLACEHOLDER_PATTERNS = [
    // Quarts (si encore en placeholder)
    { pattern: /vainqueur.*argent.*egypt|vainqueur.*suisse.*colomb/i, result: QF_RESULTS[0] },
    { pattern: /vainqueur.*france.*maroc|vainqueur.*france.*morocco/i, result: QF_RESULTS[1] },
    { pattern: /vainqueur.*espagne.*belg|vainqueur.*spain.*belg/i, result: QF_RESULTS[2] },
    { pattern: /vainqueur.*norv.*angl|vainqueur.*norway.*engl/i, result: QF_RESULTS[3] },
    // Demi-finales
    { pattern: /vainqueur.*france.*maroc.*espagne.*belg|sf1.*sf2.*qf/i, result: SF_RESULTS[0] },
    { pattern: /vainqueur.*norv.*angl.*qf4/i, result: SF_RESULTS[1] },
    // Troisième
    { pattern: /perdant.*sf1.*perdant.*sf2|perdant.*sf/i, result: THIRD, type: 'third' },
    // Finale
    { pattern: /vainqueur.*sf1.*vainqueur.*sf2|vainqueur sf/i, result: FINAL, type: 'final' },
];

async function run() {
    console.log('=== FIX KNOCKOUTS FULL ===\n');

    // 1. Charger tous les matchs DB
    const { data: dbMatches, error: dbErr } = await supabase.from('matches').select('*').order('match_date', { ascending: true });
    if (dbErr) { console.error('Erreur Supabase:', dbErr); return; }

    // 2. Charger les matchs API
    let apiGames = [];
    try {
        const res = await fetch('https://worldcup26.ir/get/games');
        const data = await res.json();
        apiGames = data.games || [];
        console.log(`✅ API: ${apiGames.length} matchs chargés`);
    } catch (e) {
        console.error('❌ Impossible de joindre l\'API:', e.message);
    }

    let fixedCount = 0;

    for (const m of (dbMatches || [])) {
        if (m.id === '00000000-0000-0000-0000-000000000000') continue;

        const homeLC = (m.team_home || '').toLowerCase();
        const awayLC = (m.team_away || '').toLowerCase();
        const isPlaceholder = homeLC.startsWith('vainqueur') || homeLC.startsWith('perdant') || homeLC.startsWith('winner') ||
                              awayLC.startsWith('vainqueur') || awayLC.startsWith('perdant');

        // ── CAS 1 : Match avec vrai nom → synchro via API ─────────────────────
        if (!isPlaceholder && apiGames.length > 0) {
            const apiGame = apiGames.find(g => matchesAlign(g.home_team_name_en, g.away_team_name_en, m.team_home, m.team_away));
            if (apiGame) {
                const isFinished = apiGame.finished === 'TRUE';
                const isLive = apiGame.finished === 'FALSE' && apiGame.time_elapsed !== 'notstarted' && apiGame.time_elapsed !== null;

                if (isFinished) {
                    const hs = apiGame.home_score !== 'null' ? parseInt(apiGame.home_score) : null;
                    const as_ = apiGame.away_score !== 'null' ? parseInt(apiGame.away_score) : null;
                    if (hs !== null && as_ !== null) {
                        if (m.score_home !== hs || m.score_away !== as_ || m.status !== 'FINISHED') {
                            const { error } = await supabase.from('matches').update({ score_home: hs, score_away: as_, status: 'FINISHED' }).eq('id', m.id);
                            if (!error) {
                                console.log(`✅ FINISHED: ${m.team_home} vs ${m.team_away} → ${hs}-${as_}`);
                                fixedCount++;
                            } else {
                                console.error(`❌ Erreur update ${m.team_home} vs ${m.team_away}:`, error.message);
                            }
                        }
                    }
                } else if (isLive) {
                    const hs = apiGame.home_score !== 'null' ? parseInt(apiGame.home_score) : null;
                    const as_ = apiGame.away_score !== 'null' ? parseInt(apiGame.away_score) : null;
                    if (hs !== null && as_ !== null && (m.score_home !== hs || m.score_away !== as_ || m.status !== 'LIVE')) {
                        const { error } = await supabase.from('matches').update({ score_home: hs, score_away: as_, status: 'LIVE' }).eq('id', m.id);
                        if (!error) {
                            console.log(`🔴 LIVE: ${m.team_home} vs ${m.team_away} → ${hs}-${as_}`);
                            fixedCount++;
                        }
                    }
                }
            }
        }

        // ── CAS 2 : Match placeholder → correspondance par bracket ────────────
        if (isPlaceholder) {
            const fullName = `${m.team_home} vs ${m.team_away}`.toLowerCase();
            let matched = null;

            for (const rule of PLACEHOLDER_PATTERNS) {
                const testStr = fullName.replace(/\s+/g, ' ');
                if (rule.pattern.test(testStr)) {
                    matched = rule;
                    break;
                }
            }

            if (!matched) {
                // Essai par correspondance explicite sur les noms connus
                if (/argent.*suiss|suiss.*argent/i.test(fullName)) matched = { result: QF_RESULTS[0] };
                else if (/france.*maroc|maroc.*france/i.test(fullName)) matched = { result: QF_RESULTS[1] };
                else if (/spain.*belg|belg.*spain|espagne.*belg/i.test(fullName)) matched = { result: QF_RESULTS[2] };
                else if (/norv.*angl|angl.*norv/i.test(fullName)) matched = { result: QF_RESULTS[3] };
                else if (/france.*spain|spain.*france|espagne.*france/i.test(fullName)) matched = { result: SF_RESULTS[0] };
                else if (/england.*argent|argent.*england/i.test(fullName)) matched = { result: SF_RESULTS[1] };
            }

            if (matched) {
                const r = matched.result;
                const isThirdOrFinal = matched.type === 'third' || matched.type === 'final';
                
                if (r.scoreHome !== undefined) {
                    // Résultat connu → FINISHED
                    const { error } = await supabase.from('matches').update({
                        team_home: r.home,
                        team_away: r.away,
                        score_home: r.scoreHome,
                        score_away: r.scoreAway,
                        status: 'FINISHED',
                        match_date: r.date
                    }).eq('id', m.id);
                    if (!error) {
                        console.log(`✅ PLACEHOLDER→FINISHED: "${m.team_home} vs ${m.team_away}" → ${r.home} vs ${r.away} (${r.scoreHome}-${r.scoreAway})`);
                        fixedCount++;
                    } else {
                        console.error(`❌ Erreur placeholder ${m.id}:`, error.message);
                    }
                } else {
                    // Match pas encore terminé → mise à jour des noms seulement
                    const updateData = { team_home: r.home, team_away: r.away, status: r.status || 'UPCOMING', match_date: r.date };
                    const { error } = await supabase.from('matches').update(updateData).eq('id', m.id);
                    if (!error) {
                        console.log(`📅 PLACEHOLDER→${r.status || 'UPCOMING'}: "${m.team_home} vs ${m.team_away}" → ${r.home} vs ${r.away}`);
                        fixedCount++;
                    } else {
                        console.error(`❌ Erreur placeholder ${m.id}:`, error.message);
                    }
                }
            } else {
                console.log(`⚠️  Placeholder non reconnu: "${m.team_home} vs ${m.team_away}"`);
            }
        }
    }

    console.log(`\n=== RÉSULTAT: ${fixedCount} match(s) corrigé(s) ===`);

    // 3. Vérification finale : afficher l'état KO
    console.log('\n=== ÉTAT FINAL DES ÉLIMINATOIRES ===');
    const { data: finalMatches } = await supabase.from('matches').select('*').order('match_date', { ascending: true });
    const koMatches = (finalMatches || []).slice(72).filter(m => m.id !== '00000000-0000-0000-0000-000000000000');
    koMatches.forEach((m, i) => {
        const score = (m.score_home !== null && m.score_away !== null) ? `${m.score_home}-${m.score_away}` : 'TBD';
        console.log(`${i + 1}. [${m.status}] ${m.team_home} vs ${m.team_away} | ${score} | ${m.match_date?.substring(0, 16)}`);
    });
}

run().catch(console.error);
