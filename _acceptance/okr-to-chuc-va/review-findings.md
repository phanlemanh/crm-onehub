# Review findings: okr-to-chuc-va (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Admins can now open the create dialog, but its 'start from template' path still returns 403**
  Người dùng thấy gì: Quản trị không phải trưởng phòng mở hộp tạo mục tiêu, chọn «Bắt đầu từ mẫu» rồi bấm Tạo thì bị từ chối, trong khi viết tay cùng mục tiêu đó lại được. Người dùng thấy một nút mà bấm vào không chạy.
  file: `apps/api/src/okr/okr-mau.service.ts`
  severity: high
  Đề xuất: new-contract

- **restoreDivision/restoreDepartment report a refusal as success instead of throwing an HttpException**
  Người dùng thấy gì: Khi khôi phục bị chặn, máy khách gọi qua khoá API vẫn nhận trạng thái thành công và phải tự đọc nội dung mới biết việc khôi phục không xảy ra. Người dùng trên màn hình vẫn thấy thông báo đúng.
  file: `apps/api/src/to-chuc/to-chuc.service.ts`
  severity: medium
  Đề xuất: known-limits

- **New useKhoMan hook duplicates useIsMobile and its 768 breakpoint in packages/ui**
  Người dùng thấy gì: Hai chỗ cùng quyết định thế nào là màn điện thoại bằng hai hằng số riêng; sau này đổi một chỗ mà quên chỗ kia thì ngăn kéo và khung có thể lệch nhau trên điện thoại. Hiện tại chưa ai thấy gì sai.
  file: `packages/ui/src/hooks/use-kho-man.ts`
  severity: medium
  Đề xuất: wont-fix

- **tenDangDung is a copy of tenKhongTrung's query**
  Người dùng thấy gì: Luật kiểm trùng tên khi khôi phục là bản chép của luật khi tạo mới; nếu sau này đổi một bên mà quên bên kia, hai thao tác sẽ xử trùng tên khác nhau. Hiện hai bên đang khớp.
  file: `apps/api/src/to-chuc/to-chuc.service.ts`
  severity: low
  Đề xuất: wont-fix

- **canCreate added to okr.danhSach output but nothing reads it**
  Người dùng thấy gì: Danh sách mục tiêu trả thêm một thông tin về quyền tạo mà không màn nào dùng. Người dùng không nhìn thấy gì khác.
  file: `apps/api/src/okr/okr-xem.service.ts`
  severity: low
  Đề xuất: wont-fix

- **themKrLe skips the 'da-bo' status check, so dropped objectives show a «Thêm KR» button that always fails**
  Người dùng thấy gì: Trên một mục tiêu đã bỏ, trưởng đơn vị và quản trị vẫn thấy nút «Thêm KR», nhưng bấm lưu thì báo lỗi. Người dùng bị mời làm một việc không thể làm được.
  file: `apps/api/src/okr/okr.service.ts`
  severity: high
  Đề xuất: new-contract

- **Admin who is not the unit head sees «Bắt đầu từ mẫu» in the new create-objective dialog, but okr.taoTuMau still returns 403**
  Người dùng thấy gì: Quản trị không phải trưởng phòng chọn mẫu để tạo mục tiêu thì bị từ chối quyền, còn tự gõ tay thì được. Hai cách tạo cho hai kết quả khác nhau.
  file: `apps/api/src/okr/okr-mau.service.ts`
  severity: medium
  Đề xuất: new-contract

- **New-KR dialog for an admin locks KR type, start value and owner because suaDuocCot is still mt.canEdit**
  Người dùng thấy gì: Quản trị không phải trưởng khi thêm KR trên màn hình chỉ tạo được loại KR mặc định, giá trị đầu bằng 0 và người phụ trách là chủ mục tiêu; các ô khác bị khoá. Muốn khác phải nhờ trưởng đơn vị hoặc nhập bảng tính.
  file: `apps/app/components/crm/record-sheet/objective-sheet.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 4 (assertion âm tính một mình): updateObjective của quản trị chỉ khẳng định status 403, không ghim thông điệp, không có đối chứng dương**
  Người dùng thấy gì: Bài kiểm xác nhận quản trị vẫn không sửa được mục tiêu của đơn vị khác chỉ bằng mã từ chối, nên một lý do từ chối khác cũng làm bài xanh. Sản phẩm không bị ảnh hưởng, chỉ là độ chắc của bài kiểm.
  file: `apps/api/test/okr-to-chuc-va-quyen.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 / 1: so-kr DOM chỉ kiểm URL record có chứa id KR, không kiểm loại bản ghi hay khung số đã mở**
  Người dùng thấy gì: Bài kiểm nút số của KR chỉ so id trên địa chỉ chứ không xác nhận đúng khung số đã mở. Người dùng không thấy gì sai; bài kiểm trên trình duyệt thật vẫn bao phần này.
  file: `apps/app/test/okr-to-chuc-va.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): nut-them chỉ kiểm khoá dialog.create trên URL, không kiểm ngăn tạo có mặt**
  Người dùng thấy gì: Bài kiểm nút «Thêm mục tiêu» chỉ xác nhận địa chỉ có cờ mở ngăn tạo, không xác nhận ngăn thật sự hiện. Bài kiểm trên màn thật vẫn kiểm việc tạo và lưu.
  file: `apps/app/test/okr-to-chuc-va.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay): seed gieoTruongBiLoai bỏ writer restoreDepartment, ghi thẳng archivedAt=null vào CSDL**
  Người dùng thấy gì: Dữ liệu mẫu cho một số bài kiểm được ghi thẳng vào cơ sở dữ liệu vì thao tác khôi phục thật nay từ chối tình huống đó. Bài kiểm đo trên dữ liệu mà sản phẩm không còn tạo ra, người dùng không bị ảnh hưởng.
  file: `apps/api/test/okr-hien-thi-san.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
