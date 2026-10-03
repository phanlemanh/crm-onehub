## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **NhipGon copies PaceIndicator from packages/ui at the call site**
  Người dùng thấy gì: Dấu nhịp trên điện thoại là một bản sao riêng của dấu nhịp dùng chung. Hôm nay hai bên giống nhau, nhưng sau này đổi nhãn hoặc màu nhịp ở một nơi có thể quên nơi kia, khiến hai màn hiện khác nhau.
  file: `apps/app/app/(app)/[slug]/okr/tien-do-kr.tsx`
  severity: medium
  Đề xuất: known-limits

- **AN_DUOI_MD is declared twice in the same area with different values**
  Người dùng thấy gì: Điểm chuyển giữa bố cục điện thoại và máy tính được khai ở hai nơi. Nếu sau này chỉ sửa một nơi, hàng mục tiêu và hàng KR có thể chuyển bố cục lệch nhau trên màn cỡ vừa.
  file: `apps/app/app/(app)/[slug]/okr/khoi-muc-tieu.tsx`
  severity: low
  Đề xuất: known-limits

- **English tienDoTu has no plural form: 'from 1 KRs'**
  Người dùng thấy gì: Ở giao diện tiếng Anh, mục tiêu chỉ có một KR hiện câu «from 1 KRs», sai ngữ pháp. Số liệu vẫn đúng, chỉ là chữ nghe vụng.
  file: `apps/app/lib/messages/okr.ts`
  severity: low
  Đề xuất: known-limits

- **Aligned KR title in the sheet's 'Contributes to' section is not marked translate="no"**
  Người dùng thấy gì: Khi trình duyệt bật tự dịch, tên KR do người dùng đặt trong khu «Góp vào» có thể bị dịch sai, trong khi cùng tên đó ở chỗ khác thì giữ nguyên.
  file: `apps/app/components/crm/record-sheet/objective-sheet.tsx`
  severity: low
  Đề xuất: known-limits

- **English sheet.tienDoTu is always plural ('from 1 KRs')**
  Người dùng thấy gì: Ở giao diện tiếng Anh, mục tiêu có đúng một KR vẫn đọc là «from 1 KRs». Con số đúng, chỉ câu chữ sai ngữ pháp.
  file: `apps/app/lib/messages/okr.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): E13 kiểm «bảng cuộn dọc» không có chiều đỏ và qua rỗng khi không thấy table-container nào**
  Người dùng thấy gì: Phép kiểm máy cho việc bảng có bị cuộn lạ hay không có thể báo xanh dù không thấy bảng nào để đo, nên một lỗi cuộn có thể lọt mà không ai biết.
  file: `_acceptance/muc-tieu-va-kr/rang/man-mtkr.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (đối chứng dương rỗng): chiều đỏ E1 trên ST-hien-tai đỏ vì proto không có móc DOM, không phải vì KR nằm ngoài khung**
  Người dùng thấy gì: Phép thử cho thấy máy bắt được lỗi «mục tiêu nằm ngoài bảng» lại đỏ vì lý do khác, nên chưa chứng minh được máy sẽ bắt đúng lỗi đó nếu nó xảy ra thật.
  file: `_acceptance/muc-tieu-va-kr/rang/man-mtkr.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (bộ đếm ma trận tự quy chiếu): chặn 'số eval thật đã chạy != M' của ho-so-cham không bao giờ đỏ được**
  Người dùng thấy gì: Phép kiểm «đã chạy đủ số eval» không thể báo thiếu, vì nó tự đếm theo chính danh sách nó kiểm. Hậu quả chỉ là một lớp bảo hiểm thừa, không ảnh hưởng người dùng.
  file: `_acceptance/muc-tieu-va-kr/rang/ho-so-cham.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (âm tính một mình): E5 chỉ khẳng định transition-duration 0s khi giảm chuyển động, phép đối chứng no-preference chỉ được ghi**
  Người dùng thấy gì: Máy kiểm việc mũi tên đứng yên khi người dùng bật giảm chuyển động, nhưng không kiểm rằng bình thường nó có chuyển động. Nếu mũi tên vốn không có chuyển động, phép kiểm vẫn báo xanh.
  file: `_acceptance/muc-tieu-va-kr/rang/man-mtkr.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/9 lỗi rơi vào file không bộ đo nào phủ (apps/app/lib/messages/okr.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
