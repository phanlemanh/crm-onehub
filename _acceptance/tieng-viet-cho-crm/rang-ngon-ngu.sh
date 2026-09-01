#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CHAN="${2:-}"
[ "${1:-}" = "--chan" ] || { echo "rang-ngon-ngu: dùng --chan la|cookie|du-lieu-khong-dich|dinh-dang"; exit 2; }

FIX="$(mktemp -d)"
trap 'rm -rf "$FIX"' EXIT

RESOLVE="$ROOT/apps/app/lib/locale/resolve.ts"
HEADER="$ROOT/apps/app/components/app-header.tsx"
TABLE="$ROOT/apps/app/app/(app)/[slug]/companies/companies-table.tsx"
FORMAT="$ROOT/packages/ui/src/lib/format.ts"

giai() {
  MODULE="$1" bun -e '
const { resolveLocale } = await import(process.env.MODULE);
const cases = [
  ["zz-ZZ-nonsense", "vi-VN"],
  ["", "vi-VN"],
  ["viet", "vi-VN"],
];
for (const [cookie, header] of cases) {
  console.log(JSON.stringify(cookie) + " -> " + resolveLocale(cookie, header));
}
' 2>&1
}

case "$CHAN" in
  la)
    echo "-- chieu duong: gia tri khong hop le -> en"
    OUT="$(giai "$RESOLVE")"
    echo "$OUT" | sed 's/^/    /'
    if grep -qv "\-> en$" <<<"$OUT"; then
      echo "RANG DO: co gia tri khong hop le KHONG roi ve en"
      exit 1
    fi

    echo "-- chieu do: ban sao bo buoc kiem hop le"
    sed 's/if (isLocale(cookieValue)) return cookieValue;/if (cookieValue !== undefined) return cookieValue as Locale;/' \
      "$RESOLVE" > "$FIX/resolve.ts"
    cp "$ROOT/apps/app/lib/locale/locale.ts" "$FIX/locale.ts"
    DIFF_N=$(diff "$RESOLVE" "$FIX/resolve.ts" | grep -c '^[<>]')
    if [ "$DIFF_N" -ne 2 ]; then
      echo "RANG CUN: dot bien lech $DIFF_N dong, ky vong 2"
      exit 1
    fi
    OUT2="$(giai "$FIX/resolve.ts")"
    echo "$OUT2" | sed 's/^/    /'
    if ! grep -q '"zz-ZZ-nonsense" -> zz-ZZ-nonsense' <<<"$OUT2"; then
      echo "RANG CUN: bo buoc kiem hop le ma gia tri rac VAN khong lot qua — phep do khong do gi"
      exit 1
    fi
    echo "rang-ngon-ngu la: hai chieu dung, gia tri rac bi chan boi dung buoc kiem hop le"
    ;;

  cookie)
    echo "-- chieu duong: du ba thuoc tinh cookie"
    THIEU=""
    for thuoc in "Max-Age=\${COOKIE_MAX_AGE}" "Path=\${COOKIE_PATH}" "SameSite=\${COOKIE_SAME_SITE}"; do
      grep -qF "$thuoc" "$HEADER" || THIEU="$THIEU $thuoc"
    done
    if [ -n "$THIEU" ]; then
      echo "RANG DO: cookie thieu thuoc tinh:$THIEU"
      exit 1
    fi
    echo "    du ca ba: Max-Age, Path, SameSite"

    echo "-- chieu do: ban sao bo Max-Age"
    sed 's/; Max-Age=\${COOKIE_MAX_AGE}//' "$HEADER" > "$FIX/header.tsx"
    DIFF_N=$(diff "$HEADER" "$FIX/header.tsx" | grep -c '^[<>]')
    if [ "$DIFF_N" -ne 2 ]; then
      echo "RANG CUN: dot bien lech $DIFF_N dong, ky vong 2"
      exit 1
    fi
    if grep -qF "Max-Age=\${COOKIE_MAX_AGE}" "$FIX/header.tsx"; then
      echo "RANG CUN: ban sao van con Max-Age — phep do khong do gi"
      exit 1
    fi
    echo "    ban sao mat Max-Age, va phep do goi ten dung thuoc tinh do"
    echo "rang-ngon-ngu cookie: hai chieu dung"
    ;;

  du-lieu-khong-dich)
    echo "-- chieu duong: CHINH phan tu ve ten cong ty mang translate=no"
    if ! grep -A 2 'translate="no"' "$TABLE" | grep -q '{row.name}'; then
      echo "RANG DO: translate=no khong nam tren phan tu ve ten cong ty"
      exit 1
    fi
    echo "    translate=no dung tren phan tu chua {row.name}"

    echo "-- chieu do: ban sao go thuoc tinh khoi phan tu do"
    sed 's/ translate="no"//' "$TABLE" > "$FIX/table.tsx"
    DIFF_N=$(diff "$TABLE" "$FIX/table.tsx" | grep -c '^[<>]')
    if [ "$DIFF_N" -lt 2 ]; then
      echo "RANG CUN: dot bien khong doi gi"
      exit 1
    fi
    if grep -A 2 'translate="no"' "$FIX/table.tsx" | grep -q '{row.name}'; then
      echo "RANG CUN: go roi ma phep do van thay — phep do khong do gi"
      exit 1
    fi
    echo "rang-ngon-ngu du-lieu-khong-dich: hai chieu dung"
    ;;

  dinh-dang)
    echo "-- chieu duong A: ma tran 5 ham x 2 ngon ngu, chuoi ghim san"
    MODULE="$FORMAT" bun -e '
