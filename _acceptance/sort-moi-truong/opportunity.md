---
schema_version: 1
slug: sort-moi-truong
feature: Nhân viên quan hệ đối tác sắp danh sách theo bất kỳ trường nào và thấy cột trường tự tạo ở khổ hẹp như cột có sẵn, cả trên thẻ Kanban
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: manh
decided_at: 2026-10-21T00:41:10Z
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DA17
lo_trinh_tep: docs/plan/lo-trinh-viec-du-an.json
---

Gốc: hàng DA17 của `docs/plan/lo-trinh-viec-du-an.json` (gói `truong-hop-dong`, #511, onehub 37e7bf27c).

Quyết định Cổng Đáng: build. Chủ kho 20/10, nguyên văn: «Tôi duyệt Cổng Đáng build cho cả 9 hàng.»

## Vấn đề & ai gặp

Mở từ hàng DA17 của «Việc và Dự án» (`docs/plan/lo-trinh-viec-du-an.json`).
Mốc: 2026-10-22 — mốc đợt `viec-du-an-kho-tai-lieu` cho cả chín hàng DA14–DA23 (chủ kho 21/10: «Đưa mốc về trong hôm nay hoặc mai phải hoàn thành»).

Nhân viên quan hệ đối tác sắp danh sách theo bất kỳ trường nào và thấy cột trường tự tạo ở khổ hẹp như cột có sẵn, cả trên thẻ Kanban

Vì sao: dynamic-fields.md §7 để sort sang giai đoạn hai rồi chưa làm: SORTABLE chỉ có cột chuẩn, resolveOrderBy lặng lẽ về mặc định; cột trường tự tạo luôn ẩn dưới lg (field-columns.tsx:68); thẻ Kanban bỏ giá trị trường (deals.contracts.ts:236).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: người dùng thật có sắp được danh sách theo một trường tự tạo khi cần, và có còn thấy trường tự tạo biến mất ở khổ hẹp hay trên thẻ Kanban không.
- Kết quả nào là SỐNG: [đề xuất] ở phiên nghiệm thu, giao «sắp thoả thuận theo một trường tự tạo kiểu Ngày» và «tìm giá trị trường tự tạo trên thẻ Kanban»: ít nhất bốn trên năm người làm được không cần hỏi; trên điện thoại cột trường tự tạo hiện như cột chuẩn cùng kiểu.
- Kết quả nào là CHẾT: [đề xuất] đa số người không tìm ra cách sắp theo trường tự tạo, hoặc bấm sắp mà thứ tự không đổi.
- Timebox: [đề xuất] gộp chung buổi đọc số của gói truong-hop-dong sau khi DA17, DA18 lên production.
