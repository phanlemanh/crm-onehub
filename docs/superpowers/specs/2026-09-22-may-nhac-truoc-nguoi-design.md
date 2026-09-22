# Máy nhắc trước người — design

Ngày 2026-09-22 · hồ sơ `_acceptance/may-nhac-truoc-nguoi/` · hạng T3 (bảng
`OnboardingWatch` chạm `packages/db/prisma`) · lượt 3 của
`docs/plan/lo-trinh-dieu-phoi-30-ngay.md` · Cổng Đáng ký build 2026-09-22.

## 1. Bối cảnh và phạm vi

Lượt 1 cho kế hoạch tay, lượt 2 đưa kế hoạch tới chỗ người đứng. Mọi thứ vẫn là
kéo: không mở CRM thì không biết bước sắp hạn hay kế hoạch đang im. Ngưỡng im
`ONBOARDING.stale.warnAfterMs` đã khai mà không ai đọc; kho không có bảng thông
báo và không gửi được thư; Slack gửi được tin riêng nhưng chỉ qua phiên bản tác
tử có một nơi nhận cố định. Chi tiết và dẫn chứng: `opportunity.md`.

Lượt này: mỗi sáng 08:30 giờ Việt Nam, mỗi người có việc nhận **một** tin Slack
riêng gom bốn loại việc (bước quá hạn, bước sắp hạn, kế hoạch im, mốc ngày 7 ·
14 · 30); thẻ Tasks trên tổng quan hiện cùng danh sách cho người không nhận được
Slack; ai trong xưởng cũng tự theo dõi được một kế hoạch.

Bốn chốt của brainstorm (sổ quyết định): một tin tổng hợp mỗi sáng thay vì mỗi
việc một tin · thẻ Tasks là bản trong app của cùng danh sách · theo dõi do người
tự bấm, không gắn tự động · theo dõi là một bảng, không dựng lại từ vết.

## 2. Dữ liệu và vết

- Bảng mới `OnboardingWatch`: `id`, `planId`, `userId`, `createdAt`; khoá duy
  nhất (`planId`, `userId`); `onDelete: Cascade` về `OnboardingPlan` và `User`.
  Một `migration`.
- Vết `PLAN_CHANGE` thêm hai loại trong `packages/validation/src/onboarding-activity.ts`:
  `theoDoi.bat`, `theoDoi.tat` (người tạo vết là người bấm).
- Không bảng thông báo. Mỗi lần nhắc là một hàng `AgentTask` loại
  `nhac-ke-hoach`, `subject` = `user:<userId>:<YYYY-MM-DD giờ VN>`; hàng đó là
  sổ «đã nhắc chưa». `payload` chỉ giữ mã kế hoạch, mã bước và loại nhắc —
  không tên, không nội dung (Luật 91/2025/QH15, tra lại hiệu lực ở S3).
- `outcome` của hàng: `da-gui` · `khong-slack` · `khong-khop` · `khong-viec`,
  kèm số dòng đã gửi.

## 3. Hàm dùng chung `viecCanNhac`

Sống ở `packages/db/src/onboarding-nhac.ts`, vì cả tác tử (lượt quét) lẫn API
(thẻ Tasks) cần cùng một câu trả lời. Đây là truy vấn có ngưỡng, không phải
suy luận — cùng loại với `imNgay` mà API đã tính cho danh mục.

`viecCanNhac(db, { now, userId? })` → `Map<userId, ViecNhac[]>`, mỗi phần tử:
`{ loai, planId, stepId?, companyName, nhan, goiY, han?, soNgay? }` với `loai` thuộc

| Loại | Điều kiện | Người nhận |
|---|---|---|
| `buoc-qua-han` | bước chưa xong, kế hoạch đang chạy, `dueAt` < đầu ngày VN | người được giao |
| `buoc-sap-han` | bước chưa xong, kế hoạch đang chạy, `dueAt` trong `NHAC.sapHanNgay` ngày | người được giao |
| `ke-hoach-im` | kế hoạch đang chạy, số ngày im ≥ `NHAC.imSauNgay` | người cầm trịch + người theo dõi |
| `moc-ngay` | ngày thứ của kế hoạch ∈ `NHAC.moc` | người cầm trịch + người theo dõi |

Số ngày im tính như `imNgay` của danh mục: `updatedAt` mới nhất của bước, không
có thì `startedAt`. Chỉ thành viên còn trong xưởng mới là người nhận.

`goiY` (gợi ý — `CONTEXT.md` cấm «việc cần làm» cho nghĩa này) theo luật, việc đầu tiên khớp thắng: (1) có bước chưa giao
→ «Giao bước X»; (2) có bước quá hạn → «Bước X quá hạn N ngày — hỏi Z»; (3) còn
lại → «Bước kế: X, hạn <ngày>». Loại `buoc-*` thì `goiY` là chính bước đó.

