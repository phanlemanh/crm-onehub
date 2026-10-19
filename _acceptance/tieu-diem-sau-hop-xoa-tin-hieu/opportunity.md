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

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Trên production, bấm «Giữ lại» và ca xoá hỏng đều trả tiêu điểm về đúng nút ⋮ của dòng đó, đo bằng bàn phím ở 375 và 1280px (ngưỡng đề xuất — chốt ở Cổng Đáng)» chưa?
- Kết quả nào là SỐNG: [đề xuất] Trên production, bấm «Giữ lại» và ca xoá hỏng đều trả tiêu điểm về đúng nút ⋮ của dòng đó, đo bằng bàn phím ở 375 và 1280px (ngưỡng đề xuất — chốt ở Cổng Đáng)
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Trên production, bấm «Giữ lại» và ca xoá hỏng đều trả tiêu điểm về đúng nút ⋮ của dòng đó, đo bằng bàn phím ở 375 và 1280px (ngưỡng đề xuất — chốt ở Cổng Đáng)» khi hết timebox
- Timebox: [đề xuất] 2026-10-29 (mốc Tín hiệu và trang Lộ trình theo kit 2.33)
