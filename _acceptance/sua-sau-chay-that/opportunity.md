---
schema_version: 1
slug: sua-sau-chay-that
feature: Danh sách góp ý đã gom được sửa trong một lượt
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: l5
lo_trinh_tep: docs/plan/lo-trinh-kho-tai-lieu.json
---

## Vấn đề & ai gặp

Mở từ hàng l5 của «Kho tài liệu» (`docs/plan/lo-trinh-kho-tai-lieu.json`).

Danh sách góp ý đã gom được sửa trong một lượt

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Sau khi bật, người viết và người duyệt Kho tài liệu có hết vấp các hạn chế đã gom (số bản chờ sai, ô chọn rỗng khi tải lỗi, mục lục lỗi ký tự, liên kết http lọt, câu tiếng Việt trên giao diện tiếng Anh) mà trợ lý kho vẫn trả lời đúng không kém trước không?
- Kết quả nào là SỐNG: Trong phiên nghiệm thu với ít nhất 3 người viết hoặc duyệt trang Kho tài liệu, 0 người vấp lại mục nào trong G1–G12, và đo lại bộ 50 câu hỏi mẫu bằng do-bo-mau.ts trên bản đã bật không có câu đạt nào thành không đạt so với lượt đo đã ký (câu lỗi gọi model tách riêng).
- Kết quả nào là CHẾT: Có từ 2 người trở lên vấp lại cùng một mục trong G1–G12, hoặc bộ 50 câu hỏi mẫu có từ 2 câu trở lên chuyển từ đạt sang không đạt so với lượt đo đã ký (không kể câu lỗi gọi model).
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
