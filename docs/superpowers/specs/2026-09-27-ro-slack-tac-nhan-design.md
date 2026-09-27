# Vá lối rò Slack của Tác nhân — thiết kế

Hồ sơ: `_acceptance/ro-slack-tac-nhan/`. Hạng T3 theo lộ trình (cửa quyền), có Cổng 1.5.
Nguồn: `docs/plan/lo-trinh-tro-ly-okr.md` mục 5 khối «Vá lối rò Slack · T3»;
`docs/reports/2026-09-26-tro-ly-okr/12-kien-truc-va-lo-trinh.md` §3.3 khoảng trống 8 và
§6.3 khối «Vá lối rò Slack của Tác nhân».

## Vấn đề

Từ 2026-10-26 cả công ty vào CRM; người ngoài khối kinh doanh vào bằng vai «chỉ OKR»,
không đọc được dữ liệu đối tác ở màn, API, khoá API hay trợ lý AI (`vai-chi-okr`). Tác
nhân vẫn còn hai lối để dữ liệu đối tác tới tay họ, cả hai nằm trong khung Tác nhân của
hãng:

1. **Đăng Slack chỉ kiểm đích đã duyệt, không kiểm ai đang ở đích.**
   `approvedSlackDestination` (`apps/agent/agent/lib/run-runtime.ts`) đọc đúng một đích
   từ phiên bản đã Deploy rồi `postRunSlackMessage` gửi thẳng. Một Tác nhân đối tác đăng
   vào `#chung` — nơi mọi người trong công ty đều có mặt — là đăng dữ liệu đối tác cho
   người vai «chỉ OKR». Thành viên kênh đổi sau khi Deploy, nên duyệt lúc Deploy không đủ.
2. **Lượt chạy nền mượn danh tính người dựng.** `dispatchAgentRun`
   (`apps/agent/agent/lib/custom-agent-dispatch.ts`) gửi phiên với
   `principalId = run.initiatedById ?? run.agent.createdById`, `authenticator`
   `crm-schedule` hoặc `crm-user`. `isAutomated` (`apps/agent/agent/lib/approval.ts`)
   chỉ nhận đúng `APP_AUTH`, nên phiên của Tác nhân bị coi là có người ngồi, và
   `sensitiveWrite` trả `user-approval` thay vì từ chối. Phiên ấy chạy ở chế độ task:
   theo `eve/docs/schedules.mdx` nó «cannot park to wait for a person», nên không ai
   duyệt thật — lời hứa «không làm việc nhạy cảm khi không ai trông» hở.

## Cách vá

### Lối 1 — lọc người nhận lúc gửi

Một mô-đun mới của bản rẽ, `apps/agent/agent/lib/slack-nguoi-nhan.ts`, xuất một hàm
`kiemNguoiNhanSlack(accessToken, destination, fetcher?)`:

1. **Ai ở đích.** Đích `user` → đúng một người là `destination.id`. Đích `channel` →
   `conversations.members` phân trang tới hết `next_cursor`.
2. **Họ là ai trong Slack.** `users.list` phân trang (một lượt đọc cho cả workspace,
   thay vì một `users.info` mỗi người — kênh `#chung` hàng trăm người sẽ chạm trần tốc
   độ). Bộ đọc viết cùng khuôn với `listSlackMembers` của `lib/slack-people.ts` (đã chạy
   thật ở đồng bộ người Slack: `users.list`, con trỏ ở `response_metadata.next_cursor`,
   email ở `profile.email`) nhưng nằm trong tệp của bản rẽ — `slack-people.ts` là tệp
   của hãng, xuất hàm từ đó là chạm tệp thứ ba. Bỏ bot và tài khoản đã xoá.
3. **Họ là ai trong CRM.** Đọc sống bảng `member` của workspace cùng email người dùng và
   dòng `slackMemberMatch`. Một người Slack là «chỉ OKR» khi `slackUserId` của họ nằm
   trong bảng khớp của một thành viên vai `okr`, **hoặc** email Slack (chữ thường, bỏ
   khoảng trắng) bằng email của một thành viên vai `okr`. Vai đọc lúc gửi, không từ bảng
   đệm đồng bộ — người vừa bị đổi vai bị chặn ngay lượt kế.
4. **Quyết.** Luật đọc là `docDuocPhamVi(vai, "doi-tac")` của
   `packages/validation/src/vai-workspace.ts` — cùng vị từ mà API và cầu nối dùng, không
   có luật thứ hai. Có ít nhất một người không đọc được dữ liệu đối tác → từ chối. Không
   đọc được thành viên hay danh bạ Slack (lỗi Slack, thiếu quyền, mạng, trả lời hỏng) →
   từ chối. Đóng khi lỗi.

`postRunSlackMessage` gọi hàm đó **sau khi giành quyền hành động, trước khi gửi**, trong
khối `try` sẵn có — nên lời từ chối đi đúng đường `failRunAction`: hàng `AgentAction`
thành `FAILED` với mã `ACTION_REJECTED` (màn lịch sử đã có câu tiếng người cho mã này:
«The agent tried the action and OneHub Center refused it. Nothing was written.») và
`errorMessage` nói lý do. `slackActionErrorCode` nhận thêm một nhánh: thông điệp từ chối
người nhận → `ACTION_REJECTED`. Lời từ chối không nêu tên người — nêu số người và luật.

Phát lại lượt đã `SUCCEEDED` giữ nguyên: trả `replayed: true` trước bước kiểm, vì tin
đã gửi rồi thì kiểm lại không rút được nó.

### Lối 2 — lượt của Tác nhân là tự động

