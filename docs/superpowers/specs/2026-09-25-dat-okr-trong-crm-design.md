# Thiết kế — dat-okr-trong-crm (lượt 3 lộ trình OKR)

Ngày 2026-09-25. Nhánh `feat/dat-okr-trong-crm` tách từ `origin/onehub` `9a7f024c`.
Hồ sơ nghiệm thu: `_acceptance/dat-okr-trong-crm/`. Bản mẫu đã duyệt:
`/proto/ban-mau-okr` (hồ sơ `_acceptance/ban-mau-okr`, mục «Duyệt» 2026-09-24).

## 1. Mục đích và ranh giới

Người dùng làm được gì sau lượt này: quản trị mở chu kỳ năm và quý, khai cấu
hình chương trình; trưởng đơn vị đặt mục tiêu cho đơn vị mình ở bốn cấp (OneHub ·
bộ phận · phòng ban · cá nhân khi chương trình bật), gắn KR đủ sáu kiểu, căn
chỉnh vào mục tiêu hoặc KR cấp trên, công bố; phòng ban đã có bộ OKR quý 4 trong
bảng tính dán vào CRM, xem trước từng dòng rồi ghi; mọi sửa đổi để lại vết đọc
được trong sheet mục tiêu. Vai «chỉ OKR» làm được tất cả những việc trên với OKR
của mình mà vẫn không đọc được dữ liệu đối tác.

Ngoài lượt: cập nhật tuần và nhắc (lượt 4), toàn cảnh và biến thể `packages/ui`
(lượt 5), số tự đo (lượt 6), chấm và khép kỳ (lượt 7), mức hiển thị và mẫu (lượt 8).

## 2. Hình dữ liệu — khối liền cuối `schema.prisma`, migration chỉ thêm

Sáu bảng, tên bảng có tiền tố `okr`. Không cột nào thêm vào bảng có sẵn. Quan hệ
ngược chỉ đặt ở `Division`, `Department` (mục tiêu của đơn vị) và `User` (người phụ
trách mục tiêu, người phụ trách KR, người tham gia); người ghi vết là chuỗi id
không quan hệ — vết phải sống lâu hơn tư cách thành viên.

| Bảng | Cột chính | Ghi chú |
| --- | --- | --- |
| `OkrCycle` (`okrCycle`) | `kind` (`nam`\|`quy`), `name`, `parentId` (quý → năm), `startsOn`/`endsOn` (`@db.Date`, ngày lịch Việt Nam), `phase` (`lap-ke-hoach`\|`dang-chay`\|`cham-diem`\|`da-dong`), `breakStartsOn`/`breakEndsOn` (khoảng nghỉ Tết, tuỳ chọn), `updateWeekday` (1–7, mặc định 1) | Quý phải nằm trong năm cha, không chồng lấn quý khác cùng năm. Pha chỉ đi tới; lùi pha là lượt 7 |
| `OkrProgramConfig` (`okrProgramConfig`) | `version` (tăng dần, duy nhất), `objectiveCap`, `krCap`, `capMode` (`canh-bao`\|`chan`), `scoreScale` (`0-1`\|`0-100`), `weightsOn`, `personalOn`, `createdById`, `createdAt` | Chỉ thêm dòng; dòng `version` lớn nhất là cấu hình đang áp. Không có dòng nào → mặc định trong `okr-config.ts` |
| `OkrObjective` (`okrObjective`) | `cycleId`, `level` (`onehub`\|`bo-phan`\|`phong-ban`\|`ca-nhan`), `divisionId?`, `departmentId?`, `personUserId?`, `ownerUserId`, `kind` (`cam-ket`\|`tham-vong`), `status` (`nhap`\|`cong-bo`\|`da-bo`), `title`, `whyNow`, `publishedAt?`, `droppedAt?`, `position` | Đúng một trong ba ô đơn vị theo `level`; service kiểm, không ràng buộc SQL |
| `OkrParticipant` (`okrParticipant`) | `objectiveId`, `userId` | Khoá kép |
| `OkrAlignment` (`okrAlignment`) | `objectiveId` (mục tiêu góp), `targetObjectiveId?` hoặc `targetKeyResultId?` | Nhiều–nhiều; duy nhất theo cặp; đích phải ở cấp trên và ở cùng chu kỳ hoặc chu kỳ năm cha |
| `OkrKeyResult` (`okrKeyResult`) | `objectiveId`, `title`, `kind` (sáu kiểu), `ownerUserId`, `startValue`, `targetValue`, `currentValue` (`Decimal(18,4)`), `unit`, `dueOn?`, `weight` (mặc định 1), `source` (`tay`; chừa `crm`/`api` cho lượt 6), `startLockedAt?`, `position` | Khởi điểm khoá khi công bố |
| `OkrTrail` (`okrTrail`) | `at`, `actorUserId` (chuỗi), `cycleId?`, `objectiveId?`, `keyResultId?`, `action`, `before` (`Json?`), `after` (`Json?`), `note?` | Bảng riêng, không qua `Activity`. `before`/`after` parse bằng khuôn ở `packages/validation` |

