# Kế hoạch thi công — ngoai-le-telemetry-giai-doan

1. Thước `khong-re-theo-ten.mjs`: thêm `packages/telemetry/src` vào `THU_MUC`; `CHO_PHEP` theo tệp và từ
   (`allowlist.ts` → `GIAI_DOAN_GOC`); xét mọi từ khớp trên dòng (`matchAll`); in `CHO PHEP` — phục vụ E1–E4.
2. `docs/api.md` gạch đầu dòng `GIAI_DOAN_GOC` khai ngoại lệ telemetry — phục vụ E5.
3. `rang/thu-thuoc.mjs`: bản sao cây ngoài kho (git archive vào thư mục tạm), sáu ca, bốn đột biến thước dựng tại chỗ
   và một đột biến tài liệu cho chiều đỏ — phục vụ E1–E6.
4. Ghim lại `giai-doan-thoa-thuan` (E17 chạy thước này) — phục vụ E6.
