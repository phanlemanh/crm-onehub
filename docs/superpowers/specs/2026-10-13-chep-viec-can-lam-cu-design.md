# Chép việc cần làm cũ sang Việc; Tác nhân giao việc bằng Việc — thiết kế (DA1b)

Hàng DA1b của `docs/plan/lo-trinh-viec-du-an.json`, tách khỏi DA1 ở Cổng Phạm vi 13/10 (Hỏi-4 của
`_acceptance/viec-chung/decisions.jsonl`). Cổng Đáng: chủ kho ký «build» 13/10, ngưỡng ở
`_acceptance/chep-viec-can-lam-cu/opportunity.md`. Hạng T3: thêm cột ở `packages/db/prisma` và sửa dữ liệu
production.

## Vấn đề

Từ DA1, kho có hai loại việc. **Việc** (bảng `viec`) có người giao, người thực hiện, nhắc buổi sáng.
**Việc cần làm** cũ là một hàng `activity` loại `TASK`: chỉ có người tạo, ai cũng đánh dấu xong được, không
nhắc ai. Ô soạn đã thôi tạo việc cần làm (DA1), nhưng còn ba đường ghi và ba chỗ hiện:

| Đường ghi `TASK` còn sống | Chỗ |
| --- | --- |
| `activities.create` nhận `type: TASK` | `apps/api/src/activities/activities.contracts.ts:10` |
| Tác nhân tự dựng, hành động `crm.activity.create` loại `TASK` | `apps/agent/agent/lib/run-runtime.ts:274-325` |
| Việc «mã môi giới lệch» cho người cầm trịch kế hoạch | `apps/agent/agent/lib/ma-lech.ts:65-90` |

| Chỗ hiện `TASK` | Chỗ |
| --- | --- |
| Dòng thời gian: khối ghim việc mở, thẻ «Sắp tới», «Đã xong», ô tích | `timeline.tsx`, `timeline-entry.tsx`, `activities.service.ts:127-150, 294-311` |
| Tổng quan, khối «Việc quá hạn» (có ô tích) | `dashboard.service.ts:68-73, 169-181`, `dashboard-summary.tsx:134-138, 338-345` |
| `activities.myTasks` (không màn nào gọi, chỉ khoá bộ nhớ) | `activities.service.ts:213-238`, `lib/trpc/cache.ts:84` |

## Hướng: dời theo «mở rộng → dời → thu hẹp», giữ bản gốc

1. **Mở rộng**: thêm hai cột cho `Viec` (migration), thêm hai nguồn vết.
2. **Dời đường ghi**: ba đường ghi `TASK` thôi ghi `activity`. Hai đường của Tác nhân ghi Việc qua `taoViec`;
   `activities.create` từ chối `TASK`.
3. **Dời dữ liệu**: lệnh `bun run viec:chep-cu` chép từng việc cần làm cũ thành một Việc. Hàng gốc **không**
   bị xoá hay sửa.
4. **Thu hẹp chỗ hiện**: việc cần làm đã chép thì không hiện ở đâu nữa (nó đã là Việc). Việc cần làm CHƯA chép
   vẫn hiện trên dòng thời gian và ở Tổng quan, chỉ đọc. Nhờ vậy:
   - Không có khoảng nào việc biến mất. Giữa lúc bản mới lên production và lúc lệnh chép chạy, việc cũ vẫn
     hiện.
   - Đảo chỉ là việc dữ liệu: xoá bản chép thì việc cũ tự hiện lại, không cần lùi mã.
   - Việc nào lệnh chép bỏ sót (lỗi giữa chừng) vẫn hiện, không mất lặng.

Xoá hẳn loại `TASK` và hàng gốc là hàng lộ trình sau, khi vế 14 ngày của ngưỡng đã đọc.

## Dữ liệu

Migration `<UTC>_chep_viec_can_lam` (chỉ thêm, không sửa bảng cũ):

- `viec."activityGocId" TEXT NULL UNIQUE`, khoá ngoại tới `activity(id)` `ON DELETE SET NULL`. Prisma: quan hệ
  `Viec.activityGoc Activity?` và `Activity.viecChep Viec?`. Câu «việc cần làm đã chép» là `viecChep: { isNot:
  null }`; ràng buộc unique là thứ làm lệnh chép chạy lại không nhân bản.
