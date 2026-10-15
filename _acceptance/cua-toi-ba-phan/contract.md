---
schema_version: 1
feature: Của tôi ba phần — KR cần cập nhật tuần này (gửi ngay tại chỗ), đơn vị bạn dẫn, KR bạn phụ trách; bỏ thẻ «Cập nhật tuần», đường cũ chuyển về Của tôi; người không dẫn đơn vị nào không được mời tạo mục tiêu
slug: cua-toi-ba-phan
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: implemented
approved_by: manh
approved_at: 2026-10-15T07:32:55Z
design_doc: docs/superpowers/specs/2026-10-15-cua-toi-ba-phan-design.md
---

# Acceptance Contract: cua-toi-ba-phan

## Context

«Của tôi» hôm nay chỉ liệt kê mục tiêu người xem phụ trách, tham gia hoặc có KR; trưởng đơn vị không tự phụ trách
mục tiêu nào gặp trang rỗng dù đang dẫn cả đơn vị. Cập nhật tuần sống ở thẻ riêng `/okr/cap-nhat-tuan`, và khối
việc, nhắc Zalo, chuông đều dẫn sang đó. Lượt này là hàng DH3 của đợt `okr-dieu-huong-1410`, phủ C1, C2, C3 và A3,
dựng trên DH1 (khung đầu trang khu Mục tiêu). Đổi giao diện khu Mục tiêu, một giá trị lối vào mới của phiên cập nhật
tuần, đường dẫn trong tin nhắc và một lệnh đo chỉ đọc; quyền, thủ tục gửi cập nhật, khuôn dữ liệu giữ nguyên.

Source input: hàng DH3 `docs/plan/lo-trinh-okr.json`; `docs/plan/pham-vi-okr-dieu-huong-1410.md` (C1, C2, C3, A3);
ô cơ hội `_acceptance/cua-toi-ba-phan/opportunity.md` (Cổng Đáng ký 15/10); bản mẫu `/proto/dieu-huong-okr`
(`cua-toi.tsx` @706ba494a); lời dặn của Điều phối M5 15/10 (chuyển hướng đường cũ, A3 một commit riêng).

## Criteria

