---
schema_version: 1
slug: chu-may-sinh-ten-moi
feature: "Câu báo lỗi của máy chủ, tin nhắc buổi sáng và lời Kara về OKR dùng đúng tên mới: Góp vào, Lấy ý kiến, OneHub"
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-19T11:09:20Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: VK5
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng VK5 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR — 26/10/2026.

Câu báo lỗi của máy chủ, tin nhắc buổi sáng và lời Kara về OKR dùng đúng tên mới: Góp vào, Lấy ý kiến, OneHub

Vì sao: Khoảng 25 câu báo lỗi trong apps/api/src/okr/okr-config.ts, tin nhắc trong apps/agent/agent/lib/tin-nhac.ts và lời dặn soạn của Kara vẫn nói «căn chỉnh», «hỏi ý»: màn đổi tên mà máy nói tên cũ.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Không còn tên cũ trong câu báo lỗi và tin nhắc người dùng thấy; bộ chấm soạn của Kara (eval okr-soan) không tụt so với đường nền trước khi đổi lời dặn» chưa?
- Kết quả nào là SỐNG: Không còn tên cũ trong câu báo lỗi và tin nhắc người dùng thấy; bộ chấm soạn của Kara (eval okr-soan) không tụt so với đường nền trước khi đổi lời dặn
- Kết quả nào là CHẾT: chưa đạt «Không còn tên cũ trong câu báo lỗi và tin nhắc người dùng thấy; bộ chấm soạn của Kara (eval okr-soan) không tụt so với đường nền trước khi đổi lời dặn» khi hết timebox
- Timebox: 2026-10-26 (mốc Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR)
