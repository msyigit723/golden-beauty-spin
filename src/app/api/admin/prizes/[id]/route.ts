import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAdminToken } from '@/lib/jwt';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get('gbs-admin-token')?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    if (body.probability !== undefined && body.probability < 0) {
      return NextResponse.json({ error: 'Olasılık negatif olamaz.' }, { status: 400 });
    }
    if (body.stock !== undefined && body.stock < 0) {
      return NextResponse.json({ error: 'Stok negatif olamaz.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('prizes')
      .update({
        campaign_id: body.campaign_id !== undefined ? body.campaign_id : undefined,
        title: body.title,
        probability: body.probability,
        stock: body.stock,
        is_active: body.is_active,
        display_order: body.display_order,
        bg_color: body.bg_color,
        text_color: body.text_color,
        icon: body.icon,
        image_url: body.image_url
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get('gbs-admin-token')?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  try {
    // Soft Delete
    const { error } = await supabase
      .from('prizes')
      .update({ is_deleted: true })
      .eq('id', params.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
