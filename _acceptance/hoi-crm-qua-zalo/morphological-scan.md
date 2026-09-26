# Quét độ phủ AC — hoi-crm-qua-zalo (preset test-matrix)

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub, bot Zalo của xưởng nối vào trợ lý AI (`apps/agent`, eve) — chân sản phẩm: đào repo (`CONTEXT.md` mục Bot Zalo · Vai «chỉ OKR» · Phạm vi dữ liệu · Trợ lý AI; `docs/agent.md`; `apps/agent/agent/lib/zalo-*`; `apps/agent/agent/channels/{eve,crm,zalo}.ts`) và bốn quyết định ở `opportunity.md` · chân ngành: `[NGÀNH: Salesforce Agentforce in Slack]` (trợ lý CRM trong kênh chat, trả lời theo quyền người hỏi, không ghi khi chưa duyệt) · `[NGÀNH: Telegram Bot API]` (webhook gửi lại khi không 200, giới hạn ký tự mỗi tin, lệnh `/new`) · `[NGÀNH: Zalo Bot API — bot.zaloplatforms.com]` (đã đọc 23/09: chỉ chữ trơn 2.000 ký tự, không nút, webhook loại trừ getUpdates).

## Trục

- Trục A · Người nhắn: đã nối, vai kinh doanh (owner/admin/member) | đã nối, vai `okr` | đã nối nhưng hàng `member` đã mất | chưa nối | đang bị chặn vì mã sai | bot hoặc chat nhóm [thước CE: `[SUY-TỪ-REPO: apps/agent/agent/channels/eve.ts]` (cổng vai `repFromCrm`), `[SUY-TỪ-REPO: packages/validation/src/vai-workspace.ts]`, `[SUY-TỪ-REPO: apps/agent/agent/lib/zalo-nhan.ts]` (bị chặn, nhóm), `[NGÀNH: Salesforce Agentforce in Slack]` (từ chối theo quyền)]
- Trục B · Nội dung tin: mã 6 số | lệnh `xong n` | lệnh `mới` | câu hỏi thường | tin cài lệnh (bỏ luật, liệt kê mọi khách, đổi dữ liệu) | tin không có chữ (ảnh, sticker) | tin dài quá 2.000 ký tự [thước CE: `[SUY-TỪ-REPO: apps/agent/agent/lib/zalo-lenh.ts]`, hồ sơ `tra-loi-tin-nhac` (mã và lệnh giữ luật cũ), `[NGÀNH: Telegram Bot API]` (`/new`), rủi ro «tin cài lệnh» của `docs/plan/lo-trinh-zalo.md`]
- Trục C · Trần: dưới mọi trần | chạm 3 câu/phút | chạm 20 câu/ngày (giờ xưởng) | chạm 1.500 câu/tháng | vừa qua ngày mới hay tháng mới (đếm lại) [thước CE: `opportunity.md` mục 2, `[SUY-TỪ-REPO: apps/agent/agent/lib/zalo-bot-xuong.ts]` (giờ xưởng), luật ngưỡng-phải-có-ca-dưới-ngưỡng của `eval-executors.md`]
- Trục D · Phiên tác tử: chưa có phiên cho chat này | phiên đang bận câu trước | trả lời xong | tác tử lỗi (`turn.failed`) | tác tử im quá hạn | trả lời dài hơn 2.000 ký tự | trả lời chứa số điện thoại hay email cá nhân | tác tử gọi công cụ ghi [thước CE: `[SUY-TỪ-REPO: apps/agent/agent/channels/crm.ts]` (sự kiện `message.completed`, `turn.failed`, `session.waiting`), `[SUY-TỪ-REPO: apps/agent/node_modules/eve/docs/channels/custom.mdx]`, `[SUY-TỪ-REPO: docs/agent.md]` mục «Stale rows are closed on the dispatch tick»]

Bốn trục độc lập: người nhắn không quyết nội dung; nội dung không quyết trần; trần không quyết phiên trả lời thế nào.

## Không gian và cắt

Tích đầy đủ 6 × 7 × 5 × 8 = 1.680 ô; quét theo lát cắt của trục A (người nhắn) vì mọi ô khác chỉ có nghĩa khi người đã nối và có vai kinh doanh.

## Core (làm ngay)

