# Việc chung — thiết kế

Hàng DA1 của `docs/plan/lo-trinh-viec-du-an.json`, hồ sơ `_acceptance/viec-chung/`. Chủ kho mở ở Cổng Đáng
ngày 13/10/2026 (build). Máy M5 giữ hàng này; gộp vào `onehub` sau DA0b (mốc 16/10).

Câu giao: «Tôi giao một việc gắn với deal hay kế hoạch onboard; người nhận thấy nó trong Việc của tôi và được
nhắc buổi sáng».

Ngưỡng đã chốt ở Cổng Đáng: trong 14 ngày đầu dùng thật, ít nhất 80% việc giao cho người khác người tạo được
người thực hiện chuyển khỏi «Chưa làm» trước hoặc trong ngày hạn; và 0 việc gắn đối tác có người thực hiện hay
người theo dõi mang vai «chỉ OKR».

Đọc trước khi viết: `docs/api.md` (phạm vi dữ liệu, xoá bản ghi), `docs/agent.md` (nhắc buổi sáng, «xong n»),
`docs/design.md`, `docs/vong-doi.md`, `docs/proto.md`, `docs/settings.md` (hộp «Chuyển việc» ở màn Thành viên
dưới `/settings`), `docs/plan/viec-du-an-nghien-cuu.md` cùng bản đồ mã
`viec-du-an-nghien-cuu/01-ma-kho-onehub.md`, hồ sơ DA0a `va-lo-ro-vai-chi-okr`. Skill: `nestjs-trpc`, `nuqs`,
`web-design-guidelines` (chuẩn giao diện kho khai ở `feature_loop.ui_standards_skill`).

## Hôm nay

Ba thứ giống việc sống tách nhau (bản đồ đầy đủ ở `01-ma-kho-onehub.md` mục 1, đọc lại trên HEAD `7165d40c6`):

| Thứ | Người làm | Ai đánh dấu xong | Nhắc |
| --- | --- | --- | --- |
| Việc cần làm trên dòng thời gian (`Activity` loại `TASK`) | không có, chỉ người tạo | mọi thành viên (`activities.service.ts:190-211` không kiểm người) | không |
| Bước kế hoạch 30 ngày (`OnboardingStep`) | một người được giao | người trong phạm vi đối tác | nhắc buổi sáng, «xong n» |
| Việc (KR) (`OkrViecKr`) | một người làm | người sửa được KR | không |

Người giao một việc cho đồng nghiệp ở deal hôm nay không có chỗ nào để giao: việc cần làm không có người
làm, không nhắc ai, ai cũng bấm xong được.

## Hình dạng

```
Việc ──< Gắn >── công ty · cá nhân · thoả thuận · kế hoạch 30 ngày
  │
  ├── người giao (1) · người thực hiện (1) · người theo dõi (0..n)
  ├── trạng thái: Chưa làm · Đang làm · Chờ đánh giá · Xong · Huỷ
  └──< Vết (mỗi thay đổi một dòng)
```

### Bảng

Bốn bảng mới trong `packages/db/prisma/schema.prisma`, một migration:

- **`Viec`** — `tieuDe` (bắt buộc), `moTa?`, `trangThai` (enum năm giá trị), `hanNgay?` (ngày giờ, như
  `dueAt` của bước), `nguoiGiaoId`, `nguoiThucHienId` (bắt buộc), `taoBoiId`, `taoLuc`, `doiLuc`,
  `roiChuaLamLuc?` (cột đo của ngưỡng — luật ghi ở mục «Cột đo» dưới), `khepLuc?` (lúc vào Xong hay
  Huỷ). Chỉ mục theo `(nguoiThucHienId, trangThai, hanNgay)` và `(nguoiGiaoId, trangThai)`.
- **`ViecGan`** — `viecId` và ĐÚNG MỘT trong `companyId`, `contactId`, `dealId`, `planId` (khoá ngoại thật,
  `onDelete: Cascade` về phía bản ghi cha; ràng buộc kiểm «đúng một cột khác null» trong SQL migration).
  Unique theo từng cặp. Xoá vĩnh viễn bản ghi cha chỉ xoá hàng gắn, không xoá việc (bẫy x4 của lộ trình).