Hằng `NHAC` trong cùng module, một chỗ duy nhất:
`{ gio: { gio: 8, phut: 30 }, muiGio: "Asia/Ho_Chi_Minh", sapHanNgay: 3, imSauNgay: 7, moc: [7, 14, 30], tran: 10 }`.
`ONBOARDING.stale` bị gỡ khỏi `onboarding-config.ts`; `imNgay` của danh mục
không đổi cách tính.

## 4. Tác tử

- **Lượt quét** `lenLichNhac` (`apps/agent/agent/lib/nhac-ke-hoach.ts`) chạy
  trong `schedules/dispatch.ts` cạnh `sweepBlankFacts` — không lịch mới. Trước
  08:30 giờ VN: không làm gì. Từ 08:30 tới hết ngày: gọi `viecCanNhac`, với mỗi
  người có việc mà chưa có hàng `nhac-ke-hoach` cho ngày đó, ghi một hàng
  (`dueAt` = bây giờ). Idempotent: quét lại trong ngày không ghi thêm.
- **Làn trực tiếp**: `nhac-ke-hoach` vào `TASK_KINDS` và `DIRECT_KINDS`
  (`packages/db/src/agent-tasks.ts`). Chạy: tính lại `viecCanNhac` cho đúng
  người đó (danh sách có thể đổi từ lúc ghi hàng) → rỗng thì `khong-viec` →
  `slackConnected()` sai thì `khong-slack` → không có `SlackMemberMatch` thì
  `khong-khop` → còn lại gửi một tin qua `conversations.open` + `chat.postMessage`
  với token của xưởng, rồi `da-gui`. Lỗi Slack đi luật thử lại và
  `retireExhausted` sẵn có. Gửi tuần tự, không song song.
- **Đường mở**: `APP_URL` (khai trong `.env.example`, tác tử đọc tuỳ chọn) +
  `/<slug xưởng>?record=plan:<id>`. Vắng `APP_URL` → tin vẫn gửi, không có
  đường mở; không lỗi.

## 5. API

- `dashboard.summary` thêm `keHoachCanDeY`: `viecCanNhac(db, { now, userId })`
  lọc hai loại `ke-hoach-im` và `moc-ngay`, áp trần `NHAC.tran`. Hai loại bước
  đã có ở `mySteps` của lượt 2 và giữ nguyên.
- `onboarding.watch({ planId })` / `onboarding.unwatch({ planId })`: người đăng
  nhập tự bật/tắt; bật hai lần không đẻ hàng thứ hai và không ghi vết thứ hai;
  mỗi lần đổi thật ghi một vết `theoDoi.*` trong cùng giao dịch.
