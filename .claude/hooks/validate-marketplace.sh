#!/bin/bash
set -euo pipefail

stdout=$(claude plugin validate . 2>/dev/null)
exit_code=$?

if [ $exit_code -ne 0 ] || echo "$stdout" | grep -q '⚠'; then
  printf 'Marketplace validation issues found:\n%s\n' "$stdout" >&2
  exit 2
fi
