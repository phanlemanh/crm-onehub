#!/usr/bin/env bash
set -uo pipefail
RANG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$RANG/../../.." && pwd)"
XUAT="$ROOT/_acceptance/nhan-ung-dung-noi-tieng-viet/evidence/E10-chu-hien-ra.txt"

cd "$ROOT" || exit 2
mkdir -p "$(dirname "$XUAT")"
echo "# Chu that hien ra o moi tieu de cot — dau vao bat buoc cua E14" > "$XUAT"

hong=0
for man in companies contacts deals; do
  for w in 768 1024 1280 1440; do
    if ! DUONG="$man" BE_RONG="$w" XUAT="$XUAT" node "$RANG/ban-ve.mjs" be-rong \
      | grep -E '^ket qua'; then
      hong=$((hong + 1))
    fi
  done
done
echo "ket qua: o hong=$hong/12"
exit $((hong > 0 ? 1 : 0))
