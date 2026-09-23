## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **The API key endpoint check does not see an API-key session, so a non-member holding an enabled key can still create or re-enable keys through Better Auth**
  Người dùng thấy gì: Một người đã bị gỡ khỏi không gian làm việc nhưng còn giữ khoá API cũ chưa bị tắt vẫn có thể tự tạo khoá mới hoặc tự bật lại khoá cũ mà không cần đăng nhập lại, tức là vẫn mở được đường truy cập mới sau khi đã bị gỡ.
  file: `packages/auth/src/canh-khoa-api.ts`
  severity: medium
  Đề xuất: new-contract

- **Hinh dang 4 (kiem am mot minh): ma khac 200 cua khoa da tat thuc ra do phep kiem tu cach sinh ra, khong phai do khoa bi tat**
  Người dùng thấy gì: Neu sau nay tinh nang tat khoa bi hong rieng le, bo bai kiem hien tai co the khong bat duoc loi do, khien nguoi da bi go van con dung duoc khoa cu ma khong ai phat hien kip thoi.
  file: `apps/api/test/go-la-cat-quyen.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hinh dang 4 (kiem am mot minh): loi goi bat lai khoa (batLai) chi kiem 'khong 2xx', khong co doi chung duong va khong ghim thong diep**
  Người dùng thấy gì: Neu duong bat lai khoa cu sau nay bi hong vi mot ly do khac, bo bai kiem hien tai co the van bao xanh nham, khien loi that khong duoc phat hien som.
  file: `apps/api/test/go-la-cat-quyen.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).