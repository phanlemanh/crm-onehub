---
schema_version: 1
feature: Nền chat AI Elements — dọn 19 component mồ côi, dựng lớp chuyển kiểu eve→AI SDK, chuẩn hoá phần còn lại, đặt răng chống tái phát
slug: nen-chat-ai-elements
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
design_doc: docs/superpowers/specs/2026-09-09-nen-chat-ai-elements-design.md
status: implemented
approved_by: Mạnh
approved_at: 2026-09-09
veto_state: dong
veto_opened_at: 2026-09-09T08:49:27Z
---

# Acceptance Contract: nen-chat-ai-elements

## Context

Phase 0 của việc chuyển chat sang AI Elements. Kho đang chứa 23 component
vendored mà chỉ 4 còn khả đạt từ ứng dụng; 19 file còn lại vô hình với `knip` vì
`knip.json:36` khai mỗi component là một điểm vào. Một trong 21 file là
`open-in-chat`, thứ `docs/chat-ui.md` cấm vì nó gửi truy vấn sang ChatGPT,
Claude và v0.

Vòng này dọn 19 file đó, dựng lớp chuyển kiểu giữa hình dạng lượt của eve và
kiểu của AI SDK, chuẩn hoá phần còn lại về `docs/design.md`, và đặt hai răng
cho hai lớp lỗi hiện không có thước nào: file mồ côi, và chuỗi tiếng Anh nằm
trong component. Không màn nào đổi bố cục.

**Dân số của việc chuẩn hoá, đo sau khi trừ 21 file bị xoá** — cả kho có ~70
chuỗi tiếng Anh qua 12 file và 6 chỗ dùng màu ngoài bảng, nhưng phần lớn nằm
trong file bị xoá. Còn lại trong ba file sống sót:

| | `message` | `reasoning` | `shimmer` | `conversation` | tổng |
| --- | --- | --- | --- | --- | --- |
| chuỗi tiếng Anh cứng | 10 | 4 | 0 | 2 | **16** |
| bán kính ngoài thang | 2 × `rounded-full` | 0 | 0 | 2 × `rounded-full` | **4** |
| màu ngoài bảng | 0 | 0 | 0 | 0 | **0** |

Mười sáu chuỗi rơi vào **bốn lớp**, và bốn lớp đó là lý do phép đo phải đảo
khuôn: chữ giữa thẻ · chuỗi trong thuộc tính (`aria-label`, `alt`) · giá trị mặc
định của tham số (`conversation.tsx:45-46`, lớp kho đã trả giá để học ở
`_acceptance/chan-lai-component-ra-man`) · **biến trung gian**
(`message.tsx:348`, `const attachmentLabel = … "Image" : "Attachment"`).

Một phép đo liệt kê từng hình dạng cú pháp bỏ sót lớp mới ở mỗi lần đọc lại — đã
xảy ra hai lần trong chính vòng này. Nên AC-10 đo bằng **danh sách trắng đóng**:
quét mọi chuỗi có chữ cái rồi trừ đi các nhóm không-thể-tới-mắt-người đã khai,
mỗi nhóm một lý do. Cây hiện tại: 132 chuỗi xét, 132 miễn, 0 còn lại.

Bốn tập tin sống là `message`, `reasoning`, `shimmer` (do `reasoning` nhập) và
`conversation` (giữ cho phép đo AC-3). Con số 0 ở hàng cuối là cố ý và phải đọc
đúng: cả 6 chỗ dùng màu đều ở `tool` và `web-preview`, hai file bị AC-1 xoá. **Vế màu của AC-6 vì vậy là răng chống
tái phát, không phải việc chuẩn hoá** — nó canh bản `conversation` kéo tươi và
mọi component phase sau kéo về, chứ không sửa gì trong cây hôm nay.

Source input: prompt — "Thực hiện audit và thay toàn bộ component của chat
bằng AI SDK", thu về Phase 0 tại Cổng Đáng của vòng này.

## Criteria

