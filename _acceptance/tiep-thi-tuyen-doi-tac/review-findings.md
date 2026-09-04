# Phát hiện — vòng 3, hai lượt

Cả hai lượt: **0 phát hiện trong hợp đồng**. Mọi mục dưới đây nằm NGOÀI
hợp đồng — chúng là việc của người ở Cổng Bằng chứng, không phải việc máy
tự sửa.

## Lượt máy

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **campaigns.touch writes an Activity directly and skips ActivityStampService**
  Người dùng thấy gì: Bấm ghi kết quả cuộc gọi không cập nhật đúng thời điểm liên hệ gần nhất của môi giới, nên bộ lọc theo hoạt động gần đây và dòng thời gian của công ty có thể không phản ánh cuộc gọi vừa ghi.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: high
  Đề xuất: known-limits

- **campaigns.touch accepts any contactId — no existence check, no segment-membership check**
  Người dùng thấy gì: Có thể ghi nhận một cuộc gọi cho người đã bị xoá hoặc người không thuộc phân khúc của chiến dịch, khiến số liệu chiến dịch không phản ánh đúng ai thực sự nằm trong phân khúc.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: high
  Đề xuất: known-limits

- **Saved-view delete refuses forever, but the message tells the user to finish the campaign**
  Người dùng thấy gì: Một góc nhìn đã lưu từng dùng cho chiến dịch sẽ không bao giờ xoá được, kể cả sau khi chiến dịch đã kết thúc từ lâu, dù thông báo lỗi bảo người dùng kết thúc chiến dịch để xoá được.
  file: `apps/api/src/saved-views/saved-views.service.ts`
  severity: high
  Đề xuất: known-limits

- **uncalledPage paginates in application memory over up to 50 full contacts.list calls**
  Người dùng thấy gì: Với phân khúc rất lớn (trên khoảng năm nghìn người), bộ lọc "chưa gọi" có thể báo tổng số thành viên bị thiếu và bỏ sót một số người ở cuối danh sách — giới hạn này đã được ghi nhận trước.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: high
  Đề xuất: known-limits

- **savedViews.list is N+1: one filterableFieldsFor + one contact.count per view**
  Người dùng thấy gì: Menu góc nhìn đã lưu có thể tải chậm hơn cần thiết khi workspace có nhiều góc nhìn.
  file: `apps/api/src/saved-views/saved-views.service.ts`
  severity: medium
  Đề xuất: known-limits

- **FIELD_FILTER_PREFIX is now defined twice on two sides of a package boundary**
  Người dùng thấy gì: Nếu quy ước đặt tên bộ lọc bị đổi ở một chỗ mà quên đổi ở chỗ kia, một chiến dịch có thể âm thầm gọi nhầm sang một danh sách rộng hơn góc nhìn đã duyệt, mà không có cảnh báo nào.
  file: `apps/api/src/campaigns/campaigns-config.ts`
  severity: medium
  Đề xuất: known-limits

- **contactListFor hand-copies the contacts facet list; a new facet silently widens the segment**
  Người dùng thấy gì: Nếu sau này có thêm một tiêu chí lọc mới trên màn cá nhân, chiến dịch dựng từ góc nhìn dùng tiêu chí đó có thể âm thầm bỏ qua tiêu chí đó và gọi nhầm sang một danh sách rộng hơn phân khúc đã chọn.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Member-list search replaces the saved view's q instead of narrowing it**
  Người dùng thấy gì: Khi nhân viên gõ tìm trong danh sách thành viên chiến dịch, kết quả có thể hiện cả người ngoài phân khúc đã chọn, không chỉ thu hẹp trong đúng phân khúc đó.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Touch note is stored as an empty string, not null**
  Người dùng thấy gì: Hai cuộc gọi đều không có ghi chú có thể được lưu khác nhau trong hệ thống, khiến việc lọc hay đếm theo "có ghi chú hay không" không nhất quán.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: medium
  Đề xuất: known-limits

- **campaigns.list takes no input and returns every campaign unpaginated**
  Người dùng thấy gì: Trang danh sách chiến dịch tải toàn bộ chiến dịch một lần thay vì theo trang, nên có thể chậm dần khi workspace tích luỹ nhiều chiến dịch qua thời gian.
  file: `apps/api/src/campaigns/campaigns.router.ts`
  severity: medium
  Đề xuất: known-limits

