---
schema_version: 1
feature: Quyền của lượt builder mang theo tường minh — bỏ luật suy commandType từ hình dạng tin nhắn, câu trả lời kế thừa đúng quyền của lượt đã hỏi, và dạy con agent_builder cửa ra not_authorized
slug: quyen-luot-mang-theo
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [agent, api]
status: verified
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-08T13:46:43Z
design_doc: docs/superpowers/specs/2026-09-08-quyen-luot-mang-theo-design.md
---

# Acceptance Contract: quyen-luot-mang-theo

## Bối cảnh

Vòng `chan-uy-thac-sai-luot` dựng một cổng quyền ở tầng tool. Vòng chấm S4 của
nó tìm ra cổng **bị vượt qua đường `ask_question`**, và tìm ra ở vòng thứ ba —
vì bộ đo lúc ấy ghi đè thẳng trường `commandType` trong fixture nên chưa bao giờ
đi qua chỗ hỏng.

Chuỗi hỏng: nhánh CHAT của chỉ dẫn cha bảo mô hình gọi `ask_question` khi thiếu
một quyết định → người dùng bấm trả lời → `builderCommandType` nâng mọi
submission có `inputResponse` lên `CREATE_AGENT`, và API ghim cứng `CREATE_AGENT`
cho mọi câu trả lời → lượt kế được phép dựng agent.

Gốc: quyền đang được **suy ra từ hình dạng tin nhắn** thay vì được cấp và mang
theo.

## Mốc ghim

SHA của cây TRƯỚC vòng này:

```
9ec0251
```

Neo, đếm tại SHA ấy:

| Neo | Số |
| --- | --- |
| chỗ suy `commandType` từ hình dạng tin nhắn | 1 |
| chỗ ghim cứng `commandType: "CREATE_AGENT"` khi tạo submission ở API | 1 |
| lần `instructions.md` của con nhắc `not_authorized` | 0 |
| chỗ ghi quyền của lượt hỏi vào `pendingInputRequest` | 0 |
| migration cần cho vòng này | 0 |
| `commandType` đường **nút Tạo tác nhân** (`new-agent-dialog.tsx:92`) | `CREATE_AGENT` |
| `commandType` đường **gõ tay** (`agent-composer.tsx:457`) | suy từ slash-command, mặc định `CHAT` |
| `commandType` đường **follow-up trên agent đã deploy** (`agent-builder-chat.tsx:540`) | `CREATE_AGENT` |
| status mà `outputSchema` của `agent_builder` chấp nhận | 2 — `draft_ready`, `not_authorized` |

## Acceptance criteria

**AC-1 — Quyền của lượt hỏi được ghi lại tại đúng lúc hỏi.**
Given hook `input.requested` chạy với `ctx` của một lượt builder,
When câu hỏi được lưu vào `pendingInputRequest`,
Then bản ghi mang kết quả `builderTurnAuthorized(ctx)` của **lượt đã hỏi**.
Chiều đỏ: lượt hỏi không được phép → bản ghi phải mang giá trị ngược lại. Hai
chiều dùng chung một fixture, khác đúng một trường.

**AC-2 — Khuôn bản ghi được parse ở biên, không truyền từ điển mở.**
Given cột `pendingInputRequest` mà agent ghi và API đọc,
When bất kỳ bên nào đọc,
Then nó parse qua **một** module trong `packages/validation/src`, và kiểu được suy
bằng `z.infer` chứ không gõ tay cạnh schema.
Vế "không bên nào nhận `Record<string, unknown>`" **do `bun run lint:slop` giữ** —
luật `anti-slop(no-known-value-widening)` chạy toàn kho và là một trong năm lệnh
cổng; nó đã bắt đúng lỗi ấy của vòng này một lần. Không dựng phép đo riêng đọc
chéo mã nguồn của app khác.
Chiều đỏ: nạp một giá trị sai khuôn → parse phải **hỏng có thông điệp**, không
được nuốt thành rỗng hay `undefined` im lặng.

**AC-3 — Câu trả lời kế thừa đúng quyền của lượt đã hỏi.**
Given một bản ghi quyền dựng bằng **hàm dựng dùng chung** `buildPendingInputRequest`
của `packages/validation` — hàm mà đường ghi thật của `apps/agent` cũng gọi,
When người dùng trả lời và **service thật** `answerBuilderQuestion` chạy,
Then `commandType` của submission nó tạo ra **bằng đúng** quyền đã ghi.
Cặp hai chiều trên cùng fixture, khác đúng một trường: bản ghi "được phép" →
`CREATE_AGENT`; "không được phép" → `CHAT`. Đổi một trường mà kết quả không lật →
**mã 1**.
Sàn khuôn: bản ghi dựng bằng object literal viết tay thay vì hàm dựng chung →
**mã 2**.

