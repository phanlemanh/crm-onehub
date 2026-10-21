# Review findings: truong-mot-cach-cu-xu (round 1)

## Trong hợp đồng

- **Chuyển onError từ mutationOptions sang tham số của mutate() làm mất lỗi lưu khi có lượt lưu chồng hoặc phiếu đã đóng**
  AC: AC-3
  file: apps/app/components/crm/record-sheet/company-sheet.tsx:504
  severity: high
  source: bugs
  detail: Cả ba phiếu (company-sheet.tsx ~504/516, contact-sheet.tsx save/saveFields, deal-sheet.tsx save/saveFields) đã bỏ `onError: (error) => toast.error(error.message)` khỏi `useMutation(trpc.*.update.mutationOptions({...}))` và chuyển sang `update.mutate(vars, { onError: baoLoi(...) })`. Trong @tanstack/query-core 5.101.4 (mutationObserver.js), `mutate()` gọi `this.#currentMutation?.removeObserver(this)` trên lượt trước. Còn `#notify` chỉ gọi `#mutateOptions.onError` khi `this.hasListeners()`. Hệ quả: (a) lưu trường A, rồi lưu trường B trước khi A trả về (blur hay Enter liên tiếp, bấm hai ô tích); nếu A hỏng thì không có toast nào. (b) Sửa một ô rồi đóng phiếu trước khi máy chủ trả lời: observer đã hết listener, lỗi bị nuốt. Kho không có MutationCache onError chung (đã grep apps/app), nên lỗi mất hẳn. Giá trị trên phiếu lặng lẽ về giá trị cũ mà người dùng không biết là chưa lưu. Trước thay đổi, onError ở mức mutation luôn chạy. Cách sửa: giữ onError ở mutationOptions và suy khoá từ `variables` (hoặc `context`), không dựa vào callback của mutate().
  rationale: AC-3 hứa khi máy chủ từ chối một lượt lưu trường thì hiện toast «Chưa lưu được <nhãn>.»; finding cho thấy ở lượt lưu chồng hoặc phiếu đã đóng thì không có toast nào.

- **Trường tự tạo bắt buộc không truyền batBuoc: được xoá hoặc chọn «Không chọn» rồi nhận câu lỗi sai**
  AC: AC-3
  file: apps/app/components/crm/fields/record-fields.tsx:53
  severity: medium
  source: bugs
  detail: `moTaTruongTuTao` dựng MoTaTruong mà không đặt `batBuoc: field.required`, dù `required` có sẵn trong recordFieldOutput. Hệ quả: OSuaCoKiem không chặn ô trống ở phía khách (câu «<nhãn> không được để trống» viết sẵn không bao giờ dùng cho trường tự tạo). OChon vẫn thêm mục RONG cho SELECT/USER bắt buộc. Khi gửi null, coerceValue ném «<label> cannot be empty.», nhưng toast lại hiện «Chưa lưu được X. Thử lại sau một lát.» (TEXT/NUMBER…), hoặc «Lựa chọn này vừa bị lưu trữ» (SELECT), hoặc «Người này không còn trong đội» (USER), đều sai lý do. Trước thay đổi, ít nhất câu máy chủ đúng lý do vẫn hiện ra.
  rationale: AC-3 yêu cầu trường bắt buộc để trống hiện câu «không được để trống» và không gọi lưu; finding cho thấy trường tự tạo bắt buộc không được chặn ở phía khách.

