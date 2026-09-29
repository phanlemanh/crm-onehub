---
schema_version: 1
feature: Tìm và điều hướng kho tài liệu — ⌘K có dấu hay không dấu, trang nhắc tới trang này kèm câu, lọc theo đơn vị, loại, chủ, tab Sức khoẻ, dòng «N bản chờ bạn duyệt» trong nhắc sáng
slug: tim-va-dieu-huong-kho
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: verified
design_doc: docs/superpowers/specs/2026-09-29-tim-va-dieu-huong-kho-design.md
approved_by: Phan Le Manh
approved_at: 2026-09-29
---

# Acceptance Contract: tim-va-dieu-huong-kho

## Context

Lượt 3 của `docs/plan/lo-trinh-kho-tai-lieu.md`. Sau lượt này nhân viên nói được: «Tôi gõ ⌘K
có dấu hay không dấu là ra trang; thấy trang nào nhắc tới trang này; sáng ra biết có mấy bản
chờ tôi duyệt.» Lượt 1 (`kho-tai-lieu`, #180) đã đặt sẵn cột `timKiem` ghi lúc duyệt và bảng
`taiLieuLienKet` thay trọn lúc duyệt, nên lượt này không migration và là T2.

Source input: lộ trình mục 4 «Lượt 3» và sổ dòng 1, 2 (lịch sử, khôi phục, lưu trữ dời sang;
hai hạn chế `|` và trần 25 dòng vào đầu lượt 3), `kho-tai-lieu-nghien-cuu.md` mục 5.1, 6.7, 7.2,
bản mẫu `/proto/kho-tai-lieu` trạng thái `ST-tim-nhanh`, `ST-suc-khoe`, hai lựa chọn của chủ
kho trong phiên 2026-09-29 (dòng nhắc đếm bằng số tab «Chờ duyệt»; nhận chèn liên kết tới
trang), từ điển `CONTEXT.md` (Trang, Chủ trang, Bản đề xuất, Bản đang dùng, Xác minh đến ngày).

## Criteria

- AC-1: Given ma trận viết trước gồm bốn trang đã duyệt (tên và nội dung có «đ», dấu thanh, chữ hoa) và các truy vấn: có dấu, không dấu, chữ hoa, gõ dở từ cuối («quy đ», «hoa ho»), từ chỉ có trong nội dung, từ chỉ có trong tên, từ không có ở đâu, dưới 2 chữ, chỉ ký hiệu, When một thành viên gọi `taiLieu.tim`, Then mỗi truy vấn trả đúng tập trang viết trước, bản có dấu và bản không dấu của cùng câu trả cùng tập; And trang trúng tên đứng trước trang chỉ trúng nội dung; And mỗi dòng mang đoạn trích lấy từ chữ có dấu của bản đang dùng, phần khớp trả riêng; And dưới 2 chữ hay chỉ ký hiệu trả rỗng không lỗi. (cross-layer)
- AC-2: Given ma trận viết trước sáu người (người tạo, chủ trang, `owner`, `admin`, thành viên khác, vai `okr`) × bốn trạng thái trang (chưa từng duyệt có bản chờ · đang dùng có bản chờ mang từ mới · đang dùng có bản bị trả lại mang từ mới · đang dùng không bản chờ), When mỗi người gọi `taiLieu.tim` với từ chỉ có trong bản đề xuất, `taiLieu.nhacToi` và `taiLieu.sucKhoe`, Then chữ chỉ có trong thân bản chưa duyệt không xuất hiện trong kết quả tìm, dòng «trang nhắc tới» hay mục Sức khoẻ nào, với bất kỳ ai; And tên trang chưa từng duyệt chỉ xuất hiện trong danh sách «Có đề xuất chờ duyệt», và chỉ với người thấy bản chờ đó theo luật lượt 1 (người tạo, chủ trang, `owner`, `admin`), không với thành viên khác hay vai `okr`; And cùng lúc đó mỗi đường vẫn trả đúng nội dung của bản đang dùng cho cả sáu người. (cross-layer)
- AC-3: Given một thành viên và một người vai `okr` đăng nhập, When mỗi người mở ⌘K (hoặc bấm «Tìm nhanh ⌘K» ở Kho tài liệu) và gõ «quy dinh hoa hong», Then hộp có nhóm «Tài liệu» liệt kê trang khớp kèm đoạn trích, phần khớp in đậm; And người vai `okr` không thấy nhóm công ty, người hay thoả thuận và không thấy thông báo lỗi nào; And Enter trên một dòng mở màn đọc của trang đó; And `taiLieu.tim` lỗi thì nhóm «Tài liệu» hiện «Không tìm được lúc này. Thử lại.» thay vì «Không có trang nào khớp.». (cross-layer)
- AC-4: Given màn soạn của một trang, When người viết chọn một đoạn chữ, bấm «Liên kết tới trang», gõ tên một trang đã duyệt và nhấn Enter, rồi gửi duyệt và bản được duyệt, Then đoạn chữ thành liên kết tới `/<workspace>/tai-lieu/<slug>` của trang đã chọn mà không phải gõ hay dán địa chỉ; And không chọn chữ thì liên kết mang tên trang; And sau khi duyệt, trang đích hiện trang vừa viết trong «Trang nhắc tới trang này»; And nút có nhãn cho trình đọc màn hình, Esc đóng hộp và trả focus về trình soạn. (cross-layer)
- AC-5: Given ma trận viết trước các trang nguồn đã duyệt nhắc tới một trang đích bằng liên kết đặt trong đoạn văn, mục danh sách, ô bảng và tiêu đề, một trang nhắc hai lần, một trang tự nhắc chính nó, và một bản đề xuất chưa duyệt có liên kết tới đích, When một thành viên mở màn đọc trang đích, Then khối «Trang nhắc tới trang này (N)» có đúng một dòng cho mỗi trang nguồn đã duyệt khác trang đích, xếp theo tên; And mỗi dòng có câu chứa liên kết lấy nguyên văn từ bản đang dùng của trang nguồn, chữ của liên kết in đậm; And trang tự nhắc và bản chưa duyệt không có dòng; And đích không có trang nguồn nào thì khối ghi «Chưa trang nào nhắc tới trang này.»; And tải khối lỗi thì hiện lỗi có nút «Thử lại», không hiện câu rỗng. (cross-layer)
- AC-6: Given các trang thuộc nhiều đơn vị, loại và chủ trang, When một thành viên chọn đơn vị, loại, chủ trang ở danh sách Kho, riêng lẻ và ghép, Then danh sách chỉ còn trang khớp mọi lọc đã chọn, lọc ở máy chủ, số đếm trên mỗi loại tính trên tập đã lọc đơn vị và chủ; And danh sách đơn vị và chủ để chọn chỉ gồm những cái có ít nhất một trang người đó thấy; And lọc nằm trên URL, tải lại trang giữ nguyên lọc, đổi lọc về trang 1; And lọc ra rỗng thì hiện «Không có trang nào khớp bộ lọc» với nút «Bỏ lọc»; And tải danh sách đơn vị và chủ lỗi thì hiện lỗi có nút «Thử lại», không hiện bộ lọc trống. (cross-layer)
- AC-7: Given một đồ thị liên kết viết trước giữa các trang đã duyệt, trang chưa từng duyệt và slug không có trang, When một thành viên mở tab «Sức khoẻ», Then «Mồ côi» liệt kê đúng các trang đã duyệt không trang đã duyệt nào khác dẫn tới; «Liên kết gãy» liệt kê đúng các trang đã duyệt có liên kết tới slug chưa có bản đang dùng, kèm chữ từng liên kết; «Được nhắc mà chưa có trang» liệt kê đúng các slug đó kèm số trang nhắc; And một trang chưa từng duyệt được nhắc tới hiện là «chưa có» với mọi người, kể cả người tạo nó. (cross-layer)
- AC-8: Given các trang đã duyệt có «xác minh đến ngày» hôm qua, hôm nay, ngày mai và không có ngày (giờ Việt Nam), và các bản chờ duyệt của nhiều chủ trang, When một người mở tab «Sức khoẻ», Then «Quá hạn xác minh» gồm đúng trang có ngày trước hôm nay, kèm ngày; And «Có đề xuất chờ duyệt» gồm đúng trang có bản chờ người đó thấy được, kèm số bản; And mỗi dòng của năm danh sách có tên trang dẫn tới màn đọc và tên chủ trang; And `taiLieu.sucKhoe` lỗi thì tab hiện lỗi có nút «Thử lại», không hiện danh sách rỗng. (cross-layer)
- AC-9: Given ma trận viết trước bốn người (chủ trang có 2 bản chờ cộng 1 bản đã cũ và 1 bản bị trả lại, `admin`, thành viên không duyệt được bản nào, chủ trang chỉ có việc Kho tài liệu mà không việc kế hoạch hay OKR nào), When nhịp nhắc sáng chạy sau 08:30 giờ Việt Nam, Then mỗi người có dòng «N bản đề xuất chờ bạn duyệt» với N bằng đúng số trên tab «Chờ duyệt» của người đó tính bằng cùng một hàm, `admin` đếm mọi bản chờ; And N = 0 thì không có dòng và không có tin chỉ vì Kho tài liệu; And người chỉ có việc Kho tài liệu vẫn nhận tin; And dòng mang đường mở tới tab «Chờ duyệt» khi có `APP_URL`; And trả lời «xong <số của dòng này>» trên Zalo bị từ chối, không đổi gì; And thẻ «Việc của bạn» hiện cùng dòng với cùng số. (cross-layer)
- AC-10: Given ma trận viết trước các ô bảng chứa `|` ở giữa, đầu, cuối ô, `\|` gõ nguyên văn, `|` trong chữ đậm, và `|` trong đoạn văn ngoài bảng, When nạp vào trình soạn, tuần tự hoá ra markdown, nạp lại và tuần tự hoá lần hai, Then lần hai y hệt lần một từng byte cho mọi mẫu; And số ô của mỗi dòng và chữ trong từng ô giữ nguyên; And màn đọc và màn duyệt hiện đúng `|` trong ô, không hiện `\`.
- AC-11: Given 30 bản ở trạng thái chờ duyệt (`CHO_DUYET`), 6 bản đã trả lại (`TRA_LAI`) và 4 bản đã cũ vì bản khác được duyệt (`CU`) mà chủ trang thấy được, When chủ trang mở tab «Chờ duyệt», Then trang đầu có 25 bản chờ, trang 2 có 5 bản chờ còn lại và mở được từng bản; And nhóm «Đã xử lý» có đúng 10 bản trả lại và đã cũ, không bản nào chen vào danh sách chờ; And tổng hiện dưới bảng bằng số bản chờ người đó thấy. (cross-layer)
- AC-12: Given bản chạy thật với dữ liệu mẫu, When người duyệt xem ảnh chụp hộp ⌘K, khối «Trang nhắc tới trang này», danh sách Kho có lọc, tab «Sức khoẻ» và hộp chèn liên kết ở khổ 390 và 1440, Then một nhân viên văn phòng hiểu được mỗi màn để làm gì mà không cần giải thích, nhãn theo từ điển (`CONTEXT.md`), không cuộn ngang ở 390. (judgment)

## Coverage

Quét bằng `morphological-scan` (preset entity-feature, chất vấn trục) ở phiên 2026-09-29.
Chân sản phẩm: lộ trình và nghiên cứu nền trong kho. Chân ngành: MediaWiki (trang đặc biệt
`Special:WantedPages`, `Special:LonelyPages`, `Special:DeadendPages`), Obsidian (khung
backlinks «linked mentions» kèm câu ngữ cảnh), cả hai là tên có thật, nghiên cứu mục 5.1 đã
dẫn.

- Trục A — đường tới trang: ⌘K theo tên hay chữ trong trang (AC-1, AC-3) · liên kết trong bài (AC-4) · trang nhắc tới trang này (AC-5) · danh sách theo thuộc tính (AC-6) · báo cáo việc phải làm (AC-7, AC-8) · nhắc chủ động (AC-9). [thước CE: nghiên cứu mục 5.1 thứ tự điều hướng; NGÀNH: MediaWiki special pages, Obsidian backlinks]
- Trục B — nội dung được thấy: bản đang dùng · trang chưa từng duyệt · bản đề xuất chờ · bản trả lại · bản cũ · trang lưu trữ (lượt 3b). [thước CE: ma trận AC-3 của `_acceptance/kho-tai-lieu/contract.md`]
- Trục C — người xem: người tạo · chủ trang · `owner` · `admin` · thành viên khác · vai `okr` (AC-2, AC-3, AC-9). [thước CE: `packages/validation/src/vai-workspace.ts`]
- Trục D — dạng truy vấn tiếng Việt: có dấu · không dấu · chữ hoa · «đ» · gõ dở · không khớp · quá ngắn hay chỉ ký hiệu (AC-1) · gõ sai và biến thể i/y (để sau). [thước CE: nghiên cứu mục 6.7]
- Cross-cutting: không rò bản chưa duyệt qua mọi đường đọc mới (AC-2); lỗi hiện là lỗi (AC-3, AC-5, AC-6, AC-8); rỗng và phân trang (AC-5, AC-6, AC-11); hai hạn chế đã biết của lượt 1 (AC-10, AC-11).
- [GIẢ ĐỊNH] Bộ tách `simple` sau `unaccent` đủ cho truy vấn tiếng Việt ở vài trăm trang: token là âm tiết, nên «quy dinh» khớp cả trang có «quy» và «định» ở hai chỗ khác nhau. Không đo độ chính xác xếp hạng trên dữ liệu thật trong lượt này; 50 câu hỏi thật của lượt 4 sẽ đo.
- [GIẢ ĐỊNH] Quản trị nhận dòng nhắc đếm mọi bản chờ của kho mỗi sáng mà không thấy phiền — chủ kho chọn 2026-09-29, xem lại sau tuần đầu chạy thật.

## Đường đo

- Thước: tỉ lệ trang đã duyệt không mồ côi · số từ: hàm Sức khoẻ trên `taiLieuLienKet` và `TaiLieuTrang.banDangDungId` · bảo đảm bởi: AC-7
- Thước: trung vị thời gian từ đề xuất tới duyệt · số từ: `TaiLieuDeXuat.createdAt` và `xuLyLuc` (lượt 1) · bảo đảm bởi: AC-9 (dòng nhắc là đòn bẩy), AC-11
- Thước: số lần tìm, «trang nhắc tới» hay Sức khoẻ lộ chữ hay tên của bản chưa duyệt · số từ: báo lại của phòng ban trong chạy thật (nhóm góp ý chung), đối chiếu bảng `TaiLieuDeXuat` · bảo đảm bởi: AC-2
- Thước: số trang quá hạn xác minh cuối chạy thật · số từ: `TaiLieuTrang.xacMinhDen` · bảo đảm bởi: AC-8

## Out of scope

- Lịch sử phiên bản, khôi phục, lưu trữ trang và «trang lưu trữ không ra kết quả» — lượt 3b `lich-su-va-luu-tru-trang` (T3, cần cột trên `TaiLieuTrang`), nếu chủ kho chọn tách ở Cổng Phạm vi.
- Gõ sai và biến thể i/y bằng `pg_trgm` — cần chỉ mục mới (T3); mở khi chạy thật cho thấy cần.
- Danh sách «cụt» (trang không dẫn đi đâu) của bản mẫu, đồ thị cục bộ và toàn kho, xem trước khi rê chuột.
- Đo lượt tìm, lượt mở ⌘K, lượt bấm «trang nhắc tới» — lộ trình chốt bốn số đếm từ bảng, không telemetry.
- Lọc Sức khoẻ theo chủ, sắp xếp `COLLATE "vi-x-icu"`, tìm trong tệp nguồn.
- Vector, `pg_search` (Neon gỡ 2026-09-21), lọc phía trình duyệt.
- Phạm vi xem theo trang — lượt `chu-trang-va-pham-vi`.

## Notes

- Không migration: `timKiem` (`to_tsvector('simple', unaccent(tên ‖ nội dung))`, ghi lúc duyệt) và `taiLieuLienKet` đã có từ `20261001010000_kho_tai_lieu`. Chạm `packages/db/prisma` giữa chừng thì lượt nâng T3 và thêm Cổng 1.5.
- Luật «ai duyệt được bản nào» chuyển từ `apps/api/src/tai-lieu/quyen.ts` sang `packages/db/src/tai-lieu-quyen.ts` để tab «Chờ duyệt» và nhịp nhắc của `apps/agent` đếm bằng một hàm.
- Thủ tục mới `taiLieu.tim`, `taiLieu.nhacToi`, `taiLieu.sucKhoe`, `taiLieu.boLoc` nằm dưới `taiLieu` ở phạm vi chung: danh sách thủ tục ghim của `apps/api/test/vai-chi-okr.spec.ts` sửa có ý thức.
- `QuickSwitcher` đang giữ ⌘K cho cả ứng dụng; lượt này không thêm bộ nghe phím thứ hai.
- Ngưỡng Cổng Đáng của lượt ở `opportunity.md`; ngưỡng của cả sản phẩm ở lộ trình mục 5.
- Từ điển: lint W6 báo «chờ duyệt», «trạng thái», «sức khoẻ», «kết quả», «thông báo», «nhóm», «tài liệu», «khối» là chữ tránh của mục khác (Được phép vào, Bậc, Tình trạng KR, Số chốt, Nhắc buổi sáng, Bộ phận, Trang tài liệu). Ở hợp đồng này chúng mang nghĩa của Kho tài liệu (tab «Chờ duyệt», tab «Sức khoẻ», nhóm trong hộp ⌘K, kết quả tìm) — trùng chữ khác nghĩa, giữ nguyên như lượt 1.
