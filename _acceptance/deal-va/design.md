# Thiết kế — deal-va (E1)

Hàng E1 của đợt sau-14-10. Hai mục ngoài hợp đồng của `giai-doan-thoa-thuan` (Cổng Bằng chứng 29/09, «mở hợp đồng
mới»): Ngoài-7 (danh sách thoả thuận Kara trả mất chấm màu giai đoạn) và Ngoài-1 (`deals_by_stage` có tập khoá mở).
Anh duyệt thiết kế 08/10: «Đồng ý theo lời khuyên» — A ở cả ba câu.

## Gốc lỗi

- `list_deals` (`apps/agent/agent/lib/lookup.ts`) trả `stage: deal.giaiDoan.label` từ #206. `deal-list-result.tsx`
  hàm `Stage` tra chuỗi đó trong `useGiaiDoan().theoId` — một bảng theo **mã** — nên nhãn không bao giờ khớp và ô
  rơi về chữ xám.
- `RollupService.crm` gom `deal.groupBy({ by: ["stage"] })` rồi `countsOf(…, dealStage.findMany().map(id))`: mỗi giai
  đoạn (kể cả đã lưu trữ) là một khoá, giai đoạn tự tạo mang `cuid`.

## Quyết định

1. **Tập khoá đóng 10 khoá** (câu 1, A). `@crm/telemetry` thêm `DEAL_STAGE_KEYS` = bảy mã gốc của `GIAI_DOAN_GOC`
   (`@crm/db/giai-doan`) + `other_open`, `other_won`, `other_lost`, và `permittedDealStage(id, kind)`: mã gốc → chính
   nó; còn lại → `other_<kind thường>`. Rollup đọc `dealStage.findMany({ select: { id, kind } })`, đổi từng dòng đếm
   qua `permittedDealStage`, rồi `countsOf(…, DEAL_STAGE_KEYS)` — đủ 10 khoá, khoá vắng là 0. Bảy mã gốc giữ chuỗi số
   liệu cũ; giai đoạn gốc bị đổi tên vẫn báo theo mã (nhãn không bao giờ đi).
   - Loại: B (chỉ 3 khoá theo loại — đứt chuỗi số cũ), C (7 mã + `other` — mất loại của giai đoạn tự tạo).
2. **`stageId` cạnh `stage`** (câu 2, A). `list_deals` trả thêm `stageId: deal.stage`; Kara vẫn đọc nhãn ở `stage`.
   `agent-transcript.ts` nhận `stageId` (vắng → `null`, cho bản ghi cũ). `Stage` chọn mã: `stageId` nếu có trong
   `theoId`; không có `stageId` mà `stage` là mã trong `theoId` (bản ghi trước 29/09 lưu mã gốc) → chính nó; còn lại
   → chữ như hôm nay. Có mã thì vẽ `DealStageIndicator` — cùng thành phần của `stage-change.tsx` và
   `stage-stepper.tsx`, nên tone và nhãn hiện hành đi từ một chỗ.
   - Loại: B (dò nhãn ra mã — sai khi đổi tên hay trùng nhãn).
3. **Bản ghi 29/09 → nay giữ chữ** (câu 3, A). Không dò nhãn. Ghi Known limits.

## Mặt phẳng chạm

- `packages/telemetry/src/allowlist.ts`, `packages/telemetry/test/allowlist.spec.ts`
- `apps/api/src/telemetry/rollup.service.ts`, `apps/api/test/giai-doan-bao-cao.spec.ts`
- `docs/telemetry.md` (dòng `deals_by_stage`)
- `apps/agent/agent/lib/lookup.ts`, `apps/agent/test/giai-doan-agent.integration.spec.ts` (thêm một describe)
- `apps/app/lib/agent-transcript.ts`, `apps/app/components/agent-builder/deal-list-result.tsx`,
  `apps/app/test/agent-results.spec.ts`, `apps/app/test/deal-va-cham-mau.dom.tsx` (mới)

Không migration, không API mới, không chữ giao diện mới.

## Giao diện

Bậc 1 (`docs/design.md`): `DealStageIndicator` → `StatusIndicator` của `packages/ui` đã có, không thành phần mới.
Không chạy design-pass: ô bảng không đổi bố cục, chỉ khôi phục chấm đã có trước #206 (ghi `descope` trong sổ).

## Ảnh hưởng hồ sơ đã ký

- `giai-doan-thoa-thuan/E13` (`gdtt_okr_telemetry`) chạy ca `deals_by_stage khoa bang id` trong
  `giai-doan-bao-cao.spec.ts`. Ca đó đổi sang tập khoá đóng (AC-2 của hồ sơ này); E13 vẫn chạy và xanh, câu «khoá bằng
  id» cho giai đoạn tự tạo được thay bằng `deal-va#AC-2`. Ghim lại `giai-doan-thoa-thuan` trước khi đẩy.
- `giai-doan-thoa-thuan/E14` có `lookup.ts` trong `paths` — ghim lại cùng lượt.
