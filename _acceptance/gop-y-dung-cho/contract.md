---
schema_version: 1
feature: Góp ý của Kara ở khu OKR đặt đúng chỗ — «Kara · N góp ý» trên thẻ Mục tiêu, đề xuất neo ngay dưới từng KR ở khung chi tiết với biên nhận có Hoàn tác, hộp Sửa chỉ còn một dòng dẫn sang
slug: gop-y-dung-cho
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-03T13:58:01Z
design_doc: docs/superpowers/specs/2026-10-03-gop-y-dung-cho-design.md
---

# Acceptance Contract: gop-y-dung-cho

## Context

Góp ý của Kara cho một Mục tiêu (`OkrDeXuat`, `trangThai = "cho"`) hôm nay chỉ hiện khi
người bấm «Sửa», trong một cột cạnh form: góp ý về KR nằm trong hộp không có KR, form cần
«Lưu» còn cột «nhận là ghi ngay», và câu hỏi đối trọng lặp cảnh báo cố định. Vòng này đưa
số góp ý chờ lên hàng Mục tiêu ở danh sách (kèm bộ lọc), đặt từng góp ý ngay dưới thứ nó
sửa trong khung chi tiết với biên nhận Hoàn tác, và rút cả hai hộp Sửa về một dòng dẫn. Dựng
trên bảng Mục tiêu–KR (#234, điểm cắm `DiemCam`) và nền Kara (#235). Gộp phần còn sống của
hai hạt giống `the-gop-y-cot-cuon-rieng` và `the-gop-y-sua-nhanh`.

Source input: `_acceptance/gop-y-dung-cho/opportunity.md` (Cổng Đáng 01/10) + ba câu S1 chủ
kho trả lời 03/10 + proto `/proto/gop-y-dung-cho` và `design-pass.md` (duyệt 03/10).

## Criteria

- AC-1: Given đơn vị ở nấc Kara `bat`, một Mục tiêu có 3 dòng `OkrDeXuat` chờ (1 câu hỏi không
  gắn KR, 2 gắn KR) và một Mục tiêu không có dòng nào, người dùng sửa được đơn vị, When mở «Theo
  đơn vị» và «Của tôi», Then hàng Mục tiêu thứ nhất có đúng một chip «Kara · 3 góp ý» (dấu tia
  sáng, không tô màu thương hiệu) bằng `soGopYCho` mà API trả cho đúng id, Mục tiêu thứ hai
  không có chip và không thêm hàng nào; bấm chip (chuột hay Enter) mở khung chi tiết Mục tiêu
  đó ở tab KR, cuộn vùng Kara vào tầm nhìn, và hàng vẫn thu hay mở như trước; mở khung
  bằng cách bấm tên Mục tiêu thì không cuộn. (cross-layer)
- AC-2: Given ma trận viết trước gồm dòng chờ thường, dòng `nac = an`, dòng đã quyết (`nhan`,
  `bac`, `bo-qua`, `het-han`), dòng soạn (`cuocSoanId` khác null), dòng viết lại mà `truoc` đã
  khác giá trị hiện tại, Mục tiêu của đơn vị nấc `an`, và ba người dùng (sửa được đơn vị · chỉ
  sửa được KR2 · chỉ đọc), When gọi `okr.mine` và `okr.danhSach`, Then `soGopYCho` của mỗi
  (Mục tiêu, người dùng) đúng bằng bảng kỳ vọng viết trước, cho cả trang bằng một truy vấn gộp
  chứ không một truy vấn mỗi Mục tiêu. (cross-layer)
- AC-3: Given chip đếm 3 nhưng một dòng viết lại của Mục tiêu đã hết hiệu lực vì tên KR vừa đổi
  tay, When mở khung chi tiết từ chip rồi đóng, không tải lại trang, Then chip trên danh sách
  đếm đúng số góp ý khung đã hiện (2). (cross-layer)
- AC-4: Given «Theo đơn vị» có 5 Mục tiêu, 2 trong đó có góp ý chờ, When chọn «Lọc → Góp ý của
  Kara → Có góp ý chờ», Then chỉ còn đúng 2 Mục tiêu đó, URL mang `gopYOkr=cho`, `total` của
  `okr.danhSach` là 2, mặt lọc ghi «Có góp ý chờ · 2», tải lại trang giữ lọc, «Bỏ lọc» trả đủ
  5; không Mục tiêu nào khớp thì hiện màn «không khớp» sẵn có. (cross-layer)
- AC-5: Given Mục tiêu ở AC-1 (câu hỏi `thieu-doi-trong` không gắn KR, viết lại tên KR1, câu
  hỏi `kr-la-viec` gắn KR3), When mở khung chi tiết, tab KR, Then đầu khu KR có nhãn «Kara · 3
  góp ý chờ» với nút «Vì sao?» mở ô nêu Kara đọc gì và đọc lúc nào; câu hỏi không gắn KR nằm
  dưới nhãn đó; mỗi góp ý gắn KR là một `ProposedChange` độ dày `inline` nằm trong hàng
  `data-duoi-kr=<id KR>` ngay sau hàng KR của nó; viết lại hiện tên cũ gạch và tên mới tô nền
  chèn cùng lý do một dòng, nút «Đổi tên KR», «Sửa», «Bỏ qua»; câu hỏi có một lối đi tiếp làm
  được ngay («Thêm KR đối trọng» mở hộp KR mới, «Sửa KR này» mở hộp Sửa KR) cạnh «Bỏ qua»;
  không đề xuất nào bọc `Card` hay `Alert`; góp ý viết lại «vì sao lúc này» nằm ngay dưới khu
  «Vì sao lúc này».
- AC-6: Given một Mục tiêu mà mọi KR đều đẩy một con số lên, When Kara có câu hỏi
  `thieu-doi-trong` đang chờ, Then khung chi tiết không hiện cảnh báo cố định
  `data-canh-bao-doi-trong`; When đơn vị chưa bật Kara, hoặc không có câu hỏi đó đang chờ, Then
  cảnh báo hiện như hôm nay.
- AC-7: Given đề xuất viết lại tên KR1 đang chờ, When bấm «Đổi tên KR», Then `troLyQuyet` ghi
  `nhan`, tên KR1 trên hàng đổi thành tên mới kèm dấu «theo Kara» (`KaraTrace`), đề xuất thu
  thành dòng «Đã đổi tên KR theo Kara · Hoàn tác» tại chỗ, nhãn còn «Kara · 2 góp ý chờ»,
  và tab Vết có dòng sửa tên mang «theo đề xuất của Kara»; When bấm «Sửa», gõ tên khác rồi
  «Đổi tên KR», Then ghi `sua` với đúng chữ đã gõ; When bấm «Hoàn tác», Then tên trở về chữ cũ
  (`updateKeyResult`), dòng đọc «Đã hoàn tác» và dấu «theo Kara» mất; dấu cũng mất khi một
  người sửa tay tên KR sau đó. (cross-layer)
- AC-8: Given một đề xuất viết lại và một câu hỏi đang chờ, When bấm «Bỏ qua» trên từng cái,
  Then `troLyQuyet` ghi `bac` cho viết lại và `bo-qua` cho câu hỏi, và mỗi cái thu thành một
  dòng mờ nói rõ thứ đã bỏ qua — «Đã bỏ qua tên Kara đề xuất: «<tên đề xuất>»», «Đã bỏ qua câu
  hỏi của Kara: <tóm tắt theo mã vấn đề>» — không có nút Hoàn tác, và số chờ giảm. (cross-layer)
- AC-9: Given ba đề xuất đang chờ, When một lần quyết đang gửi, Then mọi nút của hai đề xuất
  kia khoá cho tới khi lần gửi xong; When `troLyQuyet` trả 409 vì giá trị đã đổi, Then danh
  sách làm mới và đề xuất cũ biến mất mà không hiện lỗi nào; When trả lỗi khác, Then lỗi
  hiện ngay dưới đúng đề xuất đó và nút mở lại.
- AC-10: Given một đề xuất `inline` trong khung chi tiết, When sửa tại chỗ rồi nhấn Esc hoặc
  «Huỷ», Then ô sửa đóng, khung không đóng và focus về nút «Sửa»; When nhận, Then focus ở nút
  «Hoàn tác»; When bấm Hoàn tác, Then focus ở dòng biên nhận; trong khung, phím Tab đi qua nút
  «Vì sao?» và mọi nút đề xuất theo thứ tự nhìn thấy.
- AC-11: Given khung chi tiết của một Mục tiêu đơn vị bật Kara, When Kara chưa đọc, đang đọc,
  đọc xong không thấy gì, đọc lỗi, hoặc người đã hết lượt, Then vùng Kara hiện đúng các dòng ST-b-* của design doc (nút «Nhờ Kara góp ý» mang tia sáng là nút gọi Kara duy nhất của khung;
  `ThinkingIndicator` «Kara đang đọc Mục tiêu này…»; `Empty` «Kara không thấy chỗ nào cần sửa»
  + giờ đọc + «Nhờ Kara đọc lại»; `Empty` «Kara chưa đọc được Mục tiêu này» + «Thử lại»; nút
  khoá kèm câu nói khi nào mở lại); When đơn vị chưa bật Kara, Then không có vùng Kara; và trên
  các màn vòng này chạm (hai danh sách, khung chi tiết, hai hộp Sửa, tab Vết) mọi chữ Kara đi
  qua `lib/messages` và không còn chữ «Trợ lý OKR» nào hiện ra.
- AC-12: Given hộp Sửa mục tiêu và hộp Sửa KR, When mở, Then không còn cột góp ý, nút «Nhờ góp
  ý», viền «ô được chỉ» hay cỡ hộp rộng; khi có góp ý chờ, form mở đầu bằng một dòng dẫn
  «Kara · N góp ý chờ» (N của Mục tiêu ở hộp Mục tiêu, của đúng KR ở hộp KR) với nút «Xem góp
  ý»; bấm khi form sạch thì hộp đóng và khung chi tiết mở, cuộn tới vùng Kara; bấm khi form
  còn chữ chưa lưu thì bộ giữ thay đổi hỏi trước; không có góp ý chờ thì không có dòng dẫn; và
  `cot-gop-y.tsx`, `the-gop-y.tsx` không còn trong kho.
- AC-13: Given `ProposedChange` trong `packages/ui`, When `density="inline"`, Then thân đề xuất
  và biên nhận mang cỡ chữ của phần tử cha (đặt trong cha 12 px thì đo 12 px, cha 14 px thì 14
  px), và nút lặng nằm liền các nút chính (không đẩy sang mép); When `density="card"`, Then
  như hôm nay; và `kara.tsx` có `KaraTrace` hiện tia sáng + «theo Kara» kèm mô tả cho trình đọc
  màn hình.
- AC-14: Given khung 375 px và 1440 px, giao diện sáng và tối, When mở danh sách có chip, danh sách
  đã lọc, khung chi tiết khi có góp ý chờ, sau khi quyết và khi Kara không thấy gì, hộp Sửa mục tiêu và hộp Sửa
  KR, Then không màn nào tràn ngang và mọi nút của đề xuất nhìn thấy trọn, không bị cắt.
- AC-15: Given danh sách viết sẵn ở mục «Hồ sơ đã ký bị thay» của design doc, When đối chiếu
  với `evals.yaml` của mọi hồ sơ đã ký, Then mọi eval đã ký đo cột góp ý, thẻ góp ý, cơ chế chỉ
  ô, chữ «Trợ lý OKR» hay cảnh báo đối trọng luôn hiện đều có một dòng trong danh sách nêu AC
  nào của vòng này thay nó, và không dòng nào trỏ tới eval không tồn tại; hai hồ sơ hạt giống
  ghi đã gộp vào `gop-y-dung-cho`; và các eval đã ký không bị thay nhưng chạy tệp vòng này phải
  sửa (`messages-guard.spec.ts`, hai bài soạn OKR dùng `dauThangSau`) vẫn xanh.
- AC-16: Given ảnh khung chi tiết ở 1440 px hai giao diện (có góp ý; sau một lần nhận và một lần
  bỏ qua) và ảnh danh sách có chip, When một người chưa xem proto nhìn, Then họ chỉ đúng góp ý
  nào sửa KR nào, việc bấm nút chính sẽ ghi gì, và Mục tiêu nào trên danh sách còn góp ý chờ.
  (judgment)

## Coverage

Quét bằng `morphological-scan` (preset entity-feature, entity = góp ý `OkrDeXuat` đang chờ).

- Trục A — bề mặt: Của tôi | Theo đơn vị (+ bộ lọc) | khung chi tiết tab KR | hộp Sửa mục tiêu
  | hộp Sửa KR | tab Vết [thước CE: các tệp gọi `useGopY` và `BangMucTieu` hôm nay — SUY-TỪ-REPO:
  `apps/app/app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx`, `hop-thoai-kr.tsx`, `cua-toi.tsx`,
  `theo-don-vi/theo-don-vi.tsx`, `apps/app/components/crm/record-sheet/objective-sheet.tsx`]
- Trục B — loại góp ý × chỗ neo: viết lại tên Mục tiêu | viết lại «vì sao lúc này» | viết lại
  tên KR | câu hỏi không gắn KR | câu hỏi gắn KR | căn chỉnh [thước CE: `dongGopY` — SUY-TỪ-REPO:
  `packages/validation/src/okr-tro-ly.ts`; năm mã vấn đề `kr-la-viec`, `thieu-doi-trong`,
  `khong-do-duoc`, `trung-y`, `muc-tieu-la-so`]
- Trục C — vòng đời một góp ý: chưa gọi | đang đọc | chờ | đang gửi | nhận | sửa rồi nhận | bỏ
  qua/bác | hoàn tác | hết hiệu lực | lỗi ghi (409, khác) [thước CE: `TRANG_THAI_DE_XUAT` —
  SUY-TỪ-REPO: `packages/db/src/okr-tro-ly-danh-muc.ts`; `troLyQuyet` ở `apps/api/src/okr/tro-ly.service.ts`]
- Trục D — người xem × nấc: sửa được đơn vị | chỉ sửa KR | chỉ xem × nấc `bat` | `an` | `tat`
  | hết lượt [thước CE: `tapDuocDoc`, `nacCuaDonVi` — SUY-TỪ-REPO: `docs/api.md` mục OKR]
- Lớp cắt ngang: 375/1440 × sáng/tối (AC-14) · bàn phím và focus (AC-10) · `translate="no"`
  cho chữ người nhập · tiếng Việt qua `lib/messages` (AC-11) · hồ sơ đã ký bị thay (AC-15).
- [NGÀNH: Quantive Results — «Suggested Key Results in the Objective Details view», gợi ý KR
  của AI hiện ngay trong khung chi tiết Mục tiêu, nút «Add this Suggestion» tại chỗ, kèm tab
  «All suggestions»] — ứng viên đã nhận: quyết trong khung chi tiết (AC-5); tab «Tất cả góp ý»
  để Later.
- [NGÀNH: cận kề — chế độ «Suggesting» của Google Docs, «suggested changes» trong review
  GitHub] — diff tại chỗ ngay dưới dòng nó sửa, nhận một chạm (AC-5, AC-7).
- Core: ô (Theo đơn vị/Của tôi × chờ × sửa được đơn vị), (khung × mọi loại góp ý gắn chỗ neo
  × chờ/nhận/bỏ qua/hoàn tác), (hai hộp Sửa × chờ), (người xem × nấc ở API).
- Later: tab «Tất cả góp ý» trong khung; lùi một lần bỏ qua (cần thủ tục mới); chip trên
  «Toàn cảnh» và cây căn chỉnh; góp ý chờ trên thẻ KR ở «Việc của tôi».
- Never: Kara tự ghi khi người chưa bấm — trái luật 4; số góp ý lưu riêng một cột — trái luật 6.
- [GIẢ ĐỊNH] Người phụ trách mở khung chi tiết từ danh sách đủ thường để chip + khung thay được
  cột trong hộp Sửa — giả định chốt sinh tử của `opportunity.md`, đo ở Cổng Giá trị.

## Đường đo

- Thước: % góp ý còn `cho` quá 7 ngày, 30 ngày sau khi lên · số từ: bảng `OkrDeXuat`
  (`createdAt`, `trangThai`, `quyetLuc`, `nac = bat`, `cuocSoanId IS NULL`) — truy vấn ở design
  doc mục «Đường đo» · bảo đảm bởi: đã có sẵn: `OkrDeXuat` (vòng này không đổi cột nào; AC-7,
  AC-8 bảo đảm mỗi quyết định trên màn mới đi qua `troLyQuyet` nên vẫn ghi `trangThai`,
  `quyetLuc`).
- Thước: tỉ lệ bỏ qua của góp ý về KR so với về Mục tiêu · số từ: `OkrDeXuat.trangThai in (bac,
  bo-qua)` chia theo `keyResultId IS NULL` · bảo đảm bởi: AC-8 (bỏ qua ghi đúng `bac`/`bo-qua`
  cho cả hai loại).
- Thước: mốc nằm im tại ngày lên (vế CHẾT) · số từ: truy vấn mốc ở design doc mục «Đường đo»
  chạy trên production NGAY TRƯỚC khi bấm merge, số ghi vào
  `_acceptance/gop-y-dung-cho/moc-nam-im.md` (ngày, số dòng, tỉ lệ) — `OkrDeXuat` không có
  `updatedAt` nên dòng `het-han` không dựng lại được trạng thái tại ngày lên sau khi đã lên ·
  bảo đảm bởi: bước có tên ở S5 trước khi mời bấm merge; ngữ nghĩa truy vấn mốc (dòng tạo trước
  ngày lên, quyết sau ngày lên vẫn tính là chờ) bảo đảm bởi AC-8 (E12).

## Out of scope

- Lùi một lần «Bỏ qua» — cần thủ tục API mới; bỏ qua để lại dòng mờ, không Hoàn tác.
- Tab «Tất cả góp ý» trong khung chi tiết, và chip trên «Toàn cảnh», cây căn chỉnh, «Việc của
  tôi».
- Đổi bố cục `BangMucTieu`, `BangKr`, `SimpleTable` — vòng này chỉ cắm qua `DiemCam` và khu KR
  của `ObjectiveSheet`.
- Chế độ ẩn (`nac = an`) và trang số đo quản trị (`troLyAn`, `troLySoDo`) — không đổi.
- Phím J/K chuyển giữa các thẻ của cột cũ — trong khung chi tiết đi bằng Tab theo thứ tự nhìn
  thấy (AC-10).
- Đổi chữ «Trợ lý OKR» ở Cài đặt › Chương trình OKR, «Soạn OKR cùng Trợ lý» và tóm tắt tuần —
  lượt `tu-vung-tac-tu`.
- Chạy `kiemDongDeXuat` khi đếm chip — chip có thể lệch trước lần mở khung đầu (AC-3 bảo đảm
  khớp lại sau lần mở).
- Ghim lại các hồ sơ đã ký trong danh sách thay thế — chúng là sử liệu; AC-15 chỉ bảo đảm mọi
  eval bị thay có tên và có AC thay.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry
> `descope` trong `decisions.jsonl`.

## Notes

- Hạt giống gộp vào lượt này (chủ kho 03/10). Tự hết vì không còn cột: U2, U3, U10
  (`the-gop-y-cot-cuon-rieng`); L1, L3, U1 (`the-gop-y-sua-nhanh`). Thành AC: L2 → AC-10; U4,
  U6 → AC-8; U7 → AC-1 và AC-12 (chỉ cuộn khi vào từ chip/dòng dẫn); Ngoài-9 → AC-9.
- Năm quyết định design-pass Nhóm 2 (chủ kho 03/10): focus → AC-10; cỡ chữ inline và nút lặng
  → AC-13; `KaraTrace` → AC-7, AC-13; giữ diff tên cũ (luật 5) → AC-5.
- Bậc «Vẽ tay là bậc cuối»: chip dừng ở bậc 1 (`Button` + `KaraMark`); đề xuất, biên nhận,
  nhãn ở bậc 1 (`ProposedChange`, `KaraLabel`); `KaraTrace` ở bậc 5 (tạo mới trong
  `packages/ui`) — đã tra bậc 1–3: `kara.tsx` chỉ có `KaraMark`/`KaraLabel`; shadcn không có
  dấu nguồn; ReUI (`mcp__reui__search`, 03/10) câu «AI generated provenance mark badge inline
  "suggested by AI" label», chỉ ví dụ miễn phí → khớp yếu, chỉ ra badge/label chung
  (`c-label-8`, `c-badge-1`, `c-tooltip-15`), không có dấu nguồn AI.

### Known limits (Cổng Bằng chứng, 2026-10-04)

- Ngoài-1: bấm «Nhờ Kara» rồi đóng khung trước khi Kara đọc xong thì chip «Kara · N góp ý» trên
  danh sách giữ số cũ tới khi quay lại trang hoặc mở lại khung.
- Ngoài-2: bài dong-bo không phân biệt làm mới số góp ý lúc Kara đọc xong với lúc Kara vừa bắt
  đầu đọc (fixture trả số 2 ngay ở bản «đang soạn»).
- Ngoài-3: ca làm mới sau khi Kara đọc xong trong khung chỉ kiểm chip danh sách, không kiểm
  «Của tôi» và dòng dẫn hộp Sửa.
- Ngoài-4: «Thử lại» trong khối lỗi xám đi mà không nói lý do khi nút Kara đang khoá hoặc ẩn
  (hết lượt trong ngày, tính năng tạm nghỉ).
- Ngoài-5: 4/12 ô ma trận E3 kỳ vọng null — số góp ý chờ cho người chỉ đọc và Mục tiêu đơn vị
  khác chỉ đo «không có trong okr.mine», không đối chiếu `soGopYCho`.
- Ngoài-8: `bang-vet.tsx` vẫn viết cứng tiền tố «tro-ly-okr:» thay vì dùng `TIEN_TO_VET_KARA`.
- Ngoài-10: vùng đã mang nhãn Kara có thêm một dấu `AiGenerate` trên nút gọi Kara.
- Ngoài-12: `tomTatCua` ép kiểu `as keyof` — mã vấn đề mới quên câu tóm tắt sẽ hiện lý do thô
  không cảnh báo.
- Ngoài-16: hai lần Hoàn tác liên tiếp rất nhanh trên hai KR dùng chung một mutation có thể làm
  KR đầu vẫn hiện «Hoàn tác» và mất lỗi của lần đầu.
- Ngoài-17: ca quá hạn trong `gop-y-dung-cho-ra-soat.tsx` trả `setSystemTime` trong
  try/finally, không ở `afterEach`.
- Ngoài-18: hai hàm chờ cục bộ chép `cho()` dùng chung; `choLau` 8000 ms dài hơn trần mặc định
  của bun nên hỏng thì chỉ báo hết giờ chung chung.
- Ngoài-19: `docLai` chép nguyên điều kiện «dang-doc»/«loi» của `noiDung` — đổi một chỗ mà quên
  chỗ kia thì hai màn hiện hai trạng thái khác nhau.
