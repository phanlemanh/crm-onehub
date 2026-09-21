## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **New AgentTask kind 'onboarding-identify' is not registered in TASK_KINDS and the agent has no handler for it**
  Người dùng thấy gì: Khi hệ thống không tự khớp được người dùng với mã đối tác gửi lên, việc xử lý tiếp theo bị treo lại vì chưa có bước nào tiếp tục tra và ghép hồ sơ đó, nên các trường hợp không khớp có thể bị bỏ quên.
  file: `apps/api/src/agent/agent-trigger.service.ts`
  severity: high
  Đề xuất: new-contract

- **Ingest secret compared with plain !==, dropping the timingSafeEquals pattern of the sibling listings ingest**
  Người dùng thấy gì: Bí mật dùng để xác thực nguồn gửi dữ liệu có thể bị dò ra qua thời gian phản hồi, làm tăng nguy cơ có bên ngoài giả danh gửi dữ liệu vào hệ thống.
  file: `apps/api/src/onboarding/onboarding.controller.ts`
  severity: high
  Đề xuất: known-limits

- **ONEHUB_PLATFORM_INGEST_SECRET declared in env validation without any decorator (no IsOptional/IsString/MinLength(16))**
  Người dùng thấy gì: Nếu bí mật kết nối được đặt quá ngắn hoặc quá đơn giản, hệ thống vẫn chấp nhận mà không cảnh báo, làm tăng nguy cơ bị đoán trúng.
  file: `apps/api/src/config/env.validation.ts`
  severity: medium
  Đề xuất: known-limits

- **Ingest does not check that planId exists: unknown plan gives a 500 (FK P2003) or queues agent tasks for a plan that does not exist**
  Người dùng thấy gì: Nếu bên gửi dữ liệu gõ nhầm mã kế hoạch, hệ thống có thể báo lỗi khó hiểu hoặc âm thầm tạo việc treo cho một kế hoạch không tồn tại, thay vì báo ngay là sai.
  file: `apps/api/src/onboarding/onboarding-ingest.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Mutation invalidates by listing query keys at the call site instead of through useCrmCache()**
  Người dùng thấy gì: Sau khi xoá một ghi danh, màn danh mục có thể hiển thị số liệu chưa được cập nhật ngay, khiến người dùng thấy số cũ trong chốc lát.
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx`
  severity: medium
  Đề xuất: known-limits

- **listPlans accepts listInput but ignores q/sort/dir, and computes facetCounts with an N+1 count loop**
  Người dùng thấy gì: Ô tìm kiếm và sắp xếp trên màn danh mục kế hoạch có thể không có tác dụng thật, và màn có thể tải chậm hơn khi số bộ phận tăng lên.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Template step schema is hand-duplicated in the API contracts beside the shared validation schema**
  Người dùng thấy gì: Có nguy cơ hai nơi định nghĩa cùng một quy tắc của bước trong khuôn lệch nhau theo thời gian, dẫn tới hành vi khó lường khi tạo hay sửa khuôn.
  file: `apps/api/src/onboarding/onboarding.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **Tunable config is dead or duplicated: ONBOARDING.ingest.maxItemsPerBatch has no effect, DAY_MS is redefined, and ensureField is copy-pasted**
  Người dùng thấy gì: Một số cấu hình dùng để tinh chỉnh hệ thống thực ra không có tác dụng gì khi thay đổi, dễ gây hiểu lầm cho người vận hành sau này.
  file: `apps/api/src/onboarding/onboarding-config.ts`
  severity: medium
  Đề xuất: known-limits

- **Client component derives data (progress, overdue, funnel counts) instead of receiving finished data**
  Người dùng thấy gì: Màn chi tiết kế hoạch có thể hiện tên bậc bằng chữ kỹ thuật khó hiểu thay vì tên tiếng Việt dễ hiểu cho người dùng.
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx`
  severity: medium
  Đề xuất: known-limits

- **Filter facets are clickable Badges (span) with no keyboard or button semantics**
  Người dùng thấy gì: Người dùng chỉ thao tác bằng bàn phím (không dùng chuột) có thể không bấm được các nhãn lọc theo trạng thái hay bộ phận trên màn danh mục.
  file: `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx`
  severity: medium
  Đề xuất: known-limits

- **Server page ignores the URL state it defines, so the prefetch does not match the client query on deep links**
  Người dùng thấy gì: Khi mở một đường dẫn danh mục đã có sẵn bộ lọc (ví dụ đường dẫn được chia sẻ), màn có thể hiện tạm một trạng thái đang tải trước khi lọc đúng dữ liệu.
  file: `apps/app/app/(app)/[slug]/onboarding/page.tsx`
  severity: low
  Đề xuất: known-limits

- **Log call uses `msg` key instead of the documented `message` key**
  Người dùng thấy gì: Một dòng nhật ký nội bộ thiếu nội dung mô tả, gây khó khăn khi đội vận hành tra cứu sự cố sau này; người dùng cuối không thấy ảnh hưởng gì.
  file: `apps/api/src/onboarding/onboarding-ingest.service.ts`
  severity: low
  Đề xuất: known-limits

