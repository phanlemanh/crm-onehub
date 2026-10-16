---
schema_version: 1
feature: "Deal thắng thì máy gợi ý mở kế hoạch onboard; người phụ trách mở hay bỏ qua ngay trên deal"
slug: goi-y-mo-ke-hoach
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, docs]
status: verified
approved_by: manh
approved_at: 2026-10-16T08:42:26Z
design_doc: docs/superpowers/specs/2026-10-16-goi-y-mo-ke-hoach-design.md
---

# Acceptance Contract: goi-y-mo-ke-hoach

## Context

Hàng DA3b của `docs/plan/lo-trinh-viec-du-an.json`, tách khỏi DA3 ngày 14/10 theo luật cỡ hợp đồng. Cổng Đáng ký
build 16/10/2026 (manh) với ngưỡng (b) đã ký ở DA3: mọi deal chuyển sang giai đoạn thắng của công ty chưa có kế hoạch
mở đều sinh một gợi ý, và ≥ 50 % gợi ý được xử lý (mở kế hoạch hoặc bỏ qua) trong 3 ngày; đọc sau 14 ngày dùng thật
kể từ ngày gộp. Hôm nay deal thắng không dẫn tới gì. Lượt này: một bản ghi **Gợi ý mở kế hoạch** sinh tất định ở
máy chủ, trong cùng giao dịch đổi giai đoạn; người phụ trách thấy nó trên sheet deal (và trong nhắc buổi sáng — Hỏi-1),
mở kế hoạch hay bỏ qua; tạo kế hoạch cho công ty bằng bất kỳ đường nào đóng gợi ý. Hạng T3 vì thêm bảng ở
`packages/db/prisma`.

Source input: hàng DA3b · `opportunity.md` (ngưỡng đã ký) · design doc DA3 mục 7 (ma trận nháp) · design doc DA3b.

## Criteria

