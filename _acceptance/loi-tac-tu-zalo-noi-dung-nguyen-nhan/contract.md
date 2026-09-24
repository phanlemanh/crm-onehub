---
schema_version: 1
feature: Lỗi trên đường API → tác tử → Zalo nói đúng nguyên nhân cho người dùng (luuBot, guiThu) và để lại một dòng log có mã và nguyên nhân cho người vận hành, thay cho câu chung «Tác tử chưa nối được»
slug: loi-tac-tu-zalo-noi-dung-nguyen-nhan
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui, docs]
status: approved
design_doc: docs/superpowers/specs/2026-09-24-loi-tac-tu-zalo-noi-dung-nguyen-nhan-design.md
approved_by: Phan Le Manh
approved_at: 2026-09-24T09:39:27Z
---

# Acceptance Contract: loi-tac-tu-zalo-noi-dung-nguyen-nhan

## Context

Cổng Bằng chứng của `noi-zalo-cho-nguoi-moi` hai lần quyết «mở hợp đồng mới» cho
cùng một phát hiện (Ngoài-6 vòng 1, Ngoài-8 vòng 3; `decisions.jsonl` dòng 22 và 37
của hồ sơ đó). Mọi hỏng hóc trên đường API → tác tử → Zalo đều thành một câu «Tác tử
chưa nối được» (400), và API không ghi dòng log nào có mã hay nguyên nhân. Vòng này
gộp luôn Known limits Ngoài-1 vòng 1 (= Ngoài-5 vòng 3): mọi lỗi cầu nối thành cùng
một câu, và mã khác 2xx không được ghi log.

Người dùng: quản trị viên đặt bot ở Kết nối › Zalo (`zalo.luuBot`); thành viên gửi
tin thử ở Thông báo của bạn (`zalo.guiThu`). Người vận hành: người cài đặt CRM, đọc
log của API và tác tử. Source input: prompt của chủ kho 24/09 · thiết kế lối B chủ
kho duyệt trong chat 24/09 · design doc ở `design_doc`.

## Criteria

