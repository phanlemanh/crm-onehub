---
schema_version: 1
feature: «Danh sách thoả thuận Kara trả có chấm màu giai đoạn; số liệu ẩn danh theo giai đoạn có tập khoá đóng»
slug: deal-va
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-08T15:57:47Z
design_doc: _acceptance/deal-va/design.md
---

# Acceptance Contract: deal-va

## Context

Từ #206 (`giai-doan-thoa-thuan`), công cụ `list_deals` của Kara trả nhãn giai đoạn thay cho mã, mà bảng thoả thuận
Kara vẽ (`deal-list-result.tsx`) lại tra chuỗi đó như một mã — không bao giờ khớp, nên cột giai đoạn chỉ còn chữ xám
(Ngoài-7). Cùng vòng đó, số liệu ẩn danh `deals_by_stage` lấy mã của mọi giai đoạn làm khoá: mỗi giai đoạn quản trị
viên tự tạo, kể cả đã lưu trữ, thành một khoá `cuid` ngẫu nhiên; số khoá tăng dần và không so được giữa các bản cài
(Ngoài-1). Vòng này cho `list_deals` trả thêm `stageId`, bảng Kara tô chấm theo mã đó bằng đúng `DealStageIndicator`
của hồ sơ thoả thuận, và đóng `deals_by_stage` về 10 khoá cố định: bảy mã gốc cộng `other_open`, `other_won`,
`other_lost`.

Source input: hàng E1 của `docs/plan/lo-trinh-okr.json`; Ngoài-1 và Ngoài-7 của `giai-doan-thoa-thuan`;
`_acceptance/deal-va/opportunity.md` (Cổng Đáng `build` 2026-10-07T13:13:50Z, luật 16); thiết kế anh duyệt 08/10
(«Đồng ý theo lời khuyên»), `_acceptance/deal-va/design.md`.

## Criteria

- AC-1: Given `@crm/telemetry`, When gọi `permittedDealStage(id, kind)`, Then mỗi mã trong bảy mã của `GIAI_DOAN_GOC` trả chính nó dù `kind` là gì, và mọi mã khác (một `cuid`, chuỗi rỗng, một nhãn có dấu) trả `other_open`, `other_won` hay `other_lost` theo `kind` `OPEN`, `WON`, `LOST`; `DEAL_STAGE_KEYS` là đúng 10 khoá ấy, không trùng.
- AC-2: Given cơ sở dữ liệu có thoả thuận ở giai đoạn gốc, ở giai đoạn tự tạo của cả ba loại, một giai đoạn tự tạo đã lưu trữ không còn thoả thuận, và một giai đoạn gốc bị đổi nhãn, When rollup gom phần CRM, Then `deals_by_stage` có đúng tập khoá `DEAL_STAGE_KEYS` (khoá không có thoả thuận mang 0); mỗi mã gốc bằng số thoả thuận ở giai đoạn đó; `other_<loại>` bằng tổng thoả thuận ở các giai đoạn tự tạo của loại đó; tổng các khoá bằng số thoả thuận; không khoá nào là mã của một giai đoạn tự tạo; chuỗi JSON của cả phần CRM không chứa nhãn giai đoạn nào của fixture.
- AC-3: Given `docs/telemetry.md`, When đọc dòng `deals_by_stage` của bảng «The CRM», Then dòng đó nêu đủ 10 khoá của `DEAL_STAGE_KEYS` và không còn câu «stages an admin adds get a cuid».
- AC-4: Given thoả thuận ở giai đoạn gốc và ở giai đoạn tự tạo, When Kara gọi `list_deals` (mọi `status`), Then mỗi thoả thuận trả về có `stageId` bằng mã giai đoạn của nó và `stage` bằng nhãn hiện hành của giai đoạn đó. Đầu ra thật của công cụ (`execute` và phần đưa cho model) đọc qua `dealListResultOf` của app vẫn giữ `stageId`.
- AC-5: Given đầu ra `list_deals` đã lưu trong cuộc trò chuyện, When `dealListResultOf` đọc nó, Then `stageId` có mặt được giữ nguyên; đầu ra cũ không có `stageId` vẫn đọc được với `stageId` là `null` (không rơi cả bảng về `null`).
- AC-6: Given bảng thoả thuận Kara vẽ, danh sách giai đoạn có một giai đoạn Đang mở, một Chốt được, một Không thành, When bảng nhận ba thoả thuận mang `stageId` của ba giai đoạn đó, Then ô giai đoạn của từng hàng có chấm với tone lần lượt `info`, `success`, `error` và chữ là nhãn hiện hành trong danh sách giai đoạn (kể cả khi nhãn lưu trong cuộc trò chuyện đã cũ); When một thoả thuận không có `stageId` mà `stage` là mã gốc `CLOSED_WON`, Then có chấm `success`; When không có `stageId` và `stage` là một nhãn, hoặc `stageId` không có trong danh sách giai đoạn, Then ô hiện đúng chữ `stage`, không chấm, có `translate="no"`. Với cùng một giai đoạn, tone của chấm ở bảng Kara bằng tone của chip giai đoạn trên thẻ bảng Kanban (`DealStageMenu`).
- AC-7: (kiểm không hồi quy) Given các bài kiểm sẵn có của kết quả Kara (`agent-results.spec.ts`), Kara đọc giai đoạn (`giai-doan-agent.integration.spec.ts`), báo cáo giai đoạn (`giai-doan-bao-cao.spec.ts` ca `tong-quan`, `okr-telemetry`) và allowlist telemetry, When chạy lại sau thay đổi, Then thoát 0 và không khẳng định `expect(` sẵn có nào trong bốn tệp kiểm ấy bị xoá hay sửa, trừ ca `deals_by_stage` cũ do AC-2 thay.
- AC-8: Given `apps/app/components/agent-builder/deal-list-result.tsx` sau vòng này, When chạy sàn thiết kế của kho, Then không vi phạm P0.

