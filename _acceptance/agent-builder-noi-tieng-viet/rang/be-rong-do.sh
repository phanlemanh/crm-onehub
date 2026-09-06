#!/usr/bin/env bash
RANG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB="$RANG/../../man-cai-dat-noi-tieng-viet/rang"
export KHO_CHUOI="apps/app/lib/messages/agent-builder-khung.ts"
export KHOA_MOC="tacNhanCuaDoi"
export GIA_TRI_MOC="Tác nhân của đội"
export CHAN_MAN="$RANG/man-that.mjs"
echo "-- tien de: co nhan nao cua lat nam trong hop chat cung khong?"
if ! node "$CHAN_MAN" be-rong-tien-de; then
  echo "KHONG DO DUOC: thieu tien de nen KHONG chay phep cam vet — va KHONG duoc doc ket qua rong nay la 'ban dich vua'."
  exit 2
fi

exec bash "$LIB/be-rong-do-lib.sh" "$@"

# GHI CHU 06/09: chieu do cua chan be-rong KHONG chung duoc tren lat nay, va tu
# hom nay dieu do duoc DO chu khong con la mot cau ghi tay. Chan be-rong-tien-de
# dem cac hop CHAT CUNG (nowrap / ellipsis / overflow an) tren hai man dung duoc
# roi hoi: co hop nao mang mot chu CUA LAT nay khong? Ngay 06/09 con so la 0/4 —
# bon hop chat cung deu mang chu cua cua so tro chuyen, tuc dot HAI. Thieu tien
# de thi khong cam vet, va khong duoc doc ket qua rong la "ban dich vua".
# Man co nhan cua lat trong hop hep la /agents/[agentId], nam duoi cung gioi han
# voi AC-1.
