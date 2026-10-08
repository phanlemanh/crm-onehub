# Review findings: deal-va (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E7 in evals.yaml still describes the old line-diff tooth, not the rewritten statement comparison**
  Người dùng thấy gì: Phần mô tả cách kiểm tra 'không làm yếu các bài kiểm sẵn có' vẫn ghi theo cách cũ, trong khi cách kiểm thật đã chặt hơn. Người đọc hồ sơ có thể hiểu sai kiểm tra này đang làm gì, nhưng sản phẩm không bị ảnh hưởng.
  file: `_acceptance/deal-va/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Whitespace normalisation in cauExpect also strips spaces inside string literals**
  Người dùng thấy gì: Nếu ai đó chỉ sửa khoảng trắng trong chữ mà một bài kiểm mong đợi (ví dụ tên giai đoạn), bước canh sẽ không báo. Nguy cơ là một bài kiểm cũ bị đổi nhẹ mà không ai hay.
  file: `_acceptance/deal-va/rang/khong-xoa-expect.mjs`
  severity: low
  Đề xuất: known-limits

- **khong-xoa-expect.mjs passes trivially once the branch is in origin/onehub (anchor becomes HEAD)**
  Người dùng thấy gì: Sau khi tính năng đã gộp vào nhánh chính, bước canh bài kiểm sẽ luôn báo xanh vì không còn gì để so. Lần kiểm lại sau này có thể cho kết quả tốt giả.
  file: `_acceptance/deal-va/rang/khong-xoa-expect.mjs`
  severity: medium
  Đề xuất: known-limits

- **Guard compares only expect text, so test.skip/test.todo on an existing test passes undetected**
  Người dùng thấy gì: Một bài kiểm cũ có thể bị tắt đi mà bước canh vẫn báo xanh. Khi đó một phần bảo vệ đang có sẽ mất mà không ai thấy.
  file: `_acceptance/deal-va/rang/khong-xoa-expect.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 6 (đo vật khác cây đang kiểm): sau khi viết lại, rang khong-xoa-expect đọc blob HEAD đã commit, trong khi các lượt bun test của E7 chạy trên working tree**
  Người dùng thấy gì: Nếu có thay đổi chưa lưu vào lịch sử làm yếu một bài kiểm cũ, bước canh sẽ không thấy nhưng bước chạy kiểm vẫn dùng bản đã sửa. Kết quả xanh có thể không phản ánh đúng bản sắp giao.
  file: `_acceptance/deal-va/rang/khong-xoa-expect.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): E7 hứa «các ca sẵn có không đổi kỳ vọng», nhưng rang chỉ so nguyên văn câu expect gom thành một túi theo cả tệp**
  Người dùng thấy gì: Bước canh chỉ bắt được việc sửa hay xoá câu mong đợi, chưa bắt được các cách khác làm bài kiểm cũ mất tác dụng như đổi dữ liệu đầu vào hay chuyển câu sang chỗ không chạy. Cam kết 'bài kiểm cũ không bị làm yếu' vì vậy chưa được bảo đảm đầy đủ.
  file: `_acceptance/deal-va/rang/khong-xoa-expect.mjs`
  severity: medium
  Đề xuất: known-limits

- **Telemetry code in production now branches on GIAI_DOAN_GOC, which docs/api.md limits to seed and tests (r1)**
  Người dùng thấy gì: Số liệu ẩn danh theo giai đoạn nay dựa vào danh sách bảy giai đoạn gốc, trong khi tài liệu kỹ thuật vẫn nói danh sách đó chỉ dành cho dữ liệu mẫu và kiểm thử, và công cụ canh luật không báo gì. Người dùng không thấy khác biệt, nhưng tài liệu và công cụ canh có thể khiến người sửa sau này hiểu sai.
  file: `packages/telemetry/src/allowlist.ts`
  severity: medium
  Đề xuất: known-limits

- **Agent test imports app source to check a payload whose schema is duplicated by hand across two apps (r1)**
  Người dùng thấy gì: Hình dạng dữ liệu danh sách thoả thuận Kara trả vẫn được viết tay ở hai nơi, nên sau này sửa một nơi mà quên nơi kia thì bảng thoả thuận có thể hiện thiếu hoặc sai thông tin. Hiện tại hai nơi vẫn khớp nhau.
  file: `apps/agent/test/giai-doan-agent.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **E7 says `--tu-thu` exits 1 when it catches the fake diff, but the script exits 0 (r1)**
  Người dùng thấy gì: Mô tả của một bước kiểm nói sai mã kết quả khi bước tự thử bắt được lỗi giả. Sản phẩm không bị ảnh hưởng, chỉ có nguy cơ người đọc sau này hiểu nhầm và sửa sai bước kiểm.
  file: `_acceptance/deal-va/evals.yaml`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
