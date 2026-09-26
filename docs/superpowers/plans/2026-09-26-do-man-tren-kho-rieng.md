# Kế hoạch — do-man-tren-kho-rieng

Thiết kế: `docs/superpowers/specs/2026-09-26-do-man-tren-kho-rieng-design.md` ·
hợp đồng: `_acceptance/do-man-tren-kho-rieng/contract.md`.

Thứ tự tuần tự: mỗi task dựa trên task trước (T2 dùng hàm của T1, T3 dùng T2…), nên không
task nào `independent: true`.

## T1 — Kho đo: luật tên, tạo từ mẫu, xoá, quét

- Files: `packages/db/src/measure-database.ts` (mới), `packages/db/scripts/measure-db.ts`
  (mới), `packages/db/package.json` (`db:do`), `package.json` gốc (`db:do`),
  `packages/db/test/measure-database.spec.ts` (mới).
- Phục vụ: E1, E2, E3, E4, E5.
- Verify: `bun run test -- "cd packages/db && bun test test/measure-database.spec.ts"` xanh;
  phá-thử theo `expected` của E1–E5 sau khi commit.
- independent: false

## T2 — Phiên đo

- Files: `scripts/lan-do/cau-hinh.mjs` (mới), `scripts/lan-do/phien-do.mjs` (mới),
  `package.json` gốc (`do:man`), `apps/app/.gitignore` (`/.next-phien-do*/`).
- Phục vụ: E6, E7, E8.
- Verify: `bun run do:man --chay "echo ok"` thoát 0, cổng trống, kho không còn; răng E6–E8.
- independent: false

## T3 — `tien-de` tự dựng phiên

- Files: `scripts/lan-do/tien-de.mjs`.
- Phục vụ: E9, E10.
- Verify: răng E9; răng E10 (lệnh `dok_man_chrome` nguyên văn trên kho chung giả).
- independent: false

## T4 — Răng của hồ sơ

- Files: `_acceptance/do-man-tren-kho-rieng/rang/{phien.mjs,do-trong-phien.mjs,
  kho-chung-khong-doi.mjs,khong-noi-thuoc.mjs,tai-lieu.mjs,truoc-gop.mjs,van-tay.mjs}`.
- Phục vụ: E6–E13. Viết cùng T2/T3 (răng là phép đo của chúng), phá-thử sau commit.
- independent: false

## T5 — Tài liệu

- Files: `docs/setup.md`, `CLAUDE.md`, `.env.example`.
- Phục vụ: E12.
- independent: false

## T6 — Chứng thật và bộ năm lệnh

- `repin-lane` (không `--write`) của `dat-okr-trong-crm` tại HEAD khi `crm` giữ ba chu kỳ lạ;
  ghi kết quả vào Notes của hợp đồng.
- `bun run test` · `check-types` · `lint` · `lint:slop` · `build` (PATH Node 24).
- Kiểm tra trước khi gộp toàn kho.
