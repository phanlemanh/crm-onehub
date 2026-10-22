# Review findings — trang-bo-okr (round 2)

## Trong hợp đồng

- **Tab Việc leaves the task title blank for hidden or deleted linked items, unlike the existing pattern**
  AC: AC-6
  file: apps/api/src/okr/bo-okr.ts:107
  severity: medium
  source: conventions
  detail: `tieuDeViec` turns every non-`viec` row into an empty string when the viewer has no permission (`lk.coQuyen === false`, for example the OKR-only role). It also returns an empty string when the linked campaign or plan was deleted (`lk.ten === null`). The output schema `viecBo` keeps only `loai` and a flat `tieuDe`, and drops `coQuyen` and `trangThai`. `viec-cua-bo.tsx:108` and `:131` render `{v.tieuDe}` directly, so these rows show an empty title cell or item title. The existing pattern for the same data (`LienKet` from `lienKetChoVai`, rendered in `apps/app/components/crm/record-sheet/kr-viec.tsx:389-427`) shows `m.sangKien.khongQuyen` («Một {loai} — bạn không có quyền xem») with a lock icon, and `m.sangKien.daXoa[loai]` for a deleted link. The new API endpoint and screen discard that signal instead of reusing the `LienKet` shape. As a result, users with limited permission see a row of tasks with no name and no explanation.
  rationale: AC-6 đòi mỗi việc trong thẻ Việc có tiêu đề; hàng việc loại chiến dịch/kế hoạch bị xoá hay bị ẩn quyền ra tiêu đề rỗng nên không đạt chữ của AC.

- **Việc liên kết (chiến dịch / kế hoạch) bị xoá hoặc bị ẩn thì hiện thành hàng có tiêu đề rỗng, không có nhãn nào**
  AC: AC-6
  file: apps/api/src/okr/bo-okr.ts:141
  severity: medium
  source: bugs
  detail: `tieuDeViec` trả `lk.coQuyen ? (lk.ten ?? "") : ""`. Hàng `OkrViecKr` loại chien-dich/ke-hoach được tạo với `tieuDe: ""` (okr-canh-kr.service.ts:297), nên tên của nó chỉ lấy được từ `lienKetChoVai`. Có hai trường hợp `tieuDeViec` ra chuỗi rỗng: (1) chiến dịch hay kế hoạch nguồn đã bị xoá (`campaign`/`plan` là null, nên `ten: null`, trạng thái `da-xoa`); (2) người xem không có phạm vi `doi-tac` (vai chi-okr, `coQuyen: false`). Schema `viecBo` trong okr-xem.contracts.ts không có cờ nào cho biết đã xoá hay không đủ quyền, vì vậy `ViecCuaBo` (viec-cua-bo.tsx: `<TableCell translate="no">{v.tieuDe}</TableCell>` và `<ItemTitle>{v.tieuDe}</ItemTitle>`) vẽ ra một hàng có ô tiêu đề trắng mà không giải thích gì. Ở chỗ khác, KR sheet (apps/app/components/crm/record-sheet/kr-viec.tsx `NoiDungSangKien`) xử lý đúng hai trường hợp này bằng nhãn `m.sangKien.khongQuyen` (kèm biểu tượng khoá) và `m.sangKien.daXoa[loai]`. Thông tin trạng thái đó bị mất ở biên API mà không có lỗi nào báo ra, trái với AC «mỗi việc có tiêu đề». Bài kiểm tbo-viec (apps/api/test/okr-danh-sach-bo.spec.ts) chỉ gieo việc loại `viec`, nên không phát hiện được.
  rationale: Finding nêu thẳng AC-6 «mỗi việc có tiêu đề»: hàng việc liên kết bị xoá hay không đủ quyền hiện ô tiêu đề trắng.

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): danh sách HO_SO của E15 bỏ sót các hồ sơ đã ký có thước chạm /okr/theo-don-vi, /okr/bo-okr**
  AC: AC-11
  file: _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs:22
  severity: high
  source: measurement
  detail: E15 hứa chạy «các hồ sơ đã ký có thước hay bài kiểm chạm /okr/bo-okr, theo-don-vi hay ViewSwitch của khu Mục tiêu (lập lúc S3 bằng lệnh quét)». Nhưng `HO_SO` (dòng 22–32) chỉ là 9 slug viết tay, và lúc chạy không có bước quét nào đối chiếu danh sách đó với kho. Grep `okr/bo-okr|okr/theo-don-vi|data-view-switch` trên `_acceptance/*/rang` cho ra khoảng 30 hồ sơ `status: signed-off` khác mà danh sách không có. Ví dụ cụ thể là `_acceptance/okr-cua-toi-tach-theo-doi/rang/man-theo-doi.mjs:302`. Hồ sơ này đã ký, eval là `ctt_man`, và bước 4 mở `/okr/theo-don-vi?kyOkr=${san.quy}` không kèm donOkr rồi bấm `[data-mo-muc-tieu=M5]`. Sau vòng này, đúng URL đó (không donOkr, không xemOkr) là trang danh sách Bộ OKR. Tương tự, `_acceptance/loc-don-vi-khong-tu-dong/rang/man-loc.mjs:67` mở theo-don-vi không donOkr khi `don` rỗng. Ngoài ra `apps/app/test/loc-va-kieu-xem.dom.tsx` và `okr-so-do-don-vi.dom.tsx` đọc `[data-view-switch]`. E15 không chạy hồ sơ nào trong số này, nên «KET LUAN khong-doi-hinh: dat» chỉ phủ 9 điểm chứ không phủ cả lớp mà AC-11 hứa. Số hồ sơ được chạy nhỏ hơn số hồ sơ thuộc lớp.
  rationale: AC-11 đòi chạy eval của mọi hồ sơ đã ký có thước chạm các trang này; danh sách 9 hồ sơ viết tay bỏ sót nhiều hồ sơ thuộc lớp.