- `viec."khoaNguon" TEXT NULL`, chỉ mục thường. Chỉ ma-lech dùng hôm nay: `ma-lech:<mã môi giới>`. Việc không có
  `meta` như `activity`, nên chặn giao trùng cần một cột có tên.
- `NGUON_VIEC` (`packages/db/src/viec.ts`) thêm `tac-nhan` và `chep-cu`. Cột `viecVet.nguon` là chuỗi, không
  đổi kiểu.

Đảo không dựa vào `activityGocId` (cột thành null nếu hàng gốc bị xoá theo công ty): bản chép nhận ra bằng vết
«tao» mang `nguon: "chep-cu"`.

## Một việc cần làm thành một Việc

Hàm mới `chepViecCanLam(tx, { activityId, nguoiChayId, now })` trong `packages/db/src/viec-ghi.ts` — mọi lệnh
ghi Việc vẫn một chỗ. Một giao dịch mỗi việc.

| Việc mới | Lấy từ việc cần làm |
| --- | --- |
| `tieuDe` | `subject`; trống thì dòng đầu của `body` cắt 200 ký tự; cả hai trống thì «Việc cần làm» |
| `moTa` | `body` khi `subject` có chữ; trống thì null |
| `hanNgay` | `dueAt` nguyên giá trị |
| `trangThai` | `completedAt` null → Chưa làm; có → Xong, `khepLuc = completedAt` |
| người giao, người thực hiện, người tạo | `createdById` — trừ ca ở mục dưới |
| `taoLuc` | `createdAt` |
| gắn (`ViecGan`) | mỗi cột khác null trong `companyId`, `contactId`, `dealId`, `planId` thành một hàng gắn |
| `activityGocId` | `id` |
| `khoaNguon` | `ma-lech:<meta.platformBrokerId>` khi `meta` có khoá đó |
| vết | đúng một vết «tao», `luc = createdAt`, `nguoiId = createdById`, `nguon = "chep-cu"`; `sau` theo khuôn «tao» thêm `trangThai` và `activityGocId` |
| `roiChuaLamLuc` | null — việc cũ không có người thực hiện riêng, và nằm ngoài cửa sổ đo của DA1 |

Việc chép đã Xong không có vết nào ngoài «tao», nên theo luật vòng đời người giao xoá được nó — đúng như việc
cần làm đã xong không có lịch sử nào khác.

### Người tạo không còn nhận được việc

`createdById` của `activity` bắt buộc và khoá ngoại tới `user` không cho xoá người còn hàng (mặc định
`Restrict`), nên người tạo luôn còn một hàng `user`. Nhưng `kiemNguoiNhanViec` từ chối người vai «chỉ OKR» và
người không còn trong tổ chức, với MỌI người thực hiện — việc gắn đối tác, chỉ gắn kế hoạch hay không gắn gì.
Luật chép (Hỏi-2):

| Việc cần làm | Người tạo nhận được việc | Người tạo không còn nhận được việc |
| --- | --- | --- |
| đang mở | người tạo giữ cả ba cột | người chạy lệnh (`--nguoi <email>`, phải là quản trị) thành người giao và người thực hiện; `taoBoiId` vẫn là người tạo; vết «tao» ghi `nguoiTaoGoc` |
| đã xong | người tạo | người tạo — lịch sử, như DA1 giữ tên người cũ ở việc đã khép |

Việc đã xong ghi thẳng, không qua `kiemNguoiNhanViec`.

### Lệnh `bun run viec:chep-cu`

`packages/db/scripts/chep-viec-can-lam.ts`, khai ở `packages/db/package.json` và gốc kho. Lệnh chỉ đọc cờ và in;
vòng lặp `demViecCanLam`, `chepTatCa`, `daoTatCa` ở `packages/db/src/viec-chep.ts` (bài kiểm gọi đúng các hàm
ấy), mỗi lần ghi gọi `chepViecCanLam` hay `xoaBanChep` của `viec-ghi.ts`. Ba chế độ, cùng một bản in JSON:

