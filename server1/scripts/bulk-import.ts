import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

async function bulkImport() {
  const filePath = path.join(__dirname, 'templates-to-import.json');
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }

  const templates = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`🚀 Starting bulk import of ${templates.length} templates...`);

  for (const t of templates) {
    try {
      const slug = generateSlug(t.name);
      
      console.log(`📦 Importing: ${t.name} (${slug})...`);

      const { data, error } = await supabase
        .from('templates')
        .insert({
          id: crypto.randomUUID(),
          name: t.name,
          slug: slug,
          description: t.description,
          tech_stack: t.techStack,
          domain: t.domain,
          git_repo_url: t.gitRepoUrl,
          thumb_url: t.thumbUrl || null,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error(`  ❌ Failed to import ${t.name}:`, error.message);
      } else {
        console.log(`  ✅ Success! Created with ID: ${data.id}`);
      }
    } catch (err: any) {
      console.error(`  💥 Error processing ${t.name}:`, err.message);
    }
  }

  console.log('\n✨ Bulk import completed!');
}

bulkImport();
