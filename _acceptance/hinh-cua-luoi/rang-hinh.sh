#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HOOK="$ROOT/.githooks/pre-push"
KHAI="$ROOT/.githooks/gate-shape.json"
PKG="$ROOT/package.json"
CHAN="${2:-}"
[ "${1:-}" = "--chan" ] || {
  echo "rang-hinh: dung --chan hinh|tan-cong|bo-sot|noi-day|noi-day-am|noi-day-lech"
  exit 2
}

KEY="$(printf '%s' "$ROOT" | shasum | cut -c1-12)"
LUU="${TMPDIR:-/tmp}/crm-hinh-cua-luoi-$KEY"
GOI_MOI="$ROOT/packages/rang-goi-moi"
GOC_MOI="$ROOT/rang-goc-moi"

don_du() {
  [ -d "$LUU" ] || return 0
  for ten in pre-push package.json; do
    src="$LUU/$ten"
    [ -f "$src" ] || continue
    case "$ten" in
      pre-push) dich="$HOOK" ;;
      package.json) dich="$PKG" ;;
    esac
    if ! cmp -s "$src" "$dich"; then
      echo "hoan nguyen $dich tu mot luot bi giet cung"
      cat "$src" > "$dich"
      [ "$ten" = "pre-push" ] && chmod +x "$dich"
    fi
    rm -f "$src"
  done
  rmdir "$LUU" 2>/dev/null
  for sot in "$GOI_MOI" "$GOC_MOI"; do
    if [ -d "$sot" ]; then
      echo "don $sot con sot tu mot luot bi giet cung"
      rm -rf "$sot"
    fi
  done
  return 0
}
don_du

TMP="$(mktemp -d)"
cleanup() { don_du; rm -rf "$TMP"; }
trap cleanup EXIT

giu() {
  mkdir -p "$LUU"
  cat "$HOOK" > "$LUU/pre-push"
  cat "$PKG" > "$LUU/package.json"
}

SHA="$(git -C "$ROOT" rev-parse HEAD)"
REF() { printf 'refs/heads/x %s refs/heads/x %s\n' "$SHA" "$SHA"; }

chay_luoi() {
  cd "$ROOT" || exit 2
  REF | bash "$HOOK" 2>&1
}

chay_luoi_ben() {
  local out code
  out="$(chay_luoi)"
  code=$?
  if [ "$code" -ne 0 ] && ! grep -qF "declares no" <<<"$out" && grep -qE '^ *Failed: ' <<<"$out"; then
    echo "  luot 1 do vi tac vu, chua toi buoc soi hinh — chay lai mot lan:" >&2
    grep -E '^ *Failed: |\(fail\)' <<<"$out" | head -10 | sed 's/^/      /' >&2
    out="$(chay_luoi)"
    code=$?
  fi
  printf '%s\n' "$out"
  return "$code"
}

so_goi() {
  node -e '
const fs = require("fs"), path = require("path");
const root = process.argv[1];
const khai = JSON.parse(fs.readFileSync(path.join(root, ".githooks/gate-shape.json"), "utf8"));
let n = 0;
for (const r of khai.roots) {
  const dir = path.join(root, r);
  if (!fs.existsSync(dir)) continue;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory() && fs.existsSync(path.join(dir, e.name, "package.json"))) n++;
  }
}
console.log(n);
' "$ROOT"
}

ten_kiem() {
  node -e '
const khai = require(process.argv[1]);
console.log(khai.checkers.filter((c) => c.kind === "turbo").map((c) => c.id).join(" "));
' "$KHAI"
}

