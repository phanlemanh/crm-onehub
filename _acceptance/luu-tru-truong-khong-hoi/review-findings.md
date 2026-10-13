## Trong hợp đồng

- **Đo màn E9/E10 không kiểm trường nằm nhóm «Đã lưu trữ» rồi về nhóm đang dùng, dù AC-7 và E10 hứa**
  AC: AC-7
  file: `_acceptance/luu-tru-truong-khong-hoi/rang/man.mjs:135`
  severity: medium
  source: bugs
  detail: AC-7 hứa: lúc toast hiện thì trường nằm trong nhóm «Đã lưu trữ»; sau «Hoàn tác» thì trường về nhóm đang dùng, ở cả ba bước. Phần expected của E10 cũng ghi «truong o nhom «Đã lưu trữ»» và «truong ve nhom dang dung». Nhưng man.mjs không đọc DOM của danh sách để xem trường đang ở nhóm nào. Hàm hoanTac() (dòng 135-148) chỉ hỏi máy chủ qua daCat() (fields.list includeArchived). Bước 1 chỉ chờ toast khôi phục. Bước 3 chỉ xem ngăn còn mở hay không (dòng 262-266) và cũng không đếm alertdialog. Hệ quả: nếu `cache.fields(...)` trong use-luu-tru-truong.ts không làm mới danh sách sau lưu trữ hay sau hoàn tác, màn vẫn hiện trường ở nhóm cũ mà E9/E10 vẫn in «dat». Phần lời hứa ở tầng giao diện của AC-7 chưa có phép đo nào chạm tới. Bài DOM chỉ đếm số lần gọi mock `useCrmCache().fields` nên cũng không đỡ được chỗ này.
  rationale: AC-7 nói thẳng: lúc toast hiện trường nằm trong nhóm «Đã lưu trữ», sau «Hoàn tác» về nhóm đang dùng; phép đo màn không chạm tới phần này nên AC-7 chưa được chứng minh.

- **Hình dạng 3 (khẳng định «chuỗi có mặt» khi lời hứa là quan hệ): E10 hứa trường nằm ở nhóm «Đã lưu trữ» rồi về nhóm đang dùng, nhưng script chỉ dò chữ trong toast và cờ ở API**
  AC: AC-7
  file: `_acceptance/luu-tru-truong-khong-hoi/rang/man.mjs:182`
  severity: medium
  source: measurement
  detail: E10 (ui-observed) hứa ở bước 1 «truong o nhom «Đã lưu trữ»» sau khi lưu trữ, và ở cả ba bước «truong ve nhom dang dung» sau «Hoàn tác». Đó là quan hệ giữa trường cụ thể và nhóm chứa nó trên màn. Script không đọc nhóm nào trên màn. Sau khi lưu trữ, nó chỉ dò chuỗi `VI.fields.archived(nhan)` trong `[data-sonner-toaster]` (choToastCat, dòng 122-133). Sau «Hoàn tác», nó chỉ dò chuỗi `VI.fields.restored(f.label)` trong toast (dòng 182-190), cộng với `daCat` đọc cờ `archived` qua API (dòng 112-120, 146). Giả sử màn vẫn hiển thị trường ở nhóm sai (vì cache không làm mới hoặc lọc nhóm hỏng), toast và API vẫn đúng nên script vẫn in «dat». Quan hệ trường ↔ nhóm trên màn không được khẳng định ở bất kỳ bước nào.
  rationale: AC-7 hứa trường nằm đúng nhóm trên màn ở từng bước; script chỉ dò toast và cờ API nên phần giao diện của AC-7 chưa được chứng minh.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Ảnh chụp được chép vào hồ sơ dù bước hỏng, kể cả ảnh cũ còn sót từ lượt trước**
  Người dùng thấy gì: Khi một lượt đo màn bị đỏ giữa chừng, hồ sơ nghiệm thu vẫn có thể giữ ảnh của lượt hỏng hoặc ảnh cũ, nên người xem ảnh có thể tưởng đó là kết quả mới.
  file: `_acceptance/luu-tru-truong-khong-hoi/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Phép đối chứng «trước khi bấm, không có toast nào» của E2 không có trong bài kiểm**
  Người dùng thấy gì: Bài kiểm không chứng minh rằng trước khi bấm Lưu trữ thì chưa có thông báo nào, nên một thông báo có sẵn từ trước có thể bị nhận nhầm là kết quả của nút.
  file: `apps/app/test/luu-tru-truong-khong-hoi.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Lưu trữ từ trình sửa đóng trình sửa trước khi biết kết quả: lỗi thì mất bản nháp**
  Người dùng thấy gì: Nếu việc lưu trữ một trường thất bại (mất quyền, mất mạng), trình sửa đã đóng sẵn và các chỉnh sửa chưa lưu của người dùng biến mất, họ chỉ thấy một thông báo lỗi.
  file: `apps/app/components/crm/fields/field-editor.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E1/E3 hứa «số lần gọi fields.list tăng» nhưng bài đếm lần gọi hàm cache giả**
  Người dùng thấy gì: Bài kiểm nhanh chỉ xác nhận hệ thống có ra lệnh làm mới danh sách, chưa xác nhận danh sách thật được tải lại, nên lỗi làm mới sai chỗ có thể lọt qua.
  file: `apps/app/test/luu-tru-truong-khong-hoi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên ma trận nhưng thiếu ma trận viết trước): E9 «3 bước x 2 trạng thái = 6 phép» không có ma trận hay phép đếm nào**
  Người dùng thấy gì: Nếu ai đó chạy phép đo màn chỉ với một phần các bước, kết quả vẫn báo đạt dù chưa đo hết, nên có thể tưởng đã kiểm đủ.
  file: `_acceptance/luu-tru-truong-khong-hoi/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (thiếu đối chứng): E2 khai «Đối chứng: trước khi bấm, không có toast nào» nhưng bài không kiểm**
  Người dùng thấy gì: Bài kiểm không chứng minh rằng trước khi bấm Lưu trữ từ trình sửa thì chưa có thông báo nào, nên thông báo có sẵn có thể làm bài xanh nhầm.
  file: `apps/app/test/luu-tru-truong-khong-hoi.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (đối chứng đỏ giả): chiều đỏ --chieu-do của E10 ném thẳng thông điệp đã ghim, không đi qua bộ dò toast**
  Người dùng thấy gì: Phép thử đỏ cho phần thông báo chỉ in sẵn một lời báo lỗi, nên không chứng minh bộ dò thông báo thật sự biết báo đỏ khi thiếu thông báo.
  file: `_acceptance/luu-tru-truong-khong-hoi/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
