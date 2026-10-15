# Tài liệu: bộ lọc giữ lịch sử, thanh lọc không chớp — thiết kế

Hàng phát sinh từ Cổng Bằng chứng của `loc-va-kieu-xem-chung` (NM2, PR #418), chủ kho ký 15/10 với Ngoài-3 và Ngoài-4
«mở hợp đồng mới». Giám sát duyệt hàng `tai-lieu-loc-giu-lich-su` (yêu cầu P4-9), dãy P4, đứng sau #418. Nhánh chồng
lên `feat/loc-va-kieu-xem-chung`.

## Hiện trạng (trên nhánh NM2, 2bfcef2f8)

- **Ngoài-3 — nút lùi.** `apps/app/app/(app)/[slug]/tai-lieu/danh-sach-loc.ts` đọc và ghi bộ lọc bằng
  `useQueryStates(taiLieuParsers, { shallow: false })`. nuqs 2.9.4 mặc định `history: "replace"`, và
  `taiLieuParsers` không đặt `history` cho khoá nào. Mỗi lần đổi loại, đơn vị, chủ trang, lưu trữ, nhóm đề xuất hay sang
  trang đều ghi đè mục lịch sử hiện tại. Trước NM2, mỗi lần đổi đi qua `router.push`, nên có một mục lịch sử riêng; giờ
  bấm lùi rời hẳn `/tai-lieu`.
- **Ngoài-4 — thanh lọc chớp.** `DanhSachTrang` (`danh-sach-trang.tsx:151-152`) và `ChoDuyet` (`cho-duyet.tsx:84-85`)
  trả `<DangTaiDanhSach />` khi `!data`. nuqs đổi giá trị ngay lúc bấm, nên khoá của `useQuery` đổi sang một khoá chưa
  có trong cache, `data` thành `undefined`, và cả khối lọc (chip loại, ô chọn đơn vị và chủ trang, nút lưu trữ, nút bỏ
  lọc, phân trang) bị gỡ khỏi DOM cho tới khi truy vấn về. Phần tử vừa bấm mất tiêu điểm.
- **Nếp của kho.** Mọi bảng `DataTable` giữ dữ liệu cũ trong lúc chờ bằng `placeholderData: (previous) => previous`
  (`deals-table.tsx:180`, `contacts-table.tsx:173`, `companies-table.tsx:203`…). Về lịch sử, `searchParsers` chỉ đặt
  `history: "push"` cho `page` (`apps/app/components/data-table/list-search-params.ts:33`); đổi bộ lọc ở các bảng đó
  ghi đè mục hiện tại.

## Phương án

1. **Lịch sử (Hỏi-1).** `taiLieuParsers` đặt `.withOptions({ history: "push" })` cho mọi khoá bộ lọc của Tài liệu
   (`loai`, `donVi`, `chuTrang`, `archived`, `page`, `nhomDeXuat`), nên mỗi lần đổi có một mục lịch sử như trước NM2,
   và bấm lùi về đúng bộ lọc trước. Lối khác: theo nếp `DataTable` — chỉ `page` ghi lịch sử, đổi bộ lọc thì ghi đè; khi
   đó bấm lùi sau khi đổi bộ lọc vẫn rời màn như hôm nay, đúng điều Ngoài-3 phàn nàn.
2. **Giữ thanh lọc trong lúc chờ.** `taiLieu.list` và `taiLieu.proposals` (nhánh có nhóm) thêm
   `placeholderData: (previous) => previous`, như mọi bảng của kho. Khung xương chỉ còn ở lần tải đầu (chưa có dữ liệu
   nào). Trong lúc chờ, vùng danh sách mang `aria-busy="true"`, để trình đọc màn hình biết đang tải; thanh lọc, phân
   trang và tiêu điểm đứng yên.
3. Không đổi khoá đường dẫn, không đổi parser nào khác, không đổi màn ngoài Tài liệu.

Phương án loại: (a) `startTransition` quanh lần ghi nuqs — vẫn để `useQuery` đổi khoá ngay, khung xương vẫn hiện; (b)
đưa thanh lọc ra ngoài nhánh chờ tải — thanh lọc không chớp nhưng danh sách vẫn chớp thành khung xương ở mọi lần lọc.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Tài liệu › Trang → bấm chip «Chính sách» → danh sách cũ mờ đi tại chỗ (đang tải), thanh lọc đứng yên, tiêu
  điểm còn ở chip → danh sách mới về → chọn đơn vị → bấm lùi của trình duyệt → về «Chính sách» không đơn vị → bấm lùi
  lần nữa → về danh sách ban đầu, vẫn ở Tài liệu.
- Biên: lần đầu mở màn (chưa có dữ liệu) vẫn hiện khung xương như hôm nay; đổi bộ lọc mà truy vấn lỗi thì hiện khung
  lỗi có nút thử lại như hôm nay.
- Lỗi & quay lại: nút lùi đi qua từng lần đổi bộ lọc và sang trang (theo Hỏi-1).
- Trình đọc màn hình: vùng danh sách báo đang tải bằng `aria-busy`; tiêu điểm không nhảy.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Tài liệu › Trang | Tìm trang theo loại, đơn vị, chủ trang | Thanh bên / Đọc trang |
| Tài liệu › Chờ duyệt | Duyệt đề xuất theo nhóm | Thẻ trang con / Duyệt đề xuất |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-tl-tai-dau | Tài liệu › Trang, › Chờ duyệt | Khung xương (chưa có dữ liệu nào) | Chờ |
| ST-tl-doi-loc | Tài liệu › Trang, › Chờ duyệt | Thanh lọc và phân trang như cũ, danh sách cũ với `aria-busy="true"` | Chờ hoặc bấm tiếp |
| ST-tl-lui | Tài liệu › Trang | Bộ lọc và danh sách của lần đổi trước | Bấm lùi tiếp hay lọc lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Mỗi lần đổi loại, đơn vị, chủ trang, lưu trữ, nhóm đề xuất hay sang trang: một mục lịch sử mới.
- Trong lúc chờ: không phần tử nào của thanh lọc bị gỡ khỏi DOM; phần tử vừa bấm giữ tiêu điểm.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| nuqs `withOptions({ history: "push" })` | dùng | nếp `page` của `searchParsers` |
| TanStack `placeholderData` | dùng | nếp của mọi bảng trong kho |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-lọc — không đổi cấu trúc màn, chỉ đổi lịch sử và trạng thái chờ.
<!-- UX-SPEC-TEMPLATE>>> -->

## Đo

- Bài DOM: ma trận bảy hành động (loại, đơn vị, chủ trang, lưu trữ, xoá lọc, sang trang, nhóm đề xuất) — mỗi lần cập
  nhật đường dẫn mang `history: "push"`; chiều đỏ: parser không đặt history.
- Bài DOM: truy vấn thứ hai treo — khối `[data-bo-loc]` không bị gỡ lần nào (MutationObserver), tiêu điểm còn ở chip
  vừa bấm, danh sách cũ mang `aria-busy="true"`; thả truy vấn thì danh sách mới thay và `aria-busy` bỏ. Lần tải đầu
  vẫn có khung xương; truy vấn lỗi vẫn có khung lỗi. Chờ duyệt cùng nếp.
- Bàn đo màn thật (phiên đo): đổi loại, đổi đơn vị, bấm lùi của trình duyệt hai lần, đọc đường dẫn và chip ở mỗi bước;
  trì hoãn đường `taiLieu.list` để đo khối lọc không biến mất và tiêu điểm còn trên chip.

## Ngoài phạm vi

- Lịch sử khi đổi bộ lọc ở các màn `DataTable` khác (Thoả thuận, Liên hệ, Công ty, Onboarding) — giữ nếp hôm nay.
- Các mục Known limits của NM2 (Ngoài-1, 2, 5–9).
