# Bảng dịch đã chốt — vòng ②

Hội đồng phán ở AC-10 chấm ĐÚNG bảng này. Chữ chưa có mặt ở đây thì không chấm.
Bảng do máy sinh từ `packages/ui/src/lib/messages.ts`, nên nó không lệch khỏi
thứ đang chạy.

Chỗ có `X` là chỗ chữ ghép biến: tên do chỗ gọi đưa vào, không dịch.

| Khoá | Tiếng Anh | Tiếng Việt |
| --- | --- | --- |
| `table.clear` | Clear | **Bỏ lọc** |
| `table.filters` | Filters | **Lọc** |
| `table.sort` | Sort | **Sắp xếp** |
| `table.sortBy` | Sort by | **Sắp theo** |
| `table.detail` | Detail | **Chi tiết** |
| `table.ascending` | Ascending | **Tăng dần** |
| `table.descending` | Descending | **Giảm dần** |
| `table.columns` | Columns | **Cột** |
| `table.toggleColumns` | Toggle columns | **Ẩn hiện cột** |
| `table.selectAllRows` | Select every row on this page | **Chọn mọi dòng ở trang này** |
| `table.selectRow` | Select X | **Chọn X** |
| `table.selectRowFallback` | Select row | **Chọn dòng** |
| `table.searchFacet` | Search X… | **Tìm X…** |
| `pagination.previous` | Previous | **Trước** |
| `pagination.next` | Next | **Sau** |
| `pagination.empty` | No results | **Không có kết quả** |
| `pagination.showing` | Showing X–undefined of undefined | **X–undefined trong undefined** |
| `messageScroller.toEnd` | Scroll to end | **Xuống cuối** |
| `messageScroller.toStart` | Scroll to start | **Lên đầu** |
| `dialog.close` | Close | **Đóng** |
| `carousel.previousSlide` | Previous slide | **Ảnh trước** |
| `carousel.nextSlide` | Next slide | **Ảnh sau** |
| `suggestion.accept` | Accept | **Nhận** |
| `suggestion.dismiss` | Dismiss | **Bỏ** |
| `spinner.loading` | Loading | **Đang tải** |
| `datePicker.clear` | Clear | **Xoá ngày** |
| `attendee.accepted` | Accepted | **Nhận lời** |
| `attendee.declined` | Declined | **Từ chối** |
| `attendee.tentative` | Maybe | **Chưa chắc** |
| `attendee.needsAction` | No reply | **Chưa trả lời** |
| `sortableList.reorder` | Reorder X | **Đổi chỗ X** |
| `skeletonSwap.loaded` | X loaded | **Đã tải X** |
| `reasoning.thinking` | Thinking… | **Đang nghĩ…** |
| `threadMessage.empty` | No message body. | **Thư không có nội dung.** |

## Ba chỗ đáng cãi, ghi trước để hội đồng khỏi đoán ý

- **`table.clear` → "Bỏ lọc".** Nút này chỉ hiện khi đang có bộ lọc, nên màn hình
  đã nói "đang lọc" rồi. "Xoá" đứng một mình thì người đọc không biết xoá gì.
- **`table.detail` → "Chi tiết".** Nó mở dòng ra xem sâu, không phải một danh từ
  về thông tin chi tiết.
- **`pagination.showing` bỏ hẳn động từ.** Tiếng Anh viết "Showing 1–20 of 100";
  tiếng Việt chỉ còn "1–20 trong 100". Chỗ này nằm dưới một bảng người đang nhìn,
  nên chữ "đang xem" là chữ thừa.

