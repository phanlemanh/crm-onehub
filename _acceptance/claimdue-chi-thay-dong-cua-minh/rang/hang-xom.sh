#!/bin/sh
set -u
CHE_DO=${1:?"lanh | pha | pha-don-bang"}
. "$(cd "$(dirname "$0")" && pwd)/chung.sh"

NGUON=${HANG_XOM_NGUON:-$AGENT/test/tasks.integration.spec.ts}
CI_1="claimDue > claims due work and leases it"
CI_2="claimDue > does not hand the same row to two dispatchers"
CI_3="claimDue > leaves work that is not due yet"

G=$(dung_guong)
trap 'rm -rf "$G"' EXIT
BAN="$G/test/tasks.integration.spec.ts"

case "$CHE_DO" in
lanh)
	cp "$NGUON" "$BAN"
	;;
pha)
	sed -E 's/claimDue\(([0-9]+), MINE\)/claimDue(\1, RESEARCH)/g' "$NGUON" >"$BAN"
	if grep -q 'claimDue([0-9]*, MINE)' "$BAN" || ! grep -q 'claimDue(10, RESEARCH)' "$BAN"; then
		echo "THUOC-KHONG-CAN dot-bien-khong-an: ban sao pha van loc bang MINE"
		exit 1
	fi
	;;
pha-don-bang)
	awk '{print} /^beforeEach\(clear\);$/ {print "beforeEach(async () => { await db.agentTask.deleteMany({}); });"}' "$NGUON" >"$BAN"
	if ! grep -q 'await db.agentTask.deleteMany({}); });$' "$BAN"; then
		echo "THUOC-KHONG-CAN dot-bien-khong-an: khong chen duoc beforeEach xoa ca bang"
		exit 1
	fi
	;;
*)
	echo "che do la: $CHE_DO"
	exit 2
	;;
esac

N=$(dem_bai "$BAN")
HANG_XOM_OUT="$G/hx.jsonl"
export HANG_XOM_OUT
chay_junit "$G" "$G/j.xml" --preload ./hang-xom.preload.ts ./test/tasks.integration.spec.ts
bun "$HERE/doc-junit.ts" --junit "$G/j.xml" --hang-xom "$G/hx.jsonl" --khoi "$KHOI" >"$G/doc.txt"
cat "$G/doc.txt"

tests=$(sed -n 's/^tests=\([0-9]*\) .*/\1/p' "$G/doc.txt")
failures=$(sed -n 's/.* failures=\([0-9]*\) .*/\1/p' "$G/doc.txt")
skipped=$(sed -n 's/.* skipped=\([0-9]*\)$/\1/p' "$G/doc.txt")
dong=$(sed -n 's/^hang-xom-dong=\([0-9]*\) .*/\1/p' "$G/doc.txt")
bi_dung=$(grep -c '^HANG-XOM-BI-DUNG' "$G/doc.txt")
mat=$(grep -c '^HANG-XOM-MAT' "$G/doc.txt")
thieu=$(grep -c '^HANG-XOM-GIEO-THIEU' "$G/doc.txt")

if [ -z "$tests" ] || [ "$tests" != "$N" ] || [ "$skipped" != "0" ]; then
	echo "THUOC-KHONG-CHAY: file khai $N bai, JUnit ghi tests=${tests:-?} skipped=${skipped:-?}"
	tail -30 "$G/j.xml.log"
	exit 1
fi
if [ "$dong" != "$tests" ] || [ "$thieu" != "0" ]; then
	echo "THUOC-KHONG-CHAY: preload ghi $dong dong cho $tests bai, $thieu bai gieo thieu dong la"
	exit 1
fi

case "$CHE_DO" in
lanh)
	if [ "$failures" != "0" ] || [ "$bi_dung" != "0" ] || [ "$mat" != "0" ]; then
		echo "hang-xom lanh: DO — failures=$failures bi-dung=$bi_dung mat=$mat"
		exit 1
	fi
	echo "hang-xom lanh: $tests/$N bai xanh"
	echo "hang-xom lanh: 0 dong la bi dung"
	;;
pha)
	code=0
	for ten in "$CI_1" "$CI_2" "$CI_3"; do
		grep -qxF "FAIL $ten" "$G/doc.txt" || { echo "THUOC-KHONG-CAN $ten"; code=1; }
	done
	grep -qE "^HANG-XOM-BI-DUNG ($CI_1|$CI_2|$CI_3) \(" "$G/doc.txt" || { echo "THUOC-KHONG-CAN bo-do-bi-dung"; code=1; }
	[ "$code" = "0" ] && echo "hang-xom pha: do"
	exit $code
	;;
pha-don-bang)
	if [ "$mat" = "0" ]; then
		echo "THUOC-KHONG-CAN bo-do-mat"
		exit 1
	fi
	echo "hang-xom pha-don-bang: do"
	;;
esac
