---
schema_version: 1
feature: Soát ảnh OKR lượt 3 — hộp Nhập thấy đủ bảy cột và đánh dấu dòng hỏng ở 1440; hàng thẻ Cài đặt ở 390 tự đưa thẻ đang mở vào tầm nhìn; bộ chọn chu kỳ bỏ nhãn loại lặp; gợi ý tên chu kỳ theo năm hiện tại tính ở server
slug: okr-soat-anh-luot-3
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-25T15:26:00Z
design_doc: docs/superpowers/specs/2026-09-25-okr-soat-anh-luot-3-design.md
---

# Acceptance Contract: okr-soat-anh-luot-3

## Context

Chủ kho soát ảnh khu OKR (lượt 3, PR #140) ngày 2026-09-25 và thấy bốn chỗ vấp: bảng
xem trước của hộp «Nhập từ bảng tính» bị cắt trong hộp 640px ở 1440 (cột «Đơn vị đo» còn
«Đơ», cột email khuất) và dòng hỏng không được đánh dấu trong bảng; hàng thẻ ngang của khung
Cài đặt ở 390 không đưa thẻ đang mở vào tầm nhìn («Chươ» ở mép phải); bộ chọn chu kỳ hiện
«Quý 3/2026 Quý»; gợi ý tên của hộp «Mở chu kỳ» cứng là «Năm 2027» / «Quý 1/2027».

Tiêu chí màn hình đo trên cây đang xét, cổng 3630/3631, tiếng Việt, bằng bàn đo
`rang/do-man.mjs`: bàn đo tạo một người quản trị thử và ba chu kỳ thử (năm hiện tại, quý hiện
tại, một quý khác tên «Lượt đo <mã>»), không cần cây tổ chức — quản trị nhập được cho đơn vị
OneHub. «Hôm nay» là ngày theo giờ Việt Nam. «Vỏ bảng» là `[data-slot=table-container]` của
bảng xem trước. Lô thử có năm dòng: ba hợp lệ (dòng 1 có tên mục tiêu và tên KR mỗi thứ ≥ 120
ký tự), dòng 4 kiểu lạ, dòng 5 email không phải thành viên.

## Criteria

- AC-1: Given quản trị, chu kỳ quý đang chạy và lô năm dòng, When mở «Nhập từ bảng tính» ở đơn vị OneHub trong khổ 1440×900 và bấm «Xem trước», Then cả chín tiêu đề cột — Dòng · Mục tiêu · KR · Kiểu · Khởi điểm · Đích · Đơn vị đo · Địa chỉ email · Kết quả — nằm trọn trong vỏ bảng khi vỏ ở vị trí cuộn ngang 0, vỏ bảng không tràn ngang, không tiêu đề nào bị cắt chữ, ô email của dòng 5 hiện đủ địa chỉ trong vỏ không bị cắt chữ, và ô «Mục tiêu» của dòng có tên dài (≥ 120 ký tự) xuống dòng mà vỏ vẫn không tràn; And ở khổ 390×844 hộp nằm trọn trong màn, trang không tràn ngang, và bảng cuộn ngang bên trong vỏ của nó.
- AC-2: Given cùng bước Xem trước của AC-1, When đọc bảng, Then đúng các hàng có số dòng nằm trong danh sách câu lỗi phía trên (dòng 4 và 5) mang dấu hỏng — vạch mép trái màu phá huỷ và chấm trạng thái tông lỗi có chữ «Hỏng» nằm trọn trong vỏ bảng; ba hàng hợp lệ không mang dấu nào trong hai dấu đó mà có chấm «Hợp lệ»; và danh sách câu lỗi phía trên vẫn còn đủ hai câu.
- AC-3: Given quản trị ở khổ 390×844, When mở lần lượt từng mục Cài đặt mà quản trị thấy (mười một mục của `NHOM_CAI_DAT`), Then ở mỗi trang thẻ đang mở của hàng thẻ ngang nằm trọn trong khung hàng thẻ (lệch không quá 1px), trang không tràn ngang, và trang không bị cuộn dọc vì hàng thẻ (`scrollY` bằng 0); And khi đang ở «Chung» mà bấm thẻ «Chương trình OKR» trên chính hàng thẻ (chuyển trang phía trình duyệt, khung không dựng lại), thẻ đó cũng nằm trọn sau khi trang mới hiện.
- AC-4: Given hàng thẻ ngang `NavStrip` của `packages/ui` với thẻ đang mở nằm ngoài khung, When nó vẽ lần đầu, Then khung cuộn ngang để thẻ đó nằm trọn; When người tự cuộn khung về đầu rồi hàng thẻ vẽ lại mà thẻ đang mở không đổi, Then khung giữ vị trí người đặt; When thẻ đang mở đổi sang thẻ khác đã nằm trọn trong khung, Then khung không cuộn; When thẻ đang mở đổi sang một thẻ nằm ngoài khung, Then khung cuộn để thẻ đó nằm trọn.
- AC-5: Given ba chu kỳ thử của bàn đo, When mở khu OKR ở 1440×900 và mở bộ chọn chu kỳ, Then ô chọn đọc đúng «Quý <q>/<năm>» không có chữ «Quý» thứ hai, mục «Năm <năm>» trong danh sách không kèm chữ «Năm» thứ hai, và mục «Lượt đo <mã>» vẫn kèm nhãn «Quý»; And hàm quyết nhãn loại trả cùng kết quả cho tiếng Anh («Q4 2026» không chứa «Quarter» nên vẫn kèm nhãn).
- AC-6: Given hôm nay theo giờ Việt Nam, When quản trị mở «Mở chu kỳ» ở Cài đặt › Chương trình OKR, Then ô Tên gợi ý «Năm <năm hiện tại>» khi loại là Năm và «Quý <quý kế tiếp>/<năm của quý đó>» khi loại là Quý; And hàm thuần tính gợi ý cho đúng: 2026-09-25 → Năm 2026, Quý 4/2026; 2026-10-26 → Năm 2026, Quý 1/2027; 2026-12-31 → Năm 2026, Quý 1/2027; 2027-01-01 → Năm 2027, Quý 2/2027; thời điểm 2026-12-31T17:30Z (00:30 ngày 01/01/2027 giờ Việt Nam) → Năm 2027; And ngày được tính ở trang server và truyền xuống — các tệp client của hộp không tự đọc đồng hồ, và `okr.ts` không còn năm viết cứng trong gợi ý.
- AC-7: Given cây sau vòng này, When chạy lại thước màn thật đã ký của `dat-okr-trong-crm` (`man-okr.mjs`) trên cổng 3630/3631 và ba thước không cần trình duyệt của `khung-trang-cai-dat` (soi cấu trúc `cau-truc.mjs`, sân thiết kế `san-thiet-ke.mjs`, test DOM thanh bên), Then tất cả đạt trọn như lúc ký; And bộ test của kho xanh.
- AC-8: Given tập tệp giao diện vòng này sửa, rút bằng máy từ `diff` so với `origin/onehub` (không liệt tay), When chạy cổng thiết kế tĩnh của kho trên từng tệp, Then không vi phạm nào; And cỡ hộp mới, biến thể hàng hỏng và `NavStrip` nằm trong `packages/ui`; And trong các tệp `apps/app` của tập đó, không phần tử JSX nào vòng này thêm hoặc sửa mà có tên nhập từ `@crm/ui` lại mang lớp đổi màu, góc, khoảng cách hay bóng — kể cả lớp đến từ một hằng chuỗi (giải tên hằng tới giá trị); lớp đè có từ trước ở dòng vòng này không chạm được in thành ghi chú, không tính.
- AC-9: Given ảnh chụp thật của bàn đo trên giao diện cũ và giao diện mới, When người xem mở ảnh 1440 và 390 của bốn màn — bước Xem trước, trang Chương trình OKR, bộ chọn chu kỳ đang mở, sheet «Mở chu kỳ» — Then ở ảnh mới thấy chín cột trọn trong hộp và hai hàng hỏng có vạch đỏ, thẻ «Chương trình OKR» nằm trọn trong hàng thẻ ở 390, bộ chọn đọc «Quý <q>/<năm>» một lần, gợi ý tên là năm hiện tại và quý kế tiếp; ảnh cũ cho thấy đúng bốn chỗ vấp của lượt soát.
- AC-10: Given bàn đo đã tạo người thử và chu kỳ thử, When lượt đo kết thúc — đạt, trượt, hay hỏng giữa chừng — Then không còn chu kỳ OKR nào, không còn người thử, và cấu hình chương trình không thêm phiên bản; And lượt đo bị giết bằng tín hiệu ngay sau khi gieo cũng dọn như vậy, hoặc — nếu không kịp — lượt kế nhận ra tàn dư của chính bàn đo (qua sổ gieo), dọn nó rồi đo tiếp; And kho đã có chu kỳ OKR không phải của bàn đo thì bàn đo thoát mã 2, không gieo, không xoá gì.

## Coverage

Bỏ quét morphological-scan — xem sổ quyết định, dòng «bỏ coverage-scan». Bốn chỗ sửa do chủ
kho khai đích danh từ ảnh; mỗi chỗ một hoặc hai tiêu chí, cộng không hồi quy (AC-7), thiết kế
tĩnh (AC-8), ảnh (AC-9), dọn (AC-10).

## Out of scope

- Nhãn số đếm của cây đơn vị ở màn «OKR theo đơn vị» — là câu hỏi cho chủ kho (sổ quyết định), vòng này không sửa.
- Đánh dấu đúng ô gây lỗi trong hàng hỏng — API xem trước chỉ trả câu lỗi, không trả tên cột; cần đổi hợp đồng API.
- Bảng xem trước ở 390 vẫn cuộn ngang trong vỏ của nó — lời hứa bảy cột là ở 1440.
- Hộp nhập cây tổ chức (`settings/organization/hop-thoai-nhap.tsx`) giữ cỡ `wide`.
- Thanh thẻ «Của tôi · Theo đơn vị · Toàn cảnh» của khu OKR — ba thẻ vừa khổ 390.
- Bản mẫu `/proto/khung-trang-cai-dat` giữ hàng thẻ tự vẽ.
- Thước màn thật đã ký của `khung-trang-cai-dat` (`man-chrome.mjs`) không chạy lại trong vòng này: nó ghi ảnh thẳng vào `_acceptance/khung-trang-cai-dat/evidence/` của hồ sơ đã ký, và không có biến môi trường nào đổi chỗ ghi. Phần nó đo mà vòng này chạm — hàng thẻ ở khổ hẹp không tràn ngang — do AC-3 đo lại trên cả mười một trang.

## Notes

- Không có `opportunity.md` — vòng sửa đi thẳng từ lượt soát ảnh, không có ngưỡng nghiệm thu, nên không có mục Đường đo.
- Đường nền đỏ ở hai chỗ, cả hai của bộ kit chứ không của kho: bộ đo chạy lệnh qua `bash -lc` nên bản dựng rơi về Node 22 (`eve requires Node.js >=24`) — cùng lệnh `bunx turbo run build --force` với Node 24 xanh, 4/4 task; và «THIEU merge-base» là bộ đo đọc nhầm lệnh con của git thành công cụ. Đã mở chip sang `~/dev/acceptance-gate-kit`.
- Ảnh cũ/mới ghi vào `.acceptance-runs/okr-soat-anh-luot-3/evidence/{truoc,sau}/`; thước đã ký của `dat-okr-trong-crm` ghi vào `.acceptance-runs/dat-okr-trong-crm/`, không chạm thư mục bằng chứng đã ký.
- «Quản trị» trong hợp đồng này là vai chủ sở hữu hoặc quản trị của không gian làm việc, không phải trưởng đơn vị; «điểm», «trạng thái», «xoá», «người xem» dùng theo nghĩa thường (điểm trên màn, chấm trạng thái, xoá dữ liệu thử, người nhìn ảnh). Lint W6 của kit báo năm chữ này theo nghĩa khác trong `CONTEXT.md`.
- Lớp đè có từ trước mà soi mã in thành ghi chú: hằng `CELL = "px-3 py-2.5 align-middle"` của khu OKR đè khoảng cách lên `TableCell` (71 chỗ trong `apps/app`, sáu chỗ trong `bang-chu-ky.tsx`), và ô «Loại» của bảng chu kỳ đè màu chữ. Đó là việc «phần đệm ô của `SimpleTable`» ở đợt 2 của `docs/settings.md`, ngoài phạm vi vòng này.
- Chiều đỏ ở S3 trên giao diện cũ, cây này, cổng 3630/3631: `do-man.mjs` 22 DUNG, 27 SAI, mã 1 — chín cột nhập tràn vỏ 1365px, cột «Mục tiêu» một dòng, không hàng nào có vạch hay chấm trạng thái, thẻ «Chương trình OKR» lệch 84px ở 390 cùng năm thẻ sau nó (kể cả khi bấm thẻ), ô chọn «Quý 3/2026Quý», mục «Năm 2026Năm», gợi ý «Năm 2027» / «Quý 1/2027»; ảnh ở `evidence/truoc/`. Soi mã `dong-ho-page` và `goi-y-khong-cung` SAI.
- Phá-thử ở S3: `NavStrip` bỏ điều kiện «cùng thẻ» → đỏ «nguoi tu cuon bi keo ve»; bỏ nhánh cuộn → đỏ «the dang mo van ngoai khung»; chỉ canh lúc dựng → đỏ «doi the ngoai khung khong canh»; soi mã trên bản sao — `new Date()` trong sheet → SAI, `className="text-destructive"` trên `TableCell` → SAI; sân thiết kế — `bg-red-500 text-gray-400` → design-gate mã 2 (`gray-on-color`); bàn đo — `OSA_PHA_SAU_GIEO=1` → mã 2, ba dòng dọn DUNG; `kill -TERM` sau gieo → mã 143, DB 0 chu kỳ; `kill -9` sau gieo → để lại 3 chu kỳ và sổ gieo, lượt kế in «don tan du 3 chu ky» rồi 49 DUNG / 0 SAI.
- Chiều xanh ở S3 tại `9371249c`: `do-man.mjs` 49/0; `man-okr.mjs` đã ký 197 khẳng định / 0 hỏng; ba thước không trình duyệt của `khung-trang-cai-dat` đạt; năm lệnh ở gốc mã 0 (Node 24).

Known limits — chấp nhận tại Cổng Bằng chứng 2026-09-26 (Manh Phan), từ mục ngoài hợp đồng của S4 round 2:

- Ngoài-1 và Ngoài-7: phần gợi ý tên chu kỳ tự giữ cách tính «hôm nay giờ Việt Nam» (`homNayVn`, `OKR_CHU_KY.muiGio`) thay vì dùng `ngayVN` có sẵn ở `@crm/db/onboarding-nhac` mà API OKR đang dùng; đổi múi giờ ở một chỗ mà quên chỗ kia thì gợi ý tên có thể lệch ngày.
- Ngoài-2: hộp cỡ `table` mất lề hai bên khi cửa sổ rộng khoảng 640–1152px — hộp nhập bảng tính chạm sát hai mép màn ở các khổ trung bình.
- Ngoài-3 và Ngoài-10: lượt đo E12 chỉ in «design-gate mã 0» mà không chạy đối chứng `--pha` trong cùng lượt; cổng thiết kế hỏng âm thầm thì E12 vẫn đạt.
- Ngoài-4 và Ngoài-13: dòng đếm tệp của `soi-ma.mjs` và `san-thiet-ke.mjs` tự so với chính danh sách vừa đo, nên bộ lọc tệp bỏ sót một tệp giao diện thì không dòng nào báo.
- Ngoài-5 và Ngoài-12: ma trận mã của `do-man.mjs` tự suy từ nguồn cột và mục Cài đặt, không ghim trước con số 9 cột và 11 mục; một cột hay một mục biến mất ở cả hai nơi thì lượt đo vẫn đạt.
- Ngoài-6 và Ngoài-9: `dong-ho-page` chỉ soi trang có gọi hai hàm tính ngày, không soi giá trị đó được truyền tới đúng ô gợi ý.
- Ngoài-11: đối chứng âm `pha-lop` chạy đường tắt (`OSA_TEP`) không đi qua bộ phân loại theo dòng đổi mà lượt đo thật dùng.

Chấp nhận, không sửa (Cổng Bằng chứng 2026-09-26): Ngoài-8 — tên mục tiêu dài của lô thử có 119 ký tự thay vì ≥ 120 như bối cảnh ghi; kết quả đo không đổi.
