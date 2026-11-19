import fs from 'fs';
import path from 'path';

function scan(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fp = path.join(dir, f);
    const stat = fs.statSync(fp);
    if (stat.isDirectory() && f !== 'node_modules' && f !== '.next') {
      scan(fp);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      const content = fs.readFileSync(fp, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (
          line.includes("useState('bn')") ||
          line.includes('useState("bn")') ||
          line.includes("useState<'en' | 'bn'>('bn')") ||
          line.includes("useState<'bn' | 'en'>('bn')") ||
          line.includes("lang = 'bn'") ||
          line.includes('lang: "bn"') ||
          line.includes("lang: 'bn'") ||
          line.includes("defaultLang = 'bn'") ||
          line.includes('defaultLanguage = "bn"') ||
          line.includes("locale = 'bn'")
        ) {
          console.log(`${fp}:${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }
}

scan('ahammed-fertilizer/src');
