# Sửa và ẩn chu kỳ OKR tạo nhầm — thiết kế

Hồ sơ `_acceptance/sua-an-chu-ky-okr` · T3 (chạm `packages/db/prisma`) · chủ kho duyệt
cách A ngày 2026-09-30.

## Vì sao

Chủ kho thử trên production: tạo nhầm một chu kỳ thì không sửa được, không xoá được.
Mã onehub `9cda3569` chỉ có ba việc với chu kỳ — tạo, đẩy pha tới, mở lại kỳ đã
đóng — theo quyết định `d-20260925T033813Z-12` của `dat-okr-trong-crm` («vết phải
sống; tạo nhầm thì tạo cái khác, để cái nhầm ở lập kế hoạch»). Cách lách đó hỏng ở
sáu chỗ đo được:

1. Quý sai ngày chiếm chỗ: `createCycle` từ chối quý đúng vì «quý chồng».
2. Sai thứ cập nhật tuần hoặc khoảng nghỉ làm lệch nhắc và kỳ vọng theo ngày cả quý.
3. Năm sai ngày: tạo năm khác được, nhưng ô chọn có hai năm trùng tên.
4. Chu kỳ nhầm nằm mãi trong mọi ô chọn kỳ; nếu phủ hôm nay và kỳ đúng cũng ở lập
   kế hoạch, `chonChuKyHienTai` có thể chọn nó làm kỳ mặc định cho cả công ty.
5. Không đẩy được chu kỳ nhầm tới «Đã đóng» để cất: chấm điểm chỉ mở sau ngày cuối.
6. Sai tên không sửa được.

## Luật (đã duyệt)

Ba nhóm tình trạng, máy chủ tính cho từng chu kỳ:

- **Trống**: không có dòng nào ở sáu quan hệ trỏ tới chu kỳ — mục tiêu (mọi trạng
  thái, kể cả đã bỏ), lần hỏi ý, quý con (kể cả quý đã ẩn), đợt rà, điểm KR, mang sang
  tới.
- **Có dữ liệu**: không trống.
- **Đã ẩn**: `anLuc` khác rỗng.

| Việc | Được khi | Để lại |
|---|---|---|
| Sửa mọi ô (tên, ngày đầu, ngày cuối, khoảng nghỉ, thứ cập nhật) | chưa ẩn · pha «Lập kế hoạch» · trống | vết `sua-chu-ky`, trước/sau các ô đổi |
| Sửa tên | chưa ẩn · pha khác «Đã đóng» | vết `sua-chu-ky` |
| Gỡ | chưa ẩn · trống (mọi pha) | vết `go-chu-ky` mang bản chụp chu kỳ; dòng chu kỳ xoá; vết cũ giữ nguyên |
| Ẩn | chưa ẩn · có dữ liệu (trống thì gỡ) · năm thì không còn quý con chưa ẩn · lý do 10–500 ký tự | vết `an-chu-ky`, lý do ở `note` |

Năm cờ trên là MỘT hàm thuần `viecChuKy` ở `@crm/validation/okr-chu-ky`, nhận tình
trạng (pha, trống, đã ẩn, loại, số quý con chưa ẩn) và trả năm cờ. `okr.cycles` trả kết
quả của nó cho màn; bốn thủ tục ghi gọi đúng hàm đó dưới khoá rồi từ chối khi cờ tắt — màn
và máy chủ không thể nói khác nhau.
| Hiện lại | đã ẩn · quý thì năm cha chưa ẩn và không chồng ngày quý nào chưa ẩn cùng năm | vết `hien-chu-ky` |

Loại chu kỳ và năm cha không sửa được — sai loại thì gỡ (khi trống) hoặc ẩn rồi tạo lại.
Sửa ngày của quý giữ luật của `createCycle`: nằm trong năm cha, không chồng quý chưa ẩn
nào khác. Sửa ngày của năm chỉ xảy ra khi năm trống, tức không có quý con.

## Chu kỳ ẩn biến khỏi đâu

Một hằng dùng chung ở `packages/db` — `KY_CON_HIEN = { anLuc: null }` — đặt vào mọi
truy vấn tự tìm chu kỳ. Danh sách viết trước đủ từng `tệp:hàm` nằm ở
`_acceptance/sua-an-chu-ky-okr/rang/noi-doc-chu-ky.json` (15 chỗ lọc, 6 chỗ miễn kèm lý
do), quét 30/09 bằng các mẫu `cycle: {`, `cycleId: { in`, `okrCycle.find*/count/groupBy`,
`$queryRaw` có `okrCycle`. Bảng dưới là phần chính của danh sách đó:

