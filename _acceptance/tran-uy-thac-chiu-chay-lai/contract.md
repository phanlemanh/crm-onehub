---
schema_version: 1
feature: Bộ đo của trần một-lần-uỷ-thác bắt được khi chốt chết, và kiểu tham số neo vào type công khai của eve — CỘNG bằng chứng từ mã eve cho biết vì sao ca «step chạy lại bị giết oan» KHÔNG vá được ở lớp actions.requested, ghi thành giới hạn đã khai và ghim bằng một phép đo có tên
slug: tran-uy-thac-chiu-chay-lai
owner: omre.cnsp4@onemount.com
risk_tier: T2
surfaces: [agent]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-09-11
design_doc: docs/superpowers/specs/2026-09-10-tran-uy-thac-chiu-chay-lai-design.md
---

# Acceptance Contract: tran-uy-thac-chiu-chay-lai

> **Tên hồ sơ không còn mô tả đúng thứ nó giao.** Vòng mở ra để làm trần *sống sót khi
> một bước chạy lại*; hai khuôn liên tiếp bị chính runtime của eve bác, và người
> ký chọn **thu phạm vi**. Tên giữ nguyên vì hai lượt phản biện, hai vòng bằng
> chứng và sổ quyết định trong thư mục này **chính là** bản ghi vì sao việc ấy
> không làm được ở lớp này — đổi slug là bỏ mất đúng phần có giá trị nhất.

## Bối cảnh

Vòng `tran-mot-lan-uy-thac` (đã ký) để lại hai việc: một hạn chế đã biết — **bộ
đo không phát hiện được khi thân hook chết** — và một mục tách riêng: **trần khoá
theo `callId` do mô hình sinh, nên một step bị ngắt rồi chạy lại trong cùng lượt
sẽ giết oan cả lượt.**

Vòng này giải quyết việc thứ nhất, và **chứng minh việc thứ hai không giải được**
ở lớp `actions.requested` với eve 0.29.4 đang cài. Bằng chứng ở mục dưới.

## Mốc ghim

SHA của cây TRƯỚC vòng này: `83501f3`.

| Neo | Số tại `83501f3` |
| --- | --- |
| bài đo trong `test/tran-uy-thac.spec.ts` | 22 |
| module chứa riêng `defineState` handle | 0 — handle ở chung file với hàm thuần |
| `lib/builder-delegation.ts` khai tay kiểu hành động | có (`BuilderDelegationAction`) |
| đột biến «bỏ `record` và `update`, giữ `get`» | **22 xanh** |
| đột biến «bỏ `update`, giữ `record`» | **22 xanh** |
| đột biến «thân hook rỗng» | 8 đỏ / 22 |

Ba dòng đột biến cuối là **số đo**, chạy tại SHA ấy trong cây worktree này.

### Vì sao ca «chạy lại» không vá được ở lớp này — đọc từ mã eve, không từ tài liệu

`guides/hooks.md` khuyên khoá chốt một-lần-mỗi-lượt theo toạ độ
`(turnId, stepIndex, sequence)`. Vòng này **đã thử hai khuôn** dựa trên lời khuyên
ấy, và cả hai bị bác bởi chính mã trong `node_modules/eve/dist/src/harness/`:

| Mệnh đề | Mã nói gì |
| --- | --- |
| `sequence` phân biệt được lời gọi trong một lượt | **Không.** `emitTurnPreamble` đúc `turnId = turn_${sequence}`; `advanceStep` chỉ tăng `stepIndex`; `sequence` chỉ +1 ở `emitTurnEpilogue` và `emitRecoverableFailedTurn` — biên lượt. Trong một lượt, `sequence` là hằng |
| Một sự kiện mang trọn lời gọi của một step | **Không.** `emitActionRequest` phát `actions:[e]` — một lời gọi một sự kiện, cùng toạ độ step. Subagent-call đi đúng đường này |
| `step.started` đánh dấu một step chạy lại | **Không, sai cả hai chiều.** `runOneModelCall` truyền `suppressStepStartedEmission: t !== 1`, nên **mọi attempt thử lại của `runModelCallWithRetries` KHÔNG phát** `step.started`; hai đường recovery cũng vậy. Ngược lại, park runtime-action lưu `emissionState` y nguyên (`advanceStep` chỉ gọi ở nhánh kết step), nên **quay lại step sau khi subagent xong LẠI phát** `step.started` cùng `stepIndex` |

