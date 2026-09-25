## Trong hợp đồng

Findings: không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The pinned fixture no longer matches 65bf27cc, but the signed khung-trang-cai-dat E1 still says it does (r2)**
  Người dùng thấy gì: Một trang tài liệu mô tả bộ kiểm tra khác của Cài đặt trang có thể ghi sai nguồn đối chứng đang dùng, khiến người xem lại sau này tưởng nhầm phép so sánh vẫn đúng như cũ trong khi thực ra đã đổi.
  file: `_acceptance/khung-trang-cai-dat/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — fixture viết tay chép theo bên đọc: bản gốc 'ghim ở 65bf27cc' bị sửa tay cho khớp mã mới (r2)**
  Người dùng thấy gì: Bản đối chứng dùng để kiểm 'trang không đổi giao diện khi không truyền chiều rộng' ở một bộ kiểm tra khác của Cài đặt trang có thể đã bị sửa tay theo đúng bản sửa mới nhất, nên phép kiểm đó có thể không còn phát hiện được lỗi thật nếu sau này ai sửa nhầm phần tương ứng.
  file: `apps/app/test/fixtures/page-shell-truoc-width.tsx.txt`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).