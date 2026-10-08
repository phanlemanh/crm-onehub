# Trang Lộ trình trong CRM — thiết kế

Hồ sơ: `_acceptance/trang-lo-trinh-trong-crm/` (Cổng Đáng `build`, 08/10). Hàng LT1 của `docs/plan/lo-trinh-okr.json`.

## Mục đích

Trưởng phòng ban mở một trang trong CRM, chọn luồng việc mình quan tâm, và thấy mỗi việc đang ở đâu, gắn mốc
nào, mốc đã qua chưa — không phải hỏi ai. Trang chỉ đọc. Nguồn ý định vẫn là git; trang không ghi gì.

Người đo: ít nhất 3 trưởng phòng ban trả lời đúng «việc này đang ở đâu, bao giờ xong» từ trang trong một
phút, ở phiên nghiệm thu (ngưỡng đã chốt ở Cổng Đáng).

## Nguồn dữ liệu

Một nguồn duy nhất: khối `<script type="application/json" id="lo-trinh-du-lieu">` trong `LO-TRINH.html` ở gốc
kho, khuôn `lo-trinh-du-lieu` phiên bản 1 (đặc tả: `skills/acceptance/references/lo-trinh-du-lieu.md` của bộ
kit, từ 2.27). Bộ vẽ của kit sinh khối đó cùng lượt với trang; CI của kho chạy `product-map.mjs --check` nên
tệp trong git luôn khớp hồ sơ.

- **Đọc ở đâu.** Trang máy chủ đọc `LO-TRINH.html` từ chính cây đã dựng của bản đang chạy. Bản production dựng
  từ `onehub` nên «tệp của bản đang chạy» là «tệp của nhánh chính». Không gọi GitHub, không giữ khoá.
- **Đưa tệp vào bản dựng.** Tệp nằm ngoài `apps/app`, nên cấu hình dựng khai nó cho đường `/[slug]/lo-trinh`
  (`outputFileTracingIncludes`). Phép đo đọc danh sách tệp của bản dựng thật để chắc tệp có mặt; không có
  mặt thì trang hiện «không đọc được lộ trình trong bản đang chạy», không trắng.
- **Rút khối.** `apps/app/lib/lo-trinh/doc-du-lieu.js` là bản chép NGUYÊN hàm `docDuLieu(html)` của
  `scripts/lo-trinh.mjs` trong bộ kit — từ dòng `export function docDuLieu` tới dấu `}` đóng hàm, không sửa
  một ký tự. Hàm tự đủ, không ném, trả `{ duLieu, canhBao }`.
- **Phân tích ở biên.** `packages/validation/src/lo-trinh-du-lieu.ts` giữ khuôn Zod của phiên bản 1 (đúng
  bảng khoá `LO-TRINH-DU-LIEU-KHOA`), xuất kiểu bằng `z.infer`. `duLieu` đi qua khuôn đúng một lần ở trang
  máy chủ; từ đó trở xuống chỉ có kiểu đã phân tích. Khoá thiếu thì `docDuLieu` đã điền rỗng theo kiểu, đúng
  như đặc tả khối quy định; khoá sai kiểu là lỗi thật có tên đường khoá (khung «dữ liệu lộ trình hỏng»),
  không nuốt thành danh sách rỗng.
- **Không tự tính trạng thái.** Chữ trạng thái, nhóm trạng thái, tiến độ, việc kế, cờ, chỗ cần sửa đều đọc
  thẳng từ khối. Không mã nào của trang đọc `_acceptance/` hay tệp kế hoạch. Việc duy nhất trang tự làm là so
  ngày mốc với hôm nay, bằng hai hàm `mocQuaConViec` và `viecTre` chép nguyên từ khối
  `LO-TRINH-DU-LIEU-LUAT-NGAY`.
- **Hôm nay là ngày của người xem.** So ngày chạy ở trình duyệt, theo giờ máy người xem (`YYYY-MM-DD` dựng từ
  ngày địa phương). Trước khi trình duyệt nhận trang, phần phụ thuộc ngày chưa hiện (không lệch hydrat).