- **Hình dạng 3 (assert chuỗi có mặt trong khi lời hứa là QUAN HỆ): tệp vai «danh-sach» của tbo-lien-ket chỉ được kiểm là có chứa chuỗi đường dẫn**
  AC: AC-7
  file: apps/app/test/trang-bo-okr.dom.tsx:697
  severity: medium
  source: measurement
  detail: `CHO_LIEN_KET` gán vai «danh-sach» (đích là trang danh sách, không mang donOkr) cho cua-toi.tsx, thanh-ben-muc-tieu.tsx, thanh-tab.tsx và vi-tri-bo.tsx. Ở test dòng 697–708, các tệp này chỉ qua phép `choDungLienKet()`: `DICH_BO_OKR.some((k) => k.test(ma))` khớp chuỗi `/okr/bo-okr`, `DUONG[` hoặc `DUONG_MUC[` trong mã nguồn. `DUNG_LIEN_KET` không có hàm dựng nào cho vai này, và không có assert nào đọc href đã dựng ra để xác nhận nó trỏ tới `/okr/bo-okr` mà không có donOkr. Lời hứa ở AC-7 «nút «Sang Theo đơn vị» của Của tôi mở trang danh sách» là quan hệ giữa href và trang đích, cụ thể là href của `RongCuaToi` ở `cua-toi.tsx:110`. Nếu liên kết đó mang thêm `donOkr=...` hoặc trỏ sai trang, file vẫn chứa chuỗi `/okr/bo-okr` và ca vẫn xanh. Riêng vi-tri-bo có E5 (`veDung`) đo gián tiếp; cua-toi, thanh-tab và thanh-ben thì không eval nào đo href.
  rationale: AC-7 hứa nút «Sang Theo đơn vị» của Của tôi mở trang danh sách; bài kiểm chỉ khớp chuỗi nên không chứng minh được lời hứa này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The Bộ OKR table uses raw `TableCell` and adds padding and alignment through className instead of `SimpleTableCell`**
  Người dùng thấy gì: Trong bảng các Bộ OKR và bảng Việc, chữ ở các cột lệch vài điểm ảnh so với tiêu đề cột của nó. Dữ liệu và thao tác vẫn đúng, chỉ là nhìn chưa thật thẳng hàng.
  Căn cứ: Chỉ lệch thẩm mỹ rất nhỏ, không mất dữ liệu hay chặn việc nào, và sửa sau không tốn kém.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/danh-sach-bo.tsx`
  severity: medium
  Đề xuất: known-limits

- **The Việc tab loading skeleton duplicates the toolbar row and does not match the content's shape**
  Người dùng thấy gì: Khi thẻ Việc đang tải, màn hiện thêm một hàng thanh công cụ giả nên nhảy bố cục nhẹ lúc nội dung đến. Vài giây sau màn tự về đúng.
  Căn cứ: Chỉ là hiệu ứng chờ tải thoáng qua, người dùng không phải làm gì, tự hết khi tải xong.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/viec-cua-bo.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture VIẾT TAY đúng khuôn bên đọc): chiều đỏ tbo-lien-ket-do tự dựng href rồi đưa vào bộ so, không đi qua Toàn cảnh hay parseAsDonOkr**
  Người dùng thấy gì: Bài kiểm tự động có thể không bắt được nếu sau này liên kết sang bộ OneHub ở Toàn cảnh mất tham số đơn vị gốc. Sản phẩm hiện giờ vẫn chạy đúng.
  Căn cứ: Không ảnh hưởng người dùng hôm nay, chỉ làm lưới an toàn cho lần sửa sau yếu hơn, và củng cố lại không tốn nhiều.
  file: `apps/app/test/trang-bo-okr.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

