# Review findings: zalo-gui-hong-ghi-ly-do (round 2)

## Trong hợp đồng

- **Khi getMe của token cũ hỏng, phần số của token cũ bị so với id getMe của bot mới, không so với phần số của token mới**
  AC: AC-7
  file: `apps/agent/agent/lib/zalo-bot-xuong.ts:181`
  severity: low
  source: bugs
  detail: AC-7 ghi: «getMe của token cũ hỏng thì phần <số> của hai token khác». Code thì so `maBotCua(fetcher, tokenCu)` (rơi về `phanSoToken(tokenCu)` khi getMe hay parse hỏng) với `bot.maBot`, mà `bot.maBot` là `parseZaloGetMe(...).id` của token mới, không phải `phanSoToken(token)`. Hai giá trị này chỉ khớp được khi id trong getMe của Zalo đúng bằng phần số trước dấu `:` của token. Fixture test giả định điều đó (`111:cu` với id `111`) nhưng code không bảo đảm. Nếu hai giá trị khác nhau, thì xoay token của CÙNG một bot sau khi token cũ đã bị thu hồi (getMe cũ trả 401, đúng ca hay gặp nhất) sẽ bị coi là đổi bot: màn hiện ConfirmDialog đòi gỡ n liên kết, và quản trị bấm đồng ý thì xoá liên kết của một bot không hề đổi (trái AC-9). Cách sửa đúng chữ AC: ở nhánh dự phòng thì so phần số với phần số, `phanSoToken(tokenCu) !== phanSoToken(token)`.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **When the agent has no https address, confirming a bot swap saves the new token but never removes the old links**
  Người dùng thấy gì: Nếu hệ thống chạy ở địa chỉ không có https (tự dựng hoặc chạy thử trên máy), quản trị đổi sang bot khác và bấm đồng ý gỡ liên kết thì bot mới được lưu nhưng liên kết của mọi người vẫn còn, tin nhắc vẫn hỏng âm thầm. Bản chạy thật dùng https nên chưa gặp.
  file: `apps/agent/agent/lib/zalo-bot-xuong.ts`
  severity: medium
  Đề xuất: known-limits

- **Any request with a wrong secret header turns on the khoa-lech warning, while the docs say only a valid Zalo message does**
  Người dùng thấy gì: Một người lạ gửi yêu cầu giả tới địa chỉ nhận tin Zalo cũng có thể làm màn Kết nối hiện cảnh báo «Zalo đang gửi tin bằng khoá cũ» cho quản trị, dù Zalo chẳng làm gì sai. Quản trị bấm Đăng ký lại là hết, nhưng tài liệu đang mô tả khác thực tế.
  file: `apps/agent/agent/lib/zalo-webhook.ts`
  severity: medium
  Đề xuất: known-limits

- **New getMe caller maBotCua skips phanLopGetMe and the zalo.getme-loi AgentEvent, and swallows its error**
  Người dùng thấy gì: Khi hệ thống kiểm tra bot cũ lúc đổi bot mà Zalo trả lỗi, lỗi đó không để lại dấu vết nào trong nhật ký, nên khó biết vì sao hệ thống coi là đổi bot hay không.
  file: `apps/agent/agent/lib/zalo-bot-xuong.ts`
  severity: medium
  Đề xuất: known-limits

- **getMe body is parsed twice in docBot, and one branch can never run**
  Người dùng thấy gì: Không ảnh hưởng người dùng: chỉ là mã bên trong làm dư một bước và có một nhánh không bao giờ chạy.
  file: `apps/agent/agent/lib/zalo-bot-xuong.ts`
  severity: low
  Đề xuất: wont-fix

- **Đổi bot đã xác nhận trên gốc không https lưu bot mới nhưng không gỡ liên kết nào**
  Người dùng thấy gì: Trên hệ thống chạy địa chỉ không có https, hộp thoại hứa «Gỡ liên kết và đổi bot» nhưng chỉ đổi bot, liên kết cũ vẫn còn. Người dùng thấy vẫn đã nối Zalo mà tin nhắc không tới, và không có chỗ nào báo cần nối lại.
  file: `apps/agent/agent/lib/zalo-bot-xuong.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: thông điệp ghim «khoa moi chua ghi luc zalo xac minh» bị nuốt, không bao giờ là lỗi bài báo ra**
  Người dùng thấy gì: Không ảnh hưởng người dùng: nếu có lỗi về thứ tự ghi khoá thì bài kiểm vẫn báo đỏ, chỉ là dòng giải thích lúc đỏ chung chung hơn.
  file: `apps/agent/test/zalo-gui-hong-ly-do.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4: AC-13 lần đăng ký hỏng chỉ kiểm `!== null`, không ghim vào tập giá trị đã hứa**
  Người dùng thấy gì: Nếu đăng ký lại hỏng, bài kiểm chỉ chắc rằng lý do cảnh báo không bị xoá, chưa chắc nó là giá trị hiện đúng cảnh báo. Rủi ro thấp, chi phí siết thêm không đáng.
  file: `apps/agent/test/zalo-gui-hong-ly-do.spec.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
