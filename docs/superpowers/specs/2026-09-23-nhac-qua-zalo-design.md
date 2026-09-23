# Nhắc qua Zalo — thiết kế

Ngày 2026-09-23 · hạng T3 · hồ sơ `_acceptance/nhac-qua-zalo/`

## 1. Vì sao

Nhắc buổi sáng (`may-nhac-truoc-nguoi`) chỉ đi qua Slack. Ở Việt Nam, đội OneHub
sống trên Zalo, còn Slack là nơi phải nhớ mà mở. Vòng này cho mỗi người nhận
đúng tin nhắc đó qua Zalo, và cho mỗi người tự chọn kênh nhận.

Phạm vi đã chốt ở brainstorm: chỉ tin **nội bộ** (hướng A). Không nhắn khách,
không nhóm Zalo, không tác tử đăng tin lên Zalo.

## 2. Ràng buộc từ Zalo

Đã tra `docs.zaloplatforms.com` ngày 2026-09-23:

- **Bot Platform** giống bot Telegram. Có một token dạng `<id>:<secret>`, gọi
  `POST https://bot-api.zaloplatforms.com/bot<TOKEN>/<method>`.
- Tin đến chỉ có `from.id`, `from.display_name` và `from.is_bot`. **Không có số
  điện thoại**, cũng không có cách xin số. Vì vậy ghép người bằng **mã liên
  kết**, không ghép bằng số.
- Bot chỉ nhắn được cho người đã từng nhắn nó, `chat.id` bằng `from.id`.
- `getUpdates` chỉ nhận một tham số `timeout`: không có `offset`, mỗi lần gọi
  trả **một** tin. Poll và webhook loại trừ nhau; vòng này dùng poll.
- Trần độ dài một tin: 2000 ký tự. Đây là `[GIẢ ĐỊNH]`, số lấy từ tài liệu
  OpenClaw.

## 3. Kiến trúc

```
app  ──tRPC──▶  api (NestJS, chỉ đọc/ghi hàng)  ──▶  Postgres  ◀──  agent (gọi Zalo)
                                                            ▲            │
                                                            └── getUpdates / sendMessage / getMe
```

- **Chỉ `apps/agent` gọi Zalo.** API không có vendor client (luật `docs/api.md`).
  API sinh mã, ghi ưu tiên kênh, xoá liên kết và đọc trạng thái — toàn việc trên
  hàng dữ liệu.
- **Token `ZALO_BOT_TOKEN` trong `.env` gốc.** Biến này tuỳ chọn: thiếu thì năng
  lực tắt, không có gì ném lỗi. Khai trong `.env.example`; API không đọc biến này
  nên không khai trong `env.validation.ts`. Thêm một dòng vào `capabilities.ts`.
- **Nhịp:** mỗi phút `schedules/dispatch.ts` chạy thêm `pollZalo()`, cạnh
  `lenLichNhac()`. Hàm gọi `getMe` một lần, rồi `getUpdates` lặp tối đa
  `ZALO.poll.toiDaMoiNhip` lần với `timeout` ngắn, dừng ở lần đầu không có tin.
  Tên bot và giờ poll cuối ghi vào `appSetting`.
- **API biết Zalo bật hay tắt bằng cách đọc `appSetting`, không đọc token.** Mỗi
  nhịp, nếu có token và `getMe` thành công, agent ghi `zaloBotName` và
  `zaloPolledAt`. Nếu không có token, agent ghi `zaloBotName = null`. Phía API,
  «Zalo bật» nghĩa là `zaloBotName` khác null. Có token mà `getMe` lỗi (ví dụ
  401, token bị thu hồi) thì agent cũng ghi `zaloBotName = null`, ghi lỗi, và
  không ném cả nhịp. Agent chết thì cờ vẫn là bật nhưng
  `zaloPolledAt` cũ đi, và trang kết nối báo «bot không trả lời».

## 4. Dữ liệu (migration T3)

| Bảng | Cột chính | Luật |
|---|---|---|
| `ZaloLink` | `crmUserId` unique · `zaloUserId` unique · `zaloDisplayName` · `linkedAt` | Một người một Zalo, một Zalo một người; `onDelete: Cascade` theo `User` |
| `ZaloLinkCode` | `crmUserId` unique · `codeHash` unique · `expiresAt` · `usedAt` | Mỗi người một mã sống; tạo mã mới là thay hàng |
| `ZaloLinkAttempt` | `zaloUserId` id · `failures` · `windowStartedAt` | Đếm lần nhập sai theo cửa sổ để chống dò mã |
| `ZaloUpdateSeen` | `messageId` id · `seenAt` | Chống xử lý trùng; hàng cũ hơn `ZALO.poll.giuDauMs` được tỉa |
| `NotificationPreference` | `userId` unique · `channel` enum `AUTO \| ZALO \| SLACK` | Người chưa có hàng thì hiểu là `AUTO` |
| `AppSetting` (+cột) | `zaloBotName` · `zaloPolledAt` | Để trang kết nối cho thấy bot đang sống |