- **Facet filter that returns zero rows replaces the whole list with the 'no plans / no template' empty state and hides the facet bar**
  Người dùng thấy gì: Khi người dùng chọn một bộ lọc mà không có kế hoạch nào khớp, màn có thể hiện nhầm thông báo 'chưa có khuôn nào' dù khuôn và kế hoạch vẫn tồn tại, và không có cách nào trên màn để bỏ bộ lọc đó.
  file: `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx`
  severity: high
  Đề xuất: new-contract

- **Remove-enrollment mutation is fired inside a React state updater and has no error handling**
  Người dùng thấy gì: Bấm xoá một ghi danh có thể âm thầm gửi yêu cầu xoá hai lần, và nếu việc xoá thất bại, người dùng không thấy thông báo lỗi nào — danh sách chỉ đứng yên như chưa có chuyện gì xảy ra.
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx`
  severity: medium
  Đề xuất: known-limits

- **Plan profile and settings screens show query errors as empty data**
  Người dùng thấy gì: Khi dữ liệu không tải được do lỗi hệ thống, các màn kế hoạch và cài đặt khuôn có thể hiện y như chưa có dữ liệu nào, khiến người dùng tưởng nhầm là trống thật.
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx`
  severity: medium
  Đề xuất: known-limits

- **Ingest accepts a batch for a nonexistent planId with 200 when no item matches**
  Người dùng thấy gì: Một mã kế hoạch không tồn tại có thể được điểm nhận chấp nhận âm thầm, tạo ra việc treo cho tác nhân xử lý một kế hoạch không có thật.
  file: `apps/api/src/onboarding/onboarding-ingest.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Ingest upsert overwrites existing milestone timestamps with null**
  Người dùng thấy gì: Nếu một đợt dữ liệu gửi lên thiếu một mốc đã ghi trước đó, mốc thời gian cũ có thể bị xoá mất, làm phễu tiến độ của đối tác lùi lại dù thực tế không đổi.
  file: `apps/api/src/onboarding/onboarding-ingest.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E15 đo bảng đăng ký khoá, không đo đường dẫn**
  Người dùng thấy gì: Phép đo tự động cho việc lọc theo bộ phận trên đường dẫn hiện chỉ kiểm cấu hình khai báo, chưa thực sự thử thao tác lọc trên màn hình, nên nếu tính năng lọc hỏng sau này có thể không bị phát hiện kịp.
  file: `apps/app/test/dieu-phoi-trang-thai.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): E7 dựng ConfigService giả, không đi qua env.validation hay module**
  Người dùng thấy gì: Phép đo tự động cho việc hệ thống vẫn khởi động được khi thiếu bí mật kết nối chưa thử trên đường khởi động thật, nên một lỗi khiến hệ thống không khởi động được có thể lọt qua mà không bị phát hiện.
  file: `apps/api/test/dieu-phoi-diem-nhan.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình, không đối chứng dương): E1 không xác nhận khuôn thực sự đã đổi nhãn**
  Người dùng thấy gì: Phép đo tự động cho việc sửa khuôn không ảnh hưởng kế hoạch cũ chỉ kiểm nhãn cũ không đổi, chưa kiểm việc sửa khuôn có thực sự được lưu lại hay không, nên một lỗi ở đó có thể không bị phát hiện.
  file: `apps/api/test/dieu-phoi.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): răng AC-10 chỉ quét apps/api và chỉ bắt 4 kiểu nút cha**
  Người dùng thấy gì: Việc rà soát tự động tìm số ngày ghim cứng chỉ quét phần máy chủ, bỏ qua phần giao diện người dùng, nên một con số ghim cứng ở màn hình vẫn có thể lọt qua mà không bị bắt.
  file: `_acceptance/dieu-phoi-30-ngay-dau/rang/hang-so-o-config.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 (khẳng định chuỗi có mặt thay vì quan hệ): vế 2 AC-10 dùng includes trên văn bản thô**
  Người dùng thấy gì: Việc rà soát tự động chỉ kiểm ngưỡng có được khai báo ở đúng chỗ, chưa kiểm ngưỡng đó có thực sự được dùng ở đâu hay không, nên một ngưỡng khai ra nhưng không ai dùng vẫn được coi là hợp lệ.
  file: `_acceptance/dieu-phoi-30-ngay-dau/rang/hang-so-o-config.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): E5 lo-sai chỉ khẳng định đếm không đổi, thiếu chiều dương trong cùng lượt chạy**
  Người dùng thấy gì: Phép đo tự động cho việc từ chối một lô dữ liệu sai chỉ kiểm số bản ghi không đổi, chưa kiểm việc gửi một lô đúng có thực sự tạo được bản ghi hay không, nên một lỗi khiến việc khớp mã đối tác luôn thất bại âm thầm có thể không bị phát hiện.
  file: `apps/api/test/dieu-phoi-diem-nhan.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E9 dòng 3 «kết quả mang đường dẫn tới Cài đặt > Khuôn» không có assert đầu ra**
  Người dùng thấy gì: Phép đo tự động cho việc dẫn người dùng sang Cài đặt khi chưa có khuôn nào chỉ kiểm nội dung thông báo, chưa kiểm đường dẫn thật trên nút bấm có hoạt động hay không, nên nếu đường dẫn đó bị gỡ mất, phép đo vẫn báo qua.
  file: `apps/api/test/dieu-phoi.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
