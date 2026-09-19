# Hình tại điểm quyết định — vao-bang-email-va-mat-khau

Kê từ vật cuối S1: 7 entry sổ quyết định chờ seal · 0 finding gap-probe xử lý
`human-gate1` (cả 5 đã vá) · 0 dòng `[GIẢ ĐỊNH]` trong Coverage · 1 finding
Nhóm 2 của design-pass cần người quyết.

| Điểm | Đếm | Hình |
|---|---|---|
| Vòng đời một chìa khoá: phát → đặt mật khẩu → đăng nhập, cộng nhánh quên và nhánh hết hạn | 3 bước nối tiếp + 3 nhánh rẽ | đã vẽ — `vong-doi-chia.html` + `.png` |
| Vì sao lớp `dark` giữa cây không đổi được nền (finding Nhóm 2, người quyết sửa tầng nền hay bỏ ý đồ) | 3 bước nối tiếp | đã vẽ — `token-dark.html` + `.png` |
| Chọn liên kết-một-lần thay mật khẩu tạm (d-…-1) | 2 nhánh | đã vẽ ở lượt Cổng Đáng, dùng lại, không vẽ lại |
| Tự đúc token thay vì gọi cửa requestPasswordReset (d-…-2) | 2 nhánh | đã vẽ — `duc-token.html` + `.png` |
| Loại plugin admin (d-…-3) | 2 nhánh, nhưng một nhánh đã chết vì trái quyết định nền | dưới ngưỡng: 1 nhánh sống |
| Không dựng trang tự đổi mật khẩu (d-…-4) | 1 nhánh, chủ kho đã cắt | dưới ngưỡng: 1 |
| Không báo người dùng khi mật khẩu đổi (d-…-5) | 1 nhánh, chặn bởi kho không gửi được thư | dưới ngưỡng: 1 |
| Giữ ô sàng mật khẩu đã lộ (d-…-6) | 1 nhánh, chủ kho đã giữ | dưới ngưỡng: 1 |
| Không đo chống dò mật khẩu hàng loạt (d-…-7) | 1 nhánh | dưới ngưỡng: 1 |

## Đề bài từng hình

### vong-doi-chia.html — sơ đồ luồng
- Ba chặng: quản trị phát liên kết · người dùng đặt mật khẩu · người dùng đăng nhập.
- Ba nhánh rẽ từ chặng đặt mật khẩu: chìa hết hạn → xin liên kết mới · chìa đã dùng → xin liên kết mới · mật khẩu yếu hoặc đã lộ → gõ lại.
- Một nhánh quay lại: quên mật khẩu → quản trị phát chìa thứ hai (AC-13), và chìa cũ chết.
- Nút ghi rõ nơi token sống: bảng `verification`, tiền tố `reset-password:`.
- Nhãn bằng chữ người đọc được; tên kỹ thuật xuống chú thích.

### token-dark.html — sơ đồ cơ chế, 3 bước
- Bước 1: `:root` khai `--background: var(--ds-background-200)` → giá trị được THAY tại gốc.
- Bước 2: giá trị đã thay di truyền xuống cây như một màu chết.
- Bước 3: `.dark` đặt giữa cây chỉ đổi `--ds-*`, không đổi `--background` đã thay xong.
- Kết: `auth-shell.tsx` mang `dark bg-background` vẫn ra nền sáng. Đo thật: `/sign-in` tông sáng → `lab(98.1%)`.
- Hai lối cho người quyết: khai lại token ngữ nghĩa trong khối `.dark` · bỏ ý đồ luôn-tối.

### duc-token.html — sơ đồ hai nhánh
- Nhánh A (đã chọn): thủ tục tự đúc token, ghi hàng `verification`, TRẢ liên kết đồng bộ. Giá: dính tiền tố định danh của thư viện.
- Nhánh B: gọi `requestPasswordReset`, liên kết chỉ tới hàm gọi lại, phải cất đâu đó cho quản trị đọc. Giá: đẻ thêm một bảng, cơ chế cất-rồi-lấy.
- Ghi rõ chỗ canh nhánh A: chiều đỏ của E3 phải đỏ khi tiền tố lệch.
