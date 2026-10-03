---
slug: muc-tieu-va-kr
at: 2026-10-01T23:40:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---
# gap-probe — muc-tieu-va-kr

Phản biện context sạch: một agent tươi chỉ đọc design doc, contract, evals, sổ quyết định và
tệp bài học (claim-scan, 10 dòng). Một lượt, không probe lại sau khi sửa.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract, evals | `data-muc-tieu` đặt ở hai chỗ: design, E1, E3 đặt trên khối bao bảng; AC-9, E7, E12, chiều đỏ E14 đặt trên hàng mục tiêu | Cài theo design thì E7 đỏ và AC-9 không đạt nguyên văn; cài theo AC-9 thì `[data-muc-tieu] [data-kr-hang]` và `thead th = 4` của sáu hồ sơ đã ký về 0; gắn cả hai thì số `[data-muc-tieu]` gấp đôi | AC-9, E7, E12 dùng `[data-hang-muc-tieu]` cho hàng; E12 thêm số `[data-muc-tieu]` = số mục tiêu và `closest('[data-muc-tieu]')` của mỗi KR đúng khối | fixed: AC-9 viết lại (khối mang `data-muc-tieu`, hàng mang `data-hang-muc-tieu`); E7, E12 đổi bộ chọn, E12 thêm ma trận closest toàn phần; chiều đỏ E14 xoá thuộc tính khỏi khối trong `khoi-muc-tieu.tsx` |
| P1 | evals | Chiều đỏ E14 có lối thoát «khong eval da ky nao bam data-muc-tieu»; không khai eval ui-check của hồ sơ đã ký có chạy lại không | `repin-lane` chỉ chạy test/script, tập bám móc bằng 0, bản sao xoá thuộc tính vẫn thoát 0; hồi quy chỉ màn thật thấy lọt AC-11 | Danh sách (hồ sơ, eval) viết trước từ «Móc DOM phải giữ» gồm cả ui-check; chạy đúng số đó; bỏ lối thoát | fixed: E14 mang danh sách viết trước 40+ eval gồm ui-check qua phiên đo, chạy cmd của từng eval ở HEAD và ở merge-base, in số đã chạy; chiều đỏ bắt buộc 'hoi quy' mã 1 |
| P1 | evals | E16 một tên tệp mỗi màn dù chụp hai theme; `inputs` E15 thiếu ảnh tối của Theo đơn vị và sheet | Ảnh tối ghi đè ảnh sáng, E16 vẫn xanh vì chỉ kiểm tồn tại; hội đồng không thấy theme kia, lỗi viền chìm ở nền tối lọt | E16 bốn tệp theo theme + băm khác nhau; E15 inputs đủ bảy ảnh, thiếu thì UNCERTAIN | fixed: E16 đặt tên `-sang`/`-toi`, khẳng định sha256 sáng ≠ tối; E15 inputs bảy ảnh, UNCERTAIN khi thiếu ảnh nào |
| P1 | evals | E13 không đòi số hàng > 0; bàn đo không gieo chu kỳ đang chấm; hàng chấm không có `[data-o-tien-do]` | Không chu kỳ đang chấm → màn chấm rỗng, vòng «mỗi hàng» chạy trên 0 hàng, E13 xanh; AC-10 cho Chấm điểm không được đo | Gieo chu kỳ pha chấm ≥ 2 mục tiêu × ≥ 2 KR; ma trận bốn màn có số hàng tối thiểu, đỏ 'man rong'; chấm đo ô điểm | fixed: AC-10 thêm Given dữ liệu; E13 gieo chu kỳ chấm, ma trận số hàng tối thiểu, 'man rong: <man>' mã 1, chấm đo ô điểm/«Đã chấm k/n», chiều đỏ thứ hai --kiem-do-do-rong |
| P2 | design, evals | Bảng trạng thái không có lỗi, rỗng, đang tải của Theo đơn vị; E17 không ghim giá trị `data-trang-thai` | Theo đơn vị đổi mã trạng thái lỗi hoặc mất Thử lại, E17 vẫn xanh; thêm ca lỗi không id thì E17 tự đỏ 'ca la' | Thêm dòng bảng với mã thật từ onehub; E17 khẳng định từng mã và đếm đúng 1 lần gọi lại | fixed: bảng thêm ST-cuatoi-codulieu, ST-donvi-danhsach, ST-donvi-rong, ST-donvi-dangtai, ST-donvi-loi, ST-donvi-chuakychay (mã đọc từ `trang-thai-okr.tsx` trên onehub); AC-13 ghim các mã; E17 rút cả ST-donvi-*, khẳng định chuỗi và đếm Thử lại |
