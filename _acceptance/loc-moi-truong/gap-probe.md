---
slug: loc-moi-truong
at: 2026-10-21T07:20:31Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | ledger | Dòng d-20261021T070843Z-4 («trường tắt Hiện trong bộ lọc vẫn lọc») ghi nguồn muc-tieu, kho_dao false; câu trích không quyết việc áp lại bộ lọc đang bị bỏ qua, và lựa chọn đổi thành viên chiến dịch trên production. AC-6 mâu thuẫn AC-7 và dấu CHẾT. Cùng dạng [lo-trinh-nhieu-san-pham#F1] | Bộ lọc đã lưu mang trường x đã tắt; hôm nay chiến dịch 120 thành viên; lên production x lọc lại, còn 40, không ai sửa gì; E7 xanh vì fixture chỉ có trường bật | Đổi d-4 thành Hỏi; E7 thêm ca trường tắt; Đường đo so trên cùng một bản chụp | human-gate1: Hỏi-5 (d-20261021T072341Z-20 thay d-4, kho_dao true); design, AC-6, AC-7 viết theo khuyến nghị giữ kết quả hôm nay; E6 vế b, E7 ca 'truong tat'; Đường đo đổi sang so logic cũ và mới trên cùng bản chụp |
| P0 | ledger | Dòng d-20261021T070844Z-14 bỏ design-pass ghi mot-loi, trong khi lối «design-pass sau #521 gộp, trước Cổng Phạm vi» vẫn sống, giá là lùi mốc. Cùng dạng [kara-khong-ghi-de-truong#F1] | Chủ kho ký vì tưởng không còn lối khác; ô Chứa… và Từ/Đến lần đầu dựng ở 375 tận S4, vỡ thì sửa qua một lượt cham-tep nữa | Đổi d-14 thành Hỏi chi-nguoi | human-gate1: Hỏi-6 (d-20261021T072342Z-21 thay d-14); thẻ nêu UI duyệt bằng chữ và hình |
| P1 | evals | E7 dựng bộ lọc khuôn cũ bằng tay đúng khuôn bên đọc mới chờ, đáp án viết tay; bộ DEAL khuôn cũ là dữ liệu không thể có | Bên ghi cũ lưu khác cách test viết; bộ phân tích mới đọc đúng khuôn tay nên E7 xanh mà dòng thật phân tích lệch | Lấy khuôn cũ từ currentView của c6a718f3d, đáp án chạy trên nền | fixed: E7 đọc rang/khuon-cu.json do sinh-khuon-cu.mjs sinh từ useTableQuery của worktree c6a718f3d kèm tập id mong đợi chạy trên cây ấy; bỏ bộ DEAL khuôn cũ |
| P1 | evals | E4 không viết trước ma trận, fixture có điều kiện, không ca chuỗi rỗng | Bên ghi lưu text rỗng; điều kiện trống coi là có giá trị; lọc Trống sót bản ghi màn vẽ trống; E4 vẫn xanh | Ma trận viết trước có tổng ô cố định, đọc lại dạng thật | fixed: E4 ma trận 25 ô (9 kiểu × 2 dạng, 5 kiểu chữ × chuỗi rỗng/khoảng trắng, 2 kiểu × SetNull), bỏ chữ «nếu đường ấy tồn tại» |
| P1 | contract | AC-6 đi qua API và Cài đặt › Trường mà không tag cross-layer; ô «Hiện trong bộ lọc» chỉ đo bằng quét tĩnh | field-editor import bảng chung nhưng vẫn chỉ vẽ ô cho trường có lựa chọn; E6 xanh qua API; quản trị không bật được bộ lọc cho Chữ, Số | Tag cross-layer; ca dom dựng field-editor cho từng kiểu; E10 bật một trường qua màn | fixed: AC-6 mang (cross-layer) và vế lưu showOnFilter; E6c mới (FieldEditor thật × FIELD_TYPES, đối chứng SELECT); E10 bật trường Số bằng tay trên Cài đặt › Trường |
