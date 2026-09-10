---
schema_version: 1
feature: Trần một-lần-uỷ-thác agent_builder chịu được lần chạy lại của một step — đổi khoá từ callId do mô hình sinh sang toạ độ (turnId, stepIndex, sequence) của sự kiện actions.requested, và vá lỗ đo khiến trần chết mà 22 bài vẫn xanh
slug: tran-uy-thac-chiu-chay-lai
owner: omre.cnsp4@onemount.com
risk_tier: T2
surfaces: [agent]
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-10T07:28:10Z
design_doc: docs/superpowers/specs/2026-09-10-tran-uy-thac-chiu-chay-lai-design.md
---

# Acceptance Contract: tran-uy-thac-chiu-chay-lai

## Bối cảnh

`recordBuilderDelegation` (`apps/agent/agent/lib/builder-delegation.ts`) khoá
trần một-lần-uỷ-thác theo `callId` do **mô hình sinh**. eve khuyến nghị ngược
lại cho một chốt một-lần-mỗi-lượt (`guides/hooks.md`): khoá theo toạ độ
`(turnId, stepIndex, sequence)` trong `event.data`, vì *"a retry restores those
from the step's input, so the second attempt computes the same key and your gate
holds"*.

Kịch bản hỏng: lượt `turn-1`, mô hình gọi `agent_builder` với `call-a` →
trạng thái `{turn-1, [call-a]}`. Step bị ngắt (timeout/redeploy). eve chạy lại
step trong **cùng** `turn-1`; mô hình được gọi lại nên sinh `call-b`.
`callIds.size > 0` → ném → `turn.failed`. Người dùng chỉ yêu cầu **một** lần.
Và vì hook ném **trước** `builderDelegationState.update()`, trạng thái gây ném
còn nguyên và bền, nên mọi lần thử lại sau đó hỏng y hệt — lượt không bao giờ
hồi được.

Sự kiện `actions.requested` **mang đủ** toạ độ
(`{ actions, sequence, stepIndex, turnId }` — `protocol/message.d.ts`) nhưng
hook chỉ truyền `turnId` và `actions` xuống hàm.

Bán kính vừa rộng ra: vòng `tran-mot-lan-uy-thac` bỏ vế
`attribute(ctx, "commandType") !== "CREATE_AGENT"`, nên chốt này nay chạy trên
**mọi** lượt `purpose=builder`, kể cả hội thoại thường.

Mục "Ngoài-4" trong `_acceptance/tran-mot-lan-uy-thac/review-findings.md` và
entry `revisit` `d-20260909T142546Z-31912` tách việc này thành hợp đồng riêng
theo quyết định của người ký.

## Mốc ghim

SHA của cây TRƯỚC vòng này:

```
83501f3
```

Neo, đếm tại SHA ấy:

| Neo | Số |
| --- | --- |
| lần `callId` xuất hiện trong `lib/builder-delegation.ts` | 9 |
| lần `stepIndex` hoặc `sequence` xuất hiện trong hook **và** lib | 0 |
| trường hook truyền xuống `recordBuilderDelegation` | 2 — `event.data.turnId`, `event.data.actions` |
| trường `event.data` của `actions.requested` **có sẵn** | 4 — `actions`, `sequence`, `stepIndex`, `turnId` |
| module chứa riêng `defineState` handle | 0 — handle ở chung file với hàm thuần |
| `lib/builder-delegation.ts` import `eve/context` | có |
| bài đo trong `test/tran-uy-thac.spec.ts` | 22 |
| đột biến "bỏ `record` và `update`, giữ `get`" | 22 xanh |
| đột biến "bỏ `update`, giữ `record`" | 22 xanh |
| đột biến "thân hook rỗng" | 8 đỏ / 22 |

Ba dòng đột biến cuối là **số đo**, chạy tại SHA ấy trong cây worktree này,
không phải suy đoán. Chúng là thước CE của trục C.

