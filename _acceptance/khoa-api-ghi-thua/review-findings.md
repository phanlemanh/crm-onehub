# Review Findings: khoa-api-ghi-thua (round 2)

## Trong hợp đồng

- **Bản vá vẫn đổi đường secondary-storage, trái với lời sửa E13 «secondary-storage y bản gốc»**
  AC: AC-9
  file: `patches/@better-auth%2Fapi-key@1.6.25.patch:15`
  severity: medium
  source: conventions
  detail: Vòng này chỉ rào nhánh trả sớm của claimUsageInDatabase bằng `opts.storage === "database"` (dòng 41), rồi decisions.jsonl d-...-10 và bản thiết kế ghi «Đường secondary-storage giữ nguyên như bản gốc». Nhưng stampLastRequest (dòng 15 đến 33) nằm trong evaluateRateLimit và không xét storage. Trong mã đã cài, evaluateRateLimit có hai nơi gọi: consumeRateLimit (được claimUsageInDatabase gọi, gồm cả chế độ secondary-storage + fallbackToDatabase) và applyRateLimitToSnapshot (dòng ~1935 của dist/index.mjs, đường claimUsageInSecondaryStorage). Cụ thể, khi `storage: "secondary-storage"` có tuỳ chọn và rate-limit tắt, mọi lượt trong vòng một phút cho `decision.lastRequest === null`, nên snapshot bỏ lastRequest. Chế độ fallback thì bỏ lệnh ghi lastRequest vào DB. Cả hai khác bản gốc. Kho không dùng secondary-storage nên sản phẩm không bị ảnh hưởng. Chỗ sai là lời cam kết trong hợp đồng: E13 (evals.yaml dòng 98 đến 100) hỏi đúng câu «không chạm secondary-storage», và bản ghi quyết định khẳng định điều không đúng. Cách sửa: rào luôn stampLastRequest theo `opts.storage === "database"`, hoặc sửa lời trong decisions/spec cho đúng thực tế.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Kiểm bun.lock bằng regex tự chế, trả Record thay vì phân tích ở biên**
  Người dùng thấy gì: Công cụ tự động kiểm tra bản vá có thể báo lỗi giả nếu sau này có thêm một gói được vá nữa, khiến người soát mất công tra nhầm chỗ.
  file: `packages/auth/test/khoa-api-ghi-thua.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Nhánh trả sớm ở storage database bỏ luôn chốt «khoá còn tồn tại» của bản gốc**
  Người dùng thấy gì: Trong một khoảng thời gian rất ngắn (dưới một phút, chỉ một yêu cầu), một khoá API vừa bị xoá vẫn có thể lọt qua thêm một lượt gọi trước khi bị chặn hẳn.
  file: `patches/@better-auth%2Fapi-key@1.6.25.patch`
  severity: low
  Đề xuất: known-limits

- **The HTTP 401 check for the expired key runs after the library has already deleted the row, so it never tests expiry (r1)**
  Người dùng thấy gì: Bài kiểm cho khoá hết hạn có thể vẫn báo xanh dù phần từ chối qua ứng dụng thực ra đến từ lý do khác (khoá đã bị xoá), nên nếu sau này việc từ chối khoá hết hạn ở đường đó bị hỏng thật, bộ kiểm này có thể không kịp cảnh báo.
  file: `apps/api/test/khoa-api-ghi-thua.spec.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

_(không có)_

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
