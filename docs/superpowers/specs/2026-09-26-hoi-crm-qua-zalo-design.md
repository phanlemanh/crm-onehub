# Hỏi CRM qua Zalo — thiết kế

Vòng 4 của `docs/plan/lo-trinh-zalo.md`. Hồ sơ cơ hội đã ký Cổng Đáng 2026-09-26:
`_acceptance/hoi-crm-qua-zalo/opportunity.md` (ranh giới A, trần 20/3/1.500, tách khỏi
lượt 10 OKR, chấp nhận rủi ro người cầm máy ở nấc chỉ đọc).

## Câu giao

«Tôi hỏi CRM ngay trong Zalo, theo đúng quyền của tôi.» Người đã nối Zalo và còn là
thành viên vai kinh doanh nhắn một câu hỏi cho bot; trợ lý AI của CRM (cùng tác tử
eve đang trả lời trong khung hội thoại web) trả lời bằng chữ trơn, chỉ đọc, trong
ranh giới A.

## Điều đã biết về kho, và thiết kế đứng trên đó

- Bot nhận tin qua webhook `POST /zalo/webhook` (`channels/zalo.ts` → `nhanWebhook` →
  `xuLyTinDen` trong `lib/zalo-nhan.ts`). Mọi tin của người đã nối mà không phải mã
  hay `xong n` rơi vào `cauKhongMa` và nhận câu «Bạn đã nối với …».
- «Đúng quyền» của trợ lý AI trên web là cổng vai ở cầu nối (`repFromCrm` trong
  `channels/eve.ts`): còn hàng `member` và không phải vai `okr` thì được, còn lại không.
  Công cụ đọc truy DB thẳng. Vòng này **không dựng lớp quyền mới**; nó dùng lại đúng
  phép kiểm đó trước khi mở phiên.
- Khung hội thoại web (`/<slug>/chat`) mở phiên eve qua `send()` của kênh `crm.ts` với
  continuation token theo hội thoại và nhận trả lời ở sự kiện `message.completed`.
  Kênh Zalo làm y hệt, token theo `chat.id`.
- `purposeOf(ctx)` (`lib/session-purpose.ts`) chọn chỉ dẫn cho phiên (`builder`,
  `team-agent`, `research`). Vòng này thêm `zalo`.
- eve cho phép công cụ động ghi đè công cụ đã viết theo tên
  (`eve/docs/guides/dynamic-capabilities.md` mục Conflicts). Đó là cách chặn ghi trên
  kênh Zalo bằng máy, không bằng lời dặn.
- Hook `hooks/audit.ts` ghi mọi sự kiện eve vào `AgentEvent`, kể cả `usage` (token
  vào/ra) của từng bước.

## Đường đi của một câu hỏi

```
Zalo → POST /zalo/webhook (khoá đúng)
  → parseZaloWebhook → xuLyTinDen(token, tin, deps)
     giao dịch DB: ZaloUpdateSeen (trùng → bỏ) · bị chặn → im
     mã 6 số → luật nối (cũ) · xong n → luật đánh dấu (cũ) · «mới» → reset phiên
     câu khác + đã nối → hoiTacTu (MỚI, lib/zalo-hoi.ts):
        1. principal = thanhVienPrincipal(crmUserId)  — cùng hàm với repFromCrm
           null (mất member / vai okr) → hàng ZaloHoi ketQua "tu-choi-vai", trả câu hoiKhongQuyen
        2. trần: đếm ZaloHoi theo người/phút, người/ngày xưởng, xưởng/tháng xưởng
           chạm → hàng "tu-choi-tran-*", trả câu hết trần tương ứng
        3. phiên đang bận (còn ZaloHoi "dang-hoi" của chat này chưa quá hanTraLoiMs) → hàng "dang-ban", câu dangTraLoi
        4. ghi ZaloHoi "dang-hoi" (messageId, crmUserId, zaloChatId, hoiLuc)
     commit → webhook trả 200 NGAY (send() chạy sau, qua waitUntil — không chờ)
  → deps.hoi(cauHoi): channel gọi send(text, { auth: principal + attributes
       {purpose:"zalo", userId, zaloChatId, hoiId}, continuationToken: "chat:<chatId>" })
     rồi sendChatAction("typing")
  → eve chạy phiên bền; instructions/task.ts thấy purpose "zalo" → chỉ dẫn Zalo
     công cụ động zalo-chi-doc.ts thay mọi công cụ ghi bằng bản từ chối
  → events["message.completed"] (channels/zalo.ts):
       hàng = ZaloHoi "dang-hoi" duy nhất của zaloChatId rút từ token; không có → log, bỏ
       ghi sessionId (id Session mà send() trả) vào hàng ngay sau send
       text = locTraLoi(data.message)  (che SĐT/email, cắt ≤ 2.000, tối đa 3 tin)
       guiZalo(token, chatId, từng phần) — hỏng → ZaloHoi "gui-hong"
       ZaloHoi → "da-tra-loi", traLoiLuc, doTreMs, tokenVao/tokenRa (tổng usage của
       AgentEvent cùng session từ hoiLuc)
  → events["turn.failed"]: ZaloHoi → "loi", gửi câu tacTuLoi
  → tick dispatch: ZaloHoi "dang-hoi" quá ZALO.hoi.hanTraLoiMs → "loi" + gửi câu tacTuLoi một lần
```