Hệ quả, và đây là kết luận của vòng: ba ca dưới đây **không phân biệt được** bằng
những gì hook thấy ở `actions.requested`.

| Ca | Hook thấy | `step.started` giữa hai lời gọi | Phải làm gì |
| --- | --- | --- | --- |
| **R** — model thử lại trong step | hai sự kiện, cùng toạ độ, khác `callId` | không | **tha** |
| **P** — hai lời gọi song song | hai sự kiện, cùng toạ độ, khác `callId` | không | **chặn** |
| **C** — builder xong, model gọi lại | hai sự kiện, cùng toạ độ, khác `callId` | có | **chặn** |

**R và P giống nhau hoàn toàn.** Khoá theo toạ độ tha cả hai (nên P lọt — hồi
quy). Khoá theo `callId` chặn cả hai (nên R bị giết oan — bug gốc). `step.started`
chỉ tách được C, mà C là ca phải **chặn**, nên dùng nó làm ranh giới tha là sai dấu.

Vòng này chọn **chặn cả R và P**: giữ đúng hành vi của nhánh nền. Ca R thành
**giới hạn đã khai**, và được **ghim bằng một phép đo có tên** (AC-13) để lần sau
ai đó đổi nó thì biết mình đang đổi một điều đã được quyết, không phải sửa một bug
mới phát hiện.

Một hướng chưa thử, ghi lại để vòng sau khỏi dò lại: đếm ở `action.result` thay vì
`actions.requested` — lời gọi của attempt bị bỏ không bao giờ có kết quả, nên R
tách được khỏi P. Giá là trần thành **hậu kiểm**: nó cắt ở lần thứ hai *sau khi*
subagent thứ hai đã chạy. Chưa kiểm trên mã, và không nằm trong phạm vi vòng này.

## Coverage

Quét bằng `morphological-scan`, preset `test-matrix`. Chân sản phẩm:
`[SUY-TỪ-REPO: docs/agent.md]`, `[SUY-TỪ-REPO: _acceptance/tran-mot-lan-uy-thac/contract.md]`.
Chân ngành: khoá chống-lặp dưới giao-ít-nhất-một-lần phải ổn định qua lần thử lại —
`[NGÀNH: Stripe idempotency key]`, `[NGÀNH: Temporal]`. Hai dòng `[NGÀNH]` này là
**đúng về nguyên tắc và không áp dụng được ở đây**, và mục trên nói vì sao: cả hai
chuẩn ấy giả định bên gọi gửi lại **cùng** một khoá, còn ở đây mô hình sinh khoá mới
mỗi lần và runtime không cấp khoá ổn định nào thay thế.

| Trục | Giá trị | Thước CE |
| --- | --- | --- |
| A. Hình dạng lời gọi trong một sự kiện | 0 · 1 · 2 cùng batch · 1 builder + 1 khác | AC-7 và AC-5 của `tran-mot-lan-uy-thac` |
| B. Quan hệ hai lần thấy uỷ thác | lặp đúng `callId` · `callId` khác cùng lượt · khác lượt | `harness/emission.js` — một lời gọi một sự kiện |
| C. Mắt sống của chuỗi cưỡng chế | gác `purpose` · hook gọi hàm · hàm ném · hook **ghi bền** | ba số đo đột biến ở Mốc ghim |
| D. Phạm vi phiên | `builder` · `team-agent` · `research` | ma trận `purpose × commandType` |

- Trục A — phủ bởi AC-7, AC-1, AC-5, AC-6; bốn hình dạng đều có tiêu chí riêng.
- Trục B — phủ bởi AC-3, AC-2, AC-4; ba giá trị cho ba kết cục khác nhau, và AC-13
  ghim rõ ca R nằm trong giá trị giữa **theo chủ ý**, không phải do sót.