Các cột danh mục (`kind`, `phase`, `level`, `status`, `capMode`, `scoreScale`,
`action`) là `String`, khuôn Zod ở `packages/validation/src/okr-*.ts` là nguồn
duy nhất của giá trị hợp lệ — service parse ở biên, không có enum Prisma. Lý do:
lượt 6 thêm nguồn `crm`/`api`, lượt 7 thêm hành động vết; thêm một giá trị là sửa
một khuôn, không phải một migration.

Sáu kiểu KR (`okr-kr.ts`):

| Kiểu | Chữ trên màn | Khởi điểm | Đích | Tiến độ |
| --- | --- | --- | --- | --- |
| `tang-toi` | Tăng tới | bắt buộc | > khởi điểm | (hiện − khởi) / (đích − khởi) |
| `giam-xuong` | Giảm xuống | bắt buộc | < khởi điểm | (khởi − hiện) / (khởi − đích) |
| `giu-tren` | Giữ trên | không | bắt buộc | 100 % khi hiện ≥ đích, 0 % khi không |
| `giu-duoi` | Giữ dưới | không | bắt buộc | 100 % khi hiện ≤ đích |
| `moc` | Mốc | 0 | 1 | Xong / Chưa xong |
| `phan-tram` | Phần trăm | 0 | 100 | giá trị hiện tại (0–100) |

Đây là danh mục cố định trong mã (tiền lệ: Perdoo, Weekdone dùng năm kiểu đầu), chốt
tại Cổng Phạm vi 2026-09-25. Đơn vị đo là chữ tự do (≤ 24 ký tự), nên KR tiền là «tăng
tới» với đơn vị tiền — không có kiểu tiền riêng.
Thêm kiểu là một vòng nhỏ có hợp đồng riêng.

Khuôn dữ liệu (`packages/validation/src`): `okr-chu-ky.ts` (loại, pha, khuôn tạo),
`okr-muc-tieu.ts` (cấp, loại, trạng thái, khuôn tạo/sửa), `okr-kr.ts` (sáu kiểu,
ràng buộc theo kiểu, hàm `tienDoKr`, `tinhTrang`), `okr-vet.ts` (hành động, khuôn
`before`/`after`), `okr-chuong-trinh.ts` (cấu hình + mặc định). Mọi khuôn khai
subpath trong `packages/validation/package.json`.

## 3. API — module `apps/api/src/okr`, router `okr`, nhóm dữ liệu `okr`

`@Router({ alias: "okr" })` + `@UseMiddlewares(PhamViOkrMiddleware)`: vai «chỉ OKR»
đi qua theo luật của lượt 2; ba vai còn lại đi qua như mọi nhóm. Bài kiểm ma trận
của lượt 2 (`apps/api/test/vai-chi-okr.spec.ts`, hằng `ALIAS_CHO_PHEP`) thêm `okr`
— đó là «sửa danh sách có chủ ý» mà `docs/api.md` đòi; hồ sơ `vai-chi-okr` ghim lại
sau đó.

Tệp: `okr.module.ts` · `okr.router.ts` · `okr.contracts.ts` (Zod vào/ra, nhập từ
`@crm/validation/okr-*`) · `okr.service.ts` (Prisma) · `okr-access.service.ts`
(quyền theo bản ghi) · `okr-config.ts` (hằng và thông điệp) · `nhap.ts` (phân tích
lô) · `can-chinh.ts` (dựng cây căn chỉnh, hàm thuần) · `tien-do.ts` (tiến độ và kỳ
vọng theo ngày Việt Nam, hàm thuần).

Thủ tục:

