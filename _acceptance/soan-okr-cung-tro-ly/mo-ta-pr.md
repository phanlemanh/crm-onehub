## Tóm tắt

Trưởng đơn vị soạn OKR của đơn vị mình cho một chu kỳ cùng Trợ lý OKR: mở một cuộc
soạn từ khung đơn vị ở màn OKR, hỏi đáp trong ngăn trượt, nhận · sửa · bác từng dòng
của bản nháp, rồi gõ khởi điểm và đích và bấm «Đưa vào bộ OKR». Máy không ghi số đích,
không công bố; người mang vai «chỉ OKR» dùng được mà không đọc được dữ liệu đối tác.

Hồ sơ `_acceptance/soan-okr-cung-tro-ly`: Cổng Đáng và Cổng Phạm vi ký 2026-09-30,
Cổng Phạm vi ký lại lần ba 2026-10-01; Cổng Bằng chứng ký 2026-10-02 (Manh Phan) sau bốn vòng chấm. Dòng 11 của mục 10 `docs/plan/lo-trinh-okr.md`.

## Người dùng thấy

- Nút «Soạn OKR cùng Trợ lý» trên khung đơn vị (khi quản trị đã bật việc soạn cho đơn
  vị; ở chế độ ẩn chỉ quản trị thấy nút, kèm nhãn «chế độ ẩn»); màn soạn: hội thoại cạnh bảng nháp, trên máy hẹp là hai tab; danh sách cuộc cũ;
  hết lượt thì mở cuộc mới thay cho cuộc đang dở.
- Cài đặt › Chương trình OKR: hai dòng nấc cho việc soạn (bật cho · chế độ ẩn cho), ô
  trần tháng đặt OKR, thẻ số đo «Soạn OKR cùng Trợ lý».
- Cài đặt › Tổ chức: ô «Mô tả» của bộ phận và phòng ban, ô «Chức danh» của từng người.
- Kho tài liệu: loại trang «Chiến lược», cảnh báo khi duyệt trang có từ cấm hay vượt
  trần ký tự.

## Thay đổi

- Dữ liệu: một migration chỉ thêm (`20261010010000_okr_soan`) — bảng cuộc soạn
  `OkrCuocSoan`; mô tả cho bộ phận và phòng ban, chức danh cho chỗ đặt người; bốn cột
  nấc soạn và trần tháng đặt OKR trong cấu hình chương trình; dòng nháp mang cuộc soạn,
  nội dung và bản ghi nó tạo ra (`cuocSoanId`, `noiDung`, `taoRaId` trên `OkrDeXuat`).
- API: chín thủ tục soạn, mọi thủ tục qua cùng lớp phạm vi OKR (`docs/api.md` §OKR).
  API không gọi model nào — trí khôn nằm ở app Trợ lý.
- App Trợ lý thứ hai `apps/agent-okr`: một tác nhân, một công cụ duy nhất là nộp bản nháp,
  mười một công cụ dựng sẵn bị tắt; model có ZDR qua bộ tạo model ZDR dùng chung
  `@crm/ai-okr`;
  không nhập gì từ `apps/agent`. App web gọi nó qua cửa mới `/eve/agents/okr/eve/v1/*`;
  hai biến `OKR_AGENT_URL`, `OKR_AGENT_BRIDGE_SECRET` khai đủ bốn nhà
  (`docs/environment.md`).
- Khuôn dữ liệu dùng chung ở `packages/validation`: cuộc soạn, bộ kiểm bản nháp, bản tóm
  gọn kỳ trước; loại trang `chien-luoc`.
- Giao diện dùng chung ở `packages/ui`: hai thành phần AI Elements (ô soạn, gợi ý trả
  lời) kéo bằng CLI; thẻ đề xuất có ô nhập và nhãn; khung trống có viền liền; mục điều
  hướng chỉ biểu tượng; tiêu đề mục kèm số đếm và nút cùng hàng; thân ngăn trượt có cột
  tự cuộn.
