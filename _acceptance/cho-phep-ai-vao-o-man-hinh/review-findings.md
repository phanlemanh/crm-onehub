## Trong hợp đồng

- **Gỡ thành viên không thu hồi phiên, và không lớp nào ở API kiểm tư cách thành viên — người bị gỡ giữ nguyên quyền đọc/ghi toàn bộ dữ liệu**
  file: `apps/api/src/workspace/workspace.service.ts:391`
  severity: high
  AC: AC-6
  detail: `removeMember` xoá hàng `member` và chuyển lời cho phép sang `cancelled`, nhưng không đụng đến bảng `session`. Grep toàn kho (trừ node_modules) không có `session.deleteMany` / `revokeUserSessions` ở bất kỳ đâu trong `apps` hay `packages`.

  Hai lớp chặn duy nhất đều không kiểm tư cách thành viên:
  - `apps/api/src/trpc/middlewares/auth.middleware.ts:17` chỉ kiểm `ctx.session?.user` rồi cho qua. Không gọi `workspaceRoleOf`.
  - `apps/app/lib/session.ts:12` `requireSession()` cũng chỉ kiểm phiên tồn tại.

  Vậy chặn duy nhất là redirect ở `apps/app/proxy.ts:55` (`workspace.inWorkspace === false`). Nó chỉ chạy cho điều hướng TRANG, không chạm mọi lời gọi tRPC mà client gửi thẳng sang `API_URL` (cổng 3001), và nó fail-open: `read()` ở `apps/app/lib/onboarding.ts:42-47` trả `null` khi `!response.ok` hoặc khi `AbortSignal.timeout(2_000)` cắn, `workspaceAnswer.parse(null)` rơi vào `.catch` → `viewerRole` undefined → `inWorkspace: null` → không redirect.

  Kịch bản hỏng: admin gỡ B lúc 10:00. B đang mở tab. Phiên better-auth của B còn sống nhiều ngày. B tiếp tục gọi `contacts.list`, `deals.update`, `apiKeys.create`… — tất cả trả 200. Ngay cả trên trình duyệt, chỉ cần một lần `workspace.get` quá 2 giây là proxy cho B vào thẳng app.
  source: bugs

- **Đo LỚP TRUNG GIAN thay vì ĐẦU RA — E11 hứa đo mailbox-match và tracking-filing, test chỉ gọi helper staffEmailDomains**
  file: `apps/api/test/domain-nha-tach.spec.ts:59`
  severity: high
  AC: AC-10
  detail: E11 khai "gọi THẬT hai đường đọc" nhưng cả file không hề nạp `MailboxMatchService` hay `TrackingFilingService`; ba khẳng định duy nhất đều đọc `staffEmailDomains(db)` (dòng 59, 63, 81, 86, 95, 118) — đúng cái helper mới thêm. Nếu ai đó cấy lại `workspaceDomains()` vào `mailbox-match.service.ts:60` hoặc `tracking-filing.service.ts:82`, helper vẫn trả đúng ô domain nhà và thuốc vẫn xanh trọn vẹn. Đo cái nguồn mà chưa chứng minh bên tiêu thụ có đọc nó.
  source: measurement

- **Assertion âm-tính-một-mình — E8 chỉ ghim "có lỗi", không ghim thông điệp, và thiếu cặp đếm lời cho phép**
  file: `apps/api/test/workspace-thanh-vien.spec.ts:253`
  severity: medium
  AC: AC-7
  detail: Dòng 240-258 bắt lỗi rồi chỉ khẳng định `cau.length > 0`. `removeMember` ném ít nhất bốn loại lỗi khác nhau; một `memberId` sai, một lần đổi tên trường, hay bất kỳ lỗi lập trình nào cũng cho `cau.length > 0` và thuốc vẫn xanh trong khi bất biến "phải còn một chủ" đã vỡ. Test chỉ đếm hàng `member` (dòng 236, 248), không đếm `invitation`, và không ghim câu lệnh `FOR UPDATE` như E8 khai.
  source: measurement

