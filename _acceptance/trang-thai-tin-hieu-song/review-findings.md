# Review findings: trang-thai-tin-hieu-song (round 3)

## Trong hợp đồng

Không có mục nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **lucCommitCuaSha nuốt lỗi git, biến lỗi tra cứu thành «thiếu thông báo»**
  Người dùng thấy gì: Khi chủ kho chạy lệnh đo trên một bản kho tải thiếu lịch sử, kết quả có thể báo nhầm là có tín hiệu đổi chỗ mà không được thông báo và kết luận «không đạt», dù thông báo vẫn đến người gửi bình thường.
  Căn cứ: Chỉ ảnh hưởng con số đo của chủ kho, không ảnh hưởng người gửi tín hiệu; chạy lại trên bản kho đầy đủ là ra kết quả đúng, và sai lệch lộ ra là kết luận «không đạt» nên dễ bị nghi ngờ.
  file: `scripts/tin-hieu/do-bao-doi-cho.ts`
  severity: medium
  Đề xuất: known-limits

- **Lệnh đo tự tách chuỗi khoa để lấy ma/sha thay vì phân tích noiDung bằng schema có sẵn**
  Người dùng thấy gì: Người dùng không thấy gì khác hôm nay. Nếu sau này cách đặt khoá của thông báo đổi, lệnh đo của chủ kho có thể lặng lẽ bỏ sót một số dòng thay vì báo lỗi.
  Căn cứ: Không ảnh hưởng người gửi tín hiệu và chỉ phát sinh khi có người đổi khuôn khoá trong tương lai; sửa rẻ khi đó, nên không đáng mở việc riêng.
  file: `scripts/tin-hieu/do-bao-doi-cho.ts`
  severity: medium
  Đề xuất: wont-fix

- **Giá trị trả về `commit` và kiểu `CommitDo` của lanDoiTuGit thành mã chết sau lần sửa**
  Người dùng thấy gì: Không ảnh hưởng người dùng; chỉ là một phần mã trong công cụ đo của chủ kho không còn ai dùng.
  Căn cứ: Không đổi hành vi nào người dùng hay chủ kho thấy; để lại không gây hại và dọn được bất cứ lúc nào khi chạm lại tệp này.
  file: `scripts/tin-hieu/do-bao-doi-cho.ts`
  severity: low
  Đề xuất: wont-fix

- **A late notification gets labelled 'thiếu thông báo' instead of 'quá một ngày'**
  Người dùng thấy gì: Trong một tình huống hiếm (lượt đẩy của commit đổi chỗ không bao giờ chạy, thông báo đến từ lần đẩy muộn hơn một ngày), báo cáo đo ghi lý do là «thiếu thông báo» thay vì «trễ», và không hiện giờ thông báo thật.
  Căn cứ: Chỉ sai lý do ghi trên một dòng của báo cáo đo, kết luận cuối vẫn là «không đạt» và người gửi không bị ảnh hưởng; chủ kho tự đối chiếu được từ lịch sử.
  file: `scripts/tin-hieu/do-bao-doi-cho.ts`
  severity: low
  Đề xuất: known-limits

