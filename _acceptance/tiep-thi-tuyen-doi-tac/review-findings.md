# Phát hiện — vòng 3

Lượt máy bản cuối: **1 trong hợp đồng, 21 ngoài**.
Lượt lái: **0 trong hợp đồng, 13 ngoài**.
Mọi mục ngoài hợp đồng là việc của người ở Cổng Bằng chứng.

## Lượt máy (bản cuối)

## Trong hợp đồng

- **Lỗi giữa lô nạp trả 500 trắng và để lại phần đã ghi**
  file: `apps/api/src/listings/listing-ingest.service.ts:76`
  severity: medium
  detail: `ingest()` lặp `for (const item of batch.items)` với một transaction cho MỖI item, nên lỗi ở item thứ n giữ nguyên n-1 item đã ghi. Lỗi đó lại là `Error` trần: `optionId()` ném `new Error(...)` (dòng 53) khi nhãn option không khớp — ví dụ rep đổi tên option "Cao" trong Settings → Fields — và dòng 99 ném `new Error` khi thiếu định nghĩa trường. Controller chỉ dịch `InvalidInput` thành BadRequest (listings.controller.ts:79-84), mọi thứ khác thành 500 không thông điệp. Trái luật "Services throw Nest's HttpException family" và trái luật "Anything a self-hoster might not have is optional and must never throw".
  source: conventions
  AC: AC-3

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **campaigns.touch ghi Activity thẳng, bỏ ActivityStampService và bỏ companyId**
  Người dùng thấy gì: Ghi kết quả cuộc gọi trong chiến dịch không cập nhật mốc hoạt động gần nhất của cá nhân và công ty, nên bảng danh bạ có thể hiện sai thời điểm liên hệ gần nhất sau khi nhân viên gọi qua chiến dịch.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: high
  Đề xuất: known-limits

- **campaigns.touch để lỗi Prisma thô thoát ra thay vì HttpException, và không kiểm tra contact thuộc phân khúc**
  Người dùng thấy gì: Khi ghi kết quả cho một cá nhân không hợp lệ, hệ thống trả lỗi chung chung thay vì thông báo rõ ràng, và không kiểm tra người đó có thuộc phân khúc của chiến dịch hay không.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: high
  Đề xuất: known-limits

- **campaigns.list trả cả bảng không phân trang; bảng sắp xếp và cắt trang trong trình duyệt**
  Người dùng thấy gì: Danh sách chiến dịch tải toàn bộ dữ liệu về trình duyệt rồi mới sắp xếp và cắt trang, nên màn hình sẽ chậm dần khi số chiến dịch trong workspace tăng lên.
  file: `apps/app/app/(app)/[slug]/campaigns/campaigns-table.tsx`
  severity: high
  Đề xuất: known-limits

- **campaignMembersInput tự đúc phân trang riêng, vượt trần pageSize của listInput**
  Người dùng thấy gì: Trang thành viên của chiến dịch có thể tải tới 200 cá nhân một lần thay vì giới hạn 100 áp dụng ở nơi khác trong sản phẩm, khiến trang tải chậm hơn với phân khúc lớn.
  file: `apps/api/src/campaigns/campaigns.contracts.ts`
  severity: high
  Đề xuất: known-limits

- **Nạp lô từ sàn là writer thứ hai của FieldValue, bỏ qua writeValues của @crm/db/fields**
  Người dùng thấy gì: Việc nạp dữ liệu từ sàn ghi giá trị các trường tuỳ chỉnh bằng một đường ghi riêng, không dùng lại đường ghi chuẩn của hệ thống; khi tin không có địa bàn, trường địa bàn có thể lưu chuỗi rỗng thay vì để trống.
  file: `apps/api/src/listings/listing-ingest.service.ts`
  severity: high
  Đề xuất: known-limits

- **ListingFieldsService tự tạo FieldDefinition, và kiểm tồn tại bằng bộ lọc archivedAt: null**
  Người dùng thấy gì: Nếu một trường tuỳ chỉnh từ sàn từng bị nhân viên lưu trữ (ẩn) trong Cài đặt, lượt nạp dữ liệu từ sàn tiếp theo có thể lỗi liên tục và không nạp được tin nào cho tới khi có người can thiệp kỹ thuật.
  file: `apps/api/src/listings/listing-fields.service.ts`
  severity: high
  Đề xuất: known-limits

- **savedViews.list thành N+1: mỗi góc nhìn một filterableFieldsFor và một contact.count**
  Người dùng thấy gì: Màn Danh bạ chậm hơn khi workspace có nhiều góc nhìn đã lưu vì mỗi góc nhìn tính lại kích thước riêng; khi phép tính lỗi, số hiển thị lặng lẽ thành 0 giống hệt phân khúc thật sự trống.
  file: `apps/api/src/saved-views/saved-views.service.ts`
  severity: medium
  Đề xuất: known-limits

