import { NextResponse } from 'next/server';
import { getGoalscorers } from '@/lib/worldcup-api';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const data = await getGoalscorers();
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
