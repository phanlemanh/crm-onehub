# Chế độ Soạn bộ OKR — thiết kế (VK10, `che-do-soan-bo-okr`)

Hàng VK10 của `docs/plan/lo-trinh-okr.json`, mã phạm vi `B5a` của `docs/plan/pham-vi-okr-vo-khu-1810.md`. Câu giao:
«Trưởng đơn vị bấm Soạn OKR và viết cả bộ như một tài liệu — mục tiêu, KR liền mạch — với góp ý của Kara và điểm chất
lượng ở cột bên, rồi công bố». Ngưỡng (ô cơ hội đã ký 19/10): tạo một mục tiêu có ba KR và công bố trong khoảng 3 bấm
cộng phần gõ; ngăn theo dõi chỉ còn một chip góp ý. Bản mẫu bấm được: `/proto/che-do-soan-bo-okr` (sổ
`_acceptance/che-do-soan-bo-okr/design-pass.md`).

Báo cáo Tability (artifact `AJuRPQDJK7ZB9GLKus6Tpj`) không mở được từ phiên này; thiết kế dựa trên bản phạm vi, câu
giao, ô cơ hội và luật kho. Vòng đứng trên VK3 `trang-bo-okr` (trang một bộ OKR) và chạm hộp «Thêm mục tiêu» của VK9
`mot-nut-tao-muc-tieu` — S2 chỉ bắt đầu khi cả hai đã gộp `onehub`.

## Hôm nay

- Tạo một mục tiêu có ba KR: «Thêm mục tiêu» → ngăn tạo → lưu → mở mục tiêu → «Thêm KR» ba lần, mỗi lần một hộp
  (khoảng mười bấm).
- «Soạn OKR cùng Kara» (cuộc soạn, `okr/soan/`) mở khung bản ghi `?record=soan:<cuộc>`: Kara viết bản nháp từ hội
  thoại, người chỉ nhận · sửa · bác từng dòng (`OkrDeXuat`), rồi «Đưa vào bộ OKR» tạo mục tiêu **nháp**. Người không tự
  gõ được dòng nào; cuộc soạn có trần (12 lượt, 3 cuộc mỗi đơn vị mỗi chu kỳ) và chỉ mở khi quản trị bật Kara soạn.
- Ngăn theo dõi (khung chi tiết mục tiêu, `objective-sheet.tsx` thẻ KR): `VungKara` cùng góp ý neo dưới từng KR
  (`DeXuatNeo` qua điểm cắm `duoiKr`) chiếm phần lớn chiều cao.
- Không có điểm chất lượng dạng số. Có luật `kiemOkr` (`packages/validation/src/okr-kiem.ts`: KR là việc · thiếu khởi
  điểm · đích bằng khởi điểm · thiếu đối trọng), hiện thành câu «hỏi» trong hộp KR.

## Thiết kế

Chế độ Soạn là **một khung bản ghi cho một bộ OKR** (đơn vị + chu kỳ): tài liệu bên trái, cột bên phải gồm khối Chất
lượng và khối góp ý Kara (`docs/ai-ux.md` mục 11 — vật phẩm trái, Kara phải, một đường kẻ). Tài liệu là chữ của người:
mỗi dòng ghi thẳng thành mục tiêu hay KR **nháp thật** qua thủ tục có sẵn — không bảng mới, không migration, không thủ
tục API mới.

- **Tài liệu.** Mọi mục tiêu chưa bỏ của bộ theo thứ tự màn theo dõi. Mỗi mục tiêu: trạng thái, loại, tên, «Vì sao bây
  giờ», các dòng KR (tên · khởi điểm → đích · đơn vị · người phụ trách), «Thêm KR». Cuối: «Thêm mục tiêu». Gõ tên rồi
  Enter sang dòng KR; Tab đi qua các ô số; Enter ở ô cuối mở KR kế. Dòng đủ chữ thì tự lưu (`createObjective`,
  `createKeyResult`, rồi `updateObjective`/`updateKeyResult` khi sửa); dòng thiếu đích ghi «Chưa lưu — thiếu đích».
  Mặc định không hỏi: loại Cam kết, người phụ trách là trưởng đơn vị của bộ (không có trưởng thì người soạn — Hỏi-8),
  kiểu KR suy từ số; đổi bằng ô người và menu trên dòng.
