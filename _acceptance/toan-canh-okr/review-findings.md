# Review Findings: toan-canh-okr — Round 1

## Trong hợp đồng

- **Toàn cảnh loads forever when the cycles query fails; its error branch can never run**
  file:line: `apps/app/app/(app)/[slug]/okr/toan-canh/toan-canh.tsx:168`
  severity: high
  AC: AC-5
  If trpc.okr.cycles errors, cycles.data is undefined, so useChuKy's giaiKy returns currentId === null and the toanCanh query is given skipToken. In TanStack v5 a skipToken query stays at status 'pending' for good. Line 168 (`cycles.isPending || access.isPending || tc.isPending`) therefore always returns <DangTai/>, and the `cycles.isError || tc.isError` branch on line 169 is never reached. The user sees an endless spinner instead of the error card with its retry button. The server page also swallows the cycles failure (`fetchQuery(...).catch(() => null)`), so no error is reported anywhere. Fix: check `cycles.isError` before the pending check, or only include tc.isPending when currentId !== null.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Khu OKR có thêm module cấu hình thứ hai (okr-xem.config.ts) bên cạnh okr-config.ts, lặp đơn vị thời gian và thông điệp**
  Người dùng thấy gì: Thông điệp 'không có KR' có thể hiển thị khác câu chữ nhau giữa các màn OKR, và người chỉnh cấu hình sau này dễ sửa nhầm chỗ.
  file: `apps/api/src/okr/okr-xem.config.ts`
  severity: medium
  Đề xuất: known-limits

- **moHopTuan đọc cột Json okrTrail.after bằng schema zod viết tại chỗ và nuốt lỗi phân tích, không dùng parseOkrVet sẵn có**
  Người dùng thấy gì: Trong tình huống dữ liệu bị hỏng hiếm gặp, việc mở bảng họp tuần nhiều lần có thể bị đếm trùng, làm sai số liệu về tỷ lệ đơn vị đã mở bảng.
  file: `apps/api/src/okr/okr-xem.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Các ô bảng mới tự viết lại padding của TableCell thay vì dùng hằng CELL đang có, và hop-tuan lệch sang py-3**
  Người dùng thấy gì: Bảng họp tuần có khoảng cách dòng hơi khác so với các bảng OKR khác trên cùng khu, tạo cảm giác không đồng nhất khi lướt qua các màn.
  file: `apps/app/app/(app)/[slug]/okr/hop-tuan.tsx`
  severity: low
  Đề xuất: known-limits

- **Sức khoẻ hides query errors: an access error shows 'no permission', a cycles error shows 'no cycle yet'**
  Người dùng thấy gì: Khi hệ thống gặp trục trặc tạm thời, quản trị viên có thể thấy nhầm thông báo 'không có quyền' còn người khác thấy nhầm 'chưa có chu kỳ' ở màn Sức khoẻ chương trình, thay vì một thông báo lỗi kèm nút thử lại đúng nghĩa.
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/suc-khoe/suc-khoe.tsx`
  severity: medium
  Đề xuất: known-limits

