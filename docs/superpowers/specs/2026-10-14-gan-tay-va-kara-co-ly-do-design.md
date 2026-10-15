# L4 — Gắn tay và Kara có lý do

Hàng L4 của `docs/plan/lo-trinh-okr.json`, câu giao: «Căn chỉnh gắn bằng tay và căn chỉnh Kara đề xuất đều mang lý
do». Cổng Đáng ký `build` 12/10. Đứng trên L1 (#348: cột `lyDo`/`canCu`/`lyDoTuKara`, `mucTin`), L2 (#384: lý do
trên sheet, bảng mức tin → nghĩa `NGHIA_MUC_TIN`), L3 (#390: lý do trên cây) và K3 (#342: góp ý của Kara có Hoàn
tác). Nguồn: bản vẽ trước/sau của phiên Logic Tree 08/10, mục 01 và 02
(`.acceptance-runs/dieu-phoi-sau-14-10/tai-lieu/ly-do-can-chinh/truoc-sau-ly-do-can-chinh.html`).

## Vấn đề

L1–L3 đã có chỗ lưu và chỗ hiện lý do, nhưng hai đường sinh ra căn chỉnh hằng ngày vẫn ghi căn chỉnh trống lý do:

- **Gắn tay** (sheet mục tiêu → tab Căn chỉnh → «Gắn thêm», `hop-thoai-can-chinh.tsx`): hộp thoại chỉ chọn đích.
- **Đề xuất của Kara** (nhóm góp ý trên mục tiêu, loại `can-chinh`): Kara đã viết `lyDo` cho mỗi dòng (bắt buộc ở
  `dongGopY`), nhưng `TroLyOkrService.ghiTheoDong` (`tro-ly.service.ts`) gọi `addAlignmentTrong` không kèm lý do, nên
  nhận đề xuất ra một căn chỉnh «Chưa có lý do». Đề xuất cũng không có căn cứ và không có đường sửa lý do trước khi
  nhận.

Căn chỉnh đã có cũng không có đường nào để thêm hay sửa lý do sau khi gắn.

## Thiết kế

### Luật chung của một lý do (một chỗ, dùng ở cả app và API)

Module mới `packages/validation/src/ly-do-can-chinh.ts` (nhập theo đường con `@crm/validation/ly-do-can-chinh`):

- `MUC_TIN_CAN_CHINH`, `mucTinCanChinh(lyDo, canCu)` chuyển từ `apps/api/src/okr/can-chinh.ts` sang đây; `can-chinh.ts`
  xuất lại, nên mọi chỗ đang nhập từ nó không đổi. App dùng cùng hàm để hiện mức tin trước khi lưu.
- `lyDoCanChinhNhap` (Zod): `lyDo`, `canCu` — chuỗi, cắt khoảng trắng hai đầu; rỗng sau khi cắt thành `null`; trần
  `LY_DO_CAN_CHINH.lyDoToiDa` = 500 và `canCuToiDa` = 500 (cùng trần `viSao` của Soạn OKR, đường đã ghi vào `lyDo` ở
  L1); `canCu` có chữ mà `lyDo` rỗng → lỗi tên `can-cu-can-ly-do` (cùng luật bộ OKR mẫu đã có, `khuon.ts`).

### Gắn tay (bản vẽ mục 01)

- `alignmentInput` thêm `lyDo`, `canCu` không bắt buộc (theo `lyDoCanChinhNhap`); `addAlignment` ghi chúng với
  `lyDoTuKara = false`. Gọi cũ không gửi hai trường vẫn ra căn chỉnh `chua-co-ly-do` như nay.
- Hộp thoại thêm hai ô `Textarea` dưới ô chọn đích: «Vì sao mục tiêu này đẩy được đích đó» và «Căn cứ», mỗi ô một
  `FieldDescription` (lý do không bắt buộc; căn cứ để trống thì nhánh là «Đặt cược»), và một dòng mức tin
  (`StatusIndicator` với nhãn và `tone` của bảng L2) đổi theo chữ đang gõ.
- **Sửa lý do sau khi gắn:** tab Căn chỉnh thêm nút «Sửa lý do» trên mỗi dòng (người sửa được mục tiêu), mở cùng hộp
  thoại ở chế độ sửa (đích khoá, hai ô điền sẵn). Thủ tục mới `okr.suaLyDoCanChinh` (`PATCH /okr/alignments/{id}`):
  cùng cổng với `removeAlignment` (quyền sửa mục tiêu nguồn, chu kỳ ghi được, không `da-bo`/`cho-duyet`), ghi
  `lyDo`, `canCu`, đặt `lyDoTuKara = false` (một người đã sửa — `docs/ai-ux.md` §3), ghi một dòng vết
  `sua-ly-do-can-chinh` với giá trị cũ và mới. Lưu y nguyên chữ cũ thì không ghi gì (không vết, cờ Kara giữ nguyên).

### Đề xuất căn chỉnh của Kara (bản vẽ mục 02)

