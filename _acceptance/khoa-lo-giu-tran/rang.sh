#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WS="$ROOT/_acceptance/khoa-lo-giu-tran"
AGENT="$ROOT/apps/agent"
SPEC="test/tasks.integration.spec.ts"
RANG="./rang/khoa-lo-giu-tran.rang.ts"
SHA="746d3ef8ef8667c5e59545bf5f9b71b97d98f2c9"
FILTER="planner re-runs"

[ "${1:-}" = "--chan" ] || { echo "rang: dùng --chan tran-retire|tran-claim|can|chieu-do|giai-thich|dong-thoi|toan-tep|tai-lieu"; exit 2; }
CHAN="${2:-}"

base_url() {
  if [ -n "${TEST_DATABASE_URL:-}" ]; then printf '%s' "$TEST_DATABASE_URL"; return; fi
  grep '^TEST_DATABASE_URL=' "$ROOT/.env" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"'
}

prepare_db() {
  local base name
  base="$(base_url)"
  [ -n "$base" ] || { echo "không đọc được TEST_DATABASE_URL từ môi trường hay .env gốc"; exit 2; }
  name="crm_khoa_lo_$(printf '%s' "$1" | tr '-' '_')_test"
  export TEST_DATABASE_URL
  TEST_DATABASE_URL="$(printf '%s' "$base" | sed -E "s#/[A-Za-z0-9_]+(\?|\$)#/${name}\1#")"
  (cd "$ROOT" && bun run db:test >/dev/null 2>&1) || { echo "không dựng được cơ sở dữ liệu ${name}"; exit 2; }
}

run_once() {
  (cd "$AGENT" && CRM_TELEMETRY_DISABLED=1 KHOA_LO_RANG=1 PRISMA_LOG_QUERIES=true bun test "$@" 2>&1)
}

run_test() {
  local out
  out="$(run_once "$@")"
  if printf '%s' "$out" | grep -q "Cannot find module '\./internal/"; then
    echo "nạp lại một lần: Prisma client đang được sinh lại bởi lệnh khác (turbo ^build)" >&2
    sleep 5
    out="$(run_once "$@")"
  fi
  printf '%s' "$out"
}

count() { printf '%s' "$1" | grep -Eo "^ *[0-9]+ $2" | tail -1 | grep -Eo '[0-9]+'; }

expect_counts() {
  local out="$1" pass="$2" fail="$3" got_pass got_fail
  got_pass="$(count "$out" pass)"; got_fail="$(count "$out" fail)"
  [ -n "$got_pass" ] && [ -n "$got_fail" ] || { echo "không đọc được số ca"; echo "$out" | tail -20; exit 1; }
  if [ "$got_pass" != "$pass" ] || [ "$got_fail" != "$fail" ]; then
    echo "RANG DO: mong $pass pass / $fail fail, nhận $got_pass pass / $got_fail fail"
    echo "$out" | grep -E '\(fail\)|Expected|Received|error:' | head -20
    exit 1
  fi
}

source_hash() { git -C "$ROOT" hash-object apps/agent/agent/lib/tasks.ts; }

tree_untouched() {
  [ "$(source_hash)" = "$1" ] || { echo "RANG DO: tasks.ts trong cây làm việc bị chân này đổi"; exit 1; }
  [ -z "$(git -C "$ROOT" status --porcelain apps/agent/agent/lib/tasks.ts)" ] || { echo "RANG DO: tasks.ts có thay đổi chưa commit sau khi chạy"; exit 1; }
}

next_paragraph() {
  awk -v RS= '/claimDue.*sorts what it claims/{ if ((getline para) > 0) print para; exit }' "$1"
}

