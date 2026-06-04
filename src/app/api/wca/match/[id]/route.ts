import { NextRequest, NextResponse } from 'next/server';
import { getMatchEvents, getMatchStatistics, getLineups } from '@/lib/worldcup-api';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const matchId = Number(id);

  if (isNaN(matchId)) {
    return NextResponse.json(
      { success: false, error: 'ID de match invalide' },
      { status: 400 }
    );
  }

  const { searchParams } = req.nextUrl;
  const section = searchParams.get('section') ?? 'all'; // events | statistics | lineups | all

  try {
    const [events, statistics, lineups] = await Promise.allSettled([
      section === 'all' || section === 'events'     ? getMatchEvents(matchId)     : Promise.resolve(null),
      section === 'all' || section === 'statistics' ? getMatchStatistics(matchId) : Promise.resolve(null),
      section === 'all' || section === 'lineups'    ? getLineups(matchId)        : Promise.resolve(null),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        events:     events.status     === 'fulfilled' ? events.value     : null,
        statistics: statistics.status === 'fulfilled' ? statistics.value : null,
        lineups:    lineups.status    === 'fulfilled' ? lineups.value    : null,
      }
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=10' }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
