#!/bin/sh
set -u
. "$(cd "$(dirname "$0")" && pwd)/chung.sh"

BAI_GIU="claimDue > leaves a visible kind to the visible lane"
FILES="tasks.integration lanes.integration"

G=$(mktemp -d "${TMPDIR:-/tmp}/claimdue-except.XXXXXX")
trap 'rm -rf "$G"' EXIT

kiem() {
	noi=$1
	nhan=$2
	for f in $FILES; do
		n=$(dem_bai "$AGENT/test/$f.spec.ts")
		chay_junit "$noi" "$G/$nhan-$f.xml" "./test/$f.spec.ts"
		bun "$HERE/doc-junit.ts" --junit "$G/$nhan-$f.xml" >"$G/$nhan-$f.txt"
		echo "$nhan $f: $(head -1 "$G/$nhan-$f.txt")"
		grep '^FAIL' "$G/$nhan-$f.txt"
		if ! grep -q "^tests=$n " "$G/$nhan-$f.txt"; then
			echo "THUOC-KHONG-CHAY: $f khai $n bai"
			tail -20 "$G/$nhan-$f.xml.log"
			exit 1
		fi
	done
}

kiem "$AGENT" that
for f in $FILES; do
	if ! grep -q ' failures=0 ' "$G/that-$f.txt"; then
		echo "do tren ma that: $f"
		exit 1
	fi
done

mkdir -p "$G/test" "$G/agent/lib"
ln -s "$AGENT/node_modules" "$G/node_modules"
for f in "$AGENT"/agent/lib/*; do ln -s "$f" "$G/agent/lib/$(basename "$f")"; done
rm "$G/agent/lib/tasks.ts"
for f in $FILES; do cp "$AGENT/test/$f.spec.ts" "$G/test/"; done
if [ "${KHONG_DOT_BIEN:-0}" = "1" ]; then
	cp "$AGENT/agent/lib/tasks.ts" "$G/agent/lib/tasks.ts"
else
	sed 's/ELSE t2\.kind <> ALL(\${list}::text\[\])/ELSE TRUE/' "$AGENT/agent/lib/tasks.ts" >"$G/agent/lib/tasks.ts"
	if ! grep -q 'ELSE TRUE$' "$G/agent/lib/tasks.ts"; then
		echo "THUOC-KHONG-CAN dot-bien-khong-an: khong tim thay nhanh except trong tasks.ts"
		exit 1
	fi
fi

kiem "$G" dot-bien
if ! grep -qxF "FAIL $BAI_GIU" "$G/dot-bien-tasks.integration.txt"; then
	echo "NHANH-EXCEPT-MO-COI: nhanh except bo qua bo loc ma '$BAI_GIU' khong do"
	exit 1
fi
echo "nhanh except co nguoi giu: ma that xanh, dot bien do o '$BAI_GIU'"
