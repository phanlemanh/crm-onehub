> Review Findings: do-quyen-luot-bang-hanh-vi (round 5)

## Trong hợp đồng

_Không có finding nào khớp AC nào của hợp đồng vòng này._

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Lệnh cấm tuyệt đối trong AGENTS.md bị nới ngay giữa nhánh để hợp thức hoá 15 commit đã vi phạm trước đó**
  Người dùng thấy gì: Việc nới lỏng quy định về đồng tác giả trong commit được gộp chung vào nhánh của một tính năng khác, nên người duyệt đọc theo tên nhánh có thể bỏ sót một thay đổi quy định áp dụng cho toàn bộ dự án.
  file: `AGENTS.md`
  severity: high
  Đề xuất: new-contract

- **Giới hạn đã khai của sàn khoá không có phép đo nào canh; hàm viết ra để canh nó là mã chết**
  Người dùng thấy gì: Có một giới hạn đã biết trong việc phát hiện các cách viết quyền truy cập ẩn, nhưng không có cảnh báo tự động nào nếu số lượng trường hợp chưa được kiểm soát này tăng lên trong tương lai.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/ast.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hồ sơ bằng chứng và thẻ Cổng 2 ở HEAD mô tả một bộ răng không còn tồn tại**
  Người dùng thấy gì: Báo cáo bằng chứng đưa ra cho người quyết định đang mô tả một phiên bản mã cũ hơn phiên bản mới nhất, nên người đọc có thể tin rằng mọi thứ đã được xác minh đầy đủ trong khi thực tế mã đã thay đổi thêm sau đó.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/evidence-report.md`
  severity: medium
  Đề xuất: known-limits

- **khong-cam-tin-nhan.mjs khai lại hằng đường dẫn đã import từ chung.mjs**
  Người dùng thấy gì: Nếu vị trí một tệp quan trọng trong hệ thống thay đổi trong tương lai, một phần của công cụ kiểm tra bảo vệ có thể không được cập nhật theo và âm thầm mất tác dụng.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/khong-cam-tin-nhan.mjs`
  severity: medium
  Đề xuất: wont-fix

- **giuKhoa() phá khoá của tiến trình còn sống sau 120s, rồi chủ cũ xoá khoá của chủ mới**
  Người dùng thấy gì: Khi có nhiều thao tác kiểm tra chạy cùng lúc, chúng có thể giẫm lên nhau và làm mất đi lớp bảo vệ chống xung đột, khiến kết quả kiểm tra sau đó không còn đáng tin mà không có dấu hiệu cảnh báo nào.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs`
  severity: medium
  Đề xuất: new-contract

- **Hợp đồng đã niêm của vòng trước bị để lại với `expected` cố ý sai so với lệnh nó chạy**
  Người dùng thấy gì: Người xem lại hồ sơ kiểm tra cũ trong tương lai có thể hiểu nhầm về hành vi đang thực sự được đo, vì lời đính chính nằm cách xa nội dung liên quan.
  file: `_acceptance/quyen-luot-mang-theo/contract.md`
  severity: medium
  Đề xuất: wont-fix

- **BuilderAuthRow bắt buộc trường `message` mà builderSessionAuthFromRow không bao giờ đọc**
  Người dùng thấy gì: Người đọc định nghĩa dữ liệu có thể tưởng rằng nội dung tin nhắn vẫn ảnh hưởng đến việc cấp quyền, dù thực tế nó không còn được dùng cho việc đó nữa.
  file: `apps/agent/agent/lib/custom-agent-dispatch.ts`
  severity: low
  Đề xuất: known-limits

- **Executor dq_mang_theo_do khai trong config nhưng không eval nào trỏ tới**
  Người dùng thấy gì: Danh sách các phép kiểm tra đang khai báo một mục không có phép kiểm tra chính thức nào sử dụng, có thể khiến người đọc tưởng nhầm có một lớp bảo vệ đang hoạt động ở đó.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: wont-fix

- **Hai răng import GOC nhưng không dùng**
  Người dùng thấy gì: Đây là phần mã thừa không ảnh hưởng đến người dùng sản phẩm, chỉ là điểm gọn gàng chưa được dọn trong công cụ kiểm tra nội bộ.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/cong-quyen-do.mjs`
  severity: low
  Đề xuất: wont-fix

