# Nối Zalo cho người mới — thiết kế

Vòng 2 của [lộ trình Zalo](../../plan/lo-trinh-zalo.md). Hạng T3: chạm
`packages/db/prisma` (cột mới của `AppSetting`) và module `workspace` của API.

## Vì sao

Lái thử bot thật ngày 2026-09-23 cho thấy ba chỗ người mới vấp:

1. Quản trị viên phải sửa `.env` trên máy chủ và khởi động lại tác tử để bật Zalo.
   Hướng dẫn trên màn còn chỉ sai chỗ tạo bot (`bot.zaloplatforms.com`), và chủ kho
   đã dán nhầm Secret Token thay cho Bot Token.
2. Người dùng thấy tên bot là `account_name` (`bot.uipSwwnr`), trong khi tìm bot
   trong Zalo phải gõ `display_name` («Bot OneHub»).
3. Nối xong không có cách nào biết nhắc có tới hay không, trước 08:30 sáng hôm sau.

Vòng 1 để lại hai mục: Ngoài-3 (tin gặp lỗi giữa chừng mất hẳn, vì đã đánh dấu đã
thấy mà vẫn trả 200) và Ngoài-4 (trang báo bot sống chỉ theo `getMe`, dù webhook
chưa đăng ký thì không tin nào về).

## Quyết định đã chốt (chủ kho, 2026-09-24)

- Token lưu **chữ trơn** trong `AppSetting`, như khoá nghiên cứu. Chỉ quản trị
  viên đặt được (`canManageConnections`).
- **Giữ mã 6 số.** Bỏ nối đảo chiều và mã QR: Zalo Bot API không có deep link,
  QR hay start payload; nối đảo chiều bắt người mới đăng nhập CRM trên điện thoại.
- Cài `@reui/stepper` vào `packages/ui` ở S3 (dry-run sạch: một tệp mới, phụ thuộc
  `radix-ui` đã có). Block ReUI Pro (settings-8, settings-12) chỉ là tham chiếu bố
  cục: cài thẳng sẽ ghi đè 5–7 tệp đã tuỳ biến và thêm 18 biến màu.

## Kiến trúc

Trí khôn sống ở tác tử (`docs/api.md`): API không gọi Zalo. API kiểm quyền rồi
chuyển câu hỏi sang tác tử qua cầu `AGENT_BRIDGE_SECRET`, theo khuôn
`ResearchKeyService` → `POST /internal/crm/verify-key`.

```
Trang kết nối ──tRPC zalo.luuBot──▶ API (quản trị?) ──bridge──▶ tác tử POST /internal/zalo/bot
                                                                  ├─ getMe (token)
                                                                  ├─ sinh khoá webhook
                                                                  ├─ setWebhook(<gốc tác tử>/zalo/webhook) nếu https
                                                                  └─ ghi AppSetting (token, khoá, tên, url, lý do)
Trang thông báo ─tRPC zalo.guiThu─▶ API (thành viên) ───bridge──▶ tác tử POST /internal/zalo/gui-thu
                                                                  └─ kenhSeDungCua → guiZalo | Slack
```

Tác tử **tự ghi** token và khoá vào `AppSetting` (khác khoá nghiên cứu, nơi API
ghi): khoá webhook phải là đúng chuỗi đã gửi cho `setWebhook`, nên nơi sinh khoá
cũng là nơi lưu nó, và khoá không đi qua API. API trả về cho màn một bản đã che.

Gốc URL cho webhook lấy từ chính yêu cầu cầu nối gửi tới tác tử (tức `AGENT_URL`
của API). Gốc không phải `https:` thì không gọi `setWebhook`: token vẫn lưu, lý do
ghi là `can-https`, và màn chỉ lệnh `zalo:poll` cho bot thử tại máy.

### Dữ liệu — `migration` mới trên `AppSetting`

