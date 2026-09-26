# Nợ sau lượt 5 OKR — thiết kế

Nguồn: bốn mục «mở hợp đồng mới» khi ký Cổng Bằng chứng của `toan-canh-okr`
(sổ `d-20260926T110238Z-31`, `-35`, `-36`, `-37`), chủ kho chốt gom thành một vòng
(bàn giao điều phối 26/09 18:25). Ba lỗ hổng, cùng khu OKR trong `apps/app`, không
chạm API, không `migration`.

## 1. Khối «OKR của bạn» biến mất khi không tải được chu kỳ (Ngoài-8)

Hiện tại `khoi-kr-cua-toi.tsx` trả `null` khi `ky === null && !cycles.isPending`.
Truy vấn `okr.cycles` lỗi thì `ky` là `null` và `isPending` là `false`, nên khối rời
Tổng quan không để lại dấu gì. Lỗi của `okr.khoiCuaToi` thì hiện một dòng chữ xám,
không có cách thử lại.

Sửa theo luật lỗi-trước-đang-tải Toàn cảnh đã theo (sổ `d-20260926T091042Z-23`):

- `loi = cycles.isError || khoi.isError` xét **trước** mọi nhánh khác, kể cả nhánh
  trả `null`.
- Có lỗi: thẻ vẫn hiện với tiêu đề và mô tả như thường; phần thân là `LoiXem` — cùng
  Empty «câu lỗi + Thử lại» Toàn cảnh, Sức khoẻ và Họp tuần đang dùng. Bấm «Thử lại»
  gọi lại đúng truy vấn đang lỗi (chu kỳ, khối, hoặc cả hai).
- Câu lỗi: Tổng quan «Không tải được KR của bạn.»; trang một người «Không tải được KR
  của người này.» (câu cũ nói «của bạn» ở trang người khác là sai chủ ngữ).
- Không lỗi mà không có chu kỳ hiện tại: vẫn ẩn khối như cũ. Đang tải: vẫn khung chờ.

Trang một người truyền sẵn `cycleId`, truy vấn chu kỳ của khối tắt, và lỗi chu kỳ ở
đó trang Theo đơn vị đã tự hiện Empty lỗi — khối chỉ gặp lỗi của chính `okr.khoiCuaToi`.

`LoiXem` ở lại `toan-canh/toan-canh.tsx` và được nhập như `hop-tuan.tsx` đang nhập.
Chuyển nó sang `trang-thai-okr.tsx` gọn hơn nhưng chạm ba tệp của hồ sơ đã ký
`toan-canh-okr` chỉ để đổi dòng nhập (sổ quyết định của vòng này).

## 2. Bộ lọc «Người phụ trách» hiện mã người dùng (Ngoài-7)

`loc-okr.tsx` dựng lựa chọn phụ trách từ `facetCounts.phuTrach`. Người đã chọn mà
không còn mục tiêu nào khớp các mặt lọc khác thì không có trong đếm, và nhãn rơi về
`${id} · 0` — mã thô trên màn và trên nút bộ lọc.

Sửa: `TheoDonVi` dựng bảng tên từ `org.tree` (đã tải sẵn cho cây đơn vị, `people` là
mọi thành viên) và đưa vào `LocOkr`. Người đã chọn không có trong đếm hiện
`<tên> · 0`; không có cả trong tổ chức (đã rời) hiện «Người không còn trong tổ chức ·
0». Mã không bao giờ lên màn. Hàm dựng lựa chọn (`luaChonPhuTrach`) xuất ra để đo
thẳng.

Không đổi API: tên người đã có ở trình duyệt, thêm truy vấn tên ở máy chủ là thêm một
lượt đọc cơ sở dữ liệu cho một nhãn.

## 3. Tải trước danh sách Theo đơn vị không trúng (Ngoài-2, Ngoài-6)