doc_rule() {
  local para
  para="$(next_paragraph "$1")"
  [ -n "$para" ] || { echo "RANG DO: không thấy luật neo 'claimDue sorts what it claims' hoặc không có đoạn nào ngay sau nó"; return 1; }
  printf '%s' "$para" | grep -q 'MATERIALIZED' || { echo "RANG DO: đoạn ngay sau luật neo không phải luật CTE (thiếu MATERIALIZED)"; return 1; }
  for word in claimDue retireExhausted; do
    printf '%s' "$para" | grep -q "$word" || { echo "RANG DO: đoạn luật thiếu $word"; return 1; }
  done
}

drop_word_after_anchor() {
  awk -v w="$2" 'found{gsub(w,"")} /sorts what it claims/{found=1} {print}' "$1"
}

wedge_after_anchor() {
  awk 'p&&/^$/{print; print "Một đoạn chen vào giữa luật neo và luật CTE."; print ""; p=0; next} /sorts what it claims/{p=1} {print}' "$1"
}

expect_red() {
  local file="$1" pin="$2" out
  out="$(doc_rule "$file" 2>&1)" && { echo "RANG CUN: bản sao hỏng mà răng vẫn xanh (mong: $pin)"; return 1; }
  printf '%s' "$out" | grep -qF "$pin" || { echo "RANG DO: bản sao hỏng đỏ nhưng sai thông điệp — mong '$pin', nhận '$out'"; return 1; }
  echo "  chiều đỏ ghim: $out"
}

