#!/usr/bin/env bash
set -euo pipefail
git diff -U0 origin/release -- .github/workflows/auto-pr.yml |
	grep -qxF "+    if: github.repository == 'trycompai/crm'"
