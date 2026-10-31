# Kế hoạch — rang-khung-trang-mo (BK3)

Hợp đồng `_acceptance/rang-khung-trang-mo/contract.md` (duyệt 31/10). Thiết kế
`docs/superpowers/specs/2026-10-31-rang-khung-trang-mo-design.md`.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Trang mới tự dựng đầu trang làm bài kiểm của kho đỏ, gọi tên trang | `apps/app/test/support/khung-trang.ts` | AC-1…AC-6, AC-8 (lối quét và luật nhóm) |
| Bảng ngoại lệ liệt 21 trang lệch hôm nay kèm lý do | `apps/app/test/fixtures/khung-trang-ngoai-le.json` | AC-5, AC-7 (bảng có răng) |
| Bài chạy trong lượt kiểm thường của ứng dụng | `apps/app/test/khung-trang-mo.spec.ts` | AC-1…AC-8 (mọi chiều đỏ, đối chứng) |

## Task 1 — Lối quét trang

- Files: `apps/app/test/support/khung-trang.ts`
- Verify: `cd apps/app && bun test ./test/khung-trang-mo.spec.ts`
- Phục vụ E1–E8 · `independent: false`

## Task 2 — Bảng ngoại lệ

- Files: `apps/app/test/fixtures/khung-trang-ngoai-le.json` (đã commit ở S1)
- Verify: như Task 1, ca `doi-chung-duong`
- Phục vụ E5, E7 · `independent: false`

## Task 3 — Bài kiểm, mỗi phép đo một cặp hai chiều

- Files: `apps/app/test/khung-trang-mo.spec.ts`
- Verify: như Task 1 (19 ca, mỗi chiều đỏ ghim thông điệp, có đối chứng dương) + `bun run check-types` + `bun run lint`
- Phục vụ E1–E9 · `independent: false`

Ba task chung một tệp kiểm nên chạy tuần tự trong vòng chính.
