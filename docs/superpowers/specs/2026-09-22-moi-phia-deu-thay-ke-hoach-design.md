# Mọi phía đều thấy kế hoạch — design

Ngày 2026-09-22 · hồ sơ `_acceptance/moi-phia-deu-thay-ke-hoach/` · hạng T2 ·
lượt 2 của `docs/plan/lo-trinh-dieu-phoi-30-ngay.md`

## 1. Bối cảnh và phạm vi

Lượt 1 (`ke-hoach-la-mot-ban-ghi`, merge `cca1cf4b`) cho kế hoạch tay: giao bước,
đánh dấu xong, vết. Nhưng kế hoạch chỉ sống ở danh mục `/onboarding` và sheet
`plan:`. Người đứng ở sheet Công ty không biết đối tác có kế hoạch; người bộ phận
được giao bước không có chỗ nào liệt việc của mình; quản lý không xem được theo
người; không ai chuyển được việc khi một người nghỉ.

Lượt này làm cho một câu đúng: *«Tôi thấy việc 30 ngày của mình ở đúng chỗ tôi
đang đứng, không phải đi tìm danh mục.»*

**Đã chốt trong brainstorm 2026-09-22** (sổ quyết định mang từng dòng):

| Câu hỏi | Chọn | Vì sao |
| --- | --- | --- |
| Bước giao cho tôi hiện ở đâu | gộp vào thẻ Tasks của tổng quan | một chỗ nhìn; khớp ngưỡng SỐNG (b) «không mở danh mục» |
| Chuyển giao ở đâu, ai làm | menu ⋯ của Cài đặt › Thành viên, chỉ quản trị | đúng chỗ quản trị đứng khi có người nghỉ |
| Lấy dữ liệu cho sheet Công ty | byId chỉ trả số đếm; bảng tải khi mở tab | sheet Công ty không chậm cho người không cần kế hoạch (giả định 2) |
| Khi nào hiện tab | công ty có ≥1 kế hoạch, hoặc xưởng có ≥1 khuôn chưa lưu trữ | Company không có trường loại khớp `partnerType` tự do của khuôn |
| Đo ngưỡng SỐNG (a) thế nào | vết `buoc.xong` ghi người được giao lúc bấm | bước có thể bị giao lại sau khi xong; so với `assigneeId` hiện tại là lệch |
| Bước trong thẻ Tasks của ai | luôn của người đăng nhập | thẻ Tasks hôm nay vốn luôn là «của tôi» |

## 2. Dữ liệu và vết

**Không migration.** `OnboardingPlan.ownerId`, `OnboardingStep.assigneeId` (có chỉ
mục) và `OnboardingStep.dueAt` (bắt buộc) đã có.

**Vết `buoc.xong` thêm một trường** trong `packages/validation/src/onboarding-activity.ts`:

- `giaoLucXong: ma.nullable().optional()` — id người đang được giao bước ở giây bấm
  xong; `null` khi bước chưa giao. Tuỳ chọn trong schema vì vết lượt 1 không có
  trường này; builder `vet.buocXong` BẮT BUỘC nhận nó, nên mọi vết mới đều có.
- Đường đo ngưỡng SỐNG (a) — một câu truy vấn chỉ đọc bảng vết, ghi trong
  `contract.md` mục «Đường đo»: trong các vết `buoc.xong` của kỳ, tỉ lệ vết có
  `createdById = meta.giaoLucXong` trên các vết có người được giao; vết của bước
  chưa giao đếm riêng (`khong_giao`), không vào mẫu số. Vết thiếu khoá
  `giaoLucXong` (lượt 1) không vào số nào.

## 3. API

Mọi thủ tục đọc mới nằm ở tệp mới `apps/api/src/onboarding/onboarding-noi.ts`
(«nối» kế hoạch sang các bề mặt khác) — `onboarding.service.ts` đã 810 dòng, quá
trần 800 của kho, không nhận thêm. Hằng số mới vào `ONBOARDING` ở
`onboarding-config.ts`.

