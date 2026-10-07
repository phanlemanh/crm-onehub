# Soạn OKR trang riêng (K2) — thiết kế

Ngày 2026-10-07. Hàng K2 của `docs/plan/lo-trinh-okr.json`, dãy P1 đợt `sau-14-10`. Cổng Đáng `build` ký
2026-10-07T13:13:50Z. Chủ kho duyệt hướng 12 điểm cùng ngày (phiên P1).

Đọc trước: `docs/ai-ux.md`, `docs/chat-ui.md`, `docs/design.md`, `docs/proto.md`, `docs/reui.md`, `docs/api.md`;
skill chuẩn UI của kho `web-design-guidelines` (bản luật lấy ngày 07/10).

## Bài toán

Màn Soạn OKR hôm nay là một sheet mở bằng `?cuocSoan=` trên Theo đơn vị: hội thoại trái, 11 thẻ viền lồng nhau
phải, mỗi thẻ một nút xanh «Nhận». Năm chỗ hở đã thấy (đề xuất 04/10): hai nửa không biết nhau khi Kara đang
soạn; dòng đã quyết vẫn mở ô số; «Đã bác» không có Hoàn tác; sửa trên bảng thì Kara không biết; số đã gõ mất sau
một lượt chat vì nó được giữ theo `id` của từng lần nộp.

