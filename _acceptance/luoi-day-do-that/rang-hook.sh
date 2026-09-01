#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HOOK="$ROOT/.githooks/pre-push"
CHAN="${2:-}"
[ "${1:-}" = "--chan" ] || { echo "rang-hook: dùng --chan ep-chay|con-rang|loi-thoat|tro-dung"; exit 2; }

FIX="$(mktemp -d)"
trap 'rm -rf "$FIX"' EXIT

SHA="$(git -C "$ROOT" rev-parse HEAD)"
REF() { printf 'refs/heads/onehub %s refs/heads/onehub %s\n' "$SHA" "$SHA"; }

case "$CHAN" in
  ep-chay)
    cd "$ROOT" || exit 2
    OUT="$(REF | bash "$HOOK" 2>&1)"
    CODE=$?
    if [ "$CODE" -ne 0 ]; then
      echo "RANG DO: hook do tren cay dang sach"
      printf '%s' "$OUT" | tail -5
      exit 1
    fi
    DONG_CACHE="$(printf '%s' "$OUT" | grep -c 'Cached:')"
    if [ "$DONG_CACHE" -lt 3 ]; then
      echo "RANG CUN: chi thay $DONG_CACHE dong tong ket turbo, ky vong it nhat 3"
      exit 1
    fi
    XAU="$(printf '%s' "$OUT" | grep 'Cached:' | grep -v 'Cached:[[:space:]]*0 cached')"
    if [ -n "$XAU" ]; then
      echo "RANG DO: con tac vu doc tu bo nho dem — luoi day khong do gi"
      printf '%s\n' "$XAU"
      exit 1
    fi
    printf '%s' "$OUT" | grep 'Cached:' | sed 's/^/  /'
    echo "rang-hook ep-chay: moi tac vu turbo cua luoi day deu chay that, 0 doc tu dem"
    ;;
  con-rang)
    sed 's/^for task in .*$/for task in khong-co-tac-vu-nay; do/' "$HOOK" > "$FIX/hook"
    DIFF_N=$(diff "$HOOK" "$FIX/hook" | grep -c '^[<>]')
    if [ "$DIFF_N" -ne 2 ]; then
      echo "RANG CUN: dot bien lech $DIFF_N dong, ky vong 2"
      exit 1
    fi
    cd "$ROOT" || exit 2
    OUT="$(REF | bash "$FIX/hook" 2>&1)"
    CODE=$?
    if [ "$CODE" -eq 0 ]; then
      echo "RANG CUN: mot tac vu hong ma luoi day van cho di — luoi khong chan gi"
      exit 1
    fi
    if ! printf '%s' "$OUT" | grep -q 'would have failed CI'; then
      echo "RANG CUN: luoi chan nhung khong noi vi sao"
      exit 1
    fi
    echo "rang-hook con-rang: mot tac vu hong thi luoi day chan, exit $CODE"
    ;;
  loi-thoat)
    cd "$ROOT" || exit 2
    S=$(date +%s)
    OUT="$(REF | CRM_SKIP_HOOKS=1 bash "$HOOK" 2>&1)"
    CODE=$?
    GIAY=$(( $(date +%s) - S ))
    if [ "$CODE" -ne 0 ]; then
      echo "RANG DO: loi thoat khan cap khong con di duoc"
      exit 1
    fi
    if [ -n "$OUT" ]; then
      echo "RANG CUN: loi thoat van chay tac vu — dang le phai ra ngay"
      exit 1
    fi
    if [ "$GIAY" -gt 3 ]; then
      echo "RANG CUN: loi thoat mat $GIAY giay, dang le tuc thi"
      exit 1
    fi
    echo "rang-hook loi-thoat: CRM_SKIP_HOOKS ra ngay, khong chay tac vu nao, $GIAY giay"
    ;;
  tro-dung)
    CT="$ROOT/_acceptance/sua-test-do-thu-tu-nap/contract.md"
    TEN="$(grep -o 'rang-config\.sh --chan [a-z-]*' "$CT" | head -1 | awk '{print $NF}')"
    if [ -z "$TEN" ]; then
      echo "khong thay ho so da ky tro toi chan rang nao"
      exit 1
    fi
    if [ "$TEN" = "o-cam" ]; then
      echo "ho so da ky con tro toi bi danh gop 'o-cam', khong phai chan cham tieu chi"
      exit 1
    fi
    if ! bash "$ROOT/_acceptance/sua-test-do-thu-tu-nap/rang-config.sh" --chan "$TEN" >/dev/null 2>&1; then
      echo "ten chan '$TEN' ma ho so tro toi khong chay duoc"
      exit 1
    fi
    echo "rang-hook tro-dung: ho so da ky tro toi chan '$TEN', va chan do chay that"
    ;;
  *)
    echo "rang-hook: chan la $CHAN"
    exit 2
    ;;
esac
