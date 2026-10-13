# Hình tại điểm quyết định — them-buoc-bao-dung (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — AC-1 thay vế «mã lạ → BAD_REQUEST» của AC-6 `dieu-phoi-va` (d-20261013T004121Z-10, gap-probe P0 human-gate1) | 2 nhánh rẽ (thay · giữ), mỗi nhánh kéo hệ quả khác nhau lên hai hồ sơ | `hoi-1-thay-ac6.html` |
| d-4 — lỗi tải danh sách phòng ban trong form (ST-them-buoc-loi-phong-ban → thử lại → chọn) | 3 bước nối tiếp + 1 nhánh (nút «ở phòng ban khác») | `form-loi-phong-ban.html` |
| d-5 — quá hạn của bước so theo ngày VN ở trình duyệt | 2 nhánh rẽ (so ở trình duyệt · máy chủ gửi cờ) | `qua-han-mot-ngay.html` |
| d-1 — một hàm kiểm phòng ban | 1 lối, dưới ngưỡng: 1 | — |
| d-2 — chữ «phòng ban» | dưới ngưỡng: 0 | — |
| d-6 — bỏ design-pass | dưới ngưỡng: 1 | — |
| d-8, d-9 — bỏ đường-đo, để sau trạng thái đang tải/rỗng | dưới ngưỡng: 1 | — |
| d-11 — thước màn chặn mạng | dưới ngưỡng: 1 | — |

## Đề bài từng hình

### hoi-1-thay-ac6
- Loại: cây quyết định hai nhánh.
- Gốc: «AC-1 (Cổng Đáng 12/10): phòng ban không có thật → NOT_FOUND, cùng câu với org.*» đụng «AC-6 dieu-phoi-va (ký 09/10): mã lạ → BAD_REQUEST».
- Nhánh THAY (máy khuyên): sửa một khẳng định 400→404 trong `bo-phan-hong` · Notes ghi thay thế · E8 canh không sửa gì khác · ghim lại dieu-phoi-va.
- Nhánh GIỮ: addStep vẫn 400 «bộ phận» · E6b còn hai lỗi · AC-1 rút về tạo/sửa khuôn.
- AC liên quan: AC-1, AC-8.

### form-loi-phong-ban
- Loại: luồng màn (wireflow) theo bảng trạng thái của Đặc tả UX.
- Nút: «Thêm bước» → ST-them-buoc-loi-phong-ban (VungTaiLoi thay ô chọn, nút Thêm khoá) → bấm thử lại → ST-them-buoc-thu-lai-xong (ô chọn phòng ban) → chọn, gõ, Thêm → bước hiện dưới phòng ban.
- Nhánh phụ: kế hoạch có bước → nút «Thêm bước ở phòng ban khác» vẫn hiện (ST-them-buoc-khac-loi-phong-ban) → cùng vùng lỗi.
- AC liên quan: AC-3, AC-4, AC-5.

### qua-han-mot-ngay
- Loại: so sánh hai dòng thời gian (VN và trình duyệt) quanh nửa đêm VN.
- Dòng VN: 23:55 ngày 12 | 00:05 ngày 13. Dòng Los Angeles (PDT, UTC−7): 09:55 | 10:05 ngày 12. Dòng Kiritimati: 06:55 | 07:05 ngày 13.
- Bước hạn 12: máy chủ «quá hạn» từ 00:05 VN; trình duyệt cũ ở LA nói «chưa» → dòng «và 1 … nữa» thừa. Bước hạn 12 lúc 23:55 VN: máy chủ «chưa»; trình duyệt cũ ở Kiritimati nói «quá hạn» → thiếu dòng «nữa».
- Sau sửa: cả hai phía so với ngày VN.
- AC liên quan: AC-6, AC-7, AC-9.