- AC-1 (cross-layer): Given một công ty không có kế hoạch mở, deal của người phụ trách P và bốn giai đoạn (hai cột mở, một cột thắng W, một cột thua L), When chạy từng ô của ma trận viết trước 12 ô (đi: tạo mới · mở · thắng · thua × đến: mở · thắng · thua) qua `deals.setStage` (ô «tạo mới» qua `deals.create`), Then đúng ba ô — tạo mới→thắng, mở→thắng, thua→thắng — mỗi ô để đúng một Gợi ý mở kế hoạch trạng thái «chờ», người nhận P, cùng công ty, `chuyenLuc` bằng `occurredAt` của dòng `STAGE_CHANGE` của lần chuyển đó (ô tạo mới: bằng giờ tạo deal); chín ô còn lại không để gợi ý nào; When chuyển mở→thắng qua `deals.bulkSetStage` cho hai deal, Then mỗi deal có một gợi ý; When lưu trữ cột thắng W và dời deal sang cột thắng W2, Then không thêm gợi ý nào.
- AC-2 (cross-layer): Given deal D của AC-1 đã có gợi ý «chờ», When D chuyển thắng→mở→thắng, Then D vẫn chỉ có một gợi ý «chờ» (gợi ý cũ); Given gợi ý của D đã «bỏ qua», When D chuyển thắng→mở→thắng, Then D có thêm đúng một gợi ý «chờ» mới; Given công ty của deal E có một kế hoạch mở, When E chuyển mở→thắng, Then không có gợi ý nào, và khi kế hoạch ấy đã đóng thì lần chuyển kế có gợi ý; When hai lời gọi `setStage` mở→thắng trên cùng một deal chạy đồng thời, Then cơ sở dữ liệu có đúng một gợi ý «chờ» của deal ấy.
- AC-3 (cross-layer): Given gợi ý «chờ» G của người nhận P, When P gọi `onboarding.boQuaGoiY({ id: G })`, Then G sang «bỏ qua» với `xuLyLuc`, `xuLyBoiId = P`; When một quản trị bỏ qua một gợi ý «chờ» khác, Then nó sang «bỏ qua» với `xuLyBoiId` là quản trị; When người thứ ba vai `member` bỏ qua hay đọc `onboarding.goiYCuaDeal`, Then bỏ qua trả 403 FORBIDDEN và gợi ý không đổi, còn đọc trả `null`; When bỏ qua lại G đã «bỏ qua», Then trả 400 «Gợi ý này đã được xử lý.» và G không đổi.
- AC-4 (cross-layer): Given công ty C có hai deal thắng, mỗi deal một gợi ý «chờ», và một gợi ý «bỏ qua» cũ, When một người bất kỳ (không phải người nhận) tạo kế hoạch cho C qua `onboarding.createFromTemplate`, Then cả hai gợi ý «chờ» sang «đã mở» với `planId` của kế hoạch mới, `xuLyLuc`, `xuLyBoiId` là người tạo, còn gợi ý «bỏ qua» giữ nguyên; When tạo qua REST `POST /onboarding/plans`, Then kết quả như trên; When `createFromTemplate` thất bại (khuôn đã lưu trữ), Then không gợi ý nào đổi; gợi ý của công ty khác không đổi.
- AC-5: Given sheet deal dựng trong bài kiểm giao diện với dữ liệu giả, When `goiYCuaDeal` trả một gợi ý «chờ», Then đầu sheet có thẻ «Deal đã thắng — mở kế hoạch 30 ngày cho <công ty>?» với hai nút «Mở kế hoạch» và «Bỏ qua»; When `goiYCuaDeal` trả `null`, đang tải hay tải lỗi, Then không có thẻ và sheet vẫn hiện như hôm nay; When bấm «Mở kế hoạch», Then ô tạo kế hoạch mở với công ty của deal điền sẵn và khoá; When bấm «Bỏ qua», Then thẻ ẩn ngay và `boQuaGoiY` được gọi một lần với đúng id, còn khi lời gọi trả lỗi thì thẻ hiện lại kèm lời máy chủ; tệp giao diện mới hay sửa qua sàn thiết kế.
- AC-6 (cross-layer): Given app và API của chính cây đang chạy trên kho dùng-một-lần, người phụ trách P đăng nhập, When P chuyển một deal của công ty chưa có kế hoạch sang giai đoạn thắng rồi mở sheet deal, Then màn thật hiện thẻ gợi ý; When P bấm «Bỏ qua», Then thẻ mất trên màn và đọc lại cơ sở dữ liệu thấy gợi ý «bỏ qua»; When một người khác mở cùng sheet và thấy sheet đã tải, Then không có thẻ; thước màn phải đỏ trên trang đã gỡ thẻ, trang đã chèn thẻ giả cho người khác, và trang chèn lại thẻ sau «Bỏ qua».
- AC-7 (cross-layer): Given P có một gợi ý «chờ» của deal đang thắng, một gợi ý «chờ» của deal đã rời thắng, và một gợi ý đã «bỏ qua», When bộ gom nhắc buổi sáng chạy cửa sổ 09:00 giờ VN, Then bộ gom của P có đúng một mục loại `goi-y-ke-hoach` (của deal đang thắng) mang tên công ty và tên deal, và mục ấy thành một Thông báo của P; bộ gom của người khác không có mục nào loại đó; sau khi P bỏ qua gợi ý ấy, lượt gom kế không còn mục đó.
- AC-8: Given kho mẫu gieo qua đường ghi thật với đáp án viết trước — lần chuyển mở→thắng có gợi ý xử lý trong 1 ngày, thua→thắng có gợi ý xử lý sau 4 ngày, deal tạo thẳng ở thắng, lần chuyển thắng→thắng (không tính), lần chuyển khi công ty có kế hoạch mở (không tính), gợi ý sinh chưa tới 3 ngày trước `--den` (chưa phán), When chạy `rang/do-nguong.mjs --tu --den`, Then JSON in đúng số lần chuyển, `dealThangThieuGoiY`, số gợi ý xử lý kịp và tỉ lệ; khi xoá gợi ý của một lần chuyển trong bản sao kho thì `dealThangThieuGoiY` = 1 và thoát 2; khi tỉ lệ dưới 0,5 thì thoát 2; khi cửa sổ không có lần chuyển nào, không gợi ý nào đã đủ 3 ngày để phán, hay thiếu đối số thì thoát 3 (không đo được, không phải sống); mẫu số không đọc từ bảng gợi ý; thước chạy trong giao dịch chỉ đọc.
- AC-9 (judgment): Given `CONTEXT.md`, `docs/api.md` và `docs/plan/lo-trinh-viec-du-an.json` sau vòng này, When người mới đọc, Then biết: Gợi ý mở kế hoạch là gì và khác «Gợi ý» của nhắc kế hoạch im ra sao; khi nào máy sinh nó (lần chuyển sang thắng, công ty chưa có kế hoạch mở, deal chưa có gợi ý chờ); ba kết cục và ai xử lý được; tạo kế hoạch bằng đường nào cũng đóng gợi ý; hai thủ tục mới của router onboarding; và hàng DA3b không còn «chưa mở».
- AC-10: Given bộ kiểm hiện có của kho, When chạy các suite của `feature_loop.suite_keys` sau lượt này, Then mọi suite thoát 0, không `expect` nào bị xoá hay sửa ở các tệp kiểm đã có, và `check-types` thoát 0.

