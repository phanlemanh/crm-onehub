# Quét độ phủ — ro-slack-tac-nhan

Preset: `risk-premortem` ghép `test-matrix`. Bài toán là «liệt kê đủ các cách dữ liệu
đối tác rời CRM khi Tác nhân chạy nền», nên quét được.

## Ngữ cảnh

- Sản phẩm: CRM của OneHub — chân sản phẩm: đào repo (`CONTEXT.md` mục «Tác nhân» và
  «Vai «chỉ OKR»», `docs/agent.md` mục «Team-agent builder and runner»,
  `docs/reports/2026-09-26-tro-ly-okr/12-kien-truc-va-lo-trinh.md` §2.3, §3.3 khoảng
  trống 8) · chân ngành: trigger của Copilot Studio chạy bằng quyền người dựng agent,
  Microsoft tự cảnh báo [NGÀNH: Microsoft Copilot Studio, authoring-triggers-about —
  dẫn ở báo cáo 12 §2.3]; ClickUp Super Agent trả lời bất kỳ ai gọi được agent bằng dữ
  liệu đã chia cho agent [NGÀNH: ClickUp, Super-Agent-privacy-security-and-permissions
  — cùng nguồn]. Hai tiền lệ đó là đúng lớp lỗi của lượt này: lượt nền mượn danh tính
  người, và nơi nhận không được lọc theo quyền từng người nhận.

## Trục

- **Trục A — lối ra:** kênh Slack công khai · kênh Slack riêng · tin nhắn trực tiếp
  Slack · thao tác ghi nhạy cảm trong CRM (`sensitiveWrite`: lưu trữ trường, ghi đổi
  việc)  [thước CE: `SLACK_MESSAGE_POST` có `destination.kind ∈ {channel, user}`
  (`packages/validation/src/agent-manifest.ts`) [SUY-TỪ-REPO:
  apps/agent/agent/lib/run-runtime.ts]; mọi nơi gọi `sensitiveWrite` (hai tool:
  `archive_field`, `record_job_change`) [SUY-TỪ-REPO: apps/agent/agent/tools/]]
- **Trục B — người ở nơi nhận:** thành viên vai đầy đủ (member/admin/owner) · vai «chỉ
  OKR» khớp bằng email Slack · vai «chỉ OKR» khớp bằng bảng khớp Slack khi email lệch ·
  vai đổi sang «chỉ OKR» sau lần đồng bộ Slack cuối · người Slack không có trong CRM ·
  bot / ứng dụng  [thước CE: `WORKSPACE_ROLES` + `docDuocPhamVi`
  [SUY-TỪ-REPO: packages/validation/src/vai-workspace.ts]; bảng `slackMemberMatch`
  [SUY-TỪ-REPO: apps/agent/agent/lib/slack-people.ts]]
- **Trục C — ai khởi lượt:** lịch (`crm-schedule`) · người bấm chạy (`crm-user`) ·
  phiên có người ngồi (cầu nối `crm-app`, builder `crm-builder`, `zalo`) · việc nền của
  hàng việc (`APP_AUTH`)  [thước CE: mọi chỗ dựng `authenticator` trong `apps/agent`
  (grep) [SUY-TỪ-REPO: apps/agent/agent/lib/custom-agent-dispatch.ts,
  apps/agent/agent/lib/app-auth.ts, apps/agent/agent/lib/zalo-config.ts]]
- **Trục D — tình trạng nguồn Slack:** đọc được một trang · nhiều trang · lỗi / thiếu
  quyền / mạng · phát lại lượt đã đăng  [thước CE: phân trang `next_cursor` và lỗi
  `ok:false` của Slack Web API [SUY-TỪ-REPO: apps/agent/agent/lib/slack-people.ts];
  khoá phát lại `idempotencyKey` [SUY-TỪ-REPO: apps/agent/agent/lib/run-runtime.ts]]

## Không gian

A×B (Slack): 3 lối × 6 người = 18 ô; gộp kênh công khai và kênh riêng vì Slack trả
thành viên bằng cùng một lời gọi (`conversations.members`) → 12 ô có nghĩa.
A×C (ghi nhạy cảm): 4 ô. D áp lên mọi ô Slack.

## Core

1. Kênh có người vai «chỉ OKR» khớp bằng email → từ chối, không gửi — lõi của ý định.
2. Kênh có người vai «chỉ OKR» chỉ khớp qua bảng khớp (email lệch) → từ chối — bẫy
   gmail cá nhân của kho này.
3. Tin trực tiếp tới người vai «chỉ OKR» → từ chối, không mở hội thoại.
4. Vai đổi sau lần đồng bộ → vai đọc sống lúc gửi, không từ bảng đệm.
5. Kênh chỉ có vai đầy đủ + bot → đăng đúng một lần (đối chứng dương).
6. Không đọc được thành viên kênh → từ chối (đóng khi lỗi).
7. Người «chỉ OKR» ở trang thứ hai của danh sách thành viên → vẫn từ chối.
8. Lượt theo lịch và lượt người bấm chạy → là tự động, ghi nhạy cảm bị từ chối có lý do.
9. Phiên có người ngồi và việc nền `APP_AUTH` → giữ nguyên hành vi hôm nay.

## Later

- Người Slack không có trong CRM (khách, Slack Connect, email lệch không có dòng khớp)
  → hôm nay cho qua. Chặn họ là đổi luật «kênh Slack có thuộc ranh CRM không»; cần khớp
  tay trước, vì email đăng nhập CRM của chủ kho là gmail cá nhân nên luật chặt sẽ chặn
  nhầm kênh của chính chủ kho. Entry `descope` trong sổ quyết định.
- Chặn ngay ở bước Deploy (builder không cho chọn người «chỉ OKR» làm đích) — lớp phụ;
  lúc gửi mới là ranh thật, vì thành viên kênh đổi sau khi Deploy.

## Never

- Lọc nội dung tin (che trường đối tác) thay vì chặn cả tin — Tác nhân đối tác thì mọi
  tin đều là dữ liệu đối tác; che từng trường là đoán.
- Tự rút người «chỉ OKR» khỏi kênh Slack — CRM không có quyền đổi thành viên Slack của
  người khác, và đó là việc của người.

## Cross-cutting áp mọi ô Core

- Lời từ chối ghi vào sổ hành động của lượt (`AgentAction` FAILED, mã
  `ACTION_REJECTED`) để người dựng thấy vì sao ở màn lịch sử.
- Không gọi `chat.postMessage` / `conversations.open` nào khi từ chối.
- Hai tệp của hãng bị chạm lần đầu → chỗ rẽ có tên, ghi ở `docs/agent.md`.
