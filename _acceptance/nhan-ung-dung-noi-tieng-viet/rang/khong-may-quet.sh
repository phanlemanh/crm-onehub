#!/usr/bin/env bash
set -uo pipefail

RANG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Chan chong-lach: khong chan do nao duoc chung minh su vang mat bang cach DOC MA NGUON.
# Moi chan phai dung trinh duyet that, may chu that, hoac trinh bien dich.
VAT_THAT='puppeteer|curl|bun test|bunx tsc|fetch\(|createSourceFile\(|createProgram\('

DANH_SACH="${BAN_KHAI:-$RANG/danh-sach-chan.json}"
[ -f "$DANH_SACH" ] || { echo "KHONG DO DUOC: thieu ban khai chan do tai $DANH_SACH"; exit 2; }

BO_QUA="$(node -e 'const d=require(process.argv[1]);console.log([...(d.mienTru||[]),...(d.sieuDo||[])].map(c=>c.ten).join("\n"))' "$DANH_SACH")" || {
  echo "KHONG DO DUOC: khong doc duoc ban khai chan do tai $DANH_SACH"; exit 2; }
NGOAI_RANG="$(node -e 'const d=require(process.argv[1]);console.log((d.ngoaiRang||[]).map(c=>c.ten).join("\n"))' "$DANH_SACH")"
SO_NGOAI="$(printf '%s' "$NGOAI_RANG" | grep -c . || true)"

echo "-- dan so suy tu DIA: moi *.mjs va *.sh trong rang/, tru $(printf '%s' "$BO_QUA" | grep -c . || echo 0) muc bo qua da khai"
if [ "$SO_NGOAI" -gt 0 ]; then
  echo "   NGOAI PHAM VI QUET (khai truoc, $SO_NGOAI chan): $(printf '%s' "$NGOAI_RANG" | tr '\n' ' ')"
  echo "   chan nay chi duyet rang/; cac chan tren nam noi khac va KHONG duoc quet o day."
fi

hong=0
tong=0
for f in "$RANG"/*.mjs "$RANG"/*.sh; do
  ten="$(basename "$f")"
  printf '%s\n' "$BO_QUA" | grep -qxF "$ten" && continue
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
