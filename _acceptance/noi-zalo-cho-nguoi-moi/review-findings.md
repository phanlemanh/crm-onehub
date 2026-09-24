## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **CotZalo is a hand-written type with zaloWebhookLyDo: string | null, so the ly-do values the code writes are no longer checked against ZALO_LY_DO**
  Người dùng thấy gì: Nếu sau nay có người gõ nhầm giá trị lý do webhook trong code, hệ thống sẽ không báo lỗi lúc biên dịch, và màn hình quản trị có thể lặng lẽ hiện sai trạng thái kết nối Zalo mà không ai nhận ra ngay.
  file: `apps/agent/agent/lib/zalo-bot-xuong.ts`
  severity: low
  Đề xuất: known-limits

- **Verification failure now saves a new bot, but the API reports an error and the page never refreshes, so the screen shows the old bot**
  Người dùng thấy gì: Khi quản trị viên đổi Bot Token và Zalo từ chối xác minh webhook, hệ thống đã lặng lẽ lưu bot mới và xóa webhook cũ, nhưng màn hình vẫn hiện tên bot cũ và trạng thái xanh như chưa có gì thay đổi — quản trị viên tưởng lưu thất bại nên không bấm Đăng ký lại, trong khi bot cũ đã mất khóa và ngừng nhận tin.
  file: `apps/agent/agent/lib/zalo-bot-xuong.ts`
  severity: high
  Đề xuất: new-contract

- **The xac-minh-hong state lasts only one dispatch tick: kiemBot rewrites zaloWebhookUrl from getWebhookInfo**
  Người dùng thấy gì: Cảnh báo Zalo chưa nhận tin sau một lần xác minh thất bại chỉ hiện được một nhịp rồi tự biến mất ở lần kiểm tiếp theo, dù webhook thật ra chưa được xác minh lại — quản trị viên có thể tưởng nhầm là đã ổn.
  file: `apps/agent/agent/lib/zalo-bot-xuong.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (a class claimed, but only point cases tested): the new 'xac-minh-hong' failure branch is tested only for 'dang-ky-lai', not in the CACH_GOI matrix, so the token assertion can never fail**
  Người dùng thấy gì: Bộ test cho tình huống xác minh webhook thất bại chưa phủ hết trường hợp kèm token mới, nên nếu code sau này vô tình lưu nhầm token mới thay vì giữ token cũ, bộ test hiện tại sẽ không bắt được lỗi đó.
  file: `apps/agent/test/noi-zalo-cho-nguoi-moi.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Every bridge failure becomes a 400 'agent not connected', and schema mismatches and agent 500s are silently dropped (r1)**
  Người dùng thấy gì: Khi kết nối tới tác tử bị lỗi vì nhiều lý do khác nhau, người quản trị chỉ thấy một thông báo chung chung, không biết nguyên nhân thật để xử lý.
  file: `apps/api/src/zalo/zalo-cau-noi.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Bot Token shape rule is duplicated in two apps and not enforced by the tRPC input schema (r1)**
  Người dùng thấy gì: Nếu quy định định dạng Bot Token thay đổi trong tương lai, màn hình và máy chủ có thể không còn khớp nhau, khiến người dùng bị từ chối nhầm hoặc chấp nhận nhầm token.
  file: `apps/api/src/zalo/zalo.config.ts`
  severity: medium
  Đề xuất: known-limits

- **Member removal now deletes Zalo links and notification preferences, but docs/api.md was not updated (r1)**
  Người dùng thấy gì: Tài liệu nội bộ chưa nói rõ là liên kết Zalo và cài đặt nhắc của một thành viên bị xóa hẳn khi gỡ họ khỏi xưởng, dễ khiến đội ngũ tưởng nhầm là mời lại sẽ khôi phục được.
  file: `apps/api/src/workspace/workspace.service.ts`
  severity: low
  Đề xuất: known-limits

- **Lỗi từ tác tử (Zalo gửi hỏng, getMe lỗi mạng hoặc sai khuôn) bị đổi thành «Tác tử chưa nối được», API không ghi log (r1)**
  Người dùng thấy gì: Khi Zalo hoặc tác tử gặp trục trặc thật sự lúc gửi tin hay kiểm tra bot, người dùng chỉ thấy một thông báo sai nguyên nhân, và phía kỹ thuật không có manh mối nào để tra lỗi.
  file: `apps/api/src/zalo/zalo-cau-noi.service.ts`
  severity: medium
  Đề xuất: new-contract

- **Capability «Zalo reminders» vẫn chỉ đọc ZALO_BOT_TOKEN, sai khi token dán trên màn (r1)**
  Người dùng thấy gì: Tác tử có thể báo cho mô hình là tính năng nhắc qua Zalo chưa được bật, dù quản trị viên đã dán token thành công trên màn Kết nối, gây hiểu nhầm về trạng thái thật.
  file: `apps/agent/agent/lib/capabilities.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 4/5 (declared 6-cell matrix, but a cell with no row passes, and 'du 6 o' is a tautology): E20 KhoiKenh (r1)**
  Người dùng thấy gì: Phép đo cho các dòng lý do chưa nối kênh có thể báo đạt ngay cả khi dòng chữ thật bị thiếu trên màn, nên một lỗi hiển thị thật có nguy cơ lọt qua.
  file: `apps/app/test/noi-zalo-cho-nguoi-moi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative clause never shown red): tai-lieu.mjs, the 'no instruction to edit .env and restart' condition (r1)**
  Người dùng thấy gì: Phép đo kiểm tra tài liệu không còn hướng dẫn sửa cấu hình rồi khởi động lại chưa từng được chứng minh là bắt đúng câu cần cấm, nên hướng dẫn lỗi thời có thể quay lại mà không bị phát hiện.
  file: `_acceptance/noi-zalo-cho-nguoi-moi/rang/tai-lieu.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture shaped for the reader): E2 checks xuong on an AppSetting row written by a fake agent in the test, not by the real writer (r1)**
  Người dùng thấy gì: Phép đo cho trạng thái bot sau khi lưu dựa trên dữ liệu giả tự viết chứ không phải dữ liệu do quy trình thật ghi ra, nên một sai lệch thật giữa bước lưu và bước đọc có nguy cơ không bị phát hiện.
  file: `apps/api/test/noi-zalo-cho-nguoi-moi.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative assertion without positive control): 'token khong ve trinh duyet' on the luuBot result is vacuous when luuBot fails (r1)**
  Người dùng thấy gì: Phép đo kiểm tra token không bị lộ ra màn hình có thể báo đạt ngay cả khi bước lưu bot thất bại, nên không chắc phép đo này đang kiểm tra đúng thứ cần kiểm.
  file: `apps/api/test/noi-zalo-cho-nguoi-moi.spec.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).