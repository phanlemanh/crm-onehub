# Cây tổ chức có người — thiết kế lượt 1

Hồ sơ: `_acceptance/cau-truc-to-chuc` · hạng T3 · nhánh `feat/cay-to-chuc-co-nguoi`.
Nguồn vào: `opportunity.md` đã qua Cổng Đáng (2026-09-24, build, disposition keep),
`docs/plan/lo-trinh-okr.md` §5 lượt 1, `CONTEXT.md` (Bộ phận, Phòng ban, Đơn vị,
Trưởng đơn vị — PR #110), bản mẫu `/proto/cau-truc-to-chuc` (bảy trạng thái).

## Vấn đề

Hôm nay CRM chỉ có một danh sách phẳng mà màn Điều phối 30 ngày gọi là «bộ phận».
Không ai thuộc về đâu, không đơn vị nào có trưởng, và không có cấp trên. OKR (lượt
2–5) cần biết mỗi người ở phòng ban nào, trưởng là ai, quản lý trực tiếp là ai —
và cần cây đó là cây chung của cả CRM, không phải cây riêng của khu OKR.

## Hình dạng

Hai cấp cố định dưới gốc OneHub: **bộ phận** chứa **phòng ban**. Danh sách phẳng
hiện có chính là cấp phòng ban — dữ liệu giữ nguyên, bước kế hoạch 30 ngày vẫn
giao cho phòng ban, lượt này chỉ thêm cấp trên, thêm người, thêm trưởng.

### Dữ liệu (một `migration`, chỉ thêm, không chuyển dữ liệu)

| Bảng | Cột mới | Luật |
|---|---|---|
| `Division` (mới) | `name`, `position`, `headUserId?`, `archivedAt?` | Tên không trùng trong các bộ phận chưa lưu trữ, so không phân biệt hoa thường |
| `Department` (có sẵn) | `divisionId?`, `headUserId?` | `divisionId` rỗng = «chưa xếp vào bộ phận» — mọi phòng ban cũ bắt đầu ở đây. Xoá bộ phận bị chặn khi còn phòng ban (`Restrict`) |
| `OrgPlacement` (mới) | `userId` (khoá), `primaryDepartmentId?`, `managerUserId?` | Một hàng một người: đúng một phòng ban chính, một ghi đè quản lý. `primaryDepartmentId` `Restrict` — không xoá hẳn được phòng ban còn người |
| `OrgSecondaryDepartment` (mới) | (`userId`, `departmentId`) | Phòng ban phụ, nhiều; không trùng phòng ban chính (dịch vụ chặn) |

Để phòng ban chính ở bảng riêng một-hàng-một-người thay vì cờ `isPrimary` trên
bảng nối: «đúng một phòng ban chính» thành khoá chính, không cần chỉ mục có điều
kiện mà Prisma không khai được trong `schema.prisma`.

Trưởng là **ô trên đơn vị**, không phải vai workspace (`CONTEXT.md`, Trưởng đơn
vị). Làm trưởng không cho quyền quản trị nào.

### Người đã rời workspace

Mọi phép đọc lọc theo hàng `member` còn hiệu lực — không sửa giao dịch gỡ thành
viên của `workspace`. Người đã gỡ biến khỏi cây và khỏi mọi phép đếm; đơn vị họ làm
trưởng hiện «Chưa có trưởng» và tính là chưa có trưởng; ghi đè quản lý trỏ tới họ
bị bỏ qua, quản lý trực tiếp rơi về phép suy. Cho phép vào lại thì hàng cũ hiện lại
— dữ liệu không mất, chỉ ẩn.

### Quản lý trực tiếp — một hàm, một chỗ

`quanLyTrucTiep(người)` = ghi đè (nếu người đó còn hiệu lực và khác chính mình) →
trưởng phòng ban chính (khác chính mình) → trưởng bộ phận của phòng ban chính (khác
chính mình) → không có. Không có bảng lưu kết quả suy: đổi trưởng là mọi người dưới
quyền đổi quản lý theo ngay.

### Quyền

Vị từ mới `canManageOrganization(role)` trong `@crm/auth` (chủ và quản trị, như
`canManageOnboarding`). Mọi thủ tục ghi của cây kiểm nó ở dịch vụ; màn dùng
`org.access` để khoá nút — nút và lỗi 403 không thể nói khác nhau (`docs/api.md`).
Thành viên thường đọc được cả cây (OKR và bộ lọc cần), nhưng màn Tổ chức với họ là
chỉ đọc.

### API

Mô-đun mới `apps/api/src/to-chuc`, router `org`:
`access` · `tree` (bộ phận → phòng ban → người, trưởng, quản lý trực tiếp, dòng độ
phủ, danh sách người chưa có phòng ban chính) · `createDivision` · `updateDivision` ·
`reorderDivisions` · `archiveDivision` · `restoreDivision` · `purgeDivision` ·
`moveDepartment` (sang bộ phận khác hoặc về «chưa xếp», kèm vị trí) · `setHead`
(đơn vị, người hoặc rỗng) · `setPlacement` (người, phòng ban chính, phòng ban phụ, ghi
đè quản lý) · `previewImport` · `applyImport`.

Thủ tục phòng ban có sẵn (`onboarding.createDepartment` …) giữ nguyên chỗ, thêm
`divisionId` tuỳ chọn khi tạo, và `archiveDepartment` từ chối khi phòng ban còn là
phòng ban chính của ai. Hằng số (trần dòng nhập, trần byte) ở
`apps/api/src/to-chuc/to-chuc-config.ts`.

### Nhập hàng loạt

Bốn cột theo thứ tự: `email · phòng ban · bộ phận · trưởng`. Dán thẳng từ bảng tính
(tab) hoặc tải tệp `.csv` (dấu phẩy) — trình duyệt đọc tệp thành chữ, máy chủ phân
tích chữ. Không có thư viện đọc `.xlsx` trong kho, nên `.xlsx` để sau. Dòng đầu là
tiêu đề thì bỏ qua (nhận ra bằng ô email không có `@`).

Một hàm phân tích dùng cho cả xem trước và ghi. Ghi gửi lại **chữ gốc**, không gửi
kết quả xem trước, nên không có đường nào đưa dữ liệu chưa kiểm vào cơ sở dữ liệu.

- `email`: phải là thành viên còn hiệu lực (không phân biệt hoa thường). Không mời
  người mới — mời là việc của màn Thành viên.
- `phòng ban`: khớp theo tên với phòng ban chưa lưu trữ; chưa có thì tạo.
- `bộ phận`: khớp hoặc tạo như trên. Rỗng = phòng ban giữ bộ phận đang có (mới thì
  «chưa xếp»). Phòng ban đã thuộc bộ phận khác → dòng hỏng, không lặng lẽ chuyển.
- `trưởng`: rỗng · `phòng ban` · `bộ phận` (không phân biệt hoa thường, có hoặc không
  dấu). Người trên dòng thành trưởng của đơn vị đó.
- Dòng hỏng, mỗi loại một câu lỗi ghim: email không phải thành viên · email lặp trong
  lô · thiếu email hoặc thiếu phòng ban · phòng ban thuộc bộ phận khác · một phòng ban
  mang hai bộ phận trong lô · giá trị «trưởng» lạ · hai người cùng làm trưởng một đơn
  vị trong lô · quá 1000 dòng (cả lô bị từ chối).
- Ghi: chỉ dòng hợp lệ, trong một giao dịch; nút nói rõ «Ghi 42 dòng · bỏ 3 dòng
  hỏng». Dòng hợp lệ đặt phòng ban chính của người (thay phòng ban chính cũ; phòng
  ban phụ không đổi) và đặt trưởng. Nhập lại cùng tệp không tạo đơn vị trùng.

### Dòng độ phủ — đường đo của ngưỡng

Đầu màn Tổ chức: «**38/40 thành viên có phòng ban chính · 1 phòng ban chưa có
trưởng**». Tính ở máy chủ trong `org.tree`: mẫu số = thành viên còn hiệu lực; phòng
ban tính = phòng ban chưa lưu trữ; «có trưởng» = trưởng là thành viên còn hiệu lực.
Trưởng bộ phận cũng cần một phòng ban chính — không thì họ nằm ở «Chưa có phòng ban» như mọi người khác (bản mẫu lộ ra, chờ Cổng Phạm vi gạch).
Đây là con số Cổng Giá trị đọc ngày 26/10 (ngưỡng SỐNG ≥ 90% và mọi phòng ban có
trưởng).

### Đổi nhãn ở khu khác

- Điều phối 30 ngày: mọi chữ «bộ phận» đang chỉ danh sách phẳng thành «phòng ban»
  (cột, bộ lọc «Phòng ban đang cầm», chia cột, khuôn kế hoạch). Thêm bộ lọc **«Bộ
  phận»**: giữ kế hoạch mà phòng ban đang cầm thuộc bộ phận đã chọn.
- Cài đặt › Điều phối 30 ngày thôi giữ danh sách bộ phận/phòng ban; chỗ đó thành một
  dòng trỏ sang Cài đặt › Tổ chức. Một nơi tạo phòng ban, không hai.
- Sheet kế hoạch 30 ngày: ô «Mục tiêu» (đang hiện «30 ngày») thành **«Thời lượng»**,
  tiếng Anh «Target» thành «Duration» — để «Mục tiêu» chỉ còn nghĩa của OKR.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Cài đặt › Tổ chức → «Thêm bộ phận» → trong bộ phận, «Thêm phòng ban» → bấm một người ở «Chưa có phòng ban» → chọn phòng ban chính → menu phòng ban «Đặt trưởng» (điểm ra: dòng độ phủ lên 40/40 · 0 phòng ban chưa có trưởng)
- Suôn sẻ (nhập): «Nhập từ bảng tính» → dán hoặc chọn tệp `.csv` → «Xem trước» → bảng dòng, dòng hỏng có câu lỗi → «Ghi N dòng» → cây cập nhật, hộp thoại đóng, thông báo «Đã ghi N dòng»
- Biên: cây rỗng; dữ liệu cũ — mọi phòng ban nằm ở «Chưa xếp vào bộ phận»; phòng ban không trưởng; trưởng đã rời workspace; thành viên thường mở màn — chỉ đọc
- Lỗi & quay lại: lưu trữ phòng ban còn người → thông báo lỗi nêu số người, cây không đổi; tên trùng → lỗi ngay dưới ô tên, ô giữ chữ đã gõ; nhập toàn dòng hỏng → nút ghi khoá, người sửa bảng tính rồi dán lại trong cùng hộp thoại

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cài đặt › Tổ chức | Xem và sửa ai ở đâu, ai làm trưởng | Thanh bên Cài đặt / hộp thoại người, hộp thoại nhập |
| Hộp thoại «Vị trí trong tổ chức» | Đặt phòng ban chính, phụ, quản lý của một người | Bấm một người trong cây / về cây |
| Hộp thoại «Nhập từ bảng tính» | Xem trước rồi ghi một lô gán người | Nút ở đầu màn / về cây |
| Màn Điều phối 30 ngày | Lọc kế hoạch theo bộ phận và phòng ban | Không đổi / không đổi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-tochuc-dangtai | Tổ chức | Khung dòng xám thay cây, dòng độ phủ ẩn | Chờ |
| ST-tochuc-rong | Tổ chức | «Chưa có bộ phận nào. Thêm bộ phận đầu tiên, rồi thêm phòng ban vào nó.» + nút «Thêm bộ phận» | Thêm bộ phận |
| ST-tochuc-chuaxep | Tổ chức | Nhóm «Chưa xếp vào bộ phận» dưới cây, chứa phòng ban cũ; mỗi dòng có «Chuyển vào bộ phận» | Chuyển phòng ban vào bộ phận |
| ST-tochuc-cay | Tổ chức | Dòng độ phủ + cây bộ phận → phòng ban, số người, huy hiệu trưởng | Mở rộng, sửa, gán |
| ST-tochuc-nguoi | Tổ chức | Phòng ban mở ra danh sách người; người phụ có nhãn «phụ» | Bấm người → hộp thoại vị trí |
| ST-tochuc-chuacophongban | Tổ chức | Nhóm «Chưa có phòng ban» liệt kê người thiếu phòng ban chính | Bấm người → gán |
| ST-tochuc-chuacotruong | Tổ chức | Phòng ban không trưởng hiện «Chưa có trưởng» thay tên | Menu → Đặt trưởng |
| ST-tochuc-chidoc | Tổ chức | Cây và dòng độ phủ, không nút thêm, không menu, không nhập | Chỉ xem |
| ST-tochuc-loi | Tổ chức | «Không tải được cây tổ chức.» + «Thử lại» | Thử lại |
| ST-tochuc-luutru | Tổ chức | Mục «Đã lưu trữ» cuối màn: bộ phận, phòng ban đã lưu trữ, nút «Khôi phục», «Xoá hẳn» | Khôi phục / xoá hẳn |
| ST-vitri-mo | Hộp thoại vị trí | Chọn phòng ban chính (gom theo bộ phận), phòng ban phụ, «Quản lý trực tiếp: <tên> (theo trưởng phòng ban)» + «Chọn người khác» | Lưu / huỷ |
| ST-vitri-ghide | Hộp thoại vị trí | «Quản lý trực tiếp: <tên> (đã chọn tay)» + «Về theo trưởng phòng ban» | Lưu / huỷ |
| ST-nhap-trong | Hộp thoại nhập | Ô dán, nút chọn tệp `.csv`, dòng mẫu bốn cột | Dán / chọn tệp |
| ST-nhap-xemtruoc | Hộp thoại nhập | Tóm tắt «42 hợp lệ · 3 hỏng · tạo 2 phòng ban, 1 bộ phận»; danh sách «Dòng N: <lỗi>» trên bảng; bảng dòng: email, phòng ban, bộ phận, trưởng, «Hợp lệ»/«Hỏng» | Ghi / sửa rồi xem lại |
| ST-nhap-honghet | Hộp thoại nhập | Mọi dòng hỏng, nút «Ghi» khoá, câu lỗi từng dòng | Sửa rồi xem lại |
| ST-nhap-dangghi | Hộp thoại nhập | Nút «Đang ghi…», khoá ô dán | Chờ |
| ST-dieuphoi-locbophan | Điều phối 30 ngày | Bộ lọc «Bộ phận» cạnh «Phòng ban đang cầm» | Chọn bộ phận |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Tên đơn vị: cắt khoảng trắng hai đầu, 1–80 ký tự; trùng tên cùng cấp (không phân biệt hoa thường, chỉ đơn vị chưa lưu trữ) báo lỗi dưới ô.
- Cây dùng nút thật (`button`) cho mở/đóng, có `aria-expanded`; Tab và Enter đi hết cây không cần chuột. Sắp đơn vị dùng `SortableList` sẵn có (kéo hoặc bàn phím).
- Tên người, tên đơn vị, email mang `translate="no"`. Ô tìm lọc cây theo tên người và tên đơn vị, không gọi máy chủ.
- Nhập: tối đa 1000 dòng; xem trước không ghi gì; ghi xong cập nhật cây qua `useCrmCache()`, thông báo đọc qua `aria-live`.
- Khổ hẹp (320–375): cây một cột, menu đơn vị thành nút «…»; bảng xem trước cuộn trong khung của nó, trang không tràn ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Collapsible`, `Badge`, `InputGroup`, `Empty`, `DropdownMenu`, `Dialog`, `Select`, `Table`, `Textarea` của `@crm/ui` | dùng | Bản mẫu đã dựng bằng đúng các thành phần này |
| `PersonAvatar` | dùng | Cùng hình người như sheet kế hoạch |
| `SortableList` | dùng | Đã dùng cho danh sách bộ phận cũ |
| Cây tổ chức (`cay-to-chuc.tsx`) | ghép | Ghép từ `Collapsible` như bản mẫu, không thêm thành phần mới vào `packages/ui` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: nấc (ii) — cây là danh sách chính, mọi sửa đổi mở hộp thoại chi tiết của đúng một người hoặc một đơn vị; bản mẫu bảy trạng thái đã đi hình này và Cổng Đáng ký trên nó. Không có khuôn thứ hai khả dĩ (sơ đồ tổ chức kéo/phóng to đã để sau lượt 1), nên không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài lượt này

Cấp «nhóm» dưới phòng ban · quyền theo đơn vị (lượt 2–3) · sơ đồ tổ chức (tĩnh
hoặc kéo/phóng to — bản mẫu giữ trạng thái sơ đồ tĩnh làm mẫu) · đọc `.xlsx` · nhập
tạo lời mời · nhập phòng ban phụ · chặn vòng quản lý (A quản lý B, B quản lý A) ·
nhật ký thay đổi cây · cột phòng ban trên bảng Thành viên · đồng bộ hệ thống nhân sự
(TC-07).

## Kiểm

Tích hợp API trên cơ sở dữ liệu kiểm của `bun run test` (`apps/api/test/to-chuc*.spec.ts`),
bài kiểm DOM cho màn (`apps/app/test/to-chuc.dom.tsx`, `dieu-phoi-nhan.dom.tsx`), một
phép đo Chrome thật cho màn Tổ chức ở năm khổ × hai tiếng (`rang/man-to-chuc.mjs`, có
cảnh cây), cổng thiết kế tĩnh trên các tệp giao diện chạm tới. GitHub Actions đang
tắt vì thanh toán: bằng chứng là năm lệnh chứng chạy trên máy, ghi rõ trong hồ sơ.
