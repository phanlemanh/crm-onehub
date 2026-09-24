# Hình tại điểm quyết định — cau-truc-to-chuc

| Điểm | Đếm | Hình |
|---|---|---|
| Quản lý trực tiếp suy từ đâu (AC-6, AC-8) | 4 bước nối tiếp (ghi đè → trưởng phòng ban chính → trưởng bộ phận → không có) + 2 nhánh bỏ qua (người đã rời, chính mình) | quan-ly-truc-tiep.html |
| Nhập hàng loạt: xem trước rồi ghi, lỗi cặp đánh hỏng cả cặp (d-…-4, d-…-10, AC-9, AC-10) | 3 bước (dán → xem trước → ghi) + 3 nhánh (hợp lệ · hỏng đơn · hỏng cặp) | nhap-hang-loat.html |
| Hình dạng dữ liệu: bộ phận, phòng ban, vị trí một người (d-…-1, AC-1, AC-4) | 4 bảng, 2 bảng mới nối vào bảng cũ — dưới ngưỡng bước, nhưng là nền của mọi AC | du-lieu.html |
| Người đã rời: lọc ở phép đọc, không sửa luồng gỡ thành viên (d-…-2) | dưới ngưỡng: 1 bước | — |
| Phòng ban quản lý ở Tổ chức, không ở Cài đặt Điều phối (d-…-3) | dưới ngưỡng: 1 bước | — |
| Cây ghép từ Collapsible, không cài @reui/tree (d-…-5) | dưới ngưỡng | — |
| Sơ đồ tổ chức và .xlsx ra ngoài lượt (d-…-6, d-…-7) | dưới ngưỡng | — |
| «Mục tiêu» → «Thời lượng» (d-…-8) | dưới ngưỡng | — |
| [GIẢ ĐỊNH] trưởng phòng ban phải thuộc phòng ban đó; trưởng bộ phận cũng cần phòng ban chính | dưới ngưỡng: 1 luật mỗi điểm | — |

## Đề bài: quan-ly-truc-tiep

- Loại hình: flowchart từ trên xuống
- Nút: «Người X» → «Có ghi đè, người đó còn trong workspace và khác X?» có → «Người được ghi đè» ; không → «Phòng ban chính có trưởng còn trong workspace, khác X?» có → «Trưởng phòng ban chính» ; không → «Bộ phận của phòng ban chính có trưởng còn trong workspace, khác X?» có → «Trưởng bộ phận» ; không → «Không có quản lý»
- Chú thích bên: «Đổi trưởng phòng ban là mọi người không ghi đè đổi quản lý theo — không lưu kết quả suy»
- AC liên quan: AC-6, AC-8

## Đề bài: nhap-hang-loat

- Loại hình: flowchart trái sang phải
- Nút: «Dán hoặc chọn tệp .csv» → «Xem trước (máy chủ phân tích, không ghi gì)» → rẽ ba: «Hợp lệ» ; «Hỏng đơn: email không phải thành viên · thiếu cột · phòng ban thuộc bộ phận khác · trưởng lạ» ; «Hỏng cặp: email lặp · phòng ban hai bộ phận · hai trưởng một đơn vị → MỌI dòng trong cặp hỏng» → «Nút: Ghi N dòng · bỏ M dòng hỏng (khoá khi N = 0)» → «Ghi: máy chủ phân tích lại CHỮ GỐC, một giao dịch, chỉ dòng hợp lệ» → «Cây cập nhật»
- Nhánh phụ: «> 1000 dòng → từ chối cả lô»
- AC liên quan: AC-9, AC-10

## Đề bài: du-lieu

- Loại hình: sơ đồ bảng (ô và mũi tên)
- Nút: «Bộ phận (mới): tên, thứ tự, trưởng, lưu trữ» ← «Phòng ban (có sẵn): + bộ phận (rỗng = chưa xếp), + trưởng» ← «Bước kế hoạch 30 ngày (có sẵn, không đổi)» ; «Vị trí một người (mới): một hàng một người — phòng ban chính, quản lý chọn tay» → Phòng ban ; «Phòng ban phụ (mới): nhiều hàng» → Phòng ban ; Thành viên → Vị trí một người
- Nhãn bằng chữ tiếng Việt, tên bảng thật trong ngoặc (Division, Department, OrgPlacement, OrgSecondaryDepartment, OnboardingStep)
- AC liên quan: AC-1, AC-4
