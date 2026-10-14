# Tác nhân vá — thiết kế (E5)

Hàng E5 của `docs/plan/lo-trinh-okr.json`, Cổng Đáng `build` ký 2026-10-12T23:58:15Z
(`_acceptance/tac-nhan-va/opportunity.md`). Câu giao: «Màn tác nhân đọc được trên điện thoại, trạng thái tiếng
Việt, bộ dựng không treo im lặng». Ghi chú hàng trỏ hồ sơ `bo-dung-khong-ket` — mục Ngoài-n «câu hỏi hết hạn mức
của phiên con mới bị bỏ im lặng» (đề xuất `new-contract`) là một nửa của vế thứ ba.

Khảo sát bằng mã trên onehub `966eeb78e` (14/10). Số đo màn trước–sau do răng của vòng đo ở S3, chiều đỏ chạy trên
cây cũ; S1 không có phép đo màn.

## Ba vế, sáu chỗ hỏng

**Vế 1 — trạng thái tiếng Việt.**

1. Danh sách tác nhân in `agent.status.toLowerCase()` (`team-agents-index.tsx:49`): «live», «paused», «archived».
2. Ngăn lượt chạy: bảng chữ `trangThai` thiếu `PLANNED` của bước hành động, nên `nhanTrangThai` rơi về chữ thô
   «Planned» (`agent-history.tsx:429`); dòng sự kiện không có `summary` in `event.type` thay dấu chấm bằng khoảng
   trắng — «run queued», «step started» (`:461`); ô người mở và ô model in cứng «Eve scheduler», «Gateway default»
   (`:263`, `:267`).
3. Bảng thoả thuận trong kết quả lượt chạy in thẳng `criteria.status` (`deal-list-result.tsx:160`).

**Vế 2 — đọc được trên điện thoại.**

4. Bảng thoả thuận trong kết quả lượt chạy đặt `min-w-[56rem]` (`deal-list-result.tsx:61`) — ở 375 px người đọc
   phải kéo ngang một bảng rộng gấp ba màn để thấy giai đoạn và số tiền.
5. Thẻ năng lực ở màn tác nhân cao cố định `h-13` (`agent-capabilities.tsx:186`) và chip đích đến không cắt chữ
   (`:233`) — tên kênh dài tràn khỏi thẻ.

**Vế 3 — bộ dựng không treo im lặng.**

6. **Câu hỏi của bộ dựng ở lượt sau bị bỏ.** eve đẩy câu hỏi của phiên con lên gốc với toạ độ của chính phiên con
   (`node_modules/eve/dist/src/execution/subagent-hitl-proxy.js`, `emitProxiedInputRequest` chép
   `sequence/stepIndex/turnId` từ `hookPayload.event`), và mỗi lần giao việc cho `agent_builder` là một phiên con
   mới (`node_modules/eve/docs/subagents.mdx` dòng 107). `supersedes` (`builder-input.ts:125`) so toạ độ của câu
   hỏi mới với câu hỏi đã ghi gần nhất **của cả hội thoại**, nên câu hỏi của phiên con mới có toạ độ nhỏ hơn hoặc
   bằng bị coi là cũ: `persistBuilderInputRequest` trả `false`, không ghi `pendingInputRequest`, và nơi gọi
   (`channels/crm.ts:141`) bỏ qua kết quả. Gốc vẫn phát `session.waiting`, ô soạn mở lại như thể bộ dựng đã trả lời
   xong, còn phiên con đỗ chờ một câu trả lời không ai được hỏi. Lỗi chạm cả câu hỏi làm rõ thường (`question`),
   không chỉ câu hết hạn mức (`session-limit`).
