# Trần một-lần-uỷ-thác cho lượt không có quyền

Ngày 2026-09-09 · slug `tran-mot-lan-uy-thac` · T2 · nền `41ba0a7`

## Vì sao

`apps/agent/agent/hooks/builder-delegation.ts` return sớm khi
`attribute(ctx, "commandType") !== "CREATE_AGENT"`. Hệ quả:
`recordBuilderDelegation` — chốt cứng duy nhất chặn gọi lại `agent_builder`
trong cùng một lượt — không chạy trên lượt không có quyền.

Vòng `quyen-luot-mang-theo` vừa biến chính lượt đó thành một đường đi hợp lệ:
cha gọi `agent_builder`, policy từ chối con, con trả `not_authorized`, cha giải
thích cho người. Cái duy nhất ngăn cha gọi lại là một câu trong
`apps/agent/agent/instructions/task.ts`: *"If the specialist returns
not_authorized, do not retry it."* Câu chữ, không phải chốt.

Vòng đó còn nới rộng lỗ. Trước đây `builderCommandType` nâng mọi lượt trả lời
thành `CREATE_AGENT` nên chúng có trần; nay hàm ấy là hàm đồng nhất
(`custom-agent-dispatch.ts`), nên lượt trả lời của luồng không có quyền mang
`CHAT` và không còn trần nào.

`docs/agent.md` chép lại đúng lớp lỗi này ở sự cố prod 2026-09-08: mô hình thử
lại một tool ba lần. Mỗi lần gọi lại dựng một phiên con mới — token và độ trễ.

Đã dựng lại bằng hành vi thật trước khi thiết kế, chạy chính hook trong ngữ
cảnh eve thật:

```
CREATE_AGENT -> chặn: The agent builder can be delegated only once per creation turn.
CHAT         -> KHÔNG chặn (gọi lần 2 lọt)
```

## Ba dữ kiện định hình thiết kế

1. `builderSessionAttributes` đặt `purpose: "builder"` cho **mọi** lượt của
   kênh builder, bất kể `commandType`. Bỏ điều kiện `commandType` là đủ để trần
   phủ cả hai chiều, mà vẫn không đụng phiên `team-agent` / `research`.
2. Hook của eve **chỉ quan sát** (`docs/guides/hooks.md`: *Handlers are
   observe-only*). Cần lực chặn thì chỉ có một cần gạt: ném. "Nuốt lặng lời gọi
   thứ hai" không tồn tại trong hợp đồng của eve.
3. Ném ở hook → `turn.failed` → lượt **settle** kèm thẻ lỗi, ngược hẳn sự cố
   08/09 (treo vĩnh viễn, không thẻ). Nhưng `crm.ts` đọc
   `eveTurnFailure.parse(data).message` nguyên văn, và `latestTurnFailure` ở
   `apps/app` phân loại chính câu đó — nên câu ném là câu người dùng có thể
   thấy.

## Làm gì

**Một điều kiện, một câu, một bộ đo.**

`apps/agent/agent/hooks/builder-delegation.ts` — bỏ vế `commandType`, giữ vế
`purpose`:

```ts
if (purposeOf(ctx) !== "builder") return;
```

`apps/agent/agent/lib/builder-delegation.ts` — câu ném bỏ chữ `creation`, vì
trên lượt không có quyền thì lượt đó không phải creation turn:

```
The agent builder can be delegated only once per turn.
```

Một câu cho cả hai chiều. Không nhân đôi câu, không nhân đôi phép đo. Chốt này
là lưới đỡ cho ca mô hình cãi chỉ dẫn, không phải đường người dùng đi hằng
ngày; nhân đôi để làm đẹp một ca hiếm là trả giá sai chỗ.

`docs/agent.md` — sửa đoạn mô tả trần cho khớp.

## Không làm

- **Không gỡ câu dặn trong `task.ts`.** Prompt vẫn là hàng rào rẻ hơn thẻ đỏ;
  hook là lưới đỡ phía sau, không phải bản thay thế.
- **Không chặn lời gọi thứ nhất** trên lượt không có quyền. Đó là đường ra
  `not_authorized` mà vòng trước vừa dựng; chặn nó là phá đúng thứ vừa xây.
- **Không mở rộng sang `purpose` khác.** `agent_builder` không tồn tại ở đó.
- **Không nới trần lên quá một lần.**

## Đo thế nào

Phép đo phải chạy **chính hook**, không phải hàm thuần bên dưới — vì lỗ nằm ở
điều kiện *trong* hook, và mọi cách chứng minh "hook có gọi hàm kia" mà không
chạy hook đều rơi về quét văn bản mã nguồn: đúng thứ vòng chấm trước đã nhặt
lên ở `quyen-luot.spec.ts`.

`hook.events["actions.requested"]` gọi thẳng được. Nó cần một ngữ cảnh eve
sống, nếu không `builderDelegationState.get()` ném *"No active eve context"*.
Ngữ cảnh đó nằm ở `AsyncLocalStorage` gắn vào `Symbol.for("eve.context-storage")`
— eve cố ý đặt trên global để nhiều bản sao của gói dùng chung một ALS
(`dist/src/context/container.d.ts`).

Thùng bỏ vào ALS là `ContextContainer` **thật của eve**, nạp bằng đường tuyệt
đối suy từ `require.resolve("eve/package.json")`, không viết cứng. Không
resolve được thì bài đo **ném có tên** ("bố cục eve đã đổi"), không `skip`.

Lý do chọn bản thật thay vì tự dựng một thùng tối giản: rủi ro của bản thật là
*ồn* — nó đỏ khi eve đổi; rủi ro của thùng tự chế là *im* — nó xanh khi eve
đổi. Vòng này tồn tại vì một cái chốt im lặng không chạy, nên không mua thêm
một cái im lặng nữa.

Fixture không bịa: bản ghi quyền do `buildPendingInputRequest` (bên ghi thật)
sinh, đọc bằng `commandTypeFromAuthorization`, rồi qua
`builderSessionAttributes` thành bộ attribute của phiên. Mỗi tiêu chí đi một
cặp hai chiều trên cùng bộ dựng đó, khác đúng một trường.

Lane eval của eve (`apps/agent/evals/`) không dùng làm cổng được:
`agent-builder.eval.ts` `t.skip` khi thiếu credential AI Gateway, và lane đó
không nằm trong `feature_loop.suite_keys`.
