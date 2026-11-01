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

- Câu hỏi phép đo trả lời: Sau khi quản trị lưu trữ được tín hiệu rác, đội sản phẩm có còn nhận tín hiệu thử, trùng hay gửi nhầm trong lượt kéo về không?
- Kết quả nào là SỐNG: Trong 2 tuần sau khi bật, có ít nhất một tín hiệu được lưu trữ trước khi bị kéo về, và bản gom kế tiếp của đội sản phẩm không xếp tín hiệu nào vào lẻ với lý do thử, trùng hay gửi nhầm.
- Kết quả nào là CHẾT: Trong 2 tuần sau khi bật, bản gom vẫn có tín hiệu lẻ vì thử, trùng hay gửi nhầm mà quản trị đã thấy ở thẻ «Tất cả», hoặc phần lớn lần lưu trữ bị khôi phục lại vì lỡ tay.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