const f = await import(process.env.MODULE);
const want = [
  ["formatDay en", f.formatDay("2026-09-01", "en"), "Sep 1, 2026"],
  ["formatDay vi", f.formatDay("2026-09-01", "vi"), "1 thg 9, 2026"],
  ["formatMoney en", f.formatMoney(123456, "usd", "en"), "$1,234.56"],
  ["formatMoney vi", f.formatMoney(123456, "usd", "vi"), "1.234,56 US$"],
  ["formatMoneyCompact en", f.formatMoneyCompact(123456789, "usd", "en"), "$1.2M"],
  ["formatMoneyCompact vi", f.formatMoneyCompact(123456789, "usd", "vi"), "1,2 Tr US$"],
  ["formatPercent en", f.formatPercent(0.125, "en"), "13%"],
  ["formatPercent vi", f.formatPercent(0.125, "vi"), "13%"],
  ["formatCount en", f.formatCount(3, "company", "companies", "en"), "3 companies"],
  ["formatCount vi", f.formatCount(3, "công ty", "công ty", "vi"), "3 công ty"],
];
let bad = 0;
for (const [name, got, exp] of want) {
  if (got !== exp) { console.log("  LECH " + name + ": " + JSON.stringify(got) + " != " + JSON.stringify(exp)); bad++; }
}
console.log(bad === 0 ? "  10/10 o khop chuoi ghim san" : "  " + bad + " o lech");
process.exit(bad === 0 ? 0 : 1);
' || { echo "RANG DO: ma tran dinh dang lech"; exit 1; }

    echo "-- chieu duong B: dem cho khai cung vung trong pham vi"
    N=$(grep -rn 'Intl\.\(NumberFormat\|DateTimeFormat\)("en-US"' "$ROOT/apps/app" "$ROOT/packages/ui/src/lib" --include=*.tsx --include=*.ts 2>/dev/null | wc -l | tr -d ' ')
    if [ "$N" -ne 0 ]; then
      echo "RANG DO: con $N cho khai cung vung trong pham vi vong nay"
      exit 1
    fi
    echo "    0 cho khai cung vung"

    echo "-- chieu do: ban sao tra formatDay ve en-US"
    sed 's|: (value ?? "—");|: (value ?? "—");|; s|dateFormat(locale, {|dateFormat("en", {|' "$FORMAT" > "$FIX/format.ts"
    DIFF_N=$(diff "$FORMAT" "$FIX/format.ts" | grep -c '^[<>]')
    if [ "$DIFF_N" -lt 2 ]; then
      echo "RANG CUN: dot bien khong doi gi"
      exit 1
    fi
    MODULE="$FIX/format.ts" bun -e '
const f = await import(process.env.MODULE);
const got = f.formatDay("2026-09-01", "vi");
if (got === "1 thg 9, 2026") {
  console.log("  RANG CUN: tra formatDay ve en ma no VAN ra tieng Viet");
  process.exit(1);
}
console.log("  formatDay bi tra ve en -> " + JSON.stringify(got) + " (dung ten ham: formatDay)");
' || { echo "RANG CUN: chieu do khong do duoc"; exit 1; }
    echo "rang-ngon-ngu dinh-dang: ba chieu dung"
    ;;

  *)
    echo "rang-ngon-ngu: chan la $CHAN"
    exit 2
    ;;
esac
