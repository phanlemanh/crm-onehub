---
slug: loc-don-vi-khong-tu-dong
at: 2026-10-21T09:16:00Z
verdict: findings
p0: 2
p1: 1
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Dòng bỏ đường-đo ghi nguồn mot-loi nhưng lối điền ngưỡng chưa chết [kara-khong-ghi-de-truong#F1] | Người ký tưởng không đo được; Cổng Giá trị đọc ô CHƯA ĐO mà quyết định không đo chưa có căn cứ đúng | Dòng sổ mới supersedes, nguồn đúng | fixed: d-20261021T091517Z-7 thay d-…-5, nguồn muc-tieu trỏ CLAUDE.md (đo giá trị là việc sau khi gộp, không phải cổng của việc dựng); mục Đường đo trỏ entry mới |
| P0 | design | Dòng bỏ design-pass ghi lối chết sai — bàn đo giữ được truy vấn trên bản đang chạy | Cổng 1 duyệt hình chờ bằng chữ; tới Cổng 2 chủ kho muốn tín hiệu khác thì AC-3, AC-7, E3, E7, E8 viết lại | Dòng sổ supersedes | fixed: d-20261021T091517Z-8 thay d-…-4, nguồn muc-tieu trỏ hình chờ VungDangTai đã ký ở tai-lieu-loc-giu-lich-su AC-2; menu và khung Lọc giữ hình hôm nay |
| P1 | evals | Đổi chu kỳ của AC-6 không có eval nào trên màn; E6 chỉ kiểm hàm thuần, không kiểm việc gắn vào placeholderData | Gắn keepPreviousData mà vẫn viết hàm riêng: E6 xanh, đổi chu kỳ treo dòng cũ, không eval đỏ | Ca đổi chu kỳ trong man-loc.mjs, phá thử giu-moi-khoa | fixed: thêm E6s (AC-6 chu ky, k ≥ 3, LDV_PHA=giu-moi-khoa → SAI AC-6) |
| P2 | contract | Bỏ chọn và bỏ lọc trong mặt ở 1440 không AC, không descope | Người ký tưởng trục A đã phủ ở 1440 | AC riêng hoặc descope | fixed: Coverage ghi Later ở cả hai khổ + d-20261021T091517Z-9 (cùng hàm onChange và cùng lời chặn onSelect với «chọn», đã đọc FacetSubmenu) |
| P2 | evals | E4, E5 không đếm mẫu, không giữ truy vấn, không có nhánh KHONG DO DUOC | Máy nhanh: c = 0, b = 0 ghi khi không mẫu nào rơi vào cửa sổ — xanh rỗng | Giữ okr.danhSach, in k, k < 3 mã 2 | fixed: E4 giữ khi bỏ lọc, E5 giữ rồi trả 500; cả hai in k, k < 3 là KHONG DO DUOC mã 2 |
