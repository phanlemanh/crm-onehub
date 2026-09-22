# Quét không gian — kế hoạch hiện ra ở những chỗ người đã đứng

> Chạy 2026-09-22 tại phase khám phá, preset `entity-feature`, trước design doc.
> Tầng tiếp theo của bản quét lượt 1
> (`_acceptance/ke-hoach-la-mot-ban-ghi/morphological-scan.md`): bản đó quét
> *thao tác trên một kế hoạch*; bản này quét *kế hoạch lộ ra ở đâu, cho ai, làm
> được gì tại chỗ*.

## Ngữ cảnh

- **Chân sản phẩm:**
  - Sheet Công ty có năm tab, không tab nào về kế hoạch; `companies.byId` không trả kế hoạch `[SUY-TỪ-REPO: apps/app/components/crm/record-sheet/company-sheet.tsx §tabs; apps/api/src/companies/companies.contracts.ts §companyDetailOutput]`.
  - Sheet Cá nhân không có mục nào về phễu môi giới `[SUY-TỪ-REPO: apps/app/components/crm/record-sheet/contact-sheet.tsx]`.
  - Tổng quan có thẻ Tasks liệt việc TASK do chính người đăng nhập tạo, đã quá hạn, tối đa 10 dòng, bất kể nút của tôi/mọi người `[SUY-TỪ-REPO: apps/api/src/dashboard/dashboard.service.ts §overdueTasks]`.
  - Danh mục lọc theo bộ phận và người cầm trịch, bảng cột chia theo bước · bộ phận · bậc · trạng thái `[SUY-TỪ-REPO: apps/app/app/(app)/[slug]/onboarding/onboarding-search-params.ts]`.
  - Gỡ thành viên không chuyển kế hoạch hay bước `[SUY-TỪ-REPO: apps/api/src/workspace/workspace.service.ts §removeMember]`.
  - `OnboardingStep.dueAt` bắt buộc, `assigneeId` có chỉ mục `[SUY-TỪ-REPO: packages/db/prisma/schema.prisma §OnboardingStep]`.
- **Chân ngành:**
  - «My Tasks» của Asana — một danh sách mọi việc giao cho tôi, gom từ mọi dự án `[NGÀNH: Asana]`.
  - Thẻ bản ghi liên kết ở cột phải của bản ghi công ty trong HubSpot, và related list trên Account của Salesforce — bản ghi con hiện ngay trên bản ghi cha, bấm mở tại chỗ `[NGÀNH: HubSpot · Salesforce]`.
  - Chuyển dữ liệu sang người khác khi xoá một người dùng trong bảng quản trị Google Workspace `[NGÀNH: Google Workspace]`.

## Trục

- **A — chỗ người đứng** (thước CE: năm bề mặt của lộ trình mục Lượt 2 + bề mặt có sẵn của app):
  sheet Công ty | sheet Cá nhân | sheet Thoả thuận | tổng quan | danh mục | Cài đặt › Thành viên | tìm nhanh
- **B — vai** (thước CE: bốn vai của opportunity.md mục «Người gặp» + journey của bản quét 19/09):
  quan hệ đối tác (cầm trịch) | bộ phận chuyên môn (được giao) | quản lý | quản trị
- **C — việc làm tại chỗ** (thước CE: My Tasks của Asana + related list của Salesforce):
  thấy | mở kế hoạch | tạo kế hoạch | đánh dấu xong | giao lại | chuyển giao hàng loạt
- **D — trạng thái dữ liệu** (thước CE: preset entity-feature, trục Trạng thái):
  không có kế hoạch | đang chạy | đã đóng | bước quá hạn · sắp hạn · xa hạn | người đã rời

## Đang có / thiếu (đối chiếu mã `origin/onehub` @ `cca1cf4b`)

| Ô | Trạng thái |
| --- | --- |
| A danh mục × C thấy · mở · tạo | có (lượt 1) |
| A danh mục × lọc/chia theo người được giao | **thiếu** |
| A sheet Công ty × C thấy · mở · tạo | **thiếu** |
| A sheet Cá nhân × C thấy · mở | **thiếu** |
| A tổng quan × B bộ phận × C thấy · đánh dấu xong | **thiếu** — `activities.myTasks` không trang nào gọi |
| A Cài đặt › Thành viên × B quản trị × C chuyển giao | **thiếu** |
| Đo ngưỡng SỐNG (a): ai bấm xong so với ai được giao lúc đó | **thiếu** — vết `buoc.xong` chỉ có người bấm |