- **Mục tiêu đã công bố** trong tài liệu: chữ sửa được, ô số khoá («Số của mục tiêu đã công bố sửa ở ngăn KR»). Chờ
  duyệt: khoá cả dòng (luật «Chờ duyệt» của `CONTEXT.md`). Đã bỏ: không hiện.
- **Khối Chất lượng** (không mang dấu Kara — máy chấm, không phải Kara viết): «N trên M điểm đạt», thanh tiến, mỗi điểm
  chưa đạt một dòng nêu tên dòng và «Đến dòng». Một hàm thuần mới trong `packages/validation` dựng trên `kiemOkr`
  cộng hai luật cấu trúc (mỗi mục tiêu 2–5 KR, mỗi KR có người phụ trách), chạy ở máy khách theo từng lần gõ. M đếm
  điểm xét: mỗi mục tiêu hai luật mức mục tiêu (đối trọng chỉ xét khi có từ 2 KR), mỗi KR các luật mức KR áp cho kiểu
  của nó cộng «có người phụ trách» — ví dụ một mục tiêu 2 KR tăng tới + 1 KR giữ trên sạch lỗi là «12 trên 12». Điểm
  không chặn công bố.
- **Khối góp ý Kara.** «Nhờ Kara đọc bộ» gọi `okr.troLyDeXuat` cho từng mục tiêu của bộ (thủ tục góp ý hôm nay, nhận cả
  mục tiêu nháp); góp ý hiện ở cột bên dạng thẻ (`ProposedChange` `card` trong `KaraProposalGroup`, nhãn Kara một lần);
  nhận qua `okr.troLyQuyet`, dòng trong tài liệu đổi ngay, thẻ thu thành biên nhận có Hoàn tác, dòng mang dấu «đổi
  theo Kara». Kara tắt, hết lượt, lỗi: `KaraState` tương ứng; khối Chất lượng vẫn chạy.
- **Công bố.** Nút chính duy nhất của khung: «Công bố N mục tiêu» (N = mục tiêu nháp có ít nhất một KR đã lưu); bấm hỏi
  lại một lần (cùng câu hậu quả với nút công bố của ngăn hôm nay), hộp liệt N mục tiêu với ô tích mặc định đã tích —
  bỏ tích mục tiêu nháp dở của người khác hay của cuộc soạn cũ (Hỏi-7); xác nhận thì `okr.publishObjective` cho từng
  mục được tích — hay «Gửi duyệt N mục tiêu» (`okr.guiDuyet`) khi chương trình bật
  «Công bố cần duyệt» và người bấm không duyệt được. Mục tiêu thiếu KR ở lại Nháp và được gọi tên.
- **Ngăn theo dõi.** Thẻ KR của khung chi tiết bỏ `VungKara` và góp ý neo; thay bằng đúng một chip «Kara · N góp ý» ở
  đầu khung khi còn góp ý chờ. Bấm chip mở chế độ Soạn của bộ chứa mục tiêu, cuộn tới mục tiêu ấy.
- **Đường vào.** Dòng thứ tư của hộp «Thêm mục tiêu» (VK9) đổi thành «Soạn cả bộ» mở chế độ Soạn; bộ trống có nút
  «Soạn bộ OKR» trong câu rỗng; chip góp ý của ngăn theo dõi. Cuộc soạn cũ thành lối «Nhờ Kara soạn nháp» trong tài liệu
  khi bộ trống (Hỏi-2).

### Chỗ chạm ngoài vùng của làn

`apps/app/components/crm/record-sheet/**` (`objective-sheet.tsx` cho ngăn theo dõi, `record-stack.ts` và
`record-sheet-host.tsx` cho loại khung mới) thuộc làn M5 (luật 19 của đợt) — S3 xin `cham-tep` qua phiên giám sát.
Khoá `vk10_*` thêm vào `_acceptance/config.yaml` ở S3, chỉ thêm dòng (luật 7).

