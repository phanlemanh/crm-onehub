# Review Findings: dieu-phoi-30-ngay-dau (round 1)

## Trong hợp đồng

- **Mã không khớp thứ hai trở đi bị enqueue bỏ âm thầm, nhưng phản hồi vẫn đếm là đã chuyển cho tác nhân**
  file: `apps/api/src/onboarding/onboarding-ingest.service.ts:75`
  severity: high
  AC: AC-6
  source: bugs
  detail: `onboardingMatchNeeded` gọi `AgentTriggerService.enqueue` với task KHÔNG có `contactId`, `companyId` và KHÔNG có `subject`. Vì vậy câu chống trùng ở agent-trigger.service.ts:479-491 trở thành `findFirst({ where: { kind: "onboarding-identify", finishedAt: null } })` — bất kỳ task onboarding-identify nào còn treo đều khớp, bất kể mã môi giới hay kế hoạch nào. Hệ quả: trong CHÍNH một lô có hai mã không khớp, mã đầu tạo task, mã thứ hai bị `return false` và biến mất; mọi lô sau cũng vậy chừng nào task đầu chưa `finishedAt`. Ingest bỏ qua giá trị trả về của enqueue (vòng lặp không đọc kết quả) và vẫn trả `chuyenTacNhan: chuaKhop.length`, nên phản hồi + dòng log báo N mã đã chuyển trong khi chỉ 1 hàng AgentTask được ghi. Mã bị mất không lưu ở đâu khác nên không có đường thử lại. Ngoài ra `enqueue` bắt mọi lỗi và trả false khi `required=false` (mặc định), nên cả lỗi ghi thật cũng bị nuốt và vẫn đếm vào `chuyenTacNhan`. E6 không bắt được vì test (apps/api/test/dieu-phoi-diem-nhan.spec.ts:14-27) thay hẳn AgentTriggerService bằng stub tự ghi agentTask, và chỉ dùng MỘT mã không khớp. Đây đúng là lớp lỗi AC-6 định chặn: mã không khớp phải tới được tác nhân.

