# Hình tại điểm quyết định — tro-ly-okr-de-xuat

| Điểm | Đếm | Hình |
|---|---|---|
| Hạng T3: chế độ ẩn theo đơn vị + chỗ ghi dòng bị loại (d-…-1, [GIẢ ĐỊNH] 1) | hai nhánh rẽ (T3 · T2), mỗi nhánh một bảng nấc khác nhau | `nac-theo-don-vi` |
| Chế độ ẩn do máy kích khi lưu (d-…-2, [GIẢ ĐỊNH] 2) | năm bước nối tiếp, ba chốt chặn | `duong-che-do-an` |
| Nhận ghi ngay từng dòng (d-…-3, [GIẢ ĐỊNH] 3) | dưới ngưỡng: hai bước; ảnh bản mẫu `ST-muctieu-da-quyet` thay hình | — |
| Hướng A cột cạnh form (d-…-9) | hai nhánh, đã có ảnh bản mẫu cả hai hướng | ảnh `ST-muctieu-co-dong`, `ST-huong-chuyen-man` |
| Trần người/ngày 20 ([GIẢ ĐỊNH] 4) | dưới ngưỡng: một con số | — |
| Xu hướng theo nấc bật (d-…-8, [GIẢ ĐỊNH] 5) | dưới ngưỡng: một điều kiện | — |
| Judge GLM, hiệu chỉnh bộ Viết lại (d-…-6, [GIẢ ĐỊNH] 6) | dưới ngưỡng: một lựa chọn | — |
| Bỏ `da-sua-theo`, bỏ chuỗi Cập nhật tuần trong gói (d-…-5, d-…-7) | dưới ngưỡng: bỏ một thứ | — |

## Đề bài

### nac-theo-don-vi

- Loại hình: bảng so sánh hai cột (T3 khuyên · T2) kèm cây quyết nấc cho một đơn vị.
- Cây: aiOn tắt → tắt; đơn vị trong phạm vi «Bật cho» → bật; ngoài đó mà trong «Chế độ ẩn
  cho» → chế độ ẩn; còn lại → tắt. Ví dụ: Bật cho [Cấp OneHub], Chế độ ẩn cho toàn công ty
  → OneHub bật, mọi phòng ban ở chế độ ẩn.
- Cột T3: bốn cột chế độ ẩn + `nac`, `maLoai`, `hienLuc` của đề xuất → diễn được ví dụ trên;
  đọc được tỷ lệ câu bị bộ kiểm bỏ trên OKR thật; thêm Cổng 1.5.
- Cột T2: một nấc cho cả việc (nới giá trị cột cũ) → không diễn được ví dụ (chọn OneHub bật
  HOẶC mọi đơn vị ẩn); dòng bị loại không có chỗ ghi → tỷ lệ câu bị bỏ chỉ đo trong eval.
- AC liên quan: AC-9, AC-10, AC-13.

### duong-che-do-an

- Loại hình: luồng ngang năm bước, ba chốt chặn rẽ xuống «không chạy».
- Bước: người sửa được lưu Mục tiêu/KR ở đơn vị chế độ ẩn → chữ có đổi (tên, vì sao lúc
  này, tên KR)? không → dừng → cùng băm đầu vào hoặc đã có lượt ẩn trong 30 phút? có →
  dừng → đã đủ 40 lượt ẩn hôm nay hoặc chạm trần tháng $9? có → dừng → xếp một việc
  góp ý chế độ ẩn → trợ lý soạn, bộ kiểm ghi dòng qua kiểm và dòng bị loại → chỉ quản trị
  đọc ở Cài đặt › Chương trình OKR, thẻ «Góp ý của Trợ lý OKR»; người dùng không thấy gì.
- Nhãn phụ: tiền của lượt ẩn vào sổ chi phí và trần tháng.
- AC liên quan: AC-10, AC-13.
