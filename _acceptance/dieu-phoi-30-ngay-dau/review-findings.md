## Trong hợp đồng

(không có finding nào ánh xạ được vào AC nào ở vòng này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Contract tRPC chép tay lại schema bước khuôn thay vì import từ @crm/validation/onboarding-template**
  Người dùng thấy gì: Nếu sau này ai đó nới hay siết giới hạn số bước của khuôn kế hoạch, phần lưu dữ liệu và phần nhận dữ liệu có thể áp hai giới hạn khác nhau mà không ai nhận ra ngay.
  file: `apps/api/src/onboarding/onboarding.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **Việc tác nhân mới `onboarding-identify` không có schema payload ở packages/validation và không có nhánh xử lý trong apps/agent**
  Người dùng thấy gì: Những trường hợp mã đối tác không khớp được ai sẽ báo là 'đã chuyển cho đội xử lý', nhưng hiện chưa có ai hay hệ thống nào tiếp nhận và hoàn tất chúng, nên các trường hợp này có thể nằm im vô thời hạn.
  file: `apps/api/src/agent/agent-trigger.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Điểm nhận không kiểm planId tồn tại/đang mở; planId lạ nổ lỗi khoá ngoại thành 500 thay vì 400/404**
  Người dùng thấy gì: Nếu nền tảng gửi nhầm một mã kế hoạch không tồn tại hoặc đã đóng, người vận hành sẽ chỉ thấy một lỗi hệ thống chung chung thay vì thông báo rõ ràng, và một kế hoạch đã đóng vẫn có thể bị thêm ghi danh mới ngoài ý muốn.
  file: `apps/api/src/onboarding/onboarding-ingest.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Dữ liệu người nhập trên ba màn mới không đánh dấu translate="no"**
  Người dùng thấy gì: Nếu trình duyệt của người dùng bật dịch tự động, tên đối tác và tên bước trong kế hoạch có thể bị đổi thành chữ khác, gây hiểu nhầm.
  file: `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx`
  severity: medium
  Đề xuất: known-limits

- **Trang danh mục prefetch bằng tham số cứng, bỏ qua loadOnboardingSearchParams đã khai**
  Người dùng thấy gì: Khi mở một đường dẫn đã có sẵn bộ lọc, người dùng có thể thấy dữ liệu sai đúng chớp nhoáng rồi tự sửa lại ngay, gây cảm giác màn hình giật một nhịp.
  file: `apps/app/app/(app)/[slug]/onboarding/page.tsx`
  severity: low
  Đề xuất: known-limits

- **So khoá Bearer bằng !== thay vì timingSafeEquals như ListingsController**
  Người dùng thấy gì: Về lý thuyết một kẻ tấn công kiên trì có thể dò khoá bí mật của điểm nhận nhanh hơn bình thường, dù rủi ro thực tế ở đây thấp.
  file: `apps/api/src/onboarding/onboarding.controller.ts`
  severity: medium
  Đề xuất: known-limits

- **ONEHUB_PLATFORM_INGEST_SECRET khai trong EnvironmentVariables mà không có decorator nào**
  Người dùng thấy gì: Nếu ai đó đặt một khoá bí mật quá ngắn hoặc dễ đoán cho điểm nhận, hệ thống vẫn chấp nhận mà không cảnh báo.
  file: `apps/api/src/config/env.validation.ts`
  severity: medium
  Đề xuất: known-limits

- **Facet lọc danh mục là Badge (<span>) gắn onClick: không focus được, không dùng được bằng bàn phím**
  Người dùng thấy gì: Người chỉ dùng được bàn phím sẽ không bấm được các nút lọc theo trạng thái hay bộ phận trên màn danh mục.
  file: `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hằng số lặp/chết: DAY_MS khai hai lần, ONBOARDING.ingest.maxItemsPerBatch và stale.warnAfterMs không ai đọc**
  Người dùng thấy gì: Không có tác động thấy được với người dùng; đây chỉ là phần mã dư thừa không ai đọc tới.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: low
  Đề xuất: known-limits

- **ensureField trong OnboardingIngestService là bản chép y hệt ensureMaNenTangField của OnboardingService**
  Người dùng thấy gì: Nếu sau này ai đó sửa cách một trường hệ thống được tạo ra nhưng chỉ sửa một trong hai chỗ, dữ liệu kiểm thử và dữ liệu thật có thể lệch nhau mà không ai để ý.
  file: `apps/api/src/onboarding/onboarding-ingest.service.ts`
  severity: low
  Đề xuất: known-limits

- **ho-so-ke-hoach nhập ConfirmDialog từ thư mục settings/members**
  Người dùng thấy gì: Không có tác động thấy được ngay với người dùng; đây là cách tổ chức mã, không phải hành vi màn hình.
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx`
  severity: low
  Đề xuất: known-limits

- **Hồ sơ kế hoạch nuốt lỗi truy vấn: listSteps/listEnrollments lỗi thì hiện như kế hoạch rỗng**
  Người dùng thấy gì: Nếu việc tải dữ liệu bị lỗi (mất mạng, sự cố máy chủ), người dùng sẽ thấy kế hoạch trông như trống rỗng — không bước, không ai ghi danh — thay vì được báo có trục trặc và được mời thử lại.
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx`
  severity: high
  Đề xuất: known-limits

- **Trang Cài đặt điều phối biến lỗi truy vấn thành 'chưa có khuôn / chưa có bộ phận'**
  Người dùng thấy gì: Nếu việc tải danh sách khuôn bị lỗi, người quản trị sẽ thấy thông báo 'chưa có khuôn nào' và có thể vô tình tạo lại một khuôn đã có sẵn.
  file: `apps/app/app/(app)/[slug]/settings/onboarding/cai-dat-dieu-phoi.tsx`
  severity: high
  Đề xuất: known-limits

- **Chọn facet cho kết quả rỗng thì thanh facet biến mất, người dùng mắc kẹt**
  Người dùng thấy gì: Sau khi chọn một bộ lọc mà không ra kết quả nào, người dùng có thể bị kẹt trên màn 'chưa có kế hoạch' mà không còn cách nào trên màn hình để quay lại xem tất cả kế hoạch.
  file: `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx`
  severity: medium
  Đề xuất: known-limits

- **Gọi mutate xoá bên trong hàm cập nhật setState (side effect trong updater)**
  Người dùng thấy gì: Trong một số trường hợp, thao tác xoá có thể bị gọi lặp một lần âm thầm ở phía sau dù người dùng chỉ bấm xoá một lần.
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx`
  severity: medium
  Đề xuất: known-limits

- **Xoá ghi danh thất bại thì im lặng; nút xoá luôn nhắm ghi danh đầu tiên**
  Người dùng thấy gì: Khi một kế hoạch có nhiều ghi danh, bấm nút xoá có thể xoá nhầm một ghi danh khác với ghi danh người dùng định xoá, và nếu việc xoá thất bại thì người dùng không được báo gì, tưởng đã xoá thành công.
  file: `apps/app/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach.tsx`
  severity: medium
  Đề xuất: known-limits

- **createTemplate/updateTemplate không kiểm departmentId; lỗi chỉ nổ muộn lúc tạo kế hoạch**
  Người dùng thấy gì: Một khuôn kế hoạch trỏ tới bộ phận không còn tồn tại vẫn lưu được bình thường, nhưng khi ai đó dùng khuôn ấy để tạo kế hoạch thật thì thao tác sẽ thất bại với một lỗi khó hiểu.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Điểm nhận không kiểm planId; planId sai thì 500 cả lô thay vì 4xx**
  Người dùng thấy gì: Một lô dữ liệu gửi nhầm mã kế hoạch có thể khiến hệ thống báo lỗi chung chung thay vì báo rõ mã kế hoạch sai, gây khó khăn khi bên gửi cần tự sửa lỗi.
  file: `apps/api/src/onboarding/onboarding-ingest.service.ts`
  severity: low
  Đề xuất: known-limits

- **Danh mục cắt ở 25 hàng mà không có phân trang hay tổng số**
  Người dùng thấy gì: Khi có hơn 25 kế hoạch đang chạy, những kế hoạch mới nhất có thể bị giấu khỏi màn hình mà người dùng không biết còn sót kế hoạch nào khác.
  file: `apps/app/app/(app)/[slug]/onboarding/danh-muc-table.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo CHỈ DẪN thay vì ĐẦU RA): E15 bo-loc-duong-dan chỉ đo bảng parser, không đo URL mà màn thật ghi ra**
  Người dùng thấy gì: Nếu sau này tính năng lọc theo bộ phận trên đường dẫn bị hỏng, bộ kiểm tra tự động có thể vẫn báo bình thường, nên lỗi đó chỉ lộ ra khi người dùng thật gặp phải.
  file: `apps/app/test/dieu-phoi-trang-thai.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 (fixture VIẾT TAY đúng khuôn bên đọc): E7 thieu-khoa-503 dùng ConfigService giả `get: () => khoa`, bỏ qua env.validation và việc dựng module**
  Người dùng thấy gì: Nếu cách đọc khoá bí mật thật sau này bị đổi sang gây lỗi khi thiếu khoá, bộ kiểm tra tự động có thể không phát hiện ra trước khi phát hành.
  file: `apps/api/test/dieu-phoi-diem-nhan.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 (assert «chuỗi có mặt» thay cho quan hệ): E10 kiểm «config khai đủ hai ngưỡng» bằng `includes(String(n))`**
  Người dùng thấy gì: Ngưỡng thời gian dùng để cảnh báo kế hoạch im lặng có thể không thực sự được dùng ở đâu cả mà không ai biết, vì bài kiểm tra tự động chỉ tìm chuỗi số chứ không kiểm ai đang dùng nó.
  file: `_acceptance/dieu-phoi-30-ngay-dau/rang/hang-so-o-config.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ phủ một tập con): E10 khai quét cả module điều phối nhưng chỉ duyệt apps/api/src/onboarding và chỉ vài dạng nút cha**
  Người dùng thấy gì: Một con số như 30 ngày có thể bị viết cứng ở phần giao diện người dùng mà không bị phát hiện, vì bài kiểm tra tự động hiện chỉ soi phần máy chủ.
  file: `_acceptance/dieu-phoi-30-ngay-dau/rang/hang-so-o-config.mjs`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có finding nào bị đánh dấu unverified ở vòng này)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