## Thành phần

| Thành phần | Tệp | Việc |
| --- | --- | --- |
| Principal thành viên | `apps/agent/agent/lib/thanh-vien-principal.ts` (tách từ `channels/eve.ts`) | `thanhVienPrincipal(userId, authenticator)` đọc hàng `member`, trả null khi mất hàng hay vai `okr`. `repFromCrm` gọi nó; kênh Zalo gọi nó. Một hàm, hai lối vào. |
| Lõi hỏi | `apps/agent/agent/lib/zalo-hoi.ts` | `hoiTacTu(tx, …)` như sơ đồ; `dangBan`, `chamTran`, `ghiHoi`, `dongHoiQuaHan`. Trần và hạn trong `ZALO.hoi`. |
| Lệnh `mới` | `lib/zalo-lenh.ts` | `docLenh` nhận thêm `{lenh: "moi"}` cho `mới`, `moi`, `/new`. |
| Bộ lọc trả lời | `apps/agent/agent/lib/zalo-loc.ts` | `locTraLoi(text)`: thay số điện thoại (VN và +84, có/không dấu cách, chấm) và email bằng `[đã ẩn]`; bỏ bảng markdown thành dòng; cắt ≤ `ZALO.tranKyTu` theo đoạn, đoạn dài hơn trần thì cắt ở dòng, câu, rồi ký tự; tối đa `ZALO.hoi.toiDaTin` tin. |
| Chỉ dẫn phiên Zalo | `apps/agent/agent/lib/zalo-chi-dan.ts`, gọi từ `instructions/task.ts` khi `purpose === "zalo"` | Tiếng Việt, ngắn, chữ trơn, không bảng, không nút; chỉ đọc; ba thứ cấm; nói rõ khi CRM không có câu trả lời; không nhắc tên công cụ. |
| Công cụ động chỉ đọc | `apps/agent/agent/tools/zalo-chi-doc.ts` | `defineDynamic` ở `session.started`: purpose `zalo` → trả map tên công cụ ghi → công cụ cùng tên trả `{ok:false, reason}`; purpose khác → null. Danh sách đọc/ghi là hai hằng trong `ZALO.hoi.congCu`; test bánh cóc: mọi tệp trong `tools/` phải thuộc một trong hai danh sách. |
| Kênh | `apps/agent/agent/channels/zalo.ts` | route webhook truyền `send`/`reset` vào `nhanWebhook`; `events`: `message.completed`, `turn.failed`, `session.failed`. |
| Bảng hỏi | `packages/db/prisma/schema.prisma` + migration `hoi_crm_qua_zalo` | `ZaloHoi { id, messageId @unique, crmUserId, zaloChatId, sessionId?, hoiLuc, traLoiLuc?, doTreMs?, tokenVao?, tokenRa?, ketQua String }`; tập giá trị `ketQua` (`dang-hoi, da-tra-loi, gui-hong, tu-choi-vai, tu-choi-tran-phut, tu-choi-tran-ngay, tu-choi-tran-thang, dang-ban, loi`) là schema Zod ở `@crm/validation/zalo-hoi`, vì enum Prisma không nhận gạch ngang; trần chỉ đếm `dang-hoi`, `da-tra-loi`, `gui-hong`; chỉ mục `[crmUserId, hoiLuc]`, `[hoiLuc]`. Không lưu nội dung câu hỏi hay trả lời. |
| Đường đo | `_acceptance/hoi-crm-qua-zalo/rang/nguong.ts` | `--tu D1 --den D2` in: số câu, số người, tỉ lệ trả lời (tử số không tính `gui-hong`), `gui_hong`, p50/p95 độ trễ, tổng token, số từ chối theo lý do, `nguoi_khong_quyen` (hàng đã mở phiên của người không còn `member` vai kinh doanh). |
| Telemetry | `apps/api` rollup `install_daily` | `zalo_questions` (đếm theo `ketQua` trong 24h), `zalo_answer_latency_median_s`; thêm vào `ALLOWED_PROPERTIES`; `docs/telemetry.md`. |
| Tài liệu | `docs/agent.md`, `apps/agent/agent/skills/data-boundaries.md`, `CONTEXT.md`, `docs/plan/lo-trinh-zalo.md` mục 7 | Luật 4 «Into an outside chat channel»; mục **Bot Zalo** và **Trợ lý AI** đổi chữ; dòng 4 mục 7. |

