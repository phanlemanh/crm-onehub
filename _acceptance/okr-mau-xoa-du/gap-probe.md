---
slug: okr-mau-xoa-du
at: 2026-10-20T13:46:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-2 ghi «một lối» cho lưới chống ruỗng, trong khi lối «chỉ thêm viec + thông điệp gọi tên» không chết; lưới đặt luật CI lên PR lược đồ của mọi dãy — đó là đánh đổi của người | Người duyệt ký vì tưởng chỉ có một lối; PR thêm bảng ở dãy khác đỏ ở okx-luoi và chủ kho thấy giá lần đầu ở đó | Dòng sổ mới nguồn chi-nguoi thay d-2; sửa mục «Lối khác đã loại» của design | fixed: dòng d-20261020T134628Z-7 (supersedes d-2) thành câu hỏi cho người; design sửa mục lối khác |
| P1 | evals | Nhãn don không gắn với bước xoá; thông điệp lọc nhóm don nên một khoá don thiếu bước xoá lại in «(User)» trần | Bảng mới dán don cho lưới xanh nhưng quên bước xoá → mã 5 không tên | Ca đỏ: nhãn don mà bỏ bước xoá vẫn hiện tên; demThamChieu đọc catalog | fixed: design mục 4 đổi sang đọc catalog trong giao dịch, không lọc theo sổ; AC-4 và E4 thêm ca nhãn dán sai; E1 khai demThamChieu đọc pg_constraint |
| P1 | contract | AC-6/E6 chỉ đo E12 trong khi E15, E17 cùng đỏ; thiếu tag cross-layer; paths thiếu man-canh-kr.mjs và tien-de.mjs | E15/E17 để lại hàng ở bảng khác, việc phụ ký xanh mà VK7 vẫn kẹt khi ghim canh-kr-okr | EVAL=E12,E15,E17 · 0 hong | fixed: AC-6 (cross-layer), E6 chạy E12,E15,E17, thêm hai paths, config okx_man_canh_kr đổi theo |
| P1 | design | Xoá viec theo taoBoiId để Cascade kéo theo việc con và phụ thuộc do người ngoài tạo, trái mục 3 «không xoá dữ liệu ngoài» | Người ngoài thêm việc con dưới việc người mẫu, xoá thoát 0 và mất hàng của người ngoài | Ca E3b: việc con / phụ thuộc của người ngoài → mã 5, không đổi gì | fixed: design mục 4b chặn có tên; AC-3 thêm vế; E3 thêm hai ca; dòng d-20261020T134628Z-6 (supersedes d-1) nêu giá Cascade cho người quyết |
| P2 | evals | E4 chỉ kiểm chuỗi có mặt; khuôn tên sổ (Model.trường) và thông điệp (bảng.cột) không khai cách đối chiếu | Thông điệp in thừa hay thiếu khoá mà E4 vẫn xanh | E4 so toEqual tập dòng; bài phụ đối chiếu sổ với pg_constraint | fixed: E4 so toEqual; thông điệp đọc thẳng catalog nên không cần đổi khuôn; E5 thêm bài đối chiếu sổ ↔ pg_constraint |
