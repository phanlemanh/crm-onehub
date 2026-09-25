# Bộ đọc webhook Zalo nhận khuôn thân thật — design

Hồ sơ: `_acceptance/zalo-webhook-doc-khuon-that/` · hạng T2 · 2026-09-25

## Vấn đề

Bot Zalo production không nối được ai. Đo bằng `vercel logs` ngày 2026-09-25
(05:22–05:25 giờ VN): Zalo giao bốn lượt `POST /zalo/webhook`, khoá bí mật khớp,
nhưng mỗi lượt ghi

```
[zalo] webhook sai khuon khoa=event_name,message message_id=?: Error: getUpdates tra hinh dang la: …
```

Thân webhook thật là `{ event_name, message }`, không có vỏ `{ ok: true, result }`.
Tài liệu Zalo mô tả thân có vỏ; `zalo-qua-webhook` tin tài liệu (giả định (2), Ngoài-8)
và đọc thân bằng `parseZaloGetUpdates` — khuôn của phản hồi `getUpdates`. Thân thật
không khớp, webhook trả 200 và bỏ tin: mã không được nối, người nhắn không nhận trả lời,
trang Kết nối › Zalo báo 0/11 người đã nối.

Zalo giả của test (`thanWebhook`) dựng thân có vỏ, nên mọi test webhook xanh. Tệ hơn,
ca `webhook-bo-qua` › «c khong vo» của spec đã ký ghim khuôn thật là «bỏ qua» — AC-5
ý (3) của `zalo-qua-webhook`.

## Thiết kế

### Một module cho khuôn webhook

`packages/validation/src/zalo-webhook.ts`, subpath `@crm/validation/zalo-webhook`:

- `parseZaloWebhook(value: unknown): ZaloTinWebhook` với
  `ZaloTinWebhook = { message: ZaloMessage; eventName: string }`. Nhận hai khuôn:
  thật `{ event_name, message }` và có vỏ `{ ok: true, result: { event_name, message } }`.
  Cả hai dùng `zaloMessage` của `zalo-update.ts` — phần `message` giữ một nguồn.
  Không khớp khuôn nào → ném `Error` có thông điệp riêng của webhook
  (`webhook tra hinh dang la: …`), lấy lỗi của khuôn gần nhất: thân có khoá `result`
  thì lỗi của khuôn có vỏ, còn lại lỗi của khuôn thật.
- `moTaThanWebhook(value: unknown)` trả ba mẩu cho dòng log: khoá cấp đầu, khoá của
  `message` (đọc ở `message` hoặc `result.message`), `message_id` (cùng hai chỗ).
  Chỉ tên khoá và mã tin — không giá trị nào khác.

`parseZaloGetUpdates` và `messageIdCua` của `zalo-update.ts` giữ nguyên: phản hồi
`getUpdates` thật có vỏ (đo 23/09), `zalo:poll` đang đúng.

Loại phương án: nới `parseZaloGetUpdates` cho nhận cả thân không vỏ. Một hàm đọc hai
nguồn khác nhau là đúng cách lỗi này sinh ra; và kiểu `ZaloUpdate` mang nhánh `het`
mà webhook không bao giờ có.

### Bộ đọc

`docCapNhat` trong `apps/agent/agent/lib/zalo-webhook.ts` gọi `parseZaloWebhook`.
Hỏng thì in đúng một dòng

```
[zalo] webhook sai khuon khoa=<khoá cấp đầu> khoa_message=<khoá của message> message_id=<mã|?>: <lỗi>
```

rồi trả 200 như trước. Thông điệp lỗi của zod nêu đường và kiểu, không nêu giá trị,
nên dòng log không mang nội dung tin; AC-3 đo điều này bằng chuỗi đánh dấu.

Chống trùng (`ZaloUpdateSeen` theo `message_id`) nằm trong `xuLyTinDen`, sau bước
đọc — nên cùng một tin tới lần hai ở vỏ khác vẫn bị chặn. AC-2 ghim điều đó.

### Zalo giả

`apps/agent/test/support/zalo-tin.ts`:

- `thanWebhook(chon)` trả khuôn thật `{ event_name, message }`. Mọi spec đã ký gọi nó
  (nối mã, khoá sai, trùng, luật mã, tin bỏ qua, người mới) nay chạy trên khuôn
  production mà không sửa tệp spec nào.
