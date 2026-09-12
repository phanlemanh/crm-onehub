> Review Findings: do-quyen-luot-bang-hanh-vi (round 9)

## Trong hợp đồng

_Không có finding nào khớp AC nào của hợp đồng vòng này._

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Đột biến sống sót bị báo là MA_GIAN_HONG (3) thay vì MA_VI_PHAM (2); nhánh gom 'vecto ra XANH' là mã chết**
  Người dùng thấy gì: Khi một phép đo KHÔNG bắt được đường leo quyền — hỏng nặng nhất có thể — nhật ký lại báo như thể hạ tầng trục trặc, nên người đọc sẽ chạy lại thay vì đọc ra rằng thước đã thủng.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/cong-quyen-do.mjs`
  severity: medium
  Đề xuất: new-contract

- **BuilderAuthRow bắt buộc trường message mà không đường nào đọc — đọc ngược lại đúng bất biến vừa dựng**
  Người dùng thấy gì: Kiểu dữ liệu ở đúng chỗ cấp quyền vẫn bắt phải nộp nội dung tin nhắn vào, dù không chỗ nào đọc nó — người sửa tiếp theo dễ tưởng tin nhắn vẫn có phần trong việc quyết quyền.
  file: `apps/agent/agent/lib/custom-agent-dispatch.ts`
  severity: low
  Đề xuất: known-limits

- **commandType bị nới thành string trên suốt đường quyền dù cột Prisma là enum AgentConversationCommandType**
  Người dùng thấy gì: Giá trị quyết định quyền đi suốt đường bằng kiểu chuỗi tự do, nên một lỗi gõ sẽ lặng lẽ thành quyền thấp nhất thay vì đỏ lúc biên dịch.
  file: `apps/agent/agent/lib/custom-agent-dispatch.ts`
  severity: low
  Đề xuất: known-limits

- **Call site còn truyền tham số `message` đã bị xoá khỏi `builderSessionAttributes` — check-types không bắt được vì tsconfig loại trừ thư mục test**
  Người dùng thấy gì: Một bài kiểm thử còn sót lại đúng hình dạng cũ mà vòng này tuyên đã xoá; không cổng nào thấy vì cổng kiểu không soi thư mục test.
  file: `apps/agent/test/tran-uy-thac.spec.ts`
  severity: low
  Đề xuất: known-limits

- **tu-kiem-khung.mjs gỡ handler ngắt TRƯỚC cửa sổ chậm nhất — Ctrl-C để lại neo.txt bẩn trong cây làm việc**
  Người dùng thấy gì: Bấm Ctrl-C giữa lúc phép tự kiểm đang dựng bản sao thì một tệp trong kho ở lại bẩn, sẵn sàng lọt vào commit sau.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/tu-kiem-khung.mjs`
  severity: low
  Đề xuất: known-limits

- **`git worktree remove` hỏng bị catch nuốt trọn — chỉ xoá thư mục, để lại bản đăng ký worktree trong git common dir dùng chung**
  Người dùng thấy gì: Khi dọn bản sao thất bại, lỗi bị nuốt im lặng và rác tích lại trong kho dùng chung, chỉ lộ ra khi có người đi xem danh sách worktree.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs`
  severity: low
  Đề xuất: known-limits

- **Tuyên quét LỚP nhưng chỉ có điểm-case — hai biến thể `inputResponse` không tới được mã đang đo**
  Người dùng thấy gì: Bài đo tuyên chạy cả hai biến thể của câu trả lời người dùng, nhưng chiều được thay đổi ấy không chạm tới đoạn mã đang đo — nên con số «hai biến thể» không mua thêm bảo đảm nào.
  file: `apps/agent/test/quyen-luot.spec.ts`
  severity: medium
  Đề xuất: new-contract
