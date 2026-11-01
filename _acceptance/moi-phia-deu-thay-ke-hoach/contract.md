---
schema_version: 1
feature: Kế hoạch hiện ra ở mọi chỗ người đã đứng — tab 30 ngày đầu ở sheet Công ty, mục 30 ngày đầu ở sheet Cá nhân, bước giao cho tôi trong thẻ Tasks, lọc và chia cột theo người được giao, chuyển việc 30 ngày khi một người nghỉ
slug: moi-phia-deu-thay-ke-hoach
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui, docs]
status: signed-off
design_doc: docs/superpowers/specs/2026-09-22-moi-phia-deu-thay-ke-hoach-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-22T08:05:00Z
---

# Acceptance Contract: moi-phia-deu-thay-ke-hoach

## Context

Lượt 1 cho kế hoạch tay — giao bước, đánh dấu xong, vết — nhưng kế hoạch chỉ sống
ở danh mục và sheet `plan:`. Người đứng ở sheet Công ty không biết đối tác có kế
hoạch, người bộ phận được giao bước không có chỗ nào liệt việc của mình, quản lý
không xem được theo người được giao, và không ai chuyển được việc khi một người
nghỉ. Lượt này đưa kế hoạch tới đúng chỗ người đang đứng. Người dùng là nhân viên
OneHub — quan hệ đối tác, bộ phận chuyên môn, quản lý và quản trị.

Source input: `_acceptance/moi-phia-deu-thay-ke-hoach/opportunity.md` (ký Cổng Đáng
2026-09-22) · lộ trình `docs/plan/lo-trinh-dieu-phoi-30-ngay.md` mục 4, lượt 2.

## Criteria