Một chỗ treo thứ hai được khảo sát rồi để ngoài vòng: hội thoại «đang làm» khi `sessionId` có mà `continuationToken`
rỗng, và token chỉ được trả ở bốn móc của kênh `crm`; móc nào ném lỗi giữa chừng thì hội thoại quay vòng mãi. Chưa có
bằng chứng ca này xảy ra, ngưỡng «lặng bao lâu là chết» là phán xét của người, và khép hội thoại khi lượt eve còn sống
mở ra cuộc đua sự kiện muộn (phản biện context sạch, `gap-probe.md`). Đề xuất hàng riêng — xem «Ngoài vòng này».

## Hướng đã chọn

**(1) Một bảng chữ trạng thái tác nhân, một bảng chữ lượt chạy.** Trạng thái tác nhân (`AgentDefinitionStatus`)
có bảng chữ riêng trong `agent-builder-tac-nhan.ts`, mỗi giá trị khai **nghĩa** theo `toneTheoNghia`
(`packages/ui/src/lib/status-tone.ts`) chứ không khai `tone`:

| Giá trị | Chữ | Nghĩa |
| --- | --- | --- |
| `LIVE` | Đang bật | `xong` |
| `PAUSED` | Tạm dừng | `cho` |
| `ARCHIVED` | Đã lưu trữ | `nhap` |
| `DRAFT` | Nháp | `nhap` |
| `DEPLOYING` | Đang triển khai | `dangChay` |

«Đang bật» chứ không «Đang chạy»: «Đang chạy» đã là chữ của lượt chạy `RUNNING`, và một tác nhân bật có thể không
có lượt nào đang chạy. Danh sách hiện trạng thái bằng `StatusIndicator`. Bảng `trangThai` của lượt chạy thêm
`PLANNED` («Chờ chạy»); sự kiện có bảng chữ đóng cho các loại kho ghi (`run.*`, `step.*`, `session.*`,
`message.*`, `action.*`), loại lạ rơi về một chữ chung «Sự kiện khác» thay vì tên máy. «Eve scheduler» thành «Lịch
tự động», «Gateway default» thành «Mặc định». Trạng thái thoả thuận trong kết quả lượt chạy dùng chữ của màn Thoả
thuận (đang mở, thắng, thua), không thêm bảng thứ hai.

**(2) Điện thoại theo nếp màn của kho, không dựng bố cục mới.** Bảng thoả thuận trong kết quả lượt chạy theo luật
«Danh sách» của `docs/design.md`: từ `md` trở lên giữ bảng, dưới `md` là danh sách `Item variant="outline"` cùng dữ
liệu — tên, giai đoạn, số tiền, trạng thái mỗi mục. Thẻ năng lực bỏ chiều cao cố định, chip đích đến cắt chữ có
`title`. Bốn màn được đo ở 375 px: danh sách tác nhân, màn tác nhân, ngăn lượt chạy có kết quả bảng thoả thuận,
hội thoại dựng.

**(3) Câu hỏi của lượt sau luôn thắng câu hỏi của lượt trước.** `supersedes` chỉ so toạ độ khi hai câu cùng
`turnId`; khác `turnId` thì câu mới thắng — lượt cũ đã khép (`pendingInputRequest` bị xoá ở `session.completed`,
`turn.failed`, `turn.cancelled`), và móc `builder-delegation` giữ một lần giao việc mỗi lượt nên hai phiên con
không chạy song song. Phát lại cùng câu hỏi vẫn bị chặn bằng khoá `builder-input:<hội thoại>:<requestId>` như cũ.
Mọi đường `false` ngoài phát lại ghi một dòng `console.error` có mã hội thoại và lý do, như `logBuilderFailure`.
Toạ độ của hai câu hỏi trong phép đo không viết tay: ứng dụng eve thử (`apps/agent/test/eve-tran`, eve thật với
`mockModel`) giao việc cho bộ dựng hai lần, mỗi lần bộ dựng hỏi một câu, và ghi hai payload `input.requested` gốc nhận
được; bài kiểm tích hợp đọc chính hai payload đó. Ca đo chỉ có nghĩa khi hai `turnId` khác nhau và toạ độ câu sau không
lớn hơn câu trước — bài kiểm khẳng định điều đó trước, để eve đổi cách đánh số thì phép đo đỏ chứ không xanh suông.

