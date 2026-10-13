---
slug: khung-man-chung
at: 2026-10-13T01:30:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Hai dòng sổ ghi nguồn một-lối mà lối bị loại vẫn sống: d-20261013T004304Z-4 (nhãn loại cố định phía trên hàng giữ chỗ không nhảy chữ) và d-20261013T004304Z-14 (vạch khung xương cỡ nút không nhảy, không lặp «Đang tải…») — máy đã tự thu hẹp câu giao | Bốn màn bản ghi lúc tải và chiến dịch lúc lỗi không có chữ nào cho biết đang ở đâu, trái docs/design.md; sáu nút «Thêm…» vẫn tắt không lý do; AC-5 và AC-12 vẫn xanh vì đã loại bốn màn | Đổi hai dòng thành lựa chọn người hoặc đổi artifact; nếu có nhãn loại thì AC-5 đòi innerText khác rỗng lúc tải và lúc lỗi | fixed: d-…-15 thay d-…-4 — breadcrumb trỏ danh sách cha dựng trong page.tsx ngoài Suspense (căn cứ câu «lúc chờ tải và lúc lỗi người dùng vẫn biết mình đang ở màn nào»), AC-5 và E5 đo breadcrumb, E12 đo chữ breadcrumb lúc tải; d-…-17 thay d-…-14 — sáu nút giữ chỗ thành vạch Skeleton cỡ nút, thêm AC-13 và E13 |
| P0 | contract | d-20261013T004304Z-8 hạ nút khung trống Onboarding xuống outline dựa trên câu «Only two things are filled», câu đó không quyết nút nào là lời mời chính — lựa chọn nghĩa sản phẩm do máy quyết | Chủ kho muốn giữ nút tô ở khung trống và hạ nút đầu trang thì E8 đỏ dù làm đúng ý người | Đưa thành câu hỏi ở Cổng Phạm vi với hai lối; viết lại AC-8 và E8 theo lựa chọn, giữ phép đếm một nút tô | human-gate1: d-…-16 thay d-…-8 thành Hỏi-3 (chi-nguoi, khuyến nghị giữ nút tô ở đầu trang); yêu cầu P4-3 đã gửi giám sát; AC-8 và E8 soạn theo khuyến nghị, viết lại nếu người chọn lối kia |
| P1 | evals | E12 không chụp hình danh-sach và chi-tiet lúc tải; ảnh tải xong chỉ có ở Liên hệ nên vế «cùng hình khi xong» không đo được ở các màn khác; «không nhảy khi tải xong» không có thước; câu (5) của E12j nói hai ảnh 375 mà inputs có ba | Hình chi-tiet đặt hàng tiêu đề sai cỡ hay hình danh-sach lệch danh sách Kết nối, màn nhảy khi tải xong mà E3, E12, E12j vẫn xanh | Thêm Kết nối và chi tiết chiến dịch lúc tải; mỗi màn chụp thêm lúc xong; so hộp bao hàng tiêu đề ≤ 4 px, vùng nội dung ≤ 8 px | fixed: E12 bước 1 chụp sáu màn đang tải và tải xong ở 1280 và 375, đo lệch hộp bao; AC-12 thêm hai ngưỡng; E12j inputs thêm năm cặp, câu (5) nêu đúng hai ảnh 375 |
| P1 | evals | AC-7 ở 1280 hứa quan hệ bố cục mà E7 chỉ đọc tên lớp, E12 chỉ đo 375, E12j không hỏi 1280 | Bỏ basis-full mà giữ lớp md:order, ở 1280 mô tả chen giữa tiêu đề và nút trên mọi màn; E7 và E12 vẫn xanh | E12 ở 1280 đo tâm y tiêu đề và nút ≤ 8 px, mô tả dưới tiêu đề; chiều đỏ bỏ basis-full ghim thông điệp | fixed: E12 đo quan hệ đầu trang ở 1280 trên mọi màn chụp, chiều đỏ «kmc-dau-trang: mo ta chen hang nut o 1280»; AC-12 thêm vế 1280 |
| P1 | evals | Ma trận 38 dòng của E3 chép tay từ bảng ghi theo thư mục; sổ trích «39 tệp» mà design và contract ghi 37; không phép đo nào đối chiếu với tập tệp thật | Hai tệp thiếu trong bảng: người làm hoặc đỏ E3 dù đúng, hoặc lách bằng PageShellFallback mà mọi eval xanh | Sinh fixture bằng git grep ở sha gốc, E3 khẳng định hai tập bằng nhau, ghi một con số và giải thích 39 | fixed: fixture sinh bằng rang/sinh-bang-hinh.mjs từ git grep ở 3a2783409; E3 khẳng định tập bằng nhau có chiều đỏ; AC-3 và design ghi 39 tệp grep = 37 tệp gọi + 2 tệp định nghĩa, cộng tai-lieu/page.tsx = 38 |
