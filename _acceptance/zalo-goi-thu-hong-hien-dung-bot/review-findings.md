## Trong hợp đồng

Không có phát hiện nào khớp AC ở vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The poller's sticky flag also freezes the old bot after a failed swap, so a later blip leaves its webhook showing as not registered**
  Người dùng thấy gì: Nếu việc đổi bot Zalo gặp trục trặc mạng (không phải do Zalo từ chối gọi thử), màn có thể tiếp tục báo 'Zalo chưa giao tin nhắn về CRM' mãi cho tới khi có người tự bấm 'Đăng ký lại', dù Zalo trên thực tế vẫn đang gửi tin về bình thường.
  file: `apps/agent/agent/lib/zalo-bot.ts:31`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (claims a whole class, has one point case): cell 13 'nhip chen' cannot catch a read-then-write placed after the fetch**
  Người dùng thấy gì: Bộ kiểm tra tự động cho tính năng có một khe hở nhỏ: một kiểu lỗi tranh chấp thời gian hiếm gặp có thể không bị bắt được dù nó thực sự xảy ra.
  file: `apps/agent/test/zalo-goi-thu-hong.integration.spec.ts:365`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative-only assertion, no positive control): API spec row 4 'chua-dang-ky SAU nhip' never proves the tick reached getWebhookInfo**
  Người dùng thấy gì: Một bài kiểm tra chỉ xác nhận thông báo hiển thị đúng chứ chưa chắc chắn hệ thống đã thực sự thử liên hệ Zalo ở bước đó, nên một lỗi hiếm có thể lọt qua mà bài kiểm tra vẫn báo đạt.
  file: `apps/api/test/zalo-goi-thu-hong.spec.ts:180`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (negative-only assertion, no positive control): giu-da-ky's self-check exercises only the hunk-range rule, not the keyword rule**
  Người dùng thấy gì: Một công cụ tự kiểm của quy trình duyệt có lỗ hổng nhỏ khiến nó có thể bỏ sót một số thay đổi lẽ ra phải bị chặn, nhưng việc này nằm ở công cụ dùng chung cho nhiều tính năng chứ không phải trong chính tính năng Zalo đang xét.
  file: `_acceptance/zalo-goi-thu-hong-hien-dung-bot/rang/giu-da-ky.mjs:69`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
