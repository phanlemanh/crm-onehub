---
schema_version: 1
feature: Máy nhắc thay người canh — mỗi sáng một tin Slack riêng gom bước quá hạn, bước sắp hạn, kế hoạch im và mốc ngày 7 · 14 · 30; thẻ Tasks hiện cùng danh sách; ai cũng tự theo dõi được một kế hoạch
slug: may-nhac-truoc-nguoi
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, agent, db, ui, docs]
status: draft
design_doc: docs/superpowers/specs/2026-09-22-may-nhac-truoc-nguoi-design.md
approved_by:
approved_at:
---

# Acceptance Contract: may-nhac-truoc-nguoi

## Context

Lượt 1 cho kế hoạch tay, lượt 2 đưa kế hoạch tới chỗ người đứng, nhưng mọi thứ
vẫn là kéo: không mở CRM thì không biết bước sắp hạn hay kế hoạch đang im. Ngưỡng
im `ONBOARDING.stale.warnAfterMs` đã khai mà không ai đọc; kho không có bảng
thông báo, không gửi được thư, và đường gửi Slack sẵn có chỉ nhắn một nơi cố
định. Lượt này cho máy nhắc thay người canh. Người dùng là nhân viên OneHub — bộ
phận chuyên môn được giao bước, người cầm trịch kế hoạch, quản lý và quan hệ đối
tác muốn theo một kế hoạch không phải của mình.

Source input: `_acceptance/may-nhac-truoc-nguoi/opportunity.md` (ký Cổng Đáng
2026-09-22) · lộ trình `docs/plan/lo-trinh-dieu-phoi-30-ngay.md` mục 4, lượt 3.

## Criteria

