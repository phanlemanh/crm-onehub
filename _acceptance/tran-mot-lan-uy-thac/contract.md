---
schema_version: 1
feature: Trần một-lần-uỷ-thác agent_builder áp cho cả lượt KHÔNG có quyền — hook builder-delegation đang return sớm khi commandType khác CREATE_AGENT, nên chốt cứng duy nhất không chạy trên nhánh not_authorized và chỉ còn câu chữ trong prompt giữ trần
slug: tran-mot-lan-uy-thac
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [agent]
status: implemented
approved_by: Mạnh
approved_at: 2026-09-09
design_doc: docs/superpowers/specs/2026-09-09-tran-mot-lan-uy-thac-design.md
---

# Acceptance Contract: tran-mot-lan-uy-thac

## Bối cảnh

`apps/agent/agent/hooks/builder-delegation.ts:11-16` return sớm khi
`attribute(ctx, "commandType") !== "CREATE_AGENT"`, nên
`recordBuilderDelegation` — chốt cứng duy nhất chặn gọi lại `agent_builder`
trong cùng một lượt (`apps/agent/agent/lib/builder-delegation.ts:37`) — không
chạy trên lượt không có quyền.

Vòng `quyen-luot-mang-theo` (đã ký) biến chính lượt đó thành đường đi hợp lệ:
cha gọi `agent_builder`, policy từ chối con, con trả `not_authorized`. Cái duy
nhất ngăn cha gọi lại là một câu trong `apps/agent/agent/instructions/task.ts`.
Vòng đó còn nới rộng lỗ: `builderCommandType` nay là hàm đồng nhất, nên lượt
trả lời của luồng không có quyền mang `CHAT` và mất luôn cái trần cũ.

Mục "Ngoài-5" trong `_acceptance/quyen-luot-mang-theo/review-findings.md` tách
việc này ra làm hợp đồng riêng theo quyết định của người ký.

Đã dựng lại bằng hành vi thật trước khi viết hợp đồng, chạy chính hook trong
ngữ cảnh eve thật:

```
CREATE_AGENT -> chặn: The agent builder can be delegated only once per creation turn.
CHAT         -> KHÔNG chặn (gọi lần 2 lọt)
```

## Mốc ghim

SHA của cây TRƯỚC vòng này:

```
41ba0a7
```

Neo, đếm tại SHA ấy:

| Neo | Số |
| --- | --- |
| vế điều kiện trong hook `builder-delegation` | 2 — `purpose`, `commandType` |
| câu ném của trần một-lần | 1, có chữ `creation` |
| bài đo chạy **chính hook** `builder-delegation` | 0 |
| bài đo gọi hàm thuần `recordBuilderDelegation` | 1 — `custom-agent-runtime.spec.ts:371` |
| chốt cứng chặn gọi lại trên lượt `CHAT` | 0 |
| câu trong `task.ts` dặn không thử lại `not_authorized` | 2 — một cho nhánh `CREATE_AGENT`, một cho nhánh `CHAT` |
| `purpose` mà `builderSessionAttributes` đặt | `builder`, không phụ thuộc `commandType` |

## Coverage

Quét bằng `morphological-scan`, preset `test-matrix`. Chân sản phẩm:
`[SUY-TỪ-REPO: CONTEXT.md]`, `[SUY-TỪ-REPO: docs/agent.md]`. Chân ngành: trần
vòng lặp tác nhân do **runtime** ép chứ không do câu chữ chỉ dẫn —
`[NGÀNH: LangGraph recursion_limit]`, `[NGÀNH: OpenAI Agents SDK max_turns]`.

| Trục | Giá trị | Thước CE |
| --- | --- | --- |
| A. Chiều quyền của lượt | `CREATE_AGENT` · `CHAT` | sự cố prod 08/09 chép ở `docs/agent.md:336` |
| B. Hình dạng lời gọi | 0 lần · 1 lần · callId khác cùng lượt · lặp đúng callId · 2 lần trong cùng một `actions` | khối `builder delegation guard`, `custom-agent-runtime.spec.ts:371` |
| C. Ranh giới lượt | cùng `turnId` · `turnId` mới | nhánh reset trong `recordBuilderDelegation` |
| D. Phạm vi phiên | `builder` · `team-agent` · `research` | ma trận `purpose × commandType`, `chan-uy-thac.spec.ts` |

