---
slug: bam-kr-mo-chi-tiet-kr
at: 2026-10-24T05:12:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | contract | AC-6 và E6 chỉ cho đổi một cặp chữ, trong khi AC-5 và E5 đòi tám câu mới khác cặp đó (thêm «lần», viết thường, en đổi số nhiều) | Bài đã ký khẳng định «Tuần này chưa có Cập nhật tuần nào» được sửa đúng AC-5, E6 so với cặp duy nhất rồi in DOI LOGIC; nới luật thì một lần đổi logic cùng dòng lọt | Bảng cặp cũ→mới đầy đủ; AC-6 «mỗi khối diff là một phần tử của bảng cặp»; đối chứng dương một cặp qua, đối chứng âm cùng dòng đổi toBe→not.toBe ra DOI LOGIC | fixed: design doc mục Chữ là bảng cặp, S3 chép thành rang/cap-chu.json; AC-5 và AC-6 trỏ bảng; E6 đọc bảng, thêm đối chứng dương và chiều đỏ toBe→not.toBe |
| P1 | evals | E5 gọi là quét lớp nhưng chỉ đọc ba tệp chữ và bảng nhãn tin-nhac.ts, hẹp hơn ngưỡng SỐNG | Một tệp chữ khác hay chỗ ghép tin khác của agent còn «Cập nhật tuần»; E5 vẫn xanh | Lớp bằng khuôn đường dẫn; in số tệp khớp khuôn; đo cả tin nhắc thật do bộ ghép tin dựng | fixed: AC-5 và E5 phủ mọi tệp dưới apps/app/lib/messages/ và chữ trong mã apps/agent/agent/lib/ (trừ chi-dan-tom-tat.ts), in «quet: f tep, n chuoi», thêm tin nhắc thật loại okr-cap-nhat |
| P1 | contract | AC-2 dựa vào quan hệ id nút KR = id KR của backend mà không mang tag cross-layer; fixture tự đặt id | can-chinh.ts đổi id nút KR thành dạng ghép, UI mở kr:<id nút>, E2 vẫn xanh | Tag cross-layer; eval backend dựng cây thật và so với id KR trong CSDL; chiều đỏ thêm tiền tố | fixed: AC-2 mang (cross-layer); thêm E2b backend-effect trên CSDL thử, ghi fixture bkr-cay.json cho E2, chiều đỏ tiền tố id |
| P1 | contract | AC-1…AC-4 chỉ phủ bốn chỗ giám sát dò; luật 2 là «ở bất kỳ đâu»; lý do bỏ quét «chủ kho đã liệt sẵn» sai | Chỗ thứ năm hiện KR mà mở mục tiêu, bốn eval xanh, Cổng Bằng chứng duyệt | Quét lớp mọi chỗ gọi openRecord, phân loại nguồn, số ô bằng số chỗ gọi | fixed: thêm AC-7 và E7 quét lớp lúc chạy với bảng viết trước rang/cho-mo-ban-ghi.json; dòng sổ d-9 thay d-4 với căn cứ đúng |
| P1 | contract | Dòng d-3 (sửa bài kiểm và thước của bảy hồ sơ đã ký) do máy quyết nguồn mot-loi, trong khi đó là việc người quyết; ảnh chụp tin-nhac-truoc-tb1.json là dữ liệu lịch sử | Bảy dòng fix mang decided_by chủ kho mà chủ kho chưa thấy danh sách; sửa ảnh chụp xoá ca so tin trước TB1 | d-3 thành câu chỉ-người; thẻ Cổng 1 liệt tệp; dòng fix trích chữ duyệt Cổng 1; giữ ảnh chụp | fixed: dòng d-8 (chỉ-người, supersedes d-3) lên thẻ thành câu hỏi; AC-6 giữ ảnh chụp và E6 đỏ khi nó đổi; dòng fix trích chữ duyệt Cổng Phạm vi |
