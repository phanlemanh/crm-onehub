# Review findings: che-do-soan-bo-okr (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Save errors are classified by running a regex over the server's message text, not by reading structured error data**
  Người dùng thấy gì: Hôm nay khi lưu sai số, người dùng vẫn thấy đúng câu «Ô này nhận số». Nhưng nếu sau này câu báo lỗi của máy chủ bị đổi chữ, người dùng sẽ thấy một câu lỗi chung chung thay vì câu chỉ rõ ô nhập sai.
  Căn cứ: Chưa ảnh hưởng người dùng ở thời điểm này, không mất dữ liệu, chỉ có nguy cơ về sau khi ai đó đổi câu báo lỗi, và chữ người dùng đã gõ vẫn được giữ nguyên.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/use-luu-dong.ts`
  severity: medium
  Đề xuất: known-limits

- **phu-thuoc.ts puts test-only switches into production code, and those switches reproduce broken behaviour**
  Người dùng thấy gì: Người dùng không thấy gì khác biệt: chế độ Soạn vẫn chạy đúng như đã hứa. Chỉ có mã thừa đi kèm trong bản tải về của trang.
  Căn cứ: Không gây hậu quả nào cho người dùng, không mất dữ liệu, còn sửa thì phải đụng nhiều chỗ và cả bộ bài kiểm của vòng này nên tốn hơn nhiều so với lợi ích.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/phu-thuoc.ts`
  severity: medium
  Đề xuất: wont-fix

- **Backspace hard-deletes a saved KR with no ConfirmDialog, unlike the rule in docs/vong-doi.md and the KR delete in objective-sheet**
  Người dùng thấy gì: Nhấn Backspace ở đầu dòng KR đã để trống sẽ xoá hẳn KR đã lưu mà không hỏi lại, trong khi xoá KR ở ngăn chi tiết thì có hỏi. Hai màn xử lý khác nhau.
  Căn cứ: Muốn xoá thì người dùng đã làm nhiều bước có chủ ý (xoá hết chữ rồi nhấn Backspace), hành vi này đã được ghi trong hợp đồng, nhưng KR bị xoá nhầm thì không lấy lại được.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/tai-lieu-bo.tsx`
  severity: low
  Đề xuất: known-limits

- **Kara feedback on personal objectives, and for people who can only edit some KRs, can no longer be reached**
  Người dùng thấy gì: Với mục tiêu cá nhân, hoặc với người chỉ sửa được KR của mình, ô «Kara · N góp ý» vẫn hiện số nhưng bấm vào chỉ thấy khung trống hoặc chỉ xem, không có chỗ nào để đọc hay quyết định các góp ý đó. Trước thay đổi này họ đọc được góp ý ngay trong thẻ KR.
  Căn cứ: Người dùng mất hẳn đường đọc và xử lý góp ý của Kara ở hai nhóm này, và không tự gỡ được; dữ liệu không mất nhưng tính năng góp ý trở nên vô dụng với họ, nên cần một hợp đồng riêng quyết định các nhóm này được xem góp ý ở đâu.
  file: `apps/app/components/crm/record-sheet/objective-sheet.tsx`
  severity: high
  Đề xuất: new-contract

- **Clearing the title of an already-saved new objective, or every field of a saved new KR, never reaches the server and shows no warning**
  Người dùng thấy gì: Nếu người dùng xoá sạch tên một mục tiêu hay KR vừa tạo và đã lưu, dòng hiện trống nhưng bản lưu vẫn giữ chữ cũ, không có cảnh báo. Khi công bố, mục tiêu có thể được đăng với nội dung mà người dùng tưởng đã xoá.
  Căn cứ: Có thể công bố nội dung người dùng nghĩ là đã bỏ, và công bố rồi thì khó rút lại; tuy nhiên chỉ xảy ra với dòng vừa tạo trong cùng phiên soạn và người dùng thấy lại chữ sau khi tải lại.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/use-ghi-ban-nhap.ts`
  severity: medium
  Đề xuất: new-contract

- **Deleting a KR or objective in the soan-bo frame does not refresh the OKR cache, so other views keep showing the deleted item**
  Người dùng thấy gì: Sau khi xoá một KR hoặc mục tiêu trong khung Soạn rồi đóng khung, màn bên dưới có thể còn hiện mục vừa xoá cho đến khi tải lại. Trong khung, số mục được công bố cũng có thể đếm thừa một KR đã xoá.
  Căn cứ: Chỉ là hiển thị cũ tạm thời, dữ liệu thật đã xoá đúng, người dùng tải lại trang là hết, nhưng có thể gây bối rối trong chốc lát.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/use-ghi-ban-nhap.ts`
  severity: medium
  Đề xuất: known-limits

- **A new KR whose save failed because its objective was not saved yet is never retried after the objective saves**
  Người dùng thấy gì: Nếu mục tiêu lưu lỗi và người dùng sửa cho lưu được, các KR đã gõ trước đó vẫn ở trạng thái lỗi cho đến khi người dùng bấm vào dòng đó rồi rời ra lần nữa.
  Căn cứ: Không mất chữ đã gõ, dòng vẫn báo lỗi nên người dùng thấy và tự gỡ được bằng cách bấm lại vào dòng, chỉ gặp khi hai lỗi liên tiếp xảy ra.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/tai-lieu-bo.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): «không vùng Kara / không thẻ neo» của E12 và E13 chỉ có đối chứng dương tự cấy, không dựng lại thành phần thật**
  Người dùng thấy gì: Người dùng hôm nay không bị ảnh hưởng. Nhưng nếu sau này vùng góp ý Kara bị gắn lại vào thẻ KR, bài kiểm tự động có thể vẫn báo xanh nên lỗi lọt qua.
  Căn cứ: Không có hậu quả trực tiếp cho người dùng lúc này, chỉ làm lưới an toàn về sau yếu hơn ở một vế, các vế khác vẫn canh được.
  file: `apps/app/test/che-do-soan-bo-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định không thể đỏ): «ANH 10/10» của E16 chỉ kiểm tệp có mặt và khác rỗng, trong khi mười ảnh đã commit sẵn ở chính thư mục đích**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng. Chỉ có điều bộ ảnh bằng chứng có thể là ảnh cũ mà vẫn được tính là đủ mười.
  Căn cứ: Không ảnh hưởng sản phẩm hay dữ liệu, người ký vẫn tự nhìn ảnh ở Cổng 2 nên rủi ro thấp, sửa chỉ để chặt thêm một phép đếm phụ.
  file: `_acceptance/che-do-soan-bo-okr/rang/man-soan-do.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
