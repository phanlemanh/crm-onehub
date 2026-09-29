---
schema_version: 1
feature: Mục tiêu có mức hiển thị giới hạn, có bước duyệt nhẹ tuỳ chọn, và tái cơ cấu giữa kỳ không làm OKR mồ côi — mức công khai hay giới hạn áp trên mọi đường đọc OKR, ô «Công bố cần duyệt» của Chương trình OKR với một người duyệt suy từ cây, cây tổ chức không lưu trữ hay xoá được đơn vị còn OKR, chuyển OKR sang đơn vị khác, danh sách OKR mồ côi (lượt 8c — MT-06, QT-02, TC-06)
slug: gioi-han-duyet-cay-okr
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: implemented
approved_by: Manh Phan
approved_at: 2026-09-29T05:23:04Z
design_doc: docs/superpowers/specs/2026-09-29-gioi-han-duyet-cay-okr-design.md
---

# Acceptance Contract: gioi-han-duyet-cay-okr

## Context

Đo trên mã 29/09: không đường đọc OKR nào kiểm theo mục tiêu — mọi người vào khu OKR đọc
mọi mục tiêu, kể cả nháp; công bố có hai đường (nút và nhập bảng tính), không bước duyệt;
cây tổ chức lưu trữ được đơn vị còn OKR kỳ đang chạy (mục tiêu mồ côi lặng lẽ) và xoá hẳn
đơn vị có OKR thì trả 500. Lượt này thêm mức hiển thị giới hạn áp trên mọi đường đọc, ô
«Công bố cần duyệt» của Chương trình OKR (mặc định tắt) với một người duyệt suy từ cây, và
luật tái cơ cấu: chặn lưu trữ, xoá hẳn đơn vị còn OKR; chuyển OKR sang đơn vị khác; danh
sách OKR mồ côi cho quản trị. Hai cột có mặc định và một bảng mới; không công tắc riêng của
lượt — người dùng thấy ngay khi gộp.

Source input: `docs/plan/lo-trinh-okr.md` mục 1, mục 5 «Lượt 8» và «Dựng hết bằng dữ liệu
mẫu», dòng 8, 8c mục 10 · `_acceptance/gioi-han-duyet-cay-okr/opportunity.md` (nghĩa ba mã,
bảy giả định) · `_acceptance/canh-kr-okr/opportunity.md` (bảng chia mã) · `_acceptance/vai-chi-okr`
(ma trận bốn đường vào) · `CONTEXT.md` · prompt phiên lượt 8c ngày 2026-09-29.

## Criteria

