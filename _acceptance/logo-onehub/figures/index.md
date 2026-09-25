# Hình tại Cổng 1 — logo-onehub

| Điểm | Đếm | Hình |
|---|---|---|
| Một nguồn sinh cả bộ icon (d-…-4 sharp + ICO tự ghép) | nguồn → script → 3 đích (app/, public/, thư mục ngoài) + test sinh lại so khít: 4 bước nối tiếp | cần hình: `nguon-icon` |
| Mark dựng bằng hình học (d-…-2) | 1 bước (khớp tham số) — dưới ngưỡng: 1 | ảnh chồng `chong-mark.png` (không phải sơ đồ) |
| Chữ dò nét (d-…-3) | 1 bước — dưới ngưỡng: 1 | ảnh chồng `chong-ban-ngang.png` |
| Chép PNG gốc vào kho (d-…-5) | 1 nhánh — dưới ngưỡng: 1 | — |
| Bỏ design-pass (d-…-6) | 1 nhánh — dưới ngưỡng: 1 | thay bằng `xem-truoc-logo.png` |
| Ảnh tab thật chụp tay (d-…-7) | 1 nhánh — dưới ngưỡng: 1 | — |
| [GIẢ ĐỊNH] ba chỗ auth-shell dùng bản ngang | 1 nhánh — dưới ngưỡng: 1 | — |
| [GIẢ ĐỊNH] cỡ ảnh Zalo 512 / Slack 1024 | 1 nhánh — dưới ngưỡng: 1 | — |
| [GIẢ ĐỊNH] giữ ô vuông tương phản ở tab Agent | 1 nhánh — dưới ngưỡng: 1 | — |

## Đề bài `nguon-icon`

- Loại hình: sơ đồ luồng dữ liệu (data flow), trái sang phải.
- Nút: `packages/ui/src/lib/logo-onehub.ts` (nguồn duy nhất: path mark, path chữ, màu) → hai nhánh: (a) `Logo` / `LogoLockup` trong app; (b) `packages/ui/scripts/logo-icons.ts` (sharp + ghép ICO) → ba đích: `apps/app/app/favicon.ico` + `apps/app/public/*` (favicon.ico, favicon.svg, 96, apple 180, manifest 192/512) và thư mục ngoài kho (Slack 1024, Zalo 512, Google 120).
- Vòng kiểm: test `logo-icons.spec.ts` gọi lại chính hàm sinh, so khít với file trong kho (AC-6); test `logo-khop-goc.spec.ts` so nguồn với PNG gốc `scripts/logo-goc/` (AC-1, AC-4).
- Nhãn bằng chữ tiếng Việt, tên file giữ nguyên.
- AC liên quan: AC-1, AC-4, AC-5, AC-6, AC-8.
