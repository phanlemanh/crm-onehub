---
schema_version: 1
slug: hex-trang-gioi-thieu
feature: Khách xem trang giới thiệu thấy đúng màu của bộ giao diện ở cả nền sáng và tối, vì trang không còn mã màu hex nào ngoài tệp token
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-31T11:42:10Z        # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: SN2
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng SN2 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Nguồn: `crm-onehub-nguon:wiki/dot/don-dep-3110.md#fc6df9ace5753f6430fb7a75143137c82f826a08` — chưa có trang: trang nền, mã SN2
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Khách xem trang giới thiệu thấy đúng màu của bộ giao diện ở cả nền sáng và tối, vì trang không còn mã màu hex nào ngoài tệp token

Vì sao: 11 mã hex ở 6 tệp apps/app/components/landing/* là nợ hex thật duy nhất của app (đếm của nghiên cứu sàn thiết kế); làm trước thì bật M1 sau này không chặn oan vòng chạm trang giới thiệu.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «git grep mã hex trong apps/app/components/landing ra 0 chỗ; ảnh trang giới thiệu hai khổ (1280, 375) ở hai nền không đổi màu ngoài chỗ đã khai» chưa?
- Kết quả nào là SỐNG: [đề xuất] git grep mã hex trong apps/app/components/landing ra 0 chỗ; ảnh trang giới thiệu hai khổ (1280, 375) ở hai nền không đổi màu ngoài chỗ đã khai
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «git grep mã hex trong apps/app/components/landing ra 0 chỗ; ảnh trang giới thiệu hai khổ (1280, 375) ở hai nền không đổi màu ngoài chỗ đã khai» khi hết timebox
- Timebox: …
