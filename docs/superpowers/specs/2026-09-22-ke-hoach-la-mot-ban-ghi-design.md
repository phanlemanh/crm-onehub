# Kế hoạch là một bản ghi — design

Ngày 2026-09-22 · hồ sơ `_acceptance/ke-hoach-la-mot-ban-ghi/` · hạng T3 ·
lượt 1 của `docs/plan/lo-trinh-dieu-phoi-30-ngay.md`

## 1. Bối cảnh và phạm vi

Vòng một (`dieu-phoi-30-ngay-dau`) dựng khuôn, danh mục, hồ sơ, phễu và điểm
nhận. Kế hoạch có màn nhưng không có tay: sau khi tạo, không thủ tục nào ghi vào
`OnboardingStep`, nên ba cột danh mục (Bước · Đang tắc ở · Im lặng) chết trên
production, và hồ sơ là một trang riêng khác họ record sheet của Công ty · Cá
nhân · Thoả thuận.

Lượt này làm cho một câu đúng: *«Tôi mở một đối tác như mở một thoả thuận, giao
bước, đánh dấu xong, và thấy ai làm gì lúc nào.»*

**Đã chốt trong brainstorm 2026-09-22** (sổ quyết định mang từng dòng):

| Câu hỏi | Chọn | Vì sao |
| --- | --- | --- |
| Ai đánh dấu bước xong | mọi người đăng nhập; vết ghi tên người bấm | vế CHẾT của ngưỡng là «báo qua chat rồi cầm trịch đánh dấu hộ» — rào ở nút xong đẩy người về đúng hành vi đó |
| Vết có hiện ở dòng thời gian công ty | chỉ ghi chú và mốc lớn của kế hoạch | dòng thời gian công ty là câu chuyện quan hệ, không phải nhật ký thao tác |
| Kiến trúc | kế hoạch là loại bản ghi thứ tư, menu `⋯` riêng | giải đúng lệch đã nêu; giữ nghĩa thật của «đóng» thay vì gán nhãn «lưu trữ» |
| Sửa nhãn bước · sửa số ngày mục tiêu | bỏ khỏi lượt | nhãn đã nằm trong vết cũ; đổi số ngày dịch mọi hạn đã sinh |

## 2. Dữ liệu và vết

**Migration (một lần):**

- `Activity.planId String?` — khoá ngoại sang `OnboardingPlan`,
  `onDelete: Cascade`, chỉ mục `[planId, createdAt]`; `OnboardingPlan.activities`.
- `ActivityType` thêm `PLAN_CHANGE`.

Vì sao không mượn kiểu có sẵn: `TASK` được vẽ với ô tích và lọt vào
`activities.myTasks` (lọc `type: TASK`), nên mỗi lần giao bước sẽ thành một việc
rác của người bấm; `STAGE_CHANGE` được đọc bằng `stageChange.parse(entry.meta)`
thành «giai đoạn thoả thuận A → B» (`timeline-entry.tsx:72`).

**Hình của vết:** `packages/validation/src/onboarding-activity.ts`, hợp phân biệt
theo `kind`, parse ở biên (luật «Parse at the boundary» của `AGENTS.md`), import
theo subpath `@crm/validation/onboarding-activity`.

| `kind` | `meta` | `companyId` |
| --- | --- | --- |
| `buoc.giao` | `stepId` · `nhan` · `tu` · `den` (id người hoặc null) | không |
| `buoc.xong` · `buoc.boXong` | `stepId` · `nhan` | không |
| `buoc.doiHan` | `stepId` · `nhan` · `tu` · `den` (ngày `YYYY-MM-DD`) | không |
| `buoc.them` · `buoc.bo` | `stepId` · `nhan` | không |
| `keHoach.doiCamTrich` | `tu` · `den` (id người) | có |
| `keHoach.dong` · `keHoach.moLai` | — | có |

Ghi chú của người là `NOTE` mang `planId` và `companyId` của kế hoạch.

**Bất biến:**

1. Mỗi thủ tục ghi bước và ghi đúng một `Activity` trong **cùng một transaction**,
   và chạm `OnboardingStep.updatedAt`.
2. Thao tác không đổi giá trị nào thì không ghi vết và không chạm `updatedAt`.
3. Xoá theo dây chuyền (xoá công ty → kế hoạch → vết). Vết kế hoạch chỉ mang
   `planId` hoặc thêm `companyId`, không bao giờ `contactId` hay `dealId`, nên
   không bản ghi còn sống nào bị vết kế hoạch đóng dấu `lastActivityAt`;
   `targetsOf` không cần phủ `planId` (`docs/api.md`, mục purge).