| Nơi | Tệp | Hôm nay | Sau |
|---|---|---|---|
| Kỳ mặc định | `okr.service.ts` `cycles` → `chonChuKyHienTai` | mọi chu kỳ | chỉ chu kỳ chưa ẩn |
| Kiểm quý chồng khi tạo | `okr.service.ts` `createCycle` | mọi quý cùng năm | chỉ quý chưa ẩn; năm cha đã ẩn thì từ chối |
| Đích mang sang | `okr-khep.service.ts` `mangSang` | kỳ kế cùng loại | kỳ kế cùng loại chưa ẩn |
| Khoá ghi | `okr.service.ts` `assertKyGhiDuoc` | theo pha | thêm: đã ẩn thì từ chối |
| Nhắc buổi sáng: cập nhật tuần, liên quan OKR, chờ duyệt, Hỏi ý | `packages/db/src/okr-nhac.ts` | theo pha | thêm chưa ẩn |
| Cập nhật tuần của tôi | `okr-cap-nhat.service.ts` | kỳ đang chạy | kỳ đang chạy chưa ẩn |
| Chuyển việc khi người rời | `okr-trao-doi.service.ts` | pha ghi được | thêm chưa ẩn |
| Chụp số hằng ngày | `apps/agent/agent/lib/okr-chup.ts` | pha ghi được | thêm chưa ẩn |
| Đích căn chỉnh và cây căn chỉnh | `okr.service.ts` `alignmentTargets`, `mucTieuCuaCay`; tác tử `okr/doc.ts` `docDichCanChinh` | chu kỳ cha/con | bỏ chu kỳ đã ẩn |
| OKR còn mở chặn lưu trữ, chuyển đơn vị | `packages/db/src/okr-don-vi.ts` `dieuKienOkrMo` | pha chuyển được | thêm chưa ẩn |

**Khoá ghi phủ MỌI thủ tục ghi, không riêng hai thủ tục.** Một hàm dùng chung
`assertKyChuaAn(tx, cycleId)` được gọi bởi `assertKyGhiDuoc` và bởi mọi thủ tục ghi
không đi qua nó (`setCyclePhase`, `moRa`, `dongRa`, `moLaiKy`, `chamKr`,
`ghiDieuHocDuoc`, `mangSang` cả phía nguồn lẫn đích, mọi thủ tục ghi của Hỏi ý).
Bài kiểm tự dò mọi thủ tục mutation của router `okr` và đòi mỗi thủ tục có một dòng
trong bảng ca «ghi vào chu kỳ ẩn» (hoặc một dòng miễn có lý do: thủ tục không chạm
chu kỳ, như cấu hình chương trình, hay chính bốn thủ tục mới). Tác tử AI không ghi
thẳng cơ sở dữ liệu OKR — đề xuất đi qua `updateObjective` khi người bấm Nhận — nên
nằm trong cùng lưới.

**Tập quan hệ của «trống» rút từ lược đồ, không chép tay.** Hằng
`QUAN_HE_GIU_CHU_KY` ở `packages/db` liệt tên quan hệ mà hàm tính «trống» đếm. Bài
kiểm đọc Prisma DMMF, lấy mọi trường quan hệ tới `OkrCycle` (trừ `okrTrail`, cột
không khoá ngoại) và so tập với hằng; lệch là đỏ, in tên quan hệ thiếu. Thêm bảng
mới trỏ tới chu kỳ ở lượt sau thì bài đỏ tới khi hằng được cập nhật.

**Thứ tự khoá.** Bốn thủ tục mới và `createCycle` khoá `FOR UPDATE` theo thứ tự cố
định: năm cha trước, rồi quý (với quý), rồi các quý anh em cùng năm theo `id` tăng
dần khi luật cần đọc chúng (kiểm chồng, đếm quý còn hiện). `assertKyChuaAn` trong
một giao dịch ghi khoá hàng chu kỳ `FOR SHARE`, nên ẩn hay gỡ chờ ghi đang chạy và
ngược lại; ghi tới sau lúc ẩn đọc lại `anLuc` dưới khoá và bị từ chối bằng câu ghim,
không bằng lỗi khoá ngoại. Để bài kiểm dựng được ca đồng thời, dịch vụ nhận một móc
tiêm được `MOC_SAU_KHOA_CHU_KY` (mặc định không làm gì, như `DONG_HO_HOI_Y` của Hỏi ý)
gọi ngay sau khi lấy khoá.

Đọc theo id (sheet mục tiêu, `okr.objective`, «Theo đơn vị» với `cycleId` truyền vào)
**không** lọc: dữ liệu trong chu kỳ ẩn vẫn đọc được bằng đường dẫn cũ, chỉ không ghi được.
Ô chọn kỳ ở màn lọc bỏ chu kỳ ẩn; `giaiKy`, `giaiKyHoiY`, `kyMacDinhHoiY` coi id của
chu kỳ ẩn như id lạ và rơi về kỳ mặc định. Một bài soi mã rút danh sách truy vấn `cycle:
{ phase …` từ mã thật và đỏ khi một truy vấn thiếu `KY_CON_HIEN` — để truy vấn thứ
mười ba viết sau này không lọt.

