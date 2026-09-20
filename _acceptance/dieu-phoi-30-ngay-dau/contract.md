---
schema_version: 1
feature: Cả đội điều phối 30 ngày đầu của đối tác mới ngay trong CRM, thôi dùng Google Sheet và giấy tờ tay
slug: dieu-phoi-30-ngay-dau
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, config, docs]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-09-20-dieu-phoi-30-ngay-dau-design.md
---

# Acceptance Contract: dieu-phoi-30-ngay-dau

## Context

Ký xong với một đối tác là hết phần dễ: ba mươi ngày đầu huy động nhiều bộ phận
của OneHub — đào tạo, chính sách nền tảng, chuyển dữ liệu — và việc điều phối
quãng đó hôm nay sống trong một Google Sheet **một dòng một việc**. Vòng này đưa
nó vào CRM: khuôn kế hoạch theo loại đối tác, kế hoạch treo vào Công ty, bước
mang bộ phận và người được giao, cộng một phễu bốn bậc cho từng môi giới đã sẵn
đường nhận số từ nền tảng OneHub.

Người dùng là **nhân viên OneHub** — nội bộ, nhưng là người dùng cuối thật.
Thành công là cả đội nghiệm thu và dùng được thay Sheet; hiệu quả kinh doanh
owner đo riêng, ngoài vòng này.

Source input: `_acceptance/dieu-phoi-30-ngay-dau/opportunity.md` (ký Cổng Đáng 2026-09-19)

## Criteria

- AC-1: Given một khuôn khai ba bước và một kế hoạch đã tạo từ khuôn đó, When người sửa nhãn một bước TRONG KHUÔN, Then bước của kế hoạch đã tạo giữ nguyên nhãn cũ — bước được chép, không tham chiếu.
- AC-2: Given một khuôn khai bước có bộ phận nhưng không khai người, When tạo kế hoạch từ khuôn, Then bước sinh ra mang bộ phận và KHÔNG có người được giao, và vẫn đọc được khi lọc theo bộ phận đó.
- AC-3: Given hai kế hoạch thuộc hai bộ phận khác nhau, When mở màn danh mục với bộ lọc bộ phận nằm trong query param, Then chỉ kế hoạch khớp hiện ra, và mỗi hàng mang số ngày kể từ lần đổi gần nhất. (cross-layer)
- AC-4: Given một ghi danh chưa có mốc bậc nào, When đánh dấu bậc «có tài khoản», Then bản ghi lưu một MỐC THỜI GIAN chứ không phải cờ đúng/sai, và đọc lại từ cơ sở dữ liệu thấy đúng mốc đó.
- AC-5: Given điểm nhận đã khai khoá, When gửi một lô mà MỘT mục sai khuôn, Then trả 400, KHÔNG mục nào trong lô được ghi, và thông điệp nêu tên trường hỏng.
- AC-6: Given một mục mang mã nền tảng không khớp cá nhân nào, When gửi lô, Then không ghi danh nào được tạo cho mục đó, một hàng `AgentTask` được ghi, và phản hồi đếm nó vào số chuyển cho tác nhân. (cross-layer)
- AC-7: Given `ONEHUB_PLATFORM_INGEST_SECRET` chưa khai, When gọi điểm nhận, Then trả 503 và tiến trình không ném.
- AC-8: Given một bộ phận đang được vài bước dùng, When đổi tên bộ phận, Then mọi bước đó vẫn trỏ đúng bộ phận và hiện tên mới — không bước nào mất bộ phận.
- AC-9: Given chưa có khuôn nào trong hệ thống, When mở màn danh mục, Then màn nói rõ chưa có khuôn nào và cho đường dẫn sang Cài đặt › Khuôn, thay vì chỉ nói «chưa có kế hoạch». (cross-layer)
- AC-10: Given mã nguồn của module điều phối, When quét, Then số 30 và ngưỡng nguội KHÔNG xuất hiện ghim trực tiếp ở bất kỳ file nào ngoài `onboarding-config.ts`.
- AC-11: Given một kế hoạch có bước quá hạn chưa xong, When chụp màn danh mục, Then nhìn thấy được hàng của kế hoạch đó cùng bậc đang tắc và số ngày im.
- AC-12: Given một ghi danh đang có, When người bấm xoá, Then phải qua một bước xác nhận trước khi hàng bị xoá thật.
- AC-13: Given một kế hoạch còn hai bước chưa xong, When đóng kế hoạch, Then thao tác thành công, ngày đóng được ghi, hai bước dở giữ nguyên trạng thái chưa xong, và kế hoạch đó KHÔNG còn trong danh mục mặc định.
- AC-14: Given người tạo kế hoạch từ khuôn, When lưu, Then kế hoạch mang người cầm trịch khác rỗng trỏ đúng người đã chọn; gọi thủ tục tạo mà không truyền người cầm trịch thì bị từ chối, không sinh hàng nửa vời.

