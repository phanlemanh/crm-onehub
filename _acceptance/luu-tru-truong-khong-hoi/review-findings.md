# Review findings: luu-tru-truong-khong-hoi (round 2)

## Trong hợp đồng

Không có phát hiện nào ở round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **kiemNhomCat ngủ cứng 1200 ms rồi kiểm đúng một lần, không chờ theo điều kiện như helper sẵn có**
  Người dùng thấy gì: Phép đo tự động kiểm tra việc cất trường sang nhóm Đã lưu trữ có thể báo lỗi nhầm khi máy đang bận, dù tính năng vẫn chạy đúng. Người dùng không bị ảnh hưởng, chỉ có thể phải chạy lại phép đo khi gặp đỏ giả.
  file: `_acceptance/luu-tru-truong-khong-hoi/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Ảnh chụp được chép vào hồ sơ dù bước hỏng, kể cả ảnh cũ còn sót từ lượt trước (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi một lượt đo màn bị đỏ giữa chừng, hồ sơ nghiệm thu vẫn có thể giữ ảnh của lượt hỏng hoặc ảnh cũ, nên người xem ảnh có thể tưởng đó là kết quả mới.
  file: `_acceptance/luu-tru-truong-khong-hoi/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Phép đối chứng «trước khi bấm, không có toast nào» của E2 không có trong bài kiểm (r1)**
  Người dùng thấy gì: Bài kiểm không chứng minh rằng trước khi bấm Lưu trữ thì chưa có thông báo nào, nên một thông báo có sẵn từ trước có thể bị nhận nhầm là kết quả của nút.
  file: `apps/app/test/luu-tru-truong-khong-hoi.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Lưu trữ từ trình sửa đóng trình sửa trước khi biết kết quả: lỗi thì mất bản nháp (r1)**
  Người dùng thấy gì: Nếu việc lưu trữ một trường thất bại (mất quyền, mất mạng), trình sửa đã đóng sẵn và các chỉnh sửa chưa lưu của người dùng biến mất, họ chỉ thấy một thông báo lỗi.
  file: `apps/app/components/crm/fields/field-editor.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E1/E3 hứa «số lần gọi fields.list tăng» nhưng bài đếm lần gọi hàm cache giả (r1)**
  Người dùng thấy gì: Bài kiểm nhanh chỉ xác nhận hệ thống có ra lệnh làm mới danh sách, chưa xác nhận danh sách thật được tải lại, nên lỗi làm mới sai chỗ có thể lọt qua.
  file: `apps/app/test/luu-tru-truong-khong-hoi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên ma trận nhưng thiếu ma trận viết trước): E9 «3 bước x 2 trạng thái = 6 phép» không có ma trận hay phép đếm nào (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu ai đó chạy phép đo màn chỉ với một phần các bước, kết quả vẫn báo đạt dù chưa đo hết, nên có thể tưởng đã kiểm đủ.
  file: `_acceptance/luu-tru-truong-khong-hoi/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (thiếu đối chứng): E2 khai «Đối chứng: trước khi bấm, không có toast nào» nhưng bài không kiểm (r1)**
  Người dùng thấy gì: Bài kiểm không chứng minh rằng trước khi bấm Lưu trữ từ trình sửa thì chưa có thông báo nào, nên thông báo có sẵn có thể làm bài xanh nhầm.
  file: `apps/app/test/luu-tru-truong-khong-hoi.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (đối chứng đỏ giả): chiều đỏ --chieu-do của E10 ném thẳng thông điệp đã ghim, không đi qua bộ dò toast (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép thử đỏ cho phần thông báo chỉ in sẵn một lời báo lỗi, nên không chứng minh bộ dò thông báo thật sự biết báo đỏ khi thiếu thông báo.
  file: `_acceptance/luu-tru-truong-khong-hoi/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
