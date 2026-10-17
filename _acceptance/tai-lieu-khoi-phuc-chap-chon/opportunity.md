---
schema_version: 1
slug: tai-lieu-khoi-phuc-chap-chon
feature: Ca kiểm lưu trữ và khôi phục của Kho tài liệu không còn đỏ ngẫu nhiên
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-16T15:08:22Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
---

## Vấn đề & ai gặp

Hàng F33 (mã tạm) của dãy P4, đợt r2. Giám sát giao 16/10:

«`apps/api/test/tai-lieu-luu-tru.spec.ts:290` («khoi-phuc») đếm sự kiện từ mốc `Date.now()-1` nên lọt sự kiện DE_XUAT cùng mili-giây, đỏ ngẫu nhiên ở pre-push (#413 đã vấp).»

«Chỉ sửa tệp kiểm, ước ~30 phút máy.»

Ai gặp: mọi phiên đẩy nhánh có chạy bộ kiểm API ở pre-push — một lần đỏ giả là một lượt đẩy lại khoảng 15 phút.

Cổng Đáng: chủ kho gõ ở phiên giám sát lúc 2026-10-16T15:08:22Z «Cổng Đáng F33: build».

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: …
- Kết quả nào là SỐNG: …
- Kết quả nào là CHẾT: …
- Timebox: …
