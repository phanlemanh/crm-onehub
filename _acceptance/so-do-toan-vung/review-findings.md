# Review findings: so-do-toan-vung (round 4)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Old link xemOkr=cay&donOkr=nguoi:<id> becomes moDonVi=nguoi:<id>, which matches no card, so the first Esc in full screen is swallowed**
  Người dùng thấy gì: Ai mở một đường dẫn cũ đã lưu có trỏ tới một người, rồi bấm Toàn màn hình, sẽ phải nhấn Esc hai lần mới thoát. Lần đầu không thấy gì xảy ra vì không có thẻ nào đang mở.
  Căn cứ: Hậu quả nhẹ: không mất dữ liệu, chỉ thừa một lần nhấn Esc, và người dùng tự thoát được ngay bằng cách nhấn lần nữa hoặc bấm nút Thoát toàn màn hình; chỉ xảy ra với đường dẫn cũ hiếm gặp.
  file: `apps/app/app/(app)/[slug]/okr/so-do/duong-so-do.ts`
  severity: low
  Đề xuất: known-limits

- **Bộ lọc Sơ đồ bị chép nguyên khối, bản thứ hai nằm trong nhánh «trang» mà app không còn gọi (r3)**
  Người dùng thấy gì: Người dùng không thấy gì khác: màn Sơ đồ vẫn chạy đúng. Chỉ là sau này khi sửa bộ lọc, một bản chép không còn dùng có thể bị bỏ quên và lệch.
  Căn cứ: Không ảnh hưởng người dùng hiện tại và không mất dữ liệu; chỉ làm lần sửa sau dễ sót, dọn sau cũng rẻ.
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/so-do-don-vi.tsx`
  severity: medium
  Đề xuất: known-limits

- **Đường Sơ đồ khai lần thứ hai bằng regex, tách khỏi hằng DUONG_SO_DO (r3)**
  Người dùng thấy gì: Hôm nay màn Sơ đồ vẫn dựng đúng khung và nút Toàn màn hình. Nếu sau này đổi địa chỉ trang Sơ đồ mà quên sửa chỗ thứ hai, khung toàn vùng và nút sẽ lặng lẽ biến mất.
  Căn cứ: Chưa gây lỗi nào cho người dùng và chỉ xảy ra nếu có người đổi địa chỉ trang sau này; ghi lại để người đổi biết là đủ.
  file: `apps/app/app/(app)/[slug]/okr/toan-man-hinh-luat.ts`
  severity: low
  Đề xuất: known-limits

- **Còn chuỗi giao diện chết sau khi bỏ cách xem Sơ đồ và trang riêng (r3)**
  Người dùng thấy gì: Người dùng không thấy gì; vài dòng chữ không còn được dùng nằm thừa trong tệp chữ.
  Căn cứ: Không có hậu quả nào với người dùng, chỉ thừa vài dòng chữ; dọn lúc nào cũng được.
  file: `apps/app/lib/messages/okr-toan-canh.ts`
  severity: low
  Đề xuất: known-limits

- **chuCuaEval dùng regex cờ /g với .test() trong filter: tệp thước khai trong paths bị rơi xen kẽ, quét chuỗi bỏ (vế b) hụt mà không báo (r3)**
  Người dùng thấy gì: Bước kiểm tra tự động xem hồ sơ cũ có còn nhắc đường đã bỏ hay không có thể lặng lẽ bỏ sót một số tệp. Hôm nay chưa sót gì, nhưng sau này một hồ sơ cũ lỗi thời có thể lọt mà không ai được báo.
  Căn cứ: Chưa làm sai kết quả nào hôm nay và không động tới dữ liệu người dùng; nhưng lỗi im lặng nên nên sửa trong một việc riêng cho công cụ rà hồ sơ.
  file: `_acceptance/so-do-toan-vung/rang/giu-ho-so.mjs`
  severity: medium
  Đề xuất: new-contract

- **Đường dẫn trên dải công cụ màn quanh mục tiêu giữ khung xương mãi khi quanhMucTieu lỗi hay NOT_FOUND (r3)**
  Người dùng thấy gì: Khi mục tiêu bị xoá, không có quyền xem, hoặc mạng lỗi, phần thân màn báo đúng nhưng tên mục tiêu trên đường dẫn phía trên cứ nhấp nháy như đang tải mãi.
  Căn cứ: Chỉ là một chi tiết gây khó hiểu nhẹ vì thân màn đã nói rõ chuyện gì xảy ra; không mất dữ liệu, tải lại hay quay về sơ đồ là xong.
  file: `apps/app/app/(app)/[slug]/okr/so-do/dai-cong-cu.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): ô (d) của vk6-hai-kieu đọc mã nguồn objective-sheet.tsx thay vì bấm nút «Xem trên sơ đồ» (r3 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm tự động chỉ đọc chữ trong mã chứ chưa bấm thật nút «Xem trên sơ đồ», nên nếu nút hỏng khi bấm thì bài kiểm vẫn xanh. Người dùng chỉ phát hiện được khi xem màn thật.
  Căn cứ: Phần bấm thật vẫn do ảnh chụp màn thật và người ký kiểm ở bước sau, nên rủi ro lọt lỗi thấp; tự động hoá thêm có thể làm sau.
  file: `apps/app/test/okr-so-do-toan-vung.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): giu-ho-so.test.mjs dựng tệp kết quả màn bằng tay, không cho qua bên ghi (r3)**
  Người dùng thấy gì: Bài kiểm công cụ rà hồ sơ không thử đường ghi kết quả thật, nên nếu hai bên lệch khuôn thì lượt kiểm sau mới đỏ chứ không báo trước. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ làm một lượt kiểm nội bộ đỏ muộn hơn, không đụng sản phẩm hay dữ liệu, và đỏ thì thấy ngay.
  file: `_acceptance/so-do-toan-vung/rang/giu-ho-so.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (đối chứng dương thiếu): E11 hứa đối chứng dương khung-man-chung nhưng GIU.kiemDuong không có nó (r3)**
  Người dùng thấy gì: Công cụ rà hồ sơ cũ thiếu một ca tự thử, nên nếu nó bỏ sót một loại hồ sơ thì không tự báo. Người dùng cuối không thấy ảnh hưởng.
  Căn cứ: Chưa có lỗi thực, chỉ là lưới an toàn nội bộ mỏng hơn lời hứa; thêm ca thử sau rẻ.
  file: `_acceptance/so-do-toan-vung/rang/giu-ho-so.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng bỏ sót phần tử): regex TEP_THUOC có cờ /g dùng .test() trong filter nên mất cách một tệp thước khai ở paths (r3)**
  Người dùng thấy gì: Công cụ rà hồ sơ cũ bỏ qua âm thầm cứ hai tệp thước thì một tệp, nên lời hứa «quét mọi hồ sơ» không đủ. Hôm nay chưa sót gì, nhưng về sau có thể bỏ lọt một hồ sơ lỗi thời mà không báo.
  Căn cứ: Không ảnh hưởng người dùng cuối và không mất dữ liệu, nhưng là lỗi im lặng nên nên sửa chung với lỗi cùng gốc trong một việc riêng.
  file: `_acceptance/so-do-toan-vung/rang/giu-ho-so.mjs`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 5 (ma trận không viết trước): vk6-hep lọc danh sách nhóm mong đợi theo chính nhóm thấy được, nên thiếu nhóm vẫn xanh (r3 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm tự động trên màn hẹp không bắt được trường hợp danh sách thiếu một trong bốn nhóm. Nếu sau này thiếu nhóm, người dùng điện thoại sẽ thấy danh sách thiếu mà bài kiểm vẫn xanh.
  Căn cứ: Hôm nay không có bằng chứng màn thiếu nhóm, và ảnh chụp màn thật ở khổ hẹp sẽ lộ ra nếu có.
  file: `apps/app/test/okr-so-do-toan-vung.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): vk6-chu dùng danh sách khoá gõ tay thay vì rút từ object vi, và bỏ sót khoá xemTrenSoDo (r3 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm chữ song ngữ không kiểm nút «Xem trên sơ đồ» trong ngăn, nên nếu chữ tiếng Anh của nút đó bị trùng hoặc sai thì không ai được báo trước. Chữ hiện hành chưa được chứng minh sai.
  Căn cứ: Chỉ là bài kiểm chưa phủ hết, chữ sai nếu có thì người dùng thấy và sửa dễ, không mất dữ liệu.
  file: `apps/app/test/okr-so-do-toan-vung.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): dh4-cach-xem sau khi đổi chỉ còn kiểm vắng mặt, không có đối chứng dương rằng ToanCanh đã dựng (r3 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm chỉ xác nhận cách xem Sơ đồ đã biến khỏi trang Sức khoẻ, chưa xác nhận trang Sức khoẻ vẫn hiện nội dung. Nếu trang đó trống thì bài kiểm này không báo.
  Căn cứ: Trang trống sẽ lộ ngay khi mở và các bài kiểm khác của Sức khoẻ cũng phủ nó; không mất dữ liệu.
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận khai trong expected không khớp số phần tử bài còn đo): ux-lai-thu-8c-okr E2 vẫn hứa 3 thành phần × N 1, 2 sau khi gỡ ca nút Cây (r3)**
  Người dùng thấy gì: Hồ sơ cũ về thẻ OKR còn hứa đo ca có hai người xem nhưng bài kiểm không còn ca đó. Nếu chữ «N người xem» sai ở số nhiều thì không bài nào bắt.
  Căn cứ: Chỉ là một ca số nhiều trên thẻ bị bỏ khỏi bài kiểm, sai thì chỉ là chữ lệch, người dùng không mất dữ liệu.
  file: `_acceptance/ux-lai-thu-8c-okr/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (không ghim được thông điệp đỏ): man.mjs không in các chuỗi đỏ mà E10 ghim (r3)**
  Người dùng thấy gì: Công cụ đo màn thật vẫn báo lỗi khi khung vẽ lệch, chỉ là câu báo khác với câu hồ sơ đã hứa. Người dùng cuối không thấy ảnh hưởng.
  Căn cứ: Chỉ khác chữ báo lỗi nội bộ, phép đo vẫn bắt được lỗi bố cục, không đụng dữ liệu hay người dùng.
  file: `_acceptance/so-do-toan-vung/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): bước 3 của vk6-toan-man kiểm «đường dẫn không mang khoá toàn màn hình» bằng regex đoán tên, không có đối chứng dương, và bỏ ca dựng lại vỏ (r3 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm không chứng minh được chế độ toàn màn hình không lọt vào địa chỉ trang và mất khi tải lại. Nếu hỏng, người dùng gửi link sẽ mở thẳng ở toàn màn hình, nhưng chưa có bằng chứng nó hỏng.
  Căn cứ: Chưa có bằng chứng hỏng thật, lỗi nếu có thấy ngay khi dùng và tải lại trang là xong, không mất dữ liệu.
  file: `apps/app/test/okr-so-do-toan-vung.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