- AC-1: Given người xem phụ trách KR ở chu kỳ đang chạy, When mở Của tôi, Then phần đầu tiên của thân trang là «Cần cập nhật tuần này» liệt kê đúng các KR mà `okr.capNhatTuan` trả `updatedThisWeek = false` (mỗi dòng: tên KR, đơn vị · mục tiêu, số hiện tại), câu dưới tiêu đề nêu số KR còn thiếu và tuần; còn KR thiếu thì có nút «Cập nhật N KR» với N đúng bằng số dòng; đủ hết thì phần ghi «Bạn đã cập nhật đủ cho tuần <ngày>.» kèm «Sửa lần gửi tuần này»; không phụ trách KR nào ở chu kỳ đang chạy thì phần ghi «Bạn không phụ trách KR nào ở chu kỳ đang chạy.» và không có nút; phần này luôn theo chu kỳ đang chạy, không đổi theo ô chu kỳ của đầu trang (chọn một chu kỳ cũ vẫn thấy KR thiếu số của tuần này). Khối việc OKR đứng ngay dưới phần này và không còn việc «Cập nhật tuần».
- AC-2: Given phần 1 có KR thiếu số, When bấm «Cập nhật N KR», điền số và tự tin rồi gửi, Then bảng cập nhật mở ngay trong phần 1 (đường dẫn vẫn là `/okr`, không chuyển trang), có đủ ô số, tự tin, ghi chú và thanh gửi như bảng cũ; gửi xong phần 1 hiện «đã gửi» và danh sách làm mới; máy chủ có đúng một dòng `okrCheckInSession` mới mang `entry = "cua-toi"`, `submittedAt` khác rỗng và một `okrCheckIn` cho mỗi KR đã gửi; tải trang Của tôi mà không bấm thì không sinh dòng phiên nào. (cross-layer)
- AC-3: Given đường dẫn `/okr?tu=nhac` hoặc `/okr?tu=viec-cua-toi`, When trang mở, Then bảng cập nhật trong phần 1 đã mở sẵn, ô số đầu tiên nhận focus, phiên máy chủ ghi đúng `entry` của tham số; sau khi mở, `tu` rời đường dẫn nên tải lại trang không sinh thêm phiên; giá trị `tu` lạ thì trang mở như `/okr` thường, không phiên nào. (cross-layer)
- AC-4: Given đường dẫn cũ `/okr/cap-nhat-tuan` có hoặc không tham số (`tu`, `kyOkr`, `donOkr`, tham số lạ), When mở, Then máy chủ trả chuyển hướng tới `/okr` giữ nguyên mọi tham số và thứ tự giá trị, không dựng trang cũ; tin nhắc cập nhật tuần mới sinh (`nhac-ke-hoach.ts`) mang `/okr?tu=nhac`; trong mã app và agent không còn liên kết nào trỏ `/okr/cap-nhat-tuan` ngoài trang chuyển hướng; trang chuyển hướng sống lâu dài, không có hạn gỡ — tin Zalo đã gửi không sửa được.
- AC-5: Given người xem dẫn một hay nhiều đơn vị (`okr.access.headOf`), When mở Của tôi ở chu kỳ K, Then phần «Đơn vị bạn dẫn» có đúng một thẻ cho mỗi đơn vị dẫn, bộ phận trước phòng ban, theo thứ tự cây tổ chức; mỗi thẻ ghi tên đơn vị, số mục tiêu, số KR, tiến độ trung bình và ba đếm KR đúng nhịp / chậm nhịp / trượt, khớp với trang Theo đơn vị của cùng đơn vị, cùng chu kỳ (cùng truy vấn máy chủ); nút «Mở trang đơn vị» dẫn tới Theo đơn vị đúng đơn vị và chu kỳ K; đơn vị chưa có mục tiêu ở K thì thẻ ghi «Chưa có mục tiêu nào ở <tên chu kỳ>.» và vẫn có nút. (cross-layer)
- AC-6: Given người xem ở chu kỳ K, When mở Của tôi, Then phần «KR bạn phụ trách» liệt kê mọi KR có người phụ trách là người xem trong `okr.mine` của K ở mọi đơn vị (tên KR + đơn vị · mục tiêu, tiến độ, tình trạng, tự tin; bấm tên mở ngăn chi tiết mục tiêu); mục tiêu của `okr.mine` mà người xem không phụ trách KR nào nằm trong nhóm thu gọn «Mục tiêu bạn tham gia»; hai nhóm «Đang theo dõi» và «Đã bỏ» giữ nguyên; mọi mục tiêu của `okr.mine.objectives` hiện ở phần 3 hoặc nhóm tham gia — không mục tiêu nào rời Của tôi.
- AC-7: Given thành viên không dẫn đơn vị nào (kể cả khi chương trình bật OKR cá nhân), When mở Của tôi, Then không có phần «Đơn vị bạn dẫn»; nút «Thêm mục tiêu» trên đầu trang khoá kèm dòng «Bạn chưa dẫn đơn vị nào nên chưa thêm được mục tiêu…» (khuôn DH1); thân Của tôi không có nút, liên kết hay chữ nào mời tạo mục tiêu hoặc OKR cá nhân; trạng thái rỗng chỉ mời «Sang Theo đơn vị».
- AC-8: Given khu Mục tiêu ở tiếng Việt và tiếng Anh, When dựng thanh thẻ, Then có đúng bốn thẻ theo thứ tự Của tôi · Theo đơn vị · Toàn cảnh · Hỏi ý (en Mine · By unit · Overview · Call for ideas); không chuỗi «Cập nhật tuần» / «Weekly update» nào còn là tên thẻ, tiêu đề hay tiêu đề trình duyệt; mô tả thẻ Của tôi là «Việc cần cập nhật tuần này, đơn vị bạn dẫn và KR bạn phụ trách.»; đổi thẻ vẫn giữ `kyOkr` và `donOkr` cho bốn thẻ như DH1 hứa.
- AC-9: Given Của tôi khi dữ liệu đang tải hoặc một truy vấn lỗi, When trang dựng, Then lúc tải mỗi phần là khung xương ở đúng chỗ của nó; truy vấn của phần nào lỗi thì chỉ phần đó hiện «Chưa tải được phần này» kèm «Thử lại», hai phần kia vẫn hiện dữ liệu; gửi cập nhật lỗi giữ nguyên số đã nhập và nút thành «Gửi lại».
- AC-10: Given cơ sở dữ liệu thử có phiên cập nhật tuần gieo sẵn với đáp án biết trước (trưởng đơn vị và thành viên; lối `cua-toi`, `nhac`, `viec-cua-toi`, `sheet`; đã gửi và chưa gửi; trong và ngoài cửa sổ), When chạy lệnh đo `apps/api/scripts/okr/do-cap-nhat-cua-toi.ts --tu <ngày> --den <ngày>`, Then lệnh chỉ đọc và in đúng «k/n phiên đã gửi của trưởng đơn vị mở ở Của tôi (p %)» với mọi lối trừ `sheet` là «ở Của tôi», chỉ đếm phiên đã gửi của người đang dẫn ≥1 đơn vị, in «không đủ mẫu» khi n < 10, và in số đơn vị có dấu sửa trong cửa sổ (giới hạn vai dẫn ở «Đường đo»). (cross-layer)
- AC-11: Given các bài kiểm từng khẳng định hành vi cũ (năm thẻ; đường `/okr/cap-nhat-tuan?tu=nhac` trong tin nhắc; nút việc dẫn sang trang cập nhật; Của tôi là bảng mục tiêu; tham số `tu` mặc định `tab`), When chạy sau lượt, Then mọi bài xanh và mỗi chỗ sửa trong bài chỉ đổi điều khẳng định sang lời hứa mới của AC-1 đến AC-8; các eval máy của hồ sơ đã ký chạy những tệp kiểm đó thoát đúng mã kỳ vọng như lúc ký — kể cả bộ kiểm đầu trang khu của DH1 (ma trận thẻ, vòng đổi thẻ đi-về) và phép đo bản mẫu của DH1, vốn so danh sách thẻ của bản mẫu `/proto/dieu-huong-khu-muc-tieu` với danh sách thẻ thật: bản mẫu DH1 bỏ thẻ «Cập nhật tuần» cùng lượt.
- AC-12: Given `/proto/cua-toi-ba-phan` khi bật `PROTO_ROUTE=1`, When mở từng state, Then có một state cho mỗi dòng của bảng trạng thái trong thiết kế (trừ ST-ctbp-dang-tai, ST-ctbp-loi-phan, ST-ctbp-loi-mo — đo trên app thật ở AC-9, AC-14), khu dùng bốn thẻ, phép đo sổ bản mẫu xanh.
- AC-13: Given ảnh Của tôi ở 1440 px và 390 px của trưởng đơn vị có KR thiếu số, của trưởng đơn vị đang mở bảng cập nhật và của thành viên không dẫn đơn vị nào, do E-ui chụp, When một người không làm lượt này xem, Then họ đọc được ngay ở màn đầu (1440 px, không cuộn) việc cần cập nhật tuần này và nút để làm nó, rồi đơn vị mình dẫn, rồi KR mình phụ trách, theo đúng thứ tự đó; ở thành viên không dẫn ai họ không thấy lời mời tạo mục tiêu nào. (judgment)
- AC-14: Given phần 1 của Của tôi, When mở bảng cập nhật thất bại — bấm «Cập nhật N KR», bấm «Sửa lần gửi tuần này», hoặc vào bằng `/okr?tu=nhac` / `/okr?tu=viec-cua-toi` — hoặc khi lần tải lại nền của `okr.capNhatTuan` lỗi lúc phần 1 đã có dữ liệu, Then: mở lỗi thì phần 1 hiện «Không mở được lượt cập nhật.» kèm nút «Thử lại», bảng chưa mở, và «Thử lại» thử mở bảng lần nữa với đúng lối vào ban đầu (`cua-toi`, `nhac` hoặc `viec-cua-toi`); vào bằng `tu` thì `tu` chỉ rời đường dẫn khi bảng đã mở được, nên mở lỗi rồi tải lại trang vẫn thử mở bảng từ lối đó; tải lại nền lỗi không gỡ bảng đang điền (số đã nhập còn nguyên) hay dòng «đã gửi» vừa hiện, phần 1 giữ dữ liệu đã có — «Chưa tải được phần này» chỉ hiện khi lần tải đầu lỗi (AC-9).

