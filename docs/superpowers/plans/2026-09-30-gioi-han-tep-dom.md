# Kế hoạch: gioi-han-tep-dom

Design: `docs/superpowers/specs/2026-09-30-gioi-han-tep-dom-design.md` ·
Hợp đồng: `_acceptance/gioi-han-tep-dom/contract.md`

Ba task nối tiếp; task sau dùng hàm và cấu hình của task trước.

## Task 1 — cấu hình và trình chạy

- Files: `packages/ui/test/chay-dom-config.ts` (mới), `packages/ui/test/chay-tung-tep-dom.ts`
- Làm: `CHAY_DOM` (`tep.tranMs` 1 phút, `tep.maQuaGio` 124, `tongKet.soTepChamNhat` 5, suy
  từ `SECOND_MS`/`MINUTE_MS`, `as const`). Trình chạy thành hàm `chayTungTep` + đoạn
  `import.meta.main`; `spawnSync` với `timeout`, `killSignal: "SIGKILL"`, `cwd: goc`; đo bằng
  `performance.now()`; dòng xanh, đỏ, quá giờ, tổng, chậm nhất theo design.
- Verify: `cd packages/ui && bun run test` và `cd apps/app && bun run test:dom` thoát 0.
- Phục vụ: E1, E2, E3, E4 · `independent: false`

## Task 2 — spec của trình chạy

- Files: `packages/ui/test/chay-tung-tep-dom.spec.ts` (mới)
- Làm: bộ dựng thư mục tạm; chạy hàm trong `bun -e` bằng `spawn` detached, đồng hồ 30 s giết
  nhóm; ba khối `qua-gio`, `thoi-luong`, `tep-do` đúng `expected` của E1–E3, mỗi ca timeout 45 s.
- Verify: ba lệnh `gtd_*` trong `_acceptance/config.yaml` xanh; lượt phá trên bản sao: bỏ
  `timeout` → E1 đỏ «trình chạy không tự dừng», không tiến trình mồ côi; lấy số bun báo → ghi
  kết quả E2; phá đường đỏ → E3 đỏ.
- Phục vụ: E1, E2, E3 · `independent: false`

## Task 3 — thước bộ thật

- Files: `_acceptance/gioi-han-tep-dom/rang/bo-that.mjs` (mới)
- Làm: chạy lệnh thật của hai gói, lưu stdout vào `.acceptance-runs/gioi-han-tep-dom/`, đo
  các quan hệ của E4 với cấu hình đọc bằng `bun -e`.
- Verify: `bun _acceptance/gioi-han-tep-dom/rang/bo-that.mjs` in «E4 đạt»; lượt phá: viết thẳng
  `slice(0, 3)` → đỏ «số mục chậm nhất lệch cấu hình»; đổi cấu hình mà trình chạy viết thẳng
  giới hạn → đỏ «giới hạn không đọc từ cấu hình».
- Phục vụ: E4 · `independent: false`
