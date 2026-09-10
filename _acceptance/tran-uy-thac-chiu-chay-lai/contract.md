---
schema_version: 1
feature: Trần một-lần-uỷ-thác agent_builder chịu được lần chạy lại của một step — đổi khoá từ callId do mô hình sinh sang toạ độ (turnId, stepIndex, sequence) của sự kiện actions.requested, và vá lỗ đo khiến trần chết mà 22 bài vẫn xanh
slug: tran-uy-thac-chiu-chay-lai
owner: omre.cnsp4@onemount.com
risk_tier: T2
surfaces: [agent]
status: draft
approved_by:
approved_at:
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

### Sự thật về eve, đọc từ mã chứ không từ tài liệu

Ba dòng dưới đây là **lý do vòng này phải sửa hợp đồng sau khi chốt phạm vi**. Bản
hợp đồng đầu tin `guides/hooks.md` (*"keys well on the coordinates … turnId,
stepIndex, sequence"*) mà không mở `dist/` ra kiểm. Hai vòng chấm bác nó, và tôi
đã tự đọc lại `eve@0.29.4` đang cài để xác nhận:

| Neo | Sự thật trong mã |
| --- | --- |
| `sequence` đổi ở đâu | chỉ ở `emitTurnEpilogue` và `emitRecoverableFailedTurn` — **biên lượt**. `advanceStep` chỉ tăng `stepIndex` |
| `turnId` đúc từ đâu | `emitTurnPreamble`: `turn_${n.sequence}` — nên trong một lượt, `turnId` xác định hoàn toàn `sequence` |
| một sự kiện mang mấy lời gọi | `emitActionRequest`: `actions:[e]` — **một lời gọi một sự kiện**, cùng toạ độ step. Subagent-call đi đúng đường này |
| đường batch nhiều lời gọi | `stream-actions.js` và `emitStepActions` — chỉ cho tool **provider-executed** và cho lời gọi **chưa** phát lẻ |
| `step.started` phát ở đâu | `buildStepHooks` → `prepareStep`, mang `{sequence, stepIndex, turnId}` — nên một step chạy lại **tự khai** |

Hệ quả, và đây là điều làm hợp đồng cũ sai: khoá theo toạ độ **không phân biệt**
được lần chạy lại với hai lời gọi song song trong cùng một step — cả hai đều cho
toạ độ giống nhau. Bản khoá theo `callId` của vòng trước chặn được ca song song;
bản khoá theo toạ độ **cho lọt**, tức nó là một hồi quy. Ranh giới chạy lại thật
là `step.started`, không phải `sequence`.

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
| A. Quan hệ hai lần thấy uỷ thác | lặp đúng `callId` · `callId` khác cùng step · `callId` khác step khác · khác `turn` | `harness/emission.js` (một lời gọi một sự kiện, toạ độ step bất biến) — đọc từ mã, không từ tài liệu |
| A'. Ranh giới chạy lại | có `step.started` trùng step đã ghi · có `step.started` step khác · không có `step.started` | `harness/step-hooks.js` (`prepareStep` phát `step.started` mỗi lần step chạy) |
| B. Hình dạng lời gọi trong MỘT sự kiện | 0 · 1 · 2 cùng batch · 1 builder + 1 subagent khác | AC-7 và AC-9 của `tran-mot-lan-uy-thac` |
| C. Mắt sống của chuỗi cưỡng chế | gác `purpose` · hook truyền đủ toạ độ · hàm ném · hook **ghi bền** | ba số đo đột biến ở mục Mốc ghim |
| D. Phạm vi phiên | `builder` · `team-agent` · `research` | ma trận `purpose × commandType`, `tran-uy-thac.spec.ts` |

- Trục A — phủ bởi AC-2, AC-3, AC-4 và vế chiều đỏ của AC-2 (lặp đúng `callId`);
  bằng chứng "đủ" là bốn quan hệ đều có tiêu chí riêng, và hai giá trị đầu cho
  **hai kết cục trái nhau** trên cùng một bộ dựng.
- Trục A' — phủ bởi AC-1 (trùng step → xoá ô) và AC-3 (step khác → để nguyên) và
  AC-2 (không có `step.started` → chặn); bằng chứng "đủ" là **cả ba** giá trị đều
  có một tiêu chí, và chúng cho ba kết cục khác nhau trên cùng một ô đã ghi. Đây
  là trục mà hợp đồng đầu **không có** — nó tưởng `sequence` làm việc này.
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
| 1 | có `step.started` trùng step × 1 lần | Core | AC-1 |
| 2 | không `step.started` × `callId` khác cùng step | Core | AC-2 |
| 3 | cùng `turn` khác `step` × 1 lần | Core | AC-3 |
| 4 | khác `turn` × 1 lần | Core | AC-4 |
| 5 | chưa có tiền sử × 1 lần | Core | AC-5 |
| 5b | lặp đúng `callId` cùng step | Core | AC-2 chiều đỏ |
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
| 21 | trạng thái **đã** ghi ô × 0 lời gọi | Core | AC-12 |
| 22 | `step.started` step KHÁC × ô đã ghi | Core | AC-1, AC-3 |
| 23 | `step.started` ở phiên ngoài kênh builder | Core | AC-11 |

Core 19/24. Cao, và nói thẳng vì sao: preset `test-matrix` để full matrix cho
"luồng tiền và luồng pháp lý"; luồng ở đây là một chốt **giết lượt trò chuyện
của người dùng** và vừa được chứng minh là giết oan, nên nó ăn cùng mức. Năm ô
Later đều là ô **suy ra được** từ một ô Core, mỗi ô ghi lý do riêng ở trên.

Mọi trục nêu được thước "đủ" bằng một vật có thật trong kho hoặc một số vừa đo.
Không giá trị nào phải hạ xuống `[GIẢ ĐỊNH]`. Hai dòng `[NGÀNH]` ở trên là ứng
viên chờ người gạch, không phải fact của sản phẩm.

## Criteria

Trạng thái của trần là `{ turnId, stepIndex, callIds }` — lượt đang xét, step mà
lần uỷ thác đã ghi, và các `callId` đã thấy **ở step đó**. `sequence` không có
trong khoá, vì trong một lượt nó là hằng (xem mục Mốc ghim).

- **AC-1 — Một step chạy lại KHÔNG bị coi là uỷ thác thứ hai, và ranh giới ấy là `step.started`.**
*(ca bản tại `83501f3` giết oan)*
Given trạng thái đã ghi một uỷ thác `agent_builder` tại `(turn-1, step 2)` với
`callId` `call-a` — trạng thái ấy **round-trip** qua chính `recordBuilderDelegation`,
không phải object viết tay,
When hook nhận `step.started` mang **cùng** `(turn-1, step 2)` — eve phát nó từ
`prepareStep`, nên một step chạy lại tự khai — rồi nhận một `subagent-call` tới
`agent_builder` với `callId` **mới**,
Then `step.started` xoá ô của step ấy (`stepIndex` về `null`, `callIds` rỗng), và
lời gọi mới **không ném**, ghi ô `(turn-1, step 2, [call-b])`.
Chiều đỏ, trên **cùng** fixture: **bỏ** `step.started` đi → lời gọi thứ hai
**phải ném**. Vế này là chỗ phân biệt duy nhất, và nó là lý do khoá theo toạ độ
không làm được: không có `step.started`, hai ca có toạ độ y hệt.
Sàn khuôn: `callId` hai lần phải khác nhau. Và `step.started` của một step **khác**
phải để ô nguyên — đo trong cùng nhóm bài.

- **AC-2 — Hai lời gọi song song trong CÙNG một step, đến thành HAI sự kiện, bị chặn.**
*(ca mà bản khoá-theo-toạ-độ của vòng chấm 1 và 2 cho lọt)*
Given trạng thái đã ghi một uỷ thác tại `(turn-1, step 2)` với `call-a`,
When hook nhận một sự kiện `actions.requested` **riêng**, cùng `(turn-1, step 2)`,
mang một `subagent-call` tới `agent_builder` với `callId` **khác** — và **không**
có `step.started` nào ở giữa,
Then **ném**, thông điệp chứa `only once`.
Đây là hình dạng eve **thật sự phát**: `emitActionRequest` phát một lời gọi một
sự kiện, nên mô hình gọi `agent_builder` hai lần trong một step thì hook thấy hai
sự kiện cùng toạ độ. Không có `step.started` giữa chúng, vì step không chạy lại.
Chiều đỏ: cùng fixture, dùng lại **đúng** `callId` cũ → **không** được ném, và
trạng thái không đổi (hook là at-least-once, nhận lại cùng lời gọi là bình thường).
Sàn khuôn: phải có **một** bài lái qua **chính hook thật** cho ca này, không chỉ
gọi hàm thuần — vì cái sai của hai vòng trước nằm đúng ở chỗ hook truyền gì xuống.

- **AC-3 — Uỷ thác ở một step KHÁC trong cùng lượt bị chặn.**
Given trạng thái đã ghi một uỷ thác tại `(turn-1, step 2)`,
When hook nhận một lời gọi ở cùng `turnId`, `stepIndex` **khác**,
Then **ném** — kể cả khi `step.started` của step mới đã chạy, vì nó chỉ xoá ô khi
`stepIndex` **trùng** ô đã ghi.
Chiều đỏ: đưa `stepIndex` về đúng step đã ghi **và** dùng lại `callId` cũ → không ném.

- **AC-4 — `turnId` mới thì trần mở lại.**
Given trạng thái đã ghi một uỷ thác ở `turn-1`,
When hook nhận một lời gọi ở `turnId` **khác**,
Then không ném, và trạng thái mang ô **mới** — `turnId` mới, `stepIndex` mới,
`callIds` chỉ có lời gọi mới.
Assert phải **đọc trạng thái** và so cả ba trường.
Chiều đỏ: giữ nguyên `turnId` cũ, đổi `stepIndex` → phải ném.

- **AC-5 — Uỷ thác lần đầu trong lượt vẫn lọt, và ghi đúng ô.**
Given trạng thái rỗng,
When hook nhận đúng một `subagent-call` tới `agent_builder` tại `(turn-1, step 2)`,
Then không ném, và trạng thái đọc ra **bằng đúng**
`{ turnId: "turn-1", stepIndex: 2, callIds: ["call-a"] }`.
Đây là đường ra `not_authorized` mà vòng `quyen-luot-mang-theo` dựng. Vá quá tay
thành chặn-ngay-lần-một là phá đúng thứ vừa xây.
Chiều đỏ: thêm một sự kiện thứ hai khác `callId` → phải ném.

- **AC-6 — Hai lời gọi trong CÙNG một `actions` bị chặn.**
Given trạng thái rỗng,
When **một** sự kiện mang **hai** `subagent-call` tới `agent_builder`,
Then **ném**.
Phạm vi đã đo, nói thẳng: đường phát nhiều lời gọi trong một sự kiện là
`stream-actions.js` và `emitStepActions`, và chúng chỉ gom lời gọi **provider-executed**
hoặc lời gọi **chưa** phát lẻ — subagent-call thường không đi đường đó. Nên tiêu
chí này là **chốt phòng thủ**, không phải ca thường gặp; nó giữ nguyên lời hứa
AC-7 của vòng `tran-mot-lan-uy-thac` và bịt đường nếu eve đổi cách gom.
Chiều đỏ: lời gọi thứ hai tới subagent **khác** → không ném.

- **AC-7 — Lời gọi tới subagent khác không tính vào trần.**
Given trạng thái rỗng,
When một sự kiện mang một `subagent-call` tới `agent_builder` và một tới `agent_runner`,
Then không ném, và `callIds` chỉ có `callId` của lời gọi builder.
Chiều đỏ: đổi đúng trường `subagentName` của lời gọi thứ hai sang `agent_builder`
→ phải ném.

- **AC-8 — Sự kiện không mang lời gọi `agent_builder` nào phải im lặng, và KHÔNG chiếm ô.**
Given trạng thái rỗng,
When hook nhận một sự kiện `actions` **rỗng**, rồi một sự kiện chỉ có
`subagent-call` tới subagent **khác**,
Then không ném, và trạng thái đọc ra có `stepIndex` `null` và `callIds` rỗng.
Chiều đỏ: trên **cùng** fixture, đổi đúng trường `subagentName` sang
`agent_builder` → `callIds` phải **lật** từ rỗng sang `["call-1"]`.

- **AC-9 — Chuỗi cưỡng chế của hook phải SỐNG, đo bằng đột biến chứ không bằng lời.**
Given `builderDelegationState` ở module riêng, và một phép đo thay module ấy bằng
handle giả (`mock.module`), giữ hàm thuần thật, rồi lái **chính hook thật**,
When thân hook bị đột biến,
Then bộ đo phải **ĐỎ** ở cả ba hình dạng: bỏ thân hook · bỏ `record` và `update` ·
bỏ `update`. Hình dạng 2 và 3 tại `83501f3` cho **22 xanh** — chúng là lý do tiêu
chí này tồn tại. Ngưỡng là **cả ba**.
Sàn khuôn, sửa sau vòng chấm 2: **cả ba** bản đột biến phải **dẫn từ văn bản thật
đọc từ đĩa**, không bản nào chép tay — bản chép tay làm chốt `banDotBien === nguon`
không bao giờ nổ được cho nó. Và phép đo chuỗi cưỡng chế sống trong **một** hàm
của module dùng chung (`kiemChuoiCuongChe`), được cả bộ đo thật lẫn bài đo do răng
sinh ra gọi — bài sinh ra chỉ một dòng, nên nó không thể lạc hậu.
Chiều đỏ của chính răng: trên cây **lành** phép đo phải xanh, chạy **trước** khi
đột biến; không xanh → mã 2.
Phạm vi đã đo: phép đo chạy in-process, nên **không** chứng minh eve THẬT truyền
đúng `stepIndex` xuống hook. Khai ở Known limits.

- **AC-10 — Kiểu tham số suy từ type công khai của eve, đo bằng QUAN HỆ.**
Given `recordBuilderDelegation` và `clearBuilderDelegationStep`,
When đọc chữ ký của chúng,
Then tham số sự kiện có kiểu **tương đương hai chiều** với
`HookEvent<"actions.requested">["data"]` và `HookEvent<"step.started">["data"]`.
Đo bằng một phép tương đương ở tầng type, không đếm trường và không grep chuỗi.
Sàn khuôn, sửa sau vòng chấm 1: chiều âm là một **phản-ví-dụ răng tự dựng** — cùng
phép tương đương ấy áp cho một kiểu **khai tay** đủ trường; phản-ví-dụ qua được
thì phép đo không có răng, và răng thoát mã 2 gọi tên điều đó.

- **AC-11 — Không hồi quy: CẢ HAI handler không đụng phiên ngoài kênh builder.**
Given ma trận **toàn phần** `purpose × commandType`: `purpose` ∈ {`builder`,
`team-agent`, `research`} × `commandType` ∈ {`CREATE_AGENT`, `CHAT`},
When handler `actions.requested` chạy cho từng ô,
Then đúng **hai** ô `purpose = builder` cho gác qua; **bốn** ô còn lại bị gác chặn.
Số assert bằng **6**.
Và vế mới của vòng này: handler `step.started` cũng phải bị gác chặn ở phiên ngoài
kênh builder, và cho qua ở phiên builder — đo trong cùng nhóm bài, vì một hook có
hai handler thì gác phải áp cả hai.
Sàn khuôn giữ nguyên: cả sáu ô dựng từ **một** bộ dựng — đầu ra thật của
`builderSessionAttributes` trải ra rồi đè đúng hai trường.
Chiều đỏ nằm trong chính ma trận: hai ô cho qua là đối chứng dương của bốn ô chặn.

- **AC-12 — Sự kiện KHÔNG có uỷ thác không được XOÁ ô đã ghi.**
Given trạng thái đã ghi một uỷ thác tại `(turn-1, step 2)`,
When hook nhận một sự kiện `actions.requested` **không** mang lời gọi
`agent_builder` nào ở `(turn-1, step 3)`, rồi một uỷ thác thật ở `(turn-1, step 4)`,
Then sự kiện giữa không ném và ô đọc lại **vẫn bằng đúng** `(turn-1, step 2, [call-a])`;
uỷ thác ở step 4 **ném**.
Sàn khuôn: **ba** sự kiện liên tiếp qua **cùng một** handle, và sự kiện thứ nhất
phải đi qua **chính hook**, không nạp trạng thái trực tiếp.
Chiều đỏ: cùng ba sự kiện ấy nhưng thay sự kiện giữa bằng `step.started` của step
**2** → ô **bị** xoá và lời gọi ở step 2 lọt. Cặp này phân biệt "xoá đúng chỗ" với
"xoá bừa".

- **AC-13 — Câu ném đúng TOÀN VĂN.**
Given câu ném của trần,
When trần bật,
Then thông điệp **bằng đúng** `The agent builder can be delegated only once per turn.`
Đo bằng so **toàn văn** với một hằng dùng chung giữa mã sản phẩm và bộ đo, lấy từ
**lần ném thật**.
Chiều đỏ: assert phải đỏ nếu câu bị đổi mà vẫn chứa `only once`.
Phạm vi đã đo: dừng ở đầu ra của hàm. Vòng `tran-mot-lan-uy-thac` đã kiểm và kết
luận không bên tiêu thụ nào khớp theo câu trần — xem `[tran-mot-lan-uy-thac#F1]`.
Nên đây **không** phải criterion xuyên lớp.

## Sửa sau khi chốt phạm vi — đổi khuôn, ngày 2026-09-10

Người ký chọn đường **đổi khuôn** tại điểm dừng của điều khoản dừng-vá, sau khi hai
vòng chấm liên tiếp REJECT với 13 eval xanh và 5 lệnh cổng xanh ở cả hai vòng.

Lời hứa hành vi **không đổi**: một lần uỷ thác mỗi lượt, và một step chạy lại thì
không bị tính là lần thứ hai. Thứ đổi là **cơ chế nhận ra lần thứ hai**, và ba chỗ
hợp đồng cũ ghi **sai sự thật** về eve:

- Khoá: từ `(turnId, stepIndex, sequence)` sang `(turnId, stepIndex)` + **tập
  `callId` trong step đó**, cộng hook `step.started` làm ranh giới chạy lại.
- AC-2 cũ đo hình dạng «cùng `turnId`, khác `sequence`» — eve **không phát** hình
  dạng đó. AC-2 mới đo ca eve **thật sự phát** và là ca bản cũ cho lọt.
- AC-6 giữ lời hứa nhưng nay khai rõ đường phát của nó, thay vì ngầm coi là ca thường.
- Trường `sequence` rời khỏi trạng thái: nó là nhánh chết.

Hai finding trong hợp đồng của vòng chấm 2 sửa cùng lượt: bản đột biến thứ nhất nay
dẫn từ văn bản thật, và mọi fixture trạng thái round-trip qua chính bên ghi.

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
