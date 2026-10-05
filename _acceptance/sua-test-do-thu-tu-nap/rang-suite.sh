#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CHAN="${2:-}"
[ "${1:-}" = "--chan" ] || { echo "rang-suite: dùng --chan sach|thu-tu"; exit 2; }

TDB="${TEST_DATABASE_URL:-$(grep '^TEST_DATABASE_URL=' "$ROOT/.env" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"')}"
[ -n "$TDB" ] || { echo "khong doc duoc TEST_DATABASE_URL tu .env goc"; exit 2; }

run_sach() {
  cd "$ROOT/apps/api" || exit 2
  env -i PATH="$PATH" HOME="$HOME" CRM_TELEMETRY_DISABLED=1 TEST_DATABASE_URL="$TDB" \
    bun test "$@" 2>&1
}

run_khong_google() {
  cd "$ROOT/apps/api" || exit 2
  env -i PATH="$PATH" HOME="$HOME" CRM_TELEMETRY_DISABLED=1 TEST_DATABASE_URL="$TDB" \
    GOOGLE_CLIENT_ID= GOOGLE_CLIENT_SECRET= \
    bun test "$@" 2>&1
}

case "$CHAN" in
  sach)
    OUT="$(run_sach --preload ./test/setup.ts)"
    echo "$OUT" | tail -4
    PASS="$(printf '%s' "$OUT" | grep -Eo '^ *[0-9]+ pass' | tail -1 | grep -Eo '[0-9]+')"
    FAIL="$(printf '%s' "$OUT" | grep -Eo '^ *[0-9]+ fail' | tail -1 | grep -Eo '[0-9]+')"
    [ -n "$PASS" ] && [ -n "$FAIL" ] || { echo "khong doc duoc so ca"; exit 1; }
    if [ "$FAIL" -ne 0 ]; then
      echo "RANG DO: $FAIL ca do trong moi truong sach"
      exit 1
    fi
    if [ "$PASS" -lt 381 ]; then
      echo "so ca lech ky vong: >=381 -> $PASS"
      exit 1
    fi
    echo "rang-suite sach: $PASS pass, $FAIL fail"
    ;;
  thu-tu)
    PAIR="test/agent-lifecycle.spec.ts test/auth.e2e.spec.ts"
    echo "-- chieu duong: co preload"
    OUT="$(run_khong_google --preload ./test/setup.ts $PAIR)"
    echo "$OUT" | grep -E '^ *[0-9]+ (pass|fail)'
    FAIL="$(printf '%s' "$OUT" | grep -Eo '^ *[0-9]+ fail' | tail -1 | grep -Eo '[0-9]+')"
    [ "${FAIL:-1}" -eq 0 ] || { echo "RANG DO: cap file do du da co preload"; exit 1; }
    echo "-- chieu do: bo preload di"
    OUT="$(run_khong_google $PAIR)"
    echo "$OUT" | grep -E '^ *[0-9]+ (pass|fail)'
    FAIL="$(printf '%s' "$OUT" | grep -Eo '^ *[0-9]+ fail' | tail -1 | grep -Eo '[0-9]+')"
    if [ "${FAIL:-0}" -eq 0 ]; then
      echo "RANG CUN: bo preload ma cap file van xanh — phep do khong do gi"
      exit 1
    fi
    echo "rang-suite thu-tu: hai chieu dung, bo preload thi $FAIL ca do"
    ;;
  *)
    echo "rang-suite: chan la $CHAN"
    exit 2
    ;;
esac
