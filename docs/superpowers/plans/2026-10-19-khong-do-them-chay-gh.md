# Kế hoạch: khong-do-them-chay-gh (F26)

Hợp đồng: `_acceptance/khong-do-them-chay-gh/contract.md` · design: `_acceptance/khong-do-them-chay-gh/design.md`.
Mọi task chạy tuần tự trong vòng chính (`independent: false` — cùng xoay quanh `chung.mjs` của bàn đo).

| Task | Files | Verify | Phục vụ |
| --- | --- | --- | --- |
| T1 Hàm đặt nền và cờ `--chi` | `_acceptance/chuyen-goi-dieu-phoi/rang/chung.mjs`, `_acceptance/chuyen-goi-dieu-phoi/rang/khong-do-them.mjs` | `bun …/khong-do-them.mjs --chi-rut` xanh, in `chay:`; `--chi khong_co` mã 2 | E1–E5 |
| T2 Thước bản clone | `_acceptance/khong-do-them-chay-gh/rang/nen.mjs`, `rang/ban-gh.mjs` | `bun run`-free: `bun rang/ban-gh.mjs` và `--nguon` mã 0, mọi ca phá BAT | E1, E2 |
| T3 Thước hai lệnh gh | `rang/lenh-gh.mjs` | mã 0 sau khi PR nháp mở; trước đó mã 2 «tien de» | E3 |
| T4 Thước cờ `--chi` | `rang/chi.mjs` | mã 0, năm ô dat | E5 |
| T5 Thước dựng lại cây | `rang/dung-lai-cay.mjs` | mã 0, B1–B4 BAT | E6 |
| T6 Thước bàn đo thật | `rang/ban-do-that.mjs` | mã 0 khi PR nháp có lượt xong; BAT ban-do-thieu-gh | E4 |
| T7 PR nháp | — | `gh pr create --draft`; lượt CI nháp xong trước S4 | E3, E4 |

Mỗi thước có cặp hai chiều trên cùng fixture (MEASURE-BIRTH): bản lành xanh, bản phá đỏ với thông điệp ghim. E7 dùng
khoá có sẵn `kcs_don_vi`.
