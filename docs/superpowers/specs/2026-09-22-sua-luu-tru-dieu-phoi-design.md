# Sửa, lưu trữ và phân quyền trên Điều phối 30 ngày — design

Ngày: 2026-09-22 · Hồ sơ: `_acceptance/sua-luu-tru-dieu-phoi/` · Hạng: T3 (chạm `packages/auth`)

## Vì sao

Vòng `noi-bon-nut-dieu-phoi` nối bốn nút **tạo**. Chủ kho mở màn Cài đặt › Điều
phối trên prod ngày 22/09 và thấy chỉ tạo được, không sửa, không xoá. Máy chủ đã
có phần lớn thủ tục (`updateDepartment`, `archiveDepartment`, `reorderDepartments`,
`updateTemplate`, `archiveTemplate`, `closePlan`, `markEnrollmentStage`) nhưng không
màn nào gọi. Cùng lúc, rà theo chuẩn của kho cho thấy module điều phối **không kiểm
quyền gì** — thành viên nào đăng nhập cũng sửa được cấu hình — và hai hạn chế đã ký
ở vòng trước (Ngoài-1: ngày sai thành 1970; Ngoài-6: thêm người đã có âm thầm đổi
nguồn) được chủ kho gộp vào vòng này.

Cấp «phòng ban thuộc bộ phận» đã tách thành ô cơ hội `cau-truc-to-chuc`.

## Chuẩn áp vào

- **Xoá là lưu trữ trước, xoá vĩnh viễn sau** (`docs/api.md`): danh sách nhận
  `archived: boolean` (mặc định `false`), không có chế độ trộn; `archive`/`restore`
  chỉ đổi `archivedAt`; `purge` xoá thật.
- **Quyền từ `@crm/auth`**: một hàm `canManageOnboarding(role)` (quản trị/chủ), máy
  chủ ném 403, và màn đọc cờ `canManage` để khoá nút — nút và 403 không nói ngược nhau
  (khuôn `canManageCurrency`).
- **Khuôn Cài đặt › Trường**: kéo-thả bằng `SortableList`, menu «…» trên từng dòng,
  mục «Đã lưu trữ» có Khôi phục, thông báo lỗi bằng `toast`.
- **Chuẩn ngành** (Attio, HubSpot, Linear): lưu trữ có khôi phục; thông báo
  «Đã lưu trữ · Hoàn tác»; không cho bỏ thứ đang được dùng (HubSpot bắt dời deal
  trước khi xoá stage); cấu hình chỉ quản trị đổi.

## Máy chủ

| Thủ tục | Đổi gì |
|---|---|
| `access` (mới, query) | `{ canManage }` theo vai trò người gọi |
| `listDepartments`, `listTemplates` | nhận `{ archived?: boolean }` (mặc định `false`); mỗi hàng mang `purgeable: boolean` — `true` khi đã lưu trữ và chưa từng dùng; màn dựng nút «Xoá vĩnh viễn» từ trường này |
| `create/update/archive/restore/purge/reorder` bộ phận · `create/update/archive/restore/purge` khuôn | đòi `canManageOnboarding`, không đủ → 403 |
| `archiveDepartment` | từ chối (400) khi còn khuôn **chưa lưu trữ** có bước trỏ tới; thông điệp nêu tên khuôn |
| `restoreDepartment`, `restoreTemplate` (mới) | bỏ `archivedAt`; khôi phục khuôn có bước trỏ bộ phận đã lưu trữ → 400 nêu tên bộ phận |
| `createTemplate`, `updateTemplate` | bước trỏ bộ phận đã lưu trữ hoặc không tồn tại → 400 nêu tên/mã |
| `purgeDepartment`, `purgeTemplate` (mới) | chỉ khi đã lưu trữ **và** chưa từng dùng (bộ phận: không bước kế hoạch nào; khuôn: không kế hoạch nào tạo từ nó); ngược lại 400 |
| `reopenPlan` (mới) | bỏ `closedAt` |
| `listSteps` | mỗi bước mang kèm `departmentName` (lấy qua quan hệ, kể cả bộ phận đã lưu trữ) |
| `planCreateFromTemplateInput.startedAt`, `enrollmentStageInput.at` | chỉ nhận chuỗi `YYYY-MM-DD` (`z.iso.date()`), đổi thành nửa đêm UTC của ngày đó; `at` nhận thêm `null` = bỏ đánh dấu. Sai/thiếu → 400 nêu tên trường (Ngoài-1) |
| `upsertEnrollment` | chỉ **tạo**: người đã có trong phễu → 409 «Người này đã có trong phễu», không ghi gì (Ngoài-6). Luồng nền tảng (`onboarding-ingest.service.ts`) ghi đường riêng, không đổi |

