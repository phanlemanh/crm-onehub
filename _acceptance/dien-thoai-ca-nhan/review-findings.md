# Review findings: dien-thoai-ca-nhan (round 1)

## Trong hợp đồng

- **tim-bang-1440 in do-man passes without testing phone search: the row is already on screen before the search runs**
  AC: AC-9
  file: `_acceptance/dien-thoai-ca-nhan/rang/do-man.mjs:357`
  severity: medium
  source: bugs
  detail: doTimBang opens /contacts with no filter. The default sort is createdAt desc, and the contact was just created in doThemTab. bang-1440 itself requires that row to be visible on the unfiltered page. goTim types the search, then choDong checks right away for a tbody row containing nguoi.ten. ListSearch uses useSearchInput (debounced), and the contacts-table useQuery has placeholderData: previous, so the old rows (filtered or not) are still on screen. choDong returns true immediately for both inputs ("+84 …" and "0…"). The "CHIEU DO" red path that E17 promises (a copy of searchFilter without the phone branch must give SAI "tim-bang: thieu nguoi") never happens: E17 stays DUNG even if phone search is broken. The script also does not print the row count for each search, although E17 expects it. Fix: wait until the URL or the query has committed q and the request has finished (isFetching false), and check the number of rows, for example search with a filter that excludes other contacts, or compare against a fragment that must not match.
  rationale: AC-9 hứa gõ số vào ô tìm của bảng thì ra đúng người; phép đo màn khai cho AC-9 xanh dù tìm theo số hỏng nên lời hứa chưa được chứng minh.

- **Hình dạng 3 (assert chuỗi có mặt, trong khi lời hứa là quan hệ): ô tim-bang-1440 xanh dù bảng chưa lọc**
  AC: AC-9
  file: `_acceptance/dien-thoai-ca-nhan/rang/do-man.mjs:358`
  severity: high
  source: measurement
  detail: Lời hứa của AC-9/E17: gõ số vào ô tìm thì bảng lọc ra đúng người mang số đó. doTimBang gõ số (goTim) rồi gọi ngay choDong(p, nguoi.ten). choDong chỉ hỏi «có dòng nào chứa tên người này», dò ngay lập tức, không chờ truy vấn tìm chạy xong. Ngay trước đó, doBang (dòng 315, 328) đã chứng minh dòng của người này hiện sẵn trên /contacts khi CHƯA tìm gì (`thay` phải true thì bang-1440 mới DUNG). Vì vậy lần dò đầu tiên sau khi gõ thấy ngay dòng cũ, trước khi debounce và fetch xong (danh sách cũ vẫn đang hiện). Ô này không có đối chứng âm, ví dụ gõ một số không khớp thì dòng phải biến mất, cũng không chờ truy vấn ổn định. Ở bản sao «searchFilter bỏ nhánh số» (CHIỀU ĐỎ của E17), «+84 901 …» vẫn ra «co» và ô vẫn DUNG. Kết quả này không phụ thuộc vào việc tìm theo số có chạy hay không.
  rationale: Lời hứa của AC-9 là bảng lọc ra đúng người mang số; phép đo chỉ kiểm có dòng chứa tên, không chứng minh việc lọc.

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): dòng ngưỡng «12» của ma trận E11 bị thay bằng «R12»**
  AC: AC-9
  file: `apps/api/test/dien-thoai-ca-nhan.spec.ts:283`
  severity: medium
  source: measurement
  detail: evals.yaml E11 và AC-9 khai trước ma trận 5 dòng, trong đó có `"12" -> co R, khong P, khong Q` để đo nhánh «dưới ngưỡng thì không lọc theo số» (SO_DIEN_THOAI.timToiThieu). Bảng BANG trong test lại viết `["R12", "--R"]`. Với «R12», soQuocNoiDeTim trả null vì regex KY_TU_SO không nhận chữ cái, nên đi nhánh «có chữ», không đi qua ngưỡng độ dài. Nếu bỏ ngưỡng timToiThieu khỏi đường list thì «12» sẽ khớp quốc nội 901234444 của P. Hiện không dòng nào ở tầng ContactsService.list bắt được điều đó: phần tử «dưới ngưỡng» của ma trận viết trước không có assert tương ứng. Phần tử này chỉ có ở test đơn vị manh-tim của gói validation, không có ở tầng mà AC-9 hứa.
  rationale: AC-9 nêu rõ trường hợp gõ «12» dưới ngưỡng thì không lọc theo số; test ở tầng API thay bằng «R12» nên vế này chưa được đo.