- `thanWebhookCoVo(chon)` trả khuôn có vỏ theo tài liệu.
- Phần `message` vẫn chép từ `fixtures/zalo-tin-that.json` (phản hồi `getUpdates` thật).

### Spec đã ký — quyết định (A) của chủ kho, 2026-09-25

Gỡ đúng ca «c khong vo» khỏi `webhook-bo-qua` trong
`apps/agent/test/zalo-qua-webhook.integration.spec.ts`: ma trận còn 4 ca, tên ca bỏ
chữ «khong vo», ca dương (khuôn thật → nối) sống ở spec mới. Không sửa ca nào khác.
Vòng này `supersedes` AC-5 ý (3) của `zalo-qua-webhook`, ghi trong
`decisions.jsonl` và `## Notes` của hợp đồng này; không chạm `_acceptance/` của
`zalo-qua-webhook` hay `noi-zalo-cho-nguoi-moi`.

Cái giá đã nhận: thước khoá `nzm_giu_da_ky` (hồ sơ `noi-zalo-cho-nguoi-moi`) đỏ trên
nhánh này tới khi merge — nó so tệp với `merge-base` của `origin/onehub`, mốc đó dời
sau merge. Văn bản `expected` của `zqw_webhook_bo_qua` trong hồ sơ đã ký còn tả 5 ca.

### Tài liệu

- `docs/agent.md` mục «Zalo: webhook…»: thân thật không vỏ (đo production 25/09), vẫn
  nhận khuôn có vỏ, dòng log in thêm khoá của `message`.
- `docs/plan/lo-trinh-zalo.md` mục 7: dòng **2d** cho vòng này.

## Test

Spec mới `apps/agent/test/zalo-webhook-doc-khuon-that.integration.spec.ts`, bốn nhóm
tên ghim cho `-t`:

- `hai-khuon-noi` — U nhắn mã bằng khuôn thật, V nhắn mã bằng khuôn có vỏ: cả hai nối,
  mỗi người một hàng đã thấy và một tin xác nhận.
- `trung-hai-khuon` — cùng `message_id` tới lần một ở khuôn thật, lần hai ở khuôn có vỏ
  (và ngược lại): một liên kết, một hàng đã thấy, một tin trả lời.
- `sai-khuon-log` — ma trận viết trước; tách dòng log thành trường rồi so bằng, không so
  chuỗi có mặt; chuỗi đánh dấu trong `text` không xuất hiện.
- `gia-khuon-that` — Zalo giả rút từ vật thật, không gõ tay: `thanWebhookCoVo(x).result`
  bằng `result` của `fixtures/zalo-tin-that.json` sau khi thay trường định danh;
  `thanWebhook(x)` bằng `thanWebhookCoVo(x).result`; khoá cấp đầu bằng khoá tách từ
  dòng log production 25/09 lưu ở `fixtures/zalo-webhook-log-that.txt` (dòng đó chỉ có
  tên khoá và lỗi zod, không nội dung tin).

`rang/giu-da-ky.mjs` (E6) thay chỗ thước khoá đang đỏ: spec người mới không đổi so với
`merge-base`; spec webhook bằng đúng bản cũ trừ biến đổi có tên (gỡ ca «c», số ca 4).

Chiều đỏ (phá-thử trong bản sao, S3): đưa `docCapNhat` về `parseZaloGetUpdates` →
`hai-khuon-noi` đỏ với thông điệp ghim «khuon that phai noi duoc», và tập ca đỏ của
hai spec đã ký bằng danh sách `rang/ca-qua-webhook.json` đã commit trước lượt phá.

## Ngoài phạm vi

- Đổi bộ đọc `getUpdates`.
- Chụp thân webhook thật làm fixture — cần URL công khai; `[GIẢ ĐỊNH]` các trường
  trong `message` giống phản hồi `getUpdates`.
- Ba việc ngoài lề trong log production: TLS khi đọc DB ở nhịp dispatch, dòng năng lực
  `Zalo reminders` in `off` khi token chỉ dán trên màn (Ngoài-7 của
  `noi-zalo-cho-nguoi-moi`), giờ UTC ở «trả lời lần cuối».
- `setWebhook`/`deleteWebhook` trên bot thật và thử lại trên production — bước tay của
  chủ kho sau merge.