Việc trên kế hoạch (tạo kế hoạch, đóng/mở lại, thêm môi giới, gỡ môi giới, đánh dấu
bậc) **không** đòi quyền quản trị.

## Màn

**Cài đặt › Điều phối 30 ngày**
- Bộ phận: `SortableList` (kéo, và bàn phím), menu «…»: Đổi tên (hộp thoại Thêm bộ
  phận ở chế độ sửa, điền sẵn) · Lưu trữ (hộp xác nhận).
- Khuôn: menu «…» trên từng thẻ: Sửa (hộp thoại Soạn khuôn điền sẵn, dòng chú thích
  «Kế hoạch đã tạo không đổi theo») · Lưu trữ.
- Sau khi lưu trữ: `toast` «Đã lưu trữ <tên>» kèm nút «Hoàn tác» (gọi restore).
- Mục thu gọn «Đã lưu trữ» (bộ phận và khuôn): Khôi phục · Xoá vĩnh viễn (chỉ hiện khi
  chưa từng dùng; có hộp xác nhận).
- Người không đủ quyền: mọi nút cấu hình khoá, một dòng «Cần quyền quản trị để đổi
  cấu hình điều phối».

**Hồ sơ kế hoạch**
- Đầu trang: «Đóng kế hoạch» (hộp xác nhận) · kế hoạch đã đóng: nhãn «Đã đóng» và
  nút «Mở lại».
- Danh sách môi giới: bốn ô bậc cho mỗi người. Ô trống → bấm là ghi ngày hôm nay
  (ngày lịch theo giờ máy người dùng). Ô có ngày → bấm mở lịch: chọn ngày khác, hoặc
  «Bỏ đánh dấu». Không ép thứ tự bậc.
- Bước kế hoạch hiện `departmentName` từ máy chủ — không còn mã thô khi bộ phận đã
  lưu trữ.
- «Thêm môi giới»: người đã có trong phễu hiện mờ kèm «đã trong phễu», không chọn được.

