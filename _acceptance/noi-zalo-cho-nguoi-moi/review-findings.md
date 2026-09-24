## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Every bridge failure becomes a 400 'agent not connected', and schema mismatches and agent 500s are silently dropped**
  Người dùng thấy gì: Khi kết nối tới tác tử bị lỗi vì nhiều lý do khác nhau, người quản trị chỉ thấy một thông báo chung chung, không biết nguyên nhân thật để xử lý.
  file: `apps/api/src/zalo/zalo-cau-noi.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Bot Token shape rule is duplicated in two apps and not enforced by the tRPC input schema**
  Người dùng thấy gì: Nếu quy định định dạng Bot Token thay đổi trong tương lai, màn hình và máy chủ có thể không còn khớp nhau, khiến người dùng bị từ chối nhầm hoặc chấp nhận nhầm token.
  file: `apps/api/src/zalo/zalo.config.ts`
  severity: medium
  Đề xuất: known-limits

- **Member removal now deletes Zalo links and notification preferences, but docs/api.md was not updated**
  Người dùng thấy gì: Tài liệu nội bộ chưa nói rõ là liên kết Zalo và cài đặt nhắc của một thành viên bị xoá hẳn khi gỡ họ khỏi xưởng, dễ khiến đội ngũ tưởng nhầm là mời lại sẽ khôi phục được.
  file: `apps/api/src/workspace/workspace.service.ts`
  severity: low
  Đề xuất: known-limits

- **datBot gọi setWebhook trước khi ghi token và khoá mới, rồi bỏ qua verification.outcome**
  Người dùng thấy gì: Khi quản trị viên bật bot hoặc đổi token lần đầu, Zalo thật có thể kiểm tra ngay lúc đó và gặp dữ liệu chưa kịp lưu, khiến việc đăng ký thật ra thất bại nhưng màn hình vẫn báo đã kết nối thành công.
  file: `apps/agent/agent/lib/zalo-bot-xuong.ts`
  severity: high
  Đề xuất: new-contract

- **Một lần setWebhook hỏng xoá khoá của webhook vẫn còn đăng ký ở Zalo, mọi tin tới bị 404/403 mà màn vẫn xanh**
  Người dùng thấy gì: Nếu một lần đổi token hoặc đăng ký lại webhook bị Zalo từ chối, hệ thống có thể xoá mất khoá webhook đang hoạt động, làm mọi tin nhắn tới ngừng được nhận mà không có cảnh báo nào.
  file: `apps/agent/agent/lib/zalo-bot-xuong.ts`
  severity: medium
  Đề xuất: new-contract

- **Lỗi từ tác tử (Zalo gửi hỏng, getMe lỗi mạng hoặc sai khuôn) bị đổi thành «Tác tử chưa nối được», API không ghi log**
  Người dùng thấy gì: Khi Zalo hoặc tác tử gặp trục trặc thật sự lúc gửi tin hay kiểm tra bot, người dùng chỉ thấy một thông báo sai nguyên nhân, và phía kỹ thuật không có manh mối nào để tra lỗi.
  file: `apps/api/src/zalo/zalo-cau-noi.service.ts`
  severity: medium
  Đề xuất: new-contract

- **Capability «Zalo reminders» vẫn chỉ đọc ZALO_BOT_TOKEN, sai khi token dán trên màn**
  Người dùng thấy gì: Tác tử có thể báo cho mô hình là tính năng nhắc qua Zalo chưa được bật, dù quản trị viên đã dán token thành công trên màn Kết nối, gây hiểu nhầm về trạng thái thật.
  file: `apps/agent/agent/lib/capabilities.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (negative assertion alone): E9 case c 'giu gia tri cu' also passes when the tick crashes, because allSettled hides the error**
  Người dùng thấy gì: Phép đo cho ca lỗi khi kiểm tra webhook có thể báo đạt ngay cả khi bước kiểm tra đó bị lỗi ngầm, nên một sự cố thật trong bước này có nguy cơ không bị phát hiện.
  file: `apps/agent/test/noi-zalo-cho-nguoi-moi.integration.spec.ts`
  severity: high
  Đề xuất: new-contract

- **Shape 4/5 (declared 6-cell matrix, but a cell with no row passes, and 'du 6 o' is a tautology): E20 KhoiKenh**
  Người dùng thấy gì: Phép đo cho các dòng lý do chưa nối kênh có thể báo đạt ngay cả khi dòng chữ thật bị thiếu trên màn, nên một lỗi hiển thị thật có nguy cơ lọt qua.
  file: `apps/app/test/noi-zalo-cho-nguoi-moi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative clause never shown red): tai-lieu.mjs, the 'no instruction to edit .env and restart' condition**
  Người dùng thấy gì: Phép đo kiểm tra tài liệu không còn hướng dẫn sửa cấu hình rồi khởi động lại chưa từng được chứng minh là bắt đúng câu cần cấm, nên hướng dẫn lỗi thời có thể quay lại mà không bị phát hiện.
  file: `_acceptance/noi-zalo-cho-nguoi-moi/rang/tai-lieu.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative with no control): E24 promises a red control, but the command only runs the gate on the two real pages**
  Người dùng thấy gì: Phép đo kiểm tra chuẩn thiết kế trên hai trang Zalo chưa từng được chứng minh là phát hiện được một lỗi lệch chuẩn thật, nên một lỗi giao diện dạng này có thể lọt qua mà không bị báo.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture shaped for the reader): E2 checks xuong on an AppSetting row written by a fake agent in the test, not by the real writer**
  Người dùng thấy gì: Phép đo cho trạng thái bot sau khi lưu dựa trên dữ liệu giả tự viết chứ không phải dữ liệu do quy trình thật ghi ra, nên một sai lệch thật giữa bước lưu và bước đọc có nguy cơ không bị phát hiện.
  file: `apps/api/test/noi-zalo-cho-nguoi-moi.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative assertion without positive control): 'token khong ve trinh duyet' on the luuBot result is vacuous when luuBot fails**
  Người dùng thấy gì: Phép đo kiểm tra token không bị lộ ra màn hình có thể báo đạt ngay cả khi bước lưu bot thất bại, nên không chắc phép đo này đang kiểm tra đúng thứ cần kiểm.
  file: `apps/api/test/noi-zalo-cho-nguoi-moi.spec.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/13 lỗi rơi vào file không bộ đo nào phủ (apps/agent/agent/lib/capabilities.ts, _acceptance/noi-zalo-cho-nguoi-moi/rang/tai-lieu.mjs, _acceptance/config.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.