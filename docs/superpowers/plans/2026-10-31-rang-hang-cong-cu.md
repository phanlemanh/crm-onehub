# Kế hoạch — rang-hang-cong-cu (BK6)

Hợp đồng `_acceptance/rang-hang-cong-cu/contract.md` (duyệt 31/10, Hỏi-1..3 theo khuyến nghị). Thiết kế
`docs/superpowers/specs/2026-10-31-rang-hang-cong-cu-design.md`.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Màn mới đặt lọc ngoài hàng công cụ làm bài kiểm của kho đỏ, gọi tệp và dòng | `apps/app/test/hang-cong-cu.spec.ts` | AC-1…AC-8 (ba dấu hiệu, ô nhập, chiều im) |
| Bảng ngoại lệ liệt bảy chỗ nợ và ba ô nhập kèm lý do | `apps/app/test/fixtures/hang-cong-cu-ngoai-le.json` | AC-6, AC-7 (bảng có răng) |

## Task 1 — Bảng ngoại lệ (đã commit ở S1)

- Files: `apps/app/test/fixtures/hang-cong-cu-ngoai-le.json`
- Verify: `cd apps/app && bun test ./test/hang-cong-cu.spec.ts`, ca `doi-chung-bang`
- Phục vụ E6, E7 · `independent: false`

## Task 2 — Bài kiểm, mỗi phép đo một cặp hai chiều

- Files: `apps/app/test/hang-cong-cu.spec.ts`
- Verify: như Task 1 (15 ca, chiều đỏ ghim thông điệp, đối chứng dương ở ma trận bọc) + `bun run check-types -- --filter=app` + `bun run lint:slop`
- Phục vụ E1–E9 · `independent: false`
