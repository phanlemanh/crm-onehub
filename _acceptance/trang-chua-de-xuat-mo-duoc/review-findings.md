# Review findings: trang-chua-de-xuat-mo-duoc (round 1)

## Trong hợp đồng

- **Hình dạng 5 và 4: ma trận E2 thiếu đúng ô phân biệt được «thấy trang nhưng không thấy nguồn → nguon: null»; ô đó chỉ có trong chiều đỏ**
  file: `apps/api/test/tai-lieu-thay-trang.spec.ts:251`
  severity: high
  AC: AC-2
  source: measurement
  detail: Hợp đồng AC-2 hứa thêm vế «người không thấy nguồn nhận nguon: null và màn không có Xem nguồn». Nhưng mọi nguồn gieo ở lượt chạy xanh đều có taiBoiId = phien.tao.nguoi: trangTuNguon gọi nhan bằng 'tao', themNguon ở dòng 131 cũng ghi taiBoiId: phien.tao.nguoi. Ba trang có nguồn thì chỉ owner, admin, chu và tao thấy được, và cả bốn đều qua dieuKienThayNguon: owner/admin là quản trị, tao là người tải, chu là chủ trang. Vì vậy trong lượt chạy xanh không có ô nào mà get trả 200 trong khi nguồn bị lọc. Vòng lặp oCoNguon (dòng 251-268) chỉ đi qua những ô mà quan hệ «nguon.id thuộc taiLieuNguon.list» đúng sẵn, và `if (!nguon) continue` (dòng 262) bỏ qua ca nguon null mà không khẳng định gì. Bản vá có hay không có phép lọc `thayNguon` trong TaiLieuService.choLanDau thì lượt xanh vẫn xanh. Theo evals.yaml E2 (b), nguồn do 'admin' tải chỉ được gieo «bằng db, chỉ ở chiều đỏ», nên chiều đỏ chứng minh bộ đo bắt được lỗi trên bản sao, chứ không chứng minh cây đang xét có lọc. Phía DOM có cùng lỗ: trangVoi (tai-lieu-trang-cho.dom.tsx dòng 82) luôn đưa nguon khác null cho may-soan, go-tay và loi. Không ca nào render go-tay, loi hay may-soan với nguon: null để khẳng định «không có Xem nguồn» và không có dòng tên tệp.
  rationale: AC-2 hứa rõ vế «người không thấy nguồn nhận nguon: null và màn không có Xem nguồn»; lượt chạy xanh không gieo ca nào mà người thấy trang nhưng bị lọc nguồn, nên vế này chưa được chứng minh trên cây đang xét.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Two different rules for who may write by hand: the edit page lets a page open while the composer is drafting, but the reading screen hides the button**
  Người dùng thấy gì: Nếu ai đó gõ thẳng đường dẫn sửa của một trang mà máy đang soạn, họ vẫn mở được trình soạn trống và có thể gửi một bản viết tay song song với bản máy sắp soạn, khiến trang có hai bản đề xuất đầu tiên cạnh tranh nhau. Đi bằng nút trên màn đọc thì không gặp.
  file: `apps/app/app/(app)/[slug]/tai-lieu/[trang]/sua/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **A returned hand-written first version still shows as 'go-tay'/'loi', so the page never says it was returned**
  Người dùng thấy gì: Khi người viết tay bị chủ trang trả lại bản đầu, màn đọc có thể quay về lời cũ như Cần gõ tay hoặc Máy chưa soạn được, thay vì báo bản của họ đã bị trả lại. Người viết có thể không biết vì sao mình phải làm lại.
  file: `apps/api/src/tai-lieu/tai-lieu.service.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3: E7 hứa quan hệ giá trị (dangCho của owner là may-soan / go-tay), nhưng lệnh tcd_ma_tran chỉ khẳng định mã trạng thái**
  Người dùng thấy gì: Một kiểm tra khai là xác nhận chủ kho thấy đúng lời trạng thái của trang, nhưng thực tế chỉ xác nhận được là mở ra không lỗi. Lời trạng thái sai vẫn được các kiểm tra khác bắt, nên rủi ro thấp.
  file: `_acceptance/trang-chua-de-xuat-mo-duoc/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: E6 khai hai người × hai trang nhưng test chỉ chạy đường chéo hai ô**
  Người dùng thấy gì: Việc viết tay được kiểm cho chủ trang ở trang cần gõ tay và cho người tạo ở trang bị trả lại, nhưng chưa kiểm chéo hai người trên hai trang. Khả năng lỗi thấp vì hai vai dùng chung một luật.
  file: `apps/api/test/tai-lieu-thay-trang.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4: vế danh sách của E3 là khẳng định âm đứng một mình khi chạy riêng -t khong-thay**
  Người dùng thấy gì: Kiểm tra rằng người không có quyền không thấy trang trong danh sách có thể xanh cả khi danh sách của họ lỗi và trả rỗng, nên chưa chắc chắn tuyệt đối. Phần mở trang trực tiếp cùng kiểm tra đó thì có đối chứng.
  file: `apps/api/test/tai-lieu-thay-trang.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