| Cột | Kiểu | Nghĩa |
|---|---|---|
| `zaloBotToken` | `String?` | Bot Token đặt trên màn. Rỗng thì tác tử dùng `ZALO_BOT_TOKEN`. |
| `zaloWebhookSecret` | `String?` | Khoá sinh máy (32 byte, hex) gửi cho `setWebhook`. Rỗng thì dùng `ZALO_WEBHOOK_SECRET`. |
| `zaloWebhookUrl` | `String?` | URL Zalo đang giao tin tới, theo `setWebhook` lúc lưu và `getWebhookInfo` mỗi nhịp. |
| `zaloWebhookLyDo` | `String?` | `can-https` hoặc `zalo-tu-choi` khi lần đăng ký gần nhất không thành. Đọc qua schema Zod. |

`zaloBotName` giữ tên cột, đổi nguồn sang `display_name`.

### Tác tử

- `zalo-api.ts`: `zaloToken()` và `zaloKhoaWebhook()` thành hàm async đọc
  `AppSetting` trước, biến môi trường sau. Sáu chỗ gọi (webhook, `kiemBot`,
  `pollZalo`, nhắc buổi sáng, `zalo:webhook`, `zalo:poll`) đổi theo.
- `kiemBot`: sau `getMe` gọi thêm `getWebhookInfo`; có URL thì ghi
  `zaloWebhookUrl`, trả 404 thì ghi null. Lỗi khác giữ nguyên giá trị cũ.
- `channels/zalo.ts` thêm hai route cầu nối, cùng luật `authorised()` của `crm.ts`:
  - `POST /internal/zalo/bot {token?}` — thiếu token thì đăng ký lại bằng token
    đang lưu. Trả `{outcome: "valid"|"invalid", tenBot?, webhook: "da-dang-ky"|"can-https"|"zalo-tu-choi", reason?}`.
  - `POST /internal/zalo/gui-thu {userId}` — gửi một tin thử qua kênh
    `kenhSeDungCua` chọn. Trả `{kenh: "zalo"|"slack"|null, lech}`.
- `zalo-nhan.ts`, Ngoài-3: hàng `ZaloUpdateSeen` và hiệu ứng DB của tin (nối, ghi
  sai) commit trong **một** giao dịch. DB lỗi thì giao dịch lui, không có hàng
  seen, webhook trả **500** để Zalo gửi lại. Hiệu ứng DB xong mà gửi câu trả lời
  hỏng thì vẫn là xong: trả 200, ghi một dòng log `message_id`.
- Người đã nối nhắn chữ không phải mã: bot trả «Bạn đã nối với <tên CRM>. Nhắc
  đến lúc 08:30.» (giờ lấy từ `NHAC.gio`), thay cho câu hướng dẫn.
- `parseZaloGetMe` lấy `display_name`. Zalo giả trong test trả cả hai trường như
  `getMe` thật.

### API

- `zalo.luuBot({token?})`: `canManageConnections` → không đạt thì
  `ForbiddenException`, không gọi tác tử. Token có mặt phải khớp
  `^\d+:[A-Za-z0-9_-]+$`, không khớp thì `BadRequest` nói rõ Bot Token có dạng
  `<số>:<chuỗi>`, khác Secret Token — không gọi tác tử. Không có cầu nối thì
  `BadRequest` «tác tử chưa nối được».
- `zalo.guiThu()`: thành viên nào cũng gọi được, chỉ gửi cho chính mình.
- `zalo.xuong` thêm: `canManage`, `nguonToken: "man-hinh"|"env"|null`,
  `goiToken` (4 ký tự cuối), `webhook: {trangThai: "da-dang-ky"|"can-https"|"chua-dang-ky", url}`.
  API không đọc biến môi trường của tác tử: bot sống mà `zaloBotToken` rỗng nghĩa
  là token nằm trong `.env`.
- `workspace.removeMember`: cùng giao dịch, xoá `ZaloLink`, `ZaloLinkCode`,
  `NotificationPreference` của người bị gỡ.

### Ba lỗi chữ của lái thử

