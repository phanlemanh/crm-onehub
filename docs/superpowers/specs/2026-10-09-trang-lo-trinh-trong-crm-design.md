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

Một màn: `/[slug]/lo-trinh`, mục «Lộ trình» trên thanh điều hướng, mọi vai đã đăng nhập đều thấy, kể cả vai
chỉ OKR.

- **Đầu trang:** tiêu đề «Lộ trình», một câu mô tả: việc đội sản phẩm đang làm cho CRM; trang chỉ để
  xem, muốn đổi kế hoạch thì báo đội sản phẩm.
- **Một thẻ cho mỗi lộ trình của kho** (hôm nay: OKR, Kho tài liệu, Việc và Dự án), giữ trên đường dẫn
  (`?lo=`). Trong mỗi thẻ:
  - Tiến độ: bốn con số «Đã giao · Đang làm · Chưa bắt đầu · Khác» trên tổng, đúng `tien_do`.
  - Việc kế tiếp: mã và câu giao của `hang_ke`; không hiện dòng lệnh mở việc.
  - Việc trễ: các việc gắn một mốc đã qua mà chưa giao, nếu có — khung cảnh báo.
  - Lọc theo nhóm: các giá trị `nhom` có trong lộ trình đó, cộng «Tất cả» và «Không nhóm» khi có việc không
    nhóm; giữ trên đường dẫn (`?nhom=`) để gửi cho người khác.
  - Danh sách việc (danh sách dọc ở mọi khổ): câu giao làm dòng chính; dòng phụ gồm trạng thái (chấm màu
    theo nhóm trạng thái + chữ của khối) · mã · nhóm · mốc (ngày của mốc đầu tiên chứa việc đó, kèm «trễ»
    khi việc nằm trong danh sách việc trễ của luật ngày). Việc có cờ hiện cờ ngay dưới dòng.
  - Mốc: danh sách mốc theo ngày, mốc đã qua mà còn việc chưa giao được đánh dấu.
  - Thu gọn mặc định: «Chỗ cần sửa trong kế hoạch (n)», «Việc đã bác (n)».
- **Cảnh báo của bộ đọc** (`canhBao`, ví dụ khuôn mới hơn bộ đọc) hiện thành khung ở đầu trang.

Mọi câu máy của bộ đọc (lý do không có khối, câu lỗi của một lộ trình, đường khoá sai kiểu) chỉ nằm trong
phần gập «Chi tiết cho đội sản phẩm» của khung tương ứng; người xem đọc câu thường của trang.

Chữ của tệp kế hoạch — câu giao, tên lộ trình, chữ trạng thái, cờ, tên mốc — hiện nguyên văn ở cả hai ngôn
ngữ giao diện và mang `translate="no"`. Nhãn của trang theo tệp lời `apps/app/lib/messages/lo-trinh.ts`.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: thanh điều hướng «Lộ trình» → thẻ lộ trình (mặc định thẻ đầu) → chọn nhóm → đọc trạng thái và mốc của việc (điểm ra: đóng trang, hoặc gửi đường dẫn đã lọc)
- Biên: đường dẫn mang một nhóm không còn trong lộ trình → hiện mọi việc (bộ lọc chỉ liệt giá trị có thật nên danh sách không bao giờ rỗng vì lọc); lộ trình không có mốc; vai chỉ OKR
- Lỗi & quay lại: tệp vắng, trang chưa mang khối, khối hỏng, khuôn lạ → một khung nói rõ chuyện gì và ai sửa, không có danh sách; một lộ trình mang lỗi → khung lỗi trong thẻ đó, các thẻ khác vẫn đọc được

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Lộ trình | Cho người không dùng git biết mỗi việc đang ở đâu và mốc nào | thanh điều hướng / đường dẫn được gửi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-lotrinh-day-du | Lộ trình | thẻ lộ trình, tiến độ, việc kế, danh sách việc, mốc | chọn nhóm, đọc |
| ST-lotrinh-dang-tai | Lộ trình | khung chờ của PageShell | chờ |
| ST-lotrinh-tre | Lộ trình | khung cảnh báo liệt mã các việc trễ | đọc, hỏi người phụ trách |
| ST-lotrinh-chua-co-khoi | Lộ trình | Empty: lộ trình chưa có ở đây; câu của bộ đọc trong phần gập «Chi tiết cho đội sản phẩm» | báo đội sản phẩm |
| ST-lotrinh-khoi-hong | Lộ trình | Empty: không đọc được lộ trình (khối không phải JSON, khuôn lạ, sai kiểu); câu của bộ đọc và đường khoá trong phần gập | báo đội sản phẩm |
| ST-lotrinh-tep-vang | Lộ trình | Empty: không đọc được lộ trình trong bản đang chạy | báo đội sản phẩm |
| ST-lotrinh-lo-loi | Lộ trình | khung lỗi trong thẻ của lộ trình hỏng, câu `loi` nguyên văn trong phần gập | đọc thẻ khác |
| ST-lotrinh-khuon-moi | Lộ trình | dữ liệu đầy đủ + khung vàng «khuôn mới hơn bộ đọc» | đọc như thường |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Thẻ và bộ lọc giữ trên đường dẫn (`?lo=`, `?nhom=`); giá trị lạ trên đường dẫn rơi về mặc định, không lỗi
- Khổ 375px: danh sách dọc như khổ rộng, bộ lọc xuống dòng, không cuộn ngang
- Phần phụ thuộc ngày (đã qua, trễ) chỉ hiện sau khi trình duyệt nhận trang; số liệu khác hiện ngay
- Số dùng `tabular-nums`; ngày hiện theo `Intl.DateTimeFormat` của ngôn ngữ giao diện

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| PageShell, PageShellTitle | dùng | khung trang của mọi trang ứng dụng |
| Tabs | dùng | một thẻ mỗi lộ trình |
| ToggleGroup | dùng | bộ lọc nhóm ít giá trị, thấy hết một lần |
| Item, ItemGroup | dùng | danh sách việc và mốc — một việc một khối, đọc được ở 375px |
| Progress | dùng | thanh tỉ lệ đã giao trên tổng |
| StatusIndicator | dùng | chấm màu nhóm trạng thái |
| danh sách định nghĩa (dl) | tạo tại chỗ | bốn con số tiến độ — `StatTile` là nút bấm, trang chỉ đọc; xem finding Nhóm 2 |
| Alert | dùng | việc trễ, cảnh báo bộ đọc, lỗi một lộ trình |
| Empty | dùng | các trạng thái không có dữ liệu |
| Collapsible | dùng | chỗ cần sửa, việc đã bác |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: tra Mobbin «product roadmap page with status labels, team filter and target dates» (web, 09/10): Featurebase dựng kanban theo trạng thái, Shopify Rollouts dựng bảng có cột trạng thái và ngày. Lộ trình OKR có 64 việc mà 44 đã giao — kanban dồn một cột rất dài và mất mốc; danh sách một cột có bộ lọc nhóm trả lời đúng câu «việc của luồng tôi ở đâu, bao giờ». Bản mẫu thử bảng nhiều cột rồi bỏ: ở 375px cột trạng thái bóp câu giao còn vài chữ một dòng.
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
