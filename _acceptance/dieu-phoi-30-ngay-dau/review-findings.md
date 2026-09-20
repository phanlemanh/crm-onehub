# Review Findings: dieu-phoi-30-ngay-dau (round 1, lượt chấm lại)

Lượt này chấm trên bản đã sửa ba lỗi trong hợp đồng của lượt trước.
Verdict **BLOCKED** (E11 + E15 không chạy được), nên đây chưa phải bộ phát hiện cuối.

## Trong hợp đồng

- **Điểm nhận đếm «đã chuyển cho tác nhân» kể cả khi không việc nào được ghi**
  file: `apps/api/src/onboarding/onboarding-ingest.service.ts:90`
  severity: medium
  AC: AC-6
  source: bugs
  vì sao trong hợp đồng: Kịch bản nêu ra vẫn là 'một mục mang mã nền tảng không khớp cá nhân nào' đúng Given của AC-6, nhưng do chống trùng thiếu planId, không có hàng AgentTask nào được ghi cho lô đó dù phản hồi vẫn đếm nó vào số chuyển tác nhân — trái đúng vế 'một hàng AgentTask được ghi' của AC-6.
  detail: `nhan()` tính `viecMoi` từ giá trị trả về của `onboardingMatchNeeded` và ghi vào log (dòng 75-88), nhưng phản hồi ở dòng 90 vẫn trả `chuyenTacNhan: chuaKhop.length`. `enqueue` trả `false` (không ném) khi đã có task trùng, và câu chống trùng ở agent-trigger.service.ts:485-497 chỉ lọc theo `kind` + `payload.platformBrokerId` — KHÔNG có `planId`, dù payload mang `planId`. Kịch bản: mã `MG-9` chưa khớp ở kế hoạch A sinh một task còn treo; hôm sau nền tảng gửi lô của kế hoạch B cũng chứa `MG-9` → `enqueue` trả false, không task nào cho kế hoạch B, nhưng phản hồi vẫn nói `chuyenTacNhan: 1`. Nền tảng coi như đã bàn giao; ghi danh của kế hoạch B không bao giờ được tạo và không có đường thử lại.

## Ngoài hợp đồng — người quyết ở Cổng Bằng chứng

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi — người quyết, máy không sửa.

- **ONEHUB_PLATFORM_INGEST_SECRET khai trong env.validation mà không có decorator nào**
  Người dùng thấy gì: Nếu khoá bí mật dùng để nhận dữ liệu từ nền tảng OneHub được đặt quá ngắn hoặc sai định dạng, hệ thống vẫn khởi động bình thường và chấp nhận nó, khiến cửa nhận dữ liệu dễ bị đoán ra hơn.
  file: `apps/api/src/config/env.validation.ts:115`
  severity: high
  source: conventions
  Đề xuất: known-limits

- **So khoá Bearer của điểm nhận không chống đo thời gian, trong khi bản anh em có**
  Người dùng thấy gì: Cách so khoá bí mật ở điểm nhận thông tin đối tác kém an toàn hơn điểm nhận dữ liệu khác trong cùng hệ thống, vì nó thoát sớm ngay khi so sai.
  file: `apps/api/src/onboarding/onboarding.controller.ts:74`
  severity: high
  source: conventions
  Đề xuất: known-limits

- **listPlans bỏ pattern list-input có sẵn: nuốt q/sort/dir và đếm facet bằng vòng lặp N+1**
  Người dùng thấy gì: Khi người dùng sắp xếp hoặc tìm kiếm trong danh mục kế hoạch, yêu cầu đó bị bỏ qua âm thầm và danh sách vẫn hiện theo thứ tự cũ; màn hình cũng có thể tải chậm hơn khi có nhiều bộ phận.
  file: `apps/api/src/onboarding/onboarding.service.ts:326`
  severity: high
  source: conventions
  Đề xuất: known-limits

- **Phễu bậc in thẳng tên cột CSDL ra màn hình thay vì đi qua bộ chữ**
  Người dùng thấy gì: Tên bốn bậc trong phễu môi giới hiện ra bằng tên kỹ thuật của cơ sở dữ liệu thay vì chữ dễ hiểu, ở cả hai ngôn ngữ của sản phẩm.
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx:143`
  severity: high
  source: conventions
  Đề xuất: known-limits

- **Màn hồ sơ kế hoạch vẽ lỗi tải thành màn rỗng bình thường**
  Người dùng thấy gì: Khi tải dữ liệu của màn hồ sơ kế hoạch bị lỗi, người dùng thấy một hồ sơ trống bình thường (0 bước, 0 người ghi danh) mà không biết đó là do lỗi tải, không phải sự thật.
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx:54`
  severity: high
  source: bugs
  Đề xuất: known-limits

