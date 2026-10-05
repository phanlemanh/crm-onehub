# Chat an toàn trước R1 — thiết kế (R1e `chat-an-toan-truoc-r1`)

Ngày 2026-10-05 · hạng T2 · hồ sơ `_acceptance/chat-an-toan-truoc-r1/` · Cổng Đáng đã ký `build` (giữ ngưỡng).

## Vì sao bây giờ

Từ 26/10 thành viên thường của mọi phòng ban vào CRM (tuần nhập người 19–26/10). Khảo sát lộ trình 04/10
(mục A6, phát hiện số 2) tìm ra hai lỗ trên đường chat:

- **#35.** Màn Cài đặt chỉ cho owner/admin đổi trường của cả đội (`FieldsService.requireManager`,
  `apps/api/src/fields/fields.service.ts:83-87`). Công cụ chat `manage_fields`
  (`apps/agent/agent/tools/manage_fields.ts`) tạo trường và đổi chỉ dẫn/cờ nhập tay bằng cách ghi thẳng
  Prisma, không kiểm vai; `archive_field` chỉ hỏi duyệt (`sensitiveWrite`), và chính người thường bấm duyệt
  được. Phiên tự động (nghiên cứu nền, lượt Tác nhân) cũng tạo được trường.
- **#36.** Model đã chọn chỉ được kiểm khi lưu ở Cài đặt (`SettingsService.setAgentModel`). Gateway gỡ model
  sau đó thì `modelTheoVai` (`apps/agent/agent/lib/model.ts`) vẫn trả id cũ, mọi lượt chat hỏng
  (`GatewayModelNotFoundError` → `turn.failed`), và màn Cài đặt không nói gì. Đã xảy ra 23/09.

## Thiết kế

### 1. Một chốt quyền cho mọi công cụ đổi trường (#35)

Luật «owner hoặc admin» chuyển thành một hàm thuần trong `@crm/validation/vai-workspace`
(`laQuanTriWorkspace(role)`) để agent dùng được — `packages/auth` giữ `isWorkspaceAdmin` như cũ (đường T3,
không chạm); một bài kiểm ở API ghim hai hàm trả cùng kết quả trên mọi vai và `null`.

Agent có một hàm `quyenDoiTruong(ctx)` (`apps/agent/agent/lib/quyen-truong.ts`):
- phiên tự động (`isAutomated`: dispatch `APP_AUTH`, purpose `team-agent`) → từ chối;
- phiên chat (`authenticator === "crm-app"`) → tra `member.role` của `principalId` trong `WORKSPACE_ID`
  (cùng mẫu `lib/tra-loi-nhac.ts`); không phải thành viên, `member`, `okr` → từ chối; `owner`/`admin` → cho;
- mọi khung còn lại (không rõ người) → từ chối.

`manage_fields` (cả `create` lẫn `update-brief`) và `archive_field` gọi chốt này đầu `execute`. Bị từ chối →
trả `{ created|updated|archived: false, reason }` với câu cố định
`FIELDS_AGENT.tuChoi` («Only a workspace owner or admin can change the team's fields. Ask one of them to do
it from Settings › Fields.»), không ghi hàng nào. `archive_field` giữ `approval: sensitiveWrite(...)` như
cũ (người có quyền vẫn phải duyệt), chốt vai chạy thêm trong `execute`.

Mỗi lần một trong ba công cụ chạy (làm hay từ chối) ghi một `AgentEvent` loại `truong.doi-qua-chat`,
`data: { hanhDong, vai, ketQua: "lam" | "tu-choi", entity, key? }`, với `vai` ∈ `owner` | `admin` | `member` | `okr` | `khong-thanh-vien` | `tu-dong` — đây là đường đo của ngưỡng.

### 2. Model bị gỡ thì lùi về mặc định (#36)

`apps/agent/agent/lib/model-danh-muc.ts` đọc danh mục Gateway (`https://ai-gateway.vercel.sh/v1/models`),
parse ở biên bằng schema danh mục dùng chung `@crm/validation/gateway-danh-muc` (API `ModelCatalogService` chuyển sang cùng schema) thành tập id, cache trong tiến trình theo `MODEL_DANH_MUC.ttlMs` (5 phút), quá hạn
`timeoutMs` (5 giây). Kết quả ba dạng: `{ co: Set<string> }` | `"khong-doc-duoc"`.

