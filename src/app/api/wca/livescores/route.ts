import { NextResponse } from 'next/server';
import { getNextEvents, getLastEvents } from '@/lib/worldcup-api';

export async function GET() {
  try {
    // Récupérer les matchs en cours (derniers + prochains, filtrer les live)
    const [next, last] = await Promise.all([
      getNextEvents(),
      getLastEvents(),
    ]);

    // Matchs live = ceux dont le statut n'est pas NS ou Finished
    const live = [...last, ...next].filter(e => {
      const s = (e.strStatus ?? '').toUpperCase();
      return ['1H','HT','2H','ET','PEN'].includes(s);
    });

    return NextResponse.json({ success: true, data: live }, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' }
    });
  } catch (err) {
    console.error('[/api/wca/livescores]', err);
    return NextResponse.json({ success: false, data: [], error: String(err) }, { status: 200 }); // 200 avec tableau vide plutôt que 500
  }
}
