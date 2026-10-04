# Sổ lệch chuẩn — `packages/ui/src/components/ai-elements/`

Bảy tệp trong thư mục này là bản vendored của AI Elements. Chúng là một bản rẽ
nằm bên trong `packages/ui`: mỗi tệp đều khác bản thượng nguồn, và cái khác đó
sẽ biến mất không kêu nếu ai đó chạy lại lệnh thêm của CLI.

Sổ này là chỗ ghi cái khác đó. `docs/chat-ui.md`, mục "Local divergence, and
re-applying it", đòi đúng ba việc: ghi từng tệp lệch và lệch cái gì · biết rằng
chạy lại `add` ghi đè im lặng · sửa ở thượng nguồn khi bản sửa mang tính chung.
`AGENTS.md` gọi phí bản rẽ là chi phí dài hạn lớn nhất của kho.

Răng đối chiếu: `_acceptance/nen-chat-ai-elements/rang/so-lech-chuan.mjs`.

## Cách sổ này chịu chiều đỏ

Răng **không** đọc sổ để biết tệp nào lệch. Nó kéo bản CLI tươi của cả bảy tệp
vào một sân tạm rồi so từng dòng với bản trong cây. Tập tệp lệch đo được và tập
mục trong sổ phải trùng nhau — không thiếu, không thừa. Suy "tệp lệch" từ chính
sổ thì hai tập luôn bằng nhau và phép đo xanh vĩnh viễn; đó là lỗi khuôn mà răng
này sinh ra để tránh.

Mỗi mục khai thêm hai con số đo được, và răng đối chiếu cả hai:

- **Số dòng khác** — tổng số dòng chỉ có ở một bên khi so bản tươi với bản trong
  cây.
- **Vân tay lệch** — 16 ký tự đầu của sha256 tính trên đúng những dòng đó. Sửa
  một dòng trong cây, hoặc thượng nguồn phát hành bản mới, thì vân tay đổi và
  răng đỏ đích danh tệp đó. Số dòng một mình không đủ: thay một dòng bằng một
  dòng khác giữ nguyên tổng số.

Vân tay đổi **không** phải lỗi. Nó là chuông báo rằng phải đọc lại diff của tệp
đó, sửa phần "đổi gì" cho đúng, rồi chép con số mới vào. Sửa mỗi con số mà không
đọc diff là làm hồ sơ lệch.

Vế đọc sổ cũng chịu chiều đỏ, và cũng bằng quan hệ chứ không bằng chuỗi có mặt.
Câu cảnh báo ghi đè phải nằm trong **đúng mục** `## Chạy lại lệnh thêm sẽ ghi đè
im lặng`, phải gọi tên đúng lệnh mà răng này chạy và `docs/chat-ui.md` kê ở Rule
2, và phải có một câu vừa nói "ghi đè" vừa nói việc đó xảy ra không hỏi, không
báo — một tiêu đề không phải là lời cảnh báo. Các bước ở mục cuối phải nói đủ
chữ, phải gọi tên vật trong dấu nháy ngược, và giữa chúng phải nêu đủ: lệnh thêm,
đường của chính răng này, thư mục `packages/ui/src/components/ai-elements`, hai
tệp mà lệnh thêm tự sửa, và **mọi lệnh cổng khai ở `.githooks/gate-shape.json`**.
Cổng mọc thêm một lệnh thì sổ đỏ cho tới khi bước 6 nhắc lệnh đó.

## Hai loại lệch, và tại sao phải tách chúng ra

Mỗi mục dưới đây tách hai thứ hoàn toàn khác nhau:

- **Bản vá của kho** — chỗ mình cố ý sửa: chuỗi về `useMessages()`, bán kính về
  thang của `docs/design.md`, khả năng bỏ bố cục ngoài khung nhìn cho AC-7. Đây
  là thứ phải chép lại tay sau mỗi lần kéo.
- **Bản trong cây cũ hơn thượng nguồn** — chỗ khác vì bản vendored được kéo ở
  một phát hành trước và chưa kéo lại. Đây **không** phải bản vá; kéo lại là mất
  không tiếc, nhưng kéo lại cũng đồng nghĩa với việc phải chép lại toàn bộ bản vá
  ở trên.

Gộp hai loại vào một dòng là cách nhanh nhất để lần sau chép nhầm.

## Các tệp

