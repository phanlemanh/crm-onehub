# Khung Kara trong ngăn bản ghi — thiết kế

Hồ sơ: `_acceptance/khung-ban-ghi-kara/` · hàng K4 của `docs/plan/lo-trinh-okr.json` · dãy P2 đợt `sau-14-10`.
Ngày: 2026-10-07. Hạng T2.

## Vì sao

Ở OKR, Kara đã có tên, dấu tia sáng, lời «Kara đang…», lỗi có «Thử lại», đề xuất có biên nhận và Hoàn tác
(`docs/ai-ux.md`). Ở ngăn bản ghi — nơi người dùng làm hầu hết việc CRM — thì chưa có gì trong số đó. Khảo sát
production 04/10 (`.acceptance-runs/dieu-phoi-1410/nguon/lai-thu-prod-0410/khao-sat-dong-nhat.md` mục 3–6) ghi:
tab «Tác nhân» nói tiếng Anh viết cứng, avatar là logo, `Spinner` trần, lỗi in thông điệp thô kèm gợi ý cho
lập trình viên; khung bản ghi tải lỗi không có «Thử lại»; đề xuất thông tin liên hệ có nút «Nhận / Bác» trần,
nhận xong chỉ có toast; nút tra cứu mang `MagicWand`; lỡ đóng ngăn thêm nhanh là mất chữ.

## Ranh giới đã chốt

- Anh chốt 07/10 phương án (a): thêm lệnh hoàn tác **quyết định của người** trên đề xuất thông tin liên hệ.
  Giám sát duyệt chạm `apps/api/src/contacts/{contacts.service,contacts.router,contacts.contracts}.ts`,
  `apps/api/src/generated/server.ts`, `apps/api/test/hoan-tac-thong-tin.spec.ts` (yêu cầu P2-2).
- Không đổi công cụ ghi của Kara (`apps/agent`) — lượt T3 `tac-tu-xin-duyet`.
- Không đổi trang Chat — K5 `chat-deal-mot-khung` (ngoài đợt).
- Không đổi schema.

## Cách làm

### 1. Tab Kara (cá nhân, công ty, thoả thuận — cùng `AgentPanel`)

Giữ nguyên cơ chế hội thoại đã ghi ở `docs/agent-panel.md` (snapshot, `keepMounted`, `MessageScroller` với
`autoScroll`, một `MessageScrollerItem` mỗi lời). Thay lớp trình bày bằng các khối Kara đã có từ `bo-xuong-kara`:

| Phần | Hôm nay | K4 |
|---|---|---|
| Tên tab | «Tác nhân» | «Kara» (`record-sheet.ts` `tabs.agent`) |
| Lời của người / của Kara | `Message` + avatar logo | `KaraTurn from="user" / "kara"` (avatar tia sáng) |
| Câu Kara hỏi lại trong luồng | hộp `border-l-2 bg-muted/40` tự vẽ, chữ «Follow-up» | `KaraTurn from="kara"`; ô trả lời là `AgentClarificationComposer` nói tiếng Việt |
| Bước công cụ | `Marker` + `Spinner` khi đang chạy | `KaraSteps` cho mỗi dải bước liền nhau; nguồn (LinkedIn, GitHub, web) giữ thẻ đính kèm dưới dải |
| Chưa có lời nào | `Empty` với logo, chữ tiếng Anh, nút gợi ý | khoảng rỗng mang dấu Kara + tiêu đề, mô tả theo loại; gợi ý nằm trong `KaraComposer` |
| Đang mở cuộc trò chuyện | `Spinner` giữa khung | `KaraState working` «Kara đang mở cuộc trò chuyện…» (trễ 1 giây) |
| Ô soạn | `Input` + nút gửi | `KaraComposer` (placeholder theo loại); khoá bằng `lockedReason` |
| Kara đang trả lời câu trước (phiên chạy, người vừa mở lại) | dòng tiếng Anh | `lockedReason` «Kara vẫn đang trả lời câu trước. Câu tiếp theo gửi được khi xong.» |
| Cuộc đã kết thúc | dòng tiếng Anh + nút | `lockedReason` «Cuộc trò chuyện này đã kết thúc.» + nút «Bắt đầu cuộc mới» |
| Lỗi khi gửi | chữ đỏ + `error.message` + gợi ý `bun run dev` | `KaraState error what="trả lời"` → «Kara chưa trả lời được» + «Thử lại» gửi lại câu hỏi cuối; mô tả an toàn theo loại lỗi; không in thông điệp thô |
| Kara chưa được cấu hình (thiếu khoá cầu nối) | chữ đỏ + «Set AGENT_BRIDGE_SECRET…» | `KaraState unconfigured` «Quản trị viên cần bật Kara cho hồ sơ.» |
| Danh sách hội thoại | «New conversation», «Untitled», «Nothing yet», toast tiếng Anh | tiếng Việt |

