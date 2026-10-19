---
slug: so-do-quanh-muc-tieu
at: 2026-10-15T05:16:40Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | AC-3 hứa ẩn mục tiêu giới hạn G ở cả phía trên lẫn phía dưới tâm, nhưng E3 chỉ đo G phía dưới (sd-g góp vào sd-a-1); bộ gieo không có ca G phía trên và không đột biến nào phủ | Mục tiêu X mà U thấy góp vào G giới hạn, G góp lên KR công ty; hàm đi lên dựng nút từ id đích căn chỉnh của X nên tên G lộ cho U; E3 và đột biến (d) vẫn xanh | Ca CSDL G phía trên dựng bằng writer thật trong beforeAll, assert không tên, không nút, không cạnh, gopLenCongTy rỗng, kèm đối chứng dương quản trị; đột biến (f) ghim 'lo muc tieu gioi han phia tren' | fixed: AC-3 thêm ca G phía trên, E3 thêm ca và đối chứng dương, E15 thêm (f), design ghi luật bỏ đích ngoài tập đọc được |
| P0 | design | Dòng sổ bỏ design-pass ghi nguồn một-lối nhưng lối kia chưa chết — khung vẽ của DH4 đã gộp vào nhánh; bản mẫu 14/10 thiếu dòng góp lên công ty, nhóm Góp vào nó và nút trong ngăn [tac-nhan-va#F2] [d-20261015T023444Z-9] | Cổng Phạm vi ký tưởng việc bỏ là bắt buộc; dòng chở ngưỡng 10 giây lần đầu được nhìn ở S4 hoặc phiên nghiệm thu; khó đọc thì quay lại S1 hoặc nghiệm thu CHẾT | Dòng sổ thay mới nguồn chỉ-người-có, khuyến nghị kèm giá giờ máy, lên thẻ thành câu Hỏi | human-gate1: dòng sổ mới (supersedes d-20261015T051250Z-8) thành Hỏi-2 ở Cổng Phạm vi |
| P1 | evals | AC-5 hứa dòng góp lên công ty liệt kê đúng tập KR công ty nhưng E5 và E12 chỉ đo chuỗi có mặt; biến thể nhiều mục có kr rỗng (sd-a3-1) không được đo | Renderer dựng dòng từ mọi KR của mục tiêu công ty nên in thêm n1-k2, E5 và E12 vẫn xanh; người dự đọc sai KR, nghiệm thu CHẾT; hoặc trang vỡ khi kr rỗng | E5 thêm biến thể sd-a3-1, so tập bằng nhau rút từ gopLenCongTy, phủ định n1-k2 ghim 'kr cong ty thua: n1-k2'; đột biến dòng rút từ mọi KR; E12 so tập | fixed: E5 bốn biến thể so tập bằng nhau và phủ định, E12 so tập rút từ hằng bộ gieo, E15 thêm (g), AC-5 ghi quan hệ tập bằng nhau |
| P1 | contract | Trục A có giá trị góp sang kỳ cha mà không AC nào nhận; phép kiểm tập con của E3 so với cayCanChinh cùng dùng mucTieuCuaCay nên sai cùng nhau | KR công ty ở kỳ năm, mục tiêu phòng ban ở kỳ quý; nếu tập đọc không gồm kỳ cha thì màn in chưa có đường lên đúng ca phiên nghiệm thu đo, nghiệm thu CHẾT | Vế kỳ cha ở AC-1 kèm ca CSDL ở E1 dựng bằng writer thật, đột biến chỉ lấy kỳ tâm ghim 'mat duong len ky cha' | fixed: AC-1 thêm vế kỳ cha, E1 thêm ca dựng trong beforeAll, E15 thêm (h) |
| P2 | design | Ca rỗng in câu khẳng định chưa có đường lên công ty cho cả ca đường lên bị cắt vì mục tiêu ẩn, và trạng thái dẫn người đi gắn căn chỉnh | Trưởng đơn vị không thấy mục tiêu bộ phận ở giữa, đọc chưa có đường lên nên trả lời sai ở nghiệm thu hoặc tạo căn chỉnh trùng | Chữ ca rỗng đúng cả hai ca mà không lộ mục tiêu ẩn, ghi vào AC-5 và E5, ca bị cắt assert đúng chữ ấy | fixed: chữ đổi thành «Không thấy đường lên công ty trong phạm vi bạn xem được.» ở design, AC-5; ca G phía trên của E3 assert gopLenCongTy rỗng |
