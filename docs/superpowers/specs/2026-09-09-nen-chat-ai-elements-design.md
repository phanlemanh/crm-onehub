# Nền chat AI Elements — Phase 0

Vòng đầu của việc chuyển chat sang AI Elements. Nó không đổi màn nào cho người
bán; nó dọn chỗ, dựng lớp chuyển kiểu, và đặt răng để cái đã dọn không đầy lại.

`docs/chat-ui.md` là luật. `docs/plan/chat-ai-elements-rebuild.md` là kế hoạch
chín phase; đây là Phase 0 của nó, có sửa ở ba chỗ kế hoạch nói sai hoặc thiếu
(mục "Kế hoạch sai ở đâu" bên dưới).

## Vì sao vòng này tồn tại

`packages/ui/src/components/ai-elements/` có 23 file. Đếm thật hôm nay:

| Đo | Số |
| --- | --- |
| File vendored | 23 |
| File có ít nhất một chỗ ngoài thư mục đó nhập vào | **2** (`message` 2 lượt, `reasoning` 1 lượt) |
| File không ai nhập | **21** |
| Chuỗi tiếng Anh cứng | ~70, qua 12 file |
| Chỗ dùng màu ngoài bảng | 6, ở `tool` và `web-preview` |
| File có bán kính ngoài thang | 7 |

21 file nằm đó là hệ quả trực tiếp của `knip.json:36`: `packages/ui` khai entry
là `src/components/**/*.tsx`, nên mỗi component tự là điểm vào và một file mồ
côi không thể bị báo. Cây không có cách nào nói cho ai biết nó đang chứa gì.

Trong 21 file đó có `open-in-chat.tsx`. Nó dựng URL sang `chatgpt.com`,
`claude.ai`, `v0.app`, `scira.ai`, `t3.chat`, `cursor.com`. `docs/chat-ui.md`
xếp nó vào nhóm "Never" với lý do viết thẳng: dữ liệu CRM nội bộ không rời kho.
Chưa ai nhập nó — nhưng khoảng cách giữa "không ai nhập" và "có người nhập" là
một dòng, và không có răng nào canh dòng đó.

## Việc của vòng này

1. **Dọn** — xoá 21 file không ai nhập. Giữ `message.tsx`, `reasoning.tsx`.
2. **Kéo lại `conversation`** bằng CLI (`bunx --bun ai-elements@latest add
   conversation`), vì phép đo cuộn cần nó, và bản tươi cho một mốc so sạch.
3. **Lớp chuyển kiểu** — eve → kiểu của AI SDK, đặt ở `packages/ui`.
4. **Chuẩn hoá** phần còn lại: màu, bán kính, tiếng Việt.
5. **Đo cuộn** — 50 / 200 / 500 lượt, `Conversation` so `MessageScroller`; hồi
   quy thì vá và ghi lại.
6. **Ghi vết** — sổ lệch chuẩn và nghi thức tái-vá.
7. **Răng** — hai lớp lỗi vòng này vừa chứng minh là không có thước.

Xoá trước rồi vá phần còn lại là lựa chọn của chủ kho tại Cổng Đáng của vòng
này, thay cho lối "vá hết 12 file" mà kế hoạch mặc định. Cái giá đã nhận: mọi
bản vá cục bộ trong 21 file biến mất, và phase nào cần component nào thì kéo về
rồi vá lại lúc đó. Cái được: không vá thứ sắp xoá, và mọi lệch chuẩn từ đây là
lệch có sổ.

## Kế hoạch sai ở đâu

Ba chỗ, phát hiện khi đọc cây thật. Chúng đổi việc, không chỉ đổi chữ.

**Một — chuỗi của `packages/ui` không thể sống ở `apps/app`.** Kế hoạch viết
"New keys go in `apps/app/lib/messages/agent-builder-*.ts`". Nhưng
`packages/ui` không phụ thuộc `apps/app` và không được phép: `packages/ui` là
thư viện, `apps/app` là ứng dụng dùng nó. Đường đúng đã có sẵn trong cây —
`conversation.tsx:5` nhập `useMessages` từ `@crm/ui/components/locale-provider`
và đọc `msg.macDinh.*`, với kho ở `packages/ui/src/lib/messages.ts`. Chuỗi của
component `packages/ui` vào kho đó.