- AC-1: Given một mục tiêu phòng ban nháp ở chu kỳ đang chạy, When người sửa được nó đặt mức «giới hạn» kèm hai người xem có tên, đổi danh sách người xem, rồi đặt lại «công khai», Then sau mỗi bước đọc lại từ bảng đúng `hienThi` và đúng tập hàng `OkrNguoiXem`, mỗi bước đúng một dòng vết `doi-hien-thi` có trước và sau; And tạo mục tiêu mới với mức «giới hạn» ghi đúng mức ngay ở hàng tạo; mang sang một mục tiêu giới hạn tạo bản nháp giới hạn với đúng người xem cũ trừ người đã rời; người không sửa được mục tiêu, người xem có tên không phải thành viên, quá 20 người xem, mục tiêu còn căn chỉnh (hai chiều), mục tiêu đang chờ duyệt và chu kỳ chấm điểm hay đã đóng đều bị từ chối với câu ghim và bảng không đổi.
- AC-2: Given bảng người viết trước — quản trị, trưởng phòng ban của mục tiêu, trưởng bộ phận trên, người phụ trách mục tiêu, người phụ trách một KR, người làm một việc dưới KR, người tham gia, người xem có tên, thành viên cùng phòng ban không liên quan, thành viên phòng khác, người vai «chỉ OKR» không liên quan — When hàm xem quyết từng người trên một mục tiêu phòng ban công khai, một mục tiêu phòng ban giới hạn và một mục tiêu cá nhân giới hạn, Then bảng kết quả bằng đúng bảng khai (mọi người thấy mục tiêu công khai; với giới hạn chỉ tám người đầu cộng trưởng phòng ban chính của người có mục tiêu cá nhân); And điều kiện Prisma dựng từ cùng ngữ cảnh trả đúng tập mục tiêu mà hàm thuần trả trên dữ liệu gieo, và tập trưởng của ngữ cảnh bằng tập trưởng của `OkrAccessService` cho mọi người của bộ OKR mẫu.
- AC-3: Given một mục tiêu giới hạn G có KR, việc, bình luận, vết và một mục tiêu công khai đối chứng, When người không xem được (vai thành viên) và người vai «chỉ OKR» không xem được gọi TỪNG thủ tục đọc của router `okr` rút lúc chạy — qua tRPC, qua cầu REST và bằng khoá API của chính họ — Then không phản hồi nào chứa mã, tên hay tên KR của G; thủ tục đọc theo mã của G trả 404 với đúng câu của mã không tồn tại; vết, diễn biến và căn chỉnh cũ của một mục tiêu công khai từng căn chỉnh với G không lộ mã hay tên của G mà hiện «một mục tiêu giới hạn»; And người xem được (người phụ trách KR) qua cùng ba đường thấy G ở mọi thủ tục khai «chứa G»; thủ tục đọc của router khác chạm bảng OKR nằm trong cùng danh sách; danh sách thủ tục đọc được ghim trong bài và một thủ tục đọc mới làm bài đỏ tới khi được khai. (cross-layer)
- AC-4: Given G giới hạn và hai mục tiêu công khai cùng phòng ban, When đọc toàn cảnh, họp tuần, sức khoẻ chương trình, đếm theo đơn vị, danh sách đích căn chỉnh và cây căn chỉnh, Then số gộp của phòng ban chỉ tính hai mục tiêu công khai và bằng nhau với người xem được lẫn người không xem được; G không là đích căn chỉnh chọn được và thêm căn chỉnh vào hay từ G bị từ chối; And ở danh sách theo đơn vị, của tôi, bảng chấm và tệp xuất kỳ, người xem được thấy G, người không xem được không thấy và tổng đếm, phân trang không tính G.
- AC-5: Given G giới hạn, When người không xem được theo dõi, bình luận, gửi ghi nhận, mang sang G, hay ghi số vào KR của G bằng khoá API, Then mỗi lời gọi trả 404 và không hàng nào được ghi; And người xem được bình luận nhắc tên một người không xem được, hay gửi ghi nhận tới người đó, thì bị từ chối nêu người đó; người đang theo dõi G mà mất quyền xem thì `viecCuaToi` và tin nhắc buổi sáng của họ không có mục nào nêu G, trong khi người phụ trách KR của G vẫn có mục cập nhật; And xếp việc trợ lý OKR trên G cho người không xem được bị từ chối, và tác tử đọc lại quyền trước khi đọc G.
- AC-6: Given quản trị ở Chương trình OKR, phòng ban P1 có trưởng T, bộ phận của P1 có trưởng H, When quản trị bật ô «Công bố cần duyệt», Then một phiên bản cấu hình mới đọc lại `duyetCongBo` đúng, một dòng vết `cau-hinh`, và người không phải quản trị đổi ô đó bị từ chối, phiên bản không tăng; When T bấm «Công bố» thẳng, và When T nhập bảng tính với «công bố luôn», Then «Công bố» bị từ chối với câu ghim, còn nhập tạo mục tiêu ở `cho-duyet` với vết gui-duyet — không đường nào ghi `cong-bo`; When H (người duyệt được) bấm «Công bố» một mục tiêu của P1, Then công bố thẳng, vết ghi tự duyệt; And ô duyệt tắt: «Công bố» của T công bố như trước lượt này, và một mục tiêu còn ở `cho-duyet` từ lúc ô bật công bố được bằng «Công bố»; số gộp và cập nhật tuần chỉ đếm mục tiêu `cong-bo`.
- AC-7: Given ô duyệt bật, một phòng ban P1 thuộc bộ phận B1 (trưởng H), trưởng P1 là T, When T gửi duyệt một mục tiêu nháp có KR, H trả lại kèm lý do, T sửa rồi gửi lại, H duyệt, Then trạng thái đọc lại đi đúng chuỗi nhap → cho-duyet → nhap → cho-duyet → cong-bo với `publishedAt` và khởi điểm KR khoá ở lần duyệt; vết đúng thứ tự [gui-duyet, tra-lai, gui-duyet, duyet] và dòng tra-lai giữ lý do; And bảng người duyệt viết trước theo cấp (phòng ban → trưởng bộ phận; bộ phận → quản trị; cá nhân → trưởng phòng ban chính, hay trưởng bộ phận khi chính người đó là trưởng phòng ban; không suy được → quản trị) khớp từng ca; người không duyệt được gọi duyệt hay trả lại bị từ chối; khi chờ duyệt mọi sửa nội dung mục tiêu, KR, căn chỉnh, mức hiển thị bị từ chối cho tới khi rút lại; lý do trả lại dưới 10 hay trên 500 ký tự bị từ chối.
- AC-8: Given một mục tiêu chờ H duyệt và một lần H trả lại mục tiêu khác của T, When `viecCuaToi` và tin nhắc buổi sáng kế của H và T được tính, Then H có đúng một mục `okr-cho-duyet` cho mỗi mục tiêu đang chờ mình, lặp mỗi sáng tới khi xử lý, và mục biến mất sau khi duyệt; T có đúng một mục `okr-tra-lai` kèm lý do trong cửa sổ 24 giờ; người không phải người duyệt không có mục chờ duyệt nào.
- AC-9: Given phòng ban P có mục tiêu ở chu kỳ đang chạy và bộ phận B có mục tiêu cấp bộ phận ở chu kỳ chấm điểm, When quản trị lưu trữ P, lưu trữ B, và xoá hẳn một phòng ban đã lưu trữ chỉ còn mục tiêu quý đã đóng, Then hai lần lưu trữ bị từ chối với câu nêu số mục tiêu và lối ra, P và B không đổi; xoá hẳn bị từ chối với 400 có câu (không 500) và `org.tree` báo đơn vị đó không xoá hẳn được, trả `okrMo` cho mỗi đơn vị; And phòng ban chỉ còn mục tiêu ở chu kỳ đã đóng hay mục tiêu đã bỏ thì lưu trữ được như trước.
- AC-10: Given P có bốn mục tiêu ở kỳ đang chạy — có KR, cập nhật tuần, căn chỉnh, người xem có tên, việc — When quản trị chuyển ba mục tiêu sang phòng ban Q, Then đọc lại ba mục tiêu có `departmentId` là Q, còn nguyên mọi KR, cập nhật tuần, căn chỉnh, người xem, việc và vết cũ; mỗi mục tiêu một vết `chuyen-don-vi` trước P sau Q; trưởng Q sửa được, trưởng P thì không; And một lô có mã không tồn tại, mục tiêu khác cấp, đơn vị nhận đã lưu trữ, chu kỳ đã đóng, hay người gọi không phải quản trị thì không mục tiêu nào đổi; vượt trần mục tiêu của Q thì vẫn chuyển và trả cảnh báo; sau khi chuyển cả bốn, lưu trữ P được.
- AC-11: Given bộ OKR mẫu đã nạp và `okr.moCoi` trả 0, When một phòng ban mất trưởng trong khi bộ phận của nó cũng không trưởng, một người phụ trách KR bị gỡ khỏi không gian làm việc, và một đơn vị bị lưu trữ bằng ghi thẳng vào bảng (dữ liệu trước lượt), Then `okr.moCoi` trả đúng ba mục với đúng lý do («không ai sửa được», «người phụ trách KR đã rời», «đơn vị đã lưu trữ») và `rang/okr-mo-coi.sql` đếm cùng ba lớp; And đặt trưởng, chuyển OKR của người rời, chuyển OKR của đơn vị lưu trữ thì cả hai trả 0; người không phải quản trị gọi `okr.moCoi` bị từ chối; dời phòng ban sang bộ phận khác không sinh mục mồ côi nào và quyền sửa đi theo trưởng bộ phận mới.
- AC-12: Given bộ OKR mẫu, When trong trình duyệt thật của cây đang xét trưởng phòng mở khung mục tiêu, đặt mức giới hạn kèm một người xem qua hộp thoại, gửi duyệt; trưởng bộ phận mở mục «Chờ bạn duyệt» trong việc OKR của mình, trả lại có lý do; một người không xem được mở đường dẫn của mục tiêu đó, Then DB ghi đúng mức, người xem, trạng thái sau từng bước; đầu khung hiện nhãn «Giới hạn», dải «Chờ … duyệt» và dải bị trả lại kèm lý do; người không xem được thấy «Không tìm thấy mục tiêu này» và không thấy tên mục tiêu ở đâu trên màn; And có đủ trạng thái đang tải, lỗi kèm «Thử lại», hộp mức hiển thị báo lỗi còn căn chỉnh, và ở khổ 390 không cuộn ngang. (cross-layer)
- AC-13: Given quản trị và một thành viên thường, When mở Cài đặt › Chương trình OKR, Cài đặt › Tổ chức và Sức khoẻ chương trình trong trình duyệt thật, Then quản trị bật được «Công bố cần duyệt» (DB đổi), chi tiết phòng ban hiện «OKR: N mục tiêu ở kỳ đang mở», hộp lưu trữ phòng ban còn OKR nói lý do và mở được «Chuyển OKR…», chuyển ba mục tiêu qua hộp thoại thì DB đổi đúng, khối «OKR mồ côi» hiện rỗng rồi hiện một mục sau khi gieo một ca; thành viên thường thấy công tắc khoá kèm một dòng lý do. (cross-layer)
- AC-14: Given bộ OKR mẫu và `rang/ty-le-gioi-han-duyet.sql`, When nạp, nạp lại, xoá bộ mẫu, và chạy câu trên một kho gieo qua thủ tục thật với số viết trước, Then sau nạp có đúng một mục tiêu giới hạn có người xem, một mục tiêu chờ duyệt, một dòng vết trả lại, một phòng ban lưu trữ chỉ còn mục tiêu quý đã khép, `okr.moCoi` trả 0; nạp lại không nhân đôi hàng `OkrNguoiXem`; xoá để lại 0 hàng mẫu; câu trả đúng tỷ lệ giới hạn trên đã công bố, trung vị giờ chờ duyệt, tỷ lệ xử lý trong 5 ngày và số mồ côi theo lớp, chỉ đọc; And `migration` của lượt chỉ thêm hai cột có mặc định, một bảng, chỉ mục và khoá ngoại của bảng mới, bảng mới cuối `schema.prisma`.
- AC-15: Given diff của lượt, When soi mã và giao diện, Then luật xem nằm ở một hàm thuần và một hàm dựng điều kiện dùng chung, mọi truy vấn `okrObjective` ở `apps/api/src/okr`, `packages/db/src/okr-*` và `apps/agent/agent/lib/okr` đi qua điều kiện đó hay nằm trong danh sách miễn có lý do; `to-chuc` không nhập `okr`; màn dựng bằng `packages/ui` (bậc 1–3 của `docs/design.md`), không dấu hiệu vẽ tay; chữ ở `lib/messages/okr*.ts` có vi và en, chữ người nhập mang `translate="no"`; đầu vào mới parse ở biên bằng Zod; `CONTEXT.md` có mục Mức hiển thị, Chờ duyệt / Người duyệt, Chuyển OKR, OKR mồ côi; `docs/api.md` mục OKR và mục cây tổ chức nói luật mới; danh sách thủ tục vai «chỉ OKR» với tới được sửa có chủ ý. (judgment)

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — luật:** hiển thị (công khai · giới hạn) · duyệt (tắt · bật) · cây đổi (lưu trữ · xoá hẳn · dời · trưởng đổi hay rời · người phụ trách rời · chuyển OKR) [thước CE: dòng 8c lộ trình; ba mã; NGÀNH: Perdoo «Make OKRs or KPIs private», Microsoft Viva Goals «Approval workflows», Leapsome, Tangible Growth] → AC-1, AC-6, AC-7, AC-9, AC-10, AC-11
- **Trục B — đường chạm dữ liệu:** danh sách · theo mã · số gộp · căn chỉnh · nhắc · ghi dựa trên mục tiêu · xuất, chấm · trợ lý · cửa vào [thước CE: sổ router `okr.*` rút lúc chạy; ma trận của `vai-chi-okr`] → AC-3, AC-4, AC-5, AC-8
- **Trục C — người:** quản trị · trưởng cấp trên · trưởng đơn vị · phụ trách mục tiêu · phụ trách KR · người làm việc · tham gia · người xem có tên · thành viên khác · vai «chỉ OKR» [thước CE: `OkrAccessService.quyen`, «Trưởng đơn vị»] → AC-2, AC-3, AC-7
- **Trục D — trạng thái:** nháp · chờ duyệt · công bố · bỏ × lập kế hoạch/đang chạy · chấm điểm/đã đóng [thước CE: `TRANG_THAI_MUC_TIEU`, `PHA_CHU_KY`] → AC-1, AC-7, AC-6, AC-9, AC-10
- Cross-cutting: ba cửa vào (AC-3, AC-5); vết mọi ghi mới (AC-1, AC-7, AC-10); pha (AC-1, AC-9, AC-10); màn và ba trạng thái (AC-12, AC-13); bộ mẫu và đường đo (AC-14); một hàm (AC-2, AC-15).
- [GIẢ ĐỊNH] Nghĩa ba mã như bảng ở `opportunity.md`.
- [GIẢ ĐỊNH] Hai mức — công khai, giới hạn; mức «trong đơn vị» là Later.
- [GIẢ ĐỊNH] Quản trị (owner, admin) xem được mọi mục tiêu [NGÀNH: Perdoo].
- [GIẢ ĐỊNH] Giới hạn không vào số gộp nào với mọi người và không căn chỉnh được [NGÀNH: Perdoo].
- [GIẢ ĐỊNH] Người duyệt suy từ cây theo bảng ở AC-7, một tầng; người bấm công bố đã là người duyệt thì công bố thẳng [NGÀNH: Microsoft Viva Goals, Leapsome].
- [GIẢ ĐỊNH] Chờ duyệt khoá sửa nội dung; muốn sửa thì rút lại.
- [GIẢ ĐỊNH] Lưu trữ đơn vị bị chặn khi còn mục tiêu (không bỏ) ở chu kỳ chưa đóng — gồm cả pha chấm điểm.
- [GIẢ ĐỊNH] Quản trị không sửa OKR của đơn vị không trưởng; chữa bằng đặt trưởng, danh sách mồ côi chỉ đường.
- [GIẢ ĐỊNH] Dời phòng ban giữa kỳ: OKR đi theo phòng ban, căn chỉnh giữ nguyên.

