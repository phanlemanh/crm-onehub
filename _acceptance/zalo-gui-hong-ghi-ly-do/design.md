# zalo-gui-hong-ghi-ly-do — thiết kế

Nguồn: `opportunity.md` (S0). Mục tiêu duy nhất: lần hỏng kế tiếp của Zalo tự nói lý do trong nhật ký production, để chẩn đoán chiều RA mà không phải gửi tin thật.

## Hiện trạng (đọc 08/10)

- `zaloGoi` (`apps/agent/agent/lib/zalo-api.ts`) ném `LoiHttpZalo(method, status)` khi HTTP không ok, TRỪ 408 — ngoại lệ dành cho long-poll `getUpdates` nhưng áp cho mọi lệnh.
- `parseZaloSend` (`packages/validation/src/zalo-update.ts`) ném `Error("Zalo rejected the message (<description|error_code|hinh dang la>)")` — lý do có trong `message`.
- Bảy chỗ ghi lỗi gửi chỉ in tên lớp lỗi (`loi.name`) hoặc lớp thô: `lopLoi`/`baoLoiZalo` trong `zalo-bot-xuong.ts` (gửi thử, `getMe`), `zalo-tra-loi.ts` dòng 106, 132, 186, 197, `zalo-nhan.ts` dòng 166, `zalo-hoi.ts` dòng 244. Hai chỗ in `String(loi)` (`zalo-nhan.ts` 182, 209) thì có lý do.
- `xuLyTinDen` (`zalo-nhan.ts`) có bốn nhánh không ghi gì: không phải chat riêng/bot, `message_id` đã gặp, người gửi bị chặn, người chưa nối được trả hướng dẫn thành công.
- Sự kiện `webhook-test` của Zalo (không `from`, `chat`) ghi «webhook sai khuon» dù là sự kiện hợp lệ của bước đăng ký.

## Cách sửa

1. **Một lớp lỗi có tên cho lời từ chối của Zalo.** `packages/validation/src/zalo-update.ts` thêm `ZaloTuChoi extends Error` với `maLoi: number | null`, `moTa: string | null`; và `ZaloHinhDangLa extends Error` với `khoa: string[]` (tên khoá cấp đầu của thân, không giá trị). `parseZaloSend` ném hai lớp này thay cho `Error` thô; `message` giữ nguyên chữ cũ để mọi chỗ đang đọc `message` không đổi.
2. **Một hàm mô tả lỗi dùng chung.** `moTaLoiZalo(loi: unknown): string` trong `zalo-api.ts`: `http-<mã>` · `zalo-tu-choi <maLoi|-> «<moTa cắt ≤ ZALO.nhatKy.tranMoTa>»` · `hinh-dang-la khoa=<…>` · `mang (<code>)` · còn lại `<tên lớp>`. Bảy chỗ ghi lỗi gửi và `lopLoi` gọi nó. Không bao giờ in token, chat id hay chữ tin nhắn — `moTa` là chữ hệ thống của Zalo.
3. **408 chỉ là «hết tin» với `getUpdates`.** `zaloGoi` chỉ cho 408 lọt khi `method === "getUpdates"`; lệnh khác nhận `LoiHttpZalo(…, 408)` → `http-408`.
4. **Nhánh bỏ qua có tên.** Mỗi nhánh im của `xuLyTinDen` ghi đúng một dòng `[zalo] bo qua message_id=<id> ly_do=<khong-rieng|da-gap|bi-chan|chua-noi>` (mã nhánh là hằng trong `ZALO.nhatKy.boQua`). Không in `from.id` hay chữ tin.
5. **`webhook-test` là sự kiện thử.** `nhanWebhook` nhận ra `message.message_id === ZALO.webhook.maThu` («webhook-test»): ghi một dòng `[zalo] webhook-test` và trả 200; thân hỏng thật vẫn ghi «sai khuon».

## Đã cân và bỏ

- Ghi nguyên thân phản hồi của Zalo: có thể mang dữ liệu người dùng ở ca thành công lạ; chỉ ghi tên khoá.
- Sửa luôn chuyện «mã người dùng đổi theo bot» (nếu có): chưa có căn cứ; hàng này chỉ làm lý do hiện ra.

## Đo

- Ma trận phản hồi Zalo × hàm mô tả (HTTP 200 `ok:false` có/không mô tả, thân lạ, 401, 403, 429, 500, 408 ở `sendMessage`, 408 ở `getUpdates`, lỗi mạng).
- Mỗi chỗ ghi trong bảy chỗ: chạy đường thật với `fetcher` giả trả `{ok:false,error_code:403,description:"<chữ ghim>"}`, bắt `console.error`, khẳng định dòng có chữ ghim.
- Bốn nhánh bỏ qua × một dòng mã nhánh; `webhook-test` × một dòng; thân hỏng thật vẫn «sai khuon».
- Không dòng nào chứa token, chat id hay chữ tin (đối chứng: chèn các chuỗi đó vào đầu vào, tìm vắng trong nhật ký).

## Đặc tả UX

Không chạm màn web.

## Đổi bot (lối 1, chủ kho chọn 08/10 qua giám sát)

Căn cứ: sau hai lần Lưu bot ngày 30/09, bot hiện tại khác bot cũ; các `zaloLink` nối với bot cũ hết hiệu lực âm thầm (Gửi thử, tin nhắc chết); chủ kho nối lại tài khoản lúc 11:10Z ngày 08/10 thì Gửi thử qua và phiên Zalo trả lời được (log `wrun_41M4DKA89N0GRRFVZ2G3XH0YMK`).

