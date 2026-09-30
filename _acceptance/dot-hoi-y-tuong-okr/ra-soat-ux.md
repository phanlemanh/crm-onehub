# Rà soát UX bản mẫu — dot-hoi-y-tuong-okr

Chạy 2026-09-29, skill `ux-ui-craft` chế độ rà soát, trên bản mẫu đang chạy
(`/proto/dot-hoi-y-tuong-okr`, máy chủ dev cây này cổng 3370), 14 trạng thái × 375 /
768 / 1440, chủ đề tối. Tra ReUI bằng công cụ MCP của ReUI (gói Pro của kho), không
cài gì. Thước và chân ngành: `docs/design.md` «Vẽ tay là bậc cuối», `docs/reui.md`.

## Khoá người dùng

| Người | Việc của màn | Bối cảnh |
|---|---|---|
| Thành viên, cả vai «chỉ OKR» | góp 1–3 ý trong 1–2 ngày, rồi biết ý mình đi đâu | lần đầu, thường từ tin nhắc trên điện thoại |
| Quản trị | mở lần hỏi ý, theo độ phủ, gom | vài lần mỗi năm, máy tính |
| Người chọn (CEO) | viết trước, kết luận từng chủ đề, công bố | một lần mỗi kỳ, máy tính, cần đủ ngữ cảnh |

## Sàn chất lượng — đo trên màn thật

| Cổng | Kết quả | Chứng cứ |
|---|---|---|
| Tràn ngang | Đạt, 42/42 ô | `scrollWidth ≤ innerWidth` ở mọi trạng thái × khổ |
| Số cỡ chữ | Đạt, 3–4 cỡ mỗi màn (12/14/24 hay 30, thêm 16 ở đang tải) | `getComputedStyle`, ô xấu nhất: đang tải 4 cỡ |
| Giọng nhãn nhỏ | Đạt trong phần tính năng; màu thêm đến từ khung ứng dụng và nút | nhãn dưới 13px trong vùng tính năng: 2 màu |
| Ô nhập có nhãn | Đạt, 0 ô thiếu nhãn (cả sheet «Mở hỏi ý», 22 điều khiển) | |
| Nút có tên | Đạt, 0 nút trống | |
| Đi bằng phím | Đạt ở màn gom: ô chọn → «Đưa vào chủ đề…» theo từng ý → «Chủ đề mới» → menu từng chủ đề; viền focus hiện | lượt 45 phím Tab |
| Vùng bấm ≥ 44px | **Trượt ở mức kho**: điều khiển cao 32px theo thang của `packages/ui` | 38/44 điều khiển ở màn kết luận khổ 375 |
| Lưới căn lề | **Chưa đo được**: kho chưa khai Layout Contract (`--space-*`) | thước trả BLOCKED, không suy đoán số |

## Phát hiện, xếp theo hại cho người dùng

### Lỗi (đo được)

1. **Tab đang đứng không thấy trên điện thoại.** Thêm tab thứ năm «Hỏi ý» làm thanh
   tab tràn ở 375; tab đang đứng nằm ngoài khung nhìn, chỉ thấy chữ «H». Người mở từ
   tin nhắc không biết mình đang ở đâu. Chạm thanh tab thật (`thanh-tab.tsx`), không
   chỉ bản mẫu.
2. **Việc chính của thành viên nằm dưới nếp gấp ở 375.** Lời mở và bốn thẻ con số xếp
   dọc chiếm khoảng 800px; ô «Ý của bạn» bắt đầu ở màn hình thứ hai. Người đến từ tin
   nhắc phải cuộn mới thấy chỗ góp.
3. **Lý do của người chọn bị cắt ở trang kết quả trên điện thoại** («…và 8 người ở
   5…»). Lý do là nội dung chính của tin đóng vòng — cắt nó là cắt đúng thứ thước
   «tôi hiểu vì sao» đo.

### Lệch kỷ luật

4. **Hai cơ chế gom song song trên cùng một dòng.** Mỗi ý vừa có ô chọn, vừa có nút
   «Đưa vào chủ đề…» chiếm nửa bề ngang; ở 375 dòng phụ bị cắt («3 ngư…»), và nút gom
   hàng loạt ở đầu danh sách luôn hiện kể cả khi chưa chọn gì.
5. **Không có chỉ báo pha.** Người xem phải tự suy lần hỏi ý đang mở, đang gom hay đã
   công bố; hạn («còn 30 giờ») nằm lẻ cạnh câu hỏi. Mỗi màn chưa trả lời «việc này
   đang ở bước nào, bước kế là gì».

### Phán đoán (nêu phép thử)

6. **Màn kết luận dài, không có lối tắt.** Sáu thẻ chủ đề, mỗi thẻ một form đủ trường;
   điều còn thiếu chỉ liệt ở thanh đáy, không nhảy tới đúng thẻ; bản viết trước ở cột
   phải trôi mất khi cuộn. Phép thử: người chọn ở thẻ thứ năm có còn thấy câu viết
   trước số 2 để khai nối không? Không.