### conversation.tsx

**Tệp:** `packages/ui/src/components/ai-elements/conversation.tsx`

**Số dòng khác:** 93

**Vân tay lệch:** `5313136dacbb05cd`

**Đổi gì:** Đo lại 29/09 bằng bản CLI tươi trong sân tạm: toàn bộ 93 dòng khác
là bản vá của kho, **không có phần cũ hơn thượng nguồn** — thượng nguồn chưa đổi
tệp này kể từ lần kéo 09/09. Bản vá đến theo hai đợt, ghi tách ra vì đợt sau là
lý do sổ này từng đỏ.

Bản vá của kho, đợt 09/09 (vòng này):

- Thêm `import { useMessages } from "@crm/ui/components/locale-provider"`.
- `ConversationEmptyState` bỏ hai giá trị mặc định của tham số —
  `title = "No messages yet"` và
  `description = "Start a conversation to see messages here"` — rồi đọc
  `msg.macDinh.chuaCoTin` và `msg.macDinh.batDauTroChuyen` làm bản dự phòng.
  Thân hàm chuyển từ dạng biểu thức mũi tên sang dạng có `return` vì phải gọi
  được hook; vế `description && …` bỏ đi vì bản dự phòng luôn có.
- `ConversationContent` thêm hai lớp lên con trực tiếp:
  `[&>*]:[content-visibility:auto]` và `[&>*]:[contain-intrinsic-size:auto_10rem]`,
  theo đúng lối `message-scroller.tsx` đang đi. Chuỗi lớp tách thành lời gọi
  `cn(…)` nhiều dòng vì dài quá khổ.
- Hai `rounded-full` — nút cuộn xuống và nút tải hội thoại — đổi sang
  `rounded-md`.

Bản vá của kho, đợt 10/09 (lượt ghim lại, commit `040c52395`, sổ không được
cập nhật lúc đó):

- Thêm `import type { Messages } from "@crm/ui/lib/messages"`.
- `defaultFormatMessage` thượng nguồn viết hoa chữ đầu của `message.role` để ra
  `**User:**` · `**Assistant:**`. Bản trong cây thay bằng hàm `nhanVai(message, msg)`
  đọc `msg.chatMessage.roleUser` · `msg.chatMessage.roleAssistant`, và
  `defaultFormatMessage` thành hàm bậc cao `(msg) => (message) => …` vì nó cần
  bảng chuỗi mà ở tầng module thì không gọi được hook.
- `messagesToMarkdown` **đổi chữ ký**: thêm tham số thứ hai bắt buộc
  `msg: Messages`, còn `formatMessage` lùi xuống thứ ba và thành tuỳ chọn không
  giá trị mặc định (`formatMessage ?? defaultFormatMessage(msg)` trong thân).
  Tham số vòng lặp đổi tên `msg` → `m` để khỏi che bảng chuỗi.
- `ConversationDownload` bỏ `formatMessage = defaultFormatMessage` ở tham số,
  gọi `useMessages()`, truyền `msg` vào `messagesToMarkdown`, và thêm `msg` vào
  mảng phụ thuộc của `useCallback`.

**Vì sao:** Bốn lý do khác nhau, không dồn được làm một. Hai chuỗi của
`ConversationEmptyState` là màn tiếng Việt: `AGENTS.md` và `docs/design.md`
không cho chữ tiếng Anh đứng trên màn, và AC-5 ghim đúng hai chuỗi này làm dân
số. Hai bán kính là thang bán kính đóng của `docs/design.md`, `rounded-full`
không có trong thang. Hai lớp `content-visibility` là bản vá của AC-7:
`Conversation` bản gốc bố cục toàn bộ lượt, nên ở ca 500 lượt nó chậm hơn
`MessageScroller` quá ngưỡng 1,2 lần mà Cổng 1 đã ký. Nhãn vai là **lớp chuỗi
thứ năm** ghi ở `contract.md` mục "Đã sửa thêm ở lượt ghim lại (10/09)": chuỗi
*suy ra* từ `message.role`, không có literal nào cho răng quét chuỗi nhìn thấy,
nên bản hội thoại tải về vẫn ra `**User:**` dù mọi chuỗi khác đã về bảng. Nó là
finding trong hợp đồng nên được sửa ngay ở lượt đó.

