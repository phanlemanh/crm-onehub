## Trong hợp đồng

- **Hình dạng 3 (assert chuỗi có mặt thay cho quan hệ giá trị): tcb-pham-vi đếm tệp trên list/board chỉ là includes(dQ)**
  AC: AC-3
  file: apps/api/test/tep-theo-chu.spec.ts:614
  severity: high
  source: measurement
  detail: E3(a) hứa: deals.list và deals.board trả soTepTheoTruong của dQ đúng bằng 2, khác thì ném 'tcb pham vi: dem <thu tuc>'. Code ở dòng 612-615 chỉ làm `const chu = JSON.stringify(tl.data ?? ""); if (tl.status !== 200 || !chu.includes(dQ)) throw ...`. Đây là kiểm id của dQ có xuất hiện trong lời trả, không đọc soTepTheoTruong[dQ][fD.key] và không so với 2. Nếu list/board đếm 0, đếm 1, ẩn số đếm với người không phụ trách hay bỏ hẳn soTepTheoTruong thì bài vẫn xanh, miễn dQ còn trong danh sách. Lời hứa ở đây là một quan hệ (số đếm của bản ghi dQ bằng số tệp thật), còn assert chỉ là 'chuỗi có mặt'.
  rationale: AC-3 đòi A vẫn thấy số tệp trong list và deals.board như DA19, mà bài kiểm không đo số đếm nên không chứng minh được vế này.

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): tên người phụ trách truyền thẳng vào dichTep, không rút từ đầu ra byId thật**
  AC: AC-5
  file: apps/app/test/tep-theo-chu.dom.tsx:203
  severity: high
  source: measurement
  detail: E5 hứa: 'người phụ trách rút qua bộ đọc đầu ra thật của deals.byId, companies.byId, contacts.byId'. oPhieu() ở dòng 186-208 tự dựng prop `dichTep: { entity, recordId: "r1", luuTru: false, phuTrach: lyDo === "chua-co-phu-trach" ? null : PHU_TRACH }` rồi đưa thẳng cho OTruongPhieu. Đường ghi thật của vòng này là `phuTrach: deal.owner?.name ?? null` (deal-sheet.tsx), tương tự ở company-sheet.tsx và contact-sheet.tsx, rồi đi qua nguCanhTep.phuTrach trong moTaTruongTuTao (record-fields.tsx). Đường này không có ô nào chạy qua. Ba 'loại bản ghi' của ma trận 18 ô chỉ khác nhau ở chữ entity truyền vào cùng một component. Một sheet quên truyền phuTrach, hay đọc sai trường (ví dụ owner.email), thì cả 18 ô vẫn xanh. Ngoài ra coTheMo được viết tay thành `lyDo === null` (dòng 180), không rút từ writer tepTheoBanGhi.
  rationale: AC-5 đòi ô Tệp của cả ba loại bản ghi nhận dữ liệu từ byId của loại ấy, nhưng bài kiểm đưa thẳng tên người phụ trách vào ô nên không đi qua đường đọc thật.

- **Hình dạng 2 (stub viết tay đúng khuôn bên gọi): ca 'mất quyền' đếm lời gọi trên Proxy giả của useCrmCache chứ không đếm invalidate byId trên queryClient**
  AC: AC-5
  file: apps/app/test/tep-theo-chu.dom.tsx:79
  severity: medium
  source: measurement
  detail: E5 hứa: 'không có lời gọi invalidate của đúng byId của loại ấy (đếm trên queryClient giả)' thì ném 'tcb o tep: khong tai lai <loai>'. Dòng 79-91 thay cả module @/lib/trpc/cache bằng một Proxy chỉ ghi lại `${tenThuocTinh}:${doiSo}`. Assert ở dòng 329-333 vì thế chỉ chứng minh o-tep gọi `cache[kindOf(entity)](recordId)`. Nó không chứng minh queryKey của deals.byId, companies.byId hay contacts.byId bị invalidate: useCrmCache thật (apps/app/lib/trpc/cache.ts) và QueryClient không hề chạy. Nếu cache.deal invalidate nhầm khoá, hay không đụng byId, bài vẫn xanh. Stub này viết đúng hình mà bên gọi chờ, không đi vòng qua module thật.
  rationale: AC-5 đòi byId của đúng loại bản ghi được tải lại khi FORBIDDEN lúc mở, mà bài kiểm chỉ đếm lời gọi trên bản giả của bộ nhớ đệm.

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): quét laPhuTrach bằng regex trên chữ, không kiểm phép so ownerId với userId**
  AC: AC-6
  file: apps/api/test/tep-theo-chu.spec.ts:981
  severity: medium
  source: measurement
  detail: E6 hứa: 'laPhuTrach không phải phép so ownerId của hàng bản ghi với userId thì ném tcb vet: la phu trach suy tu luat'. Dòng 974-989 chỉ lấy chữ của initializer rồi kiểm `/phuTrachId/.test(chu) && /nguoi\.id/.test(chu) && !/coTheMo|role|vai/.test(chu)`, tức là kiểm hai tên biến có mặt. Không có kiểm nào rằng biểu thức là phép `===` giữa hai giá trị đó, hay rằng phuTrachId được lấy từ `.ownerId` của hàng bản ghi. Ví dụ `laPhuTrach: tinhPhuTrach(phuTrachId, nguoi.id)` hay `phuTrachId !== null || nguoi.id === x` vẫn qua. Thêm nữa, phép quét chạy trên toàn tệp và `dungSo` bị ghi đè bởi lần gán laPhuTrach cuối cùng, không khoanh vào dòng log của downloadUrl như lời hứa.
  rationale: AC-6 đòi laPhuTrach so thẳng ownerId của hàng bản ghi với userId, không suy từ luật mở, mà bài kiểm chỉ thấy tên biến có mặt.

