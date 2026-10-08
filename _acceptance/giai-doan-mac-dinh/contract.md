---
schema_version: 1
feature: «Thoả thuận mới không rơi vào giai đoạn đã lưu trữ»
slug: giai-doan-mac-dinh
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: draft
approved_by:
approved_at:
design_doc: _acceptance/giai-doan-mac-dinh/design.md
---

# Acceptance Contract: giai-doan-mac-dinh

## Context

Cột `deal.stage` có mặc định `"DEMO_BOOKED"` trong cơ sở dữ liệu, mà giai đoạn Demo thì quản trị viên lưu trữ được.
Đường tạo của API hôm nay chọn đúng giai đoạn Đang mở sống đầu tiên, nhưng mọi đường tạo khác (dữ liệu mẫu, kiểm
thử, đường tạo tương lai) dựa vào mặc định đó sẽ đặt thoả thuận vào giai đoạn đã cất — thoả thuận biến khỏi Kanban
(Ngoài-6 của `giai-doan-thoa-thuan`). Vòng này bỏ mặc định ở cơ sở dữ liệu (lối A, giám sát khuyên; lối B giữ mặc
định — xem Notes), cho dữ liệu mẫu chọn giai đoạn sống theo loại, và ghim hành vi tạo-không-chọn-giai-đoạn khi giai
đoạn đầu đã lưu trữ.

Source input: hàng E4 của `docs/plan/lo-trinh-okr.json`; Ngoài-6 của `giai-doan-thoa-thuan`;
`_acceptance/giai-doan-mac-dinh/opportunity.md` (Cổng Đáng `build` 2026-10-07T13:13:50Z, luật 16);
`_acceptance/giai-doan-mac-dinh/design.md`.

## Criteria

- AC-1: Given `schema.prisma` và thư mục migration sau vòng này, When đọc mô hình `Deal`, Then trường `stage` không còn `@default`; có đúng một migration mới tên `<mốc>_giai_doan_mac_dinh` với mốc lớn hơn `20261010184651` và không trùng mốc nào trên onehub, và tệp `migration.sql` của nó chỉ có lệnh bỏ mặc định của cột `"deal"."stage"`.
- AC-2: Given cơ sở dữ liệu đã chạy mọi migration, When đọc `information_schema.columns` của `deal.stage` và chèn một hàng `deal` bằng SQL thô không có cột `stage`, Then `column_default` là `NULL` và lệnh chèn bị từ chối vì `stage` rỗng — không hàng nào được ghi; đối chứng: cùng lệnh chèn có `stage` là một giai đoạn sống thì ghi được.
- AC-3: Given giai đoạn Đang mở đầu tiên (Demo) đã lưu trữ và không còn thoả thuận, When tạo thoả thuận qua `DealsService.create` không chọn giai đoạn, Then thoả thuận vào giai đoạn `OPEN` sống có `position` nhỏ nhất, không vào Demo, và hiện ở đúng cột đó của `deals.board`.
- AC-4: Given một cơ sở dữ liệu dùng-một-lần riêng của ca (tạo, chạy migration, drop sau ca), Demo đã lưu trữ, When chạy `packages/db/prisma/seed.ts` thật, Then giai đoạn Demo vẫn đã lưu trữ sau khi seed chạy; mọi thoả thuận seed nằm ở giai đoạn sống; có thoả thuận ở cả ba loại `OPEN`, `WON`, `LOST`; thoả thuận đóng (`closedAt` khác rỗng) chỉ ở giai đoạn `WON`/`LOST`, thoả thuận mở chỉ ở `OPEN`; mọi `from`/`to` của dòng `STAGE_CHANGE` seed trỏ tới một giai đoạn có thật.
- AC-5: Given mọi lời gọi tạo thoả thuận trong mã và kiểm thử của kho, When chạy `bun run check-types`, Then sau khi sinh lại Prisma client từ `schema.prisma` của cây, `stage` là trường bắt buộc của kiểu tạo thoả thuận và kiểm kiểu thoát 0; và không lệnh SQL thô nào trong `apps/` và `packages/` (ngoài tệp kiểm) chèn vào bảng `deal` mà thiếu cột `stage` — không lời gọi nào còn dựa vào mặc định đã bỏ.
- AC-6: (kiểm không hồi quy) Given các bài kiểm sẵn có của giai đoạn (`giai-doan.spec.ts`), tiền tệ, trường tuỳ chỉnh, bộ OKR mẫu và xoá bản ghi, When chạy lại, Then thoát 0 mà không sửa khẳng định `expect(` nào — chỉ thêm `stage` vào lời gọi tạo thoả thuận.
- AC-7: Given 8 hồ sơ đã ký có tệp kiểm bị chạm ở AC-6, When chạy lưới trước-merge của kit ở HEAD của nhánh, Then không hồ sơ nào trong 8 bị báo bằng chứng cũ (đã ghim lại trong vòng này).