Khi chép lại tay sau một lần kéo: đổi chữ ký `messagesToMarkdown` là đổi API
công khai của tệp. Hiện không chỗ nào ngoài chính tệp gọi nó, nhưng ai dùng nó
từ bản thượng nguồn theo chữ ký cũ `(messages, formatMessage)` sẽ truyền hàm vào
chỗ bảng chuỗi — kiểm kiểu bắt được, nên chạy `bun run check-types` ngay sau
bước chép.

### message.tsx

**Tệp:** `packages/ui/src/components/ai-elements/message.tsx`

**Số dòng khác:** 214

**Vân tay lệch:** `c6cc192e6eb2eecc`

**Đổi gì:** Hai loại lệch trộn trong một tệp.

Bản vá của kho:

- Thêm `useMessages`; mười chuỗi tiếng Anh về bảng chuỗi —
  `aria-label` "Previous branch" và "Next branch" → `msg.chatMessage.previousBranch`
  · `.nextBranch`; `{currentBranch + 1} of {totalBranches}` →
  `msg.chatMessage.branchPage(...)`; `alt="attachment"` → `msg.chatMessage.attachment`;
  hai `aria-label="Remove attachment"` → `msg.chatMessage.removeAttachment`; hai
  `<span className="sr-only">Remove</span>` → `msg.chatMessage.remove`; và biến
  trung gian `attachmentLabel` bỏ hai chuỗi dự phòng "Image" · "Attachment" để
  đọc `msg.chatMessage.unnamedImage` · `.unnamedAttachment`.
- Hai `rounded-full` trên nút gỡ tệp đính kèm đổi sang `rounded-sm`.

Bản trong cây cũ hơn thượng nguồn:

- Thượng nguồn nay nhập bộ trình cắm `@streamdown/cjk`, `code`, `math`, `mermaid`
  và truyền vào `Streamdown`; bản trong cây chưa có.
- Thượng nguồn bọc `handleBranchChange`, `goToPrevious`, `goToNext`, `contextValue`,
  `childrenArray` trong `useCallback`/`useMemo`; bản trong cây dựng thẳng mỗi lần
  render.
- Thượng nguồn đã **bỏ `MessageAttachment` và `MessageAttachments` khỏi tệp này**
  (register xếp `attachments` thành một component riêng); bản trong cây vẫn giữ
  hai export đó.
- Thượng nguồn bỏ tham số `from` khỏi `MessageBranchSelectorProps` và đổi kiểu
  sang `ComponentProps<typeof ButtonGroup>`; bản trong cây còn `from` và còn
  chuyển `className` xuống `ButtonGroup`.
- `MessageBranchContextType` thượng nguồn là `interface`, trong cây là `type`.
- `MessageResponse` thượng nguồn so thêm `isAnimating` khi memo hoá.

**Vì sao:** Vế bản vá là AC-5 (mười trong mười sáu chuỗi của dân số nằm ở đây,
năm trong số đó nằm trong thuộc tính chứ không phải chữ giữa thẻ, và hai chuỗi
cuối nằm trong một biến trung gian) và AC-6 (thang bán kính). Vế cũ hơn thượng nguồn thì **cố ý không đụng ở vòng này**: AC-2 khoá phạm
vi, và kéo lại `message.tsx` sẽ xoá sạch tám chuỗi vừa vá cùng hai bán kính, đổi
hình dạng `MessageBranchSelector` mà `apps/app` đang gọi, và bỏ mất hai export
đính kèm. Việc kéo lại thuộc phase sau, và phải đi kèm đúng nghi thức ở cuối sổ
này.

### reasoning.tsx

**Tệp:** `packages/ui/src/components/ai-elements/reasoning.tsx`

**Số dòng khác:** 132

**Vân tay lệch:** `8a50edd800279466`

**Đổi gì:** Hai loại lệch trộn trong một tệp.

Bản vá của kho:

- Thêm `useMessages`; bốn chuỗi về bảng chuỗi — "Thinking..." →
  `msg.reasoning.thinking`, "Thought for a few seconds" → `msg.reasoning.thoughtBrief`,
  "Thought for {duration} seconds" → `msg.reasoning.thoughtFor(String(seconds))`.
- Hàm `defaultGetThinkingMessage` ở tầng module chuyển vào trong thân
  `ReasoningTrigger` thành `thinkingMessage`, vì nó phải gọi được hook mới đọc
  được bảng chuỗi.

