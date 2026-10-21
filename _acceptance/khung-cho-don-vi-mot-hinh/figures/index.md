# Điểm quyết định — khung-cho-don-vi-mot-hinh (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| d-20261020T091146Z-3 — ba pha tải đi qua một thành phần khung | ba pha nối tiếp (fallback máy chủ → chờ kỳ/quyền/cây → chờ danh sách) và hai nhánh (có / không hàng công cụ thật) — cần hình | `ba-pha-mot-khung.html` |
| d-20261020T091146Z-1 — hình mới ở packages/ui | dưới ngưỡng: 1 bước | — |
| d-20261020T091146Z-2 — không đổi hình bang chung | dưới ngưỡng: 1 nhánh | — |
| d-20261020T091146Z-4 — khe thanhCongCu ngoài phần ẩn | dưới ngưỡng: 1 bước | — |
| d-20261020T091146Z-5 — ngưỡng AC-4 suy từ bảng thật | dưới ngưỡng: 1 bước | — |
| d-20261020T091146Z-6, -7, -8 — bỏ design-pass, bỏ đường đo, DH13 riêng | dưới ngưỡng: 0 bước | — |
| Nền hạ tầng đỏ — engine kit 2.33.0 trong kho ≠ 2.33.1 đang chạy | dưới ngưỡng: 1 nhánh | — |

## Đề bài hình `ba-pha-mot-khung`

- Loại: sơ đồ luồng trước/sau, hai làn song song («Hôm nay» trên, «Sau vòng này» dưới).
- Nút làn «Hôm nay»: Mở trang → «Máy chủ chưa xong: KhungXuong hình bảng (8 dòng mỏng)» → «Trình duyệt chờ danh sách: KhungDangTaiDonVi vẽ tay (5 dòng hai tầng)» → «Bảng mục tiêu». Hai nút khung tô khác màu, nhãn «hai hình khác nhau».
- Nút làn «Sau vòng này»: Mở trang → «Máy chủ chưa xong» và «Trình duyệt chờ (có / không hàng công cụ thật)» cùng trỏ vào MỘT nút «KhungXuong bang-hai-dong (packages/ui)» → «Bảng mục tiêu». Nhãn «một hình».
- AC liên quan: AC-1, AC-3, AC-5.