**Danh mục**: bộ lọc «Đã đóng» đã có; không đổi.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Cài đặt › Điều phối → menu «…» của một bộ phận → Lưu trữ → xác nhận → bộ phận rời danh sách, thông báo «Đã lưu trữ · Hoàn tác» (điểm ra: mục «Đã lưu trữ»).
- Suôn sẻ: Hồ sơ kế hoạch → bấm ô bậc trống của một môi giới → ô hiện ngày hôm nay, phễu đếm thêm một.
- Biên: bộ phận còn khuôn dùng → lưu trữ bị từ chối, thông báo nêu tên khuôn; người không phải quản trị → nút cấu hình khoá kèm lý do; mục chưa từng dùng mới có «Xoá vĩnh viễn».
- Lỗi & quay lại: máy chủ từ chối → trạng thái trên màn giữ nguyên, `toast` lỗi nêu thông điệp máy chủ; hộp thoại sửa giữ giá trị đã nhập; «Hoàn tác» và «Khôi phục» là đường quay lại của lưu trữ; «Mở lại» là đường quay lại của đóng.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cài đặt › Điều phối 30 ngày | quản cấu hình: bộ phận và khuôn | thanh bên Cài đặt / hộp thoại sửa, mục Đã lưu trữ |
| Hồ sơ kế hoạch | theo dõi một kế hoạch và phễu của nó | danh mục 30 ngày / danh mục |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-caidat-khong-quyen | Cài đặt › Điều phối | nút cấu hình khoá + «Cần quyền quản trị để đổi cấu hình điều phối» | nhờ quản trị |
| ST-caidat-luu-tru-bi-chan | Cài đặt › Điều phối | toast «Bộ phận này còn nằm trong khuôn <tên> — sửa khuôn trước» | sửa hoặc lưu trữ khuôn |
| ST-caidat-da-luu-tru-rong | Cài đặt › Điều phối | mục «Đã lưu trữ» không hiện khi rỗng | — |
| ST-caidat-hoan-tac | Cài đặt › Điều phối | toast «Đã lưu trữ <tên>» + «Hoàn tác» | bấm Hoàn tác trong lúc toast còn |
| ST-kehoach-da-dong | Hồ sơ kế hoạch | nhãn «Đã đóng» + nút «Mở lại» | mở lại |
| ST-kehoach-bac-dang-luu | Hồ sơ kế hoạch | ô bậc khoá trong lúc chờ máy chủ | chờ |
| ST-kehoach-bac-loi | Hồ sơ kế hoạch | ô bậc về giá trị cũ + toast lỗi | bấm lại |
| ST-moigioi-da-trong-pheu | hộp «Thêm môi giới» | dòng mờ + «đã trong phễu», không chọn được | chọn người khác |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Kéo-thả có bàn phím (`SortableList` đã có `KeyboardSensor`); thứ tự lưu ngay khi thả, lỗi thì về thứ tự cũ.
- Ô bậc: ngày hôm nay là ngày lịch theo giờ máy người dùng, gửi dạng `YYYY-MM-DD`.
- Mọi nút thao tác khoá trong lúc chờ máy chủ; một cú bấm là một lời gọi.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `SortableList`, `DropdownMenu`, `AlertDialog`, `Collapsible`, `Popover` + `Calendar`, `toast` | dùng | có sẵn trong `@crm/ui`, Cài đặt › Trường đã dùng cùng bộ |
| `KhungTao` | mở rộng | thêm chế độ sửa (giá trị ban đầu + nhãn nút) cho hai hộp thoại sẵn có |
| Ô bậc phễu | ghép | `Button` + `Popover` + `Calendar` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — giữ nguyên khuôn hai màn đã có (danh sách cấu hình, hồ sơ kế hoạch); thao tác sửa/lưu trữ theo đúng Cài đặt › Trường của chính kho, không tra thêm.
<!-- UX-SPEC-TEMPLATE>>> -->

## Kiểm

- Màn: bài kiểm jsdom với bản giả tRPC (khuôn `noi-bon-nut.dom.tsx`), đầu vào đi qua
  JSON roundtrip rồi qua chính schema của API.
- Máy chủ: bài kiểm HTTP thật qua `AppModule` với cookie phiên của hai vai trò
  (quản trị, thành viên) trên cơ sở dữ liệu kiểm thử riêng của lượt.
- `canManageOnboarding`: bài kiểm đơn vị trong `packages/auth` với ma trận đủ `WORKSPACE_ROLES` cộng `null`; bài kiểm máy chủ có thêm phiên của chủ.
- Hộp thoại «Tạo kế hoạch từ khuôn» của vòng trước: đo lại dạng ngày gửi đi dưới giờ Việt Nam lúc 23:30, vì vòng này siết schema ngày.
- Màn thật: ảnh chụp ở khổ 1440 và 768.

## Ngoài phạm vi

- Cấu trúc bộ phận → phòng ban (ô `cau-truc-to-chuc`).
- Sửa người cầm trịch hay ngày bắt đầu của kế hoạch (cần thủ tục mới).
- Sửa các bước của một kế hoạch đang chạy.
- Nhật ký ai đổi gì.
- «Loại đối tác» của khuôn lấy từ trường chọn của Công ty (trường tự tạo).
- Phân quyền cho Cài đặt › Trường (ô `chi-quan-tri-sua-duoc-truong`).