- **Nút «Gỡ» thất bại không báo gì cho người dùng**
  Người dùng thấy gì: Khi bấm «Gỡ» một người ghi danh mà thao tác thất bại (mất mạng, hoặc người khác đã gỡ trước), hộp thoại vẫn đóng êm và không báo lỗi — nhân viên tưởng đã gỡ thành công dù thực tế không có gì thay đổi.
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx:44`
  severity: high
  source: bugs
  Đề xuất: known-limits

- **Bộ lọc danh mục là onClick trên <span>, bàn phím không với tới**
  Người dùng thấy gì: Toàn bộ đường lọc trên màn danh mục (theo trạng thái và bộ phận) chỉ dùng được bằng chuột — người dùng bàn phím hoặc trình đọc màn hình không đổi được bộ lọc.
  file: `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx:119`
  severity: high
  source: bugs
  Đề xuất: known-limits

- **Hình dạng 1 — đo CHỈ DẪN thay vì ĐẦU RA: E15 khẳng định bảng parser, không hề chạm đường dẫn**
  Người dùng thấy gì: Phép đo tự động cho việc bộ lọc nằm trên đường dẫn URL hiện chỉ kiểm tra các hàm nội bộ chứ chưa thực sự mở màn hình và thử đổi bộ lọc — nếu tính năng lọc qua URL bị hỏng sau này, phép đo này sẽ không phát hiện ra.
  file: `apps/app/test/dieu-phoi-trang-thai.spec.ts:18`
  severity: high
  source: measurement
  Đề xuất: known-limits

- **Hình dạng 1 — đo CHỈ DẪN thay vì ĐẦU RA: E11 khai lại executor mà chính config.yaml ghi là không chạy được**
  Người dùng thấy gì: Tiêu chí duy nhất về hình ảnh màn hình danh mục hiện không có phép đo máy nào thực sự chạy và đọc kết quả — không ai biết chắc màn hình có hiện đúng bậc đang tắc và số ngày im hay không, ngoài việc nhìn bằng mắt.
  file: `_acceptance/dieu-phoi-30-ngay-dau/evals.yaml:260`
  severity: high
  source: measurement
  Đề xuất: known-limits

- **Hình dạng 2 — fixture VIẾT TAY đúng khuôn bên đọc: E7 dựng ConfigService giả, không đi qua env.validation**
  Người dùng thấy gì: Phép đo cho việc 'hệ thống khởi động được dù thiếu khoá bí mật' dùng một phiên bản giả lập thay vì đường đọc cấu hình thật — nếu cách đọc cấu hình thật bị đổi và làm hệ thống không khởi động được nữa, phép đo này vẫn có thể báo xanh.
  file: `apps/api/test/dieu-phoi-diem-nhan.spec.ts:23`
  severity: high
  source: measurement
  Đề xuất: known-limits

- **Hình dạng 4 — khẳng định âm-tính-một-mình: E1 không có đối chứng dương cho đường đọc lại**
  Người dùng thấy gì: Phép đo cho việc 'sửa khuôn không ảnh hưởng kế hoạch đã tạo' chỉ kiểm tra chiều dữ liệu KHÔNG đổi, chứ chưa từng kiểm tra chiều dữ liệu CÓ đổi khi đáng phải đổi — nếu chức năng đọc dữ liệu ngầm hỏng hoàn toàn, phép đo này vẫn có thể báo xanh.
  file: `apps/api/test/dieu-phoi.spec.ts:140`
  severity: high
  source: measurement
  Đề xuất: known-limits

- **Màn hồ sơ kế hoạch nhập ConfirmDialog từ thư mục tính năng khác**
  Người dùng thấy gì: Một hộp thoại xác nhận dùng chung giữa hai màn hình đang nằm nhờ trong thư mục của tính năng khác — nếu tính năng đó bị sửa mà không biết, màn điều phối đối tác có thể hỏng theo mà không có cảnh báo.
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx:24`
  severity: medium
  source: conventions
  Đề xuất: known-limits

- **Badge (một <span>) dùng làm nút lọc — không focus được, không có role, không có bàn phím**
  Người dùng thấy gì: Bộ lọc trạng thái và bộ phận trên màn danh mục chỉ bấm được bằng chuột — người dùng bàn phím hoặc dùng trình đọc màn hình không lọc được bảng.
  file: `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx:123`
  severity: medium
  source: conventions
  Đề xuất: known-limits

