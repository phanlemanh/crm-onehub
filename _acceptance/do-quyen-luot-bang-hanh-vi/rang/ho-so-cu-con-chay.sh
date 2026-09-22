#!/usr/bin/env bash
set -u
GOC="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$GOC/apps/agent" || exit 2

TEN=(ql_quyen_ke_thua ql_khong_suy_dien ql_con_biet_cua_ra ql_cong_dong_that)
LOC=(ke-thua suy-dien cua-ra cong-dong)

for i in "${!TEN[@]}"; do
	printf 'ho so cu: %s (-t %s)\n' "${TEN[$i]}" "${LOC[$i]}"
	bun test test/quyen-luot.spec.ts -t "${LOC[$i]}"
	ma=$?
	if [ "$ma" -ne 0 ]; then
		printf 'lenh may cua ho so cu that bai: %s (ma %s)\n' "${TEN[$i]}" "$ma" >&2
		exit "$ma"
	fi
done

printf 'bon lenh may cua ho so cu deu thoat 0\n'
