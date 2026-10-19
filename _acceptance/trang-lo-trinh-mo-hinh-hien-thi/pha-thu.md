# Phá-thử S3 — 19/10

Mỗi dòng: sửa tạm một tệp vật thật (đã commit trước ở cd928af1e), chạy đúng lệnh của eval, thấy đỏ với thông điệp ghim,
hoàn lại bằng `git checkout`. Ca phá-thử nằm sẵn trong bài (E1 spec, E5, E6 spec) chạy ở mỗi lượt.

| Eval | Bản sao sửa gì | Lệnh | Mã | Thông điệp ghim |
|---|---|---|---|---|
| E1 | `moHinhCua` luôn đi luật cũ | `ltmh_viec_moc` (dom) | 1 | viec theo luat cu, khong theo viec_hien |
| E2 | bộ lọc mốc liệt mốc có `hang` khác rỗng | `ltmh_moc_hien` | 1 | moc hien false van hien |
| E2 | dòng số tự đếm việc chưa giao thay `con_lai` | `ltmh_moc_hien` | 1 | dong so moc khong theo con_lai |
| E3 | nhóm chưa hẹn mốc theo luật mốc đầu tiên | `ltmh_chua_hen` | 1 | nhom chua hen moc lech chua_hen_moc |
| E4 | dòng việc kiểu xem Mốc đọc `cau_giao` | `ltmh_ten` | 1 | ten viec khong theo ten_hien_thi: kieu xem moc |
| E4 | tìm kiếm bỏ tên hiển thị | `ltmh_ten` | 1 | tim khong ra theo ten hien thi |
| E6 | trang không gỡ cờ mô hình | `ltmh_khoi_cu` (dom) | 1 | [data-lo-trinh-canh-bao] toBeNull |