- **Cột bảng của trường SELECT hiện «—» khi bản ghi giữ một lựa chọn đã bị lưu trữ**
  AC: AC-7
  file: apps/app/components/crm/fields/field-columns.tsx:35
  severity: medium
  source: bugs
  detail: `tableValuesFor` → `tableValue` (apps/api/src/fields/fields.service.ts:681) trả nhãn tra từ `definition.options`, gồm cả lựa chọn đã lưu trữ (WITH_OPTIONS không lọc archivedAt). Nhưng cột mới dựng `luaChon` từ `fields.list`, mà `serializeField` đã lọc bỏ lựa chọn có archivedAt. Gỡ một lựa chọn ở Cài đặt › Trường sẽ đặt archivedAt (fields.service.ts ~207), còn các bản ghi đang giữ nó vẫn có giá trị. `veGiaTri` case SELECT không tìm thấy nhãn nên trả `<EmptyCellValue />`, tức ô hiện «—». Trước thay đổi, ô in thẳng nhãn. Trên phiếu thì `serializeFieldFor` có thêm lựa chọn cũ nên vẫn hiện nhãn, vì vậy bảng và phiếu lệch nhau: dữ liệu có thật nhưng bảng báo trống.
  rationale: AC-7 hứa ô Chọn hiện bằng nhãn lựa chọn; finding cho thấy bản ghi đang giữ lựa chọn đã lưu trữ lại hiện «—» dù giá trị có thật.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Câu lỗi lưu trường chỉ chọn theo kiểu trường, không đọc mã lỗi tRPC, nên báo sai lý do**
  Người dùng thấy gì: Khi lưu một trường Chọn (kể cả Tiền tệ của thoả thuận) hoặc Người phụ trách bị hỏng vì lý do khác như mất mạng hay không đủ quyền, người dùng vẫn thấy câu nói lựa chọn bị lưu trữ hoặc người không còn trong đội. Câu này chỉ nêu sai nguyên nhân, giá trị trên màn hình vẫn về lại giá trị cũ.
  Căn cứ: Hậu quả nhẹ: không mất dữ liệu, giá trị về lại như cũ và người dùng thử lại được, chỉ là lời giải thích lệch; hợp đồng đã chủ động chọn cách chọn câu theo kiểu nên sửa sau cũng rẻ.
  file: `apps/app/components/crm/fields/kieu-truong.tsx`
  severity: medium
  Đề xuất: known-limits

- **OSuaCoKiem chép lại InlineField, để InlineField thành mã chết và docs/design.md trỏ sai thành phần**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào. Phía đội dựng, có hai bản của cùng một ô sửa và tài liệu thiết kế còn ghi tên cũ, dễ gây nhầm khi sửa về sau.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; chỉ là nợ dọn dẹp mà có thể gom làm một lượt sau, sửa lúc nào cũng rẻ như nhau.
  file: `apps/app/components/crm/fields/kieu-truong.tsx`
  severity: low
  Đề xuất: known-limits

