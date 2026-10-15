# ghim-thuoc-soi-xem-okr — kế hoạch thi công

Hợp đồng: `_acceptance/ghim-thuoc-soi-xem-okr/contract.md` (duyệt 2026-10-15T22:22:57Z, Hỏi-1: mọi PR).

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Phép kiểm đọc OKR xanh lại | `_acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs` | AC-1 (thước xanh), AC-3 (lý do đúng) |
| Mỗi dòng miễn được chứng hai chiều | `_acceptance/ghim-thuoc-soi-xem-okr/rang/guong.mjs`, `mien-hai-chieu.mjs` | AC-2 (dòng miễn hẹp) |
| CI chạy phép kiểm trên mọi PR | `.github/workflows/acceptance.yml` | AC-4 (hình bước CI) |
| Dòng lệnh CI đỏ khi thước đỏ | `rang/buoc-ci.mjs --chay` | AC-5 (hành vi lệnh) |
| Thước cũ của tệp CI không đỏ thêm | `rang/khong-do-them.mjs` | AC-6 (không làm hỏng thước khác) |
| Tài liệu API nói CI chạy phép kiểm | `docs/api.md` | AC-7 (tài liệu) |

## Task 1 — bảy dòng miễn (independent: false)
Files: `_acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs`.
Thay dòng `removeAlignment#okrAlignment` bằng `congSuaCanChinh#okrAlignment`, thêm sáu dòng còn lại theo bảng `nguon/phan-loai-soi-xem.md`.
Verify: `bun _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca xem` → XANH, «MIEN_XEM 114 dong». Phục vụ E1, E3.

## Task 2 — gương và hai chiều của dòng miễn (independent: false, sau Task 1)
Files: `_acceptance/ghim-thuoc-soi-xem-okr/rang/guong.mjs`, `rang/mien-hai-chieu.mjs`, khoá config `gtsx_mien_hai_chieu`.
Verify: lệnh thoát 0, mười ca «bat», cộng `--chieu-do` 3/3; phá-thử: làm hỏng một khớp chuỗi → «SAI khong sua duoc», làm gương trỏ sai gốc → ca gương nguyên LOT. Phục vụ E2.

## Task 3 — bước CI (independent: false)
Files: `.github/workflows/acceptance.yml` (bước «OKR read rule» sau bước luật kho, `if: ${{ !cancelled() }}`).
Verify: `bun -e` đọc YAML; `lkv_ci`, `cgdp_cong`, `kcb_khong_noi_tran` vẫn thoát 0. Phục vụ E4, E5, E6a–c.

## Task 4 — thước bước CI và tài liệu (independent: false, sau Task 3)
Files: `rang/buoc-ci.mjs` (mặc định, `--chay`, `--tai-lieu`), `docs/api.md`, khoá config `gtsx_buoc_ci`, `gtsx_buoc_ci_chay`, `gtsx_tai_lieu`.
Verify: ba lệnh thoát 0; phá-thử từng chiều (sáu đột biến, gương bỏ miễn, tài liệu thiếu câu). Phục vụ E4, E5, E7.

## Task 5 — không đỏ thêm (independent: false)
Files: `rang/khong-do-them.mjs`, khoá config `gtsx_khong_do_them`.
Verify: thoát 0, «bat doi-chung». Phục vụ E6d.

Cuối: `bun run check-types`, `bun run lint`, `bun run lint:slop` cho các tệp mới; commit; S4.