| Thủ tục | Vào | Ra | Ghi chú |
| --- | --- | --- | --- |
| `companies.byId` (sửa) | như cũ | thêm `soKeHoach: number`, `xuongCoKhuon: boolean` | một `_count` và một `count` khuôn chưa lưu trữ |
| `onboarding.plansOfCompany` (mới) | `{ companyId }` | `PlanRow[]` + `ownerName` | dựng bằng CHÍNH `dungHang` của danh mục; đang chạy trước, đã đóng sau, mỗi nhóm theo `startedAt` mới nhất |
| `onboarding.plansOfContact` (mới) | `{ contactId }` | `{ planId, companyName, bac }[]` | chỉ kế hoạch đang chạy; `bac` = `bacCaoNhat` của ghi danh |
| `dashboard.summary` (sửa) | như cũ | thêm `mySteps` | bước chưa xong, của kế hoạch đang chạy, `assigneeId` = người đăng nhập, `dueAt` ≤ hôm nay + `ONBOARDING.viecCuaToi.cuaSoNgay` (3), tối đa `ONBOARDING.viecCuaToi.tran` (10), theo hạn tăng dần; không theo nút của tôi/mọi người |
| `onboarding.listPlans` · `bangCot` · `manDanhMuc` (sửa) | thêm `nguoiGiao: string[]` | đếm bộ lọc thêm `nguoiGiao` | lọc: kế hoạch có ≥1 bước CHƯA XONG giao cho một người trong danh sách |
| `bangCot` (sửa) | `cachChia` thêm `nguoi-giao` | cột theo người | xem §5 |
| `onboarding.transferPreview` (mới) | `{ fromUserId }` | `{ keHoach, buoc }` | chỉ quản trị |
| `onboarding.transferWork` (mới) | `{ fromUserId, toUserId }` | `{ keHoach, buoc }` | chỉ quản trị; một transaction |

**`mySteps` phần tử:** `{ stepId, nhan, dueAt ("YYYY-MM-DD"), planId, company: { id, name } }`.
«Quá hạn» tính ở máy khách bằng `quaHan` theo ngày lịch của lượt 1 (`apps/app/lib/qua-han.ts`).

**Chuyển giao** — trong `OnboardingGhi` (tệp `onboarding-ghi.ts`, 358 dòng):

1. `yeuCauQuanTri(actingUserId)` — không phải quản trị → 403 (`ONBOARDING.thongDiep.canQuyenQuanTri`).
2. `toUserId === fromUserId` → 400 `ONBOARDING.thongDiep.chuyenChoChinhMinh`.
3. `thanhVien(tx, toUserId)` — không phải thành viên → 400 như lượt 1.
4. Mọi kế hoạch đang chạy có `ownerId = from` → đổi sang `to`, mỗi kế hoạch một vết
   `keHoach.doiCamTrich` (mang `companyId`, theo luật lượt 1).
5. Mọi bước chưa xong của kế hoạch đang chạy có `assigneeId = from` → đổi sang `to`,
   mỗi bước một vết `buoc.giao` (`tu = from`, `den = to`).
6. Bước đã xong và kế hoạch đã đóng không đổi. Không có gì để đổi → trả `{0, 0}`,
   không ghi vết. Lỗi ở bất kỳ dòng nào → cả transaction cuộn lại.

`transferPreview` đếm đúng hai tập ở bước 4–5 — cùng một hàm dựng `where`, để số
hộp thoại nêu và số thật sự đổi không thể lệch.