## Core — 7 / 36 ô có nghĩa (19%)

1. Sheet Công ty × quan hệ đối tác × thấy · mở · tạo — tab «30 ngày đầu»; người đứng ở đối tác thấy ngay đối tác đang ở đâu.
2. Tổng quan × bộ phận × thấy · đánh dấu xong, quá hạn và sắp hạn — gộp vào thẻ Tasks; trực tiếp phục vụ ngưỡng SỐNG (b).
3. Sheet Cá nhân × quan hệ đối tác × thấy · mở — một dòng phễu, chỉ kế hoạch đang chạy.
4. Danh mục × quản lý × lọc và chia cột theo người được giao — thay cho «báo theo người» của lộ trình.
5. Cài đặt › Thành viên × quản trị × chuyển giao hàng loạt, người đã rời — một transaction, vết mỗi dòng.
6. Vết `buoc.xong` ghi người được giao lúc bấm — đường đo của ngưỡng SỐNG (a); không có ô này thì Cổng Giá trị không có số.
7. Ba lệch nhỏ của sheet Công ty — «None» trần, chủ sở hữu rỗng hai cách hiện, Open pipeline «₫0» — rẻ, đã nêu trong lộ trình.

## Later

- Sheet Thoả thuận × thấy kế hoạch của công ty — người đứng ở thoả thuận vẫn một cú bấm sang công ty; chờ bằng chứng có ai cần.
- Tìm nhanh × mở kế hoạch — tìm theo tên công ty đã tới sheet Công ty, rồi tới tab.
- Tổng quan × quản lý × bước của mọi người — chế độ «mọi người» cho thẻ Tasks; hôm nay thẻ Tasks vốn không có chế độ đó.
- Tổng quan × giao lại tại chỗ — mở kế hoạch là một cú bấm; giao lại cần danh sách người, nặng cho một dòng thẻ.
- Báo cáo theo người / bộ phận dạng biểu đồ — lọc và chia cột đã trả lời câu «ai đang ôm bao nhiêu»; biểu đồ chờ câu hỏi cụ thể của quản lý.
- Nhắc trước hạn qua email hay Slack — lượt 3 `may-nhac-truoc-nguoi`.

## Never

- Tự chuyển giao khi gỡ thành viên — móc vào `removeMember` là T3 và đổi hành vi màn Thành viên; quản trị chủ động bấm (d-7 của sổ).
- Chuyển giao công ty · cá nhân · thoả thuận của người đã rời trong cùng hộp thoại — ba loại đó đã có gán hàng loạt; gộp vào là một hộp thoại làm bốn việc.
- Tab «30 ngày đầu» ẩn hiện theo loại công ty — Company không có trường loại khớp `partnerType` tự do của khuôn (d-4 của sổ).

## Cross-cutting áp mọi ô Core

- Số trên nhãn, trên thẻ và trong bảng khớp nhau — cùng một hàm tính với danh mục, không đếm hai nơi.
- Mở kế hoạch từ bất kỳ chỗ nào đều chồng sheet `plan:` lên chỗ đang đứng, không đổi trang.
- Kế hoạch đã đóng là chỉ đọc ở mọi chỗ, như lượt 1.
- Trạng thái rỗng · đang tải · lỗi cho mọi bề mặt mới; lỗi tách khỏi rỗng.
- Chữ mới qua kho chữ hai tiếng; tên người và tên công ty không dịch.
- Dữ liệu cá nhân: chuyển giao ghi vết mang tên hai người — Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 và Nghị định 356/2025/NĐ-CP, hiệu lực 01/01/2026 (tra lại 2026-09-19 ở vòng một, đang áp; lượt này không thêm loại dữ liệu mới).

## Giới hạn của bản quét

- Ba sản phẩm ngành dùng từ hiểu biết chắc về đúng các mẫu nêu, không teardown lại; không lấy hình thái, chỉ lấy mẫu tương tác.
- Hai ô `[GIẢ ĐỊNH]` mang sang Coverage của hợp đồng: người bộ phận có mở CRM hằng ngày (giả định 1 của opportunity.md), và tóm tắt kế hoạch không làm chậm sheet Công ty (giả định 2).
