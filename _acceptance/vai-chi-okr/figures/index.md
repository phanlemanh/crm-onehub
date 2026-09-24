# Hình tại điểm quyết định — vai-chi-okr (Cổng Phạm vi)

Kê từ artifact cuối S1: sổ quyết định chờ seal (10 dòng), ba dòng `[GIẢ ĐỊNH]` trong Coverage, ngưỡng còn tiền tố đề xuất trong hồ sơ cơ hội. Ngưỡng N5: từ ba bước nối tiếp hoặc từ hai nhánh rẽ → cần hình.

| Điểm | Đếm | Hình |
|---|---|---|
| Khai phạm vi bằng lớp middleware kế thừa, chặn mặc định (d-1) + trợ lý AI hai ổ khoá (d-6) | 5 cửa vào · chuỗi phiên → tư cách → phạm vi → đi/chặn (4 bước) · 2 nhánh kết | cần hình → `nam-cua-mot-o-khoa` |
| Luật vai → phạm vi sống ở `@crm/validation` (d-2) | 1 nhánh (ở đâu) | dưới ngưỡng: 1 nhánh |
| Xếp google/microsoft/tracking/slack/agents/conversations vào đối tác (d-3) | 1 nhánh (đối tác hay chung) | dưới ngưỡng: 1 nhánh — bảng khai trong design doc |
| Vai chỉ OKR đọc tổ chức (d-4, giả định 1) | 1 nhánh | dưới ngưỡng: 1 nhánh |
| Tường hộp thư không áp cho vai này (d-5) | 1 nhánh | dưới ngưỡng: 1 nhánh |
| Đường dẫn của vai chỉ OKR đi đâu: đi tiếp · ngoài phạm vi · về Thông báo của bạn (mục 4 design doc) | 3 nhánh kết | cần hình → `duong-dan-theo-vai` |
| Bỏ design-pass (d-7) | 1 nhánh | dưới ngưỡng: 1 nhánh |
| Ba quyết định bỏ còn lại (d-8, d-9, d-10) | mỗi cái 1 nhánh | dưới ngưỡng |
| Giả định 2, 3 (khoá API cho vai này; settings/currency/users/workspace là chung) | mỗi cái 1 nhánh | dưới ngưỡng: bảng trên thẻ |
| Ngưỡng đề xuất vế đăng nhập (≥ 90 %) | 1 nhánh (giữ/bỏ) | dưới ngưỡng |

## Đề bài hình 1 — `nam-cua-mot-o-khoa`

- Loại hình: luồng (flow), trái → phải.
- Nút: «Người mang vai chỉ OKR» → năm cửa: «Màn (proxy)», «tRPC bằng phiên», «Cầu REST», «Khoá API», «Trợ lý AI (đường nối)»; ba cửa giữa hội tụ vào một ổ khoá «Lớp kiểm chung: có phiên? → còn là thành viên? → router khai phạm vi nào? → vai đọc được không?»; kết «Đi tiếp» (phạm vi chung · tổ chức · OKR) và «Từ chối: KHONG_TRONG_PHAM_VI» (phạm vi đối tác · router chưa khai); cửa «Màn» rẽ riêng qua «Proxy hỏi workspace.get → vai okr?» → «Trang ngoài phạm vi»; cửa «Trợ lý AI» qua «Đường nối: 403, không đúc token» rồi thêm ổ khoá thứ hai «Kênh của trợ lý AI đọc dòng thành viên → từ chối».
- Nhãn bằng chữ cho người; tên hằng/hàm xuống chú thích nhỏ.
- AC liên quan: AC-1, AC-2, AC-4, AC-5, AC-6.

## Đề bài hình 2 — `duong-dan-theo-vai`

- Loại hình: cây quyết định nhỏ.
- Gốc: «Vai chỉ OKR gõ một đường dẫn»; nhánh: «khu đối tác hoặc mục Cài đặt của quản trị» → «Trang ngoài phạm vi (có liên kết về Tổng quan)»; «/settings trần» → «Thông báo của bạn»; «Tổng quan · Thông báo của bạn · Khoá API · Ngoài phạm vi» → «Đi tiếp»; chú thích: vai khác luôn đi tiếp.
- AC liên quan: AC-5, AC-9.
