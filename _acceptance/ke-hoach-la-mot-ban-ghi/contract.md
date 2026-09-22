---
schema_version: 1
feature: Kế hoạch 30 ngày là một bản ghi làm việc được — mở như thoả thuận, giao bước, đánh dấu xong, đổi cầm trịch, ghi chú, và mọi thay đổi để lại vết
slug: ke-hoach-la-mot-ban-ghi
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, docs]
status: signed-off
design_doc: docs/superpowers/specs/2026-09-22-ke-hoach-la-mot-ban-ghi-design.md
approved_by: Phan Le Manh
approved_at: 2026-09-22T05:19:11Z
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

- AC-1: Given một kế hoạch đang chạy có một bước chưa giao, When giao bước đó cho một thành viên, Then đọc lại từ cơ sở dữ liệu thấy bước mang đúng người đó, `updatedAt` của bước đổi, và đúng một `Activity` kiểu `PLAN_CHANGE` được ghi với `kind` `buoc.giao` mang người cũ (rỗng) và người mới, và `createdById` của vết là người bấm chứ không phải người cầm trịch.
- AC-2: Given một kế hoạch bốn bước chưa bước nào xong và bước gần nhất đã đứng yên năm ngày, When đánh dấu một bước xong, Then `completedAt` của bước được ghi, vết `buoc.xong` mang `createdById` của người bấm (một thành viên không phải cầm trịch, không phải người được giao), và màn danh mục trả về hàng của kế hoạch đó với Bước `1/4` và Im lặng bằng 0. (cross-layer)
- AC-3: Given một bước hạn 22/09, When đổi hạn sang 25/09, Then đọc lại thấy hạn 25/09, và vết `buoc.doiHan` mang hạn cũ và hạn mới dạng ngày.
- AC-4: Given một kế hoạch ba bước, When thêm một bước, bỏ một bước khác, rồi sắp lại thứ tự, Then đọc lại thấy đúng tập bước và đúng thứ tự sau ba thao tác; thêm và bỏ mỗi thao tác sinh đúng một vết (`buoc.them`, `buoc.bo`) mang nhãn bước; sắp lại với tập id thiếu, thừa hay trùng thì trả 400 và thứ tự trong cơ sở dữ liệu không đổi.
- AC-5: Given tab Bước của một kế hoạch có hai dòng bước, When tích xong dòng thứ hai, giao dòng thứ hai cho một người, và đổi hạn dòng thứ hai, Then màn gửi đúng ba lời gọi mang `stepId` của dòng thứ hai với giá trị đã chọn (hạn dạng `YYYY-MM-DD`), máy chủ nhận đúng các payload đó và ghi đúng dòng thứ hai, và sau mỗi lời gọi thành công danh mục và sheet được làm mới. (cross-layer)
- AC-6: Given một kế hoạch, When đổi người cầm trịch, Then đọc lại thấy người mới, vết `keHoach.doiCamTrich` mang `companyId` của kế hoạch, và không vết `buoc.*` nào của kế hoạch mang `companyId`.
- AC-7: Given một bước đã giao cho A và đã xong, When giao lại cho A, và đánh dấu xong lần nữa, Then cả hai lời gọi thành công, không `Activity` nào được ghi thêm, và `updatedAt` của bước giữ nguyên.
- AC-8: Given một kế hoạch đã đóng, When gọi bất kỳ thủ tục ghi bước nào hoặc đổi người cầm trịch, Then mỗi lời gọi trả 409 với thông điệp «Kế hoạch đã đóng — mở lại trước khi sửa.», và không bước, vết hay người cầm trịch nào đổi.
- AC-9: Given một kế hoạch của công ty One Mount, When tạo một ghi chú chỉ truyền `planId`, Then ghi chú được lưu kèm `companyId` của One Mount, và hiện ở cả dòng thời gian của kế hoạch lẫn dòng thời gian của công ty. (cross-layer)
- AC-10: Given một công ty có kế hoạch với vết và ghi chú, When xoá công ty bằng đường xoá thật của sản phẩm, Then mọi `Activity` mang `planId` của kế hoạch đó bị xoá theo, còn cá nhân của công ty đó (đường xoá công ty giữ lại cá nhân) vẫn còn.
- AC-11: Given màn danh mục 30 ngày, When bấm hàng của một kế hoạch, Then đường dẫn mang `record=plan:<id>`, sheet kế hoạch mở với bảng danh mục vẫn còn phía sau; mở đường cũ `/onboarding/<id>` thì được chuyển hướng về đúng đường đó; bấm tên công ty trên sheet thì sheet công ty mở chồng lên. (cross-layer)
- AC-12: Given tab Môi giới có hai người, When bấm gỡ ở hàng thứ hai và xác nhận, Then thủ tục gỡ nhận đúng id người thứ hai, hộp xác nhận nêu tên người thứ hai, và người thứ nhất còn nguyên. (cross-layer)
- AC-13: Given hôm nay là một ngày D, When tính «quá hạn» cho ba bước chưa xong hạn D−1, D và D+1, Then chỉ bước hạn D−1 là quá hạn.
- AC-14: Given mỗi `kind` trong chín `kind` của vết kế hoạch (kể cả `buoc.giao` bỏ giao với người mới rỗng) và một `STAGE_CHANGE` của thoả thuận, When vẽ từng dòng trên dòng thời gian, Then mỗi vết kế hoạch hiện thành một câu tiếng Việt đọc được có tên người và nhãn bước, không có chữ «undefined», «null» hay chuỗi ngày ISO, còn dòng thoả thuận vẫn hiện «<giai đoạn cũ> → <giai đoạn mới>» như trước.
- AC-15: Given sheet kế hoạch One Mount và sheet một thoả thuận mở ở cùng khổ 1440, When chụp hai ảnh, Then nhìn thấy trên ảnh cùng bố cục đầu sheet (logo · tiêu đề · dòng phụ · nút hành động), cùng một dải bốn ô số, cùng một thanh tab — và tab Bước của kế hoạch hiện nút giao, ô tích xong và hạn trên từng dòng.

