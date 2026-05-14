#!/usr/bin/env node
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseGitHubUrl, fetchGitHubDir } from './lib/github.ts';
import { addOrigin, type ComponentType } from './lib/origins.ts';
import { listPlugins } from './lib/plugins.ts';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = join(dirname(__filename), '..');

const TYPE_MAP: Record<string, ComponentType> = { '1': 'skills', '2': 'agents', '3': 'commands' };
const TYPE_LABEL: Record<ComponentType, string> = { skills: 'skill', agents: 'agent', commands: 'command' };

async function main(): Promise<void> {
  const rl = readline.createInterface({ input, output });

  try {
    console.log('\nPlugin Component Importer\n');

    // Step 1: type
    console.log('[1/5] What do you want to import?');
    console.log('  1) skill\n  2) agent\n  3) command');
    const typeChoice = (await rl.question('Choose [1-3]: ')).trim();
    const componentType = TYPE_MAP[typeChoice];
    if (!componentType) throw new Error(`Invalid choice: ${typeChoice}`);

    // Step 2: URL
    console.log('\n[2/5] Enter the upstream GitHub URL:');
    console.log('  Example: https://github.com/mcollina/skills/tree/main/skills/fastify');
    const url = (await rl.question('URL: ')).trim();
    const ref = parseGitHubUrl(url);
    const name = ref.path.split('/').at(-1)!;

    // Step 3: plugin
    const plugins = await listPlugins(REPO_ROOT);
    console.log('\n[3/5] Which plugin?');
    plugins.forEach((p, i) => console.log(`  ${i + 1}) ${p.name}`));
    const pluginChoice = (await rl.question(`Choose [1-${plugins.length}]: `)).trim();
    const pluginIndex = parseInt(pluginChoice, 10) - 1;
    if (pluginIndex < 0 || pluginIndex >= plugins.length) throw new Error('Invalid plugin choice');
    const plugin = plugins[pluginIndex];

    // Step 4: confirm
    const destDir = join(plugin.dir, componentType, name);
    console.log('\n[4/5] Confirm import:');
    console.log(`  Type:        ${TYPE_LABEL[componentType]}`);
    console.log(`  Name:        ${name}`);
    console.log(`  Source:      ${url}`);
    console.log(`  Destination: ${destDir}`);
    const confirm = (await rl.question('\nProceed? [y/N]: ')).trim().toLowerCase();
    if (confirm !== 'y') {
      console.log('Aborted.');
      return;
    }

    // Step 5: fetch + write
    console.log('\n[5/5] Fetching from GitHub...');
    const files = await fetchGitHubDir(url);
    console.log(`  Downloaded ${files.length} file(s). Writing...`);

    for (const file of files) {
      const dest = join(destDir, file.relativePath);
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, file.content, 'utf8');
    }

    await addOrigin(plugin.dir, componentType, name, url);
    console.log(`\nDone! Imported ${files.length} file(s) to:\n  ${destDir}`);
  } finally {
    rl.close();
  }
}

main().catch((err: Error) => {
  console.error('Error:', err.message);
  process.exit(1);
});
