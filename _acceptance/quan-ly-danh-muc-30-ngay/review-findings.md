## Trong hợp đồng

### A step labelled 'xong' merges into the done column
- file: `apps/api/src/onboarding/onboarding-danh-muc.ts:279`
- severity: low
- AC: AC-7
- source: bugs

In the 'buoc' split, `gomCot` keys columns by the raw step label (`khoa: h.tacO`), while plans with every step done go into `cotXong()` with `khoa: "xong"`. A user-entered step label that is exactly "xong" gets the same Map key, so stuck plans and finished plans end up in one column. The column's `nhan` depends on which row came first, so on the client it shows either 'Đã xong mọi bước' or the step label, and the count mixes both groups. The fix is a separate key for the done column (a sentinel that cannot collide with a label) or keying steps by a prefixed value.

Rationale: AC-7 hứa mỗi nhãn bước đang tắc là một cột riêng và kế hoạch xong mọi bước nằm đúng cột «Đã xong mọi bước»; một bước tên đúng «xong» làm gộp nhầm hai nhóm đó vào một cột, thất bại đúng lời hứa này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Plan list and board now load the whole OnboardingPlan table on every request, dropping the repo's database-side paging pattern**
  Người dùng thấy gì: Khi danh mục có nhiều kế hoạch, mỗi lần mở, lọc hay tìm có thể chạy chậm dần vì máy chủ nạp lại toàn bộ danh sách thay vì chỉ phần cần xem.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: high
  Đề xuất: known-limits

- **DAY_MS defined a third time in the onboarding module instead of coming from its config**
  Người dùng thấy gì: Không ảnh hưởng đến người dùng — đây chỉ là một con số kỹ thuật được viết lặp ở ba nơi trong code, không đổi cách sản phẩm hoạt động.
  file: `apps/api/src/onboarding/onboarding-danh-muc.ts`
  severity: low
  Đề xuất: known-limits

- **Message interpolation uses a '{n}' placeholder plus .replace instead of the repo's function-message pattern**
  Người dùng thấy gì: Nếu sau này ai đó đổi cách dịch nhãn thời gian im lặng, người dùng có thể thấy chữ thô như '{n}' thay vì số ngày thực tế trên bảng cột.
  file: `apps/app/app/(app)/[slug]/onboarding/danh-muc-bang-cot.tsx`
  severity: low
  Đề xuất: known-limits

- **A failed board query shows a loading skeleton forever**
  Người dùng thấy gì: Nếu bảng cột không tải được (mất mạng, máy chủ lỗi), người dùng sẽ thấy khung tải xoay mãi không có thông báo lỗi hay cách thử lại.
  file: `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx`
  severity: high
  Đề xuất: known-limits

- **Board columns are relabelled with the new split mode while the old columns are still shown**
  Người dùng thấy gì: Ngay sau khi đổi cách chia cột, người dùng có thể thấy nhãn và số đếm cột cũ bị gán nhầm trong vài giây trước khi dữ liệu mới về.
  file: `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): nửa màn hình của E1/E12 lấy dữ liệu từ KeHoachTho viết tay, không từ kết quả thật của thủ tục ở máy chủ**
  Người dùng thấy gì: Bằng chứng đã ký cho hai tình huống 'không có kết quả lọc' và 'cột đầy tràn' có thể không phản ánh đúng hành vi thật của máy chủ, nên một lỗi thật ở đó có thể chưa từng được phát hiện.
  file: `apps/app/test/danh-muc-quan-ly.dom.tsx`
  severity: high
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).