# zalo-hoi-okr-khong-chet — thiết kế

Nguồn: `opportunity.md` (S0, bằng chứng máy đo và production). Phạm vi: chuyện (C) — `tro_ly_okr` bị gọi ngoài phiên OKR làm chết lượt. (A) webhook 403 và (B) lý do `sendMessage` bị nuốt là hàng khác.

## Hiện trạng

- `tro_ly_okr` là subagent khai sẵn (`agent/subagents/tro_ly_okr/`), mô tả «Trợ lý OKR. Reads one OKR task…». eve đưa mọi subagent khai sẵn vào bộ công cụ của agent gốc ở MỌI phiên — không có cơ chế giấu subagent theo phiên (`eve/docs/subagents.mdx`; `dist/src/harness/advertised-tools.js` chỉ giấu công cụ `agent` dựng sẵn).
- Hook `agent/hooks/okr-uy-quyen.ts`, ở `actions.requested`: phiên không phải `okr` mà xin gọi `tro_ly_okr` → `throw new Error(LOI_UY_QUYEN.ngoaiOkr)`. Theo `eve/docs/guides/hooks.md` («What happens when a hook throws»), hook ném là `turn.failed` — không có đường trả về một kết quả công cụ từ hook.
- Hệ quả trên máy đo: model gốc purpose `zalo` thấy «Trợ lý OKR» cho câu hỏi KR, gọi nó, hook ném, lượt chết, người hỏi nhận câu lỗi chung.

## Hai cách giám sát nêu, sau khi soi tài liệu eve

1. «Không lộ `tro_ly_okr` cho agent gốc khi không có phiên OKR»: eve không cho bỏ một subagent khỏi bộ công cụ theo phiên. Cách gần nhất là ĐÈ tên đó bằng một công cụ động (dưới).
2. «Hook trả từ chối thành kết quả công cụ»: hook không trả kết quả được; ném là chết lượt. Kết quả từ chối chỉ có thể đến từ một công cụ.

Cả hai quy về cùng một cơ chế mà kho đã dùng hai lần — `agent/tools/zalo-chi-doc.ts` và `agent/tools/okr-chi-tro-ly.ts`: `defineDynamic` ở `step.started` trả một `defineTool` cùng tên, `execute` trả `{ ok: false, reason }`. `eve/docs/guides/dynamic-capabilities.md` («Conflicts»): công cụ động trùng tên một bản khai sẵn thì ĐÈ bản đó; subagent dùng chung không gian tên với công cụ (`subagents.mdx`).

## Cách sửa

- Tệp mới `agent/tools/tro-ly-okr-ngoai.ts`: `defineDynamic({ events: { "step.started": (_e, ctx) => purposeOf(ctx) === "okr" ? null : { tro_ly_okr: defineTool({ description, inputSchema: z.looseObject({}), execute: () => ({ ok: false, reason }) }) } } })`.
- `description` và `reason` là hằng mới `TRO_LY_OKR.ngoaiPhien` trong `lib/okr/config.ts`. `description` nói rõ công cụ này không trả số liệu OKR trên kênh hiện tại; `reason` dặn model trả lời người hỏi rằng tiến độ OKR/KR xem trong OneHub Center, mục OKR — để câu trả lời có nghĩa chứ không phải câu lỗi.
- Hook `okr-uy-quyen` GIỮ NGUYÊN: nếu vì lý do nào đó subagent thật vẫn bị xin gọi ngoài phiên OKR, nó vẫn bị chặn (ranh giới dữ liệu OKR của tro-ly-okr-nen không đổi).
- Phiên `okr` không đổi gì: resolver trả `null`, subagent thật còn nguyên.

## Đã cân và bỏ

- Cho hook để lọt `tro_ly_okr` ngoài phiên OKR rồi để subagent tự từ chối: subagent con không đọc được mục đích phiên gốc ở `session.started` (ghi nhớ «eve: session.started không có parent»), và mỗi lần lọt là một phiên con + có thể một lời gọi model.
- Sửa chỉ dẫn kênh Zalo (`lib/zalo-chi-dan.ts`) dặn «đừng gọi tro_ly_okr»: mềm, model vẫn có thể gọi; và tệp nằm ngoài ranh giới.
- Cho Zalo đọc số liệu OKR thật: là tính năng mới, đụng ranh giới dữ liệu OKR/ZDR; ngoài hàng sửa nóng.

## Rủi ro đã biết

Ghi nhớ 26/09 «eve bỏ công cụ động khi replay»: trên production, ở bước replay, eve từng bỏ qua công cụ động của `zalo-chi-doc` («references step function … which is not registered — skipping»). Nếu xảy ra với tệp mới, subagent thật lộ lại ở bước replay đó và hook chặn như hôm nay. Không có phép đo máy cho replay; ghi Known limit. Phép đo thật duy nhất là lượt eve thật trên máy đo (AC-1).

## Đo

- Tái hiện c33 qua Zalo bằng máy đo `tro-ly-doc-kho/rang/cham-bo-do.ts` (eve dev thật, Zalo giả, model thật như production) với một bộ câu riêng chỉ có c33, chạy ba lượt; đọc thẳng `ket-qua.jsonl` (`ketQua`) và `eve.log` của lượt — không dựa vào nhãn của bộ chấm (bộ chấm trên onehub còn tính ZaloHoi `loi` là «không chuyển», lỗi đó F12 sửa).
- Ma trận resolver × tám mục đích phiên, gọi thẳng resolver thật.
- Bản sao không có tệp mới → lượt c33 đỏ với dòng «may be called only from an OKR session» (chiều đỏ của AC-1).
- Sáu lượt c33 liền, lượt nào cũng phải trả lời có nghĩa và không chết; KHÔNG đòi model gọi `tro_ly_okr` (đo 08/10: có công cụ đè thì 0/6 lượt gọi — model đọc mô tả «không dùng được ở đây» rồi tự trả lời). Số lượt có gọi chỉ ghi lại; đường có gọi do ma trận resolver (E2) và cặp phá (E5) chứng. Chủ kho chốt cách đo này ở Cổng 1 ngày 08/10.
- Phiên OKR thật không bị đè: chạy lại E9 của tro-ly-okr-nen (eve thật, cổng `calledSubagent('tro_ly_okr')`).

## Đặc tả UX

Không chạm màn web. Câu trả lời trên Zalo là chữ của model; hợp đồng chỉ hứa nó không phải câu lỗi chung và có nhắc OKR.
