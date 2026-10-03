## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **NhipGon copies the PaceIndicator component from packages/ui into the app**
  Người dùng thấy gì: Dấu nhịp trên màn hình nhỏ được dựng lại riêng thay vì dùng chung một thành phần. Người dùng thấy giống hệt, nhưng sau này sửa nhãn hay màu nhịp phải sửa ở hai nơi, dễ lệch.
  file: `apps/app/app/(app)/[slug]/okr/tien-do-kr.tsx`
  severity: medium
  Đề xuất: known-limits

- **Constant AN_DUOI_MD is declared in two files of the same area with different values**
  Người dùng thấy gì: Điểm ẩn cột ở màn hình nhỏ được khai hai lần trong mã. Người dùng không thấy gì khác, chỉ là sau này đổi điểm ngắt phải nhớ sửa cả hai chỗ.
  file: `apps/app/app/(app)/[slug]/okr/khoi-muc-tieu.tsx`
  severity: low
  Đề xuất: wont-fix

- **The proto sets SimpleTableRow colour and border by className instead of the new nested/joined variants**
  Người dùng thấy gì: Trang bản mẫu nội bộ vẫn tự đặt màu nền và viền hàng thay vì dùng kiểu chung. Sản phẩm thật không bị ảnh hưởng, nhưng bản mẫu có thể dần lệch so với màn thật khi kiểu chung đổi.
  file: `apps/app/app/proto/_modules/muc-tieu-va-kr/chi-tiet.tsx`
  severity: low
  Đề xuất: known-limits

- **Toggling one objective silently drops collapsed ids for objectives hidden by a filter or a unit switch**
  Người dùng thấy gì: Nếu bạn thu gọn một mục tiêu, rồi lọc hoặc đổi đơn vị làm nó biến mất, sau đó thu gọn mục tiêu khác, thì khi quay lại mục tiêu đầu sẽ tự mở ra mà không báo. Trạng thái thu gọn bị mất âm thầm.
  file: `apps/app/app/(app)/[slug]/okr/bang-muc-tieu.tsx`
  severity: low
  Đề xuất: new-contract

- **Shape 3 (a promised relation collapses into an identity): the 'eval thật đã chạy != M' check in ho-so-cham.mjs can never fail**
  Người dùng thấy gì: Phép kiểm tự báo động khi số bài đo thực chạy khác số dự kiến thực ra không bao giờ báo. Người dùng cuối không thấy gì, nhưng nếu một bài đo bị bỏ sót thì kết quả vẫn trông đầy đủ.
  file: `_acceptance/muc-tieu-va-kr/rang/ho-so-cham.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative assertion with no real control): E1's red-side pin 'muc tieu ngoai khung' fires only because the hooks are missing, not because KRs sit outside the frame**
  Người dùng thấy gì: Phép thử đỏ của bài đo gom hai kiểu lỗi khác nhau vào một thông báo, nên chưa chứng minh được nó bắt đúng trường hợp KR nằm ngoài khung. Màn hình thật không đổi, nhưng bài đo kém tin cậy hơn ở chiều bắt lỗi.
  file: `_acceptance/muc-tieu-va-kr/rang/man-mtkr.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
