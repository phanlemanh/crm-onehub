---
slug: sua-bom-gio-test-api
at: 2026-11-20T09:36:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | d-2 ghi nguồn muc-tieu bằng câu trích của hồ sơ khác (tom-tat-tuan-dang-cho) — câu ấy không quyết gì cho gop-y-dung-cho và không loại lối chụp rồi trả lại | Người ký tưởng đã có lời chọn sẵn «xoá hàng tương lai», trong khi xoá đụng bảng của các tệp chạy sau | Dòng sổ mới supersedes d-2, nguồn mot-loi nêu ràng buộc, hoặc thành Hỏi | fixed: đổi sang chụp rồi trả lại; d-20261120T093823Z-7 supersedes d-2, nguồn mot-loi (chỉ xoá đổi bảng mà tệp sau thấy, trái AC-1/AC-5) |
| P0 | design | d-4 nói đề bài cấm đổi sản phẩm mà không artifact nào trích câu cấm; sửa test hay sửa sản phẩm là lựa chọn của người | Cổng Phạm vi duyệt AC-3 vì tin đề bài đã cấm, chỗ đọc cấu hình bất nhất của sản phẩm bị bỏ qua không ai ký | Dòng mới supersedes d-4, trích câu cấm hoặc thành Hỏi | human-gate1: d-20261120T093823Z-9 (Hỏi-1, chi-nguoi) supersedes d-4; khuyến nghị sửa mã kiểm, sản phẩm thành hàng riêng nếu muốn |
| P1 | evals | Rủi ro lần ghi chương trình thứ hai sinh việc okr-kiem-san-sang vô chủ không có thước; lối «dời» chết dựa trên chữ «có thể» | Lần ghi thứ hai sinh việc ngày ghim ngoài bước dọn, E1–E5 vẫn xanh | Eval đếm việc máy chưa xong sau suite; đo lối dời | fixed: AC-5 + E6 dùng lại thước vvc_ca_goi_api của #616; đo 20/11 Prisma điền createdAt bằng đồng hồ JS — ghi vào Notes và d-20261120T093823Z-8 |
| P1 | contract | AC-3/E4 cho đổi mọi tệp apps/api/test/**; E1 không ghim pass/skip | Bản vá làm đỏ tệp thứ ba rồi thêm skip ở đó, E1/E4/E5 vẫn xanh | Thu AC-3/E4 về đúng hai tệp; E1 ghim pass ≥ 2168 và skip bằng nền | fixed: CHO_PHEP của pham-vi.mjs chỉ còn hai tệp (chiều đỏ với tro-ly-okr-san.ts đã chạy); AC-1/E1 ghim pass ≥ 2168 và 18 skip |
| P2 | evals | hang-sot.ts cấy hàng bằng db.create chứ không qua okr.setProgram | Hàng giả khác hàng thật nên E2 xanh vì bài không đọc tới nó | Cấy qua setProgram, khẳng định hình hàng | rejected: bảng okrProgramConfig không theo workspace và demGopYCho đọc hàng mới nhất toàn bảng; E3 trên 74a29a68 với hàng cấy đỏ đúng 8 tên mà trọn suite đỏ — hàng giả tái hiện đúng tập lỗi thật |
