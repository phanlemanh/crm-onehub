# Review findings: okr-to-chuc-va (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **REST restore returns HTTP 200 even when nothing was restored**
  Người dùng thấy gì: Chương trình bên ngoài gọi khôi phục qua khoá API vẫn nhận kết quả thành công về mặt kỹ thuật dù đơn vị không được khôi phục; chỉ đọc nội dung trả về mới biết bị chặn. Giao diện của app thì báo đúng.
  file: `apps/api/src/to-chuc/to-chuc.service.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (một mình, chỉ phía âm): E9 chỉ assert updateObjective trả 403, không ghim thông điệp, không có đối chứng phía dương**
  Người dùng thấy gì: Bài kiểm tra việc quản trị vẫn không sửa được mục tiêu của đơn vị khác có thể báo xanh dù bị chặn vì lý do khác, nên nếu ai vô tình mở quyền sửa cho quản trị thì có thể không bị phát hiện ngay.
  file: `apps/api/test/okr-to-chuc-va-quyen.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert sự có mặt khi lời hứa là quan hệ): E9 hứa 'hàng okrObjective có đúng đơn vị' nhưng chỉ so cột level**
  Người dùng thấy gì: Bài kiểm tra có thể không phát hiện nếu mục tiêu quản trị tạo hộ bị gắn nhầm sang đơn vị khác cùng cấp, khiến mục tiêu hiện sai chỗ trong cây.
  file: `apps/api/test/okr-to-chuc-va-quyen.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3: E5 hứa luuTruXemTruoc trả 'đúng ba mục' nhưng không assert số mục và tập loại**
  Người dùng thấy gì: Bài kiểm tra có thể không phát hiện nếu hộp lưu trữ phòng ban hiện thừa hoặc trùng một lý do, nên người dùng có thể thấy lý do lặp lại mà không bị bắt trước khi giao.
  file: `apps/api/test/okr-to-chuc-va-to-chuc.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: E23 assert data-disabled khác "true", không kiểm ô có tồn tại, không có đối chứng phía dương**
  Người dùng thấy gì: Bài kiểm tra các ô trong hộp thêm KR mới có thể báo xanh dù ô đã bị đổi tên hoặc không được vẽ, nên lỗi ô bị khoá hoặc biến mất có thể lọt qua.
  file: `apps/app/test/okr-to-chuc-va.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (khai quét cả ma trận nhưng nhiều ô rỗng): expect.assertions đếm cả các assert hằng-đúng ở nhánh vi; E19 không đo 'không có toast thành công'**
  Người dùng thấy gì: Bài kiểm tra toast khôi phục có một vài kiểm chứng trống và chưa đếm rằng không hiện thông báo thành công, nên khả năng báo thành công nhầm khi khôi phục bị chặn khó bị bắt; hậu quả nhỏ, chấp nhận.
  file: `apps/app/test/okr-to-chuc-va.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **restoreDivision/restoreDepartment report a refusal as success instead of throwing an HttpException (r1)**
  Người dùng thấy gì: Khi khôi phục bị chặn, máy khách gọi qua khoá API vẫn nhận trạng thái thành công và phải tự đọc nội dung mới biết việc khôi phục không xảy ra. Người dùng trên màn hình vẫn thấy thông báo đúng.
  file: `apps/api/src/to-chuc/to-chuc.service.ts`
  severity: medium
  Đề xuất: known-limits

- **New useKhoMan hook duplicates useIsMobile and its 768 breakpoint in packages/ui (r1)**
  Người dùng thấy gì: Hai chỗ cùng quyết định thế nào là màn điện thoại bằng hai hằng số riêng; sau này đổi một chỗ mà quên chỗ kia thì ngăn kéo và khung có thể lệch nhau trên điện thoại. Hiện tại chưa ai thấy gì sai.
  file: `packages/ui/src/hooks/use-kho-man.ts`
  severity: medium
  Đề xuất: wont-fix

- **tenDangDung is a copy of tenKhongTrung's query (r1)**
  Người dùng thấy gì: Luật kiểm trùng tên khi khôi phục là bản chép của luật khi tạo mới; nếu sau này đổi một bên mà quên bên kia, hai thao tác sẽ xử trùng tên khác nhau. Hiện hai bên đang khớp.
  file: `apps/api/src/to-chuc/to-chuc.service.ts`
  severity: low
  Đề xuất: wont-fix

- **canCreate added to okr.danhSach output but nothing reads it (r1)**
  Người dùng thấy gì: Danh sách mục tiêu trả thêm một thông tin về quyền tạo mà không màn nào dùng. Người dùng không nhìn thấy gì khác.
  file: `apps/api/src/okr/okr-xem.service.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture viết tay): seed gieoTruongBiLoai bỏ writer restoreDepartment, ghi thẳng archivedAt=null vào CSDL (r1)**
  Người dùng thấy gì: Dữ liệu mẫu cho một số bài kiểm được ghi thẳng vào cơ sở dữ liệu vì thao tác khôi phục thật nay từ chối tình huống đó. Bài kiểm đo trên dữ liệu mà sản phẩm không còn tạo ra, người dùng không bị ảnh hưởng.
  file: `apps/api/test/okr-hien-thi-san.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).