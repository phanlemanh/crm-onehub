# Review findings: tiếp-thị-tuyển-đối-tác — round 2

## Trong hợp đồng

(không có finding nào map được vào AC ở round này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **campaigns.list trả cả bảng, trình duyệt tự sắp xếp và phân trang — trái invariant của docs/api.md**
  Người dùng thấy gì: Khi số chiến dịch tăng lên theo thời gian, màn danh sách chiến dịch sẽ tải chậm dần và có thể đứng máy vì toàn bộ dữ liệu bị tải về cùng lúc, dù người dùng chỉ xem một trang.
  file: `apps/api/src/campaigns/campaigns.router.ts`
  severity: high
  Đề xuất: known-limits

- **touch() không kiểm tra contactId ở biên — lỗi Prisma thô rò ra tận toast của người dùng**
  Người dùng thấy gì: Khi ghi kết quả cuộc gọi bị lỗi do dữ liệu sai, người dùng có thể thấy một thông báo lỗi kỹ thuật khó hiểu thay vì lời giải thích rõ ràng, và có thể ghi được kết quả cho người không thuộc phân khúc chiến dịch.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: high
  Đề xuất: new-contract

- **Bộ cào không chia lô theo LISTING_BATCH_MAX_ITEMS; batch_size trong config.toml là chữ chết**
  Người dùng thấy gì: Nếu sau này chạy một lượt cào lớn hơn quy mô thử nghiệm hiện tại, chương trình có thể dừng đột ngột giữa chừng và không gửi được dữ liệu nào lên hệ thống.
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: high
  Đề xuất: known-limits

- **savedViews.list mở N+1 trên đường nóng, và saved-views đi ngược tầng để hỏi campaigns đếm contact**
  Người dùng thấy gì: Mỗi lần mở màn danh sách có góc nhìn đã lưu, hệ thống chạy nhiều truy vấn cơ sở dữ liệu hơn cần thiết, có thể làm màn hình chậm đi khi số góc nhìn hoặc số chiến dịch tăng lên.
  file: `apps/api/src/saved-views/saved-views.service.ts`
  severity: medium
  Đề xuất: known-limits

- **uncalledPage lọc trong tiến trình API bằng vòng lặp tới 50 lượt contacts.list, và cắt im lặng ở 5000**
  Người dùng thấy gì: Với một phân khúc rất lớn (hơn 5000 người), bộ lọc 'chưa gọi' trong trang chiến dịch có thể bỏ sót một số người ở cuối danh sách mà không báo cho người dùng biết.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Ô chọn phân khúc mời cả góc nhìn riêng tư, trong khi nhãn hứa chỉ có góc nhìn dùng chung**
  Người dùng thấy gì: Khi tạo chiến dịch, người dùng có thể vô tình chọn một góc nhìn cá nhân (riêng tư của mình) làm phân khúc dù màn hình ghi là chỉ có góc nhìn dùng chung — đồng nghiệp khác sau đó không xem được chiến dịch đó lọc theo tiêu chí gì.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: medium
  Đề xuất: new-contract

- **LISTING_INGEST_SECRET không vào docs/environment.md, và hai module API mới không vào bảng chỉ mục của AGENTS.md**
  Người dùng thấy gì: Người phát triển sau này có thể khó tìm thấy tài liệu hướng dẫn về khoá bí mật và các phần mới của hệ thống, làm chậm việc bảo trì hoặc mở rộng tính năng.
  file: `docs/environment.md`
  severity: medium
  Đề xuất: known-limits

- **LISTING.maxItems lặp lại LISTING_BATCH_MAX_ITEMS và không ai đọc**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối; đây là một hằng số cấu hình thừa trong mã nguồn, dễ gây nhầm lẫn cho người bảo trì sau này khi muốn đổi giới hạn.
  file: `apps/api/src/listings/listings-config.ts`
  severity: low
  Đề xuất: known-limits

- **Nhãn thanh điều hướng viết cứng tiếng Việt, đi vòng qua kho chuỗi mà chính vòng này dựng**
  Người dùng thấy gì: Người dùng dùng trình đọc màn hình ở chế độ tiếng Anh có thể nghe nhãn 'Chiến dịch' bị đọc sai giọng, vì chữ này không được đánh dấu là tiếng Việt.
  file: `apps/app/components/app-icon-rail.tsx`
  severity: low
  Đề xuất: known-limits

- **Nhãn tuỳ chọn lệch làm rơi cả lô bằng Error trần, sau khi vài mục đã ghi xong**
  Người dùng thấy gì: Nếu một nhãn cấu hình (ví dụ mức sản lượng 'Cao') bị đổi tên, việc nạp dữ liệu từ sàn có thể dừng đột ngột giữa chừng: một phần dữ liệu đã lưu, một phần chưa, và người vận hành chỉ nhận được một lỗi chung chung không rõ đã lưu được bao nhiêu.
  file: `apps/api/src/listings/listing-ingest.service.ts`
  severity: low
  Đề xuất: new-contract

- **Lỗi tải danh sách chiến dịch hiện ra thành trạng thái rỗng "chưa có chiến dịch nào"**
  Người dùng thấy gì: Nếu hệ thống gặp sự cố khi tải danh sách chiến dịch, người dùng thấy thông báo 'chưa có chiến dịch nào' và có thể tưởng nhầm là dữ liệu của mình đã bị mất, dù đó chỉ là lỗi tạm thời.
  file: `apps/app/app/(app)/[slug]/campaigns/campaigns-table.tsx`
  severity: high
  Đề xuất: known-limits

- **Bộ cào không ghi lô ra đĩa ở đường gửi — cổng tiếp nhận từ chối là mất trắng cả lượt cào**
  Người dùng thấy gì: Nếu hệ thống tiếp nhận từ chối lô dữ liệu khi đang gửi, toàn bộ kết quả của lượt cào — có thể là công sức nhiều giờ — bị mất hoàn toàn và không thể gửi lại.
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: high
  Đề xuất: known-limits

- **Lô từ sàn không nguyên tử: lỗi giữa chừng để lại phần đã ghi, người gọi chỉ nhận 500 trắng**
  Người dùng thấy gì: Khi một lô dữ liệu lớn nạp vào giữa chừng bị lỗi, một phần đã được lưu vào hệ thống nhưng người vận hành nhận một lỗi chung, không biết chính xác đã lưu được bao nhiêu và phải đoán có nên gửi lại hay không.
  file: `apps/api/src/listings/listing-ingest.service.ts`
  severity: medium
  Đề xuất: new-contract

- **Chặn xoá góc nhìn tính cả chiến dịch ĐÃ KẾT THÚC, và thông điệp bảo người dùng làm một việc không gỡ được nút**
  Người dùng thấy gì: Sau khi một chiến dịch kết thúc, góc nhìn đã dùng cho chiến dịch đó vẫn không xoá được mãi mãi, và thông báo lỗi khuyên người dùng làm những việc mà màn hình không có nút nào để thực hiện.
  file: `apps/api/src/saved-views/saved-views.service.ts`
  severity: medium
  Đề xuất: new-contract

- **Truy vấn chi tiết chiến dịch hỏng thì màn hình quay vòng vĩnh viễn**
  Người dùng thấy gì: Nếu trang chi tiết chiến dịch gặp lỗi tải dữ liệu, màn hình quay vòng tải mãi không dừng, không có thông báo lỗi hay đường quay lại.
  file: `apps/app/app/(app)/[slug]/campaigns/[campaignId]/campaign-detail.tsx`
  severity: medium
  Đề xuất: known-limits

- **sizeOf nuốt mọi lỗi thành null — cỡ phân khúc biến mất không dấu vết cho người dùng**
  Người dùng thấy gì: Khi tạo chiến dịch, số lượng người trong phân khúc có thể không hiện ra mà không có lời giải thích, khiến người dùng không biết là chưa đếm được hay phân khúc thật sự trống.
  file: `apps/api/src/saved-views/saved-views.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Chú thích trong hộp tạo chiến dịch nói sai về danh sách góc nhìn đang hiện**
  Người dùng thấy gì: Dòng hướng dẫn trong hộp tạo chiến dịch nói chỉ có góc nhìn dùng chung, nhưng thực tế cả góc nhìn riêng tư cũng hiện ra — người dùng có thể chọn nhầm và tạo chiến dịch mà đồng nghiệp không hiểu được nó lọc theo gì.
  file: `apps/app/lib/messages/campaigns.ts`
  severity: medium
  Đề xuất: new-contract

- **Sơ đồ site tải hỏng bị ghi log thành "sơ đồ site không có địa chỉ" — chẩn đoán sai nguyên nhân**
  Người dùng thấy gì: Khi sàn nhatot chặn bộ cào, nhật ký vận hành báo sai nguyên nhân là 'không tìm thấy địa chỉ', khiến người vận hành có thể sửa nhầm chỗ.
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: low
  Đề xuất: known-limits

- **Tuyên quét LỚP nhưng chỉ có điểm-case — ma trận cột × bề rộng khai trước rồi bỏ không dùng**
  Người dùng thấy gì: Phép đo tự động cho việc cột bảng bị ẩn đúng cách ở màn hình hẹp yếu hơn những gì hồ sơ mô tả — một cột bị xoá nhầm hoặc ẩn sai có thể không bị phát hiện.
  file: `_acceptance/tiep-thi-tuyen-doi-tac/rang/chien-dich.mjs`
  severity: high
  Đề xuất: known-limits

- **Đo CHỈ DẪN thay vì ĐẦU RA — chốt phủ sóng 12 mã trạng thái chỉ so hai danh sách của chính bộ đo**
  Người dùng thấy gì: Phép đo tự động kiểm tra đủ 12 trạng thái giao diện yếu hơn những gì hồ sơ mô tả — nếu một trạng thái thật sự bị hỏng trong sản phẩm, phép đo này có thể không phát hiện ra.
  file: `_acceptance/tiep-thi-tuyen-doi-tac/rang/chien-dich.mjs`
  severity: medium
  Đề xuất: known-limits

- **Tuyên quét LỚP nhưng chỉ có điểm-case — vòng khép kín E22 hứa ma trận 9 trường, bài chỉ đếm hai con số**
  Người dùng thấy gì: Phép đo tự động nối dữ liệu thật từ bộ cào vào hệ thống chỉ kiểm tra số lượng bản ghi, không kiểm tra từng giá trị — nếu hai trường dữ liệu bị đổi chỗ cho nhau, phép đo này có thể không phát hiện ra.
  file: `apps/api/test/listing-fixture-batch.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình — phép kiểm translate="no" bỏ qua giá trị không tìm thấy, không có đối chứng dương**
  Người dùng thấy gì: Phép đo tự động kiểm tra dữ liệu sàn/người dùng không bị dịch máy yếu hơn mô tả — nếu dữ liệu đó biến mất khỏi màn hình vì lỗi khác, phép đo này có thể vẫn báo đạt.
  file: `_acceptance/tiep-thi-tuyen-doi-tac/rang/be-mat.mjs`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có mục nào — vòng review lần này hoàn tất đầy đủ)

⚠ Cụm ngoài vùng phủ: 2/22 lỗi rơi vào file không bộ đo nào phủ (docs/environment.md, apps/app/components/app-icon-rail.tsx) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