Không với tới tác nhân vẫn là `offline`, đọc lưu trữ `AgentEvent`, ô soạn vẫn dùng được — luật cũ của
`docs/agent-panel.md` giữ nguyên.

Chữ: tệp mới `apps/app/lib/messages/kara-ban-ghi.ts` (vi + en), thay `COPY` tiếng Anh cứng trong
`lib/agent-record.ts` (giữ `header`, `field`; chữ đi qua tệp chữ theo locale). Gợi ý câu hỏi theo loại:
cá nhân «Người này là ai?», «Họ còn làm ở đó không?», «Cần biết gì trước cuộc gọi?»; công ty «Công ty này
làm gì?», «Mình quen ai ở đây?», «Gần đây có gì thay đổi?»; thoả thuận «Thoả thuận đang ở đâu?», «Nên mời
thêm ai?», «Rủi ro ở đâu?».

### 2. Đề xuất thông tin liên hệ (ngăn cá nhân)

- Thân đề xuất: `KaraProposal density="inline" kind="compact"` neo ngay dưới trường nó sửa (đã neo ở chỗ này
  — chỉ đổi độ dày từ `card` sang `inline`).
- Nút gọi đúng hậu quả: trường trống → «Thêm vào hồ sơ»; trường đã có giá trị → «Thay giá trị hiện có»;
  «Bỏ qua» chữ. Lý do một dòng chữ phụ như hôm nay.
- Nhãn nguồn một lần mỗi nhóm: mục «Chi tiết» có ít nhất một đề xuất thì đầu mục mang `KaraLabel`
  «Kara · N đề xuất» với ô «Vì sao?» (đọc lúc nào = `observedAt` mới nhất).
- Nhận hay bỏ qua → đề xuất thu thành dòng biên nhận tại chỗ (`decided` + `onUndo`): «Đã thêm theo Kara ·
  Hoàn tác» / «Đã bỏ qua · Hoàn tác». Biên nhận sống trong trạng thái của ngăn tới khi ngăn đóng. Toast
  thành phụ (bỏ).
- Hoàn tác gọi `contacts.undoFactDecision` (mới). Xong: trường về giá trị trước khi nhận, đề xuất hiện lại ở
  trạng thái chờ, focus về nút chính của đề xuất. Lỗi «đã đổi sau đó»: dòng biên nhận đổi thành chữ lỗi
  «Trường này đã đổi sau khi nhận — không hoàn tác được», bỏ nút Hoàn tác.

**Máy chủ — `contacts.undoFactDecision({ factId, truoc })`** (router mỏng, Prisma ở service, ném lỗi họ
`HttpException`):

- `truoc` là giá trị trường ngay trước lần nhận, màn gửi lên (máy chủ không lưu giá trị cũ của cột).
  Hình dạng theo trường: trường cột → `{ value: string | null }`; trường `name` → `{ firstName, lastName }`.
  Parse bằng zod ở `contacts.contracts.ts`.
