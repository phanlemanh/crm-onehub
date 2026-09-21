## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **COT_XONG sentinel and BAC_PHEU are copied into the client instead of coming from one shared module**
  Người dùng thấy gì: Nếu cấu hình cột chỉ được sửa ở một nơi mà quên sửa nơi còn lại, cột 'Đã xong mọi bước' trên bảng có thể hiện nhãn trống hoặc sai cho người dùng, dù các phép kiểm tự động vẫn báo ổn.
  file: `apps/app/app/(app)/[slug]/onboarding/danh-muc-bang-cot.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 3 (assert chuoi co mat thay vi QUAN HE) + 2 (hang so sentinel chep tay o ben doc, khong round-trip): E7 do khoa sentinel cua chinh writer, khong do nhan cot 'Da xong moi buoc' ma nguoi thay**
  Người dùng thấy gì: Bài kiểm hiện tại chưa thực sự bảo đảm cột 'Đã xong mọi bước' hiện đúng nhãn mà người dùng nhìn thấy trên màn hình, nên nếu nhãn đó sai một ngày nào đó, người dùng có thể là người phát hiện ra trước.
  file: `apps/api/test/quan-ly-danh-muc.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 4 (khang dinh am-tinh-mot-minh): E13-network.txt chi la mot cau 'khong co loi' khong doi chung duong**
  Người dùng thấy gì: Bằng chứng 'không có lỗi mạng' trong hồ sơ nghiệm thu chỉ là một câu viết sẵn không kèm số liệu, nên người ký nghiệm thu không có căn cứ thật để tin màn hình sạch lỗi khi tải dữ liệu.
  file: `_acceptance/quan-ly-danh-muc-30-ngay/evidence/E13-network.txt`
  severity: low
  Đề xuất: known-limits

- **Plan list and board now load the whole OnboardingPlan table on every request, dropping the repo's database-side paging pattern (r1)**
  Người dùng thấy gì: Khi danh mục có nhiều kế hoạch, mỗi lần mở, lọc hay tìm có thể chạy chậm dần vì máy chủ nạp lại toàn bộ danh sách thay vì chỉ phần cần xem.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: high
  Đề xuất: known-limits

- **A failed board query shows a loading skeleton forever (r1)**
  Người dùng thấy gì: Nếu bảng cột không tải được (mất mạng, máy chủ lỗi), người dùng sẽ thấy khung tải xoay mãi không có thông báo lỗi hay cách thử lại.
  file: `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx`
  severity: high
  Đề xuất: known-limits

- **Board columns are relabelled with the new split mode while the old columns are still shown (r1)**
  Người dùng thấy gì: Ngay sau khi đổi cách chia cột, người dùng có thể thấy nhãn và số đếm cột cũ bị gán nhầm trong vài giây trước khi dữ liệu mới về.
  file: `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): nửa màn hình của E1/E12 lấy dữ liệu từ KeHoachTho viết tay, không từ kết quả thật của thủ tục ở máy chủ (r1)**
  Người dùng thấy gì: Bằng chứng đã ký cho hai tình huống 'không có kết quả lọc' và 'cột đầy tràn' có thể không phản ánh đúng hành vi thật của máy chủ, nên một lỗi thật ở đó có thể chưa từng được phát hiện.
  file: `apps/app/test/danh-muc-quan-ly.dom.tsx`
  severity: high
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).