- Nhãn trạng thái bị cắt (`Not conne…`): bỏ bề rộng cố định `w-20`.
- «Zalo: Zalo chưa bật cho xưởng»: câu lý do khoá không lặp tên kênh đã in phía
  trước, ở cả hai ngôn ngữ; áp luôn cho dòng Slack.
- Tên bot: `display_name` (mục trên).

## Phép đo

- Agent (`apps/agent/test/noi-zalo-cho-nguoi-moi.integration.spec.ts`): Zalo giả
  của vòng 1 thêm `getWebhookInfo`, `setWebhook`, `display_name`; ca DB lỗi bằng
  cách làm hỏng giao dịch có chủ đích.
- API (`apps/api/test/noi-zalo-cho-nguoi-moi.spec.ts`): quyền, dạng token, cầu nối
  giả, gỡ thành viên đọc lại từ DB.
- Màn (`apps/app/test/noi-zalo-cho-nguoi-moi.dom.tsx`) và một `ui-check` chụp màn
  thật ở 1440 và 375.
- Hai tệp test đã ký của vòng trước (`nhac-qua-zalo.integration.spec.ts`,
  `zalo-qua-webhook.integration.spec.ts`) không đổi một dòng và vẫn xanh.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ (quản trị): Kết nối › Zalo → đọc ba bước tạo bot → dán Bot Token → Lưu →
  thấy tên bot, «Nhận tin qua webhook», danh sách người (điểm ra: nút «Nối Zalo của tôi»).
- Suôn sẻ (người mới): Thông báo của bạn → bước 1 tìm «Bot OneHub» trong Zalo →
  bước 2 bấm «Nối Zalo» lấy mã → bước 3 nhắn mã → trang chuyển «Đã nối» → «Gửi thử
  nhắc ngay» → thấy tin trong Zalo (điểm ra: Zalo).
- Biên: thành viên thường mở trang kết nối (xem, không nhập); token nằm trong `.env`;
  tác tử không https; người đã nối nhắn chữ cho bot.
- Lỗi & quay lại: token sai dạng → lỗi dưới ô, ô giữ chữ đã dán, focus về ô; Zalo từ
  chối token → cùng chỗ, câu khác; webhook rơi → cảnh báo + «Đăng ký lại»; gửi thử
  hỏng → dòng lỗi dưới nút, bấm lại được.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Kết nối › Zalo | Bật bot cho cả xưởng và xem ai đã nối | Kết nối / Thông báo của bạn |
