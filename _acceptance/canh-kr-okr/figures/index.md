# Hình tại điểm quyết định — canh-kr-okr

Kê từ artifact cuối S1: bảy dòng sổ quyết định chờ seal, chín dòng `[GIẢ ĐỊNH]` ở
Coverage, không finding nào của phản biện đẩy sang cổng (cả năm đã sửa).

| Điểm | Đếm | Hình |
|---|---|---|
| d-1 chia mã 8a / 8b / 8c (sổ, Cổng Đáng) | 11 mã rẽ ba nhánh, đổi thứ tự làn B | chia-ma |
| d-2 chỗ đặt «cạnh KR»: khung xếp chồng / tab / dòng bung | ba nhánh rẽ | luong-khung-kr |
| d-4 sáng kiến không lộ dữ liệu đối tác | bốn đường vào × hai vai, qua một hàm | duong-doc-doi-tac |
| [GIẢ ĐỊNH] mẫu theo cấp và danh sách đơn vị; dùng mẫu tạo nháp | ba bước nối tiếp (soạn → lọc → tạo) | vong-doi-mau |
| d-3 bảng riêng thay cột mới | dưới ngưỡng: 1 bước | — |
| d-5 bằng chứng chỉ là đường dẫn | dưới ngưỡng: 1 bước | — |
| d-6 nhắc việc đến hạn sang 8b | dưới ngưỡng: 1 bước | — |
| d-7 chạy design-pass không đồng bộ | dưới ngưỡng: 1 bước | — |
| sáu `[GIẢ ĐỊNH]` còn lại (nghĩa mã, việc một tầng, tiến độ không đọc việc, bằng chứng tuỳ chọn, ghi nhận mọi pha, khung xếp chồng) | dưới ngưỡng: mỗi dòng 1 bước | — |

## Đề bài từng hình

### chia-ma
- Loại: bản đồ phân nhóm (swimlane hoặc nested) + dải thứ tự làn B.
- Nút: 11 mã với nghĩa ngắn — 8a: SK-01 Việc gắn KR, SK-02 Sáng kiến là chiến dịch/kế hoạch có sẵn, CI-05 Bằng chứng KR mốc, CI-06 Ghi nhận, MT-07 Mẫu OKR · 8c (mới): MT-06 Mức hiển thị giới hạn, QT-02 Bước duyệt nhẹ, TC-06 Tái cơ cấu không mồ côi · 8b: XEM-08 Lọc lưu được, XEM-09 Tìm OKR, NH-05 Bản tin Slack.
- Nhãn: 8a «thêm bảng — T3 — lượt này»; 8c «đổi quyền trên mọi đường đọc — T3»; 8b «đọc, lọc, gửi tin — cần hai chỗ lưu nên thành T3». Dải làn B: 8a → 8c → 7n (trước 14/12) → 10 → 8b.
- AC liên quan: toàn hợp đồng (phạm vi 8a).

### luong-khung-kr
- Loại: luồng màn (wireflow) có ba nhánh so sánh, nhánh A đánh dấu «máy khuyên».
- Nút: Khung mục tiêu › bảng KR (cột Việc «2/4») → A: khung KR xếp chồng, tab «Việc và sáng kiến» · «Bằng chứng» (chỉ KR mốc), đường dẫn record=kr; B: tab «Việc» thứ sáu ở khung mục tiêu; C: dòng KR bung tại chỗ.
- Nhãn đánh đổi: A được đường dẫn riêng, dùng khuôn khung số lượt 6; B thấy mọi việc một lần nhưng bằng chứng không có chỗ; C bung dòng trong bảng là vẽ tay, chật ở 390.
- AC liên quan: AC-10.

### duong-doc-doi-tac
- Loại: sơ đồ luồng dữ liệu.
- Nút: bảng okrViecKr (chỉ lưu mã chiến dịch/kế hoạch) → hàm lienKetChoVai → bốn đường ra: tRPC canhKr, cầu REST, khoá API, đọc vết (tab Vết). Hai vai: thành viên (tên + trạng thái đọc sống từ chiến dịch/kế hoạch), «chỉ OKR» ({loại, không có quyền} — không mã, không tên). Bộ chọn khi gắn: dùng thủ tục danh sách có sẵn của router đối tác, vai «chỉ OKR» không tới được.
- AC liên quan: AC-2, AC-3, AC-11.

### vong-doi-mau
- Loại: quy trình ba bước (process).
- Nút: 1 Quản trị soạn mẫu ở Cài đặt › Chương trình OKR (tên, cấp, đơn vị áp dụng — trống là mọi đơn vị cấp đó, câu mục tiêu, KR mẫu) → 2 Trưởng đơn vị mở «Đặt mục tiêu»: chỉ thấy mẫu còn sống hợp cấp và đơn vị → 3 Điền số, tạo bản nháp trong một giao dịch; mục tiêu nhớ mẫu nguồn (đường đo tỷ lệ dùng); sửa mẫu sau đó không đổi mục tiêu đã tạo.
- AC liên quan: AC-7, AC-8, AC-12.
