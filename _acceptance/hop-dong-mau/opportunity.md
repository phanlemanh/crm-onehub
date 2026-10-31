---
schema_version: 1
slug: hop-dong-mau
feature: Lệnh nạp mẫu tạo bộ hợp đồng mẫu PDF và DOCX có nhãn và gắn vào ô Tệp của bản ghi mẫu qua đường ghi thật
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: manh
decided_at: 2026-10-21T23:04:34Z # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DA22
lo_trinh_tep: docs/plan/lo-trinh-viec-du-an.json
---

## Vấn đề & ai gặp

Mở từ hàng DA22 của «Việc và Dự án» (`docs/plan/lo-trinh-viec-du-an.json`).
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Lệnh nạp mẫu tạo bộ hợp đồng mẫu PDF và DOCX có nhãn và gắn vào ô Tệp của bản ghi mẫu qua đường ghi thật

Vì sao: DA23 đo Kara đọc hợp đồng — dữ liệu chỉ có khi phòng ban tải hợp đồng thật lên. Máy sinh bộ mẫu từ khuôn hợp đồng hợp tác (các điều khoản bên, ngày ký, hiệu lực, giá trị), có cả bản scan để thử nhánh «cần nhập tay».

## Ngưỡng chết / ngưỡng UAT

- Không đo được — lệnh nạp dữ liệu mẫu cho môi trường dựng, từ chối chạy trên production; không có người dùng cuối, phép thử đã là tiêu chí của hồ sơ (chạy lại không nhân đôi, có nhãn mẫu).
