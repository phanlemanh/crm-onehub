---
slug: ghim-thuoc-soi-xem-okr
at: 2026-10-15T22:11:58Z
verdict: findings
p0: 1
p1: 3
p2: 1
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Câu giao (b) cho bước CI chạy trên PR chạm ba glob; dòng sổ d-20261015T220931Z-2 bỏ lọc và ghi nguồn muc-tieu, nhưng câu trích của E23 chỉ là phạm vi soi, không quyết chuyện lọc PR — chọn lọc hay không là khẩu vị rủi ro, chỉ người quyết. | onehub đỏ thước thì mọi PR đỏ ở bước này tới khi vá, kể cả PR chỉ sửa giao diện; chủ kho ký AC-4 mà không thấy câu hỏi nào, tưởng duyệt đúng câu giao. | Hỏi-1 trên thẻ Cổng 1 với ba lối (ba glob · ba gốc thước + rang · mọi PR); AC-4 và E4 sửa theo câu trả lời. | human-gate1: Hỏi-1 = dòng d-20261015T221306Z-7 (supersedes d-2), khuyến nghị (3) mọi PR; AC-4, Out of scope ghi rõ theo khuyến nghị và đổi theo câu trả lời |
| P1 | contract | AC-6 chỉ đo ba thước đang xanh; năm thước đỏ sẵn (gpct_hinh_acceptance, gpct_luong, dpvb_cong, gpa_hinh, gpa_khong_mat_lenh) bị loại, đúng những thước có lời hứa sát job luat-kho. | Bước mới phá một lời hứa của giam-phut-ci-nhap-t1 nhưng thước vốn đỏ nên dòng lỗi mới chìm vào «đỏ sẵn». | So tập dòng lỗi của năm thước giữa nền và nhánh, có đối chứng dương. | deferred: E6d dựng ở S3 rồi bỏ ở Cổng Phạm vi mở lại 2026-10-15 — hai thước ghim trọn hình acceptance.yml nên mọi bước thêm đều lệch; lệch đã soi tay ghi Known limits kèm evidence/lech-thuoc-do-san.md |
| P1 | evals | E4 không ghim tên bước, trong khi Đường đo đọc bước theo tên «OKR read rule». | Đột biến đổi run làm mất bước theo run nên ra sai thông điệp; đổi tên bước thì E4 vẫn xanh mà Đường đo không tìm được bước. | E4 nhận bước theo name, rồi so run; thêm đột biến đổi tên. | fixed: AC-4 và E4 nhận bước theo tên «OKR read rule», đột biến thứ sáu đổi tên → «thieu buoc soi-xem», đột biến đổi run giữ tên → «lech lenh config» |
| P1 | contract | Ngưỡng CHẾT không tính lỗ base dời: kho gộp theo lô với --match-head-commit, hai PR xanh riêng vẫn làm onehub đỏ. | Ngày 14 người đếm không biết PR gốc là A hay B, Cổng Giá trị phán theo cách hiểu riêng. | Notes nêu lỗ; Đường đo có luật phân loại «lệch base» và «PR gốc xanh trên đúng base». | fixed: Notes thêm lỗ base dời; Đường đo phân loại từng lượt push đỏ, chỉ loại «PR gốc xanh trên đúng base» tính vào CHẾT |
| P2 | evals | Ô «Cổng ở tầng trên» của #6 congSuaCanChinh không nêu hàm cổng, còn khoá mới phủ hàm chung có hai người gọi; AC-3 không có đáp án xác định cho #6. | Hai người chấm cho hai kết luận trên cùng bản cài, E3 lật qua lại. | Câu hỏi E3 ghi luật riêng cho #6. | fixed: câu hỏi E3 đòi lý do #6 nói lời đọc nằm trong hàm cổng, assertSuaMucTieu trên nguồn ngay sau, nêu đủ removeAlignment và suaLyDoCanChinh; lý do của dòng #6 viết theo đó |