## Coverage

Quét bằng `morphological-scan` trong phiên (15/10), bảng đủ ở `coverage-scan.md`.

- **Trục A — phần của trang:** cần cập nhật · khối việc · đơn vị bạn dẫn · KR bạn phụ trách · nhóm tham gia / theo dõi / đã bỏ · thanh thẻ · đường cũ  [thước CE: bản mẫu `cua-toi.tsx` @706ba494a + `okr/cua-toi.tsx` hôm nay — SUY-TỪ-REPO]
- **Trục B — người xem:** trưởng bộ phận · trưởng phòng ban · dẫn hai đơn vị · thành viên không dẫn ai · quản trị không dẫn đơn vị · vai «chỉ OKR»  [thước CE: `okr-access.service.ts` `headOf`]
- **Trục C — trạng thái KR tuần này:** còn thiếu · thiếu một phần · đủ · không phụ trách KR nào · chu kỳ đang chọn không phải chu kỳ đang chạy  [thước CE: `okr-cap-nhat.service.ts` `capNhatTuan`]
- **Trục D — lối vào phiên:** nút trong Của tôi · `?tu=nhac` · `?tu=viec-cua-toi` · đường cũ · ngăn KR (`sheet`) · tải trang không bấm  [thước CE: `LOI_VAO` + AC-2, AC-3, AC-4]
- **Trục E — trạng thái dữ liệu:** đang tải · lỗi một phần · gửi lỗi · mở bảng lỗi · tải lại nền lỗi khi đang điền · đơn vị chưa có mục tiêu  [thước CE: `docs/design.md` «Chờ tải và lỗi tải»; hai ô giữa thêm ở Cổng Bằng chứng 15/10 — Ngoài-3, 6, 7]
- **Trục F — khổ và ngôn ngữ:** 1440 · 390 · vi · en  [thước CE: số đo production 14/10 ở 1440 và 390]
- Phần 1 theo chu kỳ đang chạy, không theo ô chu kỳ — như trang cũ (AC-1, sổ quyết định); phần 2, 3 theo ô chu kỳ.
- Tiêu chí AC-14 thêm ở Cổng Bằng chứng vòng 1 theo lối «nâng phạm vi sửa ngay» chủ kho chọn (sổ quyết định, dòng `revisit` gate2); trang cũ `/okr/cap-nhat-tuan` từng có đường lỗi mở phiên kèm «Thử lại» mà phần 1 làm rơi.
- Hai câu hỏi cho người ở Cổng Phạm vi (sổ quyết định, dòng `chi-nguoi`): thứ tự khối việc so với phần 1; phần 3 là bảng KR (mục tiêu không có KR của mình vào nhóm thu gọn) hay giữ cả bảng mục tiêu dưới bảng KR.

