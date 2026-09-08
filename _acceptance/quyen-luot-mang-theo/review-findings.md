## Trong hợp đồng

### Envelope lưu trong pendingInputRequest không có schema mô tả đúng thứ được lưu; ghi bằng spread + cast, đọc bằng hai schema chỉ thấy một nửa
- file: `apps/agent/agent/lib/builder-input.ts:88`
- severity: medium
- AC: AC-2
- source: conventions

Chỗ ghi trộn cờ vào câu hỏi rồi cast thẳng:

    pendingInputRequest: {
        ...question,
        [BUILDER_AUTHORIZATION_KEY]: authorized,
    } as Prisma.InputJsonValue,

Không có parse nào ở lượt ghi, và không tồn tại schema nào mô tả hình dạng thật đang nằm trong cột. Phía đọc có hai schema, mỗi cái chỉ thấy một nửa: `builderQuestion` (packages/validation/src/builder-question.ts:43) đọc phần câu hỏi và bỏ qua cờ, `authorizationEnvelope` (dòng 46) đọc cờ và bỏ qua câu hỏi. AGENTS.md nói rõ ở mục Parse at the boundary: "The schema describes what is actually stored, not the loosest thing that parses", và một shape đi qua ranh giới package — đúng trường hợp này, apps/agent ghi và apps/api đọc — phải sống thành một module một shape trong packages/validation/src.

Hệ quả: hai nửa có thể trôi khỏi nhau mà không ai thấy. Ví dụ nếu eve sau này thêm field `builderAuthorized` vào chính payload câu hỏi, spread sẽ ghi đè hoặc bị ghi đè tuỳ thứ tự, và không schema nào phát hiện. Nên khai một `pendingBuilderInputRequest` duy nhất trong packages/validation/src bao cả câu hỏi lẫn cờ, parse ở lượt ghi thay vì cast, và cho cả hai phía đọc qua nó.

Vì sao map AC-2: AC-2 đòi một module duy nhất parse cả câu hỏi lẫn cờ quyền, không bên nào nhận từ điển mở; ở đây lượt ghi cast thẳng không parse và hai schema đọc mỗi cái chỉ thấy một nửa hình dạng.

### Hình dạng 2 — fixture viết tay đúng khuôn bên đọc, không round-trip qua đường ghi thật
- file: `apps/agent/test/quyen-luot.spec.ts:11`
- severity: high
- AC: AC-3
- source: measurement

`banGhi(authorized)` (dòng 11-18) tự dựng object `{kind, requestId, prompt, options, [BUILDER_AUTHORIZATION_KEY]: authorized}` — đúng y khuôn mà `authorizationEnvelope` trong packages/validation/src/builder-question.ts parse. Mọi assert của cả bốn khối (`ke-thua` dòng 21-22, 54-57; `cong-dong` dòng 132) đều đứng trên fixture này. Bản sao cùng hình dạng ở apps/api/test/quyen-luot.spec.ts:11 (`cauHoi`). Đường GHI thật — `persistBuilderInputRequest` trong apps/agent/agent/lib/builder-input.ts:93, chỗ duy nhất trong sản phẩm sinh ra key `builderAuthorized` — không được gọi ở bất kỳ file test nào trong diff. Hệ quả: nếu đường ghi đặt sai tên khóa, sai độ sâu lồng, hoặc không ghi gì cả, mọi phép đo vẫn xanh vì bên đọc đang đọc chính cái fixture do bài đo tự bịa. Chính evals.yaml của vòng này khai cấm điều đó: E1 (dòng 5-21) viết "CAM tu bia ban ghi roi assert tren no: phai goi CHINH duong ghi that ... roi doc lai gia tri no ghi ra", E3 (dòng 46-63) viết "ROUND-TRIP, khong tu dung fixture dung khuon ben doc ... KHONG co duong lui".

Vì sao map AC-3: AC-3 cấm đúng mẫu này bằng chữ: "không phải một fixture tự dựng đúng khuôn bên đọc" — banGhi() dựng tay đúng khuôn authorizationEnvelope mà không đi qua đường ghi thật.

### Hình dạng 2 — phép đo round-trip duy nhất của đường ghi ghim đúng trạng thái THIẾU cờ quyền, và vẫn xanh
- file: `apps/agent/test/builder-runtime.integration.spec.ts:108`
- severity: high
- AC: AC-1
- source: measurement

