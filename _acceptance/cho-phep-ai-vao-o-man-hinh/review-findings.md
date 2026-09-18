## Trong hợp đồng

- **Vế `phienSau` đếm đúng hàng mà chính bài kiểm vừa ghi — không thể đỏ một mình, nhưng đọc như số đo cho «vẫn tạo được phiên mới»**
  - AC: AC-4
  - file: `packages/auth/test/cong-vao.integration.spec.ts:406`
  - severity: medium
  - source: conventions
  - detail: Dòng 398-399 tự chạy hook rồi tự `db.session.create`; dòng 406 đếm lại hàng session của cùng `userId` và dòng 423 khẳng định `phienSau === 1`. Vì hàng đó do chính bài kiểm ghi, vế này chỉ có thể đỏ khi Prisma nổ — nó không phân biệt được sản phẩm còn cho tạo phiên hay không, tức không chạm vế Then thứ hai của AC-4 theo cách một số đo phải chạm lời hứa. Ba vế thật sự gánh lực phân biệt là `truocKhiDo === TRANG_THAI_HUY` (dòng 420), `activeOrganizationId === WORKSPACE_ID` (dòng 423) và `hang !== null`. Đề nghị: hoặc bỏ `phienSau` để không dựng vẻ bằng chứng, hoặc đổi nó thành vế đọc được từ đường sản phẩm (ví dụ gọi đường đăng nhập thật rồi đếm), và nói rõ trong expected của E4 rằng `phienTruoc === 0` là chốt cách li cữ liệu chứ không phải phép đo AC-4. Chính hợp đồng đã cảnh báo lớp lỗi này ở Ngoài-8.

- **E4 rút bằng `db.invitation.updateMany` trần, không qua `revokeAllowance` — chiều đỏ mà expected khai là bất khả đạt**
  - AC: AC-4
  - file: `packages/auth/test/cong-vao.integration.spec.ts:378`
  - severity: high
  - source: bugs
  - detail: Dòng 378 gieo lượt rút bằng `db.invitation.updateMany({ ... data: { status: TRANG_THAI_HUY } })`, và câu chặn mới ở dòng 385 khẳng định ngược lại: "phep do khong con do nhanh rut that". Đường rút thật là `WorkspaceService.revokeAllowance` (apps/api/src/workspace/workspace.service.ts:319-350). Expected của E4 khai nguyên văn chiều đỏ: "neu ban sua cho rut cung xoa thanh vien thi chan phai DO". Kịch bản hỏng cụ thể: thêm `await tx.member.deleteMany({ where: { userId } })` vào `revokeAllowance` — phép đo này vẫn XANH vì nó không gọi hàm ấy; và không suite nào khác bù được, E3 (apps/api/test/workspace-thanh-vien.spec.ts:609) chỉ rút lời cho phép của một địa chỉ CHƯA từng thành thành viên, còn `cho-phep-lai` (dòng 182) và `ghi-hang-co-ten` (dòng 900) cũng vậy. Không có phép đo nào ở kho gọi `revokeAllowance` lên lời cho phép của người ĐÃ là thành viên rồi đọc lại hàng `member`.

- **`phienSau === 1` là khẳng định vòng tròn — chính phép đo ghi hàng session, nên vế "vẫn tạo được phiên mới" của AC-4 vẫn chưa có số đo**
  - AC: AC-4
  - file: `packages/auth/test/cong-vao.integration.spec.ts:399`
  - severity: high
  - source: bugs
  - detail: Dòng 398 gọi `hookTruocPhien()(phienCua(nguoiCu.id))` rồi dòng 399 tự `db.session.create({ data: ra.data })`. `phienTruoc` (dòng 394) đọc trước khi create, `phienSau` (dòng 406) đọc sau. Kịch bản hỏng: `phienSau` không thể khác 1 — nếu `db.session.create` nổ thì test đã đỏ ở dòng 399 trước khi tới assertion; nếu nó không nổ thì count luôn là 1. Hai vế 0/1 ở dòng 422-423 vì vậy không loại được hành vi sai nào. Đường tạo phiên thật của better-auth (adapter create + hook `after`/`notifySignedIn`) không chạy; chỉ `databaseHooks.session.create.before` được gọi tay. Lời hứa "ho VAN tao duoc phien moi" trong expected của E4 vẫn chưa có phép đo — chỉ có phép ghi của chính bài kiểm.

