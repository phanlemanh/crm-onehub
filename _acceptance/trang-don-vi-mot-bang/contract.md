---
schema_version: 1
feature: Trang đơn vị một bảng — chọn đơn vị bằng ô tìm kiếm thay cột cây, đọc mục tiêu trong một bảng như Thoả thuận, mở từng mục tiêu ra KR, một hàng công cụ đứng yên khi đổi cách xem, lọc nhanh «Cần bàn» và «Chưa góp vào đâu», sắp xếp theo tiến độ và tình trạng, thông tin đơn vị ở chân bảng và đơn vị trực thuộc ở cuối trang; chỉ giao diện
slug: trang-don-vi-mot-bang
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
approved_by: manh
approved_at: 2026-10-15T05:05:18Z
design_doc: docs/superpowers/specs/2026-10-15-trang-don-vi-mot-bang-design.md
---

# Acceptance Contract: trang-don-vi-mot-bang

## Context

Trang «Theo đơn vị» hôm nay chồng sáu lớp điều khiển: cột cây đơn vị 288px không màn nào khác có, thẻ đơn vị có hàng
nút, cách xem và bộ lọc ở hai chỗ khác nhau giữa các cách xem, bảng mục tiêu tự dựng bằng `SimpleTable`. Trên điện
thoại cây hiện nguyên 20 dòng lúc tải rồi mới thu thành ô chọn. Lượt này là hàng DH2 của đợt `okr-dieu-huong-1410`,
dựng trên DH1 (đầu trang khu, nút tạo/nhập/soạn đã rời thân trang), phủ B1, B2, B3, B4, B6, B7, B8. Chỉ đổi giao
diện: thủ tục API, quyền, dữ liệu, ngăn tạo, hộp nhập, ngăn chi tiết, `packages/ui` giữ nguyên.

Source input: hàng DH2 `docs/plan/lo-trinh-okr.json`; `docs/plan/pham-vi-okr-dieu-huong-1410.md`; ô cơ hội
`_acceptance/trang-don-vi-mot-bang/opportunity.md` (Cổng Đáng ký 15/10); bản mẫu `/proto/dieu-huong-okr` (nhánh
`feat/dieu-huong-okr` @706ba494a, `trang-don-vi.tsx`).

## Criteria