case "$CHAN" in
  tran-retire)
    prepare_db "$CHAN"
    OUT="$(run_test "$SPEC" -t "retireExhausted still retires exactly the limit")"
    expect_counts "$OUT" 1 0
    echo "rang tran-retire: retireExhausted(2) trả đúng 2, còn 1 hàng mở"
    ;;
  tran-claim)
    prepare_db "$CHAN"
    OUT="$(run_test "$SPEC" -t "claimDue still claims exactly the limit")"
    expect_counts "$OUT" 1 0
    echo "rang tran-claim: claimDue(2) trả đúng 2, còn 1 hàng chưa thuê"
    ;;
  can)
    prepare_db "$CHAN"
    OUT="$(run_test "$SPEC" -t "the fixture bites")"
    expect_counts "$OUT" 2 0
    echo "rang can: probe khuôn FROM trả đủ 3 hàng dù LIMIT 2, thống kê không trôi"
    ;;
  chieu-do)
    git -C "$ROOT" cat-file -e "$SHA" 2>/dev/null || { echo "sha $SHA không có trong clone"; exit 2; }
    prepare_db "$CHAN"
    BEFORE="$(source_hash)"
    TMP="$AGENT/rang/.tmp"; mkdir -p "$TMP"
    OLD="$TMP/pre-fix-$$.ts"; OLDSPEC="$TMP/pre-fix-spec-$$.rang.ts"
    trap 'rm -f "$OLD" "$OLDSPEC"' EXIT
    git -C "$ROOT" show "$SHA:apps/agent/agent/lib/tasks.ts" | sed 's#"./dispatch-config"#"../../agent/lib/dispatch-config"#' > "$OLD"
    sed "s#\"../agent/lib/tasks\"#\"./pre-fix-$$\"#" "$AGENT/$SPEC" > "$OLDSPEC"
    OUT="$(run_test "./rang/.tmp/pre-fix-spec-$$.rang.ts" -t "$FILTER")"
    expect_counts "$OUT" 2 2
    RED="$(printf '%s' "$OUT" | grep -c 'Received length: 3')"
    [ "$RED" -eq 2 ] || { echo "RANG DO: mong 2 dòng 'Received length: 3', nhận $RED"; echo "$OUT" | tail -20; exit 1; }
    printf '%s' "$OUT" | grep -q 'Expected length: 2' || { echo "RANG DO: thiếu 'Expected length: 2'"; exit 1; }
    printf '%s' "$OUT" | grep -E '^\(fail\)' | grep -qv 'still' && { echo "RANG DO: bài đỏ không phải bài trần"; exit 1; }
    tree_untouched "$BEFORE"
    echo "rang chieu-do: bản trước sửa đỏ đúng hai bài trần với 'Expected length: 2 / Received length: 3', hai bài bites xanh, cây làm việc nguyên"
    ;;
  giai-thich)
    git -C "$ROOT" cat-file -e "$SHA" 2>/dev/null || { echo "sha $SHA không có trong clone"; exit 2; }
    prepare_db "$CHAN"
    BEFORE="$(source_hash)"
    OUT="$(run_test "$RANG" -t "explain")"
    expect_counts "$OUT" 2 0
    printf '%s' "$OUT" | grep -q 'LockRows loops=1 (fixed) cte=true' || { echo "RANG DO: thiếu dòng loops=1 của bản sửa"; echo "$OUT" | tail -20; exit 1; }
    printf '%s' "$OUT" | grep -q 'LockRows loops=3 (pre-fix)' || { echo "RANG DO: thiếu dòng loops=3 của bản trước sửa"; echo "$OUT" | tail -20; exit 1; }
    tree_untouched "$BEFORE"
    echo "rang giai-thich: LockRows loops=1 với CTE Scan ở bản sửa, loops=3 ở bản trước sửa"
    ;;
  dong-thoi)
    prepare_db "$CHAN"
    BEFORE="$(source_hash)"
    OUT="$(run_test "$RANG" -t "concurrent")"
    expect_counts "$OUT" 2 0
    printf '%s' "$OUT" | grep -q 'unique=16/16 (fixed)' || { echo "RANG DO: thiếu dòng unique=16/16 của bản sửa"; echo "$OUT" | tail -20; exit 1; }
    NL="$(printf '%s' "$OUT" | grep -Eo 'unique=[0-9]+/16 \(no-lock\)' | grep -Eo '=[0-9]+' | tr -d '=')"
    [ -n "$NL" ] && [ "$NL" -lt 16 ] || { echo "RANG DO: bản bỏ khoá không cho id trùng (unique=${NL:-?})"; exit 1; }
    tree_untouched "$BEFORE"
    echo "rang dong-thoi: 8 lượt song song, bản sửa 16/16 id khác nhau, bản bỏ khoá chỉ $NL/16"
    ;;
  toan-tep)
    prepare_db "$CHAN"
    OUT="$(run_test "$SPEC")"
    expect_counts "$OUT" 20 0
    git -C "$ROOT" diff "$SHA" -- "apps/agent/$SPEC" | cmp -s - "$WS/evidence/spec-diff.patch" || { echo "RANG DO: spec-diff.patch stale — chạy lại: git diff $SHA -- apps/agent/$SPEC > _acceptance/khoa-lo-giu-tran/evidence/spec-diff.patch"; exit 1; }
    echo "rang toan-tep: 20 pass 0 fail, spec-diff.patch khớp diff sống"
    ;;
  tai-lieu)
    DOC="$ROOT/docs/agent.md"
    doc_rule "$DOC" || exit 1
    FIX="$(mktemp)"; trap 'rm -f "$FIX"' EXIT
    drop_word_after_anchor "$DOC" MATERIALIZED > "$FIX"; expect_red "$FIX" "không phải luật CTE (thiếu MATERIALIZED)" || exit 1
    drop_word_after_anchor "$DOC" claimDue > "$FIX"; expect_red "$FIX" "đoạn luật thiếu claimDue" || exit 1
    drop_word_after_anchor "$DOC" retireExhausted > "$FIX"; expect_red "$FIX" "đoạn luật thiếu retireExhausted" || exit 1
    wedge_after_anchor "$DOC" > "$FIX"; expect_red "$FIX" "không phải luật CTE" || exit 1
    echo "rang tai-lieu: đoạn ngay sau 'claimDue sorts what it claims' nêu claimDue, retireExhausted, MATERIALIZED; bốn bản sao hỏng đỏ đúng thông điệp"
    ;;
  *)
    echo "rang: chân lạ $CHAN"; exit 2 ;;
esac