- AC-1: Given thành viên H cầm trịch hai kế hoạch đang chạy và một kế hoạch đã đóng, được giao ba bước chưa xong của kế hoạch đang chạy, một bước đã xong, một bước chưa xong của kế hoạch đã đóng, và thành viên X được giao một bước khác, When quản trị chuyển việc của H cho T, Then đọc lại từ cơ sở dữ liệu thấy hai kế hoạch đang chạy do T cầm trịch, ba bước chưa xong giao cho T, còn kế hoạch đã đóng, bước đã xong, bước của kế hoạch đã đóng và bước của X giữ nguyên; có đúng hai vết `keHoach.doiCamTrich` và ba vết `buoc.giao` với `createdById` là quản trị; và số trả về bằng số mà bản xem trước báo ngay trước đó.
- AC-2: Given cùng dữ liệu của AC-1, When một thành viên không phải quản trị gọi chuyển giao, hoặc quản trị chuyển cho chính người đi, hoặc cho một người không phải thành viên, Then lời gọi thứ nhất trả 403 và hai lời gọi sau trả 400 với thông điệp đọc được, và không kế hoạch, bước hay vết nào đổi; chuyển việc của một người không có việc gì thì trả về 0 và 0 và không ghi vết nào.
- AC-3: Given màn Cài đặt › Thành viên của một quản trị, When mở menu ⋯ của H, chọn «Chuyển việc 30 ngày…», chọn T và xác nhận, Then hộp thoại nêu đúng số kế hoạch và số bước từ bản xem trước, danh sách người nhận không có H, màn gửi đúng một lời gọi chuyển giao mang `userId` của H và của T, và máy chủ nhận đúng payload đó thì chuyển đúng việc của H; khi bản xem trước trả 0 và 0 thì nút xác nhận bị khoá; thành viên không phải quản trị không thấy mục này. (cross-layer)
- AC-4: Given người đăng nhập A có các bước chưa xong hạn hôm qua, hôm nay, hôm nay cộng 3 ngày và hôm nay cộng 4 ngày, một bước đã xong, một bước của kế hoạch đã đóng, và B có một bước quá hạn, When lấy tổng quan của A ở cả hai chế độ của tôi và mọi người, Then danh sách bước của tôi có đúng ba bước đầu, theo hạn tăng dần, mỗi bước mang nhãn, hạn, mã kế hoạch và công ty.
- AC-5: Given thẻ Tasks có một việc và hai bước, When tích xong bước thứ hai, Then màn gửi đúng một lời gọi đánh dấu xong mang mã bước thứ hai chứ không gọi thủ tục hoàn thành việc, máy chủ nhận payload đó thì ghi bước thứ hai xong, và sau khi lời gọi trả về không lỗi thì tổng quan cùng kế hoạch đó được làm mới; dòng bước hiện tên công ty và đường sang kế hoạch; mô tả thẻ đếm cả bước quá hạn. (cross-layer)
- AC-6: Given một bước giao cho A và một bước chưa giao, When B đánh dấu xong cả hai, Then vết `buoc.xong` thứ nhất mang người được giao lúc bấm là A và người tạo là B, vết thứ hai mang người được giao lúc bấm là rỗng; và câu truy vấn đường đo chạy trên vết do chính thủ tục đánh dấu xong ghi ra trả đúng số bước tự đánh dấu và mẫu số gồm các bước có người được giao, đếm riêng bước chưa giao, và bỏ vết cũ không có trường này ra khỏi cả ba số.
- AC-7: Given công ty K có một kế hoạch đang chạy và một kế hoạch đã đóng, công ty L có một kế hoạch, When lấy bản ghi công ty K và danh sách kế hoạch của K, Then bản ghi báo số kế hoạch là 2 và cờ xưởng có khuôn đúng theo số khuôn chưa lưu trữ; danh sách có đúng hai kế hoạch của K, đang chạy trước, và mỗi dòng mang đúng Ngày, Bước, Đang tắc ở và Cầm trịch mà danh mục trả cho cùng kế hoạch đó.
- AC-8: Given sheet Công ty của K, When mở tab «30 ngày đầu» và bấm dòng thứ hai, Then số trên nhãn tab bằng số dòng trong bảng, ngăn sheet gồm công ty K rồi kế hoạch của dòng thứ hai; công ty không có kế hoạch trong xưởng không có khuôn thì không có tab; công ty không có kế hoạch trong xưởng có khuôn thì tab hiện màn rỗng, và nút «Tạo kế hoạch» mở hộp thoại tạo kế hoạch với công ty K điền sẵn và khoá.
- AC-9: Given môi giới C ghi danh trong một kế hoạch đang chạy đã đạt bậc Có tài khoản và trong một kế hoạch đã đóng, When mở sheet Cá nhân của C và bấm dòng trong mục «30 ngày đầu», Then mục chỉ có một dòng cho kế hoạch đang chạy, nêu tên công ty và bậc đã đạt, và bấm thì sheet kế hoạch đó mở chồng lên; một cá nhân không ghi danh thì không có mục này. (cross-layer)
- AC-10: Given bốn kế hoạch — P1 có bước chưa xong giao cho A, P2 có bước chưa xong giao cho A và cho B, P3 có bước của A đã xong và các bước còn lại chưa giao, P4 đã xong hết — When lọc danh mục theo người được giao A, rồi B, Then lần một trả đúng P1 và P2, lần hai trả đúng P2, đếm bộ lọc báo A là 2 và B là 1; và chọn A ở ô lọc «Người được giao» trên màn gửi đúng danh sách người được giao đó tới thủ tục danh mục. (cross-layer)
- AC-11: Given cùng bốn kế hoạch của AC-10, When chia bảng cột theo người được giao, Then cột A có P1 và P2, cột B có P2, cột «Chưa giao» có P3, cột «Xong» có P4, và tổng thẻ là năm trên bốn kế hoạch.
- AC-12: Given sheet Công ty ở tiếng Việt với một trường chọn tuỳ biến chưa có giá trị, chủ sở hữu trống, và hai thoả thuận đang mở không có giá, When xem tab Tổng quan và mở ô chọn, Then trường chọn và chủ sở hữu đều hiện ô rỗng chuẩn chứ không hiện nhãn lựa chọn, menu của trường chọn có «Không chọn» chứ không có «None», menu chủ sở hữu vẫn có «Chưa giao», và ô «Giá trị đang mở» hiện ô rỗng; thêm giá cho một thoả thuận đang mở thì ô đó hiện số tiền.
- AC-13: Given sheet Công ty One Mount có tab «30 ngày đầu», tổng quan của một người bộ phận có bước quá hạn, và hộp thoại chuyển việc của một thành viên, When chụp ở khổ 1440 và 375, Then nhìn thấy trên ảnh tab mới cùng họ với tab Thoả thuận, dòng bước trong thẻ Tasks mang tên công ty và hạn tô đỏ khi quá hạn, hộp thoại nêu số kế hoạch và số bước, và ảnh 375 không tràn ngang.