| Chế độ | Ghi | In |
| --- | --- | --- |
| (không cờ) — đếm | không, chạy trong giao dịch `READ ONLY` | `taskTong`, `taskMo`, `taskXong`, `daChep`, `chuaChep`, `banChep`, `banChepDaDoi`, `nguoiTaoKhongNhan`, và `taskTaoSau` khi có `--tu <ISO>` |
| `--chay --thu --nguoi <email>` — chạy thử | không: chép trọn trong một giao dịch ngoài rồi `ROLLBACK` | như `--chay`, kèm `thu: true` — danh sách `loi` là những việc sẽ hỏng khi chạy thật |
| `--chay --nguoi <email>` | chép mọi việc cần làm chưa chép, mỗi việc một giao dịch | `truoc` (số đếm), `chep` (số chép được), `loi` (mã, lý do từng việc), `sau` (số đếm, đọc sau khi mọi giao dịch ghi đã xong) |
| `--dao` | xoá mọi bản chép chưa đổi; bản đã đổi chỉ xoá khi thêm `--ca-ban-da-doi` | số đếm trước, số xoá, số giữ lại vì đã đổi, số đếm sau |

- Cơ sở dữ liệu không phải máy cục bộ → `--chay` và `--dao` từ chối nếu thiếu `ALLOW_REMOTE_DB=1`, cùng bộ chặn
  của `db:migrate` (`packages/db/src/kho-cuc-bo.ts`). Đếm không cần cờ — nó không ghi gì.
- «Bản chép đã đổi» = Việc có vết khác «tao».
- `--nguoi` tìm người theo email trong tổ chức; vắng, không thấy, hay không phải quản trị → thoát khác 0 với lời
  có chữ «quản trị», trước khi ghi gì.
- `chepTatCa` nhận hàm chép một việc làm tham số, mặc định `chepViecCanLam` — chỗ bài kiểm cấy một lỗi giữa
  danh sách.
- Chạy lại `--chay` không nhân bản: việc đã có bản chép bị bỏ qua, và unique của `activityGocId` chặn hai lệnh
  chạy cùng lúc.

Trên production (Hỏi-1): chủ kho chạy ngay sau khi bản gộp lên production — đếm, chạy thử (`loi` phải rỗng),
`--chay`, đếm — rồi dán các bản in vào #375. Vế đầu của ngưỡng đọc thẳng từ đó: `banChep` sau = `taskTong` trước, `taskTong` sau =
`taskTong` trước. Vế 14 ngày: `bun run viec:chep-cu --tu <ngày gộp>`, `taskTaoSau` phải bằng 0.

### Thứ tự lên và thứ tự lùi

- **Lên**: bốn dự án Vercel dựng từ cùng một commit; `prisma migrate deploy` chạy lúc dựng `crm-onehub-api`
  (`docs/production.md`). Hai cột mới phải có trước khi app hay agent của bản mới nhận lượt đầu: lời đọc dòng
  thời gian hỏi `viecChep`, ma-lech ghi `khoaNguon`. Chủ kho đợi deployment của api xong (`✓ schema matches`)
  rồi mới chạy lệnh chép. Bản app hay agent lên trước api vài phút thì lời đọc dòng thời gian và ma-lech lỗi
  trong vài phút đó — cùng rủi ro mọi migration của kho, ghi ở `docs/production.md`.
- **Lùi chỉ dữ liệu**: `--dao` (thêm `--ca-ban-da-doi` khi muốn bỏ cả bản đã đổi) — việc cũ tự hiện lại chỉ đọc.
- **Lùi cả mã** về trước DA1b: chạy `--dao` TRƯỚC khi lùi. Lùi mã khi bản chép còn thì một việc hiện hai lần —
  hàng gốc có ô tích ở dòng thời gian, bản chép ở Việc của tôi và tin nhắc — và ma-lech cũ chỉ đọc `meta` nên
  giao trùng. Hai cột mới để lại vô hại cho mã cũ.

## Mọi chỗ còn nói `TASK` sau vòng này

Ma trận viết trước cho phép quét E14 (mã ngoài thư mục test, `ActivityType.TASK` hay chuỗi `"TASK"` của loại
hoạt động). Không chỗ nào được GHI `activity` loại `TASK`.