## API

Bốn thủ tục mới trong router `okr`, đều `assertQuanTri`, khoá hàng chu kỳ `FOR UPDATE`
rồi kiểm lại dưới khoá:

- `okr.suaChuKy` — `PATCH /okr/cycles/{id}` — vào `{ id, name, startsOn, endsOn,
  breakStartsOn, breakEndsOn, updateWeekday }` (khuôn `suaChuKyInput` ở
  `@crm/validation/okr-chu-ky`, cùng luật ngày của `chuKyInput`). Một ô ngoài tên khác
  giá trị đang lưu mà `viecChuKy(...).suaMoiO` = false → từ chối, câu ghim nói chỉ sửa
  được tên — áp cả chu kỳ trống đã rời «Lập kế hoạch», không riêng chu kỳ có dữ liệu.
- `okr.goChuKy` — `DELETE /okr/cycles/{id}` — vào `{ id }`.
- `okr.anChuKy` — `POST /okr/cycles/{id}/hide` — vào `{ id, lyDo }` (`lyDo` của
  `okr-khep`).
- `okr.hienChuKy` — `POST /okr/cycles/{id}/unhide` — vào `{ id }`.

`okr.cycles` trả thêm cho mỗi chu kỳ `anLuc` (chuỗi ISO hoặc rỗng), `quyConHien` (số quý
con chưa ẩn, 0 với quý) và `viec: { suaMoiO, suaTen, go, an, hienLai }` — kết quả của
`viecChuKy`, màn chỉ đọc. `currentId`
chỉ chọn trong chu kỳ chưa ẩn.

Bốn hành động vết mới vào `HANH_DONG_VET`: `sua-chu-ky`, `go-chu-ky`, `an-chu-ky`,
`hien-chu-ky`. `okrTrail.cycleId` không có khoá ngoại nên dòng vết sống sau khi gỡ.

Cơ sở dữ liệu: một cột `anLuc DateTime?` trên `okrCycle`, migration chỉ `ALTER TABLE …
ADD COLUMN`, mốc sau mốc mới nhất của onehub lúc gộp.

## Màn — Cài đặt › Chương trình OKR › Chu kỳ

Bảng chu kỳ giữ nguyên cột. Chu kỳ đã ẩn xuống cuối bảng, cột Pha thêm nhãn «Đã ẩn»
(`StatusIndicator` tông `neutral`). Menu «…» của mỗi hàng thêm, theo cờ `viec`:

- «Sửa chu kỳ» (`suaMoiO` hoặc `suaTen`) → sheet dùng lại khung «Mở chu kỳ», tiêu đề
  «Sửa <tên>», loại và năm cha chỉ đọc; khi chỉ `suaTen`, các ô khác tắt và một dòng
  `FieldDescription` nói vì sao («<tên> đã có mục tiêu — chỉ sửa được tên»). Trạng thái mở
  ghi trên URL (`suaChuKy=<id>`).
- «Gỡ chu kỳ» (`go`) → `ConfirmDialog` tông `destructive`: «Gỡ <tên>? Chu kỳ này chưa có
  dữ liệu. Vết tạo và gỡ vẫn còn trong sổ vết.»
- «Ẩn chu kỳ» (`an`) → hộp thoại có ô lý do bắt buộc (như «Mở lại kỳ»): «Ẩn <tên>? Chu kỳ
  biến khỏi ô chọn kỳ, không nhận ghi, không nhắc. Dữ liệu giữ nguyên; hiện lại được.»
- «Hiện lại» (`hienLai`) → `ConfirmDialog` tông `default`.

