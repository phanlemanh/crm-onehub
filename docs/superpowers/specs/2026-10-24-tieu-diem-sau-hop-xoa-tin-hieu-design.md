# Tiêu điểm sau hộp xoá tín hiệu — thiết kế

Hàng TH6b của `docs/plan/lo-trinh-okr.json`, mở từ mục Ngoài-6 ở Cổng Bằng chứng TH6 (`sua-giao-dien-tin-hieu`, chủ kho
chọn «mở hợp đồng mới» 15/10). Cổng Đáng `build` 19/10 (`_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/opportunity.md`).

## Vấn đề

Trên trang «Tín hiệu đã gửi», người gửi mở menu ⋮ của một dòng, chọn «Xoá», hộp hỏi lại hiện. Hộp ấy đóng theo ba đường:
«Giữ lại» (hay Esc), xác nhận rồi xoá xong, xác nhận rồi xoá hỏng. TH6 làm đúng đường thứ hai: xoá xong thì tiêu điểm tới
nút ⋮ của dòng kế. Để làm được, TH6 cho hộp **luôn** chặn việc trả tiêu điểm (`onCloseAutoFocus` gọi `preventDefault`) —
vì nút ⋮ của dòng vừa xoá sẽ mất. Hệ quả là hai đường còn lại: bấm «Giữ lại», bấm Esc, hay xoá hỏng (đội sản phẩm vừa lấy
về, mất mạng, máy chủ lỗi) đều làm tiêu điểm rơi về đầu trang. Người dùng bàn phím và trình đọc màn phải dò lại từ đầu tới
dòng mình vừa đứng.

## Cách sửa

1. **Đóng hộp thì tiêu điểm về nút ⋮ của dòng đã mở hộp** — mọi đường đóng, kể cả lúc xác nhận. Lúc xác nhận dòng vẫn còn
   (máy chủ chưa trả lời), nên tiêu điểm đứng ở nút ⋮ của chính dòng đang xoá trong lúc chờ, không rơi về đầu trang.
   `DanhSachTinHieu` nhớ mã dòng đã mở hộp; `onCloseAutoFocus` vẫn chặn trả tiêu điểm mặc định của Radix (nó trả về nút
   menu đã đóng hay về `body`) rồi tự dời tiêu điểm tới bản nút ⋮ **đang hiện** của dòng ấy — bảng từ `md`, thẻ dưới `md`.
2. **Xoá xong** giữ nguyên cách đã ký ở TH6: sau khi danh sách làm mới, tiêu điểm tới nút ⋮ dòng dưới → dòng trên → chính
   dòng đó khi không xoá được → nút «Gửi tín hiệu» của trang rỗng; vùng đọc «Đã xoá tín hiệu crm-N».
3. **Xoá hỏng**: dòng còn, câu vì sao hiện trong `Alert` (`role="alert"`, trình đọc màn đọc mà không cần dời tiêu điểm vào
   câu). Nút ⋮ của dòng là cùng một phần tử trước và sau khi làm mới, nên tiêu điểm tự đứng yên ở đó. Sau khi danh sách
   làm mới, trang chỉ dời tiêu điểm về nút ⋮ của dòng khi tiêu điểm đã rơi về đầu trang — không giật tiêu điểm khỏi chỗ
   người dùng đã tự dời tới trong lúc chờ. Với 409, dòng thành «đã lấy về»: menu ⋮ khoá «Xoá» kèm dòng lý do như TH6.
4. Hàm tìm bản đang hiện (`phanTuHien`) nay nằm ở `danh-sach-tin-hieu-trang.tsx`; dời sang `apps/app/lib/tin-hieu/tieu-diem.ts`
   cùng hàm `tieuDiemNutThaoTac(ma)` để hộp và trang dùng chung.

Không đổi `packages/ui` (`ConfirmDialog` đã có chỗ cắm `onCloseAutoFocus`), không đổi API, không đổi dữ liệu.

## Ngoài phạm vi

- Mất mạng kéo dài làm lượt làm mới danh sách cũng hỏng → trang chuyển sang vùng lỗi tải, danh sách biến mất. Đường sẵn có
  của trang (`cuaToi.isError`), không do vòng này; cần quyết riêng có giữ danh sách cũ khi làm mới hỏng hay không.
- Giữ hộp mở trong lúc chờ máy chủ — đổi chỗ báo lỗi đã ký ở TH6, không phải sửa tiêu điểm.
- Sửa `ConfirmDialog` chung để tự trả tiêu điểm.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: trang «Tín hiệu đã gửi» → Tab tới nút ⋮ của một dòng → Enter mở menu → «Xoá» → hộp hỏi lại → «Xoá» → danh sách
  làm mới (điểm ra: nút ⋮ của dòng kế, như TH6).
