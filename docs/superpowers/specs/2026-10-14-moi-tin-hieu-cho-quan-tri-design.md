# Mọi tín hiệu cho quản trị — thiết kế (TH4)

Ngày 14/10/2026 · hồ sơ `_acceptance/moi-tin-hieu-cho-quan-tri/` · hàng TH4 của `docs/plan/lo-trinh-okr.json`
· Cổng Đáng `build` 14/10 · hạng T2 · đứng trên LT2 (`_acceptance/gui-tin-hieu-trong-crm/`).

## Câu giao và luật đã chốt

«Quản trị mở thẻ Tất cả của trang Tín hiệu và thấy ai đã gửi, phòng ban nào, từ màn nào, đang ở đâu, cùng ba
con số của ngưỡng sống».

Luật riêng tư chủ kho chốt 14/10 (`ghi_chu` của hàng TH4): «quản trị (chủ, quản trị) thấy tên người gửi; hộp gửi
báo trước «Quản trị CRM thấy tên bạn cùng tín hiệu này»; người khác vẫn chỉ thấy tín hiệu của mình; tệp tín hiệu
trong git vẫn không mang danh tính. Thẻ con «Của tôi · Tất cả» trên cùng trang, cùng quyền với lệnh kéo về.»

Ngưỡng chốt ở Cổng Đáng: ngày 12/11 chủ kho đọc ba con số trên thẻ Tất cả mà không chạy lệnh; lệnh kéo về chạy
ngay sau đó ra đúng ba số ấy.

## Hiện trạng (đo trên `762acca38`)

- Bảng `tinHieu` đã cất `nguoiGuiId` (rỗng khi tài khoản bị xoá), `phongBanId` (phòng ban chính lúc gửi, rỗng khi
  chưa có hay đã lưu trữ), `man`, `guiLuc`, `keoVeLuc`. Không cần thêm cột → vòng không chạm `packages/db`.
- API `tinHieu` (phạm vi chung): `gui`, `cuaToi` (lọc theo người gọi), `xoa`, `keoVe` (chỉ `laQuanTriWorkspace`,
  có tác dụng phụ đóng dấu kéo về — thẻ Tất cả không được dùng lại nó).
- Trang `/[slug]/tin-hieu`: server page đọc `cuaToi` và bản vẽ `LO-TRINH.html` của bản đã dựng, tính trạng thái
  từng mã bằng `docTrangThaiTinHieu`, giao cho danh sách khách.
- Ba con số chỉ có trong `tongKet()` của `scripts/tin-hieu/keo-ve.ts`: khoá phòng ban là TÊN phòng ban (phản hồi
  kéo về chỉ mang tên), tuổi tính từ `luc` của tệp (= `guiLuc`), «đã có chỗ» là bản ghi `tin_hieu` của bản vẽ có
  `cho ≠ chua-gom`. Lệnh đếm trên MỌI tín hiệu máy chủ trả về lúc kéo, không chỉ tín hiệu mới.

## Thiết kế

### 1. Một hàm đếm cho trang và lệnh

Rút phần đếm của `tongKet()` thành hai hàm thuần trong `packages/validation/src/tin-hieu.ts`:

```ts
type DongDem = { id: string; luc: string; phongBan: { khoa: string; ten: string } | null };
type NguongSong = {
  trongKy: number; soPhong: number; theoPhong: [string, number][]; khongPhong: number;
  quaHan: number; chuaCoCho: number;
};
demNguongSong(ds: DongDem[], now: Date, coCho: ReadonlySet<string>): NguongSong
coChoSauGom(kq: KetQuaDuong): Set<string>
dongDemTuKeoVe(tep: KeoVeOutput["tep"]): DongDem[]
dongDemTuTatCa(rows: TatCaRow[]): DongDem[]
```

`tongKet()` của lệnh gọi `demNguongSong` rồi chỉ định dạng chuỗi — các dòng in ra giữ nguyên từng byte (ca
`tong-ket` của LT2 vẫn xanh mà không sửa). Trang gọi cùng hàm, cùng tập «đã có chỗ» rút bằng `coChoSauGom`.
Hai số 30 và 7 vẫn chỉ ở `TIN_HIEU`.

**Khoá phòng ban là MÃ phòng ban** (sổ quyết định dòng thay dòng 3): phản hồi kéo về thêm trường tuỳ chọn
`phongBanId` cạnh `phongBan` (tên); `dongDemTuKeoVe` lấy khoá = mã khi có, = tên khi vắng (tệp kéo về đời LT2);
`dongDemTuTatCa` lấy khoá = mã. Hai phòng ban trùng tên được đếm là hai. Dòng theo phòng ban của lệnh vẫn in
tên. Hai bộ ánh xạ sống cạnh hàm đếm để test API gọi được đúng đường ánh xạ thật của cả hai phía.