7. **Thứ tự ý đồng nghiệp gây theo đuôi.** Danh sách phẳng, cùng một thứ tự cho mọi
   người; ở lần thật có thể tới 120 ý. Ý đầu danh sách được đọc và bấm «Tôi cũng nghĩ
   vậy» nhiều nhất bất kể nội dung — số đồng ý đo vị trí, không đo đồng tình.

## Tra ReUI — thứ đáng dùng

| Nhu cầu | Mục ReUI | Kho đã có | Khuyên |
|---|---|---|---|
| Chỉ báo pha | `c-timeline-12` (mốc ngang, «hiện tại»), component `timeline` | `StepList` chế độ tĩnh | `StepList` tĩnh (bậc 1); không dùng stepper vì gợi bấm được |
| Gom nhiều ý | block Pro `wishlist-1` (ô chọn, thanh xử lý hàng loạt thay hàng tiêu đề) | `Checkbox`, `DropdownMenu`, `Item` | bố cục `wishlist-1` dựng lại bằng thành phần kho (bậc 4); bỏ kanban — số chủ đề không giới hạn, kéo thả kém trên điện thoại |
| Thanh công bố liệt điều thiếu | không có mẫu | `SaveBar` (hai dòng, cắt chữ) | biến thể `SaveBar` nhận danh sách, mỗi dòng nhảy tới thẻ (bậc 5, `packages/ui`) |
| «Tôi cũng nghĩ vậy» | `c-button-37`, `c-toggle-11` | `Toggle` | `Toggle` có `aria-pressed` (bậc 1), không số đếm cho thành viên |
| Câu trích, lời người | block Pro `review-3` | `Item` | bố cục `review-3` bằng `Item` (bậc 4), không cắt lý do |
| Độ phủ | không có heatmap | `Heatmap` | giữ `Heatmap`, thêm prop chú giải (đã có trong phạm vi) |
| Hạn đóng có giờ | `c-input-14` (ô giờ), `c-calendar-30` | `DatePicker` chỉ ngày | `DatePicker` + ô giờ theo `c-input-14` (bậc 3) |
| Sheet «Mở hỏi ý» | block Pro `sheet-8` (chân dính đáy) | `Sheet`, `Field` | giữ; tham chiếu `sheet-8` (bậc 4) |

Không có block survey, poll hay feedback board nào trong ReUI.

## Đề xuất — bảy sửa, ghép với phát hiện

| # | Sửa | Vá phát hiện | Bậc | Chạm hợp đồng? |
|---|---|---|---|---|
| A | Thanh tab OKR cuộn ngang được và tự cuộn tab đang đứng vào khung nhìn | 1 | 1 | thêm một vế vào AC-11 (tab đang đứng thấy được ở 390) |
| B | Ở 375: ô soạn đứng ngay dưới câu hỏi; lời mở gập ba dòng kèm «Đọc thêm»; thẻ con số thành lưới hai cột | 2 | 1 (`Collapsible`) | thêm một vế vào AC-11 (ô soạn trong màn hình đầu ở 390) |
| C | Không cắt lý do ở «Ý của bạn» và kho ý — hiện đủ, theo bố cục `review-3` | 3 | 4 | thêm một vế vào AC-12 |
| D | Màn gom theo `wishlist-1`: thanh «N ý đã chọn · Đưa vào chủ đề…» chỉ hiện khi đã chọn; việc trên từng ý vào menu «…» | 4 | 4 | không — cùng hành vi, đổi bố cục |
| E | Dải pha dưới tiêu đề: `StepList` tĩnh ba bước Đang mở · Đang gom · Đã công bố, kèm hạn và tên người chọn | 5 | 1 | thêm một vế vào AC-11, AC-12 |
| F | Màn kết luận: đếm «4/6 chủ đề đã kết luận» ở đầu; thanh công bố dạng danh sách nhảy tới thẻ (biến thể `SaveBar`); bản viết trước dính khi cuộn ở máy tính | 6 | 5 + 1 | thay dòng «thanh công bố» trong phạm vi bằng biến thể `SaveBar` |
| G | Ý đồng nghiệp xáo thứ tự cố định theo từng người xem, hiện 10 ý rồi «Hiện thêm» | 7 | 1 | thêm luật vào thiết kế mục 7 và một vế vào AC-3 |

## Phải giữ khi sửa

- Khối «Ý của bạn đi đâu» với kết luận, lý do nguyên văn và «Tôi hiểu vì sao» ngay
  dưới — đây là đường đóng vòng.
- Bốn nhãn Giữ nguyên · Đổi · Bỏ · Thêm, câu cũ gạch khi «Đổi».
- Ô «Nối với câu viết trước» bắt buộc, báo lỗi tại ô.
- Ý đồng nghiệp không tên, không số.
- Thanh công bố liệt đủ điều thiếu thay vì chỉ tắt nút.