- **`ViecTheoDoi`** — `(viecId, userId)` unique.
- **`ViecVet`** — `viecId`, `luc`, `nguoiId`, `loai` (tao · doi-trang-thai · doi-nguoi-thuc-hien ·
  doi-han · doi-noi-dung · gan · go · theo-doi · bo-theo-doi · chuyen-viec · go-do-ban-ghi-xoa), `truoc`
  Json?, `sau` Json?, `nguon` (web · zalo · api · chuyen-viec). Khuôn `truoc/sau` theo từng `loai` là một
  union Zod ở `packages/validation/src/viec.ts`, đọc ở biên.

Vì sao bảng riêng, không thêm cột vào `Activity`: khảo sát DA0 kết luận «Việc là một bảng riêng, không nhét
thêm trường vào dòng hoạt động. Việc gắn được nhiều bản ghi cùng lúc» (`docs/plan/viec-du-an-nghien-cuu.md`
mục 1). Một hàng `Activity` chỉ có một chỗ cho mỗi loại bản ghi và không có người làm.

### Một chỗ ghi

Mọi lệnh ghi đi qua `packages/db/src/viec-ghi.ts` (tạo, đổi trạng thái, sửa, gắn, gỡ, theo dõi, chuyển):
API gọi nó, Tác nhân gọi nó khi xử «xong n», bộ gieo dữ liệu mẫu gọi nó. Mỗi hàm chạy trong một giao dịch,
kiểm quyền thao tác (bảng dưới), ghi một dòng `ViecVet`, trả về lỗi có tên. Cùng nếp với `datBuocXong`
(`packages/db/src/onboarding-buoc.ts`) mà «xong n» và màn đang dùng chung.

### Đồ thị trạng thái — mọi cặp nguồn × đích

Năm trạng thái cho 20 cặp nguồn khác đích. 13 cặp hợp lệ, 7 cặp không:

| Nguồn ↓ · Đích → | Chưa làm | Đang làm | Chờ đánh giá | Xong | Huỷ |
| --- | --- | --- | --- | --- | --- |
| **Chưa làm** | — | G · T | G · T | G · T | G |
| **Đang làm** | G · T | — | G · T | G · T | G |
| **Chờ đánh giá** | ✗ | G («Làm lại») | — | G | G |
| **Xong** | ✗ | G («Làm lại») | ✗ | — | ✗ |
| **Huỷ** | G («Mở lại») | ✗ | ✗ | ✗ | — |

G = người giao, T = người thực hiện, ✗ = cặp không hợp lệ với mọi người. Người thực hiện được bấm Xong thẳng;
«Chờ đánh giá» là lựa chọn khi muốn người giao xem lại (Hỏi-2). Việc đã gửi đánh giá thì chỉ người giao đóng
hay trả lại. Người giao trùng người thực hiện thì có cả hai quyền. Người theo dõi, thành viên khác, quản trị
không đổi trạng thái — đường của quản trị là «Chuyển việc».

Thứ tự kiểm của mọi lệnh ghi, một chỗ ở `viec-ghi.ts`:

1. Người gọi không thấy việc (P3, dưới) → NOT_FOUND với đúng lời của mã lạ «Không có việc nào mang mã …». Lệnh
   ghi không phân biệt được mã có thật hay không.
2. Cặp ✗ → BAD_REQUEST «Không chuyển được việc từ «<nguồn>» sang «<đích>».» cho mọi người.
3. Không có quyền → FORBIDDEN, lời ghim theo ô: «Chỉ người giao được <làm>.» cho ô chỉ G, «Chỉ người giao và
   người thực hiện được <làm>.» cho ô G · T.