- AC-1: Given trang Theo đơn vị ở 1440 px và 390 px, When trang dựng, Then không còn cây đơn vị (`[data-nut-cay]`) hay cột 18rem nào; ô chọn đơn vị có tìm kiếm đứng ở chỗ ô tìm kiếm của bảng; mở nó ra liệt kê công ty, mọi bộ phận và mọi phòng ban của cây tổ chức (kể cả phòng ban chưa xếp), mỗi lựa chọn có gợi ý «Thuộc A › B» (công ty: «cả công ty») và số mục tiêu đã công bố của chu kỳ mà người xem thấy được (đúng số `okr.countByUnit` trả, như cây hôm nay); gõ một phần tên không dấu (vd «phong» khớp «Phòng …», «dich» khớp «Dịch …»), hoặc tên đơn vị cha, lọc ra đúng các đơn vị khớp; chọn một đơn vị thì `donOkr` trên đường dẫn đổi sang nó và bảng hiện mục tiêu của nó (máy chủ được hỏi `okr.danhSach` với đúng đơn vị đó); đường dẫn mang một người (`donOkr=nguoi:<id>`) thì ô chọn hiện tên người đó. (cross-layer)
- AC-2: Given Danh sách của một đơn vị có mục tiêu ở 1440 px, When đo trong trình duyệt thật cạnh Thoả thuận cùng khổ, Then ô chọn đơn vị, cách xem, ô lọc nhanh, «Lọc» và «Sắp xếp» nằm trên đúng một hàng (cùng một hàng công cụ của bảng); không còn thẻ đơn vị có tiêu đề hay hàng nút trong thân; khoảng từ đáy thanh thẻ tới đỉnh hàng tiêu đề bảng chênh của Thoả thuận (từ đáy thanh thẻ — hoặc đầu trang khi không có thẻ — tới đỉnh hàng tiêu đề bảng) không quá 2 px; ở 390 px không có nội dung tràn ngang.
- AC-3: Given bảng mục tiêu của một đơn vị, When đọc và bấm, Then mỗi mục tiêu là một dòng có tên, loại, trạng thái, số KR và «góp vào …» (hoặc không có dòng góp), cột Tiến độ, Tình trạng, Phụ trách; mục tiêu có KR có nút mở/thu thật (phần tử `button`, có `aria-expanded` và nhãn nói tên mục tiêu, nhận Tab rồi Enter/Space — như nút mũi tên hôm nay), bấm nút, nhấn Enter/Space trên nó, hoặc bấm phần trống của dòng thì KR hiện ngay dưới thành dòng con cùng cột (tiến độ, tình trạng, phụ trách của KR); trạng thái mở ghi `expand` trên đường dẫn và tải lại trang vẫn mở đúng các dòng đó; mặc định mọi dòng thu; mục tiêu không KR không có nút mở; bấm tên mục tiêu mở ngăn chi tiết mục tiêu và không đổi trạng thái mở; bấm dòng KR mở ngăn chi tiết KR như hôm nay.
- AC-4: Given trang đơn vị ở Danh sách với đơn vị X, When đổi lần lượt sang Cây căn chỉnh, Họp tuần và (chu kỳ ở pha chấm điểm hoặc đã đóng) Chấm điểm, Then ở cả 1440 px và 390 px ô chọn đơn vị và cách xem đứng cùng chỗ (lệch đỉnh và trái không quá 1 px so với Danh sách), vẫn là X; không cách xem nào có nút tạo, nhập hay soạn trong thân; cách xem không bị giấu sau «Lọc» ở 390 px.
- AC-5: Given Danh sách của một đơn vị, When chọn ô lọc nhanh, Then lựa chọn là «Tất cả», «Cần bàn · n», «Chưa góp vào đâu · m» (en «All», «Needs discussion», «Not aligned»); «Cần bàn» giữ đúng các mục tiêu có ít nhất một KR chậm nhịp hoặc trượt theo `tinhTrang` hiện có; «Chưa góp vào đâu» giữ đúng các mục tiêu không ở cấp công ty và không góp vào mục tiêu hay KR nào; số đếm bằng số dòng còn lại khi chọn; lựa chọn ghi trên đường dẫn và tải lại vẫn giữ; không dòng nào khớp thì bảng trống «Không có mục tiêu nào khớp» kèm nút bỏ lọc; năm bộ lọc hôm nay (Phụ trách, Loại, Trạng thái, Mức tự tin, Góp ý) vẫn lọc qua máy chủ và nằm trong «Lọc».
- AC-6: Given bảng mục tiêu, When sắp xếp theo Tiến độ hoặc Tình trạng, tăng hoặc giảm, Then thứ tự dòng mục tiêu đúng theo tiến độ (số) hoặc theo bậc tình trạng trượt → chậm nhịp → đúng nhịp → chưa có kỳ vọng (mục tiêu cùng bậc giữ thứ tự máy chủ); KR luôn nằm dưới mục tiêu của nó; cách sắp xếp ghi trên đường dẫn; không chọn gì thì giữ thứ tự máy chủ trả.
- AC-7: Given một đơn vị, When đọc chân bảng và cuối trang, Then chân bảng có trưởng đơn vị (hoặc «Chưa có trưởng» dạng cờ cảnh báo), «N mục tiêu · M KR» đếm trên các dòng máy chủ trả cho bảng (như thẻ đơn vị hôm nay) và «Thuộc A › B» (đơn vị người: phòng ban chính và quản lý như hôm nay); dưới bảng có khối «Đơn vị trực thuộc» liệt kê đúng con trực tiếp theo cây tổ chức (công ty → bộ phận và phòng ban chưa xếp; bộ phận → phòng ban; phòng ban, người → không có khối), mỗi ô là liên kết tới trang của đơn vị đó giữ `kyOkr`, ghi số mục tiêu đã công bố của đơn vị đó theo `okr.countByUnit` (không có số KR — thủ tục không trả) hoặc «Chưa đặt OKR» khi số là 0, và cờ «Chưa có trưởng» khi thiếu trưởng. (cross-layer)
- AC-8: Given trang Theo đơn vị mở trên khổ 390 px với mạng chậm, When trang đi từ lúc vẽ đầu tới khi có dữ liệu, Then không lúc nào trang có hơn một ô chọn đơn vị hay bất kỳ danh sách cây đơn vị nào; đỉnh ô chọn đơn vị (hoặc khung xương của nó) không đổi quá 1 px giữa lúc đang tải và lúc đã dựng; lúc đang tải trang vẽ khung xương (hàng công cụ và dòng bảng) chứ không vòng quay toàn trang.
- AC-9: Given các trạng thái phụ của trang, When dựng, Then: đơn vị chưa đặt OKR hiện trống với câu hôm nay theo có/chưa có trưởng; lỗi tải danh sách hiện khối lỗi có «Thử lại» trong thân và hàng công cụ vẫn dùng được; đường dẫn trỏ đơn vị không còn hiện «không thấy đơn vị» kèm lối về công ty; chu kỳ trống hiện «chưa có chu kỳ»; mục tiêu đã bỏ vẫn hiện ở nhóm «Đã bỏ» dưới bảng ở Danh sách; đơn vị người vẫn có khối KR của người ở Danh sách.
- AC-10: Given các bài kiểm của app từng khẳng định hành vi cũ của trang đơn vị (cây đơn vị `[data-nut-cay]`, thẻ đơn vị `data-don-vi`, hàng nút `data-hang-nut`, bảng `BangMucTieu` mở sẵn với `thuMucTieu`), When chạy sau lượt, Then mọi bài xanh và mỗi chỗ sửa trong bài chỉ đổi điều khẳng định sang lời hứa mới của AC-1 đến AC-9 — không xoá ca kiểm hay dòng `expect` nào ngoài dòng mang dấu cũ, không thêm `.skip`, `.todo`, `.only`; các eval máy của hồ sơ đã ký chạy những tệp kiểm đó thoát đúng mã kỳ vọng như lúc ký.
- AC-11: Given `/proto/trang-don-vi-mot-bang` khi bật `PROTO_ROUTE=1`, When mở từng state, Then có đúng một state cho mỗi dòng của bảng trạng thái trong thiết kế, mỗi state cho một cây DOM khác nhau; phép đo sổ bản mẫu xanh.
- AC-12: Given ảnh trang đơn vị ở Danh sách (thu và mở KR), Họp tuần, ô chọn đơn vị đang mở và Thoả thuận ở 1440 px và 390 px do E2 chụp, When một người không làm lượt này đặt cạnh nhau, Then họ đọc được trang đơn vị dùng cùng một khuôn bảng với Thoả thuận — ô chọn ở chỗ ô tìm kiếm, một hàng công cụ, bảng, chân bảng — và tìm được KR của một mục tiêu mà không cần đọc chữ hướng dẫn. (judgment)
- AC-13: Given đang xem Theo đơn vị của đơn vị X ở cách xem V (Cây căn chỉnh, Họp tuần hoặc Chấm điểm) và chu kỳ K, When đi qua một thẻ khác của khu bằng thanh thẻ rồi quay lại Theo đơn vị, Then trang mở lại đúng X, K và cách xem V; liên kết của thanh thẻ mang `xemOkr` cùng `kyOkr`, `donOkr` khi đường dẫn đang có nó (bổ sung khoá thứ ba vào lời hứa «đổi thẻ giữ đơn vị và chu kỳ» của DH1, không mang khoá nào khác); cách xem không hợp với chu kỳ (Chấm điểm ngoài pha chấm) rơi về Danh sách như hôm nay; hợp đồng `dieu-huong-khu-muc-tieu` có một dòng Notes trỏ AC này ở hồ sơ này, vì lời hứa AC-6 của nó («không mang khoá nào khác») được nới thêm `xemOkr`.
- AC-14: Given các hồ sơ đã ký có kịch bản đo trình duyệt dựa trên trang đơn vị trước DH1 và DH2 — `dat-okr-trong-crm`, `khung-okr-truoc-r1`, `muc-tieu-va-kr`, `okr-to-chuc-va`, `toan-canh-okr`, `okr-soat-anh-luot-3`, `soan-okr-trong-khung`, `no-sau-luot-5-okr` (bấm `[data-nut-cay]`, chờ `[data-hang-nut]` hay `[data-nhom-soan]` trong thân, chờ thanh lọc `[data-loc-okr]`, đọc `thuMucTieu`, đi phím trên cây «Đơn vị») cùng `dieu-huong-khu-muc-tieu` (bài `dhk-giu-don`, AC-13) — When lượt sửa phép đo của chúng (cả phần selector DH1 để lại, Điều phối M5 chia 15/10) rồi chạy MỘT lượt làn ghim lại tại một commit đã có trang mới, Then cả chín ghim xanh; mỗi chỗ sửa trong `rang/` của chúng chỉ đổi cách tới trạng thái (chọn đơn vị bằng `donOkr` hoặc ô chọn, thu/mở bằng `expand`) và không bỏ điều khẳng định nào khác; lời hứa đã ký nào trái trang mới (trang đơn vị mở sẵn mọi mục tiêu và nhớ dòng thu bằng `thuMucTieu` — AC-3 của `muc-tieu-va-kr`) có một dòng Notes trong hợp đồng của hồ sơ đó trỏ AC thay nó ở hồ sơ này.

