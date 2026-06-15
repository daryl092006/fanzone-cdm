'use server';

import { supabase } from '@/lib/supabase';

async function generateUniqueOnlineBadgeCode(): Promise<string> {
    let attempts = 0;
    while (attempts < 10) {
        const rand = Math.floor(100000 + Math.random() * 900000); // 6 chiffres
        const code = `FZ26-ONL-${rand}`;
        const { data } = await supabase
            .from('badges')
            .select('id')
            .eq('badge_code', code)
            .maybeSingle();
        if (!data) {
            return code;
        }
        attempts++;
    }
    throw new Error("Impossible de générer un code de badge unique.");
}

export async function registerParticipant(formData: FormData) {
    // 1. Récupération des données
    const registrationMode = (formData.get('registrationMode') as string) || 'online';
    const firstName = (formData.get('firstName') as string)?.trim();
    const lastName = (formData.get('lastName') as string)?.trim();
    const phone = (formData.get('phone') as string)?.trim();
    const hasEmail = formData.get('hasEmail') === 'oui';
    const email = (formData.get('email') as string)?.trim() || null;
    const professionRaw = (formData.get('profession') as string)?.trim();
    const otherProfession = (formData.get('otherProfession') as string)?.trim() || null;
    const ageRange = (formData.get('ageRange') as string | null);
    const badgeCode = (formData.get('badgeCode') as string)?.trim().toUpperCase();

    // 2. Validation de base
    if (!firstName || firstName.length < 2)
        return { error: 'Le prénom est requis (minimum 2 caractères).' };
    if (!lastName || lastName.length < 2)
        return { error: 'Le nom de famille est requis (minimum 2 caractères).' };
    if (!phone)
        return { error: 'Le numéro de téléphone est requis.' };

    const phoneDigits = phone.replace(/[\s\-\+]/g, '');
    if (!/^\d{8,15}$/.test(phoneDigits))
        return { error: 'Numéro de téléphone invalide.' };

    if (!professionRaw)
        return { error: 'Veuillez sélectionner votre profession ou statut.' };

    if (hasEmail && (!email || !email.includes('@')))
        return { error: 'Veuillez saisir une adresse email valide.' };

    const profession = professionRaw === 'Autre' && otherProfession ? otherProfession : professionRaw;

    try {
        let badgeId = '';
        let finalBadgeCode = badgeCode;

        if (registrationMode === 'online') {
            finalBadgeCode = await generateUniqueOnlineBadgeCode();
            const { data: newBadge, error: newBadgeError } = await supabase
                .from('badges')
                .insert({
                    badge_code: finalBadgeCode,
                    status: 'ASSIGNE',
                    print_batch: 'ONLINE',
                    assigned_at: new Date().toISOString()
                })
                .select('id')
                .single();

            if (newBadgeError || !newBadge) {
                console.error("Erreur création badge online:", newBadgeError);
                return { error: "Impossible de créer le badge numérique." };
            }
            badgeId = newBadge.id;
        } else {
            if (!badgeCode)
                return { error: 'Veuillez saisir le code du badge physique remis au participant.' };

            // 3. Vérifier que le badge existe et est LIBRE
            const { data: badge, error: badgeError } = await supabase
                .from('badges')
                .select('id, status')
                .eq('badge_code', badgeCode)
                .single();

            if (badgeError || !badge)
                return { error: `Badge "${badgeCode}" introuvable. Vérifiez le code imprimé sur le badge.` };

            if (badge.status === 'ASSIGNE')
                return { error: `Badge "${badgeCode}" est déjà attribué à quelqu'un.` };

            if (badge.status === 'INACTIF')
                return { error: `Badge "${badgeCode}" est désactivé. Prenez un autre badge.` };

            badgeId = badge.id;
        }

        // 4. Créer le participant
        const { data: participant, error: participantError } = await supabase
            .from('participants')
            .insert({
                badge_id: badgeId,
                first_name: firstName,
                last_name: lastName,
                phone: phoneDigits,
                has_email: hasEmail,
                email: hasEmail ? email : null,
                profession,
                other_profession: professionRaw === 'Autre' ? otherProfession : null,
                age_range: ageRange,
            })
            .select()
            .single();

        if (participantError) {
            console.error("Erreur inscription:", participantError);
            // Si on a créé un badge online inutile, on pourrait le nettoyer, mais ce n'est pas critique
            if (participantError.code === '23505') {
                return { error: 'Ce numéro de téléphone est déjà inscrit.' };
            }
            return { error: "Une erreur est survenue lors de l'inscription." };
        }

        // 5. Si c'est un badge physique, le marquer comme ASSIGNE
        if (registrationMode !== 'online') {
            await supabase
                .from('badges')
                .update({ status: 'ASSIGNE', assigned_at: new Date().toISOString() })
                .eq('id', badgeId);
        }

        return { 
            success: true, 
            participantId: participant.id, 
            badgeCode: finalBadgeCode,
            participant: {
                id: participant.id,
                firstName: participant.first_name,
                lastName: participant.last_name,
                phone: participant.phone
            }
        };

    } catch (error) {
        console.error("Erreur d'inscription:", error);
        return { error: "Une erreur est survenue. Veuillez réessayer." };
    }
}
