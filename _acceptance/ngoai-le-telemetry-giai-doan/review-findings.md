# Review findings: ngoai-le-telemetry-giai-doan (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC ở round này. Lỗi AC-6 của round 1 (lệnh E18 của giai-doan-thoa-thuan không tái lập bằng lệnh đã cấu hình) đã được đóng bởi commit ghim cặp sha và repin lần 5.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **GDTT_DINH được ghim bằng sha rút gọn (9 ký tự), còn GDTT_MOC cùng dòng ghim sha đầy đủ**
  Người dùng thấy gì: Một mốc kiểm tra của hồ sơ cũ đang được ghi dưới dạng rút gọn. Hiện kết quả vẫn đúng và không ảnh hưởng người dùng, nhưng nếu sau này kho có thêm mã trùng đầu thì lần kiểm lại hồ sơ đó có thể báo đỏ giả và phải sửa tay.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: known-limits

- **(r1) The red direction promised in evals.yaml uses a flag the test script never reads, and no executor runs the red direction**
  Người dùng thấy gì: Kiểm thử chiều đỏ của thước canh ngoại lệ ghi sai cách chạy, và hệ thống nghiệm thu không tự chạy chiều đỏ. Nếu ai đó sửa thước cho yếu đi, có thể không có gì báo đỏ ngay.
  file: `_acceptance/ngoai-le-telemetry-giai-doan/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **(r1) Chiều đỏ trong evals.yaml (E1–E4) bảo truyền cờ --thuoc mà thu-thuoc.mjs không đọc; cờ lạ bị bỏ qua im lặng nên chiều đỏ ra xanh**
  Người dùng thấy gì: Hướng dẫn kiểm tra chiều đỏ của thước ghi sai tên tuỳ chọn, và thước lại im lặng bỏ qua tuỳ chọn lạ. Người kiểm đúng theo hướng dẫn sẽ thấy kết quả xanh và có thể tưởng thước không bắt được lỗi.
  file: `_acceptance/ngoai-le-telemetry-giai-doan/evals.yaml`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