- Mã là 6 chữ số, lưu **băm SHA-256** (`packages/db/src/zalo-lien-ket.ts`, API
  và agent dùng chung), sống 15 phút, dùng một lần.
- Mã chỉ 6 số nên phải chặn dò: một `zaloUserId` sai quá 5 lần trong một giờ thì
  bị bỏ qua cho tới hết cửa sổ.
- Mọi hằng số ở `ZALO_LIEN_KET` (`packages/db`: `ma.soChuSo`, `ma.songMs`,
  `doMa.toiDa`, `doMa.cuaSoMs`, `imSauMs` — ngưỡng báo bot im, 5 phút) và `ZALO`
  (agent: `poll.toiDaMoiNhip`, `poll.timeoutGiay`, `poll.giuDauMs`, `tranKyTu`),
  không viết số rời trong mã.
- Tin Zalo được phân tích ở biên bằng Zod: `packages/validation/src/zalo-update.ts`.
  Tin không đọc được thì báo lỗi thật, không nuốt thành «không có tin».

## 5. Liên kết người

1. Ở `/settings/notifications`, người bấm «Nối Zalo». API xoá mã cũ, sinh mã
   mới, rồi trả mã **một lần** kèm `expiresAt`.
2. Người nhắn đúng 6 số đó cho bot.
3. `pollZalo` đọc tin, chuẩn hoá (bỏ khoảng trắng), rồi băm và tìm mã.
   - Mã khớp, còn hạn, chưa dùng: upsert `ZaloLink`. Nếu Zalo đó đang nối người
     khác thì hàng cũ bị thay, và người kia đang ưu tiên `ZALO` thì về `AUTO`.
     Đánh dấu mã đã dùng. Bot trả lời «Đã nối với <tên CRM>. Mỗi sáng tôi gửi
     việc cần để ý ở đây.»
   - Mã sai, hết hạn hoặc đã dùng: tăng đếm sai, bot trả lời một câu hướng dẫn
     chung, không nêu tên ai.
   - Tin không phải 6 số: bot trả lời câu hướng dẫn, không tính là một lần sai.
   - Quá ngưỡng dò: không tra mã, không trả lời.
4. Nội dung tin người nhắn bot **không được lưu**. Chỉ lưu `messageId` để chống
   trùng và bộ đếm lần sai.
5. «Gỡ Zalo» xoá `ZaloLink`. Ưu tiên đang là `ZALO` thì về `AUTO`.

## 6. Chọn kênh và gửi

Hàm thuần `chonKenh(uuTien, zaloDuoc, slackDuoc)` ở
`packages/db/src/kenh-thong-bao.ts`, dùng chung cho agent (lúc gửi) và API (để
báo lệch trên trang). Hàm trả `{ kenh: "zalo" | "slack" | null, lech: boolean }`.

| Ưu tiên | Zalo được | Slack được | Kết quả |
|---|---|---|---|
| AUTO | có | * | zalo |
| AUTO | không | có | slack |
| ZALO | có | * | zalo |
| ZALO | không | có | slack, **lệch** |
| SLACK | * | có | slack |
| SLACK | có | không | zalo, **lệch** |
| * | không | không | null |

- «Zalo được» nghĩa là `appSetting.zaloBotName` khác null và người có `ZaloLink`;
  riêng agent còn đòi có `ZALO_BOT_TOKEN`, để phủ khoảng dưới một phút giữa lúc
  token bị gỡ và nhịp poll kế tiếp.
- Cả hai phía đọc cùng một hàm `kenhSeDungCua(db, userId)` trong
  `packages/db/src/kenh-thong-bao.ts`. Hàm này đọc ưu tiên, `ZaloLink`,
  `zaloBotName` và khớp Slack rồi gọi `chonKenh`. Trang và máy gửi vì thế không
  thể trả lời khác nhau cho cùng một trạng thái.
