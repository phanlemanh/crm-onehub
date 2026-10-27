---
schema_version: 1
slug: don-sau-cho-tac-nhan
feature: TheDangDung sống ở packages/ui; CardAction và CardFooter không bị className đổi khoảng cách ở chỗ gọi

Hai mục Known limits chủ kho ghi khi ký K7 (`cho-tac-nhan-lau`, Cổng Bằng chứng 17/10, sổ
`d-20261017T031653Z-32` và `-38`):

- Ngoài-5: thẻ «Đang dựng» (`TheDangDung`) nằm trong `apps/app/components/agent-builder/` thay vì
  `packages/ui`, trái `docs/design.md` («/packages/ui is the single source of truth for UI»). Sửa giao
  diện chat sau này phải làm ở hai nơi.
- Ngoài-11: ở chỗ gọi, `CardAction` mang `gap-3` (mặc định `gap-2`) và `CardFooter` mang `gap-2`
  (mặc định `gap-3`), trái luật «Do not override component styles with className». Thẻ có thể lệch nhẹ
  so với các thẻ khác.

Ai gặp: người dựng giao diện ở kho (phiên máy và chủ kho). Người dùng cuối không thấy khác — việc
dọn, không phải tính năng.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: thẻ «Đang dựng» có còn là bản vẽ tay riêng của khu chat không?
- Kết quả nào là SỐNG: thẻ dựng từ `packages/ui`; chỗ gọi không còn `className` đổi khoảng cách trên
  `CardAction`, `CardFooter`; màn chờ Tác nhân ở 1280 và 375 trông như trước (tiến độ, đồng hồ, nút
  Dừng, câu «rời trang») và các bài kiểm của K7 giữ xanh.
- Kết quả nào là CHẾT: thẻ đổi hình hay mất chữ so với K7; hoặc phải thêm biến thể vào `Card` mà chỉ
  một chỗ dùng.
- Timebox: khoảng 3 giờ máy (một vòng T2, không phiên nghiệm thu — việc dọn không có Cổng Giá trị).
