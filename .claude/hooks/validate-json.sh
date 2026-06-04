#!/bin/bash
set -euo pipefail

file_path=$(node -e '
let d = "";
process.stdin.on("data", c => d += c).on("end", () => {
  try { console.log(JSON.parse(d).tool_input?.file_path || ""); } catch {}
});
')

case "$file_path" in
  */plugin.json|*/marketplace.json|*/origins.json|*/.mcp.json|*/settings.json|*/settings.local.json)
    if ! node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" "$file_path" 2>/tmp/validate-json.err; then
      printf 'Invalid JSON in %s:\n%s\n' "$file_path" "$(cat /tmp/validate-json.err)" >&2
      exit 2
    fi
    ;;
esac