- «Slack được» nghĩa là xưởng đã nối Slack và người có `slackUserId` khớp.
- `AUTO` không bao giờ bị tính là lệch.

`chayNhac` đổi như sau. Thứ tự hiện có giữ nguyên, bước «hết việc →
`khong-viec`» vẫn đứng đầu:

- `kenh = zalo`: dựng tin bằng `dungTin(..., "tron")` rồi gọi `sendMessage`.
- `kenh = slack`: đường Slack như cũ.
- `kenh = null`: giữ `khong-slack` / `khong-khop` như hôm nay, để thước đo cũ
  không lệch.
- Zalo trả lỗi (HTTP ≠ 2xx hoặc `ok: false`): **ném lỗi**, hàng không đóng, không
  rơi sang Slack. Luật thử lại và `retireExhausted` sẵn có lo phần còn lại.
- Gửi xong thì `payload` thêm `kenh` và `lechKenh`. `outcome` giữ `da-gui:<n>`.

`dungTin` có thêm tham số khuôn `"slack" | "tron"`. Khuôn `tron`:

- không dùng `*đậm*` và không thoát HTML;
- đường dẫn in trần sau dấu « — »;
- cắt theo `ZALO.tranKyTu`. Mục bị cắt không vào `daGui`, và dòng «và N việc nữa»
  vẫn giữ.

Trạng thái liên kết của một người (thủ tục trạng thái cá nhân):

| Dữ liệu | Trạng thái trả về |
|---|---|
| có `ZaloLink` | đã nối + tên hiển thị |
| không liên kết, có mã chưa dùng và chưa hết hạn | mã đang chờ + `expiresAt` (không bao giờ kèm mã) |
| không liên kết, có mã đã hết hạn và chưa dùng | mã hết hạn |
| còn lại | chưa nối |

## 7. Trang

- **`/settings/notifications` — «Thông báo của bạn».** Đây là trang cá nhân đầu
  tiên trong Cài đặt, nên nhãn nói rõ «của bạn». Trang có hai khối:
  - **Zalo:** trạng thái chưa nối / mã đang chờ / đã nối, và nút tương ứng.
  - **Nhận nhắc việc qua:** nhóm nút chọn Tự động · Zalo · Slack, và dòng cảnh báo khi
    `chonKenh` báo lệch.
- **`/settings/connections/zalo` — trang kết nối.** Cho thấy năng lực, không có
  chỗ chỉnh cá nhân (`docs/connections.md`): bot đang bật hay tắt, tên bot, «trả
  lời lần cuối …», «x/y người đã nối», danh sách ai đã nối. Trang index Kết nối có
  thêm thẻ Zalo. Chưa có logo Zalo trong `brand-logos` thì `EntityLogo` hiện chữ
  viết tắt — đó là hành vi đúng, không phải chỗ trống.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Cài đặt › Thông báo của bạn → «Nối Zalo» → mã 6 số hiện kèm giờ hết
  hạn và tên bot → người nhắn mã cho bot trên điện thoại → bot trả lời «Đã nối với
  <tên>» → trong vòng một phút trang đổi sang «Đã nối · <tên Zalo>» (tự làm mới
  khi đang có mã chờ) → ô chọn Zalo mở khoá. Điểm ra: trang vẫn ở đó.
- Biên: bot chưa bật (thiếu token) → khối Zalo nói «Zalo chưa bật cho xưởng này»,
  không có nút Nối, lựa chọn Zalo bị khoá. Người chưa khớp Slack → lựa chọn Slack
  bị khoá kèm lý do.
