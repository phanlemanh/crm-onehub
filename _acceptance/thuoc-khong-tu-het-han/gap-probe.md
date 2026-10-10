---
slug: thuoc-khong-tu-het-han
at: 2026-10-09T14:27:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

# Phản biện context sạch — thuoc-khong-tu-het-han

Một tác tử tươi đọc design, contract, evals, sổ quyết định và opportunity, không đọc code.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | E1 đo paths chết ở HEAD trên toàn kho, chính nó tự hết hạn đúng kiểu hồ sơ sinh ra để sửa; số hồ sơ không ghim | Gộp onehub có hồ sơ mới ký mang glob chết, hoặc PR sau dời tệp, E1 đỏ dù 20 eval đã sửa | Neo sha; ma trận viết sẵn 20 eval; đối chứng dương ở a9e8bc75a | fixed: AC-1/E1 đo đúng 20 eval của `rang/danh-sach.json` ở mốc neo (commit gộp của vòng nếu có, không thì tip); đối chứng dương quét toàn hồ sơ đã ký ở `a9e8bc75a` phải ra đúng 20 cặp. Ca thật cùng lớp xảy ra ngay hôm nay: E1/E4 của `ci-ma-tran-ba-o` tự hết hạn sau gộp #331 |
| P1 | evals | E2 lấy «mọi evals.yaml đổi» so cây làm việc, không ghim 14 tệp, loại trọn hai hồ sơ E7/E10 | PR khác sửa expected của hồ sơ đã ký, E2 đỏ vì việc không thuộc vòng; vòng sửa thiếu vẫn xanh | Cặp sha cố định, danh sách 14 tệp, tập đổi đúng 20 | fixed: AC-2/E2 so `a9e8bc75a` với mốc neo trên đúng 14 tệp; tập đổi paths phải bằng 20; eval khác E7/E10 của hai hồ sơ phải giống hệt |
| P1 | evals | E3/E4 không có đối chứng dương cho «không phụ thuộc nhánh»; điều kiện nhánh là môi trường, không phải fixture; tập commit không ghim | Chạy trên onehub sau gộp, bản cũ chưa neo cũng thoát 0, E3/E4 xanh mà không chứng gì | Cây tạm ở sha cố định cộng commit tổng hợp; bản cũ phải đỏ, bản neo xanh, hai ref cùng đầu ra | fixed: E3/E4 dựng clone `--shared` tạm ở `a9e8bc75a` cộng commit chạm `hoi-crm-qua-zalo` và commit không tên; bản cũ thoát 1 thông điệp ghim, bản neo thoát 0; tập commit E10 ghim sẵn; kiểm một commit gộp duy nhất mỗi hồ sơ |
| P2 | evals | Lệnh quét kiểm kê không đo đủ mọi dạng mốc trôi (`onehub` trần, `HEAD~N`, `@{u}`, quét toàn cây) | Con số 162 thấp hơn thật, Cổng Phạm vi duyệt phần bỏ trên số sai | Bộ mẫu viết sẵn mỗi dạng một tệp, một tệp neo sha không được đếm | fixed: AC-5/E5 thêm `rang/mau-moc-troi/` mười tệp mẫu; quét phải đếm đủ dạng trôi và không đếm tệp neo sha; Trục B thêm giá trị «trạng thái toàn kho ở HEAD» |
| P2 | contract | Hợp đồng dựa vào F9 mà không khai F9 phải đang chạy; chip sang bộ kit không có dấu vết | F9 chưa cài thì vế trước-gộp của E7 không ai canh; Đường đo không có số | Ghi rõ giới hạn; ghi id chip | fixed: Out of scope ghi rõ vế đó KHÔNG ai canh tới khi anh cho cài `kiem-cheo:cai`. Chip sang bộ kit đi qua yêu cầu `viec-phu` (luật đợt cấm tự gọi chip), id ghi vào sổ khi giám sát mở |