- Tệp của hãng chạm: 22 tệp, liệt ở mục «Chỗ rẽ: Soạn OKR cùng Trợ lý» của
  `docs/agent.md`.

## Bậc thiết kế (theo `docs/design.md`, một dòng mỗi khối mới)

- Nút «Soạn OKR cùng Trợ lý» ở khung đơn vị — dừng ở bậc 1 (`Button`, `Badge`, `Field`,
  `FieldDescription`); không cần tra bậc trên.
- Khung màn soạn (ngăn trượt hai cột, hai tab ở máy hẹp) — dừng ở bậc 1 (`Sheet
  size="assist"`, `SheetBody split`, `SheetRailHeader`, `Tabs` của khung tạo OKR #220),
  thêm biến thể `SheetBody cuonRieng` trong `packages/ui` để cột hội thoại tự cuộn còn ô
  soạn đứng yên. Đã tra bậc 1: `sheet`, `drawer`, `scroll-area`, `message-scroller` —
  không có khung hai cột tự cuộn. Tra ReUI lúc viết mô tả này («two column scroll layout
  chat beside table, independent scroll panes»): gần nhất là block Pro `ai-chat-7` (hai
  khung so hai model, bậc 4 — chỉ là bản vẽ bố cục), không thay được biến thể.
- Hội thoại — dừng ở bậc 1 (`Conversation`, `ConversationEmptyState`, `Message`,
  `MessageResponse`, `MessageAvatar`, `ThinkingIndicator`, `Alert` đã có trong
  `packages/ui`).
- Ô soạn và gợi ý trả lời — dừng ở bậc 1 theo đường riêng của khung chat: hội thoại
  thuộc AI Elements (`docs/chat-ui.md`), không đi thang shadcn gốc; `PromptInput`,
  `Suggestion` kéo bằng CLI của AI Elements vào `packages/ui/src/components/ai-elements`
  (sổ thành phần nay 8 tệp sau khi gộp `onehub`).
- Thẻ dòng nháp «Mục tiêu mới» có KR con, ô khởi điểm/đích trong thẻ, nhãn «vừa sửa ·
  vừa chuyển» — dừng ở bậc 1, thêm biến thể `fields`, `tag` cho `ProposedChange` trong
  `packages/ui`. Lúc dựng không ghi câu tìm; tra ReUI lúc viết mô tả này («nested card
  list with editable fields and accept reject actions (proposal card)»): không khớp —
  gần nhất là thẻ sản phẩm, thẻ hồ sơ ứng viên và `c-card-16` (thẻ có huy hiệu và nút),
  không có thẻ đề xuất nhận/bác lồng nhau.
- Bảng nháp (danh sách thẻ, trống, hỏi lại trước khi đưa vào) — dừng ở bậc 1
  (`ProposedChange`, `Field`, `InputGroup`, `Empty`, `Alert`, `ConfirmDialog`, `Badge`).
- Tiêu đề mục kèm số đếm và nút cùng hàng — dừng ở bậc 5: thành phần mới
  `SectionHeading` trong `packages/ui` (đã thành một hàng của bảng «Dấu hiệu vẽ tay»).
  Lúc dựng không ghi câu tìm; tra ReUI lúc viết mô tả này («section heading with count
  badge and inline action buttons»): chỉ có nút kèm số đếm (`c-button-45`), không có tiêu
  đề mục.
- Danh sách cuộc — dừng ở bậc 1 (`Sheet size="md"`, `SimpleTable`, `StatusIndicator`,
  `Empty border="solid"`).
- Việc soạn trong thẻ Trợ lý OKR ở Cài đặt (hai dòng nấc, ô trần tháng) — dừng ở bậc 1
  (`FieldSet`, `Field`, `Input`).
- Thẻ số đo «Soạn OKR cùng Trợ lý» — dừng ở bậc 1 (`Card`, `SimpleTable` với `sub`,
  `numeric`, `Empty`, `Skeleton`, `Sheet size="md"`, `Item`, `StatusIndicator`,
  `SectionHeading level={4}`); bố cục chép thẻ số đo góp ý đã có.
- Ô mô tả đơn vị, ô chức danh — dừng ở bậc 1 (`Textarea`, `Input`, `Field`,
  `FieldDescription` cho bộ đếm ký tự, `FieldError`).
- Loại trang «Chiến lược» và cảnh báo khi duyệt — dừng ở bậc 1 (`Select`,
  `FieldDescription`, `Alert`).

## Việc ngoài kế hoạch

- **H1 — theo lượt 8c sau khi gộp `onehub`**: gói bối cảnh gửi Trợ lý và tên đích
  trong bảng nháp nay lọc theo mức hiển thị của Mục tiêu, nên Mục tiêu giới hạn không lọt
  tên vào gói hay vào màn của người không được xem (gói chỉ lấy Mục tiêu công khai); đơn
  vị đã lưu trữ không mở được cuộc soạn; người không có quyền vào một cuộc thấy câu
  «không có» (mục 1 ở trên).
- **D1b — mở phiên với Trợ lý**: Trợ lý tự đặt mã phiên, nên API không mở phiên bằng mã
  mình đặt được. Cuộc mới giữ một mã tạm, cửa đọc mã phiên thật khi Trợ lý trả về rồi gắn
  vào cuộc — mỗi cuộc một phiên sống, mở trùng thì từ chối có tên, phiên eve không gắn
  được vào cuộc vẫn được đếm chi phí. «Mở cuộc mới» khi hết lượt bỏ cuộc đang dở và mở
  cuộc mới trong cùng một bước; cuộc bỏ vẫn đếm vào trần kỳ.

- **Sửa một lỗi có sẵn trên `onehub` (chủ kho cho phép 02/10)**: lịch tóm tắt tuần của Trợ lý OKR xếp tóm tắt cho cả chu kỳ đã ẩn. Nay lọc chu kỳ ẩn; bài hồi quy «chu-ky-an» đỏ trước khi sửa. Lỗi lộ ra khi thước của hồ sơ `sua-an-chu-ky-okr` phải chạy lại. Bằng chứng đã ký của `tro-ly-okr-tom-tat` cũ đi im lặng vì tệp nó đo đổi sau chữ ký; bài hồi quy mới nằm trong bộ kiểm chung nên hành vi vẫn có thước canh.
- **Sửa thước của hồ sơ đã ký `sua-an-chu-ky-okr`**: thước sàn thiết kế neo vào mốc gộp #222 thay vì `onehub` hiện tại (cùng cách #211), nên không chấm mã của lượt sau; vế «dòng lượt đó thêm» thành bản ghi đóng băng, các vế trạng thái cây vẫn đo cây hiện tại. Ghi sổ quyết định của hồ sơ đó.

## Kết quả nghiệm thu

29 phép đo cho 15 tiêu chí: 21 bài kiểm, 5 thước, 1 lượt đo màn thật, 2 phần người chấm.

- **Máy chấm:** 26/26 phép đo máy đạt. E21 (cách ly vai «chỉ OKR») đo ở lượt ghim lại sau chữ ký, chạy nối tiếp, mã 0. Bảy lệnh hồi quy xanh.
- **Người chấm:** E24 và E29 chủ kho phán Đạt tại Cổng Bằng chứng.
- **Không chạy theo hồ sơ — E22 (tốc độ và chất lượng với model thật):** đo ba lần ngoài lượt chấm, chưa lần nào xanh trọn. Trình ở Cổng Bằng chứng là **chưa đạt ổn định**, giao ở nấc tắt:
  - mỗi lượt chậm nhất (p90) 19,1 · 20,3 · 34,3 giây so với hứa 20 giây; chậm do thời gian mô hình, đến theo cơn;
  - bản có gói bối cảnh thắng mọi cặp chấm được (31/31 qua ba lần), nhưng lần 3 bên chấm hỏng 6/15 cặp nên vế này chưa kết luận.
- **Trước khi BẬT cho người dùng:** đo lại độ trễ; sửa bên chấm rồi đọc lại vế gói thắng. Câu hỏi mở: lượt vượt hạn vé 120 giây của cửa thì người dùng thấy gì.
- **Giới hạn có tên:** tác nhân chết im thì người dùng chờ tới 45 giây mới thấy báo lỗi. Mười giới hạn đã biết khác ở mục Notes của hợp đồng.
- **Tách việc riêng (ba hợp đồng mới):** đổi tên AI trên màn soạn sang Kara theo luật mới của `onehub`; nút Thử lại báo đúng lý do lỗi; không trừ lượt khi Trợ lý không liên lạc được.

## Lưu ý cho người gộp

- **Bốn hồ sơ đã ký được ghim lại trên nhánh này** (làn máy, đều xanh): `soan-okr-cung-tro-ly`, `nen-chat-ai-elements`, `the-gop-y-okr`, `sua-an-chu-ky-okr`.
- **Tên trên màn còn «Trợ lý OKR»**: `onehub` vừa chốt Kara là tên duy nhất của AI trên màn (#230). Hợp đồng đã ký trước luật đó; việc đổi chữ đi ở hợp đồng riêng.
- **Sự cố, chờ chủ kho dọn**: 2026-09-30 10:08 UTC một script gỡ lỗi chạy nhầm vào kho
  dữ liệu chung `crm` và để lại hàng mang tiền tố `sokr-`: ba trang tài liệu (hai trang
  chiến lược đang dùng, cả hai mang câu chèn thử; trang thứ ba thuộc loại khác), bốn đề
  xuất, ba phiên bản, một người dùng. Lệnh xoá bị chặn quyền nên máy không tự xoá. Hai
  trang chiến lược mang câu chèn đang ở trạng thái «đang dùng», nên Trợ lý chạy trên kho
  chung sẽ đọc chúng cho tới khi dọn.
- **Đã mở việc riêng**: ba chỗ đường kẻ chia dòng tự dựng ở màn Cây tổ chức (có từ
  24/09, lượt này không chạm) — chip «Thay divide-y bằng Item ở màn Cây tổ chức».
- Bật cho người dùng: nấc «ẩn» trước, «bật» theo đơn vị ở Cài đặt › Chương trình OKR;
  trần tháng đặt OKR do chủ kho quyết sau N-soạn.
- Chưa gửi lên hãng: bộ tạo model ZDR và khuôn app eve thứ hai — ghi ở mục chỗ rẽ.
- **Thước quyền xem của `gioi-han-duyet-cay-okr` sẽ đỏ thêm 2 dòng trên `onehub` sau khi PR này gộp**, cho tới khi hai dòng miễn được nhận ở PR theo sau: `soan-so-do.service.ts · mucTieuTuNhap · okrTrail` và `· okrObjective` — số đo việc soạn chỉ quản trị gọi, chỉ ra số đếm (nguyên văn hai dòng ở Notes của hợp đồng).

## Bằng chứng

- Gói bằng chứng: `_acceptance/soan-okr-cung-tro-ly/evidence-report.md` (vòng 4 + ghim lại), ảnh chụp và nhật ký ở `evidence/`, bốn vòng chấm có ba bằng chứng bản nhúng tham số (`evidence/s4-r*-nhung-tham-so.txt`).
- E22 ba lần đo ngoài lượt: `evidence/eval-ngoai-luot-r1.log` … `r3.log`; E21 đo ngoài lượt vòng 3: `evidence/e21-ngoai-luot-r3.log`.
- Phép thử «app Trợ lý thứ hai dựng và chạy cạnh app thứ nhất» đạt 2026-09-30 ở việc đầu tiên của S3.

## Cách chứng

Năm lệnh từ gốc kho:

```
bun run test
bun run check-types
bun run lint
bun run lint:slop
bun run build
```

Hồ sơ có 29 phép đo: 21 bài kiểm (`test`), 5 thước (`script`: cách ly vai «chỉ OKR», eval với model thật, thước tài liệu, luật kho, sàn thiết kế), 1 lượt đo màn thật (`ui-check`) và 2 phần người chấm (`judgment`).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
