# Review Findings: to-chuc-danh-sach-chi-tiet (round 1)

## Trong hợp đồng

- **Import step 3 lists the preview's new-unit names, not the units the write actually created**
  file: `apps/app/app/(app)/[slug]/settings/organization/hop-thoai-nhap.tsx:245`
  severity: low
  AC: AC-7
  source: bugs
  detail: Step 3 builds its «Phòng ban mới / Bộ phận mới» list from `moi = ketQua?.xem.newNames`, which comes from the earlier previewImport call. applyImport re-parses against a fresh snapshot inside its transaction and returns only counts (newDepartments/newDivisions). If the organization changes between preview and write, the result step names units that were never created. Examples: another admin creates «Kho vận» in the meantime, or a member in the batch is removed so their row is dropped. The applied counts are available in `daGhi` but are ignored here. AC-7 requires the result step to name the new units that the write actually produced.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The new 50-item cap for bulk adds has no message and the screen does not enforce it, so going over it shows raw English Zod text**
  Người dùng thấy gì: Nếu một quản trị chọn hơn 50 người hoặc phòng ban trong một lượt, màn có thể hiện một câu lỗi tiếng Anh khó hiểu thay vì hướng dẫn rõ ràng, và không gì được lưu.
  file: `apps/api/src/to-chuc/to-chuc.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **Screen-width hook written locally with a hard-coded breakpoint instead of following the shared hook in packages/ui**
  Người dùng thấy gì: Nếu sau này có người chỉnh ngưỡng thu nhỏ màn ở một chỗ mà quên chỗ kia, cây thư mục và khung chi tiết có thể đổi cỡ màn hình không cùng lúc với nhau.
  file: `apps/app/app/(app)/[slug]/settings/organization/to-chuc.tsx`
  severity: low
  Đề xuất: known-limits

- **Add-people and attach-departments dialogs let you pick more than 50 items, and the server rejects them**
  Người dùng thấy gì: Trong một tổ chức lớn, admin có thể tích hơn 50 người hoặc phòng ban rồi bấm xác nhận mà nút vẫn cho bấm, chỉ để nhận một câu lỗi khó hiểu và không có gì được lưu.
  file: `apps/app/app/(app)/[slug]/settings/organization/hop-them-nguoi.tsx`
  severity: medium
  Đề xuất: known-limits

- **workspace.get failure is swallowed, and the root silently falls back to the generic label**
  Người dùng thấy gì: Nếu việc lấy tên không gian làm việc bị lỗi, tên gốc trên cây tổ chức âm thầm đổi thành «Toàn công ty» mà không có dấu hiệu nào báo có sự cố.
  file: `apps/app/app/(app)/[slug]/settings/organization/page.tsx`
  severity: low
  Đề xuất: known-limits

- **A crash mid-run in the screen-check script leaves seeded data behind and is reported as a product failure (exit 1)**
  Người dùng thấy gì: Nếu một lượt kiểm tra tự động bị dừng giữa chừng, dữ liệu để lại có thể làm lượt kiểm tiếp theo báo sai; việc này không ảnh hưởng tới người dùng thật.
  file: `_acceptance/to-chuc-danh-sach-chi-tiet/rang/man-chi-tiet.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hinh dang 3 (chuoi co mat thay cho quan he): dong phu trong hop Gan phong ban chi so theo khuon, khong so voi bo phan that cua tung phong ban**
  Người dùng thấy gì: Dòng gợi ý phụ trong hộp gắn phòng ban có sẵn có thể ghi sai bộ phận hiện tại của một phòng ban mà việc kiểm tự động không phát hiện ra.
  file: `apps/app/test/to-chuc-chi-tiet.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 4 (am tinh mot minh, doi chung lech khung): o thu tu cua BON_NUT trong bai chi-doc luon ra false vi o khung goc khong co nut data-nguoi**
  Người dùng thấy gì: Việc kiểm 'thành viên thường không thấy nút chọn trưởng' có thể luôn báo đạt dù một lỗi thật để lộ nút đó cho thành viên thường.
  file: `apps/app/test/to-chuc.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 5 (tuyen quet LOP nhung bo sot): san-thiet-ke.mjs noi quet className tren moi phan tu JSX nhung regex bo qua 15 the thanh phan**
  Người dùng thấy gì: Một số nút và hộp thoại mới có thể đang phá kiểu dùng chung của hệ thống mà công cụ rà lỗi thiết kế chưa bắt được.
  file: `_acceptance/to-chuc-danh-sach-chi-tiet/rang/san-thiet-ke.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 5 (tuyen quet 'khong menu nao' nhung chi mo mot menu): bai sap chi mo menu cua bo phan Van hanh**
  Người dùng thấy gì: Mục menu «Lên trên / Xuống dưới» có thể vẫn còn sót ở một vài chỗ khác trên màn mà chưa được kiểm chắc là đã bỏ hết.
  file: `apps/app/test/to-chuc-chi-tiet.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 3 (chuoi co mat thay cho gia tri): o so thu hai chi kiem textContent chua chu so K**
  Người dùng thấy gì: Ô số phòng ban chưa có trưởng ở đầu trang có thể hiện sai số mà việc kiểm tự động không phát hiện ra.
  file: `apps/app/test/to-chuc-chi-tiet.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hinh dang 4 (am tinh mot minh): viec ghi 'them nguoi dang giu phong ban phu' chi kiem dong khong con chu 'phu', khong co trang thai truoc lam doi chung**
  Người dùng thấy gì: Việc kiểm 'gắn phòng ban phụ chuyển thành phòng ban chính' có thể báo đạt dù nhãn phụ chưa từng đúng từ đầu, nên một lỗi thật ở đó có thể không bị phát hiện.
  file: `_acceptance/to-chuc-danh-sach-chi-tiet/rang/man-chi-tiet.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