- **Đối chứng dương đo chính lệnh ghi của bài kiểm — `db.user.create` của test được đếm như thể cổng vào tạo ra nó**
  file: `apps/api/test/workspace-thanh-vien.spec.ts:606`
  severity: medium
  AC: AC-3
  detail: E3 đòi "một địa chỉ còn được phép... phải tạo đúng một hàng user" qua đường thật. Dòng 601-616: sau khi `quaCong(conPhep)` chỉ xác nhận hook `before` không ném, chính bài kiểm gọi `db.user.create({ data: nguoiMoi(conPhep) })` (dòng 606) rồi khẳng định `cuoi.user - sau.user === 1` (dòng 611). Con số 1 ấy là kết quả của lệnh Prisma trong test, không phải của đường đăng nhập. Cùng khuôn ở `packages/auth/test/cong-vao.integration.spec.ts:130-136`.
  source: measurement

- **Thiếu khẳng định đã tuyên — E5 khai tính NGUYÊN TỬ là chiều đo thật, describe go-tron-ven không có nó**
  file: `apps/api/test/workspace-thanh-vien.spec.ts:621`
  severity: low
  AC: AC-5
  detail: E5 nói thẳng "khẳng định 3 là chiều đo thật sự của tiêu chí này: hai lệnh ghi không nằm chung một giao dịch thì khẳng định 1 và 2 vẫn xanh, còn dữ liệu thì lệch." Describe `go-tron-ven` (dòng 621-675) chỉ có một thuốc, đo khẳng định 1 và 2. Không nơi nào ép `invitation.updateMany` (hay `member.delete`) hỏng để kiểm rằng cả hai cùng không xảy ra.
  source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **decideSignIn fails open on any status it doesn't recognise, and "cancelled" doesn't match better-auth's "canceled"**
  Người dùng thấy gì: Nếu một lời mời bị huỷ hoặc bị từ chối qua tính năng có sẵn của hệ thống đăng nhập (không phải nút gỡ/rút trên màn Members), người bị huỷ mời đó vẫn có thể đăng nhập được, và bảng Allowances hiển thị nhầm họ như đang chờ duyệt.
  file: `packages/auth/src/allow-list.ts`
  severity: high
  Đề xuất: new-contract

- **appSetting.staffEmailDomains has no writer and no backfill — the staff-domain check is dead everywhere**
  Người dùng thấy gì: Không có nơi nào trên sản phẩm để nhập danh sách domain nội bộ, nên nhân viên tự điền form thử trên web công ty có thể bị ghi nhận nhầm thành khách hàng tiềm năng, và đồng nghiệp chưa có tài khoản CRM bị xếp nhầm là người ngoài.
  file: `apps/api/src/workspace/staff-domains.ts`
  severity: high
  Đề xuất: new-contract

- **decideSignInFromDb opens a second connection from inside ensureWorkspaceMembership's interactive transaction**
  Người dùng thấy gì: Trong một số tình huống hiếm khi nhiều người đăng nhập cùng lúc, hệ thống có thể treo lại rồi từ chối nhầm một người có quyền hợp lệ, đẩy họ ra màn hình 'hết quyền' mà không có lỗi rõ ràng.
  file: `packages/auth/src/organization.ts`
  severity: high
  Đề xuất: new-contract

- **Google `hd` is still pinned to ALLOWED_SIGN_IN, so an allowance for an outside address cannot sign in**
  Người dùng thấy gì: Một quản trị viên có thể thêm một địa chỉ email bên ngoài (ví dụ của môi giới hay chuyên viên ngân hàng) vào danh sách cho phép và thấy nó hiện ra như đang chờ, nhưng người đó vẫn bị Google từ chối ngay ở màn hình đăng nhập, không vào được.
  file: `packages/auth/src/auth.ts`
  severity: medium
  Đề xuất: new-contract

- **staff-domains.ts re-declares SETTINGS_ID and reads the singleton with findFirst and no where clause**
  Người dùng thấy gì: Nếu sau này có nhiều hơn một hàng cấu hình trong bảng cài đặt, hệ thống có thể đọc nhầm cấu hình và lọc domain nội bộ sai mà không ai nhận ra.
  file: `apps/api/src/workspace/staff-domains.ts`
  severity: medium
  Đề xuất: wont-fix