### Rủi ro đã thấy

- Hình luồng vào–ra cho Hỏi-2 và Hỏi-4: `_acceptance/che-do-soan-bo-okr/figures/luong-soan.png`.
- Sáu hồ sơ đã ký đo khối Kara của ngăn theo dõi: `gop-y-dung-cho`, `kara-gop-y-luot-2`, `gan-tay-va-kara-co-ly-do`,
  `nen-kara`, `muc-tieu-va-kr`, `okr-to-chuc-va` (bài `apps/app/test/gop-y-dung-cho-*.tsx`, `khung-gop-y-*.tsx`,
  `muc-tieu-va-kr.dom.tsx`, `okr-to-chuc-va.dom.tsx`). Gỡ khối làm đỏ các ô đo nó (Hỏi-6). Hồ sơ `soan-okr-*` đo nút
  Soạn và cuộc soạn — VK9 đã đụng; vòng này chỉ đổi nhãn dòng thứ tư.
- Tự lưu từng dòng sinh nhiều lần gọi; `createKeyResult` đòi đủ `title`, `kind`, `ownerUserId`, khởi điểm, đích — dòng
  chưa đủ giữ ở máy khách tới khi đủ, và đóng khung khi còn dòng ấy phải hỏi lại.
- Công bố từng mục tiêu trong một vòng lặp có thể hỏng giữa chừng: mục tiêu đã công bố giữ nguyên, mục tiêu lỗi được gọi
  tên kèm Thử lại.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Bộ OKR của đơn vị mình → «Thêm mục tiêu» › «Soạn cả bộ» (hay «Soạn bộ OKR» ở bộ trống) → gõ mục tiêu, Enter,
  gõ ba KR → xem Chất lượng, «Nhờ Kara đọc bộ», nhận một góp ý → «Công bố 1 mục tiêu» → xác nhận (ô tích đã tích sẵn) (điểm ra: biên nhận
  «Đã công bố» và «Về màn theo dõi»).
- Biên: bộ trống; bộ có mục tiêu đã công bố hay chờ duyệt; Kara tắt hay hết lượt; người không sửa được bộ; chu kỳ đã
  đóng; chương trình bật «Công bố cần duyệt»; dòng thiếu đích; mở từ chip góp ý của ngăn theo dõi.
