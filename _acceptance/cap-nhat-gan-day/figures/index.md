# Hình tại điểm quyết định — cap-nhat-gan-day

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1: chip mặc định khi đường dẫn trần (Tất cả hay Tôi dẫn) | hai nhánh rẽ × ba loại người xem | cần hình — `chip-mac-dinh` |
| D5 lối a: trả lời chỉ dưới lần mới nhất, đi qua bình luận sẵn có | năm bước nối tiếp (Trả lời → gõ → Gửi → hiện dưới dòng → hiện ở Trao đổi) | cần hình — `luong-tra-loi` |
| D7 mục thứ bảy trên thanh bên | một bước | dưới ngưỡng: 1 bước, ảnh bản mẫu đã đủ |
| D8 bấm dòng mở chi tiết KR | một bước | dưới ngưỡng: 1 bước |
| C5 chữ chip | không rẽ | dưới ngưỡng: 0 nhánh |
| Phạm vi Tôi dẫn / Đang theo dõi theo bộ | một nhánh mỗi chip | dưới ngưỡng: định nghĩa có sẵn ở CONTEXT.md |
| Bỏ cá nhân, đã bỏ, nhắc tên, gom tuần | không rẽ | dưới ngưỡng: mục Out of scope |

## Đề bài `chip-mac-dinh`

- Loại hình: so hai nhánh (hai cột), mỗi cột ba hàng người xem.
- Nút: «Mở /okr/cap-nhat-gan-day không tham số» → nhánh A «Tất cả» (khuyên) · nhánh B «Tôi dẫn».
- Ba người xem: trưởng phòng ban (dẫn một bộ) · thành viên (không dẫn bộ nào) · quản trị (không dẫn bộ nào).
- Mỗi ô: thấy gì ngay khi mở (A: mọi lần cập nhật, chip Tất cả sáng; B: trưởng thấy bộ mình, thành viên và quản trị thấy câu rỗng «Chưa có lần cập nhật nào ở «Tôi dẫn»»).
- Nhãn chân: «A khớp mặc định trang Bộ OKR» · «B đỡ một bấm cho trưởng đơn vị». AC liên quan: AC-4, AC-5.

## Đề bài `luong-tra-loi`

- Loại hình: luồng năm bước, có một nhánh lỗi.
- Bước: dòng tin (lần mới nhất của KR) → «Trả lời» mở ô → gõ, Gửi → `okr.addComment` (gắn mục tiêu + KR) → lần trả lời hiện dưới dòng · và ở thẻ Trao đổi của mục tiêu mang nhãn KR.
- Nhánh lỗi: Gửi hỏng (chu kỳ đã ẩn) → câu lỗi dưới ô, chữ đã gõ còn.
- Chú thích bên: lần cập nhật cũ không có nút Trả lời — «Có lần cập nhật mới hơn — trả lời ở đó» (D5 lối a; trả lời từng lần là HT5).
- AC liên quan: AC-6.
