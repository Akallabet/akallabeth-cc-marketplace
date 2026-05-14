#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchGitHubDir } from './lib/github.ts';
import { readOrigins, type ComponentType } from './lib/origins.ts';
import { listPlugins } from './lib/plugins.ts';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = join(dirname(__filename), '..');

const TYPES: ComponentType[] = ['skills', 'agents', 'commands'];

async function main(): Promise<void> {
  console.log('\nPlugin Component Updater\n');
  const plugins = await listPlugins(REPO_ROOT);
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const plugin of plugins) {
    const origins = await readOrigins(plugin.dir);

    for (const type of TYPES) {
      for (const [name, url] of Object.entries(origins[type])) {
        if (!url) {
          skipped++;
          continue;
        }

        process.stdout.write(`  Updating ${plugin.name}/${type}/${name}... `);
        try {
          const files = await fetchGitHubDir(url);
          const destDir = join(plugin.dir, type, name);

          for (const file of files) {
            const dest = join(destDir, file.relativePath);
            await mkdir(dirname(dest), { recursive: true });
            await writeFile(dest, file.content, 'utf8');
          }

          console.log(`${files.length} file(s) updated`);
          updated++;
        } catch (err) {
          console.log(`ERROR: ${(err as Error).message}`);
          errors++;
        }
      }
    }
  }

  console.log(
    `\nSummary: ${updated} updated, ${skipped} skipped (no URL), ${errors} error(s)`,
  );
  if (errors > 0) process.exit(1);
}

main().catch((err: Error) => {
  console.error('Error:', err.message);
  process.exit(1);
});