- **Nút «Gỡ» môi giới không gỡ gì — onConfirm gọi upsertEnrollment, và còn lật source về "tay"**
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx:158`
  severity: high
  AC: AC-12
  source: bugs
  detail: Hộp thoại xác nhận nói «Gỡ môi giới này khỏi kế hoạch? Bốn mốc bậc của người đó đi theo luôn. Việc này không đảo lại được» (lib/messages/onboarding.ts), nhưng `onConfirm` chạy `go.mutate({ planId, contactId: id, source: "tay" })` với `go = useMutation(trpc.onboarding.upsertEnrollment...)`. `upsertEnrollment` (onboarding.service.ts:386) chỉ upsert và `update: { source }` — không hàng nào bị xoá, bốn mốc bậc còn nguyên. Router/generated server không có thủ tục xoá ghi danh nào cả (apps/api/src/onboarding/onboarding.router.ts, src/generated/server.ts), nên lời hứa AC-12 không thể thực hiện được. Hai hệ quả cụ thể: (1) người dùng bấm Gỡ → xác nhận → hàng vẫn ở đó sau khi invalidate, không có lỗi nào hiện ra; (2) nếu ghi danh đó đến từ nền tảng (`source: "nen-tang"`), cú bấm này âm thầm đổi nó thành "tay". Eval dp30_xoa_co_xac_nhan chỉ kiểm hàm thuần `luong-xoa.ts`, không chạm dây nối, nên đèn vẫn xanh.

- **Hình dạng 1 (đo chỉ dẫn/helper thay vì đầu ra) — E12 đo bộ giảm thuần luong-xoa, không đo màn hồ sơ**
  file: `apps/app/test/dieu-phoi-trang-thai.spec.ts:79`
  severity: high
  AC: AC-12
  source: measurement
  detail: E12 hứa: "Dung man ho so ke hoach voi mot ghi danh. Bam nut xoa" → hộp thoại hiện ra, hàm xoá chưa được gọi. Ba test trong describe "xoa-co-xac-nhan" (dòng 80, 98, 116) chỉ gọi luongXoaMoi/moHoi/xacNhan/huy của apps/app/app/(app)/[slug]/onboarding/luong-xoa.ts với một closure `xoa` do chính test dựng; HoSoKeHoach không hề được render, ConfirmDialog không hề được mount. Đột biến mà chính E12 khai ("bo hop thoai, goi xoa thang") xảy ra trong ho-so-ke-hoach.tsx, nơi phép đo không chạm tới, nên nó vẫn xanh. Bằng chứng rằng lỗ này là thật, không suy diễn: trong ho-so-ke-hoach.tsx, onConfirm của ConfirmDialog gọi `go.mutate({ planId, contactId: id, source: "tay" })` — tức trpc.onboarding.upsertEnrollment, một phép GHI, không phải phép xoá; nút m.hoSo.remove đang nối vào đường upsert mà cả ba test vẫn xanh. Phép đo đang đo bộ giảm, không đo hành vi được hứa.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Ingest bearer compare is not timing-safe, unlike the sibling endpoint it copies**
  Người dùng thấy gì: Cách kiểm khóa bí mật ở điểm nhận dữ liệu từ nền tảng chưa được làm an toàn như điểm nhận tương tự, nên có nguy cơ ai đó dò ra khóa và gửi dữ liệu giả vào hệ thống.
  file: `apps/api/src/onboarding/onboarding.controller.ts`
  severity: high
  Đề xuất: new-contract

- **ONEHUB_PLATFORM_INGEST_SECRET has no validation decorators at all**
  Người dùng thấy gì: Nếu khóa bí mật của điểm nhận dữ liệu từ nền tảng bị đặt quá ngắn hoặc yếu, hệ thống vẫn khởi động và chạy bình thường mà không báo gì, nên khóa yếu có thể lọt qua mà không ai biết.
  file: `apps/api/src/config/env.validation.ts`
  severity: high
  Đề xuất: new-contract

- **Plan creation trusts ownerId/companyId from the client with no existence check; `requireOwner` ignored**
  Người dùng thấy gì: Khi tạo hoặc cập nhật một kế hoạch với người hoặc công ty không còn tồn tại, hệ thống có thể báo lỗi kỹ thuật khó hiểu thay vì một thông báo rõ ràng.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: high
  Đề xuất: new-contract

- **listPlans accepts listInput but silently drops q, sort and dir**
  Người dùng thấy gì: Nếu người dùng thử tìm kiếm hoặc đổi thứ tự sắp xếp trong danh mục kế hoạch, hệ thống âm thầm bỏ qua yêu cầu đó và vẫn hiện danh sách theo thứ tự cũ.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: high
  Đề xuất: known-limits

- **Facet counts are an N+1 loop; countsByKey from the same module is ignored**
  Người dùng thấy gì: Màn danh mục có thể tải chậm hơn cần thiết khi có nhiều bộ phận, vì hệ thống phải hỏi cơ sở dữ liệu nhiều lần thay vì một lần.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: high
  Đề xuất: wont-fix

- **Field-definition creation duplicated byte-for-byte in two services, bypassing the FieldsService pattern**
  Người dùng thấy gì: Nếu hai lô dữ liệu từ nền tảng cùng khai một trường mới lần đầu, có nguy cơ trường đó được tạo ra hai lần với hình dạng không giống nhau.
  file: `apps/api/src/onboarding/onboarding-ingest.service.ts`
  severity: high
  Đề xuất: new-contract

- **Structured log uses `msg:` where ContextLogger only recognises `message:`**
  Người dùng thấy gì: Dòng ghi log của điểm nhận dữ liệu từ nền tảng có thể không hiện đúng dạng trên hệ thống theo dõi lỗi, gây khó khi cần tra cứu sự cố sau này.
  file: `apps/api/src/onboarding/onboarding-ingest.service.ts`
  severity: high
  Đề xuất: known-limits

- **Funnel stages render raw database column names to the user**
  Người dùng thấy gì: Trên màn hồ sơ kế hoạch, bốn tên bậc của phễu hiện ra bằng tên kỹ thuật tiếng Anh viết tắt, khó hiểu, thay vì tên tiếng Việt như trong bản mẫu đã duyệt.
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx`
  severity: high
  Đề xuất: new-contract

- **Server prefetch ignores the URL filters; loadOnboardingSearchParams is dead code**
  Người dùng thấy gì: Khi mở một đường dẫn danh mục đã có lọc sẵn do người khác gửi, màn có thể hiện chớp nhoáng dữ liệu sai trước khi tự sửa lại đúng, gây cảm giác chập chờn.
  file: `apps/app/app/(app)/[slug]/onboarding/page.tsx`
  severity: high
  Đề xuất: known-limits

- **Catalog screen hand-rolls a table and uses Badge as a filter button**
  Người dùng thấy gì: Các nút lọc theo bộ phận trên màn danh mục không dùng được bằng bàn phím và không có dấu hiệu rõ khi đang được chọn, gây khó cho người dùng bàn phím hoặc trình đọc màn hình.
  file: `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx`
  severity: medium
  Đề xuất: new-contract

- **Template step schema duplicated instead of imported from packages/validation**
  Người dùng thấy gì: Nếu hai nơi kiểm dữ liệu bước của khuôn được sửa không đồng bộ, một khuôn có thể được lưu ở một nơi nhưng bị nơi khác từ chối một cách khó hiểu.
  file: `apps/api/src/onboarding/onboarding.contracts.ts`
  severity: medium
  Đề xuất: wont-fix

