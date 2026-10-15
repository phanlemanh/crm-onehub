---
schema_version: 1
feature: Điều hướng khu Mục tiêu — một đầu trang «Mục tiêu» cho cả khu, nút «Thêm mục tiêu» ở góc phải như Thoả thuận, đổi thẻ giữ đơn vị và chu kỳ, Sức khoẻ chương trình khớp tên, nút tạo bị khoá kèm một dòng lý do thay vì biến mất; chỉ giao diện
slug: dieu-huong-khu-muc-tieu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
approved_by: manh
approved_at: 2026-10-15T03:19:51Z
design_doc: docs/superpowers/specs/2026-10-15-dieu-huong-khu-muc-tieu-design.md
---

# Acceptance Contract: dieu-huong-khu-muc-tieu

## Context

Đo trên production 14/10 (khổ 1440 và 390): tiêu đề khu OKR đổi theo năm thẻ và không thẻ nào trùng tên «Mục
tiêu» trên thanh bên; nút «Thêm mục tiêu» nằm giữa thân trang Theo đơn vị, cách mép phải 360–425px, trong khi
Thoả thuận, Công ty, Tài liệu đặt nút chính ở mép phải đầu trang; đổi thẻ chỉ giữ chu kỳ, mất đơn vị đang xem;
người không đủ quyền không thấy nút tạo nào, trái luật «Không đủ quyền» của `docs/settings.md`. Lượt này là hàng
DH1 của đợt `okr-dieu-huong-1410`, phủ A1, A2, A4, A5, A6. Chỉ đổi giao diện: thủ tục API, quyền, dữ liệu, ngăn
tạo, hộp nhập và luồng soạn cùng Kara giữ nguyên.

Source input: hàng DH1 `docs/plan/lo-trinh-okr.json`; `docs/plan/pham-vi-okr-dieu-huong-1410.md`; ô cơ hội
`_acceptance/dieu-huong-khu-muc-tieu/opportunity.md` (Cổng Đáng ký 15/10); bản mẫu `/proto/dieu-huong-okr`
(nhánh `feat/dieu-huong-okr` @706ba494a).

## Criteria