Việc cũ (chuyển pha, rà, đóng, mở lại) không hiện cho chu kỳ đã ẩn. Thành viên thường
thấy mục menu tắt kèm dòng giải thích như hôm nay.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Cài đặt › Chương trình OKR → «…» ở hàng chu kỳ nhầm → Sửa / Gỡ / Ẩn → toast «Đã sửa / Đã gỡ / Đã ẩn <tên>», bảng cập nhật (điểm ra: bảng chu kỳ; ô chọn kỳ ở khu OKR không còn chu kỳ ẩn).
- Biên: chu kỳ có dữ liệu → Sửa chỉ mở ô tên; năm còn quý hiện → mục «Ẩn» tắt kèm lý do; chu kỳ đã ẩn → menu chỉ còn «Hiện lại».
- Lỗi & quay lại: máy chủ từ chối (quý chồng, ngoài năm, có người vừa thêm mục tiêu) → toast mang câu ghim của máy chủ, sheet/hộp thoại giữ nguyên chữ đã gõ để sửa lại.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Bảng chu kỳ | thấy mọi chu kỳ và việc làm được với từng cái | Cài đặt › Chương trình OKR / các hộp dưới |
| Sheet «Sửa chu kỳ» | sửa ô được phép của một chu kỳ | menu «…» / bảng |
| Hộp «Gỡ chu kỳ» | xác nhận gỡ một chu kỳ trống | menu «…» / bảng |
| Hộp «Ẩn chu kỳ» | ghi lý do rồi ẩn | menu «…» / bảng |
| Hộp «Hiện lại» | xác nhận hiện lại | menu «…» / bảng |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-bang-an | Bảng chu kỳ | hàng chu kỳ ẩn ở cuối, nhãn «Đã ẩn», menu chỉ «Hiện lại» | hiện lại hoặc để yên |
| ST-menu-trong | Bảng chu kỳ | menu có «Sửa chu kỳ» và «Gỡ chu kỳ», không có «Ẩn» | sửa hoặc gỡ |
| ST-menu-co-du-lieu | Bảng chu kỳ | menu có «Sửa chu kỳ» và «Ẩn chu kỳ», không có «Gỡ» | sửa tên hoặc ẩn |
| ST-menu-nam-con-quy | Bảng chu kỳ | «Ẩn chu kỳ» tắt, dòng phụ «Còn <n> quý đang hiện — ẩn hoặc gỡ quý trước» | xử quý trước |
| ST-sua-moi-o | Sheet sửa | mọi ô bật trừ loại và năm cha; «Lưu» tắt tới khi đổi và hợp lệ | sửa rồi lưu |
| ST-sua-chi-ten | Sheet sửa | chỉ ô tên bật; dòng mô tả «<tên> đã có dữ liệu — chỉ sửa được tên» | sửa tên |
| ST-sua-dang-luu | Sheet sửa | spinner trên «Lưu», nút Huỷ tắt | chờ |
| ST-sua-loi | Sheet sửa | toast câu ghim máy chủ, chữ đã gõ giữ nguyên | sửa lại |
| ST-an-ly-do | Hộp ẩn | ô lý do bắt buộc, «Ẩn chu kỳ» tắt khi dưới 10 ký tự | gõ lý do |
| ST-khong-quyen | Bảng chu kỳ | nút «…» tắt, dòng giải thích dưới tiêu đề trang | — |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Tên 2–80 ký tự, lý do 10–500 ký tự (cùng khuôn «Mở lại kỳ»); ngày theo `DatePicker`, luật ngày của `chuKyInput`.
- Nút Huỷ bọc `SheetClose`/`DialogClose` để bộ giữ thay đổi thấy; đóng sheet có chữ chưa lưu thì hỏi lại theo nếp sẵn có.
- 390 và 1440 không tràn ngang; tên chu kỳ và lý do mang `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Sheet`, `Field`, `DatePicker`, `Select` | dùng | khung «Mở chu kỳ» có sẵn, thêm chế độ sửa |
| `ConfirmDialog` | dùng | gỡ và hiện lại là hỏi lại trước thao tác |
| Hộp ẩn có ô lý do | ghép | cùng hình `HopThoaiMoLai` (ô lý do bắt buộc) |
| `StatusIndicator` | dùng | nhãn «Đã ẩn» tông `neutral` |
| `DropdownMenu` | dùng | menu «…» sẵn có |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — bảng chu kỳ sẵn có là danh sách, mỗi việc mở một hộp hoặc sheet bên phải; Perdoo đặt Edit / Archive / Delete cadence trong menu ba chấm của từng hàng ở Configure › Cadences (support.perdoo.com/en/articles/4515060-cadences-and-timeframes), cùng hình.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài phạm vi

- Lùi pha; sửa ngày khi đã có dữ liệu; xoá chu kỳ có dữ liệu.
- Ẩn năm kéo theo quý; chuyển mục tiêu sang chu kỳ khác.
- Bộ lọc «hiện chu kỳ đã ẩn» ở ô chọn kỳ của khu OKR.
- Dọn chu kỳ nhầm đang có trên production — làm bằng chính màn này sau khi gộp.

## Kiểm

Bài API ở `apps/api/test/okr-sua-an-chu-ky.spec.ts` (từng việc × tình trạng × vai, cặp
hai chiều), bài hàm thuần cho `chonChuKyHienTai` và ba hàm giải kỳ của màn, bài soi mã
`KY_CON_HIEN`, phép đo màn thật qua `tien-de.mjs`, migration chỉ thêm.
