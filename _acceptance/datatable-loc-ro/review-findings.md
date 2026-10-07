# Review findings: datatable-loc-ro (round 2)

## Trong hợp đồng

Không có phát hiện nào ánh xạ được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **members-table still passes the old 'matches this view' text as the no-filter empty state (r1)**
  Người dùng thấy gì: Bảng thành viên, khi không lọc gì mà vẫn rỗng, sẽ nói «Không ai khớp với bộ lọc này» dù không có bộ lọc nào. Tình huống này gần như không xảy ra vì người đang xem luôn là một thành viên, nên chấp nhận và ghi vết.
  file: `apps/app/app/(app)/[slug]/settings/members/members-table.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 (tuyên quét lớp nhưng ma trận thiếu phần tử): E9 «loc-ro-chu» hứa 7 khoá, tệp chỉ có 4 (r1)**
  Người dùng thấy gì: Việc kiểm chữ tiếng Anh của ba câu «chưa có thoả thuận, cá nhân, công ty nào» không nằm trong cùng lệnh kiểm với các chữ khác. Nếu sau này ai đó viết nhầm chữ ở ba câu đó, một lệnh kiểm vẫn báo xanh.
  file: `packages/ui/test/data-table-locale.spec.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert «chuỗi có mặt» khi lời hứa là quan hệ vị trí): câu «Không có kết quả nào khớp bộ lọc» chỉ được kiểm là có trong DOM, không kiểm nằm trong khung nhìn (r1)**
  Người dùng thấy gì: Trên điện thoại, phép đo tự động chỉ chắc chắn rằng nút «Bỏ lọc» nằm trong màn hình, còn câu «Không có kết quả nào khớp bộ lọc» thì chỉ biết là có trên trang, chưa chắc không bị cắt mất.
  file: `_acceptance/datatable-loc-ro/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): khoá đếm trường tuỳ chỉnh «field:k1» ghi tay, không rút từ field-facets như E6 hứa (r1)**
  Người dùng thấy gì: Nếu sau này cách đặt tên số đếm của trường tuỳ chỉnh đổi ở phía máy chủ, phép kiểm tự động vẫn báo xanh trong khi lựa chọn số 0 của trường tuỳ chỉnh có thể biến mất trên màn thật.
  file: `apps/app/test/bang-crm-loc-ro.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **(r1) The new filter-empty branch in DataTable hides the onboarding table's error view and its retry button whenever a filter is active** — đã sửa ở round fix (bcad1554d): bảng danh mục đưa màn lỗi qua filteredEmpty
  Người dùng thấy gì: Ở bảng danh mục của màn làm quen, nếu đang lọc theo một nhóm rồi tải dữ liệu bị lỗi, người dùng sẽ thấy câu «Không có kết quả nào khớp bộ lọc» thay vì thông báo lỗi, và mất nút «thử lại». Họ tưởng là lọc không ra gì trong khi thật ra hệ thống đang lỗi.
  file: `packages/ui/src/components/data-table.tsx`
  severity: high
  Đề xuất: new-contract

- **(r1) The onboarding no-match view (KhongKhop with its «bỏ lọc» button) can no longer appear when facets are selected** — đã sửa ở round fix (bcad1554d): bảng danh mục đưa màn không khớp qua filteredEmpty
  Người dùng thấy gì: Ở bảng danh mục của màn làm quen, khi lọc ra kết quả rỗng người dùng không còn thấy nút «bỏ lọc» như trước, chỉ thấy câu chung chung không có đường ra. Họ phải tự gỡ từng bộ lọc bằng tay.
  file: `packages/ui/src/components/data-table.tsx`
  severity: medium
  Đề xuất: new-contract

- **(r1) Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): «menu con vẫn mở» và đối chứng «không có mục» chỉ kiểm ở menu thường, bỏ trống menu có ô tìm**
  Người dùng thấy gì: Ở menu lọc có ô tìm, chưa có phép kiểm tự động nào bắt lỗi nếu mục «Bỏ chọn» hiện ra cả khi chưa chọn gì hoặc làm menu đóng lại. Nếu sau này hỏng, người dùng mới là người thấy trước.
  file: `packages/ui/test/data-table-loc-ro.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **(r1) Hình dạng 5 (tuyên quét cả bộ chữ nhưng chỉ quét một nhánh): soát «Bỏ hết tiêu chí» chỉ ở messages('vi').table, và so bằng dấu bằng tuyệt đối**
  Người dùng thấy gì: Phép kiểm xác nhận chữ «Bỏ hết tiêu chí» đã biến mất chỉ soát một phần bộ chữ. Nếu chữ cũ còn nằm ở chỗ khác thì người dùng vẫn có thể gặp lại một nút tên sai.
  file: `packages/ui/test/data-table-loc-ro.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
