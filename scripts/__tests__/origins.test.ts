import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readOrigins, writeOrigins, addOrigin } from '../lib/origins.ts';

describe('readOrigins', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'origins-test-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true });
  });

  it('returns empty defaults when file does not exist', async () => {
    const origins = await readOrigins(dir);
    assert.deepEqual(origins, { skills: {}, agents: {}, commands: {} });
  });

  it('reads an existing origins.json with OriginEntry values', async () => {
    const data = {
      skills: { fastify: { url: 'https://github.com/mcollina/skills/tree/main/skills/fastify', commit: 'abc123' } },
      agents: {},
      commands: {},
    };
    await writeOrigins(dir, data);
    const origins = await readOrigins(dir);
    assert.deepEqual(origins, data);
  });

  it('normalizes legacy plain-string values to OriginEntry', async () => {
    await writeFile(
      join(dir, 'origins.json'),
      JSON.stringify({ skills: { fastify: 'https://github.com/mcollina/skills/tree/main/skills/fastify' } }),
      'utf8',
    );
    const origins = await readOrigins(dir);
    assert.deepEqual(origins.skills['fastify'], { url: 'https://github.com/mcollina/skills/tree/main/skills/fastify' });
    assert.deepEqual(origins.agents, {});
    assert.deepEqual(origins.commands, {});
  });

  it('fills in missing type keys with empty objects', async () => {
    await writeFile(
      join(dir, 'origins.json'),
      JSON.stringify({ skills: { fastify: { url: '' } } }),
      'utf8',
    );
    const origins = await readOrigins(dir);
    assert.deepEqual(origins.agents, {});
    assert.deepEqual(origins.commands, {});
  });
});

describe('addOrigin', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'origins-test-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true });
  });

  it('adds a local entry (empty url) without fetching a commit', async () => {
    await addOrigin(dir, 'skills', 'local-skill', '');
    const origins = await readOrigins(dir);
    assert.deepEqual(origins.skills['local-skill'], { url: '' });
  });

  it('merges with existing entries without overwriting others', async () => {
    await writeOrigins(dir, {
      skills: { existing: { url: 'https://existing', commit: 'aaa' } },
      agents: {},
      commands: {},
    });
    await addOrigin(dir, 'skills', 'local-new', '');
    const origins = await readOrigins(dir);
    assert.deepEqual(origins.skills['existing'], { url: 'https://existing', commit: 'aaa' });
    assert.deepEqual(origins.skills['local-new'], { url: '' });
  });
});