- Lỗi & quay lại: tải bộ hỏng → khối lỗi có Thử lại; lưu một dòng hỏng → dòng giữ chữ, câu lỗi theo kiểu ô, lưu lại khi
  rời ô; công bố hỏng một mục tiêu → các mục tiêu khác giữ kết quả, mục tiêu lỗi gọi tên + Thử lại; đóng khung khi còn
  dòng chưa lưu → hỏi «Bỏ dòng chưa lưu?».

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Chế độ Soạn (khung bản ghi cỡ `kara`) | Viết và công bố nội dung cả bộ | hộp Thêm mục tiêu, câu rỗng của bộ, chip góp ý / màn theo dõi của Bộ OKR |
| Ngăn theo dõi (khung chi tiết mục tiêu) | Theo dõi tiến độ một mục tiêu | Bộ OKR, Của tôi / chế độ Soạn qua chip |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-soan-dang-tai | Chế độ Soạn | khung xương, tiêu đề «Soạn bộ OKR» và tên bộ còn nguyên | chờ |
| ST-soan-loi-tai | Chế độ Soạn | «Chưa mở được bộ OKR» + một câu + Thử lại | Thử lại |
| ST-soan-trong | Chế độ Soạn | câu rỗng, dòng mục tiêu trống có con trỏ, «Nhờ Kara soạn nháp»; Chất lượng «Gõ mục tiêu đầu tiên để máy chấm»; «Công bố» khoá | gõ |
| ST-soan-dang-go | Chế độ Soạn | dòng KR thiếu đích «Chưa lưu — thiếu đích»; điểm cập nhật theo lần gõ | gõ tiếp |
| ST-soan-kara-dang-doc | Chế độ Soạn | «Kara đang đọc bộ OKR này…» ở cột bên | chờ, gõ tiếp |
| ST-soan-co-gop-y | Chế độ Soạn | thẻ góp ý trong nhóm «Kara · N đề xuất» | nhận · sửa · bỏ qua |
| ST-soan-da-nhan-gop-y | Chế độ Soạn | biên nhận có Hoàn tác, dòng có dấu «đổi theo Kara» | Hoàn tác hay đi tiếp |
| ST-soan-co-muc-da-cong-bo | Chế độ Soạn | mục tiêu đã công bố: chữ sửa được, số khoá kèm câu | sửa chữ |
| ST-soan-kara-tat | Chế độ Soạn | `KaraState` chưa bật; Chất lượng vẫn chấm | gõ, công bố |
| ST-soan-hoi-cong-bo | Chế độ Soạn | hộp «Công bố N mục tiêu?» liệt mục tiêu với ô tích đã tích, câu hậu quả | bỏ tích nếu cần · Công bố · Huỷ |
| ST-soan-da-cong-bo | Chế độ Soạn | biên nhận «Đã công bố N mục tiêu» + «Về màn theo dõi» | về màn theo dõi |
| ST-soan-chi-xem | Chế độ Soạn | mọi ô khoá, câu lý do, không Công bố, không cột bên | đóng |
| ST-soan-dien-thoai | Chế độ Soạn | phủ toàn màn, hai thẻ «Bộ OKR · Chất lượng và Kara» | đổi thẻ |
| ST-ngan-mot-chip | Ngăn theo dõi | đúng một chip «Kara · N góp ý», không vùng Kara | bấm chip → chế độ Soạn |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Phím: Enter ở tên mục tiêu → dòng KR mới; Tab tên KR → khởi điểm → đích → đơn vị; Enter ở đơn vị → KR kế;
  Backspace ở đầu một dòng KR trống → xoá dòng, focus lên dòng trên. Ô số nhận «1.234,5».