Cơ chế của phép đo cũng đã **chạy thử** tại SHA ấy trước khi viết hợp đồng, vì
finding P0 thứ hai của `gap-probe.md` chất vấn đúng chỗ đó: một bản đột biến ghi
dưới `apps/agent/node_modules/.cache/` với import đổi sang đường **tuyệt đối**
thì (a) giải được `eve/hooks` và các module của kho, và (b) **vẫn** bị
`mock.module` chặn ở module state. Một ràng buộc phải ghi vào sàn khuôn: `bun
test` **từ chối** tìm file trong `node_modules` nếu không được đưa đường dạng
`./…` — ca từ chối ấy phải là **mã 2**, không được đọc thành bất cứ kết quả nào
khác.

## Coverage

Quét bằng `morphological-scan`, preset `test-matrix`. Chân sản phẩm:
`[SUY-TỪ-REPO: docs/agent.md]`,
`[SUY-TỪ-REPO: _acceptance/tran-mot-lan-uy-thac/contract.md]`. Chân ngành: khoá
chống-lặp dưới giao-ít-nhất-một-lần phải **ổn định qua lần thử lại** —
`[NGÀNH: Stripe idempotency key]` (lần thử lại gửi lại ĐÚNG key cũ, không sinh
key mới), `[NGÀNH: Temporal]` (activity at-least-once, khoá suy từ toạ độ tất
định chứ không từ giá trị sinh mới).

| Trục | Giá trị | Thước CE |
| --- | --- | --- |
| A. Quan hệ toạ độ hai lần thấy uỷ thác | cùng `(turn,step,seq)` = chạy lại · cùng `(turn,step)` khác `seq` = đến rải rác · cùng `turn` khác `step` · khác `turn` | `guides/hooks.md` (retry khôi phục toạ độ) + `protocol/message.d.ts` (lời gọi đến rải rác) |
| B. Hình dạng lời gọi trong MỘT sự kiện | 0 · 1 · 2 cùng batch · 1 builder + 1 subagent khác | AC-7 và AC-9 của `tran-mot-lan-uy-thac` |
| C. Mắt sống của chuỗi cưỡng chế | gác `purpose` · hook truyền đủ toạ độ · hàm ném · hook **ghi bền** | ba số đo đột biến ở mục Mốc ghim |
| D. Phạm vi phiên | `builder` · `team-agent` · `research` | ma trận `purpose × commandType`, `tran-uy-thac.spec.ts` |

- Trục A — phủ bởi AC-1, AC-2, AC-3, AC-4; bằng chứng "đủ" là **cả bốn** quan hệ
  toạ độ đều có một tiêu chí riêng, và hai giá trị đầu cho **hai kết cục trái
  nhau** (lọt / ném) trên cùng một bộ dựng. Đây là trục mà `callId` không phân
  biệt được, nên nó là trục sinh ra vòng này.
- Trục B — phủ bởi AC-5, AC-6, AC-7, AC-8; bằng chứng "đủ" là bốn hình dạng đều
  có tiêu chí riêng, không hình dạng nào suy ra từ hình dạng khác.
- Trục C — phủ bởi AC-9 (chuỗi cưỡng chế sống) và AC-10 (siết kiểu); bằng chứng
  "đủ" là **hai đột biến từng cho 22 xanh nay phải đỏ**, đo bằng số, không bằng
  lời. Đây là trục hồ sơ cũ **không có**.
- Trục D — phủ bởi AC-11 bằng ma trận toàn phần 6 ô, số assert bằng số ô; đây là
  tiêu chí **không hồi quy**, giữ nguyên lời hứa của vòng trước.

Không gian A × B = 16 ô. Hai ô `A × B=0` **gạch** (vô nghĩa — chưa có uỷ thác nào
thì không có toạ độ để so), nhưng ô thứ ba **KHÔNG** gạch: «trạng thái **đã** ghi
toạ độ × sự kiện 0 lời gọi» là ô có nghĩa và load-bearing, xem AC-12. Còn 14 ô.
Cộng 4 ô trục C và 3 ô trục D = **21 ô có nghĩa**.