### 2. API `tinHieu.tatCa`

Query mới, không input, cùng router, cùng middleware phạm vi chung (vai «chỉ OKR» vào tới thủ tục rồi bị từ chối
ở câu kiểm vai — `vai-chi-okr.spec.ts` thêm tên thủ tục vào danh sách phạm vi chung).
`laQuanTriWorkspace(role)` sai → `ForbiddenException` (cùng câu kiểm với `keoVe`). Chỉ đọc: không đổi `keoVeLuc`.
Trả mọi tín hiệu, mới nhất trước:

```
{ rows: { id, so, ma, tieuDe, muonLam, man, guiLuc, daKeoVe,
          nguoiGui: { id, ten } | null, phongBan: { id, ten } | null }[] }
```

Không trả thư điện tử hay ảnh của người gửi. REST `GET /tin-hieu/tat-ca`. Nhật ký chỉ ghi `userId` và số dòng.

Không phân trang ở máy chủ — câu hỏi cho chủ kho ở Cổng Phạm vi: luật `docs/api.md` «Filter, sort and paginate in Prisma… Never filter a
whole table in the browser» va với hai sự thật của việc này: trạng thái để lọc sống ở bản vẽ `LO-TRINH.html` của
bản dựng chứ không ở cơ sở dữ liệu, và ba con số cần mọi dòng. Khuyến nghị: lọc và chia trang ở trình duyệt như
trang Lộ trình, ghi ngoại lệ có tên vào `docs/api.md` mục Tín hiệu kèm điều kiện mở lại (số tín hiệu vượt vài
trăm — ngưỡng LT2 là 20 một tháng).

### 3. Hai thẻ con là hai đường dẫn

- `/[slug]/tin-hieu` — thẻ «Của tôi» (trang hiện có, giữ tiêu đề «Tín hiệu đã gửi»).
- `/[slug]/tin-hieu/tat-ca` — thẻ «Tất cả», tiêu đề «Mọi tín hiệu», câu mô tả «Tín hiệu mọi người đã gửi, ai gửi,
  từ đâu và đang ở đâu — chỉ chủ và quản trị CRM thấy trang này.»

Thanh thẻ theo nếp «Thẻ con của trang» của `docs/design.md`: `Tabs` › `TabsList variant="line"` › `TabsTrigger
asChild` bọc `Link`, `aria-current="page"` ở thẻ đang mở, nằm ngay dưới đầu trang. Vai đọc ở server page qua
`workspace.get` (như `[slug]/page.tsx`); thẻ khách chỉ nhận cờ `laQuanTri`.

Người không phải quản trị (câu hỏi cho chủ kho ở Cổng Phạm vi — khuyến nghị): **không thấy thanh thẻ** ở «Của tôi» — trang của họ y như hôm
nay. Mở thẳng `/tin-hieu/tat-ca`: trang giữ tiêu đề, thân là `Empty` nói «Chỉ chủ và quản trị CRM xem được mọi tín
hiệu.» kèm nút về «Tín hiệu đã gửi»; server page không gọi `tatCa`, HTML không mang dữ liệu tín hiệu nào.

### 4. Thẻ Tất cả

Theo đúng nếp trang «Của tôi» của LT2: `tat-ca/page.tsx` dựng tiêu đề, mô tả và thanh thẻ NGOÀI `Suspense`;
trong `Suspense` (fallback khung xương ba ô và các dòng), phần server tải trước `tatCa` (`HydrateClient`), đọc bản
vẽ, tính trạng thái từng mã bằng `docTrangThaiTinHieu` (nguyên hàm, đầu vào là mọi tín hiệu) và ba số bằng
`demNguongSong` — hàm ghép thuần ở `apps/app/lib/tin-hieu/tat-ca.ts`, có test. Thẻ khách đọc `tatCa` bằng
`useQuery` (đã có sẵn từ lượt tải trước) để có lúc lỗi `VungTaiLoi` với «Thử lại» gọi `refetch`, và nhận bản đồ
trạng thái + ba số đã tính.

- **Ba ô số** (`StatGroup` › ba `StatCard`): «Tín hiệu 30 ngày qua» · «Phòng ban có tín hiệu» (trong 30 ngày) ·
  «Quá 7 ngày chưa có chỗ». Mô tả dưới ô 1: «Gồm cả tín hiệu chưa lấy về»; dưới ô 2: «Chưa có phòng ban: n»; dưới
  ô 3: «Trên n tín hiệu gửi quá 7 ngày». Bản vẽ không đọc được → ô 3 hiện «—» kèm «Chưa đọc được trạng thái sau
  gom» (lệnh cũng không đếm được «có chỗ» khi thiếu bản vẽ; trang không in một số 0 giả).