- AC-1: Given mọi trang của khu Mục tiêu (Của tôi, Cập nhật tuần, Theo đơn vị, Toàn cảnh, Sức khoẻ chương trình, Hỏi ý) ở tiếng Việt và tiếng Anh, When trang dựng xong và cả khi còn đang tải, Then tiêu đề trang (`h1`) đúng bằng nhãn mục «Mục tiêu» trên thanh bên (en «Objectives») ở mọi trang; câu mô tả dưới tiêu đề khác nhau giữa năm thẻ; tiêu đề trình duyệt là «<tên thẻ> · Mục tiêu» (Sức khoẻ: «Sức khoẻ chương trình · Mục tiêu»).
- AC-2: Given mọi thẻ của khu ở 1440 px và 390 px, When đo trong trình duyệt thật cạnh trang Thoả thuận cùng khổ, Then hàng hành động — ô chu kỳ, nút «…», (pha lập kế hoạch) nút «Soạn OKR cùng Kara», nút chính «Thêm mục tiêu» — nằm trong đầu trang; ở 1440 px mép phải nút chính chênh mép phải nút chính của Thoả thuận ≤ 1 px và đỉnh của nó nằm trên đỉnh thanh thẻ; ở 390 px hàng hành động đứng cùng chỗ trong đầu trang như ở Thoả thuận (sau tiêu đề, trước mô tả) và không có nội dung tràn ngang; thân trang Theo đơn vị không còn nút tạo, nhập hay soạn nào; hàng hành động giữ chỗ cho nút «Hỏi Kara» của hàng `hoi-dap-okr` (Mac Studio) — có nút đó trên `onehub` thì nó đứng trong cùng hàng, đo như mọi điều khiển khác của hàng.
- AC-3: Given người xem có quyền tạo mục tiêu ở đơn vị đích, When bấm «Thêm mục tiêu», Then ở Theo đơn vị ngăn tạo mở ngay cho đơn vị đang chọn; ở bốn thẻ còn lại trang chuyển sang Theo đơn vị của đơn vị đích, đúng chu kỳ, với ngăn tạo đã mở; lưu xong thì mục tiêu mới thuộc đúng đơn vị đích. Đơn vị đích ở thẻ khác Theo đơn vị là đơn vị đầu tiên người xem dẫn (bộ phận trước phòng ban, theo thứ tự cây tổ chức), không thì `donOkr` trên đường dẫn, không thì cấp công ty; trưởng đơn vị vừa xem một đơn vị khác ở Theo đơn vị rồi sang Của tôi vẫn thấy nút bật và tạo được cho đơn vị mình dẫn. (cross-layer)
- AC-4: Given người xem có quyền ở đơn vị đích, When mở nút «…» rồi chọn «Nhập từ bảng tính», hoặc bấm «Soạn OKR cùng Kara» khi chu kỳ ở pha lập kế hoạch, Then hộp nhập hiện có mở cho đúng đơn vị đích (ở thẻ khác thì sau khi sang Theo đơn vị của đơn vị đích), và cuộc soạn mở cho đúng đơn vị đích như khi bấm nút soạn ở thân trang hôm nay; nút soạn khoá vì lý do của riêng nó (chưa cấu hình, hết lượt, hết trần, chưa có khoá, tạm nghỉ) vẫn có nút «i» nêu lý do như hôm nay; dữ liệu khoá/mở của nút soạn và của mục nhập được hỏi máy chủ cho đúng đơn vị đích. (cross-layer)
- AC-5: Given người xem KHÔNG có quyền tạo mục tiêu ở đơn vị đích (theo `canCreate` máy chủ trả), When trang dựng, Then «Thêm mục tiêu», mục «Nhập từ bảng tính» và (pha lập kế hoạch) nút soạn vẫn hiện nhưng bị khoá; mỗi điều khiển khoá có `aria-describedby` trỏ đúng một dòng dưới tiêu đề trang; dòng đó là «Bạn xem được <tên đơn vị> nhưng không thêm mục tiêu được: chỉ trưởng đơn vị này, trưởng đơn vị cấp trên và quản trị làm được.» khi đơn vị đích đến từ lựa chọn đơn vị, và «Bạn chưa dẫn đơn vị nào nên chưa thêm được mục tiêu: mục tiêu thuộc về đơn vị và do trưởng đơn vị đặt.» khi người xem không dẫn đơn vị nào và đường dẫn không mang đơn vị; người có quyền thì không có dòng nào; mở đường dẫn có khoá tạo khi không đủ quyền thì ngăn không mở và khoá rời đường dẫn như hôm nay. Một cờ khoá cả ba điều khiển vì máy chủ dùng cùng một phép kiểm cho tạo và nhập (`nhapDuoc`); trạng thái khoá đọc từ máy chủ thật cho thành viên không dẫn ai và cho trưởng đơn vị đang xem đơn vị không sửa được. (cross-layer)
- AC-6: Given đang xem Theo đơn vị với đơn vị X và chu kỳ K, When đi qua lần lượt Của tôi, Cập nhật tuần, Toàn cảnh, Hỏi ý bằng thanh thẻ rồi quay lại Theo đơn vị, Then trang mở lại đúng X và đúng K; mọi liên kết của thanh thẻ mang `kyOkr` và `donOkr` hiện có và không mang khoá nào khác của trang; đường dẫn không có đơn vị thì liên kết cũng không có.
- AC-7: Given trang Sức khoẻ chương trình, When người quản trị mở nó từ Toàn cảnh, Then tiêu đề trang là «Mục tiêu», thẻ «Toàn cảnh» đang chọn (`aria-current="page"`), đường dẫn «A › B» trong thân có A đúng bằng nhãn thẻ đang chọn và B đúng bằng tên trang trong tiêu đề trình duyệt; liên kết A về Toàn cảnh giữ `kyOkr` và `donOkr`; tiếng Anh viết một cách «Program health» ở tiêu đề, đường dẫn và mọi chuỗi của trang.
- AC-8: Given đầu trang khi quyền chưa tải xong hoặc tải lỗi, When trang dựng, Then lúc đang tải tiêu đề và mô tả hiện ngay, hàng hành động là khung xương cùng bề rộng (đầu trang không nhảy khi nút hiện); khi truy vấn quyền lỗi, nút chính khoá kèm dòng «Chưa tải được quyền của bạn — tải lại trang để thử lại.» và thân trang vẫn hiện lỗi tải của chính nó.
- AC-9: Given các bài kiểm của app từng khẳng định hành vi cũ (năm liên kết thẻ bỏ `donOkr`; nút tạo và nút nhập vắng với người không đủ quyền; hàng nút trong thân Theo đơn vị; nhóm soạn là con cuối của hàng nút; tiêu đề theo thẻ), When chạy sau lượt, Then mọi bài xanh và mỗi chỗ sửa trong bài chỉ đổi điều khẳng định sang lời hứa mới của AC-1 đến AC-6; các eval máy của hồ sơ đã ký chạy những tệp kiểm đó (`r1a_*`, `r1d_*`, `u8d_dom`, `r1c_*`, `hy_man_dom`, `soan_man_trang_thai`) thoát đúng mã kỳ vọng như lúc ký.
- AC-10: Given `/proto/dieu-huong-khu-muc-tieu` khi bật `PROTO_ROUTE=1`, When mở từng state, Then có một state cho mỗi dòng của bảng trạng thái trong thiết kế (trừ ST-dhk-dang-tai, ST-dhk-loi-quyen — hai dòng đo trên app thật ở AC-8); khu dùng năm thẻ như app hôm nay; phép đo sổ bản mẫu xanh.
- AC-11: Given ảnh đầu trang Theo đơn vị, Của tôi, Sức khoẻ chương trình, trạng thái khoá và Thoả thuận ở 1440 px và 390 px do E2 chụp, When một người không làm lượt này đặt cạnh nhau, Then họ đọc được khu Mục tiêu dùng cùng một khuôn đầu trang với Thoả thuận — tên khu ở trái, nút chính ở phải, thanh thẻ ngay dưới — và nút khoá có dòng lý do đọc được ngay dưới tiêu đề. (judgment)