- `dongGopY` thêm `canCu` không bắt buộc (`nullable`, trần 200 như `lyDo` của Kara), chỉ hợp lệ trên dòng
  `can-chinh`. Bộ ghi của Kara (`nopDeXuatVao`, `apps/agent/agent/lib/okr/nop-de-xuat.ts`) lưu nó vào
  `OkrDeXuat.noiDung` (`{ canCu }`) — cột JSON đã có, không cần `migration`; `dongTuHang` đọc lại. Dòng cũ không có
  `noiDung` đọc ra `canCu = null`.
- Chỉ dẫn của `tro_ly_okr` thêm cho dòng `can-chinh`: `lyDo` nói vì sao mục tiêu này đẩy được đích; `canCu` chỉ khi
  khối dữ liệu có con số chống lưng (chép đúng số, luật 3 «không viết số không có trong dữ liệu»), không có thì để
  `null`.
- Nhận đề xuất (`troLyQuyet`, cách `nhan`) ghi `lyDo`, `canCu` của dòng với `lyDoTuKara = true`.
- Cách `sua` mở cho dòng `can-chinh`: `troLyQuyetInput` thêm `canCu` không bắt buộc; `giaTri` là lý do đã sửa. Ghi
  với `lyDoTuKara = false`, `giaTriCuoi` giữ lý do người duyệt, trạng thái dòng `sua`. Gửi y nguyên lý do và căn cứ
  của Kara (sau khi cắt khoảng trắng) thì xử như nhận: `lyDoTuKara = true`, trạng thái `nhan` — người chỉ mở ra đọc
  không làm mất dấu Kara.
- Cách sửa trên màn là câu hỏi Hỏi-4 ở Cổng Phạm vi: khuyến nghị hộp thoại căn chỉnh (dưới đây); lối khác là sửa tại
  dòng đề xuất bằng biến thể nhiều ô mới của `ProposedChange`.
- Màn (`DeXuatNeo`, `nhom-kara.tsx`): dòng `can-chinh` hiện mức tin (`StatusIndicator`), «Vì sao: …», «Căn cứ: …» (nếu
  có); ba nút «Căn chỉnh kèm lý do» (chính) · «Sửa lý do» (viền) · «Bỏ qua» (chữ). «Sửa lý do» mở hộp thoại căn
  chỉnh ở chế độ «nhận đề xuất» (đích khoá, hai ô điền sẵn chữ Kara); bấm «Căn chỉnh» gửi `troLyQuyet` cách `sua`.
  Biên nhận và Hoàn tác giữ như K3.

### Dữ liệu mẫu

Bộ OKR mẫu (`bun run okr:mau`) thêm một đề xuất căn chỉnh của Kara còn chờ, mang lý do và căn cứ, trên một mục tiêu
mẫu chưa căn chỉnh tới đích đó. Đề xuất vào qua bộ ghi thật của Kara (`nopDeXuatVao` trên một `AgentTask` loại
`okr-de-xuat` đã xếp như đường thật), không chèn thẳng bảng.

### Không làm ở hàng này

- Kara soạn nháp lý do ngay trong hộp thoại gắn tay (mục 01 «Kara soạn nháp») — cần một đường gọi Kara theo yêu cầu
  từ hộp thoại; Hỏi-1 ở Cổng Phạm vi, khuyến nghị tách hàng riêng.
- Điền lại lý do cho căn chỉnh đã nhận từ đề xuất của Kara trước bản này — cần `migration` (hạng T3) và ghi lên
  production; Hỏi-2, khuyến nghị hàng riêng.
- Màn Soạn OKR (mục 05: căn cứ và «Sửa rồi nhận» ở dòng căn chỉnh nháp).
- Đổi cách chọn đích, quyền xem, quyền sửa, tiến độ.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ (gắn tay): sheet mục tiêu → tab Căn chỉnh → «Gắn thêm» → chọn đích → gõ «Vì sao», tuỳ chọn «Căn cứ», thấy
  mức tin đổi → «Gắn» → hộp thoại đóng, dòng mới trong bảng, lý do hiện ở «Đường lý do» (L2) và cây (L3).
- Suôn sẻ (Kara): tab KR → nhóm «Kara» → dòng căn chỉnh có mức tin, Vì sao, Căn cứ → «Căn chỉnh kèm lý do» → biên
  nhận «Đã căn chỉnh theo Kara · Hoàn tác».
- Sửa trước khi nhận: «Sửa lý do» → hộp thoại điền sẵn chữ Kara, đích khoá → sửa → «Căn chỉnh» → biên nhận.
- Sửa sau khi gắn: tab Căn chỉnh → «Sửa lý do» trên dòng → hộp thoại chế độ sửa → «Lưu».
- Biên: không gõ gì → gắn như nay (chưa có lý do); gõ căn cứ mà không lý do → lỗi ngay dưới ô căn cứ, nút khoá;
  người không sửa được mục tiêu không thấy nút «Gắn thêm», «Sửa lý do».
