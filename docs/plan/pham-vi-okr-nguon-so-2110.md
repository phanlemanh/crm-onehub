# Bản phạm vi — nguồn số tự cập nhật của KR (21/10)

Nguồn: hồ sơ `docs/findings/2026-10-20-tability-nguon-du-lieu-kr.md` (mục 4–6), PR #520. Chủ kho chốt
21/10: tính năng thiết kế kiểu SaaS — sẵn sàng cho nhiều tình huống và nhiều loại người dùng.

<!-- <<<PHAM-VI-MA -->
```
dot: okr-nguon-so-2110
dang: chuoi
nguon: docs/findings/2026-10-20-tability-nguon-du-lieu-kr.md

- `S1` — Google Sheets lấy số theo ô cố định, giá trị cuối hàng hoặc cuối cột; chọn trang từ danh sách; xem trước nói ô đã đọc
- `S2` — mỗi workspace một địa chỉ đọc Google riêng, không đọc vòng qua quyền chia sẻ
- `W1` — webhook vào: đường dẫn riêng từng KR cho hệ thống không có tài khoản, có thu hồi và lệnh mẫu
- `W2` — ghi cộng dồn có mã chống lặp, ghi lùi ngày, mã lỗi máy đọc được, cho cả API và webhook vào
- `D1` — chọn nhịp đọc ngày hoặc tuần, dòng «đọc lần cuối» và lỗi đọc thấy được ngoài hộp thoại
- `W3` — webhook ra: đăng ký, gửi thử, ký chữ ký, thử lại, treo khi hỏng, chặn địa chỉ nội bộ
- `G1` — kết nối Google cá nhân bằng Picker cho tệp không chia sẻ được cho địa chỉ đọc
- `K1` — chỉ số dài hạn ngoài chu kỳ OKR dùng chung cơ chế nguồn số
- `N1` — nguồn dựng sẵn ngoài CRM (HubSpot, SQL, BI)
```
<!-- PHAM-VI-MA>>> -->
