# Bản phạm vi — đối chiếu nghiên cứu vỏ khu Mục tiêu với hiện trạng (24/10)

Bộ nghiên cứu 18/10 của đợt `okr-vo-khu-1810` bị thất lạc khi mở lộ trình. Chủ kho lấy lại ngày 24/10 ở kho riêng tư
`phanlemanh/crm-onehub-nguon` @ `88462c4`; tóm tắt và con trỏ ở `docs/findings/2026-10-18-vo-khu-muc-tieu/README.md`.
Giám sát đợt `vo-khu-muc-tieu` đối chiếu nghiên cứu với `onehub` @ `1591d8b77` và trình mười câu C1–C10. Chủ kho trả lời
nguyên văn «Đồng ý hết theo khuyến nghị» (24/10, khoảng 06:05Z).

Mỗi mục dưới trích dòng khuyến nghị chủ kho đã đồng ý. Mọi hàng mới chạm giao diện, nên theo luật 24/10 ở
`docs/proto.md` («Mỗi vòng có bản mẫu hay sơ đồ cạnh tiêu chí»): S1 dựng `/proto/<slug>` trên dữ liệu mẫu dày, chủ kho
bấm thử trước Cổng Phạm vi.

## Thành hàng hay mục chờ

- **C1** «thẻ Sơ đồ của bộ: (a) bỏ tới khi có hàng mới VK14». VK6 bỏ Cây căn chỉnh; nếu VK3 giữ thẻ «Sơ đồ góp vào»
  bằng cây cả chu kỳ thì gộp cả hai làm thẻ con bật ra Báo cáo › Sơ đồ, trái luật thẻ con của `docs/design.md`. Lối tạm
  tới khi VK14 giao (khuyến nghị: bỏ thẻ khỏi trang bộ) chủ kho chọn ở hàng gộp sau trong hai hàng VK3, VK6. **VK14**
  dựng lại thẻ: đơn vị đó cùng đơn vị cha và con. Mã `DC1`.
- **C2** «cột phải bộ (Góp vào · Đơn vị trực thuộc): cắt hàng sau VK8». **VK15**. Mã `DC2`. Khối «Hỏi nhanh Kara» của bản
  mẫu không thuộc hàng này.
- **C3** «P12 một tín hiệu trên dòng: thành hàng; trang một người: chân trời». **VK16** (mã `DC3a`) và mục chờ
  **VK-C3** (mã `DC3b`), mở lại khi chương trình bật OKR cá nhân.
- **C4** «ô chu kỳ: một chu kỳ cho cả khu». **VK17** đổi hành vi VK2: một ô chu kỳ chung cho cả khu, ở `header` của
  `AreaSidebar`. Mã `DC4`.
- **C8** «sáu tên VK-C1: duyệt cả bảng». Mục chờ VK-C1 của đợt `okr-vo-khu-1810` thành hàng **VK18**. Hàng mang `dot`
  của đợt cũ và gánh mã `C1` của bản phạm vi 18/10, để bảng phủ của đợt ấy vẫn ở một chỗ. Vì vậy hàng không có mã ở bản
  này.

## Ghi vào tài liệu, không thành hàng

- **C5** «chữ lọc phạm vi: «Tôi dẫn · Đang theo dõi»». Mục từ «Tôi dẫn · Đang theo dõi» ở `CONTEXT.md`; `ghi_chu` và
  `bat_khi` của VK12 đổi chip lọc về bộ chữ này.
- Mục từ «Cập nhật gần đây» ở `CONTEXT.md`, trước khi VK12 dựng tiếp.
- **C6** «tiêu đề trang bộ: giữ «Mục tiêu», xoá lời hứa «một hàng riêng»». Lộ trình và các bản phạm vi không còn lời hứa
  này. Lời hứa chỉ còn ở `cost_if_wrong` của dòng sổ `d-20261021T144552Z-14` trong hồ sơ `trang-bo-okr` (VK3); hồ sơ
  đang làm, dãy của VK3 ghi dòng sổ mới.
- **C7, C9, C10** «giữ hiện trạng»: thanh bên khu từ `md`; Của tôi không liệt người chưa cập nhật (mục chờ VK-C2 ghi
  lại); Lấy ý kiến luôn hiện trên thanh bên. Bảng «lỗi thời» của README.

<!-- <<<PHAM-VI-MA -->
```
dot: okr-doi-chieu-vo-khu-2410
dang: chuoi
nguon: đối chiếu bộ nghiên cứu 18/10 (crm-onehub-nguon@88462c4, tóm tắt ở docs/findings/2026-10-18-vo-khu-muc-tieu/README.md) với onehub 1591d8b77; chủ kho 24/10 «Đồng ý hết theo khuyến nghị» cho C1–C10

- `DC1` — thẻ con Sơ đồ của một bộ OKR: đơn vị đó cùng đơn vị cha và các đơn vị con, mở ngay trong trang bộ
- `DC2` — cột phải của trang một bộ OKR: khối Góp vào (đơn vị góp vào mục tiêu nào) và khối Đơn vị trực thuộc
- `DC3a` — một tín hiệu trên dòng mục tiêu và KR: giữ tình trạng cạnh mức tự tin, bỏ nhãn loại và «Đã công bố», nhãn trạng thái chỉ khi nháp hay chờ duyệt
- `DC3b` — trang một người cùng khuôn trang một bộ OKR
- `DC4` — một ô chu kỳ cho cả khu Mục tiêu, ở đầu thanh bên, áp cho mọi nơi đến
```
<!-- PHAM-VI-MA>>> -->
