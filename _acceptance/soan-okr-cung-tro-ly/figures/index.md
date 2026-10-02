# Hình tại điểm quyết định — Cổng Phạm vi, soan-okr-cung-tro-ly

Kê từ artifact cuối S1 (sổ quyết định chờ seal, dòng [GIẢ ĐỊNH] trong Coverage, chỗ thiết
kế lệch lộ trình). Ngưỡng N5: từ ba bước nối tiếp hoặc hai nhánh rẽ → cần hình.

| Điểm | Đếm | Hình |
|---|---|---|
| d-1 Nền chat là app eve riêng, cửa mới, không nhập chéo gốc | 6 bước nối tiếp (người → app → cửa → app eve riêng → công cụ nộp → API) + 4 lớp chặn | cần hình → `nen-chat-va-bon-lop-chan` |
| d-2 Cuộc soạn lưu ở bảng riêng, dòng nháp vào sổ đề xuất | 2 nhánh (bảng riêng / cột trên bảng hội thoại CRM) | dưới ngưỡng ở nhánh, nhưng nằm trong hình d-1 (chỗ lưu) |
| d-3 Chế độ ẩn của việc soạn = chỉ quản trị mở được | 2 nhánh nghĩa | dưới ngưỡng: 2 — nói bằng chữ trên thẻ |
| d-4 Không thêm tab Trợ lý trên khung Mục tiêu | 2 nhánh điểm vào | dưới ngưỡng: 2 |
| d-5 Không đọc Hỏi ý (2b) | 1 nhánh | dưới ngưỡng: 1 |
| Vòng đời một cuộc soạn: mở → hỏi → trả lời → nháp → sửa/quyết → đưa vào (nháp) → công bố → lưu → đo | 9 bước, 3 lối rẽ (hết lượt, lỗi, bác) | cần hình → `vong-doi-cuoc-soan` |
| Thứ tự lớp trong gói và luật cắt khi vượt trần | 7 lớp nối tiếp, 3 bước cắt | cần hình → `goi-boi-canh-va-luat-cat` |
| [GIẢ ĐỊNH] trần 12 lượt / 3 cuộc / 20 nghìn ký tự / hệ số 2,6 / độ trễ | con số, không có nhánh | dưới ngưỡng: 0 |
| [GIẢ ĐỊNH] KR mốc không có đích số; đích trống theo luật createKeyResult | 2 nhánh | dưới ngưỡng: 2 — chốt ở S2 |

## Đề bài từng hình

### nen-chat-va-bon-lop-chan
- Loại: sơ đồ kiến trúc + đường đi (khối và mũi tên), một cột «vai chỉ OKR» đi qua bốn lớp chặn.
- Nút: Người sửa được đơn vị · Màn soạn (apps/app) · Cửa mới `/eve/agents/okr/eve/v1` · App eve riêng `apps/agent-okr` (chỉ một công cụ `nop_ban_nhap`, model ZDR) · API `okr.soan*` (OkrService) · Bảng `OkrCuocSoan` + `OkrDeXuat` · Kho tài liệu (trang «chiến lược») · Tác nhân CRM gốc `apps/agent` (mờ, có gạch chéo «vai chỉ OKR không vào»).
- Nhãn bốn lớp chặn: 1 cửa chỉ kiểm phạm vi OKR · 2 thẻ không mang id đối tác · 3 app không có công cụ đối tác · 4 API kiểm quyền lần cuối khi đưa vào.
- AC liên quan: AC-1, AC-5, AC-12.

### vong-doi-cuoc-soan
- Loại: sơ đồ trạng thái/luồng ngang, từ trái sang phải.
- Nút: Mở cuộc (kiểm nấc, trần cuộc) → Trợ lý mở đầu + 2–4 câu hỏi → Người trả lời → Bản nháp trên bảng → Nhận · Sửa · Bác / sửa qua chat (vòng) → «Đưa vào bộ OKR» (một giao dịch, trạng thái nháp) → Người điền đích, công bố → Cuộc lưu, kỳ sau đọc lại.
- Lối rẽ có nhãn: hết 12 lượt → đưa vào hoặc cuộc mới · lỗi/quá 45 s → Thử lại · bác Mục tiêu → bác cả KR con · dòng bị bộ kiểm loại → không hiện, Trợ lý nói một câu.
- AC liên quan: AC-6, AC-7, AC-8, AC-9.

### goi-boi-canh-va-luat-cat
- Loại: chồng lớp (layer stack) dọc, đầu gói ở trên; bên phải là thứ tự cắt khi vượt trần.
- Lớp từ trên xuống: Lời dặn tĩnh · Lớp 0+5 Hồ sơ công ty và Chiến lược (trang đang dùng) · Lớp 1+1n Đơn vị, mô tả, chức danh (không tên) · Lớp 2a Cấp trên đủ KR, ngang cấp chỉ tên, ứng viên Căn chỉnh · Lớp 3 Kỳ trước tóm gọn · Lớp 4 Số CRM (rỗng cho vai chỉ OKR) · Thang chấm, trần, từ cấm.
- Thứ tự cắt: 1 Lớp 3 (dòng tóm gọn rồi KR) → 2 ngang cấp → 3 KR cấp trên; khoá: lớp 0, 5, 1 không bao giờ cắt.
- AC liên quan: AC-2.
