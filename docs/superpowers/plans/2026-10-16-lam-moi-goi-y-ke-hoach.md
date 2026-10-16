# Kế hoạch — lam-moi-goi-y-ke-hoach

Hợp đồng: `_acceptance/lam-moi-goi-y-ke-hoach/contract.md` · design doc `docs/superpowers/specs/2026-10-16-lam-moi-goi-y-ke-hoach-design.md`.
Làm tuần tự trong phiên chính; các task nhỏ, cùng chạm hồ sơ — không fan-out.

| # | Task | Files | Verify | Phục vụ | independent |
|---|---|---|---|---|---|
| 1 | Bài kiểm DOM trước, đỏ trên code cũ | `apps/app/test/lam-moi-goi-y-ke-hoach.dom.tsx` | `bun test … -t gy-lm-` đỏ đúng thông điệp ghim | E1–E4 | false |
| 2 | Đưa `goiYCuaDeal` vào phần chờ của `cache.deal` | `apps/app/lib/trpc/cache.ts` | task 1 xanh | E1–E4 | false |
| 3 | Răng quét đường đổi giai đoạn | `_acceptance/lam-moi-goi-y-ke-hoach/rang/duong-doi-giai-doan.mjs` | `--tu-thu` rồi chạy thật thoát 0 | E10 | false |
| 4 | Răng đột biến bốn cặp | `_acceptance/lam-moi-goi-y-ke-hoach/rang/dot-bien.mjs` | chạy thật thoát 0 (xin lượt Điều phối) | E5 | false |
| 5 | Răng màn trên bàn đo của cây | `_acceptance/lam-moi-goi-y-ke-hoach/rang/man.mjs` | chạy qua phiên đo (xin lượt Điều phối) | E6 | false |
| 6 | Răng hồi quy expect | `_acceptance/lam-moi-goi-y-ke-hoach/rang/khong-xoa-expect.mjs` | `--tu-thu` thoát 0 | E7 | false |
| 7 | Khai lệnh trong `_acceptance/config.yaml` (báo #375 trước khi commit) | `_acceptance/config.yaml` | `s4-args.mjs` sinh được args | mọi eval | false |