- **Hình dạng 3 — assert giá trị WORKSPACE_ID có mặt, trong khi AC-4 hứa quan hệ "đã vào rồi thì rút lời cho phép không chặn được phiên mới"**
  - AC: AC-4
  - file: `packages/auth/test/cong-vao.integration.spec.ts:424`
  - severity: high
  - source: measurement
  - detail: Vế mới `phienDaGhi?.activeOrganizationId ?? null` phải bằng `WORKSPACE_ID` (dòng 424, kỳ vọng ở dòng 431). Giá trị này do hook `session.create.before` (packages/auth/src/auth.ts:292-299) lấy từ `ensureWorkspaceMembership(...) ?? null`, và hàm đó trả ĐÚNG `workspace.id` trên MỌI nhánh không nổ: dòng 109 (đã là thành viên), dòng 113 (`if (!decision.allowed) return workspace.id` — tức nhánh BỊ CHẶN), dòng 138 (được nhận); chỉ khối catch dòng 145 trả `undefined`. Nên vế này chỉ phân biệt "giao dịch có nổ hay không", không phân biệt "còn vào được" với "bị chặn" — đúng lớp lỗi đã ghi ở round 4, round này chỉ DỜI khẳng định từ giá trị trả về của hàm sang cột `activeOrganizationId` của hàng session, không chữa. Nặng hơn: người trong phép đo ĐANG là thành viên (dòng 376 `daLaThanhVien`), nên dòng 109 trả về trước khi `decide(email)` được gọi — trạng thái lời cho phép (accepted / canceled / không có dòng nào) KHÔNG hề được đọc trong cả nhánh đo. `activeOrganizationId` sẽ là `WORKSPACE_ID` y như vậy dù bỏ hẳn lượt rút. Thứ duy nhất nối phép đo với trạng thái đã rút là `truocKhiDo` (dòng 389-392), mà đó là đọc lại chính lệnh ghi của bài kiểm.

- **Hình dạng 2 — lượt rút gieo bằng Prisma cầm tay, không đi qua bên ghi thật, nên chiều đỏ mà E4 khai không bao giờ bắn được**
  - AC: AC-4
  - file: `packages/auth/test/cong-vao.integration.spec.ts:378`
  - severity: high
  - source: measurement
  - detail: Dòng 378-381 gieo trạng thái đã rút bằng `db.invitation.updateMany({ ..., data: { status: TRANG_THAI_HUY } })`. Đường rút THẬT duy nhất trong kho là `apps/api/src/workspace/workspace.service.ts:340-344` (`revokeAllowance`, ghi `status: TRANG_THAI_HUY` sau khi kiểm quyền và tìm `target`); `packages/auth/src` không có đường rút nào (grep `revoke` chỉ ra `AllowanceRow`). Vì bài kiểm không gọi thủ tục rút, chiều đỏ mà E4 khai trong evals.yaml — "nếu bạn sửa chỗ rút cũng xoá thành viên thì chặn phải ĐỎ" — là chiều đỏ chết: sửa `revokeAllowance` thêm một lệnh xoá `member` thì bài này vẫn XANH, vì nó chỉ cần cột `status` đang là `canceled`. Guard mới ở dòng 383-387 không vá lỗ đó: `daRut.count !== 1` chỉ chứng minh chính lệnh `updateMany` của bài kiểm chạm đúng một hàng, còn thông điệp của nó ("phep do khong con do nhanh rut that") nói ngược điều nó làm — phép đo chưa bao giờ đo nhánh rút thật.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Cổng «hết quyền» chỉ có ở tầng trang — /api/trpc không kiểm tư cách thành viên, mà bằng chứng E12 vẫn chấm clean**
    Người dùng thấy gì: Người vừa bị gỡ khỏi không gian làm việc nhưng phiên đăng nhập còn sống có thể vẫn lấy được dữ liệu qua các đường gọi ngầm của ứng dụng, dù màn hình chính đã chặn đúng như đã hứa.
    file: `_acceptance/cho-phep-ai-vao-o-man-hinh/evidence/E12-network.txt`
    severity: high
    Đề xuất: new-contract

