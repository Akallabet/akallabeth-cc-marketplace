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

  it('reads an existing origins.json', async () => {
    const data = { skills: { fastify: 'https://github.com/mcollina/skills/tree/main/skills/fastify' }, agents: {}, commands: {} };
    await writeOrigins(dir, data);
    const origins = await readOrigins(dir);
    assert.deepEqual(origins, data);
  });

  it('fills in missing type keys with empty objects', async () => {
    await writeFile(join(dir, 'origins.json'), JSON.stringify({ skills: { fastify: '' } }), 'utf8');
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

  it('adds a new skill entry when file does not exist', async () => {
    await addOrigin(dir, 'skills', 'fastify', 'https://github.com/mcollina/skills/tree/main/skills/fastify');
    const origins = await readOrigins(dir);
    assert.equal(origins.skills['fastify'], 'https://github.com/mcollina/skills/tree/main/skills/fastify');
  });

  it('adds an agent entry', async () => {
    await addOrigin(dir, 'agents', 'my-agent', 'https://github.com/org/repo/tree/main/agents/my-agent');
    const origins = await readOrigins(dir);
    assert.equal(origins.agents['my-agent'], 'https://github.com/org/repo/tree/main/agents/my-agent');
  });

  it('merges with existing entries without overwriting others', async () => {
    await writeOrigins(dir, { skills: { existing: 'https://existing' }, agents: {}, commands: {} });
    await addOrigin(dir, 'skills', 'new-skill', 'https://new');
    const origins = await readOrigins(dir);
    assert.equal(origins.skills['existing'], 'https://existing');
    assert.equal(origins.skills['new-skill'], 'https://new');
  });

  it('overwrites an existing entry with the same name', async () => {
    await addOrigin(dir, 'skills', 'fastify', 'https://old');
    await addOrigin(dir, 'skills', 'fastify', 'https://new');
    const origins = await readOrigins(dir);
    assert.equal(origins.skills['fastify'], 'https://new');
  });
});
