---
schema_version: 1
feature: "Tạo kế hoạch onboard từ khuôn là có sẵn việc cho từng phòng ban; deal thắng thì máy gợi ý mở kế hoạch"
slug: ke-hoach-sinh-viec
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, docs]
status: draft
design_doc: docs/superpowers/specs/2026-10-14-ke-hoach-sinh-viec-design.md
---

# Acceptance Contract: ke-hoach-sinh-viec

## Context

Hàng DA3 của `docs/plan/lo-trinh-viec-du-an.json`; chủ kho mở ở Cổng Đáng 14/10/2026 (build, ngưỡng theo đề xuất
máy). Hôm nay tạo kế hoạch 30 ngày từ khuôn sinh ra các bước không ai làm (`assigneeId` trống), bước không phải
Việc nên không vào Việc của tôi, Kanban hay Gantt; deal thắng không dẫn tới gì. Lượt này: mỗi bước sinh từ khuôn
(và mỗi bước thêm tay) mang đúng một **Việc** — người làm chọn lúc tạo cho từng phòng ban, mặc định trưởng phòng;
Việc là nguồn sự thật, bước là bản chiếu của nó; và deal sang giai đoạn thắng của công ty chưa có kế hoạch mở
sinh một **gợi ý mở kế hoạch** có trạng thái. Hạng T3 vì thêm bảng và cột ở `packages/db/prisma`.

Source input: hàng DA3 · `opportunity.md` (ngưỡng đã ký) · `docs/plan/viec-du-an-nghien-cuu.md` mục 3 · hồ sơ
`viec-chung` (DA1) và `dieu-phoi-va` (E6) · design doc.

## Criteria