- **`ra.data as PhienGieo` — cast qua `unknown` ở đúng chỗ AGENTS.md cấm, và kiểu khẳng định thiếu chính trường đang được đo**
    Người dùng thấy gì: Nếu tên trường nội bộ dùng để xác định không gian làm việc bị đổi, bài kiểm có thể không báo lỗi rõ ràng, khiến một lỗi thật liên quan tới việc giữ quyền truy cập lọt qua mà báo cáo vẫn ghi đạt.
    file: `packages/auth/test/cong-vao.integration.spec.ts`
    severity: medium
    Đề xuất: wont-fix

- **E13: lượt gieo dòng chờ bằng UI (bước eval mới bắt) không có mặt trong bản dump mạng, và dòng khai xuất xứ của vòng 4 bị mất khi ghi đè**
    Người dùng thấy gì: Bằng chứng cho thấy một dòng cho phép mới xuất hiện trên màn nhưng không ghi lại được thao tác tạo ra nó thực sự đi qua giao diện, nên khó xác nhận chắc chắn lượt kiểm này phản ánh đúng thao tác thật.
    file: `_acceptance/cho-phep-ai-vao-o-man-hinh/evidence/E13-network.txt`
    severity: medium
    Đề xuất: known-limits

- **Khung hình E12 sinh bằng `scripts/_e12-capture.mjs` chưa theo dõi, đi ngoài đường `capture.ui` đã khai trong config**
    Người dùng thấy gì: Khung hình minh hoạ cho màn 'hết quyền' được tạo bằng một công cụ nằm ngoài kho được theo dõi, nên nếu cần dựng lại bằng chứng này sau này có thể không tái tạo được y hệt.
    file: `_acceptance/cho-phep-ai-vao-o-man-hinh/evidence/E12-man-het-quyen.png`
    severity: medium
    Đề xuất: known-limits

- **`PHIEN_MS` chép lại hạn phiên của sản phẩm thành số ngay trong tệp kiểm**
    Người dùng thấy gì: Hạn phiên đăng nhập trong bài kiểm được chép tay thay vì lấy từ cấu hình sản phẩm, nên nếu chính sách thời hạn phiên đổi sau này, bài kiểm có thể không phản ánh đúng mà không ai nhận ra.
    file: `packages/auth/test/cong-vao.integration.spec.ts`
    severity: low
    Đề xuất: wont-fix

- **E13: bước gieo dòng cho vào bảng đứng SAU cả hai bước chụp khung hình — chạy đúng thứ tự thì khung `admin` không có nút rút, sinh ĐỎ giả**
    Người dùng thấy gì: Nếu chạy lại đúng thứ tự bước hiện ghi trong tệp kiểm, có thể xuất hiện báo lỗi giả cho khả năng thao tác của người quản trên màn Thành viên, dù sản phẩm đang làm đúng.
    file: `_acceptance/cho-phep-ai-vao-o-man-hinh/evals.yaml`
    severity: medium
    Đề xuất: known-limits

- **Bằng chứng E13 không có POST nào — dòng seed hiện trên khung admin không chứng được là vào qua UI như bước 324 đòi**
    Người dùng thấy gì: Bằng chứng không ghi lại được thao tác tạo dòng cho phép mới trên màn quản trị, nên khó xác nhận chắc chắn nó được tạo đúng qua giao diện như bước kiểm đòi hỏi.
    file: `_acceptance/cho-phep-ai-vao-o-man-hinh/evidence/E13-network.txt`
    severity: medium
    Đề xuất: known-limits

