# Plan: nop-ban-nhap-chon-theo-khoa

Hồ sơ `_acceptance/nop-ban-nhap-chon-theo-khoa/` · T2 · design `docs/superpowers/specs/2026-10-04-nop-ban-nhap-chon-theo-khoa-design.md`

## Task 1 — Bộ chọn theo khoá trong ca «Mục tiêu đã nhận»

- Files: `apps/agent-okr/test/nop-ban-nhap.integration.spec.ts`
- Việc: thay khối `findFirstOrThrow(… orderBy: { createdAt: "asc" })` (dòng 503–506) bằng khối `BO_CHON_KHOA` ghim nguyên văn ở design doc.
- Verify: `bun run test -- "cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test test/nop-ban-nhap.integration.spec.ts"` → 16 pass; `bunx biome check` trên tệp không đổi khối.
- Phục vụ: E3, E4 · independent: false

## Task 2 — Răng hai chiều chạy được trên cây đã sửa

- Files: `_acceptance/nop-ban-nhap-chon-theo-khoa/rang/dao-thu-tu.mjs`, `rang/quet-mau.mjs`
- Verify: `bun …/dao-thu-tu.mjs xanh` → 0; `bun …/dao-thu-tu.mjs do` → 0 (đỏ đúng chữ ký); `bun …/quet-mau.mjs` → 0. Phá-thử: tạm bỏ bước dời bản ghi trong bản sao → chiều đỏ phải ra mã 1 (không tái hiện), không ra 0.
- Phục vụ: E1, E2, E5 · independent: false (cần Task 1)

## Task 3 — Mở rộng sau S4 round 1 (sổ d-…-6)

- Files: `apps/agent-okr/test/nop-ban-nhap.integration.spec.ts`, `_acceptance/nop-ban-nhap-chon-theo-khoa/rang/dao-thu-tu.mjs`, `rang/quet-mau.mjs`
- Việc: hàm `mucTieuChoTheoKhoa` dùng cho ca `nhan` và `bac`; `orderBy: [{ createdAt: "asc" }, { id: "asc" }]` cho `canChinh` của ca `bac`; răng dời thành bảng ba ca xếp lại bằng chỉ mục tạm + `CLUSTER`; răng quét so từng chỗ với `DA_RA` (11 chỗ).
- Verify: `bun …/dao-thu-tu.mjs xanh` → 0 và `do` → 0, ba lượt liền; `bun …/quet-mau.mjs` → 0; phá-thử bỏ `CLUSTER` → mã 2 cả ba ca; E3 16 pass.
- Phục vụ: E1, E2, E3, E4, E5 · independent: false