- Trục A — chiều quyền của lượt (`CREATE_AGENT` · `CHAT`): phủ bởi AC-1 và AC-2; bằng chứng "đủ" là cả hai chiều đều bật trần trên cùng một bộ dựng fixture. Thước CE: sự cố prod 08/09 chép ở `docs/agent.md:336`.
- Trục B — hình dạng lời gọi (0 lần · 1 lần · callId khác cùng lượt · lặp đúng callId · 2 lần trong cùng một `actions`): phủ bởi AC-9, AC-3, AC-1, AC-4, AC-7; bằng chứng "đủ" là cả năm giá trị đều có một tiêu chí riêng, không giá trị nào suy ra từ giá trị khác. Thước CE: khối `builder delegation guard` ở `custom-agent-runtime.spec.ts:371`.
- Trục C — ranh giới lượt (cùng `turnId` · `turnId` mới): phủ bởi AC-5; bằng chứng "đủ" là trần mở lại ở lượt mới, đo ở cả hai chiều quyền. Thước CE: nhánh reset trong `recordBuilderDelegation`.
- Trục D — phạm vi phiên (`builder` · `team-agent` · `research`): phủ bởi AC-6 bằng ma trận toàn phần 6 ô, số assert bằng số ô; bằng chứng "đủ" là hai ô ném làm đối chứng dương cho bốn ô im. Thước CE: ma trận `purpose × commandType` ở `chan-uy-thac.spec.ts`.

Không gian có nghĩa 14 ô; ô vô nghĩa đã gạch (`research`/`team-agent` thì
`agent_builder` không tồn tại nên B và C không đổi gì). Mọi trục đều nêu được
thước đo "đủ" bằng một vật có thật trong kho, và không giá trị nào phải hạ
xuống `[GIẢ ĐỊNH]`.

14 ô, không ô nào để câm — bảng dưới là toàn bộ, gồm cả ô không vào Core:

| # | Ô | Nhãn | Đi đâu |
| --- | --- | --- | --- |
| 1 | `CHAT` × callId khác × cùng lượt | Core | AC-1 |
| 2 | `CREATE_AGENT` × callId khác × cùng lượt | Core | AC-2 |
| 3 | `CHAT` × 1 lần | Core | AC-3 |
| 4 | `CREATE_AGENT` × 1 lần | Core | AC-2 chiều đỏ |
| 5 | `CHAT` × lặp đúng callId | Core | AC-4 |
| 6 | `CREATE_AGENT` × lặp đúng callId | Core | AC-4 |
| 7 | `CHAT` × turnId mới | Core | AC-5 |
| 8 | `CREATE_AGENT` × turnId mới | Core | AC-5 |
| 9 | `CHAT` × 2 lần cùng một `actions` | Core | AC-7 |
| 10 | `CREATE_AGENT` × 2 lần cùng một `actions` | Core | AC-7 |
| 11 | `CHAT` × 0 lần | Core | AC-9 |
| 12 | `CREATE_AGENT` × 0 lần | Core | AC-9 |
| 13 | `team-agent` × mọi B, C | Core | AC-6 |
| 14 | `research` × mọi B, C | Core | AC-6 |

Ô 11 và 12 vào Core **sau** phản biện context sạch (finding P1 của gap-probe):
đó đúng chỗ bán kính vòng này rộng ra, vì bản tại `41ba0a7` return sớm nên
không hội thoại nào của kênh builder từng chạm hook.

## Criteria

- **AC-1 — Lượt KHÔNG có quyền: lời gọi thứ hai bị chặn.** *(ca bản hiện tại bỏ lọt)*
Given một phiên builder dựng từ bản ghi quyền **không được phép** — bản ghi do
`buildPendingInputRequest` (bên ghi thật) sinh, đọc bằng
`commandTypeFromAuthorization`, rồi qua `builderSessionAttributes` thành bộ
attribute,
When handler `actions.requested` của **chính hook** `builder-delegation` chạy
hai lần trong cùng `turnId` với hai `callId` khác nhau, mỗi lần một
`subagent-call` tới `agent_builder`,
Then lần thứ hai **ném**, thông điệp chứa `only once`.
Chiều đỏ: dựng cùng fixture ấy, đổi đúng một trường sang **được phép** → cũng
phải ném. Hai chiều cùng ném là điều đúng ở đây; chiều phân biệt thật nằm ở
tiêu chí AC-3 (lời gọi thứ nhất lọt) và ở mốc ghim "chốt cứng trên lượt `CHAT` = 0" tại
`41ba0a7`.
Sàn khuôn: bài đo gọi hàm thuần `recordBuilderDelegation` thay vì chạy hook →
**mã 2**. Lỗ nằm ở điều kiện *trong* hook, nên đo hàm bên dưới không chạm tới
nó.

