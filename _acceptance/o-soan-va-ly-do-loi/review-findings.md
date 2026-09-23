## Trong hợp đồng

Findings: []

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Caret colour is written twice, as a CSS string and as an RGB array, and nothing ties them together (r3)**
  Người dùng thấy gì: Neu sau nay co nguoi doi mau con tro dung de do ma quen doi ca hai cho, buoc kiem tu dong co the bao nham la loi du o soan van hoat dong dung — nguoi dung cuoi khong bi anh huong, chi anh huong do tin cay cua phep kiem.
  file: `_acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs`
  severity: low
  Đề xuất: known-limits

- **A test fixture under apps/api/test is imported by relative path from apps/agent and apps/app (r1)**
  Người dùng thấy gì: Neu ai do xoa hoac doi ten thu muc test cua mot ung dung, hai ung dung khac am tham hong theo ma khong co canh bao, vi ba noi cung dung chung mot tep du lieu mau nam ngoai cho quy dinh.
  file: `apps/agent/test/log-loi-hoi-thoai.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay vì quan hệ): E7 hàng 3 không kiểm lý do hỏng M3 của bản ghi task (r1)**
  Người dùng thấy gì: Neu tac vu nghien cuu hong nhung ly do luu lai bi sai hoac de trong, vong do hien tai van co the bao dat vi chi kiem trang thai hong chu khong kiem dung ly do — nguoi xem bao cao hong co the thay ly do khong khop voi chuyen da thuc su xay ra.
  file: `apps/agent/test/log-loi-hoi-thoai.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Findings: []

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