| Thủ tục | Ai | Làm gì |
| --- | --- | --- |
| `okr.access` | mọi thành viên | `{ canManageProgram, headOf: { divisions[], departments[] } }` — để màn biết bật nút gì |
| `okr.cycles` | mọi thành viên | mọi chu kỳ, năm chứa quý, kèm pha; `current` = quý `dang-chay` chứa ngày hôm nay (giờ Việt Nam), không có thì quý gần nhất |
| `okr.createCycle` · `okr.setCyclePhase` | quản trị (`canManageSettings`) | tạo năm/quý; đổi pha chỉ đi tới |
| `okr.program` · `okr.setProgram` | mọi thành viên đọc · quản trị ghi | cấu hình đang áp; ghi = thêm dòng phiên bản mới |
| `okr.byUnit({ cycleId, unit })` | mọi thành viên | mục tiêu của một đơn vị (`goc`\|`bp`\|`pb`\|`nguoi`) kèm KR, chỗ góp, `canEdit` |
| `okr.mine({ cycleId })` | mọi thành viên | mục tiêu tôi phụ trách hoặc tham gia, KR tôi phụ trách |
| `okr.alignmentTree({ cycleId })` | mọi thành viên | rừng căn chỉnh cả công ty + nhóm «chưa căn chỉnh»; mục tiêu góp nhiều chỗ lặp ở từng chỗ, đánh dấu `lapLai` |
| `okr.objective({ id })` | mọi thành viên | chi tiết: KR, chỗ góp, người tham gia, vết, `canEdit`, `canEditKr[]` |
| `okr.alignmentTargets({ objectiveId })` | mọi thành viên | ứng viên đích: mục tiêu và KR đã công bố ở cấp trên, cùng chu kỳ hoặc chu kỳ năm cha |
| `okr.createObjective` · `okr.updateObjective` · `okr.publishObjective` · `okr.dropObjective` | người sửa được đơn vị | xem mục 4 |
| `okr.addAlignment` · `okr.removeAlignment` | người sửa được mục tiêu góp | |
| `okr.createKeyResult` · `okr.updateKeyResult` · `okr.removeKeyResult` | người sửa được mục tiêu, hoặc người phụ trách KR (chỉ `update`) | |
| `okr.previewImport({ cycleId, unit, text })` · `okr.applyImport({ …, congBo })` | người sửa được đơn vị, hoặc quản trị workspace cho mọi đơn vị | xem mục 5 |

Mọi thủ tục ghi — mười một thủ tục nội dung (tạo/sửa/công bố/bỏ mục tiêu, tạo/sửa/xoá
KR, gắn/gỡ căn chỉnh, xem trước/ghi lô) cộng ba thủ tục quản trị (tạo chu kỳ, đổi pha,
ghi cấu hình): kiểm quyền trong service (`OkrAccessService`), kiểm pha chu kỳ cho
mười một thủ tục nội dung (`lap-ke-hoach` và `dang-chay` mới ghi được; `cham-diem`/
`da-dong` từ chối với câu ghim), ghi trong một `transaction` cùng đúng một dòng
`OkrTrail` — kể cả `setProgram` (hành động `cau-hinh`, `after` là cấu hình mới, không
có ô trỏ riêng) và `applyImport` (một dòng `nhap-bang-tinh` cho cả lô, CHỈ khi
`written > 0`, cộng một dòng `tao` cho mỗi mục tiêu). Lỗi là
`HttpException` của Nest với thông điệp ở `OKR.thongDiep` (`okr-config.ts`);
`DomainErrorMiddleware` chuyển mã.

Trần chương trình: `objectiveCap` đếm mục tiêu chưa bỏ của đơn vị trong chu kỳ,
`krCap` đếm KR của mục tiêu. `capMode = chan` → 400 với câu ghim; `canh-bao` →
ghi bình thường, đầu ra mang `canhBao: string | null` để màn hiện toast cảnh báo.

Cây đơn vị đọc từ `ToChucService.tree()` (`dungCay`) — `OkrModule` nhập `ToChucModule`
và dùng `TreeOutput` để suy trưởng và đơn vị con. Không dựng cây thứ hai.

## 4. Quyền theo bản ghi — `OkrAccessService`

Khuôn `AgentAccessService`: một service, mỗi thủ tục ghi gọi một `assert*` trả về
bản ghi đã tải, ném `ForbiddenException`/`NotFoundException`.

| Việc | Ai được |
| --- | --- |
| Mở chu kỳ, đổi pha, cấu hình chương trình | quản trị workspace (`owner`/`admin`) — quản trị chương trình. Không sửa nội dung OKR đơn vị thay người, trừ một việc: nhập từ bảng tính cho mọi đơn vị (chốt Cổng Phạm vi) |
| Mục tiêu cấp OneHub | quản trị workspace (cây tổ chức không có «trưởng OneHub») |
| Mục tiêu cấp bộ phận | trưởng bộ phận đó (`Division.headUserId`, còn hiệu lực theo `org.tree`) |
| Mục tiêu cấp phòng ban | trưởng phòng ban đó, hoặc trưởng bộ phận chứa nó |
| Mục tiêu cấp cá nhân | chính người đó, trưởng phòng ban chính của họ, trưởng bộ phận của phòng ban đó |
| KR | người phụ trách KR sửa KR của mình (tên, đích, hiện tại, đơn vị, hạn, trọng số); mọi người sửa được mục tiêu sửa được mọi KR của nó |
| Đọc | mọi thành viên có nhóm dữ liệu `okr` — cả bốn vai |

