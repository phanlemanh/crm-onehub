---
slug: kara-mot-ten
at: 2026-10-13T07:45:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Hai dòng sổ S1 ghi nguồn mục-tiêu mà câu trích không quyết lựa chọn: d-…-5 (ghim ở messages-guard nhưng quyết đặt luật ở tệp riêng) và d-…-2 (câu trích chỉ là danh sách ba dạng có phạm vi) | Cổng Phạm vi duyệt hai lựa chọn tưởng lộ trình và docs/ai-ux.md đã quyết, trong khi máy tự chọn | Đổi can_cu sang chi-nguoi hay mot-loi có lối chết thật; d-2 trích câu có cụm «chỗ cần phân biệt phần chạy» | fixed: dòng mới supersedes d-…-2 trích đúng câu «Ở chỗ cần phân biệt phần chạy — cài đặt, sổ chi phí — ghi theo phạm vi:»; d-…-5 tách thành hai dòng — ghim 119 chuỗi nằm trong messages-guard theo đúng lộ trình (mục-tiêu), luật quét ở tệp riêng vì trần 800 dòng (một-lối) |
| P1 | contract | Cụm cấm của AC-7 hẹp hơn bảng thay chữ; không nói so hoa thường; chiều đỏ chỉ ba mục | Khoá en «the OKR assistant» hay «Máy chạy ở chế độ ẩn» ngoài BE_MAT lọt; S4 xanh mà màn vẫn tên cũ | CAM đầy đủ kèm luật so; ma trận chiều đỏ mỗi cụm một mục | fixed: AC-7 và E7 khai 16 cụm (13 vi so đúng chữ, 3 en không phân biệt hoa thường), chiều đỏ 16 + 3 mục viết trước, số lỗi phải đúng 19; cụm hẹp lại «Máy ghi số», «Máy chạy ở chế độ ẩn» vì «Máy chạy CI» là tên khoá CI, không phải AI |
| P1 | evals | BE_MAT, GIU, VAT_DOI_DUNG tự khai trong bài; đếm vòng tròn; con số kiểm kê không ghim | Thợ cắt khoá khỏi BE_MAT hay thêm vào VAT_DOI_DUNG, các bài vẫn xanh | Kiểm kê viết trước S3, bài đếm theo nó; VAT_DOI_DUNG trùng khít GIU có chiều đỏ | fixed: kiem-ke.json dựng bằng quét máy trên 4abc05e0 (130 mục: 119 đổi, 5 giữ, 6 miễn); E15 đếm theo bề mặt, round-trip từng giá trị cũ với git show, quét lại để bắt sót, và đòi tệp có commit trước mọi sửa chữ; E1–E6 đếm theo kiem-ke; E7(d) và E8(g) giữ VAT_DOI_DUNG trùng khít mô-đun vật đội dựng cộng mục giữ |
| P1 | evals | E13 bảo hội đồng đọc bảng do một lệnh in, mà hội đồng không chạy lệnh | Hội đồng chấm «giữ nghĩa» không có chữ cũ | Eval script ghi bảng trước/sau thành tệp; E13 chỉ đọc tệp đó | fixed: E16 (bang-chu.mjs) ghi evidence/bang-chu.md, số dòng đối chiếu kiem-ke; E13 inputs là bang-chu.md và design doc |
| P1 | evals | Chữ cứng ngoài kiểm kê và tin nhắc dựng thật không được đo; chỉ Cài đặt có ui-check | aria-label hay câu lỗi ngoài bảng giữ tên cũ; tiêu đề tin nhắc ghép từ biến lệch | Quét literal toàn mã nguồn theo CAM có danh sách miễn viết trước; gọi hàm dựng tin; ui-check thêm màn | fixed: E7(b) quét *.ts/*.tsx của apps/app/app, components (trừ proto), apps/api/src, apps/agent/agent, packages/validation/src, miễn đúng 6 mục 'mien' của kiem-ke; E2b gọi dungTin hai khuôn với đối chứng dương; E14 thêm Soạn OKR, tab Agent, Tài liệu ở 1440 |
