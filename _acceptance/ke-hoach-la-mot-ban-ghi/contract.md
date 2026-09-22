---
schema_version: 1
feature: Kế hoạch 30 ngày là một bản ghi làm việc được — mở như thoả thuận, giao bước, đánh dấu xong, đổi cầm trịch, ghi chú, và mọi thay đổi để lại vết
slug: ke-hoach-la-mot-ban-ghi
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, docs]
status: draft
design_doc: docs/superpowers/specs/2026-09-22-ke-hoach-la-mot-ban-ghi-design.md
approved_by:
approved_at:
---

# Acceptance Contract: ke-hoach-la-mot-ban-ghi

## Context

Vòng một đưa khuôn, danh mục, hồ sơ và phễu vào CRM, nhưng sau khi tạo kế hoạch
thì không thủ tục nào ghi vào bước: không giao người, không đánh dấu xong, không
sửa hạn. Ba cột danh mục vì thế chết trên production, và hồ sơ là một trang
riêng khác họ record sheet của Công ty · Cá nhân · Thoả thuận. Vòng này cho kế
hoạch **tay**: mở như mở thoả thuận, làm việc trên từng bước, và mọi thay đổi để
lại vết đọc được. Người dùng là nhân viên OneHub — quan hệ đối tác và các bộ
phận chuyên môn.

Source input: `_acceptance/ke-hoach-la-mot-ban-ghi/opportunity.md` (ký Cổng Đáng
2026-09-22) · lộ trình `docs/plan/lo-trinh-dieu-phoi-30-ngay.md` mục 4, lượt 1.

## Criteria

- AC-1: Given một kế hoạch đang chạy có một bước chưa giao, When giao bước đó cho một thành viên, Then đọc lại từ cơ sở dữ liệu thấy bước mang đúng người đó, `updatedAt` của bước đổi, và đúng một `Activity` kiểu `PLAN_CHANGE` được ghi với `kind` `buoc.giao` mang người cũ (rỗng) và người mới.
- AC-2: Given một kế hoạch bốn bước chưa bước nào xong và bước gần nhất đã đứng yên năm ngày, When đánh dấu một bước xong, Then `completedAt` của bước được ghi, và màn danh mục trả về hàng của kế hoạch đó với Bước `1/4` và Im lặng bằng 0. (cross-layer)
- AC-3: Given một bước hạn 22/09, When đổi hạn sang 25/09, Then đọc lại thấy hạn 25/09, và vết `buoc.doiHan` mang hạn cũ và hạn mới dạng ngày.
- AC-4: Given một kế hoạch ba bước, When thêm một bước rồi bỏ một bước khác, Then đọc lại thấy đúng tập bước sau hai thao tác, và mỗi thao tác sinh đúng một vết (`buoc.them`, `buoc.bo`) mang nhãn bước.
- AC-5: Given một kế hoạch ba bước, When sắp lại thứ tự với một tập id thiếu một bước hoặc lẫn một bước của kế hoạch khác, Then thủ tục trả 400 và thứ tự trong cơ sở dữ liệu không đổi; với đúng tập id thì thứ tự mới được lưu.
- AC-6: Given một kế hoạch, When đổi người cầm trịch, Then đọc lại thấy người mới, vết `keHoach.doiCamTrich` mang `companyId` của kế hoạch, và không vết `buoc.*` nào của kế hoạch mang `companyId`.
- AC-7: Given một bước đã giao cho A và đã xong, When giao lại cho A, và đánh dấu xong lần nữa, Then cả hai lời gọi thành công, không `Activity` nào được ghi thêm, và `updatedAt` của bước giữ nguyên.
- AC-8: Given một kế hoạch đã đóng, When gọi bất kỳ thủ tục ghi bước nào hoặc đổi người cầm trịch, Then mỗi lời gọi trả 409 với thông điệp «Kế hoạch đã đóng — mở lại trước khi sửa.», và không bước, vết hay người cầm trịch nào đổi.
- AC-9: Given một kế hoạch của công ty One Mount, When tạo một ghi chú chỉ truyền `planId`, Then ghi chú được lưu kèm `companyId` của One Mount, và hiện ở cả dòng thời gian của kế hoạch lẫn dòng thời gian của công ty. (cross-layer)
- AC-10: Given một công ty có kế hoạch với vết và ghi chú, When xoá công ty, Then mọi `Activity` mang `planId` của kế hoạch đó bị xoá theo, và `lastActivityAt` của các bản ghi còn lại mà lệnh xoá chạm tới không trỏ vào một hàng đã mất.
- AC-11: Given màn danh mục 30 ngày, When bấm hàng của một kế hoạch, Then đường dẫn mang `record=plan:<id>`, sheet kế hoạch mở với bảng danh mục vẫn còn phía sau; mở đường cũ `/onboarding/<id>` thì được chuyển hướng về đúng đường đó; bấm tên công ty trên sheet thì sheet công ty mở chồng lên. (cross-layer)
- AC-12: Given tab Môi giới có hai người, When bấm gỡ ở hàng thứ hai và xác nhận, Then thủ tục gỡ nhận đúng id người thứ hai, hộp xác nhận nêu tên người thứ hai, và người thứ nhất còn nguyên. (cross-layer)
- AC-13: Given hôm nay là một ngày D, When tính «quá hạn» cho ba bước chưa xong hạn D−1, D và D+1, Then chỉ bước hạn D−1 là quá hạn.
- AC-14: Given dòng thời gian của kế hoạch có một vết `PLAN_CHANGE` và dòng thời gian của một thoả thuận có một `STAGE_CHANGE`, When vẽ cả hai, Then vết kế hoạch hiện thành câu tiếng Việt đọc được («<người> đánh dấu «<bước>» xong»), còn dòng thoả thuận vẫn hiện «<giai đoạn cũ> → <giai đoạn mới>» như trước.
- AC-15: Given sheet kế hoạch One Mount và sheet một thoả thuận mở ở cùng khổ 1440, When chụp hai ảnh, Then nhìn thấy trên ảnh cùng bố cục đầu sheet (logo · tiêu đề · dòng phụ · nút hành động), cùng một dải bốn ô số, cùng một thanh tab — và tab Bước của kế hoạch hiện nút giao, ô tích xong và hạn trên từng dòng.

