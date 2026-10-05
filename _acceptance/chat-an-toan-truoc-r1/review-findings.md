# Review findings: chat-an-toan-truoc-r1 (round 1)

## Trong hợp đồng

- **The audit event records ketQua "lam" even when the field write was refused or did not happen**
  file: `apps/agent/agent/tools/manage_fields.ts:86`
  severity: medium
  AC: AC-5
  source: bugs
  detail: After the permission check passes, both tools call ghi("lam") on whatever the lib returned, without checking the result. createField can return { created: false, reason } (fields.ts:129/138/145). updateFieldBrief can return { updated: false } when the field is not found (fields.ts:189). archiveField can return { archived: false } (fields.ts:214). In each case nothing was written, but a truong.doi-qua-chat row with ketQua "lam" is still logged (manage_fields.ts:86 and :103, archive_field.ts:37). AC-5 requires ketQua to match what actually happened. dem-doi-truong.ts then over-counts lam per role. Scenario: an admin asks chat to create a field whose label duplicates an existing key. The tool returns created:false, and the event log says the admin created a field. Fix: log "lam" only on a successful result (no created/updated/archived === false), and treat a refusal from the lib as its own outcome.

- **Hình dạng 3 (assert «có mặt» thay vì quan hệ bằng nhau): E10 không ghim nguyên văn câu hộp báo biGo**
  file: `_acceptance/chat-an-toan-truoc-r1/evals.yaml:164`
  severity: medium
  AC: AC-10
  source: measurement
  detail: Trong E10, mục expected hứa: «messages-guard.spec.ts xanh voi khoa moi cua hop bao ghim o GHIM/KHONG_DAU; vi === cau tieng Viet da khai, en === cau tieng Anh da khai (so nguyen van)». Lệnh r1e_chu chỉ chạy messages-guard.spec.ts và chat-an-toan-truong-chu.spec.ts. Trong diff, messages-guard.spec.ts không đổi và không có chỗ nào nhắc `biGo`. GHIM chỉ chứa hàm ghép biến; với khoá chuỗi, các ca it() ở dòng 1053–1067 chỉ kiểm khoá vi khớp khoá en, vi có dấu và vi khác en. chat-an-toan-truong-chu.spec.ts chỉ ghim FIELDS_AGENT.tuChoi. Vậy cả hai câu `model.biGo` (settings.ts dòng 68 bản en, dòng 257 bản vi) chỉ được đo theo tính chất «có dấu / có khoá», không được so bằng với câu đã khai. Sửa bản en thành câu khác, hoặc đổi bản vi sang một câu khác vẫn có dấu, thì E10 vẫn xanh. Chiều đỏ «bo dau» bắt được chỉ vì kiểm dấu là luật chung, không phải vì câu được ghim. Bước ui-check man-bi-go.mjs có viết cứng câu vi, nhưng câu en thì không phép đo nào chạm tới.

- **Hình dạng 1 (đo nguồn chung thay vì đầu ra): ô (d) của E6 so agent với chính schema, không qua ModelCatalogService**
  file: `apps/agent/test/model-lui-mac-dinh.integration.spec.ts:158`
  severity: medium
  AC: AC-6
  source: measurement
  detail: E6 hứa: «API ModelCatalogService doc cung than qua cung schema @crm/validation/gateway-danh-muc ra cung tap id». Dòng 158 lại dựng phía «API» bằng `new Set(docDanhMucGateway(JSON.parse(than)).map((m) => m.id))`, tức gọi thẳng hàm schema dùng chung. Phía agent, docDanhMucTuMang (model-danh-muc.ts dòng 20) cũng chỉ là `docDanhMucGateway(...).map((m) => m.id)`. Phép so ở dòng 159 vì thế là so một hàm với chính nó, nên đúng hiển nhiên. Đầu ra thật của API là ModelCatalogService.models(), có thêm toCatalogModel, sắp xếp và cache, và không được gọi với thân thật. Nếu ModelCatalogService quay lại dùng schema riêng, hoặc lọc khác đi, ô này vẫn xanh. Đây là đo tầng mà bên đọc dùng tới, không đo cái bên đọc API thật trả ra.

- **Hình dạng 3 (đếm hàng có mặt, không kiểm giá trị): E11 không kiểm data.modelId của hàng model.khong-tim-thay**
  file: `apps/agent/test/model-lui-mac-dinh.integration.spec.ts:279`
  severity: medium
  AC: AC-11
  source: measurement
  detail: AC-11 hứa hàng ghi ra «mang id model», và expected của E11 ghi «ghi dung 1 hang ... data.modelId dung». Test chỉ chạy `db.agentEvent.count({ where: { sessionId, type } })` rồi so với o.ghi (dòng 279–288), không đọc `data.modelId`. Hook lấy modelId từ `readAgentModel(db).id` (telemetry.ts), không lấy từ lỗi. Nếu hook ghi sai id (ví dụ id mặc định, chuỗi rỗng, hay id từ chỗ khác), E11 vẫn xanh vì chỉ đếm số hàng. Lời hứa «hàng mang đúng id model» chưa có phép đo nào.