- **AC-2 — Lượt CÓ quyền vẫn bị chặn như cũ, không hồi quy.**
Given cùng bộ dựng của AC-1 với bản ghi **được phép**,
When hook chạy hai lần trong cùng `turnId` với hai `callId` khác nhau,
Then lần thứ hai ném.
Chiều đỏ: gọi đúng một lần → **không** được ném.

- **AC-3 — Lời gọi THỨ NHẤT trên lượt không có quyền vẫn lọt.**
Given phiên builder không được phép,
When hook chạy đúng một lần với một `subagent-call` tới `agent_builder`,
Then **không ném**, và trạng thái ghi lại đúng `callId` ấy.
Đây là đường ra `not_authorized` mà vòng `quyen-luot-mang-theo` vừa dựng. Vá
quá tay thành chặn-ngay-lần-một là phá đúng thứ vừa xây.
Chiều đỏ: thêm một lời gọi thứ hai khác `callId` trên cùng fixture → phải ném.

- **AC-4 — Lặp lại đúng `callId` là bình thường, không ném oan.**
Given phiên builder, ở **cả hai** chiều quyền,
When hook nhận lại đúng `callId` đã ghi trong cùng `turnId`,
Then không ném, và trạng thái không đổi.
Số assert bằng 2 — một cho mỗi chiều quyền.
Chiều đỏ: đổi đúng `callId` sang giá trị khác trên cùng fixture → phải ném.

- **AC-5 — `turnId` mới thì trần mở lại.**
Given phiên builder, ở **cả hai** chiều quyền, đã có một lời gọi ở `turnId` cũ,
When hook nhận một lời gọi mới ở `turnId` **khác**,
Then không ném, và trạng thái mang `turnId` mới cùng đúng `callId` mới.
Số assert bằng 2 — một cho mỗi chiều quyền.
Chiều đỏ: giữ nguyên `turnId` cũ trên cùng fixture → phải ném.

- **AC-6 — Hook không đụng phiên ngoài kênh builder.**
Given ma trận **toàn phần** `purpose × commandType`: `purpose` ∈ {`builder`,
`team-agent`, `research`} × `commandType` ∈ {`CREATE_AGENT`, `CHAT`},
When hook chạy hai lần với hai `callId` khác nhau trong cùng `turnId` cho từng
ô,
Then đúng **hai** ô `purpose = builder` ném; **bốn** ô còn lại không ném.
Số assert bằng 6 — số ô của ma trận.
Chiều đỏ đã nằm trong chính ma trận: hai ô ném là đối chứng dương của bốn ô im.
Sàn khuôn: **cả sáu** ô phải dựng từ **một** bộ dựng — đầu ra thật của
`builderSessionAttributes` trải ra rồi đè đúng hai trường `purpose` và
`commandType`. Sáu ô đi hai đường dựng khác nhau → **mã 2**. Lý do sàn này tồn
tại: `builderSessionAttributes` ghim cứng `purpose: "builder"` nên không có bên
ghi thật nào sinh `team-agent`/`research`; nếu bốn ô kia đi một khuôn riêng và
khuôn ấy sai, `purposeOf` trả về đường mặc định ở cả bốn và chúng xanh vì **sai
khuôn** chứ không vì hook đúng. Dựng chung một bộ thì hai ô ném chính là chốt
kiểm khuôn: khuôn hỏng thì chúng thôi ném và bài đo đỏ.

- **AC-7 — Hai lời gọi trong CÙNG một `actions` cũng bị chặn.**
Given phiên builder, ở **cả hai** chiều quyền,
When một sự kiện `actions.requested` mang **hai** `subagent-call` tới
`agent_builder` với hai `callId` khác nhau,
Then ném.
Đây là hình dạng thật: một step của mô hình phát nhiều lời gọi cùng lúc, và nó
không đi qua nhánh "lượt chạy thứ hai của handler".
Số assert bằng 2 — một cho mỗi chiều quyền.
Chiều đỏ: cùng sự kiện ấy nhưng lời gọi thứ hai tới **subagent khác** →
không ném.

