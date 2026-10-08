## Trong hợp đồng

- **Lệnh E5 mà máy chấm chạy không còn đòi mã thoát 0 như AC-5 hứa; --buoc-cuoi không được gắn vào lệnh nào**
  file: `_acceptance/sua-paths-e5-soan-okr/evals.yaml:39`
  severity: medium
  AC: AC-5
  source: conventions
  detail: Câu Then của AC-5 (contract.md:33) là «lệnh thoát 0 và không có dòng VIOLATION [soan-okr-cung-tro-ly]». Sau round 1, docKetQua trong rang/pre-merge.mjs (dòng 18-19) tha mã khác 0 khi mọi dòng VIOLATION là của sua-paths-e5-soan-okr. Chỉ cờ --buoc-cuoi mới đòi mã 0. Nhưng lệnh mà S4 thực sự chạy là config:executors.script.f19_pre_merge = `node _acceptance/sua-paths-e5-soan-okr/rang/pre-merge.mjs` (_acceptance/config.yaml:2077), không có --buoc-cuoi. Grep toàn kho (_acceptance, .githooks, .github, scripts, docs) không thấy lệnh, hook hay bước CI nào truyền --buoc-cuoi. Vì vậy phần «thoát 0» của AC-5 không phép đo máy nào chạm tới: E5 có thể ghi PASS vào evidence trong khi pre-merge-check.sh thoát 1. Điều này trái luật «phép đo phải chạm lời hứa». Ngoài ra, phần expected của E5 bị nới sau khi Gate 1 đã ký (approved_at 2026-10-08), và chỉ ghi lại bằng một mục decisions loại «fix» (d-20261008T105613Z-9), không duyệt lại hợp đồng. Hướng sửa: thêm một executor như f19_pre_merge_cuoi chạy với --buoc-cuoi ở bước trước khi đẩy, hoặc đưa việc nới này về Cổng Phạm vi để sửa câu Then của AC-5.
  rationale: AC-5 hứa rõ «lệnh thoát 0 và không có dòng VIOLATION»; finding nói vế «thoát 0» không phép đo máy nào chạm tới, tức là chính lời hứa của AC-5 không được kiểm.

- **Hình dạng 4 (âm tính một mình): khi mã thoát được tha, E5 xanh chỉ vì không thấy dòng VIOLATION, và nhánh --buoc-cuoi không lệnh nào gọi**
  file: `_acceptance/sua-paths-e5-soan-okr/rang/pre-merge.mjs:18`
  severity: medium
  AC: AC-5
  source: measurement
  detail: Round trước, mã thoát 0 là tín hiệu dương duy nhất đi kèm phép kiểm 'không có dòng VIOLATION [soan-okr-cung-tro-ly]'. Dòng 18 mới chỉ gọi bao('ma-thoat') khi có co['buoc-cuoi'], hoặc cuaVong.length===0, hoặc có vi phạm khác. Ở trạng thái S4, pre-merge-check luôn in ít nhất một dòng VIOLATION [sua-paths-e5-soan-okr], nên mã thoát khác 0 luôn được tha. Lúc đó màu xanh chỉ còn dựa vào việc vắng dòng (cuaHoSo.length===0, khac.length===0), không có đối chứng dương nào. Script không đòi dòng 'OK [soan-okr-cung-tro-ly]: PASS' dù pre-merge-check.sh có in dòng đó (xem .acceptance-runs/sua-paths-e5-soan-okr/pre-merge.txt). Nó cũng không ghim lý do của các dòng được tha: mọi dòng bắt đầu 'VIOLATION [sua-paths-e5-soan-okr]' đều được tha, chứ không riêng 'status=implemented but no evidence-report.md' là lý do của việc tha (decisions.jsonl d-…-9). Ví dụ, dòng gap-probe hay approved_by của chính vòng cũng được tha. Vế 'lệnh thoát 0' của AC-5 chỉ được kiểm bởi --buoc-cuoi. Nhưng lệnh của eval ở _acceptance/config.yaml:2077 (f19_pre_merge: node …/pre-merge.mjs) không có cờ này, và không hook hay eval nào gọi nó. Nhánh mã 0 tuyệt đối chỉ được chạm qua chiều đỏ --doc-tep với tệp mẫu, chưa bao giờ chạy trên đầu ra thật của lưới. Kết quả: không eval máy nào khẳng định dương rằng pre-merge-check thoát 0, cũng không khẳng định rằng hồ sơ soan-okr-cung-tro-ly đã thật sự được lưới chấm.
  rationale: Khi mã thoát được tha, E5 chỉ còn bằng chứng âm tính; vế «thoát 0» của AC-5 không có tín hiệu dương nào đi kèm.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **SLUG_VONG khai tại chỗ trong pre-merge.mjs, lặp lại chuỗi slug đã có trong module hằng chung.mjs**
  Người dùng thấy gì: Đây chỉ là chuyện sắp xếp bên trong công cụ kiểm tra của chính vòng này. Người dùng cuối không thấy gì khác đi, và cái giá sửa lớn hơn lợi ích nên ghi lại rồi bỏ qua.
  file: `_acceptance/sua-paths-e5-soan-okr/rang/pre-merge.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): hai chiều đỏ mới của E5 đọc tệp mẫu tự soạn, không rút từ đầu ra thật**
  Người dùng thấy gì: Các phép thử phụ dùng dữ liệu mẫu tự soạn thay vì lấy từ kết quả thật của hệ thống kiểm tra. Điều này chỉ làm phép thử kém chắc hơn một chút, không ảnh hưởng người dùng, và đã được chấp nhận ở vòng trước.
  file: `_acceptance/sua-paths-e5-soan-okr/evals.yaml`
  severity: low
  Đề xuất: wont-fix

- **ghim-mot-lan.mjs silently drops run-log lines that fail to parse instead of reporting them (r1)**
  Người dùng thấy gì: Nếu một dòng trong sổ ghi lần ghim lại bị hỏng, phép kiểm vẫn báo đỏ nhưng lý do ghi là «thiếu dòng ghim lại» thay vì «dòng bị hỏng». Người đọc có thể đi tìm sai chỗ, nhưng kết quả đỏ/xanh không bị sai.
  file: `_acceptance/sua-paths-e5-soan-okr/rang/ghim-mot-lan.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (âm tính một mình): suites_exit vắng hoặc rỗng vẫn qua kiểm 'mọi phần tử 0' (r1)**
  Người dùng thấy gì: Nếu lần ghim lại không chạy bộ kiểm thử nào (hoặc không ghi kết quả), phép kiểm vẫn báo «tất cả đều qua». Với dữ liệu hiện tại điều này không xảy ra, nhưng một lần ghim lại rỗng có thể được xác nhận oan.
  file: `_acceptance/sua-paths-e5-soan-okr/rang/ghim-mot-lan.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/4 lỗi rơi vào file không bộ đo nào phủ (_acceptance/sua-paths-e5-soan-okr/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