**Ràng buộc đã đặt tên — đọc trước khi đòi thêm.** `apps/agent` và `apps/api` là
**hai deployment riêng, không import được nhau**, nên **không tồn tại** một bài
test một-tiến-trình đi từ đường ghi sang đường đọc. Mọi thứ tự xưng "round-trip
đầy đủ" ở đây đều là vật thay thế. Lời hứa thật vì thế chia làm ba, và cả ba đều
đo được:

| Vế | Đo ở đâu |
| --- | --- |
| đường ghi thật **ghi được** cờ quyền vào cột | AC-1 — `persistBuilderInputRequest` ghi rồi đọc lại hàng trong CSDL |
| đường đọc thật **biến cờ thành** `commandType` | AC-3 — `answerBuilderQuestion` chạy thật, assert submission nó tạo |
| hai khuôn **không thể lệch** | AC-2 — cả hai bên đi qua một hàm dựng và một schema |

Ghép ba vế là lời hứa đầy đủ. Hai vòng chấm trước REJECT vì hồ sơ đòi một
round-tríp một-tiến-trình bất khả thi, nên mọi phép đo cho nó buộc phải là proxy
đọc-văn-bản-nguồn.

**AC-4 — Không có bản ghi thì đóng, không mở.**
Given **ba hình dạng** nguồn quyền không dùng được: không có `pendingInputRequest`
· có nhưng thiếu trường quyền · có nhưng sai khuôn,
When API tạo submission cho câu trả lời,
Then **cả ba** đều cho `CHAT`. Số assert bằng 3.
Chiều đỏ: nạp bản ghi "được phép" hợp lệ trên cùng fixture → phải cho
`CREATE_AGENT`. Thiếu chiều này thì "luôn CHAT" không phân biệt được với "đọc
đúng".

**AC-5 — Không chỗ nào còn suy quyền từ hình dạng tin nhắn.**
Given `builderCommandType` và mọi chỗ tạo submission,
When một message mang `inputResponse` đầy đủ (`requestId` + `text`) nhưng
`commandType` khai là `CHAT`,
Then kết quả **vẫn là `CHAT`**.
Phép đo phải gọi **hàm thật** `builderCommandType(commandType, message)`; **cấm
ghi đè thẳng trường `commandType` trong fixture** — chính lối tắt ấy làm lỗ này
sống sót qua ba vòng chấm của vòng trước.
Sàn dân số: đếm trên đĩa số chỗ suy quyền từ hình dạng tin nhắn phải bằng **0**;
khác 0 → **mã 2**, nêu `file:dòng`.

**AC-7 — Con builder biết cửa ra khi bị từ chối.**
Given `instructions.md` của `agent_builder`,
When soi nó,
Then nó khai cửa ra `not_authorized`: bị từ chối thì gọi `final_output` với
`{ status: "not_authorized", reason }`, không cố lưu nháp.
Sàn dân số: số lần nhắc `not_authorized` phải lớn hơn 0; bằng 0 → **mã 1**. Tại
SHA ghim số này bằng 0.

**AC-8 — Hằng lý do nói với con, không nói với cha.** (judgment)
Given `BUILDER_DENIED_REASON` — chuỗi mà eve giao cho **con** khi policy từ chối,
When đọc nó,
Then nó bảo con làm việc con làm được: trả `not_authorized` ngay. Nó **không**
bảo con "nói với người dùng" hay "trả lời câu họ hỏi" — con chạy task mode,
không có kênh người dùng và phần lớn tool đã tắt. Việc nói với người dùng vẫn
nằm ở chỉ dẫn của cha.

**AC-9 — Cổng thật sự đóng, đo hết chuỗi chứ không dừng ở giá trị trung gian.** (cross-layer)
Given một bản ghi quyền "không được phép",
When chạy **hết chuỗi bằng các hàm thật**, không dựng tay khúc nào: bản ghi →
hàm suy `commandType` (dùng chung ở `packages/validation`) → `builderSessionAttributes`
→ `builderTurnApproval`,
Then policy trả **từ chối kèm hằng lý do đã ghim**.
Đối chứng dương trên cùng fixture, khác đúng một trường: bản ghi "được phép" →
policy cho đi tiếp.
Sàn dân số: chuỗi thiếu một mắt (một khúc dựng tay thay vì gọi hàm thật) →
**mã 2**, nêu mắt nào.
Lý do có tiêu chí này: tám tiêu chí trên đều dừng ở `commandType` — một **giá trị
trung gian**. Nếu runtime lấy quyền từ một nguồn khác trong `ctx`, hoặc
`builderTurnAuthorized` đọc trường khác tên, thì cả tám vẫn xanh trong khi cổng
vẫn mở. Đó đúng là hình dạng đã xảy ra ở vòng trước.

## Coverage

Quét bằng `morphological-scan`, tự dựng trục từ B1 (không preset nào khớp).

