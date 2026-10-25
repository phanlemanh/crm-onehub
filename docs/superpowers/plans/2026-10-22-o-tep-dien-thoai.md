# Kế hoạch thi công — o-tep-dien-thoai

Hồ sơ `_acceptance/o-tep-dien-thoai/` (T2, Cổng Phạm vi duyệt `fefa94528`). Thiết kế:
`docs/superpowers/specs/2026-10-22-o-tep-dien-thoai-design.md`.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Răng đo chụp và đo phiếu, hộp tải nguồn ở 375 và 1280 | `_acceptance/o-tep-dien-thoai/rang/do-man.mjs` | E1–E5 (ảnh màn thật) |
| Chữ trong vùng kéo thả rớt xuống dưới nút khi ô hẹp | `packages/ui/src/components/nguon-keo-tha.tsx` | AC-1, AC-5 (chữ không xuống từng từ) |
| Tên trường Tệp hiện trọn, nằm trên ô ở điện thoại | `apps/app/components/detail-sheet.tsx`, `apps/app/components/crm/fields/o-tep.tsx` | AC-2, AC-3 (nhãn trọn, không tràn) |

## Task 1 — Răng đo màn

- Files: `_acceptance/o-tep-dien-thoai/rang/do-man.mjs`.
- Dựng trong phiên đo (`scripts/lan-do/tien-de.mjs`): API chạy lại với kho Blob giả của
  `_acceptance/truong-tep/rang/blob-gia.mjs`, có cả `TEP_BAN_GHI_BLOB_TOKEN` lẫn `KHO_TAI_LIEU_BLOB_TOKEN`; công ty, hai
  thoả thuận, trường FILE nhãn dài qua `fields.create`; một tệp tên dài cho T2 qua `fieldFiles.requestUpload` → PUT →
  `complete`.
- Đo hình học theo `expected` của E1–E5, chụp năm ảnh vào `BANG_CHUNG`.
- Verify: chạy `config:executors.script.otdt_man` trên cây chưa sửa mã → thoát 1 với 'otdt man: phieu 375 nut canh chu'
  (chiều đỏ E1) và báo nhãn bị cắt (E2).
- Phục vụ: E1, E2, E3, E4, E5. `independent: false` (Task 2–3 cần nó để chọn bề rộng nền).

## Task 2 — Vùng kéo thả rớt dòng

- Files: `packages/ui/src/components/nguon-keo-tha.tsx`.
- Khối chữ: `min-w-0 flex-1` → thêm bề rộng nền `basis-*` của thang; chọn giá trị nhỏ nhất làm khung ở 375 rớt dòng mà
  cột giá trị phiếu và hộp tải nguồn ở 1280 vẫn một hàng (đo bằng răng, ghi số vào sổ).
- Verify: `config:executors.test.otdt_dom`; răng: E1, E4, E5 xanh.
- Phục vụ: E1, E4, E5, E6. `independent: false`.

## Task 3 — Hàng Tệp xếp dọc dưới md

- Files: `apps/app/components/detail-sheet.tsx` (lựa chọn mới của `DetailSheetProperty`: dưới `md` nhãn trên giá trị,
  nhãn không cắt), `apps/app/components/crm/fields/o-tep.tsx` (bật lựa chọn ấy).
- Verify: `bun run check-types`, `config:executors.test.otdt_dom`; răng: E2, E3, E4 xanh.
- Phục vụ: E2, E3, E4, E6. `independent: false`.

## Task 4 — Chiều đỏ của E3, E4, E6

- E4: bản sao tạm với `basis-full` → răng thoát 1 'otdt man: phieu 1280 khung xep doc'; hoàn lại.
- E3: bản sao tạm với `min-w` vượt 375 trên khung → 'otdt man: phieu 375 vung cuon tran'; hoàn lại.
- E6: sửa tạm một dòng `nguon-canh-nhau.dom.tsx`, commit tạm trên nhánh nháp → 'otdt dom: bai cu bi sua'; hoàn lại.
- Ghi kết quả vào `_acceptance/o-tep-dien-thoai/so-s3.md`.
- Phục vụ: E3, E4, E6. `independent: false`.

Thứ tự: 1 → 2 → 3 → 4, tuần tự trong phiên chính (các task chạm chung răng và chung màn).
