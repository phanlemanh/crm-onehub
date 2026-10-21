# Kế hoạch: gon-dau-trang-lay-y-kien (VK13)

Hợp đồng: `_acceptance/gon-dau-trang-lay-y-kien/contract.md` · Thiết kế:
`docs/superpowers/specs/2026-10-21-gon-dau-trang-lay-y-kien-design.md`.

Làm tuần tự trong vòng chính; mọi phép đo mới đi kèm cặp hai chiều trên cùng cây (MEASURE-BIRTH-CLAUSE).

## T1 — Thành phần `HangHanhDongBamDay` trong `packages/ui`

- Files: `packages/ui/src/components/hang-hanh-dong-bam-day.tsx`, `packages/ui/test/hang-hanh-dong-bam-day.dom.tsx`
- Hàng `Field orientation="horizontal"` bọc ngoài, `data-slot="hang-hanh-dong-bam-day"`, dưới md: `sticky bottom-0`,
  nền trang, viền trên, đệm dọc như Cập nhật tuần; từ md: không bám, không viền, không đệm thêm. Hằng chiều cao hàng
  xuất cùng tệp để khung soạn dùng cho `scroll-mb`.
- Verify: `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/hang-hanh-dong-bam-day.dom.tsx`; phá-thử:
  bỏ `data-slot` → ca đỏ với thông điệp ghim.
- Phục vụ: E1, E2, E5, E6, E7 · independent: false (T2 dùng)

## T2 — Khung soạn Lấy ý kiến dùng hàng bám, tiêu điểm về lỗi

- Files: `apps/app/app/(app)/[slug]/okr/hoi-y/khoi-gop.tsx`, `apps/app/test/gon-dau-trang-lay-y-kien.dom.tsx`
- `OSoanY`: hàng «còn được N ý · Gửi» thành `HangHanhDongBamDay`; khối `Field` của ba ô mang `scroll-mb` dưới md
  bằng chiều cao hàng; gửi sai → `scrollIntoView({ block: "nearest" })` khối Field ô Ý rồi `focus({ preventScroll:
  true })` ô Ý. `HopSuaY` (hộp sửa ý) không đổi.
- Verify: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts
  ./test/gon-dau-trang-lay-y-kien.dom.tsx ./test/okr-hoi-y.dom.tsx`; phá-thử `GDL_PHA=bo-focus`.
- Phục vụ: E3, E4, E4b · independent: false

## T3 — Áp bản vá Hỏi-1 cho thước `dot-hoi-y-tuong-okr`

- Files: `_acceptance/dot-hoi-y-tuong-okr/rang/man-hoi-y.mjs`, `_acceptance/dot-hoi-y-tuong-okr/decisions.jsonl`
- `git apply docs/plan/vo-khu-muc-tieu/dot-hoi-y-tuong-okr-hoi-1.patch`; liệt kê dòng gỡ vào sổ S3.
- Verify: `node --check` thước; đo ở T6.
- Phục vụ: E8 · independent: true

## T4 — Thước màn `rang/man-gui.mjs`

- Files: `_acceptance/gon-dau-trang-lay-y-kien/rang/man-gui.mjs`
- Một lần chạy trên phiên đo (`tien-de.mjs`), bộ OKR mẫu: mở một Lấy ý kiến pha góp; đo E1, E2, E3, E4b, E5 (cây
  gốc tách ở origin/onehub), E6 (ca dương trước hai ca âm), chụp ảnh E7 sáng/tối; chiều đỏ `--chieu-do
  bo-bam|bam-co-dinh|bo-le|le-o` trên bản sao.
- Verify: chạy xanh trên cây vòng; từng chiều đỏ in đúng thông điệp ghim.
- Phục vụ: E1–E7 · independent: false (cần T1, T2)

## T5 — Thước `rang/khong-doi-hinh.mjs`

- Files: `_acceptance/gon-dau-trang-lay-y-kien/rang/khong-doi-hinh.mjs`
- Đúng `expected` của E9: danh sách viết trước rút bằng bộ đọc eval-yaml của kit, chạy cây vòng và cây onehub.
- Verify: xanh trên cây vòng; `--chieu-do` in «DA SUA apps/app/test/okr-hoi-y.dom.tsx».
- Phục vụ: E9 · independent: true

## T6 — Đo E8 hai chiều

- Chạy `config:executors.script.hy_man_chrome` trên cây vòng (xanh) và thước đã vá trên cây tạm origin/onehub
  (chỉ hỏng E12 bước 5); ghi số vào sổ S3.
- Phục vụ: E8 · independent: false (cần T1–T3)
