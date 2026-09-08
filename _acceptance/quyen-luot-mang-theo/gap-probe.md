---
slug: quyen-luot-mang-theo
at: 2026-09-08T13:43:11Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | contract | Trục C có bốn bên tiêu thụ quyền, nhưng "policy approval" và "lớp trong requireBuilderAttribute" không có AC nào phủ. Tám AC đều dừng ở giá trị trung gian commandType; không AC nào đo cổng thật sự đóng sau khi API đặt CHAT | API đặt CHAT đúng như AC-3 và AC-4 đòi, nhưng runtime lấy quyền từ nguồn khác trong ctx hoặc builderTurnAuthorized đọc trường khác tên, nên policy vẫn cho tool chạy. Cả tám eval xanh trong khi cổng vẫn mở — đúng hình dạng đã xảy ra ở vòng trước | Thêm một AC đi hết vòng bằng hàm thật, đối chứng dương trên cùng fixture khác đúng một trường | fixed: thêm AC-9 (cross-layer) chạy hết chuỗi bản ghi → suy commandType → builderSessionAttributes → builderTurnApproval bằng hàm thật, thiếu một mắt là mã 2; E9 khai `layer: backend-effect`, thêm executor `ql_cong_dong_that` |
| P1 | evals | E3 mở đường lùi bằng chữ "hoặc" — vế sau chính là tự dựng fixture đúng khuôn bên đọc. AC-3 còn không đòi round-trip [chan-uy-thac-sai-luot#F1] | Đường ghi lồng cờ quyền một tầng, hàm dựng trả cờ ở tầng phẳng. E3 chọn vế hàm dựng nên hai chiều lật đúng, eval xanh. Thật thì API parse hỏng mọi bản ghi, rơi fail-closed, mọi câu trả lời thành CHAT vĩnh viễn | Bỏ vế "hoặc", nâng round-trip lên AC-3, thêm assert khớp tên trường và độ sâu lồng | fixed: E3 bỏ hẳn đường lùi (dùng hàm dựng khác là mã 2) và thêm assert khuôn; AC-3 nay ghi Given là bản ghi do chính hàm persist thật sinh ra, kèm sàn khuôn mã 2 |
| P1 | design | E7 vế (b) đòi status parse được bằng outputSchema nhưng bảng Files không liệt kê file ấy, Mốc ghim cũng không có neo cho nó | Người làm theo đúng bảng Files, sửa hai file được liệt kê, chạy E7: vế (a) xanh, vế (b) đỏ vì schema không nhận status mới. REJECT vì một file nằm ngoài kế hoạch Cổng 1 đã duyệt | Thêm dòng outputSchema vào Files và một neo đếm số status schema chấp nhận | fixed: Files thêm `agent.ts`; Mốc ghim thêm neo — đo thật tại 9ec0251 schema đã nhận 2 status kể cả not_authorized, nên vòng này chỉ xác nhận không làm mất |
| P1 | contract | AC-6 đòi ba đường "giữ nguyên như trước vòng này" nhưng Mốc ghim không ghim giá trị nào; ma trận ba assert không có ba giá trị kỳ vọng viết trước | Refactor làm đường follow-up tụt từ CREATE_AGENT xuống CHAT. Người viết E6 đọc code sau khi sửa, ghi kỳ vọng CHAT vì tưởng là hiện trạng, ba assert xanh. Hồi quy ship mà không cổng nào thấy | Ghim ba giá trị đo tại 9ec0251 và bắt E6 so với chúng | fixed: Mốc ghim thêm ba dòng đo thật; E6 ghim ba giá trị trong chính bài đo và cấm so với hiện trạng sau khi sửa |
| P2 | evals | AC-2 nói "bất kỳ bên nào đọc" nhưng paths của E2 không có file nào của apps/api, nên vế "không bên nào khai từ điển mở" không soi tới bên đọc thứ hai | conversations.service.ts ép kiểu thô cột Json thành từ điển mở rồi chỉ đưa riêng trường quyền qua schema. E2 xanh vì không nhìn vào apps/api. Đổi tên một trường thì nhánh ép kiểu trả undefined lặng lẽ, đúng thứ AC-2 cấm | Thêm apps/api vào paths và cho vế quan hệ chạy trên cả hai bên đọc, số chỗ ép kiểu mở phải bằng 0 ở cả hai | fixed: E2 thêm hai đường dẫn bên đọc, vế quan hệ thành ma trận toàn phần hai phần tử, khác 0 chỗ ép kiểu là mã 2 kèm file:dòng |