- **`ra.data as PhienGieo` là cast `unknown` trần, và `PhienGieo` không khai `activeOrganizationId` — đúng trường mà assertion đọc**
    Người dùng thấy gì: Nếu tên trường lưu không gian làm việc đang hoạt động bị đổi, bài kiểm có thể báo lỗi không chỉ rõ nguyên nhân, khiến việc xác minh quyền truy cập khó theo dõi hơn.
    file: `packages/auth/test/cong-vao.integration.spec.ts`
    severity: low
    Đề xuất: wont-fix

- **E13-network.txt khai persona đối chứng là `admin` trong khi khung hình cho thấy vai Owner**
    Người dùng thấy gì: Bằng chứng ghi nhãn vai 'quản trị' cho một người thật ra giữ vai 'chủ', nên nếu sau này có lỗi chỉ ảnh hưởng riêng vai quản trị, bộ bằng chứng hiện tại sẽ không phát hiện được.
    file: `_acceptance/cho-phep-ai-vao-o-man-hinh/evidence/E13-network.txt`
    severity: low
    Đề xuất: known-limits

- **Hình dạng 4 — đối chứng dương của E13 không cùng trạng thái dữ liệu với khung âm: bước gieo dòng xếp SAU cả hai lần chụp**
    Người dùng thấy gì: Nếu chạy lại đúng thứ tự bước kiểm hiện ghi, khung hình đối chứng có thể chụp lúc bảng còn rỗng và sinh báo lỗi giả cho khả năng thao tác trên màn Thành viên.
    file: `_acceptance/cho-phep-ai-vao-o-man-hinh/evals.yaml`
    severity: medium
    Đề xuất: known-limits

- **Cột staffEmailDomains không có đường ghi và không có backfill — hai đường đọc "người nhà" mất sạch domain (r3)**
    Người dùng thấy gì: Nếu chưa có nơi nào để nhập danh sách domain công ty, tính năng lọc 'đây là đồng nghiệp mình' sẽ luôn coi ai cũng là người ngoài — nhân viên mới có thể bị ghi nhầm thành khách hàng tiềm năng trong CRM.
    file: `apps/api/src/workspace/staff-domains.ts`
    severity: high
    Đề xuất: new-contract

- **`staff-domains.ts` tự đúc hằng `APP_SETTING_ID` và đọc `findFirst` không khoá theo id, lệch pattern của cả kho (r3)**
    Người dùng thấy gì: Nếu bảng cài đặt từng có hơn một dòng, màn hình có thể âm thầm đọc nhầm danh sách domain nội bộ, khiến việc nhận diện email nhân viên hoặc lọc số liệu truy cập sai mà không ai biết.
    file: `apps/api/src/workspace/staff-domains.ts`
    severity: medium
    Đề xuất: known-limits

- **Cột staffEmailDomains không có đường ghi và migration không backfill — lọc "địa chỉ nhà" ở tracking tắt hẳn, âm thầm (r3)**
    Người dùng thấy gì: Nếu chưa có nơi nào để nhập danh sách domain công ty, các mẫu đăng ký do chính nhân viên điền bằng email công ty có thể bị tính nhầm thành khách hàng tiềm năng thật, làm sai lệch số liệu tiếp thị mà không ai nhận ra.
    file: `apps/api/src/workspace/staff-domains.ts`
    severity: high
    Đề xuất: new-contract

- **Câu từ chối ở cổng vào vẫn chỉ người dùng đi sửa .env, trong khi mô hình mới quyết bằng bảng cho phép (r3)**
    Người dùng thấy gì: Với một hệ thống đã có người dùng, khi có người mới bị từ chối vào, thông báo họ nhận được hướng dẫn sửa một file cấu hình không còn tác dụng nữa, khiến quản trị viên loay hoay sai hướng thay vì vào màn Members để cấp quyền.
    file: `packages/auth/src/auth.ts`
    severity: low
    Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 7/15 lỗi rơi vào file không bộ đo nào phủ (_acceptance/cho-phep-ai-vao-o-man-hinh/evidence/E12-network.txt, _acceptance/cho-phep-ai-vao-o-man-hinh/evidence/E13-network.txt, _acceptance/cho-phep-ai-vao-o-man-hinh/evidence/E12-man-het-quyen.png, _acceptance/cho-phep-ai-vao-o-man-hinh/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.