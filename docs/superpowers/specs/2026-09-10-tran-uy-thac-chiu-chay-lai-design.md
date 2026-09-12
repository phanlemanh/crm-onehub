# Trần uỷ thác chịu được chạy lại — thiết kế

## Vấn đề

`recordBuilderDelegation` khoá trần một-lần-uỷ-thác theo `callId` do **mô hình
sinh**. eve nói thẳng khoá như thế là sai cho một chốt một-lần-mỗi-lượt:

> A side effect that must happen once per turn or step … keys well on the
> coordinates in `event.data` (`turnId`, `stepIndex`, `sequence`). A retry
> restores those from the step's input, so the second attempt computes the same
> key and your gate holds. — `guides/hooks.md`

Hệ quả trên cây hiện tại: một step bị ngắt (timeout, redeploy) chạy lại trong
**cùng `turnId`**; mô hình được gọi lại nên sinh `callId` mới; `callIds.size > 0`
→ ném → `turn.failed`. Người dùng chỉ yêu cầu **một** lần.

Nặng hơn: hook ném **trước** `builderDelegationState.update()`, nên trạng thái
gây ném còn nguyên và bền. Mọi lần thử lại sau đó hỏng y hệt — lượt không bao
giờ hồi được.

Bán kính vừa rộng ra: vòng `tran-mot-lan-uy-thac` bỏ vế
`attribute(ctx, "commandType") !== "CREATE_AGENT"`, nên chốt này nay chạy trên
**mọi** lượt `purpose=builder`, kể cả hội thoại thường.

## Toạ độ phân biệt được đúng hai ca

Đây là chân của cả thiết kế, và nó truy được từ hai câu tài liệu **khác nhau**:

- **Chạy lại** khôi phục **cùng** `(turnId, stepIndex, sequence)` —
  `guides/hooks.md`, câu trích ở trên.
- **Lời gọi thứ hai đến rải rác** trong cùng một step mang `sequence`
  **khác** — `protocol/message.d.ts`: *"Calls may arrive incrementally before
  execution, so consumers must correlate action lifecycles by call ID rather
  than assume one event contains every call from an assistant step."*

`callId` không phân biệt được hai ca đó: nó **đổi** ở cả hai. Toạ độ phân biệt
được: **giống** ở ca một, **khác** ở ca hai. Đó là lý do đổi khoá, không phải
"vì tài liệu khuyên".

## Lỗ đo: hình dạng thật khác điều hồ sơ cũ ghi

Known-limit thứ nhất của `tran-mot-lan-uy-thac` ghi "thay thân hook thành một
dòng vô hại thì cả 22 bài vẫn xanh". Đo lại bằng đột biến thật trước khi thiết
kế, kết quả sắc hơn thế:

| Đột biến vào `hooks/builder-delegation.ts` | Bộ đo cũ |
| --- | --- |
| Thân hook rỗng hoàn toàn | **8 đỏ** / 22 |
| Giữ gác + `builderDelegationState.get()`, bỏ `record` và `update` | **22 xanh** |
| Giữ gác + `get` + `record`, **bỏ `update`** | **22 xanh** |

Bộ đo cũ không mù với "hook chết" nói chung — nó mù với **đường cưỡng chế**.
Nó chứng minh được handler *chạm tới một accessor*, và dừng ở đó. Trần biến mất
sạch mà 22 bài vẫn xanh.

Nguyên nhân cấu tạo: `get()`/`update()` của `defineState` ném khi gọi ngoài ngữ
cảnh eve (`guides/state.md`), nên phép đo cũ dùng chính câu ném ấy làm tín hiệu
"gác cho qua". Cả hai accessor ném **cùng một câu**, nên không phép đo nào phân
biệt được "hook đọc rồi ghi" với "hook đọc rồi thôi".

## Đường đo: tách module state, thay bằng handle giả

Tách `builderDelegationState` sang `agent/lib/builder-delegation-state.ts`.
Hai kết quả:

1. `lib/builder-delegation.ts` thành **thuần** — hết import `eve/context`.
2. Chỗ hook phụ thuộc trạng thái bền thành **một seam thay được**:
   `mock.module` của bun thay module state bằng handle giả có slot trong bộ nhớ,
   **giữ hàm thuần thật**, rồi gọi **chính hook thật**.

Phép đo khi đó chạy trọn chuỗi: hook → hàm thuần → ghi bền → trần. Hai đột biến
"22 xanh" ở trên thành đỏ theo cấu tạo, không phải theo may mắn:

