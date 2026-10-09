---
schema_version: 1
feature: «Ngoại lệ telemetry của bảy mã giai đoạn gốc được khai trong tài liệu và có thước canh»
slug: ngoai-le-telemetry-giai-doan
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: verified
approved_by: Phan Le Manh
approved_at: 2026-10-08T23:32:08Z
design_doc: _acceptance/ngoai-le-telemetry-giai-doan/design.md
---

# Acceptance Contract: ngoai-le-telemetry-giai-doan

## Context

`docs/api.md` mục «Deal stages are rows» ghi `GIAI_DOAN_GOC` chỉ dành cho seed và kiểm thử, và mã sản phẩm
rẽ nhánh theo một trong bảy mã gốc bị thước `khong-re-theo-ten` bắt. Từ #321 (`deal-va`), số liệu ẩn danh
`deals_by_stage` dùng đúng hằng đó trong `packages/telemetry/src/allowlist.ts` — thiết kế đã duyệt —
nhưng thước không quét `packages/telemetry`, nên tài liệu sai và một lần rẽ nhánh mới ở gói đó lọt qua im
lặng (Ngoài-7). Vòng này cho thước quét gói telemetry với một ngoại lệ hẹp có tên, và sửa tài liệu theo.

Source input: Ngoài-7 của `deal-va` (Cổng Bằng chứng 2026-10-08, «mở hợp đồng mới» = Cổng Đáng `build`
theo luật 26); `_acceptance/ngoai-le-telemetry-giai-doan/opportunity.md`; hàng E1b của đợt sau-14-10.

## Criteria

- AC-1: Given cây thật sau vòng này, When chạy thước `khong-re-theo-ten`, Then thoát 0, số tệp quét bằng số tệp `git ls-files` đuôi `.ts`/`.tsx`/`.mjs`/`.js` dưới bảy thư mục (sáu thư mục cũ cộng `packages/telemetry/src`) trừ các mẫu loại trừ cũ, đếm độc lập với danh sách của thước, và có đúng các dòng `CHO PHEP packages/telemetry/src/allowlist.ts:<dòng>: GIAI_DOAN_GOC` cho mỗi dòng của tệp đó chứa tên hằng.
- AC-2: Given một bản sao của cây, When chèn một mã gốc viết bằng chữ (`"CLOSED_WON"`) vào một tệp dưới `packages/telemetry/src` khác `allowlist.ts`, Then thước thoát 1 và in `HONG <tệp>:<dòng>: CLOSED_WON`.
- AC-3: Given một bản sao của cây, When chèn một mã gốc viết bằng chữ vào chính `packages/telemetry/src/allowlist.ts`, Then thước thoát 1 và gọi tên dòng đó — ngoại lệ chỉ cho tên hằng, không cho mã; kể cả khi mã gốc nằm CÙNG dòng với tên hằng (thước xét mọi từ khớp trên dòng, không chỉ từ đầu tiên).
- AC-4: Given một bản sao của cây, When dùng tên `GIAI_DOAN_GOC` trong một tệp telemetry khác `allowlist.ts`, hoặc chèn một mã gốc hay tên `GIAI_DOAN_GOC` vào một tệp dưới `apps/api/src`, Then thước thoát 1 gọi tên tệp đó — ngoại lệ theo tệp, và phần quét cũ không yếu đi.
- AC-5: Given `docs/api.md` mục «Deal stages are rows», When đọc gạch đầu dòng về `GIAI_DOAN_GOC`, Then nó nêu ngoại lệ của `@crm/telemetry/allowlist` (`deals_by_stage`, `permittedDealStage`, `DEAL_STAGE_KEYS`) và rằng thước cho phép đúng tệp đó với đúng tên hằng; câu «for the seed and tests only» không còn đứng một mình.
- AC-6: (kiểm không hồi quy) Given hồ sơ đã ký `giai-doan-thoa-thuan`, When ghim lại sau vòng này, Then mọi eval máy của hồ sơ đó (gồm E17 chạy thước này) thoát đúng kỳ vọng.

## Coverage

- Trục A — Nơi chèn: tệp telemetry thường | `allowlist.ts` | tệp ngoài telemetry (phần quét cũ) [thước CE: danh sách `THU_MUC` của thước]
- Trục B — Dạng chèn: mã viết bằng chữ | tên hằng `GIAI_DOAN_GOC` [thước CE: biểu thức `mau` của thước]
- Ma trận A × B (6 ô): telemetry thường × chữ (AC-2) · telemetry thường × tên (AC-4) · `allowlist.ts` × chữ (AC-3) · `allowlist.ts` × tên (được phép, AC-1) · ngoài telemetry × chữ (AC-4) · ngoài telemetry × tên (AC-4).
- Core → AC: cây thật xanh và ngoại lệ hiện ra (AC-1) · mã bằng chữ ở telemetry (AC-2) · mã bằng chữ ở `allowlist.ts` (AC-3) · tên hằng ngoài tệp được phép và phần quét cũ (AC-4) · tài liệu (AC-5) · hồ sơ đã ký (AC-6).
- Never: bỏ cả tệp `allowlist.ts` khỏi quét.

## Đường đo

- Thước: thước đỏ khi bản sao chèn mã gốc vào tệp telemetry · số từ: `rang/thu-thuoc.mjs` · bảo đảm bởi: AC-2, AC-3, AC-4
- Thước: thước xanh trên cây thật · số từ: lượt CI đầu tiên sau khi gộp (E17 của `giai-doan-thoa-thuan`) · bảo đảm bởi: AC-1, AC-6

## Out of scope

- Đổi `permittedDealStage` sang khoá không dựa vào `GIAI_DOAN_GOC` (thiết kế đã duyệt ở `deal-va`).
- Sửa chữ `expected` của `giai-doan-thoa-thuan/E17` trong `evals.yaml` đã ký (danh sách thư mục cũ).

## Notes

- Không mã sản phẩm, không giao diện, không migration.
- Đường nền đo xanh trên `9e521c748` (onehub `c1067c163` + hồ sơ S1), 2026-10-08T19:30:35Z; lần đo đầu đỏ giả vì ghi tệp hồ sơ vào cây khi đang chạy.