**AC-1** — Cho một cây đã dọn, khi liệt kê `packages/ui/src/components/ai-elements/`,
thì chỉ còn đúng bốn tập tin: `message.tsx`, `reasoning.tsx`, `shimmer.tsx`,
`conversation.tsx`. 19 tập tin còn lại — kể cả `open-in-chat.tsx` và
`loader.tsx` — không còn trong cây.

**"Không ai nhập" nghĩa là không KHẢ ĐẠT BẮC CẦU**, không phải "không có chỗ
nhập từ ngoài thư mục". Bắt đầu từ tập được `apps/**` nhập (`message`,
`reasoning`), đi theo mọi đường nhập tương đối rồi lấy bao đóng.
`reasoning.tsx:14` nhập `./shimmer`, nên `shimmer.tsx` sống dù không tập tin
nào ngoài thư mục nhập nó. Một phép đếm chỉ nhìn đường nhập từ ngoài sẽ xoá
`shimmer.tsx` và làm `reasoning.tsx` vỡ ở `bun run build`.

**AC-2** — Cho cây sau khi dọn, khi chạy **bốn** lệnh cổng đo được của kho —
dựng, lint, anti-slop, bộ kiểm — thì cả bốn xanh; và khi liệt kê mọi tập tin đổi so với nhánh nền, thì mỗi đường nằm trong
danh sách này và không đường nào ngoài nó:
`packages/ui/src/components/ai-elements/**` · `packages/ui/src/lib/**` ·
`packages/ui/package.json` · `packages/validation/src/**` ·
`packages/validation/package.json` · `apps/app/lib/agent-transcript.ts` ·
`apps/app/test/agent-transcript.spec.ts` · `apps/app/test/agent-results.spec.ts` ·
`packages/ui/test/**` ·
`packages/validation/test/**` · `_acceptance/**` · `docs/**` ·
`.githooks/gate-shape.json` · `turbo.json` · `knip.json` · `package.json` ·
`bun.lock` · `PRODUCT-MAP.md`.

Hai đường được thêm sau khi răng phạm vi đỏ trên chính vòng này: `bun.lock`
là hệ quả tất yếu của việc `packages/ui` nhận thêm một phụ thuộc trong nội bộ
kho, và `packages/validation/test/**` là chỗ ở của bài kiểm mà AC-4 đòi. Cả hai
thuộc về ý định đã duyệt; danh sách khai thiếu chứ phạm vi không nới.

`apps/app/test/agent-results.spec.ts` được thêm ở lượt vá ca (c) của AC-4, cùng
lý do: `DidItem` nhận thêm trường bắt buộc `failed`, mà tệp này dựng sẵn một
lượt `did` để thử phần kết quả trong bản ghi. Thiếu một trường bắt buộc là dữ
liệu không thể tồn tại, nên nó phải khai trường đó — một dòng, không đổi hành vi
bài kiểm nào. Vẫn là hệ quả của ý định đã duyệt, không phải phạm vi mới.

Sáu tập tin chat 109 KB nằm ngoài danh sách và phải nguyên vẹn.

**Lệnh thứ năm — `check-types` chạy tươi — đã bị gỡ khỏi hợp đồng này, và đó là
một mất mát thật phải nói ra.** Hai lượt kiểm liên tiếp nó đỏ ở hai gói khác
nhau (`@crm/telemetry`, rồi `@crm/auth`), cả hai lần cùng một lỗi `Cannot find
module './generated/prisma/…'`, trong khi vòng này không chạm dòng nào của
`packages/db`, `packages/telemetry` hay `packages/auth`. Nguyên nhân đã truy tới
gốc và tái hiện được: `@crm/db#build` là `prisma generate`, nó xoá rồi sinh lại
`packages/db/src/generated/prisma/`; bộ kiểm chạy nhiều lệnh `turbo --force`
cùng lúc nên lệnh nào đọc đúng lúc thư mục đang bị sinh lại thì đỏ. Chạy rời:
xanh 5 trên 5 lượt.

