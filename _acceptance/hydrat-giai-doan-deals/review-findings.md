# Review findings — hydrat-giai-doan-deals (round 2)

## Trong hợp đồng

Không có finding.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **go-boc.mjs now checks config.yaml against a schema, but still reads evals.yaml with no schema**
  Người dùng thấy gì: Công cụ phụ dùng một lần để gỡ lớp bọc hạn chế của hồ sơ khác có thể báo «hỏng» thay vì «không đo được» nếu tệp mô tả kiểm thử của hồ sơ đó bị viết sai dạng. Chỉ ảnh hưởng người chạy công cụ này trong vòng hiện tại, không ảnh hưởng người dùng cuối hay màn Deals.
  file: `_acceptance/hydrat-giai-doan-deals/rang/go-boc.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hydration mismatch still happens when /deals is loaded with the create sheet already open (?new=true)** (r1)
  Người dùng thấy gì: Nếu ai đó mở thẳng đường dẫn Deals có kèm ngăn «Thoả thuận mới» đang mở, cột Giai đoạn có thể thoáng hiện mã thô như QUALIFIED_TO_BUY trước khi đổi thành nhãn, và có thể vẫn báo lỗi hydrat. Bình thường, khi ngăn đóng lúc tải trang, lỗi này đã hết.
  file: `apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (a negative check with no positive control): E7 passes when the «loi console app» line is absent, but its console listener is never shown to catch anything** (r1)
  Người dùng thấy gì: Phép kiểm cuối «mở Deals sau khi đăng nhập không có lỗi trên màn» có thể báo xanh dù bộ bắt lỗi của nó hỏng, vì chưa từng thử cho nó bắt một lỗi cố ý. Một phép đo khác trên cùng trang Deals đã chứng minh bộ bắt lỗi hoạt động, nên rủi ro thấp.
  file: `_acceptance/hydrat-giai-doan-deals/evals.yaml`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