## Coverage

Quét bằng skill `morphological-scan` ngày 2026-09-22, preset `entity-feature`;
bản đầy đủ ở `_acceptance/ke-hoach-la-mot-ban-ghi/morphological-scan.md` — 4 trục,
31 ô có nghĩa, cắt còn 6 ô Core (19%).

- Trục A — vòng đời của một mục việc: bảng/cột | thẻ | mẫu | checklist | người trên mục | hạn trên mục | thêm/bỏ/sắp | mục con | nhãn | thành viên thẻ | bình luận | đính kèm | nhật ký | lưu trữ | trường tuỳ chỉnh [thước CE: giải phẫu thẻ Trello]
- Trục B — vai × quyền: quan hệ đối tác | bộ phận chuyên môn | quản lý | quản trị | chuyển giao khi nghỉ [thước CE: journey năm vai của bản quét 2026-09-19]
- Trục C — vào/ra: gõ tay | điểm nhận nền tảng | AgentTask | sang record sheet | xuất | nhắc qua kênh [thước CE: `CONTEXT.md` + điểm nhận vòng một]
- Trục D — thời gian: lúc tạo | liên tục | tại mốc | sau 30 ngày [thước CE: preset entity-feature, trục Thời gian]
- Ánh xạ Core → tiêu chí: giao · xong · hạn → AC-1, AC-2, AC-3, AC-13 · thêm/bỏ/sắp → AC-4, AC-5 · vết → AC-1..AC-8, AC-14 · ghi chú → AC-9 · cầm trịch → AC-6 · record sheet → AC-11, AC-12, AC-15 · cross-cutting xoá dây chuyền → AC-10 · cross-cutting chỉ đọc khi đóng → AC-8 · cross-cutting thao tác rỗng → AC-7.
- Không có ô `[GIẢ ĐỊNH]` mới. Giả định «bộ phận chuyên môn có tài khoản CRM» của vòng một vẫn chưa thử, mang sang `opportunity.md` giả định 2 — không phải việc của phần mềm.

