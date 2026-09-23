## Trong hợp đồng

- **Hình dạng 5, quét lớp có lỗ: ma trận REST miễn luôn PATCH /rest/workspace (workspace.update) vì so ngoại lệ chỉ theo đường, không theo phương thức**
  file: `apps/api/test/go-la-cat-quyen.spec.ts:180`
  severity: high
  AC: AC-5
  source: measurement
  detail: laNgoaiLeRest (dòng 180-183) lấy `h.ten.split(" ")[1]`, tức chỉ phần đường, rồi so với ngoaiLeRest(). Nhưng workspace.get khai restMeta("GET", "/workspace") và workspace.update khai restMeta("PATCH", "/workspace") (workspace.router.ts dòng 41 và 63), nên hai hàng dùng chung đường /rest/workspace. Vì vậy hàng `PATCH /rest/workspace` bị coi là ngoại lệ và hangLot(rest, laNgoaiLeRest) ở dòng 384 không bao giờ xét nó. E5 hứa mọi đường ngoài tập ngoại lệ đều trả 403 kèm NOT_A_MEMBER. Thực tế, một khoá API còn bật của người ngoài kho có gọi được PATCH /rest/workspace (đổi thông tin kho) hay không thì bài vẫn xanh. Ma trận nói là quét toàn phần nhưng lặng lẽ để sót một thủ tục ghi. Ngoại lệ phải so theo cặp (phương thức, đường), ví dụ lấy từ soThuTuc() cả method lẫn restPath.
  rationale: Kịch bản đúng Given của AC-5 (khoá API còn bật của người không còn là thành viên) và đúng vế Then về cầu REST, nhưng lỗ khớp ngoại lệ khiến bài kiểm không thực sự đo được đường ghi PATCH /rest/workspace mà AC-5 hứa phải từ chối.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **The API key endpoint check can be bypassed by sending an API key instead of a cookie**
  Người dùng thấy gì: Người đã bị gỡ khỏi không gian làm việc nhưng còn giữ một khoá truy cập (API key) cũ vẫn có thể dùng khoá đó để tự tạo khoá truy cập mới, hoặc bật lại một khoá cũ đã bị khoá — dù họ không còn là thành viên.
  file: `packages/auth/src/canh-khoa-api.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 5, phép đếm hàng là hằng đúng: hang.length so với chính nguồn sinh ra nó**
  Người dùng thấy gì: Nếu sau này ai đó vô tình bỏ sót một chức năng khỏi vòng kiểm tra quyền truy cập, hệ thống kiểm tra tự động hiện tại có thể không phát hiện ra, vì phép đếm chỉ đối chiếu với chính nó chứ không đối chiếu độc lập với danh sách chức năng thật.
  file: `apps/api/test/go-la-cat-quyen.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).