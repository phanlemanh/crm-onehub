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

## Quyết định (anh chốt ở Cổng 1 — giám sát khuyên B, 08/10)

1. **B — giữ mặc định của cơ sở dữ liệu, chặn ở mã sản phẩm.** Không chạm `schema.prisma`, không migration. Ba việc:
   - **Ca kiểm lưu trữ.** `giai-doan.spec.ts` thêm ca: lưu trữ giai đoạn `OPEN` đầu (Demo) rồi tạo không chọn giai
     đoạn → vào `OPEN` sống kế tiếp, không vào Demo.
   - **Seed chọn giai đoạn sống theo loại.** `seedDeals` đọc `dealStage` còn sống (`archivedAt: null`) theo `kind`
     (`OPEN` → thoả thuận mở, `WON`/`LOST` → đã đóng) thay cho bảy mã viết cứng; dòng `STAGE_CHANGE` của seed lấy
     `from`/`to` từ cùng tập đó. Đo trên kho dùng-một-lần của chính ca (tệp kiểm mới `apps/api/test/giai-doan-seed.spec.ts`
     tạo `<tên kho của lượt>_seed`, `prisma migrate deploy`, lưu trữ Demo, chạy `seed.ts` thật bằng tiến trình con, drop).
   - **Phép quét đường tạo** (`rang/duong-tao.mjs`): bộ kiểm kiểu TypeScript tìm mọi object literal có kiểu ngữ cảnh
     là đầu vào tạo thoả thuận của Prisma — gọi thẳng, lồng qua quan hệ, `createMany`, nhánh `create` của
     `upsert`/`connectOrCreate`, qua bí danh — trong mã sản phẩm, và mọi lệnh SQL chèn vào `deal`; mỗi chỗ phải gán
     `stage` với kiểu không chứa `undefined`. Đây là chỗ dựa của vế ngưỡng «không đường tạo nào trong mã sản phẩm dựa
     vào mặc định».
   - Còn lại: mặc định `"DEMO_BOOKED"` vẫn trong cơ sở dữ liệu; 9 lời gọi trong tệp kiểm/eval vẫn dựa vào nó (dữ liệu
     kiểm thử, không phải đường tạo của sản phẩm).
2. **A — lối thay, tách hàng sau.** Bỏ mặc định bằng `schema.prisma` + migration `DROP DEFAULT` (mốc lớn hơn
   `20261010184651`). Giá: 9 lời gọi trong 5 tệp kiểm/eval thêm `stage`; 5 tệp đó nằm trong `paths` của 8 hồ sơ đã ký
   phải ghim lại, trong đó `tro-ly-okr-nen` và `bo-okr-mau` đã biết là kẹt (tra-loi/P3-51). Đường lùi: revert PR;
   migration tạm đặt lại mặc định là lối khẩn cấp có thời hạn.

## Mặt phẳng chạm (B)

- Trong ranh giới: `packages/db/prisma/seed.ts`, `apps/api/test/giai-doan.spec.ts`, `apps/api/src/deals/deals.service.ts`
  (không cần đổi nếu ca kiểm xanh), `_acceptance/giai-doan-mac-dinh/**`.
- Ngoài ranh giới, giám sát đã duyệt (P3-50): `apps/api/test/giai-doan-seed.spec.ts` (mới), `_acceptance/config.yaml`
  (khoá `gmd_`).
- Không chạm (E4 ghim): `packages/db/prisma/schema.prisma`, `packages/db/prisma/migrations/**`, 5 tệp kiểm/eval ở trên.

Không giao diện, không API mới.
