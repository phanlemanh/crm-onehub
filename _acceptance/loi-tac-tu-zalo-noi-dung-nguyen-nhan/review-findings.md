## Trong hợp đồng

(không có finding nào ánh xạ được vào AC)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **docs/agent.md says every Zalo failure logs one `[zalo] <method> hong: <class>` line, but the setWebhook path in the same route logs a different line**
  Người dùng thấy gì: Tài liệu dành cho người vận hành mô tả sai định dạng của một dòng nhật ký lỗi khi cài bot, nên khi họ tìm lỗi bằng từ khóa quen thuộc có thể bỏ sót đúng trường hợp cần tìm.
  file: `docs/agent.md`
  severity: low
  Đề xuất: known-limits

- **Roadmap row 2c names the wrong round in its note, and is out of date now that #122 has merged**
  Người dùng thấy gì: Bảng theo dõi lộ trình có một ghi chú gọi sai tên vòng làm việc và chưa cập nhật theo tiến độ mới nhất, có thể khiến người đọc bảng hiểu nhầm trạng thái dự án.
  file: `docs/plan/lo-trinh-zalo.md`
  severity: low
  Đề xuất: known-limits

- **docBot treats every 4xx (including 408 timeout and 429 rate limit) as a wrong token, so a transient Zalo failure shows the user «Zalo không nhận token này»**
  Người dùng thấy gì: Khi Zalo chỉ tạm thời chậm phản hồi hoặc giới hạn tốc độ, người quản trị có thể bị báo nhầm rằng token bot họ nhập bị sai, dù token đó vẫn đúng.
  file: `apps/agent/agent/lib/zalo-bot-xuong.ts`
  severity: medium
  Đề xuất: new-contract

- **Shape 5 (claims to cover the whole matrix but the cell count check is always true): soO is compared against the length of the same array the loop walks**
  Người dùng thấy gì: Bộ kiểm thử có thể tự báo đã kiểm đủ mọi trường hợp dù thật ra một vài trường hợp đã bị bỏ sót, nên một lỗi ẩn trong tính năng có thể không được phát hiện.
  file: `apps/api/test/loi-tac-tu-zalo.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative assertion with no positive check): the healthy-path control asserts 0 log lines but never checks that the call reached the agent or succeeded**
  Người dùng thấy gì: Phép kiểm đối chứng cho đường hoạt động bình thường có thể báo đạt ngay cả khi tính năng thật ra không hoạt động, nên một lỗi ở đường bình thường có thể lọt qua mà không ai biết.
  file: `apps/api/test/loi-tac-tu-zalo.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture in the reader's shape): the screen test throws a plain Error holding a hand-copied API sentence instead of the error the real tRPC client produces**
  Người dùng thấy gì: Phép kiểm cho màn hình dùng một câu lỗi chép tay thay vì câu lỗi thật đi qua toàn bộ đường truyền, nên nếu câu lỗi thật đổi khác, người dùng có thể thấy màn hình sai mà phép kiểm vẫn báo đạt.
  file: `apps/app/test/loi-tac-tu-zalo.dom.tsx`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có finding nào ở trạng thái này)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
