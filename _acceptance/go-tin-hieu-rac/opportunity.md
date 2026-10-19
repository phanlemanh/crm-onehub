---
schema_version: 1
slug: go-tin-hieu-rac
feature: Quản trị lưu trữ một tín hiệu rác trước khi đội sản phẩm lấy về, và hoàn tác được nếu lỡ tay
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-19T13:18:56Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: TH5
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng TH5 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Tín hiệu và trang Lộ trình theo kit 2.33 — 29/10/2026.

Quản trị lưu trữ một tín hiệu rác trước khi đội sản phẩm lấy về, và hoàn tác được nếu lỡ tay

Vì sao: Tín hiệu rác (thử, trùng, nhầm) vào thẳng lượt gom và làm nhiễu con số ngưỡng sống; hợp đồng LT2 đã để phần này ngoài phạm vi.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Lượt kéo về đầu tiên sau khi giao không mang tín hiệu nào đã lưu trữ; mỗi lần gỡ có vết người gỡ (ngưỡng đề xuất — chốt ở Cổng Đáng)» chưa?
- Kết quả nào là SỐNG: [đề xuất] Lượt kéo về đầu tiên sau khi giao không mang tín hiệu nào đã lưu trữ; mỗi lần gỡ có vết người gỡ (ngưỡng đề xuất — chốt ở Cổng Đáng)
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Lượt kéo về đầu tiên sau khi giao không mang tín hiệu nào đã lưu trữ; mỗi lần gỡ có vết người gỡ (ngưỡng đề xuất — chốt ở Cổng Đáng)» khi hết timebox
- Timebox: [đề xuất] 2026-10-29 (mốc Tín hiệu và trang Lộ trình theo kit 2.33)