`isAutomated` trả `true` khi phiên là `APP_AUTH` (như hôm nay) **hoặc** thuộc tính
`purpose` của phiên (đọc ở `current` rồi `initiator`, bằng `attribute` sẵn có ở
`lib/session-purpose.ts`) là `team-agent`. Mọi lượt Tác nhân — theo lịch, theo sự kiện,
hay người bấm chạy — đều dựng phiên với `purpose: "team-agent"` và chạy chế độ task,
nên đều không có người duyệt từng bước. Khoá theo `purpose` chứ không theo
`authenticator`: không phải sửa tệp thứ ba của hãng để xuất hằng, và một cách khởi lượt
mới của Tác nhân sau này tự rơi vào luật.

Phiên có người ngồi (cầu nối `crm-app`, builder `crm-builder`, `zalo`) không mang
`purpose: "team-agent"` → giữ `user-approval` như hôm nay.

### Chỗ rẽ có tên

`git diff origin/release origin/onehub` không chạm `approval.ts` hay `run-runtime.ts` —
lượt này chạm lần đầu. Phần lõi nằm ở tệp mới của bản rẽ; hai tệp của hãng chỉ nhận:
một lời gọi + một nhánh mã lỗi (`run-runtime.ts`), một vế điều kiện (`approval.ts`).
`docs/agent.md` thêm mục «Chỗ rẽ: người nhận Slack và lượt tự động của Tác nhân» ghi
hai tệp, dòng nào, vì sao, và điều kiện gỡ: hãng có bản sửa tương đương → xoá chỗ rẽ,
giữ bài kiểm.

Báo cho hãng: **không** PR công khai, **không** issue công khai trên kho MIT. Chỉ qua
kênh bảo mật riêng của hãng, và máy không gửi gì cho tới khi chủ kho cho phép. Lượt này
không gửi gì ra ngoài kho.

## Phép đo đỏ trước, xanh sau

- `apps/agent/test/ro-slack-tac-nhan.integration.spec.ts` — gieo thật trong cơ sở dữ
  liệu của lượt kiểm: người vai `okr` và `member`, dòng `slackMemberMatch`, một Tác
  nhân đã Deploy có đích Slack, một lượt `RUNNING`, một tài khoản Slack. Giả lập
  **chỉ** `fetch` ra `slack.com`, đếm từng lời gọi theo phương thức. Gọi
  `postRunSlackMessage` thật. Tệp kiểm không nhập tĩnh mô-đun mới: nạp bằng `import()`
  động có dự phòng, để chạy được trên mã trước vá và đỏ vì tin đã đi ra, không vì
  thiếu mô-đun. Trả lời giả theo đúng hình Slack Web API.
- `apps/agent/test/luot-tu-dong.integration.spec.ts` — bắt `auth` mà `dispatchAgentRun` **thật** đưa
  vào `send` (khứ hồi từ bên ghi, không tự viết khuôn), rồi cho đúng giá trị đó vào
  chính sách duyệt của `sensitiveWrite`. Cần cơ sở dữ liệu vì `dispatchAgentRun` đọc
  lượt thật.
- `_acceptance/ro-slack-tac-nhan/rang/do-truoc-khi-va.mjs` — dựng bản gương ở thư mục
  tạm tại `origin/onehub` (trước vá), chép hai tệp kiểm mới vào, nối `node_modules`,
  Prisma client và `.env` của cây thật, chạy hai tệp kiểm trong bản gương, và đòi **đỏ**
  với tên ca ghim; rồi đòi cùng hai tệp **xanh** ở cây đang xét. Đây là bàn giao «đỏ
  trước, xanh sau» dưới dạng một phép đo chạy lại được, không phải ảnh chụp lịch sử.
- `_acceptance/ro-slack-tac-nhan/rang/kiem-ke.mjs` — kiểm kê mọi chỗ dựng danh tính
  phiên và mọi chỗ gửi Slack trong `apps/agent/agent`, so bằng với danh sách viết trước
  (mỗi chỗ gắn một AC hoặc lý do ngoài phạm vi). Một lối mới chưa ai xếp là đỏ.

## Không làm

- Chặn người Slack không có trong CRM (khách, Slack Connect, email lệch không dòng
  khớp). Đó là luật «kênh Slack có thuộc ranh CRM không»; bật nó hôm nay chặn nhầm kênh
  có chủ kho, vì email đăng nhập CRM của chủ kho là gmail cá nhân, khác email Slack.
  Mở lại khi có khớp tay người Slack ↔ thành viên.
- Chặn ở bước Deploy / builder. Lúc gửi là ranh thật.
- Lọc từng trường trong tin.
- Sửa `archive_field`, `record_job_change` hay thêm tool vào danh sách nhạy cảm.
- Gửi báo cáo cho hãng.

## Đặc tả UX

Bỏ — lượt này không chạm màn nào (`descope` trong sổ quyết định). Lời từ chối hiện ở
màn lịch sử Tác nhân bằng câu sẵn có của mã `ACTION_REJECTED`.

## Rủi ro đã biết

- `conversations.members` với kênh công khai mà bot chưa vào: Slack cho đọc bằng
  `channels:read`. Nếu một workspace trả lỗi ở đây, lượt đăng bị từ chối (đóng khi lỗi)
  — đổi lại một lượt Tác nhân hỏng có lý do, không phải một lượt rò. Bài kiểm không gọi
  Slack thật; phép thử sống là `apps/agent/test/e2e/slack-delivery.e2e.ts`, ngoài bộ
  chứng.
- Mọi Tác nhân đang đăng vào kênh có người «chỉ OKR» sẽ bắt đầu hỏng từ lúc có người
  mang vai đó trong kênh. Đó là hành vi muốn có.