| Tệp | Vai sau vòng |
| --- | --- |
| `apps/api/src/activities/activities.service.ts` | đọc (lọc việc chưa chép ở dòng thời gian) |
| `apps/api/src/activities/activities.contracts.ts` | khai loại đầu ra (`ALL_ACTIVITY_TYPES`) |
| `apps/api/src/dashboard/dashboard.service.ts` | đọc (việc cũ quá hạn chưa chép) |
| `packages/db/src/viec-chep.ts`, `packages/db/src/viec-ghi.ts` | đọc (nguồn chép) |
| `apps/agent/agent/lib/ma-lech.ts` | đọc (vế việc cũ chưa chép của chặn trùng) |
| `apps/agent/agent/lib/accounts.ts` | đọc (lịch sử bản ghi cho Tác nhân) |
| `apps/agent/agent/lib/run-runtime.ts` | so loại được xin với bản khai; nhánh `TASK` ghi Việc |
| `apps/agent/agent/lib/builder-runtime.ts`, `subagents/agent_builder/lib/draft-input.ts`, `packages/validation/src/agent-manifest.ts`, `subagents/agent_runner/tools/create_crm_activity.ts` | khai quyền và khuôn lời gọi, không ghi |
| `apps/app/**` | biểu tượng và nhãn của dòng chỉ đọc |

## Đường ghi

### `activities.create`

`TASK` ra khỏi `COMPOSABLE_TYPES`; gọi với `TASK` trả 400 do Zod (lời có tên loại). Ô soạn đã không đưa ra loại
này từ DA1.

### Tác nhân tự dựng — hành động `crm.activity.create` loại `TASK`

- Bản khai quyền (`packages/validation/src/agent-manifest.ts`) GIỮ chữ `"TASK"`: bản khai đã lưu của các Tác
  nhân trên production mang chữ này, đổi khuôn là làm chúng không đọc được (luật đọc ở biên của `AGENTS.md`).
  Nghĩa của nó từ nay: «được giao Việc trên bản ghi».
- `createRunActivity` với `TASK`: trong cùng giao dịch đã giữ chỗ hành động, gọi `taoViec` với `nguoiId =
  run.initiatedById ?? agent.createdById` (đúng người hôm nay đứng tên `createdById`), người thực hiện là chính
  người đó, gắn bản ghi đích, `hanNgay = dueAt`, `nguon: "tac-nhan"`. Hành động ghi `externalId = viec.id`.
  Không hàng `activity` nào được tạo. `NOTE` không đổi.
- Người đó không nhận được việc (vai «chỉ OKR») → `LoiViec` thành lỗi có tên của hành động, không ghi gì.
- Công cụ không có ô người thực hiện; thêm ô là năng lực mới, ngoài câu giao (Later).
- Lời dặn của công cụ và `instructions.md` của `agent_runner` nói `TASK` là giao một Việc.

### ma-lech

`giaoViec` gọi `taoViec`: `nguoiId = plan.ownerId` (người cầm trịch, như hôm nay), gắn kế hoạch, `hanNgay =
dauNgayVN(now)`, tiêu đề và mô tả như hôm nay, `nguon: "tac-nhan"`, `khoaNguon = ma-lech:<mã>`. Chặn trùng
(`da-co-viec-mo`) khi có MỘT trong hai: Việc đang mở gắn kế hoạch đó mang cùng `khoaNguon`, hoặc việc cần
làm cũ đang mở **chưa chép** cùng kế hoạch và mã (khoảng giữa lúc bản mới lên và lúc chép). Việc đã Xong hay
Huỷ thì lần sau giao lại, như hôm nay. Người cầm trịch không nhận được việc → kết quả có tên, không ghi.

### Dữ liệu mẫu

`seed.ts` thôi gieo việc cần làm (không còn đường ghi thật nào cho nó); việc mẫu đi qua `gieoViecMau` như DA1.

## Chỗ hiện

- **Dòng thời gian**: lời đọc loại việc cần làm đã chép. Việc cần làm chưa chép hiện ở thẻ «Tất cả» theo giờ,
  chỉ đọc: biểu tượng, tiêu đề, hạn, không ô tích. Bỏ khối ghim việc mở, thẻ «Sắp tới», thẻ «Đã xong», và hai
  số đếm của chúng (Hỏi-4) — việc đang mở và đã khép của bản ghi nay ở khối «Việc» đầu thẻ (DA1).
- **Tổng quan**: khối «Việc quá hạn» chỉ còn việc cần làm cũ CHƯA chép, chỉ đọc; Việc quá hạn vẫn như DA1.
  `quaHan.viec` đếm cùng điều kiện.
