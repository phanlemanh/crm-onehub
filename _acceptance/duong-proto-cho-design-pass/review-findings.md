## Trong hợp đồng

- **Vỏ proto tự vẽ nút, thẻ và skeleton bằng className thay vì lấy component của packages/ui**
  file: `apps/app/app/proto/_modules/duong-proto/index.tsx:48`
  severity: medium
  AC: AC-1
  source: conventions
  detail: docs/design.md: "/packages/ui là nguồn duy nhất", "Always use shared shadcn components", và biến thể mới thì làm ở /packages/ui chứ không vá tại chỗ. Ba chỗ mới đi ngược:

  - index.tsx:48-50 tự vẽ skeleton `h-5 w-2/3 animate-pulse rounded-md bg-muted` trong khi `packages/ui/src/components/skeleton.tsx` đã có `Skeleton`. Bản tự vẽ mất `motion-reduce:animate-none` của component gốc (một hồi quy a11y thật, không chỉ lệch hình) và dùng `rounded-md` trong khi Skeleton dùng `rounded-sm`.
  - state-switcher.tsx:20-21 tự vẽ nút phân đoạn `rounded-md bg-primary px-3 py-1.5 text-primary-foreground text-sm`, trùng đúng vai của `Button` (variant default/outline, có `asChild` để bọc Link) hoặc `ToggleGroup` — cả hai đã có trong packages/ui. Kích thước cũng lệch: Button là `h-8 ... text-xs`.
  - page.tsx:22 tự vẽ thẻ `rounded-lg border p-4` trên Link thay vì `Card`.

  Đáng chú ý là chính docs/proto.md:84-87 lấy "bản mẫu ghép từ component thật" làm lý do kỹ thuật để bản mẫu không mục, và eval dp_co_bat chỉ đòi thân trang có MỘT dấu `data-slot` bất kỳ (duong-proto.mjs:48) — điều kiện mà ba chỗ vẽ tay trên vẫn thoả nhờ các component khác trong cùng trang.
  failure_scenario: Người dùng bật "giảm chuyển động" của hệ điều hành mở /proto/duong-proto?state=dang-tai: ba vạch skeleton vẫn nhấp nháy, vì bản tự vẽ không mang `motion-reduce:animate-none` như Skeleton của packages/ui. Đồng thời packages/ui đổi token/kích thước nút thì thanh chuyển state không đổi theo — đúng kiểu mục âm thầm mà docs/proto.md nói mình đã chặn.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **PROTO_ROUTE không khai ở globalPassThroughEnv — lệnh bật proto chạy qua turbo sẽ bị lọc mất cờ**
  Người dùng thấy gì: Nếu người vận hành dùng đúng lệnh một dòng được tài liệu hướng dẫn để bật chế độ xem giao diện thử, trang có thể không mở được vì cờ bật không tới được đúng tiến trình.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **.env.example nói cờ đọc lúc dựng, docs/proto.md và răng ban-dung nói lúc chạy**
  Người dùng thấy gì: Tài liệu hướng dẫn bật/tắt chế độ xem giao diện thử đang mâu thuẫn nhau: một chỗ nói phải dựng lại mới tắt được, chỗ khác nói chỉ cần đổi cấu hình rồi khởi động lại là đủ — người vận hành có thể làm thừa việc hoặc hiểu nhầm tính năng đã tắt.
  file: `.env.example`
  severity: medium
  Đề xuất: known-limits

