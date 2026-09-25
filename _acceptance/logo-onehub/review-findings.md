## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E9 chép tay danh sách tệp đích thay vì suy từ ICON_ONEHUB.trongKho**
  Người dùng thấy gì: Nếu sau này có thêm một tệp icon mới vào bộ nguồn, công cụ kiểm tra tự động có thể không được cập nhật theo và bỏ sót việc kiểm tra tệp đó.
  file: `packages/ui/test/logo-icons.spec.ts`
  severity: low
  Đề xuất: known-limits

- **E9 cannot detect the CLI writing the in-repo icon set during --external, because those writes produce byte-identical files**
  Người dùng thấy gì: Nếu một lỗi trong tương lai khiến công cụ xuất ảnh vô tình ghi lại các tệp biểu tượng gốc trong kho bằng đúng nội dung cũ, bộ kiểm tra tự động hiện tại có thể không phát hiện ra hành vi ghi đè đó.
  file: `packages/ui/test/logo-icons.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: tuyên quét LỚP «git status của kho không đổi» nhưng chỉ đo điểm-case (7 tệp băm + 3 tên ảnh ở 3 thư mục)**
  Người dùng thấy gì: Nếu công cụ xuất ảnh trong tương lai vô tình ghi thêm hay sửa một tệp ở nơi khác trong kho ngoài các tệp đã biết, bộ kiểm tra tự động hiện tại có thể không phát hiện ra, dù lẽ ra kho phải giữ nguyên không đổi sau khi chạy.
  file: `packages/ui/test/logo-icons.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — fixture VIẾT TAY: E15 đo một bản chép AgentAvatar trong logo-markup.ts, không phải AgentAvatar thật (r4)**
  Người dùng thấy gì: Bài đo tự động hiện kiểm tra một bản sao viết tay của ảnh đại diện trợ lý, không phải đúng thành phần đang hiển thị trong ứng dụng. Nếu sau này ai đó lỡ đổi kích thước hay hình dạng logo ở màn hình thật, hệ thống kiểm tra sẽ không phát hiện ra.
  file: `packages/ui/test/logo-markup.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 — lời hứa là một QUAN HỆ (nền = xám chuẩn bg-muted) nhưng chỉ assert «nền không trong suốt» (r4)**
  Người dùng thấy gì: Bài đo hiện chỉ kiểm tra nền phía sau logo không trong suốt, chứ chưa so sánh đúng với màu xám tiêu chuẩn đã hứa. Nếu ô nền đen từng gây lỗi trước đây quay lại trong một lần sửa sau này, hệ thống kiểm tra tự động có thể không báo đỏ.
  file: `_acceptance/logo-onehub/rang/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — E14 assert chuỗi «square» có mặt, trong khi lời hứa là giá trị của thuộc tính phải đúng (r4)**
  Người dùng thấy gì: Bài đo hiện chỉ tìm xem chữ 'square' có xuất hiện trong mã hay không, mà chưa kiểm tra tùy chọn đó có thật sự đang bật hay không. Nếu sau này ai đó vô tình tắt tùy chọn này, ảnh đại diện trợ lý có thể không còn vuông như đã hứa mà hệ thống kiểm tra vẫn báo đạt.
  file: `_acceptance/logo-onehub/rang/o-agent.mjs`
  severity: low
  Đề xuất: known-limits

- **Logo icon generator and its helpers are never type-checked by the repo gate (r1)**
  Người dùng thấy gì: Nếu sau này script sinh icon logo có lỗi kiểu dữ liệu, lỗi đó không bị chặn lại tự động cùng lúc với phần còn lại của mã nguồn, nên có thể lọt sang bản phát hành mà không ai biết trước.
  file: `packages/ui/tsconfig.json`
  severity: low
  Đề xuất: known-limits

- **How to rerun the icon generator is not documented, and the staleness test does not say how (r1)**
  Người dùng thấy gì: Người muốn cập nhật lại bộ icon logo sau này sẽ không biết chạy lệnh nào để làm mới, và thông báo lỗi cũng không chỉ ra cách khắc phục, dễ khiến icon cũ và logo mới lệch nhau mà không ai để ý.
  file: `packages/ui/scripts/logo-icons.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (negative-only assertion, no positive control): an empty canvas passes the E2 centring case with a deviation of exactly 0 (r1)**
  Người dùng thấy gì: Bài kiểm thử canh giữa logo có thể báo 'đạt' ngay cả khi logo bị dựng ra hoàn toàn trống rỗng, vì phép đo không phân biệt được 'canh giữa tốt' với 'không có gì để canh'.
  file: `packages/ui/test/logo-raster.ts`
  severity: high
  Đề xuất: known-limits

- **ranh-gioi.mjs misses files renamed or moved out of a forbidden zone, and renamed Logo caller files, because rename detection lists only the new path (r2)**
  Người dùng thấy gì: Nếu sau này có người đổi tên hoặc di chuyển tệp ra khỏi vùng cấm, công cụ kiểm tra ranh giới có thể không phát hiện và báo an toàn nhầm, để lọt một thay đổi lẽ ra không được phép mà không ai hay biết ngay lúc đó.
  file: `_acceptance/logo-onehub/rang/ranh-gioi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative-only assertion, no positive control): no raster icon case checks that the mark is present, so a blank white image passes E6, E9 and E7 (r1)**
  Người dùng thấy gì: Các bài kiểm thử bộ icon (favicon, icon cài app, ảnh xuất cho Slack/Zalo/Google) có thể báo 'đạt' ngay cả khi icon bị dựng ra trống trơn, vì chúng chỉ kiểm viền và nền trắng chứ không kiểm logo có thực sự xuất hiện hay không.
  file: `packages/ui/test/logo-icons.spec.ts`
  severity: high
  Đề xuất: known-limits

- **ranh-gioi.mjs cannot find the PR merge commit once the branch is on onehub: it gives up with exit 2, or checks the wrong range (r1)**
  Người dùng thấy gì: Sau khi việc đổi logo này được gộp vào nhánh chính, công cụ tự động kiểm tra 'không đụng vùng cấm' có thể báo nhầm hoặc không kiểm tra được gì, nên một thay đổi trái phép vào vùng cấm về sau có nguy cơ không bị phát hiện.
  file: `_acceptance/logo-onehub/rang/ranh-gioi.mjs:57`
  severity: medium
  Đề xuất: known-limits

- **Shape 1 (the E7 red direction changes a key the writer never reads): the mutation targets LOGO_ONEHUB.mark.tam, but sinhBoIcon does not read it (r1)**
  Người dùng thấy gì: Bài kiểm thử được thiết kế để phát hiện khi bộ icon logo bị lỗi thời không thử đúng trường hợp đó, nên nếu bộ icon bị lỗi thời theo đúng cách này, hệ thống vẫn có thể báo mọi thứ ổn.
  file: `_acceptance/logo-onehub/evals.yaml:123`
  severity: high
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
