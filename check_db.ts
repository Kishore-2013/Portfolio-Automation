import { createClient } from '@supabase/supabase-client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, 'server1', '.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

async function check() {
  console.log('Checking templates...');
  const { data, error } = await supabase.from('templates').select('name, portfolio_data');
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Templates found:', data?.length);
  console.log(JSON.stringify(data, null, 2));
}

check();
