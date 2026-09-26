---
slug: no-sau-luot-5-okr
at: 2026-09-26T12:33:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract, evals | Không AC nào gọi tên Tổng quan vai «chỉ OKR»; E1/E8 chỉ dựng một Tổng quan | `tong-quan-chi-okr.tsx` tự ẩn khối khi chu kỳ lỗi, người vai «chỉ OKR» thấy Tổng quan trống mà mọi eval xanh | AC-1 gọi tên cả hai vai; E8 chạy thêm một lượt với người vai «chỉ OKR» | fixed: AC-1 gọi tên hai vai; E8 thêm bước vai «chỉ OKR» và ảnh E8-chiokr-loi; E3 ghi rõ hai giá trị props thật của ba chỗ gọi |
| P1 | evals | E10 chỉ khẳng định âm «0 lượt okr.danhSach», không có đối chứng dương cùng lượt | Bộ đếm bắt trượt (tên trong lô, mã hoá URL, POST) nên luôn ra 0 và E10 xanh rỗng | Trong cùng lượt đổi một mặt lọc → ≥ 1 lượt và danh sách đổi; chưa ghi nhận lần nào thì đỏ ghim | fixed: E10 thêm bước đối chứng dương và thông điệp ghim «E10: bo dem khong thay okr.danhSach»; bộ đếm giải mã và tách lô, đếm GET lẫn POST |
| P2 | evals | AC-9 hứa dùng LoiXem nhưng E1/E3 chỉ đo data-trang-thai và chữ | Khối tự ráp div + Button cùng chữ vẫn qua E1, E3, E12 | E1/E3 khẳng định [data-slot='empty'] chứa [data-slot='button'] | fixed: E1, E3 khẳng định slot empty và button |
| P2 | evals | Fixture viết tay theo khuôn bên đọc, E2 thiếu `cycles` [tra-loi-tin-nhac#F1] | Khối suy kỳ từ `cycles`, fixture thiếu trường làm bài đỏ vì fixture hoặc xanh trên dữ liệu không thể có | Fixture `satisfies RouterOutputs[...]`, tệp test trong phạm vi check-types | fixed: E1, E3, E5 khai satisfies; E2 fixture đủ {cycles, currentId} |
| P2 | evals | E11 chỉ đọc menu con, không đo nhãn ngoài menu | Nút hay thẻ đã chọn rơi về mã mà E11 vẫn xanh | innerText của body khi menu đóng và mở không chứa id | fixed: E11 đo body ở cả hai lúc |