- **statsFor/countsFor/controlFor kéo toàn bộ hàng CampaignTouch về tiến trình để đếm distinct trong JS**
  Người dùng thấy gì: Các số liệu so sánh trên trang chiến dịch (đã gọi, trả lời, hẹn gặp) được tính bằng cách tải nhiều dữ liệu về xử lý thay vì đếm trực tiếp trong cơ sở dữ liệu, nên trang có thể chậm dần khi số lượt gọi tăng.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: medium
  Đề xuất: known-limits

- **FIELD_FILTER_PREFIX khai hai lần ở hai phía biên gói**
  Người dùng thấy gì: Quy ước đặt tên bộ lọc theo trường tuỳ biến được khai ở hai nơi tách rời trong mã nguồn; nếu một bên đổi mà bên kia không đổi theo, bộ lọc theo trường tuỳ biến trên phân khúc chiến dịch sẽ lặng lẽ ngừng hoạt động.
  file: `apps/api/src/campaigns/campaigns-config.ts`
  severity: medium
  Đề xuất: known-limits

- **usedViewIds trả về TÊN chiến dịch, không phải id**
  Người dùng thấy gì: Một phần mã nguồn nội bộ đặt tên gây hiểu lầm, nhưng thông báo hiển thị cho người dùng khi xoá góc nhìn vẫn đúng và đủ tên chiến dịch.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: low
  Đề xuất: wont-fix

- **Nhãn điều hướng "Chiến dịch" viết cứng trong app-icon-rail, không đi qua lib/messages**
  Người dùng thấy gì: Mục điều hướng "Chiến dịch" trên thanh biểu tượng bên luôn hiện tiếng Việt bất kể ngôn ngữ người dùng đang chọn, khác với các mục lân cận.
  file: `apps/app/components/app-icon-rail.tsx`
  severity: low
  Đề xuất: wont-fix

- **Type CoKhoa — tự đúc từ tiếng Việt cho định danh kỹ thuật**
  Người dùng thấy gì: Một định danh kỹ thuật trong mã nguồn dùng tên tiếng Việt thay vì tiếng Anh như phần còn lại của ứng dụng; không ảnh hưởng người dùng, chỉ ảnh hưởng người đọc code sau này.
  file: `apps/app/app/(app)/[slug]/campaigns/campaign-state.ts`
  severity: low
  Đề xuất: wont-fix

- **Campaign search replaces the segment's own search term, letting non-members into the list**
  Người dùng thấy gì: Khi nhân viên gõ từ khoá tìm trong danh sách thành viên chiến dịch, ô tìm kiếm thay thế hẳn bộ lọc gốc của phân khúc thay vì tìm trong phạm vi phân khúc đó — cá nhân ngoài phân khúc có thể xuất hiện, được gọi, và bị ghi lượt gọi vào chiến dịch dù không thuộc đối tượng nhắm tới.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: high
  Đề xuất: new-contract

- **Recording a call outcome never stamps lastActivityAt or attaches the company**
  Người dùng thấy gì: Ghi kết quả cuộc gọi trong chiến dịch không cập nhật mốc hoạt động gần nhất của cá nhân, và cuộc gọi đó không xuất hiện trên dòng thời gian của công ty liên quan.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: high
  Đề xuất: known-limits

