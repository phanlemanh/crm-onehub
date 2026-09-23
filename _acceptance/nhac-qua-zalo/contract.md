---
schema_version: 1
feature: Nhắc buổi sáng qua Zalo — mỗi người nối Zalo bằng mã 6 số gửi cho bot, tự chọn nhận nhắc qua Tự động · Zalo · Slack trên trang «Thông báo của bạn»; trang kết nối Zalo cho thấy bot sống và ai đã nối
slug: nhac-qua-zalo
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, config, docs]
status: approved
design_doc: docs/superpowers/specs/2026-09-23-nhac-qua-zalo-design.md
approved_by: Phan Le Manh
approved_at: 2026-09-23T08:28:44Z
---

# Acceptance Contract: nhac-qua-zalo

## Context

Nhắc buổi sáng (`may-nhac-truoc-nguoi`, #83) chỉ đi qua Slack, trong khi đội OneHub
sống trên Zalo. Zalo Bot Platform cho bot kiểu Telegram. Nhưng tin đến không mang
số điện thoại, và bot chỉ nhắn được người đã nhắn nó trước. Vì vậy người nối Zalo
bằng một mã 6 số sinh trong CRM rồi nhắn cho bot.

Mỗi người chọn kênh nhận: Tự động (mặc định: Zalo nếu đã nối, không thì Slack),
Zalo, hoặc Slack. Kênh đã chọn không dùng được thì tin đi kênh còn lại, và điều
đó được ghi lại và hiện ra.

Chỉ `apps/agent` gọi Zalo; API chỉ đọc và ghi hàng dữ liệu. Người dùng là nhân
viên OneHub nhận nhắc việc 30 ngày đầu.

Source input: yêu cầu của chủ kho 2026-09-23 (chọn hướng A: nhắc nội bộ, không nhắn
khách; ghép bằng mã liên kết; bổ sung trang chọn kênh) · nghiên cứu Zalo OA / ZBS /
Bot Platform cùng ngày · design doc ở `design_doc`.

## Criteria

- AC-1: Given đủ 12 tổ hợp của ưu tiên {AUTO, ZALO, SLACK} × Zalo {dùng được, không} × Slack {dùng được, không}, When gọi hàm chọn kênh, Then kết quả đúng từng dòng của bảng ở design doc mục 6: AUTO chọn Zalo khi Zalo dùng được, không thì Slack; ZALO chọn Zalo, Zalo không được mà Slack được thì Slack kèm lệch; SLACK chọn Slack, Slack không được mà Zalo được thì Zalo kèm lệch; cả hai không được thì không kênh nào; AUTO không bao giờ lệch.
- AC-2: Given `ZALO_BOT_TOKEN` có, xưởng đã nối Slack, A có `ZaloLink` và khớp Slack, ưu tiên AUTO, và A có một bước quá hạn, hai bước sắp hạn, một kế hoạch im — một trong các công ty tên «Minh & Co <HN>» — When làn trực tiếp chạy hàng `nhac-ke-hoach` của A với một Zalo giả và một Slack giả cùng ghi lời gọi, Then có đúng một `sendMessage` tới `chat_id` là `zaloUserId` của A và không lời gọi Slack nào; văn bản chứa nguyên chuỗi «Minh & Co <HN>» và không chứa `*`, `<http`, `|mở kế hoạch>` hay `&amp;`, phần Quá hạn đứng trước Sắp hạn, Sắp hạn đứng trước Kế hoạch im, mỗi dòng mang tên công ty của nó và đường dẫn trần kết thúc bằng `?record=plan:<mã đúng kế hoạch của dòng đó>`; đọc lại hàng từ cơ sở dữ liệu thấy `outcome` `da-gui:4`, `payload.kenh` là `zalo`, `payload.lechKenh` là false, và `payload.daGui` đúng bốn dòng.
- AC-3: Given A có 12 việc, tên công ty dài làm văn bản đầy đủ vượt `ZALO.tranKyTu`, When gửi qua Zalo, Then văn bản gửi đi không dài hơn `ZALO.tranKyTu` ký tự, có dòng «và N việc nữa» với N bằng số việc không có trong tin, và `payload.daGui` gồm đúng các dòng có trong văn bản.
- AC-4: Given bốn người có việc — P ưu tiên ZALO, chưa nối Zalo, khớp Slack; Q ưu tiên SLACK, không khớp Slack, đã nối Zalo; R ưu tiên ZALO, đã nối Zalo nhưng thiếu `ZALO_BOT_TOKEN`, khớp Slack; S ưu tiên ZALO, chưa nối Zalo, không khớp Slack, xưởng đã nối Slack — When làn trực tiếp chạy hàng của từng người, Then P nhận đúng một tin Slack, `payload.kenh` là `slack`, `lechKenh` là true; Q nhận đúng một tin Zalo, `kenh` là `zalo`, `lechKenh` là true; R nhận đúng một tin Slack với `lechKenh` true và không có lời gọi Zalo nào; S không có lời gọi nào, hàng đóng với `outcome` `khong-khop`; và với mỗi người, kênh mà trạng thái «Thông báo của bạn» báo sẽ dùng cùng cờ lệch của nó trùng đúng với `payload.kenh` và `lechKenh` của lượt gửi (S: không kênh nào).
- AC-5: Given A đã nối Zalo, ưu tiên ZALO, khớp Slack, và Zalo giả trả HTTP 500 cho `sendMessage` — rồi lần thứ hai trả `{"ok": false}` — When làn trực tiếp chạy hàng của A, Then mỗi lần lời gọi ném lỗi, không có lời gọi Slack nào, và đọc lại hàng từ cơ sở dữ liệu thấy `finishedAt` rỗng và `payload` không có `kenh` hay `daGui`.
- AC-6: Given không có `ZALO_BOT_TOKEN`, When nhịp poll Zalo chạy, Then không có lời gọi mạng nào tới Zalo, hàm không ném lỗi, `appSetting.zaloBotName` là null, và danh sách năng lực có dòng Zalo với `enabled` false; khi có token và `getMe` trả tên «Bot OneHub» thì sau nhịp `zaloBotName` là «Bot OneHub» và `zaloPolledAt` bằng giờ của nhịp; khi có token mà `getMe` trả 401 thì nhịp không ném, `zaloBotName` về null, và một người ưu tiên ZALO đã nối, khớp Slack nhận nhắc qua Slack với `lechKenh` true.
- AC-7: Given thành viên U và một người không thuộc xưởng, When U bấm «Nối Zalo» rồi «Tạo mã mới» trên trang «Thông báo của bạn» rồi người Zalo Z nhắn mã của lần thứ hai cho bot và nhịp poll chạy, Then mỗi lần tạo trả một chuỗi đúng 6 chữ số kèm `expiresAt` bằng giờ tạo cộng `ZALO_LIEN_KET.ma.songMs`; cơ sở dữ liệu không chứa chuỗi mã ở dạng rõ và chỉ còn một hàng mã sống của U; sau nhịp có đúng một `ZaloLink` (U, Z) mang `display_name` của Z, mã đó có `usedAt`, và bot gửi đúng một tin tới Z chứa tên CRM của U; mã của lần thứ nhất nhắn sau đó không tạo liên kết; mỗi lần bấm gửi đúng một lời gọi tạo mã qua máy chủ, và người ngoài xưởng gọi tạo mã bị từ chối, không có hàng mã nào. (cross-layer)
- AC-8: Given U có mã sống, When người Zalo Z nhắn lần lượt một mã sai, mã của U sau khi đã hết hạn, mã của U sau khi đã dùng, và một câu chữ không phải 6 số, Then không `ZaloLink` nào được tạo; mỗi tin có đúng một câu trả lời của bot, và không câu nào chứa tên CRM của ai; ba tin đầu tăng bộ đếm sai của Z thêm ba, còn tin chữ không tăng; không bảng nào lưu văn bản Z đã nhắn.
- AC-9: Given Z đã nhắn sai `ZALO_LIEN_KET.doMa.toiDa` lần trong cửa sổ hiện tại, When Z nhắn tiếp đúng mã sống của U trong cùng cửa sổ, và nhắn lại sau khi cửa sổ qua, Then lần trong cửa sổ không tạo liên kết, không có câu trả lời nào và mã của U vẫn sống; lần sau cửa sổ tạo liên kết (U, Z).
- AC-10: Given `ZaloLink` (U1, Z) với ưu tiên của U1 là ZALO, và `ZaloLink` (U2, Z2), When Z nhắn mã sống của U2, Then chỉ còn một `ZaloLink` mang Z và đó là (U2, Z); U2 không còn liên kết với Z2; U1 không còn liên kết và ưu tiên của U1 thành AUTO. Given U3 ưu tiên ZALO và U4 ưu tiên SLACK, cả hai đã nối, When mỗi người bấm «Gỡ» rồi xác nhận, Then cả hai không còn liên kết, U3 thành AUTO, U4 vẫn SLACK; hộp xác nhận của U3 nói tin sẽ về Slack, và đóng hộp mà không xác nhận thì không có lời gọi gỡ nào. (cross-layer)
- AC-11: Given nhịp poll gặp cùng một tin (cùng `message_id`, nội dung là mã sống của U) hai lần — trong một nhịp và ở hai nhịp kế nhau — When xử lý, Then chỉ có một `ZaloLink`, bot chỉ trả lời một lần, và một nhịp gọi `getUpdates` nhiều nhất `ZALO.poll.toiDaMoiNhip` lần dù Zalo còn tin; một tin không đọc được theo schema làm nhịp ghi lỗi mang `message_id`, không ném cả nhịp, và không được đánh dấu là đã xử lý như một tin trống.
- AC-12: Given U chưa nối Zalo, không khớp Slack, Zalo của xưởng đang bật, When U lưu ưu tiên ZALO, lưu SLACK, rồi lưu AUTO, và sau khi nối Zalo thì lưu ZALO, Then máy chủ từ chối ZALO lần đầu và SLACK với lỗi gọi tên kênh chưa dùng được, ưu tiên vẫn AUTO, AUTO lưu được, ZALO sau khi nối lưu được; màn «Thông báo của bạn» hiện lựa chọn Zalo và Slack ở trạng thái khoá kèm lý do trước khi nối, chọn một lựa chọn mở thì gửi đúng một lời gọi mang kênh đó, và khi lời gọi lỗi thì lựa chọn về giá trị cũ và hiện «Không lưu được lựa chọn». (cross-layer)
- AC-13: Given xưởng 7 thành viên, 3 người đã nối Zalo, một người đã rời xưởng mà còn `ZaloLink`, bot bật với `zaloPolledAt` 1 phút trước, và U ưu tiên SLACK, đã nối Zalo nhưng không khớp Slack, When đọc trạng thái trang kết nối Zalo và trạng thái «Thông báo của bạn» của U, Then trang kết nối trả bật, tên bot, giờ poll cuối, số đã nối 3 trên 7 và danh sách tên thành viên kèm đã nối hay chưa (không gồm người đã rời); `zaloPolledAt` cũ hơn `ZALO_LIEN_KET.imSauMs` thì trạng thái mang cờ im; trạng thái của U mang lệch với kênh sẽ dùng là Zalo; khi bot tắt (`zaloBotName` null) thì trạng thái trang kết nối là tắt và của U là không kênh nào; và màn hiện đúng các giá trị máy chủ trả. (cross-layer)
- AC-14: Given trang «Thông báo của bạn» ở trạng thái mã đang chờ, đã nối kèm cảnh báo lệch, và Zalo chưa bật; trang kết nối Zalo ở trạng thái sống và im, When chụp ở khổ 1440 và 375, Then nhìn thấy trên ảnh mã 6 số chia hai nhóm kèm giờ hết hạn và tên bot, nhóm nút Tự động · Zalo · Slack với lựa chọn khoá có lý do, dòng cảnh báo lệch kênh, «x/y người đã nối» và cảnh báo bot im; ảnh 375 không tràn ngang; và thanh bên Cài đặt có mục «Thông báo của bạn».
- AC-15: Given U lần lượt ở bốn tình trạng — chưa có mã, mã còn sống, mã đã quá `ZALO_LIEN_KET.ma.songMs`, mã đã dùng và đã có `ZaloLink` mang tên hiển thị Z — When đọc trạng thái «Thông báo của bạn» của U, Then trạng thái liên kết lần lượt là chưa nối, mã đang chờ kèm `expiresAt` (không kèm mã), mã hết hạn, đã nối kèm tên hiển thị Z; và màn đang ở mã chờ tự làm mới trạng thái, đổi sang «Đã nối · Z» ngay khi máy chủ trả đã nối, rồi thôi làm mới. (cross-layer)

## Coverage

Quét bằng skill `morphological-scan` ngày 2026-09-23 (preset `entity-feature`, trục
dựng lại). Bản đầy đủ ở `_acceptance/nhac-qua-zalo/morphological-scan.md`: 4 trục,
khoảng 60 ô có nghĩa, cắt còn 13 ô Core (khoảng 21%).

- Trục A — vòng đời liên kết: chưa nối | mã đang chờ | mã hỏng | đã nối | nối lại | gỡ | người rời xưởng [thước CE: `[NGÀNH: Telegram Bot API deep linking]` + vòng đời `SlackMemberMatch`]
- Trục B — kênh ưa thích: Tự động | Zalo | Slack [thước CE: `[NGÀNH: Linear, GitHub — Settings › Notifications]`]
- Trục C — kênh dùng được lúc gửi: Zalo được / không × Slack được / không, cộng một ca: Zalo trả lỗi [thước CE: `nhac-ke-hoach.ts` và khuôn `capabilities.ts`]
- Trục D — bề mặt: trang cá nhân | trang kết nối | chat với bot | tin nhắc [thước CE: `docs/connections.md`]
- Ánh xạ Core → tiêu chí:
  - chọn kênh → AC-1
  - Zalo gửi được → AC-2, AC-3
  - lệch kênh → AC-4
  - Zalo lỗi → AC-5
  - không token → AC-6
  - mã → AC-7, AC-15
  - mã hỏng và chống dò → AC-8, AC-9
  - nối lại và gỡ → AC-10
  - trùng tin → AC-11
  - chọn kênh có khoá → AC-12
  - hai trang → AC-13
  - mặt người nhìn → AC-14
- `[GIẢ ĐỊNH]` chờ người gạch:
  - (1) tin đã trả qua `getUpdates` không bị trả lại — chống trùng giữ đúng dù sai;
  - (2) trần một tin Zalo là 2000 ký tự;
  - (3) đội đọc Zalo trong ngày nhiều hơn Slack — lý do của vòng, chưa đo.

## Out of scope

- Nhắn khách hay đối tác qua Zalo (OA, ZBS, Zalo cá nhân).
- Nhóm Zalo, và tác tử đăng tin lên Zalo (bản Zalo của `slack.message.post`).
- Gửi cả hai kênh cùng lúc; tắt nhắc cho từng người; chọn kênh theo từng loại thông báo.
- Ghép bằng số điện thoại — Bot API không trả số.
- Chế độ webhook; quản trị viên gỡ liên kết hộ người khác; logo Zalo trong `brand-logos`.

## Notes

- Người chặn bot thì `sendMessage` lỗi mỗi sáng; hàng đi luật thử lại rồi
  `retireExhausted`, và trang cá nhân không biết điều đó.
- «Zalo dùng được» phía API đọc `appSetting.zaloBotName` do agent ghi, không đọc
  token. Nếu agent chết thì cờ vẫn là bật, nhưng trang kết nối báo im.
- `outcome` giữ `da-gui:<n>`, `khong-slack`, `khong-khop`, `khong-viec` như cũ để
  câu truy vấn đường đo của `may-nhac-truoc-nguoi` không lệch.
- Người đã rời xưởng còn `ZaloLink`: không có việc nhắc nên không nhận gì, và
  không được đếm trên trang kết nối. Liên kết tự mất khi `User` bị xoá.
