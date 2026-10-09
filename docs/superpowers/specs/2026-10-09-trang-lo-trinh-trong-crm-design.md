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
chỉ OKR. **Khung là khung danh sách của Thoả thuận và Onboarding** — cùng cấu trúc: một danh sách bản ghi
(việc ↔ thoả thuận / kế hoạch), mỗi bản ghi có trạng thái, người/nhóm, mốc ngày. Chủ kho chốt 09/10: không
dùng thanh điều hướng con theo nhóm; nhóm, mốc, lộ trình, trạng thái là các chiều khác nhau nên mỗi chiều là
một bộ lọc riêng.

- **Đầu trang:** tiêu đề «Lộ trình» + một câu; không nút hành động (trang chỉ xem).
- **Một danh sách cho mọi lộ trình của kho** (bảng dữ liệu dùng chung `DataTable`), thanh công cụ đúng thứ tự
  của Thoả thuận: ô tìm (câu mô tả, mã) · thẻ vòng đời «Chưa xong» (mặc định) / «Đã giao» / «Xếp lại sau» /
  «Tất cả» (như «Đang mở / Đã đóng» của Thoả thuận, «Đang chạy / Đã đóng» của Onboarding) · «Bảng | Bảng cột | Mốc»
  · bên phải: «Lọc» (ba chiều riêng: **Lộ trình**, **Nhóm**, **Mốc** — mốc có «Trễ mốc» và «Chưa hẹn mốc»),
  «Sắp xếp», «Cột», nút bật «Đã bác» (như «Lưu trữ» của Thoả thuận).
- **Cột:** Việc (câu mô tả đậm + mã · nhóm · số chỗ lệch) · Lộ trình (ẩn dưới md) · Trạng thái (ẩn dưới sm;
  khổ hẹp hiện dưới câu mô tả) · Mốc (ngày, dưới là «còn n ngày» hoặc nhãn «Trễ n ngày» — theo ý dòng
  «12 days left» của block ReUI `data-grid-filtering-4`). Mặc định xếp theo mốc gần nhất. Dòng tổng dưới bảng
  và phân trang như Thoả thuận.
- **Có việc trễ → khung cảnh báo trên bảng** «n việc đã qua mốc mà chưa giao» kèm nút «Xem việc trễ» (đặt bộ lọc
  Mốc = Trễ mốc) — thay cho dải «ghim rủi ro» của `data-grid-filtering-4` bằng thành phần của kho.
- **Cách xem «Mốc»:** dòng thời gian các mốc có việc trong phạm vi lọc, ngày nằm trên thanh bên trái (bố cục ví dụ
  ReUI `c-timeline-2`, dựng bằng `Timeline` đã cài), mỗi mốc liệt việc gắn với nó; cuối là «Chưa hẹn mốc» gập.
- **Bảng cột:** `Board` chỉ đọc của Thoả thuận; thanh công cụ thêm **«Chia cột theo»** Trạng thái / Nhóm / Lộ
  trình — đúng nếp «Chia cột theo» của Onboarding. Mốc không chia cột (16 cột cuộn ngang) mà có cách xem riêng.
- **Bấm một dòng/thẻ → ngăn hồ sơ bên phải** như hồ sơ thoả thuận: tiêu đề, dải bốn ô (Trạng thái · Mốc · Lộ
  trình · Nhóm), cờ lệch, «Chi tiết» (coi là thành công khi, vì sao), «Cần xong trước», «Việc đang chờ việc
  này» (bấm để chuyển).
- **Nhãn trạng thái:** chữ chính là nhóm trạng thái dễ hiểu; chữ của khối thành dòng phụ khi thêm nghĩa.
- Lộ trình lỗi hay khuôn mới hơn bộ đọc: khung cảnh báo trên bảng; các lộ trình khác vẫn hiện.
- Bỏ khỏi trang: bốn ô số tổng quan, «Việc kế tiếp», «Chỗ cần sửa trong kế hoạch» — thứ của đội sản phẩm, đã có
  ở `LO-TRINH.html`; tiến độ đọc từ dòng tổng và số đếm trong thẻ/bộ lọc.

