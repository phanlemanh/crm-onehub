# Ô soạn không giả chữ, thẻ lỗi nói mã lỗi — thiết kế

Ngày 2026-09-22. Hồ sơ `_acceptance/o-soan-va-ly-do-loi/`. Hạng T2.

## Vì sao

Rà mục Hội thoại trên onehub.center ngày 22/09 thấy hai thứ, cả hai là lỗi,
không phải tính năng mới:

1. Bấm vào ô soạn trống, chữ gợi ý xám vẫn đó và con trỏ nhấp nháy ở **cuối**
   chữ gợi ý. Người dùng tưởng đó là chữ đã nhập, tìm cách xoá.
2. Một câu hỏi thường («hôm nay có bao nhiêu contact được tạo mới?») hỏng, thẻ
   lỗi chỉ nói «Bộ dựng không làm xong yêu cầu này. Thử lại.» Không ai — người
   dùng lẫn người vận hành — biết vì sao, vì lý do thật bị bỏ ở mọi tầng.

Vòng này không tìm gốc lỗi 2. Nó làm cho lần hỏng kế tiếp **tự nói ra** mã lỗi
trên màn hình và lý do đầy đủ trong log, để gốc lỗi tìm được mà không phải lục
DB production.

Đọc trước khi viết: `AGENTS.md`, `docs/chat-ui.md`, `docs/design.md`,
`docs/agent.md` (phần builder), `eve/docs/concepts/sessions-runs-and-streaming.md`,
skill `web-design-guidelines` (chuẩn giao diện của kho): «mã, định danh bọc
`translate="no"`», «câu lỗi kèm bước kế».

## 1. Ô soạn

**Hiện trạng.** Ô soạn là `TokenField` (`packages/ui/src/components/token-field.tsx`),
một khung `contentEditable` để chèn được thẻ bản ghi. Chữ gợi ý vẽ bằng `::before`
của khung ngoài qua `content-[attr(data-placeholder)]`, **nằm trong dòng chữ**.
Phần gõ được là một `span` đứng sau nó, chứa ký tự rỗng bề ngang 0
(`agent-composer.tsx` `EDITOR_SENTINEL`). Con trỏ vào `span` đó, tức là đứng
ngay sau chữ xám. `onFocus` và `onPointerDown` còn ép con trỏ về đúng đó.

**Sửa.** Đưa chữ gợi ý ra khỏi dòng chữ bằng cách xếp chồng: khi ô trống
(`data-empty=true`) khung ngoài thành lưới một ô, `::before` và `span` gõ được
cùng nằm ở ô lưới đó; `::before` không bắt chuột. `span` gõ được khi đó bắt đầu ở
mép trái vùng chữ, nên con trỏ đứng ở đầu ô, chồng lên đầu chữ gợi ý — đúng như ô
nhập thường. Ô lưới cao theo cái cao hơn trong hai, nên chữ gợi ý xuống hai dòng
ở khổ hẹp vẫn nằm trọn trong ô.

Không dùng `position: absolute` cho `::before`: nó bỏ chữ gợi ý khỏi phép tính
chiều cao, và ở khổ 375 chữ gợi ý màn đầu xuống hai dòng sẽ tràn khỏi ô, đè lên
thanh nút (phản biện 22/09, F3). Khi ô có chữ, khung ngoài trở lại cách xếp cũ.

Chỉ sửa trong `packages/ui` — một chỗ, đúng luật `docs/design.md` («biến thể
mới làm ở `packages/ui`, không ghi đè tại chỗ gọi»). `TokenField` chỉ có một chỗ
dùng làm ô nhập (`agent-composer.tsx`); `chat-chips.tsx` chỉ dùng `TokenFieldItem`,
`TokenFieldAction`, không đổi.

Không đổi `agent-composer.tsx`: luật `data-empty` giữ nguyên (chữ gợi ý hiện khi
nháp rỗng và không có thẻ nào).

## 2. Thẻ lỗi có mã lỗi

**Hiện trạng.** `latestTurnFailure` (`apps/app/lib/agent-transcript.ts`) đọc sự
kiện `turn.failed` / `session.failed`, giữ `code` (mặc định `AGENT_FAILED`) và
một nhóm thô `kind`. `BuilderFailureCard` (trong `agent-builder-chat.tsx`) chỉ
vẽ câu theo `kind`, không vẽ `code`.

**Sửa.** Tách `BuilderFailureCard` ra tệp riêng
`apps/app/components/agent-builder/builder-failure-card.tsx` (tệp chat đã quá
1500 dòng; tách cũng là thứ cho phép kiểm riêng thẻ) và thêm một dòng nhỏ dưới
câu lỗi:

> Mã lỗi: `TOOL_EXECUTION_FAILED`

- Hiện với **mọi** `kind`, kể cả ba loại đã có câu riêng — mã là thứ người dùng
  chép gửi cho người vận hành.
- Phần mã bọc `translate="no"` và bôi chọn được; chữ nhãn theo gói thông điệp
  `agent-builder-tro-chuyen.ts` (vi «Mã lỗi», en «Error code»).
- **Không** hiện `message` thô: nó là tiếng Anh kỹ thuật của nhà cung cấp, có
  thể lộ chi tiết nội bộ, và dài. Người vận hành đọc nó ở log (mục 3).

