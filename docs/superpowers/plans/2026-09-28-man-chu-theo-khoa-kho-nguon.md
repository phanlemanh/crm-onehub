# Kế hoạch: man-chu-theo-khoa-kho-nguon

Thiết kế: `docs/superpowers/specs/2026-09-28-man-chu-theo-khoa-kho-nguon-design.md` ·
Hợp đồng: `_acceptance/man-chu-theo-khoa-kho-nguon/contract.md`

| # | Việc | Tệp | Kiểm từng việc | Phục vụ | independent |
| --- | --- | --- | --- | --- | --- |
| 1 | Đổi lệnh `bclkt_man_chu` sang `KHO_TAI_LIEU_BLOB_TOKEN=<giả>`; thêm bốn khoá `mctkkn_*` | `_acceptance/config.yaml` | `grep` hai dòng | E1–E4 | false |
| 2 | Hai thông điệp của thước gọi tên mới | `_acceptance/bo-chu-lap-keo-tha/rang/man-chu.mjs` | `grep -c BLOB_READ_WRITE_TOKEN` = 0 | E1, E2, E4 | false |
| 3 | Lời mô tả E6u theo tên mới + dòng sổ quyết định của hồ sơ đó | `_acceptance/bo-chu-lap-keo-tha/evals.yaml`, `decisions.jsonl` | `grep` khối E6u | E4 | false |
| 4 | `rang/khoa-nguon.mjs` + `rang/ten-khoa.mjs` (hai chiều mỗi lượt) | `_acceptance/man-chu-theo-khoa-kho-nguon/rang/` | lệnh E4 thoát 0 với `do dung 3/3` và `4/4 o dat`; trên cây cũ (trước việc 1–3) thoát 1 | E4 | false |
| 5 | `rang/khoa-rong.mjs` + `--chieu-do` | như trên | lệnh E2 thoát 0; `--chieu-do` in `DO DUNG GHIM` | E2 | false |
| 6 | `rang/chieu-do-can-khoa.mjs` | như trên | lệnh E3 thoát 0 `2/2` (cần commit trước — chiều đỏ dựng bản sao từ HEAD) | E3 | false |
| 7 | Chạy thước thật (E1) | — | `buoc 1: dat`, `buoc 2: dat` | E1 | false |
| 8 | Ghi nhớ `hop-tai-nguon-can-khoa-blob-gia.md` theo tên mới | memory ngoài kho | đọc lại | — | true |

Thứ tự: 1→2→3→4 (phá-thử E4 trên cây trước khi sửa bằng `git stash`-không-dùng: chạy ten-khoa với `--goc` trỏ bản sao HEAD cũ) →5→ commit →6→7→8.
Lệnh kiểm chung sau cùng: `bun run lint`, `bun run lint:slop` (tệp `.mjs` mới trong `_acceptance/`).