- **ensureField / ensureMaNenTangField là hai bản chép y hệt trong cùng một module**
  Người dùng thấy gì: Có hai đoạn mã lo cùng một việc (tạo trường tự khai cho đối tác) sống song song; nếu chỉ một bên được sửa sau này, dữ liệu tạo ra ở hai đường có thể lệch nhau mà không ai biết.
  file: `apps/api/src/onboarding/onboarding-ingest.service.ts:93`
  severity: medium
  source: conventions
  Đề xuất: known-limits

- **DAY_MS khai hai lần — trái luật hằng số một chỗ của AGENTS.md**
  Người dùng thấy gì: Một con số dùng để tính thời gian được viết lặp lại ở hai chỗ trong mã; nếu chỉ một chỗ được sửa sau này, các phép tính thời gian ở hai nơi có thể lệch nhau.
  file: `apps/api/src/onboarding/onboarding.service.ts:39`
  severity: medium
  source: conventions
  Đề xuất: known-limits

- **Hai nhánh của ONBOARDING config không có người dùng, một nhánh còn ghim lại số 500 của gói validation**
  Người dùng thấy gì: Trần số dòng tối đa mỗi lô gửi lên và ngưỡng cảnh báo im lặng lâu ngày được khai trong cấu hình nhưng không nơi nào thực sự dùng tới — chỉnh con số ở đó sẽ không đổi gì trên thực tế, dễ gây hiểu lầm khi vận hành.
  file: `apps/api/src/onboarding/onboarding-config.ts:11`
  severity: medium
  source: conventions
  Đề xuất: known-limits

- **Liên kết nội bộ duy nhất trong app viết bằng thẻ <a> thô và đường dẫn tương đối**
  Người dùng thấy gì: Đường dẫn sang trang Cài đặt Khuôn (khi chưa có khuôn nào) có thể dẫn sai chỗ và ra trang không tìm thấy, tuỳ vào địa chỉ hiện tại có dấu gạch chéo ở cuối hay không.
  file: `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx:96`
  severity: medium
  source: conventions
  Đề xuất: known-limits

- **createFromTemplate không đối chiếu companyId và ownerId, để lỗi khoá ngoại nổ thành 500**
  Người dùng thấy gì: Nếu người tạo kế hoạch chọn một công ty hoặc một người cầm trịch không còn tồn tại, người dùng sẽ thấy một lỗi hệ thống khó hiểu thay vì một thông báo rõ ràng.
  file: `apps/api/src/onboarding/onboarding.service.ts:176`
  severity: medium
  source: conventions
  Đề xuất: known-limits

- **Tới 500 upsert tuần tự trong một interactive transaction của Prisma**
  Người dùng thấy gì: Khi một lô dữ liệu từ nền tảng OneHub có nhiều mục (gần trần cho phép), việc ghi vào cơ sở dữ liệu có thể quá thời gian cho phép và cả lô hợp lệ bị từ chối dù không có gì sai.
  file: `apps/api/src/onboarding/onboarding-ingest.service.ts:41`
  severity: medium
  source: conventions
  Đề xuất: known-limits

- **Lọc ra 0 hàng thì mất luôn thanh lọc — người dùng kẹt trong ngõ cụt**
  Người dùng thấy gì: Nếu bộ lọc trên màn danh mục lọc ra 0 kết quả, toàn bộ thanh lọc biến mất luôn, khiến người dùng không còn cách nào bỏ lọc để xem lại danh sách trừ khi tự sửa tay đường dẫn trên trình duyệt.
  file: `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx:103`
  severity: medium
  source: bugs
  Đề xuất: known-limits

- **Hai cá nhân trùng mã nền tảng thì khớp bừa vào người cuối cùng**
  Người dùng thấy gì: Nếu hai cá nhân trong hệ thống lỡ mang cùng một mã môi giới của nền tảng OneHub, dữ liệu gửi lên cho mã đó sẽ tự động gán vào một người bất kỳ trong hai người, không có cảnh báo nào, có thể đắp nhầm tiến độ sang người khác.
  file: `apps/api/src/onboarding/onboarding-ingest.service.ts:31`
  severity: medium
  source: bugs
  Đề xuất: known-limits

- **ONBOARDING.ingest.maxItemsPerBatch là hằng số chết, trần thật nằm chỗ khác**
  Người dùng thấy gì: Trần số dòng tối đa mỗi lô gửi lên được khai ở hai nơi khác nhau trong mã nguồn với cùng một giá trị; nếu ai đó chỉnh trần này ở nơi tưởng là đúng chỗ, giới hạn thực tế sẽ không đổi, gây khó hiểu khi vận hành.
  file: `apps/api/src/onboarding/onboarding-config.ts:10`
  severity: medium
  source: bugs
  Đề xuất: known-limits

