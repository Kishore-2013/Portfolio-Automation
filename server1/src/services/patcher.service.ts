import * as fs from 'fs';
import * as path from 'path';

/**
 * Universal Template Patcher
 * --------------------------
 * Semantically analyzes ANY cloned template to identify placeholders
 * and inject dynamic data bindings automatically.
 */
export function applyDynamicDataBinding(localPath: string) {
  try {
    console.log(`[UniversalPatcher] 🔍 Analyzing template at ${localPath}...`);

    // 1. Discovery Phase: Identify the template's "original author" and placeholders
    const placeholders = discoverPlaceholders(localPath);
    console.log(`[UniversalPatcher] 💡 Identified placeholders to replace:`, placeholders);

    // 2. Dependency & Hook Injection
    injectDynamicDependencies(localPath);
    const hooksPath = injectUniversalHook(localPath);

    // 3. Global Semantic Patching
    // We scan ALL components and pages to replace placeholders with dynamic data calls
    patchAllComponents(localPath, hooksPath, placeholders);

    console.log(`[UniversalPatcher] ✅ Successfully dynamized template!`);
  } catch (err: any) {
    console.warn(`[UniversalPatcher] ⚠️ Patching failed: ${err.message}`);
  }
}

function discoverPlaceholders(localPath: string): string[] {
  const discovered: Set<string> = new Set(['Jenin Joseph', 'Himanshu', 'John Doe', 'Your Name']);
  
  // Try package.json
  const pkgPath = path.join(localPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (pkg.author) discovered.add(typeof pkg.author === 'string' ? pkg.author : pkg.author.name);
      if (pkg.name) discovered.add(pkg.name.replace(/-/g, ' '));
    } catch {}
  }

  // Try README.md
  const readmePath = path.join(localPath, 'README.md');
  if (fs.existsSync(readmePath)) {
    const readme = fs.readFileSync(readmePath, 'utf-8');
    const titleMatch = readme.match(/^#\s+(.+)$/m);
    if (titleMatch) discovered.add(titleMatch[1].trim());
  }

  return Array.from(discovered).filter(s => s && s.length > 2);
}

function injectDynamicDependencies(localPath: string) {
  const pkgPath = path.join(localPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      
      // 1. Core Portfolio Dependencies
      pkg.dependencies = pkg.dependencies || {};
      if (!pkg.dependencies['lucide-react']) pkg.dependencies['lucide-react'] = '^0.294.0';
      if (!pkg.dependencies['framer-motion']) pkg.dependencies['framer-motion'] = '^10.16.4';

      // 2. Production Sanitization (Fix Vercel 404s/Build failures)
      // Fix Next.js version if it's invalid/experimental
      if (pkg.dependencies['next'] && pkg.dependencies['next'].startsWith('16')) {
        pkg.dependencies['next'] = '15.1.6';
      }
      
      // Remove husky (causes issues in Vercel CI)
      if (pkg.devDependencies?.husky) delete pkg.devDependencies.husky;
      if (pkg.dependencies?.husky) delete pkg.dependencies.husky;
      if (pkg.scripts?.prepare) delete pkg.scripts.prepare;

      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    } catch {}
  }
}

function injectUniversalHook(localPath: string): string {
  const hooksDir = fs.existsSync(path.join(localPath, 'src')) 
    ? path.join(localPath, 'src', 'hooks') 
    : path.join(localPath, 'hooks');
  
  if (!fs.existsSync(hooksDir)) fs.mkdirSync(hooksDir, { recursive: true });

  const hookContent = `"use client";
import { useState, useEffect } from 'react';

export function usePortfolioData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/portfolioData.json')
      .then(res => res.json())
      .then(json => {
        setData({
          ...json,
          personal: { ...json.personal, name: json.personal?.name || 'User' },
          customSections: json.customSections || []
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { data, loading };
}
`;
  const hookFile = path.join(hooksDir, 'usePortfolioData.ts');
  fs.writeFileSync(hookFile, hookContent, 'utf-8');
  return hooksDir;
}

function patchAllComponents(localPath: string, hooksPath: string, placeholders: string[]) {
  const searchDirs = [
    path.join(localPath, 'components'),
    path.join(localPath, 'src', 'components'),
    path.join(localPath, 'app'),
    path.join(localPath, 'src', 'pages')
  ];

  const processedFiles = new Set<string>();

  const walk = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (/\.(tsx|jsx|js)$/.test(file)) {
        processFile(fullPath, hooksPath, placeholders);
        processedFiles.add(fullPath);
      }
    }
  };

  searchDirs.forEach(walk);
}

