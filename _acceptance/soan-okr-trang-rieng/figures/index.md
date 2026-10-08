# Hình tại điểm quyết định — soan-okr-trang-rieng (Cổng Phạm vi)

Kê từ sổ quyết định chờ seal (10 dòng), Coverage `[GIẢ ĐỊNH]` (6 dòng), gap-probe (0 mục `human-gate1`).
Ngưỡng N5: từ ba bước nối tiếp hoặc từ hai nhánh rẽ → cần hình.

| Điểm | Đếm | Hình |
|---|---|---|
| Hoàn tác Mục tiêu kéo KR; nhận cả nhóm và hoàn tác nhóm (sổ: approach soanQuyet; GIẢ ĐỊNH hoàn tác kéo KR, KR mốc tính đủ số) | 4 trạng thái × 3 nhánh (nhận lẻ, nhận nhóm, bỏ qua) | `vong-doi-dong.html` |
| Khối ngữ cảnh: hỏi từ dòng và quyết trên bảng đi tới Kara rồi về lại hội thoại (sổ: approach khối chữ; descope hàng chưa gửi; GIẢ ĐỊNH nhận rồi hoàn tác rút khỏi hàng) | 5 bước nối tiếp | `khoi-ngu-canh.html` |
| Mốc nộp nối hai chiều (sổ: approach mốc từ nop_ban_nhap) | 4 bước nối tiếp, 2 chiều | `moc-hai-chieu.html` |
| Trang dưới okr/, ẩn đầu trang OKR (sổ: approach) | 1 bước | dưới ngưỡng: 1 |
| Hai ô từ 1024 px, dưới đó hai tab (sổ: approach; GIẢ ĐỊNH) | 2 nhánh nhưng là một ngưỡng số | dưới ngưỡng: 1 ngưỡng |
| Số đã gõ qua sessionStorage (sổ: approach; GIẢ ĐỊNH) | 1 bước | dưới ngưỡng: 1 |
| Mô hình giả cho phép đo màn (sổ: approach) | 1 bước | dưới ngưỡng: 1 |
| Design-pass nấc không đồng bộ; bỏ cảnh ngữ-cảnh (sổ) | 1 bước | dưới ngưỡng: 1 |
| Cỡ ô không lưu (GIẢ ĐỊNH) | 1 bước | dưới ngưỡng: 1 |

## Đề bài

### vong-doi-dong.html — vòng đời một dòng bản nháp

- Loại hình: sơ đồ trạng thái.
- Nút: «Chờ» · «Đã thêm» · «Đã sửa rồi thêm» · «Đã bỏ qua» · «Đã đưa vào» (cuối, không lùi).
- Nhãn cạnh: Thêm / Sửa rồi thêm / Bỏ qua / Hoàn tác (về Chờ) / Thêm cả nhóm (Mục tiêu + KR đủ số, một lần ghi) /
  Hoàn tác Mục tiêu kéo KR đã quyết về Chờ / Đưa vào (hết hoàn tác). Ghi chú: Kara đang soạn → mọi cạnh khoá.
- AC: AC-5, AC-6, AC-7, AC-12.

### khoi-ngu-canh.html — hỏi Kara từ dòng và quyết trên bảng

- Loại hình: sơ đồ tuần tự, ba làn: Người · Trang soạn · Kara.
- Bước: (1) người bấm «Hỏi Kara về dòng này» → chip trên ô soạn; (1') người thêm/bỏ qua trên bảng → hàng «Sẽ gửi kèm
  lượt sau»; (2) người gửi → trang ghép khối ngữ cảnh + chữ người thành một tin; (3) Kara đọc tin như chữ thường, trả
  lời, có thể nộp lại; (4) trang đọc lại tin: tách khối → chip trên bong bóng + dòng hệ thống trước bong bóng; (5) tải
  lại trang → vẫn tách được vì khối nằm trong tin.
- Ghi chú nhánh: hàng chưa gửi mất khi tải lại (descope); nhận rồi hoàn tác trước khi gửi → rút khỏi hàng.
- AC: AC-9, AC-10.

### moc-hai-chieu.html — mốc nộp nối hai chiều

- Loại hình: luồng hai cột (Hội thoại · Bản nháp) có mũi tên hai chiều.
- Bước: (1) Kara gọi nop_ban_nhap lần N với bản nháp đầy đủ; (2) trang so lần N với lần N−1 theo khoá → mốc
  «+1 KR · sửa 1 · chuyển 1 · bỏ 1»; (3) bấm mốc → bản nháp cuộn tới dòng đổi đầu tiên, dòng nổi; (4) bấm nhãn
  «vừa sửa» trên dòng → hội thoại cuộn về mốc mới nhất. Dòng vừa sửa hiện chữ cũ gạch.
- Ghi chú nhánh: đầu vào nộp hỏng → mốc «Kara nộp bản nháp» không số; dòng đã không còn → cuộn đầu bản nháp.
- AC: AC-8.