- **Ngưỡng «im lặng 7 ngày» khai trong cấu hình nhưng không mã nào đọc**
  Người dùng thấy gì: Ngưỡng cảnh báo «im lặng nhiều ngày» được khai trong cấu hình nhưng không có màn hình hay cảnh báo nào thực sự dùng tới — một kế hoạch im hơi 40 ngày và một kế hoạch im 2 ngày hiện ra giống hệt nhau trên màn danh mục.
  file: `apps/api/src/onboarding/onboarding-config.ts:7`
  severity: medium
  source: bugs
  Đề xuất: known-limits

- **Bốn nút gọi-hành-động của các trạng thái rỗng không gắn handler nào**
  Người dùng thấy gì: Bốn nút mời gọi hành động ở các trạng thái trống (ví dụ «Kế hoạch mới từ khuôn», «Khuôn mới», «Bộ phận mới», «Thêm môi giới») hiện ra nhưng bấm vào không có phản ứng gì — người dùng mới cài đặt có thể không tìm được cách bắt đầu qua giao diện.
  file: `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx:111`
  severity: medium
  source: bugs
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét LỚP nhưng chỉ quét một góc: rang chỉ đọc .ts dưới apps/api**
  Người dùng thấy gì: Công cụ tự động rà soát số cứng trong mã chỉ quét phần API, bỏ qua toàn bộ mã giao diện — một con số cứng ở phía giao diện có thể lọt qua mà công cụ vẫn báo sạch.
  file: `_acceptance/dieu-phoi-30-ngay-dau/rang/hang-so-o-config.mjs:19`
  severity: medium
  source: measurement
  Đề xuất: known-limits

- **Hình dạng 3 — assert "chuỗi có mặt" trong khi lời hứa là QUAN HỆ (hằng số được khai VÀ được dùng)**
  Người dùng thấy gì: Công cụ tự động rà soát chỉ kiểm tra con số có xuất hiện trong file cấu hình hay không, chứ chưa kiểm tra có mã nào thực sự dùng con số đó hay không — một ngưỡng khai trong cấu hình nhưng không nơi nào dùng vẫn được báo là hợp lệ.
  file: `_acceptance/dieu-phoi-30-ngay-dau/rang/hang-so-o-config.mjs:63`
  severity: medium
  source: measurement
  Đề xuất: known-limits

- **Màn hồ sơ kế hoạch không có nhánh lỗi, dù màn danh mục có**
  Người dùng thấy gì: Khi màn hồ sơ kế hoạch tải dữ liệu bị lỗi (mất mạng, máy chủ lỗi), màn hình hiện ra y hệt một kế hoạch trống, khiến người dùng tưởng nhầm là kế hoạch thật sự chưa có gì, và không có nút thử lại.
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx:55`
  severity: low
  source: conventions
  Đề xuất: known-limits

- **Nút «Gỡ» luôn nhắm ghi danh đầu tiên, không phải hàng người dùng chọn**
  Người dùng thấy gì: Nút «Gỡ» trên màn hồ sơ kế hoạch luôn nhắm vào người ghi danh đầu tiên trong danh sách chứ không phải người nhân viên định gỡ, có nguy cơ xoá nhầm ghi danh của người khác.
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx:176`
  severity: low
  source: conventions
  Đề xuất: known-limits

- **Điểm nhận không ghi log khi thiếu khoá, khác bản anh em**
  Người dùng thấy gì: Khi khoá nhận dữ liệu từ nền tảng OneHub chưa được cấu hình, hệ thống từ chối lô gửi lên mà không để lại dấu vết nào trong nhật ký, khiến đội kỹ thuật khó phát hiện đường nhận dữ liệu đang bị tắt.
  file: `apps/api/src/onboarding/onboarding.controller.ts:68`
  severity: low
  source: conventions
  Đề xuất: known-limits

- **ONEHUB_PLATFORM_INGEST_SECRET không có decorator kiểm nào**
  Người dùng thấy gì: Khoá bí mật dùng để nhận dữ liệu từ nền tảng OneHub không được kiểm định dạng hay độ dài, nên một khoá quá yếu vẫn được chấp nhận khi khởi động.
  file: `apps/api/src/config/env.validation.ts:115`
  severity: low
  source: bugs
  Đề xuất: known-limits

Cụm ngoài vùng phủ: không đo được (cluster: n-a).
