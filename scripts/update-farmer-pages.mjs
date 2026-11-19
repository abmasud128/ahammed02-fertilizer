import fs from 'fs';
import path from 'path';

const files = [
  'accounts',
  'cycles',
  'dashboard',
  'feed',
  'growth',
  'harvest',
  'mortality',
  'ponds',
  'problems',
  'stocking',
  'treatment',
  'water-quality',
];

for (const name of files) {
  const fp = path.join('ahammed-fertilizer/src/app/farmer', name, 'page.tsx');
  let c = fs.readFileSync(fp, 'utf8');

  // Replace import
  c = c.replace(
    /import\s*\{[^}]*AQUA_DICTIONARY[^}]*\}\s*from\s*['"]@\/lib\/i18n\/aqua-dictionary['"];?/,
    "import { useAquaLanguage } from '@/lib/i18n/aqua-context';"
  );

  // Replace dictionary assignment
  c = c.replace(
    /const\s+d\s*=\s*AQUA_DICTIONARY\.bn;?/,
    "const { d, isBn } = useAquaLanguage();"
  );

  fs.writeFileSync(fp, c, 'utf8');
  console.log(`Updated: ${name}`);
}

console.log('All 12 farmer pages updated to use useAquaLanguage()!');