- **tenKhoa() trả null im lặng cho computed key không đọc được — chỗ ghi commandType leo quyền tàng hình với CẢ HAI răng ma trận, cả hai vẫn thoát 0**
  Người dùng thấy gì: Một cách viết mã ít phổ biến có thể khiến việc gán quyền tạo trợ lý ảo đi qua mà không bị lớp kiểm tra bảo vệ phát hiện; đây là rủi ro đã được nhận diện và chấp nhận trước khi bàn giao, nhưng vẫn chưa có cách tự động cảnh báo khi nó thực sự xảy ra.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/ast.mjs`
  severity: high
  Đề xuất: known-limits

- **Rubric chấm của E7 neo vào một hàm không tồn tại (respondToQuestion) — judgment eval được chấm PASS trên một mỏ neo không thể tìm thấy**
  Người dùng thấy gì: Một phần của việc chấm điểm tài liệu đang dựa vào một mốc tham chiếu không còn đúng, nên nếu sau này tài liệu ghi sai thông tin về quyền, phần chấm điểm này có thể không phát hiện ra.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/evals.yaml`
  severity: medium
  Đề xuất: wont-fix

- **Nhánh báo "vecto ra XANH" của cong-quyen-do.mjs và mang-theo-do.mjs là mã chết — mã thoát thật là 3, không phải 2 như evals khai**
  Người dùng thấy gì: Khi một trường hợp lẽ ra phải bị bắt lỗi mà lọt qua, thông báo hiện ra lại nói là do lỗi hạ tầng thay vì chỉ đích danh trường hợp bị lọt, khiến người xem khó biết chỗ nào thực sự cần chú ý.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/cong-quyen-do.mjs`
  severity: low
  Đề xuất: wont-fix

- **Tuyên quét LỚP nhưng chỉ có điểm-case: "ma trận toàn phần" của E4/E3 âm thầm bỏ khỏi dân số mọi computed key nó không giải được**
  Người dùng thấy gì: Lời hứa rằng phép kiểm tra bao trùm toàn bộ các cách viết quyền thực chất chỉ bao phủ một số cách viết phổ biến; các cách viết khác vẫn có thể lọt qua mà không bị phát hiện, đúng như giới hạn đã được ghi nhận và chấp nhận từ trước.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/ast.mjs`
  severity: high
  Đề xuất: known-limits

- **Assert "chuỗi có mặt" trong khi lời hứa là QUAN HỆ: lớp kiểm ghim của E8 luôn đúng với hai dòng khai E2 và dòng E5**
  Người dùng thấy gì: Một trong hai lớp kiểm tra chéo để đảm bảo lỗi được bắt đúng lý do có thể luôn hiện diện bất kể kết quả đúng hay sai, khiến lớp bảo vệ thứ hai này không thực sự phân biệt được trường hợp đúng và sai cho một số bài kiểm tra.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/khai-sinh.mjs`
  severity: high
  Đề xuất: wont-fix

- **Assertion âm-tính không ghim thông điệp: `.toThrow()` trần trong khi hàm có hai đường ném khác nhau**
  Người dùng thấy gì: Một bài kiểm tra xác nhận rằng hệ thống từ chối đúng trường hợp, nhưng không phân biệt được nếu sau này nó từ chối vì một lý do sai khác, nên một lỗi mới có thể lọt qua mà bài kiểm tra này vẫn báo đạt.
  file: `apps/agent/test/quyen-luot.spec.ts`
  severity: medium
  Đề xuất: wont-fix

- **Tuyên ba luật nhưng chỉ có điểm-case cho hai: luật 3 của E6 không có vecto nào chạm tới, và vecto duy nhất kích hoạt hai luật cùng lúc**
  Người dùng thấy gì: Một quy tắc nhằm ngăn việc âm thầm xoá bài kiểm tra quan trọng chưa từng được tự thử nghiệm để chắc chắn nó thật sự phát hiện được hành vi xoá đó, nên hiện chưa có gì đảm bảo quy tắc này hoạt động đúng như kỳ vọng.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/bo-do-grep.mjs`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 3/16 lỗi rơi vào file không bộ đo nào phủ (AGENTS.md, _acceptance/do-quyen-luot-bang-hanh-vi/evidence-report.md, _acceptance/config.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