**Hai — không có răng nào canh chuỗi trong component.** Hai bài kiểm tên
`messages-guard` quét **kho chuỗi**, không quét chỗ dùng:
`apps/app/test/messages-guard.spec.ts` quét `apps/app/lib/messages`;
`packages/ui/test/messages-guard.spec.ts` quét `packages/ui/src/lib/messages`.
`packages/ui/src/components/ai-elements/**` không nằm trong vùng nào. Đó là vì
sao ~70 chuỗi tiếng Anh nằm được trong cây mà mọi cổng vẫn xanh.

**Ba — phép đo cuộn không có hạ tầng.** `MessageScroller` chạy nhanh nhờ
`content-visibility: auto` và `contain-intrinsic-size: auto 10rem` đặt trên
`MessageScrollerItem` (`packages/ui/src/components/message-scroller.tsx:77`).
Cả hai là tính năng bố cục của trình duyệt thật. Bài kiểm của `packages/ui`
chạy trên jsdom, mà jsdom không bố cục — nên không đo được ở đó. Kho không có
Playwright, không Lighthouse, không `performance.now` nào. Thứ gần nhất là
`puppeteer-core`, đã có sẵn cho `ui:capture`. Phép đo B1 vì vậy là **việc phải
dựng**, không phải việc "chạy profiler có sẵn" như kế hoạch ngụ ý.

## Lớp chuyển kiểu

`apps/app/lib/agent-transcript.ts:23` khai `TranscriptItem` bốn dạng —
`said` · `reasoned` · `asked` · `did` — cùng `Tone = neutral | success |
warning` và `Source`. AI Elements đọc `UIMessage["role"]`, `ToolUIPart["state"]`
và `FileUIPart` của gói `ai` (`^7.0.85`).

Lớp chuyển sống ở `packages/ui`, vì đó là gói duy nhất khai `ai`. Đặt nó ở
`packages/validation` như kế hoạch đề nghị sẽ kéo `ai` vào một gói mà
`apps/api` và `apps/agent` cùng dùng, cho một việc thuần giao diện.

Nhưng `packages/ui` không được nhập từ `apps/app`, mà `TranscriptItem` đang ở
đó. Nên hình dạng đi trước, lớp chuyển đi sau:

- `TranscriptItem` và `Tone`, `Source` chuyển xuống
  `packages/validation/src/agent-transcript.ts` — đây đúng là hình dạng cắt
  biên gói mà `AGENTS.md` bảo phải sống ở đấy, và nó chỉ cần `zod`, không cần
  `ai`.
- Lớp chuyển ở `packages/ui`, nhập hình dạng từ subpath
  `@crm/validation/agent-transcript`, xuất ra kiểu của `ai`.

Mỗi gói gánh đúng phần nó gánh được, và không gói nào nhận thêm phụ thuộc mới.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: người bán mở trình dựng agent hoặc tab eve của phiếu hồ sơ → đọc
  hội thoại → mọi chữ của khung hội thoại là tiếng Việt (điểm ra: không đổi)
- Biên: hội thoại rỗng → dòng trống nói tiếng Việt; hội thoại rất dài (500
  lượt) → cuộn không giật
