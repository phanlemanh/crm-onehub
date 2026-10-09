# Kế hoạch thi công — deal-va

Hợp đồng: `_acceptance/deal-va/contract.md` (duyệt 2026-10-08T15:57:47Z). Thiết kế: `_acceptance/deal-va/design.md`.

1. **Khoá đóng** — `packages/telemetry/src/allowlist.ts`: `DEAL_STAGE_KEYS`, `permittedDealStage`; test
   `permittedDealStage` + `telemetry-md-deals-by-stage` ở `allowlist.spec.ts`; dòng `deals_by_stage` ở
   `docs/telemetry.md`. Phục vụ E1, E3. Kiểm: `dva_khoa`, `dva_tai_lieu`.
2. **Rollup** — `rollup.service.ts` đọc `{ id, kind }`, đổi khoá qua `permittedDealStage`, `countsOf(…, DEAL_STAGE_KEYS)`;
   ca `deals-by-stage tap khoa dong` thay ca cũ trong `giai-doan-bao-cao.spec.ts`. Phục vụ E2. Kiểm: `dva_rollup`.
3. **Kara trả mã** — `lookup.ts` thêm `stageId` cho `listDeals`; describe `stage-id` ở
   `giai-doan-agent.integration.spec.ts` (gồm round-trip qua công cụ và `dealListResultOf`). Phục vụ E4. Kiểm: `dva_agent`.
4. **Bản ghi** — `agent-transcript.ts` nhận `stageId` (vắng/lạ → `null`); describe `stage-id` ở
   `agent-results.spec.ts`. Phục vụ E5. Kiểm: `dva_ban_ghi`.
5. **Chấm** — `deal-list-result.tsx` hàm `Stage` chọn mã theo thứ tự `stageId` → `stage` là mã → chữ; bài DOM
   `deal-va-cham-mau.dom.tsx` (gồm so cặp với `DealStageMenu`). Phục vụ E6, E8. Kiểm: `dva_cham_mau`, `dva_san_thiet_ke`.
6. **Chốt hồi quy** — `_acceptance/deal-va/rang/khong-xoa-expect.mjs` (+ `--tu-thu`). Phục vụ E7. Kiểm: `dva_hoi_quy`.

Các bước 1–2 phụ thuộc nhau (khoá dùng ở rollup); 3–4–5 nối tiếp (trường `stageId`); 6 độc lập.