Ô ấy được mở lại **sau** phản biện context sạch (finding P0 thứ nhất của
`gap-probe.md`). Lý do gạch ban đầu chỉ cân tới việc một sự kiện 0 lời gọi
**chiếm** slot (AC-8), không cân tới việc nó **xoá** slot đã ghi — và xoá slot là
đường làm trần chết ngay trong lượt đó.

Bảng đầy đủ, không ô nào để câm:

| # | Ô | Nhãn | Đi đâu |
| --- | --- | --- | --- |
| 1 | cùng toạ độ × 1 lần | Core | AC-1 |
| 2 | cùng `(turn,step)` khác `seq` × 1 lần | Core | AC-2 |
| 3 | cùng `turn` khác `step` × 1 lần | Core | AC-3 |
| 4 | khác `turn` × 1 lần | Core | AC-4 |
| 5 | chưa có tiền sử × 1 lần | Core | AC-5 |
| 6 | 2 lời gọi cùng một `actions` | Core | AC-6 |
| 7 | 1 builder + 1 subagent khác | Core | AC-7 |
| 8 | 0 lời gọi | Core | AC-8 |
| 9 | cùng toạ độ × 2 lời gọi cùng batch | Later | ném ở lần đầu nên lượt đã tắt; lần chạy lại ném tiếp là hệ quả của ô 6, không thêm chiều nào |
| 10 | cùng `(turn,step)` khác `seq` × 2 lời gọi | Later | cùng lý do ô 9 |
| 11 | cùng `turn` khác `step` × 2 lời gọi | Later | cùng lý do ô 9 |
| 12 | khác `turn` × 2 lời gọi | Later | cùng lý do ô 9 |
| 13 | mọi quan hệ toạ độ × (1 builder + 1 khác) | Later | vế "subagent khác không tính" đo ở ô 7; nhân nó với trục A không sinh nhánh mã nào |
| 14 | C — gác `purpose` | Core | AC-11 |
| 15 | C — hook truyền đủ toạ độ | Core | AC-9, AC-10 |
| 16 | C — hàm ném | Core | AC-9 |
| 17 | C — hook ghi bền | Core | AC-9 |
| 18 | D — `builder` | Core | AC-11 |
| 19 | D — `team-agent` | Core | AC-11 |
| 20 | D — `research` | Core | AC-11 |
| 21 | trạng thái **đã** ghi toạ độ × 0 lời gọi | Core | AC-12 |

Core 16/21. Cao, và nói thẳng vì sao: preset `test-matrix` để full matrix cho
"luồng tiền và luồng pháp lý"; luồng ở đây là một chốt **giết lượt trò chuyện
của người dùng** và vừa được chứng minh là giết oan, nên nó ăn cùng mức. Năm ô
Later đều là ô **suy ra được** từ một ô Core, mỗi ô ghi lý do riêng ở trên.

Mọi trục nêu được thước "đủ" bằng một vật có thật trong kho hoặc một số vừa đo.
Không giá trị nào phải hạ xuống `[GIẢ ĐỊNH]`. Hai dòng `[NGÀNH]` ở trên là ứng
viên chờ người gạch, không phải fact của sản phẩm.

## Criteria

- **AC-1 — Lần chạy lại của một step KHÔNG bị coi là uỷ thác thứ hai.**
*(đây là ca bản tại `83501f3` giết oan)*
Given trạng thái đã ghi một lần uỷ thác `agent_builder` tại toạ độ
`(turn-1, step 2, seq 0)`,
When hook nhận một sự kiện `actions.requested` mang **cùng** toạ độ
`(turn-1, step 2, seq 0)` với một `subagent-call` tới `agent_builder`, `callId`
**khác** lần trước — đúng hình dạng của một lần chạy lại, vì eve khôi phục toạ
độ từ input của step mà mô hình thì sinh `callId` mới,
Then **không ném**, và trạng thái **không đổi**.
Chiều đỏ: trên **cùng** fixture ấy, đổi đúng một trường `sequence` sang giá trị
khác → **phải ném**. Vế này bắt buộc, vì "không ném" một mình không phân biệt
được "nhận ra lần chạy lại" với "trần chết hẳn".
Sàn khuôn: `callId` của hai lần **phải khác nhau** trong fixture. Fixture dùng
lại đúng `callId` không đo được gì — bản tại `83501f3` cũng cho qua ca đó.