Bản trong cây cũ hơn thượng nguồn:

- Thượng nguồn nhập bộ trình cắm `@streamdown/*` và truyền vào `Streamdown`.
- Thượng nguồn đo thời lượng bằng `useRef` (`startTimeRef`, `hasEverStreamedRef`);
  bản trong cây dùng `useState` (`startTime`) và phụ thuộc thêm vào `defaultOpen`
  khi tự đóng.
- Thượng nguồn có `resolvedDefaultOpen = defaultOpen ?? isStreaming` và nhánh
  `isExplicitlyClosed`; bản trong cây đặt `defaultOpen = true`.
- Thượng nguồn bọc `handleOpenChange` và `contextValue` trong `useCallback`/`useMemo`.
- `ReasoningContextValue` thượng nguồn là `interface`, trong cây là `type`.

**Vì sao:** Vế bản vá là AC-5, bốn trong mười sáu chuỗi của dân số. Vế cũ hơn
thượng nguồn cố ý để nguyên, cùng lý do như `message.tsx`: kéo lại là xoá bốn
chuỗi vừa vá, và nó đổi cả cách tự mở tự đóng của khối suy nghĩ — một thay đổi
hành vi mà vòng này đã hứa là không màn nào đổi bố cục.

### shimmer.tsx

**Tệp:** `packages/ui/src/components/ai-elements/shimmer.tsx`

**Số dòng khác:** 35

**Vân tay lệch:** `23762b9328bc901c`

**Đổi gì:** **Không có bản vá nào của kho trong tệp này.** Nó không mang chuỗi
hiển thị, không đặt màu, không đặt bán kính, nên không có gì phải chuẩn hoá. Toàn
bộ 32 dòng khác là bản trong cây cũ hơn thượng nguồn:

- Thượng nguồn thêm `motionComponentCache` ở tầng module và `getMotionComponent`,
  để không dựng component `motion` mới trong lúc render; bản trong cây gọi thẳng
  `motion.create(...)` mỗi lần render.
- Thượng nguồn tách `import type { MotionProps }` và khai `MotionHTMLProps`.
- `TextShimmerProps` thượng nguồn là `interface`, trong cây là `type`.
- Thứ tự khoá trong `transition` khác nhau (`repeat` lên đầu ở bản trong cây).

**Vì sao:** Mục này có mặt vì răng đo được lệch, chứ không phải vì kho cố ý vá.
Ghi ra để lần sau không ai mất mười phút đi tìm bản vá không tồn tại. Đây cũng là
tệp rẻ nhất để kéo lại: không có gì phải chép lại tay, và bản thượng nguồn tốt
hơn thật — nó bỏ được một lần dựng component trong render. Kéo lại nó là việc nên
làm, nhưng nó vẫn phải đi qua đúng nghi thức ở cuối sổ, vì `reasoning.tsx` nhập
`./shimmer` và răng mồ côi đang tính bao đóng qua đúng cạnh đó.

### confirmation.tsx

**Tệp:** `packages/ui/src/components/ai-elements/confirmation.tsx`

**Số dòng khác:** 10

**Vân tay lệch:** `5695b450b02078b9`

**Đổi gì:** Kéo bằng CLI ngày 29/09 ở lượt `the-gop-y-okr`, trong một sân tạm có
`components.json` của kho, rồi chép riêng tệp này vào cây. Chạy thẳng trong
`packages/ui` thì CLI dừng hỏi ghi đè `alert.tsx` và `button.tsx`, và thêm một gói
`cn` không ai dùng vào `package.json`. Toàn bộ 10 dòng khác là bản vá của kho:

- Bỏ bốn dòng chú thích `//` của thượng nguồn.
- `ConfirmationAction` bỏ `className="h-8 px-3 text-sm"`, dùng `size="sm"` của `Button`.

**Vì sao:** `AGENTS.md` cấm chú thích trong mã. `docs/design.md` cấm `className`
đổi cỡ và khoảng cách của một component `@crm/ui` tại chỗ gọi; cỡ nhỏ đã có sẵn
thành biến thể `sm` của `Button`. Tệp không có chữ hiện trên màn: các chuỗi còn
lại là trạng thái `ToolUIPart` của AI SDK, đã khai miễn trong `chu-cung.mjs`.

### suggestion.tsx

