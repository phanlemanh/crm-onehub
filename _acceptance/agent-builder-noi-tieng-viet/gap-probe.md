---
slug: agent-builder-noi-tieng-viet
at: 2026-09-05T14:40:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Phản biện context sạch — agent-builder-noi-tieng-viet

Một lượt, phiên tươi, chỉ đọc bốn artifact cộng file bài học xuyên vòng. Không
đọc mã. Cả năm sửa vào artifact cùng lượt, không chạy lại (one-pass).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | Không phép đo nào gieo một bản ghi tác nhân qua writer thật. AC-1 tự cho phép khai `/agents/[agentId]` là không-dùng-được, và mọi chân đọc màn đều tự giới hạn ở "route dựng được" [man-cai-dat-noi-tieng-viet#F1] | Workspace đo không có tác nhân nào → trọn kho `agent-builder-tac-nhan.ts` (122/226 chuỗi) chỉ được quét tĩnh. Một khoá nối sai hay chuỗi dự phòng tiếng Anh dựng ra màn vẫn xanh | Gieo một tác nhân qua chính `agents.save` của sản phẩm rồi đo trên bản ghi đó; `route_khong_dung_duoc` phải RỖNG cho route chi tiết; số trạng thái ST-* đo được ≥ con số ghim trước | **fixed** — AC-1, AC-5, E1, E6 viết lại: gieo qua writer thật, ghim ≥6/8 trạng thái |
| P0 | contract | Vùng không-dịch không có phép so GIÁ TRỊ. AC-1 loại bảng AC-6 khỏi phép so, còn AC-6 chỉ đòi hai lượt cùng SỐ phần tử — một con số, không phải quan hệ [cua-vao-noi-tieng-viet#F1] | Kho `vi` dịch nhầm một tên thương hiệu hay định danh (Slack, manifest, webhook). AC-1 bỏ qua vì nằm trong bảng; AC-6 đếm ra cùng số nên xanh. Trục C trượt lọt hoàn toàn | E7 so TỪNG dòng của bảng giữa hai lượt và đòi chuỗi Y HỆT; số dòng so được BẰNG số dòng bảng. Chiều đỏ: đổi một giá trị thương hiệu trong bản vi thì đỏ gọi tên phần tử và route | **fixed** — AC-6 và E7 đòi so từng giá trị |
| P1 | evals | Cần gạt `khong_quet` mâu thuẫn với chính quyết định cắt đôi: sáu file hoãn mang 291 chuỗi tiếng Anh ĐÚNG THEO THIẾT KẾ, mà luật viết "file loại trừ còn chuỗi tiếng Anh là ĐỎ" | Chạy trên cây lành thì đỏ ngay vì một luật tự mâu thuẫn. Ngả còn lại tệ hơn: nới định nghĩa cho tới khi cần gạt thành phép đo rỗng, và sáu file hoãn có thể bị quên lặng lẽ | Đỏ khi file loại trừ mang chuỗi TRÙNG một khoá của ba kho mới, hoặc khi danh sách khác sáu file đã khai. Ghim số dòng `khong_quet` BẰNG sáu | **fixed** — AC-8 và E11 viết lại thành hai vế đo được |
| P1 | evals | AC-7 không ghim cặp vết × chân chuyên trách, chỉ đòi "ít nhất một chân bắt"; vết component dùng chung không ghim vị trí nằm ngoài thư mục quét | Chân thuộc tính hỏng nhưng vết vẫn bị chân bắt-hết bắt → cả một lớp phép đo chết mà hồ sơ không thấy. Vết "component dùng chung" cắm trong thư mục quét thì không thử đúng lỗ đã ăn ở vòng 5 | Bảng đóng vết × chân chuyên trách; vết component dùng chung cắm ở file NGOÀI `components/agent-builder`, khai đường dẫn nguyên văn | **fixed** — AC-7 và E9 ghim bảng đóng |
| P1 | contract | Bốn con số neo không được kê tên ở đâu; AC-4 tuyên quét lớp thuộc tính nhưng lọc qua chín tên KÊ TAY, không assert tổng [man-cai-dat-noi-tieng-viet#F2] [thuoc-cua-lat-3a-co-rang#F1] | Người duyệt tin lớp thuộc tính có ma trận toàn phần. Thực tế một thuộc tính mang chữ ngoài chín tên — `alt`, `label`, `tooltip` — không bao giờ vào tập ứng viên | Kê thẳng bốn số neo trong hợp đồng; tên thuộc tính SINH TỪ CÂY CÚ PHÁP rồi trừ theo danh sách kỹ thuật có tên; tên mang chữ ngoài cả hai danh sách là ĐỎ | **fixed** — AC-4 và AC-8 kê neo, E5 đổi sang sinh-rồi-trừ |
