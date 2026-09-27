---
schema_version: 1
feature: Vá lối rò Slack — Tác nhân chạy nền không đăng được dữ liệu đối tác vào kênh Slack có người mang vai «chỉ OKR», và lượt chạy nền của Tác nhân được coi là tự động nên mọi thao tác ghi nhạy cảm bị từ chối
slug: ro-slack-tac-nhan
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: implemented
approved_by: Manh Phan
approved_at: 2026-09-27T02:59:29Z
design_doc: docs/superpowers/specs/2026-09-27-ro-slack-tac-nhan-design.md
---

# Acceptance Contract: ro-slack-tac-nhan

## Context

Từ 2026-10-26 cả công ty vào CRM; người ngoài khối kinh doanh vào bằng vai «chỉ OKR»
và không đọc được dữ liệu đối tác ở màn, API, khoá API hay trợ lý AI (hồ sơ
`vai-chi-okr`). Khung Tác nhân của hãng còn hai lối để dữ liệu đối tác tới tay họ: đăng
Slack chỉ kiểm đích đã duyệt chứ không kiểm ai đang ở đích, và lượt chạy nền mượn danh
tính người dựng nên không bị coi là tự động — thao tác ghi nhạy cảm xin người duyệt
trong một phiên không ai ngồi. Lượt này đóng cả hai trong bản rẽ, ghi thành chỗ rẽ có
tên, và không báo cho hãng qua kênh công khai.

Source input: `docs/plan/lo-trinh-tro-ly-okr.md` mục 5 khối «Vá lối rò Slack · T3»;
`docs/reports/2026-09-26-tro-ly-okr/12-kien-truc-va-lo-trinh.md` §3.3 khoảng trống 8,
§6.3 khối «Vá lối rò Slack của Tác nhân»; prompt phiên 2026-09-27.

## Criteria

