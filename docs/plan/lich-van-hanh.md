# Lịch vận hành

Mốc do người và tổ chức quyết: gửi dữ liệu, công bố OKR, chạy thật, nghiệm thu, đo giá trị. Đây không phải lộ
trình tính năng. Chủ kho chốt ngày 11/10/2026: lộ trình (`docs/plan/lo-trinh-*.json`) chỉ chứa việc dựng, và
không hàng nào được chờ các mốc dưới đây. Thiếu dữ liệu thì dựng trên dữ liệu mẫu (xem `CLAUDE.md`, mục «Lộ trình
là việc dựng»).

Các mốc này chuyển ra từ `lo-trinh-okr.json` và `lo-trinh-kho-tai-lieu.json` ngày 11/10. Mốc vẫn gắn việc (phiên
nghiệm thu R1, đọc số lượt 6, ban lãnh đạo đặt OKR năm 2027) ở lại trong lộ trình, vì chúng là hạn của tính năng.

## OKR

| Ngày | Việc | Trạng thái |
|---|---|---|
| 07/10 | Nhân sự gửi danh sách người, phòng ban, bộ phận, trưởng | Xong 04/10, đã nạp trên production |
| 09/10 | Ban lãnh đạo gửi OKR quý 4 cấp OneHub | Đã gửi (chủ kho báo 11/10) |
| 09/10 | Dựng cây tổ chức, nhập người, đào tạo theo bộ phận, nối kênh nhắc | Xong 04/10 trên production |
| 21/10 | Phòng ban công bố OKR quý 4 | Chưa tới |
| 21/12 | Phòng ban đặt và công bố OKR quý 1 | Chưa tới |
| 28/12 | Chấm và nhìn lại quý 4 trong công cụ | Chưa tới |
| 06/02/2027 | Tết Đinh Mùi | — |
| 09/02/2027 | Đo bốn tuần đầu quý 1: Cổng Giá trị R1–R3 | Chưa tới |

## Kho tài liệu

| Ngày | Việc | Trạng thái |
|---|---|---|
| 14/10–28/10 | Chạy thật: mọi phòng ban tự nạp 10–20 tệp, dùng hai tuần, góp ý gom một chỗ (hàng `ct` cũ, chủ kho chốt 04/10) | Chưa tới |

Góp ý của đợt chạy thật đi vào lượt 5 (`l5`) khi có, nhưng `l5` không chờ đợt này xong.

## Quy trình phát triển

Theo lộ trình của kit (`phanlemanh/acceptance-gate-kit`, `docs/plans/lo-trinh-kit.json`), dự kiến, sai số vài ngày:

| Ngày | Việc |
|---|---|
| 18/10 | Kit phát hành mốc kế: gói `dieu-phoi` (DP1), tác tử chấm chỉ chấm (A1) |
| 25/10 | Kit đóng gói Điều phối – Thợ: mở đợt, nối lại đợt, đổi tài khoản bằng một lệnh |
| 26/10 | crm chạy đợt thử thứ nhất trên gói `dieu-phoi`: gỡ `scripts/dieu-phoi/` và bốn khối hook, ở quãng lặng |