- AC-1: Given ngày giờ VN 2026-10-10 lúc 09:00, kế hoạch đang chạy P1 (cầm trịch O, người theo dõi W) có bước B1 giao A hạn 2026-10-09, B2 giao A hạn 2026-10-12, B3 giao A hạn 2026-10-20, B4 giao A đã xong, B5 chưa giao; P1 im 8 ngày và đang ở ngày thứ 14; kế hoạch đã đóng P2 có bước quá hạn giao A; người R đã rời xưởng mà vẫn cầm trịch P3 đang chạy im 9 ngày, When tính việc cần nhắc cho cả xưởng, Then A nhận đúng `buoc-qua-han` B1 và `buoc-sap-han` B2; O nhận đúng `ke-hoach-im` và `moc-ngay` của P1; W nhận đúng `ke-hoach-im` và `moc-ngay` của P1 và không nhận nhắc bước nào; không ai nhận gì về B3, B4, P2; R không có trong kết quả.
- AC-2: Given các kế hoạch và bước dựng đúng ở biên, When tính việc cần nhắc, Then bước hạn trong `NHAC.sapHanNgay` ngày là sắp hạn còn hạn ở ngày kế tiếp thì không; kế hoạch im `NHAC.imSauNgay − 1` ngày không phải kế hoạch im còn im đúng `NHAC.imSauNgay` ngày thì là; kế hoạch ở ngày thứ 13 và 15 không có mốc còn ngày thứ 14 thì có; và gợi ý của nhắc im là «Giao bước X» khi còn bước chưa giao, là «Bước X quá hạn N ngày» khi không còn bước chưa giao mà có bước quá hạn, còn lại là «Bước kế: X».
- AC-3: Given một bước hạn 2026-10-10 và một kế hoạch bắt đầu 2026-09-27, When tính việc cần nhắc lúc 00:30 giờ VN ngày 2026-10-11 (17:30 UTC ngày 2026-10-10) và lúc 23:30 giờ VN ngày 2026-10-10, Then lần thứ nhất bước là quá hạn và kế hoạch ở ngày thứ 15, lần thứ hai bước chưa quá hạn và kế hoạch ở ngày thứ 14 — mọi «ngày» tính theo giờ VN.
- AC-4: Given A và O có việc cần nhắc còn N không có việc gì, When lượt quét chạy lúc 08:29, lúc 08:31, lúc 10:00 cùng ngày, và lúc 08:31 ngày hôm sau (giờ VN), Then đọc lại từ cơ sở dữ liệu: sau 08:29 không có hàng `nhac-ke-hoach` nào; sau 08:31 có đúng một hàng cho A và một cho O, `subject` là `user:<id>:<ngày VN>`, không hàng nào cho N; sau 10:00 vẫn đúng hai hàng; sau ngày hôm sau có thêm đúng hai hàng; `payload` của mỗi hàng chỉ gồm loại nhắc, mã kế hoạch và mã bước; và hai lượt quét chạy chồng nhau lúc 08:31 vẫn chỉ để lại đúng một hàng cho mỗi người.
- AC-5: Given xưởng đã nối Slack, A có hàng `SlackMemberMatch`, và A có một bước quá hạn, hai bước sắp hạn, một kế hoạch im, When làn trực tiếp chạy hàng `nhac-ke-hoach` của A với một bản Slack giả ghi lời gọi, Then có đúng một lời mở hội thoại tới `slackUserId` của A và đúng một tin; trong tin phần Quá hạn đứng trước Sắp hạn, Sắp hạn đứng trước Kế hoạch im; mỗi dòng mang tên công ty và đường dẫn kết thúc bằng `?record=plan:<mã đúng kế hoạch của dòng đó>`; đọc lại hàng từ cơ sở dữ liệu thấy `finishedAt` có giá trị, `outcome` là `da-gui` kèm số dòng 4, và `payload.daGui` liệt đúng bốn dòng đã gửi; khi A có 12 việc thì tin có 10 dòng cùng dòng «và 2 việc nữa» và `payload.daGui` chỉ gồm 10 dòng đó; và khi thiếu `APP_URL` thì tin vẫn gửi, không dòng nào có liên kết hay chữ `undefined`, `outcome` vẫn `da-gui`.
- AC-6: Given ba hàng `nhac-ke-hoach` — xưởng chưa nối Slack; xưởng đã nối nhưng người không có `SlackMemberMatch`; người đã hết việc từ lúc hàng được ghi — When làn trực tiếp chạy từng hàng, Then không có lời gọi Slack nào, không hàng nào ném lỗi, và đọc lại từ cơ sở dữ liệu thấy mỗi hàng đã đóng với `outcome` lần lượt `khong-slack`, `khong-khop`, `khong-viec`.
- AC-7: Given thành viên W chưa theo dõi kế hoạch P, When W bật theo dõi hai lần rồi tắt, Then đọc lại từ cơ sở dữ liệu: sau lần bật đầu có đúng một hàng `OnboardingWatch` (P, W) và một vết `theoDoi.bat` do W tạo; sau lần bật thứ hai vẫn một hàng, một vết; sau khi tắt không còn hàng nào và có thêm một vết `theoDoi.tat`; `planById` trả `dangTheoDoi` và danh sách người theo dõi đúng theo từng bước đó.
- AC-8: Given O cầm trịch P1 im 8 ngày ở ngày thứ 14, W theo dõi P1, X không liên quan, When lấy tổng quan của O, của W và của X, Then tổng quan của O và của W có `keHoachCanDeY` gồm đúng nhắc im và nhắc mốc của P1, mỗi mục mang mã kế hoạch, tên công ty và gợi ý, nhắc mốc mang thêm số bước xong và tổng số bước; tổng quan của X không có mục nào; và danh sách bước của tôi của lượt 2 không đổi.
- AC-9: Given thẻ Tasks của O có một việc, một bước quá hạn, một kế hoạch im và một mốc ngày, When xem tổng quan rồi bấm dòng kế hoạch im, Then thẻ có dòng «Kế hoạch im» mang số ngày im, tên công ty và gợi ý, dòng «Mốc ngày» mang ngày thứ và số bước xong trên tổng số bước, cả hai không có ô tích; mô tả thẻ đếm cả kế hoạch im; bấm dòng thì ngăn sheet có đúng kế hoạch của dòng đó; và máy chủ trả đúng payload mà màn đọc thì màn hiện đúng các dòng đó. (cross-layer)
- AC-10: Given sheet kế hoạch P của W khi W chưa theo dõi, When bấm «Theo dõi», Then màn gửi đúng một lời gọi bật theo dõi mang mã của P, nút thành «Đang theo dõi» với `aria-pressed` bật và số người theo dõi tăng một, và máy chủ nhận đúng payload đó thì ghi hàng theo dõi của W; khi lời gọi lỗi thì nút về lại «Theo dõi» và hiện «Không lưu được theo dõi». (cross-layer)
- AC-11: Given hai kế hoạch đang chạy im 3 và 9 ngày và một kế hoạch đã đóng; một nhắc đã gửi có hai bước sắp hạn — một xong trước hạn, một chưa xong — và một bước bị cắt khỏi tin vì vượt trần; một bước khác đã xong trước giờ gửi nên không nằm trong tin — When chạy câu truy vấn đường đo trên các hàng do chính các thủ tục của kho ghi ra, Then số ngày im trung vị là 6, và tỷ lệ bước tới hạn đã nhận nhắc được xong đúng hạn là 1 trên 2 — mẫu số chỉ gồm bước nằm trong `payload.daGui` với loại sắp hạn, không gồm bước bị cắt hay bước xong trước giờ gửi.
- AC-12: Given tổng quan của người cầm trịch có kế hoạch im và mốc ngày, và sheet kế hoạch của một người đang theo dõi, When chụp ở khổ 1440 và 375, Then nhìn thấy trên ảnh hai loại dòng mới cùng họ với dòng bước của thẻ Tasks, cột hạn của dòng im mang cùng chỉ báo đỏ với bước quá hạn, nút «Đang theo dõi» cạnh menu của sheet với số người theo dõi, và ảnh 375 không tràn ngang.

## Coverage

Quét bằng skill `morphological-scan` ngày 2026-09-22 (preset `entity-feature`,
trục dựng lại); bản đầy đủ ở `_acceptance/may-nhac-truoc-nguoi/morphological-scan.md`
— 4 trục, ≈ 44 ô có nghĩa, cắt còn 9 ô Core (≈ 20%).

