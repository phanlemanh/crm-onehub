#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHAN="${2:-}"
[ "${1:-}" = "--chan" ] || { echo "rang-microsoft: dùng --chan duong|do|hinh-thuc"; exit 2; }

TDB="$(grep '^TEST_DATABASE_URL=' "$ROOT/.env" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"')"
[ -n "$TDB" ] || { echo "khong doc duoc TEST_DATABASE_URL tu .env goc"; exit 2; }

chay() {
  cd "$ROOT/apps/api" || exit 2
  env -i PATH="$PATH" HOME="$HOME" CRM_TELEMETRY_DISABLED=1 TEST_DATABASE_URL="$TDB" \
    MICROSOFT_CLIENT_ID="dat-tu-ben-ngoai" MICROSOFT_CLIENT_SECRET="dat-tu-ben-ngoai" \
    bun test --preload "$1" test/auth.e2e.spec.ts 2>&1
}

so_do() { printf '%s' "$1" | grep -Eo '^ *[0-9]+ fail' | tail -1 | grep -Eo '[0-9]+'; }

case "$CHAN" in
  duong)
    OUT="$(chay "$ROOT/apps/api/test/setup.ts")"
    printf '%s' "$OUT" | grep -E '^ *[0-9]+ (pass|fail)'
    FAIL="$(so_do "$OUT")"
    if [ "${FAIL:-1}" -ne 0 ]; then
      echo "RANG DO: bai kiem dang nhap do du bo nap truoc da go hai khoa Microsoft"
      exit 1
    fi
    echo "rang-microsoft duong: khong khai khoa Microsoft thi may chu bao khong co, bai kiem xanh"
    ;;
  do)
    OUT="$(chay "$HERE/preload-mutant.ts")"
    printf '%s' "$OUT" | grep -E '^ *[0-9]+ (pass|fail)'
    FAIL="$(so_do "$OUT")"
    if [ "${FAIL:-0}" -eq 0 ]; then
      echo "RANG CUN: khai hai khoa Microsoft ma bai kiem van xanh — khang dinh khong do gi"
      exit 1
    fi
    if [ "$FAIL" -ne 1 ]; then
      echo "RANG CUN: chieu do lam $FAIL ca do, ky vong dung 1 — co thu khac gay nhieu"
      exit 1
    fi
    if ! printf '%s' "$OUT" | grep -q '(fail).*lets the sign-in page read what it may offer'; then
      echo "RANG CUN: co bai do nhung khong phai bai dang nhap"
      exit 1
    fi
    echo "rang-microsoft do: khai khoa Microsoft thi DUNG MOT bai do, va do la bai dang nhap"
    ;;
  hinh-thuc)
    N="$(grep -c 'process\.env' "$ROOT/apps/api/test/auth.e2e.spec.ts")"
    if [ "$N" -ne 0 ]; then
      echo "bai kiem con $N cho doc process.env — ky vong phai la hang so"
      exit 1
    fi
    if ! grep -q 'microsoft: false' "$ROOT/apps/api/test/auth.e2e.spec.ts"; then
      echo "khong thay ky vong hang so 'microsoft: false' trong bai kiem"
      exit 1
    fi
    echo "rang-microsoft hinh-thuc: ky vong la hang so, khong doc moi truong"
    ;;
  *)
    echo "rang-microsoft: chan la $CHAN"
    exit 2
    ;;
esac
