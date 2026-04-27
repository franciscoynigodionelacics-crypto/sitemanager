import { NextRequest, NextResponse } from 'next/server';
import { supabaseRequest } from '../../../lib/hopecard-supabase';

export async function GET(req: NextRequest) {
  try {
    const campaigns = await supabaseRequest<any[]>('hc_campaigns?select=collected_amount');
    const beneficiaries = await supabaseRequest<any[]>('beneficiary_profiles?select=id');
    const partners = await supabaseRequest<any[]>('campaign_manager_profiles?select=id');

    let fundsRaised = 0;
    let livesImpacted = 0;
    
    for (const c of campaigns || []) {
      fundsRaised += Number(c.collected_amount || 0);
    }

    // fallback lives impacted if column doesnt exist
    if (livesImpacted === 0 && beneficiaries) {
      livesImpacted = beneficiaries.length;
    }
    
    return NextResponse.json({
      fundsRaised,
      livesImpacted,
      globalPartners: partners?.length || 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load stats';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
