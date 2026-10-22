# Review findings: truong-tep (round 3)

## Trong hợp đồng

- **complete nhận tệp có byte khác kiểu đã khai theo tên (PNG đặt tên .pdf vẫn được ghi)**
  AC: AC-3
  file: apps/api/src/fields/field-files.service.ts:209
  severity: medium
  source: bugs
  detail: requestUpload kiểm `kieuTheoTen(tenTep) === kieu` và ký URL PUT chỉ cho MIME của kieu đã khai. Còn ở complete, `nhanKieuTep(byte)` chỉ từ chối khi byte không thuộc bốn kiểu, mà không so `nhan.kieu` với kiểu theo tên hay kiểu đã khai. Thử: một PNG thật đổi tên thành `x.pdf`, khai kieu pdf, PUT với content-type application/pdf. Lượt complete ghi hàng `kieu: "png"` mà `tenTep: "x.pdf"`, còn Blob mang content-type application/pdf. Quản trị bấm Mở thì trình duyệt mở byte PNG bằng trình xem PDF và hỏng. Hợp đồng AC-3 ghi rõ ca «đuôi .pdf mà byte không phải PDF» phải bị từ chối, và Blob phải bị xoá. Bài test chỉ dùng byte rác (`khong phai pdf`), nên lọt. Thêm nữa, `tenTep` của complete không gắn vào phiếu hay hàng BlobChoXoa và không được kiểm lại, nên lúc complete có thể đổi sang tên với đuôi bất kỳ. Cách sửa: trong nhanTrongKhoa ném TuChoiNoiDung(T.saiKieu) khi `nhan.kieu !== kieuTheoTen(input.tenTep)`.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Luật «Kara không điền trường FILE» chỉ có ở giao diện; API vẫn mặc định agentFilled=true**
  Người dùng thấy gì: Trường Tệp tạo bằng đường khác ngoài màn Cài đặt (khoá API, lệnh gọi trực tiếp) vẫn có thể bật «Kara điền». Kara sẽ xếp việc cho từng bản ghi rồi bị từ chối khi ghi, nên chỉ tốn lượt làm việc vô ích.
  Căn cứ: Không mất dữ liệu và Kara không ghi được gì vào ô Tệp; màn Cài đặt đã chặn đường thông thường, chỉ người tạo trường bằng đường tắt mới gặp, và tắt cờ đi là hết.
  file: `apps/api/src/fields/fields.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **soTepTheoBanGhi ép kiểu sang Record<string, unknown> để đọc dòng groupBy**
  Người dùng thấy gì: Cách viết đếm số tệp dễ gãy âm thầm nếu sau này ai đổi tên cột, nhưng hiện nay số tệp hiển thị đúng và người dùng không thấy gì sai.
  Căn cứ: Hiện không gây sai kết quả nào cho người dùng; chỉ là rủi ro bảo trì về sau, và đã có bài kiểm số đếm bắt được nếu cột đổi.
  file: `apps/api/src/fields/fields.service.ts`
  severity: medium
  Đề xuất: wont-fix

- **Mở và Xoá tệp hỏng thì người dùng không thấy lời báo nào**
  Người dùng thấy gì: Khi bấm «Mở» hoặc xác nhận xoá mà máy chủ từ chối (hết quyền, bản ghi vừa lưu trữ, mạng lỗi), màn không nói gì: nút không phản hồi hoặc hộp hỏi cứ mở.
  Căn cứ: Người dùng không mất dữ liệu và tải lại trang là thử lại được, nhưng họ không biết vì sao việc không chạy; ca xảy ra hiếm vì nút đã khoá sẵn theo quyền.
  file: `apps/app/components/crm/fields/o-tep.tsx`
  severity: medium
  Đề xuất: new-contract

- **Giới hạn 10 tệp và 20 MB viết cứng trong chữ, lặp ở năm chỗ thay vì lấy từ TEP_TRUONG**
  Người dùng thấy gì: Nếu sau này đổi giới hạn số tệp hay dung lượng thì phải sửa chữ trên màn và lời từ chối ở nhiều chỗ, quên một chỗ là báo sai số. Hôm nay các số đang khớp.
  Căn cứ: Không ảnh hưởng người dùng hiện tại; chỉ phát sinh khi đổi giới hạn, lúc đó sửa chữ là việc nhỏ.
  file: `apps/app/lib/messages/crm.ts`
  severity: low
  Đề xuất: wont-fix

- **TepOTep viết tay song song với schema tepTrongO**
  Người dùng thấy gì: Hình dạng dữ liệu của một tệp được chép tay ở màn, có thể lệch với bản của máy chủ nếu sau này thêm trường. Hôm nay hai bản khớp nhau.
  Căn cứ: Người dùng không thấy gì; rủi ro chỉ ở bảo trì và trình kiểm kiểu sẽ báo khi lệch.
  file: `apps/app/components/crm/fields/o-tep.tsx`
  severity: low
  Đề xuất: wont-fix

- **logger.error của donTepNgay làm mất stack**
  Người dùng thấy gì: Khi dọn tệp sau commit bị lỗi, nhật ký chỉ có một câu thông báo, thiếu dấu vết để truy nguyên. Người dùng không bị ảnh hưởng.
  Căn cứ: Việc dọn vẫn được thử lại sau, không mất dữ liệu; chỉ làm người vận hành điều tra khó hơn một chút.
  file: `apps/api/src/fields/fields.service.ts`
  severity: low
  Đề xuất: wont-fix

- **Chép nguyên khung kho Blob và bộ nhận kiểu theo magic bytes thay vì dùng chung**
  Người dùng thấy gì: Có hai bản gần giống nhau của bộ nhận biết loại tệp, và chúng đã bắt đầu lệch. Kho tài liệu cũ vẫn chạy như trước.
  Căn cứ: Lệch này là chủ ý để không động vào Kho tài liệu; gộp lại sau là việc dọn dẹp không gấp, người dùng không thấy.
  file: `packages/validation/src/kieu-tep.ts`
  severity: low
  Đề xuất: wont-fix

- **Trần 10 tệp mỗi ô bị vượt khi nhiều lượt complete chạy cùng lúc, vì khoá advisory tính theo pathname chứ không theo ô**
  Người dùng thấy gì: Khi kéo thả rất nhiều tệp cùng lúc vào một ô đã gần đầy, ô có thể vượt 10 tệp một chút. Tệp thừa vẫn xoá đi được.
  Căn cứ: Không mất hay lộ dữ liệu, người dùng tự xoá bớt được; chỉ xảy ra khi ô sắp đầy và tải nhiều tệp cùng lúc.
  file: `apps/api/src/fields/field-files.service.ts`
  severity: high
  Đề xuất: known-limits

- **API vẫn bật agentFilled cho trường FILE (mặc định true), nên Kara xếp việc điền cho mọi bản ghi mà không bao giờ ghi được**
  Người dùng thấy gì: Trường Tệp tạo bằng đường tắt ngoài màn Cài đặt có thể khiến Kara xếp hàng loạt việc điền cho từng bản ghi rồi bị từ chối. Tệp của người dùng không bị đụng tới.
  Căn cứ: Chỉ tốn lượt làm việc của Kara, không sai dữ liệu, và chỉ xảy ra với trường tạo bằng đường tắt; tắt cờ là dừng.
  file: `apps/api/src/fields/fields.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Lỗi của Mở và Xoá tệp bị nuốt: promise bị từ chối không ai bắt, người dùng không thấy gì**
  Người dùng thấy gì: Bấm «Mở» khi máy chủ từ chối thì không có gì xảy ra, còn xoá thất bại thì hộp hỏi vẫn mở và nút hết quay mà không có dòng lỗi.
  Căn cứ: Không mất dữ liệu và thử lại được, nhưng người dùng không được báo lý do; chỉ gặp khi quyền hay trạng thái bản ghi đổi giữa chừng.
  file: `apps/app/components/crm/fields/o-tep.tsx`
  severity: medium
  Đề xuất: new-contract

