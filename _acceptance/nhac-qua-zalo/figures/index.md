# Hình tại điểm quyết định — nhac-qua-zalo (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 Ghép bằng mã 6 số | 5 bước nối tiếp (bấm Nối → API sinh mã → người nhắn bot → agent poll → ghi liên kết + bot xác nhận) | `luong-noi-zalo` |
| d-…-2 Một kênh mỗi lượt + lệch kênh | 3 nhánh rẽ (ưu tiên) × 2 nhánh (dùng được) | `chon-kenh` |
| d-…-8 Một hàm kenhSeDungCua cho cả trang lẫn máy gửi | 4 bước (agent ghi appSetting → API đọc → trang báo; agent đọc → gửi) | `ai-goi-zalo` |
| d-…-3 Không cả hai / tắt / theo loại | dưới ngưỡng: 1 bước | — |
| d-…-4 Token trong .env | dưới ngưỡng: gộp vào `ai-goi-zalo` | — |
| d-…-5 Poll trên nhịp dispatch | dưới ngưỡng: gộp vào `luong-noi-zalo` | — |
| d-…-6 Không nhắn khách | dưới ngưỡng: 1 bước | — |
| d-…-7 ToggleGroup | dưới ngưỡng: 1 bước | — |
| d-…-9 design-pass nac-1 | dưới ngưỡng: 1 bước | — |
| [GIẢ ĐỊNH] ×3 trong Coverage | dưới ngưỡng: mỗi cái 1 câu hỏi có/không | — |

## Đề bài

### luong-noi-zalo (sơ đồ tuần tự)
Làn: Người (điện thoại + CRM) · App · API · DB · Agent (nhịp mỗi phút) · Zalo Bot.
Bước: bấm «Nối Zalo» → API xoá mã cũ, lưu băm mã mới 15 phút → App hiện «482 913» → người nhắn mã cho bot → agent gọi getUpdates (lặp có trần, bỏ message_id đã thấy) → băm + tìm mã → ghi ZaloLink, đánh dấu mã đã dùng → sendMessage «Đã nối với <tên>» → App tự làm mới thấy «Đã nối».
Nhánh phụ ghi chú: mã sai / hết hạn / đã dùng → câu hướng dẫn, +1 đếm sai; quá 5 lần/giờ → im lặng. AC-7, AC-8, AC-9, AC-11, AC-15.

### chon-kenh (cây quyết định)
Gốc: ưu tiên (Tự động / Zalo / Slack). Mỗi nhánh hỏi Zalo dùng được? Slack dùng được? Lá: gửi Zalo · gửi Slack · gửi Slack + lệch · gửi Zalo + lệch · không kênh (khong-slack/khong-khop). Chú: «Zalo dùng được» = bot bật (zaloBotName) + đã nối (+ token phía agent). AC-1, AC-4.

### ai-goi-zalo (kiến trúc)
Khối: App (2 trang) → tRPC → API (chỉ đọc/ghi hàng) → Postgres (ZaloLink, ZaloLinkCode, NotificationPreference, appSetting.zaloBotName/zaloPolledAt) ← Agent (đọc ZALO_BOT_TOKEN từ .env, gọi getMe/getUpdates/sendMessage) ↔ Zalo Bot API. Nhấn: API không có đường nào tới Zalo; hàm kenhSeDungCua (packages/db) được cả API lẫn Agent gọi. AC-4, AC-6, AC-13.