- bỏ `record` → sự kiện thứ hai không có tiền sử để so → không ném → đỏ.
- bỏ `update` → toạ độ lần một không bao giờ bền → sự kiện thứ hai thấy slot
  rỗng → không ném → đỏ.

Không chạm `dist/`, không đọc `Symbol.for("eve.context-storage")` — hồ sơ cũ
gọi lối đó là mã 2 và điều đó giữ nguyên hiệu lực. Chỉ dùng `bun:test` và
đường import của kho.

Phương án đã loại: **eval eve + `mockModel`**. Nó chứng minh được thêm một vế
mà `mock.module` không với tới (eve THẬT truyền đúng toạ độ xuống hook), nhưng
giá là dựng một app eve thứ hai trong kho chỉ để đo, cộng thêm một khoá vào
`feature_loop.suite_keys`. Vế đó khai thành giới hạn đã biết.

## Luật mới của trần

Trạng thái đổi từ `{ turnId, callIds }` sang `{ turnId, stepIndex, sequence }` —
**toạ độ của lần uỷ thác đã ghi**, không phải danh sách `callId`.

Mỗi sự kiện `actions.requested` mang `(turnId, stepIndex, sequence, actions)`:

1. `turnId` khác trạng thái → trần mở lại, toạ độ về `null`.
2. Đếm `subagent-call` tới `agent_builder` trong `actions` của **sự kiện này**.
3. Không có lời gọi nào → không ném, toạ độ **không** ghi.
4. Từ hai lời gọi trở lên trong **cùng** sự kiện → ném. Một step phát nhiều lời
   gọi cùng lúc vẫn là hai lần uỷ thác.
5. Đúng một lời gọi:
   - chưa ghi toạ độ nào → ghi toạ độ này, không ném.
   - toạ độ đã ghi **bằng** toạ độ này → **chạy lại**, không ném, trạng thái
     không đổi.
   - toạ độ đã ghi **khác** toạ độ này → uỷ thác lần hai thật → ném.

Câu ném giữ nguyên nguyên văn của vòng trước —
`The agent builder can be delegated only once per turn.` — vì nó đi ra
`turn.failed` và là câu người dùng có thể thấy (`crm.ts` đọc
`eveTurnFailure.parse(data).message`).

### Không thêm hook `turn.started`

eve gợi ý hai lối: khoá theo toạ độ, **hoặc** reset slot từ `turn.started`. Lấy
lối thứ nhất và không lấy thêm lối thứ hai: vế reset đã nằm trong luật 1, và
`turn.started` chỉ là cách viết khác của cùng một vế — thêm nó là hai chỗ cùng
nói một luật, đổi một chỗ mà quên chỗ kia thì lệch.

## Siết kiểu theo eve

Tham số của `recordBuilderDelegation` suy từ `HookEvent<"actions.requested">["data"]`
của `eve/hooks` — type **công khai** — thay vì `BuilderDelegationAction` khai
tay. Đây là Known-limit thứ ba của hồ sơ cũ, gạch trong vòng này vì đang viết
lại đúng khối type đó.

Hệ quả có ích ngoài việc gạch một hạn chế: hàm nhận **cả `event.data`** thay vì
hai trường lẻ, nên "hook truyền thiếu toạ độ" thành lỗi biên dịch chứ không
phải lỗi âm thầm — đúng cái đã xảy ra (sự kiện mang đủ bốn trường, hook chỉ
truyền hai).

## Vật đụng tới

| File | Việc |
| --- | --- |
| `apps/agent/agent/lib/builder-delegation-state.ts` | **mới** — chỉ chứa `defineState` handle |
| `apps/agent/agent/lib/builder-delegation.ts` | hàm thuần: đổi khoá sang toạ độ, siết kiểu theo `HookEvent` |
| `apps/agent/agent/hooks/builder-delegation.ts` | truyền cả `event.data`; import handle từ module mới |
| `apps/agent/test/tran-uy-thac.spec.ts` | bộ đo: thêm trục toạ độ, thêm phép đo chuỗi cưỡng chế |
| `_acceptance/config.yaml` | khoá lệnh cho các eval mới |

## Ngoài phạm vi

- Không nới trần lên quá một lần mỗi lượt.
- Không dựng eval eve `mockModel` (lý do ở trên).
- Không gỡ hai câu dặn `not_authorized` trong `task.ts`.
- Không sửa năm Known limits còn lại của `tran-mot-lan-uy-thac`.
- Không đổi câu ném.
