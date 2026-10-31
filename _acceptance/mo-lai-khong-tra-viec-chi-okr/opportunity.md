---
schema_version: 1
slug: mo-lai-khong-tra-viec-chi-okr
feature: Mở lại một kế hoạch đã đóng hay bỏ «xong» một bước không trả việc về người đã sang vai «chỉ OKR»
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DA0b
lo_trinh_tep: docs/plan/lo-trinh-viec-du-an.json
---

## Vấn đề & ai gặp

Mở từ hàng DA0b của «Việc và Dự án» (`docs/plan/lo-trinh-viec-du-an.json`).

Mở lại một kế hoạch đã đóng hay bỏ «xong» một bước không trả việc về người đã sang vai «chỉ OKR»

Vì sao: Ngoài-4 của DA0a, chủ kho tách thành việc riêng ở Cổng Bằng chứng 12/10: hai đường mở lại đi vòng qua chặn vai DA0a vừa thêm — cùng lớp lỗi, nhỏ hơn.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Trên bộ dữ liệu mẫu: mở lại kế hoạch hay bỏ «xong» một bước của người vai «chỉ OKR» không tạo việc đang mở nào cho họ» chưa?
- Kết quả nào là SỐNG: [đề xuất] Trên bộ dữ liệu mẫu: mở lại kế hoạch hay bỏ «xong» một bước của người vai «chỉ OKR» không tạo việc đang mở nào cho họ
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Trên bộ dữ liệu mẫu: mở lại kế hoạch hay bỏ «xong» một bước của người vai «chỉ OKR» không tạo việc đang mở nào cho họ» khi hết timebox
- Timebox: …
