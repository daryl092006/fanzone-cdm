import { NextRequest, NextResponse } from 'next/server';
import { getStandings, getLiveStandings } from '@/lib/worldcup-api';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const group = searchParams.get('group') ?? 'A';
  const live  = searchParams.get('live') === 'true';

  try {
    const data = live
      ? await getLiveStandings(group)
      : await getStandings(group);

    return NextResponse.json({ success: true, data }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
