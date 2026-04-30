require('dotenv').config({ path: '.env.local' });

async function checkSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('No supa keys');
    return;
  }
  
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  
  const fetchData = async (table, select = 'count=exact') => {
    const res = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, { headers });
    const countRes = await fetch(`${url}/rest/v1/${table}?select=*`, { headers, method: 'HEAD', headers: { ...headers, 'Prefer': 'count=exact' } });
    const cols = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, { headers }).then(r=>r.json()).catch(e=>[]);
    console.log(`\n--- ${table} ---`);
    console.log('Count:', countRes.headers.get('content-range'));
    console.log('Sample keys:', cols[0] ? Object.keys(cols[0]) : 'None');
  };

  await fetchData('beneficiary_profiles');
  await fetchData('hc_campaigns');
  await fetchData('campaign_manager_profiles');
  await fetchData('digital_donor_profiles');
}

checkSupabase();
