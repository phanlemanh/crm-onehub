## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **staffEmailDomains has no writer: the "which side is external" list is empty on every install**
  Người dùng thấy gì: Đồng nghiệp gửi form hoặc email nội bộ có thể bị hệ thống hiểu nhầm là khách bên ngoài, tạo ra khách hàng tiềm năng giả và làm sai số liệu tiếp thị.
  file: `apps/api/src/workspace/staff-domains.ts`
  severity: high
  Đề xuất: new-contract

- **Allowance status crosses the boundary as an unparsed cast, and access is denied by one exact string**
  Người dùng thấy gì: Người dùng đã bị thu hồi hoặc từ chối lời mời tham gia vẫn có thể đăng nhập thành công và được cấp vai trò như thể lời mời còn hiệu lực.
  file: `packages/auth/src/allow-list.ts`
  severity: high
  Đề xuất: new-contract

- **The seed rule the docs promise is not the rule decideSignIn implements**
  Người dùng thấy gì: Quy tắc email được duyệt sẵn khi hệ thống mới cài đặt có thể không hoạt động đúng như tài liệu mô tả, dẫn tới việc cấp hoặc từ chối quyền sai người trong một số trường hợp.
  file: `packages/auth/src/allow-list.ts`
  severity: medium
  Đề xuất: new-contract

- **decide() runs on a second pooled connection inside an open $transaction**
  Người dùng thấy gì: Khi nhiều người đăng nhập cùng lúc, hệ thống có thể bị chậm hoặc treo tạm thời, và có nguy cơ đọc nhầm thông tin quyền đã cũ.
  file: `packages/auth/src/organization.ts`
  severity: medium
  Đề xuất: new-contract

- **APP_SETTING_ID duplicates SETTINGS_ID, and findFirst breaks the appSetting accessor pattern**
  Người dùng thấy gì: Danh sách domain nội bộ của công ty có thể bị đọc nhầm dòng nếu có nhiều hơn một dòng cấu hình được lưu, làm sai việc lọc email và biểu mẫu.
  file: `apps/api/src/workspace/staff-domains.ts`
  severity: medium
  Đề xuất: new-contract

- **dev-grant-needed no longer enrols the user it seeds**
  Người dùng thấy gì: Lệnh dựng sẵn tài khoản thử cho đội phát triển không còn cho người đó vào được workspace, nên môi trường thử việc có thể bị dựng sai mà không báo lỗi gì.
  file: `apps/api/scripts/dev-grant-needed.ts`
  severity: medium
  Đề xuất: new-contract

- **Hardcoded DOM id in a dialog that otherwise uses useId()**
  Người dùng thấy gì: Nếu có nhiều hộp thoại 'cho phép truy cập' hiển thị cùng lúc, việc bấm chọn vai trò trong đó có thể không hoạt động đúng như mong đợi.
  file: `apps/app/app/(app)/[slug]/settings/members/allow-dialog.tsx`
  severity: low
  Đề xuất: known-limits

- **toStatus() coerces unknown allowance statuses to "pending" in the admin list**
  Người dùng thấy gì: Bảng quản trị 'Đã cho phép' có thể hiển thị một lời mời đã bị huỷ hoặc từ chối như thể nó vẫn còn hiệu lực, khiến quản trị viên tưởng nhầm quyền vẫn đang mở.
  file: `apps/api/src/workspace/workspace.service.ts`
  severity: low
  Đề xuất: new-contract

- **Allow-list check is fail-open: only the literal "cancelled" denies, but better-auth writes "canceled"/"rejected"**
  Người dùng thấy gì: Một lời mời đã bị huỷ qua đường khác vẫn có thể được dùng để đăng nhập và nhận vai trò, dù đáng lẽ phải bị chặn.
  file: `packages/auth/src/allow-list.ts`
  severity: high
  Đề xuất: new-contract

- **A removed member regains full API access by signing in again — only the Next proxy gates membership**
  Người dùng thấy gì: Một nhân viên đã bị gỡ khỏi workspace có thể đăng nhập lại và tiếp tục đọc/ghi dữ liệu CRM qua các trang khác, dù màn hình họ thấy báo là không còn quyền — trái với lời hứa 'mất quyền ngay' khi quản trị viên xác nhận gỡ.
  file: `packages/auth/src/organization.ts`
  severity: high
  Đề xuất: new-contract

