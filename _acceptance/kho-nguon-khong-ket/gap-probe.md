---
slug: kho-nguon-khong-ket
at: 2026-10-04T08:35:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Trục C có 6 giá trị nhưng ma trận E2 chỉ có 4; thiếu `CAN_GO_TAY` và đã soạn (`DA_SOAN`) — mức đông nhất trên production; AC-2 và E8 cũng thiếu | Lưới viết `trangThai NOT IN ('CHO_SOAN','DANG_SOAN','LOI')` thì 8 ô E2 vẫn xanh, còn nhịp dispatch đầu sau triển khai lật mọi nguồn đã soạn về `LOI` | E2 lên 10 ô phủ đủ 6 giá trị; chiều đỏ lọc `NOT IN`; E8 gieo thêm `DA_SOAN`, `CAN_GO_TAY`; AC-2 nêu đủ năm mức giữ nguyên | fixed: AC-2 liệt đủ năm mức; E2 10 ô + chiều đỏ «đổi trạng thái nguồn đã soạn»; E8 thêm hai nguồn KHÔNG đếm, `toEqual` không khoá thừa |
| P1 | design | Ngưỡng 0 nguồn kẹt quá 30 phút mà không AC nào hứa nguồn rời `CHO_DOC` trong 30 phút; `DANG_SOAN` tính tuổi từ lúc tạo việc nên gồm cả thời gian chờ; `CHO_SOAN` ngoài phạm vi vẫn bị đếm | Tiến trình chết lặp lại, việc còn mở suốt các lượt lease → `dem-ket` ngày 10/11 đọc ra kẹt dù chạy đúng thiết kế; nguồn chờ 20 phút rồi soạn 15 phút bị đếm là `DANG_SOAN` kẹt | Ghi cận lease × số lượt + nhịp ≤ 30 phút và kiểm bằng hằng thật; `DANG_SOAN` tính từ `soanLuc`; `CHO_SOAN` in dòng riêng | fixed: design mục 2 ghi cận 3 × (6 + 1) = 21 phút; AC-2 hứa cận ≤ 30 phút, E2 kiểm bằng `DISPATCH.visible.leaseMs`, `MAX_ATTEMPTS`, `MOC_KET_MS`; AC-8/E8 tính `DANG_SOAN` từ `soanLuc` với ô đối chứng việc 60 phút + `soanLuc` 5 phút; `CHO_SOAN` vẫn đếm (ngưỡng đã ký tính nó), design mục 6 ghi rõ là dòng riêng |
| P2 | evals | Ca lỗi đã có (`khongTai`, `bamLech`, `can-go-tay`, `thieuQuyTac`) không được đo; `try` bọc tới hết có thể nuốt và ghi đè lý do | Một ca có sẵn ném hay bị `catch` bắt → thành câu «Chưa đọc được tệp», người nạp bấm Soạn lại mãi mà lý do đúng đã mất | E1 thêm 4 ô với kỳ vọng từ merge-base, mỗi ô khẳng định `lyDo` khác `docLoi`; chiều đỏ «nuốt nhánh thieuQuyTac» | fixed: E1 lên 7 ô (d)-(g); AC-1 hứa giữ lý do cũ; design mục 1 ghi `catch` chỉ nhận lỗi bị ném |
| P2 | evals | E1/E2 so `lyDo` với hằng của chính code, không ghim câu nguyên văn của AC | Đổi hằng thành câu khác vẫn xanh, người nạp thấy câu không có lối ra | So bằng chuỗi viết sẵn trong tệp kiểm; chiều đỏ sửa một chữ hằng | fixed: E1 và E2 so đúng hai câu của AC; chiều đỏ «lyDo lệch câu đã hứa» |
| P2 | contract | Cờ lỗi không tắt khi gõ lùi dưới 2 chữ hay khi đóng rồi mở hộp; AC-4/E4 không có hai ô này | Lượt «quy» lỗi, gõ lùi còn «q» → hộp vẫn hiện câu lỗi thay «Gõ ít nhất hai chữ.»; mở lại hộp còn câu lỗi cũ | AC-4 thêm hai vế, E4 thêm ô 6, 7 và chiều đỏ «câu lỗi đè gõ thêm» | fixed: AC-4 thêm hai vế; E4 lên 7 ô; design mục 4 tắt cờ mỗi lần chữ đổi và khi đóng hộp, xét độ dài trước cờ lỗi |
