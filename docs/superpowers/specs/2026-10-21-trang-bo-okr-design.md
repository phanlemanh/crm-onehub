# Trang Bộ OKR — thiết kế (VK3 `trang-bo-okr`)

Hàng VK3 của `docs/plan/lo-trinh-okr.json`, đợt vo-khu-muc-tieu, dãy V1. Câu giao: «Trưởng đơn vị mở Bộ OKR,
lọc Tôi dẫn, mở bộ OKR của đơn vị mình và đi giữa OKR · Họp tuần · Việc · Sơ đồ · Chấm điểm bằng thẻ con có
đường dẫn riêng». Bắt khi: «Mỗi bộ OKR có đường dẫn riêng; đổi thẻ con không mất chu kỳ và bộ đang xem; bộ lọc
Tất cả · Tôi dẫn · Đang theo dõi ghi trên đường dẫn».

Chủ kho chốt ở V1-17 (ghi nguyên văn trong `_acceptance/trang-bo-okr/opportunity.md`): «Đang theo dõi» là bộ có
ít nhất một mục tiêu người xem theo dõi, không đổi cơ sở dữ liệu; đường dẫn một bộ giữ dạng tham số; vòng được
đổi chuỗi đường dẫn và bộ chọn ô chuyển kiểu xem trong thước của hồ sơ đã ký bị chạm.

## Hiện trạng

- `/okr/bo-okr` được rewrite sang `okr/theo-don-vi/page.tsx` (`apps/app/next.config.ts`). Một màn chung: ô chọn
  đơn vị (`ChonDonVi`) + `ViewSwitch` bốn kiểu xem (`danh-sach`, `cay`, `hop-tuan`, `cham` khi chu kỳ ở pha chấm
  điểm hoặc đã đóng). Tham số `kyOkr`, `donOkr`, `xemOkr` (`packages/validation/src/okr-tham-so.ts`); `donOkr`
  bỏ khỏi URL khi là bộ OneHub (`goc`), `xemOkr` bỏ khi là `danh-sach`.
- «Bộ» không có bảng riêng: bộ = (đơn vị × chu kỳ). Đơn vị dạng `goc | bp:<id> | pb:<id> | nguoi:<id>`.
- Chưa có trang danh sách các bộ; chưa có bộ lọc Tất cả · Tôi dẫn · Đang theo dõi; chưa có kiểu xem Việc.
- Dữ liệu có sẵn: trưởng đơn vị (`Division.headUserId`, `Department.headUserId`, `okr.access.headOf`), theo dõi
  mục tiêu (`OkrFollow`), việc gắn KR (`OkrViecKr`), số theo đơn vị (`okr.toanCanh`, `okr.countByUnit`).

## Thiết kế

### Hai trang trên một đường

`okr/theo-don-vi/page.tsx` quyết theo tham số: **không có `donOkr` và không có `xemOkr`** → trang danh sách Bộ OKR;
còn lại → trang một bộ (màn Theo đơn vị hiện nay). Luật này giữ mọi liên kết cũ có `xemOkr` (kể cả không kèm
`donOkr`) mở đúng bộ OneHub như trước; chỉ `/okr/bo-okr` trần (và chỉ kèm `kyOkr`) đổi nghĩa từ bộ OneHub sang
danh sách — đúng ý định của hàng. Bộ OneHub từ nay ghi `donOkr=goc` trên URL; bộ đọc `parseAsDonOkr` thôi bỏ `goc`
khi ghi, và mọi chỗ dựng liên kết tới bộ OneHub trong app mang `donOkr=goc`.

Tiêu đề và câu mô tả dựng trong `page.tsx` (luật «Khung trang» của `docs/design.md`): danh sách — «Bộ OKR» và
«Mỗi đơn vị một bộ OKR trong chu kỳ»; một bộ — tên đơn vị (bộ OneHub mang tên gốc của tổ chức) và câu mô tả của
màn hiện nay. Trang một bộ có liên kết «Bộ OKR» về danh sách ở đầu trang (`Breadcrumb` của `packages/ui`), giữ
`kyOkr`.

