#!/usr/bin/env bash
set -u
GOC="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$GOC" || exit 3

chay() {
	local ten="$1"
	shift
	printf '%s\n' "--- $ten"
	( "$@" )
	local ma=$?
	if [ "$ma" -ne 0 ]; then
		printf 'ho-so-cu-con-chay: lenh %s thoat %s\n' "$ten" "$ma"
		exit "$ma"
	fi
}

chayAgent() {
	local ten="$1"
	shift
	printf '%s\n' "--- $ten"
	( cd "$GOC/apps/agent" && "$@" )
	local ma=$?
	if [ "$ma" -ne 0 ]; then
		printf 'ho-so-cu-con-chay: lenh %s thoat %s\n' "$ten" "$ma"
		exit "$ma"
	fi
}

chayApi() {
	local ten="$1"
	shift
	printf '%s\n' "--- $ten"
	( cd "$GOC/apps/api" && "$@" )
	local ma=$?
	if [ "$ma" -ne 0 ]; then
		printf 'ho-so-cu-con-chay: lenh %s thoat %s\n' "$ten" "$ma"
		exit "$ma"
	fi
}

R=_acceptance/do-quyen-luot-bang-hanh-vi/rang

chayAgent dq_cong_quyen bun test test/quyen-luot.spec.ts
chay dq_khong_cam_tin_nhan node "$R/khong-cam-tin-nhan.mjs"
chay dq_nguon_ghi node "$R/nguon-ghi.mjs"
chay dq_bo_do_grep node "$R/bo-do-grep.mjs"
chay dq_khai_sinh node "$R/khai-sinh.mjs"
chay dq_ho_so_cu_con_chay bash "$R/ho-so-cu-con-chay.sh"
chayAgent ql_quyen_ke_thua bun test test/quyen-luot.spec.ts -t ke-thua
chayAgent ql_khong_suy_dien bun test test/quyen-luot.spec.ts -t suy-dien
chayApi ql_api_doc_ban_ghi bun test test/quyen-luot.spec.ts

printf 'ho-so-cu-con-chay: chin lenh may cua hai ho so da ky deu thoat 0\n'
