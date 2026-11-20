# CI `test (api)` trên Linux — số đo các lượt (20/11/2026)

| Lượt | Đầu nhánh | Job | Thời lượng | Kết quả | Ca đỏ |
| --- | --- | --- | --- | --- | --- |
| 1 | `104b29c0b` | 136274000206 | ~10 phút | 2168 pass · 2 fail | `htmb-toan-canh`, `vai-chi-okr gan-vai` |
| 2 | `7ae40f624` | 136285442165 | 21 phút (12:23–12:44Z) | 2163 pass · 5 fail | `htmb-toan-canh`, `bkr-cay-api`, `l3-canh`, `quyen-ban-ghi` (5000 ms), `soan-okr-so-do` (beforeAll) |
| 3 | `d2ae25faa` (đã sửa lớp A–D) | 136367751295 | 9,5 phút (15:03:34–15:13:02Z) | 2149 pass · 29 fail | cụm `viec-*` (`donViec` vi phạm `viec_chaId_fkey`), `enrichment-queue` (3 → 2), `vai-chi-okr` (20 ca) |
| 3 · chạy lại | `d2ae25faa` | 136377861389 | 10,5 phút (15:20:54–15:31:29Z) | 2149 pass · 29 fail | cùng bộ ca với lượt 3 — ổn định, không chập chờn |
| 4 | `cbc978a60` (dọn người thử sót ở `khoa-api-ghi-thua`, `go-thanh-vien`) | 136420649613 | 11,3 phút (16:33:15–16:44:34Z) | 2171 pass · 18 skip · 0 fail | — |

Thứ tự tệp trên máy chạy Linux đổi theo từng lượt (`gop-y-dung-cho` thứ 151 ở lượt 1, 220 ở lượt 2). Năm ca đỏ của lượt 1–2 thuộc bốn lớp
đã tái hiện và sửa trên máy (A tên không gian làm việc, B thế giới mẫu, C dữ liệu rò cua-vao-va, D thứ tự hoà khoá). Lượt 3, chạy
bản đã sửa, đỏ ở một bộ tệp khác hẳn. Lần chạy lại một lần cho cùng 29 ca, và thứ tự 279 tệp của lượt 3 trùng khít lượt 1, nên
đây là hồi quy của chính bản sửa chứ không phải chập chờn: AC-8 dọn `cvv-doc-phien` làm lộ hai người thử sót từ trước
(`kagt-…@thu.test` của `khoa-api-ghi-thua`, `…-mt-chu@onemount.com` của `go-thanh-vien`), cùng `createdAt` sau lần kết nạp lại của
`ensureWorkspaceMembership`; `gieoBangMau` cho một người giao việc cha, người kia tạo việc con, `donViec` vỡ `viec_chaId_fkey`.
Tái hiện trên máy bằng đúng thứ tự tệp của CI (2149 · 29), sửa, rồi đúng thứ tự ấy ra 2171 · 0. Lượt 4 trên CI xanh.

Đo bằng `rang/ci-api.mjs`: gọi check-runs với `filter=all` (mặc định GitHub chỉ trả lần chạy mới nhất của mỗi job, nên trước
bản này chốt «chạy lại» không bao giờ thấy lần thứ hai).
