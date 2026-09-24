# Review Findings: neo-dan-so-khong-cung

## Trong hợp đồng

(không có finding nào map được vào AC — rỗng)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The original-version control in E1/E3/E4 still depends on the file count equalling 478, so the brittleness this feature removes comes back inside its own evals**
  Người dùng thấy gì: Nếu sau này có người thêm một tệp mã nguồn mới vào dự án, phép đo nội bộ của tính năng này có thể tự báo lỗi giả và làm việc ghim lại bị kẹt, dù tính năng không có lỗi thật.
  file: `_acceptance/neo-dan-so-khong-cung/rang/do-neo.mjs`
  severity: medium
  Đề xuất: known-limits

- **docGit takes git ls-files at face value: a tracked file deleted in the working tree is reported as BO-SOT (the walker missed a file)**
  Người dùng thấy gì: Nếu ai đó xoá tạm một tệp mã đang được git theo dõi nhưng chưa lưu (chưa commit) việc xoá đó, công cụ kiểm tra có thể báo lỗi giả 'bỏ sót tệp' và chặn công việc dù không có lỗi thật.
  file: `_acceptance/chan-lai-component-ra-man/rang/lai-ra-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **lenhTuConfig/globT1 parse config.yaml by hand instead of with Bun.YAML.parse, the parser other scripts in the repo already use**
  Người dùng thấy gì: Nếu cách viết lệnh trong tệp cấu hình sau này đổi kiểu (ví dụ dùng dấu ngoặc đặc biệt), bước kiểm tra nội bộ có thể âm thầm chạy nhầm lệnh mà không ai nhận ra.
  file: `_acceptance/neo-dan-so-khong-cung/rang/do-neo.mjs`
  severity: low
  Đề xuất: known-limits

- **Unstaged deletion or rename of a tracked file turns the gate red with a false 'BO-SOT' that blames the file walker**
  Người dùng thấy gì: Nếu ai đó xoá hoặc đổi tên một tệp mã đang được git theo dõi mà chưa lưu thay đổi đó, công cụ kiểm tra có thể báo lỗi giả và chặn công việc dù không có lỗi thật.
  file: `_acceptance/chan-lai-component-ra-man/rang/lai-ra-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **E1, E3 and E4 fail with exit 2 (TIEN DE) as soon as the tree has more or fewer than 478 source files, bringing back the fragility this change removes**
  Người dùng thấy gì: Khi dự án có thêm hoặc bớt tệp mã nguồn theo thời gian, một phần phép đo nội bộ của tính năng này có thể tự báo lỗi sai và bị kẹt vĩnh viễn dù tính năng vẫn đúng.
  file: `_acceptance/neo-dan-so-khong-cung/rang/do-neo.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (không ghim thông điệp): ca (c) của E5 vẫn xanh khi bỏ hẳn chặn «gốc git khác gốc đang đo»**
  Người dùng thấy gì: Việc kiểm tra cho tình huống 'thư mục đo nằm trong một kho git khác' có thể vẫn báo đạt ngay cả khi phần chặn thật sự đã bị gỡ bỏ sau này, khiến lỗi đó âm thầm lọt qua mà không ai phát hiện.
  file: `_acceptance/neo-dan-so-khong-cung/rang/do-neo.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
