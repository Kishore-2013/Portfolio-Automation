import 'dotenv/config';
import { supabase } from '@/shared/database';
import { createProjectInstance } from './services/project.service';
import { PreviewService } from './services/preview.service';
import jwt from 'jsonwebtoken';

async function testFlow() {
  console.log("--- Starting Flow Test ---");
  
  try {
    // 1. Get a user
    const { data: user } = await supabase.from('users').select('*').limit(1).single();
    if (!user) {
      console.error("No user found in DB");
      return;
    }
    console.log(`Found user: ${user.email} (ID: ${user.id})`);

    // 2. Get templates
    const { data: templates } = await supabase.from('templates').select('*').eq('is_active', true);
    if (!templates || templates.length === 0) {
      console.error("No active templates found in DB");
      return;
    }
    console.log(`Found ${templates.length} active templates`);

    const firstTemplate = templates[0];
    console.log(`Selected template: ${firstTemplate.name} (${firstTemplate.id})`);
    console.log(`Git Repo: ${firstTemplate.git_repo_url}`);

    // 3. Generate a JWT for this user (to simulate auth if needed, though we'll call service directly)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
    console.log("Simulated JWT generated");

    // 4. Test Create Project Service
    console.log(`Testing Project Creation for user ${user.id}...`);
    const project = await createProjectInstance(user.id, firstTemplate.id, `Test-${Date.now()}`);
    console.log(`Success! Project created: ${project.name} (ID: ${project.id})`);
    console.log(`Project status: ${project.status}`);

    // 5. Test Preview Start
    console.log(`\nTesting Preview Assignment for project ${project.id}...`);
    const runtime = await PreviewService.startPreview(project.id, user.id);
    console.log("Preview assignment success!");
    console.log(JSON.stringify(runtime, null, 2));

    // 6. Check Preview Status
    console.log(`\nChecking preview status for project ${project.id}...`);
    const status = await PreviewService.getStatus(project.id);
    console.log(JSON.stringify(status, null, 2));

  } catch (err: any) {
    console.error("FLOW_TEST_FAILED:");
    console.error(err);
    if (err.stderr) {
      console.error("Stderr output:", err.stderr.toString());
    }
  } finally {
    process.exit();
  }
}

testFlow();
