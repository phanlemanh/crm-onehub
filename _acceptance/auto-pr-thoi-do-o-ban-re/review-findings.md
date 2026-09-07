## Trong hợp đồng

Không có finding nào ánh xạ được vào AC-1..AC-3 của hợp đồng hiện tại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Hồ sơ bằng chứng tả một bộ đo đã bị xoá, và mang verdict REJECT**
  Người dùng thấy gì: Báo cáo bằng chứng đang mô tả một vòng chấm cũ đã bị bỏ, không phải bản vá đang xét — người quyết định có thể đọc nhầm kết quả và ký duyệt sai.
  file: `_acceptance/auto-pr-thoi-do-o-ban-re/evidence-report.md:4`
  severity: high
  Đề xuất: known-limits

- **review-findings.md: cả bảy finding trỏ vào tệp không còn trong cây**
  Người dùng thấy gì: Danh sách vấn đề còn lại trỏ tới phần đã bị gỡ bỏ khỏi bản vá — người đọc không biết các cảnh báo này còn giá trị hay đã hết hiệu lực.
  file: `_acceptance/auto-pr-thoi-do-o-ban-re/review-findings.md:4`
  severity: medium
  Đề xuất: known-limits

- **Hồ sơ bằng chứng mô tả bộ đo đã bị xoá — không eval nào của bộ hiện tại từng chạy**
  Người dùng thấy gì: Không có bằng chứng cho thấy các phép kiểm tra hiện tại đã thực sự được chạy — người ký duyệt đang ký mà chưa thấy kết quả thật của bản vá.
  file: `_acceptance/auto-pr-thoi-do-o-ban-re/evidence-report.md:33`
  severity: high
  Đề xuất: known-limits

- **E2/E3 so với `origin/release` cục bộ, không kiểm ref có mới không, và mất hẳn đối chiếu `upstream/HEAD`**
  Người dùng thấy gì: Phép đo dùng để so bản vá với một bản sao lưu trong máy thay vì bản gốc của hãng — nếu bản sao đó cũ, kết quả có thể báo đạt dù thực tế đã lệch.
  file: `_acceptance/config.yaml:213`
  severity: medium
  Đề xuất: known-limits

- **Lỗi `gh` bị nuốt thành cùng mã thoát với hồi quy thật**
  Người dùng thấy gì: Khi công cụ kiểm tra không kết nối được mạng hoặc chưa đăng nhập, hệ thống có thể báo bản vá lỗi dù bản vá không có vấn đề gì.
  file: `_acceptance/config.yaml:212`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 6 — mốc ghim cứng ngoài cây: E1 đo commit c042478 trên GitHub, không đo cây đang kiểm**
  Người dùng thấy gì: Phép kiểm cố định vào một lần đẩy cũ trên GitHub thay vì đo bản mã hiện tại — nếu dòng khoá bị xoá sau này, phép kiểm vẫn báo đạt mãi mãi.
  file: `_acceptance/auto-pr-thoi-do-o-ban-re/evals.yaml:8`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 6 (biến thể) — evidence-report.md chứng nhận PASS cho bộ đo không còn tồn tại trong cây**
  Người dùng thấy gì: Báo cáo ghi nhận đạt cho những tiêu chí đã không còn áp dụng cho bản vá hiện tại — người đọc có thể tin nhầm rằng nhiều điều đã được kiểm chứng hơn thực tế.
  file: `_acceptance/auto-pr-thoi-do-o-ban-re/evidence-report.md:21`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 — chiều đỏ của E2 là đối chứng giả: `git diff --numstat HEAD` rỗng với mọi cây, có vá hay không**
  Người dùng thấy gì: Phép thử dùng để chứng minh công cụ đo có nhạy với lỗi hay không, thực ra không phân biệt được có bản vá hay không — độ tin cậy của phép đo thấp hơn báo cáo.
  file: `_acceptance/auto-pr-thoi-do-o-ban-re/evals.yaml:37`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — lời hứa là quan hệ với BẢN HÃNG, phép đo chỉ so với ref cục bộ `origin/release`**
  Người dùng thấy gì: Lời hứa là khớp với bản gốc của hãng, nhưng phép đo chỉ so với một bản sao lưu trong máy — hai thứ có thể lệch nhau mà không ai biết.
  file: `_acceptance/auto-pr-thoi-do-o-ban-re/evals.yaml:33`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có finding nào cờ unverified=true trong vòng này.

⚠ Cụm ngoài vùng phủ: 9/9 lỗi rơi vào file không bộ đo nào phủ (_acceptance/auto-pr-thoi-do-o-ban-re/evidence-report.md, _acceptance/auto-pr-thoi-do-o-ban-re/review-findings.md, _acceptance/config.yaml, _acceptance/auto-pr-thoi-do-o-ban-re/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
