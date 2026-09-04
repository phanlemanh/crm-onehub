---
slug: cua-vao-noi-tieng-viet
at: 2026-09-04T02:15:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Phản biện ngữ cảnh sạch — cua-vao-noi-tieng-viet

Một phiên tươi, chỉ được đọc bốn hồ sơ của vòng cộng bài học của các vòng trước.
Không đọc mã (mã chưa tồn tại), không thấy hội thoại thiết kế.

Cả năm phát hiện đã SỬA trong lượt này. Một lượt, không phản biện lại.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | E1 và E2 trừ "phần giống hệt nhau giữa hai thứ tiếng" TRƯỚC khi đếm — ngược đúng câu cuối AC-1, vốn tuyên giống hệt nhau LÀ đỏ. Assert đo chuỗi-có-mặt trong khi lời hứa là một quan hệ | Một tiêu đề màn quên nối vào kho chuỗi nên dựng ra "Welcome back" ở CẢ lượt vi lẫn en. E1 xếp nó vào phần giống hệt nhau rồi trừ đi; phần còn lại 0 chuỗi tiếng Anh; sáu ô ghim vẫn có chữ nên không ô nào thiếu; exit 0 — chân xanh trong khi sản phẩm sai | Bỏ phép trừ theo giống-hệt-nhau. Với từng ô trong sáu ô của E1 và chín ô của E2, khẳng định quan hệ ba vế: vi KHÁC en, VÀ vi mang dấu, VÀ en đúng bản đã ghim. Trùng nhau ngoài bảng đóng của AC-6 là đỏ và in nguyên văn | **fixed** — `expected` của E1 và E2 viết lại theo đúng thước đo này |
| P0 | evals | AC-14 hứa câu lỗi dự phòng hiện tiếng Việt, nhưng KHÔNG eval nào mở trạng thái lỗi. E14 là eval duy nhất, và ba đầu vào của nó đều là trạng thái thường. Cùng lớp lỗi kho đã trả giá [nhan-ung-dung-noi-tieng-viet#F2]. Thêm nữa AC-14 trỏ mục "Known limits" mà hợp đồng không có mục tên đó | Lập trình viên bỏ sót đúng câu dự phòng trong nhánh catch. E1 và E2 chỉ dựng trạng thái thường nên chuỗi đó không bao giờ vào file chữ-hiện-ra; hội đồng E14 không có đầu vào nào chứa câu lỗi, chấm trên trạng thái thường rồi cho đạt; mọi chân máy exit 0 — chân xanh trong khi sản phẩm sai | Thêm một chân máy ép ĐỨT MẠNG thật, chụp chữ trong thông báo nổi ở hai thứ tiếng, khẳng định quan hệ; không nổi được thông báo thì thoát mã 2. Xuất chữ đó thành đầu vào bắt buộc thứ tư của E14. Thêm mục Known limits vào hợp đồng | **fixed** — thêm E17 cùng ổ cắm `cua_vao_loi_mang`; E14 nhận đầu vào thứ tư `evidence/E14-chu-loi.txt`; hợp đồng có mục `## Known limits` |
| P1 | contract | Trục C khai NĂM ô cách chọn tiếng, AC-9 chỉ ghim BA lượt kiểm — số khẳng định nhỏ hơn số phần tử của lớp đã tuyên. Và When của AC-9 đi qua máy chủ, nhưng E9 chạy trên hàm thuần, không có lượt yêu cầu thật nào | Danh sách cho phép của nhánh cookie viết sai nên cookie `lang=vi` rơi xuống Accept-Language. Nhân viên đã tự chọn tiếng Việt, máy khai Accept-Language en, mở lại và thấy tiếng Anh. E9 không có lượt cookie vi nên ba lượt còn lại vẫn đúng; E1 và E2 tự đặt tiếng cho từng lượt dựng nên không đi qua nhánh mặc định; exit 0 — chân xanh trong khi sản phẩm sai | Ma trận toàn phần năm ô vào AC-9, `expected` của E9 ghim đúng năm khẳng định. Thêm một chân đi qua MÁY CHỦ THẬT với ba lượt yêu cầu, khẳng định cả thuộc tính lang của thẻ html lẫn tiêu đề màn hiện ra | **fixed** — AC-9 viết lại thành ma trận năm ô; E9 ghim năm khẳng định; thêm E18 đi qua máy chủ thật |
| P1 | evals | E6 tự khai dân số "sinh từ mã đang chạy" nhưng không ghim SỐ phần tử của lớp trước khi đọc, và không nói fixture có gieo nhà cung cấp SSO không. Guard duy nhất là dân-số-rỗng, không chặn dân số THIẾU. Cùng lớp lỗi đã ghi [d-20260904T015002Z-11043] | Fixture không gieo nhà cung cấp SSO nào, và ô gợi ý acme.com bị đổi selector lúc nối kho chuỗi. Chân thu về sáu giá trị thay vì mười ba, dân số khác rỗng nên không bị từ chối, cả sáu đều đạt nên exit 0. Nút SSO mang tên quản trị tự gõ vẫn thiếu dấu, trình duyệt tự dịch tên tổ chức — chân xanh trong khi sản phẩm sai | Bảng đóng mười ba giá trị viết vào AC-6 và vào `expected` của E6, mỗi dòng một giá trị và nơi nó hiện ra. Fixture gieo sẵn một nhà cung cấp SSO và một workspace. Số quan sát phải BẰNG số dòng; thiếu dòng nào thì thoát mã 2 và gọi tên dòng đó | **fixed** — AC-6 nay là bảng đóng mười ba dòng; `expected` của E6 đòi đếm bằng mười ba và gieo sẵn fixture |
| P1 | evals | E15 tuyên chạy cả hai chiều của "từng chân trong danh sách", nhưng danh sách đóng không được viết trước ở đâu, N không phải số ghim, và dân số suy từ chính thư mục mà bộ kiểm sắp đọc — một đẳng thức tự thoả. Cùng chỗ bài học đã ghi [thuoc-cua-lat-3a-co-rang#F1]. Ngoài ra E15 gắn AC-1 trong khi nó không đo chữ nào của trang | Bốn chân chưa có mục khai sinh. E15 quét thư mục, thấy mười một mục, chạy mười một, in bảng mười một dòng, số dòng bằng số mục tìm được nên exit 0. Chiều đỏ của E13 chưa bao giờ được chứng minh, nên dòng chân Comp AI còn nguyên mà E13 vẫn xanh — chân xanh trong khi sản phẩm sai | Danh sách đóng viết ngay trong evals.yaml, N ghim thành một số. E15 khẳng định số mục chạy được bằng N và tên từng mục khớp danh sách; thiếu mục nào thì thoát mã 2. Đổi criterion sang tiêu chí về chính giàn đo | **fixed** — `expected` của E15 ghim N = 15 và liệt kê đủ tên; cấm suy dân số từ thư mục; criterion đổi sang AC-11 |

## Ghi chú

`claim-scan` chạy được (exit 0) và tìm thấy corpus, nên phản biện có đủ năm đầu
vào. Nó bỏ qua 1 dòng hỏng trong `decisions.jsonl` của `thuoc-cua-lat-3a-co-rang`
và loại 4 claim có id không hợp lệ ở hai vòng tiếng Việt — không ảnh hưởng lượt
này, nhưng là vết cần dọn khi vòng đó đóng.

Hai trong năm phát hiện trích đúng id bài học của vòng trước. Cả hai đều đúng chỗ
kho đã trả giá thật — đó là bằng chứng corpus bài học đang có tác dụng, không chỉ
nằm đó.
