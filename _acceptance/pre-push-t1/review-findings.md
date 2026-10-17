# Review findings: pre-push-t1 (round 2)

## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

Không có finding mới ở round này. Chín mục của round trước được máy chèn vào đây kèm nhãn (r1).

- **Lý do bỏ test/build trong t1Only sai sự thật: nhiều bài test đọc chính tệp T1, và đó là răng giữ đồng bộ tài liệu với mã (r1)**
  Người dùng thấy gì: Khi chỉ sửa vài tệp tài liệu hoặc hướng dẫn của trợ lý mà có bài kiểm tra đang đọc chính các tệp đó, bước kiểm tra trước khi đẩy sẽ không chạy và lỗi lệch chỉ lộ ra muộn hơn, ở một lần đẩy nặng khác. Lời giải thích ghi trong cấu hình cũng nói quá rằng không mất gì so với kiểm tra tự động.
  file: `.githooks/gate-shape.json`
  severity: high
  Đề xuất: known-limits

- **Spec của hook gốc kho đặt trong @crm/ui, lệch khỏi nếp test script đang có (r1)**
  Người dùng thấy gì: Bài kiểm tra của bước đẩy mã nằm trong gói giao diện nên làm lượt kiểm tra của gói đó chậm hơn và khó tìm hơn. Không ảnh hưởng người dùng cuối.
  file: `packages/ui/test/pre-push-t1.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Đẩy chỉ tệp T1 vẫn có thể làm test đỏ: có bài test đọc tệp .md, nên lời cam kết «không mất chiều đỏ nào so với CI» là sai (r1)**
  Người dùng thấy gì: Trên một nhánh đã có mã, nếu lần đẩy tiếp theo chỉ sửa một tài liệu mà bài kiểm tra đang đối chiếu, bước kiểm tra trước khi đẩy sẽ cho qua và lỗi chỉ hiện ở kiểm tra tự động trên PR. Người làm sẽ phát hiện chậm hơn.
  file: `.githooks/gate-shape.json`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): test «khai» ghim hai khoá classifier/sameRuleAs mà không mã chạy nào đọc (r1)**
  Người dùng thấy gì: Hai dòng ghi chú trong cấu hình có thể lệch khỏi thực tế mà bài kiểm tra vẫn xanh. Hậu quả chỉ là thông tin tham chiếu bị sai, không đổi hành vi của bước đẩy mã.
  file: `packages/ui/test/pre-push-t1.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): run summary turbo giả nặn theo đúng các trường readLedger đọc (r1)**
  Người dùng thấy gì: Nếu công cụ dựng mã đổi dạng báo cáo của nó, một số bài kiểm tra vẫn xanh dù bước kiểm tra thật đã hỏng. Các kiểm tra chạy trên cây thật vẫn bắt được.
  file: `packages/ui/test/pre-push-t1.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): E1 hứa đối chứng dương ở MỌI kho tạm nhưng spec chỉ làm ở ca 1 (r1)**
  Người dùng thấy gì: Một số ca kiểm tra có thể báo xanh vì không thấy tệp nào chứ không phải vì thấy đúng tệp nặng. Nguy cơ là một lỗi phân loại đi lọt mà không ai biết.
  file: `packages/ui/test/pre-push-t1.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): nửa kiểm hook trong mot-nguon.mjs không có đột biến đối chứng (r1)**
  Người dùng thấy gì: Phép kiểm tra rằng bước đẩy mã không tự viết sẵn danh sách bỏ có thể im lặng hỏng ở phần quét tệp hook mà vẫn báo đạt. Người dùng chỉ thấy hậu quả nếu có ai sau này viết cứng danh sách bỏ vào hook.
  file: `_acceptance/pre-push-t1/rang/mot-nguon.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp, chỉ có điểm-case): bo-qua-viet-tay chỉ bắt chuỗi đúng bằng "test" hoặc "build" (r1)**
  Người dùng thấy gì: Nếu ai đó viết cứng danh sách bỏ dưới dạng một chuỗi gộp, phép kiểm tra tự động có thể không phát hiện. Khi đó bước đẩy mã có thể bỏ kiểm tra theo một danh sách không còn lấy từ cấu hình chung.
  file: `_acceptance/pre-push-t1/rang/mot-nguon.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính không ghim thông điệp): đối chứng âm của day-that không phân biệt «nặng» với «phân loại hỏng» (r1)**
  Người dùng thấy gì: Trên cây thật, bước phân loại bị hỏng và bước phân loại thấy tệp mã cho cùng một kết quả nên bài đối chứng không nói được là cái nào. Cả hai đều dẫn tới chạy đủ kiểm tra, nên người dùng không bị thiệt.
  file: `_acceptance/pre-push-t1/rang/day-that.mjs`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