| Thông báo của bạn | Nối Zalo của mình và thử nhận nhắc | Cài đặt, trang kết nối / Zalo |
| Trong Zalo | Nhắn mã; biết mình đã nối | Bước 3 / — |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ket-noi-chua-bat | Kết nối › Zalo | Ba bước có số: «Tạo bot trong Zalo» (Zalo › OA «Zalo Bot Manager» › Tạo bot) · «Chép Bot Token» (dạng `<số>:<chuỗi>`, khác Secret Token) · «Dán vào đây» ô mật khẩu + nút Lưu | Dán token, bấm Lưu |
| ST-ket-noi-dang-luu | Kết nối › Zalo | Nút «Đang kiểm…» bị khoá, ô giữ nguyên | Chờ |
| ST-ket-noi-token-sai | Kết nối › Zalo | Lỗi dưới ô «Đây không phải Bot Token. Bot Token có dạng 1234567890:AbC…, khác Secret Token.» hoặc «Zalo không nhận token này.» | Dán lại |
| ST-ket-noi-song | Kết nối › Zalo | Tên bot + «Nhận tin qua webhook» + token `••••wxyz` + «Thay token» + danh sách x/y đã nối | «Nối Zalo của tôi» |
| ST-ket-noi-can-https | Kết nối › Zalo | Cảnh báo «Tin nhắn tới bot chưa về CRM: tác tử chưa có địa chỉ https. Khi thử tại máy, chạy `zalo:poll`.» | Chạy lệnh / triển khai |
| ST-ket-noi-chua-webhook | Kết nối › Zalo | Cảnh báo «Zalo chưa giao tin nhắn về CRM.» + nút «Đăng ký lại» | Bấm Đăng ký lại |
| ST-ket-noi-env | Kết nối › Zalo | «Token đặt trong .env của máy chủ. Dán token ở đây để thay.» | Để nguyên / thay |
| ST-ket-noi-thanh-vien | Kết nối › Zalo | Trạng thái + danh sách, không có ô token; «Chỉ quản trị viên thay được bot.» | «Nối Zalo của tôi» |
| ST-ket-noi-im | Kết nối › Zalo | Cảnh báo cũ «Bot không trả lời từ …» | Báo quản trị |
| ST-thong-bao-chua-noi | Thông báo của bạn | Ba bước có số, bước 1 ghi tên bot thật «Bot OneHub», bước 2 có nút «Nối Zalo» | Bấm Nối Zalo |
| ST-thong-bao-ma-cho | Thông báo của bạn | Bước 1–2 đã xong, bước 3 đang mở: mã 6 số + «Chép mã» + giờ hết hạn | Nhắn mã |
| ST-thong-bao-ma-het-han | Thông báo của bạn | «Mã đã hết hạn.» + «Tạo mã mới» ở bước 2 | Tạo mã mới |
| ST-thong-bao-da-noi | Thông báo của bạn | «Đã nối · <tên Zalo>» + «Gửi thử nhắc ngay» + «Gỡ» | Gửi thử |
| ST-thong-bao-gui-thu-xong | Thông báo của bạn | Toast «Đã gửi tin thử qua Zalo.» (hoặc Slack) | Mở Zalo |
| ST-thong-bao-gui-thu-loi | Thông báo của bạn | Dòng lỗi dưới nút «Chưa gửi được tin thử. Thử lại.» | Bấm lại |
| ST-thong-bao-zalo-tat | Thông báo của bạn | «Zalo chưa bật cho xưởng này…» (không lặp chữ Zalo ở khối kênh) | Nhờ quản trị |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ô Bot Token: `type="password"`, `autocomplete="off"`, `spellCheck={false}`, không
  chặn dán; kiểm dạng ở máy khách trước khi gửi, kiểm lại ở API.
- Nút Lưu bật cho tới khi yêu cầu bắt đầu; lúc chạy ghi «Đang kiểm…».
- Lỗi dưới ô có `aria-live="polite"`; lỗi thì focus về ô.
- Token không bao giờ về trình duyệt; màn chỉ nhận 4 ký tự cuối.
- «Gửi thử» khoá trong lúc chạy; xong hiện toast, lỗi hiện dòng dưới nút.
- Tên bot, tên người, tên Zalo đánh dấu `translate="no"`; nhãn trạng thái không bị cắt ở 375.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Ô token + Lưu + gợi ý che | ghép | Chép khuôn `settings/research-key.tsx` (Input, Button, toast) |
| Ba bước có số | dùng (sau khi cài) | `@reui/stepper` cài vào `packages/ui` ở S3; proto tạm dùng danh sách có số |
| Trạng thái webhook | dùng | `StatusIndicator` + `Alert` sẵn có; bố cục tham chiếu block ReUI settings-8 |
| Khối kênh, gỡ, mã | dùng | Thành phần vòng `nhac-qua-zalo` giữ nguyên |
| Proto | mở rộng | Module mới `noi-zalo-cho-nguoi-moi` nhập lại màn của `nhac-qua-zalo`, không dựng lại |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: wizard
Căn cứ: hai màn đều là «làm theo thứ tự một lần» (tạo bot → chép → dán; tìm bot →
lấy mã → nhắn). Tham chiếu có tên: onboarding-2 (stepper dọc) của ReUI và luồng
BotFather của Telegram; wizard nằm trong trang cài đặt sẵn có chứ không mở màn riêng.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài phạm vi

- Nút «Gỡ bot», mã hoá token, giới hạn tần suất gửi thử, mã QR, báo quản trị khi
  webhook rơi.
- Trả lời tin nhắc, hỏi CRM qua Zalo (vòng 3, 4).
- Chạy `migration` ở production, đặt bot công ty (hàng T).