- Trục C — phủ bởi AC-9 và AC-10; bằng chứng "đủ" là **hai đột biến từng cho 22
  xanh nay phải đỏ**, đo bằng số. Đây là trục hồ sơ trước **không có**, và là lý do
  chính vòng này tồn tại.
- Trục D — phủ bởi AC-11, ma trận toàn phần 6 ô, số assert bằng số ô.

Không gian A × B = 12 ô; 2 ô `A=0 × B` gạch (chưa có uỷ thác thì không có quan hệ
để so), còn 10. Cộng 4 ô trục C và 3 ô trục D = **17 ô có nghĩa**, Core 13/17. Bốn
ô Later: ba tổ hợp `2 lời gọi cùng batch × quan hệ B` (suy ra từ AC-5, vì nhánh
batch ném trước khi xét quan hệ) và ô `1 builder + 1 khác × lượt mới` (suy ra từ
AC-4 và AC-6, không sinh nhánh mã nào).

## Criteria

Trạng thái của trần là `{ turnId, callIds }` — đúng hình dạng của nhánh nền, nên
tên slot giữ nguyên `crm.builder-delegation` và **không có** chuyện phiên đang chạy
mất trần lúc triển khai.

- **AC-1 — Uỷ thác lần đầu trong lượt lọt, và ghi đúng `callId`.**
Given trạng thái rỗng,
When hook nhận đúng một `subagent-call` tới `agent_builder`,
Then không ném, và trạng thái đọc ra **bằng đúng** `{ turnId, callIds: ["call-a"] }`.
Đây là đường ra `not_authorized` mà vòng `quyen-luot-mang-theo` dựng.
Chiều đỏ: thêm một lời gọi thứ hai khác `callId` → phải ném.

- **AC-2 — Lời gọi thứ hai khác `callId` trong cùng lượt bị chặn, KỂ CẢ khi hai lời gọi ở cùng một step.**
Given trạng thái đã ghi một uỷ thác — round-trip qua chính `recordBuilderDelegation`,
When hook nhận một sự kiện `actions.requested` **riêng** mang một `subagent-call`
tới `agent_builder` với `callId` khác, ở **cùng** step hoặc ở step khác,
Then **ném**, thông điệp chứa `only once`.
Vế "cùng step" là ca mà bản khoá-theo-toạ-độ của hai vòng chấm đầu **cho lọt** —
`emitActionRequest` phát một lời gọi một sự kiện, nên hai lời gọi song song trong
một step có toạ độ y hệt. Bản này chặn vì nó khoá theo `callId`.
Sàn khuôn: phải có **một** bài lái qua **chính hook thật**, không chỉ hàm thuần.
Chiều đỏ: cùng fixture, dùng lại **đúng** `callId` cũ → không được ném.

- **AC-3 — Nhận lại đúng `callId` không phải uỷ thác thứ hai.**
Given trạng thái đã ghi `call-a`,
When hook nhận lại một sự kiện mang **đúng** `call-a`,
Then không ném, và trạng thái **không đổi**. Hook của eve là at-least-once.
Chiều đỏ: đổi đúng `callId` sang giá trị khác → phải ném.

- **AC-4 — `turnId` mới thì trần mở lại.**
Given trạng thái đã ghi một uỷ thác ở `turn-1`,
When hook nhận một lời gọi ở `turnId` khác,
Then không ném, và trạng thái mang `turnId` mới cùng chỉ `callId` mới.
Assert phải **đọc trạng thái**, không chỉ "không ném".
Chiều đỏ: giữ nguyên `turnId` cũ → phải ném.

- **AC-5 — Hai lời gọi trong CÙNG một `actions` bị chặn.**
Given trạng thái rỗng,
When **một** sự kiện mang **hai** `subagent-call` tới `agent_builder`,
Then **ném**.
Phạm vi đã đo: đường phát nhiều lời gọi trong một sự kiện là `stream-actions.js`
và `emitStepActions`, chỉ dùng cho tool provider-executed hoặc lời gọi chưa phát
lẻ — subagent-call thường không đi đường đó. Đây là **chốt phòng thủ**, giữ lời
hứa của vòng trước và bịt đường nếu eve đổi cách gom.
Chiều đỏ: lời gọi thứ hai tới subagent **khác** → không ném.