## Coverage

- Trục A — Đường tạo thoả thuận: API `DealsService.create` | seed | kiểm thử và eval | SQL thô [thước CE: `git grep` lời gọi `deal.create`/`createMany`/`upsert` — 34 lời gọi, 9 không truyền giai đoạn, 08/10]
- Trục B — Trạng thái giai đoạn Đang mở đầu: sống | đã lưu trữ [thước CE: `GiaiDoanService.archive`]
- Trục C — Loại thoả thuận seed: mở | đóng thắng | đóng thua
- Core → AC: mặc định bị bỏ ở mô hình và migration (AC-1) · cơ sở dữ liệu từ chối hàng thiếu giai đoạn (AC-2) · API khi Demo đã cất (AC-3) · seed (AC-4) · kiểm kiểu toàn kho và SQL thô (AC-5) · hồi quy (AC-6) · hồ sơ đã ký ghim lại (AC-7).
- Never: đặt lại lâu dài một mặc định trỏ tới mã giai đoạn cụ thể (lối khẩn cấp có thời hạn ở Notes là ngoại lệ có tên).

## Đường đo

- Thước: người thử lưu trữ giai đoạn Đang mở đầu rồi tạo thoả thuận mới, thoả thuận hiện ở cột Đang mở đầu tiên còn lại, 0 lần hỏi · số từ: phiên nghiệm thu (`uat-session`) trên production · bảo đảm bởi: AC-3
- Thước: không đường tạo nào dựa vào mặc định của cơ sở dữ liệu · số từ: `information_schema` + kiểm kiểu toàn kho · bảo đảm bởi: AC-1, AC-2, AC-5

## Out of scope

- Đổi cách `DealsService.create` chọn giai đoạn mặc định (đã đúng; chỉ ghim thêm ca lưu trữ).
- Trigger hay hàm cơ sở dữ liệu tự chọn giai đoạn sống (trí khôn không sống trong cơ sở dữ liệu).
- Dữ liệu mẫu ngoài thoả thuận (công ty, liên hệ, OKR).

## Notes

- **Lối thay B** (anh chọn ở Cổng 1): giữ mặc định `"DEMO_BOOKED"`; vòng chỉ gồm AC-3, AC-4 và hồi quy, không
  migration, không chạm 6 tệp kiểm thử và 8 hồ sơ đã ký. Lỗ Ngoài-6 còn cho đường tạo sau này. Chọn B thì vế 2 của ngưỡng SỐNG («không đường tạo nào còn dựa vào mặc định») phải sửa ở `opportunity.md` trước khi ký, và AC-1, AC-2, AC-5, AC-7 bỏ.
- Giá của A: 9 lời gọi trong 5 tệp kiểm thử/eval thêm `stage` tường minh; các tệp đó nằm trong `paths` của 8 hồ sơ đã
  ký (`tro-ly-okr-nen`, `chi-quan-tri-sua-duoc-truong`, `truong-tu-tao-o-cai-dat`, `bo-okr-mau`, `canh-kr-okr`,
  `dot-hoi-y-tuong-okr`, `gioi-han-duyet-cay-okr`, `tro-ly-okr-tom-tat`) → ghim lại trong cùng vòng, một lượt làn.
- Migration: mốc lớn hơn `20261010184651` (L1 của P5); nhánh gộp sau gộp lại `schema.prisma`. Lên production tự chạy
  `migrate deploy` khi gộp.
- Đường lùi: revert PR. Nếu một đường ghi trên production hỏng vì thiếu `stage` (ví dụ một bản deploy còn Prisma client
  cũ), lối khẩn cấp là một migration tạm đặt lại mặc định, kèm việc gỡ nó trong vòng kế.
- `apps/agent/evals/okr/cach-ly.eval.ts` là eval gọi model thật: vòng này không chạy nó; lời gọi tạo thoả thuận trong đó
  được đo bằng kiểm kiểu (AC-5) và chốt không xoá `expect` (AC-6).
- Đường nền dùng lại bản xanh trên onehub `c1067c163` (luật 17).
