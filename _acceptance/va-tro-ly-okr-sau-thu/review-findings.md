# Review findings: va-tro-ly-okr-sau-thu (vòng 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The 'AI model' capability now gives the agent false information, and the new OKR key has no capability entry of its own (r1)**
  Người dùng thấy gì: Người tự dựng hệ thống chỉ cắm khoá riêng của Trợ lý OKR sẽ thấy danh sách năng lực của tác tử báo lời mô tả cũ, nói rằng việc của Trợ lý OKR bị đóng ngay, trong khi thực tế vẫn chạy bình thường. Chỉ là chữ mô tả sai, không làm hỏng việc.
  file: `apps/agent/agent/lib/capabilities.ts`
  severity: medium
  Đề xuất: known-limits

- **The integration tests' 'no key' cases do not isolate the new OKR key or the OIDC network refresh (r1)**
  Người dùng thấy gì: Trên máy lập trình đã có sẵn khoá riêng hoặc đã liên kết Vercel, hai bài kiểm thử «không có khoá» có thể báo đỏ giả dù sản phẩm chạy đúng. Người dùng cuối không bị ảnh hưởng.
  file: `apps/agent/test/tro-ly-okr-san-sang.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **On-screen text hard-codes the tunable re-check interval and the env variable names (r1)**
  Người dùng thấy gì: Dòng hướng dẫn trên thẻ Trợ lý OKR ghi cứng «khoảng 10 phút» và tên biến. Nếu sau này đổi thời gian kiểm lại hoặc đổi tên biến mà quên sửa chữ, màn hình sẽ nói sai nhưng chức năng vẫn chạy.
  file: `apps/app/lib/messages/tro-ly-okr.ts`
  severity: low
  Đề xuất: known-limits

- **Screen check expects the shared key but lets the run start when only Trợ lý OKR's own key is set, then fails as a real regression (r1)**
  Người dùng thấy gì: Nếu máy đo có cắm khoá riêng của Trợ lý OKR, phép đo màn hình sẽ báo hỏng giả ở thẻ Cài đặt và làm người duyệt tưởng sản phẩm lỗi. Sản phẩm thật không sai.
  file: `_acceptance/va-tro-ly-okr-sau-thu/rang/man-that.mjs`
  severity: medium
  Đề xuất: known-limits

- **New readiness results break the old code, so an agent/API version skew or a rollback turns every Trợ lý OKR readiness read into an exception (r1)**
  Người dùng thấy gì: Nếu triển khai phần tác tử trước phần máy chủ, hoặc lùi bản máy chủ sau đó, trạng thái sẵn sàng của Trợ lý OKR và thẻ Cài đặt có thể báo lỗi cho tới khi triển khai lại đúng bản mới. Chỉ xảy ra trong khoảng triển khai lệch.
  file: `packages/db/src/okr-tro-ly-danh-muc.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (assert «chuỗi có mặt» thay cho quan hệ): ca ST-caidat-thieu-khoa không đo được việc có nêu AI_GATEWAY_API_KEY (r1)**
  Người dùng thấy gì: Bài kiểm thử không phát hiện được nếu ai đó sau này bỏ mất lời hướng dẫn dùng khoá chung khỏi thẻ Trợ lý OKR. Hôm nay chữ trên màn vẫn đúng.
  file: `apps/app/test/tro-ly-okr-so-do.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assert âm tính đứng một mình): bước đọc hộp KR trên màn thật không có đối chứng dương cho gợi ý kr-la-viec (r1)**
  Người dùng thấy gì: Phép đo màn hình chỉ xác nhận gợi ý «đọc như một việc» không hiện ở KR doanh thu, chứ không chứng minh gợi ý đó vẫn hiện đúng ở KR thật sự là việc. Nếu gợi ý hỏng hẳn, phép đo vẫn báo đạt.
  file: `_acceptance/va-tro-ly-okr-sau-thu/rang/man-that.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay theo khuôn bên đọc): ca oidc của E2 tự tạo hàng okr-kiem-san-sang thay vì đi qua xepKiemLaiKhoa (r1)**
  Người dùng thấy gì: Bài kiểm thử cho trường hợp vé Vercel tự tạo việc kiểm thay vì đi qua đường xếp việc thật, nên nếu sau này đường xếp việc đổi mà bài này không đổi theo thì vẫn báo xanh giả.
  file: `apps/agent/test/tro-ly-okr-san-sang.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
