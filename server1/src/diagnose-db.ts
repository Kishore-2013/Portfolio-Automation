import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function diagnose() {
  console.log("--- Supabase Diagnosis ---");
  console.log("URL:", process.env.SUPABASE_URL);

  try {
    const { data: templates, error: tError } = await supabase.from('templates').select('*');
    if (tError) {
      console.error("Templates query error:", tError);
    } else {
      console.log("Templates found:", templates?.length || 0);
      templates?.forEach(t => console.log(`- ${t.name} (ID: ${t.id}, Active: ${t.is_active})`));
    }

    const { data: users, error: uError } = await supabase.from('users').select('id, email, full_name');
    if (uError) {
      console.error("Users query error:", uError);
    } else {
      console.log("Users found:", users?.length || 0);
      users?.forEach(u => console.log(`- ${u.email} (ID: ${u.id})`));
    }

    const { data: projects, error: pError } = await supabase.from('projects').select('id, name, status');
    if (pError) {
      console.error("Projects query error:", pError);
    } else {
      console.log("Projects found:", projects?.length || 0);
    }

  } catch (err) {
    console.error("Fatal diagnosis error:", err);
  }
}

diagnose();
