# Hình cho Cổng Phạm vi — khung-tao-okr-nhu-deal

| Điểm | Đếm | Hình |
|---|---|---|
| Luồng mở ngăn qua URL (`new`, `hopOkr`) — AC-1, AC-2, AC-7 | 5 bước nối tiếp, 3 nhánh (không quyền, KR không có, «Mở KR này») | luong-url.png |
| Sửa chân ngăn chung, bảy ngăn tạo khác đổi theo (d-1) | 2 nhánh (sửa chung / giữ chân dọc) | ảnh bản mẫu ST-khung-deal và ST-khung-sua-kr ở 1440 và 390 |
| Ngăn chồng lên khung Mục tiêu (d-2) | 2 nhánh (chồng / thay chỗ) | ảnh bản mẫu ST-khung-sua-kr ở 1440 |
| Giữ tên tệp `hop-thoai-*` (d-3) | dưới ngưỡng: 1 bước | — |
| Giữ `data-size` và độ sâu lồng (d-4) | dưới ngưỡng: 1 bước | — |
| Ngăn KR có dòng mô tả, giữ dấu X | dưới ngưỡng: 1 bước | — |

## Đề bài luong-url

- Loại: sơ đồ trạng thái (state machine), ngang.
- Nút: «Trang Theo đơn vị» · «Ngăn Thêm mục tiêu (URL: new)» · «Khung Mục tiêu (URL: record)» · «Ngăn Sửa mục tiêu (hopOkr=muc-tieu)» · «Ngăn Thêm KR (hopOkr=kr-moi)» · «Ngăn Sửa KR (hopOkr=kr:<id>)».
- Mũi tên: Trang → Ngăn Thêm mục tiêu «bấm Thêm mục tiêu / dán URL»; Ngăn Thêm mục tiêu → Khung Mục tiêu «tạo xong: bỏ new, mở khung»; Khung → ba ngăn «bấm hoặc dán URL»; Ngăn Sửa mục tiêu → Ngăn Sửa KR «Mở KR này: đổi hopOkr»; mỗi ngăn → Khung «đóng: xoá hopOkr»; Khung → Trang «đóng khung: xoá record và hopOkr».
- Nhánh chặn (nét đứt, màu trung tính): «Dán URL mà không sửa được đích, hoặc KR không còn» → «không ngăn nào mở, khoá bị xoá».
- AC liên quan: AC-1, AC-2, AC-7.
