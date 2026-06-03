export interface InjectionFinding {
  pattern: string;
  line: number;
  excerpt: string;
}

export interface ScanResult {
  relativePath: string;
  findings: InjectionFinding[];
}

interface Rule {
  name: string;
  regex: RegExp;
}

const RULES: Rule[] = [
  { name: 'ignore-previous-instructions', regex: /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions|prompts|messages|rules|directions)/i },
  { name: 'disregard-instructions', regex: /disregard\s+(all\s+)?(previous|prior|above|the)\s+(instructions|prompts|system)/i },
  { name: 'forget-instructions', regex: /forget\s+(all\s+)?(previous|prior|everything|your)\s+(instructions|prompt|rules)/i },
  { name: 'override-system-prompt', regex: /(override|reveal|print|leak|reveal|exfiltrate|disclose)\s+(your\s+)?(system|hidden)\s+(prompt|instructions|message)/i },
  { name: 'fake-system-tag', regex: /<\s*\|?\s*(im_start|im_end|system|\/?s|start_of_turn|end_of_turn)\s*\|?\s*>/i },
  { name: 'fake-inst-tag', regex: /\[\s*\/?\s*INST\s*\]/ },
  { name: 'role-override', regex: /you\s+are\s+now\s+(a|an|the)?\s*(developer|admin|root|jailbroken|unfiltered|dan)/i },
  { name: 'jailbreak-dan', regex: /\b(DAN|do\s+anything\s+now)\b/i },
  { name: 'tool-exfiltration', regex: /(curl|wget)\s+[^\n]*\|\s*(sh|bash|zsh)/i },
  { name: 'send-credentials', regex: /(send|post|upload|exfiltrate)\s+[^\n]{0,40}(api[_\s-]?key|token|secret|password|env|credentials)/i },
  { name: 'hidden-prompt-injection', regex: /prompt\s+injection|injected\s+prompt/i },
  { name: 'override-claude-md', regex: /(overrides?|replaces?)\s+(any\s+)?(default|previous)\s+(behavior|instructions)/i },
];

const TEXT_EXTENSIONS = new Set([
  '.md', '.markdown', '.txt', '.json', '.yaml', '.yml', '.toml',
  '.js', '.ts', '.mjs', '.cjs', '.tsx', '.jsx',
  '.sh', '.bash', '.zsh', '.fish',
  '.py', '.rb', '.go', '.rs',
  '.html', '.xml', '.css',
]);

function isTextPath(relativePath: string): boolean {
  const dot = relativePath.lastIndexOf('.');
  if (dot === -1) return true;
  return TEXT_EXTENSIONS.has(relativePath.slice(dot).toLowerCase());
}

export function scanContent(content: string): InjectionFinding[] {
  const findings: InjectionFinding[] = [];
  const lines = content.split('\n');
  for (const rule of RULES) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (rule.regex.test(line)) {
        findings.push({
          pattern: rule.name,
          line: i + 1,
          excerpt: line.trim().slice(0, 160),
        });
      }
    }
  }
  return findings;
}

export interface ScanInput {
  relativePath: string;
  content: string;
}

export function scanFiles(files: ScanInput[]): ScanResult[] {
  const results: ScanResult[] = [];
  for (const file of files) {
    if (!isTextPath(file.relativePath)) continue;
    const findings = scanContent(file.content);
    if (findings.length > 0) {
      results.push({ relativePath: file.relativePath, findings });
    }
  }
  return results;
}

export function formatScanResults(label: string, results: ScanResult[]): string {
  const lines = [`Prompt injection check failed for ${label}:`];
  for (const result of results) {
    lines.push(`  ${result.relativePath}`);
    for (const finding of result.findings) {
      lines.push(`    L${finding.line} [${finding.pattern}] ${finding.excerpt}`);
    }
  }
  return lines.join('\n');
}