- **AC-6 — Lời gọi tới subagent khác không tính vào trần.**
Given trạng thái rỗng,
When một sự kiện mang một `subagent-call` tới `agent_builder` và một tới `agent_runner`,
Then không ném, và `callIds` chỉ có `callId` của lời gọi builder.
Chiều đỏ: đổi đúng trường `subagentName` của lời gọi thứ hai → phải ném.

- **AC-7 — Sự kiện không mang lời gọi `agent_builder` nào phải im lặng, và KHÔNG chiếm ô.**
Given trạng thái rỗng,
When hook nhận một sự kiện `actions` **rỗng**, rồi một sự kiện chỉ có `subagent-call`
tới subagent **khác**,
Then không ném, và `callIds` **rỗng**.
Chiều đỏ: trên **cùng** fixture, đổi đúng trường `subagentName` sang `agent_builder`
→ `callIds` phải **lật** từ rỗng sang `["call-1"]`. Vế lật bắt buộc vì rỗng đúng
bằng giá trị mặc định, nên assert rỗng một mình không phân biệt được "bỏ qua đúng"
với "hàm chết".

- **AC-8 — Sự kiện không mang uỷ thác cũng KHÔNG XOÁ ô đã ghi.**
Given trạng thái đã ghi một uỷ thác,
When hook nhận một sự kiện **không** mang lời gọi `agent_builder` nào ở cùng lượt,
rồi một uỷ thác thật,
Then sự kiện giữa không ném và ô đọc lại **vẫn nguyên**; uỷ thác sau **ném**.
Sàn khuôn: **ba** sự kiện liên tiếp qua **cùng một** handle, sự kiện đầu đi qua
**chính hook**, không nạp trạng thái trực tiếp.
Chiều đỏ: sự kiện giữa ở **lượt mới** → ô **phải** về rỗng. Cặp này phân biệt
"giữ đúng chỗ" với "không bao giờ dọn".

- **AC-9 — Chuỗi cưỡng chế của hook phải SỐNG, đo bằng đột biến chứ không bằng lời.**
*(đây là hạn chế đã biết thứ nhất của `tran-mot-lan-uy-thac`, và là lý do chính vòng này tồn tại)*
Given `builderDelegationState` ở module riêng, và một phép đo thay module ấy bằng
handle giả (`mock.module`), giữ hàm thuần thật, rồi lái **chính hook thật**,
When thân hook bị đột biến,
Then bộ đo phải **ĐỎ** ở cả ba hình dạng: bỏ thân hook · bỏ `record` và `update` ·
bỏ `update`. Hình dạng 2 và 3 tại `83501f3` cho **22 xanh**.
Sàn khuôn, sáu điều — trong đó hai điều sửa sau vòng chấm 2: **cả ba** bản đột
biến phải **dẫn từ văn bản thật đọc từ đĩa** (bản chép tay làm chốt chống-lạc-hậu
không bao giờ nổ được cho nó), và **trọn** phép đo sống trong **một hàm** của module
dùng chung, được cả bộ đo thật lẫn bài đo do răng sinh gọi — bài sinh ra chỉ một
dòng nên không thể lạc hậu.
Chiều đỏ của chính răng: trên cây **lành** phép đo phải xanh, chạy **trước** khi
đột biến; không xanh → mã 2.
Phạm vi đã đo: chạy in-process, nên **không** chứng minh eve THẬT truyền đúng dữ
liệu xuống hook. Khai ở Known limits.

- **AC-10 — Kiểu tham số suy từ type công khai của eve, đo bằng QUAN HỆ.**
*(hạn chế đã biết thứ ba của `tran-mot-lan-uy-thac`)*
Given `recordBuilderDelegation`,
When đọc chữ ký của nó,
Then tham số sự kiện có kiểu **tương đương hai chiều** với
`HookEvent<"actions.requested">["data"]`, và `lib/builder-delegation.ts` không còn
khai tay kiểu hành động.
Đo bằng phép tương đương ở tầng type, **không** đếm trường và **không** grep chuỗi.
Sàn khuôn, sửa sau vòng chấm 1: chiều âm là một **phản-ví-dụ răng tự dựng** — cùng
phép tương đương ấy áp cho một kiểu **khai tay** đủ trường; phản-ví-dụ qua được thì
phép đo không có răng, và răng thoát mã 2 gọi tên điều đó.

