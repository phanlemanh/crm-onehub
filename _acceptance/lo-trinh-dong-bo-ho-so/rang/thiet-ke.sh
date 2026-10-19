#!/usr/bin/env bash
set -uo pipefail
GOC="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$GOC"
NEO="$(bash "$GOC/_acceptance/lo-trinh-dong-bo-ho-so/rang/neo.sh")" || { echo "$NEO"; exit 2; }
read -r TU TOI <<<"$NEO"
AG="${CLAUDE_PLUGIN_ROOT:-$(node scripts/resolve-plugin.mjs --plugin acceptance-gate --require scripts/design-gate.mjs --require scripts/design-scan.js)}"
sai=0
for f in apps/app/components/lo-trinh/*.tsx apps/app/components/detail-sheet.tsx; do
	if node "$AG/scripts/design-gate.mjs" --target "$f" --mode static >/dev/null 2>&1; then :; else
		echo "SAI design-gate P0: $f"; sai=1
	fi
done
[ $sai -eq 0 ] && echo "DUNG design-gate tinh khong P0"
goi=$(git grep -l '@/components/detail-sheet' -- apps/app ':!apps/app/components/lo-trinh' ':!apps/app/components/detail-sheet.tsx')
doi=$(git diff --name-only "$TU" ${TOI:-} -- $goi)
if [ -n "$doi" ]; then echo "SAI cho goi cu cua khung chung bi sua: $(echo $doi)"; sai=1; else echo "DUNG cho goi cu cua khung chung khong doi ($(echo "$goi" | wc -l | tr -d ' ') tep)"; fi
xoa=$(git diff --numstat "$TU" ${TOI:-} -- apps/app/components/detail-sheet.tsx | awk '{print $2}')
xoa=${xoa:-0}
if [ "$xoa" -le 2 ]; then echo "DUNG khung chung chi cong them (xoa $xoa dong)"; else echo "SAI khung chung bi xoa $xoa dong"; sai=1; fi
echo "KET LUAN: ma thoat $sai"
exit $sai
