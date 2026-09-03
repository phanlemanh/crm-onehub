#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
APP="${APP_URL:-http://localhost:3000}"

COOKIE="$(cd "$ROOT/apps/api" && bun run dev:session manh.phan@onemount.com 2>/dev/null | tail -1)"
[ -n "$COOKIE" ] || { echo "RANG CUN: khong lay duoc phien dang nhap"; exit 2; }

if [ -z "${SLUG:-}" ]; then
  DICH="$(curl -s -o /dev/null -w '%{redirect_url}' -H "Cookie: $COOKIE" "$APP/")"
  SLUG="$(printf '%s' "$DICH" | sed -E 's#^[a-z]+://[^/]+/##; s#[?/].*##')"
  case "$SLUG" in
    ""|sign-in)
      echo "RANG CUN: khong suy duoc slug — $APP/ tra ve \"$DICH\"."
      echo "  Chan nay TU CHOI do voi mot slug doan: do sai workspace trong y het loi san pham."
      exit 2
      ;;
  esac
fi

MA="$(curl -s -o /dev/null -w '%{http_code}' -H "Cookie: $COOKIE; lang=vi" "$APP/$SLUG/companies")"
if [ "$MA" != "200" ]; then
  echo "RANG CUN: workspace \"$SLUG\" khong giai duoc — $APP/$SLUG/companies tra $MA, khong phai 200."
  echo "  Chan nay TU CHOI do: do mot workspace khong ton tai trong y het loi san pham,"
  echo "  va vong 8 da mat mot luot vi dung cho nay."
  exit 2
fi

declare -a MAN=(companies contacts deals)
declare -a VIET=("Công ty" "Cá nhân" "Thoả thuận")
declare -a ANH=("Companies" "Contacts" "Deals")

hong=0
for i in 0 1 2; do
  m="${MAN[$i]}"
  html="$(curl -s --max-time 20 -H "Cookie: $COOKIE; lang=vi" -H 'Accept-Language: en-US,en;q=0.9' "$APP/$SLUG/$m")"
  [ -n "$html" ] || { echo "RANG CUN: may chu khong tra gi cho /$m"; exit 2; }

  if ! grep -q '<html lang="vi"' <<<"$html"; then
    echo "   THE GOC SAI  /$m — luot ve dau khong mang lang=vi"
    hong=$((hong + 1))
    continue
  fi
  if ! grep -qF "${VIET[$i]}" <<<"$html"; then
    echo "   THIEU CHU VIET  /$m — khong thay $(printf '%q' "${VIET[$i]}") trong luot ve dau"
    hong=$((hong + 1))
    continue
  fi
  tieude="$(sed -n 's/.*<title>\([^<]*\)<\/title>.*/\1/p' <<<"$html" | head -1)"
  case "$tieude" in
    "${VIET[$i]}"*) : ;;
    *)
    echo "   THE TITLE SAI  /$m — <title> doc $(printf '%q' "$tieude"), cho mo dau bang ${VIET[$i]}"
    hong=$((hong + 1))
    continue ;;
  esac
  h1="$(grep -o 'data-slot="page-shell-title"[^>]*>[^<]*' <<<"$html" | sed -e 's/.*>//' | head -1)"
  if [ -z "$h1" ]; then
    echo "RANG CUN: khong tim thay tieu de trang cua /$m trong luot ve dau"
    exit 2
  fi
  if [ "$h1" != "${VIET[$i]}" ]; then
    echo "   TIEU DE SAI  /$m — h1 doc $(printf '%q' "$h1"), cho ${VIET[$i]}"
    hong=$((hong + 1))
    continue
  fi
  echo "   luot ve dau OK  /$m — lang=vi · <title> mo dau ${VIET[$i]} · h1 la $h1"
done

echo "ket qua: man hong=$hong/3"
exit $((hong > 0 ? 1 : 0))
