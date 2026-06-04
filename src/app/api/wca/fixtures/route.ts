import { NextRequest, NextResponse } from 'next/server';
import { getFixtures } from '@/lib/worldcup-api';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const date    = searchParams.get('date')    ?? undefined;
  const group   = searchParams.get('group')   ?? undefined;
  
  const teamIdParam = searchParams.get('team_id');
  const team_id = teamIdParam ? Number(teamIdParam) : undefined;
  
  const pageParam = searchParams.get('page');
  const page    = pageParam ? Number(pageParam) : undefined;

  try {
    const data = await getFixtures({ date, group, team_id, page });
    return NextResponse.json({ success: true, data }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
// Trigger rebuild: update 1

