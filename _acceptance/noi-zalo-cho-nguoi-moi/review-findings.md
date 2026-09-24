## Trong hợp đồng

### When Zalo accepts setWebhook but verification fails, the code restores the old URL and key, so the status still reads «da-dang-ky»
- file: `apps/agent/agent/lib/zalo-bot-xuong.ts:117`
- severity: high
- source: conventions
- AC: AC-16

`dangKy` returns false in two different cases. (1) The call itself fails: `ok:false` or a network error. (2) Zalo answers `ok:true` but `verification.outcome` is not `webhook.ok`. `datBot` handles both the same way, with `ghiCot({ ...truoc, zaloWebhookLyDo: "zalo-tu-choi" })`. That restores the whole previous row, including the old `zaloWebhookUrl` and `zaloWebhookSecret`.

AC-16 requires that when `outcome` is not `webhook.ok`, `zaloWebhookUrl` is null and `zalo.xuong` does not return «da-dang-ky». The Given of AC-16 is not limited to a first-time setup. But when a bot is already registered (url U, key K) and the admin registers again, a failed verification brings back url U. `trangThaiWebhook` in apps/api/src/zalo/zalo.service.ts:41 returns «da-dang-ky» whenever the url is non-null, so the screen still says the webhook is registered. AC-17 (keep the old token and key) only covers `ok:false` and network errors, not a failed verification.

There is also a likely runtime effect. Zalo answered `ok:true`, so it has probably saved the webhook with the new `secret_token`. The DB now holds key K again, so every later webhook call would get 401 while the UI shows it as registered.

The test «goi-nguoc: b» only covers the first-time case (no previous url), so this gap passes unnoticed. Case (2) needs its own branch: set url to null, keep «zalo-tu-choi», and decide which secret to keep. Add a test that starts with a url already registered.

### Re-registering the same bot when Zalo says ok:true but verification failed: the old secret is put back while Zalo keeps the new one, so every webhook message is rejected and the screen still shows «da-dang-ky»
- file: `apps/agent/agent/lib/zalo-bot-xuong.ts:117`
- severity: medium
- source: bugs
- AC: AC-16

`dangKy` now returns false when `setWebhook` answers `ok: true` but `verification.outcome` is not `webhook.ok`. `datBot` then runs `ghiCot({ ...truoc, zaloWebhookLyDo: "zalo-tu-choi" })`, which writes back the old token T, the old secret K and the old `zaloWebhookUrl` U. But `ok: true` means Zalo accepted `setWebhook` and stored the new `secret_token` K2. The repo's own CLI (`zalo-dang-ky.ts`) and docs/agent.md read it the same way: they treat `ok: true` as registered and print the outcome only as information.

Scenario: a bot is running with T/K/U. The admin clicks «Đăng ký lại» (`luuBot({})`, so the token resolves to T), or pastes the same token again. Zalo returns `{ok:true, result:{url, verification:{outcome:"webhook.failed"}}}`, for example because its test call timed out. The DB goes back to secret K, while Zalo now signs every delivery with K2. `nhanWebhook` compares the header against `zaloKhoaWebhook()` = K and rejects every real message, and nothing logs it at the setup step. `trangThaiWebhook(url=U, …)` still returns «da-dang-ky», so the screen shows the webhook as fine while nothing arrives. This also breaks AC-16 («zalo.xuong không trả da-dang-ky» when verification fails) whenever a URL was already stored. The E25 case b test only covers a first-time setup with url null, so it misses this.

The rollback is only safe when Zalo actually refused the call (`ok:false`, or the call threw before it reached Zalo). When the verification outcome is bad but `ok` is true, the code should either keep K2 and set `zaloWebhookUrl` to null, or call `deleteWebhook` before restoring K.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **console.table left in integration tests**
  Người dùng thấy gì: Người dùng không thấy gì thay đổi; đây chỉ là một dòng ghi thừa trong nhật ký chạy kiểm thử nội bộ, không ảnh hưởng tới tính năng thật.
  file: `apps/agent/test/noi-zalo-cho-nguoi-moi.integration.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Shape 3 (checks a value exists, but the promise is a relation): E27 nhip-tron cannot go red with its own declared mutation, and row 2 cannot witness the 500 branch**
  Người dùng thấy gì: Nếu sau này có lỗi khiến việc kiểm tra webhook khi Zalo báo lỗi 500 làm ngừng luôn cả nhịp gửi nhắc buổi sáng, bộ kiểm thử hiện tại có thể không phát hiện ra, nên người dùng có thể mất nhắc mà không ai biết ngay.
  file: `apps/agent/test/noi-zalo-cho-nguoi-moi.integration.spec.ts`
  severity: medium
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
  Người dùng thấy gì: Tài liệu nội bộ chưa nói rõ là liên kết Zalo và cài đặt nhắc của một thành viên bị xoá hẳn khi gỡ họ khỏi xưởng, dễ khiến đội ngũ tưởng nhầm là mời lại sẽ khôi phục được.
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

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).