- **campaigns.create validates savedViewId but not ownerId**
  Người dùng thấy gì: Nếu người phụ trách được chọn cho chiến dịch đã bị xoá khỏi hệ thống, việc tạo chiến dịch có thể báo lỗi khó hiểu thay vì một thông báo rõ ràng.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Listing ingest creates Contact rows without the AgentTrigger and without a race guard the sibling intake has**
  Người dùng thấy gì: Nếu cùng một hồ sơ từ sàn được nạp trùng lúc bởi hai lượt chạy chồng nhau, hệ thống có thể tạo ra hai cá nhân trùng nhau trong CRM cho cùng một môi giới.
  file: `apps/api/src/listings/listing-ingest.service.ts`
  severity: medium
  Đề xuất: known-limits

- **optionId throws a bare Error mid-batch, leaving a partially ingested batch and a 500**
  Người dùng thấy gì: Nếu một mục trong lô có giá trị không khớp danh sách lựa chọn hợp lệ (ví dụ hình thái hay chứng chỉ lạ), việc nạp lô có thể dừng giữa chừng — các mục nạp trước đó vẫn được lưu nhưng không ai biết đã lưu đến đâu để nạp lại.
  file: `apps/api/src/listings/listing-ingest.service.ts`
  severity: medium
  Đề xuất: known-limits

- **LISTING.maxItems is dead and duplicates LISTING_BATCH_MAX_ITEMS**
  Người dùng thấy gì: Không ảnh hưởng người dùng — đây chỉ là một cấu hình thừa trong mã, dễ gây nhầm lẫn về sau cho người muốn đổi giới hạn số mục mỗi lô.
  file: `apps/api/src/listings/listings-config.ts`
  severity: low
  Đề xuất: wont-fix

- **usedViewIds returns campaign names, not ids**
  Người dùng thấy gì: Không ảnh hưởng người dùng trực tiếp — chỉ là tên gọi nội bộ dễ gây nhầm lẫn cho người sửa mã sau này.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: low
  Đề xuất: wont-fix

- **New API surfaces are not documented in docs/api.md or docs/environment.md**
  Người dùng thấy gì: Không ảnh hưởng người dùng trực tiếp — tài liệu kỹ thuật nội bộ chưa được cập nhật để phản ánh hai module mới.
  file: `docs/api.md`
  severity: low
  Đề xuất: wont-fix

- **Lưu trữ (archive) một trong chín trường sàn làm hỏng vĩnh viễn cổng tiếp nhận bằng lỗi 500**
  Người dùng thấy gì: Nếu quản trị viên lưu trữ (ẩn) một trong chín trường sản lượng hoặc địa bàn, mọi lượt nạp hồ sơ mới từ sàn sau đó có thể lỗi hoàn toàn cho tới khi trường đó được khôi phục.
  file: `apps/api/src/listings/listing-fields.service.ts`
  severity: high
  Đề xuất: known-limits

- **Trang chi tiết chiến dịch quay vòng vĩnh viễn khi truy vấn hỏng**
  Người dùng thấy gì: Mở một chiến dịch không tồn tại, hoặc khi hệ thống đang gặp sự cố, có thể làm trang quay vòng tải mãi mãi, không có thông báo lỗi hay đường quay lại.
  file: `apps/app/app/(app)/[slug]/campaigns/[campaignId]/campaign-detail.tsx`
  severity: high
  Đề xuất: known-limits

- **Lỗi tải danh sách chiến dịch và danh sách thành viên hiện ra thành trạng thái rỗng**
  Người dùng thấy gì: Khi hệ thống gặp sự cố tạm thời, danh sách chiến dịch hoặc danh sách thành viên phân khúc có thể hiện ra như thể trống trơn, khiến người dùng tưởng nhầm dữ liệu của mình đã bị mất.
  file: `apps/app/app/(app)/[slug]/campaigns/campaigns-table.tsx`
  severity: high
  Đề xuất: known-limits