Trước khi crm nhận bộ kit 2.27, `LO-TRINH.html` của kho chưa mang khối: trang hiện đúng câu «trang chưa mang
dữ liệu lộ trình» của bộ đọc, không vỡ. Phép đo của vòng dùng tệp mẫu do chính bộ vẽ của kit sinh ra
(round-trip), không dùng khối tự dựng tay.

## Màn

Một màn `/[slug]/lo-trinh`, mục «Lộ trình» trên thanh điều hướng, mọi vai đã đăng nhập đều thấy, kể cả vai
chỉ OKR. **Bố cục theo đúng khuôn của khu OKR** (Của tôi / Theo đơn vị / Toàn cảnh), vì từ 14/10 trưởng phòng
ban dùng khu đó hằng ngày — họ không phải học cách đọc thứ hai.

- **Đầu trang:** tiêu đề «Lộ trình» + một câu: việc đội sản phẩm đang làm cho CRM; trang chỉ để xem, muốn đổi
  kế hoạch thì báo đội sản phẩm. Không nút hành động.
- **Hàng thẻ con = cách xem** (gạch chân, giữ trên đường dẫn `?xem=`): «Theo nhóm» (mặc định) · «Theo mốc» ·
  «Toàn cảnh». **Bên phải hàng thẻ: bộ chọn lộ trình** (OKR · Kho tài liệu · Việc và Dự án, `?lo=`) — đúng chỗ
  bộ chọn «Quý» của OKR; sau này bộ chọn kho đứng cạnh nó.
- **Theo nhóm** (khuôn danh sách-chi tiết của «OKR theo đơn vị»): cột trái 18rem là danh sách nhóm kèm
  «đã giao/tổng» (dưới lg đổi thành ô chọn); cột phải: tên nhóm + một dòng đếm, nút «Danh sách | Bảng cột»,
  rồi việc chia ba khối theo câu người xem hỏi — **Trễ mốc** → **Sắp tới** (xếp theo ngày mốc, chưa hẹn mốc
  xuống cuối) → **Đã giao** (thu gọn mặc định). Bảng cột là `Board` chỉ đọc của Thoả thuận, cột theo nhóm
  trạng thái.
- **Theo mốc:** dòng thời gian các mốc (ReUI Timeline), mỗi mốc kèm việc gắn với nó; cuối trang «Chưa hẹn mốc»
  thu gọn.
- **Toàn cảnh** (khuôn Toàn cảnh OKR): bốn ô số (Đã giao x/tổng · Đang làm · Chưa bắt đầu · Trễ mốc), bảng
  «Theo nhóm» với thanh đã giao, rồi hai mục gập «Việc đã bác» và «Dành cho đội sản phẩm» (việc kế tiếp, chỗ
  cần sửa trong kế hoạch — hai thứ chỉ đội sản phẩm cần).
- **Bấm một việc ở bất kỳ đâu → ngăn chi tiết bên phải** (như bấm một thoả thuận): trạng thái, mốc, coi là
  thành công khi, vì sao, cờ lệch, «Cần xong trước», «Việc đang chờ việc này» (bấm để chuyển sang việc đó).
- **Nhãn trạng thái:** chữ chính là nhóm trạng thái dễ hiểu (Đã giao / Đang làm / Chưa bắt đầu / Khác); chữ
  của khối hiện thành dòng phụ khi nó thêm nghĩa («Đã giao — chờ phiên nghiệm thu», «Sắp mở vòng»).
- **Cảnh báo của bộ đọc** (`canhBao`) hiện thành khung ở dưới hàng thẻ.