## Coverage

Quét bằng skill `morphological-scan` ngày 2026-09-20; bản đầy đủ ở
`_acceptance/dieu-phoi-30-ngay-dau/morphological-scan.md` — 4 trục, 47 ô, cắt còn
8 ô Core (17%).

- Trục A — việc phần mềm làm: định nghĩa & khuôn | điều phối & giao việc | nhìn & báo | phát hiện & cảnh báo | đào tạo & năng lực | trao đổi với đối tác | chi phí & nguồn lực [thước CE: đối chiếu năng lực đã xác minh của 5 sản phẩm chân ngành — GUIDEcx · Rocketlane · Dock · Gainsight CS · Salesforce PRM/PartnerStack, đọc trang sản phẩm 2026-09-19]
- Trục B — ai đứng trong đó: nhân viên quan hệ đối tác | bộ phận chuyên môn | quản lý | người của công ty đối tác | môi giới cá nhân [thước CE: từ điển sản phẩm `CONTEXT.md` + lời owner về các bộ phận cùng vào 30 ngày]
- Trục C — sự thật đi vào bằng đường nào: người gõ tay | biểu mẫu đối tác điền | nối máy tới hệ khác | bộ cào ngoài | suy từ chính CRM [thước CE: bốn bậc của cái thang trong `opportunity.md` + `docs/guides/goi-moi-gioi-trong-crm.md`]
- Trục D — nhịp thời gian: một lần lúc bắt đầu | liên tục trong 30 ngày | tại mốc | sau 30 ngày [thước CE: preset entity-feature, trục Thời gian]
- Giới hạn đã khai của bản quét: chưa teardown thật sản phẩm chân ngành (chỉ đọc trang sản phẩm chính chủ); và một lỗ của chính bản quét — trục Actor có trong khung nhưng lần quét đầu chưa dùng nó để soi QUYỀN, nên lỗ phân quyền sửa trường lọt lưới và nay là ô riêng `chi-quan-tri-sua-duoc-truong`.

## Đường đo

- Thước: đối tác ký mới được điều phối trọn vẹn trong CRM · số từ: đếm kế hoạch có bước và có người cầm trịch, truy vấn trên `OnboardingPlan` · bảo đảm bởi: AC-1, AC-2, AC-14
- Thước: Sheet điều phối cũ không còn lần cập nhật nào trong hai tuần cuối kỳ · số từ: lịch sử sửa của chính Google Sheet, NGOÀI sản phẩm · bảo đảm bởi: đã có sẵn: lịch sử sửa của Google Sheet — không cần code, nhưng cần xin quyền xem trước phiên nghiệm thu
- Thước: mỗi bộ phận chấm kín «dùng được thay Sheet» không dưới 4/5 · số từ: phiếu chấm kín tại phiên nghiệm thu, trước thảo luận · bảo đảm bởi: đã có sẵn: nghi thức phiên nghiệm thu — không cần code
- Thước: thời gian trả lời câu «đối tác X đang tắc ở bậc nào» · số từ: bấm đồng hồ tại phiên nghiệm thu trên màn danh mục · bảo đảm bởi: AC-3, AC-11, AC-13