4. Mỗi vết mang `createdById` của người bấm — thủ tục nhận người đang đăng nhập
   từ ngữ cảnh router, không lấy `ownerId` của kế hoạch.
5. Hàm dựng `meta` của từng `kind` xuất từ `packages/validation/src/onboarding-activity.ts`
   là đường DUY NHẤT tạo `meta`; service gọi nó khi ghi, bài kiểm vẽ gọi nó khi
   dựng fixture — một khuôn cho bên viết và bên đọc.

## 3. API

Mọi thủ tục mới nằm trong `apps/api/src/onboarding/onboarding.router.ts` — zod
vào, service ra, Prisma chỉ trong `onboarding.service.ts`, lỗi ném bằng
`HttpException`, thông điệp tiếng Việt khai trong `onboarding-config.ts`. Không
thủ tục nào đòi quyền quản trị, theo nếp các thủ tục kế hoạch đang có.

| Thủ tục | Input | Vết |
| --- | --- | --- |
| `assignStep` | `stepId` · `assigneeId: string \| null` | `buoc.giao` |
| `setStepDone` | `stepId` · `done: boolean` | `buoc.xong` / `buoc.boXong` |
| `rescheduleStep` | `stepId` · `dueAt` (chuỗi ngày) | `buoc.doiHan` |
| `addStep` | `planId` · `label` · `departmentId` · `dueAt` · `assigneeId?` | `buoc.them` |
| `removeStep` | `stepId` | `buoc.bo` |
| `reorderSteps` | `planId` · `stepIds[]` (đúng tập bước của kế hoạch) | không |
| `setPlanOwner` | `planId` · `ownerId` | `keHoach.doiCamTrich` |
| `closePlan` · `reopenPlan` (có sẵn) | — | thêm `keHoach.dong` / `keHoach.moLai` |

**Đọc được mở rộng:**

- `planById` trả thêm công ty (`id` · `name` · logo), người cầm trịch (`id` ·
  `name` · `image`), tên khuôn, và dải số do máy chủ tính (`ngayThu` ·
  `buocXong` · `buocTong` · `imNgay` · `tacO`) bằng chính `dungHang` của danh mục.
- `listSteps` trả thêm người được giao (`id` · `name` · `image`).
- `activities.timeline` · `timelineCounts` · `create` nhận `planId`; luật «ít nhất
  một mốc neo» tính trên bốn trường; `NOTE` với `planId` được máy chủ gán
  `companyId` của kế hoạch.

**Lỗi:**

- Kế hoạch đã đóng → mọi thủ tục ghi bước và `setPlanOwner` trả `409
  «Kế hoạch đã đóng — mở lại trước khi sửa.»`, không hàng nào được ghi.
- Bước không thuộc kế hoạch, hoặc người không phải thành viên đang hoạt động →
  `404` / `400` nêu tên.
- `reorderSteps` với tập id thiếu, thừa hay trùng → `400`, không ghi nửa chừng.

**Trình duyệt:** `useCrmCache().plan(id)` làm mới `planById` · `listSteps` ·
`listEnrollments` · `manDanhMuc` · `bangCot` · dòng thời gian, gọi trong
`onSuccess`.

Không thêm sự kiện telemetry: `docs/telemetry.md` chỉ có một sự kiện tổng hợp mỗi
ngày, không theo hành động.

