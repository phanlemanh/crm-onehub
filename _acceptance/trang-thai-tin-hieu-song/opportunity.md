---
schema_version: 1
slug: trang-thai-tin-hieu-song
feature: Người gửi tín hiệu được báo trong ngày khi tín hiệu của mình đổi chỗ, và mở ra thấy câu dễ hiểu
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-19T13:18:56Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: TH3
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng TH3 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Tín hiệu và trang Lộ trình theo kit 2.33 — 29/10/2026.

Người gửi tín hiệu được báo trong ngày khi tín hiệu của mình đổi chỗ, và mở ra thấy câu dễ hiểu

Vì sao: Người gửi không được báo khi tín hiệu đổi chỗ, phải tự mở trang; trạng thái lại đi theo bản dựng production nên thêm độ trễ dựng và cửa sổ gộp.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Người gửi tín hiệu có biết trong ngày khi tín hiệu của mình đổi chỗ và mở thông báo ra xem không?
- Kết quả nào là SỐNG: Trong 2 tuần sau khi bật, mọi lần tín hiệu có người nhận hợp lệ đổi chỗ trên nhánh chính đều có thông báo trong vòng một ngày tính từ giờ commit, và ít nhất một nửa số thông báo đổi chỗ được người nhận mở.
- Kết quả nào là CHẾT: Trong 2 tuần sau khi bật, có lần đổi chỗ thiếu thông báo hay trễ quá một ngày, hoặc dưới một phần tư số thông báo đổi chỗ được mở.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
