#!/bin/sh
set -u
CHE_DO=${1:?"lanh | pha"}
LAN=${2:-1}
. "$(cd "$(dirname "$0")" && pwd)/chung.sh"

GHI="lanes.integration stale-tasks.integration close-task.integration keyless-brand.integration enrichment.integration log-loi-hoi-thoai.integration nhac-ke-hoach.integration nhac-qua-zalo.integration slack-membership.integration"
DAU="lanes.integration stale-tasks.integration close-task.integration keyless-brand.integration"
DUOI="enrichment.integration log-loi-hoi-thoai.integration nhac-ke-hoach.integration nhac-qua-zalo.integration slack-membership.integration"

G=$(dung_guong)
trap 'rm -rf "$G"' EXIT

case "$CHE_DO" in
lanh)
	TASKS_DIR="$AGENT"
	cp "$AGENT/test/tasks.integration.spec.ts" "$G/tasks.nguon.ts"
	;;
pha)
	TASKS_DIR="$G"
	sed -E 's/claimDue\(([0-9]+), MINE\)/claimDue(\1, RESEARCH)/g' "$AGENT/test/tasks.integration.spec.ts" >"$G/test/tasks.integration.spec.ts"
	if ! grep -q 'claimDue(10, RESEARCH)' "$G/test/tasks.integration.spec.ts"; then
		echo "THUOC-KHONG-CAN dot-bien-khong-an"
		exit 1
	fi
	cp "$G/test/tasks.integration.spec.ts" "$G/tasks.nguon.ts"
	;;
*)
	echo "che do la: $CHE_DO"
	exit 2
	;;
esac

N=$(dem_bai "$G/tasks.nguon.ts")
gieo() { (cd "$G" && NODE_ENV=test bun ./gieo.ts); }

xanh=0
tong=0
do_thu_tu=""
luot=0

chay_tasks() {
	thu_tu=$1
	k=$(gieo)
	echo "  truoc tasks: $k dong la den han chua thue"
	if [ "$k" -lt 22 ]; then
		echo "GIEO-DA-CAN $thu_tu"
		exit 1
	fi
	luot=$((luot + 1))
	chay_junit "$TASKS_DIR" "$G/t$luot.xml" ./test/tasks.integration.spec.ts
	bun "$HERE/doc-junit.ts" --junit "$G/t$luot.xml" >"$G/t$luot.txt"
	sed 's/^/  /' "$G/t$luot.txt"
	grep -q "^tests=$N failures=0 skipped=0$" "$G/t$luot.txt"
}

chay_ghi() {
	for f in "$@"; do
		chay_junit "$AGENT" "$G/w.xml" "./test/$f.spec.ts"
		echo "  $f: $(bun "$HERE/doc-junit.ts" --junit "$G/w.xml" | head -1)"
	done
}

for lan in $(seq 1 "$LAN"); do
	for thu_tu in dau giua cuoi; do
		echo "luot $lan $thu_tu"
		gieo >/dev/null
		case $thu_tu in
		dau) chay_tasks "$thu_tu"; ok=$?; chay_ghi $GHI ;;
		giua) chay_ghi $DAU; chay_tasks "$thu_tu"; ok=$?; chay_ghi $DUOI ;;
		cuoi) chay_ghi $GHI; chay_tasks "$thu_tu"; ok=$? ;;
		esac
		tong=$((tong + 1))
		if [ "$ok" = "0" ]; then xanh=$((xanh + 1)); else do_thu_tu="$do_thu_tu $thu_tu"; fi
	done
done

if [ "$CHE_DO" = "pha" ]; then
	code=0
	for thu_tu in dau giua cuoi; do
		case " $do_thu_tu " in
		*" $thu_tu "*) ;;
		*) echo "THUOC-KHONG-CAN chung-luot $thu_tu"; code=1 ;;
		esac
	done
	[ "$code" = "0" ] && echo "chung-luot pha: do 3/3 thu tu"
	exit $code
fi

echo "luot chung mot tien trinh"
k=$(gieo)
echo "  truoc ca lo: $k dong la den han chua thue"
set --
for f in $GHI tasks.integration; do set -- "$@" "./test/$f.spec.ts"; done
chay_junit "$AGENT" "$G/all.xml" "$@"
bun "$HERE/doc-junit.ts" --junit "$G/all.xml" --file test/tasks.integration.spec.ts >"$G/all.txt"
sed 's/^/  tasks: /' "$G/all.txt"
echo "  ca lo: $(bun "$HERE/doc-junit.ts" --junit "$G/all.xml" | head -1)"
tong=$((tong + 1))
if grep -q "^tests=$N failures=0 skipped=0$" "$G/all.txt"; then xanh=$((xanh + 1)); fi

if [ "$xanh" = "$tong" ]; then
	echo "chung-luot lanh: $xanh/$tong luot xanh"
	exit 0
fi
echo "chung-luot lanh: DO — $xanh/$tong luot xanh, do o:$do_thu_tu"
exit 1
