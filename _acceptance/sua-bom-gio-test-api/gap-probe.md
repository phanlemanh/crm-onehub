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

## Findings — mở lại sau S4 (20/11, phản biện lần hai: p0 0 · p1 4 · p2 1)

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Nhánh Hỏi-2 không nằm trong thước; E4 cho đổi okr.service.ts bao nhiêu dòng cũng được; AC-9/E13 viết như đã chọn (a) | Thợ sửa luôn demGopYCho mà E4 vẫn xanh; chủ kho chọn (b) thì E13 đỏ mà hợp đồng không có lối gỡ | E4 khoá tệp sản phẩm vào đúng một dòng sắp xếp; AC-9/E13 chỉ áp khi (a) | fixed: pham-vi.mjs đòi diff okr.service.ts rỗng hoặc đúng một dòng sắp xếp, chiều đỏ rang/mau/doi-san-pham-khac.patch đã chạy; AC-9 và E13 ghi chỉ áp khi (a) |
| P1 | evals | AC-6 hứa ketThucMau trả lại đúng hàng mà không eval nào đo quan hệ | Bước trả lại hỏng lặng lẽ, bảng cấu hình các tệp sau thấy đã khác mà E1/E6/E7 xanh | Đếm hàng sót sau khi chạy bài | fixed: ca tra-lai-hang-sot trong E7 — gop-y-dung-cho rồi soan-okr-so-do với hàng sót, dem-hang-sot đòi bom-gio-hang-sot=1; chiều đỏ đo bằng phá-thử một lần ở S3 |
| P1 | evals | AC-8 thiếu cặp cua-vao-va → vai-chi-okr | Chủ sở hữu thừa trên CI đến từ tệp khác, E11 xanh mà gan-vai vẫn đỏ | Thêm nhóm cặp tệp | rejected: đo 20/11 — cặp cua-vao-va → vai-chi-okr xanh ở nền (25 pass), bộ ba với thanh-vien-vao-dung và go-thanh-vien cũng xanh; không dựng được chiều đỏ trên máy, nên E14 trên CI là phép thử, ghi rõ ở Notes |
| P1 | evals | E14 cho thử lại một lần không cần số đo, và neo HEAD trong khi commit hồ sơ sinh sha mới | Lần đầu đỏ, chạy lại xanh, không có số đo; commit ghim lại làm E14 «CHUA CO» | Đòi tệp số đo khi có lần chạy lại; neo commit có lần chạy mà không đổi mã từ đó | fixed: ci-api.mjs đòi evidence/ci-chay-lai.md ghi id lần đầu, đi lùi từ HEAD tới commit gần nhất có lần chạy mà không đổi apps/ hay packages/ |
| P2 | evals | Bước thay tên gốc có thể rộng quá mà không thước nào bắt | Thay mọi trường ten, hồi quy sau này lọt | Đối chứng dương với trường khác | rejected: bản sửa chỉ thay chuỗi bằng đúng readTenGoc() ở hàng gốc (htmb) và unitName (bkr); mọi trường khác vẫn so từng byte với tệp mẫu không đổi (E5) |
