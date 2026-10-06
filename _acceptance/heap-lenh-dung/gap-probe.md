---
slug: heap-lenh-dung
at: 2026-10-05T05:20:00Z
verdict: findings
p0: 0
p1: 1
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P1 | evals | Chiều đỏ 1024 chạy trên cache Next còn ấm: `--force` chỉ bỏ cache turbo, không xoá `apps/app/.next` hay `tsbuildinfo` | S4 dựng 6144 trước, cache đầy; 1024 dựng lại tăng dần dưới trần và thoát 0 — chiều đỏ không đỏ, kết luận nhầm «turbo lọc biến»; lắc theo trạng thái cache | Xoá `.next` và `*.tsbuildinfo` của `apps/app` trước mỗi lượt dựng, in dòng chứng; dòng hết heap phải mang tiền tố `app:build`, gói khác thì mã 2 | fixed: E1 expected thêm bước xoá cache có dòng chứng và tiền tố `app:build`; AC-1 thêm «trên cây không có cache `.next`» |
| P2 | contract | Ngưỡng `> 2048` lỏng hơn ý định «một con số với ci.yml» | Khai 2560 vẫn xanh nhưng nhu cầu thật vượt 2048 một khoảng chưa biết — job vẫn lắc trên runner | AC-1 hứa giá trị bằng `check-types` của `ci.yml`; E1 đọc cả hai tệp; chiều đỏ khai 3072 | fixed: AC-1 và E1 so bằng giá trị ci.yml, thêm chiều đỏ (c) 3072 |
| P2 | evals | Thước gõ `bunx turbo` trực tiếp, CI chạy `bun run build` | Script `build` gốc có lớp bọc lọc biến: thước xanh, CI vẫn đổ | Chạy chính trường `run:` của bước kèm `-- --filter=app --force` | fixed: E1 dựng bằng chính lệnh đọc từ bước |
| P2 | evals | `paths` thiếu tệp quyết định việc biến đi qua | Sửa `turbo.json` làm lọc NODE_OPTIONS mà E1 không hoá cũ | Thêm `turbo.json`, `package.json`, `bun.lock` (và `ci.yml` vì nay E1 đọc nó) | fixed: bốn tệp vào `paths` của E1 |
