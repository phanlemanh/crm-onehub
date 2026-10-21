# Review findings: truong-mot-cach-cu-xu (round 2)

## Trong hợp đồng

Không có finding trong hợp đồng ở round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Required custom SELECT/USER field with no stored value now renders an empty trigger (no dash, no placeholder)**
  Người dùng thấy gì: Trên phiếu, một trường tự tạo kiểu Chọn hoặc Người đã đặt bắt buộc mà bản ghi cũ chưa có giá trị sẽ hiện thành ô trống trơn, không có dấu «—» hay chữ gợi ý. Người dùng vẫn bấm vào ô để chọn được, nhưng nhìn thoáng qua không biết ô đó còn trống.
  Căn cứ: Chỉ ảnh hưởng cách hiển thị một ô trống, không mất hay sai dữ liệu, người dùng vẫn bấm vào chọn được bình thường, và chỉ xảy ra với bản ghi cũ chưa có giá trị ở trường mới đặt bắt buộc.
  file: `apps/app/components/crm/fields/kieu-truong.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (không có đối chứng dương): bài «lượt lưu chồng» không kiểm rằng hai lượt đã thật sự chồng nhau**
  Người dùng thấy gì: Không ảnh hưởng trực tiếp người dùng: tính năng vẫn báo lỗi lưu đúng câu tiếng Việt. Chỉ là một bài kiểm tự động có thể vẫn xanh dù lỗi bắn toast khi lưu chồng nhau quay lại sau này.
  Căn cứ: Không có hậu quả nào cho người dùng hôm nay, chỉ giảm độ tin của một bài kiểm, và có thể củng cố sau mà không đụng tới sản phẩm.
  file: `apps/app/test/truong-mot-cach.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Câu lỗi lưu trường chỉ chọn theo kiểu trường, không đọc mã lỗi tRPC, nên báo sai lý do (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi lưu một trường Chọn (kể cả Tiền tệ của thoả thuận) hoặc Người phụ trách bị hỏng vì lý do khác như mất mạng hay không đủ quyền, người dùng vẫn thấy câu nói lựa chọn bị lưu trữ hoặc người không còn trong đội. Câu này chỉ nêu sai nguyên nhân, giá trị trên màn hình vẫn về lại giá trị cũ.
  Căn cứ: Hậu quả nhẹ: không mất dữ liệu, giá trị về lại như cũ và người dùng thử lại được, chỉ là lời giải thích lệch; hợp đồng đã chủ động chọn cách chọn câu theo kiểu nên sửa sau cũng rẻ.
  file: `apps/app/components/crm/fields/kieu-truong.tsx`
  severity: medium
  Đề xuất: known-limits

- **OSuaCoKiem chép lại InlineField, để InlineField thành mã chết và docs/design.md trỏ sai thành phần (r1 · tệp đã đổi)**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào. Phía đội dựng, có hai bản của cùng một ô sửa và tài liệu thiết kế còn ghi tên cũ, dễ gây nhầm khi sửa về sau.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; chỉ là nợ dọn dẹp mà có thể gom làm một lượt sau, sửa lúc nào cũng rẻ như nhau.
  file: `apps/app/components/crm/fields/kieu-truong.tsx`
  severity: low
  Đề xuất: known-limits

- **Lỗi có lý do cụ thể của máy chủ bị thay bằng «Thử lại sau một lát» (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi lưu Tên miền trùng công ty khác hoặc nhập địa chỉ không hợp lệ, người dùng chỉ thấy câu chung bảo thử lại, không biết lỗi nằm ở đâu. Họ có thể thử lại mãi một việc sẽ không bao giờ thành công.
  Căn cứ: Không mất dữ liệu nhưng người dùng bị dẫn đi thử lại vô ích với lỗi cố định; đây là đánh đổi đã ghi trong hợp đồng nên muốn câu cụ thể trở lại thì nên mở một tính năng riêng.
  file: `apps/app/components/crm/fields/kieu-truong.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 4 (assert âm tính đứng một mình): ở khổ 375, do-man.mjs chỉ đo không có tràn ngang, không có đối chứng dương rằng phiếu đã mở (r1)**
  Người dùng thấy gì: Phép kiểm màn điện thoại có thể báo đạt dù phiếu chưa mở ra, nên chưa chắc đã chứng minh phiếu không bị cuộn ngang. Người dùng không thấy lỗi nào, chỉ là bằng chứng yếu hơn vẻ ngoài.
  Căn cứ: Không ảnh hưởng người dùng trực tiếp và không mất dữ liệu; rủi ro là bỏ lọt một lỗi bố cục, mà lỗi đó nhìn thấy và sửa được sau khi lên.
  file: `_acceptance/truong-mot-cach-cu-xu/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt thay cho quan hệ): ô DATE trong bảng chỉ kiểm textContent chứa '22' (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm ngày trong bảng khá lỏng nên nếu ngày bị hiện sai kiểu mà vẫn có số 22 thì không bị bắt. Người dùng có thể thấy ngày viết lạ trong bảng mà không ai phát hiện trước.
  Căn cứ: Lỗi nếu có chỉ là cách viết ngày, không mất dữ liệu và người dùng nhận ra ngay; siết bài kiểm sau rất rẻ.
  file: `apps/app/test/truong-mot-cach.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ chọn một số ca): ca null của ô bảng chỉ có 6 trên 11 kiểu (r1 · tệp đã đổi)**
  Người dùng thấy gì: Năm kiểu trường (Ô tích, Người, Chữ dài, Email, Điện thoại) chưa được kiểm khi giá trị trống, nên có thể có ô hiện chữ khác thay vì «—» mà không ai biết. Nếu có, người dùng sẽ thấy ô trống hiện lạ.
  Căn cứ: Chỉ là hiển thị ô trống, không mất dữ liệu, thấy ngay khi dùng; bổ sung ca kiểm sau không tốn nhiều.
  file: `apps/app/test/truong-mot-cach.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận khai 3 kiểu × phiếu/bảng × chuẩn/tự tạo nhưng trục 'bảng chuẩn' trùng với 'bảng tự tạo') (r1 · tệp đã đổi)**
  Người dùng thấy gì: Cột trường có sẵn trong bảng chưa được kiểm độc lập với cột tự tạo, nên nếu cột có sẵn vẽ khác đi thì có thể không ai thấy. Người dùng khi đó sẽ thấy hai loại cột hơi khác nhau.
  Căn cứ: Không mất dữ liệu và chỉ ảnh hưởng cách hiển thị; lỗi nếu có thì nhìn thấy được và sửa sau không đắt.
  file: `apps/app/test/truong-mot-cach.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay theo khuôn bên đọc): ma trận ô bảng dùng giá trị SELECT/DATE khác khuôn mà tableValuesFor thật trả về (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm ô bảng dùng dữ liệu tự dựng nên có thể xanh dù bảng ghép sai nhãn lựa chọn hay ngày với dữ liệu thật. Nếu sai, người dùng sẽ thấy ô Chọn hoặc Ngày hiện không đúng.
  Căn cứ: Lỗi nếu có chỉ là hiển thị và không đụng dữ liệu gốc; nhìn thấy ngay khi dùng nên sửa sau vẫn kịp.
  file: `apps/app/test/truong-mot-cach.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): vế dương 'trường chuẩn đi qua bảng' của quet-vo-tay chỉ dò bằng regex trên chữ (r1)**
  Người dùng thấy gì: Phép quét chưa chắc bắt được trường mà ai đó vẽ ngoài đường chung, nên một trường có thể lệch cách hiện mà không bị phát hiện. Người dùng khi đó có thể lại phân biệt được trường có sẵn với trường tự tạo.
  Căn cứ: Không mất dữ liệu, chỉ là lệch giao diện nhìn thấy được; rủi ro tăng dần khi có người sửa mã sau này nhưng siết phép quét lúc nào cũng được.
  file: `_acceptance/truong-mot-cach-cu-xu/rang/quet-vo-tay.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (tổng thay cho quan hệ từng hàng): E9 cộng số thẻ a của ba hàng liên kết thay vì kiểm mỗi hàng có một thẻ (r1)**
  Người dùng thấy gì: Phép đo chỉ đếm tổng số liên kết của ba hàng nên một hàng không bấm được vẫn có thể lọt nếu hàng khác bù. Người dùng khi đó gặp một giá trị Liên kết, Email hoặc Điện thoại là chữ trơn.
  Căn cứ: Rủi ro rất thấp vì cả ba hàng dùng chung một đường vẽ, nếu hỏng thường hỏng cả ba; lỗi không mất dữ liệu nên chấp nhận và ghi vết.
  file: `_acceptance/truong-mot-cach-cu-xu/rang/do-man.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 (quét lớp với mẫu hẹp hơn mẫu đã khai): tmc-ten-goi bỏ biến thể 'tuỷ chỉnh' (r1)**
  Người dùng thấy gì: Một cách viết sai dấu hiếm gặp của chữ «tuỳ chỉnh» có thể lọt vào chuỗi hiển thị mà không bị bắt. Người dùng nếu gặp sẽ thấy một tên gọi lệch với từ «trường».
  Căn cứ: Rất hiếm xảy ra, chỉ là chữ trên màn hình và người dùng không mất gì; sửa chữ sau là việc tức thì nên chấp nhận.
  file: `apps/app/test/truong-mot-cach.spec.ts`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Không có finding nào ở trạng thái này.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
