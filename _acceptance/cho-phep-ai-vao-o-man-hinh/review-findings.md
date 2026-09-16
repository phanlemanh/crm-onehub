Review Findings — cho-phep-ai-vao-o-man-hinh (round 1)

## Trong hợp đồng

- **removeMember so email phân biệt hoa thường — lời cho phép không bị huỷ, lần đăng nhập sau tự cấp lại tư cách thành viên**
  file: `apps/api/src/workspace/workspace.service.ts:396`
  severity: high
  AC: AC-5
  source: bugs
  detail: Trong removeMember: `tx.invitation.updateMany({ where: { ..., email: target.user.email, ... } })` — dùng THẲNG email lưu trong bảng user, so khớp chính xác (Postgres phân biệt hoa thường). Mọi điểm khác của chính tính năng này đều chuẩn hoá: allowEmail lưu qua `normalizeEmail` (chữ thường), readAllowState truy vấn `where: { email: normalized }`, decideSignIn so `normalizeEmail(candidate.email) === email`. Chính bất đối xứng đó tạo lỗi: nếu hàng user lưu `Khue@Gmail.com` (codebase không giả định email user là chữ thường — apps/api/src/mailbox/mailbox-match.service.ts:62 phải tự `.toLowerCase()` mới dùng được), updateMany không khớp hàng `khue@gmail.com` nên lời cho phép ở nguyên trạng thái `accepted`; lần đăng nhập kế tiếp ensureWorkspaceMembership (packages/auth/src/organization.ts:93) gọi decide — nhánh này CÓ chuẩn hoá nên tìm thấy hàng accepted — và tạo lại hàng `member`. Gỡ bị hoàn tác im lặng, đúng thứ AC-5 hứa là không xảy ra. Bài kiểm apps/api/test/workspace-thanh-vien.spec.ts chỉ dùng email toàn chữ thường nên không bắt được. Sửa: `email: normalizeEmail(target.user.email) ?? target.user.email`.
  rationale: Cùng lỗi với t2: phá vỡ đúng hai vế của AC-5 là lời cho phép phải chuyển sang cancelled và người bị gỡ không được tái tạo tư cách thành viên khi đăng nhập lại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Cột staffEmailDomains không có đường ghi nào — lọc "địa chỉ nhà" ở tracking chết hẳn**
  Người dùng thấy gì: Ô cài đặt domain nội bộ mới hiện chưa có nơi nào trên giao diện để nhập giá trị, nên tính năng loại nhân viên tự điền form khỏi số liệu tiếp thị coi như chưa bật được ở bất kỳ bản cài nào.
  file: `apps/api/src/workspace/staff-domains.ts`
  severity: high
  Đề xuất: new-contract

- **Quyết định đăng nhập fail-open với mọi status lạ, và ép kiểu không qua parser ở biên DB**
  Người dùng thấy gì: Nếu một lời mời bị huỷ hoặc hết hạn theo cách ghi khác với quy ước hiện tại, hệ thống có thể vẫn coi đó là lời mời còn hiệu lực và để người đó đăng nhập được.
  file: `packages/auth/src/allow-list.ts`
  severity: medium
  Đề xuất: new-contract

- **Gỡ thành viên không chặn phiên đang sống — API không kiểm tra tư cách thành viên**
  Người dùng thấy gì: Người vừa bị gỡ khỏi không gian làm việc có thể vẫn dùng được các tính năng như xem hoặc sửa khách hàng, giao dịch cho tới khi phiên đăng nhập của họ tự hết hạn, dù màn hình đã báo họ mất quyền.
  file: `apps/api/src/workspace/workspace.service.ts`
  severity: medium
  Đề xuất: new-contract

