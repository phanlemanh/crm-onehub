---
slug: chu-may-sinh-ten-moi
at: 2026-10-20T02:00:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Dòng sổ d-20261020T010658Z-6 tự đặt dải «không tụt» của AC-7 (2 ca, 1 chốt mã, 0,1 mỗi tiêu chí) với nguồn mot-loi; lối chết chỉ loại so bằng tuyệt đối, còn chọn mức tụt chấp nhận được là việc của người [thanh-ben-khu-dung-chung#F1] [ngan-ban-ghi-giu-danh-tinh#F1] | Lần sau đạt ít hơn nền 2/30 ca và một tiêu chí tụt đúng 0,1; E7, E8 xanh vì đó là ca biên; người ký Cổng Phạm vi tưởng dải đã có căn cứ | Viết lại thành chi-nguoi kèm khuyến nghị và lối khác; lên thẻ Cổng 1 thành câu Hỏi; kèm độ lệch đo được giữa hai lượt nền | human-gate1: dòng d-20261020T011141Z-12 (supersedes d-6) thành câu hỏi chi-nguoi; AC-7 ghi «dải chờ chủ kho chốt»; lượt nền đầu giữ làm nen-lap để thẻ có số dao động |
| P1 | evals | E7 không chốt rằng nen và sau chỉ khác lời dặn; AC-4 bỏ tenGoc khỏi config.ts của agent-okr | Hai biến cùng đổi giữa nen và sau; phần tụt đổ sai cho lời dặn, hoặc bam.thuoc gồm cả config.ts nên E7 đỏ mãi | Tóm tắt ghi tệp tạo bam.thuoc; E7 đỏ khi diff nen.sha→HEAD trên đầu vào soạn có tệp ngoài loi-dan-soan.ts; đối chứng trong E8 | fixed: AC-7 và design đặt nen trên commit ngay trước commit đổi lời dặn (mọi sửa khác commit trước); so-eval-soan.mjs đỏ khi apps/agent-okr/agent, apps/agent-okr/evals, packages/db/src đổi ngoài loi-dan-soan.ts; E8 thêm ca «đổi tệp ngoài lời dặn»; bam.thuoc chỉ băm thư mục okr-soan + danhGia + judge (eval-soan-chung.mjs), đường soạn đọc tên gốc qua okr-goi-soan.ts từ trước nên AC-4 không chạm nó |
| P1 | contract | AC-6 cấm «căn chỉnh» ngoài dấu ` mà lại đòi câu dặn nhắc chính chữ đó; E6 ghim khuôn «never write» và thứ tự hai cụm không khai | Câu dặn viết đúng design (chữ trong «») làm E6 và luật máy đỏ; hoặc người làm sửa câu cho vừa regex | Khai câu mẫu nguyên văn với hai cụm trong dấu `; đối chứng «» đỏ, ` xanh | fixed: AC-6 và design khai nguyên văn câu dặn với hai chữ cũ trong dấu `; E6 so đúng câu CAU_DAN, đối chứng «» ra hai lỗi, ` ra 0; kiem-ke.mjs bỏ đoạn mã ở hai tệp lời dặn như luật máy |
| P1 | evals | Đường đo SỐNG tự đúng: E10 chỉ quét 13 tệp kiểm kê tự chọn; bộ duyệt của E1, E2, E5 thiếu đối chứng dương | Một câu «hỏi ý» ở tệp thứ 14 lọt; hoặc bộ duyệt bỏ sót lá kiểu hàm mà E1 vẫn xanh | E10 quét cả năm vùng; mỗi bài thêm ca chiều đỏ và đếm số lá | fixed: E10(a) quét mọi tệp git dưới apps/api/src, apps/agent/agent, apps/agent-okr/agent, packages/validation/src, packages/db/src ở mốc (đã chạy: không có chỗ trúng ngoài kiểm kê); E1 thêm đếm lá ≥ số dòng kiểm kê và lá giả «Không Căn chỉnh»; E2 lá giả «Lần Hỏi ý»; E5 TIEU_DE giả |
| P1 | evals | AC-4 là quan hệ giữa các hàm nhưng E4 chỉ đo dạng mã và một hàm thuần | Một service truyền chữ dự phòng vào gopToanCanh hay docDauVaoSoDo; dạng mã vẫn đạt | Ma trận viết trước, mỗi chỗ một lời gọi thật, hai lượt tên | fixed: E4(a) ma trận GOC_MOI_CHO 11 hàng, mỗi hàng một lời gọi tRPC thật (toàn cảnh, sức khoẻ, sơ đồ đơn vị, cuộc soạn, tái cơ cấu, độ phủ, khép kỳ…), lặp «Kho Thử Nghiệm» rồi «   »; E4(c) hỏi đáp agent-okr đo trên CSDL kiểm; AC-4 viết lại thành quan hệ đo bằng lời gọi |
