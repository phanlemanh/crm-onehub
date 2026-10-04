---
schema_version: 1
slug: chat-an-toan-truoc-r1
feature: «Thành viên thường không nhờ chat sửa trường của cả đội; model bị gỡ thì chat lùi về mặc định và báo quản trị»
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-04T21:31:19Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: R1e
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng R1e của «OKR» (`docs/plan/lo-trinh-okr.json`); khảo sát lộ trình 04/10 mục A6, phát hiện số 2 (`.acceptance-runs/dieu-phoi-1410/nguon/khao-sat-lo-trinh/de-xuat-lo-trinh.md`).

«Thành viên thường không nhờ chat sửa trường của cả đội; model bị gỡ thì chat lùi về mặc định và báo quản trị»

- **#35 — thành viên thường sửa được trường của cả đội qua chat.** Màn Cài đặt chỉ cho owner/admin đổi trường (`FieldsService.requireManager`), nhưng công cụ chat `manage_fields` (tạo trường, đổi trường thành nhập tay cho cả đội) ghi thẳng cơ sở dữ liệu, không kiểm vai; `archive_field` chỉ hỏi duyệt và chính người thường bấm duyệt được. Người gặp: mọi thành viên thường từ 26/10 (tuần nhập người 19–26/10). Hậu quả: một người sửa lệch cột dữ liệu của cả công ty mà không ai biết.
- **#36 — model bị Gateway gỡ thì chat hỏng hẳn.** Model chỉ được kiểm khi lưu ở Cài đặt; Gateway gỡ model sau đó thì mọi lượt chat hỏng (`GatewayModelNotFoundError` → `turn.failed`) và màn chỉ báo lỗi chung. Đã xảy ra một lần 23/09 (bộ nhớ «Chat hỏng do model bị gỡ»). Người gặp: mọi người dùng chat; quản trị không biết phải đổi model.
- **Kiểm kèm (chỉ đọc):** việc Trợ lý OKR trên production có bị đóng `khong-chay:chua-co-khoa-mo-hinh` không — dự án `crm-onehub-agent` không có khoá Gateway, dựa vào vé OIDC; việc chạy nền có thể không lấy được vé.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: sau khi giao, thành viên thường còn sửa được trường của cả đội qua chat không; và khi model đã chọn biến mất khỏi Gateway, chat có tiếp tục trả lời không.
- Kết quả nào là SỐNG: 0 lần thành viên không phải owner/admin đổi định nghĩa trường qua chat trong hai tuần đầu R1 (26/10–09/11); 0 phiên chat hỏng vì model bị gỡ (phiên lùi về model mặc định) và Cài đặt hiện cảnh báo cho quản trị khi model đã chọn không còn.
- Kết quả nào là CHẾT: có dù một lần thành viên thường đổi được trường của cả đội qua chat; hoặc có phiên chat hỏng `turn.failed` vì model bị gỡ.
- Timebox: làm xong trước 10/10 (hạn hàng R1e); đọc số 10/11 sau hai tuần R1.
