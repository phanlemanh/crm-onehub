## Trong hợp đồng

- **chupCoConTro reads the text colour as rgb, but the app's colour is lab(), so the E8 empty-field screenshot always fails**
  file: `_acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs:413`
  severity: high
  AC: AC-7
  source: conventions
  `const [r, g, b] = mau.match(/\d+/g).map(Number)` assumes getComputedStyle(o).color comes back as rgb(). The field inherits `text-foreground` from body (packages/ui/src/styles/globals.css:180). In the light theme that resolves to --ds-gray-1000 = `lab(7.78201% -0.0000149012 0)` (packages/ui/src/styles/geist.css:63). I checked Chrome's serialization with the CHROME binary from may-chu.mjs: it returns `lab(7.78201 -0.0000149012 0)`, not rgb. The regex then yields r=7, g=78201, b=0. No pixel can come within NGUONG_LECH_MAU of g=78201, so `thay` is always false. All 12 tries fail at both viewports, and `chup` pushes 'khong chup duoc con tro tren anh o trong' every run. E8 goes red for a reason the probe causes itself, whatever the product does. This is the same class of problem as the round-1 finding (the probe blocks its own measurement), just moved. Fix direction: read the caret colour as pixels, not by parsing CSS text. One way: paint a probe element with `color: <same>` into a canvas, or use canvas fillStyle and getImageData on a 1px swatch to get the rendered RGB. Another: set an explicit rgb caret-color only on this probe page. Parsing the colour string is not reliable once the design tokens are lab/oklch.
  Vì sao thuộc AC-7: chupCoConTro là cơ chế đo/chụp ảnh cho E8, eval ánh xạ tới AC-7 (mắt người nhìn — con trỏ đầu ô trước chữ gợi ý); lỗi màu khiến nó luôn báo thất bại bất kể sản phẩm đúng hay sai, tức làm AC-7 luôn thất bại khi ghim lại.

- **chupCoConTro parses the computed text color with /\d+/g, which breaks on lab() colors, so E8 can never find the caret**
  file: `_acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs:411`
  severity: high
  AC: AC-7
  source: bugs
  chupCoConTro reads `getComputedStyle(o).color` and splits it with `mau.match(/\d+/g).map(Number)`, assuming the value looks like `rgb(r, g, b)`. That assumption does not hold here. In light theme `--foreground` resolves to `--ds-gray-1000: lab(7.78201% -0.0000149012 0)` (packages/ui/src/styles/geist.css:63, unconditional in :root), and Chrome keeps the lab form in the computed value. I checked this with the same CHROME binary the script uses: `getComputedStyle(...).color` returned `lab(7.78201 -0.0000149012 0)`, and the regex turned it into `["7","78201","0","0000149012","0"]`, which gives r=7, g=78201, b=0. Because `Math.abs(d[1]-78201)` is about 78000, far above NGUONG_LECH_MAU=60, no pixel can ever match. So `thay` is always false, all 12 tries run out, and the function returns false. The `chup` mode then always reports `KHONG DAT: <kho>: khong chup duoc con tro tren anh o trong` for both 1440 and 375. That is a false red on E8 no matter what the app actually renders. Separately, when that path fails, E8-o-trong-<kho>.png is never written, so the E8 evidence also loses the empty-composer screenshot that the eval requires. Fix: turn the color into sRGB before comparing. For example, paint it onto a 1x1 canvas (fillStyle = mau; fillRect; getImageData) and read the RGB back, or compare against the pixel color of a probe element, instead of pulling numbers out of the CSS string with a regex.
  Vì sao thuộc AC-7: cùng một lỗi với finding trên, cùng hàm chupCoConTro phục vụ E8 vào ánh xạ AC-7; lỗi màu làm eval E8 luôn báo KHONG DAT bất kể sản phẩm thế nào, tức làm AC-7 thất bại khi ghim lại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Inline tuning constants in chupCoConTro break the file's own rule of named constants**
  Người dùng thấy gì: Đây chỉ là một điểm chưa gọn gàng trong kịch bản đo tự động nội bộ, không ảnh hưởng gì đến màn hình hay trải nghiệm của nhân viên OneHub khi dùng Hội thoại.
  file: `_acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs`
  severity: low
  Đề xuất: known-limits

- **A test fixture under apps/api/test is imported by relative path from apps/agent and apps/app (r1)**
  Người dùng thấy gì: Nếu ai đó xóa hoặc đổi tên thư mục test của một ứng dụng, hai ứng dụng khác âm thầm hỏng theo mà không có cảnh báo, vì ba nơi cùng dùng chung một tệp dữ liệu mẫu nằm ngoài chỗ quy định.
  file: `apps/agent/test/log-loi-hoi-thoai.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay vì quan hệ): E7 hàng 3 không kiểm lý do hỏng M3 của bản ghi task (r1)**
  Người dùng thấy gì: Nếu tác vụ nghiên cứu hỏng nhưng lý do lưu lại bị sai hoặc để trống, vòng đo hiện tại vẫn có thể báo đạt vì chỉ kiểm trạng thái hỏng chứ không kiểm đúng lý do — người xem báo cáo hỏng có thể thấy lý do không khớp với chuyện đã thực sự xảy ra.
  file: `apps/agent/test/log-loi-hoi-thoai.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).