- **Eval E8 text still says 6 commits change LO-TRINH.html; the test now has 5**
  Người dùng thấy gì: Không ảnh hưởng người dùng; mô tả của một ca kiểm trong hồ sơ nói sáu commit trong khi bài test thật có năm, có thể làm người đối chiếu hồ sơ bối rối.
  Căn cứ: Chỉ là chữ trong hồ sơ nghiệm thu, không đổi hành vi sản phẩm; sửa một dòng, nhưng chữ lệch dễ bị người chấm sau để ý nên nên ghi lại.
  file: `_acceptance/trang-thai-tin-hieu-song/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (lời hứa là quan hệ giữa hai giá trị, nhưng bài so một giá trị với chính nó): ở E2, phép so «trang Tín hiệu chọn nguồn giống trang Lộ trình» không bao giờ gọi bộ đọc của trang Lộ trình (r2)**
  Người dùng thấy gì: Hai trang tín hiệu và trang Lộ trình có thể chọn khác nguồn dữ liệu trong một trường hợp hiếm là bản chụp lưu bị hỏng một phần, và bài kiểm tự động hiện không bắt được chỗ lệch này. Người dùng có thể thấy chỗ cũ của tín hiệu ở trang này nhưng chỗ mới ở trang kia.
  Căn cứ: Chỉ xảy ra khi dữ liệu bản chụp hỏng một phần, hiếm; hậu quả nhẹ (chỗ hiển thị cũ hơn một nhịp, tự hết khi có bản chụp kế tiếp), không mất dữ liệu, và bổ sung bài kiểm sau này rẻ.
  file: `apps/app/test/tin-hieu-nguon.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Nhánh này thêm một trang bằng chứng vào hồ sơ đã ký của tính năng khác (gom-tin-hieu-tu-chay) (r1)**
  Người dùng thấy gì: Bản giao mang theo một trang bằng chứng của tính năng gom tín hiệu đã ký mà người ký chưa từng xem. Người dùng không thấy gì khác đi, nhưng hồ sơ đã ký kia có thể bị coi là lệch.
  Căn cứ: Không ảnh hưởng người dùng cuối và không mất dữ liệu; gỡ tệp khỏi nhánh là việc rẻ nhưng thuộc dọn nhánh, không thuộc tính năng này.
  file: `_acceptance/gom-tin-hieu-tu-chay/evidence-page.html`
  severity: medium
  Đề xuất: known-limits

- **Luật «không bao giờ lùi» của bản chụp nay có hai bản cài đặt, và docs/api.md còn tả cách cũ (r1)**
  Người dùng thấy gì: Hiện có hai đường cùng ghi bản chụp lộ trình và tài liệu mô tả cách cũ. Người dùng chưa thấy lỗi nào, nhưng về sau hai đường có thể lệch nhau.
  Căn cứ: Hậu quả nhẹ và chỉ phát sinh khi sau này sửa một trong hai đường; người dùng không gặp, sửa sau không đắt.
  file: `apps/api/src/lo-trinh/tin-hieu-doi-cho.ts`
  severity: low
  Đề xuất: known-limits

- **Lệnh đo đưa dữ liệu chưa kiểm khuôn từ `git show` thẳng vào `choTinHieu` (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi dữ liệu lấy từ lịch sử git sai khuôn, lệnh đo của chủ kho sẽ dừng với lỗi khó hiểu thay vì báo rõ là không đọc được. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ chủ kho gặp, chạy lại là biết; không mất dữ liệu và không ảnh hưởng thông báo gửi cho người dùng.
  file: `scripts/tin-hieu/do-bao-doi-cho.ts`
  severity: low
  Đề xuất: known-limits

- **Phép đo báo đổi chỗ nuốt lỗi đọc tệp, rồi kết luận «đạt» với mã thoát 0 (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu lịch sử lộ trình không đọc được, lệnh đo của chủ kho có thể báo «đạt» thay vì báo hỏng, làm chủ kho tưởng mọi thông báo đều đúng hạn.
  Căn cứ: Chỉ ảnh hưởng phép đo sau một tháng của chủ kho, không ảnh hưởng người dùng cuối; chủ kho tự kiểm lại được khi thấy kết quả lạ.
  file: `scripts/tin-hieu/do-bao-doi-cho.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng có ô không đo thật): ô hang-khac trong ma trận 18 ô của E6 so hàm với chính nó (r1)**
  Người dùng thấy gì: Một trong các chỗ của tín hiệu chưa có phép kiểm so nhãn thông báo với nhãn trên trang, nên nhãn có thể lệch mà bài kiểm vẫn xanh.
  Căn cứ: Chỉ là một chỗ hiếm trong số chín, lệch chỉ là sai chữ chứ không mất dữ liệu, và người dùng báo được, sửa rẻ.
  file: `apps/app/test/thong-bao-cau.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