- **staffEmailDomains has no write path and no backfill — both "is this one of us" readers silently see an empty list**
  Người dùng thấy gì: Đồng nghiệp ở domain công ty có thể bị hệ thống ghi nhầm thành người ngoài, và người điền form từ chính công ty có thể bị tính nhầm thành khách hàng tiềm năng.
  file: `apps/api/src/workspace/staff-domains.ts`
  severity: high
  Đề xuất: new-contract

- **ensureWorkspaceMembership called without email at three sites — membership is silently skipped**
  Người dùng thấy gì: Một số kịch bản đăng nhập nội bộ có thể tạo phiên đăng nhập nhưng không thêm người dùng vào workspace, khiến họ bị đưa thẳng tới màn 'hết quyền' dù đã đăng nhập thành công.
  file: `packages/auth/src/organization.ts`
  severity: high
  Đề xuất: new-contract

- **staff-domains reads appSetting with findFirst and no id filter, while defining an unused APP_SETTING_ID**
  Người dùng thấy gì: Nếu có nhiều hơn một dòng cấu hình domain nội bộ được lưu, hệ thống có thể đọc nhầm dòng, làm sai danh sách domain dùng để lọc thư và biểu mẫu mà không cảnh báo.
  file: `apps/api/src/workspace/staff-domains.ts`
  severity: medium
  Đề xuất: new-contract

- **decideSignInFromDb queries the global db client from inside an interactive transaction, and the failure is swallowed**
  Người dùng thấy gì: Việc kiểm tra quyền lúc đăng nhập có thể bị chờ lâu do giữ hai kết nối cơ sở dữ liệu cùng lúc, và khi có lỗi, người dùng chỉ bị đưa tới màn 'hết quyền' mà không có manh mối nào khác được ghi lại.
  file: `packages/auth/src/organization.ts`
  severity: medium
  Đề xuất: new-contract

- **Removed member keeps API access for up to 5 minutes because the cached session cookie is not invalidated**
  Người dùng thấy gì: Sau khi quản trị viên gỡ quyền một thành viên, người đó vẫn có thể dùng CRM bình thường trong vài phút vì trình duyệt còn giữ một phiên đã lưu tạm, dù màn xác nhận nói 'mất quyền ngay'.
  file: `apps/api/src/workspace/workspace.service.ts`
  severity: medium
  Đề xuất: new-contract

- **Sign-out on the /het-quyen screen passes the button label as the error message and drops the rejection handler**
  Người dùng thấy gì: Ở màn 'hết quyền', nếu bấm đăng xuất mà việc đăng xuất thất bại, người dùng chỉ thấy chữ trên nút lặp lại làm thông báo lỗi hoặc không thấy thông báo gì, khiến nút có vẻ như không phản hồi.
  file: `apps/app/app/(landing)/het-quyen/sign-out-button.tsx`
  severity: medium
  Đề xuất: new-contract