## Coverage

Quét bằng `morphological-scan` trong phiên (15/10), bảng đủ ở `coverage-scan.md`.

- **Trục A — trang của khu:** Của tôi · Cập nhật tuần · Theo đơn vị · Toàn cảnh · Sức khoẻ chương trình · Hỏi ý · trang soạn (không đầu trang, giữ)  [thước CE: `okr/tab-okr.ts` + mọi `page.tsx` dưới `okr/` gọi `DauTrangOkrTrang` — SUY-TỪ-REPO]
- **Trục B — phần của đầu trang:** tiêu đề · mô tả · tiêu đề trình duyệt · hàng hành động · dòng lý do · thanh thẻ  [thước CE: đầu trang Thoả thuận `deals/page.tsx`; `docs/design.md` «Thẻ con của trang»]
- **Trục C — người xem:** quản trị · trưởng bộ phận · trưởng phòng ban · thành viên không dẫn ai · vai «chỉ OKR»  [thước CE: `okr-access.service.ts` `suaDuocDonVi`/`nhapDuoc`]
- **Trục D — nguồn đơn vị đích:** đơn vị đang chọn · `donOkr` trên đường dẫn · đơn vị mình dẫn · cấp công ty  [thước CE: AC-3]
- **Trục E — trạng thái dữ liệu:** đang tải · lỗi quyền · có quyền · không quyền · chu kỳ ngoài pha lập kế hoạch  [thước CE: `docs/design.md` «Chờ tải và lỗi tải»]
- **Trục F — khổ và ngôn ngữ:** 1440 · 390 · vi · en  [thước CE: số đo production 14/10 ở 1440 và 390]
- [GIẢ ĐỊNH] Giữ năm thẻ, kể cả «Cập nhật tuần» — bỏ nó là A3 của DH3.
- Thứ tự nguồn đơn vị đích và chỗ đứng của nút soạn là câu hỏi cho người ở Cổng Phạm vi (sổ quyết định, dòng `chi-nguoi`); nhãn «Soạn OKR cùng Kara» theo luật một tên AI của kho (`docs/ai-ux.md` §1).

## Đường đo

- Ngưỡng Cổng Đáng (5/5 người chưa xem bản mới tìm được nút «Thêm mục tiêu» và quay về đúng đơn vị sau khi đổi
  thẻ, mỗi việc dưới 5 giây, không hỏi): số đến từ phiên nghiệm thu (`/acceptance-gate:uat-session`) trong 7 ngày
  sau khi gộp — người điều phối phiên bấm giờ từ lúc trang mở tới lúc bấm, không có code đo mới. AC-2 (nút ở góc
  phải đầu trang mọi thẻ) và AC-6 (đổi thẻ giữ đơn vị và chu kỳ) bảo đảm hai việc được đo có mặt trên bản giao.

## Out of scope

