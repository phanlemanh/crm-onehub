## Trong hợp đồng

- **Hình dạng 3 — assert chuỗi có/không có mặt trong khi lời hứa là QUAN HỆ giữa kiểu tham số và type công khai của eve**
  file:line: `_acceptance/tran-uy-thac-chiu-chay-lai/rang/kieu-theo-eve.mjs:43`
  severity: high
  detail: AC-10/E10 hứa một quan hệ: kiểu tham số của `recordBuilderDelegation` SUY TỪ `HookEvent<"actions.requested">["data"]` của `eve/hooks`. Răng đo quan hệ đó bằng hai thứ, cả hai đều không phải quan hệ ấy: (1) dòng 43 `if (/BuilderDelegationAction/.test(nguon))` — một phép grep trên văn bản mã nguồn, chỉ bắt đúng MỘT cái tên; (2) dòng 48–63 + 105–115 — bài thử tsc chỉ đòi bốn trường `actions/sequence/stepIndex/turnId` có mặt, thiếu `stepIndex` thì tsc đỏ.

    Đã dựng phản-ví dụ: một module khai TAY `type TuVietTay = { actions: …; sequence: number; stepIndex: number; turnId: string }` (không chứa chuỗi `BuilderDelegationAction`) chạy đúng dòng lệnh tsc ở dòng 69–86 cho ra `error TS2345 … Property 'stepIndex' is missing in type … but required in type 'TuVietTay'` — tức thoả cả chiều dương và chiều âm, và răng sẽ in "XANH: kieu tham so suy tu type cong khai cua eve". Nên kết luận XANH của E10 không phân biệt được "kiểu neo vào eve" với "kiểu tự viết tay đủ bốn trường, đổi tên"; hồi quy đúng loại mà AC-10 sinh ra để chặn vẫn lọt. Chính E10 tự khai "grep chuoi trong ma nguon" là cách đo sai, rồi dòng 43 làm đúng cái đó ở chiều phủ định.
  source: measurement
  AC: AC-10

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Trần một-lần-uỷ-thác lọt khi hai lời gọi agent_builder đến trong CÙNG step nhưng hai sự kiện khác nhau**
  Người dùng thấy gì: Nếu trợ lý gọi tính năng tạo agent (agent_builder) hai lần rất sát nhau trong cùng một bước xử lý của một lượt trò chuyện, giới hạn "chỉ được gọi một lần mỗi lượt" có thể không nhận ra và để lọt cả hai lần gọi thay vì chặn lần thứ hai.
  file: `apps/agent/agent/lib/builder-delegation.ts`
  severity: high
  Đề xuất: new-contract

- **Tiêu chí và eval 'toạ độ rải rác' đo một hình dạng sự kiện eve không thể phát ra**
  Người dùng thấy gì: Bài kiểm tra tự động cho ca "lời gọi thứ hai đến rải rác trong cùng bước xử lý" dùng dữ liệu giả không khớp với cách hệ thống thật vận hành, nên việc bài kiểm tra báo đạt chưa chắc chứng minh được ca đó được bảo vệ đúng trong thực tế.
  file: `apps/agent/test/tran-uy-thac.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Trần một-lần-uỷ-thác bị bỏ qua khi mô hình gọi agent_builder hai lần song song trong cùng một step**
  Người dùng thấy gì: Nếu trợ lý gọi tạo agent hai lần cùng lúc (song song) trong một bước xử lý, giới hạn "một lần mỗi lượt" có thể bị bỏ qua và cả hai lời gọi đều được thực hiện thay vì chỉ một.
  file: `apps/agent/agent/lib/builder-delegation.ts`
  severity: high
  Đề xuất: new-contract

- **Nửa `sequence` của khoá là nhánh chết: sequence là số thứ tự LƯỢT, suy được từ turnId**
  Người dùng thấy gì: Một phần điều kiện dùng để phân biệt các lần gọi khác nhau trong cùng một bước xử lý không bao giờ thực sự có tác dụng với dữ liệu thật, khiến khả năng phân biệt các ca gọi lặp so với mô tả kỹ thuật kém chắc chắn hơn mong đợi, dù chưa gây lỗi quan sát được ngay.
  file: `apps/agent/agent/lib/builder-delegation.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — bản đột biến VIẾT TAY, không dẫn từ văn bản thật đọc từ đĩa; chốt chống lạc hậu vô hiệu cho nó**
  Người dùng thấy gì: Một trong các bài kiểm tra chống hồi quy được viết cứng sẵn thay vì tự sinh từ mã nguồn thật đang chạy, nên nếu mã nguồn đổi cấu trúc sau này, bài kiểm tra đó có thể không còn phản ánh đúng mã hiện tại dù vẫn báo "đã kiểm tra thành công".
  file: `_acceptance/tran-uy-thac-chiu-chay-lai/rang/hook-chet.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — răng chạy bài đo CHÉP TAY 6 dòng, không chạy bộ đo chuỗi cưỡng chế thật lên bản đột biến**
  Người dùng thấy gì: Bằng chứng cho thấy cơ chế chống hồi quy hoạt động dựa trên một bài kiểm tra rút gọn viết tay, chứ không phải bộ kiểm tra chính thức đầy đủ của tính năng, nên chưa rõ liệu bộ kiểm tra thật sự được giao có bắt được các lỗi hồi quy tương tự trong tương lai hay không.
  file: `_acceptance/tran-uy-thac-chiu-chay-lai/rang/hook-chet.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