## Đường đo

- Ngưỡng Cổng Đáng (≥ 80 % phiên cập nhật tuần đã gửi của người đang dẫn ≥1 đơn vị là phiên mở và gửi trong Của
  tôi, sàn 10 phiên, 14 ngày từ ngày lên production): số đến từ lệnh `bun apps/api/scripts/okr/do-cap-nhat-cua-toi.ts --tu
  <ngày lên prod> --den <+14 ngày>` chạy trên bản sao chỉ đọc của production — đọc `okrCheckInSession` (lối vào,
  giờ gửi) và cây tổ chức. AC-10 bảo đảm lệnh đếm đúng; AC-2 và AC-3 bảo đảm phiên mở trong Của tôi ghi đúng lối
  vào; AC-4 bảo đảm lối cũ không còn mở phiên ở trang khác.
- Giới hạn đã khai: «trưởng đơn vị» đọc theo cây tổ chức lúc chạy lệnh, không theo vai lúc phiên mở (kho không lưu
  lịch sử vai dẫn). Ai đổi vai dẫn trong 14 ngày thì phiên của họ được đếm theo vai hiện tại. Ngưỡng đếm: lệnh in kèm
  số đơn vị có dấu sửa (`updatedAt`) trong cửa sổ — chặn trên của số đơn vị có thể đã đổi trưởng; số đó > 0 thì người
  đọc tỉ lệ kèm cảnh báo, không đọc trơn.

## Out of scope

- Trang đơn vị dựng lại trên DataTable, ô chọn đơn vị có tìm kiếm, cách xem (B1–B8) — hàng DH2.
- Sơ đồ căn chỉnh (D1–D6) — hàng DH4, DH5.
- Khung đầu trang khu, nút «Thêm mục tiêu», dòng lý do khoá (A1, A2, A4–A6) — DH1 đã làm; lượt này chỉ dùng lại.
- Đổi quyền tạo/sửa mục tiêu, thủ tục gửi cập nhật, ngăn chi tiết KR (lối `sheet`), luật nhắc Zalo (giờ, nhịp,
  ai nhận) — chỉ đổi đường dẫn trong tin.
- Vùng bấm 44px toàn app, đơn vị trùng tên, nút «Mở tất cả», chốt chỗ đặt cách xem (E1–E5).
- Đo «không mở thẻ khác» bằng dấu vết điều hướng phía trình duyệt — giới hạn đã khai ở ô cơ hội.

## Notes

- Ghi cho S3 (DH1 nhắn 15/10): bản DH1 đã bỏ bảng tiêu đề theo thẻ (`tieuDe`) khỏi `lib/messages/okr.ts`; tiêu đề
  trình duyệt sống ở `okr/tieu-de-khu.ts`. Bộ kiểm `okr-dau-trang-khu.dom.tsx` ghi cứng `cap-nhat-tuan` ở danh sách
  trang đo, «5 mô tả khác nhau» và vòng đi-về đổi thẻ. Bản mẫu DH1 (`du-lieu.ts` TAB_MAU, catalog
  `ST-dhk-cap-nhat-tuan`, bảng trạng thái thiết kế DH1) và `rang/proto-khu.mjs` so với `tab-okr.ts`. Sửa các chỗ này
  CHỈ sau khi DH1 gộp; chạm hồ sơ đã ký của DH1 thì đi qua AC-11.