**Tệp:** `packages/ui/src/components/ai-elements/suggestion.tsx`

**Số dòng khác:** 30

**Vân tay lệch:** `cc74a7d46eeb4fd4`

**Đổi gì:** Kéo bằng CLI ngày 30/09 ở lượt `soan-okr-cung-tro-ly`, trong một sân
tạm có `components.json` và `tsconfig.json` của kho, rồi chép riêng hai tệp
`suggestion.tsx` và `prompt-input.tsx` vào cây. Lượt `tro-ly-doc-kho` kéo cùng tệp
này ngày 01/10 trên nhánh riêng; khi gộp hai nhánh, tệp giữ bản vá của 30/09 và
thêm biến thể của lượt 4. Toàn bộ dòng khác là bản vá của kho, **không có phần cũ
hơn thượng nguồn**:

- `Suggestion` bỏ `className` khỏi danh sách tham số tách riêng và bỏ chuỗi
  `cn("cursor-pointer rounded-full px-4", className)` ở `Button`; `className`
  của người gọi đi thẳng vào `Button` qua `...props`.
- `Suggestions` thêm biến thể `xuongDong` (round 4 của `tro-ly-doc-kho`, 02/10):
  thay hàng `ScrollArea` cuộn ngang `w-max` bằng một hàng `flex-wrap` rộng đúng
  khung, và cho mỗi nút con cao theo chữ (`h-auto`, `whitespace-normal`,
  `max-w-full`). Mặc định vẫn là hàng cuộn ngang của thượng nguồn.

**Vì sao:** `rounded-full` không có trong thang bán kính của `docs/design.md`
(AC-6, `mau-ban-kinh.mjs` đỏ đích danh dòng này). `px-4` là khoảng cách tự đặt
đè lên cỡ `sm` của `Button`, và `cursor-pointer` đã nằm sẵn trong `buttonVariants`
của kho. Nút gợi ý là chip viền cỡ `sm` của `Button` — hình dạng của một gợi ý
do biến thể quyết, không do chỗ gọi. Ở khổ 390, hàng cuộn ngang giấu chip thứ hai
và thứ ba sau mép phải mà trang không cuộn ngang, nên người dùng điện thoại của tab
«Hỏi» không biết còn gợi ý; biến thể mới được dựng ở `packages/ui` thay vì đè lớp ở
chỗ gọi.

### prompt-input.tsx

**Tệp:** `packages/ui/src/components/ai-elements/prompt-input.tsx`

**Số dòng khác:** 115

**Vân tay lệch:** `f68462a33fa0b590`

**Đổi gì:** Kéo cùng đợt với `suggestion.tsx`. Toàn bộ dòng khác là bản vá của
kho, **không có phần cũ hơn thượng nguồn**:

- Bỏ mọi chú thích: các dòng `//` (kể cả khung `// =====` chia mục và các dòng
  `// oxlint-disable-next-line …`) và hai khối `/** … */`. `AGENTS.md` cấm chú
  thích trong mã. Bỏ các dòng `oxlint-disable` là có chủ ý: `bun run lint:slop`
  chạy sau đó vẫn xanh.
- Thêm `import { useMessages } from "@crm/ui/components/locale-provider"`.
- Chín chuỗi tiếng Anh về `msg.promptInput.*`: hai giá trị mặc định của
  tham số `label` — "Add photos or files" và "Take screenshot" — bỏ khỏi tham số
  rồi đọc `label ?? msg.promptInput.addAttachments` · `.takeScreenshot` trong
  thân; ba thông điệp `onError` — "No files match the accepted types.",
  "All files exceed the maximum size.", "Too many files. Some were not added." —
  mỗi câu xuất hiện **hai lần** vì tệp thượng nguồn có hai đường thêm tệp
  (`addLocal` và `addWithProviderValidation`), nên hai mảng phụ thuộc của
  `useCallback` thêm `msg`; `aria-label` và `title` "Upload files" của ô chọn tệp
  ẩn; giá trị mặc định `placeholder = "What would you like to know?"` của
  `PromptInputTextarea` bỏ khỏi tham số rồi đọc `placeholder ?? msg.promptInput.placeholder`;
  và `aria-label` "Stop" · "Submit" của `PromptInputSubmit`.
- `PromptInput`, `PromptInputTextarea`, `PromptInputSubmit`, hai mục menu tệp:
  thêm dòng `const msg = useMessages();` đầu thân hàm.