- **domain-nha-tach test turns any thrown exception into the exact string its assertion expects**
  Người dùng thấy gì: Bài kiểm thử cho quy tắc lọc theo domain nội bộ có thể báo đạt ngay cả khi phần xử lý bên trong bị lỗi hoàn toàn, nên một lỗi thật có thể không bị phát hiện.
  file: `apps/api/test/domain-nha-tach.spec.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc, không khép vòng ghi-đọc**
  Người dùng thấy gì: Bài kiểm thử cho quyền truy cập trước sẵn dùng dữ liệu dựng tay đúng khuôn thay vì đi qua đúng luồng cấp quyền thật, nên một lỗi ở luồng cấp quyền thật (ví dụ chữ hoa/thường của email hoặc vai trò) có thể không bị phát hiện.
  file: `packages/auth/test/cong-vao.integration.spec.ts`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 2 — Fixture viết tay thay cho lượt thêm/rút thật, khiến khẳng định bất biến chạy trên một no-op**
  Người dùng thấy gì: Bài kiểm thử khẳng định 'thêm rồi rút quyền thì nơi khác đọc đúng' thực ra không thêm hay rút quyền nào trong lúc đo, nên nó sẽ luôn báo đạt bất kể tính năng có hoạt động đúng hay không.
  file: `apps/api/test/domain-nha-tach.spec.ts`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 6 — Đường dẫn hardcode ROOT: hồ sơ S4 trỏ vào checkout của một máy khác**
  Người dùng thấy gì: Một hồ sơ đo lường thuộc tính năng khác trỏ tới đường dẫn ổ đĩa của một máy khác, nên chạy lại phép đo đó trên máy này có thể đọc nhầm dữ liệu cũ hoặc báo lỗi không đọc được, không phản ánh đúng máy đang kiểm tra.
  file: `_acceptance/cho-phep-ai-vao-o-man-hinh/s4-args.json`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 6 — Đường dẫn hardcode ROOT trong lệnh executor, hỏng hạ tầng in ra như một vi phạm đo được**
  Người dùng thấy gì: Cấu hình dùng chung cho việc chấm sàn thiết kế trỏ mặc định tới đường dẫn của một máy khác; nếu môi trường không tự đặt đúng đường dẫn, việc chấm thiết kế có thể báo 'màn hình có lỗi thiết kế nghiêm trọng' trong khi thực chất công cụ chấm không chạy được, dễ khiến người xem kết quả nhầm giữa lỗi hạ tầng và lỗi sản phẩm thật.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 5 — Tuyên quét lớp nhưng chỉ có điểm-case: hai trong ba khẳng định AST của E9 không tồn tại**
  Người dùng thấy gì: Bài kiểm thử tuyên bố quét ba kiểu lỗi khác nhau cho việc quản lý quyền admin nhưng thực ra chỉ chạy một kiểu; hai kiểu lỗi còn lại có thể lọt qua mà bài kiểm thử vẫn báo đạt.
  file: `apps/api/test/workspace-thanh-vien.spec.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 4 — Assertion âm-tính-một-mình: đối chứng dương không ghim kết quả dương, nuốt luôn ca sập**
  Người dùng thấy gì: Bài kiểm thử về việc bỏ qua form gửi từ ngoài domain công ty chỉ kiểm tra 'không phải trường hợp bị chặn', không kiểm tra 'đúng là được xử lý bình thường', nên nếu luồng xử lý form bị lỗi hoàn toàn, bài kiểm thử này vẫn có thể báo đạt.
  file: `apps/api/test/domain-nha-tach.spec.ts`
  severity: medium
  Đề xuất: new-contract

- **`bun run format` định dạng lại 166 tệp khắp kho, không chỉ tệp vừa chạm**
  Người dùng thấy gì: không thấy gì — nhưng một commit mang tên một tính năng có thể lặng lẽ sửa hồ sơ đã ký của việc khác. Trong phiên này lệnh đó đã chạm `.githooks/gate-shape.json`, `.oxlintrc.json` và một tệp bằng chứng đã ký của hồ sơ `chan-lai-component-ra-man`; đã hoàn nguyên 159 tệp ngoài phạm vi.
  file: `biome.jsonc`
  severity: medium
  Đề xuất: new-contract

- **`_acceptance/config.yaml.bak` được bộ kit sinh lại mỗi lần vá config**
  Người dùng thấy gì: không thấy gì — nhưng kho lại mọc một bản lưu lệch cạnh tệp thật sau mỗi lần thêm executor, và người đọc sau có thể mở nhầm nó. Đầu phiên này nó đã bị xoá như rác một lần, rồi `config-patch.mjs` sinh lại ngay ở bước khai executor.
  file: `.gitignore`
  severity: low
  Đề xuất: known-limits


## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 22/23 lỗi rơi vào file không bộ đo nào phủ (apps/api/src/workspace/staff-domains.ts, packages/auth/src/allow-list.ts, packages/auth/src/organization.ts, apps/app/app/(app)/[slug]/settings/members/allow-dialog.tsx, apps/api/src/workspace/workspace.service.ts, apps/app/app/(landing)/het-quyen/sign-out-button.tsx, apps/api/test/domain-nha-tach.spec.ts, packages/auth/test/cong-vao.integration.spec.ts, _acceptance/cho-phep-ai-vao-o-man-hinh/s4-args.json, _acceptance/config.yaml, apps/api/test/workspace-thanh-vien.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