- Tự lưu khi dòng đủ chữ và khi rời ô; mỗi dòng một lần gọi đang chạy, lần gõ sau xếp hàng.
- Bấm ra ngoài khung không đóng; Esc và nút đóng như nhau; còn dòng chưa lưu thì hỏi lại.
- Dưới 1024 px hai ô thành hai thẻ; dưới 768 px khung phủ toàn màn (`docs/ai-ux.md` mục 11).
- Chữ người nhập mang `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `DetailSheet` cỡ `kara`, `KaraDock`, `KaraDockHeader/Body/Footer` | dùng | khung hai ô của `docs/ai-ux.md` mục 11 |
| `KaraProposal` `card`, `KaraProposalGroup`, `KaraState`, `ProposedChangeReceipt` | dùng | luật đề xuất, nhãn, trạng thái của Kara |
| `Textarea` `composer`, `InputGroup`, `Item`, `Progress`, `StatusIndicator`, `ConfirmDialog`, `Tabs` | dùng | dòng tài liệu, ô số, khối Chất lượng, hỏi lại, hai thẻ |
| ô «dòng tài liệu» hai cỡ chữ | mở rộng `packages/ui` | tên mục tiêu và dòng KR cần thang chữ (design-pass Nhóm 2) |
| ô vật phẩm không nhãn Kara | mở rộng `packages/ui/.../kara/` | `KaraArtifact` luôn gắn nhãn Kara, tài liệu là chữ người (design-pass Nhóm 2) |
| hàm chấm bộ | tạo `packages/validation` | điểm chất lượng một nguồn, dựng trên `kiemOkr` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: không tra mẫu thị trường — khuôn đã chốt bởi `docs/ai-ux.md` mục 11 (khung bản ghi, vật phẩm trái, Kara phải)
và quyết định 09/10 «Soạn OKR thành khung bản ghi»; tài liệu bên trong là một cột cuộn theo thứ tự mục tiêu → KR.
<!-- UX-SPEC-TEMPLATE>>> -->

## Câu hỏi cho Cổng Phạm vi

- **Hỏi-1 — điểm chất lượng.** Máy khuyên: máy chấm theo luật `kiemOkr` cộng hai luật cấu trúc, ngay khi gõ, hiện «N trên
  M điểm đạt», không dấu Kara, chạy cả khi Kara tắt. Lối khác: Kara chấm theo sáu tiêu chí của bộ chấm soạn — chậm vài
  giây mỗi lần, tốn lượt, không cố định giữa hai lần chấm.
- **Hỏi-2 — cuộc soạn cũ.** Máy khuyên: dòng «Soạn cùng Kara» của hộp Thêm mục tiêu đổi thành «Soạn cả bộ» (chế độ Soạn);
  cuộc soạn cũ còn là lối «Nhờ Kara soạn nháp» trong tài liệu khi bộ trống, kết quả «Đưa vào bộ OKR» hiện lại trong tài
  liệu. Lối khác: giữ hai dòng song song trong hộp (năm dòng) — người phải hiểu hai cách soạn.
- **Hỏi-3 — mục tiêu đã công bố trong tài liệu.** Máy khuyên: hiện, chữ sửa được, số khoá. Lối khác: chỉ đọc (sửa chữ
  phải sang ngăn) · không hiện (tài liệu không còn là «cả bộ»).
- **Hỏi-4 — chip góp ý ở ngăn theo dõi.** Máy khuyên: mở chế độ Soạn ở đúng mục tiêu. Lối khác: mở góp ý tại chỗ trong một
  hộp nổi — khối góp ý quay lại chỗ theo dõi, hai nơi quyết cùng một đề xuất (bản mẫu `ST-ngan-chip-mo-tai-cho`).
- **Hỏi-5 — lời dặn Kara (luật 24 của đợt).** Máy khuyên: không đổi lời dặn — góp ý đọc từng mục tiêu bằng lời dặn hôm nay;
  chốt ngay để M5 đo MH4, MH2. Lối khác: thêm khối «đọc cả bộ» vào lời dặn (Kara thấy các mục tiêu anh em) — M5 chờ
  vòng này gộp, bộ chấm phải đo lại.
- **Hỏi-7 — lưu và công bố** (thêm sau phản biện context sạch). Máy khuyên: dòng đủ chữ tự lưu thành mục tiêu nháp thật;
  hộp công bố có ô tích từng mục tiêu, mặc định tích hết. Lối khác: giữ dòng ở trình duyệt tới lúc công bố (đồng đội không
  thấy nháp dở, nhưng đóng thẻ hay đổi máy là mất chữ) · công bố tất cả không chọn (khoá nhầm khởi điểm của mục tiêu nháp
  dở có sẵn).
- **Hỏi-8 — người phụ trách mặc định** (thêm sau phản biện context sạch). Máy khuyên: trưởng đơn vị của bộ, không có trưởng
  thì người soạn. Lối khác: người soạn (sai khi quản trị soạn hộ — KR không vào «Của tôi» của trưởng đơn vị) · để trống
  bắt chọn ở mỗi KR (vượt ngưỡng 3 bấm). `CONTEXT.md`: trưởng đơn vị không tự thành người phụ trách mọi KR.
- **Hỏi-6 — thước của sáu hồ sơ đã ký đo khối Kara cũ.** Máy khuyên: ô đo khối Kara của ngăn theo dõi khai
  `superseded_by: che-do-soan-bo-okr#AC-7` (khuôn luật 21), mỗi hồ sơ một dòng sổ `fix` mang `decided_by` chủ kho và đo
  hai chiều. Lối khác: giữ khối Kara cũ sau chip dạng mở rộng — thước cũ còn xanh nhưng ngưỡng «chỉ còn một chip» không
  đạt.

## Ngoài phạm vi

- Kara viết nháp ngay trong cột bên của chế độ Soạn (hợp nhất cuộc soạn vào tài liệu).
- Sửa số của mục tiêu đã công bố trong tài liệu; kéo thả đổi thứ tự; dán nhiều dòng một lần; căn chỉnh («Góp vào») trên
  dòng tài liệu.
- Điểm chất lượng ở màn khác (Bộ OKR, Sức khoẻ).