Trưởng là ô trên đơn vị, không phải vai: người vai «chỉ OKR» làm trưởng phòng ban
sửa được OKR phòng ban mình. Suy «trưởng còn hiệu lực» và «đơn vị con» từ
`org.tree` (trưởng phòng ban phải còn là người của phòng ban — luật của lượt 1).

Công bố: mục tiêu phải có ≥ 1 KR; ghi `publishedAt`, `status = cong-bo`, khoá khởi
điểm mọi KR (`startLockedAt`). Sau công bố: sửa `startValue` bị từ chối với câu
ghim `OKR.thongDiep.khoiDiemDaKhoa`; các ô khác sửa được, để vết. `dropObjective`
ghi `da-bo` + `droppedAt`, giữ nguyên KR và chỗ góp để đọc lại.

Căn chỉnh: đích phải ở cấp cao hơn (`onehub` < `bo-phan` < `phong-ban` < `ca-nhan`
theo thứ hạng), đã công bố, thuộc cùng chu kỳ hoặc chu kỳ năm cha; cùng cấp, thấp
hơn, chính nó, hoặc nháp → 400 câu ghim. Một mục tiêu góp được nhiều chỗ.

## 5. Nhập từ bảng tính — khuôn `to-chuc/nhap.ts`

Người sửa được đơn vị — hoặc quản trị workspace, cho mọi đơn vị — dán hoặc chọn `.csv`, chọn chu kỳ và đơn vị trong hộp thoại
(đơn vị đang xem là mặc định). Bảng phẳng, **mỗi dòng một KR**, bảy cột theo thứ tự:

`mục tiêu · KR · kiểu · khởi điểm · đích · đơn vị đo · email người phụ trách KR`

Dòng đầu là tiêu đề thì bỏ (nhận ra bằng `boDau` như `TO_CHUC.nhap.tenCotEmail`).
Cột kiểu nhận chữ: «tăng tới», «giảm xuống», «giữ trên», «giữ dưới», «mốc», «phần
trăm» (so không dấu). Các dòng cùng chữ mục tiêu (so `khoa`) gom thành một mục
tiêu; mục tiêu tạo ở trạng thái nháp, loại `cam-ket`, người phụ trách = trưởng
đơn vị (người nhập sửa sau trong sheet); KR theo dòng.

Câu lỗi ghim, một câu mỗi loại (`OKR.thongDiep.nhap`): thiếu mục tiêu · thiếu KR ·
kiểu lạ · email không phải thành viên · thiếu đích · đích không hợp với kiểu (tăng
mà đích ≤ khởi điểm, giảm mà đích ≥ khởi điểm, phần trăm ngoài 0–100) · mục tiêu
này đã có trong CRM cho đơn vị và chu kỳ này · lô quá `OKR.nhap.toiDaDong` dòng ·
lô làm vượt trần mục tiêu khi `capMode = chan`. Lỗi ở một dòng KR làm hỏng dòng đó;
mục tiêu chỉ ghi khi còn ≥ 1 dòng KR hợp lệ.

`previewImport` không ghi gì; `applyImport` phân tích lại chữ gốc trong `transaction`,
ghi các mục tiêu và KR hợp lệ, một dòng vết `nhap-bang-tinh` cho cả lô (đơn vị, chu
kỳ, số mục tiêu, số KR) chỉ khi `written > 0`, và một dòng `tao` cho mỗi mục tiêu.
Lô làm vượt trần mục tiêu khi `capMode = chan` bị từ chối cả lô với câu ghim, không
ghi gì và không để vết. `congBo: true` công bố
ngay các mục tiêu vừa ghi (cùng luật `publishObjective`). Nhập lại cùng lô: mọi
dòng rơi vào «mục tiêu này đã có» → 0 dòng ghi, cây không đổi.

## 6. Ứng dụng — khu `apps/app/app/(app)/[slug]/okr/`

Điều hướng: `MUC_RAIL` thêm `{ key: "okr", href: "/okr", match: "prefix" }` ngay
trước `settings` (đúng thứ tự bản mẫu: sau «30 ngày đầu»); nhãn `rail.okr` =
«Mục tiêu» / «Objectives» (chữ từ điển — «OKR» trần không qua bài kiểm nhãn có
dấu); icon `Target`. `SECTIONS` của `proxy.ts` thêm `/okr`; `RESERVED_SLUGS` thêm
`okr`. `pham-vi-man.ts`: rail của vai «chỉ OKR» thành Tổng quan · Mục tiêu · Cài
đặt; `/okr` không bị đưa về ngoài phạm vi. Tổng quan rút gọn của vai này đổi câu và
trỏ tới `/okr`.

