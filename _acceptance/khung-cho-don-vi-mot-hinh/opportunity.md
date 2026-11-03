---
schema_version: 1
slug: khung-cho-don-vi-mot-hinh
feature: Mở trang Theo đơn vị lúc đang tải chỉ thấy một khung chờ đúng hình bảng, không hai khung khác hình nối nhau
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-19T11:09:20Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DH12
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng DH12 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR — 26/10/2026.

Mở trang Theo đơn vị lúc đang tải chỉ thấy một khung chờ đúng hình bảng, không hai khung khác hình nối nhau

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Sau khi bật, người mở trang Theo đơn vị có còn thấy màn chờ đổi hình giữa chừng hay bấm trượt ô chọn đơn vị lúc trang đang tải không?
- Kết quả nào là SỐNG: Trong phiên nghiệm thu với ít nhất 3 người mở trang Theo đơn vị bằng tải cứng và đổi đơn vị, trên máy tính và điện thoại, 0 người chỉ ra màn chờ nhảy hình hay hỏi «đang tải hay hỏng», và 0 người bấm trượt ô chọn đơn vị vì nó dịch chỗ.
- Kết quả nào là CHẾT: Từ 2 người trở lên trong phiên nói màn chờ đổi hình hay giật, hoặc có người bấm trượt ô chọn đơn vị lúc đang tải, hoặc có một góp ý cùng nội dung gửi về trong timebox.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
