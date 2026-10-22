---
slug: tran-test-ci-30
at: 2026-10-22T13:05:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | contract | Dòng sổ «không tách ô» ghi mot-loi trong khi lối tách ô còn sống (d-1 tự liệt nó là lối khác có giá); ba mục Out of scope thiếu dòng descope. Cùng khuôn [pre-push-phan-rieng-pr#F1] [loc-don-vi-khong-tu-dong#F1]. | Cổng Phạm vi trình «không tách ô» như điều máy chắc, người ký d-1 tưởng phần tách ô đã đóng; ba mục Out of scope duyệt không lý do. | Mỗi gạch Out of scope ứng đúng một dòng descope; không lựa chọn nào mang hai nguồn khác nhau. | fixed: d-6 thay d-3 bằng nguồn chi-nguoi; thêm d-8 (trần job khác, mot-loi theo số đo check chậm nhất 6,6′), d-9 (bài nhanh hơn, chi-nguoi), d-10 (giam-phut E2 đỏ sẵn, mot-loi) |
| P0 | contract | d-4 bỏ coverage-scan với căn cứ «một khoá» mâu thuẫn ba trục của Coverage; trục B (eval không đổi màu) chỉ có soát tay theo chuỗi. | Một eval khai paths dạng glob đọc ci.yml lọt soát tay, đỏ ở lượt ghim lại sau gộp. | AC và eval liệt kê theo glob, chạy từng eval, có ca đột biến. | human-gate1: căn cứ bỏ coverage-scan sửa ở dòng thay d-4 rồi d-7; AC-5 chạy lại 18 eval đã dựng rồi bỏ theo giám sát đợt (một eval 1213s); phần eval không đổi màu thành câu hỏi chỉ-người ở Cổng Phạm vi, khuyến nghị dựa AC-2 cộng CI thật xanh trọn |
| P1 | evals | E1, E2, E3 ghim nền bằng sha cứng 05e3f774, gãy khi ci.yml đổi chính đáng. | onehub có PR khác chạm ci.yml gộp trước, nhánh kéo về thì E1/E2 đỏ dù đổi trần vẫn đúng; sau gộp chuỗi thay bởi gãy. | Nền suy lúc chạy; E2 chạy hinh.mjs trên nền và cây, so quan hệ. | fixed: nền = cha của commit đổi trần 20 → 30 tìm trong git log của ci.yml (lịch sử không đổi sau gộp); cây đang sửa thì nền = HEAD |
| P1 | evals | E2 chỉ đếm sự có mặt (một dòng sai, ít nhất 5 BAT), không đối chứng tập mục kiểm; design không nói vì sao chỉ test.con-lai báo sai. | hinh.mjs dừng sau dòng sai đầu hay bỏ qua mục, E2 vẫn đạt. | Chạy hinh.mjs trên nền trong cùng lượt; đòi cùng tập mục, cùng tập BAT; ca đột biến cắt dòng dat. | fixed: E2 bung nền bằng git archive, chạy hinh.mjs ở cả hai, đòi cùng tập mục và tập BAT, nền đạt hết, cây chỉ khác ở test.con-lai; thêm ca e3-cat-o; design giải thích mục con-lai gom khoá cấp job |
| P2 | design | Bảng số đo không cộng đủ 40, trộn «cắt ở trần» với «sát trần»; câu hỏi E4 lệch chữ AC-4. | Người ký d-1 dựa vào «6/40 bị cắt» mơ hồ; hội đồng E4 PASS trên bảng mơ hồ hoặc FAIL vì vế ngoài AC. | Bảng nhóm rời cộng đủ 40; câu hỏi chép đúng chữ AC-4. | fixed: đo lại 40 lượt bằng gh api, bảng bốn nhóm rời cộng đủ 40 cho test (api), test (app-ui), test (con-lai), check; câu hỏi E4 viết lại theo AC-4 |
