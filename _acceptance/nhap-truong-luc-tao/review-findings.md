# Review findings: nhap-truong-luc-tao (vòng 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): khuôn Ngày của bản ghi phiếu E3 nối với E3b chỉ bằng hai hằng chép tay, không round-trip**
  Người dùng thấy gì: Người dùng vẫn tạo và thấy đủ mười giá trị như hứa. Chỉ có điều nếu sau này cách máy chủ trả ngày đổi, bài kiểm phía giao diện có thể vẫn báo xanh trong khi phiếu hiện ngày sai, nên lỗi đó sẽ lọt tới người dùng thay vì bị chặn trước.
  Căn cứ: Hiện chưa có người dùng nào bị ảnh hưởng, chỉ là một mắt xích kiểm tra yếu có thể bỏ sót lỗi hiển thị ngày trong tương lai; nếu xảy ra thì người dùng tải lại hay sửa lại ô ngày là xong, không mất dữ liệu.
  file: `apps/app/test/nhap-truong-luc-tao.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Câu lỗi bắt buộc viết thẳng trong service, không qua FIELDS_CONFIG.messages, và nói khác câu của chính luật đó ở @crm/db (r1)**
  Người dùng thấy gì: Người gọi trực tiếp qua API có thể thấy hai câu báo lỗi khác nhau cho cùng một lỗi trường bắt buộc để trống. Người dùng trên màn hình không thấy khác biệt vì app tự dựng câu của nó.
  Căn cứ: Chỉ lệch chữ ở câu báo lỗi dành cho người gọi API, việc chặn tạo vẫn đúng và không mất dữ liệu; thống nhất chữ sau này rẻ và không gấp.
  file: `apps/api/src/fields/fields.service.ts`
  severity: medium
  Đề xuất: known-limits

- **useKhaiForm đồng bộ trạng thái «có thay đổi» bằng useEffect, trong khi trước đây việc này làm trong hàm xử lý sự kiện (r1)**
  Người dùng thấy gì: Không ảnh hưởng người dùng: hộp hỏi bỏ thay đổi vẫn hiện đúng khi đóng ô thêm nhanh sau khi đã gõ. Chỉ là cách viết mã lệch quy ước nội bộ.
  Căn cứ: Không có hậu quả nhìn thấy cho người dùng và không mất dữ liệu; sửa chỉ là chỉnh phong cách mã nên chi phí không đáng mở việc riêng.
  file: `apps/app/components/crm/record-sheet/quick-add.tsx`
  severity: low
  Đề xuất: wont-fix

- **17 khoá chữ của form tạo cũ được cho vào danh sách miễn trừ CHUA_NOI_KHAI thay vì bị xoá (r1)**
  Người dùng thấy gì: Trong kho chữ của app còn 17 dòng không còn được dùng ở màn nào. Người dùng không thấy gì, chỉ là chữ thừa nằm lại.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; dọn sau lúc nào cũng được mà không rủi ro.
  file: `apps/app/test/messages-guard.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Tạo cá nhân hỏng ở bước ghi trường tự tạo vẫn để lại công ty tạo từ tên miền email (công ty mồ côi, Kara vẫn được giao làm giàu) (r1)**
  Người dùng thấy gì: Khi tạo cá nhân gặp lỗi giá trị hiếm ở một trường tự tạo (ví dụ lựa chọn vừa bị lưu trữ), người dùng nhận báo lỗi nhưng công ty suy ra từ email vẫn được tạo và Kara vẫn đi làm giàu. Người dùng phải tự xoá công ty thừa.
  Căn cứ: Chỉ xảy ra trong tình huống hiếm, để lại một công ty thừa nhưng không mất dữ liệu thật và xoá tay được; sửa đụng tới thứ tự giao dịch nên tốn hơn hậu quả.
  file: `apps/api/src/contacts/contacts.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Lỗi tải fields.list hay fields.layout bị nuốt: form tạo hiện như không có trường tự tạo, dùng bố trí mặc định và vẫn cho gửi (r1)**
  Người dùng thấy gì: Khi danh sách trường không tải được, form vẫn mở không có ô trường tự tạo và không có nút thử lại. Nếu có trường bắt buộc thì người dùng chỉ nhận báo lỗi sau khi bấm Tạo.
  Căn cứ: Tải lại trang là gỡ được, không mất dữ liệu đã lưu và hợp đồng đã chủ ý cho phép gửi khi danh sách lỗi; thêm màn lỗi riêng có thể làm sau.
  file: `apps/app/components/crm/fields/form-tao.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không ghim thông điệp): đối chứng 'abc' vào ô Số của E3 (r1 · tệp đã đổi)**
  Người dùng thấy gì: Không ảnh hưởng trực tiếp người dùng. Bài kiểm tự động về nhập chữ vào ô số chưa chặt, nên một lỗi khác có thể làm bài xanh nhầm.
  Căn cứ: Chỉ là độ chặt của bài kiểm phụ ngoài các tiêu chí đã hứa, người dùng không mất gì; không đáng mở việc riêng.
  file: `apps/app/test/nhap-truong-luc-tao.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): bố trí trường của bài DOM không đi qua bộ sinh thật sapBoTri (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm tự động dùng bố trí trường dựng tay, hơi khác bố trí thật mà Cài đặt sinh ra. Người dùng không thấy gì, nhưng một lệch giữa bố trí thật và form có thể lọt khỏi bài kiểm này.
  Căn cứ: Không có hậu quả cho người dùng và các bài kiểm khác trong vòng vẫn đi qua bộ sinh thật; chỉnh lại fixture rẻ nhưng không gấp.
  file: `apps/app/test/nhap-truong-luc-tao.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
