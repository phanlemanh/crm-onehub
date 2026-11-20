# Review findings: sua-bom-gio-test-api (round 1)

## Trong hợp đồng

- **Hình dạng 4 (âm tính một mình, đối chứng dương hỏng): chiều đỏ của E5 chỉ «đỏ» vì ENOENT, mẫu dương chi-them thì thoát 1**
  - file: `_acceptance/sua-bom-gio-test-api/evals.yaml:84`
  - severity: high
  - AC: AC-4
  - source: measurement
  - detail: E5 khai chiều đỏ và đối chứng dương bằng `--patch rang/mau/<mẫu>.patch`, trong khi lệnh chạy từ gốc kho. Ở `rang/pham-vi.mjs:84`, `readFileSync(resolve(gia))` đọc đường dẫn theo cwd, nên ra `<gốc>/rang/mau/...`, một chỗ không tồn tại. Tôi đã chạy thật từ gốc `bun _acceptance/sua-bom-gio-test-api/rang/pham-vi.mjs --khong-ha --patch rang/mau/chi-them.patch` và nhận ENOENT kèm stack trace, mã 1. Không dòng «KHONG HA XANH» nào được in. Vì vậy: (a) đối chứng dương chi-them, vốn phải thoát 0, thực ra thoát 1; (b) hai chiều đỏ bot-khang-dinh và them-skip cũng thoát 1, nhưng do tệp không có chứ không phải do thước bắt được dòng bớt hay skip. Thông điệp «KHONG HA DO: … bot 1 dong» không bao giờ được in. Ai chấm chỉ theo mã thoát sẽ tưởng thước đỏ đúng chỗ trong khi nó chưa đọc mẫu nào.
  - rationale: E5 là phép đo của AC-4 (chỉ thêm dòng, không bớt khẳng định, không thêm skip); chạy nguyên văn thì mẫu dương thoát 1 do thiếu tệp nên AC-4 không được đo thật.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Các hàng cấu hình đã tạm gỡ mất hẳn nếu ketThucMau ném lỗi ở afterAll**
  Người dùng thấy gì: Chỉ ảnh hưởng bài kiểm nội bộ, không ảnh hưởng người dùng sản phẩm. Nếu bước dọn hỏng giữa chừng, một số cấu hình mẫu trong bài kiểm có thể mất và làm các bài sau đỏ khó hiểu.
  Căn cứ: Chỉ xảy ra khi bài kiểm vốn đã hỏng, lỗi gốc vẫn được báo ra, chạy lại suite là hết và không đụng dữ liệu thật.
  file: `apps/api/test/gop-y-dung-cho.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Lần ghi setProgram thứ hai của cmst-goc để lại một hàng cấu hình mang ngày quá khứ (LUC_DOC), không bước dọn nào xoá**
  Người dùng thấy gì: Một bài kiểm để lại cấu hình mang ngày cũ, có thể làm một bài kiểm viết sau này đọc ra trạng thái AI bật ngoài ý muốn. Hiện toàn bộ suite vẫn xanh và người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Hiện chưa gây đỏ nào, chỉ là rủi ro tiềm ẩn cho bài kiểm tương lai, không chạm dữ liệu thật và sửa sau rẻ khi nó thật sự nổ.
  file: `apps/api/test/chu-may-sinh-ten-moi-goc.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp mà chỉ có điểm-case): HA_THUOC kể 7 dạng hạ thước nhưng chỉ có 1 mẫu, và để lọt test.failing, test.todoIf**
  Người dùng thấy gì: Công cụ canh giữ bài kiểm có thể bỏ sót vài cách lách hiếm gặp, như đảo nghĩa một ca kiểm. Hai tệp kiểm hiện tại không dính cách nào như vậy nên người dùng không bị ảnh hưởng.
  Căn cứ: Chỉ là lỗ hổng của công cụ canh trong tương lai, chưa có tệp nào lách, và đây là rủi ro nội bộ có thể bổ sung sau với chi phí thấp.
  file: `_acceptance/sua-bom-gio-test-api/rang/pham-vi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (đo có mặt thay cho quan hệ): vế «gop-y-dung-cho trả lại đúng các hàng cấu hình đã gỡ» của AC-5 chỉ được đo bằng việc suite thoát 0**
  Người dùng thấy gì: Chưa có phép đo trực tiếp cho việc bài kiểm trả lại đủ cấu hình đã gỡ, nên nếu bước trả lại thiếu hàng thì có thể không ai thấy. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Hậu quả chỉ nằm ở độ tin cậy của bài kiểm nội bộ, không mất dữ liệu thật, và nếu thiếu hàng thì sẽ lộ ra khi bài kiểm khác đỏ.
  file: `_acceptance/sua-bom-gio-test-api/evals.yaml`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