- **seedAllows re-implements the allow-list parser that workspace.ts already owns, orphaning isWorkspaceEmail**
  Người dùng thấy gì: Nếu một trong hai chỗ đọc danh sách được phép này đổi cách phân tích chuỗi mà quên đổi chỗ kia, người dùng có thể được cho vào hoặc bị chặn không nhất quán giữa hai đường, ẩn cho tới khi có sự cố.
  file: `packages/auth/src/allow-list.ts`
  severity: medium
  Đề xuất: wont-fix

- **allowEmailInput does not validate that the input is an email — the repo's own z.email() pattern is skipped**
  Người dùng thấy gì: Hệ thống chấp nhận một số chuỗi không phải là địa chỉ email hợp lệ (ví dụ thiếu tên miền hoặc có khoảng trắng ở giữa) khi quản trị viên thêm người được phép, tạo ra quyền truy cập gắn với địa chỉ sai.
  file: `apps/api/src/workspace/workspace.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **_acceptance/config.yaml hardcodes a machine-specific plugin path and pins a version**
  Người dùng thấy gì: Người duyệt có thể thấy kết quả kiểm tra tự động là 'đạt' dù phép đo thực ra chạy bằng phiên bản công cụ cũ hoặc đường dẫn chỉ có trên một máy, làm giảm độ tin cậy của bằng chứng trước khi duyệt.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: wont-fix

- **Gate eval cp_duong_moi passes vacuously whenever the test database has any user**
  Người dùng thấy gì: Nếu tính năng chặn biến mồi ở bản cài mới bị hỏng sau này, bài kiểm tự động hiện tại sẽ không phát hiện ra vì nó tự bỏ qua khi cơ sở dữ liệu đã có người dùng.
  file: `packages/auth/test/cong-vao.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **dev:session no longer produces a workspace member — the documented local login is broken**
  Người dùng thấy gì: Người vận hành không thể tạo phiên đăng nhập thử cho một địa chỉ email mới trên máy phát triển bằng lệnh đã được tài liệu hoá; lệnh này âm thầm tạo phiên không có quyền.
  file: `apps/api/scripts/dev-session.ts`
  severity: medium
  Đề xuất: known-limits

- **viewerRole is the only field in workspaceAnswer without .catch, so one bad value collapses the whole gate answer**
  Người dùng thấy gì: Nếu máy chủ trả về dữ liệu vai trò không đúng định dạng (trường hợp hiếm), người dùng có thể bị đưa vào trạng thái quyền không xác định và đường dẫn kèm tên không gian làm việc ngừng hoạt động đúng cho tới khi tải lại.
  file: `apps/app/lib/onboarding.ts`
  severity: low
  Đề xuất: known-limits

- **Cột staffEmailDomains không có đường ghi nào và migration không backfill — hai đường lọc "địa chỉ nhà" đọc ra rỗng trên mọi cài đặt**
  Người dùng thấy gì: Không có nơi nào để nhập danh sách domain nội bộ, nên nhân viên tự điền form thử trên web công ty bị ghi nhận nhầm thành khách hàng tiềm năng, và đồng nghiệp chưa có tài khoản CRM bị xếp nhầm là người ngoài.
  file: `apps/api/src/workspace/staff-domains.ts`
  severity: high
  Đề xuất: new-contract

- **decideSignIn fail-open với mọi status lạ, và chữ "cancelled" lệch với "canceled" mà better-auth thật sự ghi**
  Người dùng thấy gì: Nếu một lời mời bị huỷ hoặc từ chối qua tính năng có sẵn của hệ thống đăng nhập, người bị huỷ đó vẫn đăng nhập được, và bảng Allowances hiện họ như đang chờ duyệt.
  file: `packages/auth/src/allow-list.ts`
  severity: medium
  Đề xuất: new-contract

- **decide() chạy bằng client db toàn cục ở GIỮA db.$transaction — đọc ngoài giao dịch, mở cửa cho người vừa bị gỡ lọt vào vĩnh viễn**
  Người dùng thấy gì: Trong một số tình huống hiếm khi hai thao tác diễn ra gần như cùng lúc, một người vừa bị rút quyền vẫn có thể trở thành thành viên và ở lại vĩnh viễn, không bao giờ bị xét lại.
  file: `packages/auth/src/organization.ts`
  severity: medium
  Đề xuất: new-contract