Mọi câu máy của bộ đọc chỉ nằm trong phần gập «Chi tiết cho đội sản phẩm». Chữ của tệp kế hoạch hiện nguyên
văn và mang `translate="no"`. Nhãn của trang theo tệp lời `apps/app/lib/messages/lo-trinh.ts`.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: thanh điều hướng «Lộ trình» → danh sách «Chưa xong» xếp theo mốc → «Lọc» chọn nhóm/lộ trình/mốc → bấm một việc → ngăn hồ sơ (điểm ra: đóng ngăn, hoặc gửi đường dẫn đã lọc)
- Biên: bộ lọc không còn việc nào → khung «không có việc khớp» + nút bỏ lọc (khung của bảng dùng chung); lộ trình không có mốc; vai chỉ OKR
- Lỗi & quay lại: tệp vắng, chưa có khối, khối hỏng, khuôn lạ → khung trống thay cho bảng; một lộ trình lỗi → khung cảnh báo trên bảng, việc của các lộ trình khác vẫn hiện

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Lộ trình · Bảng | Việc nào chưa xong, của nhóm nào, hẹn mốc nào | thanh điều hướng / đường dẫn được gửi |
| Lộ trình · Bảng cột | Nhìn việc chia theo một chiều chọn được (trạng thái, nhóm, lộ trình) | nút «Bảng cột» |
| Lộ trình · Mốc | Mốc nào sắp tới, việc nào gắn với nó, việc nào chưa hẹn mốc | nút «Mốc» |
| Lộ trình · Đã bác | Việc đã cân nhắc và quyết không làm, kèm lý do | nút bật «Đã bác» |
| Ngăn hồ sơ việc | Vì sao, thành công khi nào, cần gì xong trước | bấm dòng / thẻ / việc liên quan |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-lotrinh-day-du | Bảng | thẻ «Chưa xong», xếp theo mốc, dòng tổng, phân trang | tìm, lọc, bấm dòng |
| ST-lotrinh-tab | Bảng | thẻ «Đã giao» | đổi thẻ |
| ST-lotrinh-loc | Bảng | lọc nhóm okr, «Lọc (1)» | bỏ lọc |
| ST-lotrinh-tre | Bảng | lọc «Trễ mốc», nhãn «Trễ» ở cột mốc | bấm việc |
| ST-lotrinh-bang-cot | Bảng cột | chia theo trạng thái | đổi cách chia, bấm thẻ |
| ST-lotrinh-chia-moc | Mốc | dòng thời gian các mốc có việc khớp lọc, thanh ngày bên trái, «Chưa hẹn mốc» gập | bấm việc |
| ST-lotrinh-chi-tiet | Ngăn hồ sơ | dải bốn ô, chi tiết, cần xong trước, việc đang chờ | bấm việc liên quan, đóng |
| ST-lotrinh-da-bac | Bảng | bảng việc đã bác kèm lý do | tắt «Đã bác» |
| ST-lotrinh-dang-tai | Bảng | khung xương thanh công cụ + bảng | chờ |
| ST-lotrinh-chua-co-khoi | Lộ trình | Empty: chưa có lộ trình ở đây; câu của bộ đọc trong phần gập | báo đội sản phẩm |
| ST-lotrinh-khoi-hong | Lộ trình | Empty: không tải được lộ trình; câu của bộ đọc trong phần gập | báo đội sản phẩm |
| ST-lotrinh-tep-vang | Lộ trình | Empty: không tải được lộ trình | báo đội sản phẩm |
| ST-lotrinh-lo-loi | Bảng | khung cảnh báo một lộ trình lỗi; việc các lộ trình khác vẫn hiện | đọc tiếp |
| ST-lotrinh-khuon-moi | Bảng | dữ liệu đủ + khung vàng «trang có thể thiếu một phần» | đọc như thường |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Thẻ, bộ lọc, cách xem, cách chia, tìm, trang giữ trên đường dẫn (cùng bộ tham số danh sách của Thoả thuận); giá trị lạ rơi về mặc định
- Khổ hẹp: thẻ vòng đời gộp vào «Lọc (n)» như Thoả thuận; cột Lộ trình và Trạng thái ẩn, trạng thái hiện dưới câu mô tả
- Phần phụ thuộc ngày (nhãn «Trễ», lọc «Trễ mốc») chỉ hiện sau khi trình duyệt nhận trang
- Số dùng `tabular-nums`; ngày theo `Intl.DateTimeFormat`

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| PageShell + Title/Description | dùng | khung mọi trang |
| DataTable (tìm, tabs, facets, sắp xếp, cột, phân trang, dòng tổng) | dùng | khung danh sách của Thoả thuận và Onboarding |
| ToggleGroup outline spacing 0 «Bảng \| Bảng cột», «Chia cột theo» | dùng | nút xem và chia cột của Thoả thuận / Onboarding |
| Board (chỉ đọc) | dùng | bảng cột của Thoả thuận, không kéo-thả khi không truyền hàm di chuyển |
| Sheet + dải ô + SectionHeading h4 | ghép | ngăn hồ sơ theo dáng hồ sơ thoả thuận |
| StatusIndicator size sm | dùng | chấm trạng thái |
| Badge outline «Trễ» | dùng | nhãn trễ ở cột mốc |
| Button outline/contrast «Đã bác» | dùng | nút bật như «Lưu trữ» |
| Alert, Empty, Collapsible, Skeleton | dùng | cảnh báo, khung trống, chi tiết cho đội sản phẩm, chờ tải |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: khung danh sách + ngăn hồ sơ của chính hệ — Thoả thuận (`deals-table.tsx`: DataTable với tabs vòng đời, «Bảng | Bảng cột», Lọc theo chiều, ngăn hồ sơ) và Onboarding (`danh-muc-table.tsx`: cùng khung, «Chia cột theo» ở bảng cột). Hai phương án trước bị chủ kho bác 09/10: một-cột-cuộn (khối xếp theo dữ liệu, mốc rơi xuống đáy) và thanh nhóm bên trái kiểu OKR theo đơn vị (gộp nhóm thành điều hướng trong khi nhóm, mốc, lộ trình là các chiều lọc riêng).
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
- Hiện dòng lệnh mở việc, hiện hồ sơ nghiệm thu.
- Gộp lộ trình của kho khác.