Không có bán kính nào phải đổi: bản thượng nguồn không có `rounded-full` hay
`rounded-xl` ở tệp này.

**Vì sao:** Chuỗi hiển thị phải đi qua `useMessages()` (AC-5, `chu-cung.mjs`).
Các giá trị mặc định của tham số là lớp lệch khó thấy nhất — xem mục «Ca đã trả
giá» bên dưới — nên chúng bị bỏ khỏi chữ ký chứ không đổi thành chuỗi tiếng Việt
cứng. Người gọi vẫn truyền `label`, `placeholder`, `aria-label` của riêng mình
được, và khi không truyền thì bảng chuỗi quyết theo ngôn ngữ đang chọn.
Các chuỗi kỹ thuật còn lại trong tệp (`"dragover"`, `"Enter"`, `"max_files"`,
`"image/png"` …) không tới mắt người dùng; chúng nằm trong danh sách trắng theo
giá trị của `chu-cung.mjs`, mỗi mục kèm lý do, chứ không bị sửa trong tệp.

Về phụ thuộc: CLI ghi `nanoid` và gói `cn` của người khác vào `package.json` của
sân tạm. Chỉ `nanoid` được giữ — thêm bằng `bun add nanoid` vào
`packages/ui/package.json` và `bun.lock` ở lượt này; `cn` bị bỏ, như mục cảnh báo
vận hành bên dưới đã nói.

### inline-citation.tsx

**Tệp:** `packages/ui/src/components/ai-elements/inline-citation.tsx`

**Số dòng khác:** 297

**Vân tay lệch:** `77b994bdc6112870`

**Đổi gì:** Kéo bằng CLI ngày 01/10 ở lượt `tro-ly-okr-tom-tat` (Task 8), chạy
thẳng trong `packages/ui` với `git status` sạch; bốn câu hỏi ghi đè `badge.tsx`,
`button.tsx`, `hover-card.tsx`, `carousel.tsx` đều trả lời không. CLI thêm gói
`cn` và xếp lại khối `@tiptap/*` trong `packages/ui/package.json`, sửa `bun.lock`;
cả hai đã hoàn nguyên. Toàn bộ 297 dòng khác là bản vá của kho — tệp vừa kéo, không
có phần cũ hơn thượng nguồn:

- `InlineCitationCard` đổi từ `HoverCard` sang `Popover` có trạng thái mở điều
  khiển được (`useControllableState`) và một ngữ cảnh riêng: bấm hay chạm mở và
  ghim thẻ; Esc và bấm ra ngoài đóng. Chuột (`pointerType` là `mouse`) vẫn mở khi
  di vào nút, rời nút và rời thẻ thì đóng sau `DI_CHUOT.dongSauMs`; đang mở bằng
  chuột mà bấm thì ghim chứ không đóng. Mở bằng chuột không kéo tiêu điểm vào thẻ,
  đóng bằng chuột không trả tiêu điểm về nút.
- `InlineCitationCardTrigger` bỏ prop `sources` và nhánh suy tên miền
  `new URL(sources[0]).hostname` · `+N` · `"unknown"`; nhận `nhan: string` và hiện
  đúng chuỗi đó. Nút là `Badge asChild` bọc `<button type="button">`, nên Enter
  và Space mở thẻ bằng kích hoạt gốc của trình duyệt — tệp không tự bắt phím. Bỏ
  `rounded-full` (ngoài thang), không thay bằng bán kính khác; giữ `ml-1`.
- `InlineCitationCardBody` dùng `PopoverContent size="panel"` thay cho
  `HoverCardContent className="relative w-80 p-0"`, và đặt
  `aria-label={msg.inlineCitation.sources}` để hộp thoại có tên truy cập.
- `InlineCitationCarouselPrev` · `Next` đổi từ `<button>` trần với icon Lucide sang
  `Button variant="ghost" size="icon-sm"` với `ArrowLeft` · `ArrowRight` của
  Carbon qua `Icon`; hai `aria-label` "Previous" · "Next" về
  `msg.inlineCitation.previousSource` · `.nextSource`. Kiểu props đổi sang
  `ComponentProps<typeof Button>`.