- **Nhận ra bot khác.** Trong `datBot` (`zalo-bot-xuong.ts`), sau `getMe` của token mới: mã bot mới = `result.id`. Mã bot đang dùng = `getMe` của token đang lưu (`AppSetting.zaloBotToken`, rơi về `ZALO_BOT_TOKEN`); `getMe` cũ hỏng hay không có token cũ thì so phần `<số>` trước dấu `:` của hai token (dạng token do Zalo cấp, `docs/connections.md`). Không có token cũ → không phải «đổi bot» (bật lần đầu).
- **Hỏi trước khi gỡ.** Bot khác và có `n > 0` liên kết `zaloLink` → `datBot` KHÔNG lưu gì, trả `{ outcome: "can-xac-nhan-doi-bot", soLienKet: n, tenBotMoi }`. Màn Kết nối › Zalo mở `ConfirmDialog` (`packages/ui`): «Đổi sang bot «<tên>» sẽ gỡ n liên kết Zalo. Mọi người đã nối phải nối lại.» Nút xác nhận «Gỡ liên kết và đổi bot». Huỷ → không đổi gì.
- **Gỡ khi đồng ý.** Gọi lại `luuBot` với `xacNhanDoiBot: true` → `datBot` đăng ký bot mới như hôm nay; chỉ khi đăng ký thành công mới xoá mọi `zaloLink` trong một giao dịch, rồi ghi một dòng vết `[zalo] doi bot: go <n> lien ket` (mã bot cũ/mới chỉ ghi phần số). Đăng ký hỏng → không gỡ gì.
- **Cần nối lại.** Người có `NotificationPreference.channel = ZALO` mà không còn `zaloLink` thấy trên «Thông báo của bạn» một dòng «Bot Zalo của công ty đã đổi hoặc liên kết đã gỡ — nối lại để nhận nhắc qua Zalo» cạnh nút «Nối Zalo» sẵn có. Không thêm cột: trạng thái suy từ hai bảng đang có.
- **Ngoại lệ có chủ đích.** `docs/connections.md` ghi «An admin cannot unlink someone else's Zalo». Đổi bot là ngoại lệ duy nhất: quản trị gỡ TẤT CẢ liên kết cùng lúc, sau khi xác nhận, vì liên kết với bot cũ đã vô hiệu. Ghi vào `docs/connections.md`.

## Sửa sau phản biện (S1, 08/10)

- `zaloGoi` đọc thân phản hồi (có trần độ dài) TRƯỚC khi ném `LoiHttpZalo`; lỗi mang thêm `maLoi`, `moTa` khi thân là `{ok:false,…}`, và `moTaLoiZalo` in `http-<mã> zalo-tu-choi <mã> «<mô tả>»`. Bảng lỗi chính thức của Zalo trả lỗi bằng mã HTTP và dặn đọc `description`, nên bỏ thân ở nhánh HTTP lỗi là mất đúng lý do cần tìm.
- Ghi `AppSetting` (token, khoá, tên bot mới) và gỡ mọi `zaloLink` nằm trong MỘT `db.$transaction`, chạy sau khi `setWebhook` nhận. Hỏng ở bất kỳ bước ghi nào → không đổi gì.
- AC-7, AC-8 đi qua app → API (`zalo.luuBot`, schema đầu vào có `xacNhanDoiBot`) → agent: đo bằng router API thật với agent giả (E14) và bài DOM của `o-token.tsx` (E15).
- Đếm và gỡ hết liên kết đặt ở `packages/db/src/zalo-lien-ket.ts` (cùng nhà với `noiBangMa`, `ghiSai`, `goLienKet`); `canNoiLai` tính ở `packages/db/src/kenh-thong-bao.ts` (cùng nhà với `kenhSeDungCua`).
- Tám chỗ gọi Zalo ghi lý do: bảy chỗ gửi + `getMe` khi Lưu bot.

## Phần A — webhook 403/404 phải lên tiếng (giám sát chuyển từ phiên bản đồ production, PR #315; chủ kho duyệt ở Cổng 1)

- Nhánh 403 của `nhanWebhook`: header vắng → chỉ ghi `[zalo] webhook 403 ly_do=thieu-khoa`. Header có mà lệch → ghi `[zalo] webhook 403 ly_do=khoa-lech` (không thân, không header, không khoá); CHỈ khi thân đọc được là tin Zalo (`parseZaloWebhook` nhận, hoặc sự kiện thử) mới đặt `AppSetting.zaloWebhookLyDo = "khoa-lech"` bằng `updateMany` có điều kiện «lý do hiện khác khoa-lech» — một câu UPDATE mỗi yêu cầu nhưng hàng chỉ đổi một lần, kể cả khi đồng thời. Máy quét lạ (không header, hay thân rác) không bật được cảnh báo. Nhánh 404 (chưa có bot): chỉ ghi `[zalo] webhook 404 ly_do=chua-co-bot`.
- `ZALO_LY_DO` (`packages/validation/src/zalo-update.ts`) thêm «khoa-lech». Nhịp kiểm (`ghiUrlKhiKhongCoHong` trong `zalo-bot.ts`) hiện chỉ giữ «zalo-tu-choi»; thêm «khoa-lech» vào danh sách lý do nhịp kiểm không được xoá. `datBot` thành công (Đăng ký lại hay Lưu bot) vẫn đặt lý do về null như hôm nay.
- API `zalo.xuong` đưa trạng thái «khoa-lech» ra màn; `trang-thai-webhook.tsx` thêm một nhánh cảnh báo dùng lại nút «Đăng ký lại» sẵn có.
- Căn cứ: hai lần 403 ngày 06/10, 08/10 im lặng hoàn toàn trên màn (P5-28). Phần B (canary mỗi giờ) để sau.
