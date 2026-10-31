---
slug: rang-hang-cong-cu
at: 2026-10-31T13:53:06Z
verdict: findings
p0: 2
p1: 3
p2: 0
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Ranh ô nhập (Field, FieldSet, FieldGroup, aria-labelledby) là lựa chọn có đánh đổi mà sổ ghi máy quyết; AC-5 không đo FieldSet, FieldGroup, aria-labelledby | Chip lọc mang aria-labelledby trong CardContent lọt răng | Câu hỏi lên Cổng Phạm vi; ca ma trận cho từng vật bọc | human-gate1: thành Hỏi-1 (dòng supersedes d-20261031T134939Z-3); bỏ miễn aria-labelledby; thêm ca ma-tran-boc cho Field, FieldSet, FieldGroup, aria-labelledby |
| P0 | design | Quét theo tệp mù quan hệ chứa nhau giữa hai tệp; lối theo chuỗi nhập chưa chết | Chip trần ở tệp A, tệp B đặt nó trong CardContent, bài im | Câu hỏi lên Cổng Phạm vi hoặc descope có tên | human-gate1: thành Hỏi-2 (dòng supersedes d-20261031T134939Z-2); điểm mù ghi vào Out of scope |
| P1 | contract | Thu «nhóm gập dưới bảng» về «nhóm gập chứa bảng» không có dòng sổ | Collapsible Đã bỏ (3) chứa danh sách Item sau một bảng lọt | Dòng sổ hoặc câu hỏi | human-gate1: thành Hỏi-3; ca Item là đối chứng im trong ma-tran-boc |
| P1 | evals | Ma trận không phủ CardHeader, Card trực tiếp, SimpleTable, Table, Bang… | Bản cài chỉ dò CardContent hay DataTable vẫn xanh | Mỗi giá trị một ca ghim mảng lỗi | fixed: ca ma-tran-boc phủ Card, CardHeader, CardContent, BangDaBo, DataTable, SimpleTable, Table |
| P1 | evals | E1 đo có mặt chứ không đo tập bằng nhau; E9 so vòng tròn | Bộ lọc đường dẫn hỏng với (app), [slug] mà vẫn xanh | Tập độc lập từ một lệnh git khác, so bằng nhau | fixed: E1 so tập bài đọc với tập tính bằng git ls-files pathspec glob riêng, có tệp dưới (app)/[slug]; ca tệp chưa theo dõi trên đĩa: deferred (bài không ghi tệp vào cây) |