- Bỏ thẻ «Cập nhật tuần» và Của tôi ba phần (A3, C1–C3) — hàng DH3.
- Trang đơn vị dựng lại trên DataTable, ô chọn đơn vị có tìm kiếm, cách xem giữ khi đổi thẻ (B1–B8) — hàng DH2.
- Sơ đồ căn chỉnh và bỏ «Cây căn chỉnh» khỏi trang đơn vị (D1–D6, B5) — hàng DH4, DH5.
- Vùng bấm 44px toàn app, đơn vị trùng tên, nút «Mở tất cả», chốt chỗ đặt cách xem (E1–E5).
- Đổi thủ tục API, luật quyền, ngăn tạo mục tiêu, hộp nhập, luồng soạn cùng Kara, thanh bên.

## Notes

- Known limits — chọn ở Cổng Bằng chứng 2026-10-15:
  - Ngoài-1: Phép kiểm tự thử của vòng này có thể báo nhầm lỗi do môi trường thử chứ không do tính năng. Tính năng điều hướng khu Mục tiêu người dùng thấy không bị ảnh hưởng.
  - Ngoài-3: Khi chạy thử kiểm tra hồ sơ đã ký, một dòng lỗi cố ý có thể làm các bài kiểm chạy song song đỏ oan, hoặc bị kẹt lại nếu tiến trình bị giết giữa chừng. Việc này chỉ gây nhiễu cho người chấm, người dùng cuối không bị ảnh hưởng.
  - Ngoài-4: Phép kiểm tự thử của vòng này chưa chứng minh được bản sao thử là sạch trước khi cố ý làm hỏng, nên một số kết luận đỏ có thể không đáng tin hoàn toàn. Tính năng người dùng thấy không đổi.
  - Ngoài-5: Phép kiểm tự thử cho hồ sơ đã ký có thể coi một lệnh chết vì lý do khác là đã bắt đúng lỗi cố ý. Chỉ giảm độ tin của bằng chứng, người dùng cuối không bị ảnh hưởng.
  - Ngoài-6: Không ảnh hưởng gì tới người dùng cuối. Đây chỉ là chú thích thừa trong mã, trái quy ước của kho, và có thể dọn sau.
  - Ngoài-7: Người dùng bật dịch tự động của trình duyệt có thể thấy tên bộ phận hoặc phòng ban trong dòng «bạn không thêm mục tiêu được» bị dịch sai. Các chỗ khác trong khu Mục tiêu đã giữ nguyên tên.
  - Ngoài-8: Hiện người dùng không thấy lỗi nào. Nếu sau này thêm một trang có tên trùng tên thẻ, tiêu đề tab trình duyệt có thể hiện sai mà không ai được báo.
  - Ngoài-9: Người dùng không thấy khác biệt. Trong mã còn một nút «Thêm mục tiêu» cũ không còn chạy thật, và một bài kiểm vẫn đo bản cũ đó thay vì bản đang dùng.
  - Ngoài-10: Phép thử «máy chủ từ chối thành viên tạo mục tiêu» luôn báo xanh dù máy chủ có chặn thật hay không. Do đó chưa có bằng chứng thật rằng thành viên không đủ quyền bị chặn ở phía máy chủ.
  - Ngoài-11: Phép thử xác nhận máy chủ từ chối người không đủ quyền xanh cả khi lời gọi sai khuôn, nên chưa chứng minh được người không đủ quyền thật sự bị chặn khi tạo mục tiêu.
  - Ngoài-12: Phép thử kiểm hộp nhập bảng tính có gửi đúng đơn vị còn lỏng, nên một lỗi làm xem trước nhập gửi nhầm đơn vị có thể lọt qua mà không bị báo.
  - Ngoài-13: Bài kiểm chỉ xác nhận đường dẫn đúng, chưa xác nhận ngăn thêm mục tiêu mở ra cho đúng đơn vị. Một lỗi ở bước mở ngăn có thể không bị phát hiện.
  - Ngoài-14: Bài kiểm tiêu đề lúc đang tải không chạm khung chờ thật của trang. Nếu ai đổi tiêu đề ở khung chờ đó, người dùng có thể thấy tiêu đề nhảy khi tải mà bài kiểm vẫn xanh.
  - Ngoài-15: Phép thử «hồ sơ đã ký phát hiện được lỗi» có thể báo đỏ vì lý do khác lỗi đã cố ý tiêm, nên màu đỏ đó chưa chắc chứng minh đúng điều nó khẳng định.
  - Ngoài-16: Bài kiểm xác nhận thân trang Theo đơn vị không còn nút tạo, nhưng không chắc trang đã dựng xong, nên một lần dựng hỏng cũng vẫn báo xanh.
