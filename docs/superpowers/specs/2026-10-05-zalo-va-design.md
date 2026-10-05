# Zalo vá (R1g) — thiết kế

Hàng R1g của `docs/plan/lo-trinh-okr.json`, Cổng Đáng `build, giữ ngưỡng` ngày 05/10. Hạn 10/10.
Ô cơ hội: `_acceptance/zalo-va/opportunity.md`.

## Bốn việc

1. **Lỗi tạm của Zalo không phải token sai (#26).** `docBot` của `zalo-bot-xuong.ts` (dán token ở
   Cài đặt) coi mọi mã 400–499 là token sai. Mã 408 (hết giờ) và 429 (quá nhiều lần gọi) — ở HTTP
   hay ở `error_code` trong thân `ok: false` — chuyển sang nhánh «Zalo tạm lỗi» cùng 5xx, lỗi mạng
   và thân sai khuôn: trả `zalo-loi` với `ZALO.loi.zaloKhongTraLoi`, không ghi cột nào. Mã 4xx còn
   lại vẫn là token sai. Hai mã tạm nằm trong `ZALO.http.tamLoi` (`zalo-config.ts`), không rải số.
2. **Nhịp kiểm bot giữ bot khi Zalo tạm lỗi (cùng lớp #26).** `docBot` của `zalo-bot.ts` (gọi từ
   `kiemBot` mỗi nhịp dispatch và mỗi lượt poll) hôm nay gặp bất kỳ lỗi `getMe` nào là ghi
   `zaloBotName: null, zaloWebhookUrl: null`. Vì `kenhSeDungCua` đọc `zaloBotName`, trong khoảng đó
   nhắc sáng rơi sang Slack và Cài đặt báo bot tắt. Sau vá: lỗi tạm thì giữ nguyên hai cột, ghi
   log lớp lỗi, trả `loi`; Zalo từ chối token (4xx không thuộc `tamLoi`, HTTP hay thân) thì xoá như
   hôm nay. Hai `docBot` dùng chung một hàm phân lớp để không lệch nhau.
3. **Câu chào trỏ đúng trang nhắc (#27).** `ZALO.loi.huongDan` bảo mở «Cài đặt › Thông báo của
   bạn», trang đã bỏ. Chỗ nối Zalo nay là trang «Nhắc buổi sáng» (`/<slug>/reminders`, khối
   `KhoiZalo`), nút «Nối Zalo». Câu mới nêu đúng hai nhãn đó. Bài kiểm so quan hệ, không so chuỗi
   chép tay: câu chào phải chứa nhãn mục điều hướng `nhacBuoiSang` của `khung-ung-dung` và nhãn nút
   `noi` của `nhac-qua-zalo` (bản vi), và không câu nào trong `ZALO.loi` còn chữ «Thông báo của bạn».
4. **Hai chỗ đếm và báo sai.**
   - `_acceptance/tra-loi-tin-nhac/rang/nguong.ts`: hàng nhắc lấy tới `--den`, vết «xong» lấy tới
     `--den` + 24 giờ, nên «xong» đúng ở ngày cuối kỳ bị đếm nhầm. Sau vá cả hai phía cắt theo ngày
     giờ VN: nhắc có ngày trong `[ngày tu, ngày den]`, vết có ngày trong cùng khoảng.
   - `capabilities.ts`: năng lực «Zalo reminders» lấy từ biến `ZALO_BOT_TOKEN`, nên log khởi động in
     «off» và chỉ dẫn của tác nhân xếp Zalo vào «Not configured» dù bot đã nối qua Cài đặt. Sau vá
     `enabled` = có token theo đúng `zaloToken()` (Cài đặt trước, biến môi trường sau), `from` nêu cả
     hai nguồn.

## Đường đo

Hai `docBot` cùng gọi `getMe` bằng `zaloGoiTho` (giữ mã HTTP và thân) rồi qua một hàm phân lớp chung.
`lop`: `mang` khi lỗi mạng; `http-<mã>` khi HTTP khác 200, thân ra sao cũng vậy; `ok-false-<mã>` khi
HTTP 200 và thân `ok: false`; `sai-khuon` khi HTTP 200 mà thân lạ. `ketLuan` là `tam-loi` khi mã HTTP
hoặc `error_code` của thân thuộc `ZALO.http.tamLoi` hay từ 500 trở lên, hoặc lỗi mạng, hoặc sai khuôn;
còn lại (4xx) là `token-sai`.

Mỗi lần `getMe` lỗi ghi một hàng `AgentEvent` loại `zalo.getme-loi`, `sessionId` cố định `zalo-bot`,
`data = { noi, http, maThan, lop, ketLuan, vanTay }` — `vanTay` là 12 ký tự hex đầu của sha256 token đã
gọi. Lỗi ghi hàng không làm hỏng việc chính: bắt và log.

`_acceptance/zalo-va/rang/dem-getme.ts` chỉ đọc, in: số lần theo `ketLuan` × `lop`; số hàng `token-sai`
mang mã tạm theo danh sách riêng của bộ đếm (408, 429, 5xx — không đọc `ZALO.http`, để bắt một lần lùi
cấu hình); và số hàng `token-sai` có `vanTay` trùng token đang chạy trong `AppSetting` — token đã được
Zalo nhận sau đó mà từng bị báo sai. Dòng cuối là ngưỡng chết của ô cơ hội.

## Không làm

- Dòng «Zalo tạm không trả lời lúc …» trên trang Cài đặt (chủ kho chọn giữ bot, không báo thêm).
- Gọi `setWebhook` hay `getUpdates` lên bot thật — mọi phép đo dùng Zalo giả
  (`apps/agent/test/support/zalo-gia.ts`).
- Thử lại `getMe` trong cùng nhịp; nhịp dispatch kế tự kiểm lại.
- Màn web: vòng này không đổi màn nào (bỏ design-pass và ảnh chụp, chủ kho duyệt 05/10).

## Kiểm

Một tệp mới `apps/agent/test/zalo-va.integration.spec.ts` (Zalo giả mở rộng thêm các mã getMe) và
một khối mới trong `apps/agent/test/tra-loi-tin-nhac-nguong.integration.spec.ts`. Mỗi phép đo có
chiều đỏ trên cùng fixture, xem `evals.yaml`.
