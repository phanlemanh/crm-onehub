## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **bom_gio_viec_sot copies apps/api's test command by hand instead of calling the package script**
  Người dùng thấy gì: Nếu sau này cách chạy kiểm thử của phần API đổi, bước đo việc máy sót có thể chạy lệch so với lệnh thật mà không ai hay. Người dùng cuối không thấy gì; chỉ làm kết quả nghiệm thu về sau kém đáng tin.
  Căn cứ: Hậu quả nhẹ, không chạm dữ liệu hay người dùng, chỉ có thể xảy ra khi có người đổi cách chạy kiểm thử và sửa sau rất rẻ.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: known-limits

- **Phần Iterations của báo cáo r1 gán nhầm dòng in của một bài kiểm khác cho bước đếm dem-sot ca-goi**
  Người dùng thấy gì: Báo cáo vòng đầu kể sai rằng một bước kiểm đã tìm ra dữ liệu sót thật, trong khi bước đó chưa hề chạy. Người đọc thẻ nghiệm thu có thể hiểu nhầm về vòng đã qua.
  Căn cứ: Chỉ là một câu mô tả lịch sử vòng đã đóng, không ảnh hưởng sản phẩm hay dữ liệu, và vòng sau đã nói đúng sự thật.
  file: `_acceptance/sua-bom-gio-test-api/evidence-report.md`
  severity: low
  Đề xuất: wont-fix

- **--patch không kèm giá trị lặng lẽ rơi về diff thật và in KHONG HA XANH**
  Người dùng thấy gì: Nếu ai đó gõ thiếu đối số khi chạy bước kiểm, nó có thể báo xanh giả thay vì báo lỗi. Hiện không lệnh nào của hồ sơ bị ảnh hưởng.
  Căn cứ: Chỉ xảy ra khi gõ sai tay, người chạy gõ lại là thấy, không mất dữ liệu và chưa làm sai kết quả nào.
  file: `_acceptance/sua-bom-gio-test-api/rang/pham-vi.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không có đối chứng dương): E6 đổi sang lệnh mới bom_gio_viec_sot nhưng chiều đỏ vẫn mượn của lệnh gốc, chưa chạy lại trên lệnh mới**
  Người dùng thấy gì: Bước kiểm xác nhận không còn việc máy sót chưa từng được thử trên một ca sót cố ý, nên chưa chứng minh được nó sẽ báo đỏ khi có sót thật. Hiện chưa có dấu hiệu dữ liệu sót.
  Căn cứ: Rủi ro là bỏ sót trong tương lai chứ chưa có hại thật, chỉ ảnh hưởng môi trường kiểm thử, không đụng người dùng hay dữ liệu thật.
  file: `_acceptance/sua-bom-gio-test-api/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Các hàng cấu hình đã tạm gỡ mất hẳn nếu ketThucMau ném lỗi ở afterAll (r1)**
  Người dùng thấy gì: Chỉ ảnh hưởng bài kiểm nội bộ, không ảnh hưởng người dùng sản phẩm. Nếu bước dọn hỏng giữa chừng, một số cấu hình mẫu trong bài kiểm có thể mất và làm các bài sau đỏ khó hiểu.
  Căn cứ: Chỉ xảy ra khi bài kiểm vốn đã hỏng, lỗi gốc vẫn được báo ra, chạy lại suite là hết và không đụng dữ liệu thật.
  file: `apps/api/test/gop-y-dung-cho.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Lần ghi setProgram thứ hai của cmst-goc để lại một hàng cấu hình mang ngày quá khứ (LUC_DOC), không bước dọn nào xoá (r1)**
  Người dùng thấy gì: Một bài kiểm để lại cấu hình mang ngày cũ, có thể làm một bài kiểm viết sau này đọc ra trạng thái AI bật ngoài ý muốn. Hiện toàn bộ suite vẫn xanh và người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Hiện chưa gây đỏ nào, chỉ là rủi ro tiềm ẩn cho bài kiểm tương lai, không chạm dữ liệu thật và sửa sau rẻ khi nó thật sự nổ.
  file: `apps/api/test/chu-may-sinh-ten-moi-goc.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp mà chỉ có điểm-case): HA_THUOC kể 7 dạng hạ thước nhưng chỉ có 1 mẫu, và để lọt test.failing, test.todoIf (r1 · tệp đã đổi)**
  Người dùng thấy gì: Công cụ canh giữ bài kiểm có thể bỏ sót vài cách lách hiếm gặp, như đảo nghĩa một ca kiểm. Hai tệp kiểm hiện tại không dính cách nào như vậy nên người dùng không bị ảnh hưởng.
  Căn cứ: Chỉ là lỗ hổng của công cụ canh trong tương lai, chưa có tệp nào lách, và đây là rủi ro nội bộ có thể bổ sung sau với chi phí thấp.
  file: `_acceptance/sua-bom-gio-test-api/rang/pham-vi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (đo có mặt thay cho quan hệ): vế «gop-y-dung-cho trả lại đúng các hàng cấu hình đã gỡ» của AC-5 chỉ được đo bằng việc suite thoát 0 (r1 · tệp đã đổi)**
  Người dùng thấy gì: Chưa có phép đo trực tiếp cho việc bài kiểm trả lại đủ cấu hình đã gỡ, nên nếu bước trả lại thiếu hàng thì có thể không ai thấy. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Hậu quả chỉ nằm ở độ tin cậy của bài kiểm nội bộ, không mất dữ liệu thật, và nếu thiếu hàng thì sẽ lộ ra khi bài kiểm khác đỏ.
  file: `_acceptance/sua-bom-gio-test-api/evals.yaml`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
