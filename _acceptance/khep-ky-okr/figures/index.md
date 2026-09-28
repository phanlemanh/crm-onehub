# Hình tại điểm quyết định — khep-ky-okr

Kê từ artifact cuối S1: 12 dòng sổ quyết định chờ seal, 11 dòng `[GIẢ ĐỊNH]` ở Coverage,
0 phát hiện gap-probe đẩy cho người (cả năm đã sửa), một chỗ lệch lộ trình (hạng T3 thay
T2).

| Điểm | Đếm | Hình |
|---|---|---|
| Vòng đời pha chu kỳ: lập kế hoạch → đang chạy (trong/ngoài rà) → chấm điểm → đã đóng, mở lại về chấm điểm; hai cửa có điều kiện | 5 bước nối tiếp, 3 nhánh rẽ | cần hình: `vong-doi-pha` |
| Mang sang: KR nào đi, KR nào ở lại, khởi điểm mới | 4 bước, 2 nhánh rẽ | cần hình: `mang-sang` |
| Điểm gợi ý và cách làm tròn | 2 bước | dưới ngưỡng: bảng 20 ô trong E8 thay hình |
| Đổi đích trong / ngoài rà | 2 nhánh rẽ, 1 bước | nằm trong `vong-doi-pha` |
| Màn chấm hướng A / B | 2 nhánh | dưới ngưỡng: bản bấm được `/proto/khep-ky-okr` thay hình |
| Mười dòng giả định còn lại (người chấm, đơn vị điểm, xuất CSV, luật chất lượng…) | 1 bước mỗi dòng | dưới ngưỡng |

## Đề bài `vong-doi-pha`

- Loại: state machine.
- Nút: «Lập kế hoạch» · «Đang chạy» (trong nó hai trạng thái con: «trong rà giữa kỳ», «ngoài rà») · «Chấm điểm» · «Đã đóng».
- Cạnh có nhãn: Lập kế hoạch → Đang chạy «quản trị chuyển pha» · trong rà ↔ ngoài rà «quản trị mở / đóng rà; hết ngày» · Đang chạy → Chấm điểm «từ ngày sau ngày cuối VÀ mọi KR nguồn CRM có số ngày cuối — chốt số, máy gợi ý điểm» · Chấm điểm → Đã đóng «chỉ khi mọi KR đã chấm» · Đã đóng → Chấm điểm «mở lại: quản trị, có lý do, để vết; số chốt đứng yên».
- Ghi chú bên: «ngoài rà: đổi đích cần lý do, KR mang nhãn tới lúc chấm»; «Đã đóng: mọi ghi khoá; xuất CSV».
- AC: AC-3, AC-4, AC-5, AC-7.

## Đề bài `mang-sang`

- Loại: flowchart.
- Nút: «Mục tiêu đã công bố ở kỳ chấm/đã đóng» → «Có chu kỳ kế cùng loại, pha ghi được?» (không → «Từ chối: chưa có chu kỳ kế») → «Tạo mục tiêu nháp ở kỳ kế: cùng đơn vị, loại, người phụ trách, tên» → với mỗi KR: «Điểm = 1?» (có → «Không chép») → «Khởi điểm mới = số chốt hợp luật kiểu?» (không → «Không chép, liệt tên») → «Chép KR: khởi điểm = số chốt, đích giữ, nguồn tay».
- Ghi chú: «Mục tiêu gốc, KR và điểm không đổi; căn chỉnh không chép; hai phía nối nhau».
- AC: AC-8.