- **AC-2 — Lời gọi thứ hai đến rải rác trong CÙNG step vẫn bị chặn.**
Given trạng thái đã ghi một lần uỷ thác tại `(turn-1, step 2, seq 0)`,
When hook nhận một sự kiện mang cùng `turnId` và cùng `stepIndex` nhưng
`sequence` **khác** (`seq 1`) với một `subagent-call` tới `agent_builder`,
Then **ném**, thông điệp chứa `only once`.
Đây là ca `protocol/message.d.ts` mô tả: *"Calls may arrive incrementally before
execution"* — một step phát hai lời gọi, giao thành hai sự kiện. Nó là uỷ thác
lần hai thật, không phải chạy lại.
Chiều đỏ: cùng fixture, đưa `sequence` về **bằng** lần trước → không được ném.
Cặp tiêu chí này đứng trên **cùng một bộ dựng**, khác nhau đúng một trường. Đó là
chỗ toạ độ hơn `callId`: `callId` đổi ở cả hai ca nên không thể tách chúng.

- **AC-3 — Uỷ thác ở một step KHÁC trong cùng lượt bị chặn.**
Given trạng thái đã ghi một lần uỷ thác tại `(turn-1, step 2, seq 0)`,
When hook nhận một sự kiện cùng `turnId`, `stepIndex` **khác** (`step 3`),
Then **ném**.
Chiều đỏ: đưa `stepIndex` về `2` **và** `sequence` về `0` → không được ném.

- **AC-4 — `turnId` mới thì trần mở lại.**
Given trạng thái đã ghi một lần uỷ thác ở `turn-1`,
When hook nhận một lời gọi ở `turnId` **khác**,
Then không ném, và trạng thái mang toạ độ **mới** — `turnId` mới, `stepIndex` và
`sequence` của sự kiện mới.
Assert phải **đọc trạng thái**, không chỉ "không ném": trạng thái mang toạ độ cũ
mà vẫn không ném là một trần đã chết, và "không ném" một mình không thấy điều đó.
Chiều đỏ: giữ nguyên `turnId` cũ, đổi `stepIndex` → phải ném.

- **AC-5 — Uỷ thác lần đầu trong lượt vẫn lọt, và ghi đúng toạ độ.**
Given trạng thái rỗng,
When hook nhận đúng một `subagent-call` tới `agent_builder` tại
`(turn-1, step 2, seq 0)`,
Then không ném, và trạng thái đọc ra **bằng đúng** `{ turnId: "turn-1",
stepIndex: 2, sequence: 0 }`.
Đây là đường ra `not_authorized` mà vòng `quyen-luot-mang-theo` dựng và vòng
`tran-mot-lan-uy-thac` giữ. Vá quá tay thành chặn-ngay-lần-một là phá đúng thứ
vừa xây.
Assert phải so **cả ba trường**, không chỉ "không ném": ghi thiếu `stepIndex`
hoặc `sequence` làm AC-1 và AC-2 mất khả năng phân biệt, mà "không ném" thì
không thấy.
Chiều đỏ: thêm một sự kiện thứ hai khác toạ độ trên cùng fixture → phải ném.

- **AC-6 — Hai lời gọi trong CÙNG một `actions` bị chặn.**
Given trạng thái rỗng,
When **một** sự kiện `actions.requested` mang **hai** `subagent-call` tới
`agent_builder` với hai `callId` khác nhau,
Then **ném**.
Một step phát nhiều lời gọi cùng lúc vẫn là hai lần uỷ thác, và nó không đi qua
nhánh "sự kiện thứ hai" nên phải đo riêng. Tiêu chí này giữ nguyên lời hứa AC-7
của vòng trước.
Chiều đỏ: cùng sự kiện ấy nhưng lời gọi thứ hai tới subagent **khác** → không
ném (đó là AC-7).

