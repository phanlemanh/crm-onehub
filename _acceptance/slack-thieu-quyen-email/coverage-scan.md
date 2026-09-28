# Quét độ phủ — slack-thieu-quyen-email

Preset: `test-matrix`. Bài toán là «liệt kê đủ các người có thể đứng ở đích Slack khi danh
bạ không cho thấy email, và bước kiểm nhận ra từng người ra sao», nên quét được.

## Ngữ cảnh

- Sản phẩm: CRM của OneHub — chân sản phẩm: đào repo (`docs/agent.md` mục «Chỗ rẽ: người
  nhận Slack và lượt tự động của Tác nhân» [SUY-TỪ-REPO: docs/agent.md];
  `_acceptance/ro-slack-tac-nhan/contract.md` và Ngoài-4 trong
  `_acceptance/ro-slack-tac-nhan/decisions.jsonl`; `packages/auth/src/slack-scopes.ts` —
  quyền `users:read.email` là quyền kho xin để khớp người bằng email) · chân ngành:
  [NGÀNH: Slack Web API] `users.list` trả `profile.email` chỉ khi token có
  `users:read.email`; thiếu quyền thì khoá đó vắng hẳn chứ không trả lỗi.

## Trục

- **Trục A — đích:** kênh · tin trực tiếp  [thước CE: `destination.kind ∈ {channel, user}`
  [SUY-TỪ-REPO: packages/validation/src/agent-manifest.ts]]
- **Trục B — người ở đích, theo cách nhận ra:** «chỉ OKR» qua dòng khớp · «chỉ OKR» qua
  email · vai đầy đủ qua dòng khớp · có email (vai đầy đủ hoặc ngoài CRM) · không email,
  không dòng khớp · bot · tài khoản đã xoá · ngoài danh bạ  [thước CE: nhánh của
  `demNguoiChan` [SUY-TỪ-REPO: apps/agent/agent/lib/slack-nguoi-nhan.ts] cộng một nhánh
  mới «không xác định»]
- **Trục C — hình trả lời thiếu email:** khoá `email` vắng · `email: null` · không có
  `profile`  [thước CE: khuôn `nguoiSlack` — `profile` và `email` đều `nullish`
  [SUY-TỪ-REPO: apps/agent/agent/lib/slack-nguoi-nhan.ts]]
- **Trục D — tổ hợp trong một đích:** chỉ người xác định · có người không xác định · có
  cả người bị chặn lẫn người không xác định

## Không gian

A×B = 16 ô; «ngoài danh bạ» và «bot/đã xoá» không đổi theo đích → gộp còn 12 ô có nghĩa.
C áp lên ô «không email, không dòng khớp». D áp lên ô kênh.

## Core

1. Kênh, «chỉ OKR» không dòng khớp, danh bạ thiếu email → từ chối «không kiểm được» (AC-1).
2. Tin trực tiếp tới người đó → từ chối, không mở hội thoại (AC-2).
3. Thiếu email nhưng mọi người có dòng khớp → đăng; «chỉ OKR» có dòng khớp → chặn (AC-3).
4. Người bị chặn cùng người không xác định → lời «có người không đọc được» thắng (AC-4).
5. Ba hình trả lời thiếu email → cùng một kết quả (AC-5).
6. Bot, đã xoá, ngoài danh bạ, có email ngoài CRM → vẫn không tính (AC-6).
7. Lời từ chối nêu số người, chỉ cách gỡ, không lộ danh tính (AC-7).

## Later

- Đọc quyền của kết nối để từ chối sớm cả lượt với lời nhắc riêng — luật từng người đã bao.
- Cảnh báo thiếu quyền trên màn kết nối.

## Never

- Chặn người ngoài danh bạ (Slack Connect) — không thể là thành viên CRM; chặn thì mọi kênh
  chia với đối tác đều hỏng.
- Đoán người bằng tên hiển thị khi thiếu email — `docs/connections.md` cấm khớp theo tên gần
  giống.

## Cross-cutting áp mọi ô Core

- Không có lời gọi `chat.postMessage` (và `conversations.open` với tin trực tiếp) khi từ chối.
- Hàng hành động `FAILED` với `ACTION_REJECTED`.
- Hằng thông điệp dùng lại của #170, không thêm hằng mới cho màn.
