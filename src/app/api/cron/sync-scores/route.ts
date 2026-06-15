import { NextResponse } from 'next/server';
import { adminSyncScoresFromGoogle } from '@/app/actions/predictions';

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  // Si CRON_SECRET n'est pas défini, la route est libre d'accès
  if (cronSecret) {
    // Strip le préfixe "Bearer " s'il est inclus dans CRON_SECRET par erreur
    const expectedToken = cronSecret.replace(/^Bearer\s+/i, '').trim();

    const { searchParams } = new URL(request.url);
    const tokenFromUrl = searchParams.get('token');
    const authHeader = request.headers.get('authorization') ?? '';
    // Extraire le token du header Authorization (enlever "Bearer ")
    const headerToken = authHeader.replace(/^Bearer\s+/i, '').trim();

    const validByUrl = tokenFromUrl?.trim() === expectedToken;
    const validByHeader = headerToken === expectedToken;

    if (!validByUrl && !validByHeader) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  try {
    const result = await adminSyncScoresFromGoogle();
    if (result.success) {
      return NextResponse.json({ success: true, message: result.message });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