## Coverage

Quét bằng `morphological-scan` trong phiên (15/10), bảng đủ ở `coverage-scan.md`.

- **Trục A — phần của trang:** ô chọn đơn vị · hàng công cụ · dòng mục tiêu · dòng KR · ngăn chi tiết · chân bảng · đơn vị trực thuộc · nhóm đã bỏ  [thước CE: bản mẫu `trang-don-vi.tsx` @706ba494a; B1–B4, B6–B8 của bản phạm vi — SUY-TỪ-REPO]
- **Trục B — loại đơn vị:** công ty · bộ phận · phòng ban · phòng ban chưa xếp · một người · đơn vị không còn thấy  [thước CE: `giaiDon` trong `theo-don-vi.tsx` — SUY-TỪ-REPO]
- **Trục C — cách xem:** Danh sách · Cây căn chỉnh · Họp tuần · Chấm điểm  [thước CE: `CACH_XEM_OKR`, `PHA_CO_CHAM` — SUY-TỪ-REPO]
- **Trục D — dữ liệu:** có mục tiêu · rỗng · lọc không khớp · đang tải · lỗi · mục tiêu không KR · chưa có trưởng · có mục tiêu đã bỏ  [thước CE: `trang-thai-okr.tsx` — SUY-TỪ-REPO]
- **Lớp cắt ngang:** 1440 · 390 · vi · en  [thước CE: số đo production 14/10]
- Định nghĩa «Cần bàn», chỗ bấm mở ngăn chi tiết, và cách xử năm hồ sơ đã ký đo trên trang cũ là câu hỏi cho người ở Cổng Phạm vi (sổ quyết định, dòng `chi-nguoi`).
- **Trục E — hồ sơ đã ký đo trên trang này:** tám hồ sơ có kịch bản trình duyệt hoặc bài kiểm dựa trên trang cũ (AC-14) · các tệp kiểm DOM (AC-10)  [thước CE: `git grep` dấu cũ `data-nut-cay`, `data-hang-nut`, `thuMucTieu` trong `_acceptance/*/rang/` và `apps/app/test/` — SUY-TỪ-REPO]