Bốn tab là bốn đường con, thanh tab `Tabs variant="line"` dùng nguyên dạng:

| Đường | Tab | Lượt này |
| --- | --- | --- |
| `/okr` | Của tôi | `okr.mine`: mục tiêu tôi phụ trách, mục tiêu tôi tham gia, và mục tiêu có KR tôi phụ trách — KR của tôi đánh dấu; chỉ đọc, cùng khối mục tiêu; rỗng thì trỏ sang Theo đơn vị |
| `/okr/theo-don-vi` | Theo đơn vị | đầy đủ: cây đơn vị · danh sách · cây căn chỉnh · nút Thêm/Nhập cho trưởng · sheet mục tiêu |
| `/okr/toan-canh` | Toàn cảnh | `Empty` nói màn mở ở lượt 5 |
| (Cập nhật tuần) | — | không có tab; lượt 4 thêm |

Tham số URL (`SEARCH_PARAM.okr`): `kyOkr` (chu kỳ, mặc định `current`), `donOkr` (đơn vị,
cùng khuôn `DonChon` của Tổ chức), `xemOkr` (`danh-sach`\|`cay`). Sheet mục tiêu mở
qua `?record=objective:<id>` — `RECORD_KINDS` thêm `objective`, `record-sheet-host.tsx`
thêm `ObjectiveSheet` (`objective-sheet.tsx`), `useCrmCache` thêm `okr(id?)`.

Màn «Theo đơn vị»: cột trái `cay-don-vi.tsx` ghép từ `NavItem` (cùng hình cây của
màn Tổ chức, cùng dữ liệu `org.tree`, số đếm là số mục tiêu đã công bố; máy nhỏ
thành `Select`). Cột phải: đầu đơn vị (tên, cấp, trưởng, đếm), `ToggleGroup`
Danh sách / Cây căn chỉnh, nút «Thêm mục tiêu» và «Nhập từ bảng tính» khi
`canEdit`. Danh sách = một `Card` mỗi mục tiêu (`CardHeader`: tên, loại, phụ trách,
chỗ góp; ngay dưới đầu thẻ, trực tiếp trong `Card`: `SimpleTable` KR — tên, phụ trách, tiến độ `Progress` +
`StatusIndicator`, đích). Cây căn chỉnh = `SimpleTable` một cột thụt lề theo cấp
(thành phần cây bàn phím là việc lượt 5).

Sheet mục tiêu (`objective-sheet.tsx`, `RecordSheetFrame`): đầu = tên, đơn vị · chu
kỳ, huy hiệu loại và trạng thái; hành động: Sửa · Thêm KR · Công bố · Bỏ (chỉ khi
`canEdit`); ô số: tiến độ, tình trạng, phụ trách; ba tab **KR** (`SimpleTable`, dòng
có menu Sửa/Xoá khi được) · **Căn chỉnh** (chỗ góp + nút Gắn thêm mở `Combobox`
ứng viên) · **Vết** (dòng thời gian vết: ai, làm gì, lúc nào, trước → sau). Hộp
thoại mục tiêu và KR là `Dialog` với `Field`/`Input`/`Select`/`Combobox`/`DatePicker`.
Hỏi lại khi công bố và bỏ: `ConfirmDialog` (từ `settings/members`, như sheet kế
hoạch — chuyển vào `packages/ui` là đợt 2 của `docs/settings.md`, đang có vòng
khác làm).

Cài đặt › **Chương trình OKR** (`/settings/okr`, nhóm «Con người»): `PageShell
width="page"`; card «Chu kỳ» = `SimpleTable` (tên, loại, ngày, pha, menu «Chuyển
pha» có `ConfirmDialog`) + nút «Mở chu kỳ» mở `Sheet` (loại, tên, năm cha, hai ngày,
khoảng nghỉ, ngày cập nhật — trạng thái mở ghi trên URL); card «Cấu hình» = `form`
với nút Lưu ở `CardAction` (trần mục tiêu, trần KR, `Select` cảnh báo/chặn, `Select`
thang chấm, hai `Switch` ngang: trọng số, OKR cá nhân). Không đủ quyền: điều khiển
khoá + một dòng dưới tiêu đề nói vì sao.