## 4. Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ — bộ phận: tổng quan → thẻ Tasks có dòng «Đào tạo nền tảng · One Mount» hạn hôm nay → tích → dòng rời thẻ, vết ghi tên họ (điểm ra: tổng quan).
- Suôn sẻ — quan hệ đối tác: sheet Công ty → tab «30 ngày đầu (1)» → bấm dòng → sheet kế hoạch chồng lên (điểm ra: sheet kế hoạch).
- Suôn sẻ — quản trị: Cài đặt › Thành viên → ⋯ của người nghỉ → «Chuyển việc 30 ngày…» → chọn người nhận → xác nhận → toast «Đã chuyển 2 kế hoạch và 5 bước cho Tuấn Đỗ».
- Biên: xưởng không có khuôn và công ty không có kế hoạch → không có tab; người được giao không có bước nào tới hạn → thẻ Tasks như hôm nay; người đi không có việc → hộp thoại nêu 0 và khoá nút.
- Lỗi & quay lại: tích xong trên kế hoạch vừa bị đóng → toast lỗi 409 của lượt 1, dòng giữ nguyên; tab lỗi tải → «Không tải được» + nút thử lại; chuyển giao lỗi → hộp thoại giữ mở, hiện lỗi, không đổi dòng nào.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Tab «30 ngày đầu» của sheet Công ty | cho biết đối tác có kế hoạch nào, đang ở đâu | sheet Công ty / sheet kế hoạch, hộp thoại tạo kế hoạch |
| Mục «30 ngày đầu» ở sheet Cá nhân | cho biết môi giới đang trong phễu nào | sheet Cá nhân / sheet kế hoạch |
| Thẻ Tasks của tổng quan | liệt việc tôi phải làm hôm nay | tổng quan / sheet kế hoạch, sheet công ty |
| Danh mục — lọc và cột theo người được giao | cho quản lý thấy ai đang ôm việc gì | danh mục / sheet kế hoạch |
| Hộp thoại «Chuyển việc 30 ngày» | chuyển mọi việc đang dở của một người sang người khác | Cài đặt › Thành viên / đóng về bảng |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-congty-khongtab | sheet Công ty | không có tab «30 ngày đầu» (xưởng 0 khuôn, công ty 0 kế hoạch) | — |
| ST-congty-dangtai | tab 30 ngày đầu | khung chờ ba dòng | chờ |
| ST-congty-rong | tab 30 ngày đầu | «Chưa có kế hoạch 30 ngày cho công ty này» + nút «Tạo kế hoạch» | tạo kế hoạch, công ty điền sẵn |
| ST-congty-codulieu | tab 30 ngày đầu | bảng Kế hoạch · Ngày · Bước · Đang tắc ở · Cầm trịch; đang chạy trước; đã đóng mang nhãn «Đã đóng»; hàng «Tạo kế hoạch» cuối bảng | bấm dòng mở sheet kế hoạch |
| ST-congty-loi | tab 30 ngày đầu | «Không tải được kế hoạch» + «Thử lại» | thử lại |
| ST-canhan-coghidanh | sheet Cá nhân | mục «30 ngày đầu»: «One Mount · đã đạt Có tài khoản» mỗi kế hoạch một dòng | bấm dòng mở sheet kế hoạch |
| ST-canhan-khongghidanh | sheet Cá nhân | không có mục | — |
| ST-tongquan-cobuoc | thẻ Tasks | việc và bước xếp chung theo hạn; bước mang «Công ty · Kế hoạch 30 ngày»; quá hạn tô đỏ, sắp hạn trung tính | tích xong, bấm tên mở sheet |
| ST-tongquan-saphan | thẻ Tasks | mô tả «Không có gì quá hạn · 2 bước sắp hạn» | tích xong |
| ST-tongquan-dangghi | thẻ Tasks | ô tích khoá trong lúc gửi | chờ |
| ST-danhmuc-locnguoigiao | danh mục | ô lọc «Người được giao» có số đếm; lọc không khớp → rỗng + «Xoá bộ lọc» | xoá lọc |
| ST-danhmuc-cotnguoigiao | bảng cột | mỗi người được giao một cột, cột «Chưa giao» và «Xong» ở cuối; một kế hoạch có thể ở nhiều cột | bấm thẻ mở sheet |
| ST-chuyen-hoi | hộp thoại chuyển | «Hương Lê đang cầm trịch 2 kế hoạch và có 5 bước chưa xong» + chọn người nhận | chọn, xác nhận |
| ST-chuyen-khongviec | hộp thoại chuyển | «Hương Lê không cầm trịch kế hoạch nào đang chạy và không có bước nào chưa xong»; nút khoá | đóng |
| ST-chuyen-loi | hộp thoại chuyển | lỗi nêu ngay trong hộp thoại, hộp giữ mở | sửa lựa chọn hoặc đóng |
| ST-congty-lechsua | sheet Công ty | ô chọn trường tuỳ biến rỗng hiện «—», menu có «Không chọn»; chủ sở hữu rỗng hiện «—»; Open pipeline «—» khi không thoả thuận đang mở nào có giá | — |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Tab «30 ngày đầu» tải danh sách chỉ khi mở tab; rê chuột trên nhãn tab nạp sẵn như các tab khác.
- Tích xong trên thẻ Tasks: gọi `onboarding.setStepDone`, thành công thì làm mới `dashboard.summary` và `useCrmCache().plan(planId)`.
- Hộp thoại chuyển giao: danh sách người nhận là thành viên trừ người đi; Enter xác nhận chỉ khi nút không khoá; focus trở về nút ⋯ khi đóng.
- Khổ 375: bảng tab «30 ngày đầu» giữ cột Kế hoạch và Bước, ẩn ba cột còn lại.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `DetailSheet` tab + `SimpleTable` + `AddRow` | dùng | cùng họ với tab Cá nhân / Thoả thuận của sheet Công ty |
| `DetailSheetSection` | dùng | mục mới của sheet Cá nhân đi cùng khuôn các mục đang có |
| Thẻ Tasks (`dashboard-summary.tsx`) | mở rộng | thêm loại dòng bước vào bảng sẵn có |
| `TaoKeHoach` | mở rộng | nhận công ty cố định, không tạo hộp thoại thứ hai |
| Ô lọc danh mục (`danh-muc-cong-cu.tsx`) | mở rộng | thêm một facet |
| `InlineSelectField` (`apps/app/components/crm/inline-field.tsx`) | mở rộng | nhận giá trị «rỗng» để hiện «—» thay nhãn lựa chọn |
| Hộp thoại chuyển giao | ghép | `Dialog` + `Select` của `/packages/ui`, như hộp thoại phát chìa của màn Thành viên |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: mọi bề mặt mới là một danh sách trên bản ghi hay màn đang có, bấm một dòng mở chi tiết chồng lên — đúng khuôn record sheet của kho (related list của Salesforce, thẻ liên kết của HubSpot); luồng hiển nhiên, không tra thêm.
<!-- UX-SPEC-TEMPLATE>>> -->