| Trục | Giá trị | Thước CE |
| --- | --- | --- |
| **A. Đường một submission ra đời** | nút Tạo tác nhân · gõ tay · trả lời câu hỏi · follow-up trên agent đã deploy | `[SUY-TỪ-REPO: apps/app/components/agent-builder/]` + `[SUY-TỪ-REPO: apps/api/src/conversations/conversations.service.ts]` |
| **B. Trạng thái nguồn quyền bên đọc thấy** | đủ · vắng · hỏng khuôn | `[SUY-TỪ-REPO: apps/agent/agent/lib/builder-input.ts]` — `pendingInputRequest` là cột Json |
| **C. Bên tiêu thụ quyền** (AC-9 phủ policy + lớp trong; AC-3/4/6 phủ API; AC-7/8 phủ con) | policy `approval` · lớp trong `requireBuilderAttribute` · API lúc tạo submission · con `agent_builder` | `[SUY-TỪ-REPO: apps/agent/agent/subagents/agent_builder/]` + hồ sơ vòng chấm `chan-uy-thac-sai-luot` |

Chân ngành: `[NGÀNH: eve 0.29.4]` — hợp đồng approval/HITL trong tài liệu ship
kèm bản đã cài (`docs/tools/human-in-the-loop.md`: policy trả `denied` kèm lý do,
và lý do ấy đến **model đang gọi tool**). `[NGÀNH: OAuth 2.0 RFC 6749]` — nguyên
tắc quyền là thứ được cấp và mang theo, bên nhận không đoán quyền từ hình dạng
yêu cầu. Trục A và C soi đúng theo nguyên tắc ấy.

"Ai đọc" là trục C, không phải cross-cutting. "Quyền của lượt hỏi" **không phải
trục** — nó chỉ tồn tại trên một giá trị của trục A, nên là giá trị chứ không
phải chiều.

Cross-cutting áp mọi ô Core: **mọi phép đo quyền đi qua hàm thật, cấm ghi đè
trường `commandType` trong fixture**; mọi phép đo mới đi cặp hai chiều trên cùng
fixture.

## Out of scope

- **Dọn hàng câu hỏi đang treo lúc deploy.** Người ký chọn đóng-không-dọn ở S1:
  câu hỏi cũ không có bản ghi quyền thì trả lời chỉ là chat thường, và người
  dùng bấm Tạo tác nhân lại. Dọn dữ liệu thật cần tiêu chí riêng.
- **Đo câu trả lời cha thật sự soạn.** Vẫn là giới hạn thừa kế từ vòng trước:
  cần một lượt end-to-end với model thật. AC-8 chấm *hằng lý do*, không chấm
  đầu ra runtime.
- **Lưới thu hồi hội thoại treo.** Đã có chip riêng, ngoài vòng này.
- **Ba đường tạo submission còn lại (nút Tạo tác nhân · gõ tay · follow-up trên
  agent đã deploy).** Rút khỏi hợp đồng ở vòng chấm 2. Chúng là hằng phía trình
  duyệt; không có phép đo hành vi nào cho chúng nếu không mở browser, nên tiêu chí
  cũ chỉ còn cách grep chuỗi trong ba file `.tsx` — một nguồn REJECT không bảo vệ
  được gì. Vòng này không chạm ba đường đó.
- **Đổi schema Prisma.** Cột `Json` sẵn có đủ dùng; thêm cột là T3 và không cần.

## Notes

### Hạn chế đã biết — người ký định đoạt ở Cổng Bằng chứng, vòng chấm 4

- Ô câu hỏi đang chờ bị đọc hai lần bằng hai khuôn khác nhau trong cùng một hàm
  của phần API. Chưa hỏng, nhưng hai khuôn sẽ trôi khỏi nhau; khuôn sở hữu shape
  hiện lọc bỏ cờ quyền nên đường chính không đọc được nó.
- Hàm dựng bản ghi kiểm khuôn xong rồi bỏ kết quả kiểm, trả lại đúng thứ nhận
  vào. Chuẩn hoá của khuôn vì thế không áp lên giá trị ghi xuống.
- Tên trạng thái `not_authorized` khai ở hai nơi và không nối nhau bằng kiểu nào.
  Đổi tên ở một nơi thì chốt chặn lặng lẽ mất tác dụng.
- Hai bài đo còn quét chữ trong mã nguồn, một bài đọc sang phần chạy riêng khác.
  Loại luật đó thuộc về bộ soi mã, không thuộc bộ đo đơn vị.


**Hai hàm trùng tên, đừng lẫn:** `builderCommandType` ở `apps/app/lib/agent-builder.ts`
đọc slash-command phía trình duyệt; `builderCommandType` ở
`apps/agent/agent/lib/custom-agent-dispatch.ts` là hàm mang luật suy diễn mà vòng
này xoá. AC-5 nói về cái thứ hai.


`requireBuilderAttribute` và policy `approval` của vòng trước giữ nguyên. Vòng
này không sửa cổng — nó sửa **thứ đi qua cổng**: giá trị `commandType` mà cổng
đọc, để cổng không còn bị lừa bằng một tin nhắn đúng hình dạng.