## Coverage

Quét bằng skill `morphological-scan` ngày 2026-09-22, preset `entity-feature`;
bản đầy đủ ở `_acceptance/ke-hoach-la-mot-ban-ghi/morphological-scan.md` — 4 trục,
31 ô có nghĩa, cắt còn 6 ô Core (19%).

- Trục A — vòng đời của một mục việc: bảng/cột | thẻ | mẫu | checklist | người trên mục | hạn trên mục | thêm/bỏ/sắp | mục con | nhãn | thành viên thẻ | bình luận | đính kèm | nhật ký | lưu trữ | trường tuỳ chỉnh [thước CE: giải phẫu thẻ Trello]
- Trục B — vai × quyền: quan hệ đối tác | bộ phận chuyên môn | quản lý | quản trị | chuyển giao khi nghỉ [thước CE: journey năm vai của bản quét 2026-09-19]
- Trục C — vào/ra: gõ tay | điểm nhận nền tảng | AgentTask | sang record sheet | xuất | nhắc qua kênh [thước CE: `CONTEXT.md` + điểm nhận vòng một]
- Trục D — thời gian: lúc tạo | liên tục | tại mốc | sau 30 ngày [thước CE: preset entity-feature, trục Thời gian]
- Ánh xạ Core → tiêu chí: giao · xong · hạn → AC-1, AC-2, AC-3, AC-5, AC-13 · thêm/bỏ/sắp → AC-4 · vết → AC-1..AC-4, AC-6..AC-8, AC-14 · ghi chú → AC-9 · cầm trịch → AC-6 · record sheet → AC-5, AC-11, AC-12, AC-15 · cross-cutting xoá dây chuyền → AC-10 · cross-cutting chỉ đọc khi đóng → AC-8 · cross-cutting thao tác rỗng → AC-7.
- Không có ô `[GIẢ ĐỊNH]` mới. Giả định «bộ phận chuyên môn có tài khoản CRM» của vòng một vẫn chưa thử, mang sang `opportunity.md` giả định 2 — không phải việc của phần mềm.

## Đường đo

