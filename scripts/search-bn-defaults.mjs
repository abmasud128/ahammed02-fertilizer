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
          line.match(/useState.*['"]bn['"]/i) ||
          line.match(/locale\s*=\s*['"]bn['"]/i) ||
          line.match(/lang\s*=\s*['"]bn['"]/i) ||
          line.match(/defaultLocale.*['"]bn['"]/i) ||
          line.match(/defaultLanguage.*['"]bn['"]/i) ||
          line.match(/AquaLocale.*['"]bn['"]/i)
        ) {
          console.log(`${fp}:${idx + 1}: ${line.trim()}`);
        }
      });
    }
  }
}

scan('ahammed-fertilizer/src');
