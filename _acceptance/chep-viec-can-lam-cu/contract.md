---
schema_version: 1
feature: "Việc cần làm cũ trên dòng thời gian thành Việc; Tác nhân giao việc bằng Việc"
slug: chep-viec-can-lam-cu
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, docs]
status: implemented
approved_by: manh
approved_at: 2026-10-13T23:18:51Z
design_doc: docs/superpowers/specs/2026-10-13-chep-viec-can-lam-cu-design.md
---

# Acceptance Contract: chep-viec-can-lam-cu

## Context

Hàng DA1b của `docs/plan/lo-trinh-viec-du-an.json`, tách khỏi DA1 ở Cổng Phạm vi 13/10; chủ kho ký Cổng Đáng
13/10 (build). Từ DA1 kho có hai loại việc: Việc, và việc cần làm cũ (hàng `activity` loại `TASK`) không người
thực hiện, ai cũng tích xong được. Lượt này chép mọi việc cần làm cũ thành Việc mà giữ nguyên hàng gốc, đổi ba
đường còn ghi `TASK` (API, Tác nhân tự dựng, ma-lech) sang Việc, và thôi hiện việc cần làm đã chép. Hạng T3 vì
thêm cột ở `packages/db/prisma` và sửa dữ liệu production.

Source input: hàng DA1b · `opportunity.md` (ngưỡng đã ký) · mục «Việc» của `CONTEXT.md` · hồ sơ DA1
`_acceptance/viec-chung/` · design doc.

## Criteria

