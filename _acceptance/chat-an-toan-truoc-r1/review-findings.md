# Review findings: chat-an-toan-truoc-r1 (round 4)

## Trong hợp đồng

- **ghiBiGoLui dedupe races: concurrent sessions write more than one model.bi-go-lui row per id per process**
  file: `apps/agent/agent/lib/model-danh-muc.ts:50`
  severity: low
  AC: AC-6
  detail: `if (daBao.has(modelId)) return;` is checked before the awaited db.agentEvent.create, and `daBao.add(modelId)` runs only after the insert resolves. Two sessions starting at the same time in a fresh process (the selected model already removed, catalog readable) both pass the has() check and each insert a row. This breaks AC-6(b), 'đúng một AgentEvent model.bi-go-lui cho mỗi id mỗi tiến trình', and inflates biGoLui in dem-doi-truong.ts. Mark the id before awaiting, or keep an in-flight promise per id. ghiModelPhien (model-phien.ts:25) has the same check-then-await-then-add pattern: every step.started of a subagent fired before the first insert lands writes a duplicate model.phien-chon row.
  source: bugs
  rationale: AC-6(b) khai tường minh đúng một hàng model.bi-go-lui cho mỗi id mỗi tiến trình; hai phiên mở cùng lúc ghi hai hàng là vi phạm điều bất biến đó.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **laQuanTriWorkspace is a second copy of isWorkspaceAdmin instead of one rule re-exported**
  Người dùng thấy gì: Quy tắc ai là quản trị đang được viết ở hai nơi. Hôm nay hai nơi khớp nhau, nhưng nếu sau này thêm một vai mới và chỉ sửa một nơi thì màn Trường và chat có thể cho phép khác nhau.
  file: `packages/validation/src/vai-workspace.ts`
  severity: medium
  Đề xuất: known-limits

- **An audit write that fails after a field write succeeded makes the tool throw**
  Người dùng thấy gì: Nếu cơ sở dữ liệu chớp lỗi đúng lúc ghi nhật ký, chat có thể báo lỗi dù trường đã được tạo, đổi hoặc lưu trữ thật. Người dùng có thể thử lại và gặp thông báo trường đã tồn tại.
  file: `apps/agent/agent/tools/manage_fields.ts`
  severity: medium
  Đề xuất: known-limits

- **Gateway catalog URL defined twice, and agent and API cache it for different times**
  Người dùng thấy gì: Khi một model được Gateway phục vụ trở lại, chat dùng lại nó sau vài phút nhưng màn Cài đặt có thể vẫn báo đang chạy model mặc định thêm một lúc. Chỉ là thông tin hiển thị chậm, không làm hỏng chat.
  file: `apps/agent/agent/lib/model-config.ts`
  severity: low
  Đề xuất: known-limits

- **ModelCatalogService.find has no callers left**
  Người dùng thấy gì: Còn sót một đoạn mã không ai dùng nữa. Người dùng không thấy khác biệt nào.
  file: `apps/api/src/settings/model-catalog.service.ts`
  severity: low
  Đề xuất: wont-fix

- **daGhi Set grows by one session id for every session for the life of the agent process**
  Người dùng thấy gì: Máy chủ agent chạy rất lâu sẽ nhớ thêm một mã phiên cho mỗi phiên chat và không bao giờ quên, nên bộ nhớ tăng chậm theo thời gian. Mức tăng nhỏ, chỉ đáng chú ý khi chạy hàng tháng không khởi động lại.
  file: `apps/agent/agent/lib/model-phien.ts`
  severity: low
  Đề xuất: known-limits

- **Settings card still shows the removed model as the one in use while the alert says the default is running**
  Người dùng thấy gì: Khi model đã chọn bị gỡ, hộp báo nói trợ lý đang chạy model mặc định nhưng ô chọn và dòng chú thích bên dưới vẫn ghi tên model đã bị gỡ. Trang tự mâu thuẫn và có thể làm quản trị bối rối.
  file: `apps/api/src/settings/settings.service.ts`
  severity: medium
  Đề xuất: new-contract

- **Audit write after a committed field mutation can turn a success into a thrown tool error**
  Người dùng thấy gì: Nếu việc ghi nhật ký gặp lỗi tạm thời, chat báo thất bại dù trường đã đổi thật, và dấu vết thay đổi đó bị mất. Người dùng có thể thử lại và thấy thông báo trùng tên trường.
  file: `apps/agent/agent/tools/manage_fields.ts`
  severity: low
  Đề xuất: known-limits

- **Missing-model telemetry falls back to the CRM-configured model id for sessions that never used it**
  Người dùng thấy gì: Trong trường hợp hiếm, một lỗi model không tìm thấy ở trợ lý phụ có thể bị tính cho model mà quản trị đã chọn thay vì model trợ lý phụ thật sự dùng. Số đếm lỗi theo model có thể lệch chút ít.
  file: `apps/agent/agent/lib/model.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): E11 tự dựng event.data.details của step.failed thay vì lấy từ bên ghi của eve**
  Người dùng thấy gì: Bài kiểm tra dùng dữ liệu lỗi tự viết tay nên nếu thư viện nền đổi cách báo lỗi, bài kiểm tra vẫn xanh trong khi việc đếm lỗi thật ngừng chạy mà không ai biết.
  file: `apps/agent/test/model-lui-mac-dinh.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): lệnh của E5 chỉ chạy 5 ô chọn tay, trong khi eval hứa «mỗi ô của ma trận E1-E3»**
  Người dùng thấy gì: Phép kiểm việc ghi nhật ký chỉ chạy trên một số ít tình huống; các tình huống còn lại được kiểm gián tiếp bởi các bài khác. Nếu nhật ký hỏng ở một tình huống ngoài số đó, báo đỏ sẽ hiện ở bài khác chứ không ở bài nhật ký.
  file: `_acceptance/chat-an-toan-truoc-r1/evals.yaml`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/11 lỗi rơi vào file không bộ đo nào phủ (apps/api/src/settings/model-catalog.service.ts, apps/agent/agent/lib/model-phien.ts, _acceptance/chat-an-toan-truoc-r1/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
