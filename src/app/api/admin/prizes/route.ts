import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAdminToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('gbs-admin-token')?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('prizes')
    .select('*')
    .eq('is_deleted', false)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

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
    
    // Validation
    if (body.probability < 0) {
      return NextResponse.json({ error: 'Olasılık negatif olamaz.' }, { status: 400 });
    }
    if (body.stock < 0) {
      return NextResponse.json({ error: 'Stok negatif olamaz.' }, { status: 400 });
    }

    // Must attach to campaign_id from body or fallback to active campaign
    let targetCampaignId = body.campaign_id;

    if (!targetCampaignId) {
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('id')
        .eq('active', true)
        .limit(1)
        .single();

      if (!campaign) {
        return NextResponse.json({ error: 'Aktif kampanya yok. Lütfen bir kampanya seçin veya oluşturun.' }, { status: 400 });
      }
      targetCampaignId = campaign.id;
    }

    const { data, error } = await supabase
      .from('prizes')
      .insert({
        campaign_id: targetCampaignId,
        title: body.title,
        probability: body.probability,
        stock: body.stock,
        is_active: body.is_active ?? true,
        display_order: body.display_order ?? 0,
        bg_color: body.bg_color || '#FFFFFF',
        text_color: body.text_color || '#000000',
        icon: body.icon || null,
        image_url: body.image_url || null
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