- **Batch-size cap declared twice and enforced by neither copy in onboarding-config; stale threshold unused**
  Người dùng thấy gì: Số giới hạn mỗi lô và ngưỡng bảy ngày trong cấu hình có thể bị đổi mà không ảnh hưởng gì tới cách hệ thống thật sự chạy, nên chỉnh cấu hình không chắc chỉnh được hành vi.
  file: `apps/api/src/onboarding/onboarding-config.ts`
  severity: medium
  Đề xuất: known-limits

- **Date rendered with toLocaleDateString instead of the LocalDateTime component**
  Người dùng thấy gì: Ngày hạn hiển thị trên màn hồ sơ kế hoạch có thể hiện khác nhau trong một khoảnh khắc giữa lần tải đầu và sau đó, gây nhấp nháy khó chịu.
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx`
  severity: medium
  Đề xuất: wont-fix

- **DAY_MS defined twice inside the onboarding area**
  Người dùng thấy gì: Một con số thời gian được viết ở hai nơi khác nhau trong mã, nên nếu một nơi bị sửa mà quên nơi kia, các hạn ngày có thể tính sai mà không ai để ý.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: low
  Đề xuất: wont-fix

- **Màn hồ sơ kế hoạch không có nhánh lỗi: gọi API thất bại hiện thành «0/0 xong» và «chưa ghi danh môi giới nào»**
  Người dùng thấy gì: Nếu việc tải dữ liệu bước hoặc danh sách môi giới của một kế hoạch bị lỗi, màn hồ sơ kế hoạch vẫn hiện ra như một kế hoạch có thật nhưng trống, khiến người dùng tin nhầm là kế hoạch chưa có gì.
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx`
  severity: high
  Đề xuất: new-contract

- **trangThai suy từ rows đã lọc: lọc ra không kết quả thì hiện «Chưa có kế hoạch nào» và mất luôn cả thanh bộ lọc — người dùng vào đường cụt**
  Người dùng thấy gì: Khi chọn một bộ lọc bộ phận mà không có kế hoạch nào khớp, màn danh mục nói sai là chưa từng có kế hoạch nào, và người dùng mất luôn thanh bộ lọc để quay lại xem tất cả.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: high
  Đề xuất: new-contract

- **Trùng mã nền tảng giữa hai Cá nhân bị Map ghi đè âm thầm — máy chọn một người mà không ai biết**
  Người dùng thấy gì: Nếu hai người trong hệ thống vô tình mang cùng một mã môi giới từ nền tảng, hệ thống có thể tự chọn gắn kết quả cho một trong hai người mà không ai được hỏi hay được báo.
  file: `apps/api/src/onboarding/onboarding-ingest.service.ts`
  severity: medium
  Đề xuất: new-contract

- **Lô từ nền tảng ghi đè cả bốn mốc bậc bằng null, xoá mốc người nhập tay**
  Người dùng thấy gì: Một lô dữ liệu gửi từ nền tảng có thể xoá sạch các mốc bậc mà nhân viên đã tự tay đánh dấu trước đó, mà không có cảnh báo nào.
  file: `apps/api/src/onboarding/onboarding-ingest.service.ts`
  severity: medium
  Đề xuất: new-contract

- **listPlans nhận q/sort/dir trong hợp đồng rồi bỏ lặng, sắp xếp luôn cứng là startedAt asc**
  Người dùng thấy gì: Nếu người dùng thử tìm kiếm hoặc đổi thứ tự sắp xếp trong danh mục kế hoạch, hệ thống âm thầm bỏ qua yêu cầu đó và vẫn hiện danh sách theo thứ tự cũ.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Ngưỡng nguội 7 ngày trong config không nơi nào dùng — thước AC-10 chỉ kiểm nó được KHAI, không kiểm nó được DÙNG**
  Người dùng thấy gì: Ngưỡng bảy ngày để đánh dấu một kế hoạch im lặng có trong cấu hình nhưng không nơi nào thật sự dùng tới, nên chỉnh số này không chắc thay đổi được gì trên màn hình.
  file: `apps/api/src/onboarding/onboarding-config.ts`
  severity: medium
  Đề xuất: known-limits

