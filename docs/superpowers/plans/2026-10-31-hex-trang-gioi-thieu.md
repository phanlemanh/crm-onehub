# Kế hoạch — hex-trang-gioi-thieu (SN2)

Hợp đồng đã duyệt 31/10 (`_acceptance/hex-trang-gioi-thieu/contract.md`), Hỏi-1 và Hỏi-2 theo khuyến nghị.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Trang giữ nền tối khi máy khách đặt nền sáng | `packages/ui/src/styles/globals.css` | AC-4 (hai nền trùng nhau) |
| 11 chỗ trên trang tô bằng màu chung | `apps/app/components/landing/*` (6 tệp) | AC-1 (hết mã hex), AC-2 (đúng token), AC-3 (tương phản), AC-5 (ô hỏi) |
| Ngoài 11 chỗ không đổi gì | — | AC-6 (so ảnh trước/sau) |

## Task 1 — khai token ngữ nghĩa cho `.dark`

- Files: `packages/ui/src/styles/globals.css`
- Đổi bộ chọn khối token đầu tiên từ `:root {` thành `:root,\n.dark {`.
- Verify: `bun run check-types` không đổi; E4 ở S4.
- Phục vụ E4, E6. `independent: true`

## Task 2 — thay 11 mã hex

- Files: `built-with.tsx`, `ask-card.tsx`, `bento-card.tsx`, `capabilities-section.tsx`, `github-star-button.tsx`,
  `agent-section.tsx` trong `apps/app/components/landing/`
- Thay theo bảng «Hiện trạng» của design doc.
- Verify: `bun _acceptance/hex-trang-gioi-thieu/rang/hex.mjs` thoát 0; `bunx biome check` các tệp đổi.
- Phục vụ E1, E2, E3, E5, E6. `independent: true`

Hai task nhỏ, làm tuần tự trong vòng chính (không đáng tung song song).