- **proto_route giãn ra bằng slug hồ sơ nghiệm thu, nhưng sổ proto lại khai slug khác → design-pass mở vào 404**
  Người dùng thấy gì: Đường dẫn mẫu để mở trang xem giao diện thử được suy từ tên hồ sơ nghiệm thu khác với tên thật đã đăng ký, nên làm theo hướng dẫn có thể ra một trang báo không tìm thấy thay vì trang mong đợi.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **searchParams khai kiểu hẹp không đúng ở biên, và proxy chỉ soi giá trị state ĐẦU TIÊN**
  Người dùng thấy gì: Cách trang đọc tham số trên đường dẫn không khớp hoàn toàn với cách lớp kiểm tra phía trước đọc cùng tham số đó, để lại khả năng một liên kết ghép khéo có thể né được việc bị chặn khi chọn một trạng thái không tồn tại.
  file: `apps/app/app/proto/[slug]/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **mucMoCoi() xuất ra nhưng không ai gọi; phép kiểm mồ côi bị chép lại ở răng**
  Người dùng thấy gì: Có một đoạn mã kiểm tra bị viết trùng ở hai nơi thay vì dùng chung, không ảnh hưởng người dùng nhưng tăng nguy cơ hai nơi lệch nhau về sau.
  file: `apps/app/app/proto/registry.ts`
  severity: low
  Đề xuất: wont-fix

- **duongProtoHopLe — hàm cổng thật — không có phép đo đơn vị nào, khác với isAnonymous**
  Người dùng thấy gì: Một phần logic quyết định trang xem giao diện thử có được mở hay không hiện chưa có phép kiểm tự động ở mức nhỏ, nên một lỗi ở đó có thể chỉ lộ ra muộn, qua các phép đo nặng và tốn thời gian hơn.
  file: `apps/app/lib/proto-gate.ts`
  severity: low
  Đề xuất: known-limits

- **statSync trên file có thể vắng — răng chết bằng ENOENT, nuốt toàn bộ findings đã gom**
  Người dùng thấy gì: Nếu một mục cấu hình nội bộ trỏ tới tài liệu không tồn tại, công cụ kiểm tra sẽ dừng đột ngột và không in ra được danh sách đầy đủ các lỗi đã phát hiện, khiến người xem báo cáo nhận một lỗi khó hiểu thay vì danh sách rõ ràng.
  file: `_acceptance/duong-proto-cho-design-pass/rang/khai-bao.mjs`
  severity: medium
  Đề xuất: wont-fix

- **ban-dung nuốt stderr của bản dựng — thông báo lỗi thật không bao giờ được in**
  Người dùng thấy gì: Khi bước dựng bản chạy thật bị lỗi, thông báo hiển thị cho người xem không mang theo nội dung lỗi thật sự, nên khó biết nguyên nhân thật của sự cố.
  file: `_acceptance/duong-proto-cho-design-pass/rang/ban-dung.mjs`
  severity: medium
  Đề xuất: wont-fix

- **Răng dựng/chạy next trong apps/app/.next dùng chung — đua với dev server của chính phiên nghiệm thu**
  Người dùng thấy gì: Bản dựng dùng để kiểm tra và máy chủ phát triển đang chạy song song có thể ghi đè lên cùng một thư mục kết quả dựng, khiến kết quả kiểm tra chập chờn và không lặp lại được.
  file: `_acceptance/duong-proto-cho-design-pass/rang/ban-dung.mjs`
  severity: medium
  Đề xuất: wont-fix

- **.env.example khai cờ đọc lúc dựng, trái với docs/proto.md và trái với chính phép đo ban-dung**
  Người dùng thấy gì: Trùng vấn đề mâu thuẫn tài liệu bật/tắt đã nêu ở nơi khác — cùng hậu quả: người vận hành có thể hiểu sai cách tắt chế độ xem giao diện thử.
  file: `.env.example`
  severity: medium
  Đề xuất: known-limits

- **ban-dung không kiểm /proto ở nhánh cờ BẬT — đúng route dễ bị nướng lúc dựng nhất**
  Người dùng thấy gì: Phép kiểm tự động cho bản dựng thật chưa thử mở đúng trang mục lục khi tính năng đang bật, nên một lỗi ở đúng trang đó có thể không bị phát hiện qua phép đo tự động.
  file: `_acceptance/duong-proto-cho-design-pass/rang/ban-dung.mjs`
  severity: low
  Đề xuất: known-limits

- **Phép kiểm dòng chú giải trong .env.example lặng lẽ bỏ qua khi PROTO_ROUTE ở dòng đầu**
  Người dùng thấy gì: Phép kiểm tự động cho việc biến cấu hình có ghi chú giải thích có một khe hở: nếu biến bị dời lên dòng đầu tệp, phép kiểm sẽ bỏ qua mà không báo lỗi.
  file: `_acceptance/duong-proto-cho-design-pass/rang/khai-bao.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 — assert "chuỗi vắng mặt" thay cho quan hệ: bước dựng bị đo bằng grep /error/i trên stdout**
  Người dùng thấy gì: Phép kiểm tự động cho "bản dựng không lỗi" hiện chỉ dò chữ nhạy cảm trong nhật ký dựng một cách thô, nên có thể báo lỗi giả trên một bản dựng thực ra vẫn ổn, hoặc bỏ sót một dòng lỗi thật.
  file: `_acceptance/duong-proto-cho-design-pass/rang/ban-dung.mjs`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 4 — assertion âm-tính-một-mình: kiểm nội dung proto "không rò" mà không có đối chứng dương**
  Người dùng thấy gì: Phép kiểm tự động xác nhận nội dung trang xem giao diện thử không bị lộ khi tính năng tắt chỉ kiểm một chiều — một lỗi làm sai nội dung khi tính năng bật có thể không bị phát hiện.
  file: `_acceptance/duong-proto-cho-design-pass/rang/ban-dung.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — assert 'aria-current="page"' có mặt trong khi lời hứa là quan hệ giữa state được yêu cầu và thẻ được đánh dấu**
  Người dùng thấy gì: Phép kiểm tự động xác nhận trạng thái đang chọn được đánh dấu đúng chỉ kiểm dấu hiệu có xuất hiện ở đâu đó trên trang, không kiểm nó nằm đúng chỗ — một lỗi đánh dấu sai vị trí có thể không bị phát hiện.
  file: `_acceptance/duong-proto-cho-design-pass/rang/duong-proto.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — "có dòng bắt đầu bằng #" đứng thay cho lời hứa "PROTO_ROUTE có chú giải của riêng nó"; chiều đo mà E10 khai không làm đỏ được**
  Người dùng thấy gì: Phép kiểm tự động xác nhận biến cấu hình có ghi chú giải thích riêng có một khe hở khiến nó gần như không bao giờ báo lỗi kể cả khi ghi chú thật sự bị xoá.
  file: `_acceptance/duong-proto-cho-design-pass/rang/khai-bao.mjs`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 1 — chốt chống trôi đo một nguồn thay thế: rút tên biến từ proto-gate.ts trong khi cổng mà E9 gọi tên (layout.tsx) không được kiểm**
  Người dùng thấy gì: Phép kiểm tự động chống lệch tên biến cấu hình chỉ đối chiếu với một trong hai nơi mã nguồn đọc biến đó, nên đổi tên biến ở nơi còn lại có thể làm cấu hình lệch với mã nguồn mà không ai biết.
  file: `_acceptance/duong-proto-cho-design-pass/rang/khai-bao.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — 'data-slot' đo trên toàn tài liệu trong khi lời hứa là thân proto dựng bằng component thật**
  Người dùng thấy gì: Phép kiểm tự động xác nhận trang dùng đúng component giao diện thật quét trên toàn bộ trang thay vì đúng phần nội dung của bản mẫu, nên có thể báo đạt ngay cả khi phần nội dung chính bị thay bằng mã tự vẽ.
  file: `_acceptance/duong-proto-cho-design-pass/rang/duong-proto.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét cả danh sách ANONYMOUS (2 phần tử) nhưng chỉ có điểm-case cho 1**
  Người dùng thấy gì: Một danh sách đường dẫn được phép truy cập không cần đăng nhập có hai mục, nhưng phép kiểm tự động hiện chỉ thử hành vi cho một trong hai; mục còn lại (không thuộc thay đổi lần này) có thể hỏng mà không bị phát hiện.
  file: `apps/app/test/proxy-an-danh.spec.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
