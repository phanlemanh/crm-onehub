## Trong hợp đồng

Không có phát hiện nào ánh xạ được vào một AC ở vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **addStep does not check departmentId, so an unknown id returns a raw 500 instead of a 4xx**
  Người dùng thấy gì: Nếu chọn một bộ phận không hợp lệ khi thêm bước, người dùng sẽ thấy một lỗi hệ thống chung chung thay vì thông báo dễ hiểu để sửa lại lựa chọn.
  file: `apps/api/src/onboarding/onboarding-ghi.ts`
  severity: medium
  Đề xuất: known-limits

- **The old plan page (HoSoKeHoach / DongMoKeHoach) is dead in production but three dom tests still exercise it**
  Người dùng thấy gì: Trang kế hoạch cũ không ai còn dùng vẫn nằm trong mã nguồn cùng các bài kiểm cũ; người dùng hiện tại không bị ảnh hưởng, nhưng một thay đổi sau này có thể vô tình sửa nhầm phần không ai dùng.
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx`
  severity: medium
  Đề xuất: known-limits

- **PLAN_CHANGE meta is not parsed at the read boundary: the API returns a raw record and the client hides parse failures**
  Người dùng thấy gì: Nếu dữ liệu của một vết thay đổi kế hoạch bị sai định dạng, người dùng chỉ thấy một dòng ghi chú mơ hồ kiểu 'không đọc được' trên dòng thời gian, không có manh mối gì thêm.
  file: `apps/app/components/crm/timeline/plan-change-line.ts`
  severity: medium
  Đề xuất: known-limits

- **reorderSteps caps stepIds at 100 while addStep has no cap, so a plan past 100 steps can never be reordered**
  Người dùng thấy gì: Một kế hoạch có hơn 100 bước sẽ không thể sắp xếp lại thứ tự các bước nữa — nút Lên và Xuống sẽ báo lỗi.
  file: `apps/api/src/onboarding/onboarding.contracts.ts`
  severity: low
  Đề xuất: known-limits

- **A plan with no steps offers no way to add its first step, so an empty plan stays empty for good**
  Người dùng thấy gì: Một kế hoạch không còn bước nào (do tạo không dùng khuôn, hoặc bước cuối cùng bị bỏ) sẽ mãi mãi trống — màn hình không cho cách nào để thêm lại bước đầu tiên.
  file: `apps/app/components/crm/record-sheet/plan-steps.tsx`
  severity: high
  Đề xuất: new-contract

- **"Move up" / "Move down" swap with the neighbouring step across the whole plan, so moves across department groups show no change**
  Người dùng thấy gì: Bấm nút Lên hoặc Xuống để đổi thứ tự một bước nằm giữa hai bộ phận khác nhau có thể không thấy tác dụng gì trên màn hình, khiến người dùng tưởng nút bị hỏng dù hệ thống đã âm thầm đổi.
  file: `apps/app/components/crm/record-sheet/plan-steps.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3: E16 chỉ assert chuỗi có mặt (tên người, nhãn bước), không assert quan hệ kind → câu**
  Người dùng thấy gì: Nếu câu hiển thị cho một loại thay đổi trên dòng thời gian vô tình bị lẫn sang câu của loại khác (ví dụ câu 'đánh dấu xong' hiện ra thay cho câu 'bỏ giao'), việc kiểm thử hiện tại sẽ không phát hiện ra lỗi đó.
  file: `apps/app/test/ke-hoach-sheet.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: nhánh âm của E4 (removeStep với bước của kế hoạch KHÁC → 404) thành một assert âm đứng một mình, lúc nào cũng đúng**
  Người dùng thấy gì: Bài kiểm cho tình huống bấm nhầm xoá bước của một kế hoạch khác chưa thực sự kiểm tra hệ thống có từ chối đúng cách hay không, nên nếu chỗ này có lỗi, việc kiểm thử sẽ không bắt được.
  file: `apps/api/test/ke-hoach-ban-ghi.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: đối chứng âm của E11 kiểm trạng thái khởi tạo thay vì hành vi bấm ra ngoài sheet**
  Người dùng thấy gì: Bài kiểm cho hành vi 'bấm ra ngoài để đóng sheet' chỉ kiểm trạng thái ban đầu chứ chưa thực sự bấm và kiểm kết quả, nên nếu tính năng đóng sheet bị lỗi, việc kiểm thử sẽ không phát hiện ra.
  file: `apps/app/test/ke-hoach-sheet.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