- **AC-11 — Không hồi quy: hook không đụng phiên ngoài kênh builder.**
Given ma trận **toàn phần** `purpose × commandType` = 6 ô,
When handler chạy cho từng ô,
Then đúng **hai** ô `purpose = builder` cho gác qua; bốn ô còn lại bị chặn. Số
assert bằng **6**.
Sàn khuôn giữ nguyên của vòng trước: cả sáu ô dựng từ **một** bộ dựng — đầu ra thật
của `builderSessionAttributes` trải ra rồi đè đúng hai trường.
Chiều đỏ nằm trong chính ma trận: hai ô cho qua là đối chứng dương của bốn ô chặn.
Ghi chú khuôn đo: vòng này thay module state bằng handle giả, nên "gác cho qua"
nhận diện bằng **handle giả có bị chạm không**, không còn ghim nguyên văn câu lỗi
của eve. Đó là một cái lợi — hai hạn chế đã biết của vòng trước thôi áp cho ma trận này.

- **AC-12 — Câu ném đúng TOÀN VĂN.**
Given câu ném của trần,
When trần bật,
Then thông điệp **bằng đúng** `The agent builder can be delegated only once per turn.`
Đo bằng so **toàn văn** với một hằng dùng chung giữa mã sản phẩm và bộ đo, lấy từ
**lần ném thật**.
Chiều đỏ: assert phải đỏ nếu câu bị đổi mà vẫn chứa `only once`.
Phạm vi đã đo: dừng ở đầu ra của hàm — xem `[tran-mot-lan-uy-thac#F1]`.

- **AC-13 — Giới hạn «chạy lại bị chặn» phải được GHIM bằng một phép đo có tên.**
Given trạng thái đã ghi một uỷ thác trong lượt,
When một lời gọi mới với `callId` khác đến trong **cùng** lượt — hình dạng mà một
lượt chạy lại của một bước của step sinh ra,
Then **ném**.
Tiêu chí này **không** thêm hành vi nào; nó ghim một điều đã quyết. Nhóm bài mang
tên `gioi-han-chay-lai` để người sửa nó về sau đọc tên là biết mình đang đổi một
**giới hạn đã khai**, không phải vá một bug mới phát hiện. Lý do nó là giới hạn
nằm ở mục Mốc ghim: ca R và ca P không phân biệt được ở lớp `actions.requested`.
Chiều đỏ: cùng fixture nhưng ở **lượt mới** → không được ném. Vế này chứng giới hạn
chỉ áp trong một lượt, không phải trần bị kẹt vĩnh viễn.

## Đường đo

Hồ sơ này không có `opportunity.md` — xem entry `descope` trong `decisions.jsonl`.

## Out of scope

- **KHÔNG vá ca «step chạy lại bị giết oan».** Người ký chọn thu phạm vi sau khi
  hai khuôn bị runtime bác. Lý do và bằng chứng ở mục Mốc ghim; ca ấy nay là giới
  hạn đã khai, ghim bằng AC-13.
- **Không đổi câu ném.**
- **Không thu bán kính `commandType` lại** — chốt vẫn chạy trên mọi lượt
  `purpose=builder`. Bán kính rộng là lời hứa `tran-mot-lan-uy-thac` đã ký.
- **Không đếm ở `action.result`.** Hướng đó có thể tách được ca R khỏi ca P nhưng
  biến trần thành hậu kiểm; chưa kiểm trên mã, và là một vòng riêng.
- **Không dựng eval eve `mockModel`.**
- **Không gỡ hai câu dặn `not_authorized` trong `task.ts`.**
- **Không sửa bốn Known limits còn lại** của `tran-mot-lan-uy-thac`.

## Known limits