4. Ba cặp đưa việc đã khép hay đã gửi đánh giá về trạng thái mở (Chờ đánh giá → Đang làm, Xong → Đang làm,
   Huỷ → Chưa làm) gọi lại `kiemNguoiNhanViec` cho người thực hiện hiện tại khi việc gắn bản ghi đối tác: người đó
   đã sang vai «chỉ OKR» → BAD_REQUEST lời của DA0a, trạng thái không đổi. Đây là đường mở lại mà DA0b vá cho kế
   hoạch; Việc vá nó ngay từ đầu.

### Các thao tác khác

| Thao tác | Người giao | Người thực hiện | Người theo dõi | Thành viên khác | Quản trị |
| --- | --- | --- | --- | --- | --- |
| Sửa tiêu đề, mô tả, hạn | được | được | không | không | không |
| Đổi người thực hiện | được | không | không | không | không |
| Gắn, gỡ bản ghi | được | được | không | không | không |
| Thêm, bỏ người theo dõi khác | được | được | không | không | không |
| Tự theo dõi, tự bỏ theo dõi | — | — | tự bỏ | tự theo dõi | tự theo dõi |
| Xoá (chỉ khi chưa có lịch sử) | được | không | không | không | không |

«Thành viên khác» và «quản trị» ở bảng này là người THẤY được việc — tức việc gắn bản ghi đối tác. Việc riêng
thì họ không thấy, mọi lệnh ghi của họ dừng ở bước 1.

### Cột đo `roiChuaLamLuc`

Ghi một lần, trong cùng giao dịch đổi trạng thái, khi và chỉ khi: người đổi là người thực hiện của việc lúc đó,
nguồn là Chưa làm, và đích thuộc Đang làm, Chờ đánh giá, Xong. Người giao tự bấm «Bắt đầu» hay Huỷ không ghi
cột này. Lý do: ngưỡng đã ký nói «được người thực hiện chuyển khỏi Chưa làm» (`opportunity.md`).

### Quyền xem — P3 thu hẹp cho lượt này

Lộ trình ghi «quyền P3» (`lo-trinh-viec-du-an.json`, DA1). P3 nói phạm vi của việc là phạm vi chặt nhất của
những gì nó gắn. Lượt này việc chỉ gắn được bốn loại bản ghi đối tác (KR là DA5), nên còn hai ca:

- **Việc gắn ít nhất một bản ghi đối tác** → phạm vi đối tác. Thấy được nếu vai đọc được phạm vi đối tác.
  Dữ liệu đối tác của kho không chia theo người sở hữu (`deals.service.ts:906-919`), nên ai đọc được bản ghi
  gắn thì thấy việc — đúng như việc cần làm hôm nay.
- **Việc không gắn gì** → riêng tư. Chỉ người giao, người thực hiện, người theo dõi thấy. Quản trị không thấy.

Một điều kiện Prisma `dieuKienXemViec(userId)` dùng ở MỌI lời đọc (một việc, lịch sử, danh sách, khối việc
của bản ghi, nhắc, Tổng quan cả hai phạm vi) và là bước 1 của MỌI lệnh ghi, như `dieuKienXemMucTieu` của OKR
(`docs/api.md` mục OKR). Id không thấy và id không có trả cùng một lời «Không có việc nào mang mã …».

Router `viec` khai `PhamViDoiTacMiddleware`: người vai «chỉ OKR» bị chặn ở cửa (đóng mặc định). Hệ quả: lượt
này họ không có Việc nào, kể cả việc riêng (Hỏi-3). Nên mọi đường đặt người vào việc — người thực hiện, người
theo dõi, đích chuyển việc — đều qua `kiemNguoiNhanViec` của DA0a (`onboarding-ghi.ts:108-132`, chuyển sang
`packages/db` để `viec-ghi.ts` dùng chung) và từ chối vai «chỉ OKR» với lời của DA0a.

