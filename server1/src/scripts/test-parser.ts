import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { parseResumeHybrid } from '../services/resume.parser';
import { logger } from '../shared/shared-utils';

async function test() {
  const resumePath = process.argv[2];
  if (!resumePath) {
    console.error('Usage: ts-node src/scripts/test-parser.ts <path-to-pdf>');
    process.exit(1);
  }

  const absolutePath = path.resolve(resumePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  console.log(`--- Testing Parser with: ${path.basename(absolutePath)} ---`);
  
  try {
    const buffer = fs.readFileSync(absolutePath);
    const result = await parseResumeHybrid(buffer);
    
    console.log('\n--- PARSED DATA ---');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n--- SKILLS SUMMARY ---');
    console.log(result.skills.join(', '));
    
    console.log('\n--- EXPERIENCE SUMMARY ---');
    result.experiences.forEach((exp, i) => {
      console.log(`${i+1}. ${exp.title} at ${exp.company} (${exp.period})`);
    });

  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
