# Review findings: ngoai-le-telemetry-giai-doan (round 1)

## Trong hợp đồng

- **Repin lần 4 của giai-doan-thoa-thuan ghi E18 xanh, nhưng lệnh E18 như đang cấu hình vẫn thoát 2 ở HEAD; xanh chỉ có khi export tay GDTT_MOC/GDTT_DINH, và hai biến này không được lưu ở đâu cả**
  AC: AC-6
  file: `_acceptance/giai-doan-thoa-thuan/evidence-report.md:285`
  severity: high
  source: bugs
  detail: Lượt repin-do 06:59 (run-log.jsonl, lan_id repin-20261009T065520Z-66043) có E18 thoát 2 ở rang/san-thiet-ke.mjs. Lượt repin 07:04 (repin-20261009T070020Z-72555) trên cùng sha 769f41d3 ghi E18:0 và suites_env "ci". Tiêu đề trong evidence-report cho thấy lần này đã "neo cặp sha gộp #206 (GDTT_MOC/GDTT_DINH)" bằng biến môi trường. Thế nhưng diff không đổi executors.script.gdtt_san_thiet_ke trong config.yaml (dòng 2026, vẫn là `bun _acceptance/giai-doan-thoa-thuan/rang/san-thiet-ke.mjs` trần). Dòng run-log cũng không ghi giá trị hai biến, và decisions.jsonl không có mục nào ngày 10/09 (khác với tiền lệ d-...-39 cho E1). Chạy lại đúng lệnh đã cấu hình ở HEAD, không đặt biến: nó in `so tep giao dien vong nay cham: 0` / `KHONG DO DUOC: khong tep giao dien nao trong diff` rồi process.exit(2), vì san-thiet-ke.mjs dòng 16 rơi về `git merge-base HEAD origin/onehub`. Hệ quả: bằng chứng "18/18 eval máy đạt kỳ vọng" đã ghim không tái lập được bằng lệnh mà hợp đồng trỏ tới. Recheck strict hay lượt repin kế tiếp sẽ đỏ E18. Thêm nữa, E6 của vòng này (thu-thuoc.mjs --ca ghim-gdtt) tin evals_exit trong run-log mà không chạy lại, nên vẫn xanh trên một con số không tái lập được. Cách sửa: ghi cặp sha vào cmd gdtt_san_thiet_ke (hoặc đổi cách thước lấy mốc, như đã làm cho E1), và ghi lại một quyết định. Lý do vào hợp đồng: AC-6 đòi mọi eval máy của hồ sơ giai-doan-thoa-thuan thoát đúng kỳ vọng khi ghim lại; lệnh E18 như cấu hình thoát 2 thay vì kỳ vọng, nên xanh đã ghim không tái lập được.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The red direction promised in evals.yaml uses a flag the test script never reads, and no executor runs the red direction**
  Người dùng thấy gì: Kiểm thử chiều đỏ của thước canh ngoại lệ ghi sai cách chạy, và hệ thống nghiệm thu không tự chạy chiều đỏ. Nếu ai đó sửa thước cho yếu đi, có thể không có gì báo đỏ ngay.
  file: `_acceptance/ngoai-le-telemetry-giai-doan/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Chiều đỏ trong evals.yaml (E1–E4) bảo truyền cờ --thuoc mà thu-thuoc.mjs không đọc; cờ lạ bị bỏ qua im lặng nên chiều đỏ ra xanh**
  Người dùng thấy gì: Hướng dẫn kiểm tra chiều đỏ của thước ghi sai tên tuỳ chọn, và thước lại im lặng bỏ qua tuỳ chọn lạ. Người kiểm đúng theo hướng dẫn sẽ thấy kết quả xanh và có thể tưởng thước không bắt được lỗi.
  file: `_acceptance/ngoai-le-telemetry-giai-doan/evals.yaml`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/3 lỗi rơi vào file không bộ đo nào phủ (_acceptance/ngoai-le-telemetry-giai-doan/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
