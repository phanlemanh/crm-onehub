# Thiết kế — giai-doan-mac-dinh (E4, T3)

Ngoài-6 của `giai-doan-thoa-thuan` (Cổng Bằng chứng 29/09, «mở hợp đồng mới»): cột `deal.stage` có mặc định
`"DEMO_BOOKED"` trong `packages/db/prisma/schema.prisma`. Giai đoạn Demo lưu trữ được, nên một đường tạo nào quên
truyền giai đoạn sẽ đặt thoả thuận vào giai đoạn đã cất — thoả thuận biến khỏi Kanban, không ai báo.

Hiện trạng đo được (08/10):
- `DealsService.create` không nhận giai đoạn thì gọi `giaiDoanMoDau` (giai đoạn `OPEN` sống có `position` nhỏ nhất,
  `FOR SHARE`) — đúng; ca `tao moi khong chon giai doan vao OPEN dau tien` trong `giai-doan.spec.ts` chỉ thử sắp lại,
  chưa thử lưu trữ.
- `packages/db/prisma/seed.ts` chọn thẳng bảy mã của `GIAI_DOAN_GOC` (`OPEN_STAGES`, `CLOSED_STAGES`).
- 9 lời gọi `deal.create`/`createMany`/`upsert` trong 5 tệp kiểm thử và eval không truyền giai đoạn, dựa vào mặc
  định: `apps/agent/evals/okr/cach-ly.eval.ts`, `apps/api/test/currency-totals.integration.spec.ts` (3),
  `apps/api/test/fields.spec.ts`, `apps/api/test/okr-mau.spec.ts`, `apps/api/test/record-delete.spec.ts` (3).
- `seed.ts` không tạo hàng `OkrAlignment` nào: migration L1 (`20261010184651`, P5) không làm seed lệch.

## Quyết định (chờ anh chốt ở Cổng 1 — giám sát đổi khuyến nghị sang B, 08/10)

Hợp đồng soạn theo **B**; A là lối thay, tách hàng sau khi `tro-ly-okr-nen` và `bo-okr-mau` gỡ kẹt (tra-loi/P3-51).
Với B, phép quét «không đường tạo nào trong mã sản phẩm dựa vào mặc định» (`rang/duong-tao.mjs`) thay cho việc bỏ mặc
định ở cơ sở dữ liệu.

1. **A — bỏ mặc định của `deal.stage`.** `schema.prisma` xoá `@default("DEMO_BOOKED")`; một migration
   `<mốc>_giai_doan_mac_dinh` (mốc lớn hơn `20261010184651`) chỉ chứa
   `ALTER TABLE "deal" ALTER COLUMN "stage" DROP DEFAULT;`. Đường tạo nào quên giai đoạn hỏng ngay lúc ghi (Prisma
   báo thiếu trường lúc kiểm kiểu, Postgres báo `NOT NULL` lúc chạy) thay vì lặng lẽ rơi vào giai đoạn đã cất.
   Giá: 9 lời gọi trong 5 tệp kiểm thử/eval phải truyền giai đoạn tường minh; các tệp đó nằm trong `paths` của 8 hồ
   sơ đã ký → ghim lại 8 hồ sơ đó trong cùng vòng (một lượt làn).
   - **B (lối thay):** giữ mặc định; chỉ sửa seed và thêm ca kiểm. Đường tạo hôm nay vẫn đúng, nhưng lỗ của Ngoài-6
     còn nguyên cho đường tạo sau này; không chạm hồ sơ đã ký nào.
2. **Seed chọn giai đoạn sống theo loại.** `seedDeals` đọc `dealStage` còn sống (`archivedAt: null`) theo `kind`
   (`OPEN` → thoả thuận mở, `WON`/`LOST` → đã đóng) thay cho bảy mã viết cứng; dòng `STAGE_CHANGE` của seed lấy
   `from`/`to` từ cùng tập đó.
3. **Ca kiểm lưu trữ.** `giai-doan.spec.ts` thêm ca: lưu trữ giai đoạn `OPEN` đầu (Demo) rồi tạo không chọn giai
   đoạn → vào `OPEN` sống kế tiếp, không vào Demo.
4. **Seed đo trên kho dùng-một-lần của chính ca.** Tệp kiểm mới `apps/api/test/giai-doan-seed.spec.ts` tạo một cơ sở
   dữ liệu riêng (`<tên kho của lượt>_seed`), chạy `prisma migrate deploy` lên đó, lưu trữ Demo, chạy `seed.ts` thật bằng
   tiến trình con, khẳng định, rồi drop — không ghi gì vào cơ sở dữ liệu dùng chung của lượt `bun run test`.
5. **Đường lùi.** Revert PR; nếu một đường ghi trên production hỏng vì thiếu `stage`, một migration tạm đặt lại
   mặc định là lối khẩn cấp có thời hạn, không phải trạng thái lâu dài.

## Mặt phẳng chạm

- Trong ranh giới: `packages/db/prisma/schema.prisma`, `packages/db/prisma/migrations/<mốc>_giai_doan_mac_dinh/`,
  `packages/db/prisma/seed.ts`, `apps/api/test/giai-doan.spec.ts`, `apps/api/src/deals/deals.service.ts` (không cần
  đổi nếu ca kiểm xanh), `_acceptance/giai-doan-mac-dinh/**`.
- Ngoài ranh giới (xin chạm ở P3-50, chỉ khi anh chọn A): 5 tệp kiểm thử/eval ở trên (chỉ thêm `stage`),
  `apps/api/test/giai-doan-seed.spec.ts` (mới), `_acceptance/config.yaml` (khoá `gmd_`).

Không giao diện, không API mới.