- **Bộ cào không chia lô theo trần 500 mục; batch_size trong config là chữ chết, và lượt gửi hỏng là mất trắng cả lượt cào**
  Người dùng thấy gì: Một lượt cào không giới hạn số lượng có thể chạy hàng giờ rồi thất bại toàn bộ ở bước cuối cùng, và một lượt gửi bị lỗi (sai cấu hình, hết hạn khoá) có thể làm mất trắng toàn bộ kết quả đã cào được, không có gì để gửi lại.
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: high
  Đề xuất: known-limits

- **Nạp lô từ sàn không nguyên tử: lỗi giữa chừng để lại phần đã ghi và trả 500 trắng**
  Người dùng thấy gì: Nếu một lô nạp hồ sơ bị lỗi giữa chừng, các hồ sơ nạp trước đó trong cùng lô vẫn được lưu, nhưng người vận hành chỉ nhận về một lỗi chung, không biết đã lưu bao nhiêu để quyết định gửi lại hay không.
  file: `apps/api/src/listings/listing-ingest.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Chặn xoá góc nhìn tính cả chiến dịch ĐÃ KẾT THÚC, và thông điệp bảo người dùng làm việc không gỡ được nút**
  Người dùng thấy gì: Một góc nhìn từng dùng cho chiến dịch, kể cả chiến dịch đã kết thúc từ lâu, không bao giờ xoá được, và giao diện không có cách nào để gỡ liên kết đó.
  file: `apps/api/src/saved-views/saved-views.service.ts`
  severity: medium
  Đề xuất: known-limits

- **contactListFor dựng ContactListInput trong tiến trình, đi vòng qua validate của biên tRPC**
  Người dùng thấy gì: Một góc nhìn đã lưu chứa một giá trị lọc không hợp lệ có thể làm trang chiến dịch hoặc trang danh sách góc nhìn báo lỗi thay vì hiển thị bình thường.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Sơ đồ site tải hỏng bị ghi log thành "sơ đồ site không có địa chỉ" — chẩn đoán sai nguyên nhân**
  Người dùng thấy gì: Khi sàn nhatot chặn bộ cào, nhật ký vận hành có thể ghi nhầm nguyên nhân thành "sơ đồ site trống", khiến người vận hành dễ sửa nhầm chỗ.
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: low
  Đề xuất: known-limits

- **Đo CHỈ DẪN thay vì ĐẦU RA — E14/E5 khai file kiểm thử mà lệnh tt_api không bao giờ nạp**
  Người dùng thấy gì: Một phần bằng chứng kiểm thử cho tính năng này có thể chưa thực sự chạy đúng như hồ sơ khai, nên chưa có gì đảm bảo chắc chắn một số ràng buộc dữ liệu và nhãn tiếng Việt của các trường đã được kiểm tra đầy đủ.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **Tuyên quét LỚP nhưng chỉ có điểm-case — ma trận 7 cột × bề rộng của COT_THANH_VIEN chỉ được IN, không có assert nào**
  Người dùng thấy gì: Bảng thành viên chiến dịch có thể ẩn hoặc hiện sai cột ở các cỡ màn hình khác nhau mà không có phép kiểm nào phát hiện ra.
  file: `_acceptance/tiep-thi-tuyen-doi-tac/rang/chien-dich.mjs`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình — toThrow() trần cho lô rỗng và lô 501 mục, không ghim thông điệp, không đối chứng dương ở biên 500**
  Người dùng thấy gì: Việc lô rỗng hay lô quá lớn bị từ chối có thể đang đúng vì một lý do khác hẳn (ví dụ một lỗi hệ thống) mà không ai phát hiện ra nếu giới hạn thật sự bị hỏng sau này.
  file: `packages/validation/test/listing-ingest.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Assert số ĐẾM trong khi lời hứa là QUAN HỆ giữa giá trị tệp và giá trị đã ghi — vòng khép kín E22 không so một giá trị nào**
  Người dùng thấy gì: Một trong chín giá trị trường của môi giới nạp từ sàn có thể bị lưu nhầm sang trường khác (ví dụ nhầm lẫn giữa tổng tin và tin mới) mà bài kiểm hiện tại không phát hiện ra.
  file: `apps/api/test/listing-fixture-batch.spec.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/28 lỗi rơi vào file không bộ đo nào phủ (docs/api.md, _acceptance/config.yaml, _acceptance/tiep-thi-tuyen-doi-tac/rang/chien-dich.mjs, packages/validation/test/listing-ingest.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.

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