## Đường đo

- Thước: mọi kế hoạch đang chạy có ít nhất một bước `completedAt ≠ null` hoặc `assigneeId ≠ null` sau hai tuần · số từ: truy vấn trên `OnboardingStep` ở môi trường thật · bảo đảm bởi: AC-1, AC-2, AC-8
- Thước: cột Im lặng khác `—` ở ít nhất một hàng danh mục · số từ: màn danh mục, chính `imNgay` của `manDanhMuc` · bảo đảm bởi: AC-2, AC-7
- Thước: phiên nghiệm thu Cổng Giá trị của vòng một chạy sau lượt này và đạt bốn ngưỡng đã ký 2026-09-19 · số từ: nghi thức `/acceptance-gate:uat-session dieu-phoi-30-ngay-dau` · bảo đảm bởi: đã có sẵn: nghi thức phiên nghiệm thu — không cần code
- Thước (vế CHẾT): bộ phận khai họ báo «xong» qua chat rồi cầm trịch đánh dấu hộ · số từ: so `Activity.createdById` của vết `buoc.xong` với `assigneeId` của bước, cộng lời khai tại phiên · bảo đảm bởi: AC-1 (vết mang người bấm), AC-2

## Out of scope

- Tab «30 ngày» ở sheet Công ty, dòng ở sheet Cá nhân, «việc của tôi», báo theo người, chuyển giao khi nghỉ — lượt 2 `moi-phia-deu-thay-ke-hoach`.
- Nhắc trước hạn, cảnh báo im lặng, theo dõi kế hoạch — lượt 3 `may-nhac-truoc-nguoi`.
- Việc con, phụ thuộc giữa bước, đính kèm — lượt 4 `buoc-co-viec-con`.
- Sửa nhãn bước và sửa số ngày mục tiêu — bỏ khỏi lượt, duyệt trong brainstorm 2026-09-22.
- Tab Agent trên sheet kế hoạch — `AgentPanel` chỉ biết ba loại bản ghi.
- Quyền chặt hơn cho nút xong — mọi người đăng nhập đều đánh dấu được; phân quyền theo bộ phận là việc của ô phân quyền riêng.
- Component phễu trong `/packages/ui` — nợ ghi từ design-pass vòng một.

## Notes

- Vết dùng `ActivityType.PLAN_CHANGE` mới chứ không mượn `TASK` hay `STAGE_CHANGE`: `TASK` lọt vào `activities.myTasks` và vẽ ô tích; `STAGE_CHANGE` được parse thành giai đoạn thoả thuận (`timeline-entry.tsx:72`).
- Menu `⋯` của kế hoạch là menu riêng chỉ có Đóng / Mở lại — `RecordActions` giả định lưu trữ · khôi phục · xoá vĩnh viễn, kế hoạch không có ba thao tác đó và lượt này không thêm.
- Tiêu chí AC-15 là `ui-check`. Như Known limit đã ký ở vòng một, làn máy gom eval theo `test`/`script` nên bỏ qua `ui-check`; vòng này GIỮ nó và nêu căng thẳng lên thẻ cho người ký quyết, không tự đổi nhà.
- Một phần Known limits của vòng một được trả trong lượt này: Ngoài-5 (xoá ghi danh làm mới tại chỗ gọi) · Ngoài-9 (trình duyệt tự tính tiến độ) · Ngoài-10 (nút không dùng được bằng bàn phím — cho các nút mới) · Ngoài-14 (xoá ghi danh gửi hai lần, lỗi không báo) · Ngoài-15 (màn kế hoạch hiện lỗi như chưa có dữ liệu — `RecordSheetFrame` tách hai trạng thái).