Đổi vai sang «chỉ OKR» (`workspace.service.ts:264-273`): `demViecDangGiu` đếm thêm việc đang mở (Chưa làm,
Đang làm, Chờ đánh giá) người đó thực hiện hoặc giao; lớn hơn 0 → 409 như bước và kế hoạch. Mọi lượt theo
dõi việc của họ (việc mở lẫn đã khép) bị gỡ cùng giao dịch với lượt theo dõi kế hoạch. Việc đã khép họ từng
thực hiện giữ nguyên tên họ — đó là lịch sử, họ không đọc được nó, và bước 4 của thứ tự kiểm chặn việc ấy mở
lại về tay họ.

### Việc của tôi

Màn mới `/[slug]/viec`, tên «Việc của tôi», mục thứ hai của thanh trái (sau Tổng quan). Ẩn với vai «chỉ OKR»
(thanh trái chỉ hiện mục trong `RAIL_CHI_OKR`; đường dẫn thêm vào `KHU_DOI_TAC` của `pham-vi-man.ts` để proxy
đưa họ sang `/ngoai-pham-vi`).

- Ba nhóm: **Giao cho tôi** (người thực hiện là tôi) · **Tôi giao** (người giao là tôi, người thực hiện là
  người khác) · **Đang theo dõi**. Chọn nhóm bằng `ToggleGroup variant="outline" size="sm"`, giá trị ghi lên
  đường dẫn bằng `nuqs` (`?nhom=`), số đếm từng nhóm là chữ phụ `tabular-nums` — nếp «Chip lọc» của
  `docs/design.md`.
- Mặc định chỉ việc đang mở, xếp theo hạn: quá hạn trước, rồi hôm nay, rồi sau, việc không hạn cuối. Cuối danh
  sách hai dòng gập «Đã xong (n)» và «Đã huỷ (n)» — nếp «Danh sách có nhóm, bản ghi có kết cục nghiệp vụ» của
  `docs/vong-doi.md`. Số đếm chỉ đếm việc đang mở.
- Từ `md` trở lên: `SimpleTable surface="page"` (tiêu đề · trạng thái · hạn · bản ghi gắn · người giao hoặc
  người thực hiện tuỳ nhóm). Dưới `md`: cùng dữ liệu thành `Item variant="outline"`.
- Nút chính duy nhất ở đầu trang: «Giao việc» — mở ô soạn việc không gắn sẵn bản ghi nào.

### Khung việc

Loại khung mới `viec` trong `record-stack.ts` (cạnh `plan`, `kr`…), mở bằng `?record=viec:<id>` như mọi khung.
Đầu khung: tiêu đề, trạng thái (nút đổi trạng thái chỉ hiện những bước người xem được làm — bảng trên), hạn,
người giao, người thực hiện, người theo dõi, các bản ghi gắn (bấm mở khung bản ghi đó). Hai thẻ: «Chi tiết»
(mô tả, gắn/gỡ) và «Lịch sử» (vết, mới nhất trước, mỗi dòng: ai · làm gì · lúc nào · từ đâu).

### Trên dòng thời gian của bản ghi

Thẻ «Hoạt động» của bốn khung bản ghi có thêm **khối «Việc» ghim đầu thẻ**: việc đang mở gắn bản ghi đó, xếp
theo hạn, mỗi dòng mở khung việc; dòng gập «Đã xong (n) · Đã huỷ (n)». Khối của công ty gồm cả việc gắn thoả
thuận, cá nhân, kế hoạch của công ty đó (như việc cần làm hôm nay hiện ở công ty khi gắn thoả thuận). Mỗi việc
một dòng dù gắn nhiều bản ghi của cùng công ty. Dòng sự kiện bên dưới không đổi.

Vì sao khối ghim chứ không trộn vào dòng sự kiện (Hỏi-1): `activities.timeline` là một `findMany` trên bảng
`activity` phân trang bằng con trỏ id (`activities.service.ts:83-108`); trộn nguồn thứ hai buộc đổi con trỏ
sang hai nguồn và việc tạo từ tuần trước trôi khỏi tầm mắt. Việc là thứ phải làm, nên nó đứng trên.