`modelTheoVai` sau khi đọc model đã chọn (không phải mặc định):
- danh mục đọc được và có id → trả như cũ;
- danh mục đọc được mà KHÔNG có id → trả `null` (eve lùi về `DEFAULT_AGENT_MODEL`), `console.warn` một dòng
  có id, và ghi `AgentEvent` loại `model.bi-go-lui` (`data: { modelId, vai }`) — tối đa một lần mỗi id mỗi
  tiến trình;
- danh mục không đọc được → giữ model đã chọn (sự cố mạng không đổi model của chủ kho).

`modelChoLuot` (ghim id vào lượt Tác nhân) đi qua `modelTheoVai` nên hưởng cùng luật.
Không đổi `packages/db/src/settings.ts` (chủ kho chưa quyết thống nhất model đo/production).

### 2b. Lượt vẫn hỏng thì để lại dấu

Trong cửa sổ cache (model bị gỡ sau lần đọc danh mục cuối), lượt vẫn hỏng. Hook `step.failed` của agent gốc nhận lỗi `GatewayModelNotFoundError` (khớp theo lớp lỗi / mã `model_not_found`, không theo chữ tự do) thì ghi `AgentEvent` loại `model.khong-tim-thay` (`data: { modelId }`). Lỗi model khác (402 hết tín dụng, 429) không ghi. Đây là đường đo «phiên hỏng vì model bị gỡ», thay cho log Vercel (giữ ngắn hơn hai tuần).

### 3. Cài đặt báo quản trị

`SettingsService.agentModel` trả thêm `selectedMissing: boolean` = có model đã chọn ∧ danh mục đọc được ∧
id không có trong danh mục. Màn `settings/agent-model.tsx` hiện một `Alert` («Model đã chọn không còn trên
AI Gateway — trợ lý đang chạy model mặc định. Chọn model khác.») khi cờ bật. Chữ ở
`apps/app/lib/messages/*`, ghim ở `messages-guard`.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Cài đặt › Model trợ lý → thấy model đang dùng → (quản trị) đổi model.
- Biên: model đã chọn bị Gateway gỡ → hộp báo phía trên ô chọn; danh mục Gateway không đọc được → câu
  «không với tới» như hôm nay, không hộp báo.
- Lỗi & quay lại: quản trị chọn model khác hoặc «về mặc định» → hộp báo biến mất sau khi lưu.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cài đặt › Model trợ lý | chọn model cho trợ lý | thanh bên Cài đặt / các mục Cài đặt khác |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-model-con | Model trợ lý | model đang dùng, không hộp báo | không cần làm gì |
| ST-model-bi-go | Model trợ lý | hộp báo «Model đã chọn không còn…» + model mặc định đang chạy | quản trị chọn model khác |
| ST-danh-muc-loi | Model trợ lý | câu «không với tới» như hôm nay, không hộp báo | thử lại sau |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Hộp báo chỉ dựa trên cờ API trả về, không tự đoán ở trình duyệt; thành viên thường cũng thấy hộp báo
  (biết vì sao chat chạy model khác); ô chọn của họ vẫn bị khoá kèm câu «chỉ chủ sở hữu hoặc quản trị đổi được» như hôm nay (hồ sơ `cai-dat-chung-chi-quan-tri`).

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Alert` (`@crm/ui`) | dùng | hộp báo trạng thái đã có trong kho |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: trang Cài đặt có sẵn; vòng này chỉ thêm một hộp báo, không đổi khuôn — không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài phạm vi

- Thống nhất model đo với model production / đổi `DEFAULT_AGENT_MODEL` (chủ kho chưa quyết).
- Kiểm production «Trợ lý OKR bị đóng `khong-chay:chua-co-khoa-mo-hinh`?» — biến cơ sở dữ liệu production là
  sensitive, máy không đọc được; chủ kho tự xem Cài đặt › OKR (quyết định 05/10).
- Bổ sung cột người sửa vào `FieldDefinition` (cần migration; đường đo dùng `AgentEvent`).
- Báo quản trị qua Zalo/email khi model bị gỡ.

## Tài liệu đã đọc

`docs/agent.md`, `docs/api.md`, `docs/settings.md`, `docs/design.md`, `apps/agent/node_modules/eve/docs/agent-config.md`
(mục dynamic model). `feature_loop.ui_standards_skill` không có trong phiên.
