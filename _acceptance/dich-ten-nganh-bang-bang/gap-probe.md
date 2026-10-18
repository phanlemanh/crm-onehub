---
slug: dich-ten-nganh-bang-bang
at: 2026-10-17T12:20:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Dòng sổ d-20261017T121216Z-6 ghi nguồn mục-tiêu nhưng câu trích CLAUDE.md chỉ nói dữ liệu NGƯỜI NHẬP, không quyết việc gỡ nhãn tiếng Anh khỏi giá trị tiếng Anh mới của nhà cung cấp mà AC-5/E6 ép gỡ [cho-tac-nhan-lau#F2] | Người duyệt ký «luật kho đã quyết» việc bỏ nhãn ngôn ngữ; ngành mới của nhà cung cấp bị trình đọc màn hình đọc giọng Việt — đánh đổi chưa ai được hỏi | Thay d-6 bằng một câu hỏi hoặc lối không tạo đánh đổi; sửa AC-5/E6 | fixed: chọn lối không đánh đổi — giá trị ngoài bảng giữ đúng cách hiện hôm nay; d-20261017T121631Z-8 thay d-6 (trích ô cơ hội đã ký); AC-5/E6 viết lại; ngành rep gõ tiếng Việt còn nhãn tiếng Anh ghi Out of scope |
| P1 | design | Kiểu {ten, dich} và «không dịch → lang en» mâu thuẫn E6 (translate=no, không lang en); thiếu ô en × ngoài danh sách | E6 đỏ ở S4, sửa theo E6 thì E3/E4 nhánh en đỏ — thiết kế lại giữa vòng | Ba trạng thái hoặc thống nhất thuộc tính; E6 thêm cột en | fixed: theo P0, dich=false luôn hiện như hôm nay (lang en) nên hai trạng thái đủ và không mâu thuẫn; E6 thành ma trận 2 giá trị × 2 ngôn ngữ × 3 chỗ = 12 ca đếm bằng số; Coverage liệt AC-5 ở trục ngôn ngữ |
| P1 | design | d-20261017T121216Z-4 bỏ design-pass bằng lý do «tốn hơn», không phải ràng buộc; cột Ngành hẹp, tên Việt dài hơn, E8 chấp nhận cắt | Người xem tiếng Việt thấy «Bất động sản & Côn…» ít thông tin hơn hôm nay mà E8 vẫn đạt; Hỏi-2 ký không biết bao nhiêu tên bị cắt | Đo độ rộng 24 tên, in số tên bị cắt; E8 khẳng định rõ | fixed: ô Ngành mang title đọc đủ khi rê chuột (AC-3/E4); E8 dựng đủ 24 ngành và in số tên bị cắt mỗi ngôn ngữ × khổ; bảng tên trong thiết kế kèm số chữ Anh→Việt; d-20261017T121631Z-9 thay d-4 với lối chết nêu được |
| P2 | contract | Đường đo bộ lọc «trước/sau gộp» không ghi bước lấy số TRƯỚC gộp | Tới ngày đọc ngưỡng không còn số trước gộp — ngưỡng thành tin suông | Bước chụp số đếm trước gộp vào evidence kèm ngày | fixed: Đường đo ghi bước đọc số đếm bộ lọc trên production trước gộp vào evidence/dem-loc-truoc-gop.md |
| P2 | evals | E7 không khai paths; câu hỏi thu hẹp về nhân viên kinh doanh bất động sản [d-20261017T051319Z-52] | Sửa bảng sau lượt chấm mà phán quyết E7 cũ không bị báo cũ; lăng kính bất động sản cho qua tên gượng ngành xa | Khai paths = inputs; sửa chủ thể câu hỏi | fixed: E7 paths = [ten-nganh.ts, CLAUDE.md, CONTEXT.md]; câu hỏi đọc như nhân viên kinh doanh Việt Nam gặp mọi ngành |
