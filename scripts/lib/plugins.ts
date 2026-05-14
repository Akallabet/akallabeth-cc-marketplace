import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

export interface Plugin {
  name: string;
  dir: string;
}

interface MarketplaceEntry {
  name: string;
  source: string;
}

export async function listPlugins(repoRoot: string): Promise<Plugin[]> {
  const manifestPath = join(repoRoot, '.claude-plugin', 'marketplace.json');
  let content: string;
  try {
    content = await readFile(manifestPath, 'utf8');
  } catch {
    throw new Error(`Marketplace manifest not found: ${manifestPath}`);
  }
  const data = JSON.parse(content) as { plugins: MarketplaceEntry[] };
  return data.plugins.map((p) => ({
    name: p.name,
    dir: resolve(repoRoot, p.source),
  }));
}