- Lỗi & quay lại: máy chủ từ chối (chu kỳ khoá, mục tiêu bỏ, quá trần) → `FieldError` trong hộp thoại, chữ người gõ
  còn nguyên; đề xuất Kara bị từ chối → dòng lỗi của K3 dưới đề xuất.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hộp thoại căn chỉnh (gắn) | Gắn một căn chỉnh kèm lý do | «Gắn thêm» / bảng tab Căn chỉnh |
| Hộp thoại căn chỉnh (sửa) | Sửa lý do một căn chỉnh đã có | «Sửa lý do» trên dòng / bảng tab Căn chỉnh |
| Hộp thoại căn chỉnh (nhận đề xuất) | Sửa lý do Kara rồi gắn | «Sửa lý do» trên đề xuất / biên nhận trong nhóm Kara |
| Dòng đề xuất căn chỉnh của Kara | Duyệt một căn chỉnh có lý do | nhóm Kara tab KR / biên nhận |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-hop-thoai-trong | Hộp thoại (gắn) | Hai ô trống, mức tin «Chưa có lý do» | Gõ lý do hoặc gắn luôn |
| ST-hop-thoai-dat-cuoc | Hộp thoại | Có lý do, căn cứ trống, mức tin «Đặt cược» | Thêm căn cứ hoặc gắn |
| ST-hop-thoai-co-so-lieu | Hộp thoại | Có cả hai, mức tin «Có số liệu» | Gắn |
| ST-hop-thoai-can-cu-thieu-ly-do | Hộp thoại | Căn cứ có chữ, lý do trống: lỗi dưới ô căn cứ, nút khoá | Gõ lý do hoặc xoá căn cứ |
| ST-hop-thoai-dang-gui | Hộp thoại | Nút có `Spinner`, ô và nút khoá | Chờ |
| ST-hop-thoai-loi | Hộp thoại | `FieldError` câu máy chủ, chữ còn nguyên | Sửa rồi gửi lại, hoặc Huỷ |
| ST-hop-thoai-sua | Hộp thoại (sửa) | Đích khoá, hai ô điền sẵn, nút «Lưu» | Sửa rồi Lưu |
| ST-de-xuat-co-so-lieu | Đề xuất Kara | Nhãn «Có số liệu», Vì sao, Căn cứ, ba nút | Căn chỉnh kèm lý do · Sửa lý do · Bỏ qua |
| ST-de-xuat-dat-cuoc | Đề xuất Kara | Nhãn «Đặt cược», Vì sao, không dòng căn cứ | Như trên |
| ST-de-xuat-da-nhan | Đề xuất Kara | Biên nhận có Hoàn tác (K3) | Hoàn tác hoặc đi tiếp |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Hai ô `Textarea` tự cao theo chữ, trần 500 ký tự mỗi ô (đếm khi gần trần), cắt khoảng trắng hai đầu khi gửi.
- Mức tin tính bằng `mucTinCanChinh` dùng chung, đổi mỗi lần gõ, không gọi máy chủ.
- Chữ người gõ là dữ liệu người nhập: ô và mọi chỗ hiện lại mang `translate="no"`.
- Nút Huỷ bọc `DialogClose asChild`. Đóng hộp thoại khi đang gửi bị chặn như nay.
- Hai ô xếp dọc ở mọi khổ; ở 390 px hộp thoại không cuộn ngang trang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Dialog`, `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `Textarea` | dùng | Có sẵn ở `packages/ui`, hộp thoại đang dùng `Field` |
| `StatusIndicator` + `toneTheoNghia` + `NGHIA_MUC_TIN` | dùng | Bảng mức tin của L2, không khai bảng thứ hai |
| `KaraProposal` (`kind="compact"`, `rationale`, `actions`) | ghép | Dòng đề xuất K3 đã dùng; thêm nhãn mức tin và dòng căn cứ vào `rationale` |
| `HopThoaiCanChinh` | mở rộng | Một hộp thoại ba chế độ thay vì ô sửa nhiều trường mới trong `ProposedChange` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: thêm vào sheet mục tiêu và hộp thoại sẵn có, không màn mới; luồng hiển nhiên nên không tra mẫu ngoài.
<!-- UX-SPEC-TEMPLATE>>> -->

## Kiểm

- API: `apps/api/test/okr-gan-ly-do.spec.ts` (gắn tay, sửa lý do, nhận và sửa đề xuất Kara, quyền, vết) qua tRPC và
  REST; `packages/validation` bài thuần cho `lyDoCanChinhNhap`.
- Agent: bài `nopDeXuatVao` lưu và đọc lại `canCu`; chỉ dẫn có luật dòng căn chỉnh.
- App: `apps/app/test/gan-ly-do.dom.tsx` cho hộp thoại ba chế độ và dòng đề xuất.
- Màn thật: phiên đo trên bộ OKR mẫu ở 1440 và 390.
