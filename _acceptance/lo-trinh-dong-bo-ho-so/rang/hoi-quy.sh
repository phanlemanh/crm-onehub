#!/usr/bin/env bash
set -euo pipefail
GOC="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$GOC"
NEO="$(bash "$GOC/_acceptance/lo-trinh-dong-bo-ho-so/rang/neo.sh")" || { echo "$NEO"; exit 2; }
read -r TU TOI <<<"$NEO"
if ! git diff --quiet "$TU" ${TOI:-} -- apps/app/test/lo-trinh.dom.tsx apps/app/test/ngan-ban-ghi-giu.dom.tsx; then
	echo "SAI bai kiem cu bi sua: $(git diff --name-only "$TU" ${TOI:-} -- apps/app/test/lo-trinh.dom.tsx apps/app/test/ngan-ban-ghi-giu.dom.tsx | tr '\n' ' ')"
	exit 1
fi
echo "DUNG bai kiem cu khong doi so voi $TU..${TOI:-cay}"
DOM="bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts"
chay() {
	local nhan="$1"; shift
	if (cd "$GOC" && bash -c "$*"); then echo "DUNG $nhan"; else echo "SAI $nhan"; exit 1; fi
}
for t in hien loc vong-doi cach-xem ho-so da-bac khoan-dung chi-doc; do
	chay "ltc_$t" "cd apps/app && TZ=Asia/Ho_Chi_Minh $DOM ./test/lo-trinh.dom.tsx -t $t"
done
chay ltc_ngay "cd apps/app && TZ=Asia/Ho_Chi_Minh bun test ./test/lo-trinh-ngay.spec.ts && TZ=UTC bun test ./test/lo-trinh-ngay.spec.ts && TZ=Asia/Ho_Chi_Minh $DOM ./test/lo-trinh.dom.tsx -t ngay"
chay ltc_ban_chep "node _acceptance/trang-lo-trinh-trong-crm/rang/ban-chep.mjs"
chay ltc_mau "node _acceptance/trang-lo-trinh-trong-crm/rang/kiem-mau.mjs"
chay ltc_loi "node _acceptance/trang-lo-trinh-trong-crm/rang/chu-cung.mjs && cd apps/app && bun test ./test/messages-guard.spec.ts"
chay ngan_ban_ghi "cd apps/app && $DOM ./test/ngan-ban-ghi-giu.dom.tsx"
echo "KET LUAN: hoi quy xanh"
