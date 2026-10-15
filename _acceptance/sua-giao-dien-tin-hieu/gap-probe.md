---
slug: sua-giao-dien-tin-hieu
at: 2026-10-14T08:24:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

# Phản biện context sạch — sua-giao-dien-tin-hieu

Một tác tử tươi đọc sáu tệp (thiết kế, hợp đồng, bộ đo, sổ quyết định, bài học từ vòng trước, ô cơ hội), không đọc mã,
không đọc hội thoại.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Hợp đồng không có mục «Đường đo» cho ngưỡng đã ký; ô cơ hội gọi nút ⋮ 24×24 là lỗi «dưới mức chạm 44» mà sổ hạ xuống 36 không hỏi người [kanban-viec#F1] [chu-man-tieng-viet-khong-tran#F1] | Người rà sau gộp đọc U5 theo chữ ô cơ hội: 36 vẫn dưới 44 nên vòng «chết» từ thiết kế; Cổng Giá trị không biết ai rà, rà khổ nào | Mục Đường đo nối ngưỡng với thủ tục rà; câu 36/44 lên thẻ | fixed: thêm mục «Đường đo» (răng đo màn chạy với APP_URL production + rà bằng mắt, ghi ở phiên nghiệm thu; crm-1..5 thuộc lượt gom). human-gate1: câu «nút ⋮ 36×36 có tính là đã sửa U5 không» thành Hỏi trên thẻ, khuyến nghị 36 + 44 ở hàng TH7 |
| P1 | evals | E12 chỉ đo hộp ở 1280 trong khi AC-10 hứa hộp ở 375, 768, 1280 × vi/en | Hộp 375 tiếng Anh tràn chữ ở dòng lý do khoá hay «Sent from screen: Settings › Members», E12 vẫn xanh | Thêm ô hộp 375/768 × vi/en | fixed: E12 thêm bốn ô hop-<w>-<l> (375, 768 × vi, en) mở ở /settings/members với dòng lý do khoá hiện; ma trận 19 ô |
| P1 | evals | Lỗi 429/409 dựng bằng mock viết tay; E2 chỉ chạy TZ=Asia/Ho_Chi_Minh; không ô nào gửi quá trần qua máy chủ thật | Thành phần nhận diện 429 bằng một trường mock có mà lỗi tRPC thật không mang → production rơi về câu chung, nút không khoá, E2 vẫn xanh | Lỗi mock theo khuôn máy chủ; lượt TZ=UTC; một ô quá trần thật | fixed: E12 thêm ô qua-tran-that-en (gửi tranMoiNgay+1 qua thủ tục thật, kiểm câu tiếng Anh và nút khoá); E2 thêm lượt TZ=UTC cho ba ô khoá theo ngày; E5 dựng lỗi bằng TRPCClientError đúng khuôn máy chủ, cùng hàm với bài LT2. deferred: không gắn thẻ cross-layer — vòng không đổi máy chủ, hiệu ứng máy chủ (từ chối, không cất) đã do LT2 E3, E5 đo; 409 thật trên bản chạy không đo vì cần quản trị kéo về giữa lúc xoá |
| P1 | design | Sửa bài LT2 «ở các ô bị thay» không có thước giữ phần sửa trong bốn ô; quét ô thứ năm chỉ chạy eval máy | S3 nới ma trận 9 tổ hợp khi sửa ô E3b, E11 vẫn xanh; ảnh hay judgment của LT2 về cột «Màn» đỏ lúc ghim lại | Đếm khẳng định trước/sau; quét cả ui-check, judgment | fixed: E11c thêm dòng «số expect( của tin-hieu.dom.tsx ở HEAD ≥ ở merge-base» kèm chiều đỏ ghim; thiết kế đòi đọc lại kỳ vọng của E13, E14 (ui-check, judgment) của LT2 khi chốt danh sách ô bị thay |
| P2 | evals | Số khẳng định in ra không khớp ma trận (E5 «2 x 2», E8 bỏ mục Cài đặt) | S3 viết đúng con số, bỏ ô 409-en và các mục Cài đặt mà vẫn khớp | Viết lại số | fixed: E5 = 5 × 3 + 4 × 2; E8 = (thư mục + mục NHOM_CAI_DAT) × 2 + 3, in riêng hai thành phần |
