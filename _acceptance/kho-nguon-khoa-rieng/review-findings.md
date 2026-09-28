## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 5 (ma trận viết trước, số assert = số phần tử): chốt đếm của ma trận luu-nguon trong capabilities.spec cũng tự so và đếm sai số assert (r1)**
  Người dùng thấy gì: Nếu sau này có người lỡ xoá bớt một trường hợp trong bảng kiểm thử năng lực lưu nguồn, hệ thống kiểm tra tự động vẫn báo đạt dù đã mất một phần khả năng phát hiện lỗi — một lỗi thật về việc bật/tắt tính năng lưu nguồn có thể lọt qua mà không ai biết.
  file: `apps/agent/test/capabilities.spec.ts`
  severity: low
  Đề xuất: known-limits

- **docs/environment.md mô tả sai các chỗ khai KHO_TAI_LIEU_BLOB_TOKEN trong turbo (r1)**
  Người dùng thấy gì: Một câu mô tả trong tài liệu cấu hình nêu sai tên vài tác vụ khai báo biến môi trường; không ảnh hưởng vận hành thực tế vì biến vẫn hoạt động đúng, nhưng người đọc tài liệu có thể bị dẫn sai khi thêm tác vụ mới.
  file: `docs/environment.md`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận viết trước, số assert = số phần tử): chốt đếm của ma trận hai-bien tự so với chính nó nên không bao giờ đỏ (r1)**
  Người dùng thấy gì: Nếu sau này có người lỡ xoá bớt một trường hợp trong bảng kiểm thử, hệ thống kiểm tra tự động sẽ không phát hiện ra và vẫn báo đạt — nghĩa là một lỗi thật (ví dụ liên quan tới khoảng trắng hay nhầm khoá) có thể lọt qua mà không ai biết.
  file: `packages/db/test/blob-nguon.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).