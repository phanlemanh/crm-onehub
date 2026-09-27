---
schema_version: 1
feature: Hỏi CRM qua Zalo giữ lời hứa «chỉ đọc» bằng chặn trong chính công cụ, bỏ qua tin không chữ bằng một câu báo, không che nhầm số tiền, và bộ đo của hồ sơ cũ thôi xanh giả
slug: hoan-thien-hoi-crm-qua-zalo
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, docs]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-09-26T22:38:41Z
design_doc: docs/superpowers/specs/2026-09-26-hoan-thien-hoi-crm-qua-zalo-design.md
---

# Acceptance Contract: hoan-thien-hoi-crm-qua-zalo

## Context

Nối tiếp `hoi-crm-qua-zalo` (#158, lên production 26/09 20:48). Log production 26/09 20:54
cho thấy eve bỏ qua cả 22 bản thay của `tools/zalo-chi-doc.ts` ở mọi bước sau bước đầu
(«references step function … which is not registered — skipping»), nên công cụ ghi gốc lộ lại
cho model trên Zalo. Vòng này đưa chặn vào chính mỗi công cụ, và gom các Known limit còn treo
của hồ sơ cũ: Ngoài-6/7 (tin không chữ, số tiền) và Ngoài-8..15 (thước xanh giả). Chủ kho
đồng ý gộp 26/09, chọn trả một câu cho tin không chữ, và không chặn tính năng trên production.

Trong mọi AC: «phiên Zalo» là ngữ cảnh công cụ dựng từ `auth` mà eve giả ghi lại khi webhook
thật (`nhanWebhook`, thân khuôn thật `{event_name, message}`) mở phiên cho một thành viên vai
kinh doanh — không dựng tay thuộc tính `purpose`. «Phiên web» là ngữ cảnh không có `purpose`
(như khung chat web; `purposeOf` trả `research`). «Công cụ ghi» là mọi tệp trong
`apps/agent/agent/tools/` không thuộc `ZALO.hoi.congCu.doc` hay `ZALO.hoi.congCu.tat`, nạp
bằng module thật. Test đặt `TZ=Asia/Ho_Chi_Minh`, chạy trên cơ sở dữ liệu riêng của lượt.

## Criteria

- AC-1: Given một phiên Zalo, When `execute` của **từng** công cụ ghi được gọi với đầu vào rỗng `{}`, Then mỗi lời gọi bị từ chối với đúng thông điệp `ZALO.hoi.tuChoiGhi`; và Given một phiên của **mỗi** mục đích khác trong `SESSION_PURPOSES` (web/`research`, `builder`, `team-agent`), When cùng tập công cụ đó được gọi, Then không lời gọi nào bị từ chối với thông điệp đó; tập công cụ ghi rút từ thư mục bằng đúng danh sách viết trước 20 tên (19 tên của `ZALO.hoi.congCu.ghi` hôm nay cùng `web_fetch`), và số lời gọi bằng 20 × số mục đích (ma trận toàn phần — một công cụ ghi mới quên chặn, hay một công cụ ghi bị xếp nhầm sang `doc`, làm ma trận đỏ).
- AC-2 (cross-layer): Given một liên hệ có giá trị trường văn bản V và số hàng mà `record_fact` ghi cho liên hệ đó đã đọc, When phiên Zalo gọi `set_field_value` thật đặt trường đó thành W và `record_fact` thật với một đầu vào hợp lệ cho liên hệ đó, Then DB vẫn giữ V và số hàng không đổi; When phiên web gọi hai công cụ với cùng đầu vào, Then DB đọc lại được W và số hàng tăng đúng 1 (đối chứng: thước nhìn thấy được lần ghi của cả hai công cụ).
- AC-3: Given một máy chủ HTTP cục bộ đếm yêu cầu và trả một chuỗi riêng, When phiên Zalo gọi `web_fetch` tới nó, Then lời gọi bị từ chối với `ZALO.hoi.tuChoiGhi` và máy chủ nhận 0 yêu cầu; When phiên web gọi `web_fetch` tới cùng địa chỉ, Then máy chủ nhận đúng 1 yêu cầu và kết quả chứa chuỗi riêng đó.
- AC-4: Given bộ giải `tools/zalo-chi-doc.ts`, When nó chạy ở `step.started` với phiên Zalo, Then trả đúng tập tên `ZALO.hoi.congCu.ghi ∪ ZALO.hoi.congCu.coSanChan`, và mọi bản thay khi gọi trả `{ok: false, reason: ZALO.hoi.tuChoiGhi}`; When nó chạy với phiên web hay `builder`, Then trả `null`; và bộ giải không còn đăng ký `session.started`.
- AC-5 (cross-layer): Given A đã nối Zalo ZA, vai kinh doanh, When ZA gửi từng tin trong ma trận viết trước — sticker (`event_name` `message.sticker.received`, có `sticker`, không `text`), ảnh không chú thích (`message.image.received`, có `photo_url`, không `text`), ảnh chú thích rỗng (`caption` rỗng), tin chữ chỉ gồm khoảng trắng (`message.text.received`, `text` = «   ») —, Then với mỗi tin webhook trả 200, ZA nhận đúng một `sendMessage` với `text` = `ZALO.loi.chiDocChu`, eve giả không có `send` nào, và số hàng `ZaloHoi` của A không đổi; When ZA gửi tiếp một câu hỏi bằng chữ, Then eve giả có đúng một `send` và một hàng `ZaloHoi` `dang-hoi` (đối chứng); Given B chưa nối, When B gửi sticker, Then B nhận `ZALO.loi.huongDan` như trước; Given đường luật cũ (không `deps.hoi`), When A gửi sticker, Then A nhận `ZALO.loi.daNoiRoi(...)` như trước.
- AC-6: Given ma trận viết trước các số điện thoại đứng liền sau một số khác — «0912345678,0987654321», «0912345678 0987654321», «0912345678-0987654321», «Hạn 2.000.000 đ, gọi 0912345678», «Gọi +84 912 345 678», «Bàn (028) 3823 4567» — và số quốc tế có phần thuê bao viết nhóm bằng dấu chấm, với một hay nhiều ký tự phân cách sau mã nước — «Gọi +84 912.345.678 nhé», «SĐT +84.912.345.678», «SĐT 0084 912.345.678», «SĐT (+84) 912.345.678», «Gọi +84  912.345.678», «Gọi 0084 - 912.345.678», «SĐT (0084) 912.345.678» (thêm 27/09 theo chủ kho), When `locTraLoi` lọc từng câu, Then mọi số điện thoại trong đó bị che và «2.000.000» giữ nguyên; và ma trận `loc-che` đang có của `zalo-loc.spec.ts` vẫn bị che đủ từng phần tử. Vế «số tiền từ 1.000 tỷ trở lên giữ nguyên» đã bỏ 27/09 sau trần 3 round (xem Known limits).
- AC-7: Given ca `nguong` của hồ sơ cũ, When ca dựng dữ liệu cho dòng trần ngày và dòng đang bận, Then các hàng `tu-choi-tran-ngay` và `dang-ban` sinh bằng `hoiTacTu` thật chạm trần và chạm câu chưa xong, không có `zaloHoi.create` nào trong tệp test đó; bảng số đo in ra khớp kỳ vọng tính tay từ kịch bản mới (các hàng hỏi thật đi kèm làm đổi số câu, số người, tỉ lệ, độ trễ — tính tay, không chép đầu ra).
- AC-8: Given các ca `cai-lenh` và «trả lời muộn» (`dang-ban`) của hồ sơ cũ, When chúng chạy, Then ca `cai-lenh` khẳng định có đúng một `sendMessage` tới người hỏi và tin đó chứa `ZALO.hoi.an` **trước** khi khẳng định tin không chứa số điện thoại; ca «trả lời muộn» khẳng định `loai === "hoi"` bằng một assert (không bọc `if`) và ghim dòng log bằng đúng một chuỗi (không OR).
- AC-9: Given các ca `cung-phien` và `duong-chinh` của hồ sơ cũ, When phiên phát `input.requested`, Then token mới **bằng** `ZALO.hoi.tienToBo + <hoiId của đúng hàng đang chờ>`; và mọi sự kiện kênh trong hai ca đó dùng `continuationToken` và thuộc tính phiên rút từ lời gọi `send` mà eve giả ghi lại, không chuỗi token hay `ctx` nào dựng tay.
- AC-10: Given ca `luat-cu` của hồ sơ cũ ô (c), When người đã nối trả «xong n» trên đường luật cũ, Then ca khẳng định bước tương ứng đọc lại từ DB có `completedAt` khác null (quan hệ), không chỉ so chuỗi câu trả lời.
- AC-11: Given một thành viên vai kinh doanh, một người vai chỉ OKR và một người mất hàng `member`, When mỗi người đi qua cổng của khung chat web (`repFromCrm` với JWT ký đúng) và qua `hoiTacTu` của Zalo, Then hai lối vào cho cùng kết quả cho từng người — vai kinh doanh được mở, hai người kia bị từ chối; ca cũ grep `channels/eve.ts` bị gỡ.

## Coverage

Quét bằng `morphological-scan` (tự dựng trục, preset test-matrix làm khung). Chân sản phẩm:
`[SUY-TỪ-REPO: apps/agent/agent/lib/zalo-config.ts]`, `[SUY-TỪ-REPO: apps/agent/agent/lib/session-purpose.ts]`,
`[SUY-TỪ-REPO: _acceptance/hoi-crm-qua-zalo/review-findings.md]`. Chân ngành:
`[NGÀNH: OWASP Top 10 for LLM Applications 2025 — LLM06 Excessive Agency]` (quyền công cụ tối
thiểu, chặn ở phía công cụ chứ không ở lời nhắc) và `[NGÀNH: Telegram Bot API — tin không chữ]`.

- Trục A · Loại công cụ: ghi tự viết | đọc tự viết | có sẵn chạy ở app (`web_fetch`) | có sẵn chạy ở nhà cung cấp (`web_search`) | hỏi lại (`ask_question`) | hộp cát (`bash`, tệp) | tắt (`agent`) [thước CE: danh sách tệp `tools/` + `eve/docs/concepts/default-harness.md`]
- Trục B · Mục đích phiên: Zalo | web (`research`) | `builder` | `team-agent` [thước CE: `SESSION_PURPOSES`]
- Trục C · Bước của lượt: bước đầu | bước replay [thước CE: log production 26/09 20:54]
- Trục D · Tin đến: chữ | rỗng/khoảng trắng | sticker | ảnh (có/không chú thích) | tệp × người gửi chưa nối | đã nối vai kinh doanh | vai chỉ OKR × đường có hỏi | luật cũ [thước CE: `lib/zalo-nhan.ts`, `[NGÀNH: Zalo Bot Platform — event_name message.image.received, message.sticker.received; trường photo_url, caption, sticker theo SDK cộng đồng go-zalo-bot-api, zalobot-sdk]`]
- Trục E · Chuỗi số: điện thoại VN | quốc tế | điện thoại đứng liền sau số khác | quốc tế nhóm bằng dấu chấm (một hay nhiều ký tự phân cách) | số tiền nhỏ [thước CE: ma trận `loc-che` hiện có, phản biện gap-probe F3]
- Ô → AC: A ghi × B Zalo × C mọi bước → AC-1, AC-2 (chặn trong công cụ không phụ thuộc bước) · A ghi × B web → AC-1 đối chứng, AC-2 · A `web_fetch` → AC-3 · lớp ẩn công cụ → AC-4 · D → AC-5 · E → AC-6 · thước cũ → AC-7..AC-11.
- Later: A `web_search` × B Zalo × C replay — nhà cung cấp chạy, không bọc được; chỉ ẩn bằng AC-4, đo bằng log production ở Notes. A `ask_question` × C replay — đã có đường `canHoiLai`. D vai chỉ OKR × không chữ nhận `chiDocChu` thay vì câu từ chối vai (không lộ gì; câu chữ kế tiếp vẫn bị từ chối).
- B `builder`, `team-agent` × công cụ ghi → AC-1 đối chứng (phản biện gap-probe F1).
- Never: A đọc × B Zalo (được phép theo thiết kế); A hộp cát (deny-all, không `DATABASE_URL`); A `agent` (đã `disableTool`); B `builder`/`team-agent` × Zalo (một phiên chỉ có một mục đích).
- [GIẢ ĐỊNH] Tên sự kiện và trường của tin tệp chưa có nguồn — webhook không lọc theo `event_name`, nên tin tệp đi cùng đường với sticker; kho chưa có payload production của tin không chữ nào.
- Later: ảnh có chú thích chữ — chú thích nằm ở `caption`, không ở `text`; vòng này coi là tin không chữ.
- [GIẢ ĐỊNH] Công cụ của `step.started` là «live tools» dựng trước mỗi lần gọi model nên không đi đường dựng lại theo tên hàm bước — đọc từ `eve/dist/src/context/dynamic-tool-lifecycle.js`, chưa đo trên runtime workflow thật; sai thì chỉ mất lớp ẩn, chặn của AC-1..AC-3 vẫn đứng.

## Out of scope

- Ngoài-3 của hồ sơ cũ: tên `zalo-chi-doc` trong allowlist telemetry và `TOOL_VERBS` — tên không bao giờ phát ra, chỉ thừa một mục (sổ quyết định).
- Chặn cứng `web_search` trên Zalo — do nhà cung cấp chạy, không có `execute` trong kho.
- Đổi ranh giới dữ liệu A, trần, bảng `ZaloHoi`, telemetry, chỉ dẫn `CHI_DAN_ZALO`.
- Tái hiện replay của runtime workflow trong test.
- Tài liệu (`docs/plan/lo-trinh-zalo.md`, `opportunity.md` của hồ sơ cũ) sửa trong cùng PR như việc T1, không có AC.

## Notes

- Sau khi lên production: chủ kho hỏi bot hai câu liên tiếp trong một phiên, rồi `vercel logs -p crm-onehub-agent --scope phanlemanh-8330s-projects --environment production --no-branch --since <mốc> --json` — đúng là không còn dòng `not registered` nào của `zalo-chi-doc`, và không có lời gọi công cụ ghi nào thành công. Có dòng đó thì lớp ẩn (AC-4) chưa sống, chặn của AC-1..AC-3 vẫn giữ.
- Lệnh thử tay của hồ sơ cũ («đổi giai đoạn thoả thuận» rồi đọc DB) chỉ chạy được an toàn sau khi vòng này lên production.
- Cổng Giá trị thuộc hồ sơ `hoi-crm-qua-zalo`, đồng hồ tính từ 26/09; vòng này không có hồ sơ cơ hội riêng.

### Known limits (dừng-vá sau S4 round 2, 2026-09-27, chủ kho chọn (a))

- AC-9: rào đọc mã nguồn trong ca «rut tu send» chỉ chặn một phần — không kiểm thuộc tính phiên (tham số thứ ba) của lời gọi kênh trực tiếp, số chỗ được kiểm không bằng số điểm phát sự kiện, dạng viết tắt `{ continuationToken }` lọt, và `tokenTuSend` tự ghép tiền tố `zalo:` thay vì lấy từ `createSendFn` của eve. Mã hiện tại đúng (mọi sự kiện đi qua `suKienTuSend`/`phienTuSend`); giới hạn là của phép đo quy ước, không phải của hành vi. Hai round vá liền cùng lớp «tuyên quét lớp nhưng chặn theo tên» nên dừng.

### Known limits (trần 3 round, 2026-09-27, chủ kho chọn (a))

- Số tiền từ 1.000 tỷ trở lên (Ngoài-7 của `hoi-crm-qua-zalo`) vẫn bị che một phần, ví dụ «1.000.000.000.000 đ» thành «1.[đã ẩn] đ». Ba round vá bằng phép nhìn lùi trong regex đều đổi lỗi này lấy lỗi khác, và bản cuối làm lộ ba dạng số điện thoại quốc tế mà bản gốc vẫn che; chủ kho chọn trả bộ che về bản gốc (`f9932858`) — riêng tư trước, thẩm mỹ sau. Làm lại phần phân biệt số tiền là một hợp đồng riêng.
