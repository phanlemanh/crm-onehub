#!/usr/bin/env bash
set -uo pipefail
RANG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$RANG/../../.." && pwd)"
KHO="$ROOT/apps/app/lib/messages/settings.ts"
GIU="$(mktemp)"
BE_RONG="${BE_RONG_HEP:-360}"

cd "$ROOT" || exit 2
cp "$KHO" "$GIU"
tra() { cp "$GIU" "$KHO"; rm -f "$GIU"; }
trap tra EXIT

truoc="$(git status --porcelain | sort)"

if ! grep -q 'daCam: "Đã cắm",' "$KHO"; then
  echo "KHONG DO DUOC: khong tim thay khoa moc daCam trong kho chuoi — vet da lac hau so voi ma"
  exit 2
fi

perl -pi -e 's/^\t\tdaCam: "Đã cắm",$/\t\tdaCam: "Đã cắm và đang hoạt động bình thường ở mọi lượt",/' "$KHO"
sleep "${CHO_HMR:-6}"

ra="$(BE_RONG_HEP="$BE_RONG" node "$RANG/man-that.mjs" be-rong 2>&1)"
ma=$?

so="$(printf '%s\n' "$ra" | sed -n 's/.*vi tran ma en vua=\([0-9]*\).*/\1/p' | head -1)"
printf '%s\n' "$ra" | grep -E '^   TRAN:|^ket qua' || true

tra
trap - EXIT
sau="$(git status --porcelain | sort)"

if [ "$truoc" != "$sau" ]; then
  echo "KHONG DO DUOC: cay lam viec khac truoc khi chay — vet chua duoc tra nguyen trang"
  exit 2
fi
echo "cay lam viec da tro ve dung trang thai truoc khi chay."

if [ -z "$so" ]; then
  echo "KHONG DO DUOC: chan be-rong khong in ra con so 'vi tran ma en vua' — khong doc duoc ket qua"
  exit 2
fi

if [ "$so" -lt 1 ]; then
  echo "DO: cam mot nhan tieng Viet dai vao kho chuoi ma chan be-rong KHONG do o be rong ${BE_RONG}px."
  echo "    Mot thuoc chua tung do o dung chieu no sinh ra de bat thi khong phan biet duoc"
  echo "    'ban dich vua' voi 'phep do mu'. Chan be-rong dang mu."
  exit 1
fi

echo "XANH: chan be-rong do dung chieu — $so nhan tran o luot vi trong khi luot en vua, tai ${BE_RONG}px."