Ô soạn của dòng thời gian (`activity-composer.tsx`): loại «Việc cần làm» thay bằng «Việc» — thêm ô người thực
hiện (mặc định mình, `Combobox` đọc `onboarding.nguoiNhanViec` — đã lọc vai ở DA0a), hạn, người theo dõi. Gửi
đi gọi `viec.create` gắn đúng bản ghi đang mở. Việc cần làm cũ vẫn hiện và vẫn đánh dấu xong được như hôm nay
cho tới hàng DA1b (Hỏi-4).

### Tổng quan

Khối «Việc quá hạn» (`dashboard.service.ts:161-173`, `dashboard-summary.tsx:168-182`) gộp thêm việc quá hạn
có người thực hiện là tôi (phạm vi «của tôi»), hay mọi việc quá hạn tôi thấy (phạm vi «mọi người»), cạnh bước
và việc cần làm cũ. Số `quaHan` cộng thêm số việc.

### Nhắc buổi sáng và «xong n»

Bộ gom `viecCanNhac` (`packages/db/src/onboarding-nhac.ts`) thêm ba loại, vào `THU_TU_NHAC` (bộ kiểm đủ ở kiểu
bắt thiếu):

| Loại | Gửi ai | Khi nào |
| --- | --- | --- |
| `viec-qua-han` | người thực hiện | việc đang mở, hạn trước đầu ngày hôm nay |
| `viec-sap-han` | người thực hiện | việc Chưa làm hay Đang làm, hạn trong `NHAC.sapHanNgay` (3) ngày tới |
| `viec-cho-danh-gia` | người giao (khác người thực hiện) | việc ở Chờ đánh giá |