- **Bộ đo chạy in-process.** Nó chứng minh hook gọi hàm và ghi bền, nhưng **không**
  chứng minh eve THẬT truyền đúng `event.data` xuống hook, cũng không chạy một lượt
  eve thật. Cái giá của việc không dựng app eve thứ hai chỉ để đo.
- **Một step chạy lại trong cùng lượt vẫn giết lượt** — giới hạn chính của vòng,
  ghim bằng AC-13, lý do ở Mốc ghim.
- **`mock.module` đăng ký toàn cục lúc import.** `bun test` nạp mọi spec trong cùng
  một process, nên spec nào nạp sau mà chạm `builder-delegation-state` sẽ nhận
  handle giả. Hôm nay chưa spec nào chạm, nhưng đây là bẫy đặt sẵn và phép đo lẻ
  (`bun test -t <nhãn>`) sẽ không bao giờ thấy triệu chứng — chỉ `bun run test`
  toàn suite mới thấy.
- **Tiêu chí thứ năm đo một đường eve hiện không phát cho subagent-call.** Khai rõ ở chính tiêu chí ấy.

## Known limits — người ký chấp nhận 2026-09-12

Bốn mục dưới đây là lỗi thật của **bộ đo**, người ký đọc và chọn ship bản này.
Hai mục đầu là mục ngoài hợp đồng của vòng chấm; hai mục sau nằm **trong** hợp
đồng (AC-9) và người ký chọn ký lên chúng sau khi máy đã nêu rõ.

- **Răng đột biến tính một lỗi bất kỳ thành «đã bắt được».** `chayBoDo` xếp mọi
  đầu ra có `N fail` vào ngăn bị-bắt, nên một `TypeError` hay `ReferenceError`
  không liên quan cũng được tính là đột biến bị bắt. Đã chạy thử: một `TypeError`
  trong bài đo in `1 fail` và không khớp mẫu mã 2. Trái sàn khuôn (d) của chính
  E9. Hôm nay ba hình dạng đều đỏ đúng ở `toEqual`, nên kết quả là thật — nhưng
  răng không tự chứng minh được điều đó.
- **Chốt chống-lạc-hậu chỉ so cả chuỗi, không kiểm từng phép cắt.**
  `banDotBien === nguon` im khi một phép cắt ăn và một phép trượt, nên một hình
  dạng đột biến có thể không được sinh ra mà răng vẫn báo đã đo.
- **Hình dạng «bỏ cả `record` lẫn `update`» thực tế chỉ bỏ `record`.** Regex bỏ
  `update` còn bám vào handler `step.started` đã gỡ lúc thu phạm vi, nên nó không
  khớp gì. Đã chạy đúng hai phép cắt trên bản hook ở HEAD: phép hai trả về không
  khớp, bản đột biến còn nguyên `update`. AC-9 khai đo ba hình dạng; thực tế đo
  hai hình dạng và một biến thể khác.
- **Bản trùng của mục trên**, hai người soi độc lập cùng bắt.

Cái giá, nói thẳng: dòng «cả ba hình dạng đều bị bắt» của E9 đang báo cáo một
hình dạng mà răng không sinh ra. Lần sau ai đó sửa mã hook, cũng chốt ấy sẽ tiếp
tục giấu một phép cắt trượt. Vá là đổi ba chỗ trong một hàm của
`rang/hook-chet.mjs` — máy đã nêu đường vá ở Cổng Bằng chứng, người ký chọn ship
trước và để lại đây.

## Notes

Ràng buộc kế thừa: hook của eve **chỉ quan sát** (`guides/hooks.md`: *Handlers are
observe-only*). Cần lực chặn thì chỉ có một cần gạt — ném.

Bài học đắt nhất của vòng, ghi ra để vòng sau khỏi trả lại: **tài liệu của eve
không thay được việc đọc mã của bản đang cài.** Hợp đồng bản đầu tin
`guides/hooks.md`; vòng chấm 1 bác nó; bản sửa tin `prepareStep` mà không đọc
`tool-loop.js`; vòng chấm 2 bác tiếp. Cả hai lần, thứ bác là mã trong
`node_modules`, và cả hai lần nó nằm trong tầm tay ngay từ đầu.
