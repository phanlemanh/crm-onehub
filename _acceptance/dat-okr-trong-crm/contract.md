---
schema_version: 1
feature: Khu OKR trong CRM — quản trị mở chu kỳ năm và quý; mỗi cấp đặt mục tiêu với KR đủ sáu kiểu, căn chỉnh vào cấp trên, công bố; nhập bộ OKR quý 4 từ bảng tính có xem trước; mọi sửa đổi để lại vết
slug: dat-okr-trong-crm
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: signed-off
approved_by: Manh Phan — uỷ quyền phiên điều phối 2026-09-24
approved_at: 2026-09-25T04:01:49Z
design_doc: docs/superpowers/specs/2026-09-25-dat-okr-trong-crm-design.md
---

# Acceptance Contract: dat-okr-trong-crm

## Context

Lộ trình OKR đưa mọi phòng ban vào CRM từ 2026-10-26; hôm nay CRM chưa có chỗ nào
để đặt một mục tiêu. Hai lượt trước đã có cây tổ chức có trưởng (#120, #128) và vai
«chỉ OKR» (#129). Lượt này thêm khu «Mục tiêu» trên thanh điều hướng với sáu bảng
mới ở cuối `schema.prisma`, module `apps/api/src/okr` khai nhóm dữ liệu `okr`, quyền
theo bản ghi từ trưởng đơn vị của cây tổ chức, màn «Theo đơn vị» và sheet mục tiêu
dựng theo bản mẫu đã duyệt, nhập từ bảng tính xem trước rồi ghi, và trang Cài đặt ›
Chương trình OKR cho quản trị.

Source input: `docs/plan/lo-trinh-okr.md` mục 5 «Lượt 3» (CK-01…03, MT-01…05, KR-01…03,
KR-05 tay, QT-01, QT-03, QT-06) + `_acceptance/dat-okr-trong-crm/opportunity.md` +
`_acceptance/ban-mau-okr/design-pass.md` mục «Duyệt» + prompt phiên điều phối 25/09
(bổ sung `docs/settings.md` và «Vẽ tay là bậc cuối»).

## Criteria

- AC-1: Given một quản trị, When họ tạo chu kỳ năm 2026 rồi chu kỳ quý 4 với cha là năm đó, ngày bắt đầu và kết thúc theo ngày lịch Việt Nam, khoảng nghỉ Tết và ngày cập nhật trong tuần, rồi chuyển pha quý từ «Lập kế hoạch» sang «Đang chạy», Then hai dòng chu kỳ đọc lại từ cơ sở dữ liệu mang đúng loại, cha, hai ngày, khoảng nghỉ, ngày cập nhật và pha; And quý có ngày ngoài năm cha, quý chồng ngày quý khác cùng năm, pha đi lùi, bị từ chối với câu ghim và không dòng nào đổi; And thành viên thường và người vai «chỉ OKR» gọi cùng thủ tục thì bị từ chối theo vai quản trị; And `okr.cycles` trả quý «Đang chạy» chứa ngày hôm nay (giờ Việt Nam) làm chu kỳ hiện tại.
- AC-2: Given một quản trị và cấu hình chương trình đang áp, When họ ghi cấu hình mới (trần mục tiêu, trần KR, chế độ cảnh báo hay chặn, thang chấm, trọng số, OKR cá nhân), Then bảng cấu hình có thêm đúng một dòng với phiên bản lớn hơn dòng cũ một đơn vị, dòng cũ không đổi, và `okr.program` trả dòng mới; And ở chế độ «cảnh báo» tạo mục tiêu vượt trần vẫn ghi và đầu ra mang câu cảnh báo, ở chế độ «chặn» bị từ chối với câu ghim; And khi OKR cá nhân tắt, tạo mục tiêu cấp cá nhân bị từ chối; And thành viên thường ghi cấu hình bị từ chối.
- AC-3: Given chu kỳ quý «Đang chạy», cây tổ chức có bộ phận, phòng ban và trưởng, When trưởng phòng ban tạo mục tiêu cấp phòng ban với tên, loại (cam kết hay tham vọng), người phụ trách, người tham gia và «vì sao lúc này»; trưởng bộ phận tạo mục tiêu cấp bộ phận; quản trị tạo mục tiêu cấp OneHub; và (chương trình bật) một người tạo mục tiêu cấp cá nhân cho chính mình, Then mỗi mục tiêu đọc lại từ cơ sở dữ liệu ở trạng thái nháp với đúng cấp, đơn vị, người phụ trách, người tham gia, «vì sao lúc này»; And mục tiêu cấp phòng ban mà thiếu phòng ban, hoặc mang cả bộ phận lẫn phòng ban, bị từ chối; And sửa tên, loại, người tham gia đọc lại đúng.
- AC-4: Given một mục tiêu nháp, When người sửa được nó thêm sáu KR — tăng tới, giảm xuống, giữ trên, giữ dưới, mốc, phần trăm — với khởi điểm, đích, giá trị hiện tại, đơn vị đo, hạn, trọng số và người phụ trách, Then sáu dòng KR đọc lại từ cơ sở dữ liệu mang đúng kiểu, số, đơn vị, hạn, trọng số, người phụ trách và nguồn «tay»; And tiến độ tính theo bảng kiểu của thiết kế (tăng: theo khoảng; giảm: theo khoảng đảo; giữ trên/dưới: 0 hay 100; mốc: xong/chưa; phần trăm: giá trị) bằng hàm thuần đo được; And kiểu lạ, tăng tới có đích không lớn hơn khởi điểm, giảm xuống có đích không nhỏ hơn khởi điểm, phần trăm ngoài 0–100, bị từ chối với câu ghim; And xoá một KR đọc lại còn năm dòng và để một dòng vết.
- AC-5: Given một mục tiêu nháp có KR, When người sửa được nó công bố, Then trạng thái đọc lại là «công bố» với ngày công bố, mọi KR có dấu khoá khởi điểm; And sau đó sửa khởi điểm của một KR bị từ chối với câu ghim «khởi điểm đã khoá khi công bố» còn sửa đích và giá trị hiện tại thì ghi được; And công bố mục tiêu không có KR bị từ chối; And «bỏ» mục tiêu đọc lại trạng thái «đã bỏ» với ngày bỏ, KR và chỗ góp còn nguyên; And ở chu kỳ pha «Chấm điểm» và pha «Đã đóng», cả mười một thủ tục ghi (tạo/sửa/công bố/bỏ mục tiêu, tạo/sửa/xoá KR, gắn/gỡ căn chỉnh, xem trước/ghi lô) đều bị từ chối với câu ghim và bản ghi đích không đổi, còn ở pha «Đang chạy» cùng mười một thủ tục đó chạy.
- AC-6: Given cây tổ chức có hai bộ phận, mỗi bộ phận hai phòng ban, có trưởng, và một KR có người phụ trách là thành viên thường, When gọi các thủ tục ghi bằng phiên của từng người, Then trưởng phòng ban A sửa và công bố được mục tiêu phòng ban A nhưng bị từ chối ở phòng ban B và ở bộ phận; trưởng bộ phận sửa được mục tiêu bộ phận mình và cả hai phòng ban con nhưng bị từ chối ở bộ phận kia; người phụ trách KR sửa được KR của mình (đích, hiện tại, đơn vị) nhưng bị từ chối khi sửa mục tiêu hay KR khác; quản trị sửa được mục tiêu cấp OneHub, mở chu kỳ, nhưng bị từ chối khi sửa mục tiêu phòng ban; thành viên thường không giữ vai trò nào bị từ chối ở mọi thủ tục ghi; mọi người đọc được mọi mục tiêu.
- AC-7: Given mục tiêu OneHub đã công bố có hai KR và mục tiêu bộ phận đã công bố, When trưởng phòng ban gắn mục tiêu phòng ban vào một KR của OneHub và vào mục tiêu bộ phận, rồi gắn chính mục tiêu quý của phòng ban đó vào mục tiêu năm của bộ phận chứa phòng ban, Then bảng căn chỉnh đọc lại có đúng ba dòng, `okr.alignmentTree` hiện mục tiêu phòng ban ở cả hai chỗ góp với dấu lặp lại, và mục tiêu không góp vào đâu nằm ở mục «Chưa căn chỉnh»; And gắn vào mục tiêu cùng cấp, cấp thấp hơn, chính nó, mục tiêu còn nháp, hay chu kỳ không phải cùng chu kỳ hoặc năm cha, bị từ chối với câu ghim; And gắn lần hai cùng đích bị từ chối; And gỡ một chỗ góp đọc lại còn hai dòng; `okr.alignmentTargets` chỉ trả ứng viên hợp lệ.
- AC-8: Given các thao tác ở AC-1, AC-3, AC-4, AC-5, AC-7 đã chạy, When đọc bảng vết, Then mỗi thủ tục ghi để lại đúng một dòng với người làm, việc đã làm, bản ghi đích và trước → sau (tạo: trước rỗng; sửa: hai bên khác nhau đúng ô đã sửa; công bố: trạng thái nháp → công bố), đếm được bằng phép đếm độc lập; And số dòng `Activity` trước và sau toàn bộ chuỗi bằng nhau; And tab «Vết» của sheet mục tiêu hiện các dòng đó theo thứ tự thời gian.
- AC-9: Given trưởng phòng ban dán một bảng bảy cột `mục tiêu · KR · kiểu · khởi điểm · đích · đơn vị đo · email phụ trách KR` có dòng hợp lệ lẫn dòng hỏng, When bấm «Xem trước», Then máy chủ trả từng dòng kèm câu lỗi ghim đúng loại — thiếu mục tiêu · thiếu KR · tên hoặc đơn vị đo sai độ dài · kiểu lạ · email không phải thành viên · thiếu đích · đích không hợp với kiểu · mục tiêu đã có trong CRM cho đơn vị và chu kỳ này · lô quá trần dòng · lô làm vượt trần mục tiêu khi chương trình ở chế độ «chặn» — và không ghi gì; When bấm «Ghi», Then máy chủ phân tích lại chữ gốc, ghi các mục tiêu (gom theo tên) và KR hợp lệ trong một lần ghi, mục tiêu ở trạng thái nháp (hoặc công bố khi chọn «công bố ngay»), người phụ trách mục tiêu là trưởng đơn vị, một dòng vết «nhập từ bảng tính» ghi đơn vị, chu kỳ, số mục tiêu, số KR; And dòng hỏng không để lại gì; And ghi lại cùng lô lần hai trả 0 dòng ghi, bảng không đổi và không thêm dòng vết; And người không sửa được đơn vị bị từ chối ở cả xem trước lẫn ghi, còn quản trị workspace nhập được cho mọi đơn vị. (cross-layer)
- AC-10: Given cây tổ chức và một chu kỳ «Đang chạy» có mục tiêu ở OneHub, một bộ phận và một phòng ban, When mở «Mục tiêu › Theo đơn vị» bằng trình duyệt thật của cây đang xét, Then cột trái là cây đơn vị đọc từ cây tổ chức (số mục tiêu đã công bố cạnh mỗi đơn vị), chọn một đơn vị thì danh sách bên phải hiện thẻ mục tiêu với bảng KR (tên, phụ trách, tiến độ, đích) và đổi URL; nút «Cây căn chỉnh» hiện bảng cây toàn công ty; chọn chu kỳ khác thì danh sách đổi; trưởng phòng ban thấy nút «Thêm mục tiêu» và «Nhập từ bảng tính», thành viên thường không thấy; đơn vị chưa có mục tiêu hiện trạng thái rỗng, đơn vị chưa có trưởng hiện câu «gán trưởng ở Cài đặt › Tổ chức», cơ sở dữ liệu không có chu kỳ nào hiện câu «chưa mở chu kỳ» (quản trị thấy thêm liên kết Cài đặt), máy chủ trả lỗi thì hiện `Empty` có nút «Thử lại» và bấm nút đó tải lại được; And thanh điều hướng có mục «Mục tiêu» / «Objectives» cho mọi vai, `/okr` là đường dự trữ, tab «Toàn cảnh» nói mở ở lượt 5, hàm thuần của rail và của phạm vi màn đo được không cần trình duyệt; And tab «Của tôi» (`okr.mine`) gom mục tiêu tôi phụ trách, mục tiêu tôi tham gia và mục tiêu có KR tôi phụ trách (KR của tôi đánh dấu), người chưa giữ gì thấy trạng thái rỗng trỏ sang Theo đơn vị, và `okr.access` trả đúng danh sách đơn vị người gọi làm trưởng cùng cờ quản trị chương trình. (cross-layer)
- AC-11: Given sheet Thoả thuận đang mở trong ứng dụng thật, When mở `?record=objective:<id>` chồng lên, Then sheet mục tiêu hiện tên, đơn vị · chu kỳ, huy hiệu loại và trạng thái, ba ô số, ba tab KR · Căn chỉnh · Vết — chụp ở 1440 và 390; When bấm «Quay lại», Then sheet Thoả thuận đó hiện lại (URL còn `record=deal:<id>`, tiêu đề là tên thoả thuận); When người sửa được bấm «Thêm KR» rồi điền và gửi, Then bảng KR có thêm dòng và cơ sở dữ liệu có dòng KR mới; When bấm «Công bố» và xác nhận, Then huy hiệu đổi thành «Đã công bố» và cơ sở dữ liệu ghi trạng thái công bố; And hộp thoại KR khoá ô khởi điểm sau công bố với chú thích; And tên mục tiêu, tên KR, tên người, đơn vị đo mang `translate="no"`. (cross-layer)
- AC-12: Given một người vai «chỉ OKR» là trưởng một phòng ban và một người vai «chỉ OKR» không làm trưởng, When gọi thủ tục OKR bằng phiên của họ, Then người thứ nhất tạo, thêm KR, công bố được mục tiêu phòng ban mình và đọc được cây tổ chức; người thứ hai đọc được mọi mục tiêu nhưng bị từ chối ở mọi thủ tục ghi theo quyền bản ghi (không phải theo phạm vi); cả hai gọi `contacts.list`, `deals.list` vẫn nhận từ chối phạm vi; And ma trận phạm vi của lượt 2 chạy lại với tập alias cho phép thêm `okr` vẫn xanh; And rail của vai này có đúng ba mục Tổng quan · Mục tiêu · Cài đặt, `/okr` không bị đưa về «ngoài phạm vi», Tổng quan rút gọn trỏ tới khu Mục tiêu.
- AC-13: Given quản trị mở Cài đặt › Chương trình OKR, When xem trang, Then trang dùng khung Cài đặt (thanh bên có mục «Chương trình OKR» — nhóm thanh bên chưa dựng ở docs/settings.md đợt 1, mục nằm ngay sau «Tổ chức» trong danh sách phẳng hiện có, `PageShell`, hai `Card` với `CardTitle`: «Chu kỳ» là bảng nhỏ có cột và menu «Chuyển pha», «Cấu hình» là form với nút Lưu ở góc thẻ chỉ bật khi đã sửa và hợp lệ, hai dòng công tắc xếp ngang); When bấm «Mở chu kỳ», điền vào `Sheet` và gửi, Then bảng chu kỳ có dòng mới và cơ sở dữ liệu có dòng chu kỳ; When sửa trần và Lưu, Then toast báo đã lưu và bảng cấu hình có dòng phiên bản mới; And thành viên thường mở trang thấy điều khiển khoá và một dòng dưới tiêu đề nói chỉ quản trị đổi được, không section nào ẩn. (cross-layer)
- AC-14: Given các tệp giao diện lượt này chạm, When chạy cổng thiết kế tĩnh và bộ quét «Dấu hiệu vẽ tay», Then không tệp nào có vi phạm P0; không tệp nào chứa `<table`, `<h1`, `<h2`, chấm `size-2 rounded-full`, `navigator.clipboard`, `AlertDialog`, `divide-y`, hộp `rounded-lg border` tự dựng; không tệp nào trong `packages/ui` bị sửa (thêm mới thì được); And bảng bậc thang trong thiết kế có một dòng cho mỗi tệp `.tsx` mới của khu OKR, sheet mục tiêu và trang Cài đặt. (judgment)
- AC-15: Given cơ sở dữ liệu có cây tổ chức, kế hoạch 30 ngày và thành viên từ trước lượt này, When chạy migration của lượt này, Then mọi câu lệnh chỉ tạo bảng, chỉ mục, khoá ngoại mới; không `UPDATE`, `DELETE`, `DROP`, `ALTER COLUMN`, không cột mới trên bảng có sẵn; các model OKR là một dãy liền ở cuối `schema.prisma`; And dữ liệu cũ đọc lại nguyên vẹn (cây tổ chức, kế hoạch).

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — vật:** chu kỳ · cấu hình chương trình · mục tiêu · KR · căn chỉnh · vết · lô nhập  [thước CE: bảng mục 2 của design doc — mỗi bảng một dòng] → AC-1, AC-2, AC-3, AC-4, AC-7, AC-8, AC-9
- **Trục B — hành động:** tạo · sửa · công bố/đổi pha · bỏ · đọc lại · nhập lô  [thước CE: preset entity-feature + bảng thủ tục mục 3] → AC-1…AC-9; «đọc lại từ DB» là vế bắt buộc của mọi AC ghi
- **Trục C — người:** quản trị · trưởng bộ phận · trưởng phòng ban · người phụ trách KR · thành viên thường · vai «chỉ OKR» (làm trưởng / không)  [thước CE: bảng quyền mục 4; `WORKSPACE_ROLES`; ô trưởng của lượt 1] → AC-6, AC-12
- **Trục D — cấp × chu kỳ:** OneHub · bộ phận · phòng ban · cá nhân (bật/tắt) × quý · năm  [thước CE: `CONTEXT.md` Bộ phận/Phòng ban hai cấp cố định; lộ trình mục 5] → AC-2, AC-3, AC-7
- Cross-cutting: ba trạng thái màn, 390/1440, vi/en, `translate="no"` (AC-10, AC-11, AC-13) · cổng thiết kế tĩnh và dấu hiệu vẽ tay (AC-14) · migration chỉ thêm (AC-15) · vết trên mọi ghi (AC-8).
- Chân ngành: kiểu KR và pha chu kỳ [NGÀNH: Perdoo, Weekdone]; cam kết vs tham vọng [NGÀNH: Google re:Work].
- Sáu kiểu KR là tăng tới · giảm xuống · giữ trên · giữ dưới · mốc · phần trăm — chốt tại Cổng Phạm vi 2026-09-25; đơn vị đo tự do nên KR tiền là «tăng tới» với đơn vị tiền.
- Mục tiêu cấp OneHub do quản trị workspace sửa, vì cây tổ chức không có «trưởng OneHub» — chốt tại Cổng Phạm vi.
- Đích căn chỉnh phải đã công bố; nháp của cấp trên không hiện làm ứng viên — chốt tại Cổng Phạm vi.
- Nhập từ bảng tính là việc của người sửa được đơn vị (trưởng), và quản trị workspace cũng nhập được cho mọi đơn vị; bảng bảy cột, mỗi dòng một KR, mục tiêu gom theo tên — chốt tại Cổng Phạm vi.
- Nhãn rail là «Mục tiêu» / «Objectives»; tiêu đề màn vẫn dùng chữ OKR như bản mẫu — chốt tại Cổng Phạm vi.
- Mục rail «Mục tiêu» đứng sau «30 ngày đầu», trước «Cài đặt» như bản mẫu; hai hồ sơ đã ký liên quan ghim lại trong cùng PR — chốt tại Cổng Phạm vi.

## Đường đo

- Thước: đến 2026-11-02 mọi phòng ban có bộ OKR quý 4 ở pha «Đang chạy» · số từ: bảng mục tiêu (`status = cong-bo`, `level = phong-ban`) nối bảng phòng ban chưa lưu trữ, chu kỳ quý 4 pha `dang-chay` · bảo đảm bởi: AC-1 (pha), AC-3, AC-5 (trạng thái công bố đọc lại), AC-10 (số đếm cạnh mỗi đơn vị)
- Thước: không bộ nào phải nhập lại quá một lần · số từ: bảng vết, hành động `nhap-bang-tinh`, đếm theo đơn vị × chu kỳ ≤ 2 · bảo đảm bởi: AC-9 (vết nhập ghi đơn vị và chu kỳ)
- Thước: không phải sửa cơ sở dữ liệu tay · số từ: phiên nghiệm thu hỏi quản trị và trưởng đã dựng bằng đường nào · bảo đảm bởi: AC-1, AC-2, AC-9, AC-13 phủ mọi thao tác từ rỗng tới bộ đã công bố

## Out of scope

- **Cập nhật tuần, mức tự tin theo tuần, nhắc** — lượt 4; lượt này KR chỉ có khởi điểm, đích và giá trị nhập tay khi đặt.
- **Toàn cảnh, heatmap, họp tuần, 11 biến thể `packages/ui`** — lượt 5; tab Toàn cảnh chỉ là chỗ đứng.
- **Số tự đo từ CRM/API** — lượt 6; cột nguồn chỉ nhận «tay».
- **Rà giữa kỳ, chấm, khép kỳ, sửa ngày chu kỳ, pha lùi, mở lại kỳ** — lượt 7; hai pha cuối chỉ có trong danh mục và khoá ghi.
- **Mức hiển thị giới hạn, mẫu OKR, cột căn chỉnh trong bảng tính** — lượt 8.
- **Chuyển mục tiêu/KR khi người nghỉ** — lượt 4 (hộp «Chuyển việc 30 ngày»).
- **Thành phần cây bàn phím, biến thể `Progress` trung tính, chuyển `ConfirmDialog` vào `packages/ui`** — Nhóm 2 của bản mẫu và đợt 2 của `docs/settings.md`; lượt này dùng bậc 1 hiện có.
- **Phân rã KR cấp trên thành mục tiêu cấp dưới; xoá hẳn chu kỳ/mục tiêu; sửa vết** — không làm (NG-06, vết chỉ thêm).

> Rationale từng mục: `decisions.jsonl`.

## Notes

- Luật đã đọc: `docs/api.md`, `docs/design.md` (kể cả «Vẽ tay là bậc cuối»), `docs/settings.md`, `docs/proto.md`, `docs/reui.md`, skill `nestjs-trpc`, `prisma-database-setup`, `AGENTS.md`, `CONTEXT.md` (các mục OKR, Bộ phận, Phòng ban, Trưởng đơn vị, Phạm vi dữ liệu), hồ sơ `ban-mau-okr`, `vai-chi-okr`, `cau-truc-to-chuc`.
- Hạng T3: chạm `packages/db/prisma` (sáu bảng mới) — có Cổng 1.5.
- Màn «Của tôi» (thêm sau phản biện context sạch) gộp vào AC-10 theo quyết định tại Cổng Phạm vi để giữ 15 tiêu chí; phép đo E22 phục vụ AC-10.
- Vòng khác (`mot-duong-ghi-phong-ban`) đang sửa `apps/api/src/to-chuc`, `apps/api/src/onboarding`, `settings/organization`: lượt này chỉ đọc các file đó (nhập `ToChucService`, dùng `NavItem` cùng hình), không sửa.
- Cổng người của lượt do phiên điều phối ký theo uỷ quyền của Manh Phan ngày 2026-09-24; dòng ký ghi «Manh Phan — uỷ quyền phiên điều phối 2026-09-24». Cổng Bằng chứng: chủ kho gõ dòng ký.
- Hồ sơ đã ký phải ghim lại sau lượt: `vai-chi-okr` (hằng `ALIAS_CHO_PHEP` thêm `okr`; rail vai này thêm mục), hồ sơ giữ `khung-dieu-huong.spec.ts` (số mục rail 8 → 9).
- Nền hạ tầng (`duong-nen.md`): ba dòng đỏ là nền, không phải vật — build xanh khi chạy với tiền tố PATH Node 24; làn S4 chạy với cùng tiền tố.
- Design-pass của lượt này bỏ có tên (sổ quyết định), chấp nhận tại Cổng Phạm vi với điều kiện: bốn phép đo chụp màn thật của S4 (E11, E12, E15, E20) có ảnh ba bề mặt mới — hộp thoại mục tiêu/KR, hộp thoại nhập, trang Cài đặt › Chương trình OKR — ở 1440 và 390, đặt cạnh sheet Thoả thuận, để Cổng Bằng chứng duyệt bằng mắt.

Known limits — chấp nhận tại Cổng Phạm vi 2026-09-25 (Manh Phan — uỷ quyền phiên điều phối 2026-09-24):

- Thanh tiến độ của KR và mục tiêu dùng `Progress` có sẵn (tô màu thương hiệu, không có vạch «lẽ ra»), lệch bản mẫu đã duyệt; lượt 5 thay bằng biến thể trung tính trong `packages/ui`.

Lời hứa thay bởi hồ sơ khác (thêm 17/10, trang-don-vi-mot-bang AC-14):

- Trên trang Theo đơn vị, KR là dòng con cùng bốn cột của bảng đơn vị, không còn bảng KR riêng trong thẻ mục tiêu (E11 bước 2) — thay bởi trang-don-vi-mot-bang AC-3.
