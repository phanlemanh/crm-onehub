# Hình tại điểm quyết định — truong-mot-cach-cu-xu

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — ô Công ty, Giai đoạn, vai trò liên hệ giữ riêng hay vào bảng | 2 nhánh rẽ | `hoi-1-o-ngoai-bang.html` |
| Hỏi-2 — Liên kết: liên kết là đích chính + nút Sửa, hay hàng là đích sửa + nút Mở | 2 nhánh rẽ | `hoi-2-dich-bam-lien-ket.html` |
| d-1 bảng đăng ký ở apps/app | dưới ngưỡng: 1 bước, 0 nhánh | — |
| d-2 trường chuẩn qua bảng | dưới ngưỡng: 1 bước, 0 nhánh | — |
| d-3 đọc số ở ô | dưới ngưỡng: 2 bước, 0 nhánh | — |
| d-13 lỗi máy chủ theo kiểu | dưới ngưỡng: 2 bước, 0 nhánh | — |
| d-15 số không trần thấp | dưới ngưỡng: 1 bước, 0 nhánh | — |
| d-7…d-10, d-16 bỏ/dời phạm vi | dưới ngưỡng: 1 bước, 0 nhánh | — |

## Đề bài hình

### hoi-1-o-ngoai-bang

- Loại: so sánh hai lối (hai cột).
- Nút: phiếu Thoả thuận với các hàng trường; bảng đăng ký kiểu; ba ô ngoài bảng (Công ty, Giai đoạn, vai trò liên hệ).
- Lối A (khuyên): ba ô giữ cách vẽ riêng, mọi trường có kiểu khác đi qua bảng; giá: không thêm việc.
- Lối B: thêm kiểu «Bản ghi» và «Giai đoạn» vào bảng; giá: thêm khoảng nửa vòng, chạm DealStageMenu, InlineCompanyField.
- AC liên quan: AC-1, AC-9.

### hoi-2-dich-bam-lien-ket

- Loại: so sánh hai mockup một hàng phiếu (hai cột).
- Nút: hàng «Trang web» — nhãn bên trái, giá trị bên phải.
- Lối A (khuyên): giá trị là liên kết gạch chân (bấm → mở trang), cạnh đó nút bút chì «Sửa Trang web» (bấm → ô nhập).
- Lối B: bấm cả hàng → ô nhập như mười kiểu kia; cạnh đó nút mũi tên ra ngoài «Mở Trang web».
- AC liên quan: AC-5.
