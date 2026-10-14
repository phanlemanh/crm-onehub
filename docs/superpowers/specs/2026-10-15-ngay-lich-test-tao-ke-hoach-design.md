# Bài kiểm tao-ke-hoach không chọn trùng ngày hôm nay — thiết kế

Hồ sơ `_acceptance/ngay-lich-test-tao-ke-hoach/`, hạng T2, chỉ đổi một tệp test. Giám sát r2 giao 14/10 (viec-phu P0-4).

## Bài toán

`ngayGiuaThangNay()` trong `apps/app/test/noi-bon-nut.dom.tsx` (đưa vào ở af7b204f1, hồ sơ va-lo-ro-vai-chi-okr) luôn
chọn ngày 15 của tháng hiện tại. Ngày 15, ô lịch của hôm nay giữ trạng thái khác nên bấm vào không đổi chữ trên nút, và
bài đỏ: «khong toi trang thai nut ngay hien 2026-10-15» (đường nền của thu-haiku-tro-ly-okr, 17:09Z 14/10 = 00:09 15/10
giờ VN). `test:dom` chạy với `TZ=Asia/Ho_Chi_Minh`, nên mọi lượt chạy suite app trọn ngày 15/10 giờ VN đều đỏ.

## Cách sửa

Chọn 16 khi hôm nay là 15, còn lại 15 — luôn khác hôm nay, luôn trong tháng. Không đổi mã sản phẩm.

## Đo

`rang/ba-ngay.mjs` ghim đồng hồ bằng `setSystemTime` (preload) ở ngày 14, 15, 16 giờ VN: bản sửa xanh cả ba; bản trước
vòng (rút nguyên văn từ c1864a3a2) đỏ ngày 15 với thông điệp ghim, xanh ngày 14. `--pham-vi` kiểm diff ngoài hồ sơ chỉ
có đúng tệp test.

## Đặc tả UX

Không chạm màn nào.
