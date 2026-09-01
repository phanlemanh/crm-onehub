#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CHAN="${2:-}"
[ "${1:-}" = "--chan" ] || { echo "rang-goc-ngon-ngu: dùng --chan mot-goc|khong-nhap-nguoc"; exit 2; }

GOC="$ROOT/packages/ui/src/lib/locale.ts"

dem_khai() {
  grep -rn 'Locale = "vi" | "en"\|Locale = (typeof LOCALES)\|FormatLocale =' \
    "$ROOT/apps" "$ROOT/packages" --include=*.ts --include=*.tsx 2>/dev/null \
    | grep -v node_modules
}

case "$CHAN" in
  mot-goc)
    echo "-- chiều dương: kiểu ngôn ngữ chỉ khai MỘT chỗ"
    RA="$(dem_khai)"
    N=$(printf '%s' "$RA" | grep -c . || true)
    printf '%s\n' "$RA" | sed 's|'"$ROOT"'/|    |'
    if [ "$N" -ne 1 ]; then
      echo "RĂNG ĐỎ: có $N chỗ khai kiểu ngôn ngữ, chờ đúng 1"
      exit 1
    fi

    echo "-- chiều đỏ: dựng thêm một khai báo thứ hai thì phép đo phải thấy"
    THEM="$ROOT/apps/app/lib/locale/.rang-khai-lai.ts"
    printf 'export type Locale = "vi" | "en";\n' > "$THEM"
    RA2="$(dem_khai)"
    N2=$(printf '%s' "$RA2" | grep -c . || true)
    rm -f "$THEM"
    if [ "$N2" -le "$N" ]; then
      echo "RĂNG CÙN: thêm một khai báo mà con số không tăng ($N -> $N2)"
      exit 1
    fi
    echo "    thêm một khai báo thì đếm được $N2, gỡ ra thì về $N"
    echo "rang-goc-ngon-ngu mot-goc: hai chiều đúng"
    ;;

  khong-nhap-nguoc)
    echo "-- chiều dương: packages/ui không nhập ngược từ apps/"
    RA="$(grep -rn 'from "@/\|from "\.\./\.\./\.\./apps\|apps/app' "$ROOT/packages/ui/src" 2>/dev/null || true)"
    if [ -n "$RA" ]; then
      echo "RĂNG ĐỎ: gói dùng chung nhập ngược từ ứng dụng:"
      printf '%s\n' "$RA" | sed 's|'"$ROOT"'/|    |'
      exit 1
    fi
    echo "    không dòng nào"

    echo "-- chiều đỏ: gieo một dòng nhập ngược thì phép đo phải bắt"
    THEM="$ROOT/packages/ui/src/lib/.rang-nhap-nguoc.ts"
    printf 'export { x } from "@/lib/locale/locale";\n' > "$THEM"
    RA2="$(grep -rn 'from "@/' "$ROOT/packages/ui/src" 2>/dev/null || true)"
    rm -f "$THEM"
    if [ -z "$RA2" ]; then
      echo "RĂNG CÙN: gieo rồi mà phép đo không thấy"
      exit 1
    fi
    echo "    gieo thì bắt, gỡ thì im"
    echo "rang-goc-ngon-ngu khong-nhap-nguoc: hai chiều đúng"
    ;;

  *)
    echo "rang-goc-ngon-ngu: chân lạ $CHAN"
    exit 2
    ;;
esac
