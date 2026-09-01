---
slug: tieng-viet-cho-crm
at: 2026-09-01T08:05:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Phản biện ngữ cảnh sạch — tiếng Việt cho CRM, vòng ①

Một ngữ cảnh tươi đọc đúng năm file (spec · hợp đồng · phép đo · sổ quyết định ·
ô cơ hội) cộng từ điển sản phẩm. Không đọc mã, không đọc hội thoại.

Sổ bài học xuyên tính năng trả về rỗng, nên không có đầu vào thứ năm.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | AC-6 hứa "không còn chuỗi tiếng Anh" trong khi Ngoài phạm vi cấm chạm bộ dựng chung, mà màn công ty vẽ ra chuỗi của bảng dùng chung | Người mở màn, thấy "No results found." từ bảng dùng chung. E6 chỉ grep đường dẫn app nên vẫn xanh. Cổng duyệt một lời hứa mà chính phạm vi của nó cấm giữ | Đếm chuỗi màn công ty thừa hưởng từ bộ dựng chung, rồi hoặc kéo vào phạm vi hoặc gọi tên vào AC-6 làm ngoại lệ | fixed: kiểm mã cho thấy BA chuỗi đã nhận từ ngoài vào (`empty`, `facet.empty`, `tabs.allLabel`) nên truyền được mà không sửa component; hai nhãn trình-đọc-màn-hình khoá cứng nay có tên trong AC-6 làm ngoại lệ. E6 chuyển sang đo TRANG ĐÃ VẼ, không grep mã nguồn |
| P0 | evals | E8 khai một thực thể thay vì cả lớp, và bỏ chiều đỏ mà spec đã tuyên | `formatDay` đổi theo ngôn ngữ, bốn hàm còn lại giữ `en-US`. E8 thấy một hàm khác nhau rồi thoát 0. Tiền và số vẫn tiếng Anh trên màn tiếng Việt, không ai thấy đỏ | Ghim ma trận đủ: 5 hàm × 2 ngôn ngữ, mỗi ô một chuỗi kỳ vọng cố định. Thêm chiều đỏ mà E4/E5/E7 đã có | fixed: `expected` của E8 nay ghim đủ 5 hàm × 2 ngôn ngữ trên một giá trị cố định, cộng chiều đỏ "trả MỘT hàm về en-US thì chân này đỏ và gọi đúng tên hàm" |
| P1 | evals | AC-1/AC-2 phụ thuộc lượt vẽ máy chủ, nhưng E1/E2 là script đo một hàm thuần. Không phép đo nào chứng minh trang gốc GỌI hàm đó | Hàm trả `vi` đúng, E1 xanh. Trang gốc không truyền header vào, rơi về `en`. Nhân viên lần đầu với trình duyệt tiếng Việt thấy tiếng Anh, cả hai phép đo đều xanh | Thêm một phép đo ở tầng vẽ: gửi `Accept-Language: vi`, không cookie, khẳng định `<html lang="vi">` trong HTML máy chủ | fixed: E1 và E2 chuyển hẳn sang ui-check ở tầng vẽ, đúng dụng cụ E3 đang dùng |
| P1 | contract | Trục độ phủ "nguồn ngôn ngữ" có giá trị **đã chọn `en`** mà không AC nào phủ. Không câu nào nói lựa chọn đã lưu thắng ngôn ngữ trình duyệt | Nhân viên thử tiếng Việt, không thích, đổi về tiếng Anh. Chrome của họ khai `vi` trước. Mỗi lần tải lại kéo họ về tiếng Việt. Không phép đo nào đỏ | Thêm AC: đã chọn `en` + `Accept-Language: vi` → hiện tiếng Anh | fixed: thêm AC-12 và E11 đo ở tầng vẽ |
| P1 | contract | AC-5 nói "đóng trình duyệt", E5 đo "đóng tab". Không vật nào khai tuổi thọ cookie, `Path`, `SameSite` | Cookie ship dạng cookie-phiên. E5 đóng tab trong cùng phiên nên cookie sống, phép đo xanh. Nhân viên tắt máy buổi tối, sáng mai CRM lại tiếng Anh | Khai hợp đồng cookie trong spec; E5 khẳng định thẳng thuộc tính `Set-Cookie` | fixed: hợp đồng cookie khai trong mục Notes (`Max-Age` một năm · `Path=/` · `SameSite=Lax`); E5 chuyển sang script khẳng định ba thuộc tính, kèm chiều đỏ |

## Điều phản biện nêu thêm, dưới ngưỡng cap 5

- **AC-9 không có con số bề rộng** — người chấm tự chọn khổ nào cũng xanh.
  Xử: fixed — AC-9 ghim 768px, và nói rõ ô dữ liệu vẫn được phép cắt.
- **AC-10 dùng bộ quét a11y tự động** — nó không chứng minh được vòng tiêu điểm
  nhìn thấy được hay menu mở bằng bàn phím.
  Xử: fixed — E10 chuyển sang ui-check có bước Tab rồi Enter, đọc ảnh.
- **E7 grep một chuỗi trong khi lời hứa là một quan hệ** — `translate="no"` đặt
  ở một thẻ bọc nào đó cũng qua được grep.
  Xử: fixed — `expected` của E7 nay đòi CHÍNH phần tử vẽ tên công ty mang thuộc
  tính đó.
- **Không vật nào liệt mười nhãn tiếng Việt**, nên hội đồng ở AC-11 chấm chữ
  chưa ai khai — và spec ghi nhãn cột đầu là "Công ty" trong khi luật
  ngắn-theo-ngữ-cảnh của `CONTEXT.md` cho ví dụ chính màn này là "Tên".
  Xử: fixed — mười nhãn khai trong mục Notes của hợp đồng; hội đồng chấm đúng
  danh sách đó.
- **Thước "số nhân viên giữ tiếng Việt sau một tuần" không có nguồn sinh** —
  không AC, không phép đo, không sự kiện đo đạc nào trong bất kỳ vòng nào.
  Xử: deferred — thước này thuộc cả năm vòng, không riêng vòng ①. Ghi vào ô cơ
  hội làm việc còn nợ; nó không chặn Cổng 1 của vòng này.

## Điều phản biện tự khai là chưa kiểm

Nó không mở `_acceptance/config.yaml` vì giới hạn năm file, nên các khoá
`config:executors.*` trong phép đo là **chưa xác minh** dưới mắt nó. Tôi đã tự
kiểm: lint độ phủ chạy sạch, và mọi khoá giải được bằng bộ đọc của kit.