## 3. Log ở agent

**Hiện trạng.** `apps/agent/agent/channels/crm.ts`: nhánh hội thoại BUILDER của
`turn.failed` và `session.failed` chỉ đặt lại `continuationToken`, xoá
`pendingInputRequest`, không ghi gì. `session.failed` còn đọc thẳng `data.code`
thay vì qua `eveTurnFailure`.

**Sửa.** Hai nhánh BUILDER ghi đúng một dòng `console.error`:

```
[agent] builder conversation <conversationId> turn.failed: <code> <message>
```

(`session.failed` cho sự kiện kia). `code`/`message` đọc qua `eveTurnFailure`
— phân tích ở biên, đúng luật `AGENTS.md`; thiếu thì in `AGENT_FAILED` / chuỗi
rỗng. Hành vi cũ (đặt lại token, xoá câu hỏi chờ) giữ nguyên. Nhánh task nghiên
cứu và nhánh lượt chạy tác nhân không đổi.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: màn Hội thoại → bấm vào ô soạn trống → con trỏ ở đầu ô, chữ gợi ý còn → gõ → chữ gợi ý biến mất (điểm ra: gửi tin, sang hội thoại).
- Biên: ô trống nhưng đã gắn thẻ bản ghi → không hiện chữ gợi ý (luật cũ giữ nguyên).
- Lỗi & quay lại: lượt trả lời hỏng → thẻ «Đã dừng câu trả lời» với câu theo loại lỗi và dòng «Mã lỗi: …» → bấm «Thử lại», hoặc chép mã gửi người vận hành.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Ô soạn (màn đầu và trong hội thoại) | nhận câu người gõ | màn Hội thoại / hội thoại vừa gửi |
| Thẻ lỗi trong hội thoại | nói lượt đã hỏng, vì sao, và cho thử lại | hội thoại / lượt mới |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-o-soan-trong | Ô soạn | chữ gợi ý xám, chưa có con trỏ | bấm vào ô |
| ST-o-soan-trong-focus | Ô soạn | chữ gợi ý xám, con trỏ ở mép trái vùng chữ | gõ |
| ST-o-soan-dang-go | Ô soạn | chữ đã gõ, không còn chữ gợi ý | Enter để gửi |
| ST-the-loi-biet-loai | Thẻ lỗi | câu riêng cho hết nhịp / model trả phí / hết tín dụng + «Mã lỗi: …» | chờ rồi thử lại / nạp tín dụng |
| ST-the-loi-khong-ro | Thẻ lỗi | «Bộ dựng không làm xong yêu cầu này. Thử lại.» + «Mã lỗi: …» | thử lại / chép mã gửi người vận hành |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Phần mã lỗi là định danh: `translate="no"`, bôi chọn được.
- Khổ 375: dòng mã lỗi xuống dòng được, không tràn ngang; chữ gợi ý xuống dòng vẫn nằm trọn trong ô, không đè thanh nút.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `TokenField` | mở rộng | sửa cách xếp chữ gợi ý khi ô trống, tại gốc trong `packages/ui` |
| `BuilderFailureCard` | dùng (tách tệp) | chỉ thêm một dòng chữ vào thẻ có sẵn |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: hội-thoại
Căn cứ: luồng hiển nhiên — màn đã là hội thoại, vòng này không đổi cấu trúc màn nào.
<!-- UX-SPEC-TEMPLATE>>> -->

## Cách đo

- Con trỏ và chữ gợi ý: phải đo trong **trình duyệt thật** — jsdom không dàn
  trang, không có toạ độ con trỏ. Đo bằng eval `ui-check`: một răng puppeteer đo
  khoảng cách từ con trỏ tới mép trái vùng chữ và vị trí chữ gợi ý, rồi chụp ảnh.
  Hệ quả nhận trước: tiêu chí con trỏ không có chốt ở làn máy (ghi sổ quyết định).
- Mã lỗi đi từ DB qua API tới màn: một bài kiểm API gọi thật `conversations.events`
  trên sự kiện `turn.failed` đã gieo và so với tệp mẫu; bài kiểm dom của thẻ đọc
  **chính tệp mẫu đó** qua `latestTurnFailure` — round-trip, không tự dựng khuôn.
- Log ở agent: bài kiểm tích hợp gọi thật hai bộ xử lý của kênh `crm` với token
  hội thoại BUILDER, bắt `console.error`. Sự kiện dựng theo **kiểu sự kiện eve
  xuất ra** (`satisfies`), không khuôn tự đặt; cùng bài kiểm chạy hook `audit`
  thật để ghi `AgentEvent`, và khẳng định `data` nó ghi bằng đúng phần `data` của
  tệp mẫu mà API và thẻ đọc — mỏ neo của cả chuỗi là kiểu của eve (phản biện F1).

## Không làm

Gốc lỗi chat production (chờ mã lỗi thật), chữ «Bộ dựng», công cụ đếm contact,
nút gửi khi chỉ có tệp, menu `/` dùng bàn phím, nút «Đang tra cứu», lời kể bước
công cụ tiếng Anh, hội thoại chưa đặt tên — báo cáo 22/09 mục 2.5, 4–9.
