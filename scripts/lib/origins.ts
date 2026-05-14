import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fetchLatestCommit } from './github.ts';

export type ComponentType = 'skills' | 'agents' | 'commands';

export interface OriginEntry {
  url: string;
  commit?: string;
}

export interface Origins {
  skills: Record<string, OriginEntry>;
  agents: Record<string, OriginEntry>;
  commands: Record<string, OriginEntry>;
}

function normalizeEntries(raw: Record<string, unknown>): Record<string, OriginEntry> {
  const out: Record<string, OriginEntry> = {};
  for (const [name, value] of Object.entries(raw)) {
    if (typeof value === 'string') {
      out[name] = { url: value };
    } else {
      out[name] = value as OriginEntry;
    }
  }
  return out;
}

export async function readOrigins(pluginDir: string): Promise<Origins> {
  const filePath = join(pluginDir, 'origins.json');
  try {
    const content = await readFile(filePath, 'utf8');
    const data = JSON.parse(content) as Partial<Record<string, Record<string, unknown>>>;
    return {
      skills: normalizeEntries(data.skills ?? {}),
      agents: normalizeEntries(data.agents ?? {}),
      commands: normalizeEntries(data.commands ?? {}),
    };
  } catch {
    return { skills: {}, agents: {}, commands: {} };
  }
}

export async function writeOrigins(pluginDir: string, origins: Origins): Promise<void> {
  const filePath = join(pluginDir, 'origins.json');
  await writeFile(filePath, JSON.stringify(origins, null, 2) + '\n', 'utf8');
}

export async function addOrigin(
  pluginDir: string,
  type: ComponentType,
  name: string,
  url: string,
): Promise<void> {
  const origins = await readOrigins(pluginDir);
  const entry: OriginEntry = { url };
  if (url) {
    try {
      entry.commit = await fetchLatestCommit(url);
    } catch {
      // leave commit undefined if fetch fails
    }
  }
  origins[type][name] = entry;
  await writeOrigins(pluginDir, origins);
}
