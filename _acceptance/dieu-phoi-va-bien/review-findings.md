# Review findings: dieu-phoi-va-bien (round 2)

## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Một tệp tra-loi gia-han hỏng làm hỏng cả nhịp: không cấp và không thu hồi khoá nào (r1)**
  Người dùng thấy gì: Nếu người giám sát gõ tay một tệp trả lời duyệt gia hạn bị sai cú pháp, bộ điều phối ngừng làm việc ở mọi nhịp sau: không cấp lượt mới, không thu hồi khoá hết hạn, bảng theo dõi không cập nhật cho tới khi có người sửa tay tệp đó.
  file: `scripts/dieu-phoi/phat-lich.mjs`
  severity: medium
  Đề xuất: new-contract

- **lenhBoc passes env-prefixed commands straight to spawn, so the wrapped command the hook tells the agent to run fails with exit 127 (r1)**
  Người dùng thấy gì: Khi một phiên đang giữ khoá và chạy lệnh nền có đặt biến môi trường phía trước, hệ thống chặn và gợi ý một dòng lệnh để chép chạy lại, nhưng dòng đó lỗi ngay nên phiên không có cách chạy việc nền đó cho đến khi tự sửa dòng lệnh.
  file: `scripts/dieu-phoi/hook-chan-s4.mjs`
  severity: medium
  Đề xuất: new-contract

- **An approved gia-han request older than the lock's cap_luc is skipped silently: no gia-han-khong-ap event, and the tra-loi still says duyet (r1)**
  Người dùng thấy gì: Nếu khoá hết hạn rồi được cấp lại trong lúc người giám sát đang cân nhắc, lời duyệt gia hạn đến sau sẽ không có tác dụng và không ai được báo; phiên làm việc vẫn tưởng lượt thuê đã được kéo dài và có thể bị thu khoá giữa chừng.
  file: `scripts/dieu-phoi/phat-lich.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture shaped to fit the reader, no writer-to-reader round-trip): the test copies moDot's transform by hand instead of reading what moDot writes (r1)**
  Người dùng thấy gì: Bộ kiểm tra tự động hiện chưa thử với tệp cấu hình do chính lệnh mở đợt tạo ra. Nếu sau này lệnh mở đợt ghi thêm một trường mới, mọi đợt thật có thể hỏng ngay lúc bắt đầu mà các bài kiểm tra vẫn báo xanh.
  file: `scripts/dieu-phoi/test/hinh-dang.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative assertion with no pinned message): cli.test checks only `ma === 2`, which the new internal-error path also returns, so the moDot → hook round-trip test no longer measures anything (r1)**
  Người dùng thấy gì: Một bài kiểm tra chạy thử hook chặn trong đợt thật chỉ xem mã thoát nên không phân biệt được hook chặn đúng lý do với việc cấu hình đợt bị hỏng. Hệ thống đúng thì vẫn xanh, nhưng khi cấu hình hỏng bài kiểm tra này cũng không báo.
  file: `scripts/dieu-phoi/test/cli.test.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
