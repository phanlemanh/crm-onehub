## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **khong-hoi-quy.mjs anchors its scope to the moving origin/onehub branch, the pattern the sibling script dropped the same day**
  Người dùng thấy gì: Neu mot thay doi khac sau nay cung sua file dung chung apps/app/lib/trpc/cache.ts, cong cu kiem tra tu dong co the bao do gia (bao co loi khi thuc ra khong), lam mat thoi gian dieu tra mot canh bao khong that.
  file: `_acceptance/lam-moi-chuyen-viec-qua-loi-chung/rang/khong-hoi-quy.mjs`
  severity: medium
  Đề xuất: new-contract

- **A missing origin/onehub ref ends the run with an uncaught exception and exit 1 instead of the script's own 'KHONG DO DUOC' exit 2**
  Người dùng thấy gì: Tren mot so may hoac ban sao kho khong day du, cong cu kiem tra co the bao nham loai loi — hien 'co van de nghiem trong' thay vi 'khong do duoc' — khien nguoi xem ket qua hieu sai muc do.
  file: `_acceptance/lam-moi-chuyen-viec-qua-loi-chung/rang/khong-hoi-quy.mjs`
  severity: low
  Đề xuất: known-limits

- **Assertion âm tính một mình (hình 4): bộ ghi invalidateQueries bỏ qua lời gọi không có queryKey, nên «0 lời gọi» của E3 đo trên một công cụ đã lọc**
  Người dùng thấy gì: Bai kiem tra tu dong co the bo sot mot so kieu goi lam-moi-bo-nho khong dung khoa truc tiep, nen sau nay mot thay doi vi pham quy tac 'khong lam moi khi loi' co the lot qua ma khong bi phat hien.
  file: `apps/app/test/lam-moi-chuyen-viec.dom.tsx`
  severity: medium
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