Cái mất: hồ sơ không còn câu trả lời trực tiếp cho "kiểu có tươi không" — đúng
thứ bắt được một chỗ nhập còn sót vào tệp đã xoá. Bù lại một phần: `next build`
trong lệnh dựng vẫn kiểm kiểu, và `bun run check-types` vẫn là một trong năm
lệnh của `pre-push`, nên nó vẫn chặn trước khi đẩy — chỉ là bộ kiểm nghiệm thu
không đo nó nữa. Sửa gốc là việc của một vòng riêng: cho `prisma generate` sinh
vào thư mục tạm rồi đổi tên, để chạy song song không phá cây.

**AC-3** *(đo bằng tay)* — Cho `conversation` đã kéo lại bằng CLI của AI Elements, khi so
tập tin trong cây với bản CLI vừa ghi, thì hai bản giống nhau ở mọi dòng trừ
những dòng có tên trong sổ lệch chuẩn của AC-8.

**Phép đo này chạy bằng tay, không nằm trong bộ đo máy.** Nó gọi `bunx --bun
ai-elements@latest add`, tức cần mạng và **ghi vào `node_modules`**; chạy song
song với các lệnh khác thì nó làm hỏng cây giữa chừng — hai lượt kiểm liên tiếp
bị chặn vì đúng lý do đó (`EEXIST` ở `js-yaml` và `json5`, và `bun run test`
báo đỏ trong khi chạy rời thì xanh). Thước không đổi, chỉ đổi chỗ chạy. Kết quả
kèm sha cây ghi ở `evidence/so-lech-chuan-do-tay.md`.

**AC-4** — Cho một lượt eve thật thuộc mỗi dạng `said`, `reasoned`, `did`,
khi đưa qua lớp chuyển kiểu, thì kết quả mang đúng `role` và đúng `state` của
AI SDK cho dạng đó; và cho một lượt `did` **hỏng thật**, thì kết quả mang state
báo lỗi chứ không phải state hoàn tất — **kể cả khi không có chuỗi lỗi**; còn
một lượt `did` **chạy xong bình thường** mà công cụ báo nó không ghi được thì
mang state hoàn tất và **giữ nguyên `output`**.

Ba ca phải cùng có mặt, và ca (c) là ca vừa vá:

- **(a)** `state` gốc là `"output-error"` kèm chuỗi lỗi → `output-error` mang
  đúng chuỗi đó.
- **(b)** `state` gốc là `"output-error"` mà `errorText` rỗng hoặc chỉ khoảng
  trắng (nên `errorTextOf()` ở `apps/app/lib/agent-transcript.ts` trả `null`)
  → vẫn `output-error`, chuỗi hiển thị lấy từ bảng chuỗi
  (`packages/ui/src/lib/messages.ts`, khoá `chatTool.failed`, có trong cả `vi`
  lẫn `en`), không viết cứng trong lớp chuyển.
- **(c)** `output` mang `stored === false` hoặc `written === false` mà `state`
  gốc **không** phải `"output-error"` → `output-available`, `output` và `reason`
  còn nguyên trong kết quả.

**Nhánh lỗi khoá vào trạng thái gốc, không vào `tone`.** Hai bản trước đều hỏng
vì khoá vào `tone`, mỗi bản một chiều. Bản đầu khoá vào
`tone === "warning" && errorText !== null`: hai trường đó do hai đường độc lập
sinh ra, nên một lượt hỏng thật có `errorText` rỗng rơi xuống nhánh cuối và vẽ
ra màn như đã chạy xong. Bản vá sau nới xuống `tone === "warning"` một mình, và
hỏng theo chiều ngược: `outcomeTone()` trả `"warning"` cho **hai nguồn độc
lập** — `state === "output-error"` (hỏng thật) và `stored === false ||
written === false` (chạy xong, công cụ từ chối ghi) — nên ca (c) thành đỏ giả
kèm câu lỗi bịa, mất cả `output` lẫn `reason`.

