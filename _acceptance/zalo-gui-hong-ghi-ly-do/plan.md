# zalo-gui-hong-ghi-ly-do — kế hoạch

Thiết kế: `design.md`. Hợp đồng: `contract.md` (duyệt 2026-10-08T12:00:00Z). Mọi task tuần tự (`independent: false`): chúng cùng chạm `zalo-api.ts`, `zalo-bot-xuong.ts`.

## Task 1 — mô tả lỗi Zalo (E1, E2, E3, E6)

- `packages/validation/src/zalo-update.ts`: lớp `ZaloTuChoi {maLoi, moTa}`, `ZaloHinhDangLa {khoa}`; `parseZaloSend` ném hai lớp này, `message` giữ chữ cũ; `ZALO_LY_DO` thêm «khoa-lech».
- `apps/agent/agent/lib/zalo-api.ts`: `LoiHttpZalo` mang `maLoi`, `moTa` đọc từ thân (có trần); `zaloGoi` cho 408 lọt chỉ với `getUpdates`; `moTaLoiZalo(loi)`.
- `zalo-config.ts`: `ZALO.nhatKy = { tranMoTa, tranThan, boQua: {...}, maThu: "webhook-test" }`.
- Tám chỗ ghi: `zalo-bot-xuong.ts` (`lopLoi` → `moTaLoiZalo`), `zalo-tra-loi.ts` ×4, `zalo-nhan.ts` (bắt đầu lại), `zalo-hoi.ts` (quá hạn).
- Bài: `apps/agent/test/zalo-gui-hong-ly-do.spec.ts` khối `mo-ta`, `408`, `bay-cho`, `rieng-tu`.
- Verify: `cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/zalo-gui-hong-ly-do.spec.ts`, `bun run check-types`, `bun run lint`, `bun run lint:slop`.

## Task 2 — tin vào lên tiếng (E4, E5, E16, E17)

- `zalo-nhan.ts`: bốn nhánh bỏ qua ghi một dòng mã nhánh.
- `zalo-webhook.ts`: `webhook-test`; 403 `khoa-lech` / `thieu-khoa`, đặt lý do bền khi thân là tin Zalo (`updateMany` có điều kiện); 404 `chua-co-bot`.
- `zalo-bot.ts`: `ghiUrlKhiKhongCoHong` giữ cả «zalo-tu-choi» và «khoa-lech».
- Bài: khối `bo-qua`, `webhook-thu`, `webhook-403`, `ly-do-ben`.

## Task 3 — đổi bot (E9, E10, E11, E12, E14, E15, E18, E19)

- `packages/validation/src/zalo-cau-noi.ts`: `datBotYeuCau.xacNhanDoiBot?`, kết cục `can-xac-nhan-doi-bot` + `soLienKet` + `tenBotMoi`.
- `packages/db/src/zalo-lien-ket.ts`: `demLienKet`, `goHetLienKet(tx)`; `packages/db/src/kenh-thong-bao.ts`: `canNoiLai`.
- `zalo-bot-xuong.ts` `datBot`: so mã bot, hỏi, một `$transaction` ghi AppSetting + gỡ liên kết, dòng vết.
- API: `zalo.contracts.ts` (đầu vào `xacNhanDoiBot`), `zalo-cau-noi.service.ts`, `zalo.service.ts` (`luuBot` trả kết cục mới; `cuaToi.canNoiLai`; `xuong` trạng thái «khoa-lech»), `zalo.router.ts`.
- App: `o-token.tsx` (`ConfirmDialog`), `khoi-zalo.tsx` (dòng cần nối lại), `trang-thai-webhook.tsx` (cảnh báo khoá lệch), chữ ở `apps/app/lib/messages/nhac-qua-zalo.ts` (+ ghim ở `messages-guard.spec.ts`).
- `docs/connections.md`: ngoại lệ đổi bot.
- Bài: khối `doi-bot-hoi`, `doi-bot-dong-y`, `cung-bot` (agent); `can-noi-lai`, `luu-bot-qua-api`, `canh-bao-khoa` (api); `apps/app/test/zalo-doi-bot.dom.tsx`.

## Task 4 — phép đo của hồ sơ (E7, E8, E13, E20)

- `rang/pham-vi.mjs` (đọc Ranh giới từ contract), `rang/dot-bien.mjs` (20 cặp), `rang/chup.mjs` (do:man, ba ảnh).