- **Hình dạng 4 (âm tính một mình): kiểm 'không lộ URL trong log' không có đối chứng dương và chỉ bắt Logger.log**
  AC: AC-6
  file: apps/api/test/tep-theo-chu.spec.ts:944
  severity: low
  source: measurement
  detail: E6 hứa: 'dòng nào (của mọi message trong ca) chứa chuỗi URL kho giả hay tham số chữ ký thì ném tcb vet: lo url'. Dòng 944-950 chỉ quét các lời gọi `Logger.prototype.log` (spy ở dòng 906) tìm 'blob-tep-gia.test'. Không có ca nào cố ý ghi một dòng chứa URL để chứng minh bộ bắt nhìn thấy được, trong khi thước CHẾT thì có đối chứng 'gia' ở dòng 958. Một URL lộ qua logger.warn, error hay debug, hoặc qua tham số thứ hai của log, đều không được thấy. Đây là assert âm tính đứng một mình, không có đối chứng dương cho chính bộ dò.
  rationale: AC-6 đòi không dòng log nào chứa URL hay chữ ký của Blob, mà bộ dò chỉ bắt một đường ghi log và không có đối chứng dương.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Schema tepTrongO nới `lyDoKhongMo` bằng `.default(null)`, để fixture thiếu trường vẫn parse qua**
  Người dùng thấy gì: Người dùng không thấy gì khác đi hôm nay vì máy chủ luôn gửi lý do. Nếu sau này có chỗ quên gửi, ô Tệp sẽ lặng lẽ coi như mở được thay vì báo lỗi.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, không mất hay lộ dữ liệu, và sửa sau vẫn rẻ vì chỉ là siết lại khai báo dữ liệu.
  file: `packages/validation/src/tep-truong.ts`
  severity: medium
  Đề xuất: known-limits

- **Danh sách lý do không mở tệp được khai tay ở ba nơi, hằng xuất ra ở @crm/auth không ai dùng**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng. Chỉ khi sau này thêm một lý do mới mà quên sửa đủ ba nơi thì màn hình mới có thể hiện sai lý do.
  Căn cứ: Hiện chưa gây hại nào cho người dùng, và việc dọn chỉ có giá trị khi thêm lý do mới, nên ghi vết là đủ.
  file: `packages/auth/src/quyen-tep.ts`
  severity: low
  Đề xuất: wont-fix

- **Xoá tệp khi đã mất quyền phụ trách: lỗi FORBIDDEN bị nuốt, hộp thoại đứng im, không báo gì**
  Người dùng thấy gì: Người phụ trách cũ bấm «Xoá» trên phiếu mở từ trước khi bị đổi sẽ thấy hộp xác nhận đứng im, không có lời báo nào. Tệp không bị xoá nhầm; tải lại phiếu là hết kẹt.
  Căn cứ: Không mất hay lộ dữ liệu và tải lại là tự gỡ được, nhưng người dùng sẽ tưởng nút hỏng nên đáng làm thành một việc nhỏ riêng.
  file: `apps/app/components/crm/fields/o-tep.tsx`
  severity: medium
  Đề xuất: new-contract

- **Lỗi mở tệp không phải FORBIDDEN bị ném lại vào lời gọi `void`, người dùng không thấy gì**
  Người dùng thấy gì: Khi tệp vừa bị người khác xoá, kho tệp đang tắt hoặc mất mạng, bấm «Mở» không có chuyện gì xảy ra và không có lời báo.
  Căn cứ: Hành vi này có từ trước, không mất hay lộ dữ liệu, người dùng thử lại hoặc tải lại là xong, và các tình huống này hiếm.
  file: `apps/app/components/crm/fields/o-tep.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên đếm đủ ô nhưng phép đếm là hằng): 'thieu o 18' của tcb-xoa không thể đỏ**
  Người dùng thấy gì: Người dùng không thấy gì khác. Chỉ là bài kiểm xoá có một câu kiểm đếm ô không bao giờ đỏ, nên nếu thiếu một ô trong ma trận thì phần đếm này không báo.
  Căn cứ: Hành vi xoá thật vẫn được kiểm ở các câu khác, không ảnh hưởng người dùng, và sửa sau rẻ.
  file: `apps/api/test/tep-theo-chu.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

