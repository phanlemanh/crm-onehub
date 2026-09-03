## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **social-links.ts invents a stringly-typed label sentinel instead of the `khoa` key pattern the same change establishes**
  Người dùng thấy gì: Nếu sau này có ai thêm một liên kết công ty mới mà khai sai nhãn, màn hình có thể hiện một chuỗi ký hiệu thô thay vì tên liên kết, và hệ thống sẽ không báo lỗi ngay lúc dựng.
  file: `apps/app/lib/social-links.ts`
  severity: high
  Đề xuất: known-limits

- **.claude/launch.json runs `npm run dev` in a bun-only repo, against the root task CLAUDE.md says does not run**
  Người dùng thấy gì: Cấu hình dùng để xem trước dự án cục bộ dùng nhầm công cụ và lệnh so với cách kho này thực sự chạy, nên người mở xem trước bằng cách này có thể không khởi động được.
  file: `.claude/launch.json`
  severity: medium
  Đề xuất: known-limits

- **local-date-time.tsx: the message-splitting and the injected hydration script both fail silently**
  Người dùng thấy gì: Nếu bản dịch một mốc thời gian bị viết sai khuôn, mọi mốc thời gian tương đối trên trang có thể im lặng giữ nguyên chữ tiếng Anh cũ mà không có cảnh báo nào cho người dùng hay người vận hành biết.
  file: `apps/app/components/local-date-time.tsx`
  severity: medium
  Đề xuất: known-limits

- **Coined Vietnamese identifiers moved from test files into shipped app code**
  Người dùng thấy gì: Đây là vấn đề trong cách đặt tên biến trong mã nguồn, không ảnh hưởng gì tới chữ mà người dùng nhìn thấy trên màn hình.
  file: `apps/app/components/local-date-time.tsx`
  severity: medium
  Đề xuất: known-limits

- **The dead-key guard's `song()` matches parent and leaf across the concatenated whole-app source, so it proves less than it claims**
  Người dùng thấy gì: Bài kiểm tra dùng để phát hiện các khoá dịch không còn được dùng có thể bỏ lọt lỗi thật, khiến một vài chữ còn thiếu bản dịch không được phát hiện sớm.
  file: `apps/app/test/messages-guard.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **format.ts puts a required parameter after an optional one, making the defaults unreachable**
  Người dùng thấy gì: Đây là vấn đề trong cách viết một hàm định dạng tiền tệ trong mã nguồn; vì mọi nơi gọi hàm này hiện đã phải khai đủ tham số nên chữ hiển thị cho người dùng không bị ảnh hưởng.
  file: `packages/ui/src/lib/format.ts`
  severity: low
  Đề xuất: wont-fix

- **Permanent-delete dialog for a contact lost the email-suppression warning**
  Người dùng thấy gì: Khi xoá hẳn một cá nhân, hộp thoại xác nhận không còn nhắc rằng địa chỉ email của người đó sẽ không tự động được đồng bộ lại — người dùng có thể xoá nhầm mà không biết hậu quả này, trong khi xoá nhiều cá nhân cùng lúc vẫn có lời nhắc đó.
  file: `apps/app/components/crm/record-sheet/contact-sheet.tsx`
  severity: medium
  Đề xuất: new-contract

- **Mutation sweep restores a start-of-run snapshot, silently discarding concurrent edits**
  Người dùng thấy gì: Đây là rủi ro trong công cụ đo lường nội bộ dùng lúc kiểm tra tính năng, không phải lỗi mà người dùng cuối gặp phải trên sản phẩm thật.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/dot-bien.mjs`
  severity: medium
  Đề xuất: known-limits

