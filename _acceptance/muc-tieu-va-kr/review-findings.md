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

- **(r5) Below md the KR number button no longer carries data-so-kr, so signed-off so-okr-tu-chay E11 cannot find it at 390 px**
  Người dùng thấy gì: Trên điện thoại nút số của KR vẫn bấm được, nhưng phép đo đã ký của sổ số (so-okr-tu-chay, ảnh 390 px) không còn tìm ra nó — nếu nút này hỏng ở điện thoại sẽ không ai được báo. Đây là hồi quy thật của móc DOM mà AC-11 hứa giữ; phép đo đó đang đỏ sẵn trên onehub nên E14 không bắt được.
  file: `apps/app/app/(app)/[slug]/okr/bang-kr.tsx`
  severity: high
  Đề xuất: new-contract

- **(r6) KR title in the sheet's «Góp vào» line is user data but is not marked translate="no"**
  Người dùng thấy gì: Khi trình duyệt bật tự dịch, tên KR do người dùng đặt trong khu «Góp vào» có thể bị dịch, trong khi cùng tên đó ở chỗ khác thì giữ nguyên.
  file: `apps/app/components/crm/record-sheet/objective-sheet.tsx`
  severity: medium
  Đề xuất: known-limits

- **(r5) English sheet.tienDoTu always pluralises: «from 1 KRs»**
  Người dùng thấy gì: Ở giao diện tiếng Anh, mục tiêu chỉ có một KR hiện câu «from 1 KRs». Số liệu đúng, chỉ câu chữ sai số ít.
  file: `apps/app/lib/messages/okr.ts`
  severity: low
  Đề xuất: known-limits

- **(r6) E14's pre-written list omits the-gop-y-okr although the design doc names it beside the KR menu hooks**
  Người dùng thấy gì: Phép đo giữ móc của các việc đã ký chưa chạy lại phép đo màn của «Thẻ góp ý OKR», dù việc đó dùng menu KR mà vòng này viết lại — nếu menu KR hỏng với việc đó thì vòng này không thấy.
  file: `_acceptance/muc-tieu-va-kr/rang/ho-so-cham.mjs`
  severity: medium
  Đề xuất: known-limits

- **(r7) ho-so-cham.mjs: an uncaught git/JSON error exits 1, the same code as a regression or a passing red path**
  Người dùng thấy gì: Khi máy gặp sự cố môi trường, công cụ kiểm hồi quy có thể thoát như thể đã tìm thấy hồi quy (hoặc như chiều đỏ đã chứng) và để lại thư mục tạm. Sản phẩm không bị ảnh hưởng.
  file: `_acceptance/muc-tieu-va-kr/rang/ho-so-cham.mjs`
  severity: medium
  Đề xuất: known-limits

- **(r8) E13's «bảng cuộn dọc» check has no red path and passes empty when no table-container is found**
  Người dùng thấy gì: Phép kiểm máy cho việc bảng có cuộn dọc lạ hay không có thể báo xanh dù không thấy bảng nào để đo, nên một lỗi cuộn có thể lọt.
  file: `_acceptance/muc-tieu-va-kr/rang/man-mtkr.mjs`
  severity: medium
  Đề xuất: known-limits

- **(r10) At 375 px the sheet's top progress cell for an objective with no expectation shows «33% · lẽ ra …» truncated**
  Người dùng thấy gì: Ở điện thoại, ô tiến độ đầu sheet của mục tiêu chưa có kỳ vọng hiện «lẽ ra …» bị cắt chữ; nếu chữ bị cắt là «lẽ ra 0%» thì trái luật «kỳ vọng 0 là chưa có kỳ vọng». Ô này có từ trước vòng này.
  file: `apps/app/components/crm/record-sheet/objective-sheet.tsx`
  severity: low
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
