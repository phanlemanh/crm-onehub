## Trong hợp đồng

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): lệnh xem trước của AC-9 không được chạy; phần lệnh in ra được kiểm bằng cách đọc mã**
  file: `_acceptance/khoa-cu-khong-mo-khoa-moi/evals.yaml:71`
  severity: low
  AC: AC-9
  AC-9 hứa về đầu ra của lệnh `packages/db/scripts/xem-truoc-luot-don.ts`: in số khoá, số chủ khoá, số khoá dùng trong 30 ngày và tên máy; chạy trong giao dịch chỉ-đọc; chỉ đọc `XEM_TRUOC_DATABASE_URL`. Bài `xem-truoc-dung-so` (apps/api/test/go-la-cat-quyen.spec.ts, khoảng dòng 780-808) không chạy lệnh đó. Nó chỉ gọi hàm dùng chung `cauXemTruoc(sql)` qua Prisma. E9 tự ghi rằng hai tính chất an toàn được «đọc từ mã lệnh ... không đo bằng bài chạy», tức là lấy mã nguồn thay cho đầu ra. Riêng cột `dungGanDay` (số khoá dùng trong 30 ngày) có khai kiểu trong bài nhưng không có assert nào. Dữ liệu dựng cũng không đặt `lastRequest`, nên bộ lọc `FILTER (WHERE "lastRequest" > NOW() - INTERVAL '30 days')` chưa bao giờ chạy tới. Hệ quả: đảo điều kiện 30 ngày, bỏ `BEGIN READ ONLY`, hoặc đọc nhầm `DATABASE_URL` thì bài vẫn xanh. Quan hệ «xem trước = số dòng migration đổi» (khopSoDong) đã đo tốt. Lỗ hổng chỉ nằm ở phần lệnh tự làm quanh câu SQL đó.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **New env variable XEM_TRUOC_DATABASE_URL is not in .env.example or the setup docs**
  Người dùng thấy gì: Người chuẩn bị chạy bước kiểm tra an toàn trước khi phát hành có thể không tìm thấy tên biến cần khai ở nơi tài liệu quen thuộc, dễ bỏ sót hoặc làm sai bước kiểm tra đó.
  file: `packages/db/scripts/xem-truoc-luot-don.ts`
  severity: medium
  Đề xuất: known-limits

- **apps/api test imports a script from packages/db by relative path, bypassing the package's exports**
  Người dùng thấy gì: Nếu cấu trúc nội bộ phía sau thay đổi sau này, bộ kiểm tra tự động có thể báo lỗi mà không liên quan gì đến việc tính năng có còn hoạt động đúng hay không, làm chậm việc xác nhận bản phát hành.
  file: `apps/api/test/go-la-cat-quyen.spec.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).