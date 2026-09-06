#!/usr/bin/env bash
RANG="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GOC="$(cd "$RANG/../../.." && pwd)"
BE_RONG="${BE_RONG_HEP:-360}"

# KHOA MOC ghim ten: cho nao duoc cam mot nhan tieng Viet DAI de doi chan
# be-rong bao tran. Truoc khi cam, tien de phai co that — xem duoi.
KHOA_MOC="oSoan.moLenh"
ROUTE_MOC="/chat"

echo "-- tien de: co nhan nao CUA LAT nam trong hop chat cung tren man do duoc khong?"
if ! node "$RANG/man-that.mjs" be-rong-tien-de; then
  echo "KHONG DO DUOC: thieu tien de nen KHONG chay phep cam vet."
  echo "    Khoa moc ghim ten la $KHOA_MOC tren $ROUTE_MOC, nhung khong hop chat cung nao"
  echo "    tren hai man do duoc mang chu cua lat — moi hop deu CHO XUONG DONG, nen mot"
  echo "    nhan dai chi wrap chu khong bao gio tran."
  echo "    KHONG duoc doc ket qua rong nay la 'ban dich vua'."
  exit 2
fi

echo "-- tien de co that, cam vet vao $KHOA_MOC"
echo "(duong cam vet chua dung — chan nay thoat ma 2 o tien de tren moi lat hien co)"
exit 2
