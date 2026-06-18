import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ type: string }> }
) {
    const { type } = await params;

    try {
        let csv = '';
        let filename = '';

        if (type === 'participants') {
            const { data, error } = await supabase
                .from('participants')
                .select(`
                    id, first_name, last_name, phone, profession, created_at,
                    badges (badge_code, status)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const BOM = '\uFEFF';
            const headers = ['Prénom', 'Nom', 'Téléphone', 'Profession', 'N° Badge', 'Statut Badge', "Date d'inscription"];
            const rows = (data ?? []).map((p: any) => [
                p.first_name,
                p.last_name,
                p.phone,
                p.profession,
                p.badges?.badge_code ?? '',
                p.badges?.status ?? '',
                new Date(p.created_at).toLocaleDateString('fr-FR'),
            ]);
            csv = BOM + [headers, ...rows].map(r => r.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
            filename = `fanzone-participants-${new Date().toISOString().slice(0, 10)}.csv`;

        } else if (type === 'presences') {
            const dateFilter = request.nextUrl.searchParams.get('date');
            let query = supabase
                .from('attendances')
                .select(`id, date, scan_time, status, participants(first_name, last_name, badges(badge_code))`)
                .order('scan_time', { ascending: false });

            if (dateFilter) {
                query = query.eq('date', dateFilter);
            }

            const { data, error } = await query;

            if (error) throw error;

            const BOM = '\uFEFF';
            const headers = ['Prénom', 'Nom', 'N° Badge', 'Date', 'Heure de scan', 'Statut'];
            const rows = (data ?? []).map((a: any) => [
                a.participants?.first_name ?? '',
                a.participants?.last_name ?? '',
                a.participants?.badges?.badge_code ?? '',
                a.date,
                new Date(a.scan_time).toLocaleTimeString('fr-FR'),
                a.status,
            ]);
            csv = BOM + [headers, ...rows].map(r => r.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
            filename = dateFilter 
                ? `fanzone-presences-${dateFilter}-${new Date().toISOString().slice(0, 10)}.csv`
                : `fanzone-presences-${new Date().toISOString().slice(0, 10)}.csv`;

        } else if (type === 'badges') {
            const { data, error } = await supabase
                .from('badges')
                .select(`badge_code, status, print_batch, assigned_at, participants(first_name, last_name)`)
                .order('badge_code', { ascending: true });

            if (error) throw error;

            const BOM = '\uFEFF';
            const headers = ['Code Badge', 'Statut', 'Lot', 'Attribué le', 'Titulaire'];
            const rows = (data ?? []).map((b: any) => [
                b.badge_code,
                b.status,
                b.print_batch ?? '',
                b.assigned_at ? new Date(b.assigned_at).toLocaleDateString('fr-FR') : '',
                b.participants ? `${b.participants.first_name} ${b.participants.last_name}` : '',
            ]);
            csv = BOM + [headers, ...rows].map(r => r.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
            filename = `fanzone-badges-${new Date().toISOString().slice(0, 10)}.csv`;

        } else if (type === 'rapport') {
            const today = new Date().toISOString().split('T')[0];

            const [
                { count: totalParticipants },
                { count: totalAttendances },
                { count: todayAttendances },
                { count: totalBadges },
                { count: badgesLibres },
            ] = await Promise.all([
                supabase.from('participants').select('*', { count: 'exact', head: true }),
                supabase.from('attendances').select('*', { count: 'exact', head: true }),
                supabase.from('attendances').select('*', { count: 'exact', head: true }).eq('date', today),
                supabase.from('badges').select('*', { count: 'exact', head: true }),
                supabase.from('badges').select('*', { count: 'exact', head: true }).eq('status', 'LIBRE'),
            ]);

            const BOM = '\uFEFF';
            const headers = ['Indicateur', 'Valeur'];
            const rows = [
                ['Date du rapport', new Date().toLocaleDateString('fr-FR')],
                ['Total inscrits', totalParticipants ?? 0],
                ['Total présences cumulées', totalAttendances ?? 0],
                [`Présences aujourd'hui (${today})`, todayAttendances ?? 0],
                ['Total badges dans le pool', totalBadges ?? 0],
                ['Badges encore libres', badgesLibres ?? 0],
                ['Taux de conversion', totalParticipants ? `${((totalAttendances ?? 0) / (totalParticipants ?? 1) * 100).toFixed(1)}%` : '0%'],
            ];
            csv = BOM + [headers, ...rows].map(r => r.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
            filename = `fanzone-rapport-${today}.csv`;

        } else if (type === 'rapports-journaliers') {
            const [
                { data: participants, error: pError },
                { data: attendances, error: aError }
            ] = await Promise.all([
                supabase.from('participants').select('id, created_at'),
                supabase.from('attendances').select('participant_id, date, status')
            ]);

            if (pError) throw pError;
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

            const BOM = '\uFEFF';
            const headers = ['Date', 'Inscriptions', 'Présents Uniques', 'Scans Totaux'];
            const rows = reports.map(r => [
                r.date,
                r.registrations,
                r.uniquePresent,
                r.totalScans
            ]);

            csv = BOM + [headers, ...rows].map(r => r.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
            filename = `fanzone-rapports-journaliers-${new Date().toISOString().slice(0, 10)}.csv`;

        } else {
            return NextResponse.json({ error: 'Type d\'export inconnu.' }, { status: 400 });
        }

        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });

    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Erreur lors de l\'export.' }, { status: 500 });
    }
}