- `InlineCitationSource` đổi `truncate` của tiêu đề nguồn thành `wrap-break-word`
  (đợt sửa cuối lượt `tro-ly-okr-tom-tat`, 01/10): tiêu đề ở đây là tên KR, dài
  tới 200 ký tự, và cắt một dòng ở khung 390 px thì người đọc không biết thẻ
  đang nói KR nào. Tiêu đề xuống dòng, đọc đủ chữ.

**Vì sao:** Thẻ trích dẫn của khối Tóm tắt tuần phải mở được trên điện thoại và
bằng bàn phím; `HoverCard` chỉ mở khi di chuột, nên người chạm màn và người dùng
bàn phím không bao giờ thấy nguồn. Nhãn thay tên miền vì nguồn ở đây là KR và cập
nhật trong kho, không phải URL. Bán kính theo thang, icon Carbon, chuỗi qua bảng
chuỗi là luật của `docs/design.md` và `docs/reui.md`. Bốn chuỗi máy mới
(`secondary`, `panel`, `mouse`, `select`) đã khai miễn trong `chu-cung.mjs`
kèm lý do.

## Ca đã trả giá: `conversation.tsx`, 06/09 và 09/09

Đây không phải cảnh báo trừu tượng. Nó đã xảy ra trong chính kho này, trong hai
vòng liền nhau, và nó là lý do sổ này tồn tại.

Vòng `_acceptance/chan-lai-component-ra-man` (06/09) quét mọi giá trị mặc định
chữ-người-đọc trong `packages/ui` và ghi định đoạt từng dòng vào
`_acceptance/chan-lai-component-ra-man/rang/da-tim-thay.json`. Hai dòng đầu của
tệp đó khai đúng hai tham số của `conversation.tsx`:

| file | tham số | giá trị cũ | định đoạt | khoá |
| --- | --- | --- | --- | --- |
| `packages/ui/src/components/ai-elements/conversation.tsx` | `title` | "No messages yet" | `da va` | `macDinh.chuaCoTin` |
| `packages/ui/src/components/ai-elements/conversation.tsx` | `description` | "Start a conversation to see messages here" | `da va` | `macDinh.batDauTroChuyen` |

Vòng này (09/09) chạy `bunx ai-elements@latest add conversation` để lấy bản tươi
làm mốc cho AC-3 và AC-7. Lệnh đó **xoá sạch bản vá ấy**: hai tham số quay về
chuỗi tiếng Anh cứng, và dòng `import { useMessages }` biến mất. Diff còn nguyên
ở `_acceptance/nen-chat-ai-elements/evidence/conversation-lech.txt`, bản trước
khi kéo còn nguyên ở `evidence/conversation-truoc.tsx`.

Thứ duy nhất kêu lên là `packages/ui/test/lai-ra-man.spec.tsx`, một bài kiểm cũ
của vòng 06/09. Không có cảnh báo nào từ CLI, không có xung đột nào từ git — tệp
chỉ đơn giản bị ghi lại. Nếu bài kiểm đó chưa tồn tại, hai chuỗi tiếng Anh đã lên
màn và không ai biết.

Ba điều rút ra, và cả ba đã thành luật ở đây:

1. Hồ sơ của một vòng trước **không** bảo vệ được cây. Nó chỉ ghi lại. Thứ bảo vệ
   được là một răng chạy trong bộ cổng.
2. Giá trị mặc định của tham số là lớp lệch khó thấy nhất: nó không phải chữ giữa
   thẻ, cũng không phải thuộc tính. Phép quét nào bỏ lớp này thì bỏ đúng hai chuỗi
   cuối của dân số AC-5.
3. Bản vá bị xoá không kêu. Đó là lý do sổ này khai vân tay lệch chứ không chỉ
   khai lời.

## Chạy lại lệnh thêm sẽ ghi đè im lặng

`bunx --bun ai-elements@latest add <tên>` **ghi đè tệp trong cây, không hỏi ai và
không báo gì**. Nó không đọc sổ này, không biết bản vá nào từng có, và không để
lại xung đột nào cho git. Sau lệnh đó, mọi thứ ghi ở trên biến mất khỏi tệp; chỉ
còn ở đây và trong lịch sử git.

CLI có hỏi ghi đè theo từng tệp khi chạy trong một cây đã có tệp cùng tên, nhưng
câu hỏi đó chỉ nói "tệp này đã tồn tại", không nói "tệp này đang mang bản vá của
bạn". Trả lời có là mất, và ở phiên không có TTY thì không có câu hỏi nào cả.

