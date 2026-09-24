# Hình tại điểm quyết định — Cổng 1

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 giữ bot mới khi gọi thử hỏng (loại lùi về bot cũ) | 3 nhánh rẽ (hôm nay · giữ bot mới · lùi về bot cũ) | `nhanh-goi-thu-hong` |
| d-…-2 cờ «zalo-tu-choi» chặn nhịp ghi url | 4 bước nối tiếp (lưu hỏng → nhịp → nhịp → đăng ký lại được) | `vong-doi-co` |
| d-…-3 sửa hai ca goi-nguoc b, c đã ký | dưới ngưỡng: 1 bước | — |
| d-…-4 bỏ design-pass | dưới ngưỡng: 1 bước | — |
| d-…-5 không tự gỡ cảnh báo khi webhook đến | dưới ngưỡng: 1 bước | — |
| [GIẢ ĐỊNH] (1)(2)(3) | dưới ngưỡng: mỗi dòng 1 bước | — |

## Đề bài `nhanh-goi-thu-hong`

- Loại: sơ đồ luồng rẽ ba nhánh, cùng một điểm vào.
- Điểm vào: «Quản trị viên dán token mới T2 · Zalo nhận setWebhook · gọi thử hỏng».
- Nhánh «Hôm nay»: DB đã lưu T2 / Bot Mới → API báo lỗi → màn không tải lại → màn hiện Bot Cũ xanh (đỏ: nói sai).
- Nhánh «Giữ bot mới — máy khuyên»: DB lưu T2 / Bot Mới → API trả thành công kèm «zalo-tu-choi» → thông báo cảnh báo + tải lại → màn hiện Bot Mới + «Đăng ký lại» (xanh: nói đúng).
- Nhánh «Lùi về bot cũ — đã loại»: DB trả về T / Bot Cũ → nếu Zalo vừa cấp lại token cho CÙNG bot thì T đã chết → bot tắt mà màn vẫn xanh (đỏ). AC liên quan: AC-1, AC-2, AC-3, AC-6.

## Đề bài `vong-doi-co`

- Loại: máy trạng thái / dòng thời gian 4 bước của hai ô `zaloWebhookUrl` và `zaloWebhookLyDo`.
- Bước 1 «Lưu bot, gọi thử hỏng»: url null · cờ «zalo-tu-choi» · màn: cảnh báo.
- Bước 2 «Nhịp kiểm, Zalo trả url U2»: hôm nay → url U2, cảnh báo biến mất (đỏ); sau sửa → url null, cảnh báo còn.
- Bước 3 «Quản trị viên bấm Đăng ký lại, gọi thử được»: url = địa chỉ tác tử · cờ gỡ (null) · màn xanh.
- Bước 4 «Nhịp kiểm kế»: url U2 ghi như cũ. AC liên quan: AC-4, AC-5, AC-8.