noi_day() {
  local dir="$1" duong hook_that
  duong="$(git -C "$dir" rev-parse --git-path hooks/pre-push 2>/dev/null)"
  if [ -z "$duong" ]; then
    echo "KHONG NOI DAY: git khong tra ve duong dan hook nao trong $dir"
    return 1
  fi
  case "$duong" in
    /*) hook_that="$duong" ;;
    *) hook_that="$dir/$duong" ;;
  esac
  if [ ! -f "$hook_that" ]; then
    echo "KHONG NOI DAY: git se goi '$hook_that', ma tep do khong ton tai."
    echo "  Moi lan day deu xanh voi khong gi duoc chay. Chay 'bun install' de dat core.hooksPath."
    return 1
  fi
  if [ ! -x "$hook_that" ]; then
    echo "KHONG NOI DAY: '$hook_that' khong co quyen chay. Git bo qua no im lang."
    return 1
  fi
  if [ ! -f "$dir/.githooks/pre-push" ]; then
    echo "KHONG NOI DAY: cay nay khong co .githooks/pre-push de doi chieu"
    return 1
  fi
  if ! cmp -s "$hook_that" "$dir/.githooks/pre-push"; then
    echo "LUOI LECH: git se goi '$hook_that',"
    echo "  nhung luoi cua cay nay la '$dir/.githooks/pre-push'. Hai tep khac nhau."
    echo "  Luoi ban dang sua KHONG phai luoi se chay."
    return 1
  fi
  echo "noi day dung: git goi '$hook_that', trung nguyen byte voi luoi cua cay"
  return 0
}

kho_tam() {
  local t="$1" cai="$2"
  git init -q "$t"
  mkdir -p "$t/.githooks"
  cat "$HOOK" > "$t/.githooks/pre-push"
  chmod +x "$t/.githooks/pre-push"
  if [ "$cai" = "co" ]; then
    (cd "$t" && git config core.hooksPath .githooks)
  fi
}

case "$CHAN" in
  hinh)
    OUT="$(chay_luoi)"
    CODE=$?
    if [ "$CODE" -ne 0 ]; then
      echo "RANG DO: luoi do tren cay dang sach"
      printf '%s\n' "$OUT" | tail -12
      exit 1
    fi
    N="$(so_goi)"
    if ! grep -qx "pre-push: gate matches its shape across $N packages" <<<"$OUT"; then
      echo "RANG CUN: luoi khong bao no da doi chieu voi $N goi cua cay nay"
      printf '%s\n' "$OUT" | tail -12
      exit 1
    fi
    for kiem in $(ten_kiem); do
      DONG="$(grep -E "^  $kiem: [0-9]+/[0-9]+ packages ran fresh$" <<<"$OUT")"
      if [ -z "$DONG" ]; then
        echo "RANG CUN: khong co dong phu song cho tac vu '$kiem'"
        exit 1
      fi
      DUOC="$(sed -E 's#.*: ([0-9]+)/([0-9]+).*#\1#' <<<"$DONG")"
      CAN="$(sed -E 's#.*: ([0-9]+)/([0-9]+).*#\2#' <<<"$DONG")"
      if [ "$DUOC" != "$CAN" ] || [ "$CAN" -lt 1 ]; then
        echo "RANG DO: '$kiem' chi phu $DUOC tren $CAN goi"
        exit 1
      fi
    done
    if ! grep -qE '^  lint:slop: [0-9]+ files, [0-9]+ rules$' <<<"$OUT"; then
      echo "RANG CUN: tac vu soi-ma-thua khong bao no doc bao nhieu"
      exit 1
    fi
    grep -E '^pre-push: gate matches|^  [a-z:-]+: ' <<<"$OUT" | sed 's/^/  /'
    echo "rang-hinh hinh: luoi tu doi chieu voi ban khai, phu het $N goi, khong goi nao doc dem"
    ;;

  tan-cong)
    giu
    LOI=0

    danh() {
      local ten="$1" cho="$2"
      local out code
      out="$(chay_luoi)"
      code=$?
      if [ "$code" -eq 0 ]; then
        echo "RANG CUN: don '$ten' lam rong luoi ma luoi van cho di"
        LOI=1
        return
      fi
      if ! grep -qF "$cho" <<<"$out"; then
        echo "RANG CUN: don '$ten' bi chan, nhung khong phai vi hinh lech"
        echo "  cho doi: $cho"
        printf '%s\n' "$out" | tail -8
        LOI=1
        return
      fi
      echo "  don '$ten' -> luoi do, ma thoat $code"
      grep -F "$cho" <<<"$out" | head -2 | sed 's/^/    /'
    }

    sed 's/^for task in check-types lint lint:slop test build; do$/for task in check-types lint lint:slop build; do/' \
      "$LUU/pre-push" > "$HOOK"
    if [ "$(diff <(cat "$LUU/pre-push") "$HOOK" | grep -c '^<')" -ne 1 ]; then
      echo "don 1 khong cai duoc: dong vong lap cua luoi da doi"
      exit 2
    fi
    danh "rut tac vu test khoi vong lap" "checker 'test' left no run summary"
    cat "$LUU/pre-push" > "$HOOK"

    sed 's#^\tbun run "\$task" 2>&1 | tee -a "\$LOG" || fail "\$task"$#\t[ "$task" = "lint:slop" ] || bun run "$task" 2>\&1 | tee -a "$LOG" || fail "$task"#' \
      "$LUU/pre-push" > "$HOOK"
    if [ "$(diff <(cat "$LUU/pre-push") "$HOOK" | grep -c '^<')" -ne 1 ]; then
      echo "don 2 khong cai duoc: than vong lap cua luoi da doi"
      exit 2
    fi
    if ! grep -q '^for task in check-types lint lint:slop test build; do$' "$HOOK"; then
      echo "don 2 sai: dong danh sach tac vu phai giu nguyen"
      exit 2
    fi
    danh "bo qua lint:slop trong than vong lap" "checker 'lint:slop' reported no coverage line"
    cat "$LUU/pre-push" > "$HOOK"

    node -e '
const fs = require("fs");
const p = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
p.scripts.test = "turbo run test --concurrency=1 --filter=@crm/env";
fs.writeFileSync(process.argv[2], JSON.stringify(p, null, "\t") + "\n");
' "$LUU/package.json" "$PKG"
    danh "thu hep kich ban test bang --filter" "never reached"
    cat "$LUU/package.json" > "$PKG"

    kho_tam "$TMP/chua-cai" "khong"
    if noi_day "$TMP/chua-cai" >"$TMP/out4" 2>&1; then
      echo "RANG CUN: don 'hook chua duoc cai' ma chan noi-day van xanh"
      LOI=1
    else
      echo "  don 'hook chua duoc cai' -> chan noi-day do"
      sed 's/^/    /' "$TMP/out4"
    fi

    don_du
    [ "$LOI" -eq 0 ] || exit 1
    echo "rang-hinh tan-cong: bon don cua bo hoi quy deu lam do MOT phep doi chieu duy nhat"
    ;;

  bo-sot)
    giu
    LOI=0
    MUC="$ROOT/packages/env/package.json"
    cat "$MUC" > "$TMP/env.json"
    node -e '
const fs = require("fs");
const p = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
delete p.scripts.test;
fs.writeFileSync(process.argv[2], JSON.stringify(p, null, "\t") + "\n");
' "$TMP/env.json" "$MUC"
    OUT="$(chay_luoi_ben)"
    CODE=$?
    cat "$TMP/env.json" > "$MUC"
    if [ "$CODE" -eq 0 ]; then
      echo "RANG CUN: mot goi bo kich ban 'test' ma luoi van cho di"
      LOI=1
    elif ! grep -qF "declares no 'test' script and no exemption" <<<"$OUT"; then
      echo "RANG CUN: luoi do, nhung khong phai vi goi bo kich ban"
      printf '%s\n' "$OUT" | tail -8
      LOI=1
    else
      echo "  goi bo kich ban 'test' -> luoi do, ma thoat $CODE"
      grep -F "declares no 'test' script" <<<"$OUT" | sed 's/^/    /'
    fi

    if [ -e "$GOI_MOI" ]; then
      echo "da co $GOI_MOI — rang khong ghi de"
      exit 2
    fi
    mkdir -p "$GOI_MOI"
    printf '{\n\t"name": "@crm/rang-goi-moi",\n\t"version": "0.0.0",\n\t"private": true\n}\n' \
      > "$GOI_MOI/package.json"
    OUT2="$(chay_luoi_ben)"
    CODE2=$?
    rm -rf "$GOI_MOI"
    if [ "$CODE2" -eq 0 ]; then
      echo "RANG CUN: them mot goi khong kiem gi ma luoi van cho di"
      LOI=1
    elif [ "$(grep -cF "@crm/rang-goi-moi to exempt" <<<"$OUT2")" -lt 3 ]; then
      echo "RANG CUN: goi moi khong lam do ca ba tac vu qua bo dung"
      printf '%s\n' "$OUT2" | tail -8
      LOI=1
    else
      echo "  them goi khong co kich ban nao -> luoi do, ma thoat $CODE2"
      grep -F "@crm/rang-goi-moi to exempt" <<<"$OUT2" | sed 's/^/    /'
    fi


    if [ -e "$GOC_MOI" ]; then
      echo "da co $GOC_MOI — rang khong ghi de"
      exit 2
    fi
    mkdir -p "$GOC_MOI/rang-goi-la"
    printf '{\n\t"name": "@crm/rang-goi-la",\n\t"version": "0.0.0",\n\t"private": true\n}\n' \
      > "$GOC_MOI/rang-goi-la/package.json"
    node -e '
const fs = require("fs");
const p = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
p.workspaces.push("rang-goc-moi/*");
fs.writeFileSync(process.argv[2], JSON.stringify(p, null, "\t") + "\n");
' "$LUU/package.json" "$PKG"
    OUT3="$(chay_luoi_ben)"
    CODE3=$?
    cat "$LUU/package.json" > "$PKG"
    rm -rf "$GOC_MOI"
    if [ "$CODE3" -eq 0 ]; then
      echo "RANG CUN: mot GOC lam viec moi khong ai kiem ma luoi van cho di"
      LOI=1
    elif ! grep -qF "rang-goc-moi/rang-goi-la declares no" <<<"$OUT3"; then
      echo "RANG CUN: luoi khong soi goc lam viec ma ban khai khong ke ten"
      printf '%s\n' "$OUT3" | tail -8
      LOI=1
    else
      echo "  them mot GOC lam viec moi -> luoi do, ma thoat $CODE3"
      grep -F "rang-goc-moi/rang-goi-la declares no" <<<"$OUT3" | head -1 | sed 's/^/    /'
    fi

    don_du
    [ "$LOI" -eq 0 ] || exit 1
    echo "rang-hinh bo-sot: ban khai chi ke ngoai le, nen bot viec kiem, them goi khong kiem gi, hay them ca mot goc moi — deu la cho lech"
    ;;

  noi-day)
    kho_tam "$TMP/da-cai" "co"
    if ! noi_day "$TMP/da-cai"; then
      echo "RANG DO: cong thuc cai dat khong lam git goi duoc luoi"
      exit 1
    fi
    echo "rang-hinh noi-day: cong thuc 'git config core.hooksPath .githooks' lam git goi dung luoi cua cay"
    ;;

  noi-day-am)
    kho_tam "$TMP/chua-cai" "khong"
    if noi_day "$TMP/chua-cai" >"$TMP/out" 2>&1; then
      echo "RANG CUN: kho chua chay cai dat ma chan noi-day van xanh"
      exit 1
    fi
    if ! grep -qE 'KHONG NOI DAY|LUOI LECH' "$TMP/out"; then
      echo "RANG CUN: chan noi-day do nhung khong noi vi sao"
      cat "$TMP/out"
      exit 1
    fi
    sed 's/^/  /' "$TMP/out"
    echo "rang-hinh noi-day-am: kho chua cai lam chan noi-day do va goi ten tep hook trong"
    ;;

  noi-day-lech)
    kho_tam "$TMP/lech" "co"
    mkdir -p "$TMP/khac"
    printf '#!/usr/bin/env bash\nexit 0\n' > "$TMP/khac/pre-push"
    chmod +x "$TMP/khac/pre-push"
    (cd "$TMP/lech" && git config core.hooksPath "$TMP/khac")
    if noi_day "$TMP/lech" >"$TMP/out" 2>&1; then
      echo "RANG CUN: core.hooksPath tro sang mot luoi KHAC ma chan noi-day van xanh"
      exit 1
    fi
    if ! grep -q 'LUOI LECH' "$TMP/out"; then
      echo "RANG CUN: chan noi-day do nhung khong noi la hai luoi khac nhau"
      cat "$TMP/out"
      exit 1
    fi
    sed 's/^/  /' "$TMP/out"
    echo "rang-hinh noi-day-lech: luoi dang sua khac luoi se chay thi chan noi-day do"
    ;;

  *)
    echo "rang-hinh: chan la $CHAN"
    exit 2
    ;;
esac