**(4) Dòng lỗi dưới bài nộp hỏng nói tiếng Việt.** Chữ chọn theo `errorCode` ở phía khách (`DELIVERY_FAILED`; mã lạ
rơi về câu chung «Tin này gửi không được.»), không in `errorMessage` của máy chủ — trước nay dòng đó in nguyên thông
điệp ngoại lệ tiếng Anh.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: Tác nhân (thanh bên) → danh sách → mở một tác nhân → «Lượt chạy» → mở một lượt → đọc kết quả; trên
  điện thoại không kéo ngang ở bước nào.
- Suôn sẻ (bộ dựng): Hội thoại → gửi tin → bộ dựng hỏi lại → trả lời → lượt sau bộ dựng hỏi tiếp → câu hỏi hiện
  thay ô soạn.
- Lỗi & quay lại: tin gửi không tới bộ dựng → dòng lỗi tiếng Việt dưới tin → gửi lại.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Danh sách tác nhân | Thấy tác nhân của đội và đang bật hay không | thanh bên / màn tác nhân |
| Màn tác nhân | Đọc tác nhân làm gì, được làm gì | danh sách / ngăn lượt chạy |
| Ngăn lượt chạy | Đọc một lượt đã làm gì và ra kết quả gì | màn tác nhân / đóng ngăn |
| Hội thoại dựng | Nặn tác nhân bằng trao đổi với bộ dựng | thanh bên / bản xem lại |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ds-tac-nhan-co | Danh sách tác nhân | mỗi dòng: tên, chấm `StatusIndicator` + «Đang bật» / «Tạm dừng» / «Đã lưu trữ», số lượt | mở tác nhân |
| ST-luot-chay-ket-qua-dt | Ngăn lượt chạy, < 768 px | kết quả bảng thoả thuận thành danh sách mục: tên, giai đoạn, số tiền, trạng thái | đọc, đóng ngăn |
| ST-luot-chay-su-kien | Ngăn lượt chạy | dòng sự kiện bằng chữ tiếng Việt; loại lạ «Sự kiện khác» | đọc |
| ST-hoi-thoai-hoi-lan-hai | Hội thoại dựng | câu hỏi lượt sau thay ô soạn như câu hỏi lượt đầu | trả lời |
| ST-hoi-thoai-gui-hong | Hội thoại dựng | dòng lỗi tiếng Việt theo mã dưới tin hỏng | gửi lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Breakpoint: bảng thoả thuận của kết quả đổi sang danh sách dưới `md` (768 px); không phần tử nào của bốn màn đẩy
  trang rộng hơn khung nhìn ở 375 px.
- Tên kênh, tên thoả thuận, tên tác nhân là dữ liệu người nhập: `translate="no"`, không dịch.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `StatusIndicator` + `toneTheoNghia` | dùng | bậc 1 — luật «Màu trạng thái» của `docs/design.md` |
| `SimpleTable` + `Item variant="outline"` | dùng | bậc 1 — luật «Danh sách» của `docs/design.md`, như Tài liệu |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: giữ khuôn đang chạy của khu tác nhân (danh sách → màn tác nhân → ngăn lượt chạy); vòng này không đổi luồng,
chỉ đổi chữ và cách xếp dưới `md`.
<!-- UX-SPEC-TEMPLATE>>> -->

## Độ phủ (quét hình thái, preset test-matrix)

**Ngữ cảnh.** Sản phẩm: CRM nội bộ OneHub — chân sản phẩm: `CONTEXT.md` (Tác nhân, Lượt chạy, Hội thoại),
`docs/agent.md`, `docs/design.md` [SUY-TỪ-REPO]. Chân ngành, tra web 14/10: `[NGÀNH: Salesforce Agentforce —
tác nhân có trạng thái bật/tắt (activate/deactivate); ô chat của Employee Agent không trả lời thì hiện lỗi chung
kèm lời mời làm mới và thử lại (Trailblazer Community 0D5KX00000mn7Bl0AI); bộ nối MuleSoft Agentforce có ngưỡng
chờ đọc và lỗi RETRY_EXHAUSTED]` — đối chiếu cho chữ trạng thái và vế treo; `[NGÀNH: WCAG 2.2 SC 1.4.10 Reflow — nội
dung đọc được ở 320 CSS px không cần cuộn hai chiều]` cho vế điện thoại.