`tone` là một suy diễn để hiển thị, trộn hai nguồn, nên nó không đủ tư cách
quyết định `state` của AI SDK. `DidItem` vì vậy mang thêm trường `failed`, đặt
từ `part.state === "output-error"` ở `toTranscript`, và lớp chuyển đọc đúng
trường đó.

**Không nhánh nào được đánh rơi kết quả lượt gọi thật sự mang.** Trong cây hôm
nay chỉ ca (c) vừa mang kết quả vừa trông như hỏng, và nó đã về nhánh hoàn tất
nên `output` còn nguyên. Nhánh lỗi không chép `output` sang được: cả
`EveDynamicToolPart` của `eve` lẫn `DynamicToolUIPart` của `ai@7.0.85` đều khai
`output?: never` ở biến thể `output-error`, nên một lượt hỏng không có chỗ chứa
kết quả ở cả hai đầu. Đây là ràng buộc của thư viện, không phải lựa chọn của
kho; ghi ra để lần sau không ai đọc AC này rồi đi thêm một ép kiểu.

Dạng thứ tư — `asked` — **cố ý không đi qua lớp chuyển**, và phép đo phải
khẳng định điều đó chứ không bỏ lửng: `docs/chat-ui.md` xếp form hỏi lại vào
nhóm ngoại lệ giữ shadcn, vì `Confirmation` của AI Elements là đồng ý/từ chối
chứ không phải một biểu mẫu. Nó cũng là dạng duy nhất mang kiểu của thư viện
`eve`, mà phân tích kiểu đó ở biên sẽ phải sửa ba tệp AC-2 cấm chạm.

**AC-5** — Cho mỗi component còn lại trong `ai-elements/`, khi quét chuỗi
hiển thị của nó, thì không chuỗi nào là văn bản tiếng Anh viết cứng; mọi chuỗi
hiển thị đọc từ `useMessages()`, và khoá tương ứng có mặt trong cả bảng `vi`
lẫn bảng `en` của `packages/ui/src/lib/messages.ts`.

Dân số vào vòng này là **16 chuỗi**, ghim từng chỗ để phép đo không tự chọn dân
số hẹp:

- `message.tsx` (10) — `aria-label`: "Previous branch", "Next branch", "Remove
  attachment" hai lần; `alt`: "attachment"; chữ giữa thẻ: "of", "Remove" hai
  lần; **biến trung gian** (dòng 348): "Image", "Attachment".
- `reasoning.tsx` (4) — chữ giữa thẻ: "Thinking...", "Thought for a few
  seconds", "Thought for", "seconds".
- `conversation.tsx` (2) — **giá trị mặc định của tham số**, dòng 45 và 46:
  "No messages yet", "Start a conversation to see messages here".

Hai chuỗi cuối là lớp khó nhất: chúng không phải chữ giữa thẻ, cũng không phải
thuộc tính. Bản `conversation.tsx` cũ đọc chúng qua `useMessages()`; bản CLI
tươi trả chúng về chuỗi cứng — đó là cái giá của việc kéo bản thượng nguồn, và
nó phải hiện thành việc chứ không thành hồi quy im lặng.

**AC-6** — Cho mỗi component còn lại trong `ai-elements/`, khi quét lớp CSS
của nó bằng **danh sách trắng đóng** — mọi lớp khớp `text-` · `bg-` · `border-`
· `ring-` · `fill-` · `stroke-` phải là một token **có khai trong
`packages/ui/src/styles/globals.css`**, mọi lớp khớp `rounded-` phải thuộc thang
`rounded-sm | rounded-md | rounded-lg | rounded-none` — thì không lớp nào rơi
ngoài danh sách trắng, và phép đo in ra mọi lớp lạ kèm tên tập tin và số dòng.

Nguồn của hai vế khác nhau, và phải nói đúng nguồn: bảng tên màu là các
`--color-*` khai trong `globals.css` — đó là danh sách token thật của kho;
`docs/design.md` cấp thang bán kính và luật "chỉ hai thứ được tô", nhưng nó
không chứa bảng tên màu nào. Một lớp như `bg-accent` vì vậy **hợp lệ** (kho có
`--color-accent`, và `message.tsx:400` đang dùng `hover:bg-accent`); lớp bị bắt
là lớp mang tên màu thượng nguồn không có trong bảng, ví dụ `text-amber-500`.

