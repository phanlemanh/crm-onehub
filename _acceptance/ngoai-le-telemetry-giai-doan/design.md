# Thiết kế — ngoai-le-telemetry-giai-doan (E1b)

Ngoài-7 của `deal-va` (Cổng Bằng chứng 08/10, «mở hợp đồng mới»). `permittedDealStage` và
`DEAL_STAGE_KEYS` (`packages/telemetry/src/allowlist.ts`) dùng `GIAI_DOAN_GOC` để giữ bảy khoá gốc
của `deals_by_stage`. `docs/api.md` mục «Deal stages are rows» ghi hằng đó chỉ cho seed và kiểm thử,
và thước `_acceptance/giai-doan-thoa-thuan/rang/khong-re-theo-ten.mjs` (eval E17 của hồ sơ đã ký
`giai-doan-thoa-thuan`) không quét `packages/telemetry`.

## Quyết định

1. **Thước quét thêm `packages/telemetry/src`**, và có một danh sách cho phép theo TỆP và theo TỪ:
   `packages/telemetry/src/allowlist.ts` được dùng đúng tên `GIAI_DOAN_GOC` — không được viết mã gốc
   nào bằng chữ (`"CLOSED_WON"`…). Mọi tệp khác của gói, kể cả `index.ts`, vẫn bị cấm cả tên lẫn mã.
   Thước in ra mỗi dòng được cho phép (`CHO PHEP <tệp>:<dòng>: GIAI_DOAN_GOC`) để ngoại lệ không im.
   - Loại: bỏ cả tệp `allowlist.ts` khỏi quét như `packages/db/src/giai-doan.ts` — rộng hơn cần: một
     `id === "CLOSED_WON"` chèn vào `allowlist.ts` sẽ lọt.
2. **`docs/api.md`** sửa đúng gạch đầu dòng đó: hằng dành cho seed, kiểm thử, và một ngoại lệ sản phẩm có
   tên — số liệu ẩn danh `deals_by_stage` giữ bảy mã gốc làm khoá để so được giữa các bản cài; thước cho
   phép đúng tệp đó và đúng tên hằng.
3. **Ghim lại `giai-doan-thoa-thuan`** trong cùng vòng: E17 của hồ sơ đó chạy chính thước vừa sửa.

## Mặt phẳng chạm

- `_acceptance/giai-doan-thoa-thuan/rang/khong-re-theo-ten.mjs`
- `docs/api.md`
- `_acceptance/ngoai-le-telemetry-giai-doan/**` (hồ sơ + `rang/thu-thuoc.mjs`)

Không mã sản phẩm, không giao diện, không migration.
