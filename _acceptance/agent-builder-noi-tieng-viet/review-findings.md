# Phát hiện của vòng chấm — agent-builder-noi-tieng-viet

Vòng chấm ngày 06/09, chạy tuần tự từng lệnh (điều khoản CLASSIFIER-FALLBACK).

## Trong hợp đồng

Bốn phép đo giả bị bắt và vá ngay trong vòng này.

- **`agents.save` không tồn tại** — AC: AC-1, AC-5.
  AC-1 và AC-5 hứa phép đo "gieo một tác nhân qua `agents.save`". Không có thủ
  tục nào tên đó — đọc nhầm `saveFile`. Tác nhân sinh ra từ một hội thoại dựng
  rồi mới đưa vào chạy. Vá bằng cách thu phạm vi, và bản khai chịu chiều đỏ: mở
  hai route đó bằng một định danh không có thật, route nào vẫn vẽ ra chữ là ĐỎ.
- **Chân `du-lieu-nguoi-nhap` không kiểm gì** — AC: AC-6b.
  Nó chỉ đọc bảng của chính mình rồi báo lại. Nay đọc cây cú pháp: phần tử JSX
  bọc đúng biểu thức phải mang `translate="no"`. Vá luôn hai `<span>` thiếu.
- **Chân `khong-dich` so chuỗi với chính nó** — AC: AC-6.
  Bảng tra khoá bằng chính giá trị chuỗi, nên nhánh "vi khác en" là mã chết. Nay
  so theo VỊ TRÍ trong cây DOM; chiều đỏ đã chứng.
- **AC-5 không có chân nào, và E11 chưa từng được chạy** — AC: AC-5, AC-8.
  Ổ cắm `ab_trang_thai` trỏ vào một chân chưa ai viết. E11 thì đỏ vì cấm mọi
  dòng loại trừ còn tiếng Anh, trong khi AC-8 cố ý cho phép sáu file hoãn. Đã
  dựng chân trạng thái thật, và thêm cờ `hoan` chọn-tham-gia có chiều đỏ riêng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Gốc gom chữ của bộ thước màn không chứa thanh bên**
  Người dùng thấy gì: chữ trên thanh bên của khung dựng tác nhân không được phép đo màn nào nhìn thấy, ở cả ba hồ sơ Việt hoá dùng chung bộ thước — một câu tiếng Anh sót ở đó sẽ đi qua mọi cổng mà không ai bắt.
  file: `_acceptance/man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs`
  severity: P1
  Đề xuất: new-contract — nới gốc là kéo cả thanh điều hướng ứng dụng, vùng còn tiếng Anh của hồ sơ khác, vào phép đo của ba hồ sơ; không sửa tại chỗ được
- **Trạng thái tác nhân hiện ra bằng tiếng Anh**
  Người dùng thấy gì: danh sách tác nhân của đội in trạng thái là `draft`, `live`, `paused` — chữ tiếng Anh viết thường, giữa một màn đã tiếng Việt.
  file: `apps/app/components/agent-builder/team-agents-index.tsx:49`
  severity: P2
  Đề xuất: new-contract — nó không phải chuỗi hằng nên không bộ quét nào thấy, và chỉ vẽ ra khi đội đã có tác nhân, tức sau giới hạn route; gộp với đợt hai
- **Chiều đỏ của chân bề rộng không chứng được trên lát này**
  Người dùng thấy gì: phép đo "nhãn tiếng Việt dài có tràn khỏi hộp không" chưa từng đỏ một lần nào trên lát này, nên nó không phân biệt được "bản dịch vừa" với "thước đang mù".
  file: `_acceptance/agent-builder-noi-tieng-viet/rang/be-rong-do.sh`
  severity: P2
  Đề xuất: known-limits — nay đã ĐO chứ không còn ghi tay: bốn hộp chặt cứng trên hai màn tới được, 0 hộp mang chữ của lát này; màn có nhãn trong hộp hẹp nằm dưới cùng giới hạn với AC-1

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
