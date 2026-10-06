#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HOOK="$ROOT/.githooks/pre-push"
CHAN="${2:-}"
[ "${1:-}" = "--chan" ] || { echo "rang-hook: dùng --chan ep-chay|con-rang|loi-thoat|tro-dung"; exit 2; }

FIX="$(mktemp -d)"
PLANT="$ROOT/packages/env/test/rang-hong-$$.spec.ts"
SLOP="$ROOT/packages/env/src/rang-slop-$$.ts"
cleanup() { rm -rf "$FIX"; rm -f "$PLANT" "$SLOP"; }
trap cleanup EXIT

NOI_DUNG_PLANT='import { expect, it } from "bun:test";

it("rang cai vao de luoi phai chan", () => {
	expect(1).toBe(2);
});'
NOI_DUNG_SLOP='export function thu(input: unknown): string {
	return input as string;
}'

don_du() {
  for f in "$ROOT/packages/env/test/"rang-hong-*.spec.ts; do
    [ -f "$f" ] || continue
    if [ "$(cat "$f")" = "$NOI_DUNG_PLANT" ]; then
      echo "don $f con sot tu mot luot bi giet cung"
      rm -f "$f"
    fi
  done
  for f in "$ROOT/packages/env/src/"rang-slop-*.ts; do
    [ -f "$f" ] || continue
    if [ "$(cat "$f")" = "$NOI_DUNG_SLOP" ]; then
      echo "don $f con sot tu mot luot bi giet cung"
      rm -f "$f"
    fi
  done
}
don_du

TAC_VU="check-types lint lint:slop test build"

KY_VONG_CACHE="$(cd "$ROOT" && TAC_VU="$TAC_VU" node -e '
const fs = require("fs");
const p = JSON.parse(fs.readFileSync("package.json", "utf8")).scripts || {};
let n = 0;
for (const t of String(process.env.TAC_VU || "").split(/\s+/).filter(Boolean)) {
  const s = p[t] || "";
  if (/turbo/.test(s)) { n += 1; continue; }
  const m = s.match(/[\w./-]+\.ts/);
  if (m && fs.existsSync(m[0]) && /turbo/.test(fs.readFileSync(m[0], "utf8"))) n += 1;
}
process.stdout.write(String(n));
')"
if ! printf '%s' "$KY_VONG_CACHE" | grep -qE '^[1-9][0-9]*$'; then
  echo "rang-hook: khong suy duoc so tac vu qua bo dung (nhan duoc '$KY_VONG_CACHE')"
  exit 2
fi

SHA="$(git -C "$ROOT" rev-parse HEAD)"
REF() { printf 'refs/heads/onehub %s refs/heads/onehub %s\n' "$SHA" "$SHA"; }

case "$CHAN" in
  ep-chay)
    DONG="$(grep -n '^for task in' "$HOOK" | head -1 | cut -d: -f2-)"
    if [ "$DONG" != "for task in $TAC_VU; do" ]; then
      echo "danh sach tac vu cua luoi da doi: $DONG"
      echo "  ky vong: for task in $TAC_VU; do"
      exit 1
    fi
    cd "$ROOT" || exit 2
    OUT="$(REF | bash "$HOOK" 2>&1)"
    CODE=$?
    if [ "$CODE" -ne 0 ]; then
      echo "RANG DO: hook do tren cay dang sach"
      printf '%s\n' "$OUT" | grep -E '\(fail\)|error:|Error:|ERROR|Failed:|failed|exited with code|Expected|Received' | head -60
      echo "-- 20 dong cuoi:"
      printf '%s\n' "$OUT" | tail -20
      exit 1
    fi
    for tv in $TAC_VU; do
      if ! grep -qx "pre-push: bun run $tv" <<<"$OUT"; then
        echo "RANG CUN: khong thay dong thong bao NGUYEN VE cho tac vu '$tv'"
        exit 1
      fi
    done
    DONG_CACHE="$(printf '%s' "$OUT" | grep -c 'Cached:')"
    if [ "$DONG_CACHE" -ne "$KY_VONG_CACHE" ]; then
      echo "RANG CUN: thay $DONG_CACHE dong tong ket bo dung, ky vong dung $KY_VONG_CACHE"
      exit 1
    fi
    XAU="$(printf '%s' "$OUT" | grep 'Cached:' | grep -v 'Cached:[[:space:]]*0 cached')"
    if [ -n "$XAU" ]; then
      echo "RANG DO: con tac vu doc tu bo nho dem — luoi day khong do gi"
      printf '%s\n' "$XAU"
      exit 1
    fi
    printf '%s' "$OUT" | grep 'Cached:' | sed 's/^/  /'
    echo "rang-hook ep-chay: du $(printf '%s\n' $TAC_VU | wc -l | tr -d ' ') tac vu duoc goi, $KY_VONG_CACHE tac vu qua bo dung deu 0 doc tu dem"
    ;;
  con-rang)
    if [ -e "$PLANT" ]; then
      echo "da co file $PLANT — rang khong ghi de"
      exit 2
    fi
    printf '%s\n' "$NOI_DUNG_PLANT" > "$PLANT"
    cd "$ROOT" || exit 2
    OUT="$(REF | bash "$HOOK" 2>&1)"
    CODE=$?
    if [ "$CODE" -eq 0 ]; then
      echo "RANG CUN: mot bai kiem THAT dang do ma luoi day van cho di"
      exit 1
    fi
    if ! grep -q 'would have failed CI' <<<"$OUT"; then
      echo "RANG CUN: luoi chan nhung khong noi vi sao"
      exit 1
    fi
    if ! grep -q '`bun run test` failed' <<<"$OUT"; then
      echo "RANG CUN: luoi chan nhung khong goi ten tac vu test"
      printf '%s' "$OUT" | tail -4
      exit 1
    fi
    echo "rang-hook con-rang: mot bai kiem that do thi luoi day chan va goi dung ten tac vu, exit $CODE"
    ;;
  canary-slop)
    if [ -e "$SLOP" ]; then
      echo "da co file $SLOP — rang khong ghi de"
      exit 2
    fi
    printf '%s\n' "$NOI_DUNG_SLOP" > "$SLOP"
    cd "$ROOT" || exit 2
    OUT="$(REF | bash "$HOOK" 2>&1)"
    CODE=$?
    if [ "$CODE" -eq 0 ]; then
      echo "RANG CUN: cai mot vi pham soi-ma-thua ma luoi van cho di — tac vu do khong doc cay hien tai"
      exit 1
    fi
    if ! grep -q '`bun run lint:slop` failed' <<<"$OUT"; then
      echo "RANG CUN: luoi chan nhung khong phai vi tac vu soi-ma-thua"
      tail -4 <<<"$OUT"
      exit 1
    fi
    if ! grep -q 'no-unknown-parameters' <<<"$OUT"; then
      echo "RANG CUN: chan dung tac vu nhung khong in ra vi pham nao"
      exit 1
    fi
    echo "rang-hook canary-slop: tac vu soi-ma-thua DOC that cay hien tai va chan dung luot day nay"
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
    if ! grep -q 'CRM_SKIP_HOOKS is set' <<<"$OUT"; then
      echo "RANG CUN: loi thoat im lang — nguoi de sot bien trong ho so shell se tat luoi ma khong biet"
      exit 1
    fi
    if grep -q 'pre-push: bun run' <<<"$OUT"; then
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