- **Câu lỗi riêng của máy chủ khi tải lên (ô đủ 10, đã lưu trữ, kho tắt, phiếu sai) bị gộp thành «Chưa tải lên được. Thử lại.», kèm nút thử lại chắc chắn hỏng**
  Người dùng thấy gì: Khi ô đã đủ tệp hay bản ghi đã lưu trữ, màn chỉ báo «Chưa tải lên được. Thử lại.» thay vì nói đúng lý do, và nút thử lại sẽ lại thất bại.
  Căn cứ: Người dùng không mất dữ liệu nhưng bối rối vì lời báo chung chung; sửa là việc nhỏ ở màn nhưng chưa thuộc cam kết nào.
  file: `apps/app/components/crm/fields/o-tep.tsx`
  severity: low
  Đề xuất: new-contract

- **Hình dạng 4 (âm tính một mình, không ghim thông điệp): kiểm KHONG_TRONG_PHAM_VI của vai okr ở deals.byId là mã chết**
  Người dùng thấy gì: Phép kiểm tự động chỉ xác nhận vai «chỉ OKR» bị chặn, không xác nhận chặn đúng lý do. Người dùng vẫn bị chặn đúng.
  Căn cứ: Sản phẩm hiện chạy đúng; rủi ro là một lần sửa sau này đổi lý do chặn mà phép kiểm vẫn xanh.
  file: `apps/api/test/truong-tep.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (lời hứa là quan hệ nhưng chỉ kiểm một phần): ttp-vong-doi chỉ kiểm tập con thay vì tập Blob đã xoá đúng bằng tập tệp của đường**
  Người dùng thấy gì: Phép kiểm tự động chưa bắt được trường hợp xoá vĩnh viễn lỡ xoá thêm tệp của bản ghi khác cùng công ty. Hiện chưa thấy lỗi như vậy xảy ra.
  Căn cứ: Nếu có lỗi thì tệp người khác có thể bị mất, nhưng chưa có dấu hiệu lỗi thật; bổ sung bài kiểm là việc nhỏ.
  file: `apps/api/test/truong-tep.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không có mốc dương): vòng lưu currentView/applyView của ttp-man-loc có thể xanh trên view rỗng**
  Người dùng thấy gì: Phép kiểm tự động chưa chắc bắt được trường hợp bộ lọc «Chưa có tệp» không được lưu vào bộ lọc đã lưu. Hiện chưa thấy bộ lọc nào mất.
  Căn cứ: Nếu hỏng thì người dùng mở bộ lọc đã lưu thấy thiếu điều kiện, nhưng chưa có bằng chứng lỗi; đã có bài lọc phía máy chủ cùng kiểm.
  file: `apps/app/test/truong-tep.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): vế (c) 'form tao co o Tep' của quet-kieu.mjs không thể đỏ trên cây này**
  Người dùng thấy gì: Một phép quét tự động về form tạo không có tác dụng, nhưng form tạo vốn cố ý không có ô Tệp. Người dùng không bị ảnh hưởng.
  Căn cứ: Đã ghi rõ là giới hạn có chủ ý nên không có gì để sửa cho người dùng.
  file: `_acceptance/truong-tep/rang/quet-kieu.mjs`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 4 (âm tính một mình, không ghim mã): vế (b) 'đường trần không mở được' của ttp-blob-that chỉ kiểm khác 200**
  Người dùng thấy gì: Phép kiểm chưa phân biệt được tệp bị chặn vì riêng tư với tệp bị chặn do lỗi khác. Người dùng không thấy gì sai.
  Căn cứ: Kho đã được xác nhận riêng tư theo cách khác nên rủi ro thấp; chỉ làm bằng chứng yếu hơn mong muốn.
  file: `apps/api/test/truong-tep-blob-that.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (không ghim thông điệp): chữ và hạn mong đợi đọc từ chính hằng của mã đang kiểm, không viết sẵn trong test**
  Người dùng thấy gì: Nếu ai sửa chữ báo lỗi hay hạn liên kết tải thì phép kiểm không báo động. Hiện tại chữ và hạn đúng như đã hứa.
  Căn cứ: Không ảnh hưởng người dùng hôm nay; chỉ làm phép kiểm kém nhạy khi có thay đổi sau.
  file: `apps/api/test/truong-tep.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (đối chứng dương không chạy cùng biến): ttp-tat lấy đối chứng 'khoá có thì bat true' từ kho giả có bat() cố định**
  Người dùng thấy gì: Phép kiểm tự động về trường hợp thiếu khoá có một đối chứng chưa đo thật, nhưng phần chức năng đã được kiểm ở chỗ khác.
  Căn cứ: Rủi ro thấp vì có bài kiểm khác bù; người dùng không thấy gì.
  file: `apps/api/test/truong-tep.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4/5 (quét âm tính một mình, hẹp hơn lớp đã tuyên): 'màn không tự tính quyền' chỉ tìm ba token, không có đối chứng dương**
  Người dùng thấy gì: Phép quét tự động chỉ bắt vài cách viết phân quyền ở màn nên có thể bỏ sót cách khác. Quyền hiện vẫn đúng.
  Căn cứ: Người dùng không bị ảnh hưởng; chỉ là lưới an toàn của đội phát triển hẹp hơn đã nói.
  file: `apps/app/test/truong-tep.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): véc-tơ DOCX trong kieu-tep.spec là chuỗi chứa đúng chuỗi con mà nhanKieuTep tìm**
  Người dùng thấy gì: Phép kiểm dùng tệp DOCX giả dựng tay nên chưa chắc chứng minh tệp Word thật từ Word hay công cụ khác được nhận đúng.
  Căn cứ: Nếu nhận sai, người dùng thấy tệp Word hợp lệ bị từ chối và tải lại hay đổi tệp được; chưa có bằng chứng lỗi thật.
  file: `packages/validation/test/kieu-tep.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

