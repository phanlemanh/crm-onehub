---
slug: cap-nhat-gan-day
at: 2026-10-26T14:22:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Phản biện context sạch — cap-nhat-gan-day

Một tác tử tươi đọc đúng sáu tệp: design doc, `contract.md`, `evals.yaml`, `decisions.jsonl`, bài học xuyên hồ sơ
(`claim-scan`, 10 dòng) và `opportunity.md`. Không đọc mã kho, không đọc hội thoại.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-9 trích câu CONTEXT.md về «Tôi dẫn» mà quyết luôn nghĩa «Đang theo dõi» theo bộ; lý do «số chip lệch trang Bộ OKR» không đứng vì hai trang đếm hai thứ | Trưởng P3 theo dõi một mục tiêu của P2, chip Đang theo dõi phồng lên với mục tiêu P2 không theo dõi; Cổng Phạm vi duyệt AC-4 như luật có sẵn | Tách d-9; Đang theo dõi trích đúng câu của CONTEXT.md hoặc thành Hỏi | fixed: d-20261026T140523Z-19 (Tôi dẫn) và d-20261026T140523Z-20 (Đang theo dõi) thay d-9; d-…-20 trích đúng câu CONTEXT.md «**Đang theo dõi** là các bộ có ít nhất một mục tiêu» — định nghĩa chủ kho chốt 24/10 cho mọi màn của khu, câu ngay trước nêu tên Cập nhật gần đây; bỏ lý do số chip |
| P0 | contract | Mục Out of scope «thông báo khi có người trả lời» không có dòng sổ; ai nhận lần trả lời là nghĩa sản phẩm; ba mục Out of scope khác thiếu descope [chi-tiet-cong-ty-hai-cot#F3] | Người cập nhật không theo dõi mục tiêu và không được nhắc tên thì không biết có ai trả lời trước buổi họp | Một Hỏi về người nhận; thêm descope cho nháp, cấp dưới, sửa hay xoá | human-gate1: Hỏi-2 (d-20261026T140523Z-22), khuyến nghị tự nhắc tên người viết lần cập nhật qua đường nhắc tên sẵn có (hôm nay bình luận chỉ báo người được nhắc và người theo dõi, `packages/db/src/okr-nhac.ts`); AC-6, E8, E9 soạn theo khuyến nghị; d-…-4 thay bằng d-20261026T140523Z-21; thêm d-…-23, -24, -25 cho cấp dưới, sửa hay xoá, nháp |
| P1 | contract | Hỏi-1 chờ chủ kho nhưng không AC nào ghi giá trị mặc định; E3 viết cứng phạm vi tat-ca | Chủ kho chọn Tôi dẫn mà không thước nào đổi theo; E3 so màn Tôi dẫn với API Tất cả | AC-5 ghi mặc định; E7 thêm dòng đường trần; E3 đọc chip đang sáng | fixed: AC-5 thêm vế đường trần → Tất cả (Hỏi-1, theo khuyến nghị); E7 dòng thứ sáu; E3 gọi API với phạm vi đọc từ chip đang sáng |
| P1 | evals | E4 chỉ có đối chứng dương ở Tất cả; khẳng định âm ở Đang theo dõi và Tôi dẫn đúng sẵn | Quên điều kiện quyền ở lần đếm theo-doi, chip lộ OKR giới hạn mà E4 vẫn xanh | Thêm cảnh người xem hẹp theo dõi mục tiêu mở cùng phòng ban, chiều đỏ riêng | fixed: E4 thêm cảnh ấy, khẳng định rows và số theo-doi bằng 1, chiều đỏ «chip Đang theo dõi lộ OKR giới hạn» |
| P1 | evals | Nối hai lớp của lần trả lời chưa đo trên chồng thật; ranh giới so createdAt bình luận với submittedAt phiên chưa rõ cùng đồng hồ | Bình luận lấy giờ cơ sở dữ liệu, cảnh của E8 phải chèn tay; trên phiên đo câu trả lời vừa gửi không hiện dưới dòng | E8 thêm tiền đề hai đồng hồ; bàn đo màn gửi trả lời thật | fixed: E8 thêm tiền đề — `addComment` và `guiCapNhat` đều nhận `now` ghim (hai khẳng định); E3 thêm bước gửi trả lời trên phiên đo, đếm lần trả lời tăng 1 không tải lại trang, pha thử CNG_PHA=khong-lam-moi |
