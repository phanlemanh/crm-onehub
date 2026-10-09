---
schema_version: 1
feature: «Thoả thuận mới không rơi vào giai đoạn đã lưu trữ»
slug: giai-doan-mac-dinh
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-10-08T23:31:25Z
design_doc: _acceptance/giai-doan-mac-dinh/design.md
---

# Acceptance Contract: giai-doan-mac-dinh

## Context

Cột `deal.stage` có mặc định `"DEMO_BOOKED"` trong cơ sở dữ liệu, mà giai đoạn Demo thì quản trị viên lưu trữ được.
Đường tạo của API hôm nay chọn đúng giai đoạn Đang mở sống đầu tiên, nhưng dữ liệu mẫu chọn thẳng bảy mã gốc, và một
đường tạo mới trong mã quên truyền giai đoạn sẽ rơi vào mặc định — thoả thuận biến khỏi Kanban (Ngoài-6 của
`giai-doan-thoa-thuan`). Vòng này đi lối B (giám sát khuyên; lối A ở Notes, tách hàng sau): giữ mặc định của cơ sở dữ
liệu, nhưng ghim hành vi tạo-không-chọn-giai-đoạn khi Demo đã lưu trữ, cho dữ liệu mẫu chọn giai đoạn sống theo loại,
và thêm một phép quét bắt mọi đường tạo thoả thuận trong mã sản phẩm không gán giai đoạn tường minh.

Source input: hàng E4 của `docs/plan/lo-trinh-okr.json`; Ngoài-6 của `giai-doan-thoa-thuan`;
`_acceptance/giai-doan-mac-dinh/opportunity.md` (Cổng Đáng `build` 2026-10-07T13:13:50Z, luật 16);
`_acceptance/giai-doan-mac-dinh/design.md`; giám sát đổi khuyến nghị sang B (tra-loi/P3-51).

## Criteria

- AC-1: Given giai đoạn Đang mở đầu tiên (Demo) đã lưu trữ và không còn thoả thuận, When tạo thoả thuận qua `DealsService.create` không chọn giai đoạn, Then thoả thuận vào giai đoạn `OPEN` sống có `position` nhỏ nhất, không vào Demo, và hiện ở đúng cột đó của `deals.board`.
- AC-2: Given một cơ sở dữ liệu dùng-một-lần riêng của ca (tạo, chạy migration, drop sau ca), Demo đã lưu trữ, When chạy `packages/db/prisma/seed.ts` thật, Then Demo vẫn đã lưu trữ sau khi seed chạy; mọi thoả thuận seed nằm ở giai đoạn sống; có thoả thuận ở cả ba loại `OPEN`, `WON`, `LOST`; thoả thuận đóng (`closedAt` khác rỗng) chỉ ở `WON`/`LOST`, thoả thuận mở chỉ ở `OPEN`; mọi `from`/`to` của dòng `STAGE_CHANGE` seed trỏ tới một giai đoạn có thật; số hàng `deal` của cơ sở dữ liệu dùng chung của lượt không đổi.
- AC-3: Given mã sản phẩm (`apps/**`, `packages/**`, trừ thư mục `test/`, `evals/`, tệp `*.spec.*`, `*.dom.*`, `*.eval.*`, `*.test.*`, mã sinh), When bộ kiểm kiểu TypeScript tìm mọi object literal có kiểu ngữ cảnh là đầu vào tạo thoả thuận của Prisma (`DealCreateInput`, `DealUncheckedCreateInput`, `DealCreateWithout…Input`, `DealCreateManyInput` và các biến thể lồng qua quan hệ, nhánh `create` của `upsert`/`connectOrCreate`) và mọi lệnh SQL chèn vào bảng `deal` (mọi cách viết tên bảng), Then mỗi object có khoá `stage` hoặc `giaiDoan` với kiểu không chứa `undefined`, và mỗi lệnh SQL có cột `stage` — không đường tạo nào trong mã sản phẩm dựa vào mặc định; đối chứng: mỗi dạng tạo (gọi thẳng, lồng qua quan hệ, `createMany`, `connectOrCreate`, `upsert` chỉ có `stage` ở `update`, bí danh, `stage` tuỳ chọn, SQL chữ thường, `"public"."deal"`) đặt trong tệp giả thiếu `stage` làm phép quét đỏ gọi đúng tệp và dòng.
- AC-4: (kiểm không hồi quy) Given các bài kiểm sẵn có của giai đoạn (`giai-doan.spec.ts`), When chạy lại, Then thoát 0 không sửa khẳng định `expect(` nào (so với mốc `c1067c163` của nhánh); `bun run check-types` thoát 0; và vòng này không chạm `packages/db/prisma/schema.prisma` hay thư mục migration.