- **Bỏ** `activities.complete` và `activities.myTasks` (router, service, contracts, `generated/server.ts`, khoá
  bộ nhớ). Hai bài kiểm của hồ sơ khác gọi tên `myTasks` trong danh sách thủ tục (`go-la-cat-quyen.spec.ts`,
  `vai-chi-okr.spec.ts`) đổi theo.
- Việc chép hiện ở khối «Việc» của bản ghi, Việc của tôi, Tổng quan, nhắc buổi sáng như mọi Việc — không mã mới.

## Eval cũ thay bởi hồ sơ này

`activities.myTasks` bỏ ở vòng này (AC-6), nên eval đo nó ở hồ sơ đã ký mất vật đo. Hồ sơ này nhận việc
thay, theo luật «eval thay bởi» của kit (2.24):

| Eval cũ | Đo gì | AC mới |
| --- | --- | --- |
| han-viec-theo-ngay/E4 | hai khung `overdue`, `upcoming` của `activities.myTasks` | AC-6 (thủ tục không còn; việc quá hạn đọc ở Việc và Tổng quan) |

Răng `khong-xoa-expect` của `dieu-phoi-va` cho phép đúng hai câu `expect` của ca `viec-cua-toi` trong
`apps/api/test/han-viec.spec.ts` (khoá `khung("overdue")` và `T3:co(g.T3.id)` trong `CHO_PHEP`).

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: khung thoả thuận › thẻ Hoạt động → khối «Việc» đầu thẻ có các việc cũ đã chép → bấm một dòng → khung
  việc (điểm ra: khung việc).
- Biên: bản ghi có việc cần làm chưa chép (giữa lúc bản mới lên và lúc chép) — dòng chỉ đọc trong thẻ «Tất cả»;
  đường dẫn cũ `?tab=upcoming` hay `?tab=done` về thẻ «Tất cả».
- Lỗi & quay lại: không có thao tác ghi mới trên màn; tải dòng thời gian hỏng giữ nguyên lối thử lại hôm nay.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Thẻ Hoạt động của bản ghi | thấy chuyện đã xảy ra với bản ghi, việc ở khối đầu thẻ | bốn khung bản ghi / khung việc |
| Tổng quan › Việc quá hạn | thấy việc quá hạn của mình | thanh trái / khung việc |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-dong-thoi-gian-da-chep | Thẻ Hoạt động | thanh thẻ chỉ còn «Tất cả», «Ghi chú», «Email», «Cuộc họp»; việc cũ nằm trong khối «Việc» | mở khung việc |
| ST-dong-thoi-gian-chua-chep | Thẻ Hoạt động | dòng việc cần làm chỉ đọc theo giờ: tiêu đề, hạn, không ô tích | đọc |
| ST-tong-quan-viec-cu-chua-chep | Tổng quan | dòng việc cần làm quá hạn chỉ đọc, không ô tích, cạnh Việc quá hạn | đọc |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Tham số `tab` của `nuqs` chỉ nhận bốn giá trị còn lại; giá trị cũ rơi về mặc định.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `TimelineEntry`, `Tabs` | dùng | chỉ gỡ ô tích và hai thẻ, không thêm gì |
| `KhoiViec`, `DongViecTongQuan` | dùng | việc chép là Việc, hiện bằng thành phần của DA1 |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: lượt này không đổi khuôn; thẻ Hoạt động vẫn là danh sách mở khung chi tiết như DA1 — luồng hiển nhiên,
không tra.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ba câu vòng đời (`docs/vong-doi.md`)

Việc chép là Việc: Xoá khi chưa có lịch sử, còn lại khép bằng Xong hay Huỷ. Việc cần làm cũ không còn nút nào
— nó chỉ đọc cho tới khi được chép. Danh sách mặc định không đổi so với DA1.

## Ngoài lượt

- Ô người thực hiện cho công cụ của Tác nhân; Tác nhân đọc Việc khi tóm tắt lịch sử bản ghi; xoá loại `TASK`
  và hàng gốc; đổi nhãn tiếng Anh của bộ dựng Tác nhân.
- Hạt giống «Chuyển việc 30 ngày không làm mới Việc» (`docs/plan/2026-10-13-hat-giong-chuyen-viec-lam-moi-viec.md`)
  — không đụng; lượt này không chạm `cache.workTransferred`.
