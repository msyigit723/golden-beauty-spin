import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_PRIZES = [
  { title: '%10 İndirim', probability: 25, stock: 100, bg_color: '#FDFBF7', text_color: '#333333', display_order: 1 },
  { title: '%15 İndirim', probability: 20, stock: 50, bg_color: '#F4E5D3', text_color: '#333333', display_order: 2 },
  { title: '%20 İndirim', probability: 15, stock: 25, bg_color: '#EAD1B6', text_color: '#333333', display_order: 3 },
  { title: 'Ücretsiz Kaş Bıyık', probability: 20, stock: 100, bg_color: '#D4AF37', text_color: '#FFFFFF', display_order: 4 },
  { title: 'Ücretsiz Cilt Analizi', probability: 15, stock: 50, bg_color: '#C5A017', text_color: '#FFFFFF', display_order: 5 },
  { title: 'Ücretsiz Hydrafacial', probability: 3, stock: 5, bg_color: '#AA8811', text_color: '#FFFFFF', display_order: 6 },
  { title: 'Sürpriz Hediye', probability: 2, stock: 5, bg_color: '#1A1A1A', text_color: '#D4AF37', display_order: 7 }
];

async function seed() {
  console.log("Checking for active campaign...");
  
  // 1. Check Campaign
  let { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('active', true)
    .single();

  if (!campaign) {
    console.log("No active campaign found. Creating a default campaign...");
    const { data: newCampaign, error: campErr } = await supabase
      .from('campaigns')
      .insert({
        title: 'Büyük Yaz İndirimi Şansı',
        description: 'Çarkı çevirerek bu aya özel muhteşem indirimleri ve ücretsiz seansları yakalayabilirsiniz!',
        probability: 100, // Not strictly used for campaigns but required by schema
        active: true
      })
      .select()
      .single();
      
    if (campErr) {
      console.error("Campaign creation failed:", campErr);
      process.exit(1);
    }
    campaign = newCampaign;
    console.log("Created Campaign:", campaign.title);
  } else {
    console.log("Active campaign exists:", campaign.title);
  }

  // 2. Check Prizes
  const { data: prizes } = await supabase
    .from('prizes')
    .select('id')
    .eq('campaign_id', campaign.id);

  if (!prizes || prizes.length === 0) {
    console.log("No prizes found for active campaign. Creating demo prizes...");
    
    const prizesToInsert = DEFAULT_PRIZES.map(p => ({
      campaign_id: campaign.id,
      title: p.title,
      probability: p.probability,
      stock: p.stock,
      bg_color: p.bg_color,
      text_color: p.text_color,
      display_order: p.display_order,
      is_active: true
    }));

    const { error: prizeErr } = await supabase.from('prizes').insert(prizesToInsert);
    
    if (prizeErr) {
      console.error("Prize creation failed:", prizeErr);
      process.exit(1);
    }
    console.log("Created 7 default prizes successfully.");
  } else {
    console.log(`Prizes already exist (${prizes.length} found). Skipping prize creation.`);
  }

  console.log("Seed completed successfully!");
}

seed();
