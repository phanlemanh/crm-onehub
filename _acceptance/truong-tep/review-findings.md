# Review findings: truong-tep (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **«Kara không điền trường Tệp» chỉ chặn ở giao diện, API vẫn nhận agentFilled=true cho FILE**
  Người dùng thấy gì: Nếu ai đó gọi thẳng API (không qua màn hình Cài đặt) để tạo trường Tệp mà bật cho Kara điền, Kara sẽ liên tục được giao việc điền vào ô không bao giờ điền được và tốn lượt chạy mô hình vô ích. Qua màn hình thì không xảy ra.
  Căn cứ: Chỉ xảy ra khi gọi thẳng API chứ không qua màn hình, không mất hay lộ dữ liệu, chỉ tốn chi phí chạy Kara và gỡ được bằng cách tắt cờ trên trường.
  file: `apps/api/src/fields/fields.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **Ép kiểu `Record<string, unknown>` và `as Prisma.FieldFileWhereInput` trong soTepTheoBanGhi**
  Người dùng thấy gì: Người dùng không thấy gì khác đi. Về sau nếu ai đổi tên cột dữ liệu, số tệp trên danh sách có thể lặng lẽ hiện 0 mà không có cảnh báo.
  Căn cứ: Không ảnh hưởng người dùng hôm nay, và bộ kiểm số tệp theo bản ghi sẽ đỏ nếu cột bị đổi nên rủi ro thấp so với công sửa.
  file: `apps/api/src/fields/fields.service.ts`
  severity: low
  Đề xuất: wont-fix

- **Nút «Mở» và xác nhận «Xoá tệp» nuốt lỗi máy chủ, người dùng không thấy gì**
  Người dùng thấy gì: Khi bấm «Mở» hoặc xác nhận xoá mà máy chủ từ chối hay mất mạng, màn hình không báo gì: hộp xác nhận vẫn mở, nút hết quay, người dùng không biết chuyện gì xảy ra.
  Căn cứ: Chỉ gặp khi có lỗi hiếm (mất mạng, bị rút quyền giữa chừng), không mất dữ liệu và người dùng tải lại trang hay thử lại là xong.
  file: `apps/app/components/crm/fields/o-tep.tsx`
  severity: low
  Đề xuất: known-limits

- **Lỗi đọc theo khớp nguyên câu tiếng Việt của máy chủ, không theo mã**
  Người dùng thấy gì: Một số lỗi (ô đã đủ 10 tệp, bản ghi đã lưu trữ) chỉ hiện câu chung «Chưa tải lên được. Thử lại.» kèm nút Thử lại dù thử lại cũng vô ích. Người dùng không biết nguyên nhân thật.
  Căn cứ: Chỉ làm lời báo kém rõ chứ không mất dữ liệu, và người dùng tự hiểu ra sau một lần thử.
  file: `apps/app/components/crm/fields/o-tep.tsx`
  severity: low
  Đề xuất: known-limits

- **Câu chữ ghi cứng «20 MB» và «10 tệp» thay vì đọc từ TEP_TRUONG**
  Người dùng thấy gì: Hôm nay người dùng thấy đúng số. Chỉ khi sau này đổi giới hạn tệp mà quên sửa chữ thì câu báo sẽ nói số cũ.
  Căn cứ: Không có hậu quả cho người dùng tới khi có người đổi giới hạn, và lúc đó sửa chữ là việc nhỏ.
  file: `apps/app/lib/messages/crm.ts`
  severity: low
  Đề xuất: wont-fix

- **Chép lại nguyên module kho Blob và hàm nhận kiểu tệp thay vì dùng chung**
  Người dùng thấy gì: Người dùng không thấy khác biệt. Hai bản mã giống nhau có thể trôi lệch về sau, khiến cách xử lý tệp ở Kho tài liệu và ô Tệp không còn như nhau.
  Căn cứ: Trùng lặp là lựa chọn có chủ ý để không động vào Kho tài liệu, và không ảnh hưởng người dùng hôm nay.
  file: `packages/db/src/blob-tep-truong.ts`
  severity: low
  Đề xuất: wont-fix

- **Ghi log lỗi dọn Blob không kèm stack, trái quy ước logging**
  Người dùng thấy gì: Người dùng không thấy gì. Khi việc dọn tệp sau khi xoá vĩnh viễn hỏng, người vận hành có dòng báo lỗi nhưng thiếu dấu vết để tìm nguyên nhân.
  Căn cứ: Chỉ làm khó điều tra cho người vận hành, không đụng dữ liệu hay màn hình người dùng.
  file: `apps/api/src/fields/fields.service.ts`
  severity: low
  Đề xuất: wont-fix

- **`complete` nhận lại tenTep mà không kiểm đuôi tên với kiểu thật của tệp**
  Người dùng thấy gì: Người gọi thẳng API có thể gắn một PDF thật dưới tên «hop-dong.exe» hay «anh.png», và tên sai này hiện cho mọi người xem phiếu. Qua màn hình thường thì không xảy ra.
  Căn cứ: Nội dung tệp vẫn được kiểm theo byte nên không lọt tệp nguy hiểm, chỉ có thể hiện tên gây hiểu nhầm và phải cố ý dùng API trực tiếp.
  file: `apps/api/src/fields/field-files.service.ts`
  severity: low
  Đề xuất: known-limits

- **«Mở» gọi window.open sau một lần await mạng, nên Safari/iOS có thể chặn như cửa sổ bật lên mà không báo gì**
  Người dùng thấy gì: Trên Safari hoặc iPhone, quản trị bấm «Mở» có thể không có gì xảy ra và không có lời báo. Dùng Chrome thì mở bình thường.
  Căn cứ: Chưa tái hiện được, chỉ ảnh hưởng quản trị dùng Safari/iPhone, không mất dữ liệu và có đường tránh là dùng trình duyệt khác.
  file: `apps/app/components/crm/fields/o-tep.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assert âm tính một mình): vế 'okr doc duoc' là mã chết, không bao giờ ném**
  Người dùng thấy gì: Sản phẩm hiện vẫn chặn đúng người vai «chỉ OKR». Nhưng bài kiểm tự động không phân biệt được lý do bị chặn, nên về sau nếu có hồi quy làm họ bị chặn vì lý do khác hay hở ở chỗ khác, bộ kiểm vẫn báo xanh.
  Căn cứ: Không ảnh hưởng người dùng hôm nay, nhưng quyền xem dữ liệu đối tác là chỗ nhạy nên đáng gia cố bài kiểm trong một việc riêng.
  file: `apps/api/test/truong-tep.spec.ts`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 4 (assert âm tính một mình): vế 'lo url' không bao giờ đỏ được**
  Người dùng thấy gì: Hôm nay nhân viên không phải quản trị bị từ chối khi mở tệp. Nhưng bài kiểm không soát được việc đường tải có lọt vào lời báo lỗi hay không, nên nếu lọt về sau thì không ai biết.
  Căn cứ: Đường tải tệp hợp đồng là dữ liệu nhạy cảm nên nên có bài kiểm bắt được, dù hôm nay chưa thấy lộ.
  file: `apps/api/test/truong-tep.spec.ts`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 3 (lời hứa là quan hệ, nhưng phép so bị suy biến): 'sort doi' so thứ tự của danh sách chỉ có một hàng**
  Người dùng thấy gì: Người dùng bấm sắp xếp theo cột Tệp hôm nay không bị lỗi. Nhưng bài kiểm không thật sự chứng minh thứ tự giữ nguyên, nên nếu sau này sắp xếp làm đảo danh sách thì bộ kiểm không báo.
  Căn cứ: Hậu quả nhẹ (chỉ đảo thứ tự hàng, không mất dữ liệu) và người dùng tự thấy ngay, nên gia cố bài kiểm có thể làm riêng.
  file: `apps/api/test/truong-tep.spec.ts`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 4 (assert âm tính một mình): ca giao dịch lùi bỏ luôn lời trả của deals.purge**
  Người dùng thấy gì: Bài kiểm xoá vĩnh viễn khi giao dịch bị lùi có thể xanh dù việc xoá bị từ chối sớm vì lý do khác. Người dùng không thấy gì hôm nay, nhưng chưa chắc việc không xoá nhầm tệp khi lỗi được thử đúng.
  Căn cứ: Liên quan tới xoá tệp (khó hoàn tác), nên đáng gia cố bài kiểm, dù hôm nay chưa thấy xoá nhầm.
  file: `apps/api/test/truong-tep.spec.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 4 (đối chứng dương không cùng đường): 'ttp tat: doi chung' hỏi kho giả, không hỏi khoá**
  Người dùng thấy gì: Khi thiếu khoá kho tệp, sản phẩm báo tắt đúng. Nhưng bài kiểm không chứng được rằng khi có khoá thì tính năng bật thật, nên một lỗi làm tính năng luôn tắt có thể lọt.
  Căn cứ: Lỗi kiểu này người dùng và người triển khai thấy ngay khi tải tệp lần đầu và gỡ được bằng cấu hình, nên mức nhẹ.
  file: `apps/api/test/truong-tep.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (không ghim thông điệp): chữ lỗi «ghim» bằng chính hằng của mã sản phẩm**
  Người dùng thấy gì: Hôm nay lời báo lỗi hiện đúng tiếng Việt. Nhưng nếu ai đó vô tình đổi câu báo, bộ kiểm vẫn xanh và người dùng sẽ thấy câu sai mà không ai hay.
  Căn cứ: Chỉ ảnh hưởng chữ trên màn hình nếu có người sửa nhầm, không mất dữ liệu và sửa lại rẻ.
  file: `apps/api/test/truong-tep.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assert âm tính một mình): vế (c) 'form tao co o Tep' của quet-kieu luôn qua**
  Người dùng thấy gì: Phép kiểm xác nhận form tạo không có ô Tệp luôn báo đạt, kể cả khi ô Tệp lỡ xuất hiện ở đó. Hôm nay form tạo vẫn không có ô Tệp như đã hẹn.
  Căn cứ: Form tạo đã được chủ ý để chưa có ô Tệp, nếu lỡ xuất hiện chỉ là chuyện giao diện lệch chứ không mất dữ liệu.
  file: `_acceptance/truong-tep/rang/quet-kieu.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc, gọi là round-trip): dữ liệu ô Tệp và trường lọc dựng tay rồi parse bằng schema đọc**
  Người dùng thấy gì: Bài kiểm màn hình chỉ chứng minh màn hiển thị đúng với dữ liệu mẫu tự dựng, chưa chứng minh khớp với đúng thứ máy chủ trả. Nếu hai bên lệch nhau, người dùng có thể thấy ô Mở/Xoá sai.
  Căn cứ: Các bài kiểm phía API đã đo riêng và phép đo màn hình chạy dữ liệu thật, nên rủi ro lệch còn thấp.
  file: `apps/app/test/truong-tep.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assert âm tính một mình): quét «màn không tự tính quyền» không có thuốc thử**
  Người dùng thấy gì: Hôm nay màn không tự tính quyền mở/xoá. Phép quét chỉ bắt được vài chữ cụ thể nên nếu sau này ai tự thêm kiểm vai theo cách khác thì có thể lọt.
  Căn cứ: Quyền thật vẫn do máy chủ giữ, màn chỉ ẩn/khoá nút nên lệch ở đây không làm lộ dữ liệu.
  file: `apps/app/test/truong-tep.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 1 (đo lời khai thay vì đầu ra): ô «XLSX thật» chỉ gửi tên tệp, không có byte XLSX**
  Người dùng thấy gì: Tệp bảng tính XLSX không được nhận ở ô Tệp và hôm nay vẫn bị từ chối. Bài kiểm chỉ chưa thử bằng một tệp XLSX thật.
  Căn cứ: XLSX không thuộc phạm vi tính năng và người dùng chỉ gặp lời từ chối, không mất dữ liệu.
  file: `apps/api/test/truong-tep.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): DOCX trong kieu-tep.spec không phải tệp zip**
  Người dùng thấy gì: Việc nhận đúng tệp Word thật chưa được thử trong riêng bài kiểm này, nhưng người dùng tải Word vẫn được nhận hôm nay.
  Căn cứ: Rủi ro thấp: nếu nhận nhầm tệp Word thật, người dùng thấy ngay khi tải và thử lại hay đổi tệp được.
  file: `packages/validation/test/kieu-tep.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 (tuyên lớp, đo điểm): fields.delete hứa «tệp trên ba bản ghi», fixture chỉ có một**
  Người dùng thấy gì: Xoá một trường Tệp đã được thử trên một bản ghi, chưa thử trên nhiều bản ghi cùng lúc. Hôm nay chưa thấy tệp nào bị bỏ sót.
  Căn cứ: Cách xoá làm theo cả trường nên ít khả năng sót, và nếu sót thì chỉ để lại tệp mồ côi mà lịch dọn xử lý được.
  file: `apps/api/test/truong-tep.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 (tuyên quét lớp nhưng lọc hẹp hơn lời hứa): quet-kieu chỉ đếm switch qua heuristic**
  Người dùng thấy gì: Hôm nay mọi chỗ xử lý theo kiểu trường đều đã có nhánh Tệp. Chỉ khi sau này thêm đoạn mã kiểu lạ thì phép quét có thể bỏ sót.
  Căn cứ: Hiện chưa có chỗ nào bị sót và việc bổ sung phép quét tốn công hơn nhiều so với rủi ro.
  file: `_acceptance/truong-tep/rang/quet-kieu.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

