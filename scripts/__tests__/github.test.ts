import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseGitHubUrl, fetchGitHubDir, fetchLatestCommit, type FetchFn } from '../lib/github.ts';

describe('parseGitHubUrl', () => {
  it('parses a valid GitHub tree URL', () => {
    const ref = parseGitHubUrl('https://github.com/mcollina/skills/tree/main/skills/fastify');
    assert.equal(ref.owner, 'mcollina');
    assert.equal(ref.repo, 'skills');
    assert.equal(ref.branch, 'main');
    assert.equal(ref.path, 'skills/fastify');
  });

  it('parses a URL with a deep path', () => {
    const ref = parseGitHubUrl('https://github.com/org/repo/tree/v1.0/src/lib/utils');
    assert.equal(ref.owner, 'org');
    assert.equal(ref.repo, 'repo');
    assert.equal(ref.branch, 'v1.0');
    assert.equal(ref.path, 'src/lib/utils');
  });

  it('throws on a URL without /tree/', () => {
    assert.throws(
      () => parseGitHubUrl('https://github.com/mcollina/skills'),
      /Invalid GitHub tree URL/,
    );
  });

  it('throws on a non-GitHub URL', () => {
    assert.throws(
      () => parseGitHubUrl('https://gitlab.com/owner/repo/tree/main/path'),
      /Invalid GitHub tree URL/,
    );
  });
});

describe('fetchGitHubDir', () => {
  it('fetches files from a directory', async () => {
    const calls: string[] = [];
    const mockFetch: FetchFn = async (url) => {
      calls.push(url);
      if (url.includes('api.github.com')) {
        return JSON.stringify([
          {
            name: 'SKILL.md',
            type: 'file',
            download_url: 'https://raw.githubusercontent.com/mcollina/skills/main/skills/fastify/SKILL.md',
            path: 'skills/fastify/SKILL.md',
          },
        ]);
      }
      return '# Fastify Skill';
    };

    const files = await fetchGitHubDir(
      'https://github.com/mcollina/skills/tree/main/skills/fastify',
      mockFetch,
    );

    assert.equal(files.length, 1);
    assert.equal(files[0].relativePath, 'SKILL.md');
    assert.equal(files[0].content, '# Fastify Skill');
    assert.ok(calls[0].includes('api.github.com/repos/mcollina/skills/contents/skills/fastify?ref=main'));
  });

  it('recursively fetches subdirectories', async () => {
    const mockFetch: FetchFn = async (url) => {
      if (url.includes('contents/skills/fastify?')) {
        return JSON.stringify([
          { name: 'rules', type: 'dir', download_url: null, path: 'skills/fastify/rules' },
        ]);
      }
      if (url.includes('contents/skills/fastify/rules?')) {
        return JSON.stringify([
          {
            name: 'rule1.md',
            type: 'file',
            download_url: 'https://raw.githubusercontent.com/mcollina/skills/main/skills/fastify/rules/rule1.md',
            path: 'skills/fastify/rules/rule1.md',
          },
        ]);
      }
      return '# Rule 1';
    };

    const files = await fetchGitHubDir(
      'https://github.com/mcollina/skills/tree/main/skills/fastify',
      mockFetch,
    );

    assert.equal(files.length, 1);
    assert.equal(files[0].relativePath, 'rules/rule1.md');
    assert.equal(files[0].content, '# Rule 1');
  });

  it('skips entries with no download_url', async () => {
    const mockFetch: FetchFn = async (url) => {
      if (url.includes('api.github.com')) {
        return JSON.stringify([
          { name: 'file.md', type: 'file', download_url: null, path: 'path/file.md' },
        ]);
      }
      return '';
    };

    const files = await fetchGitHubDir(
      'https://github.com/owner/repo/tree/main/path',
      mockFetch,
    );
    assert.equal(files.length, 0);
  });
});

describe('fetchLatestCommit', () => {
  it('returns the sha of the latest commit for a path', async () => {
    const mockFetch: FetchFn = async (url) => {
      assert.ok(url.includes('api.github.com/repos/mcollina/skills/commits'));
      assert.ok(url.includes('path=skills/fastify'));
      assert.ok(url.includes('sha=main'));
      assert.ok(url.includes('per_page=1'));
      return JSON.stringify([{ sha: 'abc123def456abc123def456abc123def456abc1' }]);
    };

    const sha = await fetchLatestCommit(
      'https://github.com/mcollina/skills/tree/main/skills/fastify',
      mockFetch,
    );
    assert.equal(sha, 'abc123def456abc123def456abc123def456abc1');
  });

  it('throws when no commits are found', async () => {
    const mockFetch: FetchFn = async () => JSON.stringify([]);

    await assert.rejects(
      () => fetchLatestCommit('https://github.com/owner/repo/tree/main/path', mockFetch),
      /No commits found/,
    );
  });
});
