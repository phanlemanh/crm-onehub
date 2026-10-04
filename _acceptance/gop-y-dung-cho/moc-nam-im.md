# Mốc nằm im — gop-y-dung-cho (vế CHẾT)

Chụp trên production ngay trước merge PR #238, bằng truy vấn mốc ở design doc mục «Đường đo»,
`:ngay_len` = `now()` lúc chạy. Phiên chỉ đọc (`default_transaction_read_only = on`), dự án Vercel
`crm-onehub-api`, biến `DATABASE_URL` của môi trường production.

| Trường | Giá trị |
|---|---|
| Lúc chạy (`:ngay_len`) | 2026-10-03T21:57:38Z (2026-10-04 04:57 giờ Hà Nội) |
| Cửa sổ | `createdAt` từ `:ngay_len − 30 ngày` tới trước `:ngay_len − 7 ngày`, `nac = 'bat'`, `cuocSoanId IS NULL` |
| Số dòng trong cửa sổ | 0 |
| Số dòng nằm im | 0 |
| Tỉ lệ nằm im | không xác định (chia cho 0) |

Toàn bảng `okrDeXuat` lúc chụp: 2 dòng, cả 2 là `nac = 'bat'`, ngoài cuộc soạn, đang `cho`; dòng cũ
nhất tạo 2026-10-01T08:56Z, chưa đủ 7 ngày tuổi nên không vào cửa sổ.

## Hệ quả cho Cổng Giá trị

Mốc rỗng: Kara · OKR mới bật trên production từ 01/10, chưa có góp ý nào đủ 7 ngày tuổi trước ngày
lên. Vế CHẾT của `opportunity.md` («tỉ lệ góp ý nằm im không giảm so với mốc đo trước lượt») không
có số để so. Phiên nghiệm thu phải đọc vế CHẾT là «không đo được — không có mốc», không được đọc là
«không giảm», và quyết dựa trên hai vế SỐNG (đếm từ `:ngay_len` trở đi).

Hai dòng đang chờ lúc chụp tạo trước `:ngay_len` nên không vào vế SỐNG 1 (chỉ đếm dòng tạo từ ngày lên).
