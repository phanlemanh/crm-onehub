---
slug: soan-okr-trang-rieng
at: 2026-10-07T13:41:30Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

# Phản biện context sạch — soan-okr-trang-rieng

Một tác tử mới, chỉ đọc design doc, contract, evals, sổ quyết định, bài học xuyên feature (`claim-scan`, 12 dòng)
và `opportunity.md`. Không đọc mã. Sửa xong không chạy lại (một lượt).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | AC-2 hứa cùng lúc mặc định 380 px, tối thiểu 300 px, tối đa nửa thân ở mọi khổ trên 640 px — chỉ đồng thời đúng khi thân ≥ 760 px; E2 chỉ đo ở 1440 | Ở 768 thân hẹp hơn 760 px, resizable ép ô hội thoại về 50% (dưới 380) mà E2 vẫn xanh; từ 641 tới ~660 px không cách cài nào đạt AC-2 | Chốt khi nào ràng buộc thắng hoặc dời ngưỡng hai ô; E2 thêm ma trận khổ viết trước, số dòng in = số ô | fixed: hai ô chỉ từ 1024 px (dưới đó hai tab), sửa AC-2, design doc, Coverage [GIẢ ĐỊNH]; E2 thêm ma trận rộng {1024, 1280, 1440} và hẹp {375, 768, 1023} |
| P1 | evals | Các bước E12b trái luật nhận nhóm của AC-6 (KR thiếu số không vào nhóm) và không có bước gõ số trước khi nhận nhóm [man-okr-truoc-r1#F1] | KR thiếu Đích vẫn chờ nên không vào «Còn thiếu»; bước bấm mục còn thiếu không có gì để bấm; đưa vào tạo 4 KR thay 5 → E12b đỏ dù AC-6 và AC-12 đều đúng | Kịch bản tất định gõ số rồi nhận nhóm, nhận lẻ KR thiếu; số mong đợi suy từ kịch bản | fixed: viết lại bước E12b theo kịch bản tất định, script in số dòng nhận/chờ/còn thiếu trước mỗi bước, số mong đợi suy từ kịch bản |
| P1 | evals | Ngưỡng CHẾT «một lần mất số» chỉ đo bằng DOM với sessionStorage giả; không có ui-check tải lại trang thật | Trang dựng ở máy chủ rồi hydrate: đọc sessionStorage lúc dựng → ô trống hoặc lỗi hydration sau F5, E11 vẫn xanh | Thêm phần đo trình duyệt thật: gõ, nộp lại, reload, đọc bốn ô, console 0 lỗi | fixed: thêm E11b (`man.mjs --phan so`) với chiều đỏ khoa-theo-id và doc-luc-dung; design doc ghi đọc sessionStorage chỉ sau khi gắn |
| P2 | evals | AC-5 hứa lời từ chối hiện tại dòng cho cả ba ca, nhưng hai ca ném ConflictException (không có lyDo) và E5 chỉ đo ca ok:false | Hoàn tác đúng lúc cuộc vừa đưa vào ở tab khác → lỗi tRPC không có khoá dịch, giao diện nuốt lỗi hay đẩy ra vùng chung; E5, E5b vẫn xanh | E5 thêm hai ô CONFLICT, đòi chữ trong [data-dong] | fixed: E5 thêm hai ô CONFLICT (12 ô), design doc ghi chữ lyDoQuyet.dongCu / cuocKhongDang chọn theo mã |
| P2 | evals | E15 thiếu ảnh 375 của đang soạn và đã quyết; E14 không nói tab nào mở ở khổ hẹp | Ở 375 tab mặc định là Trò chuyện → ảnh còn thiếu và có bản nháp chỉ thấy hội thoại; hội đồng không chấm được khổ hẹp | E14 cố định tab theo trạng thái và kiểm trước khi chụp; E15 thêm hai ảnh | fixed: E14 có bảng tab viết trước theo trạng thái, sai tab → mã 1; E15 nhận chín ảnh |
