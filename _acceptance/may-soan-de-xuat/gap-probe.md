---
slug: may-soan-de-xuat
at: 2026-09-28T06:45:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---
# gap-probe — may-soan-de-xuat

Phản biện context sạch, một tác tử tươi, sáu đầu vào (thiết kế, hợp đồng, evals, sổ quyết
định, bài học từ feature trước, `opportunity.md`). Sửa một lượt, không probe lại.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals, design | Kiểm «mỗi số mới nằm trong một trích» không ghim biên con số — đo chuỗi-có-mặt thay quan hệ | Máy bịa «20%», trích «01/10/2026»; bản cài bằng includes vẫn qua 9 ca vì «20» nằm trong «2026» | Thêm ca bác «20%», «2%» (trích «12%»), «1,5» (trích «11,5»), chiều đỏ bản includes thô | fixed: AC-9 thêm vế so khớp trọn vẹn có biên; E9 lên 12 ca với nhóm biên và chiều đỏ thứ hai «so khop mot phan: 20%»; thiết kế 3.3 bước 3 |
| P1 | evals | Cả chuỗi tải lên và tải về chạy trên Blob giả; chưa đo PUT thật vào URL ký của Blob private (cùng lớp [bo-dung-khong-ket#F1]) | URL ký không nhận PUT từ trình duyệt hoặc blob private không get được; mọi eval vẫn xanh, production hỏng bước đầu | Eval script chạy phiên đo với token thật: xinCho, PUT, nhan, taiVe, GET, GET không ký bị từ chối | fixed: AC-12 thêm vế Blob thật; eval E2t mới (script, `msd_blob_that`), thiếu token thoát 2 có tên |
| P1 | contract, evals | Không ghim `nguonId` khi chủ trang «Sửa bản này»; E12 không nói N2 dựng ra sao | Sửa một lỗi chính tả làm mất `nguonId`, thành viên mất quyền tải về, thước «trang đi từ nguồn» đếm sai | Ca sửa qua thủ tục lượt 1 rồi duyệt; N2 dựng bằng approve thật; viết trước ô proposal × N2 | fixed: AC-11 thêm vế giữ `nguonId` và `trichDoan`; E8b thêm ca sửa và chiều đỏ «ban sua mat nguon»; E12 dựng N2 bằng `taiLieu.approve` thật và viết trước sáu ô proposal; thiết kế 3.5 |
| P1 | evals | Ba trạng thái người nhìn (nguồn đã có, chưa soạn được + Soạn lại, cần gõ tay) không eval DOM nào render | Nút Soạn lại không dựng hay lộ cho mọi người, tab in mã thô; E4, E10, E10b vẫn xanh | Eval DOM bốn hàng giả + hộp tải trùng, chiều đỏ nút lộ | fixed: eval E10d mới (`msd_man_hang_nguon`), ma trận 6 khẳng định có đối chứng dương DA_SOAN |
| P2 | contract | Ngưỡng chi phí USD và «số sai được báo lại» không có đường ra số | Ngày đọc số không quy đổi được token ra USD; số sai báo qua Zalo không đếm được | Trường chi phí USD trong MAY_SOAN; khai kênh đếm số sai | fixed: AC-13 và E13 thêm `chiPhiUsd` từ bảng giá ghim theo mã model; Đường đo khai số sai đếm tay từ nhóm góp ý chạy thật, người đếm chủ kho |

## Điểm máy không tự quyết — đưa lên Cổng Phạm vi

| Điểm | Xử lý |
|---|---|
| Từ điển `CONTEXT.md` mục **Nguồn** ghi «mỗi nguồn mang một lớp dữ liệu», còn lượt này để phân lớp ra ngoài | human-gate1: máy khuyên sửa câu từ điển thành «sẽ mang một lớp dữ liệu (để sau)» trong S3; lớp dữ liệu không vào lược đồ lượt này |
| Bản mẫu có ô tick bắt buộc từng khẳng định trước khi Duyệt (nghiên cứu 8.4, design-pass F9); hợp đồng chưa hứa | human-gate1: máy khuyên THÊM vào AC-11 — «Duyệt» khoá tới khi tick hết các dòng trong bảng «Con số và ngày» |
