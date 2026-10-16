# Không rẽ theo tên thành luật kho — kế hoạch

Thiết kế: `docs/superpowers/specs/2026-10-15-khong-re-theo-ten-thanh-luat-kho-design.md`. Hồ sơ:
`_acceptance/khong-re-theo-ten-thanh-luat-kho/`.

| Task | Files | Verify | Evals | independent |
| --- | --- | --- | --- | --- |
| 1. Plugin `onehub`, hai luật quét chữ | `tools/oxlint/onehub/**`, `.oxlintrc.json` | `bun run lint:slop` thoát 0; `bun …/rang/ma-tran-luat.mjs` | E1, E2, E3 | true |
| 2. E17 đọc luật kho, soát đường tắt, thu `paths` | `_acceptance/giai-doan-thoa-thuan/rang/khong-re-theo-ten.mjs`, `_acceptance/giai-doan-thoa-thuan/evals.yaml` (khối E17) | `bun …/rang/e17-qua-luat.mjs`; `bun …/rang/chieu-do.mjs` | E4, E5, E6 | false (cần task 1) |
| 3. Răng của hồ sơ, khoá cấu hình | `_acceptance/khong-re-theo-ten-thanh-luat-kho/rang/**`, `_acceptance/config.yaml` (thêm khoá `krtt_*`) | chạy từng răng | E1–E8 | false |
| 4. Ghim lại `giai-doan-thoa-thuan` ở đỉnh nhánh | `run-log.jsonl`, `evidence-report.md` của hồ sơ | `repin-lane.mjs --slug giai-doan-thoa-thuan --reason "… khong-re-theo-ten-thanh-luat-kho …" --write`; `bun …/rang/ghim-xanh.mjs` | E7 | false (cuối cùng) |

Phạm vi commit kiểm bằng `bun …/rang/pham-vi.mjs` (E8). Task 1–3 đã dựng và đo trong lúc thiết kế (răng phải chạy
được trên cây tạm từ HEAD nên cần commit); task 4 xin khoá `ghim-lai` của đợt.
