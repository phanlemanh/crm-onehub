# Hình tại điểm quyết định — dong-thoi-gian-loi-dung-luot

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Nhớ loại lỗi theo lượt đã xong, chỉ đổi khi rảnh (approach S1) | hai thứ tự chồng lỗi × ba thời điểm (đang chạy · được · lỗi) | `luot-da-xong.html` |
| Bỏ ui-observed (descope) | dưới ngưỡng: một quyết định nhị phân | — |
| Bỏ design-pass (descope) | dưới ngưỡng: một quyết định nhị phân | — |

## Đề bài `luot-da-xong`

- Loại hình: hai làn so sánh (swimlane) song song, trái sang phải theo thời gian: làn trên «K6c hôm nay», làn dưới «K6e».
- Kịch bản A: «Làm mới hỏng» → «Bấm Xem cũ hơn (đang tải)» → «Trang kế tải được». K6c: hiện «xem cũ» sai lúc đang tải, rồi mất cả cảnh báo làm mới (đỏ). K6e: giữ cảnh báo làm mới suốt, không hiện «xem cũ» (xanh).
- Kịch bản B: «Xem cũ hơn hỏng» → «Làm mới nền (đang chạy)» → «Làm mới được». K6c: hiện «làm mới» sai lúc đang chạy (đỏ). K6e: giữ «xem cũ» lúc đang chạy, hết cả hai khi làm mới được (xanh).
- Một dòng chú: «K6e chỉ đổi thông báo khi không còn lượt nào chạy — theo lượt vừa xong». AC-1 gắn kịch bản A, AC-2 kịch bản B. Nhãn tiếng Việt.
