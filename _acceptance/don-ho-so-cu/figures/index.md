# Hình tại điểm quyết định — don-ho-so-cu (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1: ghim 77 hồ sơ thiếu paths hay không | hai nhánh rẽ | `hoi-1-pham-vi.html` |
| Hỏi-2: mỗi lô một PR hay một PR cuối vòng | hai nhánh rẽ | `hoi-2-gop.html` |

## Đề bài `hoi-1-pham-vi`

- Loại: cây phân nhóm (tree) từ trái sang phải.
- Nút: «299 hồ sơ đã ký» → «281 cũ ở đỉnh onehub» và «18 tươi». «281 cũ» → «204 cũ vì gộp chạm đúng tệp eval khai (lọc theo paths áp)» và «77 cũ theo luật thô — eval thiếu paths». «77» → «6 ca đã gọi tên → vẫn ghim» và «71 còn lại → Hỏi-1».
- Nhánh Hỏi-1: «Khuyên: không ghim, mở hàng khai paths» (cũ lại sau gần như mọi gộp có mã) · «Lối khác: ghim cả — thêm ~4 giờ máy, cũ lại ở gộp kế».
- AC liên quan: AC-1, AC-2.

## Đề bài `hoi-2-gop`

- Loại: hai làn song song (swimlane) so hai lối, trục thời gian ngang.
- Làn A «Mỗi lô một PR (khuyên)»: lô 1 ghim → PR lô 1 gộp → lô 2 ghim → PR lô 2 gộp → … → PR vòng (sổ xử lý, thước). Nhãn: hồ sơ tươi trên onehub từng đợt · CI nhẹ (chỉ tệp T1) · ~10 lượt gộp vk.
- Làn B «Một PR cuối vòng»: lô 1 … lô n ghim trên một nhánh → giu-tuoi ghim lại phần bị gộp khác làm cũ → một PR gộp. Nhãn: 1 lượt gộp vk · ~200 hồ sơ cũ trên onehub tới cuối vòng · sổ chạy dễ va.
- AC liên quan: AC-6, AC-9.