- **AC-7 — Lời gọi tới subagent khác không tính vào trần.**
Given trạng thái rỗng,
When một sự kiện mang một `subagent-call` tới `agent_builder` và một tới
`agent_runner`,
Then không ném, và trạng thái ghi toạ độ của sự kiện ấy.
Chiều đỏ: trên **cùng** fixture, đổi đúng trường `subagentName` của lời gọi thứ
hai sang `agent_builder` → phải ném.

- **AC-8 — Sự kiện không mang lời gọi `agent_builder` nào phải im lặng, và KHÔNG ghi toạ độ.**
Given trạng thái rỗng,
When hook nhận một sự kiện `actions` **rỗng**, rồi một sự kiện chỉ có
`subagent-call` tới subagent **khác**, cả hai trong cùng `turnId`,
Then không ném, và trạng thái đọc ra có `stepIndex` và `sequence` **bằng `null`**.
Vế "không ghi toạ độ" là vế mới và nó load-bearing: ghi toạ độ ở một sự kiện
không có uỷ thác nào sẽ **chiếm** slot, làm lời gọi thật đầu tiên sau đó bị chặn
oan — tức vá bug này lại sinh đúng một bug cùng loại.
Chiều đỏ: trên **cùng** fixture, đổi đúng trường `subagentName` sang
`agent_builder` → `stepIndex`/`sequence` phải **lật** từ `null` sang giá trị của
sự kiện. Vế lật bắt buộc, vì `null` đúng bằng giá trị mặc định của trạng thái
nên assert `null` một mình không phân biệt được "bỏ qua đúng" với "hàm chết".

- **AC-9 — Chuỗi cưỡng chế của hook phải SỐNG, đo bằng đột biến chứ không bằng lời.**
Given `builderDelegationState` tách sang module riêng, và một phép đo thay module
ấy bằng handle giả có slot trong bộ nhớ (`mock.module` của `bun:test`), **giữ hàm
thuần thật**, rồi gọi **chính hook thật** hai lần với hai toạ độ khác nhau,
When thân hook bị đột biến theo từng hình dạng đã đo tại `83501f3`,
Then bộ đo phải **ĐỎ** ở cả ba hình dạng:
  1. thân hook rỗng,
  2. giữ gác + `get()`, bỏ `record` và `update`,
  3. giữ gác + `get` + `record`, bỏ `update`.
Hình dạng 2 và 3 tại `83501f3` cho **22 xanh** — chúng là lý do tiêu chí này tồn
tại. Ngưỡng là **cả ba** đỏ, không phải "phần lớn".
Sàn khuôn: phép đo phải gọi hook qua `hook.events["actions.requested"]` và phải
lái **hai** sự kiện liên tiếp qua **cùng một** handle giả. Một sự kiện thì không
đo được vế ghi bền — đúng chỗ hình dạng 3 lọt qua bộ đo cũ.
Chiều đỏ của chính phép đo: handle giả phải chứng được nó **có** ghi — assert
trạng thái đọc lại từ handle sau sự kiện thứ nhất mang đúng toạ độ, chứ không chỉ
assert sự kiện thứ hai ném.
Phạm vi đã đo, nói thẳng để người duyệt không hiểu quá: phép đo này chạy
in-process, nên nó **không** chứng minh eve THẬT truyền đúng
`stepIndex`/`sequence` xuống hook. Vế đó khai ở Known limits.

- **AC-10 — Kiểu tham số suy từ type công khai của eve, không khai tay.**
Given `recordBuilderDelegation`,
When đọc chữ ký của nó,
Then tham số sự kiện có kiểu suy từ `HookEvent<"actions.requested">["data"]` của
`eve/hooks`, và `lib/builder-delegation.ts` **không** còn khai tay
`BuilderDelegationAction`.
Đây là Known-limit thứ ba của `tran-mot-lan-uy-thac`, gạch trong vòng này.
Hệ quả phải đo, không chỉ tuyên: hàm nhận **cả `event.data`**, nên hook truyền
thiếu toạ độ là **lỗi biên dịch**. Chiều đỏ: một biến thể của hook truyền thiếu
`stepIndex` phải làm `check-types` đỏ — đo bằng `tsc` trên một file thử, không
đo bằng grep chuỗi trong mã nguồn.

