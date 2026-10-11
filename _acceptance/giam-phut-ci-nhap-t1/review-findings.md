# Review findings: giam-phut-ci-nhap-t1 (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **T1 classification via `**/*.md` skips the `test` job for .md files that tests and the agent read**
  Người dùng thấy gì: Một PR sẵn sàng chỉ sửa tệp chữ mà ứng dụng hoặc bài kiểm thật sự đọc (lời dặn của trợ lý AI, tài liệu thiết kế) sẽ không chạy bài kiểm nào. Lỗi có thể lọt vào nhánh chính mà CI vẫn xanh.
  file: `.github/scripts/phan-loai.mjs`
  severity: high
  Đề xuất: known-limits

- **Classifier logic lives in files listed as T1 outside .github/, contradicting the 'editing the classifier always runs the full set' invariant**
  Người dùng thấy gì: Nếu ai chỉ sửa cách đọc danh sách tệp tài liệu hoặc cách so khớp, PR đó có thể bị coi là chỉ tài liệu và không chạy kiểm đầy đủ, dù nó làm đổi cách phân loại. Bài kiểm riêng của bộ phân loại vẫn bắt được hỏng nặng.
  file: `.github/scripts/phan-loai.mjs`
  severity: low
  Đề xuất: known-limits

- **PRs touching only T1 files now skip every CI test, but the T1 list includes .md files that tests check and agent prompts the app runs**
  Người dùng thấy gì: PR chỉ sửa tài liệu thiết kế hoặc lời dặn của trợ lý AI sẽ không chạy các bài kiểm đang đọc chính những tệp đó. Sau khi gộp, nhánh chính cũng không có lượt kiểm nào bắt lại, chỉ còn bước kiểm cục bộ trước khi đẩy.
  file: `.github/scripts/phan-loai.mjs`
  severity: medium
  Đề xuất: known-limits

- **do-phut-ci swallows failed log fetches, so the T1 threshold can pass when it should fail**
  Người dùng thấy gì: Khi công cụ đo 7 ngày không tải được nhật ký của một lượt, nó coi lượt đó không phải lượt chỉ tài liệu và không báo lỗi. Người quyết có thể nhận kết luận lạc quan hoặc thấy chưa có lượt nào.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/do-phut-ci.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không ghim thông điệp): E7 coi «cùng mã thoát» là «đỏ sẵn», nên che được hồi quy**
  Người dùng thấy gì: Phép so với bản cũ chỉ xem lệnh đỏ hay không đỏ, không xem đỏ nặng hơn bao nhiêu. Một lệnh vốn đỏ sẵn mà vòng này làm đỏ thêm vẫn bị ghi là đỏ sẵn, nên người duyệt phải đọc nhật ký mới thấy.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/khong-do-them.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng số assert không đếm độc lập): kiểm «so-o» của E1 luôn đúng**
  Người dùng thấy gì: Bài kiểm bộ phân loại tự khai đủ số tình huống nhưng không đếm độc lập. Nếu ai xoá bớt một tình huống thì không có gì báo thiếu.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/phan-loai.mjs`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 2 (không round-trip qua bên đọc thật): bên đối chiếu của E2(a) lấy danh sách glob từ chính bộ phân loại**
  Người dùng thấy gì: Bài kiểm 'chỉ một nguồn danh sách tệp tài liệu' lấy danh sách từ chính bộ phân loại, nên một lỗi khi đọc danh sách có thể không bị phát hiện.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/mot-nguon.mjs`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture viết tay đi tắt qua bên đọc): dòng «nguong T1» của E9 chưa từng đi qua bộ đọc log**
  Người dùng thấy gì: Bài kiểm ngưỡng lượt chỉ tài liệu dùng dữ liệu dựng sẵn và chưa từng đi qua bước đọc nhật ký thật. Lỗi ở bước đọc nhật ký sẽ không bị bài kiểm này bắt.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/do-phut-ci.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính không ghim thông điệp): ca «PATH không có bash» của E1 nhận mọi lỗi**
  Người dùng thấy gì: Bài kiểm trường hợp thiếu công cụ chạy lệnh chấp nhận mọi kiểu lỗi, chưa chứng minh đúng nhánh lỗi đó đã chạy. Trường hợp thật vẫn an toàn vì lỗi nào cũng buộc chạy đủ job nặng.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/phan-loai.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (âm tính một mình): E12 coi mọi HTTP 404 là tập rỗng, nên phép «tập con» đúng một cách rỗng**
  Người dùng thấy gì: Khi đọc luật bảo vệ nhánh bị lỗi 404 vì lý do khác (sai kho, thiếu quyền), công cụ coi như không có check bắt buộc nào và báo ổn. Người duyệt có thể tin nhầm là CI mới không làm kẹt PR.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/nen-gop.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): E11 không đòi job «check-types, lint» phải có mặt**
  Người dùng thấy gì: Phép kiểm trên lượt CI thật của PR nháp không báo lỗi nếu bước kiểm kiểu và lint biến mất khỏi lượt chạy. Thay đổi cấu hình như vậy vẫn bị bài kiểm đọc tệp workflow bắt.
  file: `_acceptance/giam-phut-ci-nhap-t1/rang/luot-that.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
