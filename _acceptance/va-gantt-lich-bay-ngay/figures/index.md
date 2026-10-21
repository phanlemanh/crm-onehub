# Hình tại điểm quyết định — va-gantt-lich-bay-ngay

| Điểm | Đếm | Hình |
|---|---|---|
| d-20261019T152533Z-8 — cờ `khongNghiTuan` thay cờ «đã đặt» | ba nhánh đọc lịch + ba bước nối tiếp (bài đã ký ghi qua API → trả lại cột mảng → tệp sau đọc) | `figures/lich-co-khong-nghi.png` — đã nhìn, đạt |
| d-20261019T152534Z-9 — khoá và trần chỉ ở lời kiểm thêm việc | hai nhánh (lời kiểm mở · lời kiểm thêm việc) | `figures/tran-hai-loi-kiem.png` — đã nhìn, đạt |
| d-…-2 — tách lời kiểm (bị gộp vào hình `tran-hai-loi-kiem`) | như trên | gộp |
| d-…-3 hạt giống tách hàng · d-…-4 bỏ design-pass · d-…-5 bỏ đặc tả UX · d-…-6 không cho bảy ngày nghỉ | một bước, không rẽ | dưới ngưỡng: 1 |

## Đề bài `lich-co-khong-nghi`

- Loại: sơ đồ luồng quyết định, hai cột so sánh («cờ đã đặt» bị loại · «cờ không nghỉ» được chọn).
- Nút: «Quản trị lưu lịch» → hai nhánh ghi (mảng rỗng → `khongNghiTuan = true`; mảng khác rỗng → `khongNghiTuan = false`);
  «Đọc lịch» → ba nhánh (`khongNghiTuan` true → không nghỉ; mảng khác rỗng → đúng mảng; còn lại → mặc định T7, CN).
- Cột bên cạnh: ba bước của bài `dg_lich` đã ký trong cùng kho test (đặt [3,6,7] rồi [6,7] qua API → bước dọn trả cột mảng
  về [] → tệp sau đọc) và kết quả dưới mỗi khuôn: «đã đặt» → lịch không nghỉ, tệp sau đỏ; «không nghỉ» → T7, CN, xanh.
- Nhãn bằng chữ tiếng Việt có dấu. AC liên quan: AC-1, AC-2, AC-4.

## Đề bài `tran-hai-loi-kiem`

- Loại: sơ đồ hai làn.
- Làn trái «lời kiểm dự án mở» (`docDuAnMo`): thêm, sửa, xoá mốc · thêm, gỡ phụ thuộc → chặn chỉ khi dự án đóng.
- Làn phải «lời kiểm thêm việc» (`docDuAnNhanViec`): tạo việc · việc con · chuyển vào → khoá hàng dự án → đóng thì chặn «Dự án
  đã đóng.» → đủ 300 thì chặn «Một dự án chứa tối đa 300 việc.».
- Ghi chú dưới: trước vòng này cả năm thao tác bên trái đi qua lời kiểm bên phải.
- AC liên quan: AC-5, AC-6, AC-7.
