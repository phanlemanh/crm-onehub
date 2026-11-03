# Kế hoạch — nguong-gia-tri-mat-giao-dien (F39)

Hợp đồng duyệt 31/10 theo khuyến nghị (Hỏi-1..4 đều a); dòng chốt `chot_nguong: *` mang tên Phan Le Manh.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| 51 tính năng có màn hình mở được phiên nghiệm thu | mục Ngưỡng của 51 `opportunity.md` | AC-1 (hết cờ), AC-2 (đúng bảng), AC-3 (chốt bằng sổ), AC-6 (hạn còn hiệu lực) |
| Ngưỡng đo giá trị, có nguồn số thật | `bang-de-xuat.md` | AC-4 (judgment) |
| 51 hồ sơ ghim lại trên test xanh | lượt ghim sau F37 | AC-5 |

## Task 1 — áp bảng và bỏ nhãn (S3, ngay)

- `bun rang/ap-de-xuat.mjs` rồi `bun rang/bo-nhan.mjs`.
- Verify: E1 `co.mjs` 0 hồ sơ mặt người dùng; E2 `doi-chieu.mjs` 0 SAI; E3 `chot.mjs` 0 SAI; E6 `timebox.mjs` 0 SAI; `lint:slop`.

## Task 2 — sau F37 và sau dot-2

- Gộp sau nhánh dot-2 (va-lo-ro-vai-chi-okr); lượt ghim 51 hồ sơ chung với F38 và dot-2; S4.
