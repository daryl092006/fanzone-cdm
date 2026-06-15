import { NextResponse } from 'next/server';
import { adminSyncScoresFromGoogle } from '@/app/actions/predictions';

export async function GET(request: Request) {
  // Optionnel : Sécurité pour vérifier que la requête vient bien de Vercel Cron
  // En production, Vercel injecte CRON_SECRET dans les variables d'environnement.
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
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
