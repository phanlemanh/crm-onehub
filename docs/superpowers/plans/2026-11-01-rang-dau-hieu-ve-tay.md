# Kế hoạch: rang-dau-hieu-ve-tay (BK5)

Design: `docs/superpowers/specs/2026-11-01-rang-dau-hieu-ve-tay-design.md`. Hợp đồng: `_acceptance/rang-dau-hieu-ve-tay/contract.md`.

- T1 — Bộ đọc danh sách nợ `tools/oxlint/onehub/shared/no-ve-tay.ts`. Phục vụ E5, E7. `independent: false`.
- T2 — Luật `tools/oxlint/onehub/rules/khong-ve-tay.ts`, đăng ký ở `index.ts`, bật/tắt trong `.oxlintrc.json`. Verify:
  `bun run lint:slop`. Phục vụ E1–E4, E6, E8. `independent: false`.
- T3 — Danh sách nợ `tools/oxlint/onehub/rules/khong-ve-tay-no-cu.json` sinh từ đầu ra của luật với danh sách rỗng.
  Verify: `lint:slop` xanh. Phục vụ E6, E7. `independent: false`.
- T4 — Bài `apps/app/test/dau-hieu-ve-tay.spec.ts`. Verify: `bun test` tệp ấy. Phục vụ E5, E7, E9. `independent: false`.
- T5 — Răng `_acceptance/rang-dau-hieu-ve-tay/rang/luat-lint.mjs`. Verify: chạy răng, ca tự kiểm. Phục vụ E1–E4, E6,
  E8. `independent: false`.
