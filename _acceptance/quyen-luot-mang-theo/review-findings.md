## Trong hợp đồng

### Assertion một chiều: đường ghi chỉ đo nhánh "được phép", không có chiều đối chứng
- file: `apps/agent/test/builder-runtime.integration.spec.ts:100`
- severity: high
- AC: AC-1
- source: measurement

E1 của quyen-luot-mang-theo hứa: "CAP HAI CHIEU tren CUNG mot fixture ctx, khac dung MOT truong (commandType). Doi mot truong ma ban ghi khong lat -> ma 1". Nhưng cả 6 lời gọi persistBuilderInputRequest trong file (dòng 100, 136, 140, 143, 201, 215) đều truyền `true` cho tham số `authorized` mới, và cả 3 assert đọc lại hàng trong DB (dòng 109, 163, 234) đều mong `[BUILDER_AUTHORIZATION_KEY]: true`. Không có một lượt nào truyền `false`. Đây là hình dạng 4 — assertion một-mình-một-chiều, không đối chứng. Hệ quả cụ thể: nếu apps/agent/agent/lib/builder-input.ts dòng 91-94 bị viết thành `buildPendingInputRequest(question, true)` (bỏ qua tham số `authorized`), toàn bộ file test này vẫn xanh, trong khi đúng lỗ hổng mà AC-1 sinh ra để chặn — lượt hỏi không được phép vẫn ghi bản ghi mang quyền — lọt nguyên. Chiều "khác đúng một trường" mà eval bắt buộc chưa được cài ở đường ghi (đường đọc của apps/api thì có đủ hai chiều tại conversations.spec.ts dòng 685 và 755).

Vì sao map AC-1: AC-1 đòi rõ hai chiều dùng chung một fixture, khác đúng một trường (authorized true/false); finding chỉ ra cả 6 lời gọi đều truyền true, chiều đỏ hoàn toàn vắng mặt.

### Ma trận lớp khai 3 hình dạng nhưng chỉ có 2: nhánh "thiếu trường quyền" thật ra là trường có mặt = false
- file: `apps/api/test/quyen-luot.spec.ts:40`
- severity: high
- AC: AC-4
- source: measurement

Test "ba hinh dang nguon quyen khong dung duoc deu cho CHAT" (dòng 37-47) khai đúng ba hình dạng của E4: (i) không có pendingInputRequest, (ii) có nhưng THIẾU trường quyền, (iii) có nhưng SAI KHUÔN. Phần tử thứ hai của mảng `hong` là `cauHoi()` (dòng 40). Nhưng `cauHoi` (dòng 10-21) dựng bằng `buildPendingInputRequest(question, false)`, và hàm đó ở packages/validation/src/builder-question.ts dòng 60 luôn trả `{ ...question, [BUILDER_AUTHORIZATION_KEY]: authorized }` — tức khóa quyền CÓ mặt và bằng `false`. Vậy phần tử (ii) không phải "thiếu trường quyền" mà là bản ghi hợp lệ mang quyền phủ định, và nó trùng byte-với-byte trường hợp đã assert ở test trước đó (dòng 30-34: `cauHoi({ [BUILDER_AUTHORIZATION_KEY]: false })` -> CHAT). Hình dạng thật sự nguy hiểm — hàng pendingInputRequest cũ đã nằm trong cơ sở dữ liệu từ trước migration, hoàn toàn KHÔNG có khóa quyền — không hề được đo. `expect(hong).toHaveLength(3)` ở dòng 39 đếm chính mảng vừa dựng nên nó vẫn xanh và tạo cảm giác ma trận đã đủ (hình dạng 5). So sánh: cùng ba hình dạng ấy ở apps/agent/test/quyen-luot.spec.ts dòng 32-35 làm đúng — phần tử (ii) là object literal viết tay KHÔNG có khóa quyền.

Vì sao map AC-4: AC-4 đòi đúng ba hình dạng riêng biệt (không có bản ghi · thiếu trường quyền · sai khuôn); finding chỉ ra hình dạng "thiếu trường quyền" thực chất trùng với hình dạng "có trường quyền=false" đã đo ở chỗ khác, nên một trong ba hình dạng bắt buộc không được đo.

### Tuyên "đếm trên đĩa" nhưng chỉ quét danh sách hai file viết cứng
- file: `apps/agent/test/quyen-luot.spec.ts:93`
- severity: medium
- AC: AC-5
- source: measurement

