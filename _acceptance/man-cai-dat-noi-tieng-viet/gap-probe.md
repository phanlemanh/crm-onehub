---
slug: man-cai-dat-noi-tieng-viet
at: 2026-09-04T10:05:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Phản biện context sạch — man-cai-dat-noi-tieng-viet

Một lượt, phiên tươi, chỉ đọc bốn artifact cộng bài học xuyên vòng. Không đọc mã
(mã của vòng này chưa tồn tại).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | Vế QUAN HỆ của AC-1 không có phép đo nào. E1 chỉ đọc mã và đếm 0 chuỗi viết thẳng; E11 chỉ soi kho chuỗi; E12 chấm chất lượng dịch. Không eval nào ĐỌC chữ hiện ra trên màn ở trạng thái thường. Đúng lớp đã ăn ③a [cua-vao-noi-tieng-viet#F1] | 54 chuỗi đã nối vào kho và kho đủ dấu, nhưng một trang server quên await getLocale rồi rơi về mặc định. Cả màn hiện sai tiếng. E1 xanh vì hết chuỗi viết thẳng, E11 xanh vì kho có dấu, E12 xanh vì bản dịch hay. Hồ sơ 12/12 trong khi sản phẩm sai toàn màn | Thêm eval dựng cả hai màn trên máy chủ thật ở hai locale; khẳng định ba vế: số chuỗi hai lượt bằng nhau, mỗi cặp khác nhau trừ bảng miễn trừ, lượt vi có dấu. Tập rỗng là thoát mã 2 | **fixed** — thêm E13 (`cai_dat_hai_tieng`), AC-1 viết lại theo quan hệ ba vế |
| P0 | evals | E2 quét cả một lớp mà không có ma trận toàn phần. Hợp đồng ghim mười một toast nhưng expected không đòi số bắt được BẰNG mười một — khác hẳn E3/E4/E5/E6. E8 không bù được: nó đối chiếu số FILE, không đối chiếu số VẬT [thuoc-cua-lat-3a-co-rang#F1] | Chân mới nhận `toast.success("…")` nhưng không nhận `toast.promise`, toast trong ba ngôi, hay toast gọi qua hàm trợ giúp. Thấy 6 trong 11, cả 6 đã sạch, exit 0. E8 vẫn xanh vì vẫn mở đủ mười file. Năm toast tiếng Anh còn nguyên | Khai trước bảng đóng mười một lời gọi (file, dòng, hình dạng); E2 đòi số bắt được bằng số dòng và thoát mã 2 khi thiếu. E8 đối chiếu thêm số VẬT. E7 cắm đột biến vào MỖI hình dạng | **fixed** — bảng đóng `toast-cua-lat.json`; E2, E7, E8 viết lại |
| P1 | evals | Bảng đóng của AC-6 là fixture viết tay bởi chính bên đọc nó, không gì buộc khớp màn thật. E9 bắt dân số FILE sinh từ đĩa nhưng dân số GIÁ TRỊ vẫn gõ tay. Và "tên workspace người nhập" không đóng được — nó đổi theo workspace | Màn hiện thêm một mã tiền tệ hoặc tên thương hiệu người viết bảng quên khai. Số quan sát vẫn bằng số dòng, exit 0. Phần tử bị quên không mang translate=no, trình duyệt tự dịch, không phép đo nào nhìn tới | Sinh ứng viên từ màn thật: mọi phần tử mang translate=no cộng mọi chuỗi giống hệt ở hai lượt. Đòi bằng nhau CẢ HAI CHIỀU — thừa trên màn mà thiếu trong bảng cũng là thoát mã 2. Tên workspace tách ra, đo bằng luật chứ không đếm dòng | **fixed** — AC-6 viết lại hai chiều; tên workspace tách sang luật riêng |
| P1 | evals | E10 tự vô hiệu hoá: AC-10 hứa không nhãn nào bị cắt, nhưng expected miễn trừ "truncate cố ý" — trong khi design BẮT BUỘC mọi vùng chứa nhãn mang truncate. Miễn trừ phủ đúng tập cần bắt. "Bề rộng hẹp nhất" không có con số ở artifact nào | Nhãn tiếng Việt tràn, truncate cắt thành "Đồng tiền báo cá…", người quản trị không đọc được. E10 thấy có truncate nên xếp "cố ý" và bỏ qua. Verifier lại chạy ở 1440px vì không ai ghim bề rộng | Ghim con số bề rộng vào hợp đồng và danh sách nhãn phải quan sát. Bỏ miễn trừ: scrollWidth lớn hơn clientWidth là ĐỎ kèm tên nhãn và hai số. Chạy lượt tiếng Anh làm đối chứng dương | **fixed** — ghim 360px; bỏ miễn trừ; thêm đối chứng dương lượt en |
| P1 | contract, evals | E5 đòi workspace CHƯA có tỷ giá và deal, nhưng không artifact nào khai cách dựng ra nó — trong khi hợp đồng khai môi trường sẵn có là workspace ĐÃ có dữ liệu. Bước gieo đi qua cơ sở dữ liệu, mà surfaces chỉ ghi [ui] [nhan-ung-dung-noi-tieng-viet#F3] | Tới S4 verifier không mở được hai trạng thái rỗng: hoặc BLOCKED phút chót lần nữa, hoặc lặng lẽ hạ E5 xuống mức đọc mã rồi ghi đạt — mất đúng câu "phải MỞ được chứ không suy từ mã" | Khai bước gieo trong hợp đồng: workspace thử, lệnh tạo, cách đăng nhập. Không có hạ tầng thì khai E5 thành giới hạn NGAY Ở CỔNG 1, không để phát hiện ở S4 | **fixed** — khai bước gieo: tạo workspace mới qua luồng người dùng thật (workspace mới không có tỷ giá và không có deal) |

Không finding nào bị `deferred` hay `rejected`. Cả năm sửa vào artifact trong
cùng lượt, không chạy lại phản biện (một lượt — phần mã còn ba vòng chấm ở S4).