Hai vế có dân số khác nhau và phải đọc khác nhau. **Bán kính: 4 chỗ thật phải
sửa** — `message.tsx` hai `rounded-full` (dòng 362, 390), `conversation.tsx`
hai (dòng 88, 156). **Màu: 0 chỗ
trong cây hôm nay** — vế này là răng canh bản `conversation` kéo tươi và mọi
component phase sau kéo về, nên nó phải đỏ trước một lớp màu lạ chưa từng có
trong kho, không chỉ trước danh sách màu đã biết.

**AC-7** *(judgment)* — Cho hội thoại dựng ở 50, 200 và 500 lượt, khi đo cả
`MessageScroller` lẫn `Conversation` trên trình duyệt thật, thì có số đo ghi
lại cho cả sáu ca, không ô nào rỗng.

Và ở ca 500 lượt, thời gian bố cục của `Conversation` **không quá 1,2 lần**
`MessageScroller` cùng ca. Chưa đạt thì vá — thêm lại khả năng bỏ bố cục ngoài
khung nhìn mà `MessageScroller` đang có — rồi đo lại; số sau vá phải đạt cùng
ngưỡng đó. Phép đo in ba số cho ca 500 (trước vá · sau vá · mốc
`MessageScroller`) cùng tỉ số, và tỉ số vượt ngưỡng là đỏ.

Ngưỡng 1,2 là số người chọn tại Cổng 1, không phải số máy suy ra; nó ghi ở đây
để phép đo có quan hệ chứ không chỉ có mặt.

**AC-8** *(đo bằng tay)* — Cho mỗi tập tin trong `ai-elements/` khác bản thượng nguồn, khi mở
sổ lệch chuẩn của vòng này, thì có một mục nêu tên tập tin, đổi gì, và vì sao,
kèm **vân tay của phần lệch** — không phải danh sách số dòng. Số dòng là hồ sơ
giòn: chèn một dòng phía trên làm lệch hết, trong khi thay một dòng bằng một
dòng khác vẫn giữ nguyên số. Vân tay bắt đúng lớp lỗi mà số dòng định bắt;
và sổ đó nêu thành lời việc chạy lại lệnh thêm sẽ ghi đè im lặng, cùng các
bước phải làm sau mỗi lần kéo bản mới.

Cùng lý do như AC-3, phép đo này chạy bằng tay — xem
`evidence/so-lech-chuan-do-tay.md`. Cái mất phải nói rõ: hai thước này không
chạy trong mỗi lượt kiểm nữa, nên một thay đổi sau lượt đo tay sẽ không được
chúng bắt cho tới lần chạy tay kế. Đổi lại chúng thôi làm hỏng mọi phép đo
khác. Sửa gốc — cho răng dùng một bản CLI đã kéo sẵn thay vì kéo mới mỗi lượt —
là việc của một vòng riêng.

**AC-9** *(cross-layer)* — Cho một tập tin đặt vào
`packages/ui/src/components/ai-elements/` mà không chỗ nào ngoài thư mục đó
nhập vào, khi chạy **lệnh cổng của kho** — không phải chạy thẳng script răng —
thì lệnh cổng đỏ và nêu đích danh tên tập tin.

Nghĩa là răng phải được nối vào bộ cổng: là một tác vụ chạy trong `bun run
test` hoặc trong `pre-push`, có khai ở `.githooks/gate-shape.json`, và
`verify-gate-shape.mjs` xanh sau khi khai. Một script nằm trong thư mục hồ sơ
và chỉ chạy khi có người gõ tay thì không chặn được ai.