Nguồn việc có cổng vai riêng (`gop` không lọc vai — báo cáo đọc mã 13/10): chỉ gom cho thành viên
`docDuocDoiTac` của `@crm/db/vai-doi-tac` — đúng luật và đúng hàm DA0a dùng cho bốn loại nhắc kế hoạch, không
so chuỗi vai riêng. Dữ liệu cũ có người vai «chỉ OKR» nằm trong việc gắn đối tác vẫn không ra dòng nhắc nào
(AC-8, tiêu chí riêng theo đề nghị của Mac Studio ở #375). Thêm ba loại vào `mucNhac` (`packages/validation/src/nhac-ke-hoach.ts`), `maViec` và
`duongMo` (`apps/agent/agent/lib/nhac-ke-hoach.ts`), `TIEU_DE` và `dong` (`tin-nhac.ts`) — dòng tin: tiêu đề
việc · hạn · tên bản ghi gắn đầu tiên.

«xong n» trên một dòng việc (`tra-loi-nhac.ts`): người nhắn là người thực hiện của dòng `viec-qua-han`/
`viec-sap-han`, hay người giao của dòng `viec-cho-danh-gia` → `viec-ghi.ts` đặt Xong với `nguon: "zalo"`.
Việc đã khép → lời «đã xong từ trước». Người nhắn không còn quyền → lời từ chối, không ghi gì.

Thẻ «Việc của bạn» bên OKR không đổi: `okr.viecCuaToi` lọc `laViecOkr` nên loại mới không lọt vào
(`okr-trao-doi.service.ts:281`).

### Chuyển việc khi nghỉ

Hộp «Chuyển việc» ở màn Thành viên (`chuyen-viec-dialog.tsx` → `onboarding.transferPreview` /
`transferWork`) chuyển thêm việc đang mở. Số việc đang giữ của một người đếm bằng MỘT hàm `demViecMoCua` ở
`packages/db/src/viec.ts`, dùng chung cho `transferPreview` và `demViecDangGiu` của đổi vai — để hai chỗ không
lệch nhau (Ngoài-3 của DA0a ghi đúng lớp lỗi này cho kế hoạch và bước; phần kế hoạch và bước giữ nguyên ở lượt
này). DA1 chỉ sửa thân `transferPreview` và `transferWork` của `onboarding-ghi.ts`; không đụng
`kiemNguoiNhanViec`, đường mở lại kế hoạch hay bỏ «xong» bước — vùng DA0b. người thực hiện là người rời → người nhận; người giao là người rời →
người nhận. Xem trước nêu thêm số việc. Một giao dịch, mỗi việc một dòng vết `chuyen-viec`. Việc đã khép
không đổi. Đích vai «chỉ OKR» vẫn bị từ chối như DA0a. Mục từ điển «Chuyển việc 30 ngày» đổi tên «Chuyển
việc» và nói thêm việc.

### Vòng đời — ba câu của `docs/vong-doi.md`

1. **Dọn thế nào:** Xoá khi chưa có lịch sử; còn lại khép bằng kết cục nghiệp vụ Xong hoặc Huỷ, mở lại được.
2. **«Lịch sử» nghĩa là:** việc có bất kỳ dòng vết nào ngoài dòng «tạo». Hàm kiểm ở `viec-ghi.ts`, chạy lại
   trong giao dịch xoá; nút Xoá chỉ hiện khi hàm trả «chưa có».
3. **Danh sách mặc định:** việc đang mở. Xong và Huỷ ở dòng gập cuối danh sách (Việc của tôi, khối việc của
   bản ghi). Dòng đã khép mờ, nhãn riêng.

Bản ghi cha bị xoá vĩnh viễn: hàng `ViecGan` đi theo cascade, việc còn; một dòng vết `go-do-ban-ghi-xoa` ghi
tên bản ghi đã mất (ghi trước khi xoá, trong `purge` của từng loại bản ghi). Việc mất hết bản ghi gắn thành
việc riêng.

### Đường đo

`_acceptance/viec-chung/rang/do-nguong.mjs` — chạy trong giao dịch `READ ONLY` như thước DA0a, in JSON hai số.
Đường dẫn suy từ vị trí của chính script, không ghi cứng gốc kho.

- `viecGiaoNguoiKhac` — việc tạo trong cửa sổ `--tu`/`--den` có người thực hiện khác người tạo, TRỪ việc người
  giao đã Huỷ khi `roiChuaLamLuc` còn trống (người giao rút việc trước khi người thực hiện kịp chuyển — Hỏi-5).
  `tong`, `roiChuaLamDungHan` (khi `roiChuaLamLuc <= cuối ngày hanNgay` giờ VN; việc không hạn: `roiChuaLamLuc`
  nằm trong cửa sổ là tính), `tiLe`.
- `viecDoiTacTaiVaiChiOkr` — việc ĐANG MỞ gắn bản ghi đối tác có người thực hiện hay người theo dõi mang vai
  `okr`. Phải bằng 0; khác 0 thì thoát 2. Việc đã khép không đếm (Hỏi-5).

Đo thật trên production là việc sau khi gộp (`CLAUDE.md` mục «Lộ trình là việc dựng»). Lượt này chứng thước
đếm đúng trên dữ liệu mẫu có đáp án hai chiều. `bun run db:seed` gieo việc mẫu qua `viec-ghi.ts` (đường ghi
thật), có cả việc đúng hạn, trễ hạn, việc tự giao, việc người giao tự bấm «Bắt đầu», và việc người giao Huỷ.

## Ngoài lượt này

- **DA1b — chép việc cần làm cũ sang Việc** và đổi hai đường Tác nhân còn ghi việc cần làm
  (`run-runtime.ts:317-338` qua `create_crm_activity`, `ma-lech.ts:65-82`), rồi bỏ loại «Việc cần làm» khỏi
  dòng thời gian, `activities.complete`, `activities.myTasks`. Đề xuất tách thành hàng riêng ngay sau DA1
  (Hỏi-4): đó là lần sửa dữ liệu production, cần cổng của chính nó.
- Việc gắn KR (DA5), việc con và Kanban (DA2), việc sinh từ khuôn kế hoạch (DA3), dự án và Gantt (DA4),
  trưởng phòng thấy việc cấp dưới (DA7), AI đề xuất việc (DA8).
- Trạng thái tự đặt trong năm nhóm; bình luận, đính kèm; nhắc cho người theo dõi; thao tác hàng loạt; tìm việc
  trong ô tìm kiếm chung; đẩy việc ra lịch Google/Outlook.

## Rủi ro

- **Trùng vùng DA0b** (đợt r2, mốc 16/10): DA0b sửa đường mở lại kế hoạch và bỏ «xong» bước trong
  `onboarding-ghi.ts` / `onboarding-buoc.ts`. DA1 sửa `kiemNguoiNhanViec` (dời sang `packages/db`),
  `transferPreview`/`transferWork` cùng tệp, và `demViecDangGiu` ở `workspace`. Gộp sau DA0b: khi DA0b vào
  `onehub`, gộp `onehub` vào nhánh bằng merge (không rebase — rebase làm mất pin của chữ ký và bằng chứng).
- **Bộ gom nhắc là đường nóng**: một loại thiếu nhánh ở `maViec` làm hỏng cả lô phút đó
  (`nhac-ke-hoach.ts:98-105`). Mỗi loại mới có test riêng qua `lenLichNhac` thật.
- **Migration T3**: bảng mới, không sửa bảng cũ, không chép dữ liệu. Đảo được bằng migration xoá bốn bảng.
  Tên thư mục lấy giờ UTC thật lúc tạo; đợt r2 cũng có thể thêm migration (V2b, l3b), nên kiểm `origin/onehub`
  ngay trước mỗi lần đẩy và đặt lại mốc nếu bị vượt.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: khung thoả thuận › thẻ Hoạt động → ô soạn, chọn «Việc» → gõ tiêu đề, chọn người thực hiện, hạn →
  «Giao việc» → việc hiện ở khối «Việc» đầu thẻ (điểm ra: khung thoả thuận). Người nhận: thanh trái › «Việc của
  tôi» → nhóm «Giao cho tôi» → bấm dòng → khung việc → «Bắt đầu» (Đang làm) → … → «Xong».
- Biên: chưa có việc nào (rỗng có lời mời «Giao việc»); người thực hiện mang vai «chỉ OKR» không có trong ô
  chọn; việc riêng không gắn gì chỉ người trong cuộc thấy; bản ghi gắn đã xoá vĩnh viễn — dòng «bản ghi đã bị
  xoá» trong lịch sử.
- Lỗi & quay lại: tạo hỏng → lời lỗi ngay dưới nút, ô soạn giữ chữ đã gõ; đổi trạng thái bị từ chối (vai vừa
  đổi) → toast nói ai được làm, trạng thái trên màn quay về; tải danh sách hỏng → `VungTaiLoi` có «Thử lại».

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Việc của tôi | thấy việc của mình cần làm gì tiếp | thanh trái, tin nhắc / khung việc |
| Khung việc | đổi trạng thái và xem việc đã đi qua những gì | Việc của tôi, khối việc, tin nhắc / bản ghi gắn |
| Ô soạn việc (dòng thời gian và nút «Giao việc») | giao một việc cho một người | thẻ Hoạt động, Việc của tôi / khối việc |
| Khối «Việc» đầu thẻ Hoạt động | thấy việc đang mở của bản ghi này | bốn khung bản ghi / khung việc |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-viec-cua-toi-cho-tai | Việc của tôi | tiêu đề và câu mô tả trang giữ nguyên, khung xương năm dòng cùng hình dòng việc | chờ |
| ST-viec-cua-toi-rong | Việc của tôi | `Empty`: «Chưa có việc nào giao cho bạn» + nút «Giao việc» | giao một việc |
| ST-viec-cua-toi-loi | Việc của tôi | `VungTaiLoi`: «Không tải được danh sách việc» + «Thử lại» | thử lại |
| ST-viec-cua-toi-co-viec | Việc của tôi | ba chip nhóm có số, bảng việc mở theo hạn, việc quá hạn mang chấm `error`, hai dòng gập cuối | bấm dòng mở khung việc |
| ST-viec-cua-toi-dien-thoai | Việc của tôi (375) | cùng dữ liệu thành danh sách `Item`, chip nhóm cuộn ngang | như trên |
| ST-khung-viec-nguoi-thuc-hien | Khung việc | nút trạng thái kế tiếp («Bắt đầu», «Gửi đánh giá», «Xong») | đổi trạng thái |
| ST-khung-viec-nguoi-giao-cho-danh-gia | Khung việc | «Xong» và «Làm lại» | duyệt hay trả lại |
| ST-khung-viec-chi-xem | Khung việc | không nút trạng thái; một dòng «Chỉ người giao và người thực hiện đổi được trạng thái» | theo dõi hay đóng |
| ST-khung-viec-lich-su | Khung việc › Lịch sử | vết mới nhất trước: ai · làm gì · lúc nào · từ đâu (màn, Zalo, chuyển việc) | đọc |
| ST-khung-viec-da-khep | Khung việc | nhãn «Đã xong» hay «Đã huỷ», ô chỉ đọc, nút «Mở lại» cho người giao | mở lại hay đóng |
| ST-o-soan-viec | Ô soạn (dòng thời gian) | tiêu đề, người thực hiện (mặc định «Tôi»), hạn, người theo dõi, nút «Giao việc» | gửi |
| ST-o-soan-viec-loi | Ô soạn | lời lỗi dưới nút, chữ đã gõ còn nguyên | sửa rồi gửi lại |
| ST-khoi-viec-ban-ghi | Thẻ Hoạt động | khối «Việc» đầu thẻ: việc mở theo hạn, «Đã xong (n) · Đã huỷ (n)» gập | mở khung việc |
| ST-khoi-viec-ban-ghi-rong | Thẻ Hoạt động | không hiện khối (không có việc nào, kể cả đã khép) | dùng ô soạn |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Tiêu đề bắt buộc, tối đa 200 ký tự; mô tả tối đa 4.000 ký tự. Hạn chọn bằng `DatePicker`, hiển thị theo giờ
  `Asia/Ho_Chi_Minh` bằng `Intl.DateTimeFormat`.
- Nút gửi giữ bật tới khi lệnh bắt đầu, rồi «Đang giao…». Đổi trạng thái chờ máy chủ trả lời mới đổi nhãn
  (không lạc quan) — quyền có thể vừa đổi.
- Chữ người nhập (tiêu đề, mô tả, tên bản ghi) mang `translate="no"`. Số đếm `tabular-nums`. Tiêu đề dài cắt
  một dòng ở bảng, xuống dòng ở khung việc.
- Nhóm đang chọn ở Việc của tôi và khung đang mở nằm trên đường dẫn (`nuqs`), F5 giữ nguyên chỗ.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `PageShell`, `ToggleGroup`, `SimpleTable`, `Item`, `Empty`, `VungTaiLoi` | dùng | nếp màn danh sách của `docs/design.md` |
| `StatusIndicator` + `toneTheoNghia` | dùng | Chưa làm `nhap`, Đang làm `dangChay`, Chờ đánh giá `cho`, Xong `xong`; Huỷ không chấm — nhãn mờ «Đã huỷ» |
| `DetailSheet`, `Tabs`, `Badge`, `Combobox`, `DatePicker`, `ConfirmDialog` | dùng | khung bản ghi và ô chọn người như bước kế hoạch |
| Khối «Việc» đầu thẻ Hoạt động | ghép | `SectionHeading` + `Item` trong `apps/app/components/viec/` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: hiển nhiên — Việc của tôi là danh sách, mỗi dòng mở khung việc như mọi khung bản ghi của kho
(`record-stack.ts`); không có khuôn thứ hai khả dĩ. Phiên không có công cụ tra mẫu thị trường; khảo sát DA0 đã
ghi «Việc của tôi chia theo vai và theo hạn» (Base, MISA AMIS, Fastwork, monday, Planner, Linear —
`docs/plan/viec-du-an-nghien-cuu.md` mục 3).
<!-- UX-SPEC-TEMPLATE>>> -->
