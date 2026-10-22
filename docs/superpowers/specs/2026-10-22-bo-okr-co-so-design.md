# Bộ OKR có hàng số — thiết kế (VK8 `bo-okr-co-so`)

Hàng VK8 của `docs/plan/lo-trinh-okr.json` (mã phạm vi `B2`), đứng trên VK3 `trang-bo-okr`. Câu giao: «Trưởng đơn vị
mở bộ OKR của đơn vị mình và biết ngay đội đang ra sao: ngày còn lại, tiến độ so với kỳ vọng, số KR đã cập nhật tuần
này, số KR tự tin thấp, và mọi KR đã mở sẵn». Bắt khi: «Bốn ô số ở đầu thẻ OKR của mọi bộ; nút Mở tất cả / Gập tất cả».

Bản này viết trên `feat/trang-bo-okr` (VK3, S3 xong, chưa gộp `onehub`). S2–S3 chỉ bắt đầu sau khi VK3 gộp; nếu S4 của
VK3 đổi thẻ OKR, bản này đọc lại trước S2.

## Hiện trạng

- Thẻ OKR của trang một bộ (`theo-don-vi/theo-don-vi.tsx`, nhánh `else` cuối) dựng `BangDonVi` — `DataTable` có
  `expandable`: mỗi mục tiêu là một dòng gập, bấm mới thấy các KR. Trạng thái mở nằm trên URL ở khoá `expand` của
  `DataTable` (`packages/ui/src/components/data-table.tsx`), mặc định rỗng = gập hết.
- Không có số tóm tắt nào ở đầu thẻ. Cùng bốn con số đã có ở hai chỗ: Toàn cảnh (`toan-canh.tsx`, `StatGroup` bốn ô cho
  cả công ty) và cột Tiến độ · KR tự tin thấp của danh sách Bộ OKR (VK3, `bo-okr.ts` đọc hàng `okr.toanCanh`).
- `okr.toanCanh({ cycleId })` trả `hang[]`, mỗi đơn vị một hàng khoá `goc` · `bp:<id>` · `pb:<id>` với `tienDo`,
  `kyVong`, `soKr`, `daCapNhat` (KR có lần cập nhật trong tuần VN hiện tại), `tuTin.thap` (KR có lần cập nhật mới nhất
  tự tin thấp). Hàng bộ phận gộp mục tiêu của các phòng ban con — đúng như bảng của trang bộ phận (`dieuKienDonVi`).
  Chỉ tính mục tiêu đã công bố.
- Chu kỳ (`useChuKy`) mang `startsOn`, `endsOn`, `phase`.

## Thiết kế

### Hàng số

- Một `StatGroup` bốn `StatCard`, nằm giữa hàng thẻ con và bảng mục tiêu, **chỉ ở thẻ OKR**. Thứ tự và nội dung:

  | Ô | Giá trị | Dòng mô tả |
  | --- | --- | --- |
  | Ngày còn lại | số ngày lịch VN từ hôm nay tới `endsOn`, tính cả hai đầu | «đến <ngày kết thúc>» |
  | Tiến độ | `tienDo`% của hàng | như Toàn cảnh: «lẽ ra <kyVong>%» · «vừa công bố» (kỳ vọng 0) · «chưa có vạch» (null) |
  | KR đã cập nhật tuần này | `daCapNhat`/`soKr` | — |
  | KR tự tin thấp | `tuTin.thap` | — |

- Nguồn duy nhất là hàng `okr.toanCanh` có `key` bằng `khoaDon(don)` của bộ đang xem, cộng `endsOn`/`startsOn` của chu
  kỳ đang xem. Không có thủ tục API mới: số ở ô bằng số Toàn cảnh và danh sách Bộ OKR đang in cho cùng đơn vị, và
  `okr.toanCanh` đã nằm trong cache khi người dùng đi từ Toàn cảnh hay danh sách sang.
- Ô **không** theo bộ lọc hay sắp xếp của bảng bên dưới: chúng tả cả đội, bảng là chỗ đào xuống.
- Biên của ô Ngày còn lại: chu kỳ chưa tới `startsOn` → giá trị «—», mô tả «Bắt đầu <ngày>»; đã qua `endsOn` → «0»,
  mô tả «Đã kết thúc <ngày>»; hôm nay là `endsOn` → «1». Bộ chưa công bố mục tiêu nào → Tiến độ «—», cập nhật «0/0»,
  tự tin «0».
- Hàm thuần `oSoBo(hang, chuKy, homNay)` trong `theo-don-vi/` dựng bốn ô (giá trị + mô tả) — thành phần chỉ vẽ. Chữ
  thêm vào `apps/app/lib/messages/okr-vo-khu.ts` (chỉ thêm dòng, luật 7 của đợt); các nhãn trùng Toàn cảnh dùng lại khoá
  `okr-toan-canh.ts`.
- Đang tải `okr.toanCanh`: bốn ô khung xương cùng hình, hàng thẻ con và dòng vị trí còn. Lỗi: `VungTaiLoi` thay chỗ
  hàng số, Thử lại gọi lại `okr.toanCanh`; bảng mục tiêu vẫn hiện (hai truy vấn độc lập).
- Bộ cá nhân (`donOkr=nguoi:<id>`) và bộ không tìm thấy không có hàng số (`okr.toanCanh` không có hàng cá nhân —
  Hỏi-2).

### Mở sẵn và Mở tất cả / Gập tất cả

