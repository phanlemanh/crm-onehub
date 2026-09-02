# Bảng dịch đã chốt — vòng ②

Hội đồng phán ở AC-10 chấm ĐÚNG bảng này. Chữ chưa có mặt ở đây thì không chấm.
Bảng do máy sinh từ `packages/ui/src/lib/messages.ts`.

Chỗ có `X`, `Y`, `Z` là chỗ chữ ghép biến: tên hay số do chỗ gọi đưa vào, không dịch.

| Khoá | Tiếng Anh | Tiếng Việt |
| --- | --- | --- |
| `table.clearFilters` | Clear | **Bỏ hết tiêu chí** |
| `table.clearSelection` | Clear selection | **Bỏ chọn** |
| `table.selected` | X selected | **Đã chọn X dòng** |
| `table.filters` | Filters | **Lọc** |
| `table.sort` | Sort | **Sắp xếp** |
| `table.sortBy` | Sort by | **Sắp xếp theo** |
| `table.detailColumn` | Detail | **Chi tiết** |
| `table.sortByDetail` | Expandable first | **Dòng có chi tiết lên trước** |
| `table.ascending` | Ascending | **Tăng dần** |
| `table.descending` | Descending | **Giảm dần** |
| `table.columns` | Columns | **Cột** |
| `table.toggleColumns` | Toggle columns | **Ẩn/hiện cột** |
| `table.selectAllRows` | Select every row on this page | **Chọn tất cả dòng trên trang này** |
| `table.selectRow` | Select X | **Chọn X** |
| `table.selectRowFallback` | Select row | **Chọn dòng** |
| `table.searchFacet` | Search X… | **Tìm X…** |
| `table.facetOptions` | Options | **Các lựa chọn** |
| `pagination.previous` | Previous | **Trước** |
| `pagination.next` | Next | **Tiếp** |
| `pagination.empty` | No results | **Không có kết quả** |
| `pagination.showing` | Showing X–Y of Z | **X–Y trong số Z** |
| `messageScroller.toEnd` | Scroll to end | **Xuống cuối** |
| `messageScroller.toStart` | Scroll to start | **Lên đầu** |
| `dialog.close` | Close | **Đóng** |
| `carousel.itemRole` | item | **mục** |
| `carousel.previousSlide` | Previous item | **Mục trước** |
| `carousel.nextSlide` | Next item | **Mục sau** |
| `suggestion.accept` | Accept | **Chấp nhận gợi ý** |
| `suggestion.dismiss` | Dismiss | **Từ chối gợi ý** |
| `spinner.loading` | Loading | **Đang tải** |
| `datePicker.clear` | Clear | **Xoá ngày** |
| `datePicker.previousMonth` | Go to the previous month | **Về tháng trước** |
| `datePicker.nextMonth` | Go to the next month | **Sang tháng sau** |
| `datePicker.chooseMonth` | Choose the month | **Chọn tháng** |
| `datePicker.chooseYear` | Choose the year | **Chọn năm** |
| `attendee.accepted` | Accepted | **Nhận lời** |
| `attendee.declined` | Declined | **Từ chối** |
| `attendee.tentative` | Maybe | **Có thể dự** |
| `attendee.needsAction` | No reply | **Chưa trả lời** |
| `sortableList.reorder` | Reorder X | **Đổi thứ tự X** |
| `skeletonSwap.loaded` | X loaded | **Đã tải xong X** |
| `reasoning.thinking` | Thinking… | **Đang suy nghĩ…** |
| `threadMessage.empty` | No message body. | **Thư không có nội dung.** |

## Vòng chấm 4 sửa ba dòng — cả ba là nhãn không ai nhìn thấy

Hội đồng vòng 4 kiểm **mọi** chỗ gọi của cả 43 khoá, ở hai tầng: chỗ đọc bảng
trong bộ dựng chung, và chỗ dựng component trong `apps/app`. Không dòng nào SAI,
không dòng nào làm người bấm nhầm. Ba dòng GƯỢNG, và cả ba hỏng theo cùng một
lối: **vòng 3 đem luật của nhãn NHÌN THẤY áp lên nhãn chỉ trình đọc màn hình
NGHE thấy.**

- **`sortableList.reorder` bỏ chữ "Kéo".** Chuỗi này nằm trong `sr-only`, tức chỉ
  người nghe nhận được. `SortableList` gắn `KeyboardSensor`, nên người nghe đổi
  thứ tự **bằng bàn phím, không kéo bao giờ**. Câu cũ bảo họ làm một động tác họ
  không có. Chữ "Kéo" vẫn đúng ở chỗ của nó — dòng gợi ý nhìn thấy được ở
  `apps/app`, thuộc vòng ③.
- **`table.facetOptions` trả lại "Các lựa chọn".** Vòng 3 cắt chữ "Các" theo luật
  ngắn-theo-ngữ-cảnh của `CONTEXT.md`. Nhưng luật đó nói ngữ cảnh đến từ **màn
  hình**, mà đây là `aria-label` của một `role="listbox"` — người nghe không có
  màn hình. "Lựa chọn" trần nghe ra như một mệnh lệnh, không như tên một danh sách.
- **`sortableList.role` gỡ hẳn.** Vòng 3 viện `CLAUDE.md` — cấm đúc từ ghép tiếng
  Việt cho thuật ngữ kỹ thuật — để gỡ `carousel.role`, rồi để nguyên
  `sortableList.role` ("tay cầm sắp xếp", cũng là từ đúc) hai dòng bên dưới trong
  **cùng một commit**. Nay cùng một luật cho cả hai.

Gỡ khoá này không đủ: `dnd-kit` tự đặt `aria-roledescription="sortable"`, một chữ
tiếng Anh đọc thành tiếng. Nên thuộc tính bị **tắt tường minh** sau chỗ trải
`attributes`, và trình đọc màn hình đọc vai thật ("nút") — đúng ở mọi thứ tiếng.
Dòng `sr-only` ngay bên trong đã nói việc phải làm.


## Vòng người lạ lái thử sửa một dòng

Hai người lạ — không biết gì về vòng này — dùng thử CRM như một ngày làm việc
thật. Một người ở màn rộng, một người ở màn hẹp và màn điện thoại.

**`table.clearFilters` "Bỏ chọn tất cả" → "Bỏ hết tiêu chí".** Vòng chấm 3 chọn
chữ đó để bắt cặp với `clearSelection` = "Bỏ chọn"; vòng chấm 4 chấm là "hoà".
Người lạ ở màn hẹp gặp cả hai **cùng một lúc** và dừng lại nghĩ: thanh chọn dòng
có nút "Bỏ chọn", trong menu lọc có "Bỏ chọn tất cả", hai chữ gần như nhau cho
hai việc ngược nhau. Bắt cặp đẹp trên bảng không có nghĩa là phân biệt được trên
màn.
