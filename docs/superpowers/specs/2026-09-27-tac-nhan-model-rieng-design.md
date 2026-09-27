# Tác nhân chạy đúng với mọi model trong danh mục — thiết kế

Ngày 2026-09-27 · slug `tac-nhan-model-rieng` · hạng T2. Chủ kho đã duyệt thiết kế đã
soát lại trong hội thoại 27/09.

## Vấn đề

Ngày 27/09 đo ra ba lỗi (`docs/reports/2026-09-26-tro-ly-okr/tac-nhan-hien-nay.md`):

1. **Hỏng ở mọi model Google.** Mọi lượt Tác nhân hỏng ngay ở lời gọi đầu với Gemini
   3.7 Flash và 3.8 Flash. Production đang đặt 3.8. Nguyên nhân là công cụ
   `finish_run` của bộ chạy khai kết quả là `z.json()`, một kiểu đệ quy. Gateway
   chuyển lỗi 400 của Google về nguyên văn: «ref loops are only supported if…».
2. **Hỏng mà vẫn «Xong».** Gốc không hỏng khi `subagent` hỏng. `session.completed`
   đọc kết quả rỗng rồi ghi SUCCEEDED.
3. **Model ghim theo bản Tác nhân.** Bộ chạy dùng `AgentVersion.modelId`, chụp từ Cài
   đặt lúc lưu bản nháp. Đổi model trong Cài đặt không đổi Tác nhân đã dựng. Model bị
   rút khỏi Gateway thì Tác nhân chết theo.

## Nguyên tắc

- Model là hạ tầng, không phải một phần định nghĩa của Tác nhân.
- Khuôn model nhìn thấy phải di động giữa các nhà cung cấp, không chỉ chạy được với một
  model.
- Lỗi của bộ chạy phải thành trạng thái của lượt, ngay lúc nó xảy ra.

## Lớp 1 · Hợp đồng khuôn di động

- **Luật.** Mọi khuôn model nhìn thấy trong `apps/agent`, chuyển sang JSON Schema đúng
  cách eve chuyển, không được chứa `$ref`. Khuôn model nhìn thấy gồm đầu vào của mọi
  `tool` và `outputSchema` của mọi `subagent`. Cách eve chuyển:
  `schema["~standard"].jsonSchema.input({ target: "draft-07" })`, ở
  `eve/dist/src/shared/tool-schema.js`. Không có `$ref` nghĩa là không đệ quy, không
  tham chiếu, và là tập con mà Google, z.ai và OpenAI đều nhận.
- **Kết quả lượt chạy** đổi sang một khuôn phẳng, đặt trong `lib/run-result.ts`. Đây là
  nguồn duy nhất của khuôn, và ba chỗ cùng dùng nó: đầu vào của `finish_run`,
  `outputSchema` của `agent_runner`, và chỗ đọc `AgentRun.result`.
  - Khuôn: bản ghi `chuỗi → giá trị`. Giá trị là chữ, số hữu hạn, đúng/sai, `null`, hoặc
    danh sách chữ và số, tối đa 50 phần tử.
  - Hai kết quả thật đo ngày 27/09 đều nằm gọn trong khuôn này.
  - Kết quả lồng nhiều tầng bị từ chối ở bước kiểm đầu vào của công cụ. Model nhận lời
    báo và nộp lại bản phẳng.
- **Phép kiểm tĩnh** quét mọi tệp khuôn và ghim tên tệp khi đỏ. Nó chạy trong bộ test
  thường, không cần khoá.
- **Phép đo gọi thật** đi qua đúng tầng mà eve dùng.
  - Dùng `generateText` của gói `ai` bản 7, nạp từ vị trí của eve. Gọi model bằng mã
    chuỗi qua AI Gateway, như eve.
  - Bộ công cụ là đúng các `tool` của bộ chạy, cộng `final_output` mang `outputSchema`.
    Mỗi công cụ bọc khuôn đúng như `toInputSchema` của eve làm.
  - Chuyển khuôn sang dạng riêng của từng nhà cung cấp là việc của tầng nhà cung cấp
    trong gói `ai`, không do phép đo tự ráp.
  - Ép gọi `finish_run` (`toolChoice`), với lời nhắn yêu cầu nộp hai khoá có tên sẵn.
    Assert: đối số parse được bằng khuôn của `lib/run-result.ts` và chứa đủ hai khoá.
  - Ba nhà cung cấp, cả ba bắt buộc: Google (`google/gemini-3.8-flash`), z.ai
    (`zai/glm-5.2-fast`), OpenAI (`openai/gpt-5-mini`).
  - Nhà cung cấp nào từ chối là khuôn chưa di động. Sửa khuôn nằm trong phạm vi vòng
    này, không phải phát hiện để sau.
  - Tổng khoảng $0,01 mỗi lượt. Chạy ở S4 khi có `AI_GATEWAY_API_KEY`; thiếu khoá thì
    thoát mã 2, không xanh giả.
  - Chiều đỏ: cờ `--khuon-cu` đặt lại `z.json()`, và Google phải trả lỗi có chữ «ref
    loops».