- **AC-11 — Không hồi quy: hook vẫn không đụng phiên ngoài kênh builder.**
Given ma trận **toàn phần** `purpose × commandType`: `purpose` ∈ {`builder`,
`team-agent`, `research`} × `commandType` ∈ {`CREATE_AGENT`, `CHAT`},
When handler của hook chạy cho từng ô,
Then đúng **hai** ô `purpose = builder` cho gác qua; **bốn** ô còn lại bị gác
chặn. Số assert bằng **6** — số ô của ma trận.
Sàn khuôn giữ nguyên của vòng trước: cả sáu ô phải dựng từ **một** bộ dựng —
đầu ra thật của `builderSessionAttributes` trải ra rồi đè đúng hai trường
`purpose` và `commandType`. Sáu ô đi hai đường dựng khác nhau → mã 2.
Chiều đỏ đã nằm trong chính ma trận: hai ô cho qua là đối chứng dương của bốn ô
bị chặn.

- **AC-12 — Sự kiện KHÔNG có uỷ thác không được XOÁ toạ độ đã ghi.**
Given trạng thái đã ghi một uỷ thác tại `(turn-1, step 2, seq 0)`,
When hook nhận một sự kiện `actions.requested` **không** mang lời gọi
`agent_builder` nào ở `(turn-1, step 3, seq 0)`, rồi **sau đó** nhận một uỷ thác
thật ở `(turn-1, step 4, seq 0)`,
Then sự kiện giữa **không ném** và trạng thái đọc lại **vẫn bằng đúng**
`(turn-1, step 2, seq 0)`; uỷ thác ở step 4 **ném**.
Đây là ô mà bản gạch đầu tiên của mục Coverage bỏ sót. AC-8 khởi từ trạng thái
**rỗng** nên nó chỉ bắt được lỗi "chiếm slot", không bắt được lỗi "xoá slot": một
cài đặt trả về toạ độ mới **vô điều kiện** sau mỗi sự kiện sẽ đưa slot về `null`
ở step 3, và uỷ thác thật lần hai ở step 4 lọt — trần chết đúng trong lượt đó, mà
mười một tiêu chí đầu vẫn xanh vì AC-2 và AC-3 nạp trạng thái trực tiếp thay vì cho một sự
kiện 0-lời-gọi đứng **giữa** hai lần uỷ thác.
Sàn khuôn: **ba** sự kiện liên tiếp qua **cùng một** handle, theo đúng thứ tự
trên. Nạp trạng thái trực tiếp thay cho sự kiện thứ nhất → mã 2, vì đúng cái phải
đo là hành vi của hook qua ba sự kiện.
Chiều đỏ, đối chứng dương bắt buộc: đọc trạng thái **ngay sau** sự kiện giữa phải
bằng đúng `(turn-1, step 2, seq 0)`. Chỉ assert "step 4 ném" là không đủ — nó
cũng xanh nếu sự kiện giữa xoá slot rồi step 4 ghi lại và một lỗi khác làm nó ném.