**AC-10** *(cross-layer)* — Cho một chuỗi tiếng Anh viết cứng đặt vào một
component trong `ai-elements/` **theo bất kỳ lớp nào trong bốn lớp** — chữ giữa
thẻ · thuộc tính hiển thị · giá trị mặc định của tham số · biến trung gian —
khi chạy **lệnh cổng của kho**,
thì lệnh cổng đỏ và nêu đích danh tập tin cùng chuỗi đó. Cùng ràng buộc nối
cổng như AC-9.

## Coverage

Quét theo hai trục, ghi đầy đủ ở mục "Quét không gian tiêu chí" của
`docs/superpowers/specs/2026-09-09-nen-chat-ai-elements-design.md`.

- **Trục A — loại việc**: xoá · kéo lại · chuyển kiểu · chuẩn hoá · đo · ghi
  vết · răng. [thước CE: `docs/plan/chat-ai-elements-rebuild.md`, mục Phase 0
  và bốn mục B1–B4]
- **Trục B — thứ bị đe doạ**: chức năng đang chạy · tiếng Việt trên màn ·
  chuẩn nhìn · khả năng cuộn · dấu vết fork · tái phát mồ côi · dữ liệu rời
  kho. [thước CE: `docs/chat-ui.md` mục "What must not happen", 5 điều, cộng
  bảng đếm thật ở đầu bản thiết kế]

Mười ô Core thành AC-1…AC-10. Ô Later và Never nằm ở mục Out of scope.

Không có dòng `[GIẢ ĐỊNH]` nào cần người gạch: cả hai trục truy được về vật có
thật trong kho.

## Out of scope

- **Thay `MessageScroller` bằng `Conversation` ở màn thật** — Phase 1. Vòng
  này chỉ đo hai bên cạnh nhau.
- **Sáu tập tin chat 109 KB** (`agent-builder-chat.tsx`, `agent-composer.tsx`,
  `chat-chips.tsx`, `agent-panel.tsx`, `agent-clarification-composer.tsx`,
  `agent-builder-route-fallback.tsx`) — không đụng dòng nào.
- **Render nguồn dẫn và trích dẫn** — Phase 5, ship được độc lập.
- **Vá màu, bán kính, chuỗi cho `tool`, `prompt-input`, `chain-of-thought`,
  `context`, `plan`, `inline-citation`, `model-selector`, `code-block`** —
  các file này bị xoá ở AC-1; phase nào cần thì kéo về rồi vá theo nghi thức
  của AC-8.
- **Giữ `open-in-chat`** — `docs/chat-ui.md` cấm, lý do là dữ liệu CRM không
  rời kho.
- **Vá `web-preview`** — register xếp "không áp dụng"; nó xem trước giao diện
  do máy sinh, ở đây không có gì sinh giao diện.

## Notes

- Nhánh nền là `origin/docs/luat-chat-ai-elements`, không phải `onehub`:
  `docs/chat-ui.md` và kế hoạch chuyển chưa merge vào `onehub`, mà vòng này lấy
  luật từ đó. PR của vòng này xếp chồng lên PR luật.
- Kế hoạch nói chuỗi mới vào `apps/app/lib/messages/agent-builder-*.ts`. Sai:
  `packages/ui` không phụ thuộc `apps/app`. Chuỗi vào
  `packages/ui/src/lib/messages.ts`, theo đúng lối `conversation.tsx:5` đang đi.
- Phép đo AC-7 phải dựng từ không. jsdom không bố cục nên không đo được
  `content-visibility`; kho không có Playwright hay Lighthouse. Đường khả dĩ là
  `puppeteer-core`, đã có sẵn cho `ui:capture`.
- AC-9 và AC-10 là Phase 8 của kế hoạch, kéo lên vòng này vì vòng này vừa dọn
  19 file và không có răng thì cây đầy lại y như cũ.
- Phản biện context sạch trả về 2 lỗ P0 và 3 lỗ P1 trên bản nháp trước; cả năm
  đã sửa vào chính các tiêu chí trên. Xem `gap-probe.md`.