## 4. Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: thanh bên → Danh mục 30 ngày → bấm hàng One Mount → sheet kế hoạch trượt ra, bảng vẫn sau → tab Bước → giao «Đào tạo» cho Thương → Thương mở cùng sheet, tích xong (điểm ra: đóng sheet, hàng One Mount ở danh mục đổi Bước 1/4 và Im lặng 0 ngày)
- Biên: kế hoạch không bước nào (tạo tay từ khuôn rỗng); phễu 80 môi giới; kế hoạch đã đóng mở lại từ bộ lọc «Đã đóng»; link cũ `/onboarding/<id>` từ tin nhắn
- Lỗi & quay lại: bấm khi kế hoạch vừa bị người khác đóng → toast «Kế hoạch đã đóng — mở lại trước khi sửa.», sheet làm mới và hiện trạng thái đóng; bước vừa bị người khác bỏ → toast, dòng biến mất

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Danh mục 30 ngày | nhìn ra đối tác nào đang tắc | thanh bên / sheet kế hoạch |
| Sheet kế hoạch — tab Bước | làm việc trên bước: giao, xong, hạn, thêm bớt | danh mục, bảng cột, link cũ / sheet công ty |
| Sheet kế hoạch — tab Môi giới | đánh dấu bậc và gỡ từng môi giới | cùng sheet |
| Sheet kế hoạch — tab Hoạt động | đọc ai làm gì lúc nào, ghi chú | cùng sheet |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-kehoach-dangtai | Sheet kế hoạch | đầu sheet với tiêu đề tạm, spinner giữa thân (`RecordSheetFrame`) | chờ |
| ST-kehoach-loi | Sheet kế hoạch | «Không tải được bản ghi» kèm thông điệp máy chủ | đóng sheet, mở lại |
| ST-kehoach-codulieu | Sheet kế hoạch | dải số bốn ô, bước gom theo bộ phận, nút giao · xong · hạn trên dòng | giao, tích, đổi hạn |
| ST-kehoach-khongbuoc | Sheet kế hoạch | «Kế hoạch chưa có bước nào» kèm nút Thêm bước | thêm bước |
| ST-kehoach-dadong | Sheet kế hoạch | ghi chú «Đã đóng <ngày>» ở đầu sheet; mọi nút ghi khoá kèm «Mở lại để sửa» | mở lại, hoặc chỉ đọc và ghi chú |
| ST-kehoach-quahan | Sheet kế hoạch | huy hiệu «Quá hạn» và ngày in đậm trên bước có ngày hạn trước hôm nay | giao, đổi hạn, tích |
| ST-kehoach-phieurong | Tab Môi giới | màn trống của vòng một kèm Thêm môi giới | thêm môi giới |
| ST-kehoach-phieu80 | Tab Môi giới | bảng 80 hàng cuộn cùng phễu trong thân sheet | đánh dấu bậc, gỡ |
| ST-kehoach-hoatdong | Tab Hoạt động | vết theo thời gian mới nhất trước, ghi chú đậm hơn vết máy, composer ghi chú ở đầu | đọc, ghi chú |
| ST-kehoach-dangghi | Mọi nút ghi | nút khoá, trạng thái chờ; lỗi → toast đúng thông điệp máy chủ | chờ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Không cập nhật lạc quan: nút khoá khi đang gửi (`savingField` như deals); lỗi → `toast.error` với thông điệp máy chủ
- «Quá hạn» so theo ngày lịch của người xem: ngày hạn trước hôm nay; hạn hôm nay không gắn
- Sắp thứ tự bằng Lên/Xuống trong menu dòng — bàn phím dùng được, không kéo thả
- Bỏ bước, gỡ môi giới, đóng kế hoạch: hộp xác nhận nêu tên thứ bị tác động
- Tên người, tên công ty, nhãn bước: `translate="no"`
- Cột số trong dải số và bảng: `tabular-nums`

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `RecordSheetFrame`, `DetailSheetStats`, `DetailSheetTabs`, `DetailSheetSection`, `DetailSheetProperties`, `DetailSheetEmpty` | dùng | khung chung của họ record sheet |
| `Timeline` | mở rộng | nhận mốc neo `planId`, thêm nhánh vẽ `PLAN_CHANGE` |
| `InlineSelectField` | dùng | đổi người cầm trịch tại chỗ, như owner của deal |
| `SimpleTable`, `AddRow` | dùng | bảng môi giới và hàng thêm, như tab Contacts của deal |
| `OBac`, `ThemMoiGioi` | dùng | ô bậc và chọn môi giới của vòng một |
| Dòng bước (ô tích · người · hạn · menu) | ghép | từ `Checkbox`, `Popover`, `Calendar`, `DropdownMenu` của `@crm/ui` |
| Menu `⋯` của kế hoạch | ghép | `DropdownMenu` với một mục Đóng / Mở lại; `RecordActions` giả định lưu trữ · xoá mà kế hoạch không có |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên, không tra thêm — kho đã dùng đúng khuôn này cho Công ty · Cá nhân · Thoả thuận, và lệch cần sửa chính là màn chi tiết đang đứng ngoài khuôn; vòng một đã tra Mobbin 2026-09-20 (Remote · Workable · Employment Hero · Todoist · Oyster · Wrike) và cả sáu dùng danh-sách-chi-tiết.
<!-- UX-SPEC-TEMPLATE>>> -->

## 5. Sheet kế hoạch — chi tiết

**Lối vào.** `plan` vào `RECORD_KINDS`; hàng danh mục và thẻ bảng cột gọi
`openRecord({ kind: "plan", id })`, rê chuột thì `usePrefetchRecord`. Đường cũ
`apps/app/app/(app)/[slug]/onboarding/[planId]/page.tsx` chỉ còn `redirect` về
`/onboarding?record=plan:<id>`, như `deals/[dealId]/page.tsx`.

**Đầu sheet:** `EntityLogo` công ty · tiêu đề tên đối tác · dòng phụ «Kế hoạch 30
ngày · khuôn <tên> · Hồ sơ công ty» với «Hồ sơ công ty» bấm mở sheet công ty chồng lên · ô `note`
«Đã đóng <ngày>» · menu `⋯` riêng.

