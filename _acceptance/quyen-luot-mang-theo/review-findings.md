## Trong hợp đồng

### BuilderAuthorizationFlag viết tay cạnh schema thay vì z.infer
- file: `packages/validation/src/builder-question.ts:51`
- severity: medium
- AC: AC-2
- source: conventions

authorizationEnvelope được khai bằng zod ở dòng 47-49, rồi ngay dưới nó BuilderAuthorizationFlag được gõ tay lại cùng hình dạng ở dòng 51-53. AGENTS.md, mục "Parse at the boundary", chốt: "Derive types with z.infer. Never hand-write an interface beside a schema; they drift." Ở đây kiểu viết tay là kiểu TRẢ VỀ của buildPendingInputRequest (dòng 58), nên khi envelope đổi (thêm trường, đổi boolean thành enum) thì compiler sẽ không bắt được lệch — đúng cái drift mà luật cấm. Sửa: `export type BuilderAuthorizationFlag = z.infer<typeof authorizationEnvelope>;`

Vì sao map AC-2: AC-2 chốt kiểu suy bằng z.infer, cấm viết tay kiểu bên cạnh schema — đúng lỗi finding nêu.

### Fixture VIẾT TAY đúng khuôn bên đọc — toàn bộ phép đo AC-3/AC-4 của API không round-trip
- file: `apps/api/test/quyen-luot.spec.ts:11`
- severity: high
- AC: AC-3
- source: measurement

Helper `cauHoi()` (dòng 11-17) tự dựng bản ghi bằng object literal rồi nhét thẳng `[BUILDER_AUTHORIZATION_KEY]` qua `over`, và cả ba bài đo trong file đều chạy trên nó. Không bài nào gọi `buildPendingInputRequest` (packages/validation) hay `persistBuilderInputRequest` (apps/agent/agent/lib/builder-input.ts) — tức bản ghi được đọc chưa bao giờ do đường GHI thật sinh ra. Đây đúng cái mà E3 trong _acceptance/quyen-luot-mang-theo/evals.yaml cấm bằng chữ: "ROUND-TRIP, khong tu dung fixture dung khuon ben doc: ban ghi PHAI do CHINH ham persist cua apps/agent (builder-input.ts) sinh ra. KHONG co duong lui — dung mot ham dung nao khac de tao ban ghi -> ma 2." Hệ quả cụ thể: writer đổi tên trường (hoặc lồng cờ quyền xuống một tầng) thì fixture viết tay vẫn giữ khuôn cũ, `commandTypeFromAuthorization` vẫn trả CREATE_AGENT, ba bài vẫn xanh, trong khi trên prod API đọc `undefined` và rơi hết về CHAT.

Vì sao map AC-3: khớp nguyên văn sàn khuôn AC-3: bản ghi phải do đường ghi thật của apps/agent sinh ra, dựng bằng đường khác đúng khuôn bên đọc là "mã 2".

### Assert "chuỗi có mặt" trong mã nguồn thay cho QUAN HỆ bản-ghi → commandType của submission
- file: `apps/api/test/quyen-luot.spec.ts:45`
- severity: high
- AC: AC-3
- source: measurement

Bài `service khong con ghim cung CREATE_AGENT cho cau tra loi` không gọi service. Nó `readFileSync` conversations.service.ts rồi assert trên văn bản: dòng 50 đếm số lần xuất hiện chuỗi `"commandTypeFromAuthorization("` phải bằng 1; dòng 52-55 đòi file chứa nguyên văn `"commandType: commandTypeFromAuthorization(\n\t\t\t\t\t\t\tconversation.pendingInputRequest,"` — khớp đến từng ký tự tab thụt lề; dòng 56-60 đếm regex `commandType: "CREATE_AGENT"`. Lời hứa của AC-3 là một quan hệ giữa hai giá trị (bản ghi "được phép" → submission.commandType = CREATE_AGENT; "không được phép" → CHAT), và evals.yaml E3 khai đúng cặp hai chiều đó. Không assert nào trong file đọc `submission.commandType` do service sinh ra. Phép đo này đổi màu khi ai đó chạy formatter (đổi thụt lề) và vẫn xanh khi service gọi hàm rồi vứt kết quả đi.

Vì sao map AC-3: AC-3 đòi quan hệ hai chiều bản ghi→commandType được đo trực tiếp; đo bằng chuỗi mã nguồn không thoả Then của AC-3.

### Fixture viết tay đúng khuôn bên đọc trong bài DUY NHẤT chạy service thật
- file: `apps/api/test/conversations.spec.ts:708`
- severity: medium
- AC: AC-3
- source: measurement

Bài `queues a pending builder answer for the CRM-owned Eve channel` là chỗ duy nhất trong diff cho `answerBuilderQuestion` chạy end-to-end và assert `submission.commandType === "CREATE_AGENT"`. Nhưng hàng pendingInputRequest được ghi thẳng vào DB bằng object literal viết tay ở dòng 700-709, với `[BUILDER_AUTHORIZATION_KEY]: true` gắn tay (dòng 708), thay vì cho `buildPendingInputRequest` / `persistBuilderInputRequest` sinh ra. Bên ghi thật (apps/agent) và bên đọc (API) vì thế không được nối trong bất kỳ phép đo nào: khuôn ghi lệch khỏi khuôn đọc thì bài này vẫn xanh vì nó tự dựng khuôn đọc. Đúng hình dạng mà E1 và E3 của _acceptance/quyen-luot-mang-theo/evals.yaml gọi tên là "mã 2".

Vì sao map AC-3: cùng sàn khuôn "mã 2" của AC-3 — bản ghi đọc được dựng tay đúng khuôn thay vì qua đường ghi thật của apps/agent.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Ba bài test mới chấm bằng cách đọc mã nguồn thành chuỗi, một bài còn với sang app khác**
  Người dùng thấy gì: Một số bài kiểm tra tự động cho tính năng này không thực sự chạy lại chức năng để kiểm chứng — chúng chỉ soi văn bản mã nguồn, nên khi ai đó chỉnh cách trình bày code mà không đổi hành vi, bài kiểm tra có thể báo lỗi giả, và ngược lại có thể không phát hiện khi hành vi thật sự sai.
  file: `apps/agent/test/quyen-luot.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hai bài đo cổng chấm bằng chuỗi mã nguồn, kể cả số ký tự tab**
  Người dùng thấy gì: Hai phép đo cổng chỉ so khớp đúng từng ký tự trong mã nguồn thay vì kiểm tra hành vi thực tế, nên chúng có thể báo lỗi giả khi định dạng code thay đổi, và không chắc phát hiện được khi hành vi thật sự sai.
  file: `apps/api/test/quyen-luot.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Đo CHỈ DẪN thay vì ĐẦU RA — grep instructions.md, còn cặp đôi "chỉ dẫn khớp schema" không hề được đo**
  Người dùng thấy gì: Phép kiểm tra rằng agent biết cách từ chối khi không được phép chỉ xác nhận tài liệu hướng dẫn có nhắc đúng từ khoá, chứ chưa thực sự kiểm tra agent có trả về đúng phản hồi đó trong tình huống thật — nên chưa có gì đảm bảo hành vi từ chối hoạt động đúng ngoài lý thuyết.
  file: `apps/agent/test/quyen-luot.spec.ts`
  severity: high
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).