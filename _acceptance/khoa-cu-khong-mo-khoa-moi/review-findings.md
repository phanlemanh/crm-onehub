## Trong hợp đồng

(không có phát hiện nào ánh xạ được vào AC ở vòng này.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Day constant re-derived inline instead of reusing the existing test DAY_MS**
    Người dùng thấy gì: Không ảnh hưởng người dùng — đây chỉ là cách viết mã trong bài kiểm nội bộ, hành vi tính năng khoá API không đổi.
    file: `apps/api/test/go-la-cat-quyen.spec.ts`
    severity: low
    Đề xuất: known-limits

- **Hình dạng 4 — assertion âm tính một mình: E6 (don-bang-rong) chỉ khẳng định «không gì đổi», không có đối chứng dương trong cùng lượt đo**
    Người dùng thấy gì: Nếu lượt dọn khoá chạy sai kiểu âm thầm (không khớp trúng hàng nào), bài kiểm cho trường hợp bảng thành viên rỗng có thể báo xanh oan, khiến người ký không phát hiện lỗi đó trước khi phát hành.
    file: `apps/api/test/go-la-cat-quyen.spec.ts`
    severity: low
    Đề xuất: known-limits

- **Hình dạng 2 — fixture viết tay đúng khuôn bên đọc: `lastRequest` đặt thẳng vào DB rồi đếm `dungGanDay`, không đi vòng qua bên ghi thật**
    Người dùng thấy gì: Số 'khoá dùng gần đây' mà người ký Cổng 2 xem trước có thể lặng lẽ sai trong tương lai nếu cách ghi thời điểm dùng khoá đổi khác đi, mà bài kiểm hiện tại sẽ không bắt được để cảnh báo trước khi phát hành.
    file: `apps/api/test/go-la-cat-quyen.spec.ts`
    severity: low
    Đề xuất: known-limits

- **New env variable XEM_TRUOC_DATABASE_URL is not in .env.example or the setup docs (mang sang từ round 1)**
    Người dùng thấy gì: Người chuẩn bị chạy bước kiểm tra an toàn trước khi phát hành có thể không tìm thấy tên biến cần khai ở nơi tài liệu quen thuộc, dễ bỏ sót hoặc làm sai bước kiểm tra đó.
    file: `packages/db/scripts/xem-truoc-luot-don.ts`
    severity: medium
    Đề xuất: known-limits

- **apps/api test imports a script from packages/db by relative path, bypassing the package's exports (mang sang từ round 1)**
    Người dùng thấy gì: Nếu cấu trúc nội bộ phía sau thay đổi sau này, bộ kiểm tra tự động có thể báo lỗi mà không liên quan gì đến việc tính năng có còn hoạt động đúng hay không, làm chậm việc xác nhận bản phát hành.
    file: `apps/api/test/go-la-cat-quyen.spec.ts`
    severity: medium
    Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).