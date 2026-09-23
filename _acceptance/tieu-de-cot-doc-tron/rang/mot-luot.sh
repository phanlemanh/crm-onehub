#!/usr/bin/env bash
set -u
KHOA="${TMPDIR:-/tmp}/crm-lan-do.khoa"
CHO_TOI_DA=1800
cho=0
until mkdir "$KHOA" 2>/dev/null; do
	cu=$(cat "$KHOA/pid" 2>/dev/null || true)
	if [ -n "$cu" ] && ! kill -0 "$cu" 2>/dev/null; then
		echo "mot-luot: go khoa mo coi cua tien trinh $cu da chet"
		rm -rf "$KHOA"
		continue
	fi
	if [ "$cho" -ge "$CHO_TOI_DA" ]; then
		echo "KHONG DO DUOC: mot-luot cho khoa $KHOA qua ${CHO_TOI_DA}s, tien trinh giu khoa: ${cu:-khong ro}"
		exit 2
	fi
	sleep 3
	cho=$((cho + 3))
done
echo $$ >"$KHOA/pid"
trap 'rm -rf "$KHOA"' EXIT
[ "$cho" -gt 0 ] && echo "mot-luot: da cho ${cho}s de toi luot"
export APP_URL="${APP_URL:-http://localhost:3500}"
export API_URL="${API_URL:-http://localhost:3501}"
bun scripts/lan-do/tien-de.mjs --chay "$1"
