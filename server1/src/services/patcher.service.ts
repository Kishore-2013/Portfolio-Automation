import fs from 'fs';
import path from 'path';

/**
 * Applies necessary adjustments to the template code after cloning.
 * This ensures the project is ready for Vercel deployment and local preview.
 */
export const patchTemplateForVercel = (localPath: string): void => {
  try {
    const pkgPath = path.join(localPath, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      
      // Update package name to match project folder name
      pkg.name = path.basename(localPath).toLowerCase().replace(/[^a-z0-9-]/g, '-');
      
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf-8');
      console.log(`[Patcher] Updated package.json name to ${pkg.name}`);
    }

    // Ensure .vercel exists or similar if needed
    // In this flow, we rely on Vercel's Zero Config mostly.
    
  } catch (err) {
    console.warn(`[Patcher] Failed to patch template at ${localPath}:`, err);
  }
};

/**
 * Refactors the template code to be dynamic.
 * This injects the usePortfolioData hook and modifies Index.tsx/components to use it.
 */
export const applyDynamicDataBinding = (localPath: string): void => {
  try {
    console.log(`[Patcher] Applying dynamic data binding to $\{localPath\}`);

    // 1. Create hooks directory and inject usePortfolioData.ts
    const hooksDir = path.join(localPath, 'src', 'hooks');
    if (!fs.existsSync(hooksDir)) fs.mkdirSync(hooksDir, { recursive: true });

    const hookContent = `import { useState, useEffect } from 'react';

export function usePortfolioData() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/portfolioData.json');
        if (response.ok) {
          const json = await response.json();
          setData(json);
        }
      } catch (err) {
        console.error('Error fetching dynamic data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    window.addEventListener('portfolio-refresh', fetchData);
    return () => window.removeEventListener('portfolio-refresh', fetchData);
  }, []);

  return { data, loading };
}
`;
    fs.writeFileSync(path.join(hooksDir, 'usePortfolioData.ts'), hookContent);

    // 2. Patch Index.tsx
    const indexPath = path.join(localPath, 'src', 'pages', 'Index.tsx');
    if (fs.existsSync(indexPath)) {
      let content = fs.readFileSync(indexPath, 'utf-8');
      
      // Add import
      if (!content.includes('usePortfolioData')) {
        content = `import { usePortfolioData } from "@/hooks/usePortfolioData";\n` + content;
      }

      // Modify PortfolioContent
      content = content.replace(
        /const PortfolioContent = \(\) => {/,
        `const PortfolioContent = () => {
  const { data, loading } = usePortfolioData();
  const [loaded, setLoaded] = useState(false);
  const onComplete = useCallback(() => setLoaded(true), []);

  if (loading) return null;
  const portfolio = data || {};`
      );

      // Pass props to sections
      content = content.replace(/<Header \/>/g, '<Header data={portfolio} />');
      content = content.replace(/<(Hero|About|Experience|Projects|Skills|Education|Certifications|Contact)Section \/>/g, '<$1Section data={portfolio} />');
      
      // Dynamic Footer
      content = content.replace(/© \d{4} Sowjanya Allam/g, `© {new Date().getFullYear()} {portfolio?.personal?.name || 'Sowjanya Allam'}`);

      fs.writeFileSync(indexPath, content);
    }

    // 3. Patch all components in src/components/
    const componentsDir = path.join(localPath, 'src', 'components');
    if (fs.existsSync(componentsDir)) {
      const files = fs.readdirSync(componentsDir);
      for (const file of files) {
        if (file.endsWith('Section.tsx') || file === 'Header.tsx') {
          const filePath = path.join(componentsDir, file);
          let content = fs.readFileSync(filePath, 'utf-8');
          
          // Change function signature
          content = content.replace(
            /const (\w+) = \(\) => {/,
            'const $1 = ({ data }: { data: any }) => {'
          );
          
          fs.writeFileSync(filePath, content);
        }
      }
    }

  } catch (err) {
    console.warn(`[Patcher] Failed to apply dynamic binding at $\{localPath\}:`, err);
  }
};
