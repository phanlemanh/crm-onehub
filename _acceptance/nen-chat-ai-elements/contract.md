---
schema_version: 1
feature: Nền chat AI Elements — dọn 21 component mồ côi, dựng lớp chuyển kiểu eve→AI SDK, chuẩn hoá phần còn lại, đặt răng chống tái phát
slug: nen-chat-ai-elements
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
design_doc: docs/superpowers/specs/2026-09-09-nen-chat-ai-elements-design.md
status: approved
approved_by:
approved_at:
veto_state: mo
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
| chuỗi tiếng Anh cứng | 6, trong đó 4 ở `aria-label` | 2 | 0 | 0 | **8** |
| bán kính ngoài thang | 2 × `rounded-full` | 0 | 0 | 1 × `rounded-full` | **3** |
| màu ngoài bảng | 0 | 0 | 0 | 0 | **0** |

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

**AC-2** — Cho cây sau khi dọn, khi chạy năm lệnh cổng của kho, thì cả năm
xanh; và khi liệt kê mọi tập tin đổi so với nhánh nền, thì mỗi đường nằm trong
danh sách này và không đường nào ngoài nó:
`packages/ui/src/components/ai-elements/**` · `packages/ui/src/lib/**` ·
`packages/ui/package.json` · `packages/validation/src/**` ·
`packages/validation/package.json` · `apps/app/lib/agent-transcript.ts` ·
`apps/app/test/agent-transcript.spec.ts` · `packages/ui/test/**` ·
`_acceptance/**` · `docs/**` · `.githooks/gate-shape.json` · `turbo.json` ·
`knip.json` · `package.json`.

Sáu tập tin chat 109 KB nằm ngoài danh sách và phải nguyên vẹn.

**AC-3** — Cho `conversation` đã kéo lại bằng CLI của AI Elements, khi so
tập tin trong cây với bản CLI vừa ghi, thì hai bản giống nhau ở mọi dòng trừ
những dòng có tên trong sổ lệch chuẩn của AC-8.

**AC-4** — Cho một lượt eve thật thuộc mỗi dạng `said`, `reasoned`, `asked`,
`did`, khi đưa qua lớp chuyển kiểu, thì kết quả mang đúng `role` và đúng
`state` của AI SDK cho dạng đó; và cho một lượt `did` mang `Tone = warning`
kèm chuỗi lỗi, thì kết quả mang state báo lỗi chứ không phải state hoàn tất.

**AC-5** — Cho mỗi component còn lại trong `ai-elements/`, khi quét chuỗi
hiển thị của nó, thì không chuỗi nào là văn bản tiếng Anh viết cứng; mọi chuỗi
hiển thị đọc từ `useMessages()`, và khoá tương ứng có mặt trong cả bảng `vi`
lẫn bảng `en` của `packages/ui/src/lib/messages.ts`.

Dân số vào vòng này là 8 chuỗi, ghim từng chỗ để phép đo không tự chọn dân số
hẹp: `reasoning.tsx` — "Thinking...", "Thought for a few seconds";
`message.tsx` — "Previous branch", "Next branch", hai lần "Remove attachment"
(cả bốn là `aria-label`), và hai lần "Remove" (chữ giữa thẻ). **Bốn trong tám
nằm trong thuộc tính, không phải chữ giữa thẻ** — một phép quét chỉ đọc chữ
giữa thẻ sẽ bỏ đúng một nửa và vẫn xanh.

**AC-6** — Cho mỗi component còn lại trong `ai-elements/`, khi quét lớp CSS
của nó bằng **danh sách trắng đóng** — mọi lớp khớp `text-` · `bg-` · `border-`
· `ring-` · `fill-` · `stroke-` phải là một token có tên trong bảng của
`docs/design.md`, mọi lớp khớp `rounded-` phải thuộc thang
`rounded-sm | rounded-md | rounded-lg | rounded-none` — thì không lớp nào rơi
ngoài danh sách trắng, và phép đo in ra mọi lớp lạ kèm tên tập tin và số dòng.

Hai vế có dân số khác nhau và phải đọc khác nhau. **Bán kính: 3 chỗ thật phải
sửa** — `message.tsx` hai `rounded-full`, `conversation.tsx` một. **Màu: 0 chỗ
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

**AC-8** — Cho mỗi tập tin trong `ai-elements/` khác bản thượng nguồn, khi mở
sổ lệch chuẩn của vòng này, thì có một mục nêu tên tập tin, đổi gì, và vì sao;
và sổ đó nêu thành lời việc chạy lại lệnh thêm sẽ ghi đè im lặng, cùng các
bước phải làm sau mỗi lần kéo bản mới.

**AC-9** *(cross-layer)* — Cho một tập tin đặt vào
`packages/ui/src/components/ai-elements/` mà không chỗ nào ngoài thư mục đó
nhập vào, khi chạy **lệnh cổng của kho** — không phải chạy thẳng script răng —
thì lệnh cổng đỏ và nêu đích danh tên tập tin.

Nghĩa là răng phải được nối vào bộ cổng: là một tác vụ chạy trong `bun run
test` hoặc trong `pre-push`, có khai ở `.githooks/gate-shape.json`, và
`verify-gate-shape.mjs` xanh sau khi khai. Một script nằm trong thư mục hồ sơ
và chỉ chạy khi có người gõ tay thì không chặn được ai.

**AC-10** *(cross-layer)* — Cho một chuỗi tiếng Anh viết cứng đặt vào một
component trong `ai-elements/` — kiểm cả chữ giữa thẻ lẫn chuỗi trong
`aria-label`, `placeholder`, `title`, `alt` — khi chạy **lệnh cổng của kho**,
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
