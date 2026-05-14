import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { listPlugins } from '../lib/plugins.ts';

describe('listPlugins', () => {
  let repoRoot: string;

  beforeEach(async () => {
    repoRoot = await mkdtemp(join(tmpdir(), 'plugins-test-'));
    await mkdir(join(repoRoot, '.claude-plugin'), { recursive: true });
  });

  afterEach(async () => {
    await rm(repoRoot, { recursive: true });
  });

  it('returns plugins from marketplace.json', async () => {
    const manifest = {
      plugins: [
        { name: 'ak-coding', source: './plugins/ak-coding' },
        { name: 'ak-documentation', source: './plugins/ak-documentation' },
      ],
    };
    await writeFile(
      join(repoRoot, '.claude-plugin', 'marketplace.json'),
      JSON.stringify(manifest),
      'utf8',
    );

    const plugins = await listPlugins(repoRoot);
    assert.equal(plugins.length, 2);
    assert.equal(plugins[0].name, 'ak-coding');
    assert.ok(plugins[0].dir.endsWith('ak-coding'));
    assert.equal(plugins[1].name, 'ak-documentation');
    assert.ok(plugins[1].dir.endsWith('ak-documentation'));
  });

  it('throws when marketplace manifest is not found', async () => {
    await assert.rejects(
      () => listPlugins('/nonexistent/path'),
      /Marketplace manifest not found/,
    );
  });

  it('returns an empty array when plugins list is empty', async () => {
    await writeFile(
      join(repoRoot, '.claude-plugin', 'marketplace.json'),
      JSON.stringify({ plugins: [] }),
      'utf8',
    );
    const plugins = await listPlugins(repoRoot);
    assert.deepEqual(plugins, []);
  });
});