1. A kinh doanh × B câu hỏi × C dưới trần × D chưa có phiên → trả lời xong — đường chính: mở phiên eve mang principal người hỏi, giao trả lời ra Zalo, ghi hàng hỏi.
2. A kinh doanh × B câu hỏi × D phiên đã có → cùng phiên (continuation token theo chat) — nhớ ngữ cảnh.
3. A `okr` × B câu hỏi → từ chối trước khi mở phiên, không hàng phiên nào — cổng vai.
4. A hàng `member` mất (liên kết còn) × B câu hỏi → từ chối như vai `okr`.
5. A chưa nối / bị chặn / nhóm × B câu hỏi → luật cũ giữ nguyên (hướng dẫn nối; im; bỏ qua).
6. B mã 6 số, B `xong n` → luật cũ giữ nguyên, không rơi vào tác tử.
7. B `mới` → `reset` phiên, câu xác nhận; câu hỏi kế mở phiên mới.
8. B tin cài lệnh × D tác tử gọi công cụ ghi → công cụ ghi trên kênh Zalo bị thay bằng bản từ chối, không hàng DB nào đổi; bánh cóc: mọi công cụ trong `tools/` phải thuộc danh sách đọc hoặc danh sách ghi.
9. D trả lời chứa số điện thoại/email → bộ lọc che trước khi gửi; đối chứng dương trên fixture có số.
10. D trả lời dài quá 2.000 → cắt theo đoạn, gửi nhiều tin, tối đa 3.
11. C chạm phút / ngày / tháng → từ chối bằng đúng câu, hàng hỏi ghi lý do; ca ngay dưới trần phải đi qua; qua ngày mới đếm lại theo giờ xưởng.
12. D tác tử lỗi → câu «không trả lời được», hàng hỏi `loi`; D im quá hạn → tick đóng hàng, gửi câu lỗi một lần.
13. D phiên đang bận → «đang trả lời câu trước», không mở lượt mới.
14. Cross-cutting: cùng `message_id` hai lần → một hàng hỏi, một lượt `send`; DB lỗi → 500 để Zalo gửi lại; nội dung tin và câu trả lời không vào log.
15. Đường đo: hàng hỏi mang token vào/ra, độ trễ; script `rang/nguong.ts` đọc khoảng ngày.
16. Tài liệu và từ điển: luật 4 `docs/agent.md` + `skills/data-boundaries.md`; `CONTEXT.md` Bot Zalo và Trợ lý AI; telemetry đếm hàng hỏi vào `install_daily`.

16 ô Core trên ~85 ô có nghĩa (≈19%).

## Later

- B tin không có chữ (ảnh, sticker) → bot nói «chỉ hiểu chữ»; vòng này bỏ qua như tin không chữ hiện nay (không trả lời).
- B tin dài quá 2.000 ký tự → cắt ở 2.000 trước khi gửi tác tử; không có AC riêng.
- C trần tháng đổi được trên màn hình (cột `AppSetting`) — chờ số đo 30 ngày.
- D «đang gõ» (`sendChatAction`) — làm nếu rẻ, không có AC.
- Nấc ghi có «ĐỒNG Ý» — nấc sau, lộ trình mục 4.

## Never

- A bot / chat nhóm × mọi B — nền tảng đánh dấu nhóm là Beta, bot chỉ nói chat riêng (`lo-trinh-zalo.md` mục 6).
- Hỏi đáp OKR (AI-07) — lượt 10 OKR, chủ kho quyết tách 26/09.
- Xác nhận lại người cầm máy trước mỗi câu — chủ kho chấp nhận rủi ro ở nấc chỉ đọc 26/09.
- `[NGÀNH: Salesforce Agentforce in Slack]` nút hành động trong tin — Zalo không có nút.

## Cross-cutting áp mọi ô Core

- Ngày/tháng của trần tính theo giờ xưởng (`gioNhac`/múi giờ của `zalo-bot-xuong.ts`), không UTC.
- Idempotency theo `message_id` qua `ZaloUpdateSeen` cho mọi nhánh.
- Không log nội dung: chỉ `message_id`, id hàng hỏi, lý do.
- Thiếu `ZALO_BOT_TOKEN` hay khoá webhook → 404 như hôm nay; không biến môi trường mới.
