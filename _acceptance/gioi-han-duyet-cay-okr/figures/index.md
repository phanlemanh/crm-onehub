# Điểm quyết định — gioi-han-duyet-cay-okr (Cổng Đáng + Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Ai thấy mục tiêu giới hạn (d-1, d-2; giả định quản trị thấy hết) | 7 nhánh người | `ai-thay-gioi-han` |
| Bước duyệt: trạng thái và người duyệt theo cấp (d-3; giả định chờ duyệt khoá sửa) | 4 bước nối tiếp, 3 nhánh rẽ | `vong-duyet` |
| Tái cơ cấu: lưu trữ đơn vị còn OKR, chuyển OKR, mồ côi (d-5, d-6, d-7) | 4 bước nối tiếp, 3 nhánh | `tai-co-cau` |
| Cột trên bảng cũ thay vì bảng riêng (d-4) | dưới ngưỡng: 1 nhánh | — |
| Hai mức, không ba (d-1) | dưới ngưỡng: 2 lựa chọn đã so bằng chữ | — |
| design-pass không đồng bộ (d-8) | dưới ngưỡng: 1 bước | — |

## Đề bài

### ai-thay-gioi-han
- Loại: cây quyết định (một mục tiêu giới hạn ở giữa, bảy nhóm người quanh).
- Nút: «Mục tiêu giới hạn» → THẤY: quản trị · người phụ trách mục tiêu · người phụ trách KR · người làm việc dưới KR · người tham gia · người xem có tên · trưởng sửa được (trưởng phòng ban, trưởng bộ phận trên). KHÔNG THẤY: thành viên cùng phòng không liên quan · vai «chỉ OKR» không liên quan.
- Nhãn phụ: «vắng ở mọi đường đọc · 404 khi mở theo mã · không vào số gộp · không căn chỉnh».
- AC: AC-2, AC-3, AC-4.

### vong-duyet
- Loại: máy trạng thái.
- Nút: Nháp → (Gửi duyệt) → Chờ duyệt → (Duyệt và công bố) → Công bố; Chờ duyệt → (Trả lại + lý do) → Nháp; Chờ duyệt → (Rút lại) → Nháp; Nháp → (Công bố, khi người bấm là người duyệt hoặc ô tắt) → Công bố.
- Bảng nhỏ «người duyệt»: phòng ban → trưởng bộ phận · bộ phận → quản trị · cá nhân → trưởng phòng ban chính (trưởng bộ phận nếu chính người đó là trưởng) · không suy được → quản trị.
- AC: AC-6, AC-7, AC-8.

### tai-co-cau
- Loại: luồng.
- Nút: Quản trị bấm «Lưu trữ phòng ban» → còn mục tiêu ở kỳ chưa đóng? → Có: từ chối, nêu số + «Chuyển OKR…» → chọn đơn vị nhận cùng cấp → OKR đi sang (giữ KR, cập nhật tuần, căn chỉnh, vết) → Lưu trữ được. Không: lưu trữ như cũ. Nhánh phụ: «Xoá hẳn» đơn vị có lịch sử OKR → từ chối có câu (không 500).
- Khối bên: «OKR mồ côi» — ba lý do: đơn vị đã lưu trữ · không ai sửa được · người phụ trách đã rời → lối sửa: chuyển OKR · đặt trưởng · chuyển OKR của người rời.
- AC: AC-9, AC-10, AC-11.