- AC-1: Given tác tử giả tại chỗ và hai người gọi — quản trị viên gọi `zalo.luuBot` với token đúng dạng, thành viên gọi `zalo.guiThu`, When cầu nối lần lượt ở sáu tình trạng (a) `AGENT_BRIDGE_SECRET` rỗng; (b) `AGENT_URL` trỏ `http://127.0.0.1:1`, địa chỉ đã thăm dò là từ chối kết nối ngay trước ô đo; (c) tác tử trả 401; (d) tác tử trả 500; (e) tác tử trả 200 với JSON không đúng khuôn của `packages/validation/src/zalo-cau-noi.ts`; (f) tác tử trả 200 với thân không phải JSON (`text/html`), Then cả mười hai lời gọi nhận lỗi yêu cầu (HTTP 400, không phải 500), thông điệp của mỗi ô bằng đúng câu của nguyên nhân đó trong `ZALO_THONG_DIEP` — (e) và (f) cùng câu sai khuôn —, năm câu của năm nguyên nhân đôi một khác nhau, câu (d) chứa «500», và không câu nào chứa «Tác tử chưa nối được».
- AC-2: Given đúng ma trận mười hai ô của AC-1, với Bot Token gửi qua `luuBot` và khoá cầu nối là hai chuỗi đánh dấu, When mỗi lời gọi hỏng, Then API ghi đúng một dòng `warn` cho lời gọi đó, mang `duong` bằng đường cầu nối đã gọi, `nguyenNhan` bằng tên nguyên nhân của ô (`thieu-cau-noi` · `khong-toi-duoc` · `sai-khoa` · `tac-tu-loi` · `sai-khuon`, cả (e) lẫn (f) là `sai-khuon`), và `status` bằng 401 ở (c), 500 ở (d); dòng log in ra (tuần tự hoá như console in, kể cả đối tượng lỗi) không chứa Bot Token, khoá cầu nối hay chuỗi đánh dấu mà tác tử giả nhét vào thân phản hồi ở (d), (e), (f).
- AC-3: Given `AppSetting` đang có bot A (token, khoá webhook, tên «Bot Cũ», url webhook) và tác tử thật nhận cầu nối ở gốc `https://`, When quản trị viên gọi `zalo.luuBot` với token B mà Zalo giả (a) ở `http://127.0.0.1:1`, địa chỉ từ chối kết nối; (b) trả HTTP 500 cho `getMe`; (c) trả 200 cho `getMe` với thân không đúng khuôn; (d) trả 200 `{ok:false, error_code:500}` theo vỏ lỗi Zalo thật; (e) trả HTTP 401; (f) trả 200 `{ok:false, error_code:401}`, Then (a) tới (d) nhận lỗi yêu cầu với câu `ZALO.loi.zaloKhongTraLoi` (có «Zalo đang không trả lời»), (e) và (f) nhận câu «Zalo không nhận token này»; không ô nào có lời gọi `setWebhook`, và năm cột Zalo của `AppSetting` bằng đúng trước khi gọi. (cross-layer)
- AC-4: Given thành viên U đã nối Zalo và tác tử thật đứng sau cầu nối, When U gọi `zalo.guiThu` mà `sendMessage` của Zalo giả (a) ở `http://127.0.0.1:1`, địa chỉ từ chối kết nối; (b) trả 500; (c) trả 200 với `ok:false`; (d) trả 200 với thân không đúng khuôn, Then cả bốn nhận lỗi yêu cầu với câu `ZALO_THONG_DIEP.guiHong.zalo` (có «Zalo chưa nhận tin thử»), không ô nào trả `{kenh: "zalo"}`; còn khi `sendMessage` gửi được thì trả `{kenh: "zalo"}`. (cross-layer)
- AC-5: Given thành viên V chỉ khớp Slack, When `guiThu` của tác tử chạy với Slack giả trả lỗi, Then tác tử trả `guiDuoc: false` với `kenh: "slack"` thay vì ném; và When API nhận phản hồi `{kenh: "slack", lech: false, guiDuoc: false}` từ cầu nối, Then V nhận lỗi yêu cầu với câu `ZALO_THONG_DIEP.guiHong.slack` (có «Slack chưa nhận tin thử»).
- AC-6: Given Bot Token đang lưu là một chuỗi đánh dấu T, When `getMe` (qua `luuBot`) và `sendMessage` (qua `guiThu`) hỏng vì Zalo ở `http://127.0.0.1:1` — địa chỉ gọi mang T trong đường dẫn — và vì Zalo trả 500, Then tác tử in ít nhất một dòng `console.error` có tiền tố `[zalo]` nêu tên method và lớp hỏng (`mang` / `http-500`) cho mỗi lần hỏng, và không đối số log nào của tác tử hay của API trong suốt ca — tuần tự hoá như console in ra, kể cả đối tượng lỗi với `message`, `stack`, `cause` — chứa T.
- AC-7: Given màn Thông báo của bạn với khối Zalo đã nối, When bấm «Gửi thử nhắc ngay» và `zalo.guiThu` lỗi với thông điệp M, Then một phần tử `role="alert"` hiện đúng M; When lỗi có thông điệp rỗng, Then phần tử đó hiện `guiThuLoi` của tiếng đang chọn; When bấm lại và lần sau gửi được, Then phần tử `role="alert"` biến mất.
- AC-8: Given tác tử đời trước trả phản hồi `guiThu` không có trường `guiDuoc` (`{kenh: "zalo", lech: false}`), When thành viên gọi `zalo.guiThu`, Then API trả `{kenh: "zalo"}` như trước, không đọc thành lỗi sai khuôn.
- AC-9: Given nhánh này, When đọc `docs/agent.md` và bảng mục 7 của `docs/plan/lo-trinh-zalo.md`, Then mục Zalo của `docs/agent.md` nêu hai kết cục mới của cầu nối (`zalo-loi`, `guiDuoc`) và việc tác tử không ném khi Zalo hỏng; bảng mục 7 có đúng một dòng cho `loi-tac-tu-zalo-noi-dung-nguyen-nhan` với Trạng thái thuộc tập giá trị của mục đó.
- AC-10: Given tám câu lỗi mới (năm câu cầu nối, `zaloKhongTraLoi`, hai câu `guiHong`), When người đọc là thành viên hoặc quản trị viên không biết kỹ thuật, Then mỗi câu nói đúng chặng hỏng, nói người đọc làm gì tiếp (thử lại sau hay báo người cài đặt CRM), không dùng chữ «tác tử», «agent» hay tên biến môi trường, và viết tiếng Việt có dấu. (judgment)

## Coverage

Quét bằng `morphological-scan` (preset test-matrix) —
`_acceptance/loi-tac-tu-zalo-noi-dung-nguyen-nhan/morphological-scan.md`.