- Chỉ người đã quyết mới hoàn tác: `decidedById !== userId` → `ForbiddenException`.
- Fact phải đang `APPLIED` hoặc `DISMISSED`; khác → `ConflictException`.
- `DISMISSED` → về `PROPOSED`, xoá `decidedById`, `decidedAt`. Không chạm cột.
- `APPLIED` → giá trị cột hiện tại phải còn bằng `fact.value` (tên: ghép `firstName lastName`); khác →
  `ConflictException` (ai đó đã sửa sau lần nhận). Trong một giao dịch: cột về `truoc`; fact về `PROPOSED`;
  các fact cùng trường bị `SUPERSEDED` ở đúng lần nhận đó trở lại — fact nào có giá trị bằng `truoc` về
  `APPLIED`, còn lại về `PROPOSED`, `supersededAt` xoá.
- «Đúng lần nhận đó» cần một mốc chung: `decideFact` dùng một `const at = new Date()` cho cả `supersededAt`
  và `decidedAt` (hành vi không đổi, chỉ chung mốc). Hoàn tác khớp `supersededAt === fact.decidedAt`.
- Log một dòng «Fact decision undone». Màn làm mới bằng `cache.contact(id)`.
- Phạm vi `PhamViDoiTacMiddleware` của router `contacts` — vai `okr` bị từ chối như mọi thủ tục contacts.

### 3. Khung bản ghi tải lỗi và kế hoạch công ty

- `RecordSheetFrame` nhận `onRetry`; lỗi tải → `Empty` viền liền gọn: «Không tải được bản ghi này» + mô tả
  «Kiểm tra kết nối rồi thử lại.» + nút «Thử lại» (`KaraRetry` — nút «Thử lại» duy nhất của kho, ai-ux §10)
  gọi `query.refetch()`. Không in `error.message`. Ba ngăn truyền `onRetry` (`deal-sheet.tsx` chỉ thêm dòng).
- Tab kế hoạch công ty: lỗi dùng cùng khung (bỏ khối `p` + `Button` tự ghép), đang tải giữ `aria-live`.

### 4. Nút tra cứu (cá nhân, công ty)

- Biểu tượng `MagicWand` gỡ; nút mang dấu Kara tia sáng. Đang chạy: chữ nút đổi thành «Kara đang tra
  cứu…» thay `Spinner` trần. Lỗi: toast chữ tiếng Việt an toàn, không in `error.message`.

### 5. Ngăn thêm nhanh không mất chữ

- Ba biểu mẫu `QuickAddContact`, `QuickAddDeal`, `AttachDealContact` khai «đang có chữ chưa lưu» bằng
  `useKhaiThayDoi()` (cơ chế khai con của `giu-thay-doi.tsx`, không bật lại tự nhận cho cả ngăn).
- Đóng cả ngăn (Esc, bấm ra ngoài, nút đóng, vuốt) khi đang có chữ → hộp «Bỏ những gì vừa nhập?» sẵn có.
- Nút «Huỷ» của biểu mẫu khi đang có chữ → cùng hộp hỏi lại (`ConfirmDialog`); trống → đóng ngay.
- Lưu xong → khai về `false` trước khi đóng; không hỏi.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở ngăn một cá nhân → tab «Kara» → bấm một gợi ý hoặc gõ câu hỏi → «Kara đang…» rồi các bước →
  câu trả lời (điểm ra: ngăn vẫn mở, hội thoại lưu vào danh sách).
- Suôn sẻ (đề xuất): mở ngăn cá nhân có đề xuất → mục «Chi tiết» mang nhãn «Kara · N đề xuất» → bấm «Thêm vào
  hồ sơ» dưới trường → dòng «Đã thêm theo Kara · Hoàn tác» (điểm ra: trường mang giá trị mới).
- Biên: hội thoại đang chạy dở khi mở lại; cuộc đã kết thúc; tác nhân không với tới (đọc lưu trữ); trường
  đã có giá trị khi nhận (nút nói «Thay giá trị hiện có»).
