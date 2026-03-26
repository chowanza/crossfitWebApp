const dotenv = require('dotenv');
dotenv.config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
async function run() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase.from('wods').select('*, coach:profiles!wods_created_by_fkey(full_name), wod_sections(id, section_type, name, time_cap_min, rounds, wod_section_movements(id, reps, weight_kg, movements(name)))').limit(1);
  if (error) console.error('ERROR:', error);
  else console.log('SUCCESS:', JSON.stringify(data).substring(0, 100));
}
run();
