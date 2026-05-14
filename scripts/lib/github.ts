import https from 'node:https';

export interface GitHubRef {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

export interface GitHubFile {
  relativePath: string;
  content: string;
}

export type FetchFn = (url: string) => Promise<string>;

export function parseGitHubUrl(url: string): GitHubRef {
  const match = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+)$/);
  if (!match) throw new Error(`Invalid GitHub tree URL: ${url}`);
  return { owner: match[1], repo: match[2], branch: match[3], path: match[4] };
}

function httpGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = {
      'User-Agent': 'plugin-sync/1.0',
      Accept: 'application/vnd.github.v3+json',
    };
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const req = https.get(url, { headers }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        httpGet(res.headers.location).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    });
    req.on('error', reject);
  });
}

interface GHEntry {
  name: string;
  type: 'file' | 'dir';
  download_url: string | null;
  path: string;
}

async function fetchDir(ref: GitHubRef, dirPath: string, fetch: FetchFn): Promise<GitHubFile[]> {
  const apiUrl = `https://api.github.com/repos/${ref.owner}/${ref.repo}/contents/${dirPath}?ref=${ref.branch}`;
  const body = await fetch(apiUrl);
  const entries = JSON.parse(body) as GHEntry[];
  const results: GitHubFile[] = [];

  for (const entry of entries) {
    const relativePath = entry.path.slice(ref.path.length + 1);
    if (entry.type === 'file' && entry.download_url) {
      const content = await fetch(entry.download_url);
      results.push({ relativePath, content });
    } else if (entry.type === 'dir') {
      const sub = await fetchDir(ref, entry.path, fetch);
      results.push(...sub);
    }
  }
  return results;
}

export async function fetchGitHubDir(url: string, fetch: FetchFn = httpGet): Promise<GitHubFile[]> {
  const ref = parseGitHubUrl(url);
  return fetchDir(ref, ref.path, fetch);
}