- **AC-13 — Câu ném đúng TOÀN VĂN, không phải chứa một chuỗi con.**
Given câu ném của trần,
When trần bật,
Then thông điệp **bằng đúng**
`The agent builder can be delegated only once per turn.`
Đo bằng so **toàn văn** với một hằng dùng chung giữa mã sản phẩm và bộ đo, lấy từ
**lần ném thật**, không đọc hằng bằng grep trong mã nguồn.
Vì sao tiêu chí này tồn tại: mục Out of scope hứa giữ câu "nguyên văn", mà tiêu chí
trước chỉ đòi chuỗi `only once` **có mặt**. Vòng này viết lại chính khối type quanh câu
ném, nên một biến thể vẫn chứa `only once` sẽ lọt — assert chuỗi-có-mặt trong khi
lời hứa là quan hệ "đúng câu ấy".
Chiều đỏ: assert phải đỏ nếu câu bị đổi mà vẫn chứa `only once`.
Phạm vi đã đo, nói thẳng: tiêu chí này dừng ở **đầu ra của hàm**. Câu ném có đi
tiếp ra `turn.failed` và `crm.ts` đọc nó nguyên văn, nhưng vòng
`tran-mot-lan-uy-thac` đã **kiểm và kết luận** không bên tiêu thụ nào khớp theo
câu trần (`latestTurnFailure` chỉ phân loại `restricted` · `rate-limit` ·
`credits` · `unknown`) — xem `[tran-mot-lan-uy-thac#F1]`. Nên đây **không** phải
criterion xuyên lớp, và vế "người dùng thấy câu này" **không** được dùng làm căn
cứ cho một lời hứa xuyên lớp nào ở vòng này.

## Đường đo

Hồ sơ này không có `opportunity.md` — vòng đi từ mục "Ngoài-4" của
`review-findings.md` vòng trước, không từ Cổng Đáng. Xem entry `descope` trong
`decisions.jsonl`.

## Out of scope

- **Không nới trần lên quá một lần mỗi lượt.** Lời hứa hành vi giữ nguyên; chỉ
  cách nhận-ra-lần-thứ-hai đổi.
- **Không đổi câu ném.** `The agent builder can be delegated only once per turn.`
  giữ nguyên nguyên văn — nó đi ra `turn.failed` và là câu người dùng thấy.
- **Không dựng eval eve `mockModel`.** Giá là một app eve thứ hai trong kho chỉ
  để đo, cộng một khoá vào `feature_loop.suite_keys`. Vế nó phủ mà `mock.module`
  không với tới khai thành Known limits.
- **Không thêm hook `turn.started` để reset slot.** Vế reset đã nằm trong luật
  đổi `turnId`; thêm nó là hai chỗ cùng nói một luật.
- **Không gỡ hai câu dặn `not_authorized` trong `task.ts`.**
- **Không thu bán kính `commandType` lại.** Chốt vẫn chạy trên **mọi** lượt
  `purpose=builder`, kể cả hội thoại thường. Mục Bối cảnh nêu việc bán kính vừa
  rộng ra như một **dữ kiện làm bug nặng hơn**, không phải như một việc vòng này
  sửa: bán kính rộng chính là lời hứa mà hợp đồng `tran-mot-lan-uy-thac` đã ký
  (AC-9 của nó), và AC-11 ở đây đóng băng nó thành tiêu chí không hồi quy — đúng
  **hai** ô `purpose=builder` cho gác qua. Thu nó lại là lật một hợp đồng đã ký,
  nên nếu muốn thì đi một vòng riêng. Xem entry `revisit` trong `decisions.jsonl`.
  Ghi thành chữ sau finding P1 thứ nhất của `gap-probe.md`, để người duyệt không
  đọc mục Bối cảnh rồi tưởng vòng này thu bán kính.
- **Không sửa năm Known limits còn lại** của `tran-mot-lan-uy-thac` (câu lỗi eve
  ghim nguyên văn, phép đo gác đọc tín hiệu môi trường, `.not.toThrow()` không
  đọc trạng thái, và hai bản trùng của mục thứ nhất).

## Notes

Ràng buộc đã đặt tên, kế thừa từ vòng trước: hook của eve **chỉ quan sát**
(`guides/hooks.md`: *Handlers are observe-only*). Cần lực chặn thì chỉ có một cần
gạt — ném. "Nuốt lặng lời gọi thứ hai" không tồn tại trong hợp đồng của eve.

Vòng này không làm trần **mềm** hơn: một uỷ thác lần hai thật vẫn giết lượt. Nó
chỉ thôi giết những lượt mà eve đang cố **cứu**.
