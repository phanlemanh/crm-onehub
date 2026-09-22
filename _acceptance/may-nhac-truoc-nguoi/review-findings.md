## Trong hợp đồng

(rỗng — không có finding nào map được vào AC ở vòng này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Test support in apps/agent imports apps/api source by relative path, pulling in packages agent does not declare**
  Người dùng thấy gì: Việc này không ảnh hưởng gì tới người dùng cuối; đây là cách tổ chức mã kiểm thử nội bộ chưa đúng chuẩn của kho, không phải lỗi của tính năng nhắc.
  file: `apps/agent/test/support/nhac-gieo.ts`
  severity: medium
  Đề xuất: known-limits

- **External seed user has a fixed id that donDep never cleans, so an aborted run breaks the next run on a shared DB**
  Người dùng thấy gì: Nếu một lượt kiểm thử bị dừng giữa chừng trên cơ sở dữ liệu thử nghiệm dùng chung, các lượt kiểm thử sau có thể báo lỗi cho tới khi ai đó dọn tay bằng lệnh riêng — không ảnh hưởng tới người dùng thật.
  file: `apps/agent/test/support/nhac-gui-gieo.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): bước 'ngoai-duong-do' trong E12 không có đối chứng dương cho thấy nó thật sự nằm trong daGui**
  Người dùng thấy gì: Bài kiểm thử chứng minh máy lọc đúng dữ liệu của người ngoài kế hoạch hiện chưa thực sự chứng minh được điều đó — nếu sau này có lỗi để lọt dữ liệu người ngoài vào bản tin nhắc, phép thử này vẫn có thể báo xanh như bình thường.
  file: `apps/agent/test/nhac-ke-hoach.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **English users see the Vietnamese-only goiY hint on the dashboard, marked translate="no" (r1)**
  Người dùng thấy gì: Người dùng xem giao diện tiếng Anh vẫn thấy dòng gợi ý về kế hoạch im bằng tiếng Việt trên bảng điều khiển, và trình duyệt bị chặn không tự dịch được dòng đó.
  file: `packages/db/src/onboarding-nhac.ts`
  severity: medium
  Đề xuất: known-limits

- **OnboardingTheoDoi is a Nest provider and also built by hand with new, so two instances exist (r1)**
  Người dùng thấy gì: Không có hậu quả nào người dùng nhìn thấy; đây là cách tổ chức mã nội bộ, không ảnh hưởng tới tính năng nhắc kế hoạch mà người dùng trải nghiệm.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: low
  Đề xuất: wont-fix

- **The Slack greeting hard-codes "30 ngày đầu" although each plan has its own targetDays (r1)**
  Người dùng thấy gì: Tin nhắn Slack buổi sáng luôn nói kế hoạch có 30 ngày đầu, dù kế hoạch thật có thể ngắn hoặc dài hơn 30 ngày, gây hiểu lầm về thời hạn thật của kế hoạch.
  file: `apps/agent/agent/lib/tin-nhac.ts`
  severity: low
  Đề xuất: known-limits

- **A retry after a successful Slack post sends the morning DM again (r1)**
  Người dùng thấy gì: Nếu có trục trặc kỹ thuật ngay sau khi tin Slack buổi sáng đã gửi thành công, người dùng có thể nhận lại đúng tin đó thêm một hoặc hai lần nữa.
  file: `apps/agent/agent/lib/nhac-ke-hoach.ts`
  severity: medium
  Đề xuất: known-limits

- **Day count and quiet days disagree between the Tasks card or Slack DM and the plan sheet (r1)**
  Người dùng thấy gì: Số ngày hiển thị trên thẻ công việc hoặc tin Slack có thể lệch một ngày so với số ngày hiện khi mở chi tiết kế hoạch, khiến hai nơi cùng nói về một kế hoạch nhưng đưa ra con số khác nhau.
  file: `packages/db/src/onboarding-nhac.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(rỗng — không có finding nào mang unverified=true ở vòng này)

⚠ Cụm ngoài vùng phủ: 2/3 lỗi rơi vào file không bộ đo nào phủ (apps/agent/test/support/nhac-gieo.ts, apps/agent/test/support/nhac-gui-gieo.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
