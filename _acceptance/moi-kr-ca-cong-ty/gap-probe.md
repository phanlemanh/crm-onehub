---
slug: moi-kr-ca-cong-ty
at: 2026-10-21T14:26:22Z
verdict: findings
p0: 1
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Hai dòng sổ máy quyết trích câu chỉ liên quan: d-…-2 bỏ chip tình trạng của bản mẫu dù docs/design.md có luật «Lọc một danh sách theo vài giá trị: ToggleGroup»; d-…-5 trích CONTEXT.md không quyết việc bỏ nháp và đã bỏ | Người duyệt nhìn bản mẫu có chip Trượt rồi ký, bản dựng giấu Trượt trong ô thả xuống; E11 vẫn đạt | Đổi dòng sổ, nêu lệch bản mẫu trên thẻ | fixed: d-20261021T142434Z-11 thay d-…-2 (chip ToggleGroup cho Tình trạng như bản mẫu, căn cứ luật Chip lọc; Đơn vị và Người là mặt lọc DataTable); d-…-12 thay d-…-5 cho «đã bỏ» (căn cứ docs/vong-doi.md); «nháp» thành Hỏi-5 (d-…-13); AC-4, AC-7, Notes, design doc viết lại |
| P1 | evals | E2 không tự kiểm đã có KR trượt; tình trạng theo giờ thật; không thấy phân trang | Ngày bộ mẫu không sinh KR trượt: ba số 0 bằng nhau, E2 in DUNG; hơn một trang KR trượt thì đếm dòng lệch số ô | so-o ≥ 2 rồi mới so; bộ mẫu tương đối giờ chạy; so tổng của bảng | fixed: E2 đòi so-o ≥ 2 (thiếu → mã 2), bộ mẫu đặt publishedAt và kỳ tương đối giờ chạy với N_TRUOT lớn hơn cỡ trang, so tổng ở chân bảng; thêm pha-thử mot-trang |
| P1 | evals | E3 tính lại tình trạng từ expected do chính mã mới trả — vòng tròn | Thợ tính kỳ vọng từ createdAt, E3 vẫn xanh | Ma trận tình trạng viết trước, setSystemTime, đối chiếu khoiCuaToi | fixed: E3 (b) so với tình trạng mong đợi viết trước, có mục tiêu công bố muộn; (c) đối chiếu {expected, nhip} của khoiCuaToi; chiều đỏ createdAt; AC-2 nói rõ cùng vạch với «KR của tôi» |
| P1 | evals | E5 không có ca kết hợp mặt lọc khác khi đếm tình trạng | Đột biến đếm trên toàn bộ dòng vẫn qua E5 | Thêm ca {donVi, tinhTrang} và {nguoi} | fixed: E5 ma trận 6 dòng gồm hai ca kết hợp, chiều đỏ đếm trên tập chưa lọc |
| P1 | contract | Ngưỡng «bộ lọc ghi trên đường dẫn» không có eval mở đường thật đối chiếu API | Lỗi tuần tự hoá loc giữa app và API lọt qua | Eval script mở thẳng đường ba mặt lọc so với okr.moiKr | fixed: thêm E12 (AC-7, layer backend-effect, cùng bàn đo), Đường đo trỏ E12 |
| P2 | evals | E9 chỉ kiểm hàm mở ngăn được gọi, không kiểm ngăn hiện | Ngăn không gắn trên trang Mọi KR, E9 vẫn đạt | Khẳng định phần tử ngăn thật | fixed: E9 đòi role=dialog của ngăn KR hiện với tiêu đề KR |
