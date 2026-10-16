# Gợi ý mở kế hoạch khi deal thắng — thiết kế (DA3b)

Hàng DA3b của `docs/plan/lo-trinh-viec-du-an.json`, hồ sơ `_acceptance/goi-y-mo-ke-hoach/`, hạng T3 (thêm bảng ở
`packages/db/prisma`). Đứng trên DA3 (`ke-hoach-sinh-viec`, gộp #432, onehub `7ebcb0242`). Cổng Đáng ký build ngày
16/10/2026 (manh) với ngưỡng (b) đã ký ở DA3. Thiết kế nháp gốc: `docs/superpowers/specs/2026-10-14-ke-hoach-sinh-viec-design.md`
mục 7 — tệp này thay nó cho DA3b; chỗ nào lệch thì ghi rõ.

## 1. Vấn đề

Deal sang giai đoạn thắng hôm nay không dẫn tới gì: `chuyenGiaiDoanTrongTx` (`apps/api/src/deals/deals.service.ts`)
đổi giai đoạn, ghi một dòng hoạt động `STAGE_CHANGE`, phát `deal.closed` cho tác tử, và dừng. Người phụ trách
phải tự nhớ ra công ty vừa ký cần một kế hoạch onboard 30 ngày. Ngưỡng đã ký đòi: mọi lần deal chuyển sang thắng
của công ty chưa có kế hoạch mở đều sinh một gợi ý, và ≥ 50 % gợi ý được người xử lý (mở kế hoạch hoặc bỏ qua)
trong 3 ngày.

## 2. Hướng đã chọn

Luật **tất định ở máy chủ**, chạy trong chính giao dịch đổi giai đoạn — không qua tác tử (`apps/agent`). Ghi chú
của hàng lộ trình nói thẳng «Luật deal thắng là tất định ở máy chủ»; luật kho «trí khôn sống ở `apps/agent`» không
áp vì ở đây không có phán đoán nào — chỉ một phép so loại giai đoạn và một phép đếm. Gợi ý là một bản ghi có trạng
thái (`GoiYKeHoach`) để vế (b) đếm được và đỏ được.

Lối đã loại: phát gợi ý từ tác tử khi nhận `deal.closed`. Chết vì (1) tác tử chạy sau giao dịch, có thể trễ hay bị
bỏ (825 việc đã skip mốc 10/10), nên vế «mọi deal thắng đều có gợi ý» không còn tất định; (2) `deal.closed` không
phát ở lần chuyển thắng → thắng khác cột, nhưng cũng không phân biệt thua → thắng với mở → thắng.

## 3. Bản ghi `GoiYKeHoach`

| Trường | Kiểu | Nghĩa |
|---|---|---|
| `id` | cuid | |
| `dealId` | → Deal (Cascade) | deal sinh ra gợi ý |
| `companyId` | → Company (Cascade) | công ty của deal lúc sinh |
| `nguoiNhanId` | → User | người phụ trách deal (`deal.ownerId`) lúc sinh |
| `chuyenLuc` | timestamptz | giờ của lần chuyển sang thắng sinh ra gợi ý (bằng `occurredAt` của dòng `STAGE_CHANGE`, hay `createdAt` của deal khi tạo thẳng ở thắng) |
| `trangThai` | enum `CHO · DA_MO · BO_QUA` | |
| `sinhLuc` | timestamptz | = `chuyenLuc` (cùng `now` của giao dịch) |
| `xuLyLuc?` | timestamptz | lúc rời `CHO` |
| `xuLyBoiId?` | → User | người bấm, hay người tạo kế hoạch |
| `planId?` | → OnboardingPlan (SetNull) | kế hoạch làm gợi ý sang `DA_MO` |

Chỉ mục: `(dealId, trangThai)`, `(nguoiNhanId, trangThai)`, `(companyId, trangThai)`, `(sinhLuc)`. Ràng buộc
«mỗi deal tối đa một gợi ý `CHO`» là chỉ mục duy nhất một phần `WHERE "trangThai" = 'CHO'` viết tay trong
migration (Prisma không khai được), cộng khoá dòng deal `FOR UPDATE` sẵn có — hai lớp, vì một lớp chỉ là quy ước.

Migration mang mốc UTC sau `20261015234401_ke_hoach_sinh_viec`.

### Vòng đời (ba câu của `docs/vong-doi.md` — đề xuất, chủ kho chốt ở Cổng Phạm vi)

1. **Dọn thế nào:** kết cục nghiệp vụ — «Đã mở kế hoạch» hay «Đã bỏ qua». Không có Xoá, không Lưu trữ.
2. **«Lịch sử» nghĩa là gì:** mọi gợi ý đều có lịch sử từ lúc sinh — nó là vật đếm của ngưỡng đã ký; xoá một gợi
   ý là xoá một hàng của phép đo. Vì vậy không có nút Xoá ở đâu cả. Deal hay công ty bị xoá vĩnh viễn thì gợi ý
   đi theo (Cascade), như hoạt động của deal.
3. **Danh sách mặc định hiện gì:** không có danh sách gợi ý. Thẻ trên sheet deal chỉ hiện khi gợi ý còn `CHO`;
   gợi ý đã xử lý không hiện lại ở đâu (kế hoạch đã mở thì tìm ở thẻ Kế hoạch của công ty như mọi kế hoạch).
   «Bỏ qua» không mở lại được — muốn kế hoạch thì dùng nút «Tạo kế hoạch» thường.

## 4. Luật sinh

Một hàm `sinhGoiYKeHoach(tx, { dealId, tuLoai, denLoai, now })` trong `packages/db/src/goi-y-ke-hoach.ts`, gọi ở
đúng hai chỗ ghi giai đoạn của deal (đã quét: không đường nào khác ghi `deal.stage` — `run-runtime.ts` của tác tử
chỉ ghi `lastActivityAt`, các `updateMany` của `deals.service.ts` là lưu trữ):

- `chuyenGiaiDoanTrongTx` — sau khi ghi `STAGE_CHANGE`. Phủ `setStage`, `bulkSetStage` (gọi `setStage` từng deal)
  và lưu trữ giai đoạn (`giai-doan.service.ts`, `giuNguyenDong`).
- `DealsService.create` — khi deal tạo thẳng ở giai đoạn thắng (`tuLoai = null`).

Sinh ⟺ (`tuLoai` không phải `WON`, kể cả `null`) ∧ `denLoai = WON` ∧ công ty không có kế hoạch `closedAt IS NULL`
∧ deal không có gợi ý `CHO`. Ma trận viết trước, theo loại giai đoạn đi × đến (thêm hàng «tạo mới» so với nháp DA3):

| Đi \ đến | mở | thắng | thua |
|---|---|---|---|
| (tạo mới) | không | **sinh** | không |
| mở | không | **sinh** | không |
| thắng (khác cột) | không | không | không |
| thua | không | **sinh** | không |

Đơn vị là **lần chuyển sang thắng**, không phải deal (Hỏi-4 — hàng «tạo mới» và việc sinh lại sau «bỏ qua» chờ chủ kho chốt): thắng → bỏ qua → mở lại → thắng lần nữa thì sinh gợi ý mới;
chỉ khi gợi ý cũ còn `CHO` thì không sinh thêm. Lưu trữ giai đoạn chỉ chuyển deal giữa hai cột cùng loại
(`dich.kind !== nguon.kind` bị từ chối), nên luôn rơi ô «thắng → thắng».

Deal rời thắng (thắng → mở hay thua) khi gợi ý còn `CHO`: gợi ý giữ `CHO` nhưng **ẩn** — thẻ và dòng nhắc chỉ hiện
khi giai đoạn hiện tại của deal là thắng. Deal thắng lại thì không sinh thêm (đã có `CHO`), thẻ hiện lại. Không thêm
trạng thái thứ tư; phép đo đếm gợi ý ấy là chưa xử lý (bi quan, không làm đẹp số).

## 5. Xử lý

- **«Mở kế hoạch»** mở ô tạo kế hoạch (`TaoKeHoach`) với công ty của deal khoá sẵn. Gợi ý sang `DA_MO` khi kế hoạch
  được tạo — không ở lúc bấm, vì đóng ô mà không tạo thì chưa xử lý gì.
- **Tạo kế hoạch cho công ty bằng bất kỳ đường nào** (`onboarding.createFromTemplate` qua tRPC hay REST
  `POST /onboarding/plans`, từ thẻ hay từ danh mục) chuyển mọi gợi ý `CHO` của công ty đó sang `DA_MO`, ghi `planId`,
  `xuLyLuc`, `xuLyBoiId` = người tạo — trong cùng giao dịch của `createFromTemplate`. Tạo hỏng thì gợi ý không đổi.
  `createFromTemplate` là đường tạo kế hoạch duy nhất (đã quét `onboardingPlan.create`).
- **«Bỏ qua»** gọi `onboarding.boQuaGoiY({ id })` → `BO_QUA`. Gợi ý không còn `CHO` → 400 «Gợi ý này đã được xử lý.»,
  không đổi gì.
- **Quyền:** người nhận gợi ý hoặc quản trị (`admin`/`owner`) đọc và bỏ qua được; người khác nhận 403 và gợi ý
  không đổi. Người tạo kế hoạch thì không cần là người nhận — tạo kế hoạch là việc thật, ai làm cũng đóng gợi ý.

Thủ tục mới: `onboarding.goiYCuaDeal({ dealId })` (trả gợi ý `CHO` của deal khi người gọi là người nhận hay quản
trị và deal đang ở thắng, không thì `null`) và `onboarding.boQuaGoiY({ id })`. Hình dữ liệu trong
`packages/validation/src/goi-y-ke-hoach.ts`.

## 6. Nơi hiện

- **Thẻ ở đầu sheet deal** (Hỏi-1 phần a): «Deal đã thắng — mở kế hoạch 30 ngày cho <công ty>?», hai nút
  «Mở kế hoạch» (primary) · «Bỏ qua».
- **Một dòng trong nhắc buổi sáng của người nhận** (Hỏi-1 phần b), loại mới `goi-y-ke-hoach`, chừng nào gợi ý còn
  `CHO` và deal còn ở thắng: «<công ty> · Deal <tên> đã thắng — mở kế hoạch 30 ngày?». Vì mọi mục nhắc buổi sáng
  đều thành một Thông báo (TB1), dòng này cũng có trong chuông của người nhận, kể cả khi họ chưa nối Zalo hay Slack.

Vì sao cả hai: deal thắng là lúc người phụ trách thường **thôi** mở sheet deal — thẻ một mình chỉ gặp người còn
quay lại deal, trong khi ngưỡng đòi ≥ 50 % xử lý trong 3 ngày. Lối khác (chỉ thẻ) rẻ hơn một tiêu chí và không đụng
`apps/agent`; giá là ngưỡng (b) dễ chết vì không ai thấy gợi ý.

## 7. Thước đo ngưỡng

`_acceptance/goi-y-mo-ke-hoach/rang/do-nguong.mjs --tu --den` theo khuôn `ke-hoach-sinh-viec/rang/do-nguong.mjs`,
chạy trong giao dịch READ ONLY, mẫu số **không** đọc từ bảng gợi ý (đọc từ bảng gợi ý thì phép đo tự chứng chính nó):

- **Lần chuyển sang thắng** trong cửa sổ = (a) mỗi dòng `STAGE_CHANGE` có `meta.from` là giai đoạn không-thắng và
  `meta.to` là giai đoạn thắng; cộng (b) mỗi deal tạo trong cửa sổ mà **giai đoạn đầu** là thắng — giai đoạn đầu là
  `meta.from` của dòng `STAGE_CHANGE` sớm nhất của deal, không có dòng nào thì là giai đoạn hiện tại. Chỉ tính lần
  chuyển mà lúc đó công ty không có kế hoạch mở (`createdAt ≤ t` và `closedAt` trống hay `> t`).
- Mỗi lần phải khớp một gợi ý (cùng deal, `chuyenLuc` bằng giờ chuyển) hoặc một gợi ý `CHO` đã có của deal sinh
  trước giờ chuyển; không khớp thì cộng `dealThangThieuGoiY`.
- **Tỉ lệ xử lý kịp** = gợi ý có `xuLyLuc − sinhLuc ≤ 3 ngày` / gợi ý sinh trong cửa sổ và trước `--den` ít nhất
  3 ngày (gợi ý trẻ hơn còn có thể đạt nên chưa phán).
- Thoát 2 khi `dealThangThieuGoiY > 0` hoặc tỉ lệ < 0,5; thoát 3 khi không đo được — thiếu đối số, cửa sổ không có lần chuyển nào (`lanChuyen` 0), hay không gợi ý nào đủ 3 ngày để phán (`goiYPhan` 0). Thước không bao giờ thoát 0 khi một mẫu số bằng 0: «không có gì để đo» không phải «sống».
- JSON ra mang `chiDoc` = `SHOW transaction_read_only` đọc trong chính giao dịch của thước.

Giới hạn đã biết: kế hoạch bị đóng rồi mở lại xoá `closedAt`, nên «có kế hoạch mở lúc t» đọc theo trạng thái hiện
tại của kế hoạch đã mở lại — có thể đếm thiếu một lần chuyển xảy ra lúc kế hoạch đang đóng. Hiếm, và lệch về phía
bỏ sót một lần chuyển chứ không phía bịa ra.

## 8. Dữ liệu mẫu

Thước đo chạy trên kho mẫu gieo trong bài kiểm, qua đường ghi thật (`setStage`, `create`, `createFromTemplate`,
`boQuaGoiY`) — không chèn thẳng bảng gợi ý. Chỉ `sinhLuc`/`xuLyLuc` của ca «xử lý sau 4 ngày» được dời bằng đồng hồ
giả của bài kiểm, không sửa hàng sau khi ghi. Không thêm gì vào `bun run db:seed` lượt này.

## 9. Ngoài phạm vi

- Bản bàn giao do AI viết khi deal thắng — thuộc tác tử, hàng khác.
- Gợi ý cho deal đã thắng **trước** lượt này (không chạy lùi) — ngưỡng đếm từ ngày gộp.
- Mở lại gợi ý đã bỏ qua; danh sách «gợi ý của tôi».
- Gợi ý khi deal thua, hay khi công ty đổi người phụ trách.
- Đổi người nhận gợi ý khi deal đổi người phụ trách sau lúc sinh.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ (mở): người phụ trách kéo deal sang cột thắng (Kanban hay menu giai đoạn của sheet) → sheet deal hiện thẻ «Deal đã thắng — mở kế hoạch 30 ngày cho <công ty>?» → «Mở kế hoạch» → ô tạo kế hoạch (`TaoKeHoach`) với công ty khoá → «Tạo» (điểm ra: sheet kế hoạch vừa tạo; thẻ không còn).
- Suôn sẻ (bỏ qua): thẻ → «Bỏ qua» → thẻ ẩn ngay (điểm ra: sheet deal như hôm nay).
- Suôn sẻ (nhắc): sáng hôm sau, nhắc buổi sáng và chuông có dòng «<công ty> · Deal <tên> đã thắng — mở kế hoạch 30 ngày?» → bấm → sheet deal có thẻ (Hỏi-1).
- Biên: người xem không phải người nhận hay quản trị → không thẻ; deal rời thắng → thẻ ẩn, thắng lại thì hiện lại; công ty đã có kế hoạch mở lúc thắng → không có gợi ý.
- Lỗi & quay lại: «Bỏ qua» lỗi (gợi ý đã được xử lý ở chỗ khác) → thẻ hiện lại kèm toast lời máy chủ; đóng ô tạo mà không tạo → thẻ vẫn còn; tạo hỏng → lỗi trong ô tạo như hôm nay, thẻ còn.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Thẻ gợi ý trong sheet deal | Quyết mở kế hoạch hay bỏ qua cho deal vừa thắng | sheet deal đã thắng, dòng nhắc / ô tạo kế hoạch, sheet deal |
| Ô tạo kế hoạch (`TaoKeHoach`, dùng lại) | Tạo kế hoạch cho công ty đã khoá | thẻ gợi ý / sheet kế hoạch mới |
| Dòng nhắc buổi sáng và Thông báo (Hỏi-1) | Báo người nhận có gợi ý đang chờ | Zalo/Slack, chuông / sheet deal |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-the-goi-y-cho | Sheet deal | thẻ `Alert` «Deal đã thắng — mở kế hoạch 30 ngày cho <công ty>?», «Mở kế hoạch» (primary) · «Bỏ qua» | mở kế hoạch / bỏ qua |
| ST-the-goi-y-an | Sheet deal | không thẻ (không gợi ý chờ, không phải người nhận, deal không ở thắng, đang tải, tải lỗi) | — |
| ST-the-goi-y-loi-bo-qua | Sheet deal | thẻ hiện lại, toast «Gợi ý này đã được xử lý. Tải lại sheet để xem.» (hay lời máy chủ khác) | tải lại sheet |
| ST-nhac-goi-y | Nhắc buổi sáng · chuông | «<công ty> · Deal <tên> đã thắng — mở kế hoạch 30 ngày?» | bấm → sheet deal |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Thẻ nằm ở khe `stats` của `RecordSheetFrame`, sau dải lưu trữ (`DaiLuuTruBanGhi`), trước các ô số — như `DaiChoDuyet` của sheet mục tiêu.
- Tải gợi ý hỏng hay chậm không chặn sheet: thẻ chỉ thêm, không thay gì; lỗi tải không hiện khung lỗi (sheet vẫn dùng được, gợi ý vẫn đến qua nhắc).
- «Bỏ qua» lạc quan; không hỏi lại (không phải thao tác mất dữ liệu — vòng đời mục 3).
- ≤ 640px: hai nút xuống dòng dưới tiêu đề, không tràn ngang.
- Tên công ty là dữ liệu người nhập: `translate="no"`, xuống dòng được (`break-words`) khi tên rất dài — không cắt mất nút.
- Chuẩn giao diện của kho (`feature_loop.ui_standards_skill` = `web-design-guidelines`, đã nạp ở S1): nút là `Button` thật, có focus thấy được (sẵn trong `@crm/ui`); toast lỗi nói bước kế («… Tải lại sheet để xem.»); «Bỏ qua» không hoàn tác được nhưng không mất dữ liệu hay khả năng — kế hoạch vẫn tạo bằng nút thường (Hỏi-2 nêu lối có «Hoàn tác»).

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Thẻ gợi ý (`goi-y-ke-hoach.tsx`) | ghép | `Alert`/`AlertTitle`/`AlertDescription` + hai `Button` của `@crm/ui`, theo `DaiChoDuyet` (`objective-duyet.tsx`) |
| `TaoKeHoach` | dùng | đã nhận `congTyCoDinh` + `mo`/`doiMo`, như `company-plans.tsx` |
| Dòng nhắc / thông báo | mở rộng | thêm một loại vào `LOAI_NHAC`, `mucNhac`, `LOAI_THONG_BAO`, `dong()` của `tin-nhac.ts` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — thẻ là một dải trong sheet bản ghi đã có (danh sách deal → sheet), mở ô tạo sẵn có; không có khuôn thứ hai khả dĩ nên không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->
