# Hình tại điểm quyết định — zalo-webhook-doc-khuon-that (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| d-2 bộ đọc webhook riêng, nhận hai khuôn | 3 nhánh rẽ (khuôn thật · có vỏ · hỏng) | cần hình → `duong-tin-webhook` |
| d-1 gỡ ca «c khong vo» của spec đã ký | 4 bước nối tiếp (gỡ ca → khoá đỏ trên nhánh → merge → mốc dời, khoá xanh) | cần hình → `khoa-spec-da-ky` |
| d-3 `thanWebhook` mặc định khuôn thật | dưới ngưỡng: 1 bước | — |
| d-4 … d-9 bỏ đặc-tả-UX, không sửa hồ sơ cũ, không chụp thân thật, không đổi getUpdates, ba việc ngoài lề, không đụng bot thật | dưới ngưỡng: 1 bước mỗi mục | — |
| [GIẢ ĐỊNH] trường bên trong `message` | dưới ngưỡng: 1 bước | — |
| [GIẢ ĐỊNH] cùng tin tới ở hai vỏ | dưới ngưỡng: 1 bước | — |

## Đề bài `duong-tin-webhook`

- Loại hình: flowchart ngang, hai làn «hôm nay» (trên) và «sau vòng này» (dưới).
- Nút hôm nay: Zalo POST thân `{event_name, message}` → khoá đúng → đọc bằng khuôn `getUpdates` (`{ok, result}`) → không khớp → log `sai khuon` + trả 200 → tin bị bỏ, không nối.
- Nút sau: cùng thân → `parseZaloWebhook` rẽ ba nhánh: khuôn thật `{event_name, message}` → `xuLyTinDen` (chống trùng `message_id`, luật mã) → nối + trả lời; khuôn có vỏ `{ok, result}` → cùng `xuLyTinDen`; hỏng → 200 + một dòng log `khoa` · `khoa_message` · `message_id`, không nội dung.
- Nhãn bằng chữ tiếng Việt, tên kỹ thuật giữ nguyên. Đánh dấu nhánh hôm nay là lỗi production 25/09.
- AC liên quan: AC-1 (hai khuôn nối), AC-2 (trùng qua hai khuôn), AC-3 (hỏng → log).

## Đề bài `khoa-spec-da-ky`

- Loại hình: timeline ngang bốn mốc.
- Mốc: (1) nhánh này gỡ ca «c khong vo» khỏi `webhook-bo-qua` (lời hứa AC-5 ý (3) của `zalo-qua-webhook` bị thay) → (2) thước khoá `nzm_giu_da_ky` so với `merge-base` → đỏ trên nhánh; E6 `giu-da-ky` thay chỗ, chỉ cho phép đúng biến đổi có tên → (3) merge vào `onehub` → (4) `merge-base` dời tới commit đã có bản sửa → `nzm_giu_da_ky` xanh lại; không hồ sơ cũ nào phải ghim lại.
- Nhãn bằng chữ. Làm nổi mốc (2) là cái giá chủ kho đã nhận (quyết định A).
- AC liên quan: AC-4.