- Lỗi & quay lại: gửi lỗi → «Kara chưa trả lời được» → «Thử lại»; hoàn tác lỗi vì trường đã đổi → biên nhận
  nói rõ, không đổi gì; khung bản ghi tải lỗi → «Thử lại»; lỡ đóng ngăn thêm nhanh → hộp hỏi lại → «Tiếp tục
  sửa» quay về biểu mẫu với chữ còn nguyên.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Tab Kara của ngăn bản ghi | hỏi Kara về đúng bản ghi đang mở | tab của ngăn cá nhân / công ty / thoả thuận; `?thread=` / ngăn vẫn mở |
| Mục Chi tiết của ngăn cá nhân | quyết từng đề xuất thông tin liên hệ của Kara | tab Tổng quan / trường mang giá trị mới hoặc giữ nguyên |
| Khung bản ghi | hiện một bản ghi | danh sách, liên kết, `openRecord` / đóng ngăn |
| Ngăn thêm nhanh | thêm một người hay thoả thuận ngay trong ngăn | nút Thêm của tab / bản ghi mới hoặc huỷ |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-kara-dang-mo | Tab Kara | sau 1 giây: «Kara đang mở cuộc trò chuyện…» | chờ |
| ST-kara-rong | Tab Kara | dấu Kara, «Hỏi Kara về người này» + mô tả, ba gợi ý trên ô soạn | bấm gợi ý / gõ |
| ST-kara-dang-lam | Tab Kara | dải bước «Kara đang <bước>…», nút gửi thành nút dừng | chờ |
| ST-kara-loi | Tab Kara | «Kara chưa trả lời được» + mô tả an toàn + «Thử lại» | Thử lại |
| ST-kara-chua-bat | Tab Kara | «Kara chưa được bật» + «Quản trị viên cần bật Kara cho hồ sơ.» | báo quản trị |
| ST-kara-ban | Tab Kara | ô soạn khoá, «Kara vẫn đang trả lời câu trước…» | chờ |
| ST-kara-ket-thuc | Tab Kara | ô soạn khoá, «Cuộc trò chuyện này đã kết thúc.» + «Bắt đầu cuộc mới» | bắt đầu cuộc mới |
| ST-de-xuat-cho | Chi tiết | nhãn «Kara · N đề xuất», thân đề xuất dưới trường, «Thêm vào hồ sơ» / «Thay giá trị hiện có» / «Bỏ qua» | nhận / bỏ qua |
| ST-de-xuat-da-nhan | Chi tiết | «Đã thêm theo Kara · Hoàn tác» | Hoàn tác |
| ST-de-xuat-da-bo | Chi tiết | «Đã bỏ qua · Hoàn tác», mờ | Hoàn tác |
| ST-de-xuat-hoan-tac-loi | Chi tiết | «Trường này đã đổi sau khi nhận — không hoàn tác được» | sửa trường tay |
| ST-khung-loi | Khung bản ghi | «Không tải được bản ghi này» + «Kiểm tra kết nối rồi thử lại.» + «Thử lại» | Thử lại |
| ST-ke-hoach-loi | Tab Kế hoạch | cùng khung lỗi | Thử lại |
| ST-tra-cuu-dang-chay | Hàng nút ngăn | nút «Kara đang tra cứu…», khoá | chờ |
| ST-them-nhanh-hoi | Ngăn thêm nhanh | hộp «Bỏ những gì vừa nhập?» | Tiếp tục sửa / Bỏ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Phím: Enter gửi trong ô soạn; Esc khi ngăn thêm nhanh có chữ mở hộp hỏi lại thay vì đóng.
- Focus: sau Hoàn tác về nút chính của đề xuất vừa hiện lại; sau «Thử lại» của khung về vùng nội dung.
- Khổ 390: ô soạn và biên nhận không tràn ngang; nút đề xuất xuống dòng.
- Dữ liệu người nhập (tên, chức danh, giá trị đề xuất) mang `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
|---|---|---|
| `KaraTurn`, `KaraAvatar`, `KaraSteps`, `KaraState`, `KaraRetry`, `KaraComposer` | dùng | sáu khối của `bo-xuong-kara`, chưa màn nào nối |
| `KaraProposal`, `KaraLabel`, `ProposedChangeReceipt` | dùng | luật ai-ux §3, §5, §6 |
| `MessageScroller` | dùng | `KaraTranscript` dùng `Conversation` cuộn khác; luật cuộn của `docs/agent-panel.md` đã đo trên `MessageScroller` |
| `Empty border="solid"` + `KaraRetry` | ghép | khung tải lỗi không phải lời của Kara, nên không dùng `KaraState error` («Kara chưa…») |
| `useKhaiThayDoi`, `ConfirmDialog` | dùng | cơ chế giữ chỗ sẵn có của ngăn |
| `packages/ui/src/components/kara/ban-ghi.tsx` | tạo nếu S3 cần | chỗ cho một khối ghép mới của tab bản ghi; không tạo nếu khối sẵn đủ |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: hội-thoại (trong tab), danh-sách-chi-tiết cho ngăn bản ghi (không đổi).
Căn cứ: luồng hiển nhiên — K4 không đổi khung IA của ngăn, chỉ thống nhất lớp Kara bên trong; tham chiếu
ngành HubSpot Breeze Copilot đặt trợ lý trong thanh bên của hồ sơ, cùng khuôn.
<!-- UX-SPEC-TEMPLATE>>> -->

## Eval đã ký bị thay

Ba thước đã ký ghim hình dạng cũ mà K4 đổi có chủ đích. Lối của kit (GUIDE §7.1, «eval bị một hồ sơ đã ký
khác thay»): eval cũ khai `status: not-run` + `superseded_by`, hồ sơ này nhận việc thay ở đây.

| Eval cũ | Đo gì | Thay bởi | Vì sao đổi |
|---|---|---|---|
| the-gop-y-okr/E10 | thẻ thông tin liên hệ gọn, «Nhận» tô màu, «Bác» mờ, bấm cả hai trên cùng thẻ | khung-ban-ghi-kara#AC-6 | ai-ux 01/10: neo tại chỗ, nút gọi đúng hậu quả, nhận xong thu thành biên nhận |
| logo-onehub/E14 | `agent-panel.tsx` có đúng 2 chỗ `<Logo` (màn trống, avatar) | khung-ban-ghi-kara#AC-1 | ai-ux §2: logo hãng làm ảnh đại diện của AI — gỡ; dấu Kara thay |
| nen-kara-man-cu.dom.tsx ca «man-cu: thông tin liên hệ vẫn là thẻ» (eval nen-kara/E3 đã nghỉ) | `FactSuggestion` ở `density=card` | khung-ban-ghi-kara#AC-6 | K4 là lượt nối mà ca này chờ |

## Kiểm thử

- API: `apps/api/test/hoan-tac-thong-tin.spec.ts` trên Postgres thật — ma trận nhận/bác × hoàn tác ×
  (đúng người, người khác, trường đã đổi), mỗi ca đọc lại hàng `contact` và `contactFact`.
- DOM: `apps/app/test/ngan-ban-ghi-giu.dom.tsx` thêm ca ngăn thêm nhanh; tệp DOM mới cho tab Kara và đề xuất
  (dựng `AgentPanel` với `useEveAgent` giả, `FactSuggestion` với tRPC giả).
- Răng chữ: quét JSX các tệp trong ranh giới bằng bộ quét chữ cứng đã có
  (`_acceptance/nhan-ung-dung-noi-tieng-viet/rang/chu-cung-jsx.mjs`) + quét chuỗi gợi ý lập trình viên và
  `Spinner`/`MagicWand`/`Logo` trong tệp giao diện Kara.
- Màn: phép đo màn qua `bun run do:man` (kho đo riêng của cây) ở 1440 và 390.
