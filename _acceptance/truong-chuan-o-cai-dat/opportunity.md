---
schema_version: 1
slug: truong-chuan-o-cai-dat
feature: Quản trị mở Cài đặt › Trường, thấy trường chuẩn bằng tiếng Việt khớp đúng phiếu, sắp lại và ẩn được chúng, và bật «Bắt buộc» cho một trường
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: manh
decided_at: 2026-10-21T00:41:27Z
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DA15
lo_trinh_tep: docs/plan/lo-trinh-viec-du-an.json
---

Gốc: hàng DA15 của `docs/plan/lo-trinh-viec-du-an.json` (gói `truong-hop-dong`, #511, onehub 37e7bf27c).

Quyết định Cổng Đáng: build. Chủ kho 20/10, nguyên văn: «Tôi duyệt Cổng Đáng build cho cả 9 hàng.»

## Vấn đề & ai gặp

Mở từ hàng DA15 của «Việc và Dự án» (`docs/plan/lo-trinh-viec-du-an.json`).
Mốc: 2026-10-22 — mốc đợt `viec-du-an-kho-tai-lieu` cho cả chín hàng DA14–DA23 (chủ kho 21/10: «Đưa mốc về trong hôm nay hoặc mai phải hoàn thành»).

Quản trị mở Cài đặt › Trường, thấy trường chuẩn bằng tiếng Việt khớp đúng phiếu, sắp lại và ẩn được chúng, và bật «Bắt buộc» cho một trường

Vì sao: Cài đặt › Trường hứa «chỉ sắp lại thứ tự và ẩn» trường chuẩn (crm.ts:480) mà danh sách chỉ đọc, viết cứng tiếng Anh (standard-fields.ts) và thiếu trường so với phiếu; ô «Bắt buộc» có trong mô hình nhưng giao diện luôn gửi false (field-editor.tsx:200).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: quản trị có tự sắp được phiếu theo cách đội mình đọc (đổi chỗ, ẩn trường chuẩn, bắt buộc một trường) mà không phải hỏi người dựng không, và danh sách ở Cài đặt có khớp đúng phiếu không.
- Kết quả nào là SỐNG: ở phiên nghiệm thu, giao quản trị ba việc — đưa một trường tự tạo lên trên Ngày chốt, ẩn một trường chuẩn, bắt buộc một trường — thì ít nhất bốn trên năm người làm xong cả ba không cần trợ giúp, và mở phiếu thấy đúng thứ tự vừa đặt.
- Kết quả nào là CHẾT: đa số người không tìm ra cách đổi chỗ hay ẩn trường chuẩn, hoặc phiếu hiện khác thứ tự đã đặt ở Cài đặt.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
