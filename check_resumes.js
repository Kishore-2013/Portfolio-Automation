const { createClient } = require('@supabase/supabase-client');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server1', '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
  console.log('Checking resumes for "Jenin"...');
  const { data, error } = await supabase
    .from('resumes')
    .select('id, user_id, parsed_json')
    .contains('parsed_json', { personal: { name: 'Jenin Joseph' } });
  
  if (error) {
    // try direct search
    console.log('Contains failed, trying direct select...');
    const { data: all } = await supabase.from('resumes').select('id, user_id, parsed_json').limit(10);
    console.log('Sample resumes:', all?.map(r => r.parsed_json?.personal?.name));
    return;
  }
  
  console.log('Found:', data?.length);
  console.log(JSON.stringify(data, null, 2));
}

check();