- **ensureWorkspaceMembership nuốt lỗi và từ chối im lặng — người hợp lệ bị đóng đinh ở màn /het-quyen suốt vòng đời phiên, không có đường thử lại**
  Người dùng thấy gì: Một người mới được admin cho phép hợp lệ có thể, do một lỗi thoáng qua của hệ thống lúc đăng nhập lần đầu, bị kẹt vĩnh viễn ở màn 'hết quyền' dù chưa từng bị gỡ, không có gì báo lý do.
  file: `packages/auth/src/organization.ts`
  severity: medium
  Đề xuất: new-contract

- **Fixture VIẾT TAY đúng khuôn bên đọc — E2 cấm đích danh, test vẫn cắm thẳng Prisma**
  Người dùng thấy gì: Nếu cách ghi dữ liệu thật của hệ thống lệch chữ hoa/thường so với cách đọc, lỗi đó có thể không bị bài kiểm tự động phát hiện.
  file: `packages/auth/test/cong-vao.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Khẳng định KHÔNG THỂ ĐỎ — hai vế của "ai-vao-duoc KHONG doi" là hai lời gọi có đối số hệt nhau**
  Người dùng thấy gì: Nếu ô domain nội bộ vô tình được nối vào quyết định ai được đăng nhập, bài kiểm tự động hiện tại sẽ không phát hiện ra.
  file: `apps/api/test/domain-nha-tach.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Khẳng định rỗng — "thêm rồi rút một lời cho phép" không ghi một hàng invitation nào**
  Người dùng thấy gì: Nếu việc thêm hay rút một lời cho phép vô tình ảnh hưởng tới việc lọc email nội bộ, bài kiểm tự động hiện tại sẽ không phát hiện ra.
  file: `apps/api/test/domain-nha-tach.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Khẳng định tautology + thoát im lặng — describe duong-moi tự vô hiệu khi DB còn hàng user**
  Người dùng thấy gì: Nếu tính năng chặn biến mồi ở bản cài mới bị hỏng sau này, bài kiểm tự động hiện tại có thể vẫn báo đạt vì nó tự bỏ qua khi có sẵn dữ liệu.
  file: `packages/auth/test/cong-vao.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Fixture VIẾT TAY thay đường ghi thật — E4 rút lời cho phép bằng updateMany chứ không gọi revokeAllowance**
  Người dùng thấy gì: Nếu thủ tục rút lời cho phép thật ghi trạng thái khác với giả định của bài kiểm, sai lệch đó có thể không bị phát hiện.
  file: `packages/auth/test/cong-vao.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Đường dẫn hardcode ROOT — sàn thiết kế trỏ vào thư mục plugin trên máy tác giả, ghim cứng version 2.14.0**
  Người dùng thấy gì: Người duyệt có thể thấy kết quả 'đạt' dù phép đo chạy trên máy khác hoặc phiên bản công cụ khác, làm giảm độ tin cậy của bằng chứng.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: wont-fix

- **Assert số HÀNG thay cho QUAN HỆ đã hứa (số lượt truy vấn) — ba dòng xấu của E10 không chứng minh được "chặn TRƯỚC khi chạm DB"**
  Người dùng thấy gì: Nếu thứ tự kiểm tra bên trong bị đảo, một số bước có thể chạm cơ sở dữ liệu trước khi từ chối mà bài kiểm tự động hiện tại không phát hiện ra.
  file: `apps/api/test/workspace-thanh-vien.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Tuyên ba khẳng định AST nhưng chỉ có một — E9 vế mặt người thiếu khẳng định dương và khẳng định âm về so chuỗi vai**
  Người dùng thấy gì: Nếu một bản sao logic phân quyền thứ hai mọc lên trong màn Members, bài kiểm tự động hiện tại có thể không phát hiện ra.
  file: `apps/api/test/workspace-thanh-vien.spec.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 7/28 lỗi rơi vào file không bộ đo nào phủ (apps/api/src/workspace/staff-domains.ts, _acceptance/config.yaml, apps/api/scripts/dev-session.ts, apps/app/lib/onboarding.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
