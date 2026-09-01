#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CHAN="${2:-}"
[ "${1:-}" = "--chan" ] || { echo "rang-microsoft: dùng --chan duong|do|hinh-thuc|nguon-env"; exit 2; }

SETUP="$ROOT/apps/api/test/setup.ts"
MUTANT="$ROOT/apps/api/test/rang-mutant-$$.ts"
FIX="$(mktemp -d)"
cleanup() { rm -f "$MUTANT"; rm -rf "$FIX"; }
trap cleanup EXIT

TDB="$(grep '^TEST_DATABASE_URL=' "$ROOT/.env" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"')"
[ -n "$TDB" ] || { echo "khong doc duoc TEST_DATABASE_URL tu .env goc"; exit 2; }

chay() {
  cd "$ROOT/apps/api" || exit 2
  env -i PATH="$PATH" HOME="$HOME" CRM_TELEMETRY_DISABLED=1 TEST_DATABASE_URL="$TDB" \
    MICROSOFT_CLIENT_ID="dat-tu-shell" MICROSOFT_CLIENT_SECRET="dat-tu-shell" \
    bun test --preload "$1" test/auth.e2e.spec.ts 2>&1
}

so_do() { printf '%s' "$1" | grep -Eo '^ *[0-9]+ fail' | tail -1 | grep -Eo '[0-9]+'; }

case "$CHAN" in
  duong)
    OUT="$(chay "$SETUP")"
    printf '%s' "$OUT" | grep -E '^ *[0-9]+ (pass|fail)'
    FAIL="$(so_do "$OUT")"
    if [ "${FAIL:-1}" -ne 0 ]; then
      echo "RANG DO: bai kiem dang nhap do du bo nap truoc da lam rong hai khoa Microsoft"
      exit 1
    fi
    echo "rang-microsoft duong: khoa Microsoft dat tu shell van bi lam rong, may chu bao khong co, bai kiem xanh"
    ;;
  do)
    sed 's/^blank(/fallback(/; s/"MICROSOFT_CLIENT_ID");/"MICROSOFT_CLIENT_ID", "test-microsoft-client-id");/; s/"MICROSOFT_CLIENT_SECRET");/"MICROSOFT_CLIENT_SECRET", "test-microsoft-client-secret");/' "$SETUP" > "$MUTANT"
    DIFF_N=$(diff "$SETUP" "$MUTANT" | grep -c '^[<>]')
    if [ "$DIFF_N" -ne 4 ]; then
      echo "RANG CUN: dot bien lech $DIFF_N dong, ky vong 4 (dung 2 dong doi) — dot bien khong toi thieu"
      diff "$SETUP" "$MUTANT"
      exit 1
    fi
    OUT="$(chay "$MUTANT")"
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
    echo "rang-microsoft do: dot bien toi thieu tu chinh bo nap truoc lam DUNG MOT bai do, va do la bai dang nhap"
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
  nguon-env)
    printf '{"name":"probe","workspaces":["x"]}\n' > "$FIX/package.json"
    printf 'MICROSOFT_CLIENT_ID="tu-file-env"\nMICROSOFT_CLIENT_SECRET="tu-file-env"\n' > "$FIX/.env"
    cd "$FIX" || exit 2
    OUT="$(LOADER="$ROOT/packages/env/src/index.ts" bun -e '
const optional = (k) => { const v = process.env[k]; return v && v.length > 0 ? v : undefined; };
const { loadRootEnv } = await import(process.env.LOADER);
process.env.MICROSOFT_CLIENT_ID = "";
loadRootEnv();
console.log("sentinel|" + JSON.stringify(process.env.MICROSOFT_CLIENT_ID) + "|" + optional("MICROSOFT_CLIENT_ID"));
' 2>&1)"
    echo "  $OUT"
    case "$OUT" in
      'sentinel|""|undefined') ;;
      *) echo "RANG DO: dat rong khong song qua bo nap .env goc"; exit 1 ;;
    esac
    OUT2="$(LOADER="$ROOT/packages/env/src/index.ts" bun -e '
const { loadRootEnv } = await import(process.env.LOADER);
process.env.MICROSOFT_CLIENT_ID = "gi-do";
delete process.env.MICROSOFT_CLIENT_ID;
loadRootEnv();
console.log("xoa|" + JSON.stringify(process.env.MICROSOFT_CLIENT_ID));
' 2>&1)"
    echo "  $OUT2"
    case "$OUT2" in
      'xoa|"tu-file-env"') ;;
      *) echo "RANG CUN: cach xoa dang le phai bi .env goc dien lai, ma khong — phep do khong do gi"; exit 1 ;;
    esac
    echo "rang-microsoft nguon-env: dat rong song qua bo nap, cach xoa thi bi .env goc dien lai"
    ;;
  *)
    echo "rang-microsoft: chan la $CHAN"
    exit 2
    ;;
esac