- **Server prefetch of danhSach leaves out loc.tuTin, so it never matches the client's query key**
  Người dùng thấy gì: Màn 'Theo đơn vị' có thể tải lại danh sách một lần nữa ngay sau khi vừa hiện, gây chớp giao diện và tốn thêm một lượt gọi máy chủ mỗi lần mở trang.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (asserts a relation between two values that don't vary): E9's '5 units vs 50 units' query-count check never changes the number of units**
  Người dùng thấy gì: Phép đo hiệu năng chứng minh '5 đơn vị hay 50 đơn vị đều nhanh như nhau' hiện chưa thực sự đổi số đơn vị giữa hai lần đo, nên nếu tốc độ chậm dần theo quy mô thật sự thì phép đo này sẽ không phát hiện ra.
  file: `apps/api/test/okr-toan-canh-hieu-nang.spec.ts`
  severity: high
  Đề xuất: new-contract

- **Shape 4 (negative assertion alone, passes vacuously): E29 'okr.toanCanh never called with the running cycle' uses every() on an array that can be empty**
  Người dùng thấy gì: Phép kiểm 'màn Toàn cảnh không gọi lại dữ liệu chu kỳ đang chạy một cách thừa' có thể báo đạt ngay cả khi không có gì được kiểm tra, nên một lỗi gọi thừa dữ liệu thật sự có thể lọt qua mà không bị phát hiện.
  file: `_acceptance/toan-canh-okr/rang/man-toan-canh.mjs`
  severity: high
  Đề xuất: new-contract

- **Shape 5 (claims a full written-ahead matrix but asserts only part of it): E8(b) claims 7 rows × 6 columns = 42 values; the test asserts 36 plus one key, and the kyVong column comes from the system under test**
  Người dùng thấy gì: Bảng số liệu đối chiếu cho màn tổng hợp hứa kiểm đủ mọi cột của mọi hàng nhưng trên thực tế bỏ sót một hàng và một cột khỏi phép so sánh, nên sai lệch ở đúng phần đó có thể không bị bắt.
  file: `apps/api/test/okr-toan-canh.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (asserts the string is present when the promise is a relation): E16(c)/E17 'Đích 85%' label inside the svg frame is measured only by the text being present**
  Người dùng thấy gì: Phép kiểm nhãn 'Đích 85%' trên biểu đồ chỉ xem chữ có xuất hiện hay không, chứ chưa xem nhãn có nằm gọn trong khung biểu đồ hay bị cắt mất một phần, nên nhãn bị cắt vẫn có thể được coi là đạt.
  file: `packages/ui/test/target-line-chart.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (asserts presence when the promise is a relation): E5 ArrowLeft/ArrowRight only checks that some element has focus**
  Người dùng thấy gì: Phép kiểm điều hướng bàn phím trên cây chỉ xem có ô nào đang được chọn hay không, chứ chưa xem đúng ô cần chọn có được chọn hay không, nên phím mũi tên đưa tiêu điểm sai chỗ vẫn có thể được coi là đạt.
  file: `_acceptance/toan-canh-okr/rang/man-toan-canh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative assertion alone with no positive control): E13(b) 'no list of people who haven't updated' is checked by a two-key regex with no control**
  Người dùng thấy gì: Phép kiểm 'không liệt kê danh sách người chưa cập nhật' chỉ tìm đúng hai tên trường cụ thể, chưa có ví dụ chứng minh cách tìm này thực sự bắt được vi phạm, nên một cách đặt tên khác vẫn có thể lọt qua mà không bị phát hiện.
  file: `apps/api/test/okr-toan-canh.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (asserts presence/count when the promise is equal values): E16(b) 'API okr.dienBien returns the same numbers' only asserts length 10**
  Người dùng thấy gì: Phép kiểm 'số liệu diễn biến từ API khớp với số liệu gốc' chỉ đếm đủ mười điểm dữ liệu chứ chưa so từng giá trị, nên một điểm dữ liệu bị sai số hoặc mất thông tin đi kèm (mức tự tin, ghi chú) vẫn có thể được coi là đạt.
  file: `apps/api/test/okr-toan-canh.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (negative assertion alone with no positive control): the soi-ma 'status label mapped outside messages' check has no red case**
  Người dùng thấy gì: Phép kiểm 'chữ tình trạng không được viết cứng ngoài chỗ quy định' chưa có ví dụ chứng minh cách quét này thực sự bắt được vi phạm khi có chữ viết cứng chen vào giữa câu, nên trường hợp đó có thể lọt qua.
  file: `_acceptance/toan-canh-okr/rang/soi-ma.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (assertion passes vacuously when absent): E5 'Enter on the unit tree changes donOkr' passes when there is no focus key**
  Người dùng thấy gì: Phép kiểm 'bấm Enter trên cây đơn vị đổi đơn vị đang chọn' có thể báo đạt ngay cả khi tiêu điểm bàn phím không rơi vào đâu cả, nên trường hợp phím không có tác dụng gì vẫn có thể được coi là đạt.
  file: `_acceptance/toan-canh-okr/rang/man-toan-canh.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture shaped for the reader): the danhSach mock in okr-theo-don-vi.dom has drifted from the real contract**
  Người dùng thấy gì: Bộ dữ liệu giả lập dùng để kiểm màn 'Theo đơn vị' thiếu một trường lọc (mức tự tin) mà màn thật đã có, nên phép kiểm này không còn phản ánh đúng những gì máy chủ thật trả về.
  file: `apps/app/test/okr-theo-don-vi.dom.tsx`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/16 lỗi rơi vào file không bộ đo nào phủ (apps/api/test/okr-toan-canh-hieu-nang.spec.ts, apps/app/test/okr-theo-don-vi.dom.tsx) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
