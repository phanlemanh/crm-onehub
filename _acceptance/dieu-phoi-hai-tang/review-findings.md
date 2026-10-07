# Review findings: dieu-phoi-hai-tang (round 4)

## Trong hợp đồng

Không có finding nào trong hợp đồng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **dieu-phoi.config.json and hang-viec.json are not checked when read; a `bao_ve` written as a string lets the machine approve edits to protected files**
  Người dùng thấy gì: Nếu người điền tay tệp cấu hình đợt sai kiểu (ví dụ ghi danh sách tệp được bảo vệ thành một chuỗi thay vì danh sách), máy sẽ tự duyệt việc sửa các tệp lẽ ra phải do người quyết, và không báo gì. Lỗi này dễ xảy ra khi mở đợt và đi theo hướng nguy hiểm.
  file: `scripts/dieu-phoi/yeu-cau.mjs`
  severity: medium
  Đề xuất: new-contract

- **The rule that `day.worktree` must be a realpath is never checked; a trailing slash or symlinked path silently turns off the waiting-for-you hook**
  Người dùng thấy gì: Nếu người mở đợt gõ đường dẫn thư mục làm việc của thợ có dấu gạch chéo cuối hoặc đi qua đường tắt, bảng quyết định sẽ không bao giờ hiện việc đang chờ người của thợ đó và không có báo lỗi nào. Người giám sát phải nhập đúng đường dẫn thật như README dặn.
  file: `scripts/dieu-phoi/dot.mjs`
  severity: medium
  Đề xuất: known-limits

- **The dieu-phoi tests run in no gate: not in `bun run test`, not in pre-push, not in CI, even though the hooks run in every crm session**
  Người dùng thấy gì: Bộ kiểm tra của công cụ điều phối không chạy trong lệnh test chung, trước khi đẩy mã hay trên CI. Nếu sau này ai đó sửa hỏng công cụ, mọi phiên làm việc trong kho có thể bị chặn nhầm hoặc để lọt việc nặng mà không cổng nào báo đỏ.
  file: `package.json`
  severity: medium
  Đề xuất: new-contract

- **The set of request kinds and resources is declared in three separate places that can drift apart**
  Người dùng thấy gì: Danh sách các loại việc được xin nằm ở nhiều chỗ. Khi sau này thêm một loại việc mới mà quên sửa đủ chỗ, đơn hợp lệ có thể bị loại hoặc một khoá có thể không bao giờ được thu hồi. Hiện tại chưa gây lỗi.
  file: `scripts/dieu-phoi/hinh-dang.mjs`
  severity: low
  Đề xuất: known-limits

- **The S4 lock check misses the per-round Workflow script copies this repo actually runs, so S4 can start without the lock**
  Người dùng thấy gì: Trong thực tế các lượt kiểm S4 được chạy từ bản sao có tên kèm tên tính năng và số vòng, và công cụ chặn hiện không nhận ra chúng. Hai lượt S4 vẫn có thể chạy cùng lúc mà không giữ khoá, đúng sự cố ngày 04/10 mà tính năng này sinh ra để ngăn.
  file: `scripts/dieu-phoi/hook-chan-s4.mjs`
  severity: high
  Đề xuất: new-contract

- **A lock is taken back mid-run when its holder waits on a long background job, so a second heavy lane can start**
  Người dùng thấy gì: Khi một thợ chạy việc rất dài ở nền (như ghim lại khoảng 70 phút) và ngồi chờ, khoá của họ có thể bị thu hồi giữa chừng và giao cho thợ khác. Khi đó hai việc nặng chạy cùng lúc trên máy, trong khi báo cáo chỉ nói khoá bị bỏ rơi.
  file: `scripts/dieu-phoi/lich.mjs`
  severity: medium
  Đề xuất: new-contract

- **An approved `gia-han` extension request never extends the lease**
  Người dùng thấy gì: Thợ xin giữ khoá thêm giờ sẽ nhận được câu trả lời đã duyệt, nhưng thời hạn giữ khoá thực tế không đổi. Họ có thể mất khoá giữa chừng dù tưởng đã được gia hạn.
  file: `scripts/dieu-phoi/yeu-cau.mjs`
  severity: medium
  Đề xuất: new-contract

- **Shape 2 (no writer-to-reader round trip): the heartbeat file that hook-nhip writes is never read by motNhip in any test**
  Người dùng thấy gì: Bộ kiểm tra chưa chứng minh được đường đi trọn vẹn của tín hiệu còn sống của thợ tới quyết định gia hạn hay thu hồi khoá. Nếu phần này bị sửa hỏng, bộ kiểm tra vẫn xanh. Chủ kho đã biết và chấp nhận ở vòng trước.
  file: `scripts/dieu-phoi/test/phat-lich.test.mjs`
  severity: high
  Đề xuất: known-limits

- **Shape 3 (asserts a substring is present while the promise is ket_qua + reason): the regex 'danh sách bảo vệ' also matches the approval reason**
  Người dùng thấy gì: Hai bài kiểm tra về tệp được bảo vệ có thể xanh dù máy duyệt nhầm, nhưng một bài kiểm tra khác trong bộ vẫn bắt được lỗi đó. Không có hậu quả mới cho người dùng.
  file: `scripts/dieu-phoi/test/yeu-cau.test.mjs`
  severity: medium
  Đề xuất: wont-fix

- **Shape 3/4 (substring only, no exit code, no anchor): case 'khoá thuộc phiên khác → exit 2' never asserts exit 2**
  Người dùng thấy gì: Bài kiểm tra cho trường hợp khoá đang thuộc phiên khác chưa kiểm mã thoát, nên nếu sau này công cụ để lọt lệnh trong trường hợp đó thì bộ kiểm tra vẫn xanh. Hiện công cụ vẫn chặn đúng.
  file: `scripts/dieu-phoi/test/hook-chan-s4.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (lone negative assertion that cannot fail): 'luật cũ không cấp ai' in lich.test is a tautology**
  Người dùng thấy gì: Một ca kiểm tra luôn xanh và không chứng minh gì, nhưng bài kiểm tra thật cho cùng việc đã có ở chỗ khác. Không ảnh hưởng người dùng.
  file: `scripts/dieu-phoi/test/lich.test.mjs`
  severity: low
  Đề xuất: wont-fix

- **Shape 2 (fake io answers regardless of arguments): the git diff mock does not check which branch is being diffed**
  Người dùng thấy gì: Phép đo giả lập chưa kiểm được là hệ thống so đúng nhánh của yêu cầu hay không. Nếu sau này so nhầm nhánh thì phép đo vẫn xanh. Rủi ro thấp.
  file: `_acceptance/dieu-phoi-hai-tang/rang/nhip-that.mjs`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Không có.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