Mọi câu máy của bộ đọc chỉ nằm trong phần gập «Chi tiết cho đội sản phẩm». Chữ của tệp kế hoạch hiện nguyên
văn ở cả hai ngôn ngữ giao diện và mang `translate="no"`. Nhãn của trang theo tệp lời `apps/app/lib/messages/lo-trinh.ts`.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: thanh điều hướng «Lộ trình» → «Theo nhóm» (mặc định) → chọn nhóm ở cột trái → đọc khối Trễ mốc / Sắp tới → bấm một việc → ngăn chi tiết (điểm ra: đóng ngăn, hoặc gửi đường dẫn đã chọn nhóm)
- Biên: đường dẫn mang một nhóm không còn trong lộ trình → hiện mọi việc (bộ lọc chỉ liệt giá trị có thật nên danh sách không bao giờ rỗng vì lọc); lộ trình không có mốc; vai chỉ OKR
- Lỗi & quay lại: tệp vắng, trang chưa mang khối, khối hỏng, khuôn lạ → một khung nói rõ chuyện gì và ai sửa, không có danh sách; một lộ trình mang lỗi → khung lỗi trong thẻ đó, các thẻ khác vẫn đọc được

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Lộ trình · Theo nhóm | Việc của một luồng đang ở đâu, cái gì trễ, cái gì sắp tới | thanh điều hướng / đường dẫn được gửi |
| Lộ trình · Theo mốc | Mốc nào sắp tới và việc nào gắn với nó | thẻ con |
| Lộ trình · Toàn cảnh | Cả lộ trình tới đâu, nhóm nào chậm | thẻ con |
| Ngăn chi tiết việc | Vì sao, thành công khi nào, cần gì xong trước | bấm một việc / bấm việc liên quan |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-lotrinh-day-du | Theo nhóm | cột nhóm + khối Sắp tới, Đã giao thu gọn | chọn nhóm, bấm việc |
| ST-lotrinh-theo-moc | Theo mốc | dòng thời gian mốc kèm việc | bấm việc |
| ST-lotrinh-toan-canh | Toàn cảnh | bốn ô số, bảng theo nhóm, mục gập | đọc |
| ST-lotrinh-bang-cot | Theo nhóm | bảng cột theo trạng thái | bấm thẻ |
| ST-lotrinh-chi-tiet | Ngăn chi tiết | trạng thái, mốc, thành công khi, cần xong trước, việc đang chờ | bấm việc liên quan, đóng |
| ST-lotrinh-dang-tai | Lộ trình | khung chờ của PageShell | chờ |
| ST-lotrinh-tre | Theo nhóm | khối «Trễ mốc» đứng đầu; ô «Trễ mốc» ở Toàn cảnh | bấm việc |
| ST-lotrinh-chua-co-khoi | Lộ trình | Empty: lộ trình chưa có ở đây; câu của bộ đọc trong phần gập «Chi tiết cho đội sản phẩm» | báo đội sản phẩm |
| ST-lotrinh-khoi-hong | Lộ trình | Empty: không đọc được lộ trình (khối không phải JSON, khuôn lạ, sai kiểu); câu của bộ đọc và đường khoá trong phần gập | báo đội sản phẩm |
| ST-lotrinh-tep-vang | Lộ trình | Empty: không đọc được lộ trình trong bản đang chạy | báo đội sản phẩm |
| ST-lotrinh-lo-loi | Lộ trình | khung lỗi trong thẻ của lộ trình hỏng, câu `loi` nguyên văn trong phần gập | đọc thẻ khác |
| ST-lotrinh-khuon-moi | Lộ trình | dữ liệu đầy đủ + khung vàng «khuôn mới hơn bộ đọc» | đọc như thường |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Thẻ và bộ lọc giữ trên đường dẫn (`?lo=`, `?nhom=`); giá trị lạ trên đường dẫn rơi về mặc định, không lỗi
- Từ md: bảng bốn cột (Việc · Nhóm · Trạng thái · Mốc); dưới md: thẻ dọc, bộ lọc cuộn ngang trong khung riêng, trang không cuộn ngang
- Phần phụ thuộc ngày (đã qua, trễ) chỉ hiện sau khi trình duyệt nhận trang; số liệu khác hiện ngay
- Số dùng `tabular-nums`; ngày hiện theo `Intl.DateTimeFormat` của ngôn ngữ giao diện

### 5. Xuất xứ component

