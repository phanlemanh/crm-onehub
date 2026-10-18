---
schema_version: 1
feature: Toàn cảnh OKR và họp tuần — danh sách theo đơn vị có lọc ở máy chủ, cây căn chỉnh toàn công ty đi bằng bàn phím, bảng họp tuần xếp theo thứ đáng bàn, toàn cảnh cho lãnh đạo có heatmap, phần «OKR của bạn» trên Tổng quan và trang OKR của một người, màn sức khoẻ chương trình cho quản trị; các biến thể packages/ui từ bản mẫu
slug: toan-canh-okr
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: signed-off
approved_by: Manh Phan — uỷ quyền phiên điều phối 2026-09-24
approved_at: 2026-09-25T21:28:57Z
design_doc: docs/superpowers/specs/2026-09-26-toan-canh-okr-design.md
---

# Acceptance Contract: toan-canh-okr

## Context

Lượt 5 lộ trình OKR. Sau lượt 3 (#140) và lượt 4 (`cap-nhat-tuan-okr`, chưa gộp)
số OKR đã vào CRM nhưng chưa ai nhìn được chúng cùng lúc: «Theo đơn vị» chỉ đọc
đúng một đơn vị, không lọc; cây căn chỉnh không gập mở, không bàn phím; «Toàn cảnh»
là chỗ đứng; không có bảng họp tuần, không có màn sức khoẻ chương trình, Tổng quan
không có khối OKR. Lượt này chỉ **đọc** dữ liệu có sẵn (không bảng, không
`migration`), cộng một dòng vết «mở bảng họp tuần» làm đường đo, và thêm các biến
thể `packages/ui` bản mẫu đã duyệt. Chia hai nhịp: tiêu chí ghi «(nhịp 2)» chỉ làm
sau khi lượt 4 gộp vào `onehub` và nhánh này gộp lại `origin/onehub`.

Source input: `docs/plan/lo-trinh-okr.md` mục 5 «Lượt 5», mục 6 · bản phạm vi OKR
(XEM-02…07, QT-04) · `_acceptance/toan-canh-okr/opportunity.md` (Cổng Đáng
2026-09-26) · `_acceptance/ban-mau-okr/design-pass.md` · `_acceptance/toan-canh-okr/design-pass.md` ·
prompt phiên điều phối 2026-09-26.

## Criteria

- AC-1: Given cây tổ chức có bộ phận B chứa phòng ban P1, P2, một phòng ban P3 ở bộ phận khác, và trong chu kỳ đang chạy các mục tiêu với loại, trạng thái, người phụ trách và KR khác nhau, When gọi `okr.danhSach` với đơn vị `bp:B`, rồi lần lượt thêm lọc người phụ trách, loại, trạng thái, Then kết quả gồm mục tiêu của B **và** của P1, P2 mà KHÔNG có P3; mỗi lọc thu đúng tập mục tiêu viết trước (người phụ trách khớp chủ mục tiêu hoặc chủ một KR, và `krKhop` liệt đúng KR khớp); `facetCounts` đếm mỗi giá trị trên tập đã lọc theo mọi mặt **trừ** mặt của chính nó (chọn một người vẫn thấy số của những người khác) — bằng số đếm viết trước cho cả lời gọi không lọc và lời gọi đã lọc; `nguoi:<id>` trả đúng các mục tiêu người đó phụ trách, tham gia hoặc có KR; And (nhịp 2) lọc mức tự tin chỉ giữ mục tiêu có KR mà lần cập nhật mới nhất mang mức đó.
- AC-2: Given «Theo đơn vị» trong trình duyệt thật với dữ liệu của AC-1, When người dùng mở menu lọc, chọn «Mức tự tin: Thấp» hoặc một người phụ trách, rồi «Bỏ lọc», và mở một người (`donOkr=nguoi:<id>`), Then URL mang tham số lọc và tải lại vẫn giữ, danh sách đổi theo đúng tập máy chủ trả, lọc không khớp hiện «Không mục tiêu nào khớp bộ lọc» có «Bỏ lọc», trang một người có đầu trang người (phòng ban chính, quản lý) và KR người đó phụ trách; không trang nào tràn ngang ở 390. (cross-layer)
- AC-3: Given cây đơn vị và cây căn chỉnh toàn công ty, When người dùng chỉ dùng bàn phím — Tab vào cây, ↓ ↑ Home End, → mở hoặc vào con, ← gập hoặc về cha, Enter — Then cây mang `role="tree"`, mỗi dòng `treeitem` có `aria-level`, `aria-expanded` đúng, chỉ một phần tử của cây nằm trong thứ tự Tab, Enter trên đơn vị chọn đơn vị đó (URL đổi) và trên mục tiêu mở sheet mục tiêu; mục tiêu góp vào hai chỗ hiện hai lần, lần hai ghi «cũng hiện ở chỗ góp kia»; cây dùng thành phần ReUI cài trong `packages/ui`, không cây tự dựng.
- AC-4: Given mọi thanh tiến độ trong khu OKR, sheet mục tiêu và phần «OKR của bạn», When vẽ KR số, KR mốc và mục tiêu, Then thanh là biến thể trung tính (nền `muted`, phần đã đi `muted-foreground`, không `bg-primary`) có vạch «lẽ ra đã tới» ở đúng phần trăm kỳ vọng và nhãn cho trình đọc «X%, lẽ ra đã tới Y%»; KR mốc không có vạch; tình trạng và mức tự tin hiện bằng một cặp thành phần dùng chung trong `packages/ui` (chấm kèm chữ, tham vọng không bao giờ «Trượt»), vi và en khác nhau.
- AC-5: Given cây tổ chức, chu kỳ đang chạy và mục tiêu đã công bố ở OneHub, hai bộ phận và các phòng ban (một phòng ban chưa đặt gì), When gọi `okr.toanCanh` bằng phiên của quản trị, thành viên thường và vai «chỉ OKR», rồi mở tab Toàn cảnh, Then cả ba vai đọc được; hàng theo thứ tự OneHub → bộ phận → phòng ban của nó → phòng ban chưa xếp; hàng bộ phận gộp mục tiêu của chính nó và phòng ban con; tiến độ, lẽ ra, số mục tiêu, số KR mỗi hàng bằng số viết trước; «Đơn vị đã công bố» và tên đơn vị chưa đặt đúng; nháp và đã bỏ không vào tiến độ; màn có bốn thẻ số, bảng theo đơn vị có thanh tiến độ trung tính, và các trạng thái đang tải, lỗi (thử lại), tuần đầu; And trên bộ gieo 50 đơn vị × 2.000 KR mỗi lời gọi `toanCanh`, `danhSach` có lọc, `sucKhoe` (và `hopTuan` ở nhịp 2) trả dưới 1.000 ms ở máy dev, với số câu truy vấn ở 5 đơn vị bằng ở 50 đơn vị. (cross-layer)
- AC-6: (nhịp 2) Given lần cập nhật tuần gieo qua thủ tục của lượt 4 trong bốn tuần cho các đơn vị của AC-5, When gọi `okr.toanCanh` và mở Toàn cảnh, Then mỗi hàng có phân bố tự tin Cao·Vừa·Thấp theo lần cập nhật mới nhất, số KR đã cập nhật tuần này, câu «đáng bàn» mạnh nhất, và dãy heatmap mỗi tuần bằng tỷ lệ KR có lần cập nhật mức Cao trên KR có cập nhật tuần đó (`null` khi không ai cập nhật hoặc tuần chưa tới) — bằng bảng số viết trước; heatmap là thành phần `packages/ui` với năm bậc, ô rỗng viền đứt có chữ ẩn «chưa có», cột tên dính trái, tự cuộn tới tuần hiện tại, chú giải, và chữ trên mọi bậc đạt tương phản 4.5:1 ở nền sáng và nền tối.
- AC-7: (nhịp 2) Given một phòng ban có KR mà lần cập nhật tuần này tụt từ Vừa xuống Thấp, KR tụt từ Cao xuống Vừa, KR im 15 ngày, KR có ghi chú mới và KR không có gì mới, When trưởng phòng ban gọi `okr.hopTuan` và mở «Theo đơn vị › Cách xem: Họp tuần», Then «Đáng bàn» xếp đúng thứ tự viết trước (tụt nhiều bậc → tụt → im lâu → ghi chú mới) với lý do bằng chấm kèm chữ, KR không có gì mới nằm trong «Còn lại» gập được, mỗi dòng là một KR và màn không có danh sách người chưa cập nhật; bấm dòng mở sheet KR; tuần yên ắng và tuần đầu có câu riêng. (cross-layer)
- AC-8: Given trưởng của phòng ban P và một thành viên thường, When trưởng mở bảng họp tuần của P, rồi làm mới dữ liệu và đổi bộ lọc trong cùng lượt mở, tải lại trang ngay sau đó, rồi mở lại ở một lượt khác (cách hơn 30 phút) và ở tuần sau, còn thành viên mở một lần, Then bảng vết OKR có đúng một dòng `mo-hop-tuan` cho mỗi lượt mở của trưởng (ba dòng: lượt đầu, lượt sau, tuần sau — làm mới, đổi lọc và tải lại trong 30 phút không sinh dòng), người làm là trưởng, `objectiveId` và `keyResultId` rỗng, `after = {donVi: "pb:<id>", tuan: "YYYY-MM-DD"}` (chuỗi ngày thứ Hai giờ Việt Nam), không dòng nào của thành viên; And tab «Vết» của một mục tiêu trong P không có dòng mới sau khi mở bảng, và không màn nào đọc vết theo chu kỳ hiện dòng đó; And câu đếm `rang/ty-le-mo-hop-tuan.sql` chạy trên dữ liệu sinh bằng chính lời gọi mở bảng (năm đơn vị có trưởng, ba đơn vị có trưởng mở trong tuần 2026-11-16) trả đúng 3/5 = 60%. (cross-layer)
- AC-9: (nhịp 2) Given một KR «tăng tới» có lần cập nhật ở bốn tuần và một KR mốc, When mở sheet mục tiêu › tab «Diễn biến», Then `okr.dienBien` trả mỗi tuần của kỳ một giá trị: là lần cập nhật cuối trong tuần, «lẽ ra» nội suy theo kỳ vọng của thứ Hai tuần đó, mức tự tin và ghi chú của lần đó, tuần chưa tới là rỗng — bằng bảng viết trước; màn vẽ biểu đồ đường có đích (thành phần `packages/ui` bọc `LineChart`/`ReferenceLine`: một trục, đường giá trị liền, «lẽ ra» đứt, vạch đích có nhãn trực tiếp không bị cắt) cùng dãy mức tự tin bằng chấm kèm chữ; KR mốc hiện dòng thời gian mức tự tin, không biểu đồ; chưa có lần cập nhật hiện câu hẹn ngày. (cross-layer)
- AC-10: (nhịp 2) Given một người phụ trách năm KR với tình trạng khác nhau, When họ mở Tổng quan (vai đầy đủ và vai «chỉ OKR») và khi người khác mở trang OKR của họ, Then phần «OKR của bạn» hiện tối đa năm KR xếp trượt → chậm nhịp → mốc chưa xong → tự tin thấp → còn lại, mỗi dòng có thanh trung tính và cặp chỉ báo, liên kết «Mở OKR»; người chưa phụ trách KR nào thấy câu riêng; `okr.khoiCuaToi` trả đúng thứ tự viết trước; các phần Tổng quan đang có và thẻ việc của lượt 4 không đổi. (cross-layer)
- AC-11: Given quản trị, trưởng đơn vị, thành viên thường và vai «chỉ OKR», When gọi `okr.sucKhoe` và mở Toàn cảnh › «Sức khoẻ chương trình», Then chỉ quản trị đọc được (còn lại 403 với câu ghim, và nút lối vào không hiện); mỗi hàng đơn vị có số KR đang tính, cột «KR của mục tiêu chưa công bố» (KR của mục tiêu còn nháp trong kỳ đang chạy — khởi điểm chưa khoá; màn không dùng chữ «thiếu khởi điểm» trần), người chưa nối kênh nhắc (không Zalo, không khớp Slack; người theo phòng ban chính, bộ phận gộp con), trưởng hoặc «Chưa có trưởng» — bằng số viết trước; And (nhịp 2) thêm KR cập nhật đúng tuần vừa qua và KR im từ 14 ngày. (cross-layer)
- AC-12: (nhịp 2) Given các chu kỳ năm 2026 (có quý 3 đã đóng và quý 4 đang chạy) và năm 2027, When mở ô chọn chu kỳ ở đầu khu OKR và đi bằng bàn phím, Then ô là thành phần `packages/ui` nhóm theo năm, quý nằm trong năm của nó, «hiện tại» và «đã đóng» mang chữ (không chỉ màu), chọn một kỳ đổi URL `kyOkr` và mọi tab (Theo đơn vị, Họp tuần, Toàn cảnh) gọi máy chủ với đúng kỳ đó và hiện mục tiêu của kỳ đó, không của kỳ đang chạy. (cross-layer)
- AC-13: Given bốn vai workspace, When gọi mọi thủ tục mới (`danhSach`, `toanCanh`, `hopTuan`, `moHopTuan`, `dienBien`, `khoiCuaToi`, `sucKhoe`), Then ba vai đầy đủ và vai «chỉ OKR» gọi được sáu thủ tục đầu (`moHopTuan` chỉ sinh dòng khi người gọi là trưởng), `sucKhoe` chỉ quản trị và chủ workspace; ma trận phạm vi dữ liệu của `vai-chi-okr` vẫn xanh (router `okr` đã khai phạm vi OKR, không thêm router mới).
- AC-14: Given các tệp giao diện lượt này thêm hoặc sửa, When chạy cổng thiết kế tĩnh, bộ quét «Dấu hiệu vẽ tay» và soi mã, Then không tệp nào có vi phạm P0, không `<table`, `<h1`, `<h2`, chấm `size-2 rounded-full`, `divide-y`, hộp `rounded-lg border` tự dựng, `navigator.clipboard`, `AlertDialog` trong `apps/app`; thành phần mới trong `packages/ui` không có mặc định chuỗi trong tham số destructure và không `Intl` ở mức module; chữ mới có vi và en khác nhau; chữ người nhập mang `translate="no"`; không `Record<string, unknown>` và không `useEffect` trần trong tệp mới.
- AC-15: Given ba trang hướng dẫn theo vai (người phụ trách KR, trưởng đơn vị, quản trị chương trình), When một người đọc trang của vai mình, Then trang nói bằng chữ của `CONTEXT.md` làm gì mỗi tuần và ở màn nào (cập nhật tuần, họp tuần, toàn cảnh, sức khoẻ), không hứa tính năng chưa có. (judgment)

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — bề mặt:** lọc theo đơn vị · diễn biến trên sheet · cây căn chỉnh · họp tuần · toàn cảnh tiến độ · toàn cảnh tự tin và heatmap · khối Tổng quan và trang một người · sức khoẻ · biến thể `packages/ui`  [thước CE: bảng phủ mục 8 lộ trình + định nghĩa mã trong bản phạm vi] → AC-1…AC-12
- **Trục B — nguồn số:** có sẵn sau lượt 3 · bảng lần cập nhật của lượt 4 (nhịp 2) · kênh nhắc  [thước CE: `schema.prisma`, schema lượt 4, `ZaloLink`, `SlackMemberMatch`] → AC-1, AC-5 (có sẵn), AC-6, AC-7, AC-9, AC-10 (lượt 4), AC-11 (cả ba)
- **Trục C — người xem:** quản trị · trưởng đơn vị · thành viên thường · vai «chỉ OKR»  [thước CE: `WORKSPACE_ROLES`, `OkrAccessService`, chốt «mọi vai thấy Toàn cảnh»] → AC-5, AC-8, AC-11, AC-13
- **Trục D — trạng thái màn:** có dữ liệu · rỗng hay tuần đầu · đang tải · lỗi · không đủ quyền · 390/1440  [thước CE: nguyên tắc chia lượt; `docs/settings.md` mục Trạng thái] → AC-2, AC-5, AC-7, AC-9, AC-10, AC-11
- Cross-cutting: lọc ở máy chủ và số câu hỏi cố định (AC-1, AC-5); bàn phím (AC-3, AC-12); không tô khối (AC-4); vẽ tay, vi/en, `translate="no"` (AC-14); không liệt kê người (AC-7).
- Chân ngành: cập nhật tuần có ghi chú và mức tự tin [NGÀNH: Profit.co]; bản đồ căn chỉnh toàn tổ chức [NGÀNH: Perdoo]. Heatmap đơn vị × tuần không có tiền lệ có tên — đứng trên chốt bản mẫu 2026-09-24.
- Chốt tại Cổng Phạm vi 2026-09-25 (uỷ quyền): «trang cá nhân» của XEM-07 là trang OKR của một người trong «Theo đơn vị» (`donOkr=nguoi:<id>`); không dựng trang hồ sơ nhân viên.
- Chốt tại Cổng Phạm vi: «KR thiếu khởi điểm» của QT-04 là KR của mục tiêu còn nháp trong kỳ đang chạy; nhãn trên màn là «KR của mục tiêu chưa công bố».
- Chốt tại Cổng Phạm vi: họp tuần là cách xem thứ ba của «Theo đơn vị» (giữ bốn tab); sức khoẻ là trang riêng mở từ «Toàn cảnh», chỉ quản trị thấy nút.
- Chốt tại Cổng Phạm vi: đếm mở bảng qua bảng vết OKR, hành động `mo-hop-tuan`, dòng không mang mục tiêu hay KR, không màn «Vết» nào hiện; một dòng mỗi người × đơn vị × lượt mở bảng, không ghi lại khi làm mới hay đổi lọc.

## Đường đo

- Thước: ≥ 2/3 trưởng đơn vị dự phiên nghiệm thu R1 chạy xong họp tuần chỉ trên bảng, trung vị ≤ 15 phút cho đơn vị ≤ 12 KR · số từ: bấm giờ tại phiên 2026-11-13 · bảo đảm bởi: AC-7 (bảng họp tuần tồn tại và xếp đúng), AC-9 (xem diễn biến không rời màn)
- Thước: ≥ 60% đơn vị có trưởng mở bảng họp tuần trong tuần bắt đầu 2026-11-16 (đọc 2026-11-23) · số từ: bảng vết OKR hành động `mo-hop-tuan`, câu `_acceptance/toan-canh-okr/rang/ty-le-mo-hop-tuan.sql` · bảo đảm bởi: AC-8

## Out of scope

- **Trang hồ sơ nhân viên ngoài khu OKR** — «trang cá nhân» là trang OKR của một người (giả định Coverage).
- **Danh sách người chưa cập nhật, xếp hạng người** — NG-07; họp tuần theo KR.
- **Bộ lọc lưu được, tìm OKR trong ô tìm chung** — XEM-08, XEM-09, lượt 8.
- **Cảnh báo tự động khi tiến độ và tự tin lệch** — AI-06, lượt 10.
- **Biến thể `ToggleGroup` 44px, `Tabs` thanh khu, `StatGroup` bo góc, `DetailSheetHeader` ô biểu tượng, `DetailSheetStats` cắt chữ** — Nhóm 2 bản mẫu, để sau (sổ quyết định; đồng ý tại Cổng Phạm vi).
- **Bảng mới hay `migration`** — lượt này chỉ đọc; không bảng chụp theo tuần.
- **Sửa bảng lần cập nhật, nhắc, bình luận của lượt 4** — chỉ đọc.

> Rationale từng mục: `decisions.jsonl`.

## Notes

- Luật đã đọc: `AGENTS.md`, `docs/design.md` (kể cả «Vẽ tay là bậc cuối»), `docs/api.md` (tRPC, cây tổ chức, OKR), `docs/settings.md`, `docs/proto.md`, `docs/reui.md`, `docs/telemetry.md`, `CONTEXT.md` (OKR, Đơn vị, Trưởng đơn vị, Mức tự tin, Phạm vi dữ liệu); skill `nuqs`, `no-use-effect`, `nestjs-trpc`, `web-design-guidelines` (khai ở `feature_loop.ui_standards_skill`), `dataviz`.
- Hạng T2: không chạm `packages/db/prisma`, không chạm module quyền; một hành động vết mới là giá trị khuôn Zod (`docs/api.md`: «Adding a value is a schema change, not a migration»).
- Hai nhịp: nhịp 2 (AC-6, AC-7, AC-9, AC-10, AC-12, và các vế «(nhịp 2)» của AC-1, AC-11) làm sau khi lượt 4 lên `onehub`; AC-12 thêm điều kiện vòng «Sửa bốn điểm giao diện OKR» (đang sửa `chon-chu-ky.tsx`) đã gộp. Hợp đồng lên `implemented` khi xong cả hai.
- Tệp chung với lượt 4 và vòng «bốn điểm»: bảng mục 7 của design doc. Mã mới ở tệp riêng; router và module chỉ nối thêm.
- Hồ sơ đã ký phải ghim lại: `dat-okr-trong-crm` (bước E11-12 khẳng định chỗ đứng «lượt 5» của Toàn cảnh; `byUnit` giữ nguyên) — dòng `revisit` vào sổ hồ sơ đó trước khi sửa thước; `vai-chi-okr` chạy lại ma trận (không đổi danh sách).
- Nền hạ tầng (`duong-nen.md`): `build_khong_cache` đỏ vì `bash -lc` nhận Node 22; chạy với PATH Node 24 thì xanh (4/4 task, đo 2026-09-26). Hai dòng «THIEU merge-base» là khoá của hồ sơ khác. Làn S4 chạy với tiền tố PATH Node 24.
- Máy chủ dev của phép đo màn: 3930 (app) / 3931 (api), ảnh ở `.acceptance-runs/toan-canh-okr/evidence/`; gieo tự dọn theo id, không để lại dữ liệu thử trong kho `crm`.
- Cổng người do phiên điều phối ký theo uỷ quyền của Manh Phan ngày 2026-09-24; dòng ký ghi «Manh Phan — uỷ quyền phiên điều phối 2026-09-24».

Known limits — chủ kho chấp nhận 26/09 tại Cổng Bằng chứng sau S4 vòng 3 (Ngoài-1, 3, 4, 5, 9–16 và phần thêm; sổ d-20260926T110238Z-30, -32, -33, -34, -38 … -45, -48):

- known-limits: `packages/ui/test/tree-nav.dom.tsx` chỉ đo nhánh dự phòng (mục đang chọn không có trong cây); chưa có đối chứng dương cho mục đang chọn có trong cây, nên một hồi quy bỏ hẳn `selectedId` vẫn xanh.
- known-limits: `apps/api/src/okr/okr-xem.config.ts` là module hằng số thứ hai của khu OKR, lặp đơn vị thời gian và câu lỗi «Không có KR» khác chữ với `okr-config.ts`.
- known-limits: các bảng OKR mới tự viết khoảng đệm ô thay cho hằng số `CELL`; dòng bảng họp tuần cao hơn các bảng OKR khác.
- known-limits: vài con số chỉnh được (`SO_TEN_CHUA_DAT`, `LAM_TRON`, chiều cao mặc định của `TargetLineChart`) đặt cạnh chỗ dùng, không ở module cấu hình.
- known-limits: bài API của E8 kiểm 6 hàng thay vì 7 hàng × 6 trường, và chưa kiểm `tongQuan.donViCongBo`/`tongDonVi`.
- known-limits: `packages/ui/test/target-line-chart.dom.tsx` chỉ kiểm nhãn đích có chữ, không kiểm nằm trong khung; thước màn E17 có kiểm vế này.
- known-limits: `packages/ui/test/heatmap.dom.tsx` chưa kiểm `scrollLeft > 0` khi khung hẹp.
- known-limits: bài API của E16 (b) chỉ đếm 10 điểm, chưa so từng giá trị với hàm thuần.
- known-limits: `hop-tuan-xep` kiểm «không có khoá người» bằng regex hẹp, không đối chứng dương; thứ tự qua API chưa kiểm.
- known-limits: `rang/soi-ma.mjs` dò chữ tình trạng tự map chưa có chiều đỏ.
- known-limits: mock `okr.danhSach` trong `apps/app/test/okr-theo-don-vi.dom.tsx` thiếu trường bắt buộc, khoá gieo lệch khoá thật.
- known-limits: hai phép so id trong `apps/api/test/okr-toan-canh.spec.ts` luôn đúng.
- known-limits: E11, E12, E20 của `dat-okr-trong-crm` có vật đo bị chạm ngoài làn máy (làn ghim lại repin-20260926T092424Z-22525 và repin-20260926T101611Z-94802 nói ra); không mở vòng S4 delta cho hồ sơ đó.
- known-limits: E21 và E23 đọc theo sổ d-20260926T091042Z-26 — E21 nối Zalo cho trưởng P1 để khớp số viết trước của E20; E23 ở Toàn cảnh đọc số của hàng phòng ban vì màn không in tên mục tiêu.

Mở hợp đồng mới (Ngoài-2 và 6, Ngoài-7, Ngoài-8; sổ -31, -35, -36, -37): tải trước danh sách Theo đơn vị kèm bộ lọc mức tự tin; bộ lọc phụ trách hiện tên thay cho mã; khối «OKR của bạn» báo lỗi khi không tải được chu kỳ.

Lời hứa thay bởi hồ sơ khác (thêm 17/10, trang-don-vi-mot-bang AC-14):

- Trang Theo đơn vị khi lọc không khớp ghi «Không có mục tiêu nào khớp» kèm nút bỏ lọc (E2 bước lọc) — thay bởi trang-don-vi-mot-bang AC-5.
