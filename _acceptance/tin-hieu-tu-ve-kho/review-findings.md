# Review findings: tin-hieu-tu-ve-kho (round 3)

## Trong hợp đồng

Không có finding nào map được vào AC ở round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The scheduled queue branch and PR break the repo's one-job-one-name rule**
  Người dùng thấy gì: Mỗi sáng PR hàng chờ tín hiệu vẫn mở và chạy đúng, nhưng nhánh và tiêu đề của nó mang một cái tên khác với tên của việc này trong lộ trình. Người tra lộ trình có thể không nhận ra PR đó là của việc nào.
  file: `scripts/tin-hieu/lich.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (quét lớp, chỉ có ca điểm): ma trận E4 «13 đường viết trước» lấy số dòng từ bảng lúc chạy và không ghim số dòng**
  Người dùng thấy gì: Hiện khoá chỉ-kéo vẫn bị từ chối ở mọi đường khác đúng như hứa. Nhưng nếu sau này ai đó bớt một đường khỏi danh sách kiểm, bài kiểm vẫn xanh và không ai biết đường đó thôi được kiểm nữa.
  file: `apps/api/test/khoa-keo-tin-hieu.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (quét lớp, chỉ có ca điểm): E4b khai «phiên của mọi vai (cả owner)» bị từ chối ở đường lịch, nhưng chỉ đo phiên vai okr**
  Người dùng thấy gì: Đường kéo tín hiệu theo lịch đã được kiểm là từ chối người dùng vai chỉ OKR đang đăng nhập, nhưng chưa được kiểm với chủ hay quản trị đăng nhập bằng trình duyệt. Nếu có lỗi riêng ở trường hợp đó thì bài kiểm hiện tại sẽ không báo.
  file: `apps/api/test/vai-chi-okr.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assert âm tính một mình): ô 6 của E9 «không lệnh gộp» không có đối chứng dương, không ghim thông điệp, và chỉ quét nhật ký của chính nó**
  Người dùng thấy gì: Lịch chạy không tự gộp PR và điều đó đang đúng. Chỉ có điều bài kiểm khẳng định việc này có thể xanh ngay cả khi nó không quan sát được gì, nên lời bảo đảm yếu hơn vẻ ngoài.
  file: `scripts/tin-hieu/test/lich.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assert âm tính một mình): ô member/okr của tvk-man không chứng minh tờ tạo khoá đã hiện trước khi khẳng định «không có nhóm loại»**
  Người dùng thấy gì: Thành viên thường và vai chỉ OKR đúng là không thấy lựa chọn loại khoá. Nhưng bài kiểm cho hai vai này không chứng minh tờ tạo khoá đã mở ra, nên nếu tờ đó hỏng riêng cho họ thì bài kiểm vẫn báo xanh.
  file: `apps/app/test/khoa-api-loai.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

- **Scheduled pull workflow uses bare GITHUB_TOKEN instead of the repo's AUTOMATION_TOKEN fallback (r2)**
  Người dùng thấy gì: PR tín hiệu mà lịch đêm tự mở sẽ không tự chạy kiểm tra. Người điều phối phải đóng rồi mở lại PR đó thì kiểm tra mới chạy.
  file: `.github/workflows/tin-hieu-keo-ve.yml`
  severity: medium
  Đề xuất: known-limits

- **Members no longer see the 'Key for' field at all, against the settings rule that controls are disabled with a reason, not hidden (r2)**
  Người dùng thấy gì: Thành viên thường không thấy lựa chọn loại khoá, thay vì thấy nó bị khoá kèm lý do. Hành vi đúng điều đã duyệt, nhưng luật trang Cài đặt chưa ghi ngoại lệ này nên màn sau có thể lấy làm tiền lệ để ẩn.
  file: `apps/app/app/(app)/[slug]/settings/api-keys/to-tao-khoa.tsx`
  severity: medium
  Đề xuất: known-limits

- **Key-type enum lives in a server package, so the client keeps its own copy (r2)**
  Người dùng thấy gì: Danh sách hai loại khoá được viết ở hai nơi và phải giữ khớp bằng tay. Hôm nay hai bản giống nhau nên người dùng không thấy gì; chỉ thành rủi ro khi sau này thêm loại khoá mới.
  file: `apps/app/app/(app)/[slug]/settings/api-keys/loai-khoa.tsx`
  severity: low
  Đề xuất: wont-fix

- **Scheduled-pull middleware never records role and scope, so the per-call tRPC log line shows role null (r2)**
  Người dùng thấy gì: Trong nhật ký, các lượt kéo theo lịch hiện vai trống nên không thể thống kê các lượt này theo vai. Hoạt động của lịch không bị ảnh hưởng.
  file: `apps/api/src/trpc/middlewares/khoa-keo-tin-hieu.middleware.ts`
  severity: low
  Đề xuất: known-limits

- **New time constant is hand-written in milliseconds instead of derived from one base unit (r2)**
  Người dùng thấy gì: Một hằng số thời gian viết thẳng số thay vì tính từ đơn vị gốc. Người dùng không thấy khác biệt; chỉ làm mã kém đồng nhất.
  file: `scripts/tin-hieu/keo-ve.ts`
  severity: low
  Đề xuất: wont-fix

- **gh CLI output is cast with `as unknown[]` instead of being parsed at the boundary (r2)**
  Người dùng thấy gì: Nếu công cụ GitHub trả về kết quả có hình dạng bất thường, lượt lịch có thể tưởng chưa có PR và mở thêm một PR thứ hai thay vì dừng đỏ. Trường hợp này hiếm.
  file: `scripts/tin-hieu/lich.ts`
  severity: low
  Đề xuất: known-limits

- **Signals-only key check turns infrastructure failures into 401 (catch nuốt lỗi) (r2)**
  Người dùng thấy gì: Khi cơ sở dữ liệu tạm hỏng đúng lúc lịch đêm chạy, lượt kéo báo khoá không hợp lệ chứ không báo hệ thống đang lỗi. Chủ kho có thể đổi một khoá vẫn còn dùng được.
  file: `apps/api/src/trpc/middlewares/khoa-keo-tin-hieu.middleware.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (đầu vào viết tay đúng khuôn bên đọc): t1.mjs không chạy bộ phân loại trên diff, mà tự ráp lại quyetDinh với danh sách tệp viết tay (r2)**
  Người dùng thấy gì: Phép kiểm việc PR tín hiệu được xếp loại nhẹ chưa đi qua đúng đường mà hệ thống kiểm tra thật dùng. Nếu cách lấy danh sách tệp ở đó hỏng thì phép kiểm này không báo đỏ.
  file: `_acceptance/tin-hieu-tu-ve-kho/rang/t1.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (phủ định một mình): ca «owner không chạm loại» khẳng định hộp vừa tạo KHÔNG có câu chỉ-kéo mà không khẳng định hộp vừa tạo đã hiện (r2)**
  Người dùng thấy gì: Bài kiểm tra xác nhận hộp khoá vừa tạo của khoá toàn quyền không có câu chỉ-kéo, nhưng chưa xác nhận hộp đó có hiện ra. Nếu hộp không hiện thì bài kiểm tra vẫn xanh.
  file: `apps/app/test/khoa-api-loai.dom.tsx`
  severity: low
  Đề xuất: known-limits
