# Nháp phát hiện — ghi dần trong lúc thi công, dựng thành review-findings.md ở S4

## Ngoài hợp đồng

1. **AC-8 của hồ sơ đợt một hứa một phép đo không tồn tại.** Vế *"file bị loại
   trừ mà mang chuỗi trùng với một giá trị của kho chuỗi mới là ĐỎ"* không có
   dòng mã nào làm. Thứ duy nhất tồn tại là một câu log nói rằng nó được đo.
   Bằng chứng đã ký hứa nhiều hơn nó đo. Đã gỡ câu log; vế ấy nay không còn đối
   tượng vì sáu dòng chuyển sang *bàn giao*. severity P1.

2. **`share-chat-dialog` mang tên hãng gốc.** Câu *"Anyone in Comp AI with the
   link"* — kho này là bản rẽ của OneHub. Đã dịch theo tên thật của sản phẩm.
   severity P2.

3. **Đóng màn lẫn tiếng làm rỗng tập đo của AC-6 đợt một.** Chân `khong-dich`
   của đợt một đối chiếu hai lượt tiếng trên tập gồm hai dòng bảng (Slack,
   OneHub — cả hai khai ngoài màn đo được) cộng 8 chuỗi `ngoai_lat`. Đợt hai
   dịch xong 8 chuỗi đó, nên tập đối chiếu về **0** và chân thoát mã 2 *"tập
   quan sát rỗng không bao giờ là đạt"* — đúng luật, và đó là điều đáng ghi:
   **hoàn thành đợt hai làm mất đối tượng đo của một tiêu chí đã ký.** Không
   phải lỗi của phép đo; là hệ quả thật của việc đóng màn. Vòng này dựng lại độ
   phủ ấy ở AC-7 của chính nó, trên màn trò chuyện đã tiếng Việt. severity P1.

4. **`humanStatus()` đúc chữ Anh từ enum** (`SUCCEEDED` → "Succeeded"). Cùng lớp
   với lỗ Ngoài-2 đã định đoạt ở đợt một, nhưng nằm trong dân số của vòng này
   nên đã sửa tại chỗ: bảng tra vào kho chuỗi, giữ nhánh dự phòng.

5. **Giờ định dạng bằng `"en"` cứng** ở dòng thời gian. Không bộ quét nào thấy
   vì `"en"` không phải chữ người đọc. Đã vá: truyền `locale` xuống.
