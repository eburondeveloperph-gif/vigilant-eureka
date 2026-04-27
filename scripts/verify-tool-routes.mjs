import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const toolFiles = [
  'lib/tools/beatrice-tools.ts',
  'lib/tools/customer-support.ts',
  'lib/tools/personal-assistant.ts',
  'lib/tools/navigation-system.ts',
];

const registryPath = path.join(root, 'lib/agents/index.ts');
const registrySource = fs.readFileSync(registryPath, 'utf8');

const exactRoutes = new Set(
  [...registrySource.matchAll(/register\('([^']+)',\s*[^,]+,\s*false\)/g)]
    .map(match => match[1]),
);

const prefixRoutes = [...registrySource.matchAll(/register\('([^']+)',\s*[^,]+,\s*true\)/g)]
  .map(match => match[1]);

let missingCount = 0;

for (const file of toolFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const toolNames = [...source.matchAll(/name:\s*'([^']+)'/g)]
    .map(match => match[1]);
  const missing = toolNames.filter(
    name => !exactRoutes.has(name) && !prefixRoutes.some(prefix => name.startsWith(prefix)),
  );

  missingCount += missing.length;
  console.log(`${file}: ${toolNames.length} tools, ${missing.length} missing routes`);

  if (missing.length) {
    for (const toolName of missing) {
      console.log(`  - ${toolName}`);
    }
  }
}

if (missingCount > 0) {
  process.exitCode = 1;
}
