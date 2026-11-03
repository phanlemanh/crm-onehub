---
schema_version: 1
slug: tieu-diem-sau-hop-xoa-tin-hieu
feature: Người dùng bàn phím hay trình đọc màn bấm «Giữ lại» hoặc gặp lỗi khi xoá tín hiệu vẫn đứng đúng dòng mình vừa thao tác, không phải dò lại từ đầu trang
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-19T13:18:56Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: TH6b
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng TH6b của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Tín hiệu và trang Lộ trình theo kit 2.33 — 29/10/2026.

Người dùng bàn phím hay trình đọc màn bấm «Giữ lại» hoặc gặp lỗi khi xoá tín hiệu vẫn đứng đúng dòng mình vừa thao tác, không phải dò lại từ đầu trang

Vì sao: Gốc: _acceptance/sua-giao-dien-tin-hieu/ — Ngoài-6 ở Cổng Bằng chứng TH6 15/10, chủ kho chọn «mở hợp đồng mới».

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Người dùng chỉ bằng bàn phím có huỷ hay gặp lỗi khi xoá tín hiệu rồi làm tiếp ngay ở đúng dòng mà không phải dò lại từ đầu trang không?
- Kết quả nào là SỐNG: Trong một phiên nghiệm thu với ít nhất 2 người dùng thật chỉ dùng bàn phím trên production ở 375 và 1280px, mọi lần bấm «Giữ lại», Esc hay xoá hỏng đều để tiêu điểm ở nút ⋮ của đúng dòng và không ai phải bấm Tab từ đầu trang để quay lại.
- Kết quả nào là CHẾT: Trong phiên nghiệm thu có ít nhất một lần tiêu điểm rơi về đầu trang hay sang dòng khác sau «Giữ lại», Esc hay xoá hỏng, hoặc người thử phải dò lại để tìm dòng vừa thao tác.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