- AC-1 (cross-layer): Given khuôn có ba bước ở hai phòng ban — phòng A có trưởng phòng H, phòng B không có trưởng phòng — và người cầm trịch O, When tạo kế hoạch từ khuôn đó qua ô tạo kế hoạch mà không đổi người nào, Then cơ sở dữ liệu có ba bước và ba Việc, mỗi bước trỏ đúng một Việc khác nhau; Việc của phòng A có người thực hiện H, của phòng B có người thực hiện O, người giao là người tạo; hạn của mỗi Việc bằng ngày bắt đầu cộng số ngày lệch của bước, tính theo ngày giờ Việt Nam; mỗi Việc gắn kế hoạch và có đúng một vết «tao» nguồn `khuon`; cột người làm, hạn, tên của mỗi bước bằng đúng của Việc nó trỏ; When gọi REST `POST /onboarding/plans` không có trường chọn người, Then kết quả y như trên.
- AC-2 (cross-layer): Given khuôn của AC-1 và người U vai `member`, When người tạo đổi người phòng B sang U, Then Việc của phòng B có người thực hiện U; Given trưởng phòng H đã sang vai `okr`, When tạo không đổi người, Then Việc của phòng A có người thực hiện O; When gửi người vai `okr` cho một phòng ban, Then trả 400 với lời có tên người, tên phòng ban và chữ «chỉ OKR», và số kế hoạch, bước, Việc, vết trong cơ sở dữ liệu không đổi.
- AC-3 (ui-observed): Given bản chạy thật với dữ liệu mẫu, When mở ô tạo kế hoạch ở danh mục 30 ngày và ở sheet công ty, chọn một khuôn có hai phòng ban, ở khổ 1280 và 375, Then thấy một hàng mỗi phòng ban có ô chọn người điền sẵn trưởng phòng (hay người cầm trịch khi phòng không có trưởng), danh sách chọn không có người vai «chỉ OKR»; khi khuôn đang tải, tải hỏng hay khuôn không có bước, ô hiện trạng thái chờ, lỗi có «Thử lại», và rỗng; ở 375 không có thanh cuộn ngang.
- AC-4: Given một kế hoạch tạo từ khuôn sau lượt này, When chạy từng lệnh trong bảng viết trước của design doc mục 5 — sáu lệnh phía bước (`assignStep`, `setStepDone` đánh và bỏ đánh, `rescheduleStep`, «xong n» trỏ bước, `transferWork` chuyển việc của người làm sang người khác) và bốn lệnh phía Việc (`doiTrangThai` sang Đang làm, Chờ đánh giá, Xong, rồi mở lại; `suaViec` hạn và tiêu đề; `doiNguoiThucHien`) — Then sau MỖI lệnh, đọc lại từ cơ sở dữ liệu, bốn cột người làm · hạn · tên · thời điểm xong của bước bằng đúng bản chiếu của Việc nó trỏ (xong ⟺ Việc ở Xong, thời điểm xong = `khepLuc`); mỗi lệnh để đúng một vết trên Việc; người được giao đóng được bước của mình; chiều đỏ: một bản sao bỏ lời gọi chiếu ở một lệnh làm bảng đỏ gọi đúng tên lệnh đó.
- AC-5: Given một Việc trỏ bởi một bước và một Việc thường không trỏ bởi bước nào, When chuyển Việc sang Huỷ, xoá Việc, hay gỡ gắn kế hoạch, Then với Việc của bước mỗi lệnh trả 400 với lời ghim «gỡ bước ở kế hoạch» và Việc, bước không đổi; với Việc thường cả ba lệnh vẫn thành công như trước lượt này (đối chứng dương).
- AC-6 (cross-layer): Given kế hoạch của AC-1, When người cầm trịch gỡ một bước ở thẻ Bước, Then bước mất, Việc của nó còn ở trạng thái Huỷ với vết «doi-trang-thai» kèm lý do gỡ bước, không còn bước nào trỏ nó, và danh mục hiện «Bước 0/2» thay vì «0/3»; Given một kế hoạch còn hai bước dở và một bước xong, When người cầm trịch đóng kế hoạch, Then hộp đóng hỏi «Huỷ 2 việc còn mở của kế hoạch?» đánh dấu sẵn; khi giữ dấu, hai Việc sang Huỷ với vết nguồn `dong-ke-hoach`, Việc đã Xong giữ nguyên, bản chiếu của ba bước đúng, và nhịp nhắc sau đó không có `viec-qua-han` cho hai Việc đó; khi bỏ dấu, hai Việc giữ nguyên trạng thái; When mở lại kế hoạch, Then Việc đã Huỷ lúc đóng không tự hồi.
- AC-7 (cross-layer): Given một kế hoạch rỗng và một kế hoạch tạo từ khuôn, When thêm một bước tay có chọn người và một bước tay không chọn người, Then mỗi bước mang một Việc mới — người thực hiện là người được chọn, hay theo luật mặc định của AC-1 khi không chọn; các AC-4, AC-5, AC-6 của hồ sơ `dieu-phoi-va` vẫn xanh nguyên tên bài.
- AC-8 (cross-layer): Given một kế hoạch tạo trước lượt này (bước không trỏ Việc nào) và một kế hoạch tạo sau, mỗi kế hoạch có một bước quá hạn giao cho B, When giao, đánh xong, đổi hạn, gỡ bước ở kế hoạch cũ, Then hành vi y như trước lượt này và không Việc nào được tạo; When nhịp nhắc chạy sau 08:30 giờ VN, Then bộ gom của B có `buoc-qua-han` cho bước cũ và `viec-qua-han` cho Việc của bước mới, không có `buoc-qua-han` cho bước mới — mỗi việc nhắc đúng một lần.
- AC-9: Given công ty C không có kế hoạch mở và công ty E có một kế hoạch mở, When chạy ma trận viết trước chín ô loại giai đoạn đi × đến (mở · thắng ở cột khác · thua × mở · thắng · thua, mỗi ô một deal mới của C qua `setStage`) và bảng đường vào: deal của C sang thắng qua `bulkSetStage`, deal của C tạo thẳng ở giai đoạn thắng, deal của C bị dời sang thắng khi lưu trữ giai đoạn cũ, deal của E sang thắng, deal của C có gợi ý đã «bỏ qua» mở lại rồi thắng lần nữa, deal của C có gợi ý còn «chờ» mở lại rồi thắng lần nữa, Then đọc lại từ cơ sở dữ liệu: đúng hai ô mở → thắng và thua → thắng của ma trận sinh gợi ý, bảy ô còn lại không; ba đường vào đầu và ca «bỏ qua rồi thắng lại» mỗi ca đúng một gợi ý «chờ» mới mang deal, công ty, giờ chuyển, người nhận là người phụ trách deal lúc đó; ca công ty E và ca «còn chờ» không có gợi ý mới; gợi ý được ghi trong cùng giao dịch với lần đổi giai đoạn — một lỗi ghi gợi ý làm lần đổi giai đoạn không xảy ra; chiều đỏ: bản sao gọi luật chỉ ở `setStage` làm bảng đỏ gọi đúng tên ca hàng loạt và ca tạo thẳng.
- AC-10 (cross-layer): Given gợi ý «chờ» của deal D giao người nhận R, When R bấm «Bỏ qua», Then gợi ý sang «bỏ qua» với người và giờ xử lý; When một thành viên khác gọi xử lý, Then trả 403 và gợi ý không đổi; Given gợi ý «chờ» khác của công ty C, When bất kỳ ai tạo kế hoạch cho C bằng bất kỳ đường nào, Then trong cùng giao dịch gợi ý sang «đã mở» mang mã kế hoạch đó và giờ xử lý.
- AC-11 (cross-layer): Given deal đã thắng có gợi ý «chờ», When người nhận mở sheet deal, Then đầu sheet có thẻ «Deal đã thắng — mở kế hoạch 30 ngày?» với hai nút; When bấm «Mở kế hoạch», Then ô tạo kế hoạch mở với công ty điền sẵn, và khi tạo xong sheet đọc lại gợi ý và thẻ biến mất vì gợi ý đã «đã mở»; When bấm «Bỏ qua», Then thẻ biến mất ngay và không quay lại khi tải lại; When một người không phải người nhận hay quản trị mở deal, Then không có thẻ.
- AC-12 (cross-layer): Given gợi ý «chờ» giao R và một gợi ý đã «bỏ qua» giao R, When nhịp nhắc chạy sau 08:30 giờ VN (`lenLichNhac` rồi `chayNhac`) với Zalo giả và Slack giả theo hợp đồng gửi tin thật, Then bộ gom của R có đúng một dòng `goi-y-ke-hoach` cho gợi ý «chờ», tin gửi R có tên công ty; When R mang vai `okr` (cài trực tiếp như dữ liệu cũ), Then không có dòng `goi-y-ke-hoach` và tin không chứa tên công ty — cùng luật lọc vai của `viec-chung` AC-8.
- AC-13: Given kho mẫu có đáp án biết trước — Việc sinh từ khuôn được người thực hiện chuyển đúng hạn, đúng ngày hạn lúc 23:00, trễ hạn, chưa chuyển; Việc khuôn hạn sau `--den` còn «Chưa làm» (không tính); Việc khuôn bị Huỷ do gỡ bước (không tính); Việc tạo tay (không tính); lần chuyển sang thắng của công ty không có kế hoạch mở có và không có gợi ý, một lần thua → thắng, một lần thắng → thắng ở cột khác (không tính), một deal bỏ qua rồi thắng lại có gợi ý mới; gợi ý xử lý trong 3 ngày, sau 3 ngày, chưa xử lý, When chạy thước `rang/do-nguong.mjs --tu --den` trên kho đó, Then JSON in đúng tổng, tỉ lệ vế (a), số deal thắng thiếu gợi ý và tỉ lệ xử lý vế (b); thoát 2 khi có deal thắng thiếu gợi ý; thước chạy trong giao dịch chỉ đọc.
- AC-14 (judgment): Given `CONTEXT.md`, `docs/api.md` và `docs/plan/lo-trinh-viec-du-an.json` sau vòng này, When người mới đọc, Then biết: bước của kế hoạch tạo sau DA3 là bản chiếu của một Việc (Việc là nguồn sự thật, ba thao tác bị chặn trên Việc của bước); «Gợi ý mở kế hoạch» là gì, sinh khi nào, ba trạng thái, ai xử lý; hai thủ tục mới; hàng DA3 ghi trạng thái mới và `chay_khi` của DA4 ghi điều kiện ngày bắt đầu đã thoả (chủ kho 14/10).
- AC-15: Given bộ kiểm hiện có của kho, When chạy các suite của `feature_loop.suite_keys` sau lượt này, Then mọi suite thoát 0, không `expect` nào bị xoá ở các tệp kiểm đã có, và `check-types` thoát 0.

