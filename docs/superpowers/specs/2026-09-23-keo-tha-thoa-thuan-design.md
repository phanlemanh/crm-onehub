# Kéo thả thoả thuận giữa các giai đoạn — thiết kế

Hồ sơ nghiệm thu: `_acceptance/keo-tha-thoa-thuan/`. Hạng T2, chạm UI.

## Vì sao

Màn Thoả thuận chỉ có dạng bảng. Đổi giai đoạn phải mở menu trên từng dòng, và
không có chỗ nào nhìn cả phễu một lượt: bao nhiêu thoả thuận đang nằm ở giai đoạn
nào, trị giá bao nhiêu. Mọi CRM bán hàng đều có dạng bảng cột cho việc này
(HubSpot deals board, Pipedrive pipeline view). Kho đã có sẵn đường ghi
`deals.setStage` — kèm bắt lý do khi đóng thua — nên việc còn thiếu là một cách
xem và một câu truy vấn đọc theo giai đoạn.

## Thiết kế

**Một bảng cột cho cả kho.** `Board` trong `packages/ui` hiện là bảng cột chỉ
đọc mà màn 30 ngày đầu đang dùng. Nó nhận thêm chế độ kéo thả tuỳ chọn, chạy bằng
thành phần `kanban` miễn phí của ReUI, cài vào `packages/ui/src/components/reui/`
theo `docs/reui.md`. Không truyền `onMove` thì `Board` y như cũ, nên màn 30 ngày
đầu không đổi. Không dựng component bảng cột thứ hai.

**Đọc theo giai đoạn.** Thủ tục mới `deals.board` nhận đúng bộ lọc của
`deals.list` (tìm, người phụ trách, hạn chốt, trường tuỳ biến) trừ `stage`,
`status`, phân trang và lưu trữ. Nó trả bảy cột theo thứ tự phễu trong
`apps/app/lib/deal-stage.ts`; mỗi cột có tổng số, tổng giá trị quy về tiền báo
cáo (cộng `baseAmount`, như `openValueCents` của `deals.list`) và tối đa 50 thẻ
theo thứ tự sắp của bảng. Thoả thuận đã lưu trữ không vào bảng cột.

**Ghi bằng đường có sẵn.** Thả thẻ sang cột khác gọi `deals.setStage`, cùng quyền
và cùng hoạt động `STAGE_CHANGE` như menu giai đoạn. Thả vào «Closed lost» hoặc
«Unqualified» không ghi ngay mà mở hộp thoại lý do đã có (`CloseReasonDialog`,
qua tham số đường dẫn); huỷ hộp thoại thì thẻ về chỗ cũ. Thả vào cột khác thì thẻ
dời ngay, máy chủ từ chối thì thẻ về chỗ cũ kèm thông báo lỗi của máy chủ.

**Sửa trên bản ReUI đã cài.** Design-pass đo được năm chỗ `kanban` chưa đủ
cho kho; sửa ngay trong `packages/ui/src/components/reui/kanban.tsx`, không vá
ở chỗ gọi: (1) nhận `collisionDetection`, bảng cột dùng `pointerWithin` rồi mới
`rectIntersection` — mặc định làm thẻ thả vào cột rỗng rơi sang cột bên cạnh;
(2) `DndContext` nhận `id` từ `useId()` — thiếu thì lệch hydrate; (3) thuộc
tính kéo nằm trên tay kéo, thẻ không mang `role="button"` — thẻ chứa nút khác;
(4) `KanbanColumn` phơi `data-over` để `Board` vẽ ring cột đang trỏ; (5) tay kéo
đủ 44px chiều ngang trên màn chạm.

**Không sắp trong cột.** Không có trường thứ tự nào để lưu, nên kéo trong cùng
một cột không làm gì.

