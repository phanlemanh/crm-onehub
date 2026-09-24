# Gọi thử hỏng: màn hiện đúng bot đang dùng — thiết kế

Ngày: 2026-09-24 · Hồ sơ: `_acceptance/zalo-goi-thu-hong-hien-dung-bot/` · Hạng T2 ·
Nguồn: Ngoài-2 (HIGH, chủ kho quyết «mở hợp đồng mới»), Ngoài-3 và Ngoài-4 của Cổng Bằng
chứng vòng 3 hồ sơ `noi-zalo-cho-nguoi-moi` (ký 24/09, PR #118). Hạn: lên `onehub` trước
hàng T của `docs/plan/lo-trinh-zalo.md` (triển khai trước 26/10).

## Vấn đề

Khi quản trị viên dán Bot Token ở Kết nối › Zalo, tác tử gọi `setWebhook`. Zalo có thể nhận
đăng ký nhưng gọi thử địa chỉ nhận tin không được (`verification.outcome` khác `webhook.ok`).
Hôm nay nhánh đó:

1. `datBot` đã ghi token, khoá, tên bot mới, xoá `zaloWebhookUrl`, ghi `zaloWebhookLyDo`
   «zalo-tu-choi» — rồi trả `outcome: "invalid"`.
2. `ZaloService.luuBot` thấy `invalid` nên ném lỗi yêu cầu; `OToken` chỉ hiện lỗi dưới ô,
   không làm mới dữ liệu, không tải lại trang.
3. Màn hình vẫn hiện tên bot cũ và «Nhận tin qua webhook» xanh. Quản trị viên tưởng lưu hỏng,
   không bấm «Đăng ký lại», trong khi CRM đã chuyển sang bot mới và khoá của bot cũ đã mất.
4. Kể cả khi màn tải lại, nhịp `kiemBot` kế tiếp (`docWebhook`) ghi lại `zaloWebhookUrl` từ
   `getWebhookInfo` — Zalo vẫn giữ địa chỉ đã đăng ký — nên cảnh báo tự biến mất trong vòng
   một phút dù chưa ai xác minh lại (Ngoài-3).
5. Ma trận `CACH_GOI` × cách hỏng chỉ có `ok-false` và `loi-mang`; nhánh gọi thử hỏng chỉ được
   kiểm ở ca đăng ký lại (Ngoài-4).

## Hướng đã chọn — giữ bot mới, nói thật

Gọi thử hỏng nghĩa là Zalo ĐÃ nhận token và khoá mới. Vậy bot mới là bot đang dùng; việc cần
làm là nói điều đó ra và giữ cảnh báo cho tới khi đăng ký lại thành công.

**Tác tử — `datBot`** (`apps/agent/agent/lib/zalo-bot-xuong.ts`): nhánh `xac-minh-hong` giữ
nguyên mọi lệnh ghi hôm nay (token, khoá, tên mới; url null; lý do «zalo-tu-choi»), nhưng trả
`{ outcome: "valid", tenBot, webhook: "zalo-tu-choi" }`. Giá trị «zalo-tu-choi» đã có trong
`WEBHOOK_KET` và `zaloLuuBotOutput`, chưa nhánh nào trả — không thêm giá trị mới. Hai nhánh
hỏng thật (`ok: false`, lỗi mạng) giữ nguyên: trả về bot cũ, trả `invalid` (AC-17 cũ).

**API — `ZaloService.luuBot`**: không đổi mã. `valid` đi thẳng ra phản hồi
`{ tenBot, webhook: "zalo-tu-choi" }` qua schema sẵn có. Phép đo cấp API chứng điều đó trên
cầu nối thật.

**Nhịp — `docWebhook`** (`apps/agent/agent/lib/zalo-bot.ts`): khi `getWebhookInfo` trả url,
ghi bằng MỘT lệnh có điều kiện — `updateMany` trên hàng `AppSetting` với điều kiện lý do là
null hoặc khác «zalo-tu-choi» (Prisma: `OR: [{ zaloWebhookLyDo: null }, { zaloWebhookLyDo:
{ not: "zalo-tu-choi" } }]`, vì `not` một mình loại luôn hàng null). Không đọc-rồi-ghi: một
lần lưu bot gọi-thử-hỏng chen giữa lúc nhịp gọi Zalo và lúc ghi vẫn giữ được cờ. Các lệnh ghi
null (404, sai khuôn, `getMe` hỏng) giữ nguyên. Nghĩa của cờ: *lần đăng ký gần nhất hỏng — chỉ lần đăng ký thành
công mới gỡ.* `datBot` thành công ghi `zaloWebhookLyDo: null` nên gỡ cờ; nhịp sau đó ghi url
như cũ. Giá trị «zalo-tu-choi» lấy từ `ZALO_LY_DO` của `@crm/validation/zalo-update`, không
viết chuỗi trần.

Hệ quả cho ca `ok: false` / lỗi mạng khi đã có url U: cờ «zalo-tu-choi» cũng được đặt (AC-17
cũ), url U giữ nguyên, trạng thái vẫn «da-dang-ky». Với luật mới, nhịp không thay U bằng url
khác cho tới lần đăng ký thành công kế tiếp; nếu Zalo báo 404 thì U vẫn về null như cũ.

**Màn** (`o-token.tsx`, `trang-thai-webhook.tsx`): `onSuccess` đọc `kq.webhook`.
«zalo-tu-choi» → `toast.warning` với câu mới (có tên bot và việc làm tiếp «Đăng ký lại»);
còn lại → `toast.success` như cũ. Cả hai nhánh đều xoá ô token (ô token), làm mới
`cache.zalo()` và `router.refresh()`. Sau khi tải lại, màn hiện tên bot mới và khối cảnh báo
sẵn có «Zalo chưa giao tin nhắn về CRM» + nút «Đăng ký lại». Hai câu mới vào
`apps/app/lib/messages/nhac-qua-zalo.ts` (vi, en).

## Phương án đã loại

- **Lùi về bot cũ khi gọi thử hỏng với token mới** (như nhánh `ok: false`). Loại vì: Zalo đã
  nhận khoá mới cho token mới; khi quản trị viên dán token vừa được Zalo cấp lại cho CÙNG bot,
  token cũ đã chết — lùi về là mất bot và màn lại hiện xanh sai. Với ca đăng ký lại, khoá Zalo
  giữ đã đổi, lùi về khoá cũ làm mọi tin bị 403 (ca «goi-nguoc c» đã ký giữ khoá mới vì lẽ đó).
- **Thêm giá trị lý do «xac-minh-hong» hoặc cột mới.** Loại vì: AC-16/AC-17 đã ký ghim lý do
  «zalo-tu-choi»; cột mới là `migration` (T3) mà lời hứa không cần.
- **API bắt lỗi rồi màn vẫn tải lại khi lỗi.** Loại vì: màn không phân biệt được "đã lưu mà
  chưa nhận tin" với "chưa lưu gì" — chính lỗi đang sửa.

## Thay đổi phép đo đã ký

Hai ca của `apps/agent/test/noi-zalo-cho-nguoi-moi.integration.spec.ts` ghim hành vi cũ:
`goi-nguoc: b` (`outcome: "invalid"`, `webhook: null`) và `goi-nguoc: c` (`outcome:
"invalid"`). Vòng này sửa đúng hai giá trị đó sang `"valid"` / `"zalo-tu-choi"`; mọi vế khác
của hai ca (lý do, url, token, khoá) giữ nguyên. Lời văn AC-16/AC-17 của hồ sơ đã ký không
nói `invalid`, nên không lời hứa nào bị lật; hồ sơ `_acceptance/noi-zalo-cho-nguoi-moi/`
không bị chạm. Hai spec đã ký khác (`nhac-qua-zalo`, `zalo-qua-webhook`) không đổi.
`apps/agent/test/support/zalo-gia.ts` thêm một lựa chọn tuỳ ý `tenBot` (mặc định «Bot OneHub»
như cũ) để Zalo giả trả tên bot mới.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Kết nối › Zalo (đang hiện «Bot Cũ», xanh) → dán token mới → «Đổi token» → Zalo
  nhận và gọi thử được → thông báo «Đã bật Bot Mới.» → màn tải lại, «Bot Mới», xanh.
- Biên (việc của vòng này): Zalo nhận nhưng gọi thử hỏng → ô token trống, thông báo cảnh báo
  «Đã lưu Bot Mới, nhưng Zalo chưa gọi thử được địa chỉ nhận tin. Bấm “Đăng ký lại” sau ít
  phút.» → màn tải lại: «Bot Mới» + khối «Zalo chưa giao tin nhắn về CRM» + «Đăng ký lại».
  Khối đó còn nguyên qua các nhịp kiểm của tác tử.
- Lỗi & quay lại: bấm «Đăng ký lại» → gọi thử được → «Đã đăng ký nhận tin lại.», khối cảnh báo
  biến mất; gọi thử vẫn hỏng → thông báo cảnh báo «Zalo nhận đăng ký nhưng chưa gọi thử được
  địa chỉ nhận tin. Thử “Đăng ký lại” sau ít phút.», khối cảnh báo còn. Zalo không nhận
  (`ok: false`, lỗi mạng) → như cũ: lỗi dưới ô, bot cũ giữ nguyên.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Kết nối › Zalo | cho quản trị viên biết bot nào đang dùng và tin có về CRM không | Cài đặt › Kết nối / Thông báo của bạn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ket-noi-zalo-dang-kiem | Kết nối › Zalo | nút «Đang kiểm…» khoá, spinner (có sẵn) | chờ |
| ST-ket-noi-zalo-luu-chua-nhan-tin | Kết nối › Zalo | thông báo cảnh báo có tên bot mới + «Đăng ký lại»; ô trống; tên bot mới; khối «Zalo chưa giao tin nhắn về CRM» | bấm «Đăng ký lại» sau ít phút |
| ST-ket-noi-zalo-dang-ky-lai-van-hong | Kết nối › Zalo | thông báo cảnh báo «Zalo nhận đăng ký nhưng chưa gọi thử được…»; khối cảnh báo còn | thử lại sau |
| ST-ket-noi-zalo-dang-ky-lai-duoc | Kết nối › Zalo | «Đã đăng ký nhận tin lại.»; «Nhận tin qua webhook» xanh (có sẵn) | không cần |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Thông báo đi qua `sonner` (vùng `aria-live` của Toaster có sẵn); câu cảnh báo luôn kèm
  việc làm tiếp.
- Tên bot là dữ liệu người nhập ở Zalo, hiện nguyên văn.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `toast.warning` của `sonner` | dùng | loại thông báo có sẵn, Toaster của `packages/ui` đã dựng |
| `Alert` «Zalo chưa giao tin nhắn về CRM» | dùng | khối có sẵn từ vòng 2, không đổi |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: màn cài đặt có sẵn một cột; vòng này không thêm màn hay khối, chỉ đổi loại thông báo
và cho màn tải lại — luồng hiển nhiên, không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Kiểm

- Tác tử: tệp mới `apps/agent/test/zalo-goi-thu-hong.integration.spec.ts` — ma trận 3 cách
  gọi × 4 kết quả Zalo viết trước (phủ Ngoài-4), ma trận nhịp 3 trạng thái cờ × 4 kết quả
  `getWebhookInfo`, đường gỡ cờ.
- API: tệp mới `apps/api/test/zalo-goi-thu-hong.spec.ts` theo khuôn `noi-zalo-cau-noi.spec.ts`
  (API thật → route tác tử thật → Zalo giả qua `ZALO_API_URL`), rồi một nhịp `kiemBot`, rồi
  `zalo.xuong`.
- Màn: tệp mới `apps/app/test/zalo-goi-thu-hong.dom.tsx` — loại thông báo, ô trống, làm mới,
  tải lại, hai ngôn ngữ.
- Nhìn thấy: eval `ui-check` trên app + api thật của cây đang xét, tác tử thay bằng route
  thật sau Zalo giả (script `_acceptance/zalo-goi-thu-hong-hien-dung-bot/rang/tac-tu-gia.ts`).
- Không đụng bot Zalo thật: mọi `setWebhook`/`deleteWebhook` đi vào Zalo giả.

## Tài liệu

`docs/connections.md` mục Zalo: gọi thử hỏng vẫn lưu bot mới, cảnh báo giữ tới lần đăng ký lại
thành công. `docs/plan/lo-trinh-zalo.md` mục 7: thêm dòng cho vòng này, cập nhật dòng vòng 2
(đã lên `onehub` qua #118).