## Đường đo

- Ngưỡng Cổng Đáng (5/5 người chưa xem bản mới, được đọc tên một phòng ban, tới bảng mục tiêu và mở KR của một mục
  tiêu dưới 10 giây, không hỏi, ở 1440 và 390): số đến từ phiên nghiệm thu (`/acceptance-gate:uat-session`) trong 7
  ngày sau khi gộp — người điều phối phiên bấm giờ từ lúc trang Theo đơn vị mở tới lúc KR hiện, và đếm số lần bấm làm
  số đọc; không có code đo mới. AC-1 (ô chọn có tìm kiếm), AC-3 (mở KR) và AC-8 (điện thoại không nhảy) bảo đảm việc
  được đo có mặt trên bản giao.

## Out of scope

- Bỏ «Cây căn chỉnh» khỏi trang đơn vị và hai chip «Đặt cược», «Chưa có lý do» của nó (B5) — hàng DH4 gỡ cả cách xem.
- Đầu trang khu, nút tạo/nhập/soạn, đổi thẻ giữ đơn vị và chu kỳ (A1–A6) — hàng DH1 (lượt này chỉ thêm `xemOkr` vào liên kết thẻ, AC-13); Của tôi ba phần, bỏ thẻ «Cập nhật tuần» (A3, C1–C3) — hàng DH3.
- Nút «Mở tất cả» của bảng có dòng mở rộng (E3), chốt chỗ đặt cách xem cho mọi danh sách (E5), vùng bấm 44px toàn app (E1).
- Đổi thủ tục API (`okr.danhSach`, `okr.countByUnit`), luật quyền, ngăn chi tiết, hay bất kỳ thứ gì trong `packages/ui` NGOÀI ô mũi tên của dòng mở rộng trong `DataTable` (nháp theo khuyến nghị Hỏi-4: ô đó thành nút có `aria-expanded`).