E5 khai sàn dân số: "dem tren dia so cho suy quyen tu hinh dang tin nhan phai bang 0; khac 0 -> ma 2, IN file:dong". Test "suy-dien: dem tren dia..." (dòng 81-107) không quét cây nguồn: `soi` ở dòng 93-96 là mảng literal đúng hai đường dẫn (`../agent/lib/custom-agent-dispatch.ts`, `../agent/lib/builder-input.ts`), và `expect(soi).toHaveLength(2)` là phép đếm trên chính mảng vừa viết ra, luôn đúng. Đây là hình dạng 5: lời hứa quét LỚP ("trên đĩa") nhưng phép đo là điểm-case trên hai file được chọn tay. Hệ quả: lối suy quyền từ hình dạng tin nhắn (`requestId && (optionId || text) ? "CREATE_AGENT" : ...`) mọc lại ở bất kỳ file thứ ba nào — kể cả một file khác trong apps/agent, hay apps/api/src/conversations/conversations.service.ts — đều không bị bắt, trong khi phép đo vẫn báo 0. Phần đối chứng dương của test thì làm đúng (dòng 88-90 chạy regex trên chuỗi mẫu `chung` và bắt buộc khớp 1 lần), nên chỉ riêng dân số là chỗ hở.

Vì sao map AC-5: AC-5 đòi sàn dân số là phép đếm trên đĩa số chỗ suy quyền từ hình dạng tin nhắn; finding chỉ ra phép đếm thực chất là mảng hai đường dẫn viết tay, không quét cây nguồn, nên không bắt được chỗ suy quyền mới mọc lại ở file thứ ba.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Chốt "phải save trước final_output" nay khoá theo quyền chứ không theo status, nên draft_ready bịa vẫn lọt**
  Người dùng thấy gì: Khi một yêu cầu bị từ chối quyền, hệ thống vẫn có thể báo với người dùng rằng bản nháp agent đã sẵn sàng để duyệt dù chưa có gì được lưu thật, khiến người dùng duyệt nhầm một bản nháp không tồn tại.
  file: `apps/agent/agent/subagents/agent_builder/lib/execution-state.ts`
  severity: medium
  Đề xuất: new-contract

- **buildPendingInputRequest parse lại một domain type đã parse, và throw nằm trong transaction**
  Người dùng thấy gì: Nếu hai định nghĩa mô tả câu hỏi lệch khỏi nhau, một câu hỏi hợp lệ có thể bị từ chối lưu và cả nhật ký liên quan cũng bị huỷ theo, dù rủi ro này chưa xảy ra với dữ liệu hiện tại.
  file: `apps/agent/agent/lib/builder-input.ts`
  severity: low
  Đề xuất: known-limits

- **Hàm "không nuốt lỗi" readBuilderAuthorization không có người gọi nào trong code chạy thật**
  Người dùng thấy gì: Không ảnh hưởng người dùng hiện tại vì đường xử lý thật vẫn tự động từ chối an toàn khi dữ liệu sai khuôn; đây chỉ là một khoảng hở trong cách kiểm thử, chưa phải hành vi sai trên sản phẩm.
  file: `packages/validation/src/builder-question.ts`
  severity: medium
  Đề xuất: known-limits

- **Lượt không được phép có thể trả draft_ready mà chưa lưu gì — chốt cơ học duy nhất đã bị tắt**
  Người dùng thấy gì: Trên một yêu cầu bị từ chối quyền, hệ thống agent vẫn có thể báo bản nháp đã sẵn sàng để người dùng duyệt trong khi không có gì thật sự được lưu, dẫn đến việc duyệt một bản nháp không tồn tại.
  file: `apps/agent/agent/subagents/agent_builder/lib/execution-state.ts`
  severity: medium
  Đề xuất: new-contract

- **commandType vẫn do client tự khai trên createBuilder/submitBuilder — chuỗi quyền mới không chặn đường này**
  Người dùng thấy gì: Bất kỳ thành viên nào trong workspace cũng có thể tự đánh dấu một tin nhắn trò chuyện bình thường thành yêu cầu tạo agent đã được duyệt, khiến hệ thống thực hiện một hành động lẽ ra cần được cấp quyền rõ ràng.
  file: `apps/api/src/conversations/conversations.contracts.ts`
  severity: low
  Đề xuất: new-contract

- **Dân số ma trận purpose là hằng viết tay, sàn dân số mà E4 đòi chỉ là phép đếm tự quy chiếu**
  Người dùng thấy gì: Nếu sau này hệ thống có thêm một loại phiên làm việc mới, phép kiểm tra quyền tương ứng cho loại phiên đó có thể không được kiểm tra dù báo cáo kiểm thử vẫn hiện xanh.
  file: `apps/agent/test/chan-uy-thac.spec.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/9 lỗi rơi vào file không bộ đo nào phủ (apps/agent/agent/subagents/agent_builder/lib/execution-state.ts, apps/api/src/conversations/conversations.contracts.ts, apps/agent/test/chan-uy-thac.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.