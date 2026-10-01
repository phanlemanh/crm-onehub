## Tóm tắt

Trưởng đơn vị soạn OKR của đơn vị mình cho một chu kỳ cùng Trợ lý OKR: mở một cuộc
soạn từ khung đơn vị ở màn OKR, hỏi đáp trong ngăn trượt, nhận · sửa · bác từng dòng
của bản nháp, rồi gõ khởi điểm và đích và bấm «Đưa vào bộ OKR». Máy không ghi số đích,
không công bố; người mang vai «chỉ OKR» dùng được mà không đọc được dữ liệu đối tác.

Hồ sơ `_acceptance/soan-okr-cung-tro-ly`: Cổng Đáng và Cổng Phạm vi ký 2026-09-30,
Cổng Bằng chứng ký <ngày>. Dòng 11 của mục 10 `docs/plan/lo-trinh-okr.md`.

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
  (sổ thành phần 5 → 7).
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

## Cần chủ kho xem: chỗ lệch khỏi kế hoạch hay hợp đồng đã ký

Điều phối đã quyết những chỗ dưới đây trong lúc làm; mỗi chỗ đổi lời của hợp đồng hay
phép đo đã ký, nên gom lại để ký lại Cổng Phạm vi một lần.

1. **Ở API, người không có quyền vào một cuộc soạn thấy đúng câu «không có» như khi mã
   không tồn tại** (404, không phải 403), theo nguyên tắc của lượt 8c «không phân biệt được
   với không có». Cửa gọi Trợ lý vẫn trả 403. Hợp đồng AC-1 và phép đo E1 còn ghi 403; ma
   trận quyền đổi 126 ô từ 403 sang 404.
2. **Phép đo «0 số đích máy ghi» đọc vết tạo KR**, không đọc đích hiện tại: người sửa
   đích sau khi đưa vào sẽ làm thước đỏ giả. Lúc đưa vào, vết tạo ghi thêm hai số người
   đã gõ. Hợp đồng dòng 79 cần sửa lời theo.
3. **Phép đo E15**: lời ghi trưởng phòng B thấy «hai» cuộc; đúng là **một** (quản trị
   thấy hai).
4. **KR mốc không nhận số** khởi điểm hay đích — theo mô hình KR mốc đang có; gửi số thì
   bị từ chối. Hợp đồng dòng 71 cần một câu ngoại lệ.
5. **Phép đo E28 (sàn thiết kế) thu hẹp lời**: thước bắt sáu mẫu vẽ tay rõ ràng (góc lạ,
   màu hex, bảng tự dựng, đường kẻ chia dòng tự dựng, chép vào bộ nhớ tạm bằng tay, chấm
   trạng thái tự vẽ) cộng design-gate của bộ nghiệm thu; không bắt «`className` trên thành
   phần dùng chung» vì mơ hồ với lớp bố cục hợp lệ.
6. **Phép đo E28 đổi đường của màn Tổ chức** từ `settings/to-chuc` sang đường thật
   `settings/organization`.
7. **Phép đo E26 (thước tài liệu)** ghi «bảy thủ tục soạn»; router có chín, thước đòi tối
   thiểu chín. Lời «không nhập chéo từ app Trợ lý gốc» được chấm theo đường thật, không so
   chữ.

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

## Ba phép đo cần model thật: một đã dựng và chờ tiền, hai chưa dựng

S4 chưa chạy. Năm lệnh chứng và các thước máy đã dựng xanh ở các mốc giữa lượt. Ba phép
đo dưới đây gọi model thật có ZDR; thiếu khoá thì dừng mã 2, không xanh.

Đã dựng, chờ chủ kho cho phép tiêu (ước 1–1,5 USD, trần 2 USD; khoá Gateway có trần
5 USD trọn đời):

