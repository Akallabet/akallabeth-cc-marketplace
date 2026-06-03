import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ScanResult } from './prompt-injection.ts';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = join(dirname(__filename), '..', '..');

export const REPORT_PATH = join(REPO_ROOT, 'reports', 'prompt-injection.json');

export interface ReportEntry {
  source: 'import' | 'update';
  plugin: string;
  type: string;
  name: string;
  url: string;
  status: 'clean' | 'blocked';
  scannedFiles: number;
  findings: ScanResult[];
}

export interface Report {
  generatedAt: string;
  entries: ReportEntry[];
}

export async function writeReport(report: Report): Promise<string> {
  await mkdir(dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf8');
  return REPORT_PATH;
}
