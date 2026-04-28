const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server1', '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, disk_path, user_id, portfolio_data')
    .eq('id', 13)
    .single();
  
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  
  console.log(JSON.stringify(data, null, 2));
}

check();