- **Hình dạng 1 (đo khối dựng thay vì đầu ra của bề mặt): «ngăn chi tiết» chỉ render SoDienThoai, không render ContactSheet**
  AC: AC-8
  file: `apps/app/test/dien-thoai-ca-nhan.dom.tsx:202`
  severity: medium
  source: measurement
  detail: E10 hứa «describe ngan-chi-tiet: ContactSheet với phone +84901234567 -> liên kết href tel:+84901234567 và textContent 0901 234 567», và khai contact-sheet.tsx trong paths. Test lại render thẳng `<SoDienThoai so="+84901234567" goi />` và không import ContactSheet. Nếu contact-sheet.tsx quay lại hiện số thô, bỏ prop `goi`, hay không dùng SoDienThoai nữa, test vẫn xanh. do-man.mjs cũng không có ô nào cho ngăn chi tiết. Nửa «ngăn chi tiết» của AC-8 vì vậy chưa có phép đo nào nhìn vào đầu ra của bề mặt đó.
  rationale: AC-8 hứa ngăn chi tiết hiện số dạng đẹp kèm liên kết tel:; test không đi qua ngăn chi tiết nên vế này chưa được đo trên bề mặt thật.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **SoDienThoai builds its own <a> link instead of using Link from @crm/ui**
  Người dùng thấy gì: Số điện thoại bấm gọi được vẫn chạy đúng, nhưng khi người dùng đi bằng bàn phím thì không thấy viền báo đang đứng ở số đó, và kiểu gạch chân hơi khác các chỗ khác.
  file: `apps/app/components/crm/so-dien-thoai.tsx`
  severity: medium
  Đề xuất: known-limits

- **The phone normaliser is written twice, and the SQL copy hard-codes its constants**
  Người dùng thấy gì: Hiện tại việc chặn trùng số vẫn đúng. Nhưng nếu sau này ai đó đổi quy tắc đọc số ở một nơi mà quên nơi kia, hai người cùng một số có thể được lưu mà không bị báo trùng.
  file: `packages/db/src/so-dien-thoai.ts`
  severity: medium
  Đề xuất: known-limits

- **Magic score 4 for a phone hit in Kara's lookup**
  Người dùng thấy gì: Kara vẫn tìm ra đúng người theo số. Chỉ có rủi ro nhỏ là nếu đổi cách xếp hạng kết quả sau này thì người khớp theo số có thể bị xếp lệch thứ tự.
  file: `apps/agent/agent/lib/lookup.ts`
  severity: low
  Đề xuất: wont-fix

- **VN numbers written with a trunk 0 after +84 (or a doubled 0) are accepted but stored wrong. This gets past the duplicate check and search, and shows the wrong number**
  Người dùng thấy gì: Nếu ai đó gõ số dạng +84 rồi lại kèm số 0 đầu, hệ thống vẫn nhận nhưng lưu sai số, hiện sai số, và có thể để lọt hai người trùng số mà không báo.
  file: `packages/validation/src/so-dien-thoai.ts`
  severity: high
  Đề xuất: new-contract

- **caNhanCoSo caps at 500 ids with no ORDER BY and no archivedAt filter, so list search can silently drop results and report a wrong total**
  Người dùng thấy gì: Khi gõ một đoạn số ngắn khớp với hơn 500 người, danh sách có thể thiếu người và tổng số hiện ra không đúng, mà không có dấu hiệu nào báo là kết quả đã bị cắt.
  file: `packages/db/src/so-dien-thoai.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính không ghim được thông điệp): CHIỀU ĐỎ «thieu o Dien thoai» ra mã 2 KHÔNG ĐO ĐƯỢC chứ không ra dòng SAI**
  Người dùng thấy gì: Nếu ai bỏ mất ô Điện thoại khỏi form, phép đo sẽ báo «không đo được» thay vì báo «sai», nên người xem có thể hiểu nhầm là lỗi môi trường chứ không phải lỗi tính năng.
  file: `_acceptance/dien-thoai-ca-nhan/rang/do-man.mjs`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 4 (âm tính một mình): «0 yêu cầu contacts.create» ở so-sai-375 không có đối chứng dương cho bộ đếm**
  Người dùng thấy gì: Phép đo màn có thể báo «không gọi lưu khi số sai» chỉ vì bộ đếm không bắt được yêu cầu nào, chứ chưa chắc form thật sự chặn lại.
  file: `_acceptance/dien-thoai-ca-nhan/rang/do-man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): router trả 400 cho «abc» mà không có đối chứng dương qua cùng router, không ghim thông điệp**
  Người dùng thấy gì: Bài kiểm chưa phân biệt được việc số sai bị từ chối đúng lý do với việc bị từ chối vì một lỗi nhập liệu khác.
  file: `apps/api/test/dien-thoai-ca-nhan.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): test «goi-y-moi-gioi: nhan o chon» chỉ assert từ điển messages**
  Người dùng thấy gì: Có một bài kiểm chỉ đọc bảng chữ mà không nhìn màn hình, nên nó xanh nhưng không chứng minh được điều gì cho người dùng.
  file: `apps/app/test/dien-thoai-ca-nhan.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3: bang-1440 lấy giá trị mong đợi bằng chính hàm đang được đo**
  Người dùng thấy gì: Nếu cách hiện số hỏng, phép đo màn của bảng có thể vẫn báo đúng vì nó so với chính kết quả của cách hiện đó.
  file: `_acceptance/dien-thoai-ca-nhan/rang/do-man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3: «không lộ số» của Kara chỉ dò khoá «phone» và chuỗi chữ số liền**
  Người dùng thấy gì: Bài kiểm chỉ bắt được trường hợp số lộ ra ở dạng liền mạch; nếu sau này số lộ ra ở dạng có dấu cách hay có +84 thì bài kiểm sẽ không phát hiện.
  file: `apps/agent/test/tim-theo-so.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
