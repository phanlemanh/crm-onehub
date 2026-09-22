---
schema_version: 1
feature: Hạn việc tính theo ngày giờ Việt Nam — việc hạn hôm nay không còn hiện quá hạn từ đầu ngày; thẻ «Việc quá hạn» ở chế độ «Cả đội» hiện việc của mọi người kèm tên người tạo; «bước của tôi» cắt khung theo ngày giờ Việt Nam
slug: han-viec-theo-ngay
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: approved
design_doc: docs/superpowers/specs/2026-09-22-han-viec-theo-ngay-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-22T14:04:43Z
---

# Acceptance Contract: han-viec-theo-ngay

## Context

Đo trên dev ngày 2026-09-22: việc chọn hạn hôm nay lưu `dueAt` 00:00 giờ VN rồi bị so
với thời điểm hiện tại, nên hiện quá hạn ngay từ đầu ngày hạn, trong khi bước kế hoạch
cùng hạn trên cùng thẻ hiện chưa quá hạn; và thẻ «Việc quá hạn» luôn chỉ lấy việc do
người đăng nhập tạo, kể cả ở chế độ «Cả đội». Người dùng là nhân viên OneHub đọc tổng
quan và dòng thời gian của bản ghi. Sửa lỗi, không qua Cổng Đáng.

## Criteria

- AC-1: Given lúc 20:54 giờ VN ngày 2026-09-22, người A đã tạo việc T1 hạn 22/09 (lưu 00:00 VN), T2 hạn 21/09, T3 hạn 22/09 lúc 14:00 VN, T4 hạn 20/09 đã xong, T5 không hạn, When lấy tổng quan của A ở chế độ «Tôi», Then danh sách việc quá hạn gồm đúng T2.
- AC-2: Given cùng các việc của AC-1, When lấy tổng quan của A lúc 23:59 giờ VN ngày 22/09 và lúc 00:30 giờ VN ngày 23/09 (17:30 UTC ngày 22/09), Then lần thứ nhất việc quá hạn vẫn đúng T2, lần thứ hai là đúng T1, T2 và T3.
- AC-3: Given A có việc T2 hạn hôm qua và B có việc U hạn hôm qua, When lấy tổng quan của A ở chế độ «Cả đội» và ở chế độ «Tôi», Then chế độ «Cả đội» có cả T2 và U, mỗi việc mang người tạo đúng (U mang tên B); chế độ «Tôi» chỉ có T2; và bước của tôi cùng các mục cần để ý của A — cả hai khác rỗng — giống hệt nhau ở hai chế độ.
- AC-4: Given các việc của AC-1, When A gọi danh sách việc của tôi ở khung quá hạn và khung sắp tới lúc 20:54 giờ VN ngày 22/09, Then khung quá hạn có đúng T2, khung sắp tới có T1 và T3 và không có T2.
- AC-5: Given A được giao bước S3 hạn 25/09, S4 hạn 26/09 và S5 hạn 27/09 của một kế hoạch đang chạy, When lấy tổng quan của A lúc 20:54 giờ VN ngày 22/09 và lúc 00:30 giờ VN ngày 23/09 (17:30 UTC ngày 22/09), Then lần thứ nhất bước của tôi có S3 và không có S4, lần thứ hai có S3 và S4 và không có S5 (khung hôm nay cộng `ONBOARDING.viecCuaToi.cuaSoNgay` ngày, tính theo ngày giờ VN), và hạn của S4 trả về là `2026-09-26`.
- AC-6: Given dòng thời gian của một công ty có việc hạn hôm nay và việc hạn hôm qua, cả hai chưa xong, When xem dòng thời gian, Then việc hạn hôm nay mang chỉ báo hạn thường, không phải chỉ báo đỏ «Quá hạn», còn việc hạn hôm qua mang chỉ báo đỏ «Quá hạn».
- AC-7: Given tổng quan của A ở chế độ «Cả đội» có việc quá hạn U do B tạo, When xem thẻ «Việc quá hạn», Then dòng của U hiện tên B, còn ở chế độ «Tôi» không có dòng U; và máy chủ trả đúng payload mà màn đọc thì màn hiện đúng các dòng đó. (cross-layer)
- AC-8: Given tổng quan ở chế độ «Cả đội» có việc quá hạn của hai người và một việc hạn hôm nay, When chụp ở khổ 1440 và 375, Then nhìn thấy trên ảnh tên người tạo ở đầu dòng phụ của từng việc quá hạn (ở khổ 375 tên hiện đủ, phần tên bản ghi phía sau mới bị cắt), việc hạn hôm nay không nằm trong thẻ, và ảnh 375 không tràn ngang.

## Coverage

Bỏ quét hình thái bằng skill — bài toán hẹp đã đo sẵn: một luật so ngày dùng ở bốn chỗ,
xem sổ quyết định dòng «bỏ coverage-scan». Trục vẫn khai để người soát:

- Trục A — chỗ tính quá hạn: thẻ tổng quan | `myTasks` | «bước của tôi» | dòng thời gian [thước CE: `rg` các phép so `dueAt` trong `apps/api/src` và `apps/app/components` ngày 2026-09-22 — design doc mục 1]
- Trục B — thời điểm: giữa ngày hạn | cuối ngày hạn 23:59 VN | đầu ngày sau 00:30 VN (ngày UTC còn là hôm trước) [thước CE: đo dev 2026-09-22]
- Trục C — chế độ tổng quan: «Tôi» | «Cả đội» [thước CE: `DASHBOARD_SCOPES`]
- Trục D — loại việc: có hạn chưa xong | đã xong | không hạn [thước CE: `activities.service.ts` `complete`, `create`]
- Ánh xạ: thẻ × thời điểm → AC-1, AC-2 · chế độ → AC-3, AC-7 · `myTasks` → AC-4 · bước của tôi → AC-5 · dòng thời gian → AC-6 · mặt người nhìn → AC-8.

## Out of scope

- Người được giao cho việc — `Activity` chỉ có người tạo; việc riêng nếu cần giao việc.
- Gom luật ngày im của danh mục và sheet kế hoạch về ngày VN (Ngoài-8 của `may-nhac-truoc-nguoi`) — chạm hồ sơ đã ký của lượt 1–2.
- Múi giờ theo người dùng hay theo xưởng — lượt này cố định giờ VN.
- Đổi ô soạn chọn hạn hay tiêu đề thẻ.

## Notes

- Hệ thống một xưởng (`WORKSPACE_ID` cố định trong `@crm/db/workspace`): chế độ «Cả đội» là mọi việc trong cơ sở dữ liệu, không có xưởng khác để rò.
- Client tính «quá hạn» của dòng thời gian theo ngày của trình duyệt (`quaHan`); người dùng ngoài giờ VN có thể thấy lệch một ngày với thẻ tổng quan.
