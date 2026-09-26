# Hình tại Cổng Phạm vi — hoan-thien-hoi-crm-qua-zalo

| Điểm | Đếm | Hình |
| --- | --- | --- |
| d-1 chặn ghi trong công cụ, bản ghi đè chỉ còn lớp ẩn | 5 bước nối tiếp (tin Zalo → phiên eve → bộ giải `step.started` ẩn công cụ → model gọi công cụ → `execute` chặn) | cần hình: `chan-ghi.html` |
| d-2 tin không chữ trả `chiDocChu` | 5 nhánh rẽ trong `khongMa` | cần hình: `tin-den.html` |
| d-3 không làm Ngoài-3 | dưới ngưỡng: 0 bước | — |
| d-4 bỏ đặc-tả-UX | dưới ngưỡng: 0 bước | — |
| d-5 không chặn cứng `web_search` | dưới ngưỡng: 1 nhánh | — |
| [GIẢ ĐỊNH] tin tệp đi cùng đường sticker | dưới ngưỡng: 1 bước | — |
| [GIẢ ĐỊNH] «84.912.345.678» coi là số tiền | dưới ngưỡng: 2 bước | — |

## Đề bài `chan-ghi`

- Loại: luồng dọc, hai làn «hôm nay (production 26/09)» và «sau vòng này».
- Nút hôm nay: tin Zalo → phiên eve `purpose: zalo` → bước 1: bản ghi đè `session.started` còn → bước 2+: eve bỏ qua bản ghi đè («not registered») → công cụ ghi gốc trong tay model → không chặn.
- Nút sau vòng: tin Zalo → phiên eve → mỗi bước: bộ giải `step.started` ẩn 22 tên (`ghi` 20 ∪ `coSanChan` 2) (lớp ẩn, có thể hỏng) → nếu model vẫn gọi công cụ ghi → dòng đầu `execute`: `assertNotZaloQuestion` → từ chối `tuChoiGhi`, DB không đổi.
- Nhãn phụ: `web_fetch` bọc tĩnh cùng chặn; `web_search` chỉ có lớp ẩn.
- AC: AC-1, AC-2, AC-3, AC-4.

## Đề bài `tin-den`

- Loại: cây rẽ nhánh từ «tin Zalo tới `khongMa`».
- Nhánh theo thứ tự: chưa nối → `huongDan` · `xong n` → đánh dấu bước · đường luật cũ (không hỏi) → `daNoiRoi` · `mới` → bắt đầu lại · **không chữ / chữ toàn khoảng trắng → `chiDocChu` (mới), không phiên, không trần** · chữ → `hoiTacTu` (cổng vai, trần, phiên AI).
- Tô đậm nhánh mới.
- AC: AC-5.
