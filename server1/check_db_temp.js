const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
  console.log('Checking templates...');
  const { data, error } = await supabase.from('templates').select('*');
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Templates found:', data?.length);
  console.log(JSON.stringify(data, null, 2));
}

check();