## Vòng đời (ba câu của `docs/vong-doi.md`)

1. Dọn thế nào: kết cục nghiệp vụ — «đã mở kế hoạch» hay «đã bỏ qua»; không Xoá, không Lưu trữ.
2. «Lịch sử»: mọi gợi ý có lịch sử từ lúc sinh — nó là vật đếm của ngưỡng đã ký; không có nút Xoá.
3. Danh sách mặc định: không có danh sách gợi ý; thẻ trên sheet deal chỉ hiện gợi ý «chờ» của deal đang thắng; gợi ý đã bỏ qua không mở lại được.

## Coverage

Quét `morphological-scan.md` (preset entity-feature), bốn trục:
- Đường ghi giai đoạn (`setStage` · `bulkSetStage` · lưu trữ giai đoạn · tạo deal ở thắng) — thước: quét mọi chỗ ghi `deal.stage` trong `apps/api` và `apps/agent` → AC-1.
- Cặp loại giai đoạn đi → đến, 12 ô — thước: `LoaiGiaiDoan` có đúng ba giá trị → AC-1.
- Điều kiện chặn (không · kế hoạch mở · gợi ý chờ · gợi ý đã xử lý · đồng thời) — thước: câu ngưỡng đã ký → AC-2.
- Vòng đời × người (tạo từ thẻ · tạo đường khác · bỏ qua người nhận · quản trị · người khác · bấm lại · deal rời thắng) — thước: mục 5 design doc, `docs/vong-doi.md` → AC-3, AC-4, AC-5, AC-7.
- Kênh hiện (thẻ, nhắc buổi sáng/chuông) và thước ngưỡng → AC-5, AC-6, AC-7, AC-8.
- Chân ngành: Pipedrive Projects, HubSpot Workflows (cò «deal thắng» cho khâu bàn giao) — dùng để cắt «tự tạo kế hoạch không hỏi» sang Later.

## Đường đo

- «Mọi lần chuyển sang thắng đủ điều kiện đều có gợi ý»: `dealThangThieuGoiY` của `rang/do-nguong.mjs`, mẫu số từ dòng `STAGE_CHANGE` và giai đoạn đầu của deal tạo mới, không từ bảng gợi ý — AC-8 bảo đảm thước, AC-1/AC-2 bảo đảm vật.
- «≥ 50 % gợi ý xử lý trong 3 ngày»: tỉ lệ `xuLyLuc − sinhLuc ≤ 3 ngày` của cùng thước — AC-8; `xuLyLuc` ghi bởi AC-3 (bỏ qua) và AC-4 (mở kế hoạch).
- Đọc sau 14 ngày dùng thật kể từ ngày DA3b gộp, ở phiên nghiệm thu — không phải cổng của việc dựng.

## Out of scope

- Bản bàn giao do AI viết khi deal thắng — thuộc tác tử, hàng khác.
- Sinh gợi ý cho deal đã thắng trước lượt này (không chạy lùi).
- Mở lại gợi ý đã bỏ qua; danh sách «gợi ý của tôi».
- Tự tạo kế hoạch khi deal thắng mà không hỏi người.
- Đổi người nhận gợi ý khi deal đổi người phụ trách sau lúc sinh.
- Thêm dữ liệu gợi ý vào `bun run db:seed`.

## Notes

- Deal rời thắng khi gợi ý còn «chờ»: gợi ý giữ «chờ» nhưng ẩn ở thẻ và nhắc; phép đo đếm nó là chưa xử lý (bi quan).
- Thước «có kế hoạch mở lúc t» đọc `closedAt` hiện tại; kế hoạch đã đóng rồi mở lại có thể làm đếm thiếu một lần chuyển xảy ra lúc nó đang đóng.