- AC-1 (cross-layer): Given trên kho thử có việc cần làm cũ gắn đủ mọi kiểu — mở có hạn gắn thoả thuận và công ty, đã xong gắn cá nhân, gắn kế hoạch 30 ngày, không tiêu đề chỉ có nội dung, cả tiêu đề lẫn nội dung trống, do Tác nhân tạo, do ma-lech tạo — When chạy `bun run viec:chep-cu --chay --nguoi <quản trị>`, Then mỗi việc cần làm có đúng một Việc với `activityGocId` trỏ nó, tiêu đề, mô tả, hạn (ngày lịch giờ VN của hạn cũ, lưu ở nửa đêm UTC — việc cũ có hạn lưu 17:00Z hôm trước ra đúng ngày VN), trạng thái (mở → Chưa làm; đã xong → Xong, `khepLuc` = lúc xong), người giao = người thực hiện = người tạo, lúc tạo, các hàng gắn và `khoaNguon` theo bảng của design doc, đúng một vết «tao» nguồn `chep-cu` mang `activityGocId`; mọi cột của hàng `activity` gốc không đổi một byte; không Việc nào khác được tạo.
- AC-2: Given kho của AC-1 đã chép, When chạy `--chay` lần hai, Then không Việc mới nào và bản in nói 0 việc chép; Given hàm chép một việc ném lỗi ở việc giữa danh sách, When chạy chép, Then các việc khác vẫn được chép, việc hỏng không có Việc nào, kết quả nêu mã và lý do của nó, và lần chạy sau chép được nó khi hết lỗi; When chạy thử (`--chay --thu`), Then bản in có đúng danh sách lỗi đó và không hàng nào đổi; When hai lần chép chạy cùng lúc trên một việc, Then vẫn đúng một Việc.
- AC-3: Given ma trận việc cần làm {đang mở, đã xong} × {gắn thoả thuận, chỉ gắn kế hoạch, không gắn gì} × {người tạo vai `member`, vai «chỉ OKR», đã rời tổ chức}, When chạy `--chay --nguoi Q` với Q là quản trị, Then mọi ô có đúng một Việc; việc đang mở của người tạo không còn nhận được việc có người giao và người thực hiện là Q, vết «tao» ghi `nguoiTaoGoc` là người tạo cũ; mọi ô còn lại giữ người tạo cũ; When `--nguoi` vắng hay không phải quản trị, Then lệnh từ chối trước khi ghi bất cứ gì.
- AC-4: Given kho đã chép có một bản chép chưa đổi gì và một bản chép mà người thực hiện đã chuyển sang Đang làm, When chạy `--dao`, Then bản chưa đổi mất cùng vết và hàng gắn, Việc không phải bản chép không bị đụng, bản đã đổi còn và bản in nêu nó; When chạy `--dao --ca-ban-da-doi`, Then bản đã đổi cũng mất; sau đảo hàng `activity` gốc không đổi và hiện lại trên dòng thời gian như việc chưa chép.
- AC-5 (cross-layer): Given một thoả thuận có một việc cần làm đã chép, một việc cần làm chưa chép và một ghi chú, When mở dòng thời gian của thoả thuận, Then thẻ «Tất cả» có ghi chú và việc chưa chép (chỉ đọc: tiêu đề, hạn, không ô tích) mà không có việc đã chép; thanh thẻ không còn «Sắp tới» và «Đã xong», số đếm thẻ không đếm việc đã chép; khối «Việc» đầu thẻ có Việc chép; When đường dẫn mang `?tab=upcoming`, Then màn hiện thẻ «Tất cả».
- AC-6: Given phiên một thành viên, When gọi `activities.create` với loại `TASK`, Then trả 400 và không hàng nào được ghi; When gọi `activities.complete` hay `activities.myTasks`, Then thủ tục không tồn tại; When quét mã ngoài thư mục test, Then không chỗ nào ghi `activity` loại `TASK` và mọi chỗ còn nhắc loại ấy nằm trong ma trận của design doc; When mở Tổng quan, Then khối «Việc quá hạn» có Việc quá hạn và việc cần làm cũ quá hạn CHƯA chép, chỉ đọc, không có việc cần làm đã chép, và `quaHan.viec` đếm đúng tập ấy.
- AC-7 (cross-layer): Given một Tác nhân tự dựng có quyền `crm.activity.create` loại `TASK` và người khởi chạy U vai `member`, When lượt chạy gọi `create_crm_activity` loại `TASK` trên một thoả thuận với tiêu đề và hạn, Then có đúng một Việc người giao và người thực hiện U, gắn thoả thuận, hạn là ngày lịch giờ VN của hạn được gửi, lưu ở nửa đêm UTC (gửi «nửa đêm giờ VN» thì ra đúng ngày đó), vết «tao» nguồn `tac-nhan`, hành động ghi `externalId` là mã Việc, và không hàng `activity` loại `TASK` nào; When cùng lời gọi lặp lại (cùng mã lời gọi), Then vẫn một Việc; When U mang vai «chỉ OKR», Then hành động thất bại với lời có «chỉ OKR» và không gì được ghi; When bản khai cũ của Tác nhân ghi `activityTypes: ["NOTE","TASK"]`, Then bản khai vẫn đọc được.
- AC-8 (cross-layer): Given một kế hoạch 30 ngày có người cầm trịch P và một mã môi giới chưa ai mang, When việc `onboarding-identify` chạy, Then có đúng một Việc người giao và người thực hiện P, gắn kế hoạch, hạn là ngày hôm nay giờ VN lưu ở nửa đêm UTC, `khoaNguon` `ma-lech:<mã>`, không hàng `activity` loại `TASK` nào; When chạy lại cùng mã khi Việc còn mở, hay khi chỉ có việc cần làm cũ cùng mã đang mở chưa chép, Then không giao thêm (kết quả «không giao trùng»); When Việc đã Xong, Then lần chạy sau giao một Việc mới.
- AC-9 (cross-layer): Given người A tạo một việc cần làm cũ quá hạn gắn thoả thuận D và đã chép, When A mở Việc của tôi, khối «Việc» của D và Tổng quan, và nhịp nhắc chạy sau 08:30 giờ VN, Then Việc chép hiện đúng một lần ở nhóm «Giao cho tôi», ở khối của D, ở «Việc quá hạn», và tin nhắc của A có dòng `viec-qua-han` của nó; không chỗ nào hiện cùng lúc dòng việc cần làm gốc.
- AC-10: Given kho có việc cần làm, When chạy `bun run viec:chep-cu` không cờ, Then bản in có `taskTong`, `taskMo`, `taskXong`, `daChep`, `chuaChep`, `banChep`, `banChepDaDoi`, `nguoiTaoKhongNhan` đúng số biết trước và không hàng nào đổi (lệnh chạy trong giao dịch chỉ đọc); When thêm `--tu <ISO>`, Then `taskTaoSau` đếm đúng việc cần làm tạo sau mốc; When chạy `--chay --nguoi <email quản trị>`, Then bản in có `truoc`, `chep`, `loi`, `sau` đúng đáp án và `sau.banChep` = `truoc.taskTong`; When `--nguoi` vắng hay là email một thành viên thường, Then thoát khác 0 với lời có «quản trị» và không hàng nào đổi; When chạy `--dao` và `--dao --ca-ban-da-doi`, Then bản in nêu đúng số đã xoá và số giữ lại; When `DATABASE_URL` không phải máy cục bộ và thiếu `ALLOW_REMOTE_DB=1`, Then `--chay` và `--dao` từ chối trước khi ghi, còn đếm vẫn chạy; When có `ALLOW_REMOTE_DB=1`, Then bộ chặn để lệnh đi tiếp; When `bun run db:seed` chạy, Then không việc cần làm nào được gieo.
- AC-11 (ui-observed): Given bản chạy thật với dữ liệu mẫu đã chép, When mở khung một thoả thuận ở khổ 1280 và 375, Then thanh thẻ của thẻ Hoạt động không có «Sắp tới» và «Đã xong», không dòng việc cần làm nào có ô tích, Việc chép hiện trong khối «Việc» đầu thẻ; ở 375 không có thanh cuộn ngang.
- AC-12 (judgment): Given `CONTEXT.md`, `docs/api.md`, `docs/agent.md`, `docs/production.md` sau vòng này, When người mới đọc, Then biết: việc cần làm cũ đã thành Việc và bản gốc còn để đảo; cách chạy đếm, chép, đảo trên production và đọc hai vế ngưỡng; `activities.create` không nhận `TASK`, `complete` và `myTasks` đã bỏ; Tác nhân giao Việc qua `crm.activity.create` loại `TASK` và ma-lech giao Việc cho người cầm trịch; thứ tự lên (đợi migration của api xong rồi mới chép) và thứ tự lùi (chạy đảo TRƯỚC khi lùi mã, vì lùi mã khi bản chép còn làm một việc hiện hai lần).

