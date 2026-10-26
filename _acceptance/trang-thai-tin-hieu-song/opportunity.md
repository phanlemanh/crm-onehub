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

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Một tháng sau khi giao, người gửi nhận thông báo cho mọi lần tín hiệu đổi chỗ trong vòng một ngày (ngưỡng đề xuất — chốt ở Cổng Đáng)» chưa?
- Kết quả nào là SỐNG: [đề xuất] Một tháng sau khi giao, người gửi nhận thông báo cho mọi lần tín hiệu đổi chỗ trong vòng một ngày (ngưỡng đề xuất — chốt ở Cổng Đáng)
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Một tháng sau khi giao, người gửi nhận thông báo cho mọi lần tín hiệu đổi chỗ trong vòng một ngày (ngưỡng đề xuất — chốt ở Cổng Đáng)» khi hết timebox
- Timebox: [đề xuất] 2026-10-29 (mốc Tín hiệu và trang Lộ trình theo kit 2.33)
