# Bảng dịch đã chốt — vòng ②

Hội đồng phán ở AC-10 chấm ĐÚNG bảng này. Chữ chưa có mặt ở đây thì không chấm.
Bảng do máy sinh từ `packages/ui/src/lib/messages.ts`.

Chỗ có `X`, `Y`, `Z` là chỗ chữ ghép biến: tên hay số do chỗ gọi đưa vào, không dịch.

| Khoá | Tiếng Anh | Tiếng Việt |
| --- | --- | --- |
| `table.clearFilters` | Clear | **Bỏ chọn tất cả** |
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
| `table.facetOptions` | Options | **Lựa chọn** |
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
| `sortableList.role` | sortable | **tay cầm sắp xếp** |
| `sortableList.reorder` | Reorder X | **Kéo để đổi thứ tự X** |
| `skeletonSwap.loaded` | X loaded | **Đã tải xong X** |
| `reasoning.thinking` | Thinking… | **Đang suy nghĩ…** |
| `threadMessage.empty` | No message body. | **Thư không có nội dung.** |

## Vòng chấm 3 sửa mười dòng, và gỡ một nhãn

Hội đồng vòng chấm 3 chỉ hai chỗ SAI. Cả hai đến từ chính bản sửa của vòng chấm 2:

- **`sortableList.reorder` bỏ chữ "trường".** Vòng chấm 2 thêm chữ đó để làm rõ
  cái gì đang bị kéo. Nhưng khoá này có **hai** chỗ gọi:
  `fields-list.tsx:332` truyền `field.label` — "trường" đúng; `field-editor.tsx:341`
  truyền `option.label`, tức một lựa chọn bên trong một trường — và câu ra màn
  thành *"Kéo để đổi thứ tự trường Bất động sản"*, gọi một giá trị thả xuống là
  trường. Đây đúng khuôn lỗi "một khoá đứng ở hai chỗ" mà vòng chấm 2 vừa chẩn
  đoán ở `table.detail` rồi tái phạm ngay dòng dưới.
- **`suggestion.dismiss` "Bỏ qua gợi ý" → "Từ chối gợi ý".** Bấm nút đó là vĩnh
  viễn — `facts.tsx:44` báo lại "it won't be suggested again". "Bỏ qua" trong
  tiếng Việt là để đó lát nữa quay lại.

Tám dòng nữa sửa cùng lượt: `pagination.next` ("Sau" → **"Tiếp"**),
`suggestion.accept`, `table.clearFilters`, `table.sortByDetail`,
`table.facetOptions`, `sortableList.role`, và bản `showing` chết ở
`apps/app/lib/messages/companies.ts` đã xoá — trước đó cùng một câu có hai bản
tiếng Việt trong cùng sản phẩm.

**`carousel.role` bị gỡ hẳn.** `CLAUDE.md` cấm đúc từ ghép tiếng Việt cho thuật
ngữ kỹ thuật; giữ nguyên chữ `carousel` thì nhãn nói tiếng Anh giữa màn tiếng
Việt. Nên thuộc tính `aria-roledescription` của băng trượt bị bỏ, và trình đọc
màn hình đọc vai thật của phần tử — đúng ở mọi thứ tiếng.

**`pagination.next` = "Tiếp" đóng luôn một lỗ của phép đo.** "Sau" là khoá duy
nhất không mang dấu tiếng Việt, nên nó là mục duy nhất trong danh sách miễn của
luật "mọi giá trị phải mang dấu". Danh sách miễn nay **rỗng**, và phép đo phủ
44/44 khoá.
