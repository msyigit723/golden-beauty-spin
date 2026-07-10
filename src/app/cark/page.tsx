import * as React from 'react';
import { SpinWheel } from '@/components/wheel/SpinWheel';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifyUserToken } from '@/lib/jwt';
import { SEGMENT_COLORS } from '@/types/campaign';

export interface CampaignSegment {
  id: string;
  title: string;
  color: string;
  textColor: string;
  icon?: string;
  imageUrl?: string;
}

export default async function SpinWheelPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('gbs-token')?.value;
  
  let hasSpun = false;
  let userId = null;

  if (token) {
    const payload = verifyUserToken(token);
    if (payload) {
      userId = payload.userId;
      
      const { data: existingSpin } = await supabase
        .from('spins')
        .select('id')
        .eq('user_id', userId)
        .single();
        
      if (existingSpin) {
        hasSpun = true;
      }
    }
  }

  const now = new Date().toISOString();

  // Fetch active campaign enforcing temporal expiration
  const { data: activeCampaign } = await supabase
    .from('campaigns')
    .select('id, title, description, banner_image_url, terms_and_conditions')
    .eq('active', true)
    .eq('is_deleted', false)
    .or(`end_date.is.null,end_date.gt.${now}`)
    .limit(1)
    .single();

  let segments: CampaignSegment[] = [];

  if (activeCampaign) {
    // Fetch active prizes, ordered by creation (or a display_order column if added later)
    // The backend POST /api/spin filters by stock > 0.
    const { data: prizes } = await supabase
      .from('prizes')
      .select('id, title, bg_color, text_color, icon, image_url')
      .eq('campaign_id', activeCampaign.id)
      .eq('is_active', true)
      .eq('is_deleted', false)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (prizes && prizes.length > 0) {
      segments = prizes.map((prize, index) => {
        return {
          id: prize.id,
          title: prize.title,
          color: prize.bg_color || '#FFFFFF',
          textColor: prize.text_color || '#000000',
          icon: prize.icon || undefined,
          imageUrl: prize.image_url || undefined,
        };
      });
    }
  }

  return (
    <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center min-h-[100dvh]">
        
        {/* Header / Campaign Info */}
        <div className="text-center mb-8 mt-4 max-w-lg">
          {activeCampaign?.banner_image_url && (
            <img 
              src={activeCampaign.banner_image_url} 
              alt="Campaign Banner" 
              className="w-full h-32 object-cover rounded-2xl shadow-premium mb-6"
            />
          )}
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-luxury-black mb-3">
            {activeCampaign?.title || 'Şans Çarkı'}
          </h1>
          <p className="text-gray-600 text-sm md:text-base font-medium">
            {activeCampaign?.description || 'Çarkı çevir, sürpriz ödüllerden birini kazanma şansı yakala!'}
          </p>
        </div>
      
      {/* Wheel Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[400px]">
        {segments.length > 0 ? (
          <SpinWheel segments={segments} hasSpun={hasSpun} />
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-xl max-w-sm w-full">
            <h3 className="font-serif text-xl font-bold mb-2">Çok Yakında!</h3>
            <p className="text-gray-500 text-sm">Şu anda aktif bir ödül kampanyası bulunmamaktadır. Lütfen daha sonra tekrar deneyin.</p>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="mt-8 text-center text-xs text-gray-400 max-w-xs px-4">
        <p>Sadece 1 kez çevirme hakkınız bulunmaktadır. Kazandığınız ödüller hesabınıza kaydedilecektir.</p>
      </div>

      {/* Terms and Conditions (Optional) */}
      {activeCampaign?.terms_and_conditions && (
        <div className="mt-8 max-w-md w-full bg-white/50 backdrop-blur-sm p-4 rounded-xl text-sm text-gray-600 text-center border border-gray-100 shadow-sm">
          <h3 className="font-bold mb-2 text-luxury-gold">Şartlar ve Koşullar</h3>
          <p className="whitespace-pre-line text-xs">{activeCampaign.terms_and_conditions}</p>
        </div>
      )}
      
    </div>
  );
}