### Trang danh sách

- Thủ tục đọc mới `okr.danhSachBo({ cycleId })` trong module `okr` của API: một hàng mỗi bộ đơn vị (OneHub, mỗi
  bộ phận, mỗi phòng ban có trong cây tổ chức), mang `don` (khoá dạng `donOkr`), tên, cấp, khoá cha, trưởng,
  số mục tiêu, tiến độ (cùng công thức `toanCanh`), số KR tự tin thấp, và hai cờ của người xem: `toiDan` (người
  xem là trưởng của đơn vị đó — `Division.headUserId` cho bộ phận, `Department.headUserId` cho phòng ban; trưởng
  bộ phận không tự «dẫn» các phòng ban con; bộ OneHub không có trưởng nên không ai «dẫn» nó; quản trị không tự
  thành «dẫn») và `dangTheoDoi` (có ít nhất một mục tiêu của bộ trong chu kỳ mà người xem theo dõi). Không có bảng mới, không đổi lược đồ. Bộ cá nhân (`nguoi:`) không vào
  danh sách — «Của tôi» đã phủ nó.
- Lọc phạm vi: `ToggleGroup variant="outline" size="sm"` ba mục Tất cả · Tôi dẫn · Đang theo dõi, mỗi mục kèm số
  đếm chữ phụ; giá trị ghi lên URL bằng `nuqs` ở tham số mới `phamViBo` (`tat-ca` mặc định, bỏ khỏi URL;
  `toi-dan`; `theo-doi`). Lọc trên cờ máy chủ trả, không suy ở máy khách.
- Bảng: `SimpleTable surface="page"` từ `md`, danh sách `Item variant="outline"` dưới `md` (luật «Danh sách»).
  Cột: Bộ OKR của (thụt theo cấp) · Trưởng · Mục tiêu · Tiến độ · KR tự tin thấp. Tên bộ là `Link` tới
  `/okr/bo-okr?donOkr=<don>&kyOkr=<kỳ đang xem>`.
- Chờ tải: khung xương cùng hình bảng, giữ tiêu đề. Lỗi tải: `VungTaiLoi` có nút thử lại. Rỗng theo lọc (vd thành
  viên không dẫn đơn vị nào bấm Tôi dẫn): câu nêu tên lọc đang bật và nút «Về Tất cả» — bấm thì bỏ `phamViBo`.

### Trang một bộ

- Hàng thẻ con theo luật «Thẻ con của trang»: `Tabs` + `TabsList variant="line"`, mỗi `TabsTrigger asChild` bọc
  một `Link`, `aria-current="page"` ở thẻ đang mở, nằm ngay dưới đầu trang. Thẻ: OKR (`danh-sach`, bỏ khỏi URL),
  Họp tuần (`hop-tuan`), Việc (`viec`, mới), Sơ đồ góp vào (`cay` — giữ giá trị tham số cũ để liên kết cũ còn đúng; nhãn
  là khoá có sẵn `okr.cayCanChinh`), Chấm điểm (`cham`, chỉ khi chu kỳ ở pha chấm điểm hoặc đã đóng, như luật hiện nay).
- `href` của thẻ giữ đúng `kyOkr` và `donOkr` (kể cả `goc`); bộ lọc chip của thẻ OKR không đi theo sang thẻ khác.
- `ViewSwitch` rời khỏi hàng công cụ; `ChonDonVi` ở lại như lối tắt sang đường dẫn của bộ khác.
- Thẻ Việc: thủ tục đọc mới `okr.viecCuaBo({ cycleId, unit })` trả việc gắn KR (`OkrViecKr`) của các mục tiêu thuộc
  bộ trong chu kỳ, nhóm theo KR (tên KR, mục tiêu cha); KR không có việc nào thì không có nhóm; mỗi việc: tiêu đề,
  loại, người làm, hạn, đã xong. Hiện bằng
  `SimpleTable`/`Item` theo khổ như trang danh sách; rỗng thì câu rỗng nói bộ chưa có việc nào gắn KR.

### Thước của hồ sơ đã ký

