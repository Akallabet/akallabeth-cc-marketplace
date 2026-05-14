import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export type ComponentType = 'skills' | 'agents' | 'commands';

export interface Origins {
  skills: Record<string, string>;
  agents: Record<string, string>;
  commands: Record<string, string>;
}

export async function readOrigins(pluginDir: string): Promise<Origins> {
  const filePath = join(pluginDir, 'origins.json');
  try {
    const content = await readFile(filePath, 'utf8');
    const data = JSON.parse(content) as Partial<Origins>;
    return {
      skills: data.skills ?? {},
      agents: data.agents ?? {},
      commands: data.commands ?? {},
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
  origins[type][name] = url;
  await writeOrigins(pluginDir, origins);
}
