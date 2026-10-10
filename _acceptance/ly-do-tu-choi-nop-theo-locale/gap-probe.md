---
slug: ly-do-tu-choi-nop-theo-locale
at: 2026-10-08T18:19:26Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Thiết kế bước 2 sửa schema ketQuaNop ở nop-ban-nhap.ts nhưng AC-8 và E8 chỉ cho config.ts đổi khối tuChoi; không chỗ nào cho phép đổi tệp chứa ketQuaNop | Làm đúng thiết kế thì E8 in ngoai-ranh-gioi cho nop-ban-nhap.ts; bỏ bước 2 thì vế «lyDo ngoài tập phải ném» của E5 đỏ | Thêm nop-ban-nhap.ts vào Then của AC-8 với luật dòng (chỉ lyDo của ketQuaNop và import) và chiều đỏ --diff-mau | fixed: nop-ban-nhap.ts vốn trong ranh giới hàng K2c (hang-viec.json) — AC-8 và E8 nay ghi rõ luật dòng (lyDo của ketQuaNop, hàm tuChoi, import) và chiều đỏ --diff-mau-nop |
| P1 | evals | E1, E2, E9 lấy câu mong đợi từ chính okrSoanMessages; E6 chỉ đo khoá, không ghim bảng câu duyệt và không đòi câu vi có dấu | Hai câu vi đổi chỗ, hoặc câu vi viết không dấu: mọi eval vẫn xanh | Chép bảng câu duyệt thành rang/cau-da-duyet.json; E1/E2/E9 so với tiền tố nối câu từ tệp; E6 so từng câu; E1 đòi câu vi có dấu; chiều đỏ đổi chỗ hai câu | fixed: thêm rang/cau-da-duyet.json (chép từ bảng của design doc, duyệt ở Cổng 1); E1/E2/E9 so với tệp, E1 đòi dấu, E6 so từng câu và có chiều đỏ 'cau sai cho ma' / 'thieu cau cho ma' |
| P1 | evals | Tệp mẫu ly-do-goc.json của E5 là bản chép tay, không kiểm khớp nguồn 577f23b2b; chiều đỏ chỉ sửa tệp mẫu | Thợ lỡ đổi một giá trị khi dời rồi chép tệp mẫu từ tập mới: E5 xanh, cuộc cũ mất lý do | gia-tri.mjs tự git show 577f23b2b, đòi tệp mẫu khớp nguồn; chiều đỏ trên bản sao sản phẩm | fixed: E5 bước (0) git show 577f23b2b đối chiếu tệp mẫu ('mau lech nguon'), gốc kho suy từ vị trí script; vết (e) của E7 đổi giá trị trong LY_DO_TU_CHOI_NOP phải đỏ 'gia tri doi'; tệp mẫu đã rút thẳng từ git object |
| P1 | evals | [soan-okr-khong-lac#F1]: E9 chỉ đọc màn trong lượt đang chạy, không tải lại — đường đọc transcript đã lưu chưa đo trên màn | Lúc chạy câu đúng; mở lại trang thì transcript lưu mang lớp bọc khác, bộ đọc trả null, dòng mất lý do mà không eval nào đỏ | Mỗi lượt E9 tải lại trang bằng điều hướng mới, đòi lại cùng dòng; ảnh sau tải lại | fixed: AC-9 và E9 thêm bước tải lại trang và ảnh -tai-lai; 6 ảnh thay 3 |
| P2 | evals | Vế «không làm gốc so sánh» của AC-3 và vế «thiếu một mã thì check-types đỏ» của AC-6 không có assert | Đổi luotNop lấy lần tu-choi làm gốc: E3 vẫn xanh; bản đồ khai Record<string,string>: check-types vẫn xanh | E3 thêm ca gốc so sánh; chiều đỏ tsc trên bản sao bỏ một khoá | fixed: E3 thêm ca da-ghi → tu-choi mã lạ → da-ghi, đòi chữ mốc hai là «+1 KR»; vết (d) của E7 bỏ một mã khỏi bản đồ vi và đòi tsc của apps/app đỏ |