- Thước: mọi kế hoạch đang chạy có ít nhất một bước `completedAt ≠ null` hoặc `assigneeId ≠ null` sau hai tuần · số từ: truy vấn trên `OnboardingStep` ở môi trường thật · bảo đảm bởi: AC-1, AC-2, AC-5, AC-8
- Thước: cột Im lặng khác `—` ở ít nhất một hàng danh mục · số từ: màn danh mục, chính `imNgay` của `manDanhMuc` · bảo đảm bởi: AC-2, AC-7
- Thước: phiên nghiệm thu Cổng Giá trị của vòng một chạy sau lượt này và đạt bốn ngưỡng đã ký 2026-09-19 · số từ: nghi thức `/acceptance-gate:uat-session dieu-phoi-30-ngay-dau` · bảo đảm bởi: đã có sẵn: nghi thức phiên nghiệm thu — không cần code
- Thước (vế CHẾT): bộ phận khai họ báo «xong» qua chat rồi cầm trịch đánh dấu hộ · số từ: so `Activity.createdById` của vết `buoc.xong` với `assigneeId` của bước, cộng lời khai tại phiên · bảo đảm bởi: AC-1, AC-2 (vết mang `createdById` của người bấm, đo bằng một người thứ ba)

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
- Known limits của vòng một chạm tới trong lượt này, tính là ĐÃ TRẢ chỉ khi có phép đo: Ngoài-5 (làm mới tại chỗ gọi thay vì qua lối chung) — đo bởi E19 (spy `useCrmCache().plan`). Các khoản khác thiết kế có đổi nhưng KHÔNG có phép đo nên KHÔNG tính là đã trả: Ngoài-9 (dải số giờ đọc từ `planById`), Ngoài-10 (nút mới dùng được bằng bàn phím), Ngoài-14 (nút gỡ khoá khi đang gửi), Ngoài-15 (`RecordSheetFrame` tách lỗi khỏi rỗng).
- `ActivityStampService.targetsOf` không cần phủ `planId`: vết kế hoạch chỉ mang `planId` hoặc thêm `companyId`, không bao giờ mang `contactId` hay `dealId`, nên khi xoá công ty không bản ghi còn sống nào bị một vết kế hoạch đóng dấu `lastActivityAt` (gap-probe P2, 2026-09-22).
- Known limit (Ngoài-1, Cổng Bằng chứng 2026-09-22): `addStep` không kiểm `departmentId`; bộ phận không có thật hoặc đã lưu trữ trả lỗi 500 thô thay vì thông báo đọc được.
- Known limit (Ngoài-2): trang kế hoạch cũ `ho-so-ke-hoach.tsx` / `dong-mo-ke-hoach.tsx` không còn đường vào, nhưng ba bài dom của vòng một vẫn đo nó thay vì `PlanSheet` / `PlanBrokers`.
- Known limit (Ngoài-3): meta `PLAN_CHANGE` không được parse ở biên đọc của API; vết hỏng hình dạng chỉ hiện câu dự phòng «không đọc được», không có lỗi hay nhật ký.
- Known limit (Ngoài-4): sắp lại bước chặn ở 100 bước trong khi thêm bước không có trần; kế hoạch quá 100 bước không sắp lại được.
- Known limit (Ngoài-6): Lên / Xuống đổi chỗ với bước kề trong toàn kế hoạch, nên ở ranh hai bộ phận có thể không thấy đổi gì trên màn.
- Known limit (Ngoài-7): E16 chỉ đo chuỗi có mặt, không đo quan hệ loại vết → câu; tráo câu giữa hai loại vết lọt được.
- Known limit (Ngoài-8): nhánh âm của E4 (gỡ bước của kế hoạch khác → 404) là một khẳng định âm luôn đúng.
- Known limit (Ngoài-9): đối chứng âm của E11 kiểm trạng thái khởi tạo, không bấm ra ngoài sheet.
- Mở hợp đồng mới (Ngoài-5): kế hoạch không còn bước nào không thêm được bước đầu tiên từ màn, và không thêm được bước dưới bộ phận chưa có bước.