- **Hình dạng 4 (assert âm tính đứng một mình): bước 4 của man-bi-go.mjs xanh khi trang không dựng**
  file: `_acceptance/chat-an-toan-truoc-r1/rang/man-bi-go.mjs:122`
  severity: medium
  AC: AC-9
  source: measurement
  detail: Bước 4 chỉ kiểm `d.dat(4, !m.coHop, ...)`. coHop được tính từ việc tìm một `[data-slot="alert"]` có innerText chứa đúng câu BI_GO. Trong bước này không có đối chứng dương nào cho thấy thẻ Model trợ lý thật sự đã dựng: không kiểm combobox có mặt, không kiểm tên model idCon có hiện. Trang lỗi, trang đăng nhập, phần Suspense chưa xong hay thẻ AgentModel trả null (`if (!settings.data) return null`) đều cho coHop false, và bước 4 vẫn «dat». Các bước 1–3 không đối chứng được cho bước 4 vì mỗi bước mở trang riêng, và chay(4) chạy được một mình. Như vậy vế «model có phục vụ thì hộp báo không hiện» của AC-9 được đo bằng một khẳng định âm không có đối chứng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The new step.failed branch in the telemetry hook does unguarded DB reads and writes, so a DB error can throw out of the hook**
  Người dùng thấy gì: Nếu cơ sở dữ liệu đang trục trặc đúng lúc model bị gỡ, lượt chat vốn đã hỏng có thể mất thêm bản ghi đếm lỗi gửi về hệ thống theo dõi; người dùng không thấy khác biệt gì ngoài việc số liệu thiếu.
  file: `apps/agent/agent/hooks/telemetry.ts`
  severity: medium
  Đề xuất: known-limits

- **API and agent read an empty Gateway catalog differently, so Settings shows a false 'running the default model' alert**
  Người dùng thấy gì: Nếu danh sách model của hệ thống AI trả về rỗng, trang Cài đặt có thể báo sai rằng trợ lý đang chạy model mặc định, trong khi thật ra trợ lý vẫn dùng model đã chọn.
  file: `apps/api/src/settings/settings.service.ts`
  severity: medium
  Đề xuất: known-limits

- **The agent treats a catalog row that fails the schema or is filtered out as 'removed from the Gateway'**
  Người dùng thấy gì: Nếu hệ thống AI đổi cách mô tả một model, model đã chọn có thể bị tự thay bằng model mặc định và ghi nhận sai lý do là đã bị gỡ, dù thật ra nó vẫn còn.
  file: `packages/validation/src/gateway-danh-muc.ts`
  severity: low
  Đề xuất: known-limits

- **The agent's 'model not found' event records the workspace setting id, not the model that actually failed**
  Người dùng thấy gì: Khi model lỗi không phải model đang đặt trong Cài đặt (ví dụ phiên đọc kho tài liệu hay lượt của Tác nhân), bản ghi lỗi có thể ghi tên model khác, làm số liệu 10/11 chỉ nhầm model cho quản trị.
  file: `apps/agent/agent/hooks/telemetry.ts`
  severity: low
  Đề xuất: new-contract

- **The 'crm-app' authenticator in the new permission check is a literal string, not the constant the chat channel uses**
  Người dùng thấy gì: Nếu sau này ai đó đổi tên kênh đăng nhập của chat mà quên sửa chỗ kiểm quyền, mọi người kể cả quản trị sẽ bị từ chối sửa trường qua chat.
  file: `apps/agent/agent/lib/quyen-truong.ts`
  severity: low
  Đề xuất: wont-fix

- **ModelCatalogService.find is now dead code**
  Người dùng thấy gì: Không ảnh hưởng người dùng; chỉ là một đoạn mã không còn ai gọi và một bài kiểm tra giả lập thừa.
  file: `apps/api/src/settings/model-catalog.service.ts`
  severity: low
  Đề xuất: wont-fix

- **model.khong-tim-thay records the configured model id, not the model that actually failed**
  Người dùng thấy gì: Con số model bị gỡ đọc vào ngày 10/11 có thể chỉ sai model trong vài tình huống (phiên kho tài liệu, lượt Tác nhân, hoặc model mặc định cũng hỏng), khiến quản trị xử lý nhầm chỗ.
  file: `apps/agent/agent/hooks/telemetry.ts`
  severity: medium
  Đề xuất: new-contract

- **An unguarded DB call in step.failed can throw and skip the existing modelError telemetry**
  Người dùng thấy gì: Khi cơ sở dữ liệu lỗi đúng lúc model bị gỡ, hệ thống có thể không gửi được báo cáo lỗi model vốn có sẵn, nên đội kỹ thuật thấy ít lỗi hơn thực tế.
  file: `apps/agent/agent/hooks/telemetry.ts`
  severity: low
  Đề xuất: known-limits

- **ghiBiGoLui marks the model as reported before the write, so a failed insert loses the event for the whole process**
  Người dùng thấy gì: Nếu lần ghi nhận đầu tiên bị lỗi, hệ thống sẽ không thử ghi lại cho đến khi khởi động lại, nên số lần model bị gỡ có thể đếm thiếu là 0 dù trợ lý vẫn đã lùi về mặc định.
  file: `apps/agent/agent/lib/model-danh-muc.ts`
  severity: low
  Đề xuất: known-limits

- **docDanhMucTuMang swallows every catalog read failure without logging**
  Người dùng thấy gì: Khi không đọc được danh sách model, hệ thống lặng lẽ giữ model đã chọn và không để lại dấu vết, nên khó biết vì sao việc phát hiện model bị gỡ đã ngừng hoạt động.
  file: `apps/agent/agent/lib/model-danh-muc.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/15 lỗi rơi vào file không bộ đo nào phủ (apps/api/src/settings/model-catalog.service.ts, _acceptance/chat-an-toan-truoc-r1/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