- **AC-8 — Một câu thông điệp, đúng cho cả hai chiều.**
Given câu ném của trần,
When bất kỳ chiều quyền nào bật trần,
Then thông điệp là `The agent builder can be delegated only once per turn.` —
không còn chữ `creation`, vì lượt không có quyền không phải creation turn.
Hai chiều quyền phải cho câu **bằng nhau**, không chỉ "đều chứa only once".
Chiều đỏ: assert phải đỏ nếu chữ `creation` còn trong câu. Phép đo lấy câu từ
**lần ném thật** của hook, không đọc hằng trong mã nguồn.

Phạm vi đã đo, nói thẳng để người duyệt không hiểu quá: AC này dừng ở **đầu ra
của hook**. Câu ném có đi tiếp tới `turn.failed` (`crm.ts` đọc
`eveTurnFailure.parse(data).message`), nhưng `latestTurnFailure` ở `apps/app`
chỉ phân loại `restricted` · `rate-limit` · `credits` · `unknown`, và **không
file nào** trong `apps/app`, `apps/api`, `packages` khớp theo câu trần. Câu này
rơi vào `unknown` cả trước lẫn sau vòng, nên đổi chữ không dời nhánh phân loại
nào. Vì thế đây **không** phải criterion xuyên lớp và không có eval lớp tiêu
thụ — xem finding P0 của gap-probe và cột Xử lý của nó.

- **AC-9 — Lượt builder KHÔNG có lời gọi `agent_builder` nào phải im lặng.**
Given phiên builder, ở **cả hai** chiều quyền — đây là đường mà bản tại
`41ba0a7` **chưa từng chạy**, vì hook return sớm ở mọi lượt `CHAT`, và bỏ vế
`commandType` mở nó ra cho **mọi** lượt trò chuyện của kênh builder,
When hook nhận `actions.requested` không mang lời gọi `agent_builder` nào — một
sự kiện `actions` **rỗng**, và một sự kiện chỉ có `subagent-call` tới subagent
**khác** — chạy hai lần trong cùng `turnId`,
Then không ném, và trạng thái đọc ra không mang `callId` nào.
Số assert bằng 4 — hai hình dạng sự kiện × hai chiều quyền.
Chiều đỏ: trên cùng fixture, đổi `subagentName` của lời gọi sang
`agent_builder` cho cả hai lần → phải ném.
Đây là ô "0 lần" của trục B. Bán kính vòng này rộng ra đúng ở đây: trước vòng,
mọi hội thoại của kênh builder không chạm hook lần nào.

## Đường đo

Hồ sơ này không có `opportunity.md` — xem entry `descope` trong
`decisions.jsonl`.

## Out of scope

- **Không gỡ hai câu dặn `not_authorized` trong `task.ts`.** Prompt vẫn là hàng
  rào rẻ hơn thẻ đỏ; hook là lưới đỡ phía sau, không phải bản thay thế.
- **Không chặn lời gọi thứ nhất** trên lượt không có quyền — AC-3 giữ nó.
- **Không mở rộng trần sang `purpose` khác** — `agent_builder` không tồn tại ở
  đó (AC-6 ghim điều này).
- **Không nới trần lên quá một lần mỗi lượt.**
- **Không dựng eval eve chạy mô hình giả cho ca này.** Lane
  `apps/agent/evals/` `t.skip` khi thiếu credential AI Gateway và không nằm
  trong `feature_loop.suite_keys` — nó không dùng làm cổng được.
- **Không sửa ba hạn chế đã biết** mà vòng `quyen-luot-mang-theo` ghi nhận
  (parse hai lần ở `conversations.service.ts`, `buildPendingInputRequest` vứt
  kết quả parse, `not_authorized` khai hai nơi).

## Notes

Ràng buộc đã đặt tên: hook của eve **chỉ quan sát**
(`node_modules/eve/docs/guides/hooks.md`: *Handlers are observe-only*). Cần lực
chặn thì chỉ có một cần gạt — ném. "Nuốt lặng lời gọi thứ hai" không tồn tại
trong hợp đồng của eve, nên nó không phải một phương án bị loại mà là một
phương án không có thật.

Ném ở hook → `turn.failed` → lượt settle kèm thẻ lỗi, ngược hẳn sự cố 08/09.
`crm.ts` đọc `eveTurnFailure.parse(data).message` nguyên văn, nên câu ném là
câu người dùng có thể thấy — đó là lý do AC-8 tồn tại.