## Đường đo

- Thước: có ≥ 1 mục tiêu giới hạn đã công bố và tỷ lệ giới hạn ≤ 15% (SỐNG), > 30% (CHẾT), đọc 2027-01-11 · số từ: `rang/ty-le-gioi-han-duyet.sql` với `SET okr.chu_ky`, cột `gioiHan / congBo` · bảo đảm bởi: AC-1 (mức ghi và đọc lại từ bảng), AC-14
- Thước: khi chương trình bật duyệt, trung vị giờ chờ ≤ 48 và ≥ 90% xử lý trong 5 ngày; CHẾT khi ô tắt trong hai tuần sau khi bật · số từ: cùng câu, cột `trungViGioCho`, `xuLyTrong5Ngay / guiDuyet`, `tatTrongHaiTuan` (vết `cau-hinh` có before/after mang `duyetCongBo`) · bảo đảm bởi: AC-6, AC-7 (vết gui-duyet, duyet, tra-lai), AC-14
- Thước: 0 mục tiêu mồ côi ở mọi lần đọc tuần từ 2026-11-02 (SỐNG); cùng một mục tiêu có mặt ở ≥ 3 lần đọc tuần liên tiếp (CHẾT) · số từ: `rang/okr-mo-coi.sql` chạy mỗi thứ hai, cột `objectiveId`, `lop` — so danh sách giữa các lần đọc, không đo tuổi (gỡ thành viên xoá hàng thành viên, không còn mốc để tính tuổi) · bảo đảm bởi: AC-11, AC-14
- Thước: 0 lần xoá đơn vị trả 500 · số từ: dòng nhật ký `tRPC mutation org.purgeDepartment err` và `org.purgeDivision err` (đã có) · bảo đảm bởi: AC-9