- Biến thể mới của `DataTable` trong `packages/ui` (bậc 1, mở rộng): `expandable.moSan: true`. Khi bật:
  - trạng thái lưu trên URL đảo nghĩa — khoá `gap` liệt các dòng đang gập (thay cho `expand` liệt dòng đang mở); URL
    trống = mọi dòng mở được đều mở;
  - hàng công cụ của bảng có một nút đảo nhãn: «Gập tất cả» khi không dòng nào gập, «Mở tất cả» khi có ít nhất một
    dòng gập (Hỏi-3). Gập tất cả ghi mọi dòng mở được vào `gap`; Mở tất cả xoá `gap`;
  - nút mở từng dòng giữ nguyên, chỉ đảo trạng thái của dòng ấy.
- Không bật → `DataTable` y như hôm nay (khoá `expand`, mặc định gập, không có nút). Chỉ `BangDonVi` bật.
- Mục tiêu không KR và mục tiêu đã bỏ không mở được (luật `isExpandable` hiện có), nên không bị tính vào «mọi dòng».

### Thước của hồ sơ đã ký

Mở sẵn đảo nghĩa của bước «bấm nút mở dòng để thấy KR» trong các thước đã ký đo bảng trang đơn vị (quét sơ bộ: khoảng
mười bảy tệp dưới `apps/app/test` và `_acceptance/*/rang` có bấm `aria-expanded` trên màn đơn vị). Các thước ấy sẽ đổi
đúng bước bấm mở (bỏ bước, hoặc chờ dòng KR đã mở), không đổi khẳng định nào — nếu chủ kho cho (Hỏi-1), như phép
V1-17 đã cho VK3. Danh sách lập ở S3 bằng lệnh quét; mỗi hồ sơ một dòng sổ `fix` mang `decided_by` chủ kho, đo hai
chiều.

### Ranh giới với VK10 `che-do-soan-bo-okr`

VK10 (đang soạn S1 song song, cùng trang) giữ chế độ Soạn, nút Soạn ở đầu trang, và chip góp ý Kara ở ngăn theo dõi.
VK8 giữ hàng số giữa thẻ con và bảng, và biến thể mở sẵn của `DataTable`. Hai hàng cùng thêm dòng vào
`theo-don-vi.tsx` và `okr-vo-khu.ts` ở chỗ khác nhau; gộp sau thì giữ cả hai.

## Ngoài phạm vi

- Ô bấm được dẫn tới bảng đã lọc (vd «KR tự tin thấp» → lọc tự tin thấp) — Later; `StatCard asChild` của VK11 làm được.
- Số tuần trước, xu hướng theo tuần trong ô.
- Hàng số cho bộ cá nhân (Hỏi-2) và trên trang danh sách Bộ OKR.
- Nhớ trạng thái mở/gập theo người qua các lần mở trang.
- Chế độ Soạn, nút Soạn, khối Kara (VK10).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: danh sách Bộ OKR hay thanh bên → bấm bộ của mình → thẻ OKR mở, đọc bốn ô, cuộn bảng đã mở sẵn KR (điểm ra:
  bấm một KR mở ngăn KR, hay thẻ con khác).
- Biên: chu kỳ chưa bắt đầu / đã kết thúc; bộ chưa công bố mục tiêu; bộ phận gộp phòng ban con; lọc bảng đang bật; bộ
  cá nhân.
- Lỗi & quay lại: `okr.toanCanh` lỗi → vùng lỗi chỗ hàng số, Thử lại; bảng vẫn dùng được.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Thẻ OKR của trang một bộ | biết đội đang ra sao rồi đào xuống từng KR | danh sách Bộ OKR, thanh bên, liên kết / ngăn KR, thẻ con khác |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-bocoso-dangtai | thẻ OKR | bốn ô khung xương, dòng vị trí và thẻ con còn | chờ |
| ST-bocoso-loi | thẻ OKR | `VungTaiLoi` chỗ hàng số, bảng vẫn hiện | Thử lại |
| ST-bocoso-chuacongbo | thẻ OKR | Tiến độ «—», «0/0», «0» | soạn mục tiêu (VK10) |
| ST-bocoso-chuabatdau | thẻ OKR | Ngày còn lại «—», «Bắt đầu <ngày>» | đọc bảng |
| ST-bocoso-daketthuc | thẻ OKR | Ngày còn lại «0», «Đã kết thúc <ngày>» | sang thẻ Chấm điểm |
| ST-bocoso-coso | thẻ OKR | bốn ô, bảng mở sẵn, nút «Gập tất cả» | đọc, gập, bấm KR |
| ST-bocoso-dagap | thẻ OKR | ít nhất một dòng gập, nút «Mở tất cả» | mở lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- 1440: bốn ô một hàng (`StatGroup` từ `@2xl` container). 375: lưới 2×2, nhãn xuống dòng chứ không cắt.
- Nút Mở/Gập tất cả là `Button` thường: Tab tới, Enter/Space bấm; tên truy cập là nhãn đang hiện.
- Trạng thái gập ghi URL (`gap`), tải lại hay chia sẻ đường dẫn giữ nguyên.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `StatGroup`, `StatCard` | dùng | luật «Ô số tổng quan» của `docs/design.md` |
| `DataTable` | mở rộng (`expandable.moSan`) | mặc định mở và nút gập/mở hết là hành vi bảng, sống ở `packages/ui` |
| `VungTaiLoi`, khung xương `StatCard` | dùng | luật «Chờ tải và lỗi tải» |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: bảng-điều-khiển (dashboard-first)
Căn cứ: luồng hiển nhiên — hàng số trên, bảng dưới, như Toàn cảnh OKR của chính kho và trang Plan của Tability mà hàng
lộ trình dẫn («Trang kế hoạch của Tability mở ra là thấy bốn ô số»); không tra thêm.
<!-- UX-SPEC-TEMPLATE>>> -->
