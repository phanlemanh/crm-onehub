# Review findings: hydrat-giai-doan-deals (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hydration mismatch still happens when /deals is loaded with the create sheet already open (?new=true)**
  Người dùng thấy gì: Nếu ai đó mở thẳng đường dẫn Deals có kèm ngăn «Thoả thuận mới» đang mở, cột Giai đoạn có thể thoáng hiện mã thô như QUALIFIED_TO_BUY trước khi đổi thành nhãn, và có thể vẫn báo lỗi hydrat. Bình thường, khi ngăn đóng lúc tải trang, lỗi này đã hết.
  file: `apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (a negative check with no positive control): E7 passes when the «loi console app» line is absent, but its console listener is never shown to catch anything**
  Người dùng thấy gì: Phép kiểm cuối «mở Deals sau khi đăng nhập không có lỗi trên màn» có thể báo xanh dù bộ bắt lỗi của nó hỏng, vì chưa từng thử cho nó bắt một lỗi cố ý. Một phép đo khác trên cùng trang Deals đã chứng minh bộ bắt lỗi hoạt động, nên rủi ro thấp.
  file: `_acceptance/hydrat-giai-doan-deals/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (a negative check with no positive control): the red run for go-boc checks (2), (3) and (4) is claimed but never executed**
  Người dùng thấy gì: Phép kiểm «lớp bọc cũ đã được gỡ hẳn» chỉ chứng minh bằng việc không thấy dấu vết. Chưa ai thử chạy nó trên bản còn lớp bọc để xem nó có báo đỏ thật không, nên có thể nó xanh cả khi lớp bọc còn sót.
  file: `_acceptance/hydrat-giai-doan-deals/rang/go-boc.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 3 (asserts a string is present when the promise is a relationship): check (5) in go-boc only looks for the slug anywhere in contract.md**
  Người dùng thấy gì: Phép kiểm «hợp đồng cũ đã ghi hạn chế được gỡ và trỏ về hồ sơ này» chỉ cần tên hồ sơ xuất hiện đâu đó trong tệp là qua. Nếu hợp đồng cũ vẫn liệt kê hạn chế như còn hiệu lực, phép kiểm vẫn có thể báo xanh.
  file: `_acceptance/hydrat-giai-doan-deals/rang/go-boc.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