## Notes

- NM2 `loc-va-kieu-xem-chung` (Mac Studio, đã ký Cổng Phạm vi, gộp dự kiến 16/10) chỉ THÊM prop vào `ToggleGroupItem`
  (`count`) và `ViewSwitch` (khoá được), và có thước «không `ToggleGroupItem` nào trong apps/app tự vẽ số đếm». Ô lọc
  nhanh của lượt này là `tabs` của `DataTable` — số do `DataTable` vẽ từ `facetCounts`, không có `ToggleGroupItem`
  nào tự vẽ số — nên không chạm thước đó; `ViewSwitch` dùng như hiện có. NM2 gộp trước thì lượt gộp `onehub` vào
  nhánh rồi chạy lại E7, E8.
- `khung-okr-truoc-r1/rang/bon-vai.mjs` bị cả DH1 lẫn DH2 chạm: DH1 KHÔNG sửa, DH2 giữ toàn bộ phần sửa (Điều phối M5, 15/10).
- Lượt ghim lại của AC-14 gồm tám hồ sơ: năm hồ sơ DH2 tự phát hiện, hai hồ sơ DH1 khai giới hạn ở Gate 2 của nó
  (`okr-soat-anh-luot-3`, `soan-okr-trong-khung` — selector `[data-hang-nut]`/`[data-nhom-soan]` sau khi DH1 dời nút lên
  đầu trang) và `dieu-huong-khu-muc-tieu` (bài `dhk-giu-don` đổi theo AC-13). Ước 70–120 phút máy. Ràng buộc của Điều
  phối M5: PR DH2 gộp trong vòng 1 ngày sau DH1; trễ hơn thì M5 mở vá riêng cho phần selector của DH1 và AC-14 thu
  về phần của DH2.
- Hỏi-4 và NM2: NM2 sửa `data-table.tsx` (+49/−46) chỉ trong khoảng dòng 40–620 (import, `DataTableFacet`, toggle, khối
  bộ lọc, nút Bộ lọc), không đụng dòng mở rộng hay ô mũi tên (Mac Studio, #375 03:56Z) — không chồng logic, chỉ có thể
  lệch số dòng khi gộp; bên gộp sau giữ cả hai.
