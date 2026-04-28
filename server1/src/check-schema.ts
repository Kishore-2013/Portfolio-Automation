import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSchema() {
  console.log("--- Checking Users Table Schema ---");
  try {
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'users' });
    if (error) {
       // RPC might not exist, try a simple select with * and look at the keys of the first result
       const { data: firstRow, error: sError } = await supabase.from('users').select('*').limit(1).single();
       if (sError) {
         console.error("Select * error:", sError);
       } else {
         console.log("Columns in 'users':", Object.keys(firstRow));
       }
    } else {
      console.log("Columns:", data);
    }

    console.log("\n--- Checking Projects Table Schema ---");
    const { data: pRow, error: pError } = await supabase.from('projects').select('*').limit(1).single();
    if (pError && pError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error("Projects select error:", pError);
    } else if (pRow) {
        console.log("Columns in 'projects':", Object.keys(pRow));
    } else {
        console.log("Projects table is empty, but query succeeded.");
    }

  } catch (err) {
    console.error("Fatal error:", err);
  }
}

checkSchema();