## Coverage

Quét bằng skill `morphological-scan` ngày 2026-09-22, preset `entity-feature`;
bản đầy đủ ở `_acceptance/moi-phia-deu-thay-ke-hoach/morphological-scan.md` — 4
trục, 36 ô có nghĩa, cắt còn 7 ô Core (19%).

- Trục A — chỗ người đứng: sheet Công ty | sheet Cá nhân | sheet Thoả thuận | tổng quan | danh mục | Cài đặt › Thành viên | tìm nhanh [thước CE: năm bề mặt của lộ trình mục Lượt 2 + bề mặt có sẵn của app]
- Trục B — vai: quan hệ đối tác | bộ phận chuyên môn | quản lý | quản trị [thước CE: opportunity.md mục «Người gặp» + journey bản quét 2026-09-19]
- Trục C — việc làm tại chỗ: thấy | mở kế hoạch | tạo kế hoạch | đánh dấu xong | giao lại | chuyển giao hàng loạt [thước CE: My Tasks của Asana + related list của Salesforce]
- Trục D — trạng thái dữ liệu: không có kế hoạch | đang chạy | đã đóng | quá hạn · sắp hạn · xa hạn | người đã rời [thước CE: preset entity-feature, trục Trạng thái]
- Ánh xạ Core → tiêu chí: sheet Công ty → AC-7, AC-8 · tổng quan → AC-4, AC-5 · sheet Cá nhân → AC-9 · danh mục → AC-10, AC-11 · chuyển giao → AC-1, AC-2, AC-3 · đường đo → AC-6 · ba lệch → AC-12 · mặt người nhìn → AC-13.
- `[GIẢ ĐỊNH]` chờ người gạch: người bộ phận mở CRM hằng ngày, nên thẻ Tasks là chỗ họ thấy việc (opportunity.md giả định 1); tóm tắt kế hoạch trong bản ghi công ty không làm chậm sheet Công ty (giả định 2 — thiết kế đã giảm rủi ro bằng cách chỉ đếm, bảng tải khi mở tab).

## Đường đo

- Thước (SỐNG a): trong các bước được đánh dấu xong trong kỳ, ít nhất một nửa do chính người được giao bấm · số từ: câu truy vấn `_acceptance/moi-phia-deu-thay-ke-hoach/rang/ty-le-tu-danh-dau.sql` chạy trên bảng `activity` của môi trường thật, đọc `createdById` và `meta.giaoLucXong` của vết `buoc.xong`; tỉ lệ là `tu_danh_dau / mau`, mẫu số chỉ gồm bước có người được giao lúc bấm (thước «trùng `assigneeId`» chỉ có nghĩa khi có người được giao), còn bước chưa giao đếm riêng ở cột `khong_giao` để Cổng Giá trị vẫn thấy (sổ quyết định, dòng 9) · bảo đảm bởi: AC-6 (trường mới và chính câu truy vấn), AC-5 (vết đi ra từ thẻ Tasks)
- Thước (SỐNG b): một người bộ phận trả lời «hôm nay tôi có việc gì» từ tổng quan trong 30 giây · số từ: bấm giờ tại phiên nghiệm thu · bảo đảm bởi: AC-4, AC-5, AC-13
- Thước (CHẾT): quá nửa số bước xong do người cầm trịch đánh dấu hộ; hoặc bộ phận khai vẫn cần được nhắn · số từ: cùng câu truy vấn của SỐNG a, cộng lời khai tại phiên · bảo đảm bởi: AC-6

## Out of scope