`theo-don-vi/page.tsx` tải trước `okr.danhSach` với `loc` ba mặt (thiếu `tuTin`),
còn trình duyệt hỏi với bốn mặt (`tuTin: []` khi không lọc). Hai khoá khác nhau nên
bản tải trước **không bao giờ** được dùng — kể cả khi không lọc gì — và trình duyệt
luôn tải lại danh sách sau khi trang hiện.

Sửa: một hàm `locOkr(thamSo)` trong `okr-search-params.ts` dựng `loc` từ tham số
URL; trang máy chủ và `TheoDonVi` cùng gọi nó. Một phép đo so tập khoá của `locOkr`
với tập mặt lọc API nhận (`locDanhSach` trong `okr-xem.contracts.ts`), nên API thêm
mặt lọc mà hàm quên thì đỏ.

`staleTime` 30 giây nên bản tải trước đúng khoá được dùng ngay, không có lượt tải phụ.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Tổng quan → khối «OKR của bạn» hiện bảng KR (không đổi).
- Biên: không có chu kỳ hiện tại → khối không hiện (không đổi); người đã chọn ở bộ
  lọc không còn KR khớp → nhãn tên người · 0.
- Lỗi & quay lại: truy vấn chu kỳ hoặc KR lỗi → thẻ «OKR của bạn» hiện câu lỗi và nút
  «Thử lại» → bấm khi mạng/API đã ổn → bảng KR hiện; vẫn lỗi → câu lỗi ở lại.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Tổng quan — khối OKR của bạn | cho người thấy KR mình phụ trách | thanh bên / «Mở OKR» |
| Theo đơn vị — trang một người | xem KR một người phụ trách | cây đơn vị / hàng người |
| Theo đơn vị — bộ lọc | lọc mục tiêu theo người, loại, trạng thái, tự tin | nút «Bộ lọc» |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-tongquan-loi | Tổng quan | thẻ «OKR của bạn», Empty «Không tải được KR của bạn.» + nút «Thử lại» | bấm Thử lại |
| ST-nguoi-loi | Trang một người | thẻ «KR người này phụ trách», Empty «Không tải được KR của người này.» + «Thử lại» | bấm Thử lại |
| ST-tongquan-khoi | Tổng quan | bảng KR (không đổi) | mở diễn biến KR |
| ST-donvi-loc-ten | Theo đơn vị | lựa chọn phụ trách «<tên> · 0» / «Người không còn trong tổ chức · 0» | bỏ chọn người |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Nút «Thử lại» gọi lại đúng truy vấn đang lỗi; không khoá nút khi đang gọi (giống
  Toàn cảnh).

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `LoiXem` (Empty + Button) | dùng | Empty lỗi đã duyệt của Toàn cảnh, cùng khu OKR |
| `DataTableFacetMenu` | dùng | chỉ đổi nhãn lựa chọn |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: bảng-điều-khiển (dashboard-first)
Căn cứ: không đổi khuôn — khối nằm trên Tổng quan có sẵn; vòng này chỉ thêm trạng thái lỗi vào thẻ đã có.
<!-- UX-SPEC-TEMPLATE>>> -->

## Đo

- Test DOM `apps/app/test/khoi-kr-cua-toi.dom.tsx`: chu kỳ lỗi, khối lỗi (hai nơi),
  đối chứng không chu kỳ và đang tải.
- `apps/app/test/loc-okr-ten.spec.ts`: ma trận nhãn phụ trách.
- `apps/app/test/loc-okr-tai-truoc.spec.ts`: `locOkr` phủ đúng tập mặt lọc API.
- Thước màn `_acceptance/no-sau-luot-5-okr/rang/man-no-okr.mjs` trong phiên đo: chặn
  `okr.cycles` ở trình duyệt trên Tổng quan (Tổng quan không tải trước chu kỳ ở máy
  chủ, nên chặn ở trình duyệt là chặn thật), bỏ chặn rồi bấm «Thử lại»; đếm lượt gọi
  `okr.danhSach` của trình duyệt khi mở Theo đơn vị ở ba URL; mở bộ lọc phụ trách với
  hai người không khớp.

Mọi phép đo được chạy đỏ trên cây chưa vá trước khi vá.
