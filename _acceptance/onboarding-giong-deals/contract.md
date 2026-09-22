---
schema_version: 1
feature: Trang 30 ngày đầu theo khuôn trang danh sách của deals
slug: onboarding-giong-deals
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: [ui]
status: approved
veto_state: mo
veto_opened_at: 2026-09-22T14:30:00Z
design_doc: docs/superpowers/specs/2026-09-22-onboarding-giong-deals-design.md
approved_by:
approved_at:
---

# Acceptance Contract: onboarding-giong-deals

## Context

Trang «30 ngày đầu» (`/[slug]/onboarding`) lệch khỏi khuôn trang danh sách mà
deals, công ty, danh bạ đang dùng: nút tạo nằm sai chỗ và sai màu, tiêu đề cột bị
cắt, trạng thái tải/lỗi làm mất thanh công cụ, sắp xếp mặc định không hiện. Chủ
kho chốt: nút «Kế hoạch mới» phải cùng vị trí và cùng màu với «Thoả thuận mới».

Source input: prompt (ảnh chụp onehub.center/onehub/onboarding, 2026-09-22) + rà sâu trong phiên.

## Criteria

- AC-1: Given trang 30 ngày đầu có dữ liệu, ở cách xem bảng hoặc bảng cột, ở khổ 320 · 375 · 768 · 1024 · 1440, tiếng Việt hoặc tiếng Anh, When mở trang, Then nút «Kế hoạch mới» nằm trong vùng nút ở đầu trang (cùng vùng với «Thoả thuận mới» của deals), là nút tô màu chính có icon, thấy ngay mà không phải mở ô «Lọc», và thanh công cụ của bảng không còn nút tạo nào.
- AC-2: Given nút «Kế hoạch mới» ở đầu trang, When bấm nó ở cách xem bảng hoặc bảng cột, Then mở đúng hộp thoại tạo kế hoạch từ khuôn; And khi không gian chưa có khuôn nào thì nút bị khoá.
- AC-3: Given cách xem bảng có dữ liệu, When xem ở 320 · 375 · 768 · 1024 · 1440, tiếng Việt hoặc tiếng Anh, Then không tiêu đề cột nào đang hiện bị cắt chữ, trang không tràn ngang, và dưới 640px bảng chỉ còn Đối tác · Đang tắc ở · Im lặng.
- AC-4: Given đường dẫn không có tham số sắp xếp, When mở danh sách, Then tiêu đề cột Ngày mang dấu sắp xếp tăng dần, menu «Sắp xếp» chọn Ngày, và yêu cầu gửi đi mang `sort=startedAt`, `dir=asc` — cùng thứ tự máy chủ vẫn trả; When chọn giảm dần, Then yêu cầu mang `dir=desc` và máy chủ trả đúng thứ tự đảo ngược. (cross-layer)
- AC-5: Given danh sách đang tải lần đầu hoặc đang tải lại sau khi lọc, When nhìn trang, Then ô tìm và thanh công cụ vẫn hiện, bảng hiện dấu đang tải, và chữ «Đang tải…» nằm trong một vùng `aria-live="polite"`.
- AC-6: Given tải danh sách hỏng, When nhìn trang, Then ô tìm và thanh công cụ vẫn hiện, lỗi và nút «Thử lại» nằm trong vùng bảng; When bấm «Thử lại», Then danh sách được gọi lại.
- AC-7: Given một hàng có Im lặng = 0, không có «Đang tắc ở» hoặc không có «Bộ phận», When xem bảng, Then ô đó hiện dấu ô trống chung của deals (`EmptyCellValue`) chứ không phải chuỗi viết tay hay ô rỗng; And ba cột số dùng chữ số đều (`tabular-nums`); And Im lặng > 0 hiện theo ngôn ngữ («8 ngày» / «8d»).
- AC-8: Given menu «Cột», When mở nó, Then cột Đối tác không có trong danh sách ẩn/hiện được, như cột tên của deals.
- AC-9: Given tên đối tác hoặc bước tắc dài, When xem bảng, Then ô chữ giữ một dòng và cắt bằng dấu ba chấm như deals, và vẫn mang `translate="no"`.
- AC-10: Given bộ lọc Bộ phận, Người cầm, Người giao, When mở một bộ lọc, Then nhãn mỗi lựa chọn chỉ là tên, không kèm « · số»; lựa chọn đếm 0 vẫn bị bỏ trừ khi đang được chọn.
- AC-11: Given hộp thoại tạo kế hoạch đã điền đủ, When bấm Lưu và máy chủ tạo xong, Then có thông báo thành công và tấm của kế hoạch vừa tạo mở ra. (cross-layer)
- AC-12: Given trang 30 ngày đầu và trang deals mở cạnh nhau ở 375 và 1440, giao diện sáng và tối, When nhìn phần đầu trang và bảng, Then nút tạo cùng chỗ, cùng màu, cùng icon, và không tiêu đề cột nào của trang 30 ngày đầu bị cắt.
- AC-14: Given không gian đã có khuôn nhưng chưa có kế hoạch nào, When mở trang, Then thân trang mời tạo kế hoạch đầu tiên và nút «Kế hoạch mới» ở đầu trang có mặt, bật; Given bộ lọc không khớp kế hoạch nào, When nhìn trang, Then lời báo và nút «Xoá bộ lọc» nằm trong vùng bảng, ô tìm vẫn hiện, bấm nút thì bộ lọc được xoá; Given chưa có khuôn nào, Then thân trang mời viết khuôn.
- AC-13: Given các tệp giao diện vòng này chạm, When chạy cổng thiết kế tĩnh, Then không có vi phạm.