- Lỗi & quay lại: không có đường lỗi mới; vòng này không thêm thao tác nào

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Trình dựng agent | Đọc và tiếp hội thoại với eve | từ trang agent / ở lại |
| Tab eve của phiếu hồ sơ | Đọc hội thoại về đúng bản ghi đang mở | từ phiếu hồ sơ / ở lại |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-hoithoai-rong | cả hai | dòng trống tiếng Việt | gõ câu đầu |
| ST-hoithoai-dangnghi | cả hai | chỉ báo đang nghĩ, tiếng Việt | chờ |
| ST-hoithoai-dai | trình dựng | 500 lượt, cuộn mượt | cuộn |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Không thêm thao tác, không đổi bố cục, không đổi phím tắt.
- Chữ đổi từ tiếng Anh sang tiếng Việt ở khung hội thoại; dữ liệu người nhập
  không dịch.

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
|---|---|---|
| `ai-elements/message` | dùng | đang chạy, giữ nguyên vai |
| `ai-elements/reasoning` | dùng | đang chạy, giữ nguyên vai |
| `ai-elements/conversation` | dùng | kéo tươi bằng CLI cho phép đo |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: hội-thoại
Căn cứ: khuôn đã cố định từ trước bởi `docs/chat-ui.md` — AI Elements giữ
hội thoại, shadcn giữ căn phòng quanh nó. Vòng này không đổi khuôn, chỉ dọn
nền, nên không có hai khuôn khả dĩ để phải tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Quét không gian tiêu chí

Chân sản phẩm: OneHub — nền tảng thị trường nhiều bên tài chính và bất động
sản, CRM này là sản phẩm nội bộ cho nhân viên OneHub, mặt web
[SUY-TỪ-REPO: CONTEXT.md]. Tiếng Việt là tiếng mặc định, có bảng `en`
[SUY-TỪ-REPO: packages/ui/src/lib/messages.ts].

Chân ngành: mô hình vendor-in của shadcn/ui — chép vào kho thì kho sở hữu, và
chạy lại lệnh thêm sẽ ghi đè im lặng [NGÀNH: shadcn/ui]; CLI của Vercel AI
Elements là đường cài chính chủ [NGÀNH: Vercel AI Elements]; `knip` là công cụ
báo mã chết mà kho đã dùng [NGÀNH: knip].

**Trục A — loại việc** [thước CE: `docs/plan/chat-ai-elements-rebuild.md`, mục
Phase 0 và bốn mục B1–B4]:
xoá · kéo lại · chuyển kiểu · chuẩn hoá · đo · ghi vết · răng

**Trục B — thứ bị đe doạ** [thước CE: `docs/chat-ui.md` mục "What must not
happen" (5 điều) + audit đếm được ở đầu tài liệu này]:
chức năng đang chạy · tiếng Việt trên màn · chuẩn nhìn · khả năng cuộn · dấu
vết fork · tái phát mồ côi · dữ liệu rời kho

Cross-cutting áp mọi ô Core: hạng bằng chứng (cổng máy sẵn có · bài kiểm mới ·
số đo · mắt người tại cổng).

**Core** — 10 ô, thành AC-1…AC-10 của hợp đồng.

**Later** — vá màu/bán kính/chuỗi cho `tool`, `prompt-input`,
`chain-of-thought`, `context`, `plan`, `inline-citation`, `model-selector`,
`code-block`: phase nào kéo component về thì vá lúc đó, theo nghi thức tái-vá
vòng này dựng. · Phase 1–7 của kế hoạch.

**Never** — giữ `open-in-chat` trong kho: register cấm, và lý do là dữ liệu
CRM không rời kho. · Vá `web-preview`: register xếp "không áp dụng", nó xem
trước giao diện do máy sinh, ở đây không có gì sinh giao diện.

## Cái vòng này không làm

- Không thay `MessageScroller` bằng `Conversation` ở màn nào — đó là Phase 1.
- Không đụng `agent-builder-chat.tsx`, `agent-composer.tsx`,
  `chat-chips.tsx`, `agent-panel.tsx`. 109 KB đó nguyên vẹn.
- Không render `Sources` — đó là Phase 5, và nó ship được độc lập.
- Không cài thêm component AI Elements nào ngoài việc kéo lại `conversation`.

## Cái giá, nói thẳng

- 21 file biến mất; phase sau kéo về từng cái, và vá lại từ đầu mỗi lần.
- Một phép đo hiệu năng phải dựng từ không, trên `puppeteer-core`.
- Hai răng mới, mỗi răng là một tác vụ cổng phải khai ở
  `.githooks/gate-shape.json` nếu nó vào bộ cổng đẩy.
- Lớp chuyển kiểu là vật vĩnh viễn: eve đổi hình dạng lượt thì nó phải đổi theo.
