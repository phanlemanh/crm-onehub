---
schema_version: 1
feature: "Ngăn bản ghi và Kanban thoả thuận không vỡ bố cục ở khổ hẹp"
slug: bo-cuc-hep-ngan-va-kanban
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
design_doc: docs/superpowers/specs/2026-10-16-bo-cuc-hep-ngan-va-kanban-design.md
---

# Acceptance Contract: bo-cuc-hep-ngan-va-kanban

## Context

Hàng V2c của `docs/plan/lo-trinh-okr.json`, dãy P4 của đợt r2; Cổng Đáng ký build 12/10. Hai lỗi bố cục có từ trước
thấy ở E13 của V2 (`_acceptance/vong-doi-mot-cach-cat`, sổ `d-20261009T135725Z-13`): ở khổ hẹp, hàng số liệu đầu ngăn
và thanh giai đoạn cắt chữ bằng «…», còn nhãn giai đoạn trên thẻ Kanban thoả thuận tràn khỏi viền thẻ. Hạng T2: chạm
`apps/app` và `packages/ui`, không chạm API, cơ sở dữ liệu hay đường T3.

Source input: hàng V2c (`cau_giao`, `ghi_chu`) · `opportunity.md` · ảnh `vdc-*-390.png` của hồ sơ V2 · design doc.

## Criteria

- AC-1: Given Bảng cột thoả thuận có thoả thuận tên 120 ký tự không dấu cách, công ty và người phụ trách tên 120 ký tự
  không dấu cách, ở giai đoạn tên dài, When nhìn thẻ đó ở khổ 375 và ở khổ 1440, Then mọi phần tử của thẻ nằm trọn
  trong viền thẻ và nhãn giai đoạn hiện đủ chữ, không cắt «…».
- AC-2: Given ngăn thoả thuận đó mở ở khổ 375, When nhìn hàng số liệu đầu ngăn, Then bốn ô — Giá trị, Ngày dự kiến
  chốt, Ở giai đoạn, Phụ trách — xếp hai cột, nhãn và giá trị mỗi ô hiện đủ chữ (kể cả tên phụ trách 120 ký tự), không
  cắt «…».
- AC-3: Given ngăn thoả thuận mở ở khổ 375 — một thoả thuận ở giai đoạn mở tên dài, một ở giai đoạn chốt tên dài —
  When nhìn thanh giai đoạn, Then tên mọi bước hiện đủ chữ, không cắt «…», kể cả bước chốt hiện bằng chấm trạng thái.
- AC-4: Given ngăn công ty tên 120 ký tự mở ở khổ 375, When nhìn hàng số liệu đầu ngăn, Then bốn ô xếp hai cột, nhãn
  và giá trị hiện đủ chữ, không cắt «…».
- AC-5: Given khổ 1440, When nhìn ngăn thoả thuận và một thẻ Kanban có người phụ trách và giai đoạn tên ngắn, Then bố
  cục giữ như hôm nay: bốn số liệu trên một hàng, tên mỗi bước giai đoạn trên một dòng, chỉ báo giai đoạn cùng hàng
  người phụ trách trên thẻ.
- AC-6: Given khổ 375, When mở Bảng cột thoả thuận và mở ngăn một thoả thuận, Then trang không cuộn ngang và không phần
  tử nào trong ngăn tràn khỏi bề ngang ngăn.
- AC-7: Given chấm trạng thái của `packages/ui` dùng ở mọi màn khác, When không truyền biến thể xuống dòng, Then nhãn
  vẫn cắt «…» trên một dòng như hôm nay; When truyền biến thể, Then nhãn xuống dòng và không bị cắt.

## Coverage

Quét theo khuôn test-matrix của `morphological-scan`.

- Trục màn: Bảng cột thoả thuận | ngăn thoả thuận | ngăn công ty | ngăn kế hoạch [thước CE: `git grep DetailSheetStats`
  và `DealStageIndicator` trên onehub 34d31a8bf, trừ `/proto`]
- Trục vùng: hàng số liệu | thanh giai đoạn | chỉ báo giai đoạn trên thẻ [thước CE: ba vùng E13 của V2 gọi tên]
- Trục khổ: 375 (dưới `md`) | 1440 (từ `md`) [thước CE: ngưỡng `md` là chỗ ngăn chuyển thành drawer]
- Trục dữ liệu: ngắn | dài 120 ký tự không dấu cách | ô rỗng «—» [thước CE: ca dài của E13 của muc-tieu-va-kr]
- Core: ba vùng × 375 × dữ liệu dài (AC-1, AC-2, AC-3); thẻ dài × 1440 (AC-1); hàng số liệu ngăn công ty × 375
  (AC-4); hồi quy 1440 dữ liệu ngắn (AC-5); không cuộn ngang (AC-6); mặc định của chấm trạng thái ở màn khác (AC-7).
- Later: ngăn kế hoạch × 375 — dùng cùng thành phần hàng số liệu với AC-2 và AC-4, không đo riêng.

## Out of scope

- Ngăn liên hệ và các bảng `DataTable` ở khổ hẹp — không thuộc câu giao.
- Kanban việc (`DA2`) và các bảng cột khác — E13 không thấy lỗi ở đó.
- Đầu ngăn (tên bản ghi, chip giai đoạn ở góc phải) — ảnh 390 của E13 không cắt chữ ở đó.

## Đường đo

- bỏ đường-đo — ô cơ hội không khai ngưỡng (hàng dựng); xem sổ quyết định.

## Notes

- Nhánh `feat/bo-cuc-hep-ngan-va-kanban`, cắt từ onehub 34d31a8bf.