- **Danh sách** (`DataTable`, vì cần lọc): mã · điều đã kể (tiêu đề, dòng phụ «Muốn: …») · người gửi · phòng ban ·
  màn · gửi lúc · trạng thái (nhãn có chấm theo `toneTheoNghia` + câu, cùng nhãn cùng câu thẻ «Của tôi» hiện cho
  cùng mã). Mới nhất trước; chia trang `TIN_HIEU.coTrangTatCa` (50) dòng. Dưới `md`: các cột phụ ẩn theo
  `hideBelow`, dòng vẫn đọc được ở 375 px không cuộn ngang trang.
- **Lọc** (facet của `DataTable`, giá trị lên đường dẫn qua `useTableQuery` + `createListSearchParams`): phòng ban
  (id; «Chưa có phòng ban») · trạng thái (khoá trạng thái, nhãn ngắn) · người gửi (id; «Không còn tài khoản»; tìm
  được). Đếm theo từng giá trị. Lọc ra rỗng → `filteredEmpty` có nút bỏ lọc. Ba ô số KHÔNG đổi theo lọc (chúng là
  ngưỡng của cả CRM).
- **Khoá trạng thái**: `TrangThaiTinHieu` thêm `khoa` (giá trị `cho` của kit, nhóm trạng thái của hàng, hoặc
  `cho-lay-ve`/`cho-gom` của CRM) để lọc không phụ thuộc chữ hiển thị.
- **Thiếu dữ liệu**: người gửi đã bị xoá → «Không còn tài khoản»; không phòng ban → «Chưa có phòng ban» (cùng chữ
  dòng tổng kết của lệnh); bản vẽ thiếu trạng thái → trạng thái CRM kèm dòng báo như LT2.
- Dữ liệu người nhập (điều đã kể, tên người, tên phòng ban, màn) mang `translate="no"`.

### 5. Hộp gửi báo trước

`hop.moTa` thêm câu thứ ba «Quản trị CRM thấy tên bạn cùng tín hiệu này.» — mọi vai, trước khi gửi. Không đổi gì
khác của hộp.

### 6. Bản dựng

Đường mới đọc `LO-TRINH.html` bằng `docTepLoTrinh` như «Tín hiệu đã gửi» → khoá mang tệp của `next.config` thêm
`/[slug]/tin-hieu/tat-ca` (thoát ngoặc như khoá cũ); bản dựng thật phải mang tệp vào gói của đường đó.

### 7. Không làm

Gỡ hay lưu trữ tín hiệu rác (TH5) · kéo về tự chạy, khoá chỉ kéo (TH1) · thông báo tín hiệu mới (N5) · sửa các lỗi
giao diện U1–U9 của thẻ «Của tôi» · xuất tệp · tìm theo chữ · trả lời người gửi · trưởng phòng xem tín hiệu phòng
mình · phân trang máy chủ khi dưới trần.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: quản trị bấm «Tín hiệu đã gửi» ở menu người dùng → trang «Của tôi» có thanh thẻ → bấm «Tất cả» → thấy
  ba ô số và danh sách mọi tín hiệu → chọn lọc phòng ban/trạng thái/người gửi → đọc dòng (điểm ra: hỏi lại người
  gửi ngoài CRM, hoặc quay «Của tôi»).
- Biên: chưa ai gửi tín hiệu; lọc ra rỗng; người gửi đã bị xoá; tín hiệu không phòng ban; bản vẽ không đọc được;
  thành viên mở thẳng đường dẫn Tất cả.
