# Hình tại điểm quyết định — kara-gop-y-luot-2 (Cổng 1)

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 bỏ quét độ phủ | dưới ngưỡng: 1 bước | — |
| d-…-2 bỏ design-pass | dưới ngưỡng: 1 bước | — |
| d-…-3 Q2 người phụ trách nhiều KR | 3 nhánh (sửa được Mục tiêu / sửa được ≥1 KR / không sửa được gì) | quyen-nho-kara.html |
| d-…-4 Q3 không chờ mãi | 4 bước + 5 nhánh trạng thái của vùng | vong-doi-vung-kara.html |
| d-…-5 Q4 giữ «góp ý chờ», KaraProposal từng dòng | dưới ngưỡng: 1 bước | — |
| d-…-6 Q1 G6 làm trong K3 | dưới ngưỡng: 1 bước (năm chỗ gọi một hàm) | — |
| d-…-7 Hoàn tác Căn chỉnh ở client | 4 bước + 2 nhánh (có / không có liên kết mới) | hoan-tac-can-chinh.html |

## Đề bài vong-doi-vung-kara

- Loại hình: sơ đồ trạng thái của vùng Kara trong khung Mục tiêu, trái sang phải.
- Nút: «Mở khung» → «Tải danh sách góp ý» — lỗi: «Vùng còn · Kara chưa tải góp ý được · Thử lại (tải lại danh sách, không trừ lượt)» · ok → «Kara đang đọc?» — có: «Kara đang đọc Mục tiêu này…» (ghi mốc lúc khung thấy lần đầu) → quá trần 30 giây: «Kara chưa đọc được · Thử lại» · không: «Góp ý chờ (mỗi góp ý một dòng, không dấu tia sáng riêng)» hoặc «Rỗng · Nhờ Kara đọc lại». Nhánh phụ: «Nút Kara khoá (hết lượt / tạm nghỉ / chưa bật)» → «Nói vì sao và khi nào mở lại — không có nút xám». Nhánh phụ: «Bấm Nhờ Kara mà lỗi» → «Kara chưa đọc được · Thử lại».
- Dải ghi chú: trước khi sửa — tải lỗi thì vùng biến mất; mở khung lúc Kara đọc dở thì chờ mãi; Nhờ lỗi thì im lặng.
- AC liên quan: AC-1 đến AC-5.

## Đề bài hoan-tac-can-chinh

- Loại hình: luồng trái sang phải, bốn chặng rồi rẽ hai nhánh.
- Nút: «Chụp danh sách liên kết căn chỉnh TRƯỚC» → «Nhận góp ý Căn chỉnh» → «Làm mới Mục tiêu (danh sách SAU)» → «Có liên kết trong SAU mà không có trong TRƯỚC, khớp đích?» — CÓ: «Biên nhận có Hoàn tác → gỡ đúng liên kết đó» · KHÔNG (đích đã căn sẵn): «Biên nhận không có Hoàn tác — không gỡ liên kết người dùng tự tạo».
- Ví dụ dưới hình: trước [Y] → sau [Y, X mới] → Hoàn tác gỡ X mới, Y còn.
- AC liên quan: AC-7.

## Đề bài quyen-nho-kara

- Loại hình: quyết định ba nhánh.
- Nút: «Người bấm Nhờ Kara trên một Mục tiêu» → «Sửa được Mục tiêu?» — có: «Kara đọc cả Mục tiêu · thấy mọi góp ý» · không → «Sửa được ít nhất một KR?» — có: «Kara đọc cả Mục tiêu · chỉ thấy góp ý của KR mình sửa được · góp ý cấp Mục tiêu bị ẩn và không quyết được» · không: «Từ chối».
- Dải ghi chú: trước khi sửa — người phụ trách nhiều KR chỉ nhờ được cho KR đầu tiên.
- AC liên quan: AC-10.
