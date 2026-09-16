# Điểm quyết định — man-xin-quyen-co-rang

Máy kê từ artifact cuối S1. Ngưỡng N5: từ ba bước nối tiếp, hoặc từ hai nhánh rẽ.

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Đường đi của một phép đo: gieo trạng thái → dựng màn thật → khẳng định → chiều đỏ trên bản sao ở CONG_SAO | 4 bước nối tiếp + 3 nhánh nhà cung cấp × 2 thứ tiếng | **cần hình** — `duong-mot-phep-do` |
| Thước riêng vs rút danh sách đường chung (sổ mục 1 và 6) | 2 nhánh rẽ | dưới ngưỡng: 2 |
| Gieo trạng thái thật vs đo component (sổ mục 2) | 2 nhánh rẽ | dưới ngưỡng: 2 |
| Ba mục cố ý bỏ: design-pass, đặc-tả-UX, kỹ năng chuẩn UI (sổ mục 3, 4, 5) | 1 nhánh mỗi mục | dưới ngưỡng: 1 |
| Hai dòng `[NGÀNH]` trong Coverage chờ người gạch | 0 bước | dưới ngưỡng: 0 |

## Đề bài hình `duong-mot-phep-do`

- Loại: sơ đồ luồng (flowchart), một chiều từ trên xuống.
- Nút: `gieo trạng thái thiếu quyền` · `màn dựng thật (3 nhánh: chỉ-Google, chỉ-Microsoft, cả-hai)` · `khẳng định quan hệ ba vế` · `chiều đỏ: đột biến trên BẢN SAO ở CONG_SAO` · `chotMayChu() chốt đúng cây` · nhánh hỏng `TỪ CHỐI ĐO — thoát mã 2`.
- Nhãn bằng chữ, tiếng Việt, không viết tắt.
- Phải thấy rõ hai điều: (1) nhánh chỉ-Microsoft dừng ở lớp kho chuỗi, không đi tiếp tới «màn dựng thật»; (2) chiều đỏ đi qua BẢN SAO chứ không qua checkout chính.
- AC liên quan: AC-1, AC-2, AC-9, AC-10.