- **Eval soạn**: câu hỏi mở đầu đúng khuôn (2–4 câu, mỗi câu hai gợi ý); bản nháp đầu
  không có dòng bị loại, đích để trống, Căn chỉnh chỉ vào đích được phép; lượt sửa bỏ
  đúng dòng đã bác; bản có gói bối cảnh thắng bản không gói ở ≥ 70 % ca khi judge chấm
  mù; mười cuộc bốn lượt có p50 ≤ 12 s, p90 ≤ 20 s mỗi lượt và ≤ 0,25 USD mỗi cuộc. Sau
  đó chủ kho chấm mù mười bản nháp để xem judge khớp người ≥ 80 %.

Chưa dựng (thước chưa có trong cây; dựng xong mới tới lượt xin tiền):

- **Đo màn thật**: đi trọn luồng trên màn — mở cuộc, trả lời, nhận · sửa · bác, sửa qua
  chat, đưa vào — chụp mỗi bước ở 1440 và 390, không bước nào tràn ngang, và «Đưa vào»
  thật sự tạo đúng số Mục tiêu nháp đã nhận.
- **Đo cách ly vai «chỉ OKR»**: có đối chứng dương trước (quản trị hỏi qua Trợ lý CRM thì
  máy dò bắt được tên deal hay công ty của bộ mẫu), rồi người vai «chỉ OKR» hỏi cùng câu
  qua Trợ lý OKR không nhận được tên nào; gỡ lớp chặn trên kho đo thì máy dò phải bắt.

## Lưu ý cho người gộp

- **Hai hồ sơ đã ký phải ghim lại trước khi gộp** (làn máy):
  - `the-gop-y-okr`: thước tên gọi nay bỏ qua thư mục AI Elements khi tìm tên cũ
    `Suggestion`, vì lượt này kéo đúng thành phần đó vào.
  - `nen-chat-ai-elements`: sổ thành phần AI Elements nay có bảy tệp, chữ «bốn tệp» ở
    `_acceptance/nen-chat-ai-elements/rang/so-lech-chuan.mjs:395` phải thành bảy.
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
- **Luật cho commit cuối trước gộp** — làm trong cùng một commit:
  (a) dòng 11 mục 10 `docs/plan/lo-trinh-okr.md`: ô Trạng thái thành «đã lên `onehub`»,
  ô Ngày thành ngày của commit đó, ô PR thành `#<số>`; cột Ghi chú chỉ nối thêm
  «· <ngày>: Cổng Bằng chứng ký (<người>), <n>/28 phép đo xanh, <m> phép đo phán quyết»,
  không sửa chữ cũ;
  (b) điền các ô `<…>` của tệp này, xoá ô nào không dùng, rồi dán làm mô tả PR;
  (c) chạy lại `node _acceptance/soan-okr-cung-tro-ly/rang/tai-lieu.mjs` → mã 0.
  Tệp dưới `docs/` được miễn luật bằng chứng cũ nên không phải ký lại Cổng Bằng chứng.

## Bằng chứng

- 28 phép đo của hồ sơ: `_acceptance/soan-okr-cung-tro-ly/evidence/` — <n>/28 xanh,
  <m> phép đo phán quyết.
- Phép thử «app Trợ lý thứ hai dựng và chạy cạnh app thứ nhất» đạt 2026-09-30 ở việc đầu
  tiên của S3; chạy lại trong S4 <ngày>.
- Thước tài liệu và thước sàn thiết kế chạy chiều đỏ trước khi đo (33/33 và 7/7 ca gài
  bị bắt).

## Cách chứng

Năm lệnh từ gốc kho:

```
bun run test
bun run check-types
bun run lint
bun run lint:slop
bun run build
```

Hồ sơ có 28 phép đo: 21 bài kiểm (`test`), 4 thước (`script`: cách ly vai «chỉ OKR» —
chưa dựng, eval với model thật, thước tài liệu, sàn thiết kế), 1 lượt đo màn thật
(`ui-check`, chưa dựng) và 2
phần người chấm (`judgment`: chủ kho chấm mù bản nháp; người đọc diff theo ba luật kho).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