## Out of scope

- Mức «trong đơn vị» (thành viên phòng ban thấy), mức hiển thị theo từng KR.
- Căn chỉnh cho mục tiêu giới hạn — cần dòng giữ chỗ không tên trên cây.
- Nhiều tầng duyệt, người duyệt chọn tay, duyệt lại khi sửa sau công bố.
- Quản trị sửa OKR của đơn vị không trưởng.
- Chặn hay cảnh báo ở hộp gỡ thành viên khi người đó còn phụ trách OKR — danh sách mồ côi phủ ca này.
- Gộp, tách đơn vị như một thao tác của cây tổ chức.
- Trợ lý OKR đọc theo mức hiển thị ngoài việc chặn ở hàng đợi và đọc lại ở tác tử — lượt 9b, C, T phải gọi cùng hàm.

## Notes

- Người dùng thấy ngay khi gộp, không công tắc riêng của lượt; ô «Công bố cần duyệt» mặc định tắt. Không gộp trong đóng băng (từ 19/10 tới khi các phòng ban công bố OKR quý 4).
- Chạm vùng của 9b (trợ lý đọc OKR) và của `to-chuc`; ai gộp sau kéo `onehub` về và chạy lại `soi-ma.mjs --ca xem`.
- Luật cho lượt sau: mọi đường đọc OKR mới gọi `dieuKienXemMucTieu`; mọi số gộp mới bỏ mục tiêu giới hạn.
