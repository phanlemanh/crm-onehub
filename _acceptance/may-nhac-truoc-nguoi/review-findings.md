## Trong hợp đồng

- **Hình dạng 3 (có mặt/đếm thay cho quan hệ): daGui khi tràn chỉ đếm độ dài, không so với 10 dòng đã gửi**
  file: `apps/agent/test/nhac-ke-hoach.integration.spec.ts:601`
  severity: medium
  AC: AC-5
  nguồn: measurement
  E5 dòng 6 hứa "payload.daGui dung 10 muc do", tức daGui phải là đúng tập các việc đã hiện trong tin. Assert chỉ ghim `daGui: parseNhacPayload(hang.payload).daGui?.length` bằng NHAC.tran, còn tin thì chỉ đếm `dongCo(t, "record=plan:").length`. Cả 12 bước đều thuộc cùng một kế hoạch, nên mọi dòng mang cùng một liên kết plan. Nếu daGui ghi 2 bước bị cắt ở ngưỡng tràn thay cho 2 bước đã hiện, test vẫn xanh, vì không có assert nào nối stepId trong daGui với các dòng thật trong văn bản. Việc này quan trọng vì SQL xong-dung-han-sau-nhac.sql lấy mẫu chính từ daGui. Lời hứa là quan hệ (daGui = các việc đã gửi), nhưng phép đo chỉ là con số bằng nhau.
  rationale: AC-5 đòi "payload.daGui liệt đúng bốn dòng đã gửi" và "payload.daGui chỉ gồm 10 dòng đó" khi tràn — tức đòi đúng danh tính, không chỉ đúng số lượng; test hiện chỉ so khớp độ dài nên không đo được đúng lời hứa của AC-5.

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): đường đo E12 tự ghi completedAt và agentTask thay vì dùng bên ghi thật**
  file: `apps/agent/test/nhac-ke-hoach.integration.spec.ts:766`
  severity: medium
  AC: AC-11
  nguồn: measurement
  E12 hứa: "buoc xong do CHINH setStepDone ghi; khong insert tay agentTask hay completedAt". Nhưng `await xongBuoc(g.xongTruoc.id)` (dòng 766), `await xongBuoc(g.sapXong.id)` (dòng 774) và xongBuoc(g.sapChua.id) trong ca đối chứng đều gọi helper apps/agent/test/support/nhac-gieo.ts, và helper này ghi thẳng `db.onboardingStep.update({ data: { completedAt: new Date() } })`. Nó không đi qua OnboardingGhi.setStepDone (apps/api/src/onboarding/onboarding-ghi.ts:199). Ngày im mà ngay-im-trung-vi.sql đọc (MAX updatedAt) cũng do gieoKeHoach tự đặt `updatedAt: input.imTu` bằng updateMany. Ngoài ra gieoNgoai (dòng 776) chèn tay một hàng agentTask kind nhac-ke-hoach, outcome 'da-gui:1'. Hàng này còn bị coLap trong nhac-gui-gieo.ts tự vô hiệu (đổi outcome thành 'ngoai-phep-do' và đóng mọi kế hoạch không mang tiền tố mn3-), nên nó không đo được việc SQL tự lọc. Như vậy dữ liệu mà hai tệp SQL đọc được dựng đúng khuôn bên đọc, không đi vòng từ bên ghi thật như eval đã tuyên.
  rationale: Thước SỐNG b (bảo đảm bởi AC-11, AC-4, AC-5) đối chiếu completedAt phải phản ánh đúng đường ghi thật của setStepDone; E12 lại ghi thẳng completedAt/agentTask bằng tay nên phép đo không thử đúng đường ghi mà AC-11 dựa vào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **English users see the Vietnamese-only goiY hint on the dashboard, marked translate="no"**
    Người dùng thấy gì: Người dùng xem giao diện tiếng Anh vẫn thấy dòng gợi ý về kế hoạch im bằng tiếng Việt trên bảng điều khiển, và trình duyệt bị chặn không tự dịch được dòng đó.
    file: `packages/db/src/onboarding-nhac.ts`
    severity: medium
    Đề xuất: known-limits

- **OnboardingTheoDoi is a Nest provider and also built by hand with new, so two instances exist**
    Người dùng thấy gì: Không có hậu quả nào người dùng nhìn thấy; đây là cách tổ chức mã nội bộ, không ảnh hưởng tới tính năng nhắc kế hoạch mà người dùng trải nghiệm.
    file: `apps/api/src/onboarding/onboarding.service.ts`
    severity: low
    Đề xuất: wont-fix

- **The Slack greeting hard-codes "30 ngày đầu" although each plan has its own targetDays**
    Người dùng thấy gì: Tin nhắn Slack buổi sáng luôn nói kế hoạch có 30 ngày đầu, dù kế hoạch thật có thể ngắn hoặc dài hơn 30 ngày, gây hiểu lầm về thời hạn thật của kế hoạch.
    file: `apps/agent/agent/lib/tin-nhac.ts`
    severity: low
    Đề xuất: known-limits

- **A retry after a successful Slack post sends the morning DM again**
    Người dùng thấy gì: Nếu có trục trặc kỹ thuật ngay sau khi tin Slack buổi sáng đã gửi thành công, người dùng có thể nhận lại đúng tin đó thêm một hoặc hai lần nữa.
    file: `apps/agent/agent/lib/nhac-ke-hoach.ts`
    severity: medium
    Đề xuất: known-limits

- **Day count and quiet days disagree between the Tasks card or Slack DM and the plan sheet**
    Người dùng thấy gì: Số ngày hiển thị trên thẻ công việc hoặc tin Slack có thể lệch một ngày so với số ngày hiện khi mở chi tiết kế hoạch, khiến hai nơi cùng nói về một kế hoạch nhưng đưa ra con số khác nhau.
    file: `packages/db/src/onboarding-nhac.ts`
    severity: medium
    Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
