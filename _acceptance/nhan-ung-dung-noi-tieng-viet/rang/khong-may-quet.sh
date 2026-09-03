#!/usr/bin/env bash
set -uo pipefail

RANG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Chan chong-lach: khong chan do nao duoc chung minh su vang mat bang cach DOC MA NGUON.
# Moi chan phai dung trinh duyet that, may chu that, hoac trinh bien dich.
VAT_THAT='puppeteer|curl|bun test|bunx tsc|fetch\('

hong=0
tong=0
for f in "$RANG"/*.mjs "$RANG"/*.sh; do
  ten="$(basename "$f")"
  case "$ten" in
    khong-may-quet.sh|be-mat.mjs|lat.mjs|viet-tat.ts) continue ;;
  esac
  # chan dem pham vi duoc phep doc ma nguon; chung khong phai phep do nghiem thu
  case "$ten" in
    dem-pham-vi.mjs|phan-loai.mjs|kiem-ke.mjs|kiem-ban-dich.mjs|xuat-hinh.mjs) continue ;;
  esac
  tong=$((tong + 1))
  if grep -qE "$VAT_THAT" "$f"; then
    echo "   dung vat that  $ten"
    continue
  fi

  qua=""
  KHOI_CHAY='spawnSync|execFileSync|execSync|spawn\(|exec\(|(^|[^a-z])node |(^|[^a-z])bash '
  for goi in $(grep -E "$KHOI_CHAY" "$f" | grep -oE '[a-z0-9-]+\.mjs' | sort -u); do
    [ "$goi" = "$ten" ] && continue
    [ -f "$RANG/$goi" ] || continue
    grep -qE "$VAT_THAT" "$RANG/$goi" || continue
    qua="$goi"
    break
  done

  if [ -n "$qua" ]; then
    echo "   qua $qua  $ten — cham san pham bang cach chay $qua"
  else
    echo "   CHI DOC MA     $ten — chan nay khong cham toi san pham dang chay"
    hong=$((hong + 1))
  fi
done

if [ "$tong" -eq 0 ]; then
  echo "RANG CUN: khong tim thay chan do nao de kiem"
  exit 2
fi

echo "ket qua: chan chi doc ma=$hong/$tong"
exit $((hong > 0 ? 1 : 0))
