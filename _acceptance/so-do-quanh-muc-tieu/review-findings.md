# Review findings: so-do-quanh-muc-tieu (round 1)

## Trong hợp đồng

(không có finding nào map được vào AC)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Thủ tục đọc mới okr.quanhMucTieu chưa khai trong hai danh sách ghim của vai-chi-okr.spec.ts, nên hai bài test của kho đang đỏ**
  Người dùng thấy gì: Bộ kiểm thử chung của kho đang báo đỏ vì chức năng xem quanh mục tiêu chưa được khai trong danh sách quyền theo vai. Người dùng không thấy lỗi gì, nhưng chưa ai kiểm quyền của từng vai với chức năng mới và kho không đẩy lên được cho tới khi sửa.
  file: `apps/api/test/vai-chi-okr.spec.ts`
  severity: high
  Đề xuất: new-contract

- **Lời đọc okrObjective.findUnique trong quanhMucTieu thiếu dieuKienXemMucTieu và không có dòng MIEN_XEM; răng soi-ma --ca xem đỏ**
  Người dùng thấy gì: Chức năng mới đọc mục tiêu mà chưa qua bước kiểm quyền xem như các màn khác, nên máy kiểm của kho báo đỏ. Hiện chưa có ai thấy được mục tiêu không thuộc quyền mình, nhưng quy tắc an toàn chung bị bỏ qua.
  file: `apps/api/src/okr/okr-xem.service.ts`
  severity: high
  Đề xuất: new-contract

