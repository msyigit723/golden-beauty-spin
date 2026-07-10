import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAdminToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('gbs-admin-token')?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  try {
    // Total Users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Total Spins
    const { count: totalSpins } = await supabase
      .from('spins')
      .select('*', { count: 'exact', head: true });

    // Active Campaign & Stock
    const now = new Date().toISOString();
    const { data: activeCampaign } = await supabase
      .from('campaigns')
      .select('id, title')
      .eq('active', true)
      .eq('is_deleted', false)
      .or(`end_date.is.null,end_date.gt.${now}`)
      .limit(1)
      .single();

    let remainingStock = 0;
    if (activeCampaign) {
      const { data: activePrizes } = await supabase
        .from('prizes')
        .select('stock')
        .eq('campaign_id', activeCampaign.id)
        .eq('is_deleted', false);
      
      remainingStock = activePrizes?.reduce((acc, prize) => acc + prize.stock, 0) || 0;
    }

    // Prize Distribution (Group by Prize)
    // To do this simply, we fetch all spins with prizes relation. 
    // In a massive DB we would use RPC or raw SQL, but Supabase standard client requires fetching or RPC.
    // Let's do a simple count grouping.
    const { data: spinsData } = await supabase
      .from('spins')
      .select('prize_id, prizes(title)');
    
    const distribution: Record<string, number> = {};
    if (spinsData) {
      spinsData.forEach(spin => {
        const title = (spin.prizes as any)?.title || 'Bilinmeyen Ödül';
        distribution[title] = (distribution[title] || 0) + 1;
      });
    }

    const prizeDistribution = Object.keys(distribution).map(title => ({
      title,
      count: distribution[title]
    })).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalSpins: totalSpins || 0,
      remainingStock,
      activeCampaign: activeCampaign?.title || 'Aktif Kampanya Yok',
      prizeDistribution
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
