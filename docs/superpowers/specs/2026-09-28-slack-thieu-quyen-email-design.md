# Kết nối Slack thiếu quyền đọc email vẫn không để lọt dữ liệu đối tác tới người mang vai «chỉ OKR»

Hồ sơ: `_acceptance/slack-thieu-quyen-email` · hạng T3 · 2026-09-28 · tách từ Ngoài-4
của vá lối rò Slack (`_acceptance/ro-slack-tac-nhan`, PR #170).

## Vì sao

Vá lối rò Slack (#170) cho Tác nhân hỏi «ai đang ở đích» ngay trước khi đăng. Nó khớp
người Slack với thành viên CRM bằng hai đường: dòng khớp Slack của thành viên
(`slackMemberMatch`), hoặc email trong danh bạ Slack (`profile.email` của `users.list`).
Ai không khớp được thì bị coi là «người ngoài CRM» và cho qua — đó là phạm vi đã duyệt
của #170.

Slack chỉ trả `profile.email` khi kết nối có quyền `users:read.email`. Kết nối thiếu quyền
đó thì danh bạ vẫn đọc được, nhưng không có email nào. Một người vai «chỉ OKR» chưa có dòng
khớp Slack khi ấy trông y hệt người ngoài CRM, và tin có dữ liệu đối tác đi vào kênh có
người đó mà không lỗi nào hiện ra. Bộ đồng bộ khớp người cũng khớp bằng email, nên kết nối
thiếu quyền thì dòng khớp cũng không sinh ra — lỗ không tự đóng theo thời gian.

Nguyên tắc của #170 là chặn mặc định khi không xác định được. «Không có email, không có
dòng khớp» là không xác định được, không phải «người ngoài CRM».

## Luật mới

Với mỗi người Slack ở đích (kênh: mọi trang của `conversations.members`; tin trực tiếp:
đúng người nhận), sau khi đọc hết danh bạ:

| Người ở đích | Kết quả |
| --- | --- |
| bot, hoặc tài khoản đã xoá | không tính (như #170) |
| không có trong danh bạ của workspace (người của tổ chức khác qua Slack Connect) | không tính (như #170, xem Ngoài phạm vi) |
| mã Slack nằm trong dòng khớp của một thành viên vai «chỉ OKR» | **chặn** |
| email trùng email của một thành viên vai «chỉ OKR» | **chặn** |
| mã Slack nằm trong dòng khớp của một thành viên vai đầy đủ | cho qua |
| có email (khớp thành viên vai đầy đủ, hoặc không khớp ai) | cho qua |
| không email đọc được, và không có dòng khớp nào trỏ tới | **không xác định** |

Rồi quyết cho cả lượt, theo thứ tự:

1. Có người bị chặn → từ chối bằng lời «có người không đọc được dữ liệu đối tác» của #170
   (`TU_CHOI_NGUOI_NHAN`). Lời này thắng, vì nó đúng hơn và đã có sẵn câu trên màn.
2. Không ai bị chặn nhưng có người không xác định → từ chối bằng lời «không kiểm được người
   nhận» (`KHONG_KIEM_DUOC_NGUOI_NHAN`), kèm số người không xác định và một câu chỉ cách gỡ:
   kết nối lại Slack để app đọc được email. Không nêu tên, email hay mã Slack của ai.
3. Còn lại → đăng như cũ.

Cả hai lời đều mang mã `ACTION_REJECTED` qua `laTuChoiNguoiNhan` sẵn có, nên hàng hành động
là `FAILED` và màn lịch sử Tác nhân dùng câu sẵn có của mã đó.

«Không email đọc được» gồm ba hình của trả lời Slack: `profile` không có khoá `email`
(hình thật khi thiếu quyền), `profile.email` là `null`, và người không có `profile`.

## Phương án đã cân

- **Chọn — xét từng người.** Không cần biết kết nối có quyền gì: thiếu quyền thì mọi người
  không có dòng khớp đều không xác định, và lượt bị từ chối. Cùng luật bắt luôn ca một người
  lẻ không có email vì lý do khác. Kênh mà mọi người đều đã có dòng khớp vẫn đăng được khi
  thiếu quyền — đúng, vì dòng khớp là nguồn nhận diện chính.
- Loại — đọc quyền của kết nối (cột `scope` của tài khoản Slack, hay đầu trả lời
  `x-oauth-scopes`) rồi từ chối cả lượt khi thiếu `users:read.email`. Cho lời nhắc rõ hơn,
  nhưng chỉ bắt đúng một nguyên nhân, và cột đã lưu có thể cũ hơn quyền thật của token.
  Luật xét từng người đã bao ca này; thêm lớp thứ hai là thêm một nguồn sự thật.

## Chỗ sửa

- `apps/agent/agent/lib/slack-nguoi-nhan.ts` — tệp của bản rẽ. `thanhVienChiOkr` đọc thêm tập
  mã Slack đã khớp của mọi thành viên; bước đếm trả hai số (chặn, không xác định) thay vì
  một; `kiemNguoiNhanSlack` quyết theo thứ tự ở trên. Không tệp nào của hãng bị sửa.
- `docs/agent.md` — mục «Chỗ rẽ: người nhận Slack và lượt tự động của Tác nhân»: thay câu
  «Người Slack không khớp thành viên nào thì cho qua» bằng luật mới, nói rõ kết nối thiếu
  quyền đọc email thì Tác nhân không đăng được vào kênh có người chưa khớp.
- Tệp kiểm mới `apps/agent/test/slack-thieu-quyen-email.integration.spec.ts`, cùng cách dựng
  cảnh với tệp kiểm của #170 (gieo thật trong cơ sở dữ liệu của lượt, chỉ giả `fetch` tới
  slack.com, gọi `postRunSlackMessage` thật) nhưng là tệp riêng: tệp của #170 là thước của
  một hồ sơ đã ký, sửa nó là đổi thước sau chữ ký.

## Bằng chứng

- Đỏ trước, xanh sau: tệp kiểm mới chạy trên bản gương của mã trước vá — mốc cố định
  `a62adb16`, không lấy mốc theo điểm gộp (bài học Ngoài-5 của #170) — thì các ca thiếu
  email đỏ vì tin đã đi ra; trên cây đang xét thì xanh.
- Tệp kiểm của #170 chạy trọn và xanh trên cây đang xét: luật mới không chặn nhầm ca đối
  chứng dương của #170.
- Không tệp nào của hãng bị sửa: tập tệp của hãng mà các commit của vòng này chạm là tập
  rỗng.

## Ngoài phạm vi

- Người của tổ chức khác qua Slack Connect (không có trong danh bạ) vẫn không tính — như
  #170. Họ không thể là thành viên CRM; khách và người ngoài CRM vẫn nhận tin như hôm nay.
- Màn `/settings/connections` không thêm cảnh báo thiếu quyền.
- Thử lại khi Slack báo `ratelimited`, tín hiệu huỷ lượt, gộp hai bộ đọc `users.list`
  (Ngoài-2, Ngoài-3 của #170).
- Báo cho hãng — việc của chủ kho, qua kênh bảo mật riêng, khi chủ kho cho phép.

## Đặc tả UX

Không có: lượt không chạm màn nào (xem sổ quyết định).
