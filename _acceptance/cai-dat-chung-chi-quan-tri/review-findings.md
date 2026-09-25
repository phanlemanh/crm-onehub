## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **workspace.get.canManageSettings is still exposed but nothing reads it, so the same permission now has two sources**
  Người dùng thấy gì: Nếu giữ hai nơi cùng lưu quyền 'ai được đổi Cài đặt chung', người làm màn cài đặt sau này có thể vô tình dùng nhầm nguồn cũ, khiến quyền hiển thị không khớp thực tế trên một số màn mới.
  file: `apps/api/src/workspace/workspace.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **The new shared gate schema swallows parse failure and is looser than what the API returns**
  Người dùng thấy gì: Nếu máy chủ trả về dữ liệu quyền bị lỗi hoặc thiếu, người dùng có thể bị coi nhầm là đã xong việc cắm khoá mà không được báo lỗi, dù thực ra dữ liệu quyền không đọc được.
  file: `packages/validation/src/cong-nghien-cuu.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E8 so văn bản nguồn của khối it() cũ, còn nửa bun test không ghim số ca đã chạy**
  Người dùng thấy gì: Nếu sau này ai đó tắt hẳn một nhóm kiểm thử cũ thay vì xoá từng dòng, hệ thống chấm điểm vẫn báo đạt dù nhóm đó không còn chạy, nên một lỗi hồi quy có thể lọt qua mà không ai phát hiện.
  file: `_acceptance/cai-dat-chung-chi-quan-tri/rang/khang-dinh-cu-nguyen-ven.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E10 chứng «onboarding.ts gọi hàm chung» bằng cách tìm chuỗi import trong mã nguồn**
  Người dùng thấy gì: Phép đo này có thể báo đạt dù cổng không thực sự dùng lại đúng logic chung, nhưng hành vi thật khi người dùng đi qua cổng đã được đo bằng dữ liệu thật ở một phép đo khác, nên rủi ro thực tế thấp.
  file: `apps/api/test/cai-dat-chung-chi-quan-tri.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): ca «member» của proxy trong E6 dựng workspace viewerRole owner đi cùng canManage false**
  Người dùng thấy gì: Kịch bản kiểm thử cho vai thành viên dùng một tổ hợp quyền mà máy chủ thật không bao giờ tạo ra, nên chưa có bằng chứng đầy đủ rằng một thành viên thật gõ thẳng đường dẫn cắm khoá sẽ được đưa về đúng trang chính.
  file: `apps/app/test/onboarding-gate.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