- Lỗi & quay lại: mã hết hạn → «Mã đã hết hạn» + nút «Tạo mã mới». Lưu ưu tiên
  lỗi → ô chọn về giá trị cũ + «Không lưu được lựa chọn». Gỡ Zalo có hộp xác nhận;
  ưu tiên đang là Zalo thì hộp nói rõ «tin sẽ về Slack».

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Thông báo của bạn | Quyết mình nhận nhắc việc ở đâu | Thanh bên Cài đặt / ở lại |
| Kết nối › Zalo | Cho thấy Zalo của xưởng có đang chạy và ai đã nối | Trang Kết nối / quay lại Kết nối, hoặc sang «Thông báo của bạn» |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-thong-bao-dang-tai | Thông báo của bạn | Skeleton hai khối | Chờ |
| ST-thong-bao-zalo-tat | Thông báo của bạn | «Zalo chưa bật cho xưởng này. Nhờ quản trị viên bật.»; lựa chọn Zalo khoá | Chọn Tự động hoặc Slack |
| ST-thong-bao-chua-noi | Thông báo của bạn | «Chưa nối Zalo» + nút «Nối Zalo» | Bấm Nối Zalo |
| ST-thong-bao-ma-cho | Thông báo của bạn | Mã 6 số chữ lớn, «Nhắn mã này cho <tên bot> trên Zalo · hết hạn lúc 09:15» | Nhắn mã; hoặc «Tạo mã mới» |
| ST-thong-bao-ma-het-han | Thông báo của bạn | «Mã đã hết hạn» + «Tạo mã mới» | Tạo mã mới |
| ST-thong-bao-da-noi | Thông báo của bạn | «Đã nối · <tên Zalo>» + nút «Gỡ» | Chọn kênh / Gỡ |
| ST-thong-bao-lech | Thông báo của bạn | Cảnh báo: «Bạn chọn Zalo nhưng Zalo chưa dùng được — nhắc sáng mai sẽ qua Slack.» | Nối Zalo / đổi lựa chọn |
| ST-thong-bao-luu-loi | Thông báo của bạn | Ô chọn về giá trị cũ + «Không lưu được lựa chọn» | Thử lại |
| ST-ket-noi-zalo-tat | Kết nối › Zalo | «Chưa bật» + cách bật: đặt `ZALO_BOT_TOKEN` | Quản trị viên đặt token |
| ST-ket-noi-zalo-song | Kết nối › Zalo | Tên bot, «trả lời lần cuối 1 phút trước», «3/7 người đã nối», danh sách | Mở «Thông báo của bạn» |
| ST-ket-noi-zalo-im | Kết nối › Zalo | Như trên, nhưng lần poll cuối cũ hơn 5 phút → cảnh báo «Bot không trả lời từ …» | Kiểm tác tử |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Mã in theo nhóm «482 913», dễ đọc; nút sao chép cạnh mã; mã không bao giờ hiện
  lại sau khi rời trang (chỉ trả một lần).
- Khi đang có mã chờ, trang làm mới trạng thái mỗi 5 giây tới khi đã nối hoặc hết
  hạn. Không làm mới khi không có mã chờ.
- Lựa chọn kênh bị khoá có `aria-disabled` + dòng lý do đọc được bằng trình đọc
  màn hình. Tên hiển thị Zalo mang `translate="no"`.
- Khổ 375: hai khối xếp dọc, mã không tràn ngang.

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
|---|---|---|
| `ToggleGroup` (packages/ui) | dùng | Ba lựa chọn loại trừ, hiện đủ cả ba cùng lúc; một dòng mô tả dưới nói lựa chọn đang chọn làm gì — kho chưa có RadioGroup, không tạo mới cho một chỗ dùng |
| `span translate="no"` | dùng | Tên hiển thị Zalo và tên bot là dữ liệu người nhập — không dịch |
| `Alert` | dùng | Cảnh báo lệch kênh, bot im |
| `Button`, `AlertDialog` | dùng | Nối / Tạo mã mới / Gỡ có xác nhận |
| `ConnectionPage`, `EntityLogo` | dùng | Khung trang kết nối sẵn có |
| Khối mã liên kết | ghép | Chữ số lớn + nút sao chép từ component sẵn có, không tạo component mới |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: trang cài đặt cá nhân chỉ có hai khối, mỗi khối một quyết định. Linear và
GitHub (Settings › Notifications) cũng đặt lựa chọn kênh thành danh sách một cột.
Luồng hiển nhiên nên không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## 8. Ngoài phạm vi

Nhắn khách; nhóm Zalo; tác tử đăng tin lên Zalo; «cả hai kênh»; «tắt nhắc»;
chọn kênh theo từng loại thông báo; ghép bằng số điện thoại; Zalo cá nhân
(`zca-js`); ZBS; chế độ webhook; quản trị viên gỡ liên kết hộ người khác.

## 9. Rủi ro

- `getUpdates` có trả lại tin cũ không thì chưa rõ → chống trùng bằng
  `ZaloUpdateSeen`.
- Zalo Bot Platform chưa công bố giới hạn tần suất → mỗi nhịp gọi tối đa
  `toiDaMoiNhip` lần. Lượng tin nhắc bằng số người có việc mỗi sáng, dưới 50.
- Người chặn bot → `sendMessage` lỗi → thử lại rồi `retireExhausted`. Mỗi sáng
  người đó đều có một hàng hỏng; trang cá nhân không phát hiện được điều này
  (giới hạn đã biết).