`persistBuilderInputRequest` nay nhận 4 tham số (apps/agent/agent/lib/builder-input.ts:21-25, tham số mới `authorized: boolean`), nhưng bài đo round-trip duy nhất chạm hàm này không nằm trong diff và vẫn gọi bằng 3 tham số (dòng 99, 135, 139, 142, 194, 207). `apps/agent/tsconfig.json` chỉ include `agent/**/*.ts` và `evals/**/*.ts` — không có `test/**` — nên `bun run check-types` không bắt lỗi thiếu tham số (đã chạy tsc, sạch). Lúc chạy, `authorized === undefined`, nên `{...question, [BUILDER_AUTHORIZATION_KEY]: undefined}` bị JSON bỏ khóa (đã kiểm chứng bằng JSON.stringify), và assert dòng 104-109 `toEqual({ continuationToken, pendingInputRequest: request })` — `request` là câu hỏi trần, KHÔNG có `builderAuthorized` — vẫn khớp. Tức phép đo round-trip duy nhất của đường ghi đang ghim cứng hiện trạng "bản ghi không mang cờ quyền" và báo xanh, đúng cái mà AC-1 hứa ngược lại.

Vì sao map AC-1: bài đo round-trip duy nhất của đường ghi thật đang ghim trạng thái thiếu cờ quyền là đúng kết quả ngược với điều AC-1 hứa (bản ghi phải mang builderTurnAuthorized(ctx)).

### Hình dạng 1 — đo văn bản NGUỒN thay vì hành vi ghi, kèm vế âm không đối chứng
- file: `apps/agent/test/quyen-luot.spec.ts:39`
- severity: high
- AC: AC-1
- source: measurement

Test "ke-thua: cho ghi truyen quyen cua luot hoi, khong tu bia" (dòng 39-52) chứng minh đường ghi bằng ba phép grep chuỗi: `expect(nguon).toContain("BUILDER_AUTHORIZATION_KEY")` trên builder-input.ts, `expect(nguon).not.toContain('"builderAuthorized"')` (vế âm đứng một mình, không có vế dương nào ghim rằng chuỗi literal đó từng có mặt), và `expect(goi).toContain("builderTurnAuthorized(ctx)")` trên channels/crm.ts. Không có assert nào chạm giá trị mà hai file ấy thực sự sinh ra: `persistBuilderInputRequest` không được gọi, `builderTurnAuthorized` không được cho ăn ctx nào để kiểm kết quả. Lời hứa của AC-1 là QUAN HỆ "quyền của lượt hỏi = quyền ghi vào bản ghi"; ba assert này chỉ nói ba định danh có mặt trong hai file nguồn. Đổi tên tham số, đảo thứ tự tham số truyền vào persist, hoặc truyền hằng `true` thay vì `builderTurnAuthorized(ctx)` ở chỗ khác — tất cả vẫn xanh.

Vì sao map AC-1: chính finding tự nêu — lời hứa của AC-1 là quan hệ "quyền của lượt hỏi = quyền ghi vào bản ghi", và ba assert bằng grep chuỗi nguồn không chứng minh được quan hệ đó.

### Hình dạng 4 — vế âm trên chuỗi nguồn, mốc đếm ghim ở SHA chưa hề được kiểm
- file: `apps/agent/test/quyen-luot.spec.ts:87`
- severity: medium
- AC: AC-5
- source: measurement

Test "suy-dien: khong con cho nao suy quyen tu hinh dang tin nhan" (dòng 82-88) chỉ có một assert: `expect(nguon.includes('? "CREATE_AGENT" :')).toBe(false)` trên custom-agent-dispatch.ts. Không có đối chứng dương nào chứng minh mẫu chuỗi này là mẫu ĐÚNG để bắt suy diễn — nó khớp cả khoảng trắng và kiểu nháy kép, nên một lần format lại, hay viết `? 'CREATE_AGENT' :`, hay `?\n\t\t"CREATE_AGENT"`, đều cho vế âm pass trong khi suy diễn đã quay lại. E5 trong _acceptance/quyen-luot-mang-theo/evals.yaml (dòng 89-102) khai đúng cách chống: "dem tren dia so cho suy quyen ... phai bang 0; khac 0 -> ma 2, IN file:dong. Tai SHA ghim so nay bang 1" — bài đo không đếm, không in file:dòng, và không có gì kiểm rằng mẫu ấy đếm được 1 tại SHA ghim.

Vì sao map AC-5: khớp đúng sàn dân số của AC-5 (đếm chỗ suy quyền từ hình dạng tin nhắn phải bằng 0, khác 0 phải ra mã 2 kèm file:dòng) mà bài đo không thực hiện đếm hay in vị trí.

### Hình dạng 5 — E6 tuyên ma trận toàn phần ba đường vào, executor gắn vào không có assert nào về ba đường ấy
- file: `_acceptance/quyen-luot-mang-theo/evals.yaml:104`
- severity: high
- AC: AC-6
- source: measurement

