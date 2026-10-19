---
schema_version: 1
slug: doi-nhan-khu-muc-tieu
feature: "Thành viên đọc khu Mục tiêu thấy một tên cho một khái niệm: Góp vào cho căn chỉnh, OneHub cho đơn vị gốc, Lấy ý kiến thay Hỏi ý — ở cả bản tiếng Việt và tiếng Anh"
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-19T11:09:20Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: VK4
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng VK4 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR — 26/10/2026.

Thành viên đọc khu Mục tiêu thấy một tên cho một khái niệm: Góp vào cho căn chỉnh, OneHub cho đơn vị gốc, Lấy ý kiến thay Hỏi ý — ở cả bản tiếng Việt và tiếng Anh

Vì sao: Căn chỉnh mang chín tên trên màn, đơn vị gốc năm tên, «Hỏi ý» đứng cạnh «Hỏi Kara». Từ điển đã chốt 18/10 (PR #477).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Không còn chuỗi «căn chỉnh», «Đường lý do», «Gắn căn chỉnh», «Chưa nối lên», «Hỏi ý», «Toàn công ty», «Toàn OneHub» trong tệp chữ của khu ở hai thứ tiếng; bản mẫu /proto không đổi» chưa?
- Kết quả nào là SỐNG: Không còn chuỗi «căn chỉnh», «Đường lý do», «Gắn căn chỉnh», «Chưa nối lên», «Hỏi ý», «Toàn công ty», «Toàn OneHub» trong tệp chữ của khu ở hai thứ tiếng; bản mẫu /proto không đổi
- Kết quả nào là CHẾT: chưa đạt «Không còn chuỗi «căn chỉnh», «Đường lý do», «Gắn căn chỉnh», «Chưa nối lên», «Hỏi ý», «Toàn công ty», «Toàn OneHub» trong tệp chữ của khu ở hai thứ tiếng; bản mẫu /proto không đổi» khi hết timebox
- Timebox: 2026-10-26 (mốc Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR)
