---
schema_version: 1
slug: may-nhac-truoc-nguoi
feature: Máy nhắc thay người canh — bước sắp tới hạn nhắc người được giao, kế hoạch im quá ngưỡng nhắc người cầm trịch kèm việc cần làm, tới mốc ngày 7 · 14 · 30 nhắc kiểm, người theo dõi nhận cùng nhắc
owner: phanlemanh@gmail.com
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit:
  disposition: archive
---

## Vấn đề & ai gặp

Lượt 1 (`ke-hoach-la-mot-ban-ghi`, #77) cho kế hoạch tay. Lượt 2
(`moi-phia-deu-thay-ke-hoach`, #79, `7442c667`) đưa kế hoạch tới chỗ người đứng:
tab ở sheet Công ty, bước của tôi trong thẻ Tasks, lọc theo người được giao.
Nhưng mọi thứ vẫn là **kéo**: người phải mở CRM mới thấy. Đối chiếu code ngày
2026-09-22:

- `ONBOARDING.stale.warnAfterMs` (7 ngày, `apps/api/src/onboarding/onboarding-config.ts:7-8`)
  được khai nhưng không nơi nào đọc. Số ngày im `imNgay` chỉ được tính để hiện
  trong danh mục (`onboarding-danh-muc.ts:106-127`, lấy `updatedAt` mới nhất của
  bước), không ai được báo khi nó vượt ngưỡng.
- Không có mô hình thông báo nào: không bảng `Notification`, không chuông trong
  app. Hệ thống không gửi được thư cho thành viên — mailbox chỉ đọc
  (`gmail.readonly`, `packages/auth/src/scopes.ts:14`), không có đường gửi nào.
- Slack thì có: tác tử đã gửi được tin nhắn riêng cho một người
  (`run-runtime.ts:593-627`, `conversations.open` rồi `chat.postMessage`), và
  bảng `SlackMemberMatch` nối người CRM với người Slack theo email
  (`slack-people.ts:85-118`). Nhưng đường gửi đó gắn với một phiên bản tác tử đã
  duyệt có **đúng một** nơi nhận cố định (`run-runtime.ts:1024-1051`) — không
  dùng được để nhắn nhiều người khác nhau.
- Tác tử đã có nhịp quét mỗi phút (`apps/agent/agent/schedules/dispatch.ts`,
  cron `* * * * *`) và hàng việc `AgentTask` có chống trùng theo `kind` +
  `subject` (`agent-trigger.service.ts:466`). Chưa có loại việc nào về kế hoạch.
- Không có khái niệm «theo dõi»: người không cầm trịch, không được giao bước thì
  không có cách nào nhận tin về một kế hoạch.

**Người gặp:** người được giao bước (không mở CRM thì không biết bước sắp hạn),
người cầm trịch (kế hoạch im một tuần mà không ai nói), quản lý và người quan
hệ đối tác (muốn theo một kế hoạch không phải của mình).

Lượt 3 của lộ trình `docs/plan/lo-trinh-dieu-phoi-30-ngay.md`.

## Phạm vi đề xuất

Một câu: *«Tôi không phải mở danh mục mỗi sáng: sắp tới hạn, im quá lâu, tới mốc
— máy nhắc đúng người kèm việc cần làm.»*

- Nhịp quét của tác tử tìm ba loại việc và ghi mỗi lần nhắc thành một hàng
  `AgentTask` (chống trùng theo kế hoạch/bước + loại nhắc + ngày), nên cùng một
  điều không bị nhắc hai lần:
  - bước chưa xong tới hạn trong N ngày → nhắc người được giao;
  - kế hoạch đang chạy im quá `warnAfterMs` → nhắc người cầm trịch, kèm việc cần
    làm sẵn («giao bước X», «bước Y quá hạn 3 ngày»);
  - kế hoạch tới ngày 7 · 14 · 30 → nhắc người cầm trịch kiểm tiến độ.
- Kênh: tin nhắn Slack riêng qua kết nối Slack của xưởng và `SlackMemberMatch`.
  Xưởng chưa nối Slack, hoặc người chưa khớp được Slack → không gửi, không lỗi
  (theo nếp `capabilities.ts`), và việc đó vẫn hiện trong thẻ Tasks của lượt 2.
- Mỗi nhắc có đường mở đúng `?record=plan:<id>`.
- Theo dõi: nút «Theo dõi» trên sheet kế hoạch; người theo dõi nhận các nhắc về
  kế hoạch im và mốc ngày.
- Mọi ngưỡng (số ngày trước hạn, ngưỡng im, các mốc) vào `onboarding-config.ts`.

**Hạng dự kiến: T3 — cần chủ kho quyết ở Cổng Đáng hoặc Cổng Phạm vi.** Chỗ
theo dõi phải được lưu ở đâu đó:
- (a) bảng mới `OnboardingWatch` — rõ ràng, truy vấn rẻ, nhưng chạm
  `packages/db/prisma/**` nên là T3 (thêm Cổng 1.5 duyệt kế hoạch thi công);
- (b) không đổi schema: lưu bật/tắt theo dõi thành vết `PLAN_CHANGE` và dựng lại
  danh sách người theo dõi từ vết — giữ T2, nhưng mỗi lần quét phải đọc lại vết,
  và «đang theo dõi hay không» thành một phép tính thay vì một hàng.
Máy nghiêng về (a): theo dõi là trạng thái, không phải sự kiện. Nếu cắt hẳn theo
dõi ra lượt sau thì phần còn lại là T2.

Kênh thư **không** làm ở lượt này: gửi thư cần thêm quyền `gmail.send` ở
`packages/auth` và đường gửi mới trong `mailbox` — cả hai là T3, và phải hỏi lại
từng người dùng đã nối Gmail.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Xưởng OneHub đã nối Slack, và phần lớn người được giao bước khớp được Slack qua email | Nhắc không tới ai; tính năng chỉ còn là thẻ Tasks của lượt 2 | Đếm trên production: số người được giao bước có hàng `SlackMemberMatch` trên tổng số người được giao | Chưa thử |
| 2 | Tin nhắn riêng trên Slack là chỗ người bộ phận thực sự đọc | Tin nằm trong Slack không ai mở, số ngày im không giảm | Hỏi mỗi trưởng bộ phận một câu: tin Slack riêng từ bot có được đọc trong ngày không | Chưa thử |
| 3 | Mỗi ngày một lần là đủ cho nhắc sắp hạn; nhắc dày hơn thành tiếng ồn | Người tắt tiếng bot, mất luôn kênh | Chạy một tuần với một nhắc/người/ngày, đếm số người tắt tiếng hoặc phàn nàn | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] Khi máy nhắc thay người canh, kế hoạch có bớt nằm im không — hay người vẫn chỉ động tay khi người cầm trịch đi hỏi?
- Kết quả nào là SỐNG: [đề xuất] hai tuần sau khi bật, đủ hai điều — (a) số ngày im trung vị của các kế hoạch đang chạy (tính như `imNgay`, từ `OnboardingStep.updatedAt` mới nhất) thấp hơn số đo cùng cách ở ngày bật; (b) trong các bước tới hạn trong kỳ mà người được giao đã nhận nhắc, ít nhất một nửa được đánh dấu xong trước hoặc đúng hạn.
- Kết quả nào là CHẾT: [đề xuất] hết hai tuần mà số ngày im trung vị không giảm, hoặc quá nửa số người nhận nhắc tắt tiếng bot hoặc xin ngừng nhắc.
- Timebox: [đề xuất] một ngày công cho một nhắc thật chạy từ đầu đến cuối (một bước sắp hạn → một tin Slack riêng có đường mở kế hoạch) trước Cổng Phạm vi; quá một ngày là đang xây, không phải hội tụ.

Ghi chú về số nền: lượt 1 mới lên `onehub` hôm nay, nên chưa có «hai tuần trước
lượt» để so như lộ trình gợi ý. Đề xuất đo số nền ngay ngày bật, rồi so sau hai
tuần.

## Kết quả prototype

Chưa dựng gì.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Lộ trình năm lượt, mục Lượt 3 | `docs/plan/lo-trinh-dieu-phoi-30-ngay.md` | triết-lý/logic | có | — |
| Nhịp quét và hàng việc `AgentTask` của tác tử | `apps/agent/agent/schedules/dispatch.ts`, `apps/agent/agent/lib/dispatch.ts` | triết-lý/logic | có — bắt buộc, trí khôn ở `apps/agent` | — |
| Gửi Slack riêng và bảng `SlackMemberMatch` | `apps/agent/agent/lib/run-runtime.ts`, `slack-people.ts` | triết-lý/logic | có | — |
| Nếp «thiếu khoá thì mất một khả năng, không ném» | `apps/agent/agent/lib/capabilities.ts` | triết-lý/logic | có | — |

## Cổng 0

- **decision = …** Căn cứ: …
- **disposition = archive** Căn cứ: chưa dựng prototype, `base_commit` để trống.
- **Ngưỡng UAT chốt cùng lúc ký:** …

## Thước đo thành công → ứng viên criterion

- Bước chưa xong tới hạn trong N ngày sinh đúng một nhắc cho người được giao; bước đã xong, kế hoạch đã đóng, bước chưa giao thì không.
- Kế hoạch im quá ngưỡng sinh đúng một nhắc cho người cầm trịch, kèm việc cần làm cụ thể; quét lại trong cùng ngày không sinh nhắc thứ hai.
- Kế hoạch tới ngày 7 · 14 · 30 sinh đúng một nhắc mốc.
- Xưởng không nối Slack hoặc người không khớp Slack: không gửi, không lỗi, hàng việc ghi lý do.
- Tin nhắn có đường mở đúng `?record=plan:<id>`.
- Bật theo dõi rồi đọc lại từ DB thấy người đó là người theo dõi; người theo dõi nhận nhắc im và nhắc mốc.

## Out of scope từ khám phá

- Nhắc qua thư — cần quyền `gmail.send` và đường gửi mới trong `mailbox`, cả hai T3.
- Leo thang tự động lên quản lý — lộ trình, Lượt 3.
- Nhắc thẳng cho đối tác — chân trời, cần cổng cho đối tác.
- Chuông thông báo trong app — không có mô hình thông báo; thẻ Tasks của lượt 2 là chỗ trong app.