- Đổi dải số chung của sheet Công ty — trình người duyệt quyết riêng.
- Quyền xem-sửa theo bộ phận — chờ ô phân quyền riêng.
- Nhắc trước hạn, cảnh báo im lặng, theo dõi — lượt 3 `may-nhac-truoc-nguoi`.
- Tự chuyển giao khi gỡ thành viên; chuyển giao công ty · cá nhân · thoả thuận của người nghỉ — ba loại đó đã có gán hàng loạt.
- Bước của mọi người trên tổng quan, và giao lại tại chỗ từ thẻ Tasks.
- Sheet Thoả thuận và tìm nhanh không hiện kế hoạch.
- Tab Tác nhân trên sheet kế hoạch.

## Notes

- Tab «30 ngày đầu» hiện theo luật «công ty có kế hoạch, hoặc xưởng có khuôn chưa lưu trữ» thay cho «công ty thuộc loại có khuôn» của lộ trình: `Company` không có trường loại nào khớp `partnerType` tự do của khuôn (sổ quyết định d-4).
- Người đã bị gỡ khỏi xưởng trước khi chuyển giao không còn dòng ở màn Thành viên, nên lượt này không chuyển được việc của họ; kế hoạch vẫn giao lại được từng bước bằng tay như lượt 1.
- Vết `buoc.xong` của lượt 1 không có trường người được giao lúc bấm; câu truy vấn đường đo bỏ chúng ra ngoài mẫu thay vì đoán.
- `onboarding.service.ts` đã 810 dòng, quá trần 800 của kho; thủ tục đọc mới nằm ở tệp mới `onboarding-noi.ts`, không thêm vào tệp cũ.
- Chuẩn giao diện: `feature_loop.ui_standards_skill` khai `web-design-guidelines`, nhưng đó là skill rà mã đã viết trong `.agents/skills`, không phải chuẩn thiết kế; lượt này thiết kế theo `docs/design.md` và `/packages/ui`, và chạy skill đó trên tệp giao diện mới ở S3 — cùng cách lượt 1 đã làm.
- Known limit (Ngoài-1, Cổng Bằng chứng 2026-09-22): dữ liệu mới của kế hoạch và chuyển việc được làm mới bằng danh sách khoá tại chỗ gọi, không qua `useCrmCache`; tab 30 ngày đầu, mục 30 ngày đầu của sheet Cá nhân và thẻ Tasks có thể hiện dữ liệu cũ tới khi tải lại.
- Known limit (Ngoài-2, Cổng Bằng chứng 2026-09-22): kiểm quyền quản trị của chuyển việc có một bản chép trong `onboarding-ghi.ts` bên cạnh `yeuCauQuanTri` của `OnboardingService`; đổi luật quyền phải sửa cả hai.
- Known limit (Ngoài-3, Cổng Bằng chứng 2026-09-22): `OnboardingNoi` chạy truy vấn Prisma trong `onboarding-noi.ts`, không theo quy ước `*.service.ts`.
- Known limit (Ngoài-4, Cổng Bằng chứng 2026-09-22): sau chuyển việc 30 ngày, chi tiết kế hoạch, tab 30 ngày đầu và thẻ Tasks có thể còn hiện người cầm trịch và người được giao cũ tới khi tải lại.
- Known limit (Ngoài-5, Cổng Bằng chứng 2026-09-22): phép đo dòng bước ở tab 30 ngày đầu tìm link theo chữ, không kiểm đích mở.
- Known limit (Ngoài-6, Cổng Bằng chứng 2026-09-22): phép đo giá trị đang mở chỉ khớp một chữ số, không buộc vào `amountCents`.
- Known limit (Ngoài-7, Cổng Bằng chứng 2026-09-22): phép đo nhãn tab chỉ kiểm có chữ số 2; fixture không tách được `soKeHoach` khỏi số dòng.
- Known limit (Ngoài-8, Cổng Bằng chứng 2026-09-22): payload chuyển việc và xem trước được dựng lại khoá bằng tay ở hai phía thay vì trải fixture.
- Known limit (Ngoài-9, Cổng Bằng chứng 2026-09-22): ca 403 của chuyển việc chỉ ghim mã, không ghim thông điệp `canQuyenQuanTri`.
