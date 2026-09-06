---
slug: chu-mac-dinh-thu-vien-ngoai
at: 2026-09-06T10:15:00Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals · design | Phép đo trung tâm khai phạm vi là `grep` trong `apps/` và `packages/` nhưng không artifact nào khai tập loại trừ. `node_modules` và thư mục dựng nằm ngay bên trong hai cây đó. | Mọi chuỗi mặc định của thư viện đều tìm thấy trong `node_modules` hoặc `.next`, nên tập «chuỗi không thuộc về ai» rỗng trên mọi màn. Hồ sơ ghi «0 chuỗi lạ». Đúng chuỗi mốc của vòng trước cũng lọt. | Ghim tập loại trừ vào `expected` và đòi chân in số file đã quét. Thêm khẳng định nghịch ghim nguyên văn. | fixed: AC-1 và E1 ghim tập loại trừ `node_modules` · `.next` · `dist` · `build`, và bắt in số file đã quét. Đo được: ở kho này `bun` gom `node_modules` lên gốc nên phép đo TÌNH CỜ đúng — ghim để nó thôi phụ thuộc vào cách trình quản lý gói xếp thư mục |
| P0 | contract AC-1 | Bảng đóng bốn lý do không có ô cho chuỗi CÓ nguồn gốc kho nhưng không tồn tại nguyên văn trong file nguồn: chuỗi sinh từ hàm ghép biến, số và tiền tệ đã định dạng, chuỗi JSX bị xuống dòng. | Một nhãn sinh từ hàm ghép trong kho chuỗi hiện trên màn; `grep` không ra file nào; không lý do nào đúng. Hai lối thoát đều hỏng: E1 đỏ vĩnh viễn dù kho hoàn toàn đúng, hoặc người khai bừa vào «định danh kỹ thuật» mà AC-1b vẫn xanh. | Mở bảng thành năm lý do; lý do thứ năm bắt buộc trỏ một khoá CÓ THẬT trong kho chuỗi, khoá chết là ĐỎ. | fixed: AC-1 nay có năm lý do, và dòng thuộc lý do thứ năm phải trỏ một khoá có thật |
| P0 | evals E1 | Eval quét trọn một LỚP mà không có ma trận toàn phần viết trước. Guard duy nhất là «tập rỗng là mã 2», chỉ chặn ca rỗng tuyệt đối. Đối xứng lệch: phía mã có neo cứng 79 · 35 · 15, phía màn không có neo nào. | Một màn chuyển hướng về đăng nhập, hoặc một khối tải chậm chưa kịp vẽ. Màn vẫn trả tập khác rỗng nên không thoát mã 2. Dân số tụt từ 60 xuống vài chuỗi, E1 thoát 0, hồ sơ đọc như một lượt quét đầy đủ. | Ghim bảng đóng `(màn, số chuỗi tối thiểu)`; số màn dựng được BẰNG số dòng bản khai; in số chuỗi từng màn. | fixed: AC-1 và E1 nay ghim bảng `(màn, số tối thiểu)`, đòi số màn bằng số dòng bản khai, và in số chuỗi từng màn |
| P1 | contract AC-4 · evals E5, E7 | AC-4 là khẳng định ÂM TÍNH và đối chứng dương chỉ sống trong văn xuôi. E5 dùng lại đúng chân của E1, chạy một lượt. Bảng hình dạng của AC-6 không có hình dạng «gỡ phép ghi đè». | Không màn nào trong bản khai mount vùng thông báo. E1 và E5 cùng thoát 0. Nhãn chưa từng bị nhìn thấy một lần nào, nhưng AC-4 xanh vì lời hứa của nó là «không bắt được». Lõi «vá thật cái đã tìm ra» không có bằng chứng nào. | Thêm hình dạng vào bảng đột biến, ghim thông điệp đỏ chứa nguyên văn `Notifications`; bắt bản khai có màn dựng vùng thông báo và E5 in ra nhãn đọc được. | fixed: AC-4, E5 và E7 đều sửa theo đúng ba việc đó |
| P1 | contract AC-8 · evals E9 | AC-8 thiếu điều khoản BẰNG SỐ mà AC-3 có sẵn. Không phép nào kiểm bảng ĐỦ, cũng không kiểm phân loại «chỉ hiện sau khi bấm» là thật. | Bảng khai 1 trong 20 component. Chiều đỏ xanh, bảng khác rỗng nên không mã 2, E9 thoát 0. Người duyệt tin phần ngoài tầm đã kê hết, trong khi 19 component vẫn vô hình. | Chép điều khoản đếm của AC-3; mỗi dòng phải chứng bằng dấu hiệu đọc được từ mã. | fixed: AC-8 và E9 nay đòi số dòng bằng số chân đếm được từ đĩa, và mỗi dòng chứng bằng dấu hiệu đọc được từ mã |