Bốn câu khung chủ kho chốt 04/10: trang riêng có thanh kéo đổi cỡ; khoá dòng chưa quyết khi Kara đang soạn; có
nhận theo nhóm; đi 0 → 1 → 2 → 3. K1 (`bo-xuong-kara`, #258) dựng sẵn sáu khối và ba điểm cắm cho lượt này.

## Hướng đã duyệt (12 điểm)

1. Đường `/<slug>/okr/soan/<cuộc>`; nút «Soạn» và «Tiếp tục» mở trang; link cũ `?cuocSoan=` chuyển sang trang.
2. Trang ẩn đầu trang OKR (tab, chọn chu kỳ); đầu riêng: «← Theo đơn vị» · đơn vị · chu kỳ · lượt.
3. Hai ô co giãn bằng `resizable` của shadcn, hội thoại mặc định 380 px; ≤ 640 px hai tab.
4. Bản nháp là `KaraArtifact`: đầu khung là chỗ duy nhất nói trạng thái; chân khung có «Đưa vào» và «còn thiếu».
5. Dòng thay thẻ: Mục tiêu là một nhóm, KR là dòng; nút gọi theo hậu quả; nhận cả nhóm.
6. Hoàn tác mọi quyết định; hoàn tác Mục tiêu kéo KR đã quyết của nó về chờ; sau «Đưa vào» thì hết.
7. Kara đang soạn: dòng chưa quyết, Hoàn tác, nhận nhóm, Đưa vào khoá; ô soạn thành «Dừng».
8. Mốc nộp hai chiều, dòng vừa sửa có diff.
9. Hỏi Kara từ một dòng bằng chip ngữ cảnh.
10. Quyết trên bảng thành dòng hệ thống và gửi kèm lượt sau.
11. Số đã gõ giữ theo khoá dòng ổn định.
12. Gỡ hai `MIEN_TRU` của cổng mồ côi, dạy cổng nhìn qua `kara/`.

## Kiến trúc

### Trang

`apps/app/app/(app)/[slug]/okr/soan/[cuocSoanId]/page.tsx` — trang máy chủ: `requireSession`, prefetch
`okr.soanDanhSach`, `okr.access`, `workspace.get`, rồi trao cho thành phần khách `TrangSoan`. Trang nằm dưới
`okr/layout.tsx`; `DauTrangOkr` (`okr/thanh-tab.tsx`, chỉ thêm dòng) trả `null` khi đường là trang soạn, nên
trang soạn tự đặt đầu của mình. `tabTuDuong` không đổi.

`NutSoan` (`soan/nut-soan.tsx`) bỏ `ManSoan` dạng sheet, chuyển sang `router.push` tới trang. Theo đơn vị đọc
`?cuocSoan=` cũ: có thì `router.replace` sang trang (link cũ, dấu trang của người dùng không chết).

### Khung

`TrangSoan` = đầu trang + thân. Thân rộng (> 640 px) là `ResizablePanelGroup` ngang: ô hội thoại (mặc định
380 px quy ra phần trăm theo bề rộng thân, tối thiểu 300 px, tối đa 50%) · `ResizableHandle withHandle` · ô bản
nháp. Thân hẹp (≤ 640 px) là `Tabs` hai tab «Trò chuyện» / «Bản nháp (n)», tab đang mở nằm trên URL
(`?tab=ban-nhap`, nuqs) theo luật «URL là trạng thái». Cỡ ô không lưu (YAGNI); mở lại về mặc định.

`resizable` cài vào `packages/ui` bằng CLI shadcn (bậc 2 của `docs/design.md`), `--dry-run` trước, không
`--overwrite`; `react-resizable-panels` vào `packages/ui/package.json` bằng `bun add`. Ô hội thoại và ô bản nháp
mỗi ô cuộn riêng; trang không cuộn.

### Bản nháp

`KaraArtifact` với:

- `title` «Bản nháp»; `meta` «9 dòng · sửa lúc 10:42» (giờ của lần nộp cuối);
- `busy` khi `s.dangTraLoi` → đầu khung hiện «Kara đang soạn…», mọi `KaraProposal` bên trong khoá qua
  `KaraBusyProvider` có sẵn;
- `actions`: «Chỉ dòng chờ» (lọc, trên URL `?loc=cho`);
- `footer`: `ChanDuaVao` — nút «Đưa vào N Mục tiêu, M KR», và khi còn KR thiếu số: danh sách «Còn thiếu» mỗi mục
  là một nút tên KR, bấm → cuộn tới dòng và focus ô số đầu tiên còn trống.

Trạng thái thân (rỗng, đang mở cuộc, lỗi, chưa cấu hình, cuộc đóng, đã đưa vào) dùng `KaraState`; không còn
`Spinner` trần, `Alert` đứng yên hay «Chưa có dòng nào» khi Kara đang soạn (khi đó thân hiện `KaraState
working` «Kara đang soạn bản nháp đầu…»).

### Dòng

Mỗi Mục tiêu là một `KaraProposalGroup` (`scope` «Mục tiêu 1 · Cam kết», `reason` = `viSaoLucNay` + `viSao`,
`batch` khi Mục tiêu còn chờ). Mục tiêu và KR là `KaraProposal density="inline"` trong nhóm; căn chỉnh là dòng
cuối nhóm. Không còn `density="card"`.

- Nút: Mục tiêu «Thêm Mục tiêu» / KR «Thêm KR» / căn chỉnh «Thêm căn chỉnh» (tô màu) · «Sửa» (viền) · «Bỏ qua»
  (chữ). Đang sửa: «Thêm bản đã sửa» · «Huỷ».
- Ô Khởi điểm / Đích nằm trong `fields` của dòng KR có số, cả lúc chờ lẫn lúc đã nhận; KR mốc ghi «KR mốc — không
  cần số».
- Mỗi dòng có nút phụ «Hỏi Kara về dòng này» (ghost, icon `AiGenerate` không — vùng đã là của Kara, §2).
- Đã quyết thì thu thành biên nhận («Đã thêm KR · Tăng doanh thu … · Hoàn tác»); bỏ qua thì mờ, có Hoàn tác.
- Nhận cả nhóm: «Thêm cả Mục tiêu và N KR đã đủ số» — `batchable` = KR chờ có số hợp lệ ở cả hai ô, hoặc KR mốc;
  căn chỉnh không vào nhóm. Biên nhận nhóm «Đã thêm Mục tiêu 1 và 3 KR · Hoàn tác».
- Hoàn tác Mục tiêu khi có KR đã quyết: dòng biên nhận nói trước «Hoàn tác (kèm 3 KR)».

`KaraProposal` (`packages/ui/src/components/kara/proposal.tsx`) thêm prop `highlighted` để làm nổi dòng khi
cuộn tới (nền `accent` mờ dần, tắt khi `prefers-reduced-motion`), vì màn gọi không được tô bằng `className`.

### Ghi phía API

`soanQuyetInput` (`apps/api/src/okr/okr.contracts.ts`, giám sát duyệt chạm khối này):

- `quyet` thêm `"hoan"`: dòng về `cho`, xoá `giaTriCuoi`, `nguoiQuyet`, `quyetLuc`. Mục tiêu thì mọi KR và căn
  chỉnh đã quyết của nó cũng về `cho`, cùng giao dịch. Chỉ được khi dòng nằm trong tập hiện (`tapHien`) và cuộc
  còn `dang`; dòng đang `cho` → từ chối `{ ok: false, lyDo: "chua-quyet" }`.
- `kem?: string[]` (chỉ với `quyet: "nhan"` trên Mục tiêu): nhận Mục tiêu rồi nhận từng KR trong `kem`, cùng
  giao dịch, cùng `quyetLuc`. KR không thuộc Mục tiêu đó, không trong tập hiện hay không còn chờ → cả lệnh từ
  chối, không ghi gì.

Logic nằm trong `soan-ban-nhap.ts` (`ghiQuyet`, thêm `ghiHoan`, `ghiNhom`); `soan.service.ts#quyet` chuyển nhánh.
Không đổi schema Prisma, không thêm thủ tục; `generated/server.ts` không đổi vì chỉ nhập lược đồ theo tên.

### Mốc nộp

Mỗi `did` của `nop_ban_nhap` trong transcript mang `input` = bản nháp đầy đủ. Parse ở biên bằng `parseBanNhap`
(`@crm/validation/okr-cuoc-soan`); đầu vào hỏng → mốc ghi «Kara nộp bản nháp» không có số, không ném. Tóm tắt
mỗi mốc so lần nộp này với lần nộp hợp lệ liền trước trong cùng transcript, theo khoá (Mục tiêu theo `khoa`, KR
theo `khoa Mục tiêu/khoa KR`): «+1 Mục tiêu · +2 KR · sửa 1 · chuyển 1 · bỏ 1»; lần đầu «Bản nháp đầu: 3 Mục tiêu
· 9 KR». Hàm thuần `tomTatMoc(truoc, sau)` trong `soan/moc-nop.ts`.

Hai chiều:

- Bấm mốc (`KaraCheckpoint`) → ô bản nháp (tab bản nháp nếu hẹp) cuộn tới dòng đổi đầu tiên của lần nộp đó và
  `highlighted` 2 giây; dòng đã không còn trên bảng → cuộn tới đầu bản nháp, không lỗi.
- Dòng mang nhãn «vừa thêm / vừa sửa / vừa chuyển» (đã có từ `soBanNhap`) → nhãn là nút, bấm cuộn hội thoại tới
  mốc mới nhất.
- Dòng «vừa sửa» truyền `before` = chữ cũ (từ bản trước lượt), `ProposedChange` vẽ gạch/tô sẵn.

### Hỏi Kara từ dòng và quyết trên bảng

Ô soạn đổi sang `KaraComposer` (K1). Bấm «Hỏi Kara về dòng này» → `context` = { nhãn «KR · Tăng doanh thu…» }
và focus ô soạn (tab hội thoại nếu hẹp). Tin gửi đi = khối ngữ cảnh + chữ người. Khối ngữ cảnh là văn bản có
dấu mở/đóng cố định do `soan/khoi-ngu-canh.ts` viết và đọc lại (một module, một cặp hàm `vietKhoi` / `docKhoi`):

- dòng hỏi: tên loại + chữ hiện tại của dòng;
- các quyết trên bảng kể từ lượt gửi trước: «Bạn đã thêm KR «…» · bỏ qua Mục tiêu «…» · hoàn tác …».

Transcript đọc lại tin người: khối ngữ cảnh được tách khỏi bong bóng; phần dòng hỏi thành chip trên bong bóng,
phần quyết thành `KaraSystemLine` ngay trước bong bóng. Hàng quyết chưa gửi hiện một `KaraSystemLine` cuối hội
thoại «Sẽ gửi kèm lượt sau: …». Kara đọc khối như chữ thường; không đổi câu lệnh của Kara.

### Số đã gõ

`SoDaGo` đổi khoá từ `kr.id` sang `khoaDong`; ghi kèm vào `sessionStorage` theo `cuocSoanId` (bọc try/catch, hỏng
thì chỉ sống trong bộ nhớ). Kara nộp lại, đổi tab hẹp, tải lại trang trong cùng phiên trình duyệt đều giữ số.
«Đưa vào» gửi số theo `deXuatId` của dòng hiện tại như hôm nay.

### Cổng mồ côi

`_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs`: gỡ hai mục `MIEN_TRU` (`artifact.tsx`, `task.tsx`) và dạy
cổng đi tiếp qua `packages/ui/src/components/kara/*.tsx` như cầu (Ngoài-4 của K1). `task.tsx` tới được màn qua
`KaraSteps` — K2 dùng `KaraSteps` cho bước «Kara đọc tài liệu / nộp bản nháp» thay `Marker` tự dựng.

## Xử lý lỗi

- Quyết hay hoàn tác bị API từ chối → `error` tại dòng (chữ theo `lyDoQuyet`), dòng giữ nguyên, chữ đang sửa còn.
- Mạng lỗi khi quyết → như trên, chữ chung «Kara chưa ghi được quyết định này».
- Kara hỏng / quá 45 giây / hết lượt / chưa cấu hình / cuộc đóng → giữ hành vi đã có của R1h và
  `soan-okr-song-lai`; chỉ đổi khung sang `KaraState` và `KaraRetry`.
- `?cuocSoan=` trỏ cuộc không có → trang báo «Không mở được cuộc soạn» với «← Theo đơn vị».
- Người không có quyền vào URL trang → API từ chối như hôm nay (`congCuoc`), trang hiện `KaraState error`.

## Kiểm

- DOM (`apps/app/test/soan-okr-*.dom.tsx`, khung `khung-soan-okr.tsx`): dòng, nhóm, khoá khi bận, hoàn tác,
  mốc, chip, dòng hệ thống, còn thiếu, số theo khoá.
- Đơn vị: `tomTatMoc`, `vietKhoi`/`docKhoi` khứ hồi, `batchable`.
- API (`apps/api/test/soan-okr-hoan-tac.spec.ts`, xin chạm): hoàn tác từng loại dòng, Mục tiêu kéo KR, nhận nhóm
  một giao dịch, từ chối khi dòng cũ hay cuộc đã đưa vào.
- Màn chạy thật qua `do:man`: khổ 1440 / 768 / 375, sáng và tối, kéo thanh, phím trên thanh.
- Cổng mồ côi: hai chiều trên bản sao.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Theo đơn vị «Soạn» → trang soạn, Kara tự nói lượt đầu và nộp bản nháp → người gõ số, nhận từng dòng
  hay cả nhóm, hỏi Kara về dòng chưa ưng → «Đưa vào» → xác nhận (điểm ra: biên nhận «Đã tạo N Mục tiêu» với
  «Xem trên Theo đơn vị»).
- Biên: cuộc đã có từ trước («Tiếp tục») · Kara nộp lại khi người đang sửa một dòng · KR mốc không cần số ·
  Mục tiêu bị bỏ qua kéo KR · link cũ `?cuocSoan=` · khổ ≤ 640 px.
- Lỗi & quay lại: quyết bị từ chối → lỗi tại dòng, sửa và thử lại · Kara hỏng → «Kara chưa trả lời được» +
  «Thử lại» trong hội thoại · hết lượt → ô soạn khoá kèm lý do và «Mở cuộc mới» · lối về luôn là «← Theo đơn vị».

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Trang soạn | Cùng Kara dựng bộ OKR của một đơn vị và đưa vào | Nút Soạn/Tiếp tục, link cũ / Theo đơn vị |
| Hộp xác nhận «Đưa vào» | Nói rõ sẽ tạo gì cho đơn vị nào, chu kỳ nào | Chân bản nháp / biên nhận đã tạo |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-soan-dang-mo | Trang soạn | đầu trang + `KaraState working` «Đang mở cuộc soạn…» | chờ |
| ST-soan-mo-dau | Trang soạn | hội thoại «Kara đang đọc đơn vị…», bản nháp `KaraState working` «Kara đang soạn bản nháp đầu…» | chờ hoặc Dừng |
| ST-soan-co-nhap | Trang soạn | nhóm Mục tiêu, dòng KR có ô số, đầu khung «9 dòng · sửa lúc 10:42» | gõ số, nhận, sửa, bỏ qua, hỏi Kara |
| ST-soan-dang-soan | Trang soạn | đầu khung «Kara đang soạn…», dòng chờ khoá kèm lý do, ô soạn là «Dừng» | chờ hoặc Dừng |
| ST-soan-moc | Trang soạn | mốc «+2 KR · sửa 1» trong hội thoại; dòng đổi mang nhãn, dòng sửa có diff | bấm mốc / bấm nhãn |
| ST-soan-da-quyet | Trang soạn | biên nhận từng dòng và nhóm, mỗi cái có «Hoàn tác» | hoàn tác hoặc đi tiếp |
| ST-soan-con-thieu | Trang soạn | chân khung: nút Đưa vào khoá, «Còn thiếu: …» từng KR là nút | bấm tới ô, gõ số |
| ST-soan-hoi-dong | Trang soạn | chip «KR · …» trên ô soạn, focus ô soạn | gõ câu hỏi, gửi hoặc gỡ chip |
| ST-soan-loi | Trang soạn | hội thoại «Kara chưa trả lời được» + «Thử lại» | Thử lại |
| ST-soan-het-luot | Trang soạn | ô soạn khoá, lý do + «Mở cuộc mới» | mở cuộc mới hoặc quyết nốt và đưa vào |
| ST-soan-da-dua-vao | Trang soạn | biên nhận «Đã tạo 3 Mục tiêu» + «Xem trên Theo đơn vị»; dòng chỉ đọc | sang Theo đơn vị |
| ST-soan-khong-mo | Trang soạn | `KaraState error` «Không mở được cuộc soạn» | Thử lại hoặc ← Theo đơn vị |
| ST-soan-hep | Trang soạn ≤ 640 px | hai tab «Trò chuyện» / «Bản nháp (n)», tab trên URL | đổi tab |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Thanh kéo: chuột và phím (mũi tên trái/phải đổi 10%, `Home`/`End` về biên), có tên «Đổi cỡ hội thoại và bản
  nháp», focus nhìn thấy được; ô hội thoại 300 px tới 50%.
- Cuộn tới dòng: `scrollIntoView({ block: "center" })`, `behavior: "smooth"` trừ khi `prefers-reduced-motion`;
  dòng nổi 2 giây.
- Bấm «Còn thiếu» → focus ô số trống đầu tiên của KR đó. Bấm «Hỏi Kara» → focus ô soạn.
- Ô số: `inputMode="decimal"`, số đọc bằng `docSoOkr`; số viết theo locale.
- Gửi tin rỗng không gửi; Enter gửi, Shift+Enter xuống dòng (PromptInput có sẵn).

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `KaraArtifact`, `KaraProposalGroup`, `KaraTranscript`, `KaraComposer`, `KaraCheckpoint`, `KaraSystemLine`, `KaraSteps`, `KaraState` | dùng | K1 dựng cho đúng màn này |
| `KaraProposal` | mở rộng (`highlighted`) | làm nổi dòng khi cuộn tới, màn gọi không được tô bằng `className` |
| `Resizable` (shadcn) | dùng — cài mới vào `packages/ui` | bậc 2 của `docs/design.md`; tra `packages/ui` không có |
| `Tabs`, `ConfirmDialog`, `Field`, `InputGroup` | dùng | có sẵn |
| `PageShell` đầu trang | ghép | đầu riêng: nút lùi + tiêu đề + mô tả |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: hội-thoại
Căn cứ: (ii) không tra Mobbin — luồng đã chốt 04/10 trên đề xuất có đối chiếu ChatGPT Canvas, Claude Artifacts,
Copilot Pages: hội thoại hẹp là nơi điều khiển, vật phẩm rộng là nơi quyết; khuôn hiển nhiên, chỉ một ứng viên.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài phạm vi

- Phiên bản của từng lần nộp để quay về; «vì sao» có nguồn — cần server.
- Đổi câu lệnh của Kara (`apps/agent-okr`).
- Lưu cỡ ô giữa hai lần mở.
- Hàng quyết chưa gửi sống qua tải lại trang.
- Thử lại nói rõ vì sao, Kara sập không trừ lượt — R1h đã làm (#251).
