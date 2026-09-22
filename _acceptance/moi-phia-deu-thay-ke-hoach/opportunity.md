---
schema_version: 1
slug: moi-phia-deu-thay-ke-hoach
feature: Kế hoạch hiện ra ở mọi chỗ người đã đứng — tab 30 ngày đầu ở sheet Công ty, dòng phễu ở sheet Cá nhân, việc của tôi trên tổng quan, lọc theo người được giao, chuyển giao khi một người nghỉ
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Manh Phan
decided_at: 2026-09-22T07:25:28Z
prototype:
  base_commit:
  disposition: archive
---

## Vấn đề & ai gặp

Lượt 1 (`ke-hoach-la-mot-ban-ghi`, ký 2026-09-22, merge `cca1cf4b`) cho kế hoạch
tay: giao bước, đánh dấu xong, vết. Nhưng kế hoạch chỉ sống ở một chỗ — màn
danh mục `/onboarding` và sheet `plan:`. Đối chiếu code ngày 2026-09-22:

- Sheet Công ty có năm tab (Tổng quan · Cá nhân · Thoả thuận · Hoạt động · Tác
  nhân — `company-sheet.tsx:190-235`) và `companies.byId` không trả gì về kế
  hoạch (`companies.contracts.ts:175-214`). Người đang xem đối tác không biết đối
  tác đó có kế hoạch 30 ngày hay đang tắc ở đâu.
- Sheet Cá nhân không có mục nào nói người đó đang trong phễu môi giới của kế
  hoạch nào (`contact-sheet.tsx`, các mục Details · Background · We know them · Links).
- Không màn nào liệt «bước được giao cho tôi». Thủ tục `activities.myTasks` có
  nhưng không trang nào gọi; không gì lọc `OnboardingStep` theo người đăng nhập.
  Bộ phận chuyên môn được giao bước ở lượt 1 nhưng phải được nhắn mới biết.
- Danh mục lọc được theo bộ phận và người cầm trịch (`onboarding-search-params.ts`),
  không lọc hay chia cột được theo người được giao bước.
- Gỡ một thành viên (`workspace.service.ts:449-523`) xoá phiên và lời mời nhưng
  không chuyển kế hoạch hay bước đang giao; không có đường chuyển giao hàng loạt.
- Ba lệch nhỏ của sheet Công ty: ô chọn của trường tuỳ biến hiện chữ «None»
  trần (`record-fields.tsx:143`); Open pipeline hiện «₫0» khi không thoả thuận
  nào có giá (`company-sheet.tsx:179-188`); ô chủ sở hữu rỗng hiện «—» ở chỗ này
  mà nơi khác dùng chữ khác.

**Người gặp:** bộ phận chuyên môn (được giao mà không thấy việc), nhân viên quan
hệ đối tác (đứng ở sheet Công ty mà không thấy kế hoạch), quản lý (không xem
được theo người, không chuyển giao được khi có người nghỉ).

Lượt 2 của lộ trình `docs/plan/lo-trinh-dieu-phoi-30-ngay.md`.

## Phạm vi đề xuất

Một câu: *«Tôi thấy việc 30 ngày của mình ở đúng chỗ tôi đang đứng, không phải
đi tìm danh mục.»*

- `companies.byId` trả tóm tắt kế hoạch; tab «30 ngày đầu» ở sheet Công ty có
  số đếm, bảng Kế hoạch · Ngày · Bước · Đang tắc ở · Cầm trịch, bấm mở `plan:`
  chồng lên, hàng «Tạo kế hoạch» điền sẵn công ty. Chỉ hiện khi công ty có kế
  hoạch hoặc thuộc loại có khuôn.
- Sheet Cá nhân: một dòng «đang trong phễu của …», bấm mở kế hoạch.
- Tổng quan: khối «bước được giao cho tôi, sắp hạn / quá hạn».
- Danh mục: lọc theo người được giao; bảng cột chia theo người được giao.
- Chuyển giao: chọn người đi → người nhận, đổi cầm trịch và mọi bước đang giao,
  mỗi dòng đổi ghi một vết `PLAN_CHANGE` như lượt 1.
- Sửa ba lệch nhỏ của sheet Công ty.

