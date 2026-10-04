# Review findings: tro-ly-kho-dung-phien (round 1)

## Trong hợp đồng

- **The kho root session's ZDR model is thrown away at runtime because a live LanguageModel is returned from session.started**
  AC: AC-3
  file: `apps/agent/agent/lib/model.ts:48`
  severity: high
  source: bugs
  detail: modelChoPhienGoc now returns modelTaiLieu("hoi", env, tao) for purpose "kho". That is { model: wrapLanguageModel(...), modelContextWindowTokens }, so the model is a live provider object. agent.ts calls this resolver from "session.started". eve does not accept that. node_modules/eve/docs/agent-config.md says 'Session/turn selections must be model id strings; return live LanguageModel objects only from step.started.' The source enforces it in node_modules/eve/dist/src/context/dynamic-model-lifecycle.js (dispatchDynamicModelEvent). When the result has r.model !== undefined and the event is not step.started, eve calls log.error('...session- and turn-scoped model selections must be serializable...') and setSelectionForEvent(ctx, event, null). Result: every real kho root session silently runs on DEFAULT_AGENT_MODEL.id, the fallback in agent.ts. It gets no zeroDataRetention middleware, no separate key, and even the admin-configured model is lost. The kd-zdr test calls modelChoPhienGoc directly and invokes .model.doGenerate, so it never goes through eve's dispatch and passes green. The tro_ly_kho subagent does this correctly: it calls modelTaiLieu from "step.started" (subagents/tro_ly_kho/agent.ts). The kho root needs the same: return the object from a step.started handler and keep session.started returning a string or null.
  rationale: AC-3 hứa purpose kho nhận model ZDR chọn ở session.started; nếu eve bỏ model sống trả từ session.started thì phiên gốc kho chạy model mặc định không ZDR, làm AC-3 thất bại khi chạy thật.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **tro_ly_kho tags every moHoi failure as a wrong-place call, so the meter can count kho and Zalo sessions**
  Người dùng thấy gì: Khi trợ lý kho gặp lỗi thật trong một cuộc hỏi kho hoặc Zalo hợp lệ (ví dụ câu hỏi vừa hết hạn hay cơ sở dữ liệu chập chờn), hệ thống vẫn ghi đó là gọi sai chỗ. Số đếm gọi sai chỗ có thể cao hơn thực tế, và lỗi gốc có thể bị che mất.
  file: `apps/agent/agent/subagents/tro_ly_kho/instructions.ts`
  severity: medium
  Đề xuất: known-limits

- **ghiSaiCho catches every error from moHoi, so infrastructure failures are counted as wrong-place calls and can mask the original error**
  Người dùng thấy gì: Khi cơ sở dữ liệu lỗi hoặc đứt kết nối đúng lúc trợ lý kho được mời, hệ thống ghi nhầm thành một lần gọi sai chỗ. Người xem số đếm sẽ thấy số liệu lệch, và nguyên nhân lỗi thật có thể không còn dấu vết.
  file: `apps/agent/agent/subagents/tro_ly_kho/instructions.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): ma trận 6 purpose của kd-tu-choi không đưa purpose vào đầu vào**
  Người dùng thấy gì: Bài kiểm tra tự động cho sáu loại phiên thực chất chỉ chạy lại một tình huống sáu lần. Nếu sau này có người thêm cách xử lý riêng cho một loại phiên và làm hỏng nó, bài kiểm tra vẫn báo xanh.
  file: `apps/agent/test/tro-ly-kho-dung-phien.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 (đo nguồn trung gian thay vì ĐẦU RA): kd-cam-goi đo research và okr-soan qua chiDanNghienCuu chứ không qua resolver session.started**
  Người dùng thấy gì: Với hai loại phiên nghiên cứu, bài kiểm tra kiểm câu cấm gọi trợ lý kho qua hàm phụ chứ không qua đường mà hệ thống thật dùng. Nếu câu cấm bị mất ở đường thật, bài kiểm tra vẫn xanh và trợ lý kho có thể bị gọi sai chỗ.
  file: `apps/agent/test/tro-ly-kho-dung-phien.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert cờ có mặt trong khi lời hứa là QUAN HỆ giữa giá trị): kd-zdr không ghim mã model của phiên gốc kho**
  Người dùng thấy gì: Bài kiểm tra chỉ xác nhận phiên kho có bật chế độ không lưu dữ liệu, không xác nhận đúng mã model và đúng khoá. Nếu sau này model hoặc khoá bị đổi nhầm mà vẫn bật chế độ đó, bài kiểm tra không báo.
  file: `apps/agent/test/tro-ly-kho-dung-phien.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
