#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CHAN="${2:-}"
[ "${1:-}" = "--chan" ] || { echo "rang-quet: dùng --chan dem|canary|phan-loai"; exit 2; }

QUET="$ROOT/_acceptance/bo-dung-chung-nhan-chuoi/quet-chuoi.ts"
NGUON="$ROOT/packages/ui/src/components"

FIX="$(mktemp -d)"
trap 'rm -rf "$FIX"' EXIT

case "$CHAN" in
  dem)
    echo "-- đếm thật, không cache"
    bun "$QUET" --goc "$ROOT" --chi-dem
    ;;

  canary)
    echo "-- chiều đỏ: gieo mười một con chim mồi, mỗi con một KIỂU chuỗi khác nhau"
    mkdir -p "$FIX/components"
    cp "$NGUON"/*.tsx "$FIX/components/"

    cat > "$FIX/components/chim-moi.tsx" <<'TSX'
const NHAN_MOI: Record<string, string> = {
	mot: "Canary Label Map",
};

export function ChimMoi({
	nhan = "Canary Default Param",
	phu,
}: {
	nhan?: string;
	phu?: string;
}) {
	const ten = `Canary Template ${nhan}`;
	const cut = `Canary Cut ${nhan}…`;
	const dinh = `chim-moi-${nhan}-lop`;
	const ba_ngoi = phu ? "Canary Ternary" : "Canary Ternary Two";
	const hoac = phu || "Canary Or Fallback";
	const tran = "Canary Bare Const";
	return (
		<div title="Canary Title Attribute">
			<span aria-label="Canary Aria Label">Canary Jsx Text</span>
			<span>{phu ?? "Canary Fallback."}</span>
			<span>{ten}</span>
			<span>{cut}</span>
			<span>{ba_ngoi}</span>
			<span>{hoac}</span>
			<span>{tran}</span>
			<span className={dinh} />
			<span>{NHAN_MOI.mot}</span>
		</div>
	);
}
TSX

    RA="$(bun "$QUET" --thu-muc "$FIX/components" 2>&1)"
    THIEU=""
    for moi in "Canary Label Map" "Canary Default Param" "Canary Template" \
               "Canary Title Attribute" "Canary Aria Label" "Canary Jsx Text" \
               "Canary Fallback." "Canary Cut" "Canary Ternary" \
               "Canary Or Fallback" "Canary Bare Const"; do
      grep -qF "$moi" <<<"$RA" || THIEU="$THIEU
    lọt lưới: $moi"
    done

    if [ -n "$THIEU" ]; then
      echo "RĂNG CÙN: máy quét ĐẾM HỤT. Nó trả 0 được bằng cách không nhìn.$THIEU"
      exit 1
    fi
    echo "    mười một kiểu chuỗi, mười một con bị bắt"

    echo "-- chiều dương: chuỗi ghép biến chỉ có mảnh định danh thì KHÔNG được báo"
    if grep -qF "chim-moi-" <<<"$RA"; then
      echo "RĂNG CÙN: máy quét báo cả mảnh định danh — nó sẽ chôn chữ thật dưới nhiễu"
      exit 1
    fi
    echo "    mảnh định danh không bị báo nhầm"

    echo "-- chiều dương: gỡ chim mồi thì máy quét im về chúng"
    rm "$FIX/components/chim-moi.tsx"
    RA2="$(bun "$QUET" --thu-muc "$FIX/components" 2>&1)"
    if grep -qF "Canary" <<<"$RA2"; then
      echo "RĂNG CÙN: gỡ file rồi mà máy quét vẫn báo — nó không đọc cây thật"
      exit 1
    fi
    echo "    gỡ rồi thì im"
    echo "rang-quet canary: hai chiều đúng"
    ;;

  phan-loai)
    echo "-- chuỗi mặc định mà MỌI chỗ gọi đều đè thì dịch nó là công vô ích"
    RA="$(bun "$QUET" --goc "$ROOT")"
    grep -q "mặc định" <<<"$RA" || { echo "RĂNG CÙN: máy quét không phân loại gì"; exit 1; }

    echo "-- chiều đỏ: đổi mọi 'mac-dinh' thành 'khoa-cung' thì phép đo phải thấy khác"
    DOT="$(dirname "$QUET")/.quet-dot-bien.ts"
    trap 'rm -rf "$FIX"; rm -f "$DOT"' EXIT
    sed 's/"mac-dinh", "/"khoa-cung", "/g' "$QUET" > "$DOT"
    DIFF_N=$(diff "$QUET" "$DOT" | grep -c '^[<>]')
    if [ "$DIFF_N" -lt 2 ]; then
      echo "RĂNG CÙN: đột biến không đổi gì"
      exit 1
    fi
    THAT="$(bun "$QUET" --goc "$ROOT" --chi-dem 2>&1)"
    DOT_BIEN="$(bun "$DOT" --goc "$ROOT" --chi-dem 2>&1)"
    echo "    thật:      $THAT"
    echo "    đột biến:  $DOT_BIEN"
    if grep -qi "error\|ENOENT" <<<"$DOT_BIEN"; then
      echo "RĂNG CÙN: bản đột biến nổ chứ không chạy — đỏ này không phải đỏ của phép đo"
      exit 1
    fi
    if [ "$THAT" = "$DOT_BIEN" ]; then
      echo "RĂNG CÙN: gộp hai loại rồi mà con số không đổi — phép đo không đo phân loại"
      exit 1
    fi
    echo "rang-quet phan-loai: hai chiều đúng"
    ;;

  *)
    echo "rang-quet: chân lạ $CHAN"
    exit 2
    ;;
esac