**Hạng dự kiến T2** — không đổi schema (`OnboardingPlan.ownerId` và
`OnboardingStep.assigneeId` đã có). Thành T3 nếu chuyển giao phải móc vào luồng
gỡ thành viên ở `apps/api/src/workspace/**`; đề xuất để nó là thao tác riêng
trong module onboarding, không móc vào `removeMember`.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Người bộ phận chuyên môn có mở CRM hằng ngày, nên khối «việc của tôi» trên tổng quan là chỗ họ sẽ thấy | Khối nằm đó mà không ai nhìn; cần nhắc qua kênh khác (lượt 3) | Hỏi mỗi trưởng bộ phận một câu: tuần trước mở CRM mấy ngày | Chưa thử |
| 2 | Tóm tắt kế hoạch trong `companies.byId` không làm chậm sheet Công ty | Mở sheet Công ty chậm đi với mọi người, kể cả người không quan tâm kế hoạch | Đo thời gian `companies.byId` trước/sau trên dữ liệu production cỡ hiện tại | Chưa thử |
| 3 | Chuyển giao là việc của quản trị, làm tay khi có người nghỉ, không cần tự động theo gỡ thành viên | Người nghỉ bị gỡ trước khi ai nhớ chuyển giao — bước treo không người | Hỏi chủ kho quy trình nghỉ việc hiện tại | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Sau khi bật, người được giao bước có tự thấy và tự đánh dấu việc của mình không — hay vẫn phải chờ người cầm trịch nhắn rồi đánh dấu hộ?
- Kết quả nào là SỐNG: hai tuần sau khi bật, đủ hai điều — (a) trong các bước được đánh dấu xong trong kỳ, ít nhất một nửa do chính người được giao bấm, đếm bằng vết `buoc.xong` có `createdById` trùng `assigneeId` của bước; (b) tại phiên nghiệm thu, một người của bộ phận chuyên môn trả lời «hôm nay tôi có việc gì» từ màn tổng quan, không mở danh mục, trong 30 giây — bấm giờ.
- Kết quả nào là CHẾT: hết hai tuần mà quá nửa số bước xong vẫn do người cầm trịch đánh dấu hộ; hoặc bộ phận khai vẫn cần được nhắn mới biết mình có việc.
- Timebox: hai ngày công cho bản bấm được (tab 30 ngày đầu ở sheet Công ty và khối việc của tôi) trước Cổng Phạm vi; quá hai ngày là đang xây, không phải hội tụ.

## Kết quả prototype

Chưa dựng gì.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Lộ trình năm lượt, mục Lượt 2 | `docs/plan/lo-trinh-dieu-phoi-30-ngay.md` | triết-lý/logic | có | — |
| Khung record sheet, tab, `DetailSheetSection` | `apps/app/components/crm/record-sheet`, `components/detail-sheet` | ngôn-ngữ-thiết-kế/hình-thái | có — bắt buộc, `AGENTS.md` | — |
| Vết `PLAN_CHANGE` và schema `onboarding-activity` của lượt 1 | `packages/validation/src/onboarding-activity.ts` | triết-lý/logic | có | — |

## Cổng 0

- **decision = build** Căn cứ (chủ kho, 2026-09-22T07:25:28Z): lượt 1 đã cho người được giao cách làm việc nhưng chưa cho họ chỗ thấy việc; lỗ xác nhận trên code 2026-09-22 (mục «Vấn đề & ai gặp»).
- **disposition = archive** Căn cứ: chưa dựng prototype, `base_commit` để trống.
- **Ngưỡng UAT chốt cùng lúc ký:** nguyên văn bốn dòng ở mục «Ngưỡng chết / ngưỡng UAT», chốt như đề xuất.

## Thước đo thành công → ứng viên criterion

- Tab «30 ngày đầu» của sheet Công ty liệt đúng kế hoạch của công ty đó, bấm mở đúng `plan:`.
- Sheet Cá nhân của một môi giới đang ghi danh hiện dòng phễu trỏ đúng kế hoạch.
- Khối «việc của tôi» chỉ liệt bước giao cho người đăng nhập, chưa xong, sắp hạn hoặc quá hạn.
- Lọc danh mục theo người được giao trả đúng kế hoạch có bước giao cho người đó.
- Chuyển giao đổi hết cầm trịch và bước đang giao của người đi sang người nhận, mỗi dòng một vết, bước đã xong không đổi.
- Ba lệch nhỏ: không còn chữ «None» trần, Open pipeline hiện «—» khi không thoả thuận nào có giá, ô chủ sở hữu rỗng cùng một cách hiện.

## Out of scope từ khám phá

- Đổi dải số chung của sheet Công ty — trình người duyệt quyết riêng (lộ trình, Lượt 2).
- Quyền xem-sửa theo bộ phận — chờ ô phân quyền riêng.
- Nhắc trước hạn, cảnh báo im lặng, theo dõi — lượt 3 `may-nhac-truoc-nguoi`.
- Tự chuyển giao khi gỡ thành viên — móc vào luồng gỡ thành viên là T3 và đổi hành vi của màn Thành viên; lượt này chỉ làm thao tác chuyển giao tay.
