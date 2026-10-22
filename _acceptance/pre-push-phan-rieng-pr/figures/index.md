# Điểm quyết định — pre-push-phan-rieng-pr

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Phạm vi luật: mọi lần đẩy mang onehub mới, theo merge-base (Hỏi-3, sổ dòng 12) | 4 bước nối tiếp, 2 nhánh rẽ | `luat-gop.png` |
| Phần PR tự thêm gồm vế riêng_trước (sổ dòng 2) | 3 bước nối tiếp (tăng → hai vế riêng → giao) | `luat-gop.png` |
| Nền là merge-base (sổ dòng 13) | dưới ngưỡng: 1 bước | — |
| Hỏi-2: chạy riêng bài đọc LO-TRINH.html (sổ dòng 11) | 2 nhánh rẽ, trình bằng chữ trên thẻ | — |
| Hook không gọi mạng (sổ dòng 5) | dưới ngưỡng: 1 bước | — |
| Sửa vi_sao của t1Only (sổ dòng 6) | dưới ngưỡng: 1 bước | — |
| Hỏi-1: đổi lời hứa ca 6 của pre-push-t1 (sổ dòng 7) | 2 nhánh rẽ (đổi ca 6 · đổi fixture), trình bằng chữ trên thẻ | — |
| Bỏ coverage-scan, bỏ đặc tả UX (sổ dòng 8, 9) | dưới ngưỡng: 1 bước | — |

## Đề bài hình `luat-gop`

- Loại: sơ đồ luồng quyết định, trái sang phải.
- Nút: «một dòng stdin» → một điều kiện: «có sha từ xa dùng được và có origin/onehub»; không → «luật cũ: xét cả phần
  tăng». Có → «nền = merge-base(đỉnh, onehub)» → «tăng = diff(sha từ xa, đỉnh)» và hai vế «riêng_sau = diff(nền, đỉnh)»,
  «riêng_trước = diff(merge-base(nền, sha từ xa), sha từ xa)» → «S = tăng ∩ (riêng_sau ∪ riêng_trước)».
- Ghi chú cạnh S: «không có onehub mới → S = tăng (tự rút về luật cũ)»; «tệp của onehub = tăng − S, không tính».
- Ba lối ra của S: rỗng → «bỏ test, build»; chỉ T1 → «bỏ test, build»; có t1_ma_doc · .github · mã → «đủ năm bước».
- Ví dụ #523 ghi cạnh lối cuối: tăng 24 tệp, S = LO-TRINH.html → đủ năm bước.
- AC liên quan: AC-1, AC-2, AC-3, AC-6.
