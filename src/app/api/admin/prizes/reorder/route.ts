import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAdminToken } from '@/lib/jwt';

export async function PUT(request: NextRequest) {
  const token = request.cookies.get('gbs-admin-token')?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    if (!Array.isArray(body.prizes)) {
      return NextResponse.json({ error: 'Geçersiz veri formatı.' }, { status: 400 });
    }

    // Bulk update approach using multiple queries (Supabase doesn't support bulk upsert easily without conflict resolution matching exactly, or RPC).
    // Given the small number of prizes per campaign, mapping and awaiting is perfectly fine.
    
    for (const item of body.prizes) {
      if (item.id && typeof item.display_order === 'number') {
        await supabase
          .from('prizes')
          .update({ display_order: item.display_order })
          .eq('id', item.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
