---
schema_version: 1
slug: truong-mot-cach-cu-xu
feature: "Nhân viên quan hệ đối tác xem và sửa một trường tự tạo trên phiếu và trong bảng y như trường có sẵn: số viết kiểu Việt, ô tích có nhãn, liên kết bấm được, lỗi nói tiếng Việt"
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: manh
decided_at: 2026-10-20T23:42:32Z
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DA14
lo_trinh_tep: docs/plan/lo-trinh-viec-du-an.json
---

Gốc: hàng DA14 của `docs/plan/lo-trinh-viec-du-an.json` (gói `truong-hop-dong`, #511, onehub 37e7bf27c).

Quyết định Cổng Đáng: build. Chủ kho 20/10, nguyên văn: «Tôi duyệt Cổng Đáng build cho cả 9 hàng.»

## Vấn đề & ai gặp

Mở từ hàng DA14 của «Việc và Dự án» (`docs/plan/lo-trinh-viec-du-an.json`).
Mốc: 2026-10-22 — mốc đợt `viec-du-an-kho-tai-lieu` cho cả chín hàng DA14–DA23 (chủ kho 21/10: «Đưa mốc về trong hôm nay hoặc mai phải hoàn thành»).

Nhân viên quan hệ đối tác xem và sửa một trường tự tạo trên phiếu và trong bảng y như trường có sẵn: số viết kiểu Việt, ô tích có nhãn, liên kết bấm được, lỗi nói tiếng Việt

Vì sao: Soát 20/10: trường tự tạo đi đường riêng (record-fields.tsx, field-columns.tsx) nên lệch trường chuẩn — ô Số không nhận «1.234,5» và báo lỗi tiếng Anh (packages/db/src/fields.ts), ô tích không có nhãn, ba tên gọi khác nhau. Luật đích ở docs/design.md mục «Trường».

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: người dùng thật có phân biệt được trường chuẩn với trường tự tạo trên phiếu và bảng không, và có còn gặp câu lỗi tiếng Anh khi lưu trường không.
- Kết quả nào là SỐNG: ở phiên nghiệm thu, che chữ «tự tạo» ở Cài đặt › Trường rồi cho người dùng xem một phiếu và một bảng: không quá một trên năm người chỉ đúng trường nào là tự tạo; gõ «1.234,5» vào ô Số lưu được ngay lần đầu.
- Kết quả nào là CHẾT: đa số người chỉ ra được trường tự tạo nhờ cách hiện khác, hoặc còn một đường lưu trường in câu tiếng Anh của máy chủ.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