- **xacNhan gọi mutate bên trong updater của setState — StrictMode dev bắn mutation hai lần**
  Người dùng thấy gì: Nếu tính năng gỡ ghi danh được nối vào việc xoá thật sau này, mỗi lần bấm xác nhận trong môi trường phát triển có thể vô tình gửi yêu cầu xoá hai lần thay vì một.
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx`
  severity: medium
  Đề xuất: wont-fix

- **ensureMaNenTangField nhân đôi ở hai service và check-then-create không chịu được hai lô cùng lúc**
  Người dùng thấy gì: Nếu hai lô dữ liệu từ nền tảng cùng đến gần như đồng thời lần đầu, một trong hai có thể bị hệ thống báo lỗi thay vì được xử lý bình thường.
  file: `apps/api/src/onboarding/onboarding-ingest.service.ts`
  severity: low
  Đề xuất: wont-fix

- **ONEHUB_PLATFORM_INGEST_SECRET khai mà không có validator nào, khác hẳn LISTING_INGEST_SECRET**
  Người dùng thấy gì: Khóa bí mật của điểm nhận dữ liệu từ nền tảng không bị kiểm về độ dài hay định dạng, khác với khóa của điểm nhận tương tự, nên một khóa yếu có thể được đặt mà không ai cảnh báo.
  file: `apps/api/src/config/env.validation.ts`
  severity: low
  Đề xuất: new-contract

- **reorderDepartments không kiểm id và không phủ hết hàng — thứ tự có thể trùng vị trí**
  Người dùng thấy gì: Khi đổi thứ tự các bộ phận mà không gửi đủ danh sách, một số bộ phận có thể hiện trùng vị trí hoặc thứ tự trở nên lộn xộn không báo trước.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 1+3 (đo sổ đăng ký khoá, khẳng định "khoá có mặt" thay vì quan hệ đường-dẫn ⇄ hàng) — E15**
  Người dùng thấy gì: Phép kiểm tự động cho việc lọc theo bộ phận trên đường dẫn không thực sự mở màn hình hay đếm số dòng kết quả, nên nếu bộ lọc vô tình không còn ghi vào đường dẫn nữa, phép kiểm này sẽ không phát hiện ra.
  file: `apps/app/test/dieu-phoi-trang-thai.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 (hàng AgentTask do chính test viết tay, không round-trip qua bên ghi thật) — E6 vế 3**
  Người dùng thấy gì: Phép kiểm tự động cho việc chuyển mã không khớp cho tác nhân xử lý dùng một bản giả thay cho đường ghi dữ liệu thật, nên nếu đường ghi thật có vấn đề, phép kiểm này vẫn báo ổn.
  file: `apps/api/test/dieu-phoi-diem-nhan.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 (khẳng định "chuỗi có mặt" thay vì quan hệ hằng-số ⇄ mã dùng nó) — vế 2 của E10 không chặn được cấu hình trang trí**
  Người dùng thấy gì: Công cụ tự động dùng để bảo đảm ngưỡng chỉnh được ở một chỗ có thể không thật sự phát hiện khi ngưỡng bảy ngày bị bỏ quên, không được dùng ở đâu trong ứng dụng.
  file: `_acceptance/dieu-phoi-30-ngay-dau/rang/hang-so-o-config.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp "không file nào ngoài cấu hình" nhưng phạm vi quét chỉ một thư mục .ts)**
  Người dùng thấy gì: Công cụ kiểm tra chỉ soi một phần nhỏ mã nguồn điều phối, nên số 30 hoặc ngưỡng nguội có thể vẫn bị ghim cứng ở những màn hình khác mà không ai phát hiện.
  file: `_acceptance/dieu-phoi-30-ngay-dau/rang/hang-so-o-config.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (khẳng định lại khai báo, không đo hiệu lực) — test "tran lo doc tu cau hinh"**
  Người dùng thấy gì: Có một phép kiểm tự động chỉ so một số cấu hình với chính giá trị đang có, nên nó luôn báo ổn dù giới hạn số lượng gửi lên thật sự không hề được áp dụng.
  file: `apps/api/test/dieu-phoi-diem-nhan.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính một mình, thiếu đối chứng dương) — E1 chép-không-tham-chiếu**
  Người dùng thấy gì: Phép kiểm tự động cho việc bước của khuôn và bước của kế hoạch là hai bản riêng chỉ kiểm một chiều, nên nếu việc sửa khuôn âm thầm không lưu được gì cả, phép kiểm này vẫn báo ổn.
  file: `apps/api/test/dieu-phoi.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (toThrow trần, không ghim thông điệp, không đo chỗ cần đo) — test chống trùng khoá tìm kiếm**
  Người dùng thấy gì: Phép kiểm chặn trùng tên tham số trên đường dẫn không thật sự kiểm màn điều phối, và màn điều phối cũng chưa được nối vào cơ chế chặn trùng đó, nên một tên tham số trùng lặp có thể lọt qua mà không ai biết.
  file: `apps/app/test/dieu-phoi-trang-thai.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên đủ khoá cả hai thứ tiếng nhưng chỉ có một điểm-case)**
  Người dùng thấy gì: Phép kiểm cho việc bản tiếng Việt và tiếng Anh có đủ nhãn như nhau chỉ soi một phần nhỏ số nhãn, nên một nhãn thiếu ở phần lớn còn lại có thể không bị phát hiện.
  file: `apps/app/test/dieu-phoi-trang-thai.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