- Lỗi & quay lại: tải danh sách lỗi → `VungTaiLoi` có «Thử lại»; tiêu đề trang và thanh thẻ vẫn còn.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Tín hiệu — Của tôi | xem tín hiệu mình đã gửi (như LT2), quản trị thấy thêm thanh thẻ | menu người dùng, biên nhận hộp gửi / thẻ Tất cả |
| Tín hiệu — Tất cả | quản trị thấy mọi tín hiệu và ba số ngưỡng sống | thẻ «Tất cả» / thẻ «Của tôi» |
| Hộp gửi tín hiệu | kể điều mình gặp, biết trước quản trị thấy tên | nút «Gửi tín hiệu» / biên nhận |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-tat-ca-co | Tất cả | ba ô số + bảng đủ cột, nhiều phòng ban, nhiều trạng thái | lọc, đọc dòng |
| ST-tat-ca-loc | Tất cả | bộ lọc phòng ban đang chọn, đếm trên từng giá trị, đường dẫn mang lọc | bỏ lọc / lọc thêm |
| ST-tat-ca-loc-rong | Tất cả | «Không có tín hiệu khớp bộ lọc» + nút bỏ lọc; ba ô số giữ nguyên | bỏ lọc |
| ST-tat-ca-thieu | Tất cả | dòng «Không còn tài khoản», «Chưa có phòng ban» | đọc |
| ST-tat-ca-khong-ban-ve | Tất cả | trạng thái CRM + dòng báo chưa đọc được trạng thái sau gom; ô 3 «—» | đọc |
| ST-tat-ca-rong | Tất cả | ba ô số 0 · 0 · 0 + `Empty` «Chưa ai gửi tín hiệu» | chờ |
| ST-tat-ca-dang-tai | Tất cả | tiêu đề + thanh thẻ giữ, khung xương ba ô và ba dòng | chờ |
| ST-tat-ca-loi | Tất cả | `VungTaiLoi` «Chưa tải được mọi tín hiệu» + Thử lại | thử lại |
| ST-tat-ca-khong-quyen | Tất cả (thành viên) | tiêu đề, `Empty` «Chỉ chủ và quản trị CRM xem được mọi tín hiệu.» + nút về «Tín hiệu đã gửi»; không thanh thẻ | về Của tôi |
| ST-cua-toi-quan-tri | Của tôi | danh sách của mình + thanh thẻ «Của tôi · Tất cả» | sang Tất cả |
| ST-hop-bao-truoc | Hộp gửi | mô tả hộp có câu «Quản trị CRM thấy tên bạn cùng tín hiệu này.» | gửi / huỷ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Thẻ đang mở mang `aria-current="page"`; đổi thẻ là đổi đường dẫn (Back của trình duyệt quay đúng thẻ).
- Lọc nhiều giá trị trong một facet là «hoặc», giữa các facet là «và»; giá trị nằm trên đường dẫn, tải lại giữ.
- Đổi lọc đưa về trang 1. Ba ô số không đổi theo lọc.
- Dưới `md`: cột màn, phòng ban, gửi lúc ẩn khỏi bảng (`hideBelow`), thông tin đó vào dòng phụ của cột điều đã kể.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Tabs`/`TabsList variant="line"` | dùng | nếp thẻ con của `docs/design.md` |
| `StatGroup` + `StatCard` | dùng | nếp ô số tổng quan (Toàn cảnh OKR) |
| `DataTable` + `useTableQuery` | dùng | cần lọc theo facet, như trang Lộ trình |
| `StatusIndicator` + `toneTheoNghia` | dùng | màu trạng thái theo nghĩa, cùng thẻ Của tôi |
| `Empty`, `VungTaiLoi`, `Skeleton` | dùng | nếp chờ tải/lỗi/rỗng |
| `ThanhTheTinHieu`, `BaSoTinHieu`, `BangTatCa` | ghép (trong `apps/app/components/tin-hieu/`) | ghép từ component trên, không vẽ tay |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: bảng-điều-khiển (dashboard-first)
Căn cứ: ba ô số đứng đầu rồi bảng lọc được — đúng nếp «Ô số tổng quan» + «Danh sách» của `docs/design.md` và
Toàn cảnh OKR; đối chiếu [NGÀNH: Canny] bảng quản trị ý kiến (danh sách mọi ý kèm người gửi, lọc theo trạng thái).
Luồng hiển nhiên, không tra thêm mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Kiểm thử

- Hàm đếm: ma trận viết trước trên `demNguongSong` (biên 30 ngày, biên 7 ngày, không phòng ban, có chỗ/chưa có chỗ,
  bản vẽ vắng) + ca hai chiều: cùng bộ tín hiệu qua lệnh kéo về (máy chủ giả, đúng vỏ REST) và qua hàm ghép của
  trang ra cùng ba số.
- API: ma trận bốn vai × `tatCa` (owner, admin xem được; member, okr 403), REST cùng kết quả, không đổi
  `keoVeLuc`, không có thư điện tử trong phản hồi.
- Màn (DOM): thanh thẻ theo vai, dòng đủ cột, thiếu dữ liệu, lọc lên đường dẫn, lọc rỗng, câu báo trước của hộp.
- Màn thật (ui-check): quản trị và thành viên trên bản chạy với dữ liệu mẫu nhập qua đường ghi thật (`tinHieu.gui`
  của ba người ở hai phòng ban), 1280 và 375.
- Bản dựng: gói của `/[slug]/tin-hieu/tat-ca` mang `LO-TRINH.html`.