- Trục A — loại nhắc: `buoc-qua-han` | `buoc-sap-han` | `ke-hoach-im` | `moc-ngay` [thước CE: design doc mục 3 + lộ trình mục Lượt 3]
- Trục B — người nhận: người được giao | người cầm trịch | người theo dõi | người đã rời xưởng [thước CE: design doc mục 3 + opportunity.md «Người gặp»]
- Trục C — đường tới người: Slack gửi được | xưởng chưa nối | người chưa khớp | Slack lỗi | thiếu `APP_URL` | thẻ Tasks [thước CE: `capabilities.ts` + `run-runtime.ts`]
- Trục D — thời điểm quét: trước 08:30 | lần đầu sau 08:30 | quét lại cùng ngày | ngày mới | quanh nửa đêm giờ VN [thước CE: `schedules/dispatch.ts`]
- Ánh xạ Core → tiêu chí: đúng người nhận → AC-1 · biên ngưỡng → AC-2 · nửa đêm VN → AC-3 · chống trùng → AC-4 · Slack gửi được → AC-5 · không kênh → AC-6 · thẻ Tasks → AC-8, AC-9 · theo dõi → AC-7, AC-10 · đường đo → AC-11 · mặt người nhìn → AC-12.
- `[GIẢ ĐỊNH]` chờ người gạch: xưởng OneHub đã nối Slack và phần lớn người được giao bước khớp được Slack qua email (opportunity.md giả định 1); tin Slack riêng là chỗ người bộ phận đọc trong ngày (giả định 2).

## Đường đo

- Thước (SỐNG a): số ngày im trung vị của kế hoạch đang chạy thấp hơn số đo ở ngày bật · số từ: câu truy vấn `_acceptance/may-nhac-truoc-nguoi/rang/ngay-im-trung-vi.sql` chạy trên `onboarding_plan` và `onboarding_step` của môi trường thật, cách đếm như `imNgay` · bảo đảm bởi: AC-11, AC-2
- Thước (SỐNG b): trong các bước tới hạn trong kỳ mà người được giao đã nhận nhắc, ít nhất một nửa xong trước hoặc đúng hạn · số từ: câu truy vấn `_acceptance/may-nhac-truoc-nguoi/rang/xong-dung-han-sau-nhac.sql`, đọc `payload.daGui` — đúng các dòng đã có trong tin — của hàng `AgentTask` loại `nhac-ke-hoach` có `outcome` `da-gui`, lấy các bước loại sắp hạn, rồi đối chiếu `completedAt` với cuối ngày giờ VN của `dueAt` · bảo đảm bởi: AC-11, AC-4, AC-5
- Thước (CHẾT): số ngày im trung vị không giảm, hoặc quá nửa số người nhận nhắc tắt tiếng bot · số từ: câu truy vấn của SỐNG a; phần tắt tiếng bot là lời khai tại phiên nghiệm thu, Slack không cho bot đọc được điều đó · bảo đảm bởi: AC-11

## Out of scope

- Nhắc qua thư — cần quyền `gmail.send` ở `packages/auth` và đường gửi mới trong `mailbox`, T3 riêng.
- Leo thang tự động lên quản lý; nhắc thẳng cho đối tác.
- Chuông thông báo trong app.
- Người tự chọn giờ nhận nhắc hay tắt từng loại nhắc — lượt này giờ chung cả xưởng.
- Nhắc tức thời lúc một bước chuyển sang quá hạn — trái chốt một tin mỗi sáng.
- Tự gắn người theo dõi (người tạo kế hoạch, quản trị gắn hộ).

## Notes

- Tin Slack ghi `outcome` từ phía máy gửi; tin đã tới mà người không đọc thì máy không biết — thước SỐNG b đo hành vi sau nhắc, không đo việc đọc.
- Lỗi Slack tạm (giới hạn tần suất, token hết hạn) đi luật thử lại và `retireExhausted` sẵn có của `AgentTask`; lượt này không thêm tiêu chí cho nó.
- Tác tử tắt qua nửa đêm giờ VN thì nhắc của ngày đó không gửi bù — hệ quả của khoá `subject` theo ngày.
- Thiếu `APP_URL` thì tin vẫn gửi, dòng không có đường mở.
- Hàng `OnboardingWatch` tự mất theo kế hoạch và theo người (`onDelete: Cascade` trong schema); lượt này không có thao tác nào bỏ kế hoạch nên không có tiêu chí riêng.
- «Gợi ý» là chữ của lượt này cho câu hướng xử lý đi kèm nhắc im («Giao bước X» …); `CONTEXT.md` cấm «việc cần làm» cho nghĩa đó.
- Lượt 2 tính «bước của tôi» theo ngày UTC; lượt này tính theo ngày giờ VN. Lượt này không đổi lượt 2; hai cách đếm lệch nhau quanh nửa đêm là giới hạn đã biết.
- `ONBOARDING.stale` gỡ khỏi `onboarding-config.ts`; ngưỡng im sống ở `NHAC` của `packages/db/src/onboarding-nhac.ts`.
