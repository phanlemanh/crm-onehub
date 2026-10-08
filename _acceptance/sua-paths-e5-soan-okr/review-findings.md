# Review findings: sua-paths-e5-soan-okr (round 1)

## Trong hợp đồng

- **E5 (pre-merge.mjs) fails during S4 by design: the only violation pre-merge-check finds is this round's own missing evidence-report.md**
  AC: AC-5
  file: `_acceptance/sua-paths-e5-soan-okr/rang/pre-merge.mjs:447`
  severity: high
  source: bugs
  detail: docKetQua() calls bao('ma-thoat:<n>') whenever pre-merge-check.sh exits non-zero, no matter which slug caused it. The contract for this round is at status: implemented (cf0658e6a) and has no evidence-report.md yet. At that state pre-merge-check.sh (line 1148) always prints 'VIOLATION [sua-paths-e5-soan-okr]: status=implemented but no evidence-report.md' and exits 1. The script's own output from the run after the implemented commit (.acceptance-runs/sua-paths-e5-soan-okr/pre-merge.txt, 17:40) shows exactly that: 'OK [soan-okr-cung-tro-ly]: PASS ...' together with 'VIOLATION [sua-paths-e5-soan-okr]: status=implemented but no evidence-report.md' and 'pre-merge-check: 1 violation(s) — merge blocked'. So E5 returns exit 1 with 'ma-thoat:1' every time S4 runs it, because S4 writes evidence-report.md only after the evals finish. The check is circular: it can only go green once the evidence it is supposed to produce already exists. As a result, the soan-okr-cung-tro-ly re-pin, which is the part AC-5 actually promises, is reported red even though that slug is clean. Fix: drop the global exit-code requirement and judge only the lines for SLUG_HO_SO. Alternatively, ignore violations whose slug is the round's own slug (sua-paths-e5-soan-okr), or run with --slug soan-okr-cung-tro-ly as an extra check after the full run.
  rationale: AC-5 đòi lệnh pre-merge-check thoát 0; khi chấm ở S4 hồ sơ của chính vòng này chưa có báo cáo bằng chứng nên lệnh luôn thoát 1, làm AC-5 đỏ dù hồ sơ soan-okr-cung-tro-ly sạch.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **ghim-mot-lan.mjs silently drops run-log lines that fail to parse instead of reporting them**
  Người dùng thấy gì: Nếu một dòng trong sổ ghi lần ghim lại bị hỏng, phép kiểm vẫn báo đỏ nhưng lý do ghi là «thiếu dòng ghim lại» thay vì «dòng bị hỏng». Người đọc có thể đi tìm sai chỗ, nhưng kết quả đỏ/xanh không bị sai.
  file: `_acceptance/sua-paths-e5-soan-okr/rang/ghim-mot-lan.mjs`
  severity: low
  Đề xuất: wont-fix
- **Hình dạng 4 (assertion âm tính một mình, không đối chứng dương): pre-merge.mjs kết luận 'clean' chỉ vì vắng dòng VIOLATION**
  Người dùng thấy gì: Phép kiểm có thể báo «sạch» trong trường hợp lưới kiểm tra thật ra không xem hồ sơ này, vì nó chỉ dựa vào việc không thấy dòng báo lỗi. Hiếm khi xảy ra, nhưng khi đó người duyệt sẽ tin hồ sơ đã được soát trong khi chưa.
  file: `_acceptance/sua-paths-e5-soan-okr/rang/pre-merge.mjs`
  severity: medium
  Đề xuất: known-limits
- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): chiều đỏ của pre-merge.mjs đọc đầu ra mẫu tự soạn**
  Người dùng thấy gì: Phần thử «trường hợp lỗi» của một phép kiểm dùng đầu ra mẫu do người viết tự soạn, không phải đầu ra thật của lưới. Nếu lưới đổi cách báo lỗi, phép kiểm này vẫn xanh trong khi thực tế đã khác; trường hợp lỗi thật được kiểm ở phép kiểm khác.
  file: `_acceptance/sua-paths-e5-soan-okr/rang/pre-merge.mjs`
  severity: low
  Đề xuất: wont-fix
- **Hình dạng 4 (âm tính một mình): suites_exit vắng hoặc rỗng vẫn qua kiểm 'mọi phần tử 0'**
  Người dùng thấy gì: Nếu lần ghim lại không chạy bộ kiểm thử nào (hoặc không ghi kết quả), phép kiểm vẫn báo «tất cả đều qua». Với dữ liệu hiện tại điều này không xảy ra, nhưng một lần ghim lại rỗng có thể được xác nhận oan.
  file: `_acceptance/sua-paths-e5-soan-okr/rang/ghim-mot-lan.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