function processFile(filePath: string, hooksPath: string, placeholders: string[]) {
  let content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes('usePortfolioData')) return; // Prevent double patching
  let changed = false;

  // 1. Advanced Heuristic Replacement
  // We look for:
  // - Name placeholders (e.g. Jenin Joseph)
  // - Bio/Summary blocks (long text blocks)
  // - Experience/Project containers

  // Replace Names
  placeholders.forEach(p => {
    // 1. Target strings specifically (to convert to template literals)
    const stringRegex = new RegExp(`(["'])((?:(?!\\1).)*)(${p})((?:(?!\\1).)*)\\1`, 'gi');
    if (stringRegex.test(content)) {
      content = content.replace(stringRegex, (match, quote, prefix, pMatch, suffix) => {
        if (pMatch.toLowerCase().includes('portfolio')) return match;
        return `\`${prefix}\${data?.personal?.name || '${pMatch}'}${suffix}\``;
      });
      changed = true;
    }

    // 2. Target JSX Text and other occurrences
    // We use a regex that avoids already-replaced ${} or `` patterns
    const nameRegex = new RegExp('(?<![\\\\`' + '${])\\b' + p + '\\b(?![\\\\`' + '}])', 'gi');
    if (nameRegex.test(content)) {
      content = content.replace(nameRegex, (match) => {
        if (match.toLowerCase().includes('portfolio')) return match;
        return `{data?.personal?.name || '${match}'}`;
      });
      changed = true;
    }
  });

  // Replace Bio/Summary (Heuristic: Any JSX text block > 100 chars that isn't code)
  const bioRegex = />([^<{}>]{100,})</g;
  if (bioRegex.test(content)) {
    content = content.replace(bioRegex, (match, text) => {
      if (
        text.includes('import') || 
        text.includes('export') || 
        text.includes('&&') || 
        text.includes('||') || 
        text.includes('===') ||
        text.includes('=>') ||
        text.match(/\b(const|let|var|return|function)\b/)
      ) return match; // Skip code-like blocks
      return `>{data?.summary || \`${text.trim()}\`}<`;
    });
    changed = true;
  }

  // 2. Inject Hook if we made changes
  if (changed && !content.includes('usePortfolioData')) {
    const relHooks = path.relative(path.dirname(filePath), path.join(hooksPath, 'usePortfolioData')).replace(/\\/g, '/');
    const importPath = relHooks.startsWith('.') ? relHooks : './' + relHooks;
    
    // Clean existing "use client" to avoid duplicates and ensure it's at the top
    content = content.replace(/['"]use client['"];?\n?/g, '');
    
    const hookInject = `\n  const { data } = usePortfolioData();`;
    
    // Improved regex to target the MAIN component (first non-indented function)
    const mainFuncRegex = /^(?:export\s+default\s+)?(?:const|function)\s+([A-Z]\w*)\s*(?:=|\()\s*(?:memo\s*\()?[^\{]*?(?:\)|=>)\s*{/m;
    
    if (mainFuncRegex.test(content)) {
      content = content.replace(mainFuncRegex, (m) => `${m}${hookInject}`);
    } else {
      // Fallback to the original regex if the anchored one fails
      const fallbackFuncRegex = /(?:const|function)\s+([A-Z]\w*)\s*(?:=|\()\s*(?:memo\s*\()?[^\{]*?(?:\)|=>)\s*{/;
      content = content.replace(fallbackFuncRegex, (m) => `${m}${hookInject}`);
    }

    // Re-assemble with strict ordering: "use client" -> import -> rest
    content = `"use client";\nimport { usePortfolioData } from "${importPath}";\n` + content;
  }

  if (changed) fs.writeFileSync(filePath, content, 'utf-8');
}

export function patchTemplateForVercel(localPath: string) {
  const vercelJsonPath = path.join(localPath, 'vercel.json');
  const config = { 
    headers: [
      { 
        source: '/(.*)', 
        headers: [
          { key: 'Content-Security-Policy', value: "frame-ancestors *" },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Permissions-Policy', value: "clipboard-write=(*)" }
        ] 
      }
    ] 
  };
  fs.writeFileSync(vercelJsonPath, JSON.stringify(config, null, 2));
  
  // Also ensure portfolioData.json is NOT in .gitignore
  const gitignorePath = path.join(localPath, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    try {
      let gitignore = fs.readFileSync(gitignorePath, 'utf-8');
      if (gitignore.includes('portfolioData.json')) {
        gitignore = gitignore.replace(/^portfolioData\.json$/m, '').replace(/portfolioData\.json/g, '');
        fs.writeFileSync(gitignorePath, gitignore);
      }
    } catch {}
  }
}