## Coverage

Quét bằng `morphological-scan` (`morphological-scan.md`), preset `entity-feature`. Trục: vòng đời kế hoạch tạo
từ khuôn (tạo · Việc sinh ra · sửa · xong/huỷ/mở lại · thêm tay · đóng/mở · chuyển việc) × nguồn kích hoạt (danh
mục · sheet công ty · `setStage` · `bulkSetStage` · tạo thẳng ở thắng · lưu trữ giai đoạn · Tác nhân) × người và
quyền (người tạo · người làm · trưởng phòng · phòng không trưởng · vai «chỉ OKR» · người phụ trách deal · quản
trị) × thời gian (hạn từ ngày mốc · nhắc việc · nhắc gợi ý · quá 3 ngày · cửa sổ đo). Thước CE: mọi nơi gọi
`chuyenGiaiDoanTrongTx` và nhánh tạo deal [SUY-TỪ-REPO: apps/api/src/deals/deals.service.ts]; sáu lệnh ghi bước
[SUY-TỪ-REPO: apps/api/src/onboarding/onboarding.router.ts]; mẫu ngành Odoo activity plan, Salesforce Action
Plans, Pipedrive [NGÀNH: docs/plan/viec-du-an-nghien-cuu.md mục 3]. Core 1–8 → AC-1…AC-12; AC-13 là đường đo;
AC-14 tài liệu; AC-15 hồi quy. Later/Never ở Out of scope.