- Ngưỡng 1,2 lần ở AC-7 và danh sách đường ở AC-2 là hai chỗ người duyệt nên
  soi kỹ nhất — chúng là số và ranh giới do máy đề nghị, không phải do đo.
- Bảng dân số đã sửa ba lần trong lúc làm, cả ba lần trước khi hợp đồng được
  ký: 8 → 14 → 16 chuỗi, và 3 → 4 bán kính, sau khi bản CLI tươi của `conversation`
  về cây và sau khi răng chuỗi được vá để thấy lớp giá trị mặc định. Số hiện tại
  do chính răng đo, không do phép đếm bằng tay.
- Ca vừa thêm vào AC-4 sau lượt kiểm thứ ba: lượt `did` mang `tone = warning`
  mà **không** có chuỗi lỗi. Vật thử là lượt `m3:call-warning-trong`, sinh từ
  chính `toTranscript` như mọi lượt khác trong `packages/ui/test/fixtures/eve-turns.json`;
  bài kiểm ở `packages/ui/test/eve-to-ai-sdk.spec.ts`. Ca này đỏ (mã thoát 1,
  `state` ra `output-available`) trên bản trước khi vá và xanh sau khi vá.
- Ca (c) thêm vào AC-4 sau lượt kiểm thứ tư, khi lượt kiểm đã PASS: bản vá
  `cf9109f` sửa chiều thứ nhất bằng cách nới nhánh lỗi xuống `tone === "warning"`
  một mình, và mở ra chiều thứ hai — một lượt gọi hợp lệ báo `stored: false`
  hiện thành đỏ và mất luôn `reason`. Hợp đồng cũ chỉ khai hai ca warning nên
  chiều đó lọt qua một cách hợp lệ; đó là lỗi của hợp đồng trước khi là lỗi của
  mã. Vật thử là lượt `m3:call-khong-ghi`, sinh từ chính `toTranscript` như mọi
  lượt khác trong `packages/ui/test/fixtures/eve-turns.json`; bài kiểm ở
  `packages/ui/test/eve-to-ai-sdk.spec.ts`. Ca này đỏ (mã thoát 1, `state` ra
  `output-error`, không có trường `output`) trên bản trước khi vá và xanh sau khi
  vá; hai ca (a) và (b) xanh ở cả hai bản.
- Bài kiểm vật thử ở `apps/app/test/agent-transcript.spec.ts` **chỉ đọc**. Cửa
  ghi cũ (`GHI_VAT_THU=1`) đã bỏ hẳn: nó chạy lúc gom bài kiểm chứ không trong
  một `it`, và khi bật thì phép so bên dưới so `toTranscript` với tệp mà chính
  `toTranscript` vừa ghi, nên nó không thể đỏ. Lệch thì bài kiểm in đường trường
  cùng cả hai giá trị để người sửa tay vật thử.
- Răng mồ côi có **miễn trừ có tên** cho `conversation.tsx`, kèm lý do và điều
  kiện hết hạn: Phase 1 nối `Conversation` vào màn thật thì bỏ mục miễn trừ. Một
  miễn trừ hết hạn hiện chỉ được cảnh báo chứ không làm cổng đỏ — chỗ này người
  duyệt nên biết.

## Known limits

Chín phát hiện ngoài phạm vi đã duyệt, trình ở Cổng 2. Chủ kho chọn **sửa bảng
đăng ký trước rồi ký**; tám mục còn lại ship như hiện tại, ghi ở đây.

**Đã sửa trước khi ký**

- Bảng đăng ký `docs/chat-ui.md` nay khớp cây: thêm mục "What is in the tree
  today — 4", nói rõ Adopted là phán quyết về hướng đi chứ không phải lời khai
  tệp có trên đĩa, và nói thành lời rằng `add` một component rồi để nó không
  ai gọi sẽ làm răng mồ côi đỏ — ma sát cố ý, không phải hai luật đánh nhau.

**Đã sửa thêm ở lượt ghim lại (10/09)**

