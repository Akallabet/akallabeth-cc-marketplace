#!/usr/bin/env -S node --env-file .env
import readline from 'node:readline/promises';
import { stdin as input, stdout as output, argv } from 'node:process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { parseGitHubUrl, fetchGitHubDir } from './lib/github.ts';
import { addOrigin, type ComponentType } from './lib/origins.ts';
import { listPlugins, type Plugin } from './lib/plugins.ts';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = join(dirname(__filename), '..');

const TYPE_MAP: Record<string, ComponentType> = { '1': 'skills', '2': 'agents', '3': 'commands' };
const TYPE_LABEL: Record<ComponentType, string> = { skills: 'skill', agents: 'agent', commands: 'command' };
const VALID_TYPES: ComponentType[] = ['skills', 'agents', 'commands'];

interface CliArgs {
  type?: ComponentType;
  url?: string;
  plugin?: string;
  yes: boolean;
  help: boolean;
}

function printHelp(): void {
  console.log(`Plugin Component Importer

Usage:
  plugin-import                          Run interactively
  plugin-import --type <t> --url <u> --plugin <p> [--yes]

Options:
  --type, -t      Component type: skills | agents | commands
  --url, -u       Upstream GitHub tree URL
  --plugin, -p    Target plugin name (as listed in marketplace.json)
  --yes, -y       Skip confirmation prompt
  --help, -h      Show this help

Any subset of flags may be omitted; missing values are prompted interactively.
Providing all of --type, --url, --plugin runs non-interactively (implies --yes
when --yes is set; otherwise still asks for confirmation).`);
}

function parseCliArgs(): CliArgs {
  const { values } = parseArgs({
    args: argv.slice(2),
    options: {
      type: { type: 'string', short: 't' },
      url: { type: 'string', short: 'u' },
      plugin: { type: 'string', short: 'p' },
      yes: { type: 'boolean', short: 'y', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
    strict: true,
  });

  let type: ComponentType | undefined;
  if (values.type !== undefined) {
    if (!VALID_TYPES.includes(values.type as ComponentType)) {
      throw new Error(`Invalid --type: ${values.type} (expected: ${VALID_TYPES.join(' | ')})`);
    }
    type = values.type as ComponentType;
  }

  return {
    type,
    url: values.url,
    plugin: values.plugin,
    yes: values.yes ?? false,
    help: values.help ?? false,
  };
}

async function resolveType(
  cli: CliArgs,
  rl: readline.Interface | null,
): Promise<ComponentType> {
  if (cli.type) return cli.type;
  if (!rl) throw new Error('Missing --type');
  console.log('\n[1/5] What do you want to import?');
  console.log('  1) skill\n  2) agent\n  3) command');
  const choice = (await rl.question('Choose [1-3]: ')).trim();
  const type = TYPE_MAP[choice];
  if (!type) throw new Error(`Invalid choice: ${choice}`);
  return type;
}

async function resolveUrl(cli: CliArgs, rl: readline.Interface | null): Promise<string> {
  if (cli.url) return cli.url;
  if (!rl) throw new Error('Missing --url');
  console.log('\n[2/5] Enter the upstream GitHub URL:');
  console.log('  Example: https://github.com/mcollina/skills/tree/main/skills/fastify');
  return (await rl.question('URL: ')).trim();
}

async function resolvePlugin(
  cli: CliArgs,
  plugins: Plugin[],
  rl: readline.Interface | null,
): Promise<Plugin> {
  if (cli.plugin) {
    const match = plugins.find((p) => p.name === cli.plugin);
    if (!match) {
      throw new Error(
        `Plugin not found: ${cli.plugin} (available: ${plugins.map((p) => p.name).join(', ')})`,
      );
    }
    return match;
  }
  if (!rl) throw new Error('Missing --plugin');
  console.log('\n[3/5] Which plugin?');
  plugins.forEach((p, i) => console.log(`  ${i + 1}) ${p.name}`));
  const choice = (await rl.question(`Choose [1-${plugins.length}]: `)).trim();
  const idx = parseInt(choice, 10) - 1;
  if (idx < 0 || idx >= plugins.length) throw new Error('Invalid plugin choice');
  return plugins[idx];
}

async function main(): Promise<void> {
  const cli = parseCliArgs();
  if (cli.help) {
    printHelp();
    return;
  }

  const nonInteractive = Boolean(cli.type && cli.url && cli.plugin);
  const rl = nonInteractive ? null : readline.createInterface({ input, output });

  try {
    if (!nonInteractive) console.log('\nPlugin Component Importer\n');

    const componentType = await resolveType(cli, rl);
    const url = await resolveUrl(cli, rl);
    const ref = parseGitHubUrl(url);
    const name = ref.path.split('/').at(-1)!;

    const plugins = await listPlugins(REPO_ROOT);
    const plugin = await resolvePlugin(cli, plugins, rl);

    const destDir = join(plugin.dir, componentType, name);
    console.log(`\nImporting ${TYPE_LABEL[componentType]} "${name}" from ${url}`);
    console.log(`  Destination: ${destDir}`);

    if (!cli.yes && rl) {
      const confirm = (await rl.question('\nProceed? [y/N]: ')).trim().toLowerCase();
      if (confirm !== 'y') {
        console.log('Aborted.');
        return;
      }
    }

    console.log('\nFetching from GitHub...');
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
    rl?.close();
  }
}

main().catch((err: Error) => {
  console.error('Error:', err.message);
  process.exit(1);
});
