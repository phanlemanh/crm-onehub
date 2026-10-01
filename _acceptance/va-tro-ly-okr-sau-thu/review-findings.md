# Review findings: va-tro-ly-okr-sau-thu (round 3)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hai import mới trong okr-tro-ly.ts không dùng tới (MINUTE_MS, TRO_LY_OKR_KHOA)**
  Người dùng thấy gì: Có hai dòng khai báo thừa trong mã, người dùng không thấy khác biệt nào và không có gì chạy sai. Chỉ là dọn dẹp cho gọn, có thể làm lúc tiện tay.
  file: `packages/validation/src/okr-tro-ly.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 (chỉ kiểm chuỗi có mặt, không kiểm quan hệ giữa các giá trị): không phép đo nào kiểm số phút và thứ tự tên biến mà thẻ Cài đặt lấy từ danh mục chung**
  Người dùng thấy gì: Khi chưa có khoá mô hình, thẻ Trợ lý OKR ở Cài đặt nói với quản trị viên nên cắm biến nào và bao lâu thì kiểm lại. Hiện chưa có phép đo nào bắt được nếu sau này hai tên biến bị đảo chỗ hoặc số phút bị tính sai, nên quản trị viên có thể bị chỉ nhầm biến mà không ai hay.
  file: `apps/app/test/messages-guard.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **The integration tests' 'no key' cases do not isolate the new OKR key or the OIDC network refresh (r1)**
  Người dùng thấy gì: Trên máy lập trình đã có sẵn khoá riêng hoặc đã liên kết Vercel, hai bài kiểm thử «không có khoá» có thể báo đỏ giả dù sản phẩm chạy đúng. Người dùng cuối không bị ảnh hưởng.
  file: `apps/agent/test/tro-ly-okr-san-sang.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Screen check expects the shared key but lets the run start when only Trợ lý OKR's own key is set, then fails as a real regression (r1)**
  Người dùng thấy gì: Nếu máy đo có cắm khoá riêng của Trợ lý OKR, phép đo màn hình sẽ báo hỏng giả ở thẻ Cài đặt và làm người duyệt tưởng sản phẩm lỗi. Sản phẩm thật không sai.
  file: `_acceptance/va-tro-ly-okr-sau-thu/rang/man-that.mjs`
  severity: medium
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