- Trục A · Thao tác: luuBot | guiThu [thước CE: `ZALO_CAU_NOI` có đúng hai đường]
- Trục B · Chặng hỏng: cầu nối API↔tác tử | dịch vụ ngoài tác tử gọi (Zalo; Slack chỉ với guiThu) [thước CE: chuỗi gọi thật API → `bridge()` → route eve → `zaloGoi`/`guiSlackRieng`]
- Trục C · Kiểu hỏng: chưa cấu hình | không tới được | bị từ chối | lỗi phía kia | sai khuôn [thước CE: ngành — RFC 9457 Problem Details, Telegram Bot API (`ok:false` + `error_code`)]
- Trục D · Vật quan sát: câu người dùng thấy | dòng log | không lộ bí mật | trạng thái lưu không đổi, không báo thành công giả [thước CE: ngành — OWASP Logging Cheat Sheet, Google AIP-193]
- Ô → AC: cầu nối × 5 kiểu (sai khuôn tách JSON sai / không phải JSON) × 2 thao tác → AC-1, AC-2 · `getMe` hỏng (mạng, 5xx, sai khuôn, `ok:false` 5xx; đối chứng HTTP 401 và `ok:false` 401) → AC-3 · `sendMessage` hỏng (mạng, 5xx, `ok:false`, sai khuôn) → AC-4 · Slack hỏng → AC-5 · không lộ token → AC-6 · màn → AC-7 · lệch phiên bản → AC-8.
- Ô gạch: «chưa cấu hình» ở Zalo/Slack với guiThu — kênh chỉ được chọn khi đã có token; «chưa cấu hình» ở `getMe` đã có câu `khongCoToken`, không đổi.
- [GIẢ ĐỊNH] Câu trên màn gọi tác tử là «dịch vụ nhắc việc» (chữ thường, chưa thêm mục `CONTEXT.md`) để tránh lẫn với **Tác nhân**.
- [GIẢ ĐỊNH] Vỏ lỗi `getMe` `{ok:false, error_code, description}` lấy theo vỏ Zalo thật đo được khi lái thử 23/09 ở `getUpdates` (`{"ok":false,"error_code":408,"description":"Request timeout"}`); chưa bắt được một phản hồi `getMe` hỏng thật.
- [GIẢ ĐỊNH] Người vận hành đọc log bằng `vercel logs` / log dev; không cần kênh báo động riêng.

## Out of scope

- Mã HTTP theo nguyên nhân (502/503 thay cho 400) — phải chạm `DomainErrorMiddleware` dùng chung cho mọi router.
- Câu lỗi hai thứ tiếng: API vẫn trả câu tiếng Việt (lối B), cùng món nợ câu lỗi `luuBot` đang có; giao diện tiếng Anh thấy câu tiếng Việt ở hai chỗ này.
- Tách «người nhận đã chặn bot» khỏi «Zalo đang lỗi» khi gửi tin thử.
- API ghi log cả kết cục miền (Zalo hỏng): tác tử đã ghi, API ghi lại là trùng.
- Tự thử lại lời gọi hỏng — gửi tin thử hai lần là tệ hơn báo lỗi.
- Sửa màn hình hiện bot cũ sau khi gọi thử webhook hỏng (Ngoài-2 vòng 3) — hợp đồng `goi-thu-hong-man-noi-that` của phiên song song.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Lối B (câu ở API, app hiện `e.message`) chủ kho duyệt ở brainstorm 24/09.
- Hai khẳng định «Tác tử chưa nối được» trong `apps/api/test/noi-zalo-cho-nguoi-moi.spec.ts` (E15 của hồ sơ đã ký `noi-zalo-cho-nguoi-moi`) đổi sang câu mới; lời hứa của E15 («lỗi yêu cầu, không ném») giữ nguyên. Hai spec do `nzm_giu_da_ky` / `zqw_giu_nqz` canh không bị chạm.
- Lệch phiên bản lúc triển khai: API cũ + tác tử mới đọc một lần gửi thử hỏng thành «đã gửi» cho tới khi API lên; triển khai tay thì cho API lên trước.
- Phiên song song `goi-thu-hong-man-noi-that` cùng chạm `zalo-bot-xuong.ts` (nhánh `xac-minh-hong`) và có thể cùng thêm nhánh vào `datBotPhanHoi`; phiên nào lên sau thì gộp.