- **workspace.allowances trả nguyên bảng, client lọc pending trong trình duyệt**
  Người dùng thấy gì: Màn quản lý danh sách cho phép hiện tải về toàn bộ lịch sử cho phép và rút phép thay vì chỉ phần đang chờ, có thể chậm dần khi danh sách dài lên theo thời gian.
  file: `apps/api/src/workspace/workspace.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Bảng allowances dựng bằng thẻ <table> thô thay vì component của @crm/ui**
  Người dùng thấy gì: Bảng danh sách lời cho phép trên màn Members được dựng khác kiểu với các bảng khác trong sản phẩm, nên trải nghiệm và giao diện không hoàn toàn đồng nhất.
  file: `apps/app/app/(app)/[slug]/settings/members/allowances-table.tsx`
  severity: medium
  Đề xuất: known-limits

- **APP_SETTING_ID trùng SETTINGS_ID của @crm/db, và chính hàm đọc không dùng nó**
  Người dùng thấy gì: Không ảnh hưởng tới người dùng — đây thuần tuý là một chi tiết tổ chức mã nguồn phía sau.
  file: `apps/api/src/workspace/staff-domains.ts`
  severity: low
  Đề xuất: known-limits

- **Gỡ thành viên không thu hồi quyền: phiên cũ vẫn sống và API không hề kiểm tư cách thành viên**
  Người dùng thấy gì: Người bị gỡ có thể vẫn truy cập được dữ liệu công ty một thời gian sau khi bị gỡ, và khi đăng nhập lại có thể còn vào được một vài trang trước khi bị chặn hẳn.
  file: `apps/api/src/workspace/workspace.service.ts`
  severity: high
  Đề xuất: new-contract

- **Quyết định cho vào mở-mặc-định với mọi status lạ, và ép kiểu không phân tích ở biên**
  Người dùng thấy gì: Nếu quy trình mời có sẵn trong nền tảng ghi trạng thái theo cách khác với dự kiến, người bị từ chối hoặc lời mời đã hết hạn vẫn có thể đăng nhập được.
  file: `packages/auth/src/allow-list.ts`
  severity: high
  Đề xuất: new-contract

- **staffEmailDomains không có đường ghi nào — mọi cài đặt đọc ra rỗng, chặn 'địa chỉ nhà' ở tracking chết hẳn**
  Người dùng thấy gì: Ô cài đặt domain nội bộ mới chưa có nơi nào để nhập giá trị, nên tính năng tách domain nội bộ ra khỏi số liệu tiếp thị vẫn chưa hoạt động được trên các bản cài hiện có.
  file: `apps/api/src/workspace/staff-domains.ts`
  severity: medium
  Đề xuất: new-contract

- **Hai lệnh đo nghiệm thu trỏ vào khối test không tồn tại — AC-3 và AC-5 không có bằng chứng nào**
  Người dùng thấy gì: Hai phần việc quan trọng của tính năng gỡ thành viên và rút lời cho phép hiện chưa có bài kiểm tự động nào chạy được, nên nhóm chưa có bằng chứng máy để yên tâm trước khi phát hành.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **decide() chạy bằng client `db` toàn cục ở giữa `db.$transaction`, nên đọc ngoài giao dịch và giữ hai kết nối**
  Người dùng thấy gì: Trong tình huống hệ thống chịu tải rất nặng, có một khả năng nhỏ khiến người vừa đăng nhập bị hiểu nhầm là chưa có quyền và bị đưa sang màn 'hết quyền' dù họ vẫn hợp lệ.
  file: `packages/auth/src/organization.ts`
  severity: low
  Đề xuất: wont-fix

- **Nút đăng xuất ở màn hết quyền truyền nhãn nút làm thông báo lỗi, và không bắt promise**
  Người dùng thấy gì: Nếu việc đăng xuất ở màn 'hết quyền' gặp trục trặc, thông báo hiện ra sẽ chỉ lặp lại chữ trên nút bấm thay vì giải thích lỗi thật, gây khó hiểu cho người dùng.
  file: `apps/app/app/(landing)/het-quyen/sign-out-button.tsx`
  severity: low
  Đề xuất: known-limits

- **Fixture VIẾT TAY đúng khuôn bên đọc — E2 cấm đích danh nhưng test vẫn cắm thẳng Prisma**
  Người dùng thấy gì: Bài kiểm tự động cho việc gán vai trò định trước hiện dựng sẵn dữ liệu mẫu đúng khuôn nó mong đợi, nên nếu có lệch giữa lúc lưu và lúc đọc vai trò trong thực tế, bài kiểm sẽ không phát hiện ra.
  file: `packages/auth/test/cong-vao.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Fixture VIẾT TAY thay đường ghi thật — E4 rút lời cho phép bằng updateMany, không gọi revokeAllowance**
  Người dùng thấy gì: Bài kiểm tự động cho việc rút lời cho phép không đi qua đúng quy trình rút thật, nên nếu sau này việc rút phép vô tình xoá luôn một thành viên đang hoạt động, bài kiểm sẽ không phát hiện.
  file: `packages/auth/test/cong-vao.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Đo lớp trung gian thay vì ĐẦU RA — E11 hứa đo hai đường đọc mailbox-match/tracking-filing nhưng test chỉ gọi helper staffEmailDomains**
  Người dùng thấy gì: Bài kiểm cho tính năng tách domain nội bộ hiện chỉ kiểm tra một lớp trung gian, không kiểm tra kết quả thực tế ở hai nơi sử dụng nó, nên một lỗi ở hai nơi đó có thể lọt qua mà không ai biết.
  file: `apps/api/test/domain-nha-tach.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Khẳng định rỗng: "thêm rồi rút lời cho phép" không hề ghi gì vào DB**
  Người dùng thấy gì: Một trong các bài kiểm tuyên bố xác nhận dữ liệu không đổi sau khi thêm rồi rút quyền, nhưng thực chất phép thử đó không ghi dữ liệu thật vào hệ thống, nên gần như luôn báo đạt bất kể có lỗi hay không.
  file: `apps/api/test/domain-nha-tach.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Tuyên quét LỚP nhưng chỉ có một điểm-case — E9 khai ba khẳng định AST, test chỉ có khẳng định thứ ba**
  Người dùng thấy gì: Bài kiểm đảm bảo màn quản lý thành viên kiểm tra quyền đúng cách hiện chỉ kiểm tra một trong ba khía cạnh đã hứa, nên một cách viết sai kiểm tra quyền khác vẫn có thể lọt qua.
  file: `apps/api/test/workspace-thanh-vien.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Tuyên bố có phép đo nhưng KHÔNG có case nào — cmd của E3 và E5 lọc trúng zero test**
  Người dùng thấy gì: Hai phần việc quan trọng của tính năng rút lời cho phép và gỡ thành viên hiện không có bài kiểm tự động nào chạy được, nên chưa có bằng chứng máy để yên tâm trước khi phát hành.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: E8 chỉ ghim "có lỗi" chứ không ghim thông điệp, và thiếu cặp đếm thứ hai**
  Người dùng thấy gì: Bài kiểm đảm bảo không gỡ được người chủ cuối cùng hiện chỉ kiểm tra chung chung là 'có lỗi xảy ra', không kiểm tra đúng lý do hay đúng thông điệp, nên một lỗi khác không liên quan cũng có thể khiến bài kiểm báo đạt.
  file: `apps/api/test/workspace-thanh-vien.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Assert một giá trị thay cho QUAN HỆ đã hứa — E10 đòi đếm số lượt truy vấn, test đếm số hàng**
  Người dùng thấy gì: Bài kiểm đảm bảo hệ thống từ chối sớm trước khi chạm dữ liệu hiện chỉ đếm số dòng dữ liệu bị thay đổi chứ không đếm số lần hệ thống chạm cơ sở dữ liệu, nên vẫn có thể báo đạt dù đã lỡ truy vấn không cần thiết.
  file: `apps/api/test/workspace-thanh-vien.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Khẳng định không thể đỏ + thoát im lặng: describe duong-moi tự vô hiệu khi DB còn hàng user**
  Người dùng thấy gì: Một số bài kiểm cho tình huống 'lần đầu chưa ai vào hệ thống' sẽ tự bỏ qua việc kiểm tra nếu môi trường thử còn sót dữ liệu cũ, nên có nguy cơ báo đạt mà thực ra chưa kiểm tra gì.
  file: `packages/auth/test/cong-vao.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Thiếu khẳng định đã tuyên — E7 khai ba khẳng định, test bỏ khẳng định "phiên VẪN tạo được"**
  Người dùng thấy gì: Bài kiểm đảm bảo hệ thống không bị treo khi đọc danh sách cho phép bị lỗi hiện chưa kiểm tra rằng người dùng vẫn đăng nhập được bình thường trong tình huống đó, mới kiểm được một phần đã hứa.
  file: `packages/auth/test/cong-vao.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 5/23 lỗi rơi vào file không bộ đo nào phủ (apps/api/src/workspace/staff-domains.ts, _acceptance/config.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
