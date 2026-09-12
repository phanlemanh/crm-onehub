> Review Findings: ma-tran-phai-co-chieu-song (round 2)

## Trong hợp đồng

- **Tuyên quét LỚP nhưng chỉ có điểm-case: khong-moc-lai dò so-sánh-chéo ở phạm vi cả bài, không phải thân vòng**
  Người dùng thấy gì: Thước chặn hình dạng cũ vẫn còn đúng cái lỗ mà vòng này sinh ra để bịt: nếu ai cấy hình dạng cũ vào BÊN TRONG một bài đã có sẵn phép so chéo, thước không thấy.
  file: `_acceptance/ma-tran-phai-co-chieu-song/rang/khong-moc-lai.mjs`
  severity: medium
  Đề xuất: nâng phạm vi sửa ngay

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Cửa hậu env KHAI_SINH cho phép đổi bản khai đã ghim, không ai dùng và không khai ở đâu**
  Người dùng thấy gì: Có một cách đổi bản khai đã ghim ngay lúc chạy mà không ai dùng và không chỗ nào khai — cửa để mở mà không có người gác.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/khai-sinh.mjs`
  severity: low
  Đề xuất: known-limits

- **khai-sinh.mjs: vector dispatch gives exit 2 for "caught", "survived", and "no such vector" alike**
  Người dùng thấy gì: Phép tự kiểm của bản khai sinh trả cùng một mã cho ba tình huống khác hẳn nhau, nên chính nó không tự phản chứng được.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/khai-sinh.mjs`
  severity: medium
  Đề xuất: known-limits

- **chung.mjs: failed `git worktree remove` is swallowed, leaving a stale registration in the shared git dir**
  Người dùng thấy gì: Dọn bản sao thất bại thì lỗi bị nuốt, và rác tích lại trong kho dùng chung cho mọi phiên khác.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/chung.mjs`
  severity: medium
  Đề xuất: known-limits

- **tu-kiem-khung.mjs: restore-on-signal handler is removed before the window it is meant to protect**
  Người dùng thấy gì: Bấm Ctrl-C đúng lúc dựng bản sao thì một tệp trong kho ở lại bẩn, vì lớp bảo vệ bị tháo ngay trước đoạn dài nhất.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/tu-kiem-khung.mjs`
  severity: low
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: điều 2 của bo-do-grep không có đối chứng dương riêng**
  Người dùng thấy gì: Một thước của hồ sơ trước có hai điều nhưng chỉ một điều từng được chứng minh đỏ; điều còn lại chưa đột biến nào chạm tới.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/bo-do-grep.mjs`
  severity: medium
  Đề xuất: known-limits

- **Không ghim được thông điệp: chuỗi ghim của E1/E5 trong khai-sinh.json là chính banner của răng**
  Người dùng thấy gì: Ba dòng khai sinh ghim vào chuỗi mà chính răng in ra trong mọi lượt, nên phép kiểm ấy không mang thông tin nào.
  file: `_acceptance/do-quyen-luot-bang-hanh-vi/rang/cong-quyen-do.mjs`
  severity: low
  Đề xuất: known-limits