### Cảnh báo vận hành: CLI tự sửa `package.json` và `bun.lock`

Đo được ở vòng này, không phải suy đoán. Chạy lệnh thêm **tự cài phụ thuộc vào
`packages/ui/package.json` và sửa `bun.lock`**. Lần trước nó nhét vào:

`cn` · `@rive-app/react-webgl2` · `@streamdown/cjk` · `@streamdown/code` ·
`@streamdown/math` · `@streamdown/mermaid` · `@xyflow/react` · `ansi-to-react` ·
`media-chrome` · `react-jsx-parser`

Tất cả đã phải hoàn nguyên tay. Hai chỗ đáng để mắt:

- **Gói `cn` trên npm KHÁC hẳn `cn` của kho.** Kho dùng
  `@crm/ui/lib/utils` → `clsx` + `tailwind-merge`. Gói `cn` trên npm là một gói
  của người khác. Cài nó vào là mở một đường nhập thứ hai cho cùng một cái tên.
- `@rive-app/react-webgl2`, `@xyflow/react`, `media-chrome` là phụ thuộc của các
  component mà register ở `docs/chat-ui.md` xếp "không dùng cho sản phẩm này"
  (`persona`, nhóm React Flow, nhóm audio). Chúng vào cây chỉ vì CLI giải phụ
  thuộc theo cả registry, không theo cái mình gọi tên.

Vì vậy **luôn chạy lệnh thêm trong một sân tạm ngoài kho trước**, so tệp, rồi mới
chép phần cần vào cây. Răng `so-lech-chuan.mjs` làm đúng như thế: nó dựng sân
tạm, chạy CLI ở đó, đọc tệp, rồi xoá sân. Nó không bao giờ để CLI viết vào
`packages/ui`.

## Sau mỗi lần kéo bản mới

Bảy bước, theo thứ tự. Bỏ bước nào cũng là để một bản vá rơi mất không kêu.

1. **Chép bản trong cây ra `_acceptance/<vòng>/evidence/<tên>-truoc.tsx` trước
   khi chạy bất cứ lệnh nào.** Không có bản trước thì không có gì để so, và git
   sẽ chỉ cho bạn thấy kết quả chứ không cho biết cái gì đã mất.
2. **Chạy `bunx --bun ai-elements@latest add <tên>` trong sân tạm ngoài kho**,
   không chạy thẳng trong `packages/ui`. Nếu buộc phải chạy trong cây thì
   `git status` phải sạch trước đó, để diff sau đó đọc được.
3. **Hoàn nguyên `packages/ui/package.json` và `bun.lock`** nếu lệnh đã chạm vào
   chúng. Đọc kỹ danh sách phụ thuộc mới ở mục trên trước khi giữ lại bất cứ gói
   nào.
4. **Chép lại tay từng bản vá đã ghi trong mục của tệp đó ở sổ này**, vào đúng
   `packages/ui/src/components/ai-elements` — chuỗi về `useMessages()`, bán kính
   về thang, `content-visibility` và nhãn vai của bản tải về cho `conversation`.
   Đọc mục, không đọc trí nhớ.
5. **Chạy `node _acceptance/nen-chat-ai-elements/rang/so-lech-chuan.mjs`**, đọc
   số dòng khác và vân tay mới, rồi cập nhật mục của tệp đó: phần "đổi gì" trước,
   hai con số sau. Đổi con số mà không đọc diff là làm hồ sơ lệch.
6. **Chạy năm lệnh cổng của kho** — `bun run check-types`, `bun run lint`,
   `bun run lint:slop`, `bun run test`, `bun run build`. Ba răng chặn được của
   vòng này chạy trong `bun run test` qua `@crm/ui#test`, nên chuỗi tiếng Anh và
   bán kính ngoài thang sẽ hiện ở đó.
7. **Hỏi xem bản vá có gửi ngược lên hãng được không.** `CLAUDE.md` nói rõ: sửa
   được ở hãng thì gửi lên hãng, đừng vá riêng. Vế bán kính và vế chuỗi khó gửi
   vì chúng là luật riêng của kho; vế `content-visibility` của `conversation` thì
   gửi được, và gửi được thì mỗi lần kéo sau đó rẻ đi một bước.
