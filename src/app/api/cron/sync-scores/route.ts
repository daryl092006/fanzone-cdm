import { NextResponse } from 'next/server';
import { adminSyncScoresFromGoogle } from '@/app/actions/predictions';

export async function GET() {
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
