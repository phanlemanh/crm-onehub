## Trong hợp đồng

### Hình dạng 4 (âm tính một mình): ca 'cua google tu choi token co hd lech' tự xanh đúng lúc auth.ts thôi khoá hd
- file: `packages/auth/test/chia-mat-khau.integration.spec.ts:647`
- severity: medium
- source: measurement
- AC: AC-7

Nhánh bỏ qua `if (!isGoogleConfigured() || !hdDaKhoa)` lấy điều kiện từ chính giá trị sản phẩm đang được đo (`auth.options.socialProviders?.google?.hd`). Trong env CI (ALLOWED_SIGN_IN=example.com, có GOOGLE_CLIENT_ID), nhánh này chỉ chạy được khi auth.ts không đặt hd — tức đúng hồi quy M2 'bo hd' — và khi đó ca trả về bằng một assert hằng đúng `expect([BO_QUA_HD_LECH, false]).toEqual([BO_QUA_HD_LECH, false])`, nên xanh. Như vậy ca âm tính 'cửa Google từ chối token lệch hd' (bằng chứng cho vế sau của AC-7) không đỏ được khi cửa thôi kiểm hd. Nhánh này lại được junit tính là pass chứ không phải skipped, nên chốt của E4 `sua.bo > goc.bo` (thu-tu-tep.mjs:217) cũng không thấy. Đột biến M2 của E11 chỉ chạy hd-cua-google.spec.ts, không chạy ca này, nên không ai đo được ca này đỏ khi hd mất.

Rationale khớp AC: AC-7 nói rõ ca không được xanh bằng cách biến phép so hd thành hằng đúng; finding chỉ đúng chính lỗ hổng đó — ca âm tính tự xanh vô nghĩa khi hd bị bỏ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Env restore is opt-in per file, and the only check that catches a missing call runs outside the gate**
  Người dùng thấy gì: Nếu sau này có người thêm một tệp kiểm mới mà đổi cấu hình môi trường theo cách khác với bốn tệp hiện tại, các bài kiểm có thể lại thỉnh thoảng báo sai (đỏ giả) tuỳ theo thứ tự chạy, và bước kiểm tra tự động hiện tại sẽ không tự phát hiện ra việc đó.
  file: `packages/auth/test/danh-sach-goc.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (không ghim thông điệp): ca từ chối hd lệch chỉ ghim mã lỗi chung unable_to_get_user_info**
  Người dùng thấy gì: Bài kiểm 'Google từ chối khi thông tin không khớp' có thể vẫn báo đúng (xanh) ngay cả khi lý do từ chối thực tế là một lỗi khác không liên quan, nên nó chưa chắc chắn đang bảo vệ đúng thứ người dùng nghĩ nó bảo vệ.
  file: `packages/auth/test/chia-mat-khau.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
