---
schema_version: 1
feature: Khép kỳ OKR — quản trị mở cửa sổ rà giữa kỳ; cuối kỳ máy gợi ý điểm từ số chốt, người chỉnh được kèm lý do; mỗi mục tiêu có ô điều học được; kỳ chỉ đóng khi mọi KR đã chấm; mục tiêu dở mang sang kỳ sau; số kỳ đã đóng bị khoá và xuất được; kiểm chất lượng khi đặt bằng luật
slug: khep-ky-okr
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-09-27T13:49:54Z
design_doc: docs/superpowers/specs/2026-09-27-khep-ky-okr-design.md
---

# Acceptance Contract: khep-ky-okr

## Context

Lượt 3–6 (#140, #153, #157, #162) phủ đặt, cập nhật tuần, toàn cảnh và số tự chảy.
Pha «Chấm điểm» và «Đã đóng» có từ lượt 3 nhưng chỉ để khoá ghi. Lượt này thêm rà giữa
kỳ (đổi đích ngoài rà phải có lý do và mang nhãn), sang pha chấm với số chốt và điểm gợi
ý, chấm và điều học được, đóng khi đủ điểm, mở lại có lý do, mang sang chu kỳ kế, xuất
kỳ đã đóng, và bốn luật chất lượng khi đặt ở gói dùng chung — nền cho lượt 9b. Năm bảng
mới ở cuối `schema.prisma`; không cột mới trên bảng có sẵn.

Source input: `docs/plan/lo-trinh-okr.md` mục 5 «Lượt 7» (CK-04, CD-01…05, AI-03 phần
luật), mục 3 (câu giao) · `docs/plan/lo-trinh-tro-ly-okr.md` mục 4 · 
`_acceptance/khep-ky-okr/opportunity.md` · `CONTEXT.md` (Điểm cuối kỳ, Chu kỳ, Chương
trình OKR, Số chốt, Rà giữa kỳ, Điều học được, Mang sang) · bản mẫu `/proto/khep-ky-okr`
(`design-pass.md`) · prompt phiên lượt 7 ngày 2026-09-27.

## Criteria

- AC-1: Given hàm `kiemOkr` trong `@crm/validation/okr-kiem`, When chạy trên bảng ca viết trước (mỗi luật ≥ 3 ca bắt và ≥ 3 ca không bắt, gồm câu có dấu, không dấu, tiếng Anh, KR «mốc», KR «tăng tới» mà đích bằng khởi điểm), Then đầu ra của mỗi ca bằng đúng danh sách `{ ma, truong, krIndex }` viết trước với bốn mã `kr-la-viec`, `thieu-khoi-diem`, `dich-bang-khoi-diem`, `thieu-doi-trong`; And hàm không đọc cơ sở dữ liệu, không gọi mạng, không ném với đầu vào hợp lệ; And mỗi mã có câu hỏi vi và en khác nhau trong tệp chữ của màn.
- AC-2: Given người sửa được mục tiêu mở hộp thoại KR và sheet mục tiêu trong trình duyệt thật của cây đang xét, When gõ tên KR «Gọi điện chào mừng mọi đối tác mới», khởi điểm 0, rồi bấm Lưu; và mở một mục tiêu có ba KR «tăng tới», Then câu hỏi `kr-la-viec` hiện dưới ô tên và `thieu-khoi-diem` dưới ô khởi điểm bằng kiểu chữ «câu hỏi» của dòng ghi chú dưới ô (biến thể mới trong `packages/ui`), nút Lưu vẫn bật và cơ sở dữ liệu có KR mới; sheet hiện một cảnh báo `thieu-doi-trong` trên bảng KR cho người sửa được và không hiện cho người chỉ đọc; công bố vẫn đi. (cross-layer)
- AC-3: Given chu kỳ quý pha «Đang chạy», When quản trị gọi `okr.moRa` với hai ngày trong chu kỳ, rồi `okr.dongRa`, Then mỗi lần đọc lại từ cơ sở dữ liệu thấy dòng `OkrCuaSoRa` đúng như gửi (đóng thì có `dongLuc`), `okr.cycles` trả cửa sổ đang hiệu lực khi hôm nay (giờ Việt Nam) nằm trong khoảng và không trả sau khi đóng, mỗi lần một dòng vết (`mo-ra`, `dong-ra`); And ngày ngoài chu kỳ, từ ngày sau đến ngày, chồng một cửa sổ còn hiệu lực, chu kỳ pha khác «Đang chạy», thành viên thường và vai «chỉ OKR» gọi — bị từ chối với câu ghim và không dòng nào đổi.
- AC-4: Given KR của mục tiêu đã công bố ở chu kỳ đang chạy, When `updateKeyResult` đổi đích trong cửa sổ rà (không lý do), ngoài cửa sổ không lý do, ngoài cửa sổ có lý do 10–500 ký tự; và đổi đích KR của mục tiêu nháp, Then trong rà ghi được và có một dòng `OkrDoiDich` `ngoaiRa = false`; ngoài rà không lý do bị từ chối với câu ghim, đích và bảng `OkrDoiDich` không đổi; ngoài rà có lý do ghi được và có một dòng `ngoaiRa = true` mang lý do, trước, sau, người sửa; mục tiêu nháp không sinh dòng `OkrDoiDich`; And khi mở hộp thoại KR ngoài rà và đổi đích, ô «Lý do đổi đích» hiện bắt buộc, Lưu tắt tới khi đủ lý do, gửi xong cơ sở dữ liệu có dòng `ngoaiRa = true`. (cross-layer)
- AC-5: Given chu kỳ quý pha «Đang chạy» có mục tiêu công bố (đủ sáu kiểu KR, cam kết và tham vọng), mục tiêu nháp, mục tiêu đã bỏ, và cửa sổ rà đang mở, When quản trị gọi `setCyclePhase` sang «Chấm điểm» trước ngày sau ngày cuối, rồi ngày sau ngày cuối (giờ Việt Nam) khi một KR nguồn CRM chưa có bản chụp ngày cuối, rồi khi đã có, với chương trình thang 0–1 rồi lặp với thang 0–100, Then hai lần đầu bị từ chối với câu ghim (lần hai nêu số KR thiếu bản chụp) và không dòng `OkrDiemKr` nào; lần sau đọc lại thấy pha «Chấm điểm», cửa sổ rà có `dongLuc`, và bảng `OkrDiemKr` có đúng một dòng cho mỗi KR của mục tiêu đã công bố — không dòng cho nháp và đã bỏ — với `soChot` bằng `currentValue`, `diemGoiY` bằng ma trận viết trước 20 ô (sáu kiểu × dưới, trúng, vượt đích — mốc hai ô — cộng ba ô làm tròn nửa bậc; công thức là hàm tiến độ của thanh tiến độ, nửa bậc làm tròn lên), `diem` rỗng, `thang` và `phienBanChuongTrinh` của cấu hình đang áp; And `setCyclePhase` nhảy quá một bước (lập kế hoạch → chấm điểm, đang chạy → đã đóng) bị từ chối với câu ghim.
- AC-6: Given chu kỳ pha «Chấm điểm», When người phụ trách KR, trưởng đơn vị và quản trị gọi `okr.chamKr` với điểm bằng gợi ý, điểm khác gợi ý có lý do, điểm khác gợi ý không lý do, điểm ngoài lưới — trên chương trình thang 0–1 rồi lặp trên thang 0–100 (điểm gửi và đọc theo thang của dòng, lưu chuẩn 0–1); và người sửa được mục tiêu gọi `okr.ghiDieuHocDuoc` (có chữ, rỗng, quá 2000 ký tự), Then đọc lại `OkrDiemKr` thấy `diem`, `lyDo`, `chamBoiUserId`, `chamLuc` đúng lần gửi hợp lệ cuối, mỗi lần một dòng vết `cham-kr`; không lý do và ngoài lưới bị từ chối với câu ghim, dòng không đổi; `OkrNhinLai` đọc lại đúng chữ, một dòng vết `nhin-lai` mỗi lần; And thành viên không sửa được KR và vai «chỉ OKR» không phụ trách KR đó bị từ chối; `chamKr` ở pha «Đang chạy» và «Đã đóng», `ghiDieuHocDuoc` ở «Đã đóng» bị từ chối; And `okr.bangCham` trả cho mỗi mục tiêu điểm mục tiêu (trung bình, có trọng số khi chương trình bật trọng số) và câu đọc theo loại bằng bảng viết trước (tham vọng 0,7 là «tốt»; cam kết dưới 1 là «chưa trọn»), tính theo phiên bản chương trình đã chép lúc sang pha chấm, và cho mỗi KR danh sách lần đổi đích ngoài rà.
- AC-7: Given chu kỳ pha «Chấm điểm» còn KR chưa chấm ở hai đơn vị, When quản trị gọi `setCyclePhase` sang «Đã đóng»; rồi chấm hết và gọi lại; rồi gọi `okr.moLaiKy` không lý do, có lý do, bằng thành viên thường; rồi đóng lại, Then lần đầu bị từ chối với câu ghim nêu số KR chưa chấm và `bangCham` trả đúng số chưa chấm theo đơn vị; lần sau pha đọc lại «Đã đóng»; ở pha «Đã đóng» mọi thủ tục ghi của khu OKR trên chu kỳ đó (mười một thủ tục của lượt 3, cập nhật tuần, `ghiSoKr`, `chamKr`, `ghiDieuHocDuoc`, `moRa`, `dongRa`) bị từ chối với câu ghim và bản ghi không đổi, nhịp chụp số không thêm dòng; `moLaiKy` có lý do của quản trị đưa pha về «Chấm điểm», để một dòng vết `mo-lai-ky` mang lý do ở `note`, `soChot` và `diemGoiY` không đổi; không lý do và thành viên thường bị từ chối.
- AC-8: Given mục tiêu đã công bố ở chu kỳ pha «Chấm điểm» có KR điểm 1, KR điểm dưới 1, KR «tăng tới» mà số chốt vượt đích nhưng người chấm 0,8, và một chỗ căn chỉnh; chu kỳ kế cùng loại ở pha «Lập kế hoạch», When người sửa được mục tiêu gọi `okr.mangSang`, rồi gọi lần hai, Then chu kỳ kế có đúng một mục tiêu nháp cùng cấp, đơn vị, loại, người phụ trách, người tham gia, tên, «vì sao lúc này», không căn chỉnh; KR điểm dưới 1 được chép với khởi điểm bằng số chốt, đích giữ, nguồn «tay»; KR điểm 1 không chép; KR làm hỏng luật kiểu không chép và có tên trong đầu ra; `OkrMangSang` nối hai mục tiêu và `bangCham`, `okr.objective` hai phía trả liên kết; mục tiêu, KR và điểm nguồn đọc lại không đổi; lần hai bị từ chối với câu ghim; And không có chu kỳ kế, chu kỳ kế đã đóng, trần «chặn» đã đầy, người không sửa được — bị từ chối với câu ghim và không dòng nào được tạo.
- AC-9: Given chu kỳ pha «Đã đóng» có mục tiêu công bố (có điểm, lý do chỉnh, đổi đích ngoài rà, điều học được, mang sang) và mục tiêu đã bỏ, When mỗi vai (quản trị, thành viên, vai «chỉ OKR») gọi `okr.xuatKy`, Then đầu ra là CSV UTF-8 có BOM, dòng tiêu đề bằng danh sách cột viết trước, mỗi KR một dòng, mỗi ô bằng giá trị đọc từ cơ sở dữ liệu (so theo một bảng viết trước, kể cả ô có dấu phẩy, ngoặc kép, xuống dòng); mục tiêu đã bỏ có dòng với điểm trống; không cột nào chứa dữ liệu đối tác; And sau khi đổi cấu hình chương trình (bật trọng số, đổi thang), `xuatKy` và `bangCham` của kỳ đã đóng trả giống lần trước từng byte; And `xuatKy` ở chu kỳ pha khác «Đã đóng» bị từ chối với câu ghim.
- AC-10: Given kỳ pha «Chấm điểm» có hai mục tiêu của một phòng ban, When mở «Theo đơn vị» trong trình duyệt thật của cây đang xét, chọn cách xem «Chấm điểm», chọn điểm khác gợi ý cho một KR rồi bấm «Lưu điểm» không lý do, ghi lý do rồi lưu, ghi điều học được rồi lưu, bấm «Mang sang» rồi xác nhận, Then màn có câu «Điểm cuối kỳ không phải đánh giá nhân sự», «Đã chấm N/M KR», gợi ý chọn sẵn, nhãn «Đích sửa ngoài rà» cạnh KR có đổi đích ngoài rà; lưu không lý do hiện lỗi dưới ô, có lý do thì cơ sở dữ liệu có điểm; URL giữ cách xem; hộp thoại mang sang nói sang chu kỳ nào, KR nào chép, KR nào không; sau xác nhận khối mục tiêu hiện «Đã mang sang <chu kỳ>»; And trạng thái đang tải, rỗng, lỗi có «Thử lại» (bấm tải lại được), kỳ đã đóng chỉ đọc, vai «chỉ OKR» thấy điểm không thấy ô; ảnh 390 và 1440 không tràn ngang, ở 390 bộ chọn cách xem thu thành danh sách thả xuống (biến thể mới trong `packages/ui`, áp cả ba cách xem cũ của «Theo đơn vị»); chữ người nhập mang `translate="no"`. (cross-layer)
- AC-11: Given quản trị ở Cài đặt › Chương trình OKR, When mở «Mở rà giữa kỳ» và gửi hai ngày; «Sang chấm điểm» khi chưa tới ngày sau ngày cuối; «Đóng kỳ» khi còn KR chưa chấm; «Đóng kỳ» khi đủ; «Mở lại kỳ» với lý do; rồi mở Toàn cảnh của kỳ đã đóng và bấm «Xuất», Then dòng chu kỳ hiện khoảng rà, khu OKR hiện dải «Đang rà giữa kỳ tới <ngày>» trong khoảng; sang chấm sớm hiện câu ghim của máy chủ; hộp thoại đóng liệt đơn vị còn KR chưa chấm với số, nút đóng tắt; đóng khi đủ đổi pha trên bảng; mở lại cần lý do (nút tắt khi trống), xong pha về «Chấm điểm»; «Xuất» tải về một tệp `.csv` có dòng tiêu đề đúng; And thành viên thường thấy các mục menu tắt kèm dòng giải thích. (cross-layer)
- AC-12: Given bốn vai workspace, When gọi mọi thủ tục mới (`moRa`, `dongRa`, `bangCham`, `chamKr`, `ghiDieuHocDuoc`, `moLaiKy`, `mangSang`, `xuatKy`) qua tRPC và qua khoá API, Then ma trận phạm vi `vai-chi-okr` tự dò đủ tám thủ tục và vẫn xanh: vai «chỉ OKR» gọi được cả tám theo quyền bản ghi (đọc `bangCham`, `xuatKy`; ghi khi sửa được); không thủ tục nào trả dữ liệu đối tác.
- AC-13: Given kho đo có hai chu kỳ gieo bằng thủ tục thật (`publishObjective`, `setCyclePhase`, `chamKr`, `ghiDieuHocDuoc`, `mangSang`) — mười mục tiêu đã công bố, 30 KR, tám mục tiêu có điều học được, ba mục tiêu mang sang, sáu KR có điểm khác gợi ý, When chạy `rang/khep-ky.sql` với `cycleId`, Then câu đếm trả đúng từng cột viết trước: pha, 10 mục tiêu, 30/30 KR có điểm, 8/10 có điều học được, 3/10 mang sang, 6/30 khác gợi ý, `chamDon` đúng một đơn vị (đơn vị gieo chấm dồn một người trong năm phút; đơn vị kia chấm rải hai ngày); And cùng câu trên chu kỳ còn KR chưa chấm trả tỷ lệ chấm đúng.
- AC-14: Given các tệp lượt này thêm hoặc sửa, When chạy cổng thiết kế tĩnh, bộ quét «Dấu hiệu vẽ tay» và soi mã, Then không vi phạm P0; không `<table`, `<h1`, `<h2`, chấm `size-2 rounded-full`, `divide-y`, hộp `rounded-lg border` tự dựng, `navigator.clipboard`, `AlertDialog` ráp tay trong `apps/app`; nút Huỷ của hộp thoại mới bọc `DialogClose`; không chú thích mã mới, không `Record<string, unknown>`, không `useEffect` trần trong tệp mới; `kiemOkr` và `OKR_KHEP` nằm ở `packages/validation`, không có bản sao trong `apps/api` hay `apps/app`; hằng số chỉnh được nằm ở `OKR_KHEP`; chữ mới có vi và en khác nhau; hai biến thể Cổng Phạm vi nhận (kiểu chữ «câu hỏi» cho dòng ghi chú dưới ô; bộ chọn cách xem thu về danh sách thả xuống ở khổ nhỏ) nằm trong `packages/ui`, không dựng ở chỗ gọi. (judgment)
- AC-15: Given cơ sở dữ liệu có OKR, cập nhật tuần, bản chụp số và cây tổ chức từ trước lượt này, When chạy `migration` của lượt này, Then mọi câu lệnh chỉ tạo bảng, chỉ mục, khoá ngoại mới; không `UPDATE`, `DELETE`, `DROP`, `ALTER COLUMN`, không cột mới trên bảng có sẵn; năm model mới là một dãy liền ở cuối `schema.prisma`; mọi khoá ngoại tới bảng OKR cũ là `RESTRICT`; And dữ liệu cũ đọc lại nguyên vẹn.

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — khâu:** rà giữa kỳ · sang pha chấm · chấm KR · nhìn lại · mang sang · đóng / mở lại · xuất · kiểm khi đặt  [thước CE: sáu gạch «Ý định» + bốn gạch «Trong phạm vi» của lộ trình lượt 7; NGÀNH: Perdoo, mooncamp] → AC-1…AC-9, AC-10, AC-11
- **Trục B — người:** quản trị · người sửa được mục tiêu · người phụ trách KR · thành viên không sửa được · vai «chỉ OKR»  [thước CE: `OkrAccessService`, `CONTEXT.md` «Vai chỉ OKR»] → AC-3, AC-6, AC-7, AC-8, AC-9, AC-12
- **Trục C — pha:** lập kế hoạch · đang chạy trong rà · đang chạy ngoài rà · chấm điểm · đã đóng  [thước CE: `PHA_CHU_KY` + cửa sổ rà] → AC-3, AC-4, AC-5, AC-6, AC-7
- **Trục D — hình dạng KR:** sáu kiểu × nguồn tay / máy  [thước CE: `KIEU_KR`, `NGUON_KR`] → AC-1, AC-5, AC-8
- Cross-cutting: vết trên mọi ghi (AC-3…AC-8); ba trạng thái màn, 390/1440, vi/en, `translate="no"` (AC-2, AC-10, AC-11); `migration` chỉ thêm (AC-15); đường đo (AC-13); nền cho 9b ở gói dùng chung (AC-1, AC-14).
- Chân ngành: đóng OKR để ghi điều học được [NGÀNH: Perdoo]; chấm 0–1, tham vọng 0,7 là tốt [NGÀNH: Google re:Work]; mỗi mục tiêu quyết mang sang, viết lại hay bỏ [NGÀNH: mooncamp, okrstool].
- [GIẢ ĐỊNH] Số chốt = giá trị hiện tại lúc sang pha chấm; sang pha chấm chỉ từ ngày sau ngày cuối (giờ VN) và khi mọi KR nguồn CRM đã có bản chụp ngày cuối.
- [GIẢ ĐỊNH] Điểm gợi ý = `tienDoKr` / 100 lấy bậc gần nhất của lưới, nửa bậc làm tròn lên (85 → 0,9) — cùng hàm với thanh tiến độ; giữ trên / giữ dưới / mốc chỉ 0 hoặc 1; «phần trăm» = số chốt / 100 như thanh tiến độ, nên KR phần trăm 20 → 80 chốt 80 gợi ý 0,8 (chốt tại Cổng Phạm vi 2026-09-27).
- [GIẢ ĐỊNH] Điểm gửi và đọc theo thang của dòng (0–100 thì 80), lưu chuẩn 0–1; kỳ đã chấm đọc theo phiên bản chương trình đã chép.
- [GIẢ ĐỊNH] Người chấm = người sửa được KR; điểm khác gợi ý bắt lý do 10–500 ký tự.
- [GIẢ ĐỊNH] Cửa sổ rà cho cả chu kỳ, do quản trị mở; chỉ đích bị gác, các ô khác của KR sửa như hôm nay.
- [GIẢ ĐỊNH] Điều học được không bắt buộc để đóng; ghi được ở đang chạy và chấm điểm.
- [GIẢ ĐỊNH] `setCyclePhase` từ nay đi đúng một bước — hôm nay cho nhảy nhiều bước.
- [GIẢ ĐỊNH] Mang sang: chép KR điểm dưới 1; không chép căn chỉnh; bản nháp ở chu kỳ cùng loại kế tiếp; mang sang được cả khi kỳ nguồn đã đóng.
- [GIẢ ĐỊNH] Xuất: CSV, chỉ kỳ đã đóng, mọi vai đọc OKR; số viết dấu chấm thập phân.
- [GIẢ ĐỊNH] Luật `kr-la-viec` bỏ qua KR «mốc»; `thieu-doi-trong` chỉ hỏi khi mọi KR là «tăng tới» và có ≥ 2 KR; `dich-bang-khoi-diem` chỉ áp ba kiểu mà lượt 3 chưa chặn.
- Chốt tại Cổng Phạm vi 2026-09-27: màn chấm theo hướng A của design-pass (cách xem thứ tư của «Theo đơn vị»); nhận hai biến thể Nhóm 2 (câu hỏi dưới ô, cách xem thu về danh sách thả xuống); không nhận hộp xác nhận có ô lý do.

## Đường đo

- Thước: quý 4/2026 ở pha «Đã đóng» trước 2027-01-15 (mọi KR của mục tiêu đã công bố có điểm người xác nhận) · số từ: `rang/khep-ky.sql` trên production với `cycleId` của quý 4, cột pha và tỷ lệ KR có điểm · bảo đảm bởi: AC-5 (dòng điểm sinh cho mọi KR đã công bố), AC-7 (đóng chỉ khi đủ), AC-13 (câu đếm có phép đo trên dữ liệu gieo)
- Thước: ≥ 70% mục tiêu đã công bố có «điều học được» không trống · số từ: cột điều học được của cùng câu · bảo đảm bởi: AC-6 (ô ghi và đọc lại từ bảng), AC-13
- Thước đọc kèm: tỷ lệ mục tiêu mang sang, tỷ lệ KR có điểm khác gợi ý · số từ: hai cột cuối của cùng câu · bảo đảm bởi: AC-5 (lưu cả gợi ý), AC-8 (nối hai chiều), AC-13
- Thước chết «phải mở lại kỳ vì lỗi công cụ» · số từ: dòng vết `mo-lai-ky` của quý 4 và lý do trong `note` · bảo đảm bởi: AC-7
- Thước chết «chấm trên bảng tính ngoài rồi gõ lại» · số từ: cột `chamDon` của `rang/khep-ky.sql` — số đơn vị mà mọi lần chấm do một người trong ≤ 10 phút (dấu hiệu gõ lại), đọc kèm câu hỏi ở phiên nghiệm thu «đơn vị anh chấm ở đâu?» do chủ kho hỏi trưởng đơn vị · bảo đảm bởi: AC-6 (`chamBoiUserId`, `chamLuc`), AC-13

## Out of scope

- **Kiểm chất lượng bằng mô hình, viết lại câu** — lượt 9b, chạy sau lớp luật này.
- **Nhắc chấm và nhắc rà qua Slack, Zalo** — quản trị báo bằng kênh sẵn có; nhắc theo lịch là một vòng có hợp đồng.
- **Nối điểm vào lương, thưởng, xếp hạng người hay đơn vị** — từ điển «Điểm cuối kỳ».
- **Nháp «điều học được» bằng máy** — lộ trình Trợ lý OKR mục 4 «Sau mùa».
- **Kiểm luật trên màn xem trước khi nhập bảng tính** — cùng hàm luật dùng được; thêm một bề mặt; mở lại trước mùa quý 1 nếu cần.
- **Đóng từng mục tiêu riêng, cửa sổ rà theo đơn vị, retrospective quy trình, chấm sao khâu thực thi** — xem Later của `coverage-scan.md`.
- **Tính lại số chốt khi mở lại kỳ** — số đã báo lên đứng yên.
- **Định dạng xuất khác CSV (xlsx, PDF)** — CSV mở được bằng Excel và Google Sheets.

> Rationale từng mục: `decisions.jsonl`.

## Notes

- Luật đã đọc: `AGENTS.md`, `docs/api.md` (qua bản tóm tắt của tác tử đọc mã: tRPC, vết `okrTrail`, khoá pha, quyền bản ghi, phạm vi dữ liệu), `docs/design.md` (kể cả «Vẽ tay là bậc cuối»), `docs/settings.md`, `docs/proto.md`, `CONTEXT.md` (OKR, Mục tiêu, KR, Kiểu KR, Nguồn số, Cập nhật tuần, Mức tự tin, Tình trạng, Chu kỳ, Chương trình OKR, Điểm cuối kỳ, Vai «chỉ OKR», Phạm vi dữ liệu); skill `web-design-guidelines`; hồ sơ `dat-okr-trong-crm`, `cap-nhat-tuan-okr`, `toan-canh-okr`, `so-okr-tu-chay`; báo cáo `docs/reports/2026-09-26-tro-ly-okr/` (07, 10-A, 10-B).
- Hạng T3: chạm `packages/db/prisma` (năm bảng mới). Lộ trình ghi T2; bộ nghiệm thu suy T3 từ `t3_paths`, nên có Cổng 1.5.
- Luật điều phối: phiên lượt 7 chỉ làm S0–S2 và các cổng người tới hết Cổng 1.5. Viết mã chỉ khi chủ kho dán «được viết mã, kéo onehub về trước»; khi đó gộp `origin/onehub` (9a thêm bảng vào Chương trình OKR, rồi `4n`), `bun install`, `db:generate`, soát lại kế hoạch và hạng với mã mới, rồi mới S3. Mốc `migration` đặt sau mốc mới nhất của `onehub` lúc gộp.
- Hạn cứng: production trước 2026-12-14.
- Hồ sơ đã ký có thể phải ghim lại: `dat-okr-trong-crm` (pha đi đúng một bước; `updateKeyResult` thêm luật đổi đích; hộp thoại KR), `vai-chi-okr` (tám thủ tục mới trong ma trận), `so-okr-tu-chay` (nếu bài của nó nhảy pha), `toan-canh-okr` (nút Xuất ở đầu Toàn cảnh), `cap-nhat-tuan-okr` (khoá pha đã đóng).
- Nền hạ tầng (`duong-nen.md`, 2026-09-27 trên `1f34aeac`): năm lớp xanh; lượt đầu đỏ giả vì tệp hồ sơ ghi vào cây giữa lúc bộ kiểm chạy, đã chạy lại trên cây sạch.

Known limits — Cổng Bằng chứng (Manh Phan 2026-09-28, định đoạt mục ngoài hợp đồng của vòng chấm 1; sổ d-20260927T211240Z-32 … -41):

- Ngoài-2 (`apps/app/app/(app)/[slug]/okr/hop-thoai-mang-sang.tsx`): Luật chọn KR được mang sang, chọn kỳ kế và tập pha có bảng chấm được viết ở cả màn lẫn máy chủ; nếu một bên đổi mà bên kia không, hộp thoại xem trước mang sang có thể nói khác với thứ hệ thống thật sự ghi.
- Ngoài-4 (`apps/api/test/okr-khep.spec.ts`): Ba ca từ chối (điều học được quá dài, mở lại thiếu lý do, lý do 9 ký tự) chỉ kiểm mã lỗi và bản ghi không đổi, không kiểm câu báo; câu báo đổi sai thì bài vẫn đạt.
- Ngoài-5 (`apps/app/test/okr-khep-cham.dom.tsx`): Bài màn chấm của kỳ đã đóng chỉ kiểm các ô sửa đã ẩn, không kiểm điểm chỉ đọc vẫn hiện; màn trống vẫn đạt (phép đo màn thật E13 có kiểm trạng thái đã đóng).
- Ngoài-6 (`packages/validation/test/okr-kiem.spec.ts`): Lời hứa «luật chất lượng là hàm thuần» được kiểm bằng tìm chuỗi trong mã nguồn, không phân tích cấu trúc mã; một cách nhập né chuỗi có thể lọt.
- Ngoài-7 (`packages/ui/test/khep-ky-bien-the.dom.tsx`): Bài bộ chọn cách xem so tên lớp CSS, không đo khổ nào hiện lối nào (phép đo màn thật E13 đo đúng ở khổ 390).

Mở hợp đồng mới — gom một vòng «Nợ sau lượt 7 OKR», xong trước 2026-12-14:

- Ngoài-1 (`apps/api/src/okr/okr-khep.service.ts`): Mang sang chọn chu kỳ đích rồi mới khoá, không kiểm lại pha; quản trị đổi pha kỳ đích đúng lúc đó thì bản nháp có thể rơi vào kỳ đã sang chấm điểm.
- Ngoài-3 (`apps/app/app/(app)/[slug]/settings/okr/bang-chu-ky.tsx`): Đợt rà có ngày bắt đầu ở tương lai không hiện «Đóng rà» và chặn mở đợt thay thế cho tới ngày bắt đầu.
