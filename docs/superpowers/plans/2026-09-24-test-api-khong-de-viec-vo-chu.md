# Kế hoạch — test-api-khong-de-viec-vo-chu

Hợp đồng: `_acceptance/test-api-khong-de-viec-vo-chu/contract.md` · Thiết kế:
`docs/superpowers/specs/2026-09-24-test-api-khong-de-viec-vo-chu-design.md`

Các task chạy tuần tự (cùng dựa vào thước `rang/dem-sot.ts` và cùng cơ sở dữ
liệu lượt test); không task nào `independent: true`.

## Task 1 — Thước đếm sót

- Files: `_acceptance/test-api-khong-de-viec-vo-chu/rang/dem-sot.ts`,
  `_acceptance/test-api-khong-de-viec-vo-chu/rang/chi-them-dong.mjs`
- Phục vụ: E1, E4, E5, E6
- Chế độ `dieu-phoi` · `gieo-le` · `sau-dang-nhap` · `ca-goi`; mọi chế độ tự
  kiểm `current_database()` trước (exit 2).
- Verify: chạy `ca-goi` trên mã hiện tại (trước vá) → exit 1 với
  «goi api de lai hang» và 11 liên hệ; chạy ngoài `NODE_ENV=test` → exit 2.
- `independent: false`

## Task 2 — Bộ gieo tự dọn

- Files: `apps/api/test/dieu-phoi-gieo.ts`, `apps/api/test/dieu-phoi.spec.ts`,
  `apps/api/test/dieu-phoi-diem-nhan.spec.ts`
- Phục vụ: E1, E5
- Bộ gieo ghi mã vào sổ cấp module; `donGieo()` xoá công ty (cascade kế
  hoạch/bước/ghi danh), liên hệ, người dùng, bộ phận rồi làm rỗng sổ.
- Verify: `config:executors.script.vvc_dieu_phoi_don_sach` exit 0; chiều đỏ
  = cùng lệnh trên cây tạm từ `onehub` exit 1.
- `independent: false`

## Task 3 — Ứng dụng đã đóng thôi quét

- Files: `apps/api/src/backfill/backfill.service.ts`,
  `apps/api/test/quet-khi-dang-nhap.spec.ts`
- Phục vụ: E2, E3
- `OnModuleDestroy` bật cờ; handler kiểm cờ. Bài mới: `ung-dung-da-dong` (hai
  ứng dụng, spy) và `van-quet-that` (quét thật, chờ yên, dọn rộng).
- Verify: hai lệnh `vvc_ung_dung_da_dong`, `vvc_van_quet_that` exit 0; chiều
  đỏ = gỡ cờ tạm thời → `ung-dung-da-dong` đỏ với thông điệp của ứng dụng A.
- `independent: false`

## Task 4 — go-la-cat-quyen không quét thật

- Files: `apps/api/test/go-la-cat-quyen.spec.ts`
- Phục vụ: E4, E6
- Sau `createApp()` trong `beforeAll`: `spyOn(app.get(BackfillService),
  "auto").mockResolvedValue({ started: false })`. Chỉ thêm dòng.
- Verify: `vvc_go_la_khong_quet` exit 0, `vvc_go_la_chi_them_dong` exit 0;
  chiều đỏ = `vvc_go_la_khong_quet` trên cây tạm từ `onehub` exit 1.
- `independent: false`

## Task 5 — Cả gói và bộ chứng

- Phục vụ: E5 + bộ lệnh suite
- Verify: `vvc_ca_goi_api` exit 0; `bun run check-types`, `bun run lint`,
  `bun run lint:slop` xanh.