## Coverage

Quét bằng `morphological-scan` preset test-matrix (S1, 08/10).

- Trục A — Loại giai đoạn: gốc | tự tạo Đang mở | tự tạo Chốt được | tự tạo Không thành | tự tạo đã lưu trữ | gốc đổi nhãn [thước CE: `DealStageKind` + `GIAI_DOAN_GOC` ở `packages/db/src/giai-doan.ts`]
- Trục B — Đời bản ghi Kara: có `stageId` | trước 29/09 (mã gốc ở `stage`) | 29/09 → nay (nhãn ở `stage`) | `stageId` lạ [thước CE: lịch sử `lookup.ts` — `e9bf6317b` đổi `stage` sang nhãn]
- Trục C — Đầu vào lạ của bộ lọc khoá: mã lạ | chuỗi rỗng | nhãn có dấu [thước CE: các hàm `permitted*` cùng tệp]
- Core → AC: tập khoá đóng (AC-1, AC-2) · tài liệu là danh sách (AC-3) · Kara trả mã (AC-4) · bản ghi cũ đọc được (AC-5) · chấm đúng tone, nhãn hiện hành, rơi về chữ (AC-6) · hồi quy (AC-7) · sàn thiết kế (AC-8).
- Later: chấm giai đoạn ở kết quả `search_crm` (`DealHit` cũng mang nhãn) — chưa có màn nào vẽ nó bằng chấm.
- Never: dò nhãn ra mã; gửi nhãn giai đoạn trong số liệu ẩn danh.

## Đường đo

- Thước: người thử hỏi Kara một danh sách thoả thuận và chỉ đúng thoả thuận Chốt được / Không thành chỉ bằng màu, 0 lần hỏi · số từ: phiên nghiệm thu (`uat-session`) trên production · bảo đảm bởi: AC-4, AC-6
- Thước (ngưỡng CHẾT): chấm ở bảng Kara cùng tone với chip của cùng giai đoạn trên bảng Kanban · số từ: bài DOM `deal-va-cham-mau` dòng so cặp · bảo đảm bởi: AC-6
- Thước: `deals_by_stage` của một bản cài có giai đoạn tự tạo chỉ mang 10 khoá · số từ: bài kiểm `giai-doan-bao-cao.spec.ts` ca `deals_by_stage` · bảo đảm bởi: AC-1, AC-2

## Out of scope

- Dò nhãn ra mã cho cuộc trò chuyện lưu từ 29/09 tới nay (vẫn hiện chữ).
- Chấm giai đoạn ở kết quả `search_crm`.
- Đổi số liệu ẩn danh khác ngoài `deals_by_stage`.

## Notes

- Không migration, không API mới, không chữ giao diện mới.
- Tệp ngoài ranh giới duyệt ở P3-37: `apps/app/test/deal-va-cham-mau.dom.tsx` (mới),
  `apps/agent/test/giai-doan-agent.integration.spec.ts` (thêm một describe), `_acceptance/config.yaml` (khoá `dva_`).
- Hồ sơ đã ký bị chạm: `giai-doan-thoa-thuan/E13` chạy ca `deals_by_stage` trong `giai-doan-bao-cao.spec.ts` — ca đó
  đổi sang tập khoá đóng (AC-2 ở đây); E13 vẫn chạy và phải xanh, câu «khoá bằng id» của E13 cho giai đoạn tự tạo nay
  do `deal-va#AC-2` thay. `giai-doan-thoa-thuan/E14` có `lookup.ts` trong `paths`. Ghim lại `giai-doan-thoa-thuan`
  trước khi đẩy.
- Đường nền đo xanh trên onehub `6f59c0ad2` (2026-10-08T15:48:18Z).
