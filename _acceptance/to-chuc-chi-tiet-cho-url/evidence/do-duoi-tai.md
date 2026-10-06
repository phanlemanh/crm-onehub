# Đo tay dưới tải — 2026-10-05 11:09–11:15 (giờ máy), Mac mini

Vế «dưới tải» của đề bài, đo tay theo sổ quyết định d-20261005T005805Z-5 (không thành eval máy). Chạy dưới khoá `s4` của làn điều phối, trên đỉnh nhánh f9791ae7b (đã gộp onehub 308b3e28).

Tải: `bun run test` toàn kho chạy nền suốt lượt đo (turbo, các gói song song — đúng hình dạng pre-push đã đỏ lúc 07:35). Bộ toàn kho tự nó thoát 0, 13/13 tác vụ.

| Lượt | Bản | Lệnh | Tải 1 phút lúc bắt đầu | Kết quả | Thời gian |
|---|---|---|---|---|---|
| 1 | HEAD | `--rerun-each 20` | 4,26 | 580 pass · 0 fail | 42,8 s |
| 2 | HEAD | `--rerun-each 20` | 5,57 | 580 pass · 0 fail | 42,1 s |
| 3 | HEAD | `--rerun-each 20` | 6,43 | 580 pass · 0 fail | 42,1 s |
| đối chứng | neo ee0cc227 | `--rerun-each 20` | 7,67 | 573 pass · 7 fail (6 «chon-nut: bam tung loai nut…», 1 «o-so-man: o thu nhat…») | — |

Cùng lệnh lúc máy rảnh: 18 s một lượt. Dưới tải chậm hơn khoảng 2,3 lần mà bản sửa vẫn 0 đỏ trên 1740 lượt; bản cũ dưới cùng tải đỏ 7/580.

Lệnh: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/to-chuc-chi-tiet.dom.tsx --rerun-each 20`; bản neo chép vào `test/.scratch/` (gitignore), xoá sau lượt. Nhật ký thô: `.acceptance-runs/to-chuc-chi-tiet-cho-url/tai/` (ngoài git).