## Out of scope

- Cổng cho chính đối tác nhìn vào tiến độ — ứng viên số một vòng hai; mở CRM nội bộ cho người ngoài là đổi mô hình quyền, không phải thêm một màn.
- Loại bản ghi cho trường tự tạo (`FieldDefinition.recordTypeId`) — chỗ co giãn theo loại đối tác đặt ở **khuôn kế hoạch**, không ở danh sách trường; thêm loại bản ghi lúc mới có một loại đối tác mua được số không mà phải migrate ràng buộc `@@unique([entity, key])`.
- Vá lỗ quyền sửa trường tự tạo — ô riêng `chi-quan-tri-sua-duoc-truong`; chạm `packages/auth`, trộn vào đây làm cả hai chậm.
- Chốt nghĩa `DealStage` — bước của kế hoạch KHÔNG phải giai đoạn thoả thuận; vòng này cố ý không đọc enum đó.
- `Activity.assigneeId` — thiếu sót chung của CRM nhưng thiết kế này không cần: nếp `CampaignTouch` cho thấy bảng nghiệp vụ tự mang trường của nó rồi nối sang `Activity` khi cần.
- Nối thật với nền tảng OneHub — vòng này viết schema và điểm nhận, chưa có bên gửi; nối thật phụ thuộc một đội ngoài vòng lặp.
- Điểm sức khoẻ tổng hợp, dự báo ngày hoàn thành, bậc phục vụ theo cỡ đối tác — chờ có nhiều hơn một tín hiệu máy.
- Đo hiệu quả kinh doanh (tỉ lệ môi giới hoạt động được) — owner chốt 2026-09-19 đo riêng, cố ý.

## Notes

- **Một chỗ vênh giữa tài liệu và mã, vòng này sửa:** `docs/api.md` để tiêu đề mục «tRPC is the data surface; REST is auth and health only», nhưng `ListingsController` đang là REST nhận dữ liệu và không được ghi là ngoại lệ. Vòng này đi theo tiền lệ đã có VÀ cập nhật `docs/api.md` để khai hạng mục «điểm nhận nội bộ» cho cả hai controller.
- **Luật kho đẩy thiết kế sang phía đúng hơn:** ý ban đầu là một «điểm sức khoẻ»; `docs/api.md` cấm API `score`, nên thay bằng số ngày kể từ lần đổi gần nhất — truy được về sự thật thay vì một điểm không ai giải thích nổi.
- **Khớp danh tính:** `docs/api.md` cấm API khớp danh tính. Điểm nhận khớp CHỈ bằng mã nền tảng đúng từng ký tự, giữ trong một trường tự tạo trên Cá nhân — cùng cơ chế `listing-ingest` đang dùng. Không khớp thì viết `AgentTask`, không đoán.
- **Phụ thuộc phải gỡ sớm:** quyền xem lịch sử sửa của Google Sheet. Thiếu nó thì thước thứ hai của Đường đo không đo được, và biết muộn thì đã quá muộn để đổi phép đo.
- Skill chuẩn giao diện repo khai (`feature_loop.ui_standards_skill: web-design-guidelines`) là một skill **rà soát mã UI đã có**, không phải chuẩn để thiết kế trước. Vòng này lấy thẳng nguồn nó trỏ tới (Web Interface Guidelines) làm chuẩn thiết kế, và để skill đó cho bước rà soát ở S3/S4.
- **Một căng thẳng phải nói ra tại cổng, không giấu:** E11 là eval `ui-check` khai `layer: ui-observed` — nghĩa vụ hợp đồng cho mặt người nhìn. Nhưng làn máy gom eval theo `test`/`script`, nên `ui-check` **bị làn bỏ qua**: vòng `vao-bang-email-va-mat-khau` tuần trước đã phải đổi ba eval màn hình sang `executor: test` vì đúng lý do này (`d-20260919T130308Z-20`). Vòng này GIỮ `ui-check` và nêu căng thẳng lên thẻ để người ký quyết, thay vì tự đổi nhà rồi im.