- Nhãn vai trong bản hội thoại tải về (`**User:**` / `**Assistant:**`) nay đọc
  từ bảng chuỗi. Đây là **lớp chuỗi thứ năm** — chuỗi *suy ra* từ dữ liệu, không
  có literal cho răng nhìn thấy. Nó là finding TRONG hợp đồng ở lượt ghim lại,
  nên sửa chứ không đẩy sang đây.
- `docs/plan/chat-ai-elements-rebuild.md` nay mở đầu bằng khối "Phase 0 đã xong"
  đính chính bảy chỗ tài liệu mô tả một cái cây không còn. `AGENTS.md` trỏ tới
  tệp đó, và điều kiện gỡ miễn trừ của răng mồ côi treo vào Phase 1 của nó.

**Ship với giới hạn đã biết**

- *(nặng)* `output-denied` và `approval-responded` rơi vào nhánh "đã xong":
  eve có 7 trạng thái cho một lượt gọi công cụ, `DidItem` chỉ giữ 2 bit. Người
  bán **từ chối** một lượt gọi thì màn vẽ ra như nó chạy xong với kết quả trống.
  Đây là lớp lỗi đã vá hai lần mà mỗi lần chỉ đóng một trạng thái; đóng hết cần
  một quyết định về hình dạng `DidItem` — việc của một vòng riêng.
- `className` đè màu biến thể `Button` ở `conversation.tsx:98` và `:166`
  (`dark:bg-background dark:hover:bg-muted`). Đến từ bản CLI thượng nguồn nên
  không nằm trong sổ lệch; `docs/design.md` cấm đè kiểu tại chỗ gọi.
- Cổng `test` của cả kho nay phụ thuộc thư mục hồ sơ của một vòng: ba răng là
  bất biến của kho nhưng sống ở `_acceptance/nen-chat-ai-elements/rang/`. Đổi
  tên hay lưu trữ thư mục đó là `pre-push` đỏ.
- `nanoid` và `tokenlens` thành mồ côi sau khi xoá `prompt-input` và `context`;
  không lệnh cổng nào bắt vì `lint:dead` không nằm trong bộ năm.
- Lớp chuyển mặc định `locale` là `vi`; nó là hàm thuần nên không đọc được
  locale-provider. Chỗ gọi quên truyền thì một workspace tiếng Anh nhận đúng
  một câu tiếng Việt.
- Bốn chỗ phép đo nói rộng hơn điều nó chứng minh: lệnh của E8 chỉ chạy vế đọc
  (vế round-trip chạy trong `bun run test` của E6); một assert đo tên công cụ
  có mặt thay vì đo quan hệ; `do_o` của răng ngoài cổng chỉ được kiểm là chuỗi
  khác rỗng.

**Thêm ở lượt ghim lại (10/09)**

- *(nặng)* Hình dạng biên nuốt lỗi phân tích: `input`/`output` của lượt `did`
  dùng `.catch(null)` kế thừa từ `eve-tool`, nên một payload không đọc được ra
  `null` mà không ném. `AGENTS.md` nói thẳng lỗi phân tích phải là lỗi thật có
  thông điệp thật. Hệ quả: payload hỏng không phân biệt được với lượt chạy xong
  trả rỗng.
- *(nặng)* `check_types_khong_cache` bị gỡ khỏi `feature_loop.suite_keys` — cấu
  hình **cấp kho**, nên mọi vòng sau cũng mất phép đo kiểu trong bộ nghiệm thu.
  Lý do chỉ ghi ở hồ sơ vòng này; người đọc `config.yaml` sẽ không thấy. Vá
  đúng là trả khoá về và sửa gốc cuộc đua Prisma, hoặc thay bằng một executor
  chạy tuần tự.
- Răng mồ côi chỉ gieo hạt từ `apps/**`, không xét `packages/ui` gọi nội bộ —
  một component chỉ được `packages/ui` khác dùng sẽ bị báo mồ côi oan.
- Miễn trừ hết hạn chỉ được in ra, không làm răng đỏ.

Mỗi mục trên là một ứng viên hợp đồng riêng, không phải nợ vô chủ.
