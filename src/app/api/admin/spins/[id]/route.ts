import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAdminToken } from '@/lib/jwt';
import { logAdminAction } from '@/lib/audit';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get('gbs-admin-token')?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('spins')
      .update({
        is_delivered: body.is_delivered,
        delivery_note: body.delivery_note
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    await logAdminAction({
      req: request,
      adminUsername: 'admin',
      actionType: 'UPDATE_DELIVERY',
      targetId: params.id,
      details: { is_delivered: body.is_delivered }
    });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
