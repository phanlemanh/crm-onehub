#!/usr/bin/env bash
set -uo pipefail
RANG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$RANG/../../.." && pwd)"
XUAT="$ROOT/_acceptance/nhan-ung-dung-noi-tieng-viet/evidence/E10-chu-hien-ra.txt"

cd "$ROOT" || exit 2
mkdir -p "$(dirname "$XUAT")"
echo "# Chu that hien ra o moi tieu de cot — dau vao bat buoc cua E14" > "$XUAT"

hong=0
for man in ${MAN_EP:-companies contacts deals}; do
  for w in ${BE_RONG_EP:-768 1024 1280 1440}; do
    ra="$(DUONG="$man" BE_RONG="$w" XUAT="$XUAT" node "$RANG/ban-ve.mjs" be-rong 2>&1)"
    ma=$?
    printf '%s\n' "$ra" | grep -E '^ket qua' || true
    if [ "$ma" -ne 0 ]; then
      echo "   O HONG: $man ${w}px — chan con tra ma $ma"
      hong=$((hong + 1))
    fi
  done
done
echo "ket qua: o hong=$hong/12"
exit $((hong > 0 ? 1 : 0))
