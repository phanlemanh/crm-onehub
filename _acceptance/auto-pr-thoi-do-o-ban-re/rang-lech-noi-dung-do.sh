#!/usr/bin/env bash
set -euo pipefail
test -z "$(git diff -U0 origin/release 5ac85ef -- .github/workflows/auto-pr.yml | grep -F 'if: github.repository')"