## Đường đo

- (a) ≥70% Việc sinh từ khuôn được người thực hiện chuyển khỏi «Chưa làm» trước hoặc trong ngày hạn (14 ngày đầu
  sau gộp; mẫu số: Việc nguồn `khuon` tạo trong cửa sổ, hạn ≤ ngày đọc, không Huỷ): số từ `rang/do-nguong.mjs`
  chạy chỉ đọc trên production — `viecKhuon.tiLe` · AC-1 bảo đảm vết nguồn `khuon`, AC-13 bảo đảm phép đếm.
- (b) Mọi lần chuyển sang thắng (từ mở hay thua) của deal mà công ty chưa có kế hoạch mở có gợi ý, ≥50% gợi ý
  được xử lý trong 3 ngày (đơn vị: lần chuyển, đọc từ dòng `STAGE_CHANGE`): số từ cùng thước — `dealThangThieuGoiY` (phải bằng 0) và `goiY.tiLeXuLy3Ngay` · AC-9 bảo đảm sinh, AC-10 bảo đảm giờ xử
  lý, AC-13 bảo đảm phép đếm.

## Out of scope

- Ngày bắt đầu cho bước hay cho Việc sinh từ khuôn — DA4 (Hỏi-2 ở Cổng Phạm vi).
- Chép bước của kế hoạch tạo trước lượt này sang Việc — hàng riêng, cổng riêng như DA1b.
- Gắn kế hoạch với deal để dự án đọc tệp và ghi chú của deal; khuôn theo loại deal; khuôn tự chọn theo loại đối tác.
- Bản bàn giao do AI viết khi deal thắng — thuộc tác tử (ghi chú hàng DA3).
- Tự mở kế hoạch khi deal thắng mà không hỏi người.
- Việc con và Kanban (DA2); dự án và Gantt (DA4).

## Notes

- Hỏi-1 (Cổng Phạm vi): bước là bản chiếu của Việc (khuyến nghị) hay Việc thay bước cho kế hoạch mới.
- Hỏi-2: ngày bắt đầu để DA4 (khuyến nghị) hay đưa vào DA3.
- Hỏi-3: gợi ý hiện ở thẻ đầu sheet deal + một dòng nhắc buổi sáng (khuyến nghị).
- Hỏi-4: đóng kế hoạch khi còn việc dở — hộp đóng hỏi, đánh dấu sẵn «Huỷ N việc còn mở» (khuyến nghị) hay để trống.
- Hỏi-5: bỏ design-pass, duyệt UI trên ảnh S4 (khuyến nghị) hay dựng bản mẫu trước Cổng Phạm vi.
