# Review findings — thanh-vien-vao-dung (round 3)

## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **TenMienNoiBo replaces the saved domains with the load-error card whenever a background refetch fails**
  Người dùng thấy gì: Sau khi quản trị lưu tên miền nội bộ thành công, nếu lần tải lại danh sách ngay sau đó gặp lỗi mạng thoáng qua, thẻ sẽ thay form bằng thông báo «Không tải được tên miền nội bộ» dù thay đổi đã được lưu. Thông báo «Đã lưu» vẫn hiện cùng lúc nên người dùng thấy hai tin trái nhau. Bấm «Thử lại» là hiện lại danh sách đã lưu.
  file: `apps/app/app/(app)/[slug]/settings/members/ten-mien-noi-bo.tsx`
  severity: low
  Đề xuất: known-limits

- **workspace.setStaffDomains is missing from the list of shared-scope mutations in vai-chi-okr.spec.ts, so the ghi-chung test fails (r1)**
  Người dùng thấy gì: Bài kiểm quyền của vai OKR sẽ đỏ vì thao tác đặt tên miền nội bộ chưa được khai vào danh sách. Người dùng không thấy lỗi, nhưng mỗi lần đẩy mã hoặc chạy CI đều bị chặn cho tới khi khai thêm.
  file: `apps/api/src/workspace/workspace.router.ts`
  severity: high
  Đề xuất: new-contract

- **Shape 1, measures instructions instead of output: ssr-loi greps the source of page.tsx instead of checking the rendered page (r1)**
  Người dùng thấy gì: Bài kiểm xem nút «Cho phép một địa chỉ» có còn sau lỗi tải trang chỉ đọc chữ trong mã chứ chưa xem trang thật. Nếu sau này ai đó sửa trang theo kiểu khác, nút có thể mất mà bài kiểm vẫn báo xanh.
  file: `apps/app/test/thanh-vien-vao-dung.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Shape 3, string present where the promise is a specific claim: the docs/api.md check 'stale row read as accepted' already passes on merge-base (r1)**
  Người dùng thấy gì: Phép kiểm xem tài liệu có nói về dòng treo đọc thành «đã vào» thì đã xanh từ trước, nên nếu ai xoá đoạn giải thích này đi, phép kiểm vẫn không phát hiện.
  file: `_acceptance/thanh-vien-vao-dung/rang/tu-dien.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 2, hand-written fixture with no round-trip: the API-side input of AC-1 is not the array the UI actually sends (r1)**
  Người dùng thấy gì: Phần màn hình và phần máy chủ của việc lưu tên miền được kiểm riêng, không kiểm nối liền. Nếu cách màn hình cắt chuỗi tên miền đổi đi, bài kiểm phía máy chủ vẫn xanh dù hai bên có thể lệch nhau.
  file: `apps/api/test/thanh-vien-vao-dung.fixture.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 2, hand-written fixture replacing the writer in the signed AC-13 measurements: loiChoPhepDaNhan writes invitation rows directly instead of calling allowEmail (r1)**
  Người dùng thấy gì: Một số bài kiểm cũ về gỡ thành viên và cho phép lại nay tự gieo dữ liệu thay vì đi qua thao tác cho phép thật. Nếu cách thao tác thật ghi dữ liệu đổi đi, các bài này có thể không phát hiện ra.
  file: `apps/api/test/workspace-thanh-vien.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 1, measures a label instead of the effect: the 'giao-dich READ ONLY' line is a hard-coded constant, yet the spec and soi-vat count it as evidence (r1)**
  Người dùng thấy gì: Tệp bằng chứng khi soi dữ liệu thật ghi sẵn dòng «chỉ đọc» mà không chứng minh lệnh thực sự chỉ đọc. Người xem không thể dựa vào dòng đó để tin lệnh soi không ghi gì vào dữ liệu.
  file: `apps/api/scripts/soi-thanh-vien.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 2, hand-written fixture: the API error message in loi-nhap is copied by hand, and no API test pins it (r1)**
  Người dùng thấy gì: Bài kiểm màn hình dùng một câu lỗi chép tay thay vì câu thật của máy chủ. Nếu câu lỗi thật đổi, bài kiểm không biết, nhưng người dùng vẫn thấy câu lỗi thật.
  file: `apps/app/test/thanh-vien-vao-dung.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Shape 4, negative assertion alone: in ky-tu-dai-dien, the '%' half only checks that the error is not ALREADY_A_MEMBER (r1)**
  Người dùng thấy gì: Một bài kiểm phụ về địa chỉ có dấu phần trăm chỉ xác nhận không bị nhận nhầm là thành viên, nên lỗi khác vẫn có thể lọt qua. Hậu quả với người dùng thường rất nhỏ.
  file: `apps/api/test/thanh-vien-vao-dung.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Shape 4, negative assertion that accepts a crash: nopForm swallows every exception, and xoa-trang/hai-duong-doc only assert '!== One of our own addresses' (r1)**
  Người dùng thấy gì: Sau khi xoá hết tên miền nội bộ, bài kiểm chỉ chắc là bài nộp biểu mẫu không còn bị bỏ qua vì là địa chỉ nội bộ, chứ chưa chắc nó được ghi nhận đúng. Nếu bước ghi nhận lỗi, bài kiểm vẫn xanh.
  file: `apps/api/test/thanh-vien-vao-dung.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 4, negative assertion alone: DOM khong-quyen cannot tell 'no permission' from 'still loading' (r1)**
  Người dùng thấy gì: Bài kiểm xác nhận thành viên thường không thấy nút, nhưng không phân biệt được «không có quyền» với «còn đang tải». Nút sẽ vẫn đúng với người dùng vì các bài kiểm khác kiểm trường hợp có quyền.
  file: `apps/app/test/thanh-vien-vao-dung.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Shape 3, presence where the promise is a relation: the '1440 loi: duoi o' line in do-man does not measure position (r1)**
  Người dùng thấy gì: Máy chỉ kiểm có hiện câu lỗi trong thẻ chứ chưa đo câu lỗi nằm dưới ô nhập. Vị trí lỗi hiện chỉ được xác nhận bằng cách người xem nhìn ảnh chụp.
  file: `_acceptance/thanh-vien-vao-dung/rang/do-man.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
