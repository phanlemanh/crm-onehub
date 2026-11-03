---
schema_version: 1
slug: lich-su-va-luu-tru-trang
feature: Tôi xem được các phiên bản cũ của trang, khôi phục một bản cũ qua duyệt, và lưu trữ trang không còn dùng
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: l3b
lo_trinh_tep: docs/plan/lo-trinh-kho-tai-lieu.json
---

## Vấn đề & ai gặp

Mở từ hàng l3b của «Kho tài liệu» (`docs/plan/lo-trinh-kho-tai-lieu.json`).

Tôi xem được các phiên bản cũ của trang, khôi phục một bản cũ qua duyệt, và lưu trữ trang không còn dùng

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Sau khi bật, người dùng Kho tài liệu có thật sự quay lại bản cũ và lưu trữ trang không còn dùng qua duyệt, thay vì để trang cũ nằm lẫn trong danh sách không?
- Kết quả nào là SỐNG: Trong timebox, bảng TaiLieuDeXuat có ít nhất 3 đề xuất loại lưu trữ hoặc quay lại phiên bản cũ đã được duyệt, và không quá 1 trang đã lưu trữ bị khôi phục trong vòng 7 ngày vì lưu trữ nhầm.
- Kết quả nào là CHẾT: Hết timebox mà TaiLieuDeXuat có 0 đề xuất lưu trữ và 0 đề xuất quay lại bản cũ được duyệt, hoặc quá nửa số trang đã lưu trữ bị khôi phục trong vòng 7 ngày.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
