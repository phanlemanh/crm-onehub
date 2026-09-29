# Hình tại điểm quyết định — giai-doan-thoa-thuan

Kê từ artifact cuối S1: 9 dòng sổ quyết định chờ seal, 2 dòng `[GIẢ ĐỊNH]` trong
Coverage, 0 finding gap-probe đẩy `human-gate1`, 0 chỗ design lệch spec gốc.

| Điểm | Đếm | Hình |
|---|---|---|
| Cách A — bảng + khoá ngoại, migration giữ id cũ (d-…-1, d-…-2) | 4 bước nối tiếp | cần hình: `migration-giu-id` |
| Xoá giai đoạn còn thoả thuận → chuyển cùng loại (d-…-4) | 3 nhánh rẽ | cần hình: `xoa-giai-doan` |
| Ba loại, tỷ lệ chốt tính Unqualified (d-…-3) | 1 bước | dưới ngưỡng: 1 |
| Một bộ chung / không đổi loại / không màu tự chọn (d-…-5, d-…-6) | 0 bước | dưới ngưỡng: 0 |
| Sửa import test sang GIAI_DOAN_GOC, ghim lại ở S5 (d-…-7) | 2 bước | dưới ngưỡng: 2 |
| Timeline nhận nhãn từ API (d-…-8) | 2 bước | dưới ngưỡng: 2 |
| design-pass static-frame, nac-1 (d-…-9) | 0 bước | dưới ngưỡng: 0 |
| [GIẢ ĐỊNH] hai quản trị viên sửa cùng lúc | 1 nhánh | dưới ngưỡng: 1 |
| [GIẢ ĐỊNH] trần 20 giai đoạn, 40 ký tự | 0 | dưới ngưỡng: 0 |

## Đề bài

### migration-giu-id
- Loại hình: flowchart ngang, 4 nút nối tiếp + 1 hộp «giữ nguyên» bên dưới.
- Nút: «enum DealStage (7 chuỗi)» → «tạo bảng DealStage, chèn 7 dòng id = chuỗi cũ» → «Deal.stage đổi kiểu text, đổi tên stageId, gắn khoá ngoại» → «xoá kiểu enum cũ».
- Hộp giữ nguyên (mũi tên chấm từ bước 2): «Activity.meta {from,to} · telemetry deals_by_stage · răng đo hồ sơ khác — vẫn trỏ đúng, không viết lại hàng nào».
- Nhãn loại cạnh 7 dòng: 4 Đang mở · 1 Chốt được · 2 Không thành.
- AC liên quan: AC-1, AC-14.

### xoa-giai-doan
- Loại hình: flowchart có rẽ nhánh.
- Vào: «Quản trị bấm Xoá trên giai đoạn S». Rẽ 1: «là giai đoạn sống cuối của loại?» → có: «Xoá bị khoá, nói lý do» (AC-7).
- Rẽ 2: «S còn N thoả thuận (gồm đã lưu trữ)?» → không: «Hỏi lại → đặt archivedAt» (AC-5).
- → có: «Hộp thoại "Còn N" + chọn đích cùng loại» → «một transaction: chuyển N thoả thuận (mỗi cái 1 dòng lịch sử, 1 sự kiện), closedAt giữ nguyên, rồi đặt archivedAt cho S» (AC-6).
- Rẽ 3 từ transaction: «lỗi giữa chừng» → «không gì đổi, không sự kiện».
- AC liên quan: AC-5, AC-6, AC-7.
