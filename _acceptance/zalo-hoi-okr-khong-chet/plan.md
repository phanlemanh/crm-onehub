# zalo-hoi-okr-khong-chet — kế hoạch

Thiết kế: `design.md`. Hợp đồng: `contract.md` (duyệt 2026-10-08T10:29:20Z).

## Task 1 — hằng và công cụ đè (phục vụ E2, E1) · independent: false

- Files: `apps/agent/agent/lib/okr/config.ts` (thêm `TRO_LY_OKR.ngoaiPhien = { moTa, lyDo }`), `apps/agent/agent/tools/tro-ly-okr-ngoai.ts` (mới).
- Bài: `apps/agent/test/okr-uy-quyen-ngoai.spec.ts` — ma trận tám `purpose`, ctx `phienAudit`.
- Verify: `cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/okr-uy-quyen-ngoai.spec.ts test/okr-uy-quyen.spec.ts test/okr-chi-tro-ly.spec.ts`, rồi `bun run check-types`, `bun run lint`, `bun run lint:slop`.

## Task 2 — phép đo của hồ sơ (phục vụ E1, E4, E5) · independent: false

- `rang/c33.mjs` + `bo-do/c33.json` (một câu, đúng khuôn `khuonBo` của cham-bo-do).
- `rang/pham-vi.mjs` với hai đối chứng.
- `rang/dot-bien.mjs` ba cặp, dùng `_acceptance/ca-chap-chon-cach-ly/rang/ban-sao.mjs`.
- Verify: `bun _acceptance/zalo-hoi-okr-khong-chet/rang/pham-vi.mjs`, `bun _acceptance/zalo-hoi-okr-khong-chet/rang/dot-bien.mjs`. E1 và E6 cần khoá s4 (model thật), chạy ở S4.

Hai task tuần tự: Task 2 phá vật của Task 1.
