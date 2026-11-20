# CI `test (api)` trên Linux — số đo các lượt (20/11/2026)

| Lượt | Đầu nhánh | Job | Thời lượng | Kết quả | Ca đỏ |
| --- | --- | --- | --- | --- | --- |
| 1 | `104b29c0b` | 136274000206 | ~10 phút | 2168 pass · 2 fail | `htmb-toan-canh`, `vai-chi-okr gan-vai` |
| 2 | `7ae40f624` | 136285442165 | 21 phút (12:23–12:44Z) | 2163 pass · 5 fail | `htmb-toan-canh`, `bkr-cay-api`, `l3-canh`, `quyen-ban-ghi` (5000 ms), `soan-okr-so-do` (beforeAll) |
| 3 | `d2ae25faa` (đã sửa lớp A–D) | 136367751295 | 9,5 phút (15:03:34–15:13:02Z) | 2149 pass · 29 fail | cụm `viec-*` (`donViec` vi phạm `viec_chaId_fkey`), `enrichment-queue` (3 → 2), `vai-chi-okr` (20 ca) |
| 3 · chạy lại | `d2ae25faa` | 136367751295 (lần 2) | — | chờ | — |

Thứ tự tệp trên máy chạy Linux đổi theo từng lượt (`gop-y-dung-cho` thứ 151 ở lượt 1, 220 ở lượt 2). Năm ca đỏ của lượt 1–2 thuộc bốn lớp
đã tái hiện và sửa trên máy (A tên không gian làm việc, B thế giới mẫu, C dữ liệu rò cua-vao-va, D thứ tự hoà khoá). Lượt 3, chạy
bản đã sửa, đỏ ở một bộ tệp khác hẳn: suite còn những chỗ rò trạng thái phụ thuộc thứ tự tệp chưa chẩn.