- AC-1: Given một Tác nhân đã Deploy có đích Slack là một kênh, một lượt đang chạy, và trong kênh có một người Slack mà email (không phân biệt hoa thường, bỏ khoảng trắng) trùng email của một thành viên CRM vai `okr`, When lượt gọi đăng tin Slack, Then không có lời gọi `chat.postMessage` nào ra Slack, lời gọi đăng ném lỗi, và hàng hành động của lượt là `FAILED` với mã `ACTION_REJECTED` và thông điệp từ chối ghim nói kênh có người không đọc được dữ liệu đối tác, kèm số người đó — không nêu tên hay email người nào. Thông điệp này khác hẳn thông điệp «không kiểm được người nhận» của AC-6: hai câu đều khác rỗng và không câu nào chứa câu kia.
- AC-2: Given cùng cảnh AC-1 nhưng email Slack của người đó KHÁC email CRM, và bảng khớp Slack của thành viên vai `okr` trỏ tới đúng người Slack đó, When lượt đăng, Then bị từ chối như AC-1.
- AC-3: Given đích Slack của Tác nhân là tin trực tiếp tới một người Slack khớp với thành viên vai `okr`, When lượt đăng, Then không có lời gọi `conversations.open` hay `chat.postMessage` nào, và hàng hành động `FAILED` với mã `ACTION_REJECTED`.
- AC-4: Given một người đang vai `member` đã có dòng khớp Slack và đang ở kênh đích, When quản trị đổi vai người đó thành `okr` trong bảng thành viên mà KHÔNG chạy lại đồng bộ Slack, rồi lượt kế đăng, Then bị từ chối; và chiều ngược — đổi `okr` về `member` — thì lượt kế đăng được. Vai đọc sống lúc gửi.
- AC-5: Given kênh đích chỉ có thành viên vai `member`, `admin`, `owner`, một bot, một tài khoản Slack đã xoá mang email của người vai `okr`, và một người Slack không có trong CRM, When lượt đăng, Then có đúng một lời gọi `chat.postMessage`, hàng hành động `SUCCEEDED`; When cùng lượt gọi lại với cùng mã lời gọi, Then trả `replayed: true` và không có lời gọi Slack mới nào. Đây là đối chứng dương: bản vá chặn nhầm kênh hợp lệ vẫn đỏ ở đây.
- AC-6: Given không đọc được ai ở đích — `conversations.members` trả `ok: false`, hoặc `users.list` trả `ok: false`, hoặc lời gọi ra Slack ném lỗi mạng, hoặc trả lời không đọc được —, When lượt đăng, Then mỗi ca bị từ chối với mã `ACTION_REJECTED` và thông điệp ghim nói không kiểm được người nhận, không có `chat.postMessage` nào. Đóng khi lỗi.
- AC-7: Given danh sách thành viên kênh và danh bạ Slack đều trả nhiều trang, và người khớp vai `okr` chỉ xuất hiện ở trang thứ hai của CẢ HAI, When lượt đăng, Then bị từ chối vì người nhận (không phải vì không kiểm được), và số lời gọi `conversations.members` và `users.list` mỗi loại ≥ 2 — bằng chứng đã đọc hết trang; trả lời giả theo đúng hình của Slack Web API (con trỏ ở `response_metadata.next_cursor`, email ở `profile.email`). Khi trang hai chỉ có vai đầy đủ thì đăng được đúng một lần.
- AC-8: Given một lượt Tác nhân theo lịch (không ai khởi) được xếp hàng, When `dispatchAgentRun` thật giao lượt và phiên nhận đúng danh tính mà nó đưa vào, Then chính sách duyệt của thao tác ghi nhạy cảm, chạy trên đúng danh tính đó, trả `denied` với lý do «Not something to do unattended» — không phải `user-approval`.
- AC-9: Given một lượt Tác nhân do một người bấm chạy (`initiatedById` có giá trị), When `dispatchAgentRun` thật giao lượt, Then chính sách duyệt trên danh tính đó cũng trả `denied`.
- AC-10: Given các phiên có người ngồi và việc nền của hàng việc, When chính sách duyệt đọc danh tính do chính bên dựng thật của mỗi đường tạo ra — cầu nối của app (`repFromCrm`), builder (`dispatchBuilderSubmission`), Zalo, và việc nền (`taskAuth`) —, Then ba phiên có người ngồi vẫn trả `user-approval`, và việc nền vẫn là tự động (`denied`). Ma trận viết trước bốn hàng.
- AC-11: Given hai tệp kiểm của lượt này, When chạy chúng trên mã của `origin/onehub` trước vá (bản gương ở thư mục tạm, không đụng cây đang xét) và trên cây đang xét, Then trước vá đỏ với các ca AC-1, AC-3 và AC-8 đích danh bị đỏ, còn cây đang xét xanh toàn bộ. Đỏ trước, xanh sau là một phép đo chạy lại được.
- AC-12: Given diff của lượt so với `origin/onehub`, When liệt kê các tệp mã của hãng bị sửa (tệp có sẵn ở `origin/release`, ngoài `_acceptance/`, `docs/` và tệp `.md`), Then tập đó bằng ĐÚNG tập hai tệp mà mục chỗ rẽ trong `docs/agent.md` nêu tên — `apps/agent/agent/lib/approval.ts` và `apps/agent/agent/lib/run-runtime.ts` —, và mục đó nêu điều kiện gỡ.
- AC-14: Given mã của `apps/agent/agent`, When kiểm kê mọi chỗ dựng danh tính phiên (`authenticator` có giá trị, lời gọi `thanhVienPrincipal`) và mọi chỗ gửi tin Slack (lời gọi `sendSlackMessage`, chuỗi `chat.postMessage`), Then tập chỗ tìm được bằng ĐÚNG danh sách viết trước trong phép đo, mỗi chỗ gắn một AC của hợp đồng này hoặc một lý do nằm ngoài phạm vi — một đường khởi lượt hay một lối gửi Slack mới xuất hiện mà chưa ai xếp là phép đo đỏ.
- AC-13: (judgment) Given toàn bộ thay đổi của lượt, When người xét đọc diff, mục chỗ rẽ và mô tả PR, Then không có chữ nào mở đường báo lỗ hổng cho hãng qua PR hay issue công khai, và mô tả PR không mô tả lỗ hổng theo cách dùng lại được nếu PR vô tình công khai.

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — lối ra:** kênh Slack (công khai và riêng — cùng một lời gọi đọc thành viên) · tin trực tiếp Slack · thao tác ghi nhạy cảm trong CRM  [thước CE: `destination.kind ∈ {channel, user}` trong khuôn manifest; mọi chỗ gọi `sensitiveWrite` (hai tool); mọi chỗ gửi Slack — kiểm kê của AC-14 (tin nhắc buổi sáng gửi riêng cho chính người nhận, ngoài phạm vi)]
- **Trục B — người ở nơi nhận:** vai đầy đủ · «chỉ OKR» khớp email · «chỉ OKR» khớp bảng · vai đổi sau đồng bộ · người Slack ngoài CRM · bot / tài khoản đã xoá  [thước CE: `WORKSPACE_ROLES`, `docDuocPhamVi`, bảng `slackMemberMatch`]
- **Trục C — ai khởi lượt:** lịch · theo sự kiện · người bấm chạy · phiên có người ngồi (cầu nối, builder, Zalo) · việc nền  [thước CE: kiểm kê của AC-14. Lịch và sự kiện cùng đi `dispatchAgentRun` không `initiatedById` → AC-8; người bấm → AC-9]
- **Trục D — nguồn Slack:** một trang · nhiều trang · lỗi / thiếu quyền / mạng / trả lời hỏng · phát lại  [thước CE: `next_cursor`, `ok:false` của Slack Web API; `idempotencyKey`]
- Chân ngành: trigger của Copilot Studio chạy bằng quyền người dựng [NGÀNH: Microsoft Copilot Studio] và ClickUp Super Agent trả lời bằng dữ liệu đã chia cho agent [NGÀNH: ClickUp] — đúng lớp lỗi của lượt này, dẫn ở báo cáo 12 §2.3.
- [GIẢ ĐỊNH] Mọi tin Slack của một lượt Tác nhân là dữ liệu đối tác — Tác nhân hôm nay chỉ đọc bản ghi đối tác, nên không phân loại từng tin.
- [GIẢ ĐỊNH] Người Slack không khớp thành viên CRM nào được coi là ngoài luật của lượt này (cho qua) — xem entry `descope` về người ngoài CRM.
- [GIẢ ĐỊNH] Mọi phiên mang `purpose: "team-agent"` là lượt Tác nhân không người ngồi; hôm nay chỉ `dispatchAgentRun` dựng thuộc tính đó.

## Out of scope

- Chặn người Slack không có trong CRM (khách, Slack Connect, email lệch không dòng khớp) — cần khớp tay trước, vì luật chặt chặn nhầm kênh của chủ kho (email đăng nhập CRM là gmail cá nhân).
- Chặn đích «chỉ OKR» ngay ở builder hay lúc Deploy — lúc gửi là ranh thật.
- Lọc hay che từng trường trong tin Slack.
- Thêm tool vào danh sách ghi nhạy cảm, hay sửa `archive_field` / `record_job_change`.
- Gửi báo cáo lỗ hổng cho hãng — việc của chủ kho, sau lượt này, qua kênh bảo mật riêng.
- Chữ trên màn lịch sử Tác nhân — dùng câu sẵn có của mã `ACTION_REJECTED`.

## Notes

- Hạng T3 theo lộ trình (cửa quyền); theo đường dẫn thì không tệp nào nằm trong `t3_paths`.
- Chỗ rẽ: `apps/agent/agent/lib/approval.ts`, `apps/agent/agent/lib/run-runtime.ts`; gỡ khi hãng có bản sửa tương đương.
