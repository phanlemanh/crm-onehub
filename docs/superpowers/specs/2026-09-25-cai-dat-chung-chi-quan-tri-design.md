# Cài đặt chung chỉ chủ và quản trị đổi được — thiết kế

Ngày 2026-09-25 · slug `cai-dat-chung-chi-quan-tri` · hạng T3 (thêm vị từ vào `packages/auth`)

## Vì sao

Buổi soát giao diện Cài đặt tìm ra: `SettingsRouter` chỉ có `AuthMiddleware`. Ba thao tác
đổi — `setResearchKey`, `setAgentModel`, `setArchiveRetention` — đi thẳng vào
`SettingsService` mà không hỏi vai trò. Một thành viên thường bất kỳ thay được khoá
Context.dev của cả workspace, đổi model mà trợ lý dùng (chi phí và chất lượng của mọi
người), và rút số ngày giữ mục đã lưu trữ — tức là quyết lúc dữ liệu bị xoá hẳn. Màn
Cài đặt › Chung cũng không khoá gì, khác `workspace-form.tsx` (`canRename`) và
`currency-settings.tsx` (`canManage`).

Chủ kho chốt ngày 2026-09-25 (hai câu hỏi đầu phiên):

1. Cả ba thao tác chỉ `owner` và `admin` làm được.
2. Khi workspace chưa có khoá nghiên cứu, cổng `/onboarding/research` chỉ đẩy chủ và
   quản trị; thành viên thường vào thẳng ứng dụng.

Câu thứ hai sinh ra vì một lỗ phụ: `readResearchGate` (`apps/app/lib/onboarding.ts`)
đẩy **mọi** người có phiên tới `/onboarding/research` khi chưa có khoá, màn đó không có
nút bỏ qua. Chặn máy chủ mà không sửa cổng thì thành viên thường bị nhốt ở một màn chỉ
trả 403.

## Nếp áp dụng

`docs/api.md` («Permissions come from `@crm/auth` … enforced by the service *and* used to
disable the UI control, so the button and the 403 cannot disagree») và
`docs/connections.md` («Being signed in is not authorisation»). Tiền lệ gần nhất là
`chi-quan-tri-sua-duoc-truong` (22/09).

## Cách làm (cách A — đã duyệt)

### 1. Vị từ

`canManageWorkspaceSettings(role)` trong `packages/auth/src/organization.ts`, cùng hình
với `canManageFields`: `isWorkspaceAdmin(role)`. Xuất qua barrel `@crm/auth`.

### 2. Máy chủ

- `SettingsRouter` lấy `@Ctx() ctx: AuthedTrpcContext` ở ba query đọc có cờ và ba mutation,
  truyền `ctx.user.id` xuống service. `modelCatalog` không đổi.
- `SettingsService.requireManager(userId)` ném `ForbiddenException` với thông điệp ở
  `apps/api/src/settings/settings-config.ts` (`SETTINGS_CONFIG.messages.forbidden`).
- Kiểm quyền là **dòng đầu tiên** của ba mutation: trước `researchKeys.verify` (lời gọi
  sang agent rồi Context.dev), trước `catalog.models()` (AI Gateway), trước khi ghi, và
  trước `backfill.run("companies")`. Người bị từ chối không kích được lời gọi ra ngoài
  hay việc xếp hàng nào.
- `researchKeyOutput`, `agentModelOutput`, `archiveRetentionOutput` thêm
  `canManage: boolean`. Mutation trả cùng output, nên kết quả mutation cũng mang cờ (luôn
  `true` khi thành công). REST dùng lại router, khoá API biến thành phiên trước router,
  nên cả hai lối được phủ mà không cần mã riêng.

Cờ đi **cùng** dữ liệu thay vì một query `settings.access` riêng: cổng proxy đã đọc
`settings.researchKey` nên không tốn thêm lượt gọi, và không lặp lại lỗi gộp «đang tải /
lỗi / không quyền» đã thành giới hạn ở vòng Trường (Ngoài-2) — card đã không hiện gì khi
query lỗi.

### 3. Cổng onboarding

Trả lời `settings.researchKey` là một hình đi qua ranh giới hai app (API viết, proxy của
`apps/app` đọc), nên theo AGENTS.md («Parse at the boundary») phần đọc dời vào
`packages/validation/src/cong-nghien-cuu.ts` (subpath `@crm/validation/cong-nghien-cuu`):
schema trả lời (`configured`, `canManage`, cùng kiểu `.nullable().catch(null)` như hôm nay)
và một hàm thuần `congNghienCuu(data)` trả `Gate`. `readResearchGate` chỉ còn gọi API rồi
đưa `result.data` cho hàm đó. Nhờ vậy bài kiểm API lấy được trả lời HTTP **thật** rồi đưa
qua **đúng** hàm proxy dùng — writer và reader gặp nhau trong một phép đo, không qua bộ dựng
giả. Luật của hàm:

- `unknown` khi `configured === null` (như cũ);
- `settled` khi có khoá, **hoặc** khi `canManage !== true`;
- `required` chỉ khi chưa có khoá **và** `canManage === true`.