- `planById` thêm `dangTheoDoi: boolean` và `nguoiTheoDoi: {id, name}[]`.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: 08:30 tin Slack riêng → bấm «mở kế hoạch» → app mở tổng quan với sheet kế hoạch chồng lên (điểm ra: sheet kế hoạch, làm việc như lượt 1).
- Suôn sẻ (trong app): tổng quan → thẻ Tasks có dòng «Kế hoạch im» / «Mốc ngày» → bấm dòng → sheet kế hoạch.
- Suôn sẻ (theo dõi): sheet kế hoạch → «Theo dõi» → nút thành «Đang theo dõi», số người theo dõi +1 → sáng hôm sau nhận nhắc im và mốc của kế hoạch đó.
- Biên: người không có Slack, hoặc xưởng chưa nối Slack → không tin nào, thẻ Tasks vẫn đủ; ngày không có việc → không tin; hơn 10 việc → 10 dòng + «và N việc nữa».
- Lỗi & quay lại: bấm theo dõi lỗi → nút trả về trạng thái cũ + thông báo «Không lưu được theo dõi» + thử lại được ngay; tải tổng quan lỗi → trạng thái lỗi sẵn có của thẻ.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Tin Slack buổi sáng | cho biết hôm nay tôi có việc 30 ngày nào | Slack / sheet kế hoạch |
| Thẻ Tasks (tổng quan) | liệt việc cần tôi để ý hôm nay | trang tổng quan / sheet kế hoạch |
| Nút theo dõi (sheet kế hoạch) | cho tôi tự nhận nhắc về kế hoạch không phải của mình | thanh đầu sheet kế hoạch / tại chỗ |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-slack-du | Tin Slack | lời chào + các nhóm Quá hạn · Sắp hạn · Kế hoạch im · Mốc ngày, mỗi dòng «công ty · gợi ý — mở kế hoạch» | bấm một dòng |
| ST-slack-tran | Tin Slack | 10 dòng + «và N việc nữa — mở tổng quan» | mở tổng quan |
| ST-slack-khong-duong | Tin Slack | như ST-slack-du nhưng không có liên kết (thiếu `APP_URL`) | mở CRM tay |
| ST-tasks-co-im | Thẻ Tasks | dòng «Kế hoạch im 9 ngày · Sunrise — Giao bước Mở tài khoản», màu cảnh báo, không ô tích | bấm mở kế hoạch |
| ST-tasks-co-moc | Thẻ Tasks | dòng «Ngày 14/30 · One Mount — 3/8 bước xong», không ô tích | bấm mở kế hoạch |
| ST-tasks-rong | Thẻ Tasks | trạng thái rỗng sẵn có của thẻ | không cần làm gì |
| ST-tasks-dang-tai | Thẻ Tasks | trạng thái đang tải sẵn có của thẻ | chờ |
| ST-tasks-loi | Thẻ Tasks | trạng thái lỗi sẵn có của thẻ | thử lại |
| ST-theodoi-chua | Nút theo dõi | «Theo dõi» | bấm để theo dõi |
| ST-theodoi-dang | Nút theo dõi | «Đang theo dõi» + số người theo dõi; di chuột thấy tên | bấm để bỏ |
| ST-theodoi-dang-gui | Nút theo dõi | nút khoá, giữ nhãn cũ | chờ |
| ST-theodoi-loi | Nút theo dõi | nhãn trở lại như trước + thông báo «Không lưu được theo dõi» | bấm lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Tin Slack theo ngôn ngữ của xưởng; tên công ty, tên bước, tên người giữ nguyên văn.
- Mô tả thẻ Tasks đếm cả hai loại mới: «2 quá hạn · 3 sắp hạn · 1 kế hoạch im».
- Nút theo dõi đi được bằng bàn phím, có `aria-pressed`; danh sách người theo dõi trong tooltip mang `translate="no"`.
- Khổ 375: dòng mới của thẻ Tasks xuống hai dòng như dòng bước, không tràn ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Card` + dòng bước của thẻ Tasks (lượt 2) | ghép | hai loại dòng mới cùng khuôn dòng bước, bỏ ô tích |
| `Button` `outline` + `Tooltip` của `/packages/ui` | dùng | nút theo dõi không cần biến thể mới |
| `RecordSheetFrame` `actions` | ghép | nút đứng cạnh menu ⋯ đã có của kế hoạch |
| Tin Slack (mrkdwn) | tạo | kênh mới, không có component UI; khuôn chữ ở một module tin nhắn |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: bảng-điều-khiển (dashboard-first)
Căn cứ: không mở màn mới — hai loại dòng nối vào thẻ Tasks của tổng quan (lượt 2 đã chọn tổng quan là chỗ «việc của tôi»); tin Slack là bản đẩy của cùng danh sách. Luồng hiển nhiên, không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## 6. Kiểm thử

- `viecCanNhac`: ma trận fixture viết trước trên DB thật — bước đã xong, kế
  hoạch đã đóng, bước chưa giao, người đã rời xưởng không sinh nhắc; mỗi loại
  sinh đúng người nhận; biên `sapHanNgay`/`+1`, im 6/7 ngày, ngày 13/14/15, đầu
  ngày giờ VN lúc 00:30 và 23:30.
- Lượt quét: trước 08:30 0 hàng; sau 08:30 đúng một hàng mỗi người có việc; quét
  lại trong ngày 0 hàng mới; sang ngày mới thêm hàng.
- Làn gửi: Slack giả ghi lời gọi — đúng người Slack, mỗi dòng đúng
  `?record=plan:<id>`; `khong-slack` / `khong-khop` không có lời gọi nào;
  `outcome` đọc lại từ DB.
- Theo dõi: bật → một hàng + một vết (đọc lại DB); bật lần hai → không thêm;
  tắt → hết hàng + một vết; người theo dõi nhận `ke-hoach-im`/`moc-ngay`, không
  nhận `buoc-*`.
- Thẻ Tasks và nút theo dõi: dom test (khung giả tRPC của lượt 2), payload màn
  gửi đúng khuôn máy chủ nhận; ảnh 1440 và 375.
- Đường đo: một câu SQL số ngày im trung vị của kế hoạch đang chạy và tỷ lệ bước
  tới hạn đã nhận nhắc được xong đúng hạn, chạy trên vết do chính thủ tục của
  kho ghi.

## 7. Ngoài phạm vi

- Thư — cần `gmail.send` và đường gửi mới trong `mailbox`, T3 riêng.
- Leo thang lên quản lý; nhắc thẳng cho đối tác.
- Chuông thông báo trong app.
- Người tự chọn giờ nhắc hay tắt từng loại nhắc — lượt này giờ chung cả xưởng;
  người không muốn thì tắt tiếng bot. Nếu phiên nghiệm thu thấy người tắt tiếng
  nhiều, lượt sau làm tắt riêng.

## 8. Rủi ro và giả định

- OneHub đã nối Slack và phần lớn người được giao khớp Slack (giả định 1 của
  `opportunity.md`) — sai thì chỉ còn thẻ Tasks.
- Giới hạn tần suất của Slack khi xưởng lớn — cỡ hiện tại vài chục tin mỗi sáng,
  gửi tuần tự.
- Múi giờ: mọi «ngày» trong lượt này là ngày giờ VN, không phải ngày UTC của
  máy chủ; lượt 2 tính `mySteps` theo ngày UTC — hai cách đếm có thể lệch một
  ngày quanh nửa đêm, ghi thành một biên của bộ kiểm.
