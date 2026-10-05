# Review findings: chat-an-toan-truoc-r1 (round 2)

## Trong hợp đồng

- **The step.failed hook logs the wrong model id, and a failed lookup there throws**
  file: `apps/agent/agent/hooks/telemetry.ts:81`
  severity: medium
  AC: AC-11
  source: conventions
  detail: The new branch writes `model.khong-tim-thay` with `(await readAgentModel(db)).id`. That is the workspace-wide setting, not the model the failing session actually used. A `kho` session runs `TAI_LIEU_AGENT.hoi.maModel` (see `modelChoPhienGoc` in lib/model.ts). A session where `modelTheoVai` already fell back runs the default model. In both cases a GatewayModelNotFoundError is recorded against the wrong id, so `dem-doi-truong` and the AC that counts these events measure the wrong thing. Separately, the same file already wraps `readAgentModel` in a never-throw helper (`configuredModel`, per the docs/agent.md rule 'A failed read logs and keeps the compiled fallback. Never throws.'). The new branch calls `readAgentModel` and `db.agentEvent.create` with no guard. A DB hiccup throws out of the telemetry hook, and the `modelError` emission below it never runs.
  lý do vào hợp đồng: AC-11 đòi hàng model.khong-tim-thay mang id của model gây lỗi; ghi id cài đặt chung thay vì id model phiên thực dùng làm AC này sai ở phiên dùng model khác.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The truong.doi-qua-chat event payload has two hand-written shapes instead of one schema in packages/validation**
  Người dùng thấy gì: Nếu sau này thêm một vai mới trong workspace, công cụ đếm số lần đổi trường qua chat có thể báo lỗi thay vì in số, và chủ kho phải sửa tay trước khi đọc số.
  file: `_acceptance/chat-an-toan-truoc-r1/rang/dem-doi-truong.ts`
  severity: medium
  Đề xuất: known-limits

- **laQuanTriWorkspace copies @crm/auth's isWorkspaceAdmin instead of moving it to validation**
  Người dùng thấy gì: Hiện không ảnh hưởng người dùng: quyền sửa trường của chủ sở hữu và quản trị vẫn đúng. Chỉ là luật này nằm ở hai nơi, nên sau này sửa một nơi mà quên nơi kia thì bài kiểm sẽ báo đỏ.
  file: `packages/validation/src/vai-workspace.ts`
  severity: medium
  Đề xuất: wont-fix

- **The authenticator 'crm-app' is a string literal that duplicates BRIDGE_ISSUER**
  Người dùng thấy gì: Hiện không ảnh hưởng ai. Chỉ nếu sau này đổi tên nguồn đăng nhập của chat mà quên chỗ này, mọi người dùng, kể cả quản trị, sẽ bị từ chối đổi trường qua chat.
  file: `apps/agent/agent/lib/quyen-truong.ts`
  severity: low
  Đề xuất: wont-fix

- **The Gateway catalog URL is still kept in two apps after the schema moved to a shared module**
  Người dùng thấy gì: Hiện không ảnh hưởng người dùng. Nếu địa chỉ danh mục model của Gateway đổi, phải sửa ở hai nơi, quên một nơi thì Cài đặt và chat nhìn hai danh mục khác nhau.
  file: `apps/agent/agent/lib/model-config.ts`
  severity: low
  Đề xuất: wont-fix

- **The event write runs after the field write with no transaction; a failed event write throws after the change is committed**
  Người dùng thấy gì: Hiếm khi cơ sở dữ liệu trục trặc đúng lúc ghi nhật ký, trường vẫn được tạo hoặc đổi nhưng chat báo lỗi, và nếu thử lại sẽ báo trường đã tồn tại; nhật ký đếm sẽ thiếu một lần.
  file: `apps/agent/agent/tools/manage_fields.ts`
  severity: low
  Đề xuất: known-limits

- **The committed r1e screenshots are byte-identical across states that should differ**
  Người dùng thấy gì: Người ký duyệt sẽ thấy các ảnh minh chứng của trạng thái có và không có hộp báo giống hệt nhau, nên phải xem ảnh cuộn riêng để thấy hộp báo thật.
  file: `_acceptance/chat-an-toan-truoc-r1/evidence/r1e-bi-go-1440.png`
  severity: low
  Đề xuất: known-limits

- **A failed Gateway catalog read is never cached, so every session start can stall for 5 seconds with no log**
  Người dùng thấy gì: Khi dịch vụ danh mục model treo hoặc không với tới được, mỗi lần mở một cuộc chat sẽ chờ thêm tới 5 giây mà không có dấu vết nào giải thích vì sao chậm.
  file: `apps/agent/agent/lib/model-danh-muc.ts`
  severity: medium
  Đề xuất: new-contract

- **settings.agentModel reports the removed model as effectiveId while selectedMissing says the agent runs the default**
  Người dùng thấy gì: Khi model đã chọn bị gỡ, Cài đặt vừa báo trợ lý đang chạy model mặc định, vừa ghi ngay bên dưới rằng model đã bị gỡ là model đang chạy, nên quản trị đọc thấy mâu thuẫn.
  file: `apps/api/src/settings/settings.service.ts`
  severity: low
  Đề xuất: new-contract

- **The Settings alert can lag the agent's fallback by up to 30 minutes because the API and agent cache the catalog differently**
  Người dùng thấy gì: Khi model bị gỡ, chat đã chuyển sang model mặc định nhưng hộp cảnh báo trong Cài đặt có thể chưa hiện tới khoảng 30 phút, nên quản trị biết muộn.
  file: `apps/api/src/settings/model-catalog.service.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture matching the reader's shape): E11 builds step.failed.details by hand from exactly the keys the hook reads**
  Người dùng thấy gì: Nếu thư viện chạy trợ lý đổi cách báo lỗi model không tìm thấy, bộ đếm lượt chat hỏng vì model bị gỡ có thể lặng lẽ đếm ra 0 trong khi chat vẫn hỏng, và kiểm thử vẫn xanh.
  file: `apps/agent/test/model-lui-mac-dinh.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 1 (proving with an artifact that does not show the output): E9u's 'alert shown' and 'alert hidden' screenshots are byte-identical**
  Người dùng thấy gì: Ảnh do phép đo tự chụp không cho thấy hộp báo, nên người duyệt phải dựa vào ảnh cuộn do agent kiểm tra chụp thay vì ảnh của chính phép đo.
  file: `_acceptance/chat-an-toan-truoc-r1/rang/man-bi-go.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/12 lỗi rơi vào file không bộ đo nào phủ (_acceptance/chat-an-toan-truoc-r1/evidence/r1e-bi-go-1440.png, apps/api/src/settings/model-catalog.service.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
