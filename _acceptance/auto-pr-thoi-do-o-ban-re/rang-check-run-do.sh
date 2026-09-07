#!/usr/bin/env bash
set -euo pipefail
gh api repos/phanlemanh/crm-onehub/commits/5ac85ef/check-runs \
	--jq '.check_runs[] | .name + " = " + (.conclusion // .status)' |
	grep -qx 'Open a pull request into main = failure'