**Dải số:** Ngày x/y · Bước x/y · Im lặng n ngày · Cầm trịch.

**Tab Bước** (mặc định): mục «Chi tiết» (Khuôn · Bắt đầu · Mục tiêu · Cầm trịch
sửa tại chỗ) rồi các nhóm theo bộ phận «<bộ phận> · x/y xong», mỗi dòng ô tích ·
nhãn · người được giao · hạn · menu Lên/Xuống/Bỏ; `AddRow` «Thêm bước» cuối mỗi
nhóm, điền sẵn bộ phận.

**Tab Môi giới:** phễu bốn bậc giữ nguyên; `SimpleTable` Tên · Có tài khoản · Xong
khoá học · Hoạt động · Giao dịch đầu · (gỡ); nút gỡ trên từng hàng, gỡ đúng người
của hàng, hộp xác nhận nêu tên, nút khoá khi đang gửi, lỗi báo bằng toast.

**Tab Hoạt động:** `Timeline` mốc neo `{ planId }`, composer ghi chú có sẵn, nhánh
vẽ `PLAN_CHANGE` trong `timeline-entry.tsx` parse qua schema
`onboarding-activity`, câu chữ từ bộ dịch.

**Không có tab Agent** ở lượt này — `AgentPanel` chỉ biết ba loại bản ghi
(`lib/agent-record.ts`).

**Chữ** ở `apps/app/lib/messages/onboarding.ts`, đủ `en` và `vi`.

## 6. Kiểm thử

- Thủ tục ghi (tiêu chí 1–10): `apps/api/test/ke-hoach-ban-ghi.spec.ts`, dựng trên
  helper `gieoKeHoach` · `gieoNguoi` · `gieoBoPhan` của vòng một; mỗi eval một cặp
  hai chiều cùng fixture, chiều đỏ là đột biến có tên, thông điệp ghim.
- Màn (tiêu chí 11, 12, 14): `apps/app/test/ke-hoach-sheet.dom.tsx` trong jsdom
  (`--preload ../../packages/ui/test/setup-dom.ts`), bản giả tRPC ghi tên thủ tục
  VÀ input, theo nếp `dieu-phoi-xoa-ghi-danh.dom.tsx`. Không chung tiến trình với
  `sign-out.spec.ts` (bài học `jsdom-dung-sign-out-spec`).
- Hàm thuần «quá hạn» (tiêu chí 13): `apps/app/test/qua-han-theo-ngay.spec.ts`, ma
  trận ba dòng hôm qua · hôm nay · ngày mai viết trước.
- Nhìn thấy trên màn (tiêu chí 15): `ui-check` `layer: ui-observed`, chụp sheet kế
  hoạch cạnh sheet thoả thuận ở khổ 1440 trên cây đang xét (cổng 3300/3301, chặn
  cây hai phía như E11 của vòng một).

## 7. Ngoài phạm vi

- Tab «30 ngày» ở sheet Công ty, dòng ở sheet Cá nhân, «việc của tôi», chuyển giao khi nghỉ — lượt 2.
- Nhắc, cảnh báo, theo dõi — lượt 3.
- Việc con, phụ thuộc, đính kèm — lượt 4.
- Sửa nhãn bước; sửa số ngày mục tiêu — bỏ khỏi lượt (duyệt 2026-09-22).
- Tab Agent trên sheet kế hoạch.
- Kéo thả bảng cột và kéo thả sắp bước.
- Component phễu trong `/packages/ui` — ghi nợ từ design-pass vòng một, không làm ở đây.

## 8. Rủi ro và giả định

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất |
| --- | --- | --- | --- |
| 1 | `Activity` + `meta` + `PLAN_CHANGE` đủ cho vết | tab Hoạt động không lọc được vết máy khỏi ghi chú | đếm: tab «Ghi chú» của `Timeline` đã lọc theo `type`, nên `PLAN_CHANGE` tự nằm ngoài |
| 2 | Bộ phận chuyên môn có tài khoản CRM | cầm trịch đánh dấu hộ — đúng vế CHẾT | hỏi mỗi trưởng bộ phận một câu trước phiên nghiệm thu |
| 3 | Sheet đủ chỗ cho phễu 80 người | tab Môi giới quá dài | design-pass chụp `ST-kehoach-phieu80` |
| 4 | Thêm giá trị enum `PLAN_CHANGE` không làm đổ chỗ nào đang `switch` trên `ActivityType` | build đỏ hoặc nhánh mặc định im lặng | `check-types` sau migration, và grep mọi `switch` trên `ActivityType` trong S2 |
