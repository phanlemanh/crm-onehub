---
slug: do-man-tren-kho-rieng
at: 2026-09-25T20:58:50Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | Đối chứng «cây khác không chờ» của E8 chạy phiên C trong cùng checkout với A, nhưng design gắn tệp ghi `phien.json` và thư mục dựng theo gốc cây, còn biến đổi tên cây không có trong design hay contract. | C đọc `phien.json` của A, thấy đúng gốc này, giết máy chủ của A; hoặc `next dev` của C tranh khoá thư mục dựng với A. E8 đỏ mọi lượt, hoặc người làm tự lệch design để cho xanh. | Worktree thứ hai thật, hoặc design khai tệp ghi và thư mục dựng theo tên kho rồi E8 ghim điều đó; thêm khẳng định máy chủ của A còn sống suốt lúc C dựng và A thoát 0. | fixed: design khai `PHIEN_DO_TEN_CAY`; khoá, tệp ghi `.acceptance-runs/phien-do/<tên kho>/`, thư mục dựng `.next-phien-do-<tên cây>` và dấu tiến trình `PHIEN_DO=<tên kho>` đều theo tên kho; AC-8 và E8 thêm «không giết máy chủ của A, A thoát 0» và kiểm pid của A mỗi 500 ms. |
| P1 | evals | E6, E9 (a), E10 (ii) lấy dấu vân tay của kho `crm` thật, trong khi máy chủ dev của người và tác tử được phép ghi vào nó. | Người thao tác trên máy chủ dev lúc phiên đo chạy; dấu vân tay lệch, E6 đỏ dù phiên đo không ghi gì; người làm có động lực nới dấu vân tay. | E6 và E9 dùng kho chung giả do răng dựng và gieo; kho `crm` thật chỉ đo khi không có kết nối khác. | fixed: E6, E7, E8, E9 dùng kho chung giả `crm_chung_gia_<id>`; E10 (ii) soi `crm` thật chỉ đọc, chỉ khẳng định khi `pg_stat_activity` không có kết nối khác; contract thêm đoạn định nghĩa «kho chung» trong AC-6, AC-9, AC-10. |
| P1 | evals | Workflow S4 chạy E6–E10 song song; cả năm xin khoá của cùng một cây và chung `phien.json`; `cho.khoaMs` không có giá trị. | Phiên của E9 giành khoá sau SIGKILL của E7 và giết máy chủ mồ côi trước khi E7 kiểm «còn sống»; mười phiên nối tiếp vượt thời hạn khoá, S4 BLOCKED. | Mỗi răng một tên cây riêng; ghi giá trị `cho.khoaMs`. | fixed: mỗi răng đặt `PHIEN_DO_TEN_CAY` riêng (`dmk-dau-cuoi-<id>`, `dmk-don-<id>`, `dmk-hang-<id>`, `dmk-td-<id>`, `dmk-okr-<id>`); design ghi `cho.khoaMs` 60 phút, `apiMs` 2 phút, `appMs` 3 phút, `donMs` 10 giây. |
| P1 | contract | AC-11 chỉ canh tệp dưới hồ sơ khác, trong khi vòng đổi hành vi `tien-de.mjs` mà khoảng 60 lệnh eval đã ký đi qua; không AC nào đòi kiểm tra trước khi gộp toàn kho sạch. [mot-duong-ghi-phong-ban#F1] | Hồ sơ đã ký có `tien-de.mjs` trong `paths` bị coi là cũ; E11 xanh, Cổng Bằng chứng ký, CI toàn kho đỏ lúc gộp. | AC + eval chạy kiểm tra trước khi gộp toàn kho, không `--slug`, `--base origin/onehub`, đòi sạch. | fixed: thêm AC-13 và E13 (`rang/truoc-gop.mjs`), bỏ riêng dòng của chính hồ sơ này, đòi 0 dòng của hồ sơ khác. |
| P2 | design | Kho mẫu `crm_<cây>_mau_do` mang cùng dấu và cùng hậu tố `_do`, nên vừa bị quét theo tuổi vừa bị `tien-de` coi là kho dùng-một-lần. | Sau 12 giờ, quét xoá kho mẫu của cây còn dùng; hoặc `DATABASE_URL` trỏ kho mẫu thì `tien-de` ghi khoá giả vào mẫu và mọi kho đo sau thừa hưởng. | Chốt một luật cho kho mẫu; thêm ca kho mẫu vào E5 và E9. | fixed: kho mẫu mang giờ dùng gần nhất, tuổi tính từ mốc gần nhất (mẫu còn dùng không bị quét, mẫu bỏ thì bị); `_mau_do` không phải kho dùng-một-lần; AC-5/E5 thêm hai kho mẫu, AC-9/E9 thêm ca (c) kho mẫu. |