**Cách xem nằm trên đường dẫn.** Tham số `view` với hai giá trị `table` và
`board`, mặc định `table`. Nút chuyển là `ToggleGroup`, như màn 30 ngày đầu. Ở
chế độ lưu trữ, nút chuyển tắt và trang hiện dạng bảng.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: màn Thoả thuận → chọn «Bảng cột» → kéo thẻ từ «Demo booked» sang «Qualified to buy» → thẻ nằm ở cột mới, số đếm và tổng giá trị hai cột đổi, dòng thời gian của thoả thuận có hoạt động đổi giai đoạn (điểm ra: vẫn ở bảng cột).
- Suôn sẻ, đóng thua: kéo thẻ vào «Closed lost» → hộp thoại lý do → điền, Lưu → thẻ ở cột Closed lost.
- Biên: cột rỗng hiện chữ rỗng của `Board` và vẫn nhận thả; cột hơn 50 thẻ hiện «+N nữa»; bộ lọc không khớp gì thì bảy cột đều rỗng; thả vào chính cột cũ hoặc ra ngoài bảng thì không gọi máy chủ.
- Lỗi & quay lại: máy chủ từ chối → thẻ về cột cũ + thông báo lỗi; huỷ hộp thoại lý do → thẻ về cột cũ; tải bảng cột hỏng → lời báo lỗi và nút «Thử lại» trong vùng bảng, ô tìm vẫn hiện.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Thoả thuận · bảng cột | Dời thoả thuận giữa các giai đoạn và nhìn phễu | Từ nút chuyển cách xem / tới tấm thoả thuận khi bấm thẻ |
| Hộp thoại lý do đóng | Ghi vì sao thua hoặc không đủ điều kiện | Từ lần thả vào cột thua / về bảng cột |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-bangcot-dangtai | bảng cột | Bảy khung cột với vạch chờ; ô tìm, bộ lọc, nút chuyển vẫn hiện | Chờ |
| ST-bangcot-coduLieu | bảng cột | Bảy cột theo thứ tự phễu, mỗi cột: tên, số đếm, tổng giá trị, thẻ | Kéo, bấm thẻ, lọc |
| ST-bangcot-cotrong | bảng cột | Cột có tên và số 0, chữ rỗng của `Board`, vẫn là chỗ thả | Thả thẻ vào |
| ST-bangcot-khongkhop | bảng cột | Bảy cột đều 0 khi bộ lọc không khớp | Xoá bộ lọc |
| ST-bangcot-dangkeo | bảng cột | Bóng thẻ theo con trỏ, cột đang trỏ được đánh dấu | Thả hoặc Esc |
| ST-bangcot-dangluu | bảng cột | Thẻ đã ở cột mới, mờ và không kéo được tới khi máy chủ trả | Chờ |
| ST-bangcot-tuchoi | bảng cột | Thẻ về cột cũ, thông báo lỗi của máy chủ | Thử lại hoặc bỏ |
| ST-bangcot-loitai | bảng cột | Lời báo lỗi + «Thử lại» trong vùng bảng | Bấm Thử lại |
| ST-lydo-mo | hộp thoại lý do | Hộp thoại đã có, nút Lưu khoá tới khi có lý do | Điền và Lưu, hoặc Huỷ |
| ST-bangcot-luutru | Thoả thuận | Nút chuyển cách xem tắt, trang ở dạng bảng | Tắt lưu trữ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Bàn phím: mỗi thẻ có menu giai đoạn (`DealStageMenu`) — đường dời thẻ không cần chuột, dùng lại luồng hộp thoại lý do.
- Chạm: kéo bằng tay cầm trên thẻ; bảng cuộn ngang ở khổ hẹp, không tràn trang.
- Bấm thẻ (không kéo) mở tấm thoả thuận như bấm dòng bảng.
- Tên thoả thuận và tên công ty mang `translate="no"`.
- Lời thông báo cho trình đọc màn hình khi nhấc, dời và thả thẻ đi qua `accessibility` của `Kanban`, bằng tiếng của màn; trong lúc kéo không bôi chọn được chữ.
- Theo `docs/design.md`: cột đang trỏ khi kéo được đánh dấu bằng viền/ring, không tô nền; thẻ đang lưu mờ bằng trạng thái `disabled` có sẵn; mọi biến thể mới của `Board` nằm trong `packages/ui`, không có `className` tại chỗ gọi.
- Cột rỗng là một vùng thả thật: khung cột nhận thả, không chỉ các thẻ trong cột.
- Trần 50 thẻ mỗi cột thay cho cuộn ảo (quy tắc giao diện web: danh sách trên 50 phải ảo hoá).

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `reui/kanban` | dùng | Kéo thả nhiều cột, bóng kéo, cảm biến bàn phím — không tự viết lại trên dnd-kit |
| `Board` | mở rộng | Thêm chế độ kéo thả tuỳ chọn; màn 30 ngày đầu giữ nguyên |
| `DealStageMenu`, `CloseReasonDialog` | dùng | Đường đổi giai đoạn và bắt lý do đã có |
| `ToggleGroup` | dùng | Nút chuyển cách xem giống màn 30 ngày đầu |
| `OwnerCell`, `formatMoney`, `LocalDay` | dùng | Người phụ trách, số tiền, hạn chốt trên thẻ giống dòng bảng |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: kanban
Căn cứ: luồng hiển nhiên — đổi trạng thái của một entity qua các cột giai đoạn là đúng việc của kanban; HubSpot và Pipedrive đều dùng khuôn này cho phễu thoả thuận. Không tra thêm.
<!-- UX-SPEC-TEMPLATE>>> -->

## Kiểm

- API: `deals.board` trả đúng bảy cột, đếm, tổng, trần 50, tôn trọng bộ lọc, loại
  thoả thuận lưu trữ — bài kiểm tích hợp trên cơ sở dữ liệu kiểm của `bun run test`.
- Màn (jsdom): nút chuyển, dựng cột, thả gọi `setStage`, thả vào cột thua mở hộp
  thoại, bị từ chối thì thẻ về chỗ cũ, lưu trữ tắt nút chuyển, `Board` không có
  `onMove` giữ nguyên hình.
- Chrome thật: kéo thả bằng chuột trên máy chủ dev của cây đang xét, năm khổ.
- Cổng thiết kế tĩnh trên các tệp giao diện vòng này chạm.
