#!/usr/bin/env -S node --env-file .env
console.log('Starting plugin component import...', process.env);
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchGitHubDir, fetchLatestCommit } from './lib/github.ts';
import { readOrigins, addOrigin, type ComponentType } from './lib/origins.ts';
import { listPlugins } from './lib/plugins.ts';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = join(dirname(__filename), '..');

const TYPES: ComponentType[] = ['skills', 'agents', 'commands'];

async function main(): Promise<void> {
  console.log('\nPlugin Component Updater\n');
  const plugins = await listPlugins(REPO_ROOT);
  let updated = 0;
  let upToDate = 0;
  let skipped = 0;
  let errors = 0;

  for (const plugin of plugins) {
    const origins = await readOrigins(plugin.dir);

    for (const type of TYPES) {
      for (const [name, entry] of Object.entries(origins[type])) {
        if (!entry.url) {
          skipped++;
          continue;
        }

        process.stdout.write(`  Checking ${plugin.name}/${type}/${name}... `);
        try {
          const latestCommit = await fetchLatestCommit(entry.url);

          if (latestCommit === entry.commit) {
            console.log(`up to date (${latestCommit.slice(0, 7)})`);
            upToDate++;
            continue;
          }

          process.stdout.write(`updating... `);
          const files = await fetchGitHubDir(entry.url);
          const destDir = join(plugin.dir, type, name);

          for (const file of files) {
            const dest = join(destDir, file.relativePath);
            await mkdir(dirname(dest), { recursive: true });
            await writeFile(dest, file.content, 'utf8');
          }

          await addOrigin(plugin.dir, type, name, entry.url);
          console.log(`${files.length} file(s) updated (${latestCommit.slice(0, 7)})`);
          updated++;
        } catch (err) {
          console.log(`ERROR: ${(err as Error).message}`);
          errors++;
        }
      }
    }
  }

  console.log(
    `\nSummary: ${updated} updated, ${upToDate} up to date, ${skipped} skipped (no URL), ${errors} error(s)`,
  );
  if (errors > 0) process.exit(1);
}

main().catch((err: Error) => {
  console.error('Error:', err.message);
  process.exit(1);
});