## Lớp 2 · Model giải theo vai, lúc chạy

- `lib/model.ts` có một bộ giải duy nhất `modelTheoVai(vai)`, với
  `vai ∈ {"tro-ly", "tac-nhan"}`. Hôm nay cả hai vai cùng đọc
  `AppSetting.agentModelId`. Cài đặt để trống hoặc đọc hỏng thì trả `null`, và eve dùng
  model mặc định — giữ nguyên hành vi hôm nay.
- **Gốc** gọi bộ giải với vai `tro-ly`; nếu phiên có purpose `builder` hoặc `team-agent`
  thì gọi với vai `tac-nhan`. **Bộ dựng** gọi với vai `tac-nhan`.
- **Bộ chạy thôi đọc `version.modelId`.**
  - `dispatchAgentRun` giải model một lần với vai `tac-nhan`.
  - Model đó được ghi vào `AgentRun.modelId` và truyền trong thuộc tính phiên
    (`modelId`, `modelContextWindowTokens`).
  - `agent_runner` đọc hai thuộc tính đó ở `session.started`. Thuộc tính vắng thì trả
    `null` để eve dùng model mặc định.
  - Một lần giải cho cả lượt, nên lượt ghi đúng model đã chạy.
- `AgentVersion.modelId` giữ nguyên nghĩa «bản này dựng bằng model nào». Không
  migration.
- Tách hai vai sang hai ô Cài đặt chỉ khi có bằng chứng cần. Lúc đó chỉ phải thêm một
  cột và sửa bộ giải.

## Lớp 3 · Hỏng hiện là hỏng

- Thêm hook mới `hooks/dong-luot-tac-nhan.ts`, logic nằm ở `lib/dong-luot-tac-nhan.ts`.
  Hook bắt `action.result` của phiên `team-agent` có
  `result.kind === "subagent-result"`, `subagentName === "agent_runner"` và
  `isError === true`. Gặp là gọi ngay `failRun(runId, "RUNNER_FAILED", <lý do>)`.
  - Lý do lấy từ `output.message` của kết quả lỗi, cắt 1.000 ký tự, không thêm gì.
    `output` không có `message` dạng chuỗi (là chuỗi trần, `{}`, hay `null`) thì lý do
    là câu cố định «Bộ chạy báo lỗi nhưng không nói lý do.».
  - `runId` lấy từ thuộc tính phiên mà `dispatchAgentRun` đặt (`attribute(ctx, "runId")`),
    và hook chỉ chạy cho purpose `team-agent`.
  - Viết theo `eve/docs/guides/hooks.md` (sự kiện `action.result`, kết quả
    `subagent-result`) đã đọc 27/09.
  - Sau đó mọi công cụ của lượt từ chối vì lượt không còn RUNNING.
  - `session.completed` gặp lượt đã FAILED thì bỏ qua.
- **Chốt cuối:** `session.completed` gặp lượt RUNNING mà `AgentRun.result` là `null`
  (bộ chạy chưa gọi `finish_run`) thì ghi
  `failRun(runId, "RUNNER_NO_RESULT", "Bộ chạy dừng trước khi nộp kết quả.")`.
  - Logic đặt ở hàm `choKetLuot(runId)` trong `lib/dong-luot-tac-nhan.ts`, để test gọi
    được.
  - `channels/crm.ts` chỉ gọi hàm đó.
  - Bỏ đường `runResultOf(null) → {}` đang nuốt lỗi.

## Tài liệu

- `docs/agent.md` mục «Model»: model theo vai, bộ chạy thôi ghim theo bản, khuôn di
  động.
- Mục «Team-agent builder and runner»: luật hỏng-hiện-hỏng.
- Mục «Khi nào thêm…» luật 2: model cố định chỉ áp cho `subagent` có ranh giới riêng
  (ZDR); `subagent` cùng ranh giới với gốc dùng bộ giải theo vai. Luật 6 trỏ phép kiểm
  tĩnh.
- Một đoạn «Chỗ rẽ có tên với bản của hãng» liệt các tệp của hãng bị sửa. Chủ kho chọn
  không gửi hãng.

## Đặc tả UX

Bỏ, vì vòng không chạm màn nào (entry `descope` «bỏ đặc-tả-UX»). Lịch sử lượt chạy đã
hiện «Model» và lý do hỏng. Vòng này chỉ đổi dữ liệu màn đọc.

## Rủi ro

- Hook mới chạy mọi `action.result` của phiên `team-agent`, nhưng chỉ đọc bộ nhớ; chỉ
  ghi DB khi có lỗi. Chi phí không đáng kể.
- Fixture của kết quả lỗi phải lấy từ một lượt eve thật chứ không gõ tay. Ở S3 chạy một
  lượt thật trên kho riêng với Gemini trước khi vá, chép dòng `action.result` mà hook
  audit đã ghi vào `agentRunEvent` thành
  `apps/agent/test/fixtures/runner-loi-that.json`. Tốn khoảng $0,01.
