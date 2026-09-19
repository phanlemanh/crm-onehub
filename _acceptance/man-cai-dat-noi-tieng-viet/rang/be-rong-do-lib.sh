#!/usr/bin/env bash
set -uo pipefail
RANG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$RANG/../../.." && pwd)"
: "${KHO_CHUOI:?can KHO_CHUOI}"
: "${KHOA_MOC:?can KHOA_MOC}"
: "${GIA_TRI_MOC:?can GIA_TRI_MOC}"
: "${CHAN_MAN:?can CHAN_MAN}"
KHO="$ROOT/$KHO_CHUOI"
GIU="$(mktemp)"
BE_RONG="${BE_RONG_HEP:-360}"
THUT="${THUT:-		}"
APP="${APP_URL:-http://localhost:3000}"

cd "$ROOT" || exit 2
node "$RANG/khoa-cay.mjs" viet $$ || exit 2
export KHOA_CAY_CHU=$$
cp "$KHO" "$GIU"
tra() { cp "$GIU" "$KHO"; rm -f "$GIU"; node "$RANG/khoa-cay.mjs" tha $$; }
trap tra EXIT

truoc="$(git status --porcelain | sort)"

if ! node "$RANG/canh-cay.mjs"; then
  echo "    Chan be-rong-do dot bien cay TAI CHO roi doc con so tu man hinh, nen no chi co nghia"
  echo "    khi may chu o APP_URL dang doc dung cai cay vua bi dot bien. Chua chung duoc dieu do"
  echo "    thi KHONG cam vet va KHONG doc con so nao — con so 0 o day se la loi buoc toi oan."
  exit 2
fi

if ! grep -qF "$KHOA_MOC: \"$GIA_TRI_MOC\"," "$KHO"; then
  echo "KHONG DO DUOC: khong tim thay khoa moc $KHOA_MOC trong $KHO_CHUOI — vet da lac hau so voi ma"
  exit 2
fi

# Vet phai la mot cum tieng Viet CO DAU doc duoc: no nam tren cay khoang 15 giay,
# va bat ky agent nao doc file trong cua so do se thay no. Vet khong dau, tu mo ta
# la vet, tung lam ba giam khao cham AC-1 truot oan ngay 05/09.
DAI="$GIA_TRI_MOC của người dùng trong công ty và toàn bộ quyền đi kèm"
KHOA_MOC="$KHOA_MOC" GIA_TRI_MOC="$GIA_TRI_MOC" DAI="$DAI" THUT="$THUT" perl -pi -e '
  my $k = quotemeta($ENV{KHOA_MOC});
  my $g = quotemeta($ENV{GIA_TRI_MOC});
  my $t = quotemeta($ENV{THUT});
  s/^$t$k: "$g",$/$ENV{THUT}$ENV{KHOA_MOC}: "$ENV{DAI}",/;
' "$KHO"
sleep "${CHO_HMR:-6}"

ra="$(BE_RONG_HEP="$BE_RONG" VET_MOC="$DAI" node "$CHAN_MAN" be-rong 2>&1)"
ma=$?

so="$(printf '%s\n' "$ra" | sed -n 's/.*vi tran ma en vua=\([0-9]*\).*/\1/p' | head -1)"
vet="$(printf '%s\n' "$ra" | sed -n 's/^vet moc tren man=\([0-9]*\)\/\([0-9]*\)$/\1 \2/p' | head -1)"
printf '%s\n' "$ra" | grep -E '^   TRAN:|^ket qua|^vet moc tren man=' || true

tra
trap - EXIT
sau="$(git status --porcelain | sort)"

if [ "$truoc" != "$sau" ]; then
  echo "KHONG DO DUOC: cay lam viec khac truoc khi chay — vet chua duoc tra nguyen trang"
  exit 2
fi
echo "cay lam viec da tro ve dung trang thai truoc khi chay."

if [ "$ma" -eq 2 ]; then
  echo "KHONG DO DUOC: chan be-rong tu khai tien de thieu (ma 2) trong luc cam vet — con so no in ra khong noi len dieu gi."
  exit 2
fi

if [ -z "$vet" ]; then
  echo "KHONG DO DUOC: chan be-rong khong in ra dong 'vet moc tren man=' — khong biet ban da cam co len den man khong."
  exit 2
fi
vetThay="${vet%% *}"
vetTren="${vet##* }"

if [ "$vetTren" -lt 1 ]; then
  echo "KHONG DO DUOC: chan be-rong khong mo duoc man nao de doi chieu vet — khong doc duoc gi."
  exit 2
fi

if [ "$vetThay" -lt 1 ]; then
  echo "KHONG DO DUOC: da cam vet vao $KHO_CHUOI nhung KHONG man nao ve ra no (0/$vetTren man)."
  echo "    May chu o $APP dang phuc vu dung cay nay, nen day khong phai chuyen do nham cay:"
  echo "    ban cam chua kip len den man trong CHO_HMR=${CHO_HMR:-6} giay, hoac no khong ra man nao dang do."
  echo "    Con so be-rong doc duoc noi ve ban CHUA cam vet, nen no khong noi gi ve chan be-rong."
  echo "    Nang CHO_HMR roi chay lai; KHONG duoc doc con so 0 nay la 'chan be-rong mu'."
  exit 2
fi

if [ -z "$so" ]; then
  echo "KHONG DO DUOC: chan be-rong khong in ra con so 'vi tran ma en vua' — khong doc duoc ket qua"
  exit 2
fi

if [ "$so" -lt 1 ]; then
  echo "DO: cam mot nhan tieng Viet dai vao kho chuoi ma chan be-rong KHONG do o be rong ${BE_RONG}px."
  echo "    Vet DA len den man ($vetThay/$vetTren man ve ra no) tren dung cay dang xet, nen con so 0"
  echo "    nay noi ve chinh cai thuoc, khong phai ve phep cam vet."
  echo "    Mot thuoc chua tung do o dung chieu no sinh ra de bat thi khong phan biet duoc"
  echo "    'ban dich vua' voi 'phep do mu'. Chan be-rong dang mu."
  exit 1
fi

echo "XANH: chan be-rong do dung chieu — $so nhan tran o luot vi trong khi luot en vua, tai ${BE_RONG}px."
echo "      (vet len den man o $vetThay/$vetTren man, tren dung cay dang xet)"
