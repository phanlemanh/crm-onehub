# Kế hoạch: rang-giu-khung-ngan (BK2)

Design: `docs/superpowers/specs/2026-11-01-rang-giu-khung-ngan-design.md`. Hợp đồng: `_acceptance/rang-giu-khung-ngan/contract.md`.

## T1 — Khuôn mang dữ liệu luật

- Files: `design/patterns/ngan-ban-ghi.md`
- Thêm `Sheet`, `Dialog` vào `cam_ngoai_khuon`; thêm `cam_ho: [Sheet, Dialog]`, `thay_cho` (sáu dòng); `ngoai_le` 14 dòng, bỏ
  `DetailSheetEmpty`. Thân khuôn: một gạch về luật lint và bài quét.
- Verify: `node _acceptance/khung-chung-ngan-ban-ghi/rang/quet-ngan.mjs` (răng BK1 vẫn xanh).
- Phục vụ: E11, E12. `independent: false`.

## T2 — Bộ đọc khuôn chung

- Files: `tools/oxlint/onehub/shared/doc-khuon-ngan.ts`
- Tập con YAML; kiểu `KhuonNgan`; ném lỗi gọi tên khoá; `khoiCuaTen` theo `cam_ho`.
- Verify: bài quét T4 (ca khứ hồi).
- Phục vụ: E3b. `independent: false` (đứng trên T1).

## T3 — Luật oxlint và cấu hình

- Files: `tools/oxlint/onehub/rules/ngan-trong-khung.ts`, `tools/oxlint/onehub/index.ts`, `.oxlintrc.json`
- Verify: `bun run lint:slop` (0 dòng `ngan-trong-khung`), răng T5.
- Phục vụ: E1–E5, E9, E10. `independent: false`.

## T4 — Bài quét

- Files: `apps/app/test/khung-ngan.spec.ts`
- Host ↔ khuôn, gốc JSX khung, kiểm `ngoai_le`, dòng `docs/proto.md`, khứ hồi YAML; ca đỏ trên chữ thật đã sửa.
- Verify: `cd apps/app && bun test ./test/khung-ngan.spec.ts`; phá-thử bằng bản sửa tạm trong ca.
- Phục vụ: E3b, E6–E8, E11–E13. `independent: false`.

## T5 — Răng lint hai chiều

- Files: `_acceptance/rang-giu-khung-ngan/rang/luat-lint.mjs`
- Bản sao tạm, đọc lệnh `lint:slop` từ `package.json`, ma trận tám tên, đối chứng gần tên, khuôn thêm/bớt, dời `khuon.nhap`,
  ngoại lệ thiếu lý do, ba chỗ im, cây thật.
- Verify: chạy răng; phá-thử: tắt luật trong `.oxlintrc.json` của bản sao → ca đỏ TRUOT.
- Phục vụ: E1–E5, E9, E10. `independent: false`.

## T6 — BK4: dòng màn mẫu

- Files: `docs/proto.md`
- Mục «Màn mẫu của một khuôn», một dòng trỏ `deal-sheet.tsx` và khuôn.
- Verify: ca `proto-mau` của T4; E14.
- Phục vụ: E13, E14. `independent: true`.
