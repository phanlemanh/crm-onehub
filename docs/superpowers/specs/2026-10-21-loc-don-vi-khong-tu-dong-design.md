# Lọc trang Theo đơn vị không tự đóng — thiết kế

Hàng DH13 của `docs/plan/lo-trinh-okr.json`, mở từ Ngoài-3 của hồ sơ đã ký `trang-don-vi-mot-bang`
(`d-20261017T223322Z-57`).

## Vấn đề

Ở Mục tiêu › Bộ OKR › Theo đơn vị (kiểu xem danh sách), chọn một giá trị trong menu «Lọc» thì menu đóng lại; trên
điện thoại khung Lọc thu lại. Người phải mở lại menu cho mỗi giá trị.

Menu vốn được làm để không đóng khi chọn (`DropdownMenuCheckboxItem` chặn `onSelect` trong `FacetSubmenu`), và trạng
thái mở của khung Lọc điện thoại là `useState` trong `DataTable`. Cả hai mất vì trang gỡ cả bảng: đổi lọc đổi khoá truy
vấn `okr.danhSach`, `keepPreviousData` giữ dữ liệu cũ, nhưng `theo-don-vi.tsx` coi `isPlaceholderData` là «đang tải»
và thay `BangDonVi` bằng `KhungDangTaiDonVi`. `DataTable` bị gỡ khỏi cây, menu và khung Lọc mất trạng thái.

## Cách làm

1. **Chỉ giữ dữ liệu cũ khi chỉ lọc đổi.** `placeholderData` của `okr.danhSach` thành một hàm thuần
   `giuKhiChiDoiLoc(truoc, truyVanTruoc, dauVao)`: trả dữ liệu cũ khi truy vấn trước cùng `cycleId` và cùng `unit`, trả
   `undefined` khi khác. Đổi đơn vị hay chu kỳ → không có dữ liệu giữ → `isPending` → khung chờ hình bảng như DH12.
2. **Trang không còn gỡ bảng lúc chờ lọc.** Nhánh `isPlaceholderData` bỏ khỏi điều kiện khung chờ; `BangDonVi` nhận cờ
   `dangTaiLai = byUnit.isPlaceholderData` và chuyển xuống `DataTable`.
3. **`DataTable` của `packages/ui` nhận cờ `refreshing`.** Khi cờ được truyền (kể cả `false`), vùng bảng (`Table`) được
   bọc trong `VungDangTai` có sẵn của `packages/ui`: mờ, `aria-busy`, `data-dang-tai` lúc `true`. Hàng công cụ, khối lọc
   và phân trang nằm ngoài vùng mờ. Không truyền cờ → DOM y như hôm nay, các trang khác không đổi.
4. **Lỗi khi đổi lọc** đi khung `Loi` có Thử lại như lần đầu (React Query bỏ dữ liệu giữ khi truy vấn lỗi).

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: bảng Theo đơn vị đã có dòng → mở «Lọc» → vào một mặt (Trạng thái…) → tích một giá trị → bảng mờ trong lúc
  chờ, menu vẫn mở → dòng mới thay dòng cũ → tích thêm giá trị khác ngay (điểm ra: bấm ra ngoài hay Esc đóng menu).
- Biên: kết quả rỗng → khung «không khớp» có nút bỏ lọc, menu vẫn mở; điện thoại → khung Lọc giữ mở suốt.
- Lỗi & quay lại: truy vấn lỗi → khung lỗi có «Thử lại» → bấm gọi lại.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Theo đơn vị (danh sách) | xem và lọc mục tiêu của một đơn vị | thanh bên khu Mục tiêu / bản ghi mục tiêu |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-donvi-loc-dangtai | Theo đơn vị | dòng cũ mờ đi, `aria-busy`, menu Lọc và khung Lọc vẫn mở | chọn tiếp giá trị khác |
| ST-donvi-danhsach | Theo đơn vị | dòng theo lọc mới, hết mờ | lọc tiếp / mở bản ghi |
| ST-donvi-khongkhop | Theo đơn vị | khung không khớp + nút bỏ lọc, menu vẫn mở | đổi lọc / bỏ lọc |
| ST-donvi-dangtai | Theo đơn vị | khung chờ hình bảng (đổi đơn vị, chu kỳ — DH12) | chờ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Tiêu điểm bàn phím ở lại trên mục vừa tích; Esc đóng menu như hôm nay.
- Mờ chỉ ở vùng bảng; hàng công cụ (ô chọn đơn vị, chuyển kiểu xem, nút Lọc) giữ nguyên độ rõ.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `DataTable` | mở rộng | thêm cờ `refreshing` trong `packages/ui`, không ghi đè ở chỗ gọi |
| `VungDangTai` | dùng | mẫu chờ-giữ-nội-dung đã duyệt ở Tài liệu |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: màn đã là bảng mở bản ghi bên phải; vòng này không đổi bố cục, chỉ giữ trạng thái lọc — luồng hiển nhiên, không tra.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài phạm vi

- Lọc nhanh (thẻ): lọc tại chỗ, không gọi máy, không bao giờ qua khung chờ.
- Ghi lịch sử trình duyệt cho mỗi lần đổi lọc (`history: push`) như Tài liệu.
- Các trang `DataTable` khác (Liên hệ, Thoả thuận…): không truyền cờ, không đổi.
