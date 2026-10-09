# Kế hoạch thi công — giai-doan-mac-dinh (E4, lối B)

Hợp đồng: `_acceptance/giai-doan-mac-dinh/contract.md` (Cổng 1 ký 2026-10-08T23:31:25Z, lối B). Thiết kế: `design.md`.

## Tóm tắt cho người duyệt (Cổng 1.5)

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Thoả thuận tạo mới vào cột Đang mở đầu tiên còn dùng, kể cả khi Demo đã lưu trữ (hôm nay đã đúng — vòng này ghim lại bằng ca kiểm) | `apps/api/test/giai-doan.spec.ts` | AC-1 (tạo khi Demo đã cất) |
| Dữ liệu mẫu chỉ dùng giai đoạn còn dùng, đúng loại | `packages/db/prisma/seed.ts`, `apps/api/test/giai-doan-seed.spec.ts` | AC-2 (seed theo giai đoạn sống) |
| Không chỗ nào trong mã sản phẩm tạo thoả thuận mà quên giai đoạn — bị bắt trước khi gộp | `_acceptance/giai-doan-mac-dinh/rang/duong-tao.mjs` | AC-3 (quét đường tạo theo kiểu) |
| Bài kiểm cũ không bị nới; mô hình dữ liệu không đổi | `rang/khong-xoa-expect.mjs`, `bun run check-types` | AC-4 (không hồi quy) |

Thứ tự: 1 → 2 → 3 → 4 → 5. Không migration, không đổi `schema.prisma`, không đổi mã sản phẩm ngoài `seed.ts`.

## Các bước

1. **Ca tạo khi Demo đã cất** — `giai-doan.spec.ts` describe `tao-khi-dau-da-cat`: chuyển hết thoả thuận khỏi giai
   đoạn `OPEN` đầu, lưu trữ qua `GiaiDoanService.archive`; kỳ vọng độc lập từ `db.dealStage`; ba dòng (stage, khác mã
   đã cất, cột `deals.board`); khôi phục (`restore` + `reorder`) trong `finally`. Phá-thử: bản sao `giaiDoanMoDau` bỏ
   `"archivedAt" IS NULL` → đỏ «tao moi vao giai doan da cat». Phục vụ E1. Kiểm: `gmd_tao_khi_cat`. independent: true.
2. **Seed theo giai đoạn sống** — `seed.ts`: một hàm đọc `db.dealStage.findMany({ where: { archivedAt: null } })` gom
   theo `kind`; `seedDeals` chọn `OPEN` cho thoả thuận mở, `WON`/`LOST` cho thoả thuận đóng; `closedReason` theo `kind
   LOST` thay cho so mã; `STAGE_CHANGE` của seed lấy `from` = `OPEN` sống đầu, `to` = giai đoạn thật của thoả thuận.
   Bỏ `OPEN_STAGES`/`CLOSED_STAGES` và mọi `GIAI_DOAN_GOC` trong đường chọn giai đoạn. Phục vụ E2. independent: false (cần 3).
3. **Ca seed trên kho dùng-một-lần** — `giai-doan-seed.spec.ts` (mới, P3-50): `runScopedUrl(TEST_DATABASE_URL gốc,
   <TEST_RUN_ID>seed)`, `bun run db:test` với URL đó (tạo + migrate), lưu trữ `DEMO_BOOKED`, chạy `bun prisma/seed.ts`
   bằng tiến trình con `DATABASE_URL=<kho seed>` (perl alarm 300), bảy dòng ma trận (E2), đếm `deal` của kho dùng chung
   trước/sau bằng nhau, `dropDatabase` trong `afterAll`. Phá-thử: bản sao seed giữ `OPEN_STAGES` viết cứng → đỏ dòng 5
   «seed vao giai doan da cat». Kiểm: `gmd_seed`. independent: false.
4. **Phép quét đường tạo** — `rang/duong-tao.mjs`: TypeScript compiler API (`typescript` 5.9 của kho) mở `Program` theo
   `tsconfig` của từng gói trong `apps/` và `packages/` sau `db:generate`; duyệt object literal ngoài tệp kiểm/eval/mã
   sinh, lấy `checker.getContextualType`, khớp tên `/^Deal(Unchecked)?Create(Many)?(Without\w+)?Input$/` (gồm nhánh
   `create` của `upsert`/`connectOrCreate`); đòi khoá `stage`/`giaiDoan` với kiểu không chứa `undefined`; SQL chèn vào
   `deal` khớp không phân biệt hoa thường. Kiểm kê: số object ≥ số lần khớp chuỗi `.deal.create(`/`.deal.upsert(`.
   `--tu-thu`: thư mục tạm có `tsconfig` + kiểu giả mang đúng tên Prisma, mỗi dạng một tệp thiếu `stage` → thoát 1 gọi
   đúng tệp:dòng; tệp đủ → 0. Phục vụ E3. Kiểm: `gmd_duong_tao`. independent: true.
5. **Chốt hồi quy** — `rang/khong-xoa-expect.mjs` chép khuôn `deal-va`, thêm `--moc` bắt buộc (ghim `c1067c163`), chuẩn
   hoá khoảng trắng CHỈ ngoài chuỗi; `--tu-thu` có ca sửa ký tự trong chuỗi. Lệnh `gmd_hoi_quy` thêm diff rỗng ở
   `schema.prisma` + `migrations/`. Phục vụ E4. Kiểm: `gmd_hoi_quy`. independent: true.

## Rủi ro đã biết

- Bước 4 là phần nặng nhất (dựng `Program` cho nhiều gói); nếu chậm quá 3 phút sẽ giới hạn vào các gói có import
  `@crm/db` hay `@prisma/client`, ghi vào sổ.
- `seed.ts` nằm dưới `packages/db/prisma` (đường T3) — chỉ đổi đường chọn giai đoạn, không đổi schema.