## Coverage

- Trục vùng màn: đầu trang | thanh công cụ | tiêu đề cột | ô | trạng thái tải · lỗi · rỗng · không khớp | hộp thoại tạo | bảng cột [thước CE: khuôn trang deals đang chạy — SUY-TỪ-REPO: apps/app/app/(app)/[slug]/deals/deals-table.tsx, page.tsx, create-deal-sheet.tsx; và 22 điểm lệch của lượt rà mã ngày 2026-09-22]
- Trục khổ: 320 | 375 | 768 | 1024 | 1440 [thước CE: bảng khổ bắt buộc trong luật kiểm web của kho — SUY-TỪ-REPO: ~/.claude/rules/web/testing.md]
- Trục ngôn ngữ: vi | en [thước CE: hai bản thông điệp `satisfies` cùng kiểu — SUY-TỪ-REPO: apps/app/lib/messages/onboarding.ts]
- Trục giao diện: sáng | tối — chỉ đo bằng mắt ở AC-12; hình học không đổi theo giao diện.
- Core: AC-1 … AC-14. Later/Never: xem Out of scope và sổ quyết định.

## Out of scope

- Đổi bộ lọc trạng thái «Đang chạy / Đã đóng» sang `tabs` của `DataTable`.
- Tiêu đề cột bị cắt ở deals và các trang danh sách khác (lỗi của khuôn chung).
- Chọn nhiều hàng và thao tác hàng loạt trên danh sách kế hoạch.
- Lựa chọn «chưa giao» trong bộ lọc Người cầm / Người giao.
- Dòng tổng hợp ở chân bảng (`meta`) ngoài chữ «Đang tải…».
- Tách thanh công cụ của cách xem bảng cột thành component chung ở `packages/ui`.
- Icon và `flex-1` cho các trạng thái trống toàn trang.
- Hàng bảng nhận tiêu điểm bằng bàn phím (lỗi chung của `DataTable`).
- Giữ trạng thái mở của hộp thoại tạo trên đường dẫn.

## Notes

- Thay chỗ đặt nút của AC-6 hồ sơ `noi-bon-nut-dieu-phoi` (đã ký): ý «có nút tạo ở cả hai cách xem» giữ nguyên, chỗ đặt dời lên đầu trang theo quyết định của chủ kho trong phiên 2026-09-22. Phép đo `nut-tren-thanh-cong-cu` của hồ sơ đó được viết lại để đo nút ở đầu trang; hồ sơ đó ghim lại cuối vòng.
- Chữ «Đang tải…» được giữ trên màn khi tải lần đầu vì năm tệp test của các hồ sơ đã ký chờ nó biến mất làm mốc «tải xong».
