## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **The new-deal form now saves a hard-coded USD when currency settings haven't loaded**
  Người dùng thấy gì: Nếu mở tấm tạo thoả thuận đúng lúc hệ thống chưa kịp tải xong loại tiền tệ của workspace, số tiền có thể bị lưu nhầm là đô la Mỹ thay vì đúng loại tiền đang dùng, khiến tổng tiền và báo cáo bị sai.
  file: `apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx`
  severity: medium
  Đề xuất: new-contract

- **`useMoneyReading` is exported but never used**
  Người dùng thấy gì: Không ảnh hưởng đến người dùng — đây là một đoạn mã dùng chung không ai gọi tới, an toàn nếu để nguyên.
  file: `packages/ui/src/components/money-input.tsx`
  severity: low
  Đề xuất: wont-fix

- **money-input.ts adds its own Intl.NumberFormat caches beside the one format.ts already has**
  Người dùng thấy gì: Không ảnh hưởng đến người dùng — đây chỉ là cách tổ chức mã bên trong, không làm thay đổi những gì hiện ra hay được lưu trên ô số tiền.
  file: `packages/ui/src/lib/money-input.ts`
  severity: low
  Đề xuất: wont-fix

- **Create-deal now sends a hard-coded USD fallback instead of letting the server pick the workspace currency**
  Người dùng thấy gì: Khi thiết lập tiền tệ của workspace chưa tải xong hoặc bị lỗi, thoả thuận mới tạo có thể bị ghi nhận sai loại tiền (mặc định đô la Mỹ) mà người dùng không hề hay biết, kéo theo tổng tiền và báo cáo sai.
  file: `apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx`
  severity: medium
  Đề xuất: new-contract

- **Quick-add deal is silently disabled when the currency-settings query fails**
  Người dùng thấy gì: Nếu việc tải cấu hình tiền tệ bị lỗi, người dùng có thể không tạo được thoả thuận nhanh từ trang công ty — nút Tạo chỉ đứng im, không có thông báo nào giải thích vì sao.
  file: `apps/app/components/crm/record-sheet/quick-add.tsx`
  severity: medium
  Đề xuất: new-contract

- **Assertion âm-tính-một-mình (hình 4): nút Tạo của thêm-nhanh bị khoá khi thiết lập tiền tệ chưa về, không có đối chứng dương**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng trực tiếp, nhưng nếu về sau nút Tạo của thêm-nhanh bị khoá nhầm dù đủ điều kiện tạo, bộ kiểm tra hiện tại có thể không phát hiện ra lỗi đó trước khi phát hành.
  file: `apps/app/test/o-so-tien.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Tuyên bố quét cả lớp nhưng không đếm đủ (hình 5): soi-ma đếm số khẳng định rồi không đối chiếu với số đã khai**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng trực tiếp; nhưng nếu một phần của tính năng bị bỏ sót khi kiểm tra tĩnh, hiện không có cơ chế cảnh báo, nên lỗi ẩn có thể lọt qua vòng kiểm tra mà không ai hay.
  file: `_acceptance/o-so-tien-doc-theo-tieng/rang/soi-ma.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).