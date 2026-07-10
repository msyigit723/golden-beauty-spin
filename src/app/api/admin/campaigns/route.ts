import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAdminToken } from '@/lib/jwt';
import { logAdminAction } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('gbs-admin-token')?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('gbs-admin-token')?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        title: body.title,
        description: body.description || null,
        probability: body.probability || 0,
        display_order: body.display_order || 0,
        active: body.active ?? true,
        start_date: body.start_date || null,
        end_date: body.end_date || null,
        banner_image_url: body.banner_image_url || null,
        terms_and_conditions: body.terms_and_conditions || null
      })
      .select()
      .single();

    if (error) throw error;

    await logAdminAction({
      req: request,
      adminUsername: 'admin', // in a real app, parse this from token payload
      actionType: 'CREATE_CAMPAIGN',
      targetId: data.id,
      details: { title: data.title }
    });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
