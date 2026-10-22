# Review findings: pre-push-phan-rieng-pr (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **vi_sao của t1Only mô tả luật bị đột biến chứ không phải luật đã cài (vế riêng_trước)**
  Người dùng thấy gì: Dòng giải thích trong khai báo của cổng mô tả hơi lệch cách so sánh ở đầu nhánh từ xa. Cổng vẫn chạy đúng luật; chỉ người đọc lời giải thích có thể hiểu sai một chi tiết.
  Căn cứ: Hành vi của cổng không đổi và không ai mất dữ liệu, chỉ là một câu giải thích có thể gây hiểu nhầm, và sửa câu chữ sau này rất rẻ.
  file: `.githooks/gate-shape.json`
  severity: medium
  Đề xuất: known-limits

- **Dòng «nặng» mới gọi tệp T1 dưới .github/ (hay tệp docs đi kèm) là «tệp ngoài T1»**
  Người dùng thấy gì: Trong một tình huống hẹp, khi đẩy các tệp tài liệu nằm trong thư mục cấu hình CI, thông báo của hook gọi chúng sai tên và không nói đúng lý do phải chạy đủ bước. Việc chạy đủ hay bỏ bước vẫn đúng.
  Căn cứ: Chỉ câu thông báo sai, không làm đẩy nhầm hay bỏ sót kiểm tra, và người đẩy vẫn thấy danh sách tệp để tự hiểu.
  file: `scripts/pre-push-t1.mjs`
  severity: low
  Đề xuất: known-limits

- **lich-su.mjs counts a classifier crash as a match in every heavy case**
  Người dùng thấy gì: Phép đo trên lịch sử gộp nhánh chưa phân biệt được ca bộ phân loại bị sập với ca nó trả kết quả nặng đúng. Hôm nay chưa ca nào sập nên kết quả vẫn đáng tin.
  Căn cứ: Không ảnh hưởng người dùng lúc này vì đã kiểm tay là không ca nào sập, và vá thêm điều kiện bắt lỗi là việc nhỏ có thể làm sau.
  file: `_acceptance/pre-push-phan-rieng-pr/rang/lich-su.mjs`
  severity: low
  Đề xuất: known-limits

- **vi_sao in gate-shape.json describes the remote-end comparison wrongly**
  Người dùng thấy gì: Lời giải thích trong khai báo của cổng diễn tả sai một chi tiết cách so với đầu nhánh từ xa, có thể làm người đọc hoặc người chấm hiểu nhầm. Cổng chạy vẫn đúng.
  Căn cứ: Chỉ là câu chữ, không đổi kết quả đẩy mã; nhược điểm duy nhất là gây hiểu nhầm và sửa lại tốn rất ít.
  file: `.githooks/gate-shape.json`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): ghim (3) của ho-so-cu kiểm dòng 6 của E1 cũ chỉ bằng «không kết thúc bằng -> rong», không ghim giá trị mới**
  Người dùng thấy gì: Bài kiểm chưa chặn được trường hợp ai đó sửa dòng ghi lời hứa mới trong hồ sơ cũ thành nội dung sai nhưng vẫn lọt. Cách hook cư xử thật vẫn được kiểm bằng chạy thật.
  Căn cứ: Chỉ là tài liệu mô tả lời hứa có thể lệch mà không bị bắt, không làm mất kiểm tra khi đẩy mã, và có thể siết lại bất cứ lúc nào.
  file: `_acceptance/pre-push-phan-rieng-pr/rang/ho-so-cu.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