- **Lỗi có lý do cụ thể của máy chủ bị thay bằng «Thử lại sau một lát»**
  Người dùng thấy gì: Khi lưu Tên miền trùng công ty khác hoặc nhập địa chỉ không hợp lệ, người dùng chỉ thấy câu chung bảo thử lại, không biết lỗi nằm ở đâu. Họ có thể thử lại mãi một việc sẽ không bao giờ thành công.
  Căn cứ: Không mất dữ liệu nhưng người dùng bị dẫn đi thử lại vô ích với lỗi cố định; đây là đánh đổi đã ghi trong hợp đồng nên muốn câu cụ thể trở lại thì nên mở một tính năng riêng.
  file: `apps/app/components/crm/fields/kieu-truong.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 4 (assert âm tính đứng một mình): ở khổ 375, do-man.mjs chỉ đo không có tràn ngang, không có đối chứng dương rằng phiếu đã mở**
  Người dùng thấy gì: Phép kiểm màn điện thoại có thể báo đạt dù phiếu chưa mở ra, nên chưa chắc đã chứng minh phiếu không bị cuộn ngang. Người dùng không thấy lỗi nào, chỉ là bằng chứng yếu hơn vẻ ngoài.
  Căn cứ: Không ảnh hưởng người dùng trực tiếp và không mất dữ liệu; rủi ro là bỏ lọt một lỗi bố cục, mà lỗi đó nhìn thấy và sửa được sau khi lên.
  file: `_acceptance/truong-mot-cach-cu-xu/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt thay cho quan hệ): ô DATE trong bảng chỉ kiểm textContent chứa '22'**
  Người dùng thấy gì: Bài kiểm ngày trong bảng khá lỏng nên nếu ngày bị hiện sai kiểu mà vẫn có số 22 thì không bị bắt. Người dùng có thể thấy ngày viết lạ trong bảng mà không ai phát hiện trước.
  Căn cứ: Lỗi nếu có chỉ là cách viết ngày, không mất dữ liệu và người dùng nhận ra ngay; siết bài kiểm sau rất rẻ.
  file: `apps/app/test/truong-mot-cach.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ chọn một số ca): ca null của ô bảng chỉ có 6 trên 11 kiểu**
  Người dùng thấy gì: Năm kiểu trường (Ô tích, Người, Chữ dài, Email, Điện thoại) chưa được kiểm khi giá trị trống, nên có thể có ô hiện chữ khác thay vì «—» mà không ai biết. Nếu có, người dùng sẽ thấy ô trống hiện lạ.
  Căn cứ: Chỉ là hiển thị ô trống, không mất dữ liệu, thấy ngay khi dùng; bổ sung ca kiểm sau không tốn nhiều.
  file: `apps/app/test/truong-mot-cach.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận khai 3 kiểu × phiếu/bảng × chuẩn/tự tạo nhưng trục 'bảng chuẩn' trùng với 'bảng tự tạo')**
  Người dùng thấy gì: Cột trường có sẵn trong bảng chưa được kiểm độc lập với cột tự tạo, nên nếu cột có sẵn vẽ khác đi thì có thể không ai thấy. Người dùng khi đó sẽ thấy hai loại cột hơi khác nhau.
  Căn cứ: Không mất dữ liệu và chỉ ảnh hưởng cách hiển thị; lỗi nếu có thì nhìn thấy được và sửa sau không đắt.
  file: `apps/app/test/truong-mot-cach.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay theo khuôn bên đọc): ma trận ô bảng dùng giá trị SELECT/DATE khác khuôn mà tableValuesFor thật trả về**
  Người dùng thấy gì: Bài kiểm ô bảng dùng dữ liệu tự dựng nên có thể xanh dù bảng ghép sai nhãn lựa chọn hay ngày với dữ liệu thật. Nếu sai, người dùng sẽ thấy ô Chọn hoặc Ngày hiện không đúng.
  Căn cứ: Lỗi nếu có chỉ là hiển thị và không đụng dữ liệu gốc; nhìn thấy ngay khi dùng nên sửa sau vẫn kịp.
  file: `apps/app/test/truong-mot-cach.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): vế dương 'trường chuẩn đi qua bảng' của quet-vo-tay chỉ dò bằng regex trên chữ**
  Người dùng thấy gì: Phép quét chưa chắc bắt được trường mà ai đó vẽ ngoài đường chung, nên một trường có thể lệch cách hiện mà không bị phát hiện. Người dùng khi đó có thể lại phân biệt được trường có sẵn với trường tự tạo.
  Căn cứ: Không mất dữ liệu, chỉ là lệch giao diện nhìn thấy được; rủi ro tăng dần khi có người sửa mã sau này nhưng siết phép quét lúc nào cũng được.
  file: `_acceptance/truong-mot-cach-cu-xu/rang/quet-vo-tay.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (tổng thay cho quan hệ từng hàng): E9 cộng số thẻ a của ba hàng liên kết thay vì kiểm mỗi hàng có một thẻ**
  Người dùng thấy gì: Phép đo chỉ đếm tổng số liên kết của ba hàng nên một hàng không bấm được vẫn có thể lọt nếu hàng khác bù. Người dùng khi đó gặp một giá trị Liên kết, Email hoặc Điện thoại là chữ trơn.
  Căn cứ: Rủi ro rất thấp vì cả ba hàng dùng chung một đường vẽ, nếu hỏng thường hỏng cả ba; lỗi không mất dữ liệu nên chấp nhận và ghi vết.
  file: `_acceptance/truong-mot-cach-cu-xu/rang/do-man.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 (quét lớp với mẫu hẹp hơn mẫu đã khai): tmc-ten-goi bỏ biến thể 'tuỷ chỉnh'**
  Người dùng thấy gì: Một cách viết sai dấu hiếm gặp của chữ «tuỳ chỉnh» có thể lọt vào chuỗi hiển thị mà không bị bắt. Người dùng nếu gặp sẽ thấy một tên gọi lệch với từ «trường».
  Căn cứ: Rất hiếm xảy ra, chỉ là chữ trên màn hình và người dùng không mất gì; sửa chữ sau là việc tức thì nên chấp nhận.
  file: `apps/app/test/truong-mot-cach.spec.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
