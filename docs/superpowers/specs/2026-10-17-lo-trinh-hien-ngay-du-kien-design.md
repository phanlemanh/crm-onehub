# Lộ trình hiện ngày dự kiến — thiết kế (LT1e)

Hàng LT1e của `docs/plan/lo-trinh-okr.json`, đứng trên LT1c. Cổng Đáng: build — Manh Phan 17/10, ngưỡng bản máy khuyên
(`_acceptance/lo-trinh-hien-ngay-du-kien/opportunity.md`).

## Vấn đề

Kit 2.32.0 (hàng RM6c) đưa vào khối dữ liệu của `LO-TRINH.html` bốn khoá: `hang.gio_may`, `moc.gio_may`, `moc.du_kien`,
`moc.qua_tai`. Khuôn đọc của CRM (`packages/validation/src/lo-trinh-du-lieu.ts`) là `z.object` nên bỏ khoá lạ: trang
Lộ trình không thấy chúng. Đo 17/10: 7 mốc đang chạy, 0/7 hiện ngày; mốc duy nhất đã có dự báo («Lộ trình bước 2»)
ghi hoàn tất 17/10 cho mục tiêu 21/10.

## Hướng

Một đường đọc, không tự tính ngày:

1. **Bộ đọc**: `apps/app/lib/lo-trinh/doc-du-lieu.js` chép lại NGUYÊN hàm `docDuLieu` của kit 2.32.0 (từ
   `scripts/lo-trinh.mjs` của chính kho — bản kit đã nhận ở #463). Một bài kiểm so hai bản từng byte, để lần nhận kit
   sau đổi bộ đọc thì đỏ thay vì lệch im.
2. **Khuôn**: thêm ba khuôn con (`gioMay`, `gioMayMoc`, `duKien`) và bốn khoá, mọi trường `nullable`, khoá vắng → `null`
   (đúng luật «Đọc khoan dung» của kit). `mocLoTrinh` thêm `hoanTatHopLe`, `ngayTinhHopLe` cạnh `ngayHopLe`.
3. **Hàm `duKienMoc`** (`apps/app/lib/lo-trinh/du-kien.ts`) — từ một mốc ra một trong ba: không hiện (mốc hết việc mở);
   `co-ngay` (ngày hoàn tất, ngày tính, cờ quá tải, cờ số đo chưa đủ, cờ đã qua); `chua-co` với lý do `chua-mo-viec` ·
   `ban-cu` · `khong-doc-duoc`. Không bao giờ lấy ngày mục tiêu thay ngày dự kiến.
4. **Hiển thị**: thành phần `ODuKien` (dạng đủ / dạng gọn) và `OUocLuong`, dùng ở xem theo mốc, cột mốc của bảng (và
   thẻ bảng cột, vì thẻ dùng chung `OMoc`), mục «Chi tiết» của ngăn hồ sơ.
5. **Bản chụp**: không đổi đường đẩy hay API — `day.ts` đã đọc bằng `docDuLieu`, API giữ nguyên khối, trang đọc bản chụp
   qua cùng khuôn. Bản chụp cũ thiếu khoá đi đúng nhánh `ban-cu`.

### Ba luật suy ra từ khối, không từ hồ sơ

- **Cờ số đo chưa đủ của mốc** = có ít nhất một việc chưa giao của mốc mà `gio_may` là `null` hoặc `gio_may.co` khác
  `null` (kit: `co` khác `null` khi giờ máy là máy ước theo luật). Khối không có cờ riêng cho `du_kien`; ngưỡng Cổng
  Đáng đòi «mọi ngày tính trên số đo chưa đủ mang cờ», nên trang gộp cờ của các việc làm nên ngày đó.
- **Đã qua ngày dự kiến** = `du_kien.hoan_tat` trước hôm nay của người xem và mốc còn việc — cùng luật so ngày với hôm
  nay mà kit cho bản chiếu tự làm (`lo-trinh-du-lieu.md`: «số … `hoan_tat` để sắp xếp, vẽ thanh, so với hôm nay»).
- **Lý do chưa có ngày**: mốc còn việc mà `moc.gio_may` là `null` → bản lộ trình đời trước (kit không ghi `gio_may` cho
  mốc còn việc chỉ khi trang vẽ không qua lớp giờ máy); có `gio_may` mà `du_kien` `null` → chưa việc nào của mốc được mở
  từ kit 2.32.0.

### Chữ do CRM dựng, không chép chữ kit

`gio_may.chu`, `du_kien.chu`, `qua_tai` của kit chỉ có tiếng Việt và mang từ nội bộ («hạng ngoài bảng luật»,
«% hạn mức tuần»). Trang có tiếng Anh, nên CRM dựng chữ từ số (`thap`, `cao`, `hoan_tat`, `ngay_tinh`) và từ sự có mặt
của `co`/`qua_tai`. Phần trăm hạn mức tuần không hiện: đó là hạn mức tài khoản máy của chủ kho, không phải thông tin
cho trưởng phòng ban.

### Lời ước, không phải cam kết

Mọi ngày mang chữ «dự kiến» («Dự kiến xong …», dạng gọn «dự kiến dd/mm»). Dạng đủ thêm một câu cách tính: máy tính lúc
mốc bắt đầu, coi như chỉ mình mốc ấy đang chạy — đúng giả định của kit 2.32.0 (hạt giống kit 17/10 «giờ máy theo mốc
không xếp nối tiếp»). Không màu success/error cho ngày; cờ quá tải và đã qua dùng nghĩa «chờ, rủi ro» (`warning`).

### Hộp cảnh báo khuôn

Bộ đọc mới thêm một câu cảnh báo cho trang đời trước («… chưa có giờ máy và ngày dự kiến …»). Trang không đưa câu đó lên
hộp «Trang có thể thiếu một phần» (hộp ấy nói dữ liệu MỚI hơn trang — ngược nghĩa); cờ «Bản lộ trình này chưa mang ngày
dự kiến» trên từng mốc đã nói đúng chuyện.

## Giới hạn đã biết từ trước (đưa vào Known limits)

1. Kit 2.32.0 tính mốc bắt đầu HÔM NAY trừ khi có `dung_tren`, và cộng giờ 24/24 — ngày của nhiều mốc song song có thể
   vô nghĩa (đo 17/10: «Lộ trình bước 2» hoàn tất 17/10). Trang không sửa phép tính; trang luôn ghi «dự kiến», nói cách
   tính, và gắn cờ khi số đo chưa đủ. Sửa phép tính là việc của kit (hạt giống 17/10).
2. Kit 2.32.0 vẽ `LO-TRINH.html` trong worktree đọc tín hiệu ở thư mục chính, nên bản vẽ lệch CI. Tới khi 2.32.1 về,
   vòng này vẽ trang trong một bản `git clone --no-hardlinks` độc lập.
3. Ngày dự kiến chỉ có cho mốc có việc mở bằng kit từ 2.32.0 (dự báo đóng băng lúc mở việc). 6/7 mốc đang chạy hôm nay
   sẽ hiện cờ «chưa có ngày» tới lần mở việc kế của mốc.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: Trưởng phòng ban mở Lộ trình → chọn «Mốc» → mỗi mốc đang chạy có dòng «Dự kiến xong 17 thg 10, 2026» kèm cờ và
  câu cách tính → bấm một việc → ngăn hồ sơ có «Ngày dự kiến» và «Ước lượng» (điểm ra: đóng ngăn).
- Biên: mốc chưa có việc mở từ khi máy tính ngày → cờ «Chưa có ngày dự kiến» + lý do; mốc hết việc → không dòng nào; bản lộ
  trình đời trước → cờ trên mọi mốc đang chạy, không hộp cảnh báo khuôn.
- Lỗi & quay lại: ngày trong khối sai dạng → cờ «chưa có» lý do «không đọc được», phần còn lại của trang vẫn hiện.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Lộ trình › Mốc | Thấy mỗi mốc đang chạy dự kiến xong khi nào | thanh bên / ngăn hồ sơ việc |
| Lộ trình › Bảng (và Bảng cột) | Thấy mỗi việc chưa giao dự kiến xong khi nào | thanh bên / ngăn hồ sơ việc |
| Ngăn hồ sơ việc | Đọc ngày dự kiến, cách tính và ước lượng của một việc | bảng, mốc / đóng ngăn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-du-kien-moc | Mốc | «Dự kiến xong <ngày>» + cờ «ước sơ bộ» / «sau ngày mục tiêu» + câu cách tính; mốc chưa ngày có cờ «Chưa có ngày dự kiến» + lý do | đọc, bấm việc |
| ST-du-kien-bang | Bảng | cột Mốc: ngày mục tiêu, «còn N ngày», «dự kiến dd/mm» + cờ, hoặc «Chưa có ngày dự kiến» | sắp theo mốc, bấm việc |
| ST-du-kien-ngan | Ngăn hồ sơ | «Ngày dự kiến» dạng đủ + «Ước lượng: 4–7 giờ máy» + cờ | đóng ngăn |
| ST-du-kien-da-qua | Mốc | thêm cờ «đã qua ngày dự kiến» | đọc |
| ST-du-kien-ban-cu | Mốc | mọi mốc đang chạy: «Chưa có ngày dự kiến — Bản lộ trình này chưa mang ngày dự kiến.» | báo đội sản phẩm |
| ST-du-kien-moc-en | Mốc (tiếng Anh) | «Expected by Oct 17, 2026», «rough estimate», «after target date» | như trên |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Dạng gọn trong cột Mốc dùng ngày ngắn theo ngôn ngữ (vi `17/10`, en `10/17`) để cột 375 px không cắt chữ; dạng đủ dùng
  `formatDay`.
- Ngày so với hôm nay theo ngày lịch của người xem (cùng `homNayNguoiXem`).
- Tên mốc, tên lộ trình giữ `translate="no"`; chữ ngày dự kiến là chữ của app, được dịch theo ngôn ngữ.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `StatusIndicator` | dùng | cờ quá tải, đã qua (`warning`), chưa có ngày (`neutral`) theo bảng nghĩa |
| `Badge variant="outline"` | dùng | cờ «ước sơ bộ» — nhãn, không phải trạng thái |
| `Timeline`, `DetailSheetProperty` | dùng | chỗ đặt có sẵn của mốc và ngăn |
| `formatDayShort`, `formatDecimal` | mở rộng `packages/ui/src/lib/format.ts` | định dạng ngày ngắn và số lẻ theo ngôn ngữ chưa có |
| `ODuKien`, `OUocLuong` | ghép (trong `apps/app/components/lo-trinh`) | chỉ trang Lộ trình dùng; ghép từ ba thành phần trên |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: trang Lộ trình đã là danh sách + ngăn hồ sơ (LT1, LT1b); việc này chỉ thêm một dòng vào chỗ có sẵn, không đổi khuôn.
<!-- UX-SPEC-TEMPLATE>>> -->

## Đường đo

- Thước 1 — tỷ lệ mốc đang chạy hiện ngày kèm «dự kiến» hoặc cờ «chưa có ngày» kèm lý do: bài kiểm chạy `duKienMoc` +
  `ODuKien` trên khối của `LO-TRINH.html` thật của cây (AC-8); đọc lại trên trang production ở phiên nghiệm thu.
- Thước 2 — độ lệch ở mốc khép đầu tiên: `du-bao.json` (`moc.hoan_tat`) của hồ sơ mở sớm nhất của mốc, so với ngày mốc
  hết việc mở trên `LO-TRINH.html` của `onehub` (`git log` của tệp). Đọc tay ở phiên nghiệm thu; lệch quá một ngày → gửi
  tín hiệu cho kit.
