# Điểm quyết định tại Cổng Phạm vi — kê và đếm

Kê từ vật cuối S1, không hỏi người: 8 entry sổ quyết định chờ seal · 1 chỗ
thiết kế đi ngược một luật đã viết của kho · 0 dòng `[GIẢ ĐỊNH]` trong Coverage
· 0 finding gap-probe đẩy sang người (cả 5 đã vá) · 1 căng thẳng khai trong
Notes của hợp đồng.

Ngưỡng N5: từ ba bước nối tiếp hoặc từ hai nhánh rẽ trở lên thì cần hình.

| # | Điểm quyết định | Đếm | Hình |
|---|---|---|---|
| 1 | Kế hoạch treo vào đâu, cái gì bấm đồng hồ | 3 nhánh | F1 |
| 2 | Bước chép từ khuôn hay tham chiếu | 2 nhánh | F2 |
| 3 | Bốn bậc lưu bằng mốc ngày hay đúng/sai | 2 nhánh | F2 |
| 4 | Bộ phận nằm trên bước hay suy từ người được giao | 2 nhánh | F3 |
| 5 | `Activity.assigneeId` thêm cột hay bảng tự mang trường | 2 nhánh | F3 |
| 6 | Đường nối nền tảng đi xa tới đâu | 3 nhánh | F4 |
| 7 | E11 giữ `ui-check` hay đổi nhà sang `test` | 2 nhánh | F5 |
| 8 | Theo tiền lệ `ListingsController` hay theo tiêu đề `docs/api.md` | 2 nhánh | F5 |
| 9 | Bỏ cảnh ngữ-cảnh hay dựng vỏ ứng dụng giả | 2 nhánh | F5 |
| 10 | Danh mục thêm cột phân số bước | dưới ngưỡng: 1 | — |

## Đề bài từng hình

**F1 — Chỗ treo kế hoạch.** Ba nhánh từ một nút «Onboarding thuộc về cái gì»:
Công ty một bản · Công ty nhiều bản theo thời gian (đã chọn) · Thoả thuận hợp
tác. Nhánh đã chọn ghi rõ hệ quả «không đọc `DealStage`»; nhánh Thoả thuận ghi
«thừa kế enum chưa chốt nghĩa». Nhãn bằng chữ người, tên kỹ thuật trong ngoặc.

**F2 — Hai quyết định về cách lưu.** Trên: sửa nhãn trong khuôn → nhánh CHÉP
(kế hoạch đang chạy giữ nhãn cũ, đã chọn) vs nhánh THAM CHIẾU (kế hoạch đang
chạy đổi theo). Dưới: một bậc đã đạt → nhánh MỐC NGÀY (trả lời được «khi nào» và
«cách bậc trước bao lâu», đã chọn) vs nhánh ĐÚNG/SAI (chỉ trả lời «đã chưa»).

**F3 — Bộ phận và người được giao sống ở đâu.** Một bước CHƯA GIAO cho ai làm
tâm. Nhánh suy-từ-người: bước không thuộc bộ phận nào, biến mất khỏi bộ lọc — ghi
«đúng ca việc-rơi». Nhánh bộ-phận-trên-bước (đã chọn): bước vẫn tìm thấy được.
Kèm một nhánh phụ: trường sống trên bảng nghiệp vụ (nếp `CampaignTouch`) thay vì
thêm cột vào `Activity`.

**F4 — Đường nối nền tảng đi xa tới đâu.** Ba nhánh: A chỉ chuẩn bị chỗ (không
phép đo nào chứng được) · B viết schema và điểm nhận, kiểm thật, chưa có bên gửi
(đã chọn) · C nối thật trong vòng này (phụ thuộc đội ngoài vòng lặp). Mỗi nhánh
một câu đổi lại.

**F5 — Ba căng thẳng còn mở, người quyết.** Ba cặp nhánh nhỏ cạnh nhau, mỗi cặp
ghi rõ ngả máy khuyên: (a) E11 giữ `ui-check` — làn máy bỏ qua nên không có chốt
máy — hay đổi sang `test` để làn chạy nhưng mất lớp nhìn-thấy; (b) đi theo tiền
lệ `ListingsController` và sửa `docs/api.md`, hay theo tiêu đề đã viết; (c) khai
bỏ cảnh ngữ-cảnh, hay dựng một vỏ ứng dụng không tồn tại.
