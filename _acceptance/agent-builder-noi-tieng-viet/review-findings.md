# Phát hiện của vòng chấm — agent-builder-noi-tieng-viet

Vòng chấm ngày 06/09, chạy tuần tự từng lệnh (điều khoản CLASSIFIER-FALLBACK).

## Trong hợp đồng — đã vá trong vòng này

1. **`agents.save` không tồn tại.** AC-1 và AC-5 hứa phép đo "gieo một tác nhân
   qua `agents.save`". Không có thủ tục nào tên đó — đọc nhầm `saveFile`. Tác
   nhân sinh ra từ một hội thoại dựng rồi mới đưa vào chạy. **Vá bằng cách thu
   phạm vi**: hai route cần bản ghi thành giới hạn đã khai, và bản khai chịu
   chiều đỏ (mở bằng một định danh không có thật; route nào vẫn vẽ ra chữ là ĐỎ).
2. **Chân `du-lieu-nguoi-nhap` không kiểm gì.** Nó chỉ đọc bảng của chính mình
   rồi báo lại — đúng lớp lỗi "phép đo trông như có kiểm mà không kiểm". Nay nó
   đọc cây cú pháp: phần tử JSX bọc đúng biểu thức phải mang `translate="no"`.
   Ba ô, cả ba xanh sau khi vá sản phẩm (hai `<span>` trong lát này).
3. **Chân `khong-dich` so chuỗi với chính nó.** Bảng tra khoá bằng chính giá trị
   chuỗi, nên nhánh "vi khác en" là mã chết — không đầu vào nào chạm tới. Nay so
   theo VỊ TRÍ trong cây DOM, và chiều đỏ đã chứng.
4. **AC-5 không có chân nào.** Ổ cắm `ab_trang_thai` trỏ vào một chân chưa viết;
   nó thoát mã 2 với câu "chưa biết chân". Nay có chân thật, chín ô, hai chiều.

## Ngoài hợp đồng

1. **Gốc gom chữ của bộ thước màn dùng chung không chứa thanh bên.** Gốc là phần
   tử cha của `main`; thanh bên của khung dựng tác nhân là anh em của một tổ tiên
   khác. Hệ quả: `hai-tieng`, `khong-dich`, `be-rong` mù với chữ thanh bên — ở cả
   BA hồ sơ dùng chung bộ thước. Chỗ này bắt được vì chân trạng thái mới hỏi
   "chữ này có vẽ ra không" và câu trả lời sai với mắt thường.
   *Đề xuất:* mở hợp đồng mới. Nới gốc là kéo cả thanh điều hướng ứng dụng — vùng
   của một hồ sơ khác còn tiếng Anh — vào phép đo của ba hồ sơ, nên không sửa tại
   chỗ được.
2. **`{agent.status.toLowerCase()}` vẽ ra một enum tiếng Anh.**
   `team-agents-index.tsx:49` in thẳng `DRAFT | DEPLOYING | LIVE | PAUSED` ở dạng
   chữ thường. Không thước nào thấy: nó không phải chuỗi hằng nên bộ quét chữ bỏ
   qua, và nó chỉ vẽ ra khi đội đã có tác nhân — tức sau giới hạn route.
   *Đề xuất:* mở hợp đồng mới, chung với đợt hai.
3. **Chiều đỏ của chân bề rộng không chứng được trên lát này — nay đã ĐO.**
   Chân `be-rong-tien-de` đếm các hộp chặt cứng (nowrap / ellipsis / overflow ẩn)
   trên hai màn dựng được: 4 hộp, và **0 hộp mang chữ của lát này** — cả bốn mang
   chữ của cửa sổ trò chuyện, tức đợt hai. Thiếu tiền đề thì không cắm vết, và
   không được đọc kết quả rỗng là "bản dịch vừa".
   Đã thử dựng tiền đề bằng tay (thêm `whitespace-nowrap overflow-hidden` vào
   tiêu đề câu rỗng): tiền đề bật lên 1/5 nhưng vết vẫn không tràn, vì phần tử đó
   rộng tự do trong một cột không chặn bề ngang — chữ chỉ kéo hộp dài ra.
   *Đề xuất:* ghi Known limits.