- **Composer discards the real error message whenever error.data is falsy**
  Người dùng thấy gì: Khi lưu một hoạt động thất bại vì một lý do khác sự cố kết nối, người dùng vẫn chỉ thấy thông báo chung chung nói kiểm tra kết nối, không thấy lý do thật, gây khó hiểu khi báo lỗi cho đội ngũ hỗ trợ.
  file: `apps/app/components/crm/timeline/activity-composer.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình 1 — Đo chỉ dẫn thay vì đầu ra: chặn chống-lách chứng minh "chạm sản phẩm thật" bằng grep mã nguồn của chính các chặn**
  Người dùng thấy gì: Bằng chứng nói không phép đo nào giả mạo việc chạm vào sản phẩm thật lại có thể tự nó bị qua mặt chỉ bằng cách nhắc đúng từ khoá trong mã nguồn mà không thực sự mở trang nào — nghĩa là một số phép đo báo đạt trong hồ sơ có thể chưa thực sự chạy trên sản phẩm thật.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khong-may-quet.sh`
  severity: high
  Đề xuất: new-contract

- **Hình 2 — Fixture viết tay đúng khuôn bên đọc: bảy giá trị giai đoạn là hằng gõ tay, không rút từ enum máy chủ**
  Người dùng thấy gì: Danh sách bảy giai đoạn thoả thuận dùng để kiểm tra được gõ tay thay vì lấy trực tiếp từ chính hệ thống, nên nếu sau này hệ thống có thêm một giai đoạn mới, phép đo sẽ không phát hiện được giai đoạn đó bị bỏ sót.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs`
  severity: high
  Đề xuất: new-contract

- **Hình 4 — Khẳng định âm-tính-một-mình: giá trị không hiện ra thì bỏ qua, không phải đỏ**
  Người dùng thấy gì: Nếu các nhãn giai đoạn hay ngành nghề không hiện ra trên màn vì lý do khác — đổi giao diện, dữ liệu trống — phép đo vẫn báo là đạt thay vì báo là không đo được gì cả.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs`
  severity: high
  Đề xuất: new-contract

- **Hình 3 — Assert "chuỗi có mặt" trong khi lời hứa là quan hệ: mảng đối chứng tiếng Anh khai ra rồi không dùng**
  Người dùng thấy gì: Phép đo chỉ kiểm tra chữ tiếng Việt có xuất hiện hay không, mà bỏ qua phần kiểm tra chữ tiếng Anh cũ đã biến mất chưa — một trang còn lẫn cả hai thứ tiếng vẫn có thể được báo là đạt.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/may-chu-ve.sh`
  severity: high
  Đề xuất: new-contract

- **Hình 4 — Khẳng định âm-tính-một-mình: chuỗi biến mất khỏi cả hai thứ tiếng được tính là đạt, và không ghim chuỗi tiếng Việt thay thế**
  Người dùng thấy gì: Nếu một chữ cũ biến mất khỏi màn hình vì lý do khác — bị gỡ bỏ hoặc dữ liệu trống, không phải vì đã được dịch — phép đo vẫn báo là đã dịch xong mà không ghi lại chữ tiếng Việt dự kiến để đối chiếu.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/no-vong-1.mjs`
  severity: medium
  Đề xuất: new-contract

- **Hình 2 — Fixture viết tay đúng khuôn bên đọc: thẻ <time> tự dựng theo hợp đồng của kịch bản đọc, không đi qua component viết**
  Người dùng thấy gì: Phép đo mốc thời gian tự dựng một phần tử thử riêng thay vì đọc phần tử do chính trang thực sự vẽ ra, nên nếu phần hiển thị mốc thời gian thật trên sản phẩm bị hỏng, phép đo này vẫn báo đạt.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs`
  severity: medium
  Đề xuất: new-contract

- **Hình 1 — Đo đầu vào thay vì đầu ra: chặn dữ liệu biên chỉ đếm hàng trong bảng, không đọc một chữ nào trên màn**
  Người dùng thấy gì: Phép đo cho ba trường hợp dữ liệu biên (thiếu người phụ trách, mới có hoạt động, tên dài) chỉ đếm số dòng dữ liệu chứ không thực sự mở màn hình đọc chữ hiển thị, nên chưa chứng minh được chữ trên màn thật sự dùng tiếng Việt trong các trường hợp này.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/du-lieu-bien.mjs`
  severity: medium
  Đề xuất: new-contract

## Chưa adversarial-verify (refuter chết)

(không có)

⚠ Cụm ngoài vùng phủ: 3/16 lỗi rơi vào file không bộ đo nào phủ (apps/app/lib/social-links.ts, .claude/launch.json, apps/app/test/messages-guard.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.