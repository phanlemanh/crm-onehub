# Báo lỗi tác nhân cả sau câu hỏi giữa chừng — thiết kế (VS11)

Hồ sơ: `_acceptance/bao-loi-tac-nhan-sau-cau-hoi/`. Hàng VS11 của `docs/plan/lo-trinh-okr.json`. Nguồn: Ngoài-11 của
`ve-sinh-do-san-onehub` (chủ kho chọn «mở hợp đồng mới», 17/10).

## Lời hứa

Thẻ «Đang dựng» nói «Bạn có thể rời trang. Kara sẽ báo trong hộp thông báo khi xong.». Lượt dựng hỏng thì người dựng
nhận đúng một thông báo «hỏng», kể cả khi Kara đã hỏi và người đã trả lời giữa chừng. Ngưỡng CHẾT đã ký ở
`opportunity.md`: «còn một ca hỏng trong lúc dựng mà hộp thông báo trống, hoặc một lượt hỏng sinh từ hai thông báo trở
lên».

## Đo trước khi thiết kế (27/10, onehub 518f05802)

Ngoài-11 được nêu từ việc đọc mã: `noiDungTacNhan` (`apps/agent/agent/lib/thong-bao-tac-nhan.ts`) xét lần gửi **mới
nhất** của cuộc, và chỉ ghi `tac-nhan-hong` khi lần ấy mang `commandType = CREATE_AGENT`.

Câu trả lời không làm hỏng điều đó: từ hồ sơ `quyen-luot-mang-theo` (ký 22/09), câu hỏi lưu kèm cờ quyền của lượt
hỏi (`persistBuilderInputRequest`, cờ từ `builderTurnAuthorized`), và `answerBuilderQuestion` ghi lần gửi trả lời
bằng `commandTypeFromAuthorization` — câu trả lời thừa hưởng `CREATE_AGENT`.

Nhưng «mới nhất» không phải «đang chạy». Bộ giao (`dispatchBuilderSubmission`) chỉ giao một lần gửi khi cuộc rảnh; lần
gửi đến trong lúc Kara đang làm nằm `PENDING` tới khi lượt hiện tại xong. Tin trò chuyện chen giữa lúc dựng vì thế che
mất lượt dựng.

Đo trên kho thử, bài kiểm `apps/api/test/bao-loi-sau-cau-hoi.spec.ts` chạy trên mã chưa sửa:

| Ca | Thông báo hôm nay | Đúng ra |
| --- | --- | --- |
| dựng → hỏi → trả lời → `turn.failed` | cần trả lời, hỏng | như hôm nay |
| dựng → hỏi → trả lời → hỏi → trả lời → `session.failed` | cần trả lời ×2, hỏng | như hôm nay |
| dựng → hỏi → trả lời → `turn.failed` rồi `session.failed` | cần trả lời, hỏng | như hôm nay |
| dựng → hết hạn mức → «Cấp thêm» → `turn.failed` | cần trả lời, hỏng | như hôm nay |
| trò chuyện → hỏi → trả lời → `turn.failed` | cần trả lời | như hôm nay |
| dựng → tin trò chuyện chen giữa (xếp hàng) → `turn.failed` | (không có) | hỏng, của lần dựng |
| dựng → lưu bản nháp → tin chen giữa → `session.waiting` | (không có) | xong, của lần dựng |
| dựng → tin chen giữa → `turn.failed` → tin chen giữa được giao → `turn.failed` | (không có) | đúng một hỏng |

Màn khoá ô soạn khi đang dựng (`agent-builder-chat.tsx`, `disabled={working}`), nên tin chen giữa đến từ tab khác
hay thiết bị khác — một đường người dùng đi tới được.

## Lối chọn

`noiDungTacNhan` chọn lần gửi **Kara đang làm**: lần gửi mới nhất có trạng thái `SENDING` hoặc `ACCEPTED`, thay vì lần
gửi mới nhất bất kể trạng thái. Lần gửi còn `PENDING` chưa tới Kara; `FAILED` và `CANCELLED` không thành lượt. Một
điều kiện thêm vào truy vấn có sẵn; ba loại thông báo (xong, cần trả lời, hỏng) cùng đọc lần gửi ấy, nên ca «xong» bị
che cũng hết.

Bài kiểm là tệp mới `apps/api/test/bao-loi-sau-cau-hoi.spec.ts`, đi trọn đường bằng bộ ghi của chính sản phẩm:

1. Mở cuộc bằng `ConversationsService.createBuilder`; tin chen giữa bằng `submitBuilder`.
2. Giao cho Kara bằng `dispatchBuilderSubmission` thật; chỉ lời gọi sang eve (`send`) là giả, trả về một phiên như
   hợp đồng của eve, và ngữ cảnh phiên mà bộ giao đưa cho eve được giữ lại để dùng ở bước 3.
3. Kara hỏi: `crmEvents["input.requested"]` với sự kiện câu hỏi đã chụp từ eve
   (`apps/agent/test/fixtures/hai-luot-hoi-that.json`, `session-limit-that.json`) và ngữ cảnh của bước 2.
4. Phiên chờ: `crmEvents["session.waiting"]`.
5. Người trả lời: `ConversationsService.answerBuilderQuestion`, rồi giao như bước 2.
6. Lượt hỏng: `crmEvents["turn.failed"]` / `crmEvents["session.failed"]` (hai nơi gọi «hỏng» của kênh `crm`).
7. Đọc hàng `ThongBao` của người mở cuộc.

Lối đã loại:

- **Chỉ ghim lời hứa bằng bài kiểm, không sửa mã.** Ba ca chen giữa đỏ trên mã hôm nay và chạm đúng ngưỡng CHẾT đã
  ký; ghim mà không sửa là giao một vòng biết mình chết.
- **Sửa fixture của ma trận `cho-tac-nhan-lau`.** Tệp ấy nằm trong `paths` của E4 hồ sơ đã ký `cho-tac-nhan-lau`;
  bài kiểm mới đứng riêng. Ma trận cũ dùng lần gửi `ACCEPTED`, nên giữ nguyên kết quả dưới điều kiện mới.
- **Chọn lần gửi theo lệnh dựng gần nhất.** Một lượt trò chuyện hỏng sau một lần dựng đã xong hôm trước sẽ bị báo
  nhầm là dựng hỏng.

## Ngoài vòng

- Trò chuyện thường có câu hỏi vẫn sinh «cần trả lời». Đúng ý: có câu đang chờ người. Không thuộc lời hứa «hỏng».
- Câu chữ thông báo, kênh gửi và chuông không đổi.

## Đọc trước khi chạm

`docs/agent.md` (Team-agent builder and runner — «Where a turn's authority comes from», «Builder clarification is
durable HITL», «Hết hạn mức là một câu hỏi»), `docs/api.md` (vòng chỉ thêm tệp kiểm dưới `apps/api/test`, không chạm
module), `docs/telemetry.md` (không sự kiện mới; `NODE_ENV=test` không gửi gì). `docs/ai-ux.md`: câu chữ thông báo
không đổi.