## Coverage

Quét bằng `morphological-scan` (`coverage-scan.md`), preset `entity-feature` ghép `risk-premortem`. Trục: vật
đem chép (mở · xong · của Tác nhân · của ma-lech · người tạo không nhận được việc · đã chép · kiểu gắn) × thao
tác (đếm · chép · chép lại · hỏng giữa chừng · đảo · tạo mới sau chép qua API, Tác nhân, ma-lech, bộ gieo) ×
nơi hiện (dòng thời gian · khối Việc · Việc của tôi · Tổng quan · nhắc) × kiểu hỏng (sai · trùng · mất · lọt
quyền · chết). Thước CE: cột của `Activity` và bốn đường ghi `TASK` đếm ở S0 [SUY-TỪ-REPO:
packages/db/prisma/schema.prisma]; mọi nơi đọc `ActivityType.TASK` theo `git grep` [SUY-TỪ-REPO:
apps/api/src/activities/activities.service.ts]; Salesforce, Odoo coi việc là bản ghi có người sở hữu [NGÀNH:
docs/plan/viec-du-an-nghien-cuu.md mục 3]; dời dữ liệu kiểu mở rộng → dời → thu hẹp [NGÀNH: Parallel Change,
martinfowler.com]. Core → AC-1…AC-11; AC-10 là đường đo; AC-12 tài liệu.

## Đường đo

- Lần chép lệch 0 và giữ đủ bản gốc: `bun run viec:chep-cu` chạy trên production trước và sau `--chay` —
  `banChep` sau = `taskTong` trước, `taskTong` sau = `taskTong` trước · AC-1, AC-2 bảo đảm chép đủ và không
  nhân bản, AC-10 bảo đảm lệnh đếm đếm đúng và không ghi.
- 0 việc cần làm mới trong 14 ngày sau gộp: `bun run viec:chep-cu --tu <ngày gộp>`, `taskTaoSau` · AC-6, AC-7,
  AC-8, AC-10 bảo đảm không đường nào còn ghi `TASK`, AC-10 bảo đảm thước đếm được.

## Out of scope

- Xoá loại `TASK` và các hàng gốc — hàng lộ trình sau, khi vế 14 ngày của ngưỡng đã đọc.
- Ô người thực hiện cho công cụ `create_crm_activity` của Tác nhân; Tác nhân đọc Việc khi tóm tắt lịch sử bản
  ghi (`accounts.ts` vẫn đọc việc cần làm gốc); nhãn tiếng Anh «Create tasks on CRM records» của bộ dựng.
- «Chuyển việc 30 ngày» không làm mới Việc (hạt giống `docs/plan/2026-10-13-hat-giong-chuyen-viec-lam-moi-viec.md`).
- Chạy lệnh chép trên production — việc của chủ kho sau khi gộp (Hỏi-1); vòng này dựng lệnh và đo nó trên kho
  thử.

## Notes

- Ba câu vòng đời (`docs/vong-doi.md`): Việc chép theo luật của Việc (Xoá khi chưa có lịch sử, còn lại khép bằng
  Xong hay Huỷ); việc cần làm cũ không còn nút nào, chỉ đọc tới khi được chép; danh sách mặc định không đổi so
  với DA1.
- Câu chỉ người có (Hỏi-1…Hỏi-6) nằm ở sổ quyết định; hợp đồng này soạn theo khuyến nghị của máy.
- Nâng phạm vi sau S4 lượt 1 (manh, 2026-10-13): AC-1, AC-7, AC-8 thêm luật hạn theo ngày lịch giờ VN lưu ở nửa đêm UTC — việc cần làm cũ (ô soạn cũ và ma-lech cũ) lưu hạn ở nửa đêm giờ VN, chép nguyên sẽ lệch sớm một ngày.
