# Review findings: tin-hieu-tu-ve-kho (round 2)

## Trong hợp đồng

- **Hình dạng 4 (phủ định không có đối chứng phân biệt): ô 6 /api/auth/get-session chấp nhận «200 phiên rỗng» cho khoá chỉ-kéo, mà đối chứng khoá thường cũng chỉ đòi status 200**
  file: `apps/api/test/khoa-keo-tin-hieu.spec.ts:403`
  severity: medium
  AC: AC-4
  source: measurement
  detail: Ở dòng 385–386, ô 6 coi là «chặn» khi `r.status === 401 || (r.status === 200 && phienRong)`. Phần đối chứng ở dòng 399–404 chạy ô 6 bằng khoá thường nhưng chỉ kiểm `if (r.status !== 200)` mà không đòi body là phiên không rỗng. Giả sử đường get-session hoàn toàn không đọc x-api-key (plugin không dựng phiên ở đường này): cả hai khoá đều nhận 200 kèm body null, ô 6 của khoá chỉ-kéo vẫn tính «chặn» và đối chứng vẫn xanh. Như vậy phép đo không phân biệt được «khoá chỉ-kéo bị chặn» với «đường này chưa bao giờ mở phiên từ khoá». Ô 13 thì có đối chứng thật (204 so với 200, vì có hay không có phiên), còn ô 6 thì không.
  lý do vào hợp đồng: AC-4 dịch danh đường `/api/auth/get-session` phải đối xử khoá chỉ-kéo như không có phiên, và «Thước vế CHẾT» lấy đúng ca đo này làm bằng chứng; finding nói ca đo ở ô 6 không phân biệt được «bị chặn» với «đường này chưa bao giờ mở phiên từ khoá».

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Scheduled pull workflow uses bare GITHUB_TOKEN instead of the repo's AUTOMATION_TOKEN fallback**
  Người dùng thấy gì: PR tín hiệu mà lịch đêm tự mở sẽ không tự chạy kiểm tra. Người điều phối phải đóng rồi mở lại PR đó thì kiểm tra mới chạy.
  file: `.github/workflows/tin-hieu-keo-ve.yml`
  severity: medium
  Đề xuất: known-limits

- **Members no longer see the 'Key for' field at all, against the settings rule that controls are disabled with a reason, not hidden**
  Người dùng thấy gì: Thành viên thường không thấy lựa chọn loại khoá, thay vì thấy nó bị khoá kèm lý do. Hành vi đúng điều đã duyệt, nhưng luật trang Cài đặt chưa ghi ngoại lệ này nên màn sau có thể lấy làm tiền lệ để ẩn.
  file: `apps/app/app/(app)/[slug]/settings/api-keys/to-tao-khoa.tsx`
  severity: medium
  Đề xuất: known-limits

- **Key-type enum lives in a server package, so the client keeps its own copy**
  Người dùng thấy gì: Danh sách hai loại khoá được viết ở hai nơi và phải giữ khớp bằng tay. Hôm nay hai bản giống nhau nên người dùng không thấy gì; chỉ thành rủi ro khi sau này thêm loại khoá mới.
  file: `apps/app/app/(app)/[slug]/settings/api-keys/loai-khoa.tsx`
  severity: low
  Đề xuất: wont-fix

- **Scheduled-pull middleware never records role and scope, so the per-call tRPC log line shows role null**
  Người dùng thấy gì: Trong nhật ký, các lượt kéo theo lịch hiện vai trống nên không thể thống kê các lượt này theo vai. Hoạt động của lịch không bị ảnh hưởng.
  file: `apps/api/src/trpc/middlewares/khoa-keo-tin-hieu.middleware.ts`
  severity: low
  Đề xuất: known-limits

- **New time constant is hand-written in milliseconds instead of derived from one base unit**
  Người dùng thấy gì: Một hằng số thời gian viết thẳng số thay vì tính từ đơn vị gốc. Người dùng không thấy khác biệt; chỉ làm mã kém đồng nhất.
  file: `scripts/tin-hieu/keo-ve.ts`
  severity: low
  Đề xuất: wont-fix

- **gh CLI output is cast with `as unknown[]` instead of being parsed at the boundary**
  Người dùng thấy gì: Nếu công cụ GitHub trả về kết quả có hình dạng bất thường, lượt lịch có thể tưởng chưa có PR và mở thêm một PR thứ hai thay vì dừng đỏ. Trường hợp này hiếm.
  file: `scripts/tin-hieu/lich.ts`
  severity: low
  Đề xuất: known-limits

- **Signals-only key check turns infrastructure failures into 401 (catch nuốt lỗi)**
  Người dùng thấy gì: Khi cơ sở dữ liệu tạm hỏng đúng lúc lịch đêm chạy, lượt kéo báo khoá không hợp lệ chứ không báo hệ thống đang lỗi. Chủ kho có thể đổi một khoá vẫn còn dùng được.
  file: `apps/api/src/trpc/middlewares/khoa-keo-tin-hieu.middleware.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp, chỉ đo một điểm): E4b hứa «phiên của mọi vai, kể cả owner» bị từ chối ở đường lịch, nhưng chỉ đo phiên okr**
  Người dùng thấy gì: Bài kiểm tra mới chỉ thử đường kéo theo lịch bằng phiên đăng nhập của vai chỉ OKR, chưa thử với chủ không gian, quản trị và thành viên. Chưa có bằng chứng sai, chỉ là chưa được kiểm chứng đủ.
  file: `apps/api/test/vai-chi-okr.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 + 4: E9 ô 6 hứa «toàn bộ nhật ký gh của cả 6 ô» không có pr merge/--auto, nhưng chỉ đọc nhật ký của một ô riêng, và vòng lặp phủ định không có chặn nhật ký rỗng**
  Người dùng thấy gì: Bài kiểm tra việc lịch đêm không bao giờ tự gộp PR mới soi một trong sáu tình huống. Chưa thấy lịch gộp PR, nhưng năm tình huống còn lại chưa được bảo chứng.
  file: `scripts/tin-hieu/test/lich.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (đầu vào viết tay đúng khuôn bên đọc): t1.mjs không chạy bộ phân loại trên diff, mà tự ráp lại quyetDinh với danh sách tệp viết tay**
  Người dùng thấy gì: Phép kiểm việc PR tín hiệu được xếp loại nhẹ chưa đi qua đúng đường mà hệ thống kiểm tra thật dùng. Nếu cách lấy danh sách tệp ở đó hỏng thì phép kiểm này không báo đỏ.
  file: `_acceptance/tin-hieu-tu-ve-kho/rang/t1.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (phủ định một mình): ca «owner không chạm loại» khẳng định hộp vừa tạo KHÔNG có câu chỉ-kéo mà không khẳng định hộp vừa tạo đã hiện**
  Người dùng thấy gì: Bài kiểm tra xác nhận hộp khoá vừa tạo của khoá toàn quyền không có câu chỉ-kéo, nhưng chưa xác nhận hộp đó có hiện ra. Nếu hộp không hiện thì bài kiểm tra vẫn xanh.
  file: `apps/app/test/khoa-api-loai.dom.tsx`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
