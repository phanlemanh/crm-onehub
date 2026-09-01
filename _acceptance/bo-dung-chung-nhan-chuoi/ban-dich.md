# Bảng dịch đã chốt — vòng ②

Hội đồng phán ở AC-10 chấm ĐÚNG bảng này. Chữ chưa có mặt ở đây thì không chấm.
Bảng do máy sinh từ `packages/ui/src/lib/messages.ts`.

Chỗ có `X`, `Y`, `Z` là chỗ chữ ghép biến: tên hay số do chỗ gọi đưa vào, không dịch.

| Khoá | Tiếng Anh | Tiếng Việt |
| --- | --- | --- |
| `table.clearFilters` | Clear | **Bỏ lọc này** |
| `table.clearSelection` | Clear selection | **Bỏ chọn** |
| `table.selected` | X selected | **Đã chọn X dòng** |
| `table.filters` | Filters | **Lọc** |
| `table.sort` | Sort | **Sắp xếp** |
| `table.sortBy` | Sort by | **Sắp xếp theo** |
| `table.detailColumn` | Detail | **Chi tiết** |
| `table.sortByDetail` | Expandable first | **Mở rộng được lên trước** |
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
| `pagination.next` | Next | **Sau** |
| `pagination.empty` | No results | **Không có kết quả** |
| `pagination.showing` | Showing X–Y of Z | **X–Y trong số Z** |
| `messageScroller.toEnd` | Scroll to end | **Xuống cuối** |
| `messageScroller.toStart` | Scroll to start | **Lên đầu** |
| `dialog.close` | Close | **Đóng** |
| `carousel.role` | carousel | **dải thẻ trượt** |
| `carousel.itemRole` | item | **mục** |
| `carousel.previousSlide` | Previous item | **Mục trước** |
| `carousel.nextSlide` | Next item | **Mục sau** |
| `suggestion.accept` | Accept | **Áp dụng gợi ý** |
| `suggestion.dismiss` | Dismiss | **Bỏ qua gợi ý** |
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
| `sortableList.role` | sortable | **tay kéo sắp xếp** |
| `sortableList.reorder` | Reorder X | **Kéo để đổi thứ tự trường X** |
| `skeletonSwap.loaded` | X loaded | **Đã tải xong X** |
| `reasoning.thinking` | Thinking… | **Đang suy nghĩ…** |
| `threadMessage.empty` | No message body. | **Thư không có nội dung.** |

## Vòng chấm 2 sửa sáu dòng và tách một khoá

Hội đồng vòng chấm 2 chấm KHÔNG ĐẠT, chỉ ba chỗ SAI và bảy chỗ GƯỢNG. Đã sửa:

- **`messageScroller.*` trả về "Xuống cuối" / "Lên đầu".** Vòng chấm 1 thêm chữ
  "hộp thư" vào, và chữ đó sai: hai chỗ dùng duy nhất là khung trò chuyện với
  tác nhân, không phải hộp thư. Người nghe được gọi tên một vật không có trên màn.
- **`table.detail` tách làm `detailColumn` và `sortByDetail`.** Cùng khuôn lỗi đã
  làm `table.clear` phải tách. Một khoá đứng ở hai chỗ: đầu cột mở rộng thì
  "Chi tiết" đúng; trong menu "Sắp xếp theo" nó đứng lẫn giữa tên cột và đọc như
  một cột không tồn tại.
- **`table.selected` thêm chữ "dòng".** "Đã chọn 12" thiếu loại từ.
- **`sortableList.reorder` thêm chữ "trường".** `X` là nhãn một trường, nên
  "Kéo để đổi thứ tự Người phụ trách" không nói rõ cái gì được kéo.
- **`carousel.role` bỏ từ ghép tự đúc**, **`sortableList.role` thành danh từ**
  (`aria-roledescription` thay tên vai, nên phải là danh từ chứ không phải câu tả
  việc), **`suggestion.dismiss`** và **`table.selectAllRows`** tự đứng được hơn,
  **`table.clearFilters`** nói rõ phạm vi là một mục lọc.

## Ba khoá mới, sinh ra từ vòng chấm 2

- **`datePicker.previousMonth` · `nextMonth` · `chooseMonth` · `chooseYear`** —
  ô chọn ngày mở ra là một tấm lịch tiếng Anh nguyên khối: tên tháng, tên thứ, và
  35 nhãn ngày mà trình đọc màn hình đọc lên. Nguyên nhân một dòng: `<Calendar>`
  không nhận `locale`.
- **`table.facetOptions`** — `cmdk` đặt `aria-label="Suggestions"` cho danh sách
  lựa chọn khi không ai truyền `label`. Chuỗi của thư viện, đọc lên thành tiếng.

## Chỗ vẫn đáng cãi

- **`table.clearFilters` → "Bỏ lọc này".** Nút nằm trong menu con của MỘT mục lọc
  và chỉ xoá mục đó. Chữ "này" là chữ phân biệt phạm vi, không phải chữ thừa.
- **`pagination.showing` bỏ hẳn động từ.** Bảng nằm ngay trên. Nhưng vòng ① đã
  ship `apps/app/lib/messages/companies.ts` với "Đang xem X–Y trong Z" — cùng một
  câu, hai bản trong cùng sản phẩm. Chuỗi đó hiện là chữ chết; cần chốt một bản.
