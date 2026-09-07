#!/usr/bin/env bash
set -euo pipefail
git diff --numstat origin/release -- .github/workflows/auto-pr.yml |
	tr '\t' ' ' |
	grep -qx '1 0 .github/workflows/auto-pr.yml'