Đối chiếu ngày 09/10 với bảy màn đang chạy (Thoả thuận, Onboarding, Liên hệ, Nhắc buổi sáng, Toàn cảnh OKR,
Tài liệu, Tổng quan) ở hai khổ; trang theo nếp của Tài liệu và Toàn cảnh OKR — hai trang cùng loại «đọc là chính».

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| PageShell + Header/Heading/Title/Description | dùng | khung mọi trang; tiêu đề lớn + một câu mô tả; trang chỉ đọc nên không có nút hành động |
| Tabs, TabsList variant="line" + Badge secondary đếm việc | dùng | nếp thẻ con của Toàn cảnh OKR và Tài liệu |
| StatGroup + StatCard | dùng | bốn con số tiến độ, đúng nếp Toàn cảnh OKR |
| ToggleGroup outline sm, số đếm `text-muted-foreground tabular-nums` | dùng | nếp chip lọc của Tài liệu |
| SimpleTable surface="page" (từ md) · Item outline (dưới md) | dùng | nếp danh sách của Tài liệu: bảng ở máy tính, thẻ dọc ở điện thoại |
| StatusIndicator size="sm" | dùng | chấm trạng thái; ánh xạ màu theo nếp chung (đã giao → success, đang làm → info, còn lại → neutral) |
| Card + CardHeader/Title/Description | dùng | mục «Việc kế tiếp» và «Mốc»; không dùng SectionHeading — các trang hiện có đều dùng CardTitle |
| Timeline (ReUI, đã cài trong packages/ui) | dùng | mục Mốc theo ngày, dạng thanh mốc như block ReUI `timeline-5`; mốc đã qua tô đậm |
| Alert warning | dùng | việc trễ, cảnh báo khuôn mới |
| Empty (không viền) + EmptyContent | dùng | khung trống theo nếp «Chưa có …» / «Không tải được …» kèm điều vẫn dùng được |
| Collapsible + Button ghost | dùng | «Chi tiết cho đội sản phẩm», chỗ cần sửa, việc đã bác |
| Skeleton theo hình mục | dùng | lúc đang tải giữ tiêu đề trang, khung chờ theo đúng hình bốn ô số + bảng (docs/settings.md mục Trạng thái) |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: theo khuôn sẵn có của chính hệ — «OKR theo đơn vị» (cột nhóm 18rem + nội dung, khổ hẹp đổi ô chọn) và hàng thẻ con + bộ chọn phạm vi bên phải của khu OKR; đã thử một-cột-cuộn (lượt trước) và bỏ: 64 dòng dài, mốc rơi xuống đáy sau danh sách, việc kế tiếp và chỗ cần sửa (chỉ đội sản phẩm cần) chiếm chỗ đầu. Tra Mobbin 09/10 (Featurebase kanban, Shopify Rollouts bảng) cho phần bảng cột / danh sách.
<!-- UX-SPEC-TEMPLATE>>> -->

## Đường đi của dữ liệu

```
LO-TRINH.html (gốc kho, do bộ vẽ của kit sinh)
  → trang máy chủ /[slug]/lo-trinh: đọc tệp → docDuLieu (chép nguyên) → khuôn Zod (packages/validation)
  → thành phần khách: chọn thẻ, lọc nhóm, so ngày mốc với hôm nay của người xem
```

## Phép đo (tóm tắt — đầy đủ ở evals.yaml)

- Tệp mẫu `apps/app/test/fixtures/lo-trinh/LO-TRINH.mau.html` do chính bộ vẽ của kit sinh trên kho này
  (lệnh sinh ghi ở `_acceptance/trang-lo-trinh-trong-crm/rang/sinh-mau.mjs`), không dựng tay.
- Bài kiểm thành phần so từng việc trên màn với từng hàng của khối (cùng lượt vẽ).
- Bài kiểm so bản chép `docDuLieu` với hàm của bộ kit theo văn bản.
- Bài kiểm luật ngày chạy ma trận ngày × hai múi giờ.
- Bản dựng thật: danh sách tệp của đường `/[slug]/lo-trinh` có `LO-TRINH.html`, và hàm đọc của trang chạy
  trong bản sao chỉ gồm đúng các tệp đó vẫn đọc ra khối.
- Đo màn thật: hai khổ, vai chỉ OKR.

## Không làm

- Ghi ý định, trạng thái, chữ ký từ CRM.
- Lọc theo phòng ban thật (cần kit thêm khoá).
- Dòng «vẽ lúc …» (khối chưa mang thời điểm vẽ).
- Tìm việc theo chữ.
- Hiện dòng lệnh mở việc, hiện hồ sơ nghiệm thu.
- Gộp lộ trình của kho khác.