- **Trang lồng PageShell vào trong PageShell mà okr/layout.tsx đã cấp, thành hai <main> lồng nhau và hai lớp padding/scroll**
  Người dùng thấy gì: Trang xem quanh mục tiêu có lề dư và có thể có hai vùng cuộn lồng nhau, nên cảm giác cuộn hơi lạ, và trình đọc màn hình gặp cấu trúc trang sai. Dữ liệu và thao tác vẫn đúng.
  file: `apps/app/app/(app)/[slug]/okr/quanh-muc-tieu/[objectiveId]/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hằng số tinh chỉnh QUANH đặt ở đầu tệp component thay vì một tệp config theo khu vực**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng. Chỉ là chỗ đặt các con số cỡ khung chưa theo nếp của kho, người sửa sau sẽ hơi khó tìm.
  file: `apps/app/app/(app)/[slug]/okr/quanh-muc-tieu/quanh-muc-tieu.tsx`
  severity: low
  Đề xuất: wont-fix

- **Đường REST của thủ tục đọc theo một mục tiêu lệch khuôn path-param sẵn có**
  Người dùng thấy gì: Người dùng cuối không thấy gì. Chỉ lập trình viên tích hợp qua REST sẽ gặp một dạng đường dẫn khác các chức năng cùng loại.
  file: `apps/api/src/okr/okr.router.ts`
  severity: low
  Đề xuất: wont-fix

- **giu-ho-so.mjs cho qua eval đã ký đang đỏ chỉ vì bản nền cũng không xanh; một lỗi hạ tầng ở bản nền che mất lỗi hồi quy**
  Người dùng thấy gì: Phép kiểm xem vòng này có làm hỏng các hồ sơ đã ký có thể báo xanh dù có hỏng, khi bản gốc cũng đang đỏ vì lý do khác. Tin vào dòng xanh đó cần nhớ giới hạn này.
  file: `_acceptance/so-do-quanh-muc-tieu/rang/giu-ho-so.mjs`
  severity: medium
  Đề xuất: known-limits

- **giu-ho-so.mjs lọc bỏ tệp dưới test/ và docs/ dù eval chỉ khai «bỏ _acceptance/**», nên 36 eval đã ký trỏ tới messages-guard.spec.ts (vòng này sửa) bị loại khỏi N mà không báo gì**
  Người dùng thấy gì: Phép kiểm hồ sơ đã ký bỏ sót im lặng khoảng 36 hồ sơ liên quan tới tệp chữ giao diện. Rủi ro thấp vì tệp đó vẫn được kiểm riêng, nhưng con số báo ra hẹp hơn thực tế.
  file: `_acceptance/so-do-quanh-muc-tieu/rang/giu-ho-so.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — ghim thông điệp không ghim được: dot-bien.mjs so `includes(ghim)` trên toàn bộ stdout+stderr, mà bun in lại khung mã nguồn quanh dòng hỏng**
  Người dùng thấy gì: Phép thử cố ý phá mã để xem bộ kiểm có bắt được không có thể tính nhầm một số ca là bắt đúng. Độ tin cậy của con số đó thấp hơn vẻ ngoài.
  file: `_acceptance/so-do-quanh-muc-tieu/rang/dot-bien.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên «ma trận viết trước, mỗi thẻ một assert» nhưng vòng lặp chạy trên chính đầu ra nên số assert bằng số nút là hằng đúng**
  Người dùng thấy gì: Bài kiểm xác nhận mỗi nút có một thẻ có thể vẫn xanh khi màn làm rơi mất một thẻ. Nếu thẻ bị thiếu thì phép kiểm này không báo.
  file: `apps/app/test/okr-quanh-muc-tieu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — vế «mục kr null mang tên n1» đo trên dữ liệu vào và thuộc tính data-*, không đo chữ người dùng thấy**
  Người dùng thấy gì: Bài kiểm chưa xác nhận đúng chữ tên mục tiêu hiện trên dòng góp lên công ty. Nếu tên hiện sai hoặc trống, bài vẫn có thể xanh.
  file: `apps/app/test/okr-quanh-muc-tieu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — kiểm âm một mình: ca sd-b-1 của dh5-hep chỉ kiểm «không có nhóm gop-vao», không có đối chứng dương rằng danh sách hẹp đã dựng**
  Người dùng thấy gì: Ca kiểm danh sách cho màn hẹp có thể xanh cả khi danh sách không hiện ra. Màn hẹp vẫn cần được xem tay một lần.
  file: `apps/app/test/okr-quanh-muc-tieu.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — ca vòng góp của dh5-xuong: kiểm âm không đối chứng dương, và chốt thời gian không với tới lỗi nó định bắt**
  Người dùng thấy gì: Bài kiểm trường hợp dữ liệu góp vòng tròn chưa chứng minh kết quả đúng, chỉ chứng minh không lặp nút. Nếu có lỗi treo thì bài sẽ chết do hết giờ chứ không báo rõ nguyên nhân.
  file: `apps/api/test/okr-quanh-muc-tieu.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — trạng thái đầu của dh5-ro-chuot là rỗng: với tâm n1 thì mọi nút đều nằm trên pathAround, nên vế «ngoài đường mờ 0.35» chưa từng được đo**
  Người dùng thấy gì: Hiệu ứng làm mờ thẻ ngoài đường đi lúc mới mở trang chưa được máy kiểm. Nếu hiệu ứng này lỗi thì bài kiểm vẫn xanh.
  file: `apps/app/test/okr-quanh-muc-tieu.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — dh5-chu kiểm thuộc tính translate=no của phần tử [data-ten], không kiểm quan hệ «tên/đơn vị NẰM TRONG phần tử translate=no»**
  Người dùng thấy gì: Máy chưa kiểm chắc rằng tên mục tiêu và đơn vị nằm trong vùng chống tự dịch. Nếu bị dịch tự động thì tên có thể bị đổi chữ.
  file: `apps/app/test/okr-quanh-muc-tieu.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 — man.mjs đo dòng góp lên công ty bằng thuộc tính data-kr/data-muc-tieu chứ không bằng chữ hiển thị trên màn thật**
  Người dùng thấy gì: Phép kiểm màn thật xác nhận mã định danh của KR công ty chứ chưa đọc đúng chữ người dùng thấy. Chữ hiện sai hay trống có thể lọt qua phép kiểm này.
  file: `_acceptance/so-do-quanh-muc-tieu/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/15 lỗi rơi vào file không bộ đo nào phủ (apps/api/test/vai-chi-okr.spec.ts, _acceptance/so-do-quanh-muc-tieu/rang/giu-ho-so.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