- Biên: «Giữ lại» hay Esc ở hộp → hộp đóng, tiêu điểm ở nút ⋮ của dòng vừa mở hộp; dòng cuối hay dòng duy nhất cũng vậy.
- Lỗi & quay lại: xoá hỏng (đội sản phẩm vừa lấy về / mất mạng / máy chủ lỗi) → dòng còn, câu vì sao hiện trên danh sách và
  được đọc, tiêu điểm ở nút ⋮ của dòng → mất mạng thì Enter mở lại menu và xoá lại được; đã lấy về thì menu khoá «Xoá».

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Tín hiệu đã gửi | xem và dọn tín hiệu mình đã gửi | menu người dùng, biên nhận / hộp gửi |
| Hộp hỏi xoá | xác nhận xoá một tín hiệu | nút ⋮ › Xoá / nút ⋮ của dòng (đóng) |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-tin-hieu-hoi-xoa | Hộp hỏi xoá | tiêu đề nêu mã, nguyên văn điều đã kể, «Giữ lại» · «Xoá» | xác nhận hay giữ lại |
| ST-tin-hieu-giu-lai | Tín hiệu đã gửi | hộp đóng, vòng sáng tiêu điểm trên nút ⋮ của dòng đó | đi tiếp từ dòng đó |
| ST-tin-hieu-xoa-cho | Tín hiệu đã gửi | hộp đóng, dòng còn, tiêu điểm trên nút ⋮ của dòng đang xoá | chờ |
| ST-tin-hieu-xoa-xong | Tín hiệu đã gửi | dòng mất, tiêu điểm trên nút ⋮ dòng kế, đọc «Đã xoá tín hiệu crm-N» | đi tiếp |
| ST-tin-hieu-xoa-hong-lay-ve | Tín hiệu đã gửi | dòng còn, câu «Chưa xoá được crm-N — đội sản phẩm vừa mở…», tiêu điểm trên nút ⋮ | mở menu: «Xoá» khoá kèm lý do |
| ST-tin-hieu-xoa-hong-mang | Tín hiệu đã gửi | dòng còn, câu «chưa xoá được» theo ngôn ngữ, tiêu điểm trên nút ⋮ | mở menu, xoá lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Đóng hộp bằng «Giữ lại», Esc hay xác nhận: tiêu điểm tới bản nút ⋮ đang hiện của dòng đã mở hộp (bảng từ 768px, thẻ dưới
  768px). Vòng sáng chỉ hiện khi người dùng đang dùng bàn phím (`:focus-visible`); bấm chuột không hiện vòng.
- Xoá xong: như TH6. Xoá hỏng: tiêu điểm không bị giật khỏi chỗ người dùng đã tự dời tới trong lúc chờ.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `ConfirmDialog` (`onCloseAutoFocus`) | dùng | chỗ cắm sẵn có cho việc tự đặt tiêu điểm khi đóng |
| `Alert` (`role="alert"`) | dùng | câu xoá hỏng tới trình đọc màn, như TH6 |
| `DropdownMenu`, `Button` ⋮ | dùng | đích tiêu điểm là nút đã có, không thêm nút |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: luồng hiển nhiên — vòng không đổi bố cục trang danh sách đã có, chỉ đổi chỗ đứng của tiêu điểm; không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Chuẩn đối chiếu

- WAI-ARIA Authoring Practices, Dialog (Modal) Pattern: đóng hộp thì tiêu điểm về phần tử đã mở hộp, trừ khi nó không còn.
- WCAG 2.2: 2.4.3 Focus Order, 2.4.7 Focus Visible, 4.1.3 Status Messages.
- Web Interface Guidelines (`feature_loop.ui_standards_skill` của kho): «Use `:focus-visible` over `:focus`», «Async updates
  … need `aria-live`» — đã có từ TH6 (`role="alert"` cho câu hỏng, `aria-live` cho «Đã xoá»).

## Đo

- Bài DOM (`apps/app/test/tieu-diem-sau-hop-xoa-tin-hieu.dom.tsx`, happy-dom như TH6): ma trận đường đóng × vị trí dòng ×
  kết cục, đối chứng dương là năm ô xoá xong của TH6.
- Phép đo bàn phím trên bản chạy thật (`_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/rang/do-ban-phim.mjs`, puppeteer qua
  `mot-luot.sh` như TH6): khổ 375 và 1280 × {«Giữ lại», Esc, đã lấy về thật (quản trị lấy về qua `tinHieu.keoVe` sau khi trang
  đã tải), mất mạng (trình duyệt huỷ yêu cầu xoá)}, cộng ô xoá xong làm đối chứng; mỗi ô một dòng ĐÚNG/SAI và một ảnh.
- Ranh giới: không tệp nào dưới `apps/api`, `packages/ui`, `packages/db`, `packages/validation` đổi.