Không biến môi trường mới. Không đụng `apps/api` ngoài rollup telemetry. Không giao diện.

## Quyết định thiết kế

1. **Chặn ghi bằng công cụ ghi đè, không bằng lời dặn.** Chỉ dẫn vẫn nói «chỉ đọc»,
   nhưng thứ được đo là công cụ ghi trên phiên Zalo trả về từ chối và DB không đổi.
   `sensitiveWrite` không đủ: nó trả `user-approval`, mà Zalo không có nút duyệt.
2. **Ranh giới A đo ở đầu ra.** Số điện thoại và email che bằng bộ lọc có đối chứng
   dương. `AppSetting` không có công cụ nào đọc (test tĩnh: không tệp nào trong `tools/`
   chạm `appSetting`). Nguyên văn thư chỉ chặn bằng chỉ dẫn — đây là giới hạn đã biết,
   ghi vào Notes kèm lệnh tái lập; đo thật ở phiên nghiệm thu.
3. **Một phiên eve cho mỗi chat, nhớ 30 ngày** (`limits.sessionTimeoutMs` của
   `agent.ts`), lệnh `mới` để bắt đầu lại. Token của phiên cũ được cache nên câu hỏi
   kế rẻ hơn mở phiên mới.
4. **Trần là hằng cấu hình**, không có màn hình: ba số trong `ZALO.hoi`. Đổi số là đổi
   mã, đúng như chủ kho chọn «không cần phức tạp».
5. **Webhook đáp 200 trước khi hỏi tác tử.** Zalo gửi lại khi không 200; nếu chờ mô hình
   thì một câu hỏi thành hai. Hàng `ZaloHoi` cam kết trong cùng giao dịch với
   `ZaloUpdateSeen`, nên tin gửi lại bị bỏ đúng luật cũ.
6. **Không lưu nội dung.** `ZaloHoi` chỉ có id, người, thời điểm, token, kết quả;
   transcript đã sống trong `AgentEvent` như mọi phiên khác.
7. **Mô hình không chạy trong test.** Eval đi trọn đường sản phẩm với eve giả: bắt
   `send()` (auth, token, tin), rồi gọi thẳng `events["message.completed"]` với câu trả
   lời dựng sẵn. Hành vi của mô hình thật đo ở production (Cổng Giá trị).

## Xử lý lỗi

- Không token / không khoá webhook → 404 như hôm nay (năng lực tắt, không ném).
- Khoá sai → 403, không đọc thân.
- DB lỗi trong giao dịch → 500, Zalo gửi lại; không hàng `ZaloUpdateSeen`.
- `send()` ném (eve không nhận) → `ZaloHoi` → `loi`, gửi câu `tacTuLoi`, log `message_id`
  và tên lớp lỗi.
- `turn.failed`/`session.failed` → như trên.
- Gửi trả lời ra Zalo hỏng → log `message_id`, hàng `gui-hong` (giữ token và độ trễ) để
  tỉ lệ trả lời không đếm câu người không nhận.
- Sự kiện tới khi chat không còn hàng `dang-hoi` (đã «mới», tick đã đóng) → log, không gửi gì.
- `turn.failed` rồi `session.failed` cùng phiên → hàng đã `loi`, lần hai không gửi thêm.
- Tác tử im quá `ZALO.hoi.hanTraLoiMs` (5 phút) → tick đóng hàng, gửi `tacTuLoi` một lần.

## Kiểm thử

Tệp `apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts` (DB thật, Zalo giả khuôn
thật `thanWebhook`, eve giả bắt `send`), `apps/agent/test/zalo-loc.spec.ts` (bộ lọc,
ma trận số điện thoại/email/đoạn dài), `apps/agent/test/zalo-chi-doc.spec.ts` (công cụ
ghi đè và bánh cóc danh sách). Mỗi phép đo mới có cặp hai chiều trên cùng fixture theo
`measure-birth.md`. Mọi test đặt `TZ=Asia/Ho_Chi_Minh` khi đụng ngày xưởng.

## Ngoài phạm vi

Ghi qua Zalo; hỏi đáp OKR (lượt 10); nhóm Zalo và khách/đối tác; ảnh, tin thoại; Slack;
nút và bảng; đổi trần trên màn hình; xác nhận lại người cầm máy; triển khai production
(hàng T).
