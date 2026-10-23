# pre-push-cau-va-nhan — kế hoạch thi công

Hồ sơ `_acceptance/pre-push-cau-va-nhan/` (Cổng Phạm vi 22/10, Manh Phan). Thiết kế
`docs/superpowers/specs/2026-10-22-pre-push-cau-va-nhan-design.md`. Chạy tuần tự trong vòng chính.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Lời giải thích của đường nhẹ nói đúng vế so ở đầu nhánh trên máy chủ | `.githooks/gate-shape.json` | AC-1 (câu khai đúng luật) |
| Dòng «chạy đủ» gọi đúng tệp `.github/` gây nặng | `scripts/pre-push-t1.mjs` | AC-2 (nhãn đúng lý do) |
| Phép đo lịch sử báo riêng ca bộ phân loại hỏng | `_acceptance/pre-push-phan-rieng-pr/rang/lich-su.mjs` | AC-3 (tách ca sập) |
| Hai hồ sơ đã ký vẫn xanh | các răng của hai hồ sơ | AC-4 (không đổi) |

## Task 1 — đưa bản sửa đã viết vào nhánh

- Files: `scripts/pre-push-t1.mjs`, `.githooks/gate-shape.json`, `_acceptance/pre-push-phan-rieng-pr/rang/lich-su.mjs`,
  `packages/ui/test/pre-push-t1.spec.ts`, `docs/superpowers/specs/2026-10-21-pre-push-phan-rieng-pr-design.md`.
- Lấy commit treo trên nhánh cục bộ `luu/pre-push-cau-va-nhan-wip` (viết trước S1, cất để đường nền chạy trên cây sạch).
- Verify: `git diff --stat` khớp năm tệp.
- Phục vụ: E2–E9. independent: false.

## Task 2 — bổ sung bài kiểm theo phản biện

- Files: `packages/ui/test/pre-push-t1.spec.ts`.
- G14 thêm biến thể (iii) `.github/workflows/ci.yml` + `apps/api/a.ts`; thêm test «hinh-gop (b): vi_sao ta ve dau tu xa»
  đọc `gate-shape.json` của `PRE_PUSH_T1_NGUON`.
- Verify: `cd packages/ui && bun test --timeout 120000 ./test/pre-push-t1.spec.ts` xanh, số ca hai ma trận 18 và 16.
- Phục vụ: E2, E3, E4. independent: false (sau Task 1).

## Task 3 — chạy răng của hồ sơ và đo hai chiều

- Files: `_acceptance/pre-push-cau-va-nhan/rang/{doi-chieu,lich-su-sap,neo}.mjs` (đã viết ở S1).
- Verify: `node rang/doi-chieu.mjs` (bốn BAT), `node rang/lich-su-sap.mjs`, `node rang/neo.mjs`; chiều đỏ nằm trong
  chính các răng.
- Phục vụ: E5, E6, E10. independent: false (sau Task 2).

## Task 4 — kiểm bộ lệnh của kho trên tệp đã đụng

- Verify: biome trên các tệp mã đã sửa (không `--write` cả thư mục), `node _acceptance/pre-push-phan-rieng-pr/rang/ho-so-cu.mjs`,
  `node _acceptance/pre-push-phan-rieng-pr/rang/dot-bien.mjs`, `node _acceptance/pre-push-t1/rang/dot-bien.mjs`.
- Phục vụ: E8, E9. independent: false.
