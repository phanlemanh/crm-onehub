# Góp ý của Kara đặt đúng chỗ — design

Ngày: 2026-10-03 · Hồ sơ: `_acceptance/gop-y-dung-cho/` · Cổng Đáng: build (Manh Phan, 01/10)
· Bản mẫu: `/proto/gop-y-dung-cho` (13 trạng thái, dựng lại 03/10 trên bảng Mục tiêu–KR và
thành phần Kara của #235).

## Vì sao

`OkrDeXuat` giữ góp ý của Kara theo Mục tiêu với `trangThai = "cho"`, nhưng hôm nay chỉ
người bấm «Sửa» mới thấy chúng, trong một cột cạnh form: góp ý về KR nằm trong hộp không có
KR nào, form cần «Lưu» còn cột thì «Nhận là ghi ngay», và câu hỏi «thiếu KR đối trọng» nói lại
cảnh báo cố định `CanhBaoDoiTrong`. Câu hỏi của phép đo (từ `opportunity.md`): góp ý có được
quyết thay vì nằm im không. SỐNG: 30 ngày sau khi lên, dưới 30% góp ý còn `cho` quá 7 ngày, và
tỉ lệ bỏ qua của góp ý về KR không cao hơn góp ý về Mục tiêu quá 15 điểm.

## Đã chốt

| Mã | Chốt | Ai, khi nào |
| --- | --- | --- |
| A | «Kara · N góp ý» trên hàng Mục tiêu ở «Của tôi» và «Theo đơn vị»; bấm mở khung chi tiết và cuộn tới góp ý đầu | chủ kho, 01/10 |
| B | Khung chi tiết Mục tiêu là chỗ quyết góp ý: nhóm Kara ở đầu danh sách KR, góp ý từng KR neo ngay dưới hàng KR, nhận xong thu thành biên nhận có Hoàn tác, dấu «theo Kara» sau tên KR | chủ kho, 01/10 |
| C | Hộp Sửa KR **cũng** bỏ cột, chỉ còn dòng dẫn như hộp Sửa mục tiêu | chủ kho, 03/10 |
| D | Bộ lọc «Góp ý của Kara → Có góp ý chờ» ở «Theo đơn vị» vào lượt này | chủ kho, 03/10 |
| E | Gộp hai hạt giống `the-gop-y-cot-cuon-rieng`, `the-gop-y-sua-nhanh`; phần còn sống sau khi bỏ cột thành AC, hai hồ sơ đóng | chủ kho, 03/10 |
| F | `ProposedChange` trả focus sau Esc/Huỷ/Nhận/Hoàn tác | chủ kho, 03/10 (design-pass Nhóm 2 #1) |
| G | `ProposedChange` inline thừa cỡ chữ của bề mặt chứa | chủ kho, 03/10 (#2) |
| H | Nút lặng («Bỏ qua») của `inline` nằm sát nhóm nút chính | chủ kho, 03/10 (#3) |
| I | Thành phần dấu «theo Kara» (`KaraTrace`) trong `packages/ui/components/kara.tsx` | chủ kho, 03/10 (#4) |
| J | Đề xuất viết lại giữ diff (tên cũ gạch) dù neo ngay dưới hàng — giữ luật 5 | chủ kho, 03/10 (#5) |

## Kiến trúc

### API (`apps/api/src/okr`, không đổi schema)

- **`soGopYCho` trên `mucTieuOutput`.** Mọi đường trả danh sách Mục tiêu (`okr.mine`,
  `okr.danhSach`) điền nó bằng **một** `groupBy` trên `okrDeXuat` cho cả trang
  (`objectiveId in [...]`, `nac: "bat"`, `trangThai: "cho"`, `cuocSoanId: null`), không gọi
  riêng từng Mục tiêu. Luật đếm là luật của `troLyDanhSach`, rút thành hàm dùng chung chứ
  không viết lại:
  - đơn vị của Mục tiêu phải ở nấc `bat` (`nacCuaDonVi`), không thì 0;
  - `tapDuocDoc` của người xem: sửa được đơn vị → mọi dòng; không → chỉ dòng gắn KR người đó
    `ghiDuocKr`; không sửa được gì → 0 (người chỉ xem không thấy chip);
  - bỏ dòng viết-lại đã hết hiệu lực — `giaTriHienTai(mt, hang) !== hang.truoc` — bằng chính
    hàm của `packages/db/src/okr-de-xuat.ts`, xuất ra thay vì chép.
  `kiemLai` (kiểm lại bằng `kiemDongDeXuat`) không chạy ở đếm: số trên chip có thể lớn hơn số
  hiện khi mở khung; mở khung chạy `troLyDanhSach`, dòng hết hạn bị đánh `het-han`; hook của
  khung so số dòng `troLyDanhSach` trả (mọi dòng nó trả đều là chờ; biên nhận trong phiên không
  tính) với `soGopYCho` của Mục tiêu đó trong cache danh sách và, khi
  lệch, gọi `cache.okr(objectiveId)` — chip khớp lại ngay sau lần mở đầu (AC-3).
- **Mặt lọc `gopY`.** `locDanhSach` thêm `gopY: ["cho"]` (một giá trị); `okr.danhSach` lọc
  Mục tiêu có `soGopYCho > 0` **trước** khi đếm `total`; `facetCounts.gopY` đếm như ba mặt
  sẵn có. URL: `gopYOkr` qua `SEARCH_PARAM.okr`.
- **Không thủ tục mới.** Nhận/sửa/bỏ qua đi `troLyQuyet` như hôm nay; «Bỏ qua» của dòng viết
  lại là cách `bac`, của câu hỏi là `bo-qua`. Hoàn tác là `updateKeyResult`/`updateObjective`
  về `truoc` như `cot-gop-y.tsx` đang làm. Bỏ qua không có Hoàn tác (luật 6 chỉ đòi «nhận thì
  lùi được»; lùi bỏ qua cần thủ tục mới — Out of scope).

### App

- **`krTheoKara(trail)`** sống ở `packages/validation/src/okr-theo-kara.ts` (hàm thuần trên kiểu
  vết đã parse): trả tập KR mà lần đổi tên cuối cùng có `note` bắt đầu `tro-ly-okr:`. App dùng
  nó cho dấu «theo Kara»; bài kiểm API dùng chính nó trên vết thật đọc từ CSDL.
- **Hook `useGopYMucTieu`** (`okr/gop-y-kara.ts`) thay `useGopY` của `cot-gop-y.tsx`: giữ
  `troLySanSang`, `troLyDanhSach` (kèm hỏi lại khi `dangSoan`), `troLyDeXuat`, `troLyQuyet`,
  khoá một-quyết-một-lúc (`dangQuyet`) và hoàn tác; **nhóm** dòng theo chỗ neo:
  `capBo` (câu hỏi không gắn KR, căn chỉnh, viết lại tên Mục tiêu), `viSao` (viết lại
  `whyNow`), `theoKr: Map<krId, dòng[]>`. Không `useEffect` dựng trạng thái suy được.
- **`ObjectiveSheet` tự dựng `diemCam` Kara.** Không ai truyền `diemCam` từ ngoài
  (record-stack mở khung trần); khung gọi hook rồi dựng `duoiKr` (đề xuất `inline` + biên
  nhận), `sauTenKr` (`KaraTrace` khi lần đổi tên cuối của KR trong `mt.trail` mang
  `note` `tro-ly-okr:` — hàm thuần `krTheoKara(trail)`), và đặt nhóm Kara ở đầu khu KR
  (trước `BangKr`, không phải điểm cắm của bảng). `hoiDoiTrong` thành `false` khi Kara có câu
  hỏi `thieu-doi-trong` đang chờ (luật 5: giữ một). Không đổi bố cục `BangKr`/`SimpleTable`.
- **Chip danh sách** là `nhanMucTieu` truyền từ `cua-toi.tsx` và `theo-don-vi.tsx`:
  `Button` viền cỡ `xs` bọc `KaraMark`, `stopPropagation`, mở khung bằng `useOpenRecord` và
  đặt cờ `neoGopY` một-lần trên URL; khung đọc cờ, cuộn nhóm Kara vào tầm nhìn
  (`prefers-reduced-motion` → không trượt), rồi xoá cờ — mở khung kiểu khác không cuộn (U7).
- **Hai hộp Sửa** bỏ `CotGopY`, `NutGopY`, `chiO`/`oDuocChi`, cỡ `assist` và `SheetBody
  split`; khi `soGopYCho > 0` (hộp Mục tiêu) hay KR có góp ý chờ (hộp KR) form mở đầu bằng
  một `Item` dòng dẫn: `KaraMark` «N góp ý chờ», mô tả một dòng, nút «Xem góp ý» bọc
  `SheetClose` (bộ giữ thay đổi chặn khi form còn chữ) rồi mở khung chi tiết với `neoGopY`.
  `cot-gop-y.tsx`, `the-gop-y.tsx`, `the-gop-y-props.ts` hết người dùng thì xoá.
- **Chữ:** `okrGopYMessages` đổi «Trợ lý OKR» thành «Kara» ở mọi chuỗi còn dùng, gồm
  `vet.theoTroLy` → «theo đề xuất của Kara» (tab Vết). Mọi chữ mới qua `lib/messages`.

### `packages/ui`

- `ProposedChange`: dòng biên nhận là `proposed-change-receipt` (phần tử bao, E11, E15, E21 cùng
  dùng); chữ bên trong giữ slot `proposed-change-decided` vì `nen-kara` (đã ký) đo nó — E21 quét cả
  cây con nên lớp cỡ chữ ở tầng trong cũng bị bắt. (F) focus — Esc/Huỷ trong ô sửa → nút «Sửa»; vừa quyết (có `decided`) →
  nút «Hoàn tác» của biên nhận nếu có, không thì chính dòng biên nhận (`tabIndex=-1`); bấm
  Hoàn tác → chính dòng biên nhận, nay đọc «Đã hoàn tác» (đề xuất không hiện lại: dòng
  `OkrDeXuat` đã là `nhan`, nhận lần nữa không có nghĩa); (G) `inline` bỏ `text-sm` cố định ở thân và biên nhận,
  thừa cỡ chữ cha; (H) `inline` không đẩy nút lặng sang `ms-auto`.
- `kara.tsx`: (I) `KaraTrace` — dấu tia sáng + chữ «đổi theo Kara», `text-muted-foreground`
  `text-xs`, mô tả cho trình đọc màn hình («Tên này đổi theo đề xuất của Kara»).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: danh sách «Theo đơn vị» → thấy «✦ Kara · 3 góp ý» trên hàng Mục tiêu → bấm → khung
  chi tiết mở ở tab KR, cuộn tới nhóm Kara → «Đổi tên KR» dưới KR1 → biên nhận «Đã đổi tên KR
  theo Kara · Hoàn tác», tên KR mới mang «theo Kara», nhãn còn «Kara · 2 góp ý chờ» (điểm
  ra: đóng khung; chip trên danh sách còn «2 góp ý»).
- Biên: người chỉ sửa được một KR thấy chip đếm đúng góp ý của KR đó; người chỉ xem không
  thấy chip; đơn vị chưa bật Kara → không chip, khung hiện `CanhBaoDoiTrong` như hôm nay;
  lọc «Có góp ý chờ» khi không Mục tiêu nào có → `KhongKhop` sẵn có.
- Lỗi & quay lại: `troLyQuyet` trả 409 (giá trị đã đổi) → làm mới danh sách, đề xuất cũ biến
  mất; lỗi khác → `FieldError` dưới đề xuất, nút mở lại; Kara chưa đọc được → `Empty` «Kara
  chưa đọc được Mục tiêu này» + «Thử lại»; nhận nhầm → «Hoàn tác».

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Danh sách «Của tôi», «Theo đơn vị» | biết Mục tiêu nào có góp ý chờ | trang OKR / khung chi tiết |
| Khung chi tiết Mục tiêu, tab KR | quyết từng góp ý tại chỗ nó sửa | chip, tên Mục tiêu, dòng dẫn hộp Sửa / danh sách |
| Hộp Sửa mục tiêu, hộp Sửa KR | sửa form; biết có góp ý và sang chỗ quyết | menu Sửa / khung chi tiết |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-a-danh-sach | danh sách | chip «✦ Kara · N góp ý» trên hàng có N > 0 | bấm chip |
| ST-a-loc | danh sách | Lọc (1), chỉ Mục tiêu có góp ý chờ, «Bỏ lọc» | bấm chip / bỏ lọc |
| ST-b-chi-tiet | khung | nhãn «Kara · N góp ý chờ · Vì sao?», câu hỏi cấp bộ KR, đề xuất neo dưới KR | Đổi tên KR / Sửa / Bỏ qua / lối đi tiếp |
| ST-b-bien-nhan | khung | «Đã đổi tên KR theo Kara · Hoàn tác», «theo Kara» sau tên; bỏ qua → dòng mờ nói nội dung | Hoàn tác / quyết tiếp |
| ST-b-chua-goi | khung | `KaraMark` + một câu + «✦ Nhờ Kara góp ý» | nhờ Kara |
| ST-b-dang-doc | khung | `ThinkingIndicator` «Kara đang đọc Mục tiêu này…» | chờ |
| ST-b-rong | khung | `Empty` «Kara không thấy chỗ nào cần sửa» + đọc lúc + «Nhờ Kara đọc lại» | đọc lại sau khi sửa |
| ST-b-loi | khung | `Empty` «Kara chưa đọc được Mục tiêu này» + «Thử lại» | thử lại |
| ST-b-het-luot | khung | nút khoá + `FieldDescription` nói khi nào mở lại | chờ |
| ST-b-tat | khung | không nhóm Kara; `CanhBaoDoiTrong` như hôm nay | — |
| ST-b-hop-sua | hộp Sửa mục tiêu | dòng dẫn «Kara · N góp ý chờ · Quyết ngay dưới từng KR · Xem góp ý»; không cột | Xem góp ý / sửa form |
| ST-b-hop-sua-kr | hộp Sửa KR | dòng dẫn cho KR đó; không cột | Xem góp ý / sửa form |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Một quyết định đang gửi thì mọi nút của mọi đề xuất khác trong khung khoá; xong thì mở.
- Focus: Esc/Huỷ khi sửa tại chỗ → «Sửa»; nhận → «Hoàn tác»; Hoàn tác → dòng biên nhận, nay
  đọc «Đã hoàn tác — tên KR trở lại «…»»; Esc trong ô sửa không đóng khung.
- Cuộn tới nhóm Kara chỉ khi vào từ chip/dòng dẫn (cờ `neoGopY` một lần); giảm chuyển động thì
  nhảy, không trượt; mở khung kiểu khác không cuộn.
- 375 px: không tràn ngang; cột Phụ trách/Tiến độ của bảng KR ẩn dưới `sm`, đề xuất chiếm trọn
  bề rộng hàng.
- Chữ người nhập (tên KR, giá trị đề xuất) mang `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `KaraMark`, `KaraLabel`, `ThinkingIndicator`, `Empty`, `Item`, `DataTableFacetMenu` | dùng | có sẵn, đúng luật Kara và bộ lọc kho |
| `ProposedChange` | mở rộng | focus, cỡ chữ inline, chỗ nút lặng (F, G, H) |
| `KaraTrace` | tạo (trong `kara.tsx`) | luật 3 cần dấu «theo Kara», chưa có thành phần (I) |
| chip danh sách | ghép (`Button` viền `xs` + `KaraMark`) | không cần biến thể mới |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: khu OKR đã là danh sách → khung chi tiết; Quantive Results đặt gợi ý KR của AI ngay
trong khung chi tiết Mục tiêu với nút thêm tại chỗ (help.quantive.com, «Suggested Key Results
in the Objective Details view») — rút: quyết tại khung chi tiết, không ở hộp sửa.
<!-- UX-SPEC-TEMPLATE>>> -->

## Đường đo

Vòng này không đổi cột nào của `OkrDeXuat`; mọi quyết định trên màn mới đi qua `troLyQuyet`
nên `trangThai` và `quyetLuc` vẫn được ghi (AC-7, AC-8). Hai thước của `opportunity.md` đọc
thẳng từ bảng (model `OkrDeXuat` có `@@map("okrDeXuat")`, cột giữ tên trường), `:ngay_len` là ngày lên
production:

```sql
-- SỐNG vế 1: % góp ý còn "cho" quá 7 ngày, trong số góp ý đã đủ 7 ngày tuổi
SELECT count(*) FILTER (WHERE "trangThai" = 'cho')::float / nullif(count(*), 0)
FROM "okrDeXuat"
WHERE nac = 'bat' AND "cuocSoanId" IS NULL
  AND "createdAt" >= :ngay_len AND "createdAt" < now() - interval '7 days';

-- SỐNG vế 2: tỉ lệ bỏ qua trên số đã quyết, theo đích (KR hay Mục tiêu)
SELECT ("keyResultId" IS NULL) AS cap_muc_tieu,
       count(*) FILTER (WHERE "trangThai" IN ('bac', 'bo-qua'))::float
         / nullif(count(*) FILTER (WHERE "trangThai" IN ('nhan', 'sua', 'bac', 'bo-qua')), 0)
FROM "okrDeXuat"
WHERE nac = 'bat' AND "cuocSoanId" IS NULL AND "createdAt" >= :ngay_len
GROUP BY 1;
```

```sql
-- Mốc (vế CHẾT): tại thời điểm :ngay_len, % góp ý đã đủ 7 ngày tuổi mà còn nằm im.
-- Chạy trên production NGAY TRƯỚC khi merge; ghi số vào _acceptance/gop-y-dung-cho/moc-nam-im.md.
SELECT count(*) FILTER (
         WHERE "trangThai" = 'cho' OR ("quyetLuc" IS NOT NULL AND "quyetLuc" >= :ngay_len)
       )::float / nullif(count(*), 0)
FROM "okrDeXuat"
WHERE nac = 'bat' AND "cuocSoanId" IS NULL
  AND "createdAt" >= :ngay_len - interval '30 days'
  AND "createdAt" <  :ngay_len - interval '7 days';
```

`OkrDeXuat` không có `updatedAt`, nên dòng `het-han` không có mốc thời gian: chạy truy vấn mốc
sau khi lên sẽ đếm thiếu dòng đã hết hạn sau ngày lên. Vì vậy số mốc phải chụp TRƯỚC khi merge
(bước có tên ở S5), không dựng lại về sau.

## Hồ sơ đã ký bị thay

Lượt này cố ý gỡ thứ mà hồ sơ đã ký đang đo (cột góp ý, thẻ góp ý, cơ chế chỉ ô, chữ «Trợ lý
OKR», cảnh báo đối trọng luôn hiện trong khung). Lưới trước-merge chỉ soi hồ sơ nằm trong diff,
nên các eval đó sẽ đỏ im lặng nếu không khai. Bảng dưới là danh sách thay thế: mỗi dòng một
eval đã ký, nó đo gì, và AC nào của lượt này thay nó. Bộ kiểm `rang/thay-the.mjs` (AC-15) đối
chiếu bảng này với `evals.yaml` của mọi hồ sơ đã ký.

<!-- <<<BANG-THAY-THE -->
| hồ sơ/eval | đo gì | vì sao vỡ | thay bởi |
|---|---|---|---|
| the-gop-y-okr/E1 | màn thật: bấm nhờ góp ý, cột ≥ 360 px, hộp cỡ assist | bỏ cột | AC-12 |
| the-gop-y-okr/E3 | sửa rồi nhận trong thẻ của cột | bỏ cột | AC-7 |
| the-gop-y-okr/E4 | «Mở KR này» từ thẻ câu hỏi | bỏ cột | AC-5 |
| the-gop-y-okr/E5 | thẻ căn chỉnh trong cột | bỏ cột | AC-5 |
| the-gop-y-okr/E6 | chỉ ô (`oDuocChi`, `data-duoc-chi`) | bỏ cơ chế chỉ ô | AC-12 |
| the-gop-y-okr/E7 | phím J/K giữa các thẻ | bỏ cột; J/K không mang sang (Out of scope) | AC-10 |
| the-gop-y-okr/E8 | bấm trong cột không đóng hộp | bỏ cột | AC-12 |
| the-gop-y-okr/E9 | bảng trạng thái của cột | bỏ cột | AC-11 |
| the-gop-y-okr/E11 | màn thật: Nhận/Bác trong cột, bốn khổ | bỏ cột | AC-14 |
| the-gop-y-okr/E13 | màn thật: bố cục cột | bỏ cột | AC-14 |
| the-gop-y-okr/E14 | người chấm nhìn ảnh cột | ảnh cũ mất nghĩa | AC-16 |
| the-gop-y-okr/E15 | design-gate static, danh sách có `cot-gop-y.tsx` | tệp bị xoá | AC-14 |
| the-gop-y-okr/E16 | cỡ hộp assist khi mở cột | bỏ cỡ assist ở hai hộp Sửa | AC-12 |
| tro-ly-okr-de-xuat/E2 | nút «Nhờ Trợ lý OKR góp ý» theo lý do sẵn sàng | nút chuyển vào khung chi tiết | AC-11 |
| tro-ly-okr-de-xuat/E3 | bảng trạng thái của cột, hỏi lại, hoàn tác | bỏ cột | AC-11 |
| tro-ly-okr-de-xuat/E4 | màn thật: nút, cột, Nhận ghi tên và vết | bỏ cột | AC-7 |
| tro-ly-okr-de-xuat/E10 | chữ vết «theo đề xuất của Trợ lý OKR» | đổi chữ thành Kara | AC-7 |
| tro-ly-okr-de-xuat/E29 | design-gate static, danh sách có `cot-gop-y.tsx` | tệp bị xoá | AC-14 |
| va-tro-ly-okr-sau-thu/E11 | mô tả rỗng của cột, hai giọng | bỏ cột | AC-11 |
| va-tro-ly-okr-sau-thu/E12 | «đã quyết hết» đầu cột (cùng `-t chu-nho` với hai ca xu hướng KR) | bỏ cột | AC-11 |
| va-tro-ly-okr-sau-thu/E15 | design-gate static, danh sách có `cot-gop-y.tsx` | tệp bị xoá | AC-14 |
| va-tro-ly-okr-sau-thu/E16 | luật kho đọc 19 tệp, có `cot-gop-y.tsx`, `okr-gop-y.ts` | tệp bị xoá, số tệp đổi | AC-11 |
| khung-tao-okr-nhu-deal/E3 | màn thật năm ngăn, bước nhờ góp ý | bỏ cột | AC-12 |
| khung-tao-okr-nhu-deal/E5 | màn thật năm ngăn, đo cỡ assist | bỏ cột | AC-12 |
| khung-tao-okr-nhu-deal/E6 | chạy lại màn thẻ góp ý | bỏ cột | AC-14 |
| khung-tao-okr-nhu-deal/E7 | cột đóng/mở đổi cỡ hộp, split | bỏ cột | AC-12 |
| khung-tao-okr-nhu-deal/E9 | chạy lại «bấm trong cột không đóng hộp» | bỏ cột | AC-12 |
| khung-tao-okr-nhu-deal/E10 | chạy lại «sửa rồi nhận» | bỏ cột | AC-7 |
| khung-tao-okr-nhu-deal/E11 | «Mở KR này» qua URL từ cột | bỏ cột | AC-5 |
| khung-tao-okr-nhu-deal/E12 | bài cũ của cột vẫn xanh | bỏ cột | AC-15 |
| khung-tao-okr-nhu-deal/E16 | chạy lại màn thật nút nhờ và cột | bỏ cột | AC-7 |
| khung-tao-okr-nhu-deal/E18 | chạy lại eval của the-gop-y-okr và tro-ly-okr-de-xuat | đỏ dây chuyền | AC-15 |
| khung-tao-okr-nhu-deal/E20 | người chấm nhìn ảnh cột trong khung tạo | ảnh cũ mất nghĩa | AC-16 |
| khung-tao-okr-nhu-deal/E24 | màn thật, chỉ đầu cột | bỏ cột | AC-12 |
| nen-kara/E3 | `TheGopY` thật: cột góp ý OKR vẫn là thẻ | bỏ cột | AC-5 |
| nen-kara/E14 | design-gate static, danh sách có `the-gop-y.tsx` | tệp bị xoá | AC-14 |

Không vào bảng vì không vỡ khi vòng này làm đúng việc của nó (máy không đối chiếu các dòng
này; chúng là vết cho người duyệt):

- `apps/app/test/messages-guard.spec.ts` (15 hồ sơ chạy nó): vòng này đổi chữ của
  `okrGopYMessages` nên phải sửa ghim `GHIM_OKR_GOP_Y` cùng lượt — eval của 15 hồ sơ đó
  vẫn xanh (AC-11, E18).
- `soan-okr-cung-tro-ly` E12, E20 và `soan/nut-soan.tsx`: import `dauThangSau` từ
  `cot-gop-y.tsx` — hàm chuyển sang tệp khác trước khi xoá; build và hai bài soạn vẫn xanh.
- `the-gop-y-okr` E2, E10, E12; `nen-kara` E1, E2, E4–E7, E9: dùng `the-gop-y-props.ts`,
  `FactSuggestion` hoặc `confirmation.tsx` — giữ `the-gop-y-props.ts` và khối `thong-tin` của
  `the-gop-y-okr.dom.tsx`.
- `khep-ky-okr` E3: đo cảnh báo đối trọng khi Kara không bật — cảnh báo vẫn hiện (AC-6).
  E4, E7, E13, E14, E15, E22 chạy chung `rang/man-khep-ky.mjs` với E3, cùng lý do.
- `nen-kara` E8: chạy khối `tom-tat` của `nen-kara-man-cu.dom.tsx` — khối giữ nguyên.
- `muc-tieu-va-kr` E14: `ho-so-cham.mjs` chỉ nêu tên `thuoc-cu.mjs` trong mẫu cấm thước
  chạy thước, không chạy nó.

Danh sách miễn của `rang/thay-the.mjs` là các dòng trên cùng `khung-tao-okr-nhu-deal/E23`; script
in từng dòng miễn kèm lý do. Phép quét đọc tệp test/rang ở commit `8d5e174a` (onehub ngay trước
lượt), chỉ trong khối `-t` mà eval chạy, và tính khối đã gỡ ở cây hiện tại là bị thay.
<!-- BANG-THAY-THE>>> -->

Tệp test của kho bị xoá hay viết lại vì xoá thành phần: `tro-ly-okr-gop-y.dom.tsx` (xoá),
`the-gop-y-okr.dom.tsx` (giữ khối `thong-tin`), `khung-tao-okr.dom.tsx` (bỏ `co-ngan`,
`mo-kr-url`), `nen-kara-man-cu.dom.tsx` (bỏ ca cột), `tro-ly-okr-vet.dom.tsx` (chữ Kara),
`khung-gop-y.tsx` (dọn), `khung-soan-okr.tsx` (đường import `dauThangSau`).

## Rủi ro

- **Đếm lệch danh sách mở ra** (kiemLai không chạy ở đếm) — chấp nhận, khớp lại sau lần mở
  đầu (AC-3). Đổi lại: một truy vấn gộp thay vì N lần gọi tác tử kiểm.
- **Người quen bấm Sửa để nhờ góp ý** — mất lối cũ; dòng dẫn trong hộp và nút «Nhờ Kara góp ý»
  trong khung là lối mới. Lái-thử người lạ đo vấp ở đây.
- **`ProposedChange` đổi hành vi focus/cỡ chữ** — `nen-kara` (đã ký) đo thành phần này;
  `nen-kara` nằm trong bảng thay thế ở những eval chạm F/G/H.