Cùng hình với cổng đặt tên (`workspace.onboarded || workspace.canRename !== true`). Thành
viên gõ thẳng `/onboarding/research` khi cổng đã `settled` bị `proxy` chuyển về trang chính
của workspace theo đường `isSetup` sẵn có — không thêm mã.

### 4. Màn hình

Ba card ở Cài đặt › Chung đọc `canManage` từ chính query của mình:

- `research-key.tsx`: ô nhập khoá và nút Lưu/Thay khoá `disabled` khi `!canManage`. Chỉ báo
  «Đã cắm / Chưa cắm» và gợi ý khoá che (`hint`) vẫn hiện.
- `archive-retention.tsx`: ô số ngày và nút Lưu `disabled`; số ngày hiện tại vẫn đọc được.
- `agent-model.tsx`: nút combobox `disabled`; dòng model đang chạy vẫn hiện.
- Mỗi card có một dòng `text-muted-foreground text-xs` từ `settingsMessages` khi
  `!canManage`, theo đúng khuôn `workspace-form.tsx`. Control bị khoá trỏ
  `aria-describedby` tới dòng đó (chuẩn `web-design-guidelines`: control khoá phải nói vì
  sao) — `workspace-form` chưa làm, vòng này làm cho ba card mới, không sửa card cũ.

Không component mới, không biến thể mới trong `packages/ui`.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ (quản trị): Cài đặt › Chung → sửa khoá / số ngày / model → Lưu → toast đã lưu (điểm ra: cùng màn)
- Biên (thành viên): Cài đặt › Chung → thấy giá trị hiện tại, control mờ, dòng «chỉ chủ hoặc quản trị» dưới mỗi card → không có hành động (điểm ra: sidebar)
- Biên (thành viên, workspace chưa có khoá): đăng nhập → vào thẳng ứng dụng, không qua `/onboarding/research`
- Lỗi & quay lại: hành vi sẵn có, vòng này không đổi — mutation lỗi thì card hiện toast `error.message` như hôm nay

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cài đặt › Chung | xem và (nếu đủ quyền) đổi cài đặt dùng chung của workspace | sidebar Cài đặt / sidebar |
| `/onboarding/research` | cắm khoá nghiên cứu lần đầu — chỉ chủ và quản trị tới được | cổng proxy / trang chính |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-cai-dat-chung-quan-tri | Cài đặt › Chung | ba card như hôm nay, control bấm được, không có dòng khoá | sửa và lưu |
| ST-cai-dat-chung-khong-quyen | Cài đặt › Chung | ba card hiện giá trị, control `disabled`, mỗi card một dòng «Chỉ chủ sở hữu hoặc quản trị…» | không; hỏi quản trị |
| ST-cai-dat-chung-dang-tai | Cài đặt › Chung | card chưa có dữ liệu thì không hiện (như hôm nay) | chờ |
| ST-onboarding-research-thanh-vien | cổng proxy | không đẩy tới `/onboarding/research`; gõ thẳng đường đó thì về trang chính | dùng ứng dụng |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Control khoá dùng thuộc tính `disabled` gốc; `aria-describedby` trỏ tới dòng lý do cùng card.
- Khổ 768: dòng lý do xuống dòng trong card, không tràn ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Card`, `Input`, `Button`, `Popover` của `@crm/ui` | dùng | đã có trên ba card, chỉ thêm `disabled` |
| dòng lý do `text-muted-foreground text-xs` | dùng | khuôn của `workspace-form.tsx` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: màn đã có, vòng này không đổi bố cục — chỉ thêm trạng thái khoá; luồng hiển nhiên, không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Kiểm thử

- Vị từ: ma trận đủ `WORKSPACE_ROLES` + `null`.
- API qua HTTP thật: app dựng bằng `createApp()` như `go-la-cat-quyen.spec.ts`, nên cả
  `/api/trpc` lẫn cầu REST (`/rest/settings/...`) đều có mặt. `verify` của
  `ResearchKeyService`, `models` của `ModelCatalogService`, `run` của `BackfillService`
  bị `spyOn` trên chính thể hiện trong app để đếm lời gọi — chứng «không gọi ra ngoài khi
  bị từ chối» và để quản trị lưu được mà không cần agent hay Gateway thật.
- Cổng xuyên lớp: cùng bài kiểm API, xoá khoá (`writeContextDevKey(db, "")`), lấy trả lời
  HTTP thật của `settings.researchKey` cho member và admin, đưa `result.data` qua
  `congNghienCuu` — member `settled`, admin `required`; rồi đặt lại khoá.
- Cổng: `onboarding-gate.spec.ts` — ca thành viên không bị đẩy, ca quản trị vẫn bị đẩy, ca
  `canManage` vắng; bộ dựng `researchKey` giả mang `canManage` vì đó là hình thật của trả lời.
- DOM: ba card cho hai vai.
- Ảnh thật (`ui-check`) Cài đặt › Chung cho thành viên và quản trị ở 1440 và 768.

## Ngoài phạm vi

- 20 router khác chỉ có `AuthMiddleware`.
- Nhật ký ai đổi cài đặt lúc nào.
- Quyền nhiều mức (vd quản trị đổi model nhưng không đổi khoá).
- Thêm `aria-describedby` cho `workspace-form.tsx` cũ.