## 5. Chi tiết từng bề mặt

**Tab «30 ngày đầu» — `apps/app/components/crm/record-sheet/company-plans.tsx` (mới).**
Tab đứng sau «Thoả thuận», `count = company.soKeHoach`, chỉ có mặt khi
`soKeHoach > 0 || xuongCoKhuon`. Bảng năm cột như danh mục; dòng đã đóng mang nhãn
«Đã đóng» ở cột Kế hoạch và không tô «đang tắc». Bấm dòng → `openRecord("plan", id)`.
Hàng «Tạo kế hoạch» mở `TaoKeHoach` với `congTyCoDinh = { id, name }`: ô công ty
hiện tên, không chọn được.

**Mục «30 ngày đầu» ở sheet Cá nhân — trong `ContactOverview`.** Chỉ hiện khi
`plansOfContact` trả ≥1 dòng. Mỗi dòng: tên công ty (`translate="no"`) · «đã đạt
<bậc>» theo nhãn bậc của lượt 1; bấm → `openRecord("plan", planId)`.

**Thẻ Tasks.** Hàng việc và hàng bước trộn, sắp theo hạn tăng dần (việc không hạn
cuối cùng như hôm nay). Hàng bước: ô tích → `setStepDone`; dòng chính = nhãn bước;
dòng phụ = `RecordLink kind="company"` tên công ty · «Kế hoạch 30 ngày» là
`RecordLink kind="plan"`; cột hạn: quá hạn → `StatusIndicator tone="error"`, sắp
hạn → trung tính. Mô tả thẻ: 0 quá hạn và 0 sắp hạn → «Xong hết»; có quá hạn →
«N quá hạn» (đếm cả việc và bước); chỉ có sắp hạn → «Không có gì quá hạn · M bước
sắp hạn».

**Danh mục.** Facet `nguoiGiao` cạnh `boPhan` và `nguoiCam`. Cách chia `nguoi-giao`:
một kế hoạch vào cột của MỖI người có bước chưa xong giao cho họ; kế hoạch còn bước
chưa xong nhưng không bước nào được giao → cột «Chưa giao»; kế hoạch hết bước chưa
xong → cột «Xong» (`COT_XONG` sẵn có). Cột người sắp theo tên.

**Chuyển giao — `apps/app/app/(app)/[slug]/settings/members/chuyen-viec-dialog.tsx` (mới).**
Mục menu có mặt khi `onboarding.access` trả `canManage` — cùng luật với thủ tục.
Mở hộp → gọi `transferPreview`; cả hai số = 0 → câu «không có việc» và nút khoá.
Xác nhận → `transferWork` → toast «Đã chuyển N kế hoạch và M bước cho …» → làm mới
danh mục và kế hoạch đang mở.

**Ba lệch nhỏ.** `record-fields.tsx`: nhãn cứng «None» → khoá chữ «Không chọn / None»
sẵn có của `crmMessages`. `InlineSelectField` nhận `emptyValue`: giá trị bằng nó thì
ô thu gọn hiện `EmptyCellValue`, menu vẫn liệt nhãn «Chưa giao». Open pipeline:
không thoả thuận đang mở nào có `amountCents` → `EmptyCellValue`.

## 6. Kiểm thử

Theo nếp lượt 1: mỗi phép đo có cặp hai chiều trên cùng fixture và một đột biến có
tên. Tầng API đọc lại từ DB; tầng màn chạy component thật trong jsdom với bản giả
tRPC ghi tên thủ tục và input; một bài chụp màn hình cho mặt người nhìn.

## 7. Ngoài phạm vi

- Đổi dải số chung của sheet Công ty — trình người duyệt quyết riêng.
- Quyền xem-sửa theo bộ phận — chờ ô phân quyền.
- Nhắc trước hạn, cảnh báo im lặng — lượt 3.
- Tự chuyển giao khi gỡ thành viên; chuyển giao công ty · cá nhân · thoả thuận.
- Chế độ «mọi người» cho bước trong thẻ Tasks; giao lại tại chỗ từ thẻ Tasks.
- Tab Tác nhân trên sheet kế hoạch.

## 8. Rủi ro và giả định

- **Người đã bị gỡ trước khi chuyển giao** không còn dòng trong màn Thành viên, nên
  lượt này không chuyển được việc của họ. Kế hoạch vẫn mở được và giao lại từng bước
  bằng tay (lượt 1). Ghi vào Notes của hợp đồng như giới hạn đã biết.
- Giả định 1 (bộ phận mở CRM hằng ngày) và giả định 2 (byId không chậm) chưa thử;
  mang sang Coverage của hợp đồng.
- Một kế hoạch ở nhiều cột làm tổng thẻ bảng cột lớn hơn số kế hoạch — cố ý, có phép đo.