Hồ sơ đã ký có thước mở `/okr/bo-okr` trần hay `theo-don-vi` không `donOkr` để đo bộ OneHub, hoặc bấm `ViewSwitch`
để đổi kiểu xem, sẽ đổi đúng chuỗi đường dẫn (`donOkr=goc`) và bộ chọn (liên kết thẻ con thay nút `ViewSwitch`),
không đổi logic — theo phép của chủ kho ở V1-17. Mỗi hồ sơ đo hai chiều (xanh trên cây vòng, đỏ trên bản sao bỏ
thay đổi), một dòng sổ `fix` mang `decided_by` chủ kho. Danh sách lập ở S3 bằng lệnh quét, không ước bằng tay.

### Chỗ lệch bản mẫu

Bản mẫu `/proto/vo-khu-muc-tieu` (`ManTatCaDonVi`, `ManTrangDonVi`) là đích bố cục. Những chỗ bản dựng được lệch:

| Chỗ | Bản mẫu | Bản dựng | Vì sao |
| --- | --- | --- | --- |
| Ô chọn đơn vị trên trang một bộ | không có | còn `ChonDonVi` (chờ Hỏi ở Cổng Phạm vi) | bỏ ô thì gãy thước đã ký ngoài phép đổi chuỗi của V1-17 |
| Thẻ Chấm điểm | không có | có, chỉ ở pha chấm điểm hoặc đã đóng | câu giao của hàng đòi Chấm điểm |
| Nội dung thẻ Sơ đồ | sơ đồ của bộ | cây căn chỉnh cả chu kỳ | ngoài phạm vi vòng này |
| Lọc ba mục | không gắn URL | ghi `phamViBo` | bắt khi của hàng đòi |

Trang một bộ ở trạng thái đang tải và lỗi tải giữ đúng như màn Theo đơn vị hôm nay (hồ sơ đã ký
`khung-cho-don-vi-mot-hinh` đo nó); vòng này chỉ thêm hàng thẻ con hiện cả lúc đang tải.

## Ngoài phạm vi

- Bảng hay nút theo dõi riêng cho một bộ OKR (Hỏi-1 (b)).
- Đường dẫn dạng đoạn `/okr/bo-okr/<đơn vị>/<thẻ>` (Hỏi-2 (b)).
- Sơ đồ chỉ quanh bộ đang xem — thẻ Sơ đồ giữ nội dung cây căn chỉnh cả chu kỳ như kiểu xem `cay` hôm nay.
- Hàng số đầu trang của một bộ (B2), chế độ Soạn cả bộ (B5a), hàng công cụ một dòng (hàng V1-15).
- Bộ OKR cá nhân trong danh sách.

## Đặc tả UX

Màn: danh sách Bộ OKR (`/okr/bo-okr`), một bộ (`/okr/bo-okr?donOkr=…`). Khuôn IA đã chọn: danh sách → chi tiết
có thẻ con (Tability «Plans» → «Plan» với tab), căn cứ bản mẫu `/proto/vo-khu-muc-tieu` (`ManTatCaDonVi`,
`ManTrangDonVi`) chủ kho đã dùng làm đầu vào VK2 (luật 23 của đợt). Bản mẫu không có thẻ Chấm điểm; vòng giữ luật
hiện nay (chỉ hiện ở pha chấm điểm hoặc đã đóng).

| Trạng thái | Danh sách | Một bộ |
| --- | --- | --- |
| Đang tải | khung xương bảng, tiêu đề «Bộ OKR» | khung xương như hôm nay, hàng thẻ con hiện |
| Lỗi tải | `VungTaiLoi`, nút thử lại | như hôm nay |
| Rỗng | lọc không ra bộ nào: câu + về Tất cả | thẻ Việc rỗng: câu rỗng |
| Có dữ liệu | bảng ≥ `md`, `Item` < `md` | thẻ đang mở sáng, nội dung thẻ |

Khổ: 1440, 1024, 375. Bàn phím: thẻ con là liên kết, Tab đi qua theo thứ tự, Enter mở; bộ lọc là `ToggleGroup`
dùng phím mũi tên.
