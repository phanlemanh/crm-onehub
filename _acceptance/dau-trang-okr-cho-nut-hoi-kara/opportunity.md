---
schema_version: 1
slug: dau-trang-okr-cho-nut-hoi-kara
feature: Khung chờ đầu trang OKR chừa đúng chỗ cho nút «Hỏi Kara», hàng tiêu đề không nhảy khi tải xong
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-15T12:22:27Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
---

## Vấn đề & ai gặp

Giám sát chuyển cho dãy P1 (đợt r2). Chủ kho ký ở phiên giám sát `local_dd79a7f5-cd5b-4d73-b18d-d16b1241ef24`,
nguyên văn: «Cổng Đáng ngan-soan-hydrat-theo-don-vi: build · Cổng Đáng dau-trang-okr-cho-nut-hoi-kara: build».

Hồi quy do #419: ở khổ 375, hàng tiêu đề Toàn cảnh cao 32 px lúc chờ và 96 px khi xong vì nút «Hỏi Kara», nên E12m
của `khung-man-chung` đỏ. Sửa khung chờ cho chừa đúng chỗ, rồi ghim lại `khung-man-chung`. Ai gặp: mọi người mở
khu OKR trên điện thoại — trang nhảy khi dữ liệu tới.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: …
- Kết quả nào là SỐNG: …
- Kết quả nào là CHẾT: …
- Timebox: …