**Trục.**

- Trục A — màn: danh sách tác nhân | màn tác nhân | ngăn lượt chạy | hội thoại dựng [thước CE: thư mục
  `components/agent-builder`, bốn đường `/agents`, `/agents/[id]`, ngăn `AgentRunsDrawer`, `/chat/[id]`]
- Trục B — khổ: 375 | 768 | 1440 [thước CE: luật web của chủ kho — 320/375/768/1024/1440]
- Trục C — loại chữ máy: trạng thái tác nhân | trạng thái lượt | trạng thái bước | loại sự kiện | ô mặc định | trạng
  thái thoả thuận [thước CE: enum `schema.prisma` dòng 294–344, các chữ cứng tìm bằng mã]
- Trục D — đường câu hỏi bộ dựng: lượt đầu | cùng lượt hỏi lại | lượt sau, toạ độ nhỏ hơn | lượt sau, toạ độ bằng |
  phát lại cùng câu [thước CE: `builder-input.ts`, `subagent-hitl-proxy.js`]

**Core.** A{danh sách}×C{trạng thái tác nhân} · A{ngăn lượt chạy}×C{bước, sự kiện, ô mặc định, thoả thuận} ·
A{ngăn lượt chạy, màn tác nhân, danh sách, hội thoại}×B{375} · D{lượt sau nhỏ hơn, lượt sau bằng} trên payload eve thật + đối chứng
D{cùng lượt hỏi lại, phát lại} · D{lượt sau} qua `builderById` thật tới màn.

**Later.** B{320} — ngưỡng Reflow của WCAG; kho đo 375 làm khổ điện thoại nhỏ nhất. B{768, 1440} chỉ chụp làm đối
chứng, không phải tiêu chí. Hội thoại dựng quay vòng «đang làm» khi không sự kiện kết lượt nào tới — hàng riêng, xem «Ngoài vòng này».

**Never.** Đổi khuôn danh sách tác nhân sang `Item` — màn cũ lệch nếp thì theo dõi ở NM1–NM3, không sửa lẻ
(`docs/design.md` mục «Nếp màn trong app»). Đưa chữ trạng thái về máy chủ — chữ là việc của màn.
`[NGÀNH: MuleSoft Agentforce — ngưỡng chờ đọc do người tích hợp cấu hình]` — vòng này không đặt ngưỡng treo nào.

## Ngoài vòng này

- **Vòng đời tác nhân** (Lưu trữ / Khôi phục, Xoá khi chưa có lịch sử, hai cột `archivedAt` + `deletedAt`, hộp thoại
  xoá tiếng Anh): tác nhân nằm trong nợ nền của luật `vong-doi` (`scripts/luat-kho/cau-hinh.mjs`, khoá `nen`) và
  là việc của đợt 2 vòng đời (`docs/vong-doi.md` mục «Đợt»). Ba câu vòng đời là phán xét của người; vòng này
  không trả lời thay.
- Danh sách tác nhân mặc định lẫn tác nhân đã lưu trữ — cùng gốc với mục trên.
- **Hội thoại dựng treo khi không sự kiện kết lượt nào tới** (đề xuất hàng riêng): lưới dọn trên nhịp điều phối,
  huỷ lượt eve trước khi trả hội thoại, chặn sự kiện muộn của lượt đã khép; ngưỡng treo do người chốt.
- Ngân sách viết 128k của bộ dựng không áp được vì trần 50k của gốc (Ngoài-n khác của `bo-dung-khong-ket`).
