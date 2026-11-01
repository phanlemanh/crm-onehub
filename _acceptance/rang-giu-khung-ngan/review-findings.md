# Review findings: rang-giu-khung-ngan (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Rule only checks named ImportSpecifier: namespace import, default import and re-export bypass the ban silently**
  Người dùng thấy gì: Một người viết ngăn mới vẫn có thể lách luật cấm bằng cách nhập cả bộ thành phần hoặc xuất lại, và không ai bị báo. Ngoài ra, một câu nhập chỉ lấy kiểu có thể bị báo oan.
  Căn cứ: Chỉ lọt khi có người cố tình viết lối nhập lạ, cây hiện tại không dính, nên người dùng cuối không thấy gì; sửa được sau mà không mất dữ liệu.
  file: `tools/oxlint/onehub/rules/ngan-trong-khung.ts`
  severity: low
  Đề xuất: known-limits

- **The spec's "ngoai le thua" check reads the local alias, the lint rule reads the imported name: the two contradict each other when an import is aliased**
  Người dùng thấy gì: Nếu một ngăn nhập thành phần cấm dưới tên khác, luật và bài kiểm sẽ đòi hai điều ngược nhau, và người viết bị kẹt giữa hai thông báo đỏ. Hiện chưa tệp nào gặp.
  Căn cứ: Chỉ làm vướng người viết mã trong trường hợp hiếm, hiện chưa xảy ra, không ảnh hưởng người dùng cuối và dễ sửa khi gặp.
  file: `apps/app/test/khung-ngan.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình (hình 4): ma trận «khung: <kind>» lọc lỗi theo chuỗi con chữ thường, nên có thể xanh mà không đo gì**
  Người dùng thấy gì: Bài kiểm từng loại ngăn có thể báo xanh dù một ngăn đã thoát khỏi khung chung, nhưng ca quét toàn bộ vẫn bắt được. Người dùng không thấy ảnh hưởng.
  Căn cứ: Lỗi thật vẫn bị ca quét toàn cây bắt, nên chỉ là lớp bảo vệ thừa yếu hơn dự kiến, không mất dữ liệu và sửa sau rẻ.
  file: `apps/app/test/khung-ngan.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