E6 (dòng 104-126) khai "MA TRAN TOAN PHAN tren BA duong khong phai hoi-dap ... So assert bang dung 3", ghim ba giá trị đo tại SHA 9ec0251: new-agent-dialog.tsx -> CREATE_AGENT, agent-composer.tsx -> suy từ slash-command mặc định CHAT, agent-builder-chat.tsx -> CREATE_AGENT. Executor gắn vào là `ql_api_doc_ban_ghi` = `cd apps/api && bun test test/quyen-luot.spec.ts` (_acceptance/config.yaml). File đó có đúng ba test và không test nào nhắc tới new-agent-dialog, agent-composer hay agent-builder-chat; grep toàn bộ apps/agent/test và apps/api/test cho ba tên file này trả về rỗng. Ma trận lớp được tuyên nhưng phép đo thực chạy là điểm-case về một chuyện khác (đọc cờ quyền từ bản ghi), nên E6 sẽ báo PASS mà không hề chạm đường nào trong ba đường.

Vì sao map AC-6: E6 lặp lại đúng yêu cầu AC-6 (ma trận toàn phần ba đường, số assert bằng 3) nhưng executor gắn vào không có assert nào chạm ba đường đó.

### Hình dạng 5 — E2 tuyên ma trận hai bên đọc (số assert = 2), bài đo gắn vào chỉ có điểm-case một bên
- file: `_acceptance/quyen-luot-mang-theo/evals.yaml:22`
- severity: medium
- AC: AC-2
- source: measurement

E2 (dòng 22-45) khai "chay tren CA HAI ben doc, ma tran toan phan, so assert bang 2: apps/api (conversations.service.ts) VA apps/agent (builder-input.ts) — moi ben phai import tu DUNG mot module validation, va so cho ep kieu cot nay sang tu dien mo phai bang 0 o ca hai; khac 0 -> ma 2, IN file:dong", và tự giải thích vì sao phải đếm cả hai bên. Executor gắn vào là `ql_quyen_ke_thua` = `bun test test/quyen-luot.spec.ts -t ke-thua`, tức khối `ke-thua` ở apps/agent/test/quyen-luot.spec.ts dòng 19-58. Khối đó không có phép đếm nào, không chạm conversations.service.ts, và không in file:dòng; nó chỉ parse fixture viết tay (dòng 21-22, 27-37) và grep hai file nguồn của apps/agent (dòng 40-51). Bên apps/api — đúng bên mà E2 nói là chỗ dễ ép kiểu Json thành từ điển mờ — không có assert nào trong tầm executor này.

Vì sao map AC-2: E2 lặp lại yêu cầu AC-2 (parse qua một module, đo ở cả hai bên đọc) nhưng executor gắn vào chỉ điểm-case một bên, bỏ sót phía apps/api.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **recordBuilderActions nhận authorized với giá trị mặc định true**
  Người dùng thấy gì: Nếu về sau có thêm nơi trong hệ thống cần ghi lại quyền của một lượt trò chuyện mà lập trình viên quên truyền giá trị quyền, hệ thống sẽ tự động coi lượt đó là 'được phép' thay vì từ chối, tạo nguy cơ âm thầm mở lại lỗ hổng phân quyền trong các tính năng thêm sau này.
  file: `apps/agent/agent/subagents/agent_builder/lib/execution-state.ts`
  severity: low
  Đề xuất: known-limits

- **Sáu call site của persistBuilderInputRequest còn thiếu tham số `authorized` bắt buộc, check-types không thấy vì tsconfig loại trừ test/**
  Người dùng thấy gì: Một phần của bộ kiểm tra tự động cho tính năng đổi cách ghi lại quyền của lượt hỏi vẫn đang chạy với đoạn kiểm tra cũ, dẫn đến kết quả 'đạt' dù đoạn kiểm tra đó không còn phản ánh đúng cách hệ thống hoạt động thật. Người xem báo cáo kiểm tra có thể tin nhầm rằng khả năng ghi nhận quyền đã được xác minh đầy đủ, trong khi thực chất chưa được kiểm tra đúng.
  file: `apps/agent/test/builder-runtime.integration.spec.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 4 — assertion âm-tính-một-mình, và tự rơi về pass rỗng khi mốc neo trượt**
  Người dùng thấy gì: Một bài kiểm tra dùng để đảm bảo hệ thống không còn tự động cho phép tạo trợ lý ảo khi trả lời câu hỏi được viết theo cách dễ vỡ: chỉ cần đổi nhẹ cách trình bày mã nguồn ở chỗ khác trong tương lai, bài kiểm tra này có thể báo 'đạt' một cách giả tạo mà không thật sự phát hiện lỗi cấp quyền quay trở lại.
  file: `apps/api/test/quyen-luot.spec.ts`
  severity: high
  Đề xuất: new-contract

⚠ Cụm ngoài vùng phủ: 5/10 lỗi rơi vào file không bộ đo nào phủ (apps/agent/agent/subagents/agent_builder/lib/execution-state.ts, apps/agent/test/builder-runtime.integration.spec.ts, _acceptance/quyen-luot-mang-theo/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
