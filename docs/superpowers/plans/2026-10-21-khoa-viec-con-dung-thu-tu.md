# Khoá việc con đúng thứ tự — kế hoạch

Hồ sơ `_acceptance/khoa-viec-con-dung-thu-tu`, thiết kế `docs/superpowers/specs/2026-10-21-khoa-viec-con-dung-thu-tu-design.md`.
Hạng T2, làn V (cửa veto mở). Các task chạy tuần tự: bài đo viết trước mã sửa, nên task 1 phải đỏ đúng lời ghim trên mã
cũ trước khi task 2 bắt đầu.

## Task 1 — Bài đo xen kẽ (đỏ trên mã cũ)

- Files: `apps/api/test/viec-con-khoa.spec.ts` (mới).
- Ba khối `describe`: `vck-doi-thu` (ma trận tám thao tác + đối chứng dương), `vck-dong`, `vck-chuyen-cha` (ba dòng × hai
  tầng: `viec.taoCon` và `taoViecCon` gọi thẳng).
- Khung chung: B mở `db.$transaction(…, { timeout: 30_000, maxWait: 10_000 })`, lấy `pg_backend_pid()`, khoá; hàm `choBiChan`
  đọc `pg_stat_activity` với `datname = current_database()` và `pidB = ANY(pg_blocking_pids(pid))`, 100 ms một lần, trần 10
  giây; B làm thao tác rồi commit.
- Hằng số thời gian gom vào một đối tượng ở đầu tệp theo nếp `MA_TEST_MS` của bài cùng khu.
- Verify: chạy `vck_doi_thu`, `vck_dong` trên mã cũ → đỏ với «vck doi thu» / «vck dong»; `vck_chuyen_cha` → đỏ với
  «vck chuyen cha: mot luot» (mã cũ không có lỗi riêng) — đây là lượt phá-thử của MEASURE-BIRTH.
- Phục vụ E1, E2, E3, E3b. `independent: false`.

## Task 2 — Sửa thứ tự khoá và lỗi riêng

- Files: `packages/db/src/viec-ghi.ts`, `packages/db/src/du-an.ts`.
- `DU_AN.thongDiep.chaDoiDuAn`, `DU_AN.thuLaiViecCon = 3`.
- `export class LoiChaDoiDuAn extends LoiViec` (mã `khong-hop-le`, lời trên).
- `taoViecCon`: đọc `duAnId` không khoá → khoá hàng `duAn` → khoá việc cha → đọc → lệch thì ném `LoiChaDoiDuAn`.
- Verify: `bun run check-types`; ba lệnh `vck_*` — `vck_doi_thu`, `vck_dong` xanh; tầng một lượt của `vck_chuyen_cha` xanh.
- Phục vụ E1, E2, E3b, E4a–c. `independent: false`.

## Task 3 — Tự làm lại ở API

- Files: `apps/api/src/viec/viec-bang.service.ts`.
- `taoCon` chạy `taoViecCon` trong giao dịch mới tối đa `DU_AN.thuLaiViecCon` lượt khi gặp `LoiChaDoiDuAn`; lỗi khác và lượt
  cuối đi qua `dichLoi` như cũ.
- Verify: `vck_chuyen_cha` xanh trọn; `kv_con`, `kv_con_quyen`, `vg_tran_viec` xanh.
- Phục vụ E3, E4a–c. `independent: false`.

## Task 4 — Tài liệu

- Files: `docs/api.md` mục «Dự án».
- Một gạch «Thứ tự khoá» ba vế theo AC-5.
- Phục vụ E5. `independent: true`.

## Task 5 — Răng đột biến

- Files: `_acceptance/khoa-viec-con-dung-thu-tu/rang/dot-bien.mjs` (khuôn của DA12, dùng `ca-chap-chon-cach-ly/rang/ban-sao.mjs`).
- Cặp (a) đưa khoá việc cha lên trước khoá dự án → `vck_doi_thu` và `vck_dong` đỏ; cặp (b) bỏ lời so `duAnId` →
  `vck_chuyen_cha` đỏ với «vck chuyen cha: mot luot».
- Verify: chạy dưới khoá `s4` ở S4 (răng chạy bộ kiểm trên bản sao); ở S3 chỉ `node --check`.
- Phục vụ E6, E6b. `independent: false` (cần task 1–3).

## Cuối S3

`bun run check-types`, `bun run lint`, `bun run lint:slop` trên cây; rồi contract `status: implemented` và xin lượt `s4`.