Chuỗi ở `lib/messages/okr.ts` (vi + en), nhãn thanh bên ở `settings.ts`. Tên
người, tên đơn vị, tên mục tiêu, tên KR, đơn vị đo mang `translate="no"`.

Mọi màn có ba trạng thái rỗng · đang tải · lỗi (`Empty`, `Skeleton`/`PageShellLoading`,
`Empty` có nút thử lại — như Tổ chức).

### Bậc thang «Vẽ tay là bậc cuối» — từng khối

| Khối | Bậc | Đã tra |
| --- | --- | --- |
| Thanh tab khu OKR | 1 — `Tabs variant="line"` nguyên dạng | proto thêm class ở chỗ gọi → bỏ; biến thể thanh điều hướng là Nhóm 2 lượt 5 |
| Cây đơn vị | 1 — `NavItem` (như màn Tổ chức) | cây bàn phím `role="tree"`: ReUI «tree» kéo `@headless-tree` — Nhóm 2 lượt 5 |
| Khối mục tiêu | 1 — `Card` + `CardHeader`/`CardTitle`/`CardAction` | shadcn `item` chưa cài — không cần vì hàng KR có cột |
| Hàng KR | 1 — `SimpleTable` trực tiếp trong `Card`, không qua `CardContent` (theo tiền lệ `currency-settings.tsx`) | |
| Cây căn chỉnh | 1 — `SimpleTable` thụt lề | thành phần cây là bậc 5, hoãn lượt 5 (Nhóm 2 của bản mẫu) |
| Tiến độ | 1 — `Progress` | biến thể trung tính có vạch kỳ vọng là Nhóm 2 lượt 5; lượt này tô `primary`, ghi Known limits của hợp đồng |
| Tình trạng, mức tự tin, trạng thái | 1 — `StatusIndicator`, `Badge variant="outline"` | |
| Sheet mục tiêu | 1 — `RecordSheetFrame`, `DetailSheet*`, `EntityLogo` cho ô biểu tượng | |
| Hộp thoại mục tiêu, KR, gắn căn chỉnh | 1 — `Dialog`, `Field`, `Input`, `Select`, `Combobox`, `DatePicker` | |
| Hộp thoại nhập | 1 — `Dialog size="wide"`, `StepList`, `Textarea`, `SimpleTable` | theo `hop-thoai-nhap.tsx` |
| Hỏi lại | 1 — `ConfirmDialog` (thư mục `settings/members`) | chuyển vào `packages/ui`: đợt 2 `docs/settings.md`, vòng khác |
| Vết | 1 — `SimpleTable` (lúc, ai, việc, trước → sau) | `Timeline` của kho gắn `Activity`, không dùng |
| Trang Cài đặt | 1 — `PageShell`, `Card`, `Field orientation="horizontal"`, `Switch`, `Sheet` | theo `docs/settings.md` |

