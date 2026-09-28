---
schema_version: 1
feature: Kết nối Slack thiếu quyền đọc email vẫn không để lọt dữ liệu đối tác tới người mang vai «chỉ OKR»
slug: slack-thieu-quyen-email
owner: manh@mstar.vn
risk_tier: T3
surfaces: [api]
status: draft
design_doc: docs/superpowers/specs/2026-09-28-slack-thieu-quyen-email-design.md
---

# Acceptance Contract: slack-thieu-quyen-email

## Context

Vá lối rò Slack (`ro-slack-tac-nhan`, PR #170) cho Tác nhân kiểm ai đang ở đích Slack
ngay trước khi đăng, và khớp người Slack với thành viên CRM bằng dòng khớp Slack hoặc bằng
email trong danh bạ Slack. Slack chỉ trả email khi kết nối có quyền đọc email. Kết nối
thiếu quyền đó thì người vai «chỉ OKR» chưa có dòng khớp trông như người ngoài CRM, và tin
có dữ liệu đối tác đi vào kênh có họ mà không lỗi nào hiện ra. Chủ kho ký Cổng Bằng chứng
của #170 ngày 27/09 với mục Ngoài-4 «mở hợp đồng mới». Phải lên `onehub` trước 2026-10-26.

Nguyên tắc giữ từ #170: chặn mặc định khi không xác định được; chỉ sửa tệp của hãng khi
không tránh được, và ghi chỗ rẽ có tên.

Source input: `_acceptance/ro-slack-tac-nhan/decisions.jsonl` dòng `d-20260927T053619Z-13`
(Ngoài-4); `docs/plan/lo-trinh-okr.md` mục 10 dòng S2; prompt phiên 2026-09-28.

## Criteria

- AC-1: Given một Tác nhân đã Deploy có đích Slack là một kênh, và danh bạ Slack trả mọi người mà `profile` không có khoá `email` (hình trả lời của kết nối thiếu quyền đọc email), và trong kênh có một người Slack là thành viên CRM vai `okr` chưa có dòng khớp Slack, cùng một người vai `member` có dòng khớp, When lượt gọi đăng tin Slack, Then không có lời gọi `chat.postMessage` nào, lời gọi đăng ném lỗi, và hàng hành động của lượt là `FAILED` với mã `ACTION_REJECTED` và thông điệp mở đầu bằng lời «không kiểm được người nhận» (`KHONG_KIEM_DUOC_NGUOI_NHAN`) của #170, không chứa lời «có người không đọc được dữ liệu đối tác» (`TU_CHOI_NGUOI_NHAN`). Cũng vậy khi danh bạ trả hai trang và người vai `okr` chỉ có ở trang thứ hai — đọc cụt danh bạ không được biến người đó thành «ngoài danh bạ».
- AC-2: Given cùng danh bạ thiếu email như AC-1, và đích Slack của Tác nhân là tin trực tiếp tới người Slack của thành viên vai `okr` chưa có dòng khớp, When lượt đăng, Then không có lời gọi `conversations.open` hay `chat.postMessage` nào, và hàng hành động `FAILED` với mã `ACTION_REJECTED`, thông điệp «không kiểm được người nhận».
- AC-3: Given danh bạ thiếu email như AC-1, When mọi người trong kênh (không kể bot, tài khoản đã xoá) đều có dòng khớp Slack trỏ tới thành viên vai `member`, `admin` hoặc `owner`, Then lượt đăng đúng một lần và hàng hành động `SUCCEEDED`; và When thêm vào kênh người vai `okr` CÓ dòng khớp, Then bị từ chối bằng lời «có người không đọc được dữ liệu đối tác», không phải «không kiểm được». Dòng khớp là nguồn nhận diện khi không có email.
- AC-4: Given một kênh có cả một người vai `okr` nhận ra được (khớp email) lẫn một người không có email và không có dòng khớp, When lượt đăng, Then thông điệp từ chối là lời «có người không đọc được dữ liệu đối tác» và không chứa lời «không kiểm được người nhận» — người bị chặn thắng người không xác định.
- AC-5: Given danh bạ thiếu email, When người không xác định trong kênh (vai `member`, không dòng khớp) có trả lời Slack theo từng hình trong ma trận viết trước ba hàng — `profile` không có khoá `email`, `profile.email` là `null`, không có `profile` —, Then mỗi hàng bị từ chối «không kiểm được người nhận» với không lời gọi `chat.postMessage` nào, và số hàng đã khẳng định bằng 3.
- AC-6: Given kênh có kết nối thiếu email nhưng mọi người không có dòng khớp đều là bot, tài khoản đã xoá (cả khi không có email, cả khi mang email của người vai `okr`), hoặc người không có trong danh bạ (người của tổ chức khác qua Slack Connect), cùng một người Slack có email không thuộc CRM, When lượt đăng, Then đăng đúng một lần — luật mới không chặn nhầm những người #170 đã không tính.
- AC-7: Given một lời từ chối «không kiểm được người nhận» do có người không xác định, When đọc thông điệp đã lưu ở hàng hành động, Then nó nêu đúng số người không xác định ngay sau lời mở đầu, không phải tổng số người ở đích (kênh bốn người có hai người không xác định thì ghi `2 people`; một người thì `1 person`), có câu chỉ kết nối lại Slack để đọc được email, và không chứa email, mã CRM, tên hay mã Slack của bất kỳ người nào đã gieo — so không phân biệt hoa thường; bộ dò này được chứng bằng đối chứng dương: đưa nó một thông điệp có email viết hoa hoặc mã Slack thì nó bắt được.
- AC-8: Given tệp kiểm của #170 (`apps/agent/test/ro-slack-tac-nhan.integration.spec.ts`), When chạy trọn tệp trên cây đang xét, Then exit 0 — luật mới không làm đỏ ca nào của #170.
- AC-9: Given tệp kiểm của lượt này, When chạy nó trên bản gương của mã trước vá ở mốc cố định `a62adb16` (thư mục tạm, không đụng cây đang xét) và trên cây đang xét, Then trước vá đỏ với ca của AC-1 và AC-2 đích danh bị đỏ vì tin đã đi ra, còn cây đang xét xanh toàn bộ.
- AC-10: Given các commit của vòng này (commit không phải gộp, thông điệp có tên hồ sơ `slack-thieu-quyen-email`, tính từ mốc `a62adb16`), When liệt kê các tệp mã của hãng chúng chạm (tệp có ở `origin/release`, ngoài `_acceptance/`, `docs/`, `.md`), Then tập đó rỗng.
- AC-11: (judgment) Given toàn bộ thay đổi của lượt, When người xét đọc diff, mục chỗ rẽ trong `docs/agent.md` và mô tả PR, Then mục chỗ rẽ nói đúng luật mới (người không có email và không dòng khớp thì không xác định, và lượt bị từ chối), không có chữ nào mở đường báo lỗ hổng cho hãng qua PR hay issue công khai, và mô tả PR không mô tả lỗ hổng theo cách dùng lại được nếu PR vô tình công khai.

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — đích:** kênh · tin trực tiếp  [thước CE: `destination.kind ∈ {channel, user}` trong khuôn manifest (`packages/validation/src/agent-manifest.ts`)]
- **Trục B — người ở đích, theo cách nhận ra:** vai «chỉ OKR» qua dòng khớp · vai «chỉ OKR» qua email · vai đầy đủ qua dòng khớp · có email (vai đầy đủ hoặc ngoài CRM) · không email, không dòng khớp · bot · tài khoản đã xoá · ngoài danh bạ  [thước CE: bảng luật trong design doc; nhánh của `demNguoiChan` hiện có ở `apps/agent/agent/lib/slack-nguoi-nhan.ts`]
- **Trục C — hình trả lời thiếu email:** khoá `email` vắng · `email: null` · không có `profile`  [thước CE: khuôn `nguoiSlack` trong `slack-nguoi-nhan.ts` — `profile` và `email` đều `nullish`; Slack Web API `users.list` bỏ khoá `email` khi thiếu `users:read.email`]
- **Trục D — tổ hợp trong một đích:** chỉ người xác định · có người không xác định · có cả người bị chặn lẫn người không xác định
- Chân ngành: [NGÀNH: Slack Web API] `users.list` chỉ trả `profile.email` khi token có `users:read.email`.
- [GIẢ ĐỊNH] Người không có trong danh bạ `users.list` là người của tổ chức khác qua Slack Connect, nên không thể là thành viên CRM — vẫn không tính như #170.
- [GIẢ ĐỊNH] Kết nối có đủ quyền thì mọi thành viên thật của workspace đều có email trong danh bạ; luật mới không làm kênh thường bị chặn khi quyền đủ.

## Out of scope

- Đọc quyền của kết nối (cột `scope`, đầu trả lời `x-oauth-scopes`) để từ chối cả lượt — luật xét từng người đã bao ca thiếu quyền.
- Chặn người không có trong danh bạ (Slack Connect) hay người có email không thuộc CRM — giữ nguyên phạm vi #170.
- Cảnh báo thiếu quyền trên màn `/settings/connections`.
- Thử lại khi Slack báo `ratelimited`, tín hiệu huỷ lượt, gộp hai bộ đọc `users.list` (Ngoài-2, Ngoài-3 của #170).
- Gửi báo cáo lỗ hổng cho hãng — việc của chủ kho, qua kênh bảo mật riêng, khi chủ kho cho phép.

## Notes

- Hạng T3 theo lộ trình (cửa quyền); theo đường dẫn thì không tệp nào nằm trong `t3_paths`.
- Không tệp nào của hãng bị sửa; phần lõi ở tệp của bản rẽ `apps/agent/agent/lib/slack-nguoi-nhan.ts`, chỗ rẽ đã có tên ở `docs/agent.md` từ #170.
- Không có hồ sơ cơ hội: ship thẳng, không phiên nghiệm thu.
