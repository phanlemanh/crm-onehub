---
slug: okr-soat-anh-luot-3
at: 2026-09-25T15:24:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | AC-3/AC-4 chỉ đo lần vẽ đầu; E3 mở mỗi trang bằng goto mới, E4 không có ca đổi sang thẻ ngoài khung | NavStrip chỉ canh lúc dựng; khung Cài đặt giữ nguyên khi chuyển trang phía trình duyệt nên bấm thẻ «Chươ…» vẫn bị cắt mà cổng vẫn xanh | E4 thêm ca (4) thẻ ngoài khung; E3 thêm mã caidat-390-bam-the bấm thẻ trên hàng, không goto | fixed: AC-3, AC-4, E3, E4 |
| P1 | evals | E1 không đo cắt chữ ở ô email, lô không có tên dài để thử cột xuống dòng | ô email truncate vẫn qua textContent; ô nowrap với tên dài đẩy cột Kết quả ra ngoài [noi-zalo-cho-nguoi-moi#F1] | email scrollWidth và text-overflow; dòng 1 tên ≥ 120 ký tự; mã nhap-1440-cot-dai-xuong-dong | fixed: AC-1, E1, bối cảnh lô thử |
| P1 | evals | AC-8 hứa mọi tệp vòng này sửa nhưng E12 bỏ glob, E13 chỉ soi năm tên trong ba tệp | className màu theo token trên TableCell hay SelectItem lọt; tệp dưới settings/okr không được quét [mot-duong-ghi-phong-ban#F1] | tập tệp rút từ diff; ma trận mỗi phần tử JSX nhập từ @crm/ui một dòng; đối chứng text-destructive | fixed: AC-8, E12 (san-thiet-ke.mjs), E13 |
| P2 | evals | AC-10 chỉ phá bằng lỗi ném trong tiến trình | Bash giết lượt đo sau khi gieo, finally không chạy, chu kỳ thử nằm lại, mọi lượt sau mã 2 | bắt SIGTERM/SIGINT; sổ gieo để lượt kế dọn tàn dư của chính bàn đo; phá-thử kill -9 và kill -TERM | fixed: AC-10, E15 |
| P2 | evals | cỡ hộp table không có phép đo ở 390 | bề rộng cố định 1120px làm hộp tràn màn điện thoại, nút Ghi khuất | nhap-390-hop-trong-man, nhap-390-vo-cuon; câu kỳ vọng cho sau/nhap-390 | fixed: AC-1, E1, E14 |