Không tệp nào trong `packages/ui` bị sửa. Mô tả PR chép bảng này.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: quản trị mở Cài đặt › Chương trình OKR → «Mở chu kỳ» (năm 2026, rồi quý 4) → chuyển pha «Đang chạy» → trưởng phòng ban mở Mục tiêu › Theo đơn vị → chọn phòng ban → «Thêm mục tiêu» → sheet mục tiêu → «Thêm KR» ×n → «Gắn căn chỉnh» vào mục tiêu OneHub → «Công bố» (điểm ra: sheet ở trạng thái Đã công bố, danh sách đếm thêm 1)
- Suôn sẻ (nhập): trưởng phòng ban → «Nhập từ bảng tính» → dán → «Xem trước» → thấy dòng hợp lệ/hỏng → «Ghi N dòng» (tuỳ chọn công bố ngay) → kết quả → «Xem danh sách»
- Biên: đơn vị chưa có trưởng → danh sách rỗng nói «gán trưởng ở Cài đặt › Tổ chức»; chưa có chu kỳ đang chạy → mọi tab nói «Quản trị chưa mở chu kỳ» kèm liên kết Cài đặt (quản trị) hoặc câu chờ (người khác); vai «chỉ OKR» không phải trưởng → thấy mọi thứ, không nút ghi; chương trình tắt OKR cá nhân → không có cấp cá nhân trong hộp thoại
- Lỗi & quay lại: công bố mục tiêu không KR → toast câu ghim, sheet giữ nguyên; sửa khởi điểm sau công bố → ô khoá, chú thích «đã khoá khi công bố»; căn chỉnh sai cấp → ứng viên không hiện, API vẫn từ chối; xem trước lô hỏng → bảng dòng đỏ, nút ghi khoá khi 0 dòng hợp lệ; ghi lỗi → về bước dán với câu lỗi

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Mục tiêu › Của tôi | Thấy mục tiêu và KR của tôi trong chu kỳ | rail / sheet mục tiêu |
| Mục tiêu › Theo đơn vị | Đặt và đọc bộ OKR của một đơn vị | tab / sheet, hộp thoại nhập |
| Mục tiêu › Toàn cảnh | Nói màn mở ở lượt 5 | tab / — |
| Sheet mục tiêu | Sửa một mục tiêu: KR, căn chỉnh, công bố, vết | `?record=objective:<id>` / đóng |
| Hộp thoại mục tiêu · KR · gắn căn chỉnh | Nhập một bản ghi | sheet hoặc màn / sheet |
| Hộp thoại nhập | Đưa bộ OKR từ bảng tính vào một đơn vị | màn Theo đơn vị / danh sách |
| Cài đặt › Chương trình OKR | Mở chu kỳ và khai cách chạy chương trình | thanh bên Cài đặt / — |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-donvi-dangtai | Theo đơn vị | khung xương cây + ba khối, «Đang tải OKR…» | chờ |
| ST-donvi-loi | Theo đơn vị | `Empty` «Không tải được OKR» + Thử lại | thử lại |
| ST-donvi-chuakychay | Theo đơn vị | `Empty` «Quản trị chưa mở chu kỳ» (+ liên kết Cài đặt nếu quản trị) | quản trị mở chu kỳ |
| ST-donvi-rong | Theo đơn vị | `Empty` «<đơn vị> chưa đặt OKR cho <kỳ>»; trưởng thấy hai nút Thêm / Nhập; đơn vị không trưởng thấy câu gán trưởng | thêm hoặc nhập |
| ST-donvi-danhsach | Theo đơn vị | thẻ mục tiêu với bảng KR, nút Danh sách đang chọn | mở sheet |
| ST-donvi-caycanchinh | Theo đơn vị | bảng cây căn chỉnh toàn công ty + nhóm chưa căn chỉnh | mở sheet |
| ST-donvi-truong | Theo đơn vị | như danh sách + nút Thêm mục tiêu, Nhập từ bảng tính | thêm |
| ST-sheet-nhap | Sheet mục tiêu | huy hiệu Nháp, nút Công bố sáng, KR đang có | thêm KR, công bố |
| ST-sheet-congbo | Sheet mục tiêu | huy hiệu Đã công bố, ô khởi điểm khoá trong hộp KR | sửa đích, gắn căn chỉnh |
| ST-sheet-dabo | Sheet mục tiêu | huy hiệu Đã bỏ, không nút ghi | đọc |
| ST-sheet-vet | Sheet mục tiêu | tab Vết: bảng lúc · ai · việc · trước → sau | đọc |
| ST-nhap-dan | Hộp thoại nhập | bước 1: ô dán, chọn tệp, chọn chu kỳ/đơn vị | xem trước |
| ST-nhap-xemtruoc | Hộp thoại nhập | bước 2: tóm tắt, dòng hỏng đỏ, bảng dòng, ô «Công bố ngay» | ghi hoặc quay lại |
| ST-nhap-ketqua | Hộp thoại nhập | bước 3: đã ghi N mục tiêu, M KR | xem danh sách |
| ST-cuatoi-codulieu | Của tôi | thẻ mục tiêu tôi phụ trách/tham gia, KR tôi phụ trách đánh dấu | mở sheet |
| ST-cuatoi-rong | Của tôi | `Empty` «Bạn chưa phụ trách mục tiêu hay KR nào» | sang Theo đơn vị |
| ST-caidat-quantri | Cài đặt › Chương trình OKR | bảng chu kỳ + form cấu hình bật | mở chu kỳ, lưu |
| ST-caidat-khongquyen | Cài đặt › Chương trình OKR | cùng trang, điều khiển khoá, dòng «Chỉ quản trị đổi được…» | đọc |
| ST-caidat-mokychu | Cài đặt › Chương trình OKR | `Sheet` mở chu kỳ, nút gửi tắt tới khi hợp lệ | điền, gửi |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Tên mục tiêu 3–200 ký tự; «vì sao lúc này» ≤ 500; tên KR 3–200; đơn vị đo ≤ 24; số nhận dấu phẩy thập phân kiểu Việt khi nhập, lưu `Decimal(18,4)`
- Ràng buộc theo kiểu KR áp ngay ở hộp thoại (nút gửi tắt) và lại ở API
- Chọn chu kỳ, đơn vị, cách xem ghi trên URL; tải lại giữ nguyên
- Bàn phím: cây đơn vị đi bằng Tab/Enter (`NavItem`); hộp thoại đóng bằng Esc; ô lỗi nhận focus
- Khổ 390: cây đơn vị thành `Select`; bảng KR cuộn ngang trong thẻ; sheet toàn màn
- Toast cảnh báo khi vượt trần ở chế độ cảnh báo; 400 câu ghim ở chế độ chặn

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Tabs` line, `NavItem`, `Card*`, `SimpleTable`, `Progress`, `StatusIndicator`, `Badge`, `Empty`, `Skeleton` | dùng | bậc 1 của thang |
| `RecordSheetFrame` + `DetailSheet*` + `EntityLogo` | dùng | sheet cùng khung với Thoả thuận, kế hoạch |
| `Dialog`, `Sheet`, `Field`, `Input`, `Select`, `Combobox`, `DatePicker`, `Switch`, `ToggleGroup`, `StepList`, `Textarea` | dùng | form và hộp thoại |
| `ConfirmDialog` (`settings/members`) | dùng | tiền lệ sheet kế hoạch; chuyển vào `packages/ui` là vòng khác |
| `cay-don-vi.tsx`, `khoi-muc-tieu.tsx`, `cay-can-chinh.tsx`, `objective-sheet.tsx`, `hop-thoai-*.tsx` | ghép | ghép từ bậc 1, không tạo primitive mới |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail) — cây đơn vị bên trái, bộ OKR bên phải, bản ghi mở trong record sheet.
Căn cứ: bản mẫu bốn màn đã duyệt 2026-09-24 (`ban-mau-okr`) chốt khuôn này cùng bốn tab; màn Tổ chức của lượt 1 dùng cùng khuôn nên người dùng đã quen. Không tra thêm.
<!-- UX-SPEC-TEMPLATE>>> -->

## 7. Lịch và ngày

Mọi ngày là ngày lịch Việt Nam: chu kỳ lưu `@db.Date`; «hôm nay» tính bằng
`dauNgayVN(new Date())` (`@crm/db/onboarding-nhac`). Kỳ vọng tiến độ của một mục
tiêu đã công bố = (hôm nay − ngày công bố) / (ngày kết thúc chu kỳ − ngày công bố),
trừ khoảng nghỉ nếu khai; chưa công bố thì không có kỳ vọng. Lượt 4 dùng lại hàm
này cho vạch «lẽ ra».

## 8. Kiểm chứng

Điều kiện bỏ design-pass (Cổng Phạm vi): bốn phép đo chụp màn thật (E11, E12, E15,
E20) chụp ba bề mặt mới không có trong bản mẫu — hộp thoại mục tiêu/KR, hộp thoại
nhập, trang Cài đặt › Chương trình OKR — ở 1440 và 390, cạnh sheet Thoả thuận.

- Bài kiểm API `apps/api/test/okr.spec.ts` + sàn `okr-san.ts` (khuôn `to-chuc-san.ts`):
  gieo cây tổ chức thật qua `org.*`, gieo người từng vai (kể cả `okr`), gọi tRPC
  bằng cookie, đọc lại bằng Prisma. Mỗi thủ tục ghi có khẳng định đọc lại từ DB.
- Hàm thuần: `tienDoKr`, `tinhTrang`, `kyVong` (`packages/validation/test`),
  `phanTichLo` của nhập (`apps/api/test/okr-nhap.spec.ts`), `dungCayCanChinh`.
- Bài kiểm app: `khung-dieu-huong.spec.ts`, `pham-vi-man.spec.ts`, `proxy`, slug
  dự trữ; DOM: `okr-theo-don-vi.dom.tsx`, `okr-sheet.dom.tsx`.
- Màn thật: script `rang/man-okr.mjs` (puppeteer, khuôn `man-chi-okr.mjs`) chụp
  Theo đơn vị, sheet mục tiêu cạnh sheet Thoả thuận ở 1440 và 390, hộp thoại nhập,
  Cài đặt › Chương trình OKR — hai vai.
- Cổng thiết kế tĩnh + dấu hiệu vẽ tay: `rang/san-thiet-ke.mjs`.
- Migration chỉ thêm: `rang/migration-chi-them.mjs` (khuôn lượt 1).
- Hồ sơ ghim lại sau lượt: `vai-chi-okr` (hằng alias), hồ sơ giữ
  `khung-dieu-huong.spec.ts`.

## 9. Việc đi kèm

- `docs/api.md` thêm mục «OKR» (router, quyền theo bản ghi, vết, nhập).
- `CONTEXT.md`: thêm mục «Kiểu KR» (sáu kiểu) và «Chương trình OKR» (cấu hình có
  phiên bản) nếu chưa có.
- Mô tả PR ghi bậc thang từng khối (bảng ở mục 6).
