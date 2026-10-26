# Hình tại điểm quyết định — gom-tin-hieu-tu-chay

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 khoá mô hình và gửi tín hiệu ra nhà cung cấp | dưới ngưỡng: 2 lối, không luồng | — |
| Hỏi-2 nghĩa của phủ quyết và vòng đời đề xuất | 4 trạng thái, 3 nhánh rẽ | vong-doi-de-xuat |
| Hỏi-3 đồng hồ bắt đầu ở đâu | 3 bước nối tiếp (gửi → hàng chờ → onehub → PR gom) | vong-doi-de-xuat (dải thời gian) |
| Hỏi-4 bộ chạy ở crm hay ở kit | dưới ngưỡng: 2 lối, không luồng | — |
| Hỏi-5 PR có sửa của người thì làm gì | 7 bước nối tiếp, 4 nhánh rẽ ở bước xét PR | luot-lich-gom |

## Đề bài

### luot-lich-gom — loại: flowchart

- Nút: Đọc tín hiệu chưa có chỗ → (không có) Dừng, không gọi mô hình · (có) Tính dấu tập → Xét PR đề xuất đang có.
- Rẽ ở «Xét PR»: mở có sửa của người → Đứng yên (đánh dấu «Hỏi-5»); mở của máy cùng dấu → Dừng; đóng không gộp cùng
  dấu → Dừng, đã bị phủ quyết; còn lại → Gọi phiên gom.
- Gọi phiên gom → Hậu kiểm (răng phủ · kiểm câu · răng cắt lượt · vùng tệp) → (đỏ) Đỏ, không giao · (xanh) Đẩy nhánh →
  Mở PR nháp hoặc sửa thân PR của máy. Không có nút «gộp».
- AC: AC-1…AC-7.

### vong-doi-de-xuat — loại: state machine + dải thời gian

- Trạng thái: Mở (của máy) · Mở (có sửa của người) · Gộp · Đóng không gộp (phủ quyết).
- Cạnh: máy dựng lại khi có tín hiệu mới (Mở máy → Mở máy); chủ kho commit (Mở máy → Mở người); chủ nhóm gộp (→ Gộp);
  chủ kho đóng (→ Đóng); có tín hiệu mới sau phủ quyết → đề xuất MỚI (Đóng → Mở máy, PR khác).
- Dải dưới: gửi tín hiệu → lên nhánh hàng chờ (lịch kéo) → lên onehub (PR kéo về gộp) → PR gom mở; vạch «đồng hồ bắt
  đầu ở đây (Hỏi-3)» ở lúc lên onehub.
- AC: AC-5, AC-6, AC-8.