## Coverage

- Trục A — Đường tạo thoả thuận: API `DealsService.create` | seed | mã sản phẩm khác | SQL thô [thước CE: `git grep` lời gọi `deal.create`/`createMany`/`upsert` — 34 lời gọi, 25 có `stage`, 9 trong tệp kiểm/eval dựa vào mặc định, 08/10]
- Trục B — Trạng thái giai đoạn Đang mở đầu: sống | đã lưu trữ [thước CE: `GiaiDoanService.archive`]
- Trục C — Loại thoả thuận seed: mở | đóng thắng | đóng thua
- Core → AC: API khi Demo đã cất (AC-1) · seed (AC-2) · mã sản phẩm không dựa vào mặc định (AC-3) · hồi quy (AC-4).
- Later: bỏ mặc định ở cơ sở dữ liệu (lối A) — hàng sau, khi `tro-ly-okr-nen` và `bo-okr-mau` đã gỡ kẹt.
- Never: trigger hay hàm cơ sở dữ liệu tự chọn giai đoạn.

## Đường đo

- Thước: người thử lưu trữ giai đoạn Đang mở đầu rồi tạo thoả thuận mới, thoả thuận hiện ở cột Đang mở đầu tiên còn lại, 0 lần hỏi · số từ: phiên nghiệm thu (`uat-session`) trên production · bảo đảm bởi: AC-1
- Thước: không đường tạo nào trong mã sản phẩm dựa vào mặc định của cơ sở dữ liệu · số từ: phép quét AC-3 · bảo đảm bởi: AC-3

## Out of scope

- Bỏ mặc định `"DEMO_BOOKED"` của cột `deal.stage` (lối A — hàng sau).
- Đổi cách `DealsService.create` chọn giai đoạn mặc định (đã đúng; chỉ ghim thêm ca lưu trữ).
- Sửa 9 lời gọi trong tệp kiểm/eval đang dựa vào mặc định (chỉ dữ liệu kiểm thử; lối A sẽ sửa).
- Dữ liệu mẫu ngoài thoả thuận (công ty, liên hệ, OKR).

## Notes

- **Lối A** (anh chọn ở Cổng 1 bằng `sửa: lối A`): bỏ mặc định bằng `schema.prisma` và một migration `DROP DEFAULT`
  (mốc lớn hơn `20261010184651`). Giá: 9 lời gọi trong 5 tệp kiểm/eval thêm `stage` tường minh; 5 tệp đó nằm trong
  `paths` của 8 hồ sơ đã ký (`tro-ly-okr-nen`, `chi-quan-tri-sua-duoc-truong`, `truong-tu-tao-o-cai-dat`, `bo-okr-mau`,
  `canh-kr-okr`, `dot-hoi-y-tuong-okr`, `gioi-han-duyet-cay-okr`, `tro-ly-okr-tom-tat`) phải ghim lại trong cùng vòng —
  trong đó `tro-ly-okr-nen` (E4/E17/E22/E23/E25 neo merge-base cũ, làn máy không ghim lại được) và `bo-okr-mau` (đậu chờ
  sửa `nap.ts`) đã biết là kẹt, nên giá thật của A gồm cả gỡ hai hồ sơ đó. Đường lùi của A: revert PR; migration tạm đặt
  lại mặc định là lối khẩn cấp có thời hạn. Giám sát khuyên B cho vòng này, A tách hàng sau.
- Không migration, không giao diện, không API mới.
- Tệp ngoài ranh giới (xin ở P3-50, đã duyệt): `apps/api/test/giai-doan-seed.spec.ts` (mới), `_acceptance/config.yaml`
  (khoá `gmd_`). Lối B không chạm 5 tệp kiểm/eval nào.
- Đường nền dùng lại bản xanh trên onehub `c1067c163` (luật 17).
