## Trong hợp đồng

- **Kéo thả nhiều tệp chỉ nhận tệp đầu, các tệp còn lại mất mà không báo gì**
  AC: AC-10
  file: `packages/ui/src/components/nguon-keo-tha.tsx:116`
  severity: medium
  source: bugs
  detail: Prop `nhieu` chỉ được truyền vào `getInputProps({ multiple: nhieu })`, còn hook vẫn gọi `useFileUpload({ onFilesAdded: nhanTep })` nên `multiple` của hook giữ mặc định false. Trong `use-file-upload.ts`, `handleDrop` có nhánh `if (!multiple) { const file = e.dataTransfer.files[0]; addFiles([file]) }`. Hệ quả: chọn qua hộp thoại thì nhận đủ, vì `handleFileChange` truyền hết `e.target.files`, nhưng kéo thả N tệp vào ô Tệp (`o-tep.tsx` có truyền `nhieu`) thì chỉ tệp đầu tới `nhanTep`/`onChon`, N-1 tệp kia biến mất, không có dòng lỗi hay dòng trạng thái nào. Bài `nguon-keo-tha.dom.tsx` (mục «nhiều tệp») chỉ thử đường input change nên không bắt được. Cách sửa: truyền `multiple: nhieu` vào `useFileUpload`.
  rationale: AC-10 đòi người kéo hai PDF vào ô và mỗi tệp hiện «Đang tải lên…» rồi thành một dòng; kéo thả chỉ nhận tệp đầu làm hỏng đúng bước này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **API không chặn agentFilled cho trường FILE; tạo qua REST/tRPC mặc định bật Kara và xếp việc backfill**
  Người dùng thấy gì: Nếu trường Tệp được tạo bằng đường lập trình thay vì màn Cài đặt, hệ thống vẫn xếp việc cho Kara điền trường đó. Kara không ghi được gì vào ô Tệp nên chỉ tốn lượt chạy vô ích.
  Căn cứ: Không mất hay lộ dữ liệu, chỉ tốn chi phí chạy thừa và chỉ xảy ra khi tạo trường ngoài màn Cài đặt; màn thật đã tắt sẵn nên người dùng thường không gặp.
  file: `apps/api/src/fields/fields.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **Ép kiểu sang Record<string, unknown> để đọc kết quả groupBy**
  Người dùng thấy gì: Không ảnh hưởng người dùng hôm nay: số tệp trên bảng vẫn đúng. Chỉ là mã khó bảo trì hơn, về sau đổi tên cột có thể làm số tệp hiện sai mà không ai báo.
  Căn cứ: Hiện không có hậu quả nào cho người dùng, và phần rủi ro tương lai sẽ lộ ra ở các bài kiểm số tệp nên sửa bây giờ không đáng công.
  file: `apps/api/src/fields/fields.service.ts`
  severity: medium
  Đề xuất: wont-fix

- **logger.error bỏ stack, trái luật ghi log của docs/api.md; donChoXoa nuốt lý do lỗi**
  Người dùng thấy gì: Khi xoá tệp trên kho lưu trữ bị hỏng, người dùng vẫn không thấy gì khác lạ. Nhật ký vận hành chỉ ghi có lỗi mà không nói vì sao, nên người trực khó tìm nguyên nhân.
  Căn cứ: Người dùng không bị ảnh hưởng, tệp hỏng vẫn được dọn lại ở lượt sau; chỉ làm chẩn đoán chậm hơn.
  file: `apps/api/src/fields/fields.service.ts`
  severity: low
  Đề xuất: wont-fix

- **TepOTep viết tay song song với schema tepTrongO**
  Người dùng thấy gì: Người dùng không thấy gì khác. Nếu sau này thêm thông tin cho tệp, màn có thể không hiện thông tin mới mà không báo lỗi.
  Căn cứ: Không có hậu quả nhìn thấy hôm nay và sửa lúc thêm trường mới là đủ.
  file: `apps/app/components/crm/fields/o-tep.tsx`
  severity: low
  Đề xuất: wont-fix

- **Nhiều tệp tải song song, ngược đặc tả «tải lần lượt»; trần 10 tệp mỗi ô vượt được khi các lượt complete đua nhau**
  Người dùng thấy gì: Khi chọn nhiều tệp cùng lúc, các tệp tải song song nên hiếm khi ô có thể vượt quá 10 tệp, và tệp bị từ chối vì ô đầy có thể hiện nút «Thử lại» vô ích.
  Căn cứ: Chỉ xảy ra khi nhiều tệp lên cùng một thời điểm sát trần, không mất dữ liệu; người dùng tự xoá bớt tệp thừa được.
  file: `apps/app/components/crm/fields/o-tep.tsx`
  severity: medium
  Đề xuất: known-limits

- **Mở tệp và xoá tệp hỏng thì nuốt lỗi: promise bị từ chối không ai bắt, người dùng không thấy gì**
  Người dùng thấy gì: Khi bấm «Mở» hoặc xác nhận xoá mà máy chủ từ chối hoặc mạng hỏng, màn không báo gì: nút Mở như không phản ứng, hộp xoá cứ mở.
  Căn cứ: Không mất dữ liệu và người dùng tải lại hay bấm lại được, nhưng gây hoang mang; chỉ xảy ra khi có sự cố.
  file: `apps/app/components/crm/fields/o-tep.tsx`
  severity: medium
  Đề xuất: known-limits

- **donChoXoa nuốt nguyên lỗi xoá Blob và lỗi ghi lanThu; dọn Blob hỏng có hệ thống thì log chỉ còn con số**
  Người dùng thấy gì: Nếu kho lưu trữ tệp bị đổi khoá hoặc hỏng kéo dài, các tệp đã xoá cứ chất đống chờ dọn mà nhật ký không nói lý do. Người dùng không thấy khác biệt.
  Căn cứ: Không ảnh hưởng người dùng; sự cố kéo dài sẽ lộ qua số tệp tồn đọng đã có chỉ số theo dõi trong hợp đồng.
  file: `packages/db/src/blob-cho-xoa.ts`
  severity: low
  Đề xuất: wont-fix

- **complete không kiểm lại tenTep so với kiểu nhận từ byte; tên, kiểu lưu và Content-Type của Blob có thể lệch nhau**
  Người dùng thấy gì: Một ảnh đặt nhầm đuôi .pdf vẫn được nhận, và khi mở có thể không hiện đúng trong trình xem. Tệp không bị mất.
  Căn cứ: Chỉ gặp khi đặt tên sai đuôi, quản trị tải lại tệp đúng tên là xong và không có rủi ro dữ liệu.
  file: `apps/api/src/fields/field-files.service.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3: E7 hứa so trùng khớp tập pathname đã xoá, test chỉ kiểm tập chứa đủ tệp mong đợi**
  Người dùng thấy gì: Bài kiểm tự động chưa phát hiện được trường hợp xoá một bản ghi mà lỡ xoá lây tệp của bản ghi khác. Nếu lỗi đó xảy ra, người dùng có thể mất tệp ở bản ghi không liên quan mà bài kiểm vẫn báo xanh.
  Căn cứ: Mất tệp là hậu quả nặng và khó tự gỡ, nhưng hiện chưa có bằng chứng lỗi thật; bổ sung bài kiểm rẻ nên đáng làm thành việc riêng.
  file: `apps/api/test/truong-tep.spec.ts`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 4: kiểm 'okr doc duoc' (KHONG_TRONG_PHAM_VI) không bao giờ đỏ được**
  Người dùng thấy gì: Bài kiểm chưa ghim được lý do từ chối khi người vai chỉ OKR xem phiếu có tệp. Họ vẫn bị chặn, nhưng nếu bị chặn sai lý do thì không ai biết.
  Căn cứ: Người dùng vẫn không xem được tệp, nên không lộ dữ liệu; chỉ là bằng chứng lỏng, siết bài kiểm rẻ.
  file: `apps/api/test/truong-tep.spec.ts`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 4: kiểm 'lo url' của nhân viên soi một trường luôn rỗng**
  Người dùng thấy gì: Bài kiểm chưa chứng minh được rằng khi nhân viên bị từ chối mở tệp, câu báo lỗi không chứa đường dẫn tệp. Nếu lỡ lộ, nhân viên có thể lấy được tệp mà bài kiểm vẫn xanh.
  Căn cứ: Lộ đường dẫn tệp hợp đồng là hậu quả nặng và không thu hồi được, nên nên siết bài kiểm dù chưa thấy lỗi thật.
  file: `apps/api/test/truong-tep.spec.ts`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 4: kiểm 'sort doi' của E9 chạy trên danh sách chỉ có một dòng**
  Người dùng thấy gì: Chưa có bằng chứng tự động rằng sắp xếp theo cột Tệp giữ nguyên thứ tự danh sách. Nếu sai, thứ tự bản ghi trên bảng có thể xáo trộn.
  Căn cứ: Nếu sai chỉ làm thứ tự bảng lạ và người dùng đổi lại cách sắp xếp là xong; không mất dữ liệu.
  file: `apps/api/test/truong-tep.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4: vế (c) của E9b (mặt form tạo không có ô Tệp) xanh rỗng khi chưa có mặt form tạo**
  Người dùng thấy gì: Hiện form tạo bản ghi chưa có ô Tệp nên chưa có gì để kiểm. Khi form tạo được thêm sau này, bài kiểm sẽ không tự canh chuyện ô Tệp xuất hiện nhầm.
  Căn cứ: Đúng giới hạn đã khai trong hợp đồng, không ảnh hưởng người dùng hôm nay.
  file: `_acceptance/truong-tep/rang/quet-kieu.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4: vế (b) của E2b (đường trần bị chặn) chỉ kiểm âm tính, sổ S3 ghi chưa từng đỏ**
  Người dùng thấy gì: Chưa có bằng chứng chắc chắn rằng đường dẫn tệp không kèm chữ ký thì bị chặn đúng lý do. Nếu kho lỡ để công khai, ai có đường dẫn sẽ đọc được tệp hợp đồng.
  Căn cứ: Lộ tệp hợp đồng là nặng và không thu hồi được, trong khi thêm một phép kiểm đối chứng thì rẻ.
  file: `apps/api/test/truong-tep-blob-that.spec.ts`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 4: vòng lưu currentView→applyView của E5b so bằng nhau nhưng không neo giá trị field:ttp_loc**
  Người dùng thấy gì: Chưa có bài kiểm tự động chắc rằng bộ lọc «Chưa có tệp» được lưu và mở lại đúng. Nếu hỏng, bộ lọc đã lưu có thể mất điều kiện về tệp.
  Căn cứ: Nếu hỏng người dùng chỉ phải đặt lại bộ lọc, không mất dữ liệu.
  file: `apps/app/test/truong-tep.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: đối chứng dương của ttp-tat chạy trên kho giả, không qua đường đọc khoá thật**
  Người dùng thấy gì: Chưa chắc chắn bằng bài kiểm rằng khi có khoá kho tệp thật thì tính năng Tệp bật lên. Nếu sai, ô Tệp có thể bị khoá dù đã cấu hình đủ.
  Căn cứ: Nếu sai sẽ lộ ngay lúc bật trên máy thật và sửa bằng cấu hình, không mất dữ liệu.
  file: `apps/api/test/truong-tep.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1: hạn URL tải về (E4) đo tham số API gửi cho kho giả, không đo URL ký thật**
  Người dùng thấy gì: Hạn sống của đường dẫn tải tệp được kiểm qua chỉ dẫn gửi cho kho, chưa đọc từ đường dẫn thật. Nếu lệch, đường dẫn tải có thể sống lâu hơn dự kiến.
  Căn cứ: Lệch nếu có chỉ kéo dài thời gian đường dẫn hợp lệ, rủi ro thấp vì chỉ quản trị nhận đường dẫn.
  file: `apps/api/test/truong-tep.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1: ô 'XLSX thật' của E3 chỉ đo tên tệp khai báo, không có byte XLSX**
  Người dùng thấy gì: Chưa thử tải tệp bảng tính thật đổi đuôi để xem hệ thống có từ chối đúng không. Nếu sót, một tệp không thuộc loại cho phép có thể lọt vào.
  Căn cứ: Các ca từ chối theo byte khác đã được thử, rủi ro còn lại thấp và không ảnh hưởng dữ liệu có sẵn.
  file: `apps/api/test/truong-tep.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: đường (7) fields.delete hứa có tệp trên ba bản ghi, fixture chỉ có một**
  Người dùng thấy gì: Chưa thử xoá một trường Tệp có tệp trên nhiều bản ghi cùng lúc. Nếu có lỗi, một số tệp có thể còn sót trên kho lưu trữ sau khi xoá trường.
  Căn cứ: Nếu sót chỉ là tệp mồ côi tốn chỗ chứ không lộ cho ai, và lượt dọn định kỳ vẫn tồn tại.
  file: `apps/api/test/truong-tep.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: 'luu tru xoa duoc' của E6 chỉ kiểm không phải 200, không ghim thông điệp, không kiểm hàng còn**
  Người dùng thấy gì: Bài kiểm chỉ xác nhận xoá tệp ở bản ghi đã lưu trữ bị từ chối, chưa nói rõ lý do và chưa xác nhận tệp còn nguyên.
  Căn cứ: Hậu quả nếu sai nhẹ và việc siết bài kiểm không đáng công vì đường này đã có phần chặn rõ ràng.
  file: `apps/api/test/truong-tep.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4: bài quét 'màn không tự tính quyền' của E4b không có đối chứng dương**
  Người dùng thấy gì: Chưa chứng minh được bài quét bắt đúng việc màn tự tính quyền. Người dùng không thấy khác biệt.
  Căn cứ: Quyền thật do máy chủ giữ và đã có bài kiểm riêng, nên việc siết bài quét này không đáng công.
  file: `apps/app/test/truong-tep.dom.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