- **Saved-view delete guard gives two fixes, neither of which works**
  Người dùng thấy gì: Khi một góc nhìn bị chặn xoá vì đang gắn với chiến dịch đã kết thúc, thông báo gợi ý hai cách xử lý nhưng không cách nào thực sự làm được trong sản phẩm hiện tại — góc nhìn đó vĩnh viễn không xoá được.
  file: `apps/api/src/saved-views/saved-views.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Failed campaign queries render as loading or as legitimate empty states**
  Người dùng thấy gì: Khi trang chi tiết chiến dịch tải dữ liệu lỗi (mất mạng, lỗi máy chủ), màn hình đứng ở trạng thái đang tải mãi mãi thay vì báo lỗi cho nhân viên biết.
  file: `apps/app/app/(app)/[slug]/campaigns/[campaignId]/campaign-detail.tsx`
  severity: medium
  Đề xuất: known-limits

- **Campaign list and segment picker show "nothing here" when their query failed**
  Người dùng thấy gì: Khi danh sách chiến dịch hoặc danh sách góc nhìn để chọn phân khúc tải lỗi, màn hình hiện thông điệp "chưa có gì" y hệt trường hợp thật sự trống, khiến nhân viên tưởng nhầm là chưa từng tạo chiến dịch nào.
  file: `apps/app/app/(app)/[slug]/campaigns/campaigns-table.tsx`
  severity: medium
  Đề xuất: known-limits

- **Segment picker claims only shared views appear, but private views are listed and accepted**
  Người dùng thấy gì: Hộp tạo chiến dịch ghi chú chỉ hiện góc nhìn dùng chung, nhưng thực tế cũng liệt kê góc nhìn riêng tư và cho phép tạo chiến dịch từ đó — đồng nghiệp mở chiến dịch sau này vẫn thấy danh sách thành viên dù không có quyền xem góc nhìn gốc.
  file: `apps/app/app/(app)/[slug]/campaigns/create-campaign-sheet.tsx`
  severity: low
  Đề xuất: known-limits

- **Tuyên quét LỚP cột nhưng chỉ đo điểm-case — 7 cột khai trước không hề được đối chiếu (hình dạng 5)**
  Người dùng thấy gì: Bài kiểm tra tự động cho việc cắt cột ở màn hình nhỏ không thực sự đối chiếu đủ danh sách cột đã cam kết; một cột bị ẩn nhầm hoặc biến mất khỏi màn hình có thể không bị bài kiểm này phát hiện.
  file: `_acceptance/tiep-thi-tuyen-doi-tac/rang/chien-dich.mjs`
  severity: medium
  Đề xuất: known-limits

- **Fixture che danh tính viết tay đúng khuôn bên đọc, không round-trip từ parser (hình dạng 2)**
  Người dùng thấy gì: Bộ dữ liệu mẫu dùng để kiểm tra tính năng che thông tin cá nhân được viết tay theo đúng khuôn của bên xử lý, không lấy từ đầu ra thật của bộ cào; nếu bộ cào sau này thêm một trường mang thông tin cá nhân mới, bài kiểm có thể không phát hiện được rò rỉ.
  file: `tools/listing-crawl/tests/test_redact.py`
  severity: medium
  Đề xuất: known-limits

- **Vòng khép kín chỉ khẳng định SỐ ĐẾM, không khẳng định quan hệ giá trị đã hứa (hình dạng 3)**
  Người dùng thấy gì: Bài kiểm tra việc nạp dữ liệu từ sàn chỉ đếm số bản ghi được tạo ra, không đối chiếu từng giá trị trường với dữ liệu gốc; một lỗi hoán đổi giá trị giữa hai trường vẫn có thể lọt qua mà bài kiểm báo đạt.
  file: `apps/api/test/listing-fixture-batch.spec.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/22 lỗi rơi vào file không bộ đo nào phủ (apps/app/components/app-icon-rail.tsx, _acceptance/tiep-thi-tuyen-doi-tac/rang/chien-dich.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.


---

## Lượt lái trình duyệt

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **campaigns.touch ghi Activity thẳng, bỏ ActivityStampService và bỏ companyId — trái pattern của mọi writer Activity khác**
  Người dùng thấy gì: Sau khi nhân viên ghi kết quả cuộc gọi trong chiến dịch, bộ lọc 'hoạt động gần đây' trên màn cá nhân có thể vẫn hiện người đó như chưa từng được liên hệ, và cuộc gọi không xuất hiện trên dòng thời gian của công ty liên quan.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: high
  Đề xuất: known-limits

- **ListingFieldsService.ensure() dùng definitionsFor (lọc archivedAt: null) để kiểm tra tồn tại, nên một trường bị lưu trữ làm kẹt cổng tiếp nhận vĩnh viễn bằng 500**
  Người dùng thấy gì: Nếu admin lưu trữ (archive) một trường dữ liệu sàn trong Cài đặt, mọi lượt nạp dữ liệu môi giới mới sau đó có thể báo lỗi và ngừng hẳn cho tới khi có người can thiệp thủ công.
  file: `apps/api/src/listings/listing-fields.service.ts`
  severity: high
  Đề xuất: known-limits

- **statsFor/controlFor kéo toàn bộ bảng campaignTouch về tiến trình để đếm distinct trong JS**
  Người dùng thấy gì: Khi số lượng cuộc gọi trong hệ thống tăng lên nhiều, việc mở trang chi tiết một chiến dịch hoặc danh sách chiến dịch có thể trở nên rất chậm.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Campaign call outcome creates an Activity but never stamps contact.lastActivityAt**
  Người dùng thấy gì: Sau khi ghi kết quả cuộc gọi, một góc nhìn đã lưu lọc theo 'không có hoạt động gần đây' có thể tiếp tục hiện những người vừa được gọi, khiến phân khúc chọn nhầm người.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: high
  Đề xuất: known-limits

- **Campaign detail page spins forever when the query fails (no error/404 path)**
  Người dùng thấy gì: Nếu mở một chiến dịch không tồn tại hoặc đã bị xoá, màn hình chỉ hiện vòng xoay tải mãi mãi thay vì báo lỗi hay 'không tìm thấy', khiến người dùng không biết chuyện gì đang xảy ra.
  file: `apps/app/app/(app)/[slug]/campaigns/[campaignId]/campaign-detail.tsx`
  severity: medium
  Đề xuất: known-limits

- **Listing ingest crashes with a unique-constraint 500 when a listing field is archived or two batches race**
  Người dùng thấy gì: Nếu admin lưu trữ một trường dữ liệu sàn, hoặc hai lượt nạp dữ liệu chạy cùng lúc trên hệ thống còn trống, việc nạp dữ liệu môi giới có thể báo lỗi và ngừng hẳn cho tới khi có người can thiệp thủ công.
  file: `apps/api/src/listings/listing-fields.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Missing field definition throws before the guard that was meant to skip it, aborting a half-written batch**
  Người dùng thấy gì: Khi việc nạp dữ liệu gặp một mục lỗi giữa lô, thông báo lỗi hiện ra có thể mô tả sai nguyên nhân, và những mục đã xử lý trước mục lỗi trong cùng lô vẫn được lưu — gây khó xác định dữ liệu nào đã thực sự vào hệ thống.
  file: `apps/api/src/listings/listing-ingest.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Saved-view size errors are swallowed into a null count**
  Người dùng thấy gì: Khi không đếm được số thành viên của một góc nhìn đã lưu, hộp tạo chiến dịch chỉ im lặng không hiện số, khiến nhân viên tưởng góc nhìn đó không có ai mà không biết là do lỗi hệ thống.
  file: `apps/api/src/saved-views/saved-views.service.ts`
  severity: low
  Đề xuất: known-limits

- **Crawler drops phone-reveal failures with no log line**
  Người dùng thấy gì: Khi việc lộ số điện thoại trên trang môi giới thất bại trong lúc cào dữ liệu, hệ thống không ghi lại lý do, khiến nhật ký cào trông sạch trong khi một số môi giới có thể bị thiếu số điện thoại.
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 — đo CHỈ DẪN thay vì ĐẦU RA: E14 và E5 dẫn file test mà lệnh của chính chúng không chạy**
  Người dùng thấy gì: Báo cáo bằng chứng cho hai tiêu chí (ghi lượt gọi kèm ràng buộc dữ liệu, và lọc cá nhân theo sản lượng) không thực sự chạy các bài kiểm đã hứa, nên chưa thể chắc hai tiêu chí đó thật sự đạt.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 — assert SỐ ĐẾM trong khi lời hứa là QUAN HỆ giữa giá trị lô và giá trị đã ghi**
  Người dùng thấy gì: Bằng chứng cho việc dữ liệu cào ghi đúng vào hệ thống chỉ đếm số lượng mục, không đối chiếu từng giá trị cụ thể, nên dữ liệu ghi sai (nhầm cột, sai địa bàn) vẫn có thể lọt qua mà báo đạt.
  file: `apps/api/test/listing-fixture-batch.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên ma trận cột × bề rộng nhưng chỉ assert điểm-case trên những cột DOM tình cờ vẽ ra**
  Người dùng thấy gì: Bằng chứng cho bảng thành viên chiến dịch ở các cỡ màn hình khác nhau không thực sự kiểm tra đủ cột phải hiện đúng ở từng cỡ, nên mất một cột dữ liệu vẫn có thể báo đạt.
  file: `_acceptance/tiep-thi-tuyen-doi-tac/rang/chien-dich.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm-tính-một-mình: phép kiểm translate="no" bỏ qua giá trị không tìm thấy, không có đối chứng dương**
  Người dùng thấy gì: Bằng chứng cho việc dữ liệu người dùng không bị dịch tự động chỉ kiểm tra một chiều, nên nếu một cột dữ liệu không hiện ra trên màn hình, phép kiểm vẫn báo đạt dù chưa thực sự xác nhận điều đã hứa.
  file: `_acceptance/tiep-thi-tuyen-doi-tac/rang/be-mat.mjs`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 10/13 lỗi rơi vào file không bộ đo nào phủ (apps/api/src/campaigns/campaigns.service.ts, apps/api/src/listings/listing-fields.service.ts, apps/api/src/listings/listing-ingest.service.ts, apps/api/src/saved-views/saved-views.service.ts, tools/listing-crawl/listing_crawl/__main__.py, _acceptance/config.yaml, apps/api/test/listing-fixture-batch.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.