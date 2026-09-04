## Trong hợp đồng

### Giá trị SELECT của lô từ sàn rơi thành NULL không một tiếng động
- file: `apps/api/src/listings/listing-ingest.service.ts:45`
- severity: high
- AC: AC-1
- nguồn: bugs

optionId() trả `?? null` khi không tìm được option nào có label khớp. Ba trường SELECT (san_luong, hinh_thai, chung_chi) đi qua đúng đường đó, rồi được ghi thẳng vào fieldValue.optionId = null trong writeValues() — không log, không lỗi, cổng tiếp nhận vẫn trả 200 và đếm là created/updated.

Làm nó đỏ: ListingFieldsService.ensure() (apps/api/src/listings/listing-fields.service.ts:20) chỉ tạo định nghĩa khi KEY còn thiếu — nó không bao giờ đối chiếu lại danh sách option của một định nghĩa đã có. Nên chỉ cần một trong hai chuyện xảy ra là mất dữ liệu im lặng: (a) người quản trị đổi nhãn option trong màn Trường (ví dụ "Cao" → "Cao (≥60)"), (b) LISTING_TIERS/TIER_LABELS thêm hoặc đổi một mức sau khi bảng đã tạo. Từ lúc đó mọi môi giới nhập về có ô Sản lượng rỗng, và CampaignMember.tier luôn null — trong khi bộ cào vẫn báo chạy thành công.

Sửa: hoặc để optionId() ném lỗi gọi tên field + label không khớp, hoặc cho ensure() upsert option theo label cho định nghĩa đã tồn tại.

Rationale phạm vi: san_luong, hinh_thai, chung_chi là ba trong chín trường tuỳ chỉnh mà AC-1 hứa mang đúng giá trị của mục; ghi null lặng lẽ phá vỡ đúng lời hứa đó.

### Hình dạng 2 — fixture viết tay đúng khuôn bên đọc: bằng chứng live trong chính diff cho thấy parser không tách được hai số mà fixture khẳng định là tách được
- file: `tools/listing-crawl/tests/test_parse.py:22`
- severity: high
- AC: AC-13
- nguồn: measurement

`test_boc_dung_tam_gia_tri` khẳng định `item["listingsNew30d"] == 164` trong khi `listingsTotal` của cùng hồ sơ là 436 — tức fixture hứa parser phân biệt được 'tổng tin' và 'tin mới 30 ngày'. Nhưng fixture là mẫu tự dựng theo đúng bộ chọn của bên đọc: `tests/fixtures/profile.html:12` đặt sẵn `<span class="stat-value">164<!-- --> tin mới</span>` trong `div.stat-item` kèm nhãn 'Trong 30 ngày', đúng khuôn `_new_30d()` (`listing_crawl/parse.py:100-108`), và `profile-next-data.json:45` đặt `totalAdsCount: 436` đúng khuôn `_dig(...,"ads","totalAdsCount")`. Không có vòng round-trip nào rút HTML từ trang thật rồi cho reader đọc lại. Bằng chứng live commit cùng diff phủ định lời hứa đó: cả 11/11 mục trong `_acceptance/tiep-thi-tuyen-doi-tac/evidence/live-batch.json` có `listingsTotal == listingsNew30d` (436/436, 247/247, 164/164, 149/149, 129/129, 118/118, 108/108, 103/103, 100/100, 91/91, 88/88), và `evidence/live-run.log` in phân vị `tin_moi_30_ngay` min 88 · q3 164 · max 436 trùng khít dải tổng tin. Trên trang thật, giá trị 'tin mới 30 ngày' rơi về tổng tin, mà bài đo vẫn xanh vì nó chỉ đọc mẫu tự dựng. Chuỗi này nuôi trực tiếp `tier_of()` và ngưỡng 60/20/1 mà E19 đem ra hỏi người.

Làm nặng thêm: `listing_crawl/__main__.py:86` — `fixture_run` parse LẠI đúng một `profile.html` cho mọi seed rồi chỉ thay `url`, nên `evidence/fixture-batch.json` (2 mục) là một hồ sơ nhân đôi; vòng khép kín E22 vì thế round-trip đúng một trang tự dựng.

Rationale phạm vi: AC-13 hứa mỗi mẫu ra đúng giá trị đã biết gồm tổng tin và tin mới 30 ngày; fixture tự dựng theo đúng bộ chọn nên không xác lập được lời hứa đó, và bằng chứng live cho thấy parser thật không tách được hai giá trị này.

### Hình dạng 5 — tuyên 'chín trường đúng' nhưng chỉ đếm số phần tử, không có ma trận giá trị viết trước
- file: `apps/api/test/listing-ingest.integration.spec.ts:98`
- severity: high
- AC: AC-1
- nguồn: measurement

Bài mang tên 'AC-1 · mỗi mục thành một cá nhân nguồn sàn với chín trường đúng' và E1 hứa 'mỗi cá nhân có đủ 9 giá trị trường ĐÚNG BẰNG mục gửi (san_luong, tin_dang, tin_moi_30_ngay, dia_ban, hinh_thai, chung_chi, ten_chuyen_trang, trang_nhatot, san_cap_nhat_luc)'. Khẳng định thật chỉ là `expect(contact?.fieldValues.length).toBe(9)` — đếm phần tử, không so giá trị nào; `select` còn lấy `text`, `number`, `phone` rồi bỏ không dùng. Ma trận toàn phần phải có 9 assert cho 9 phần tử; ở đây có 1. Cả bộ đo chỉ ghim đúng 1/9 ánh xạ (`tin_dang = 999` ở dòng 126). Hệ quả cụ thể tại `apps/api/src/listings/listing-ingest.service.ts:135-160`: `tin_dang` và `tin_moi_30_ngay` cùng kiểu NUMBER — hoán vị hai dòng này vẫn xanh; và ba trường SELECT đi qua `optionId()` (dòng 40-47) vốn trả `null` LẶNG LẼ khi nhãn không khớp, nên `san_luong`/`hinh_thai`/`chung_chi` ghi rỗng vẫn đủ 9 hàng `fieldValue` và vẫn xanh. Bài round-trip `apps/api/test/listing-fixture-batch.spec.ts:49-50` cũng chỉ assert `created`/`updated` dù E22 hứa '9 giá trị trường của mục đầu khớp tệp' — nên không có chỗ nào trong diff bù lại phần thiếu này.

Rationale phạm vi: AC-1 hứa chín trường tuỳ chỉnh mang đúng giá trị của mục; bài đo tên AC-1 chỉ đếm số phần tử bằng 9, không so sánh giá trị nên không xác lập được lời hứa của AC-1.

### Hình dạng 5 — E3 khai ma trận ba ca (403/503/400) cho cổng tiếp nhận, bộ đo chỉ có một ca và ca đó không chạm cổng
- file: `apps/api/test/listing-ingest.integration.spec.ts:156`
- severity: high
- AC: AC-3
- nguồn: measurement

`evals.yaml:44-49` (E3) khai trước ma trận ba ca trên cổng tiếp nhận: (a) khoá sai → 403, (b) khoá chưa cấu hình → 503, (c) một mục thiếu `listingsTotal` → 400 kèm thông điệp 'items.1.listingsTotal'. Trong diff chỉ tồn tại ca (c), và ca (c) gọi thẳng `parseListingBatch(...)` chứ không đi qua `ListingsController` — nó đo bộ phân tích Zod, không đo cổng, nên không có mã trạng thái 400 nào được kiểm. Ca (a) và (b) không có bài nào: `grep 403|503|LISTING_INGEST_SECRET|Bearer` trên `apps/api/test/*.spec.ts` chỉ trúng `mailbox-api-client.spec.ts`. Trong khi đó `apps/api/src/listings/listings.controller.ts:53` đánh dấu `@AllowAnonymous()` và cổng chỉ được canh bằng bí mật Bearer đọc từ `LISTING_INGEST_SECRET` — tức nhánh duy nhất giữ cửa cho một endpoint ẩn danh ghi thẳng vào bảng Contact hoàn toàn không có phép đo. Số assert = 1 trên ma trận 3 phần tử đã khai.

Rationale phạm vi: AC-3 hứa cổng từ chối lần lượt bằng 403, 503, 400 trong cả ba ca; bộ đo chỉ kiểm được ca 400 và không đi qua controller thực, nên hai ca 403/503 của AC-3 không được kiểm chứng.

### Hình dạng 4 — khẳng định âm-tính-một-mình: `rejects.toThrow()` không ghim thông điệp, và số đếm bằng 0 đúng theo cấu trúc nên không thể đỏ theo chiều nó tuyên
- file: `apps/api/test/campaigns.spec.ts:222`
- severity: medium
- AC: AC-8
- nguồn: measurement

Bài 'AC-8 · hoạt động hỏng thì không còn lượt gọi nào' (dòng 222-238) dùng `await expect(service.touch({... contactId: "khong-co-ca-nhan-nay" ...})).rejects.toThrow()` — toThrow trần, không ghim thông điệp, nên bất kỳ lỗi nào cũng đạt. E10 khai chiều đỏ của bài này là 'bỏ transaction trong bản sao → bài thứ hai đỏ', tức bài này phải đo tính nguyên tử. Nhưng `apps/api/src/campaigns/campaigns.service.ts:240-268` tạo `Activity` TRƯỚC rồi mới tạo `CampaignTouch`: với contactId không tồn tại, câu lệnh đầu tiên đã đứt vì khoá ngoại, `campaignTouch.create` không bao giờ chạy. Vậy `expect(await touchCount(campaign.id)).toBe(0)` đúng theo cấu trúc kể cả khi gỡ bỏ `$transaction` — khẳng định không thể đỏ theo chiều nó tuyên là canh. (Bài anh em ở dòng 240-256, hỏng ở bước `campaignTouch`, mới thật sự đo được rollback.) Thiếu ghim thông điệp cũng khiến không phân biệt được 'hỏng trong giao dịch rồi cuộn lại' với 'từ chối trước khi ghi gì'.

Rationale phạm vi: AC-8 hứa hai bản ghi được ghi trong một lần không tách rời; bài được đặt tên do tính nguyên tử nhưng theo cấu trúc không thể đo sai khả năng đó vì câu lệnh đầu đã thất bại trước khi chạm tới bước thứ hai.

### Hình dạng 4 — `rejects.toThrow()` trần, không đối chứng dương trong cùng bài, không ghim thông điệp
- file: `apps/api/test/campaign-schema.spec.ts:38`
- severity: medium
- AC: AC-11
- nguồn: measurement

Bài 'từ chối xoá góc nhìn đang có chiến dịch dùng' kết bằng `await expect((async () => db.savedView.delete({ where: { id: view.id } }))()).rejects.toThrow()` — không ghim thông điệp, không kiểm loại lỗi, và không có đối chứng dương nào trong bài (không có nhánh 'gỡ chiến dịch ra rồi xoá được' để chứng minh phép xoá vốn chạy). Bất kỳ ngoại lệ nào cũng làm bài xanh: lỗi kết nối, đổi tên cột, ràng buộc khác, hay một lỗi Prisma không liên quan tới `onDelete: Restrict` — tức bài không phân biệt được 'ràng buộc chặn' với 'câu lệnh hỏng vì lý do khác'. Bài không kiểm luôn góc nhìn còn tồn tại sau khi bị từ chối.

Rationale phạm vi: AC-11 hứa từ chối kèm thông điệp nêu tên chiến dịch và góc nhìn không bị xoá; bài chỉ kiểm có ném lỗi, không kiểm thông điệp và không kiểm góc nhìn còn tồn tại sau khi bị từ chối.

### Hình dạng 3 — lời hứa là quan hệ trạng-thái → câu chữ, khẳng định chỉ là 'chuỗi có dấu tiếng Việt'
- file: `apps/app/test/campaign-states.spec.ts:23`
- severity: medium
- AC: AC-12
- nguồn: measurement

E25 (`evals.yaml:414-419`) và `rang/be-mat.mjs:9-30` giao cho bài này ba mã trạng thái không dựng được trên trình duyệt (ST-danh-sach-loading, ST-danh-sach-empty, ST-tao-khong-goc-nhin) — lời hứa là 'màn ở trạng thái X hiện câu Y'. Khẳng định thật ở dòng 23-27 chỉ là `expect(m.empty.list).toMatch(DAU)` và `expect(m.empty.noViews).toMatch(DAU)`: chỉ kiểm chuỗi CÓ MẶT trong kho và có một ký tự dấu, không nối `listState(...) === "empty"` với `m.empty.list`, cũng không nối `createState(...) === "no-views"` với `m.empty.noViews`. Đổi `campaigns-table.tsx` để trạng thái 'empty' vẽ `m.empty.members` thay vì `m.empty.list` thì bài vẫn xanh. Ngoài ra chuỗi của mã thứ ba (`loading.list`, có thật ở `apps/app/lib/messages/campaigns.ts:83`) không được khẳng định ở đâu — E25 hứa ba chuỗi, bài kiểm hai. Phép kiểm dấu này cũng trùng lặp: `apps/app/test/messages-guard.spec.ts:113-119` đã quét dấu cho mọi giá trị vi của mọi module.

Rationale phạm vi: AC-12 và Notes chỉ định chính file này là phép đo ở mức đơn vị cho ba trạng thái (ST-danh-sach-loading, ST-danh-sach-empty, ST-tao-khong-goc-nhin); bài chỉ kiểm chuỗi có dấu tiếng Việt, không nối hàm chọn trạng thái với chuỗi hiển thị tương ứng, nên không xác lập được lời hứa 'mở trạng thái X hiện đúng câu Y' của AC-12.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **savedViews.list now runs a full contacts.list (with facet groupBys) per saved view — N+1 on a menu that loads on every list page**
  Người dùng thấy gì: Mở menu góc nhìn đã lưu trên trang danh bạ, công ty hay deal có thể chậm đi khi có nhiều góc nhìn, vì mỗi lần mở đều tính lại toàn bộ số liệu phân khúc thay vì chỉ đếm nhanh.
  file: `apps/api/src/saved-views/saved-views.service.ts`
  severity: high
  Đề xuất: known-limits

- **campaigns.list ships the whole table and the browser sorts and paginates it — the one thing docs/api.md forbids**
  Người dùng thấy gì: Trang danh sách chiến dịch tải toàn bộ chiến dịch về trình duyệt rồi mới sắp xếp và phân trang, nên có thể chậm dần khi số chiến dịch tăng lên.
  file: `apps/app/app/(app)/[slug]/campaigns/campaigns-table.tsx`
  severity: high
  Đề xuất: known-limits

- **A second splitName in the listings ingest splits names the opposite way from the shared one**
  Người dùng thấy gì: Tên người thêm từ sàn nhatot có thể bị tách họ và tên khác với cách tách tên khi thêm qua email, nên cùng một người có thể hiển thị tên khác nhau tuỳ nguồn nhập.
  file: `apps/api/src/listings/listing-ingest.service.ts`
  severity: medium
  Đề xuất: known-limits

- **campaigns.touch never checks the contact — an unknown id returns 500, and any contact outside the segment can be recorded against the campaign**
  Người dùng thấy gì: Ghi kết quả cuộc gọi cho một cá nhân không tồn tại có thể trả về lỗi khó hiểu thay vì thông báo rõ ràng, và số liệu chiến dịch có thể lẫn cả người ngoài phân khúc đã chọn.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: medium
  Đề xuất: known-limits

- **The crawler's batch_size is never read — a full run posts one oversized batch and fails its own schema**
  Người dùng thấy gì: Nếu chạy bộ cào không giới hạn số lượng, toàn bộ kết quả có thể bị mất trắng ở bước cuối vì gửi lên một lô quá lớn cùng một lúc.
  file: `tools/listing-crawl/config.toml`
  severity: medium
  Đề xuất: new-contract

- **Real brokers' names and phone numbers are committed as acceptance evidence**
  Người dùng thấy gì: Hồ sơ nghiệm thu đang lưu lại vĩnh viễn tên và số điện thoại thật của môi giới ngoài đời, dữ liệu này sẽ theo mọi bản sao của kho mã nguồn.
  file: `_acceptance/tiep-thi-tuyen-doi-tac/evidence/live-batch.json`
  severity: medium
  Đề xuất: known-limits

- **LISTING.maxItems is dead and duplicates the real batch limit that lives in the validation package**
  Người dùng thấy gì: Có một mục cấu hình giới hạn số lượng không có tác dụng thật, dễ gây nhầm lẫn cho người chỉnh sửa sau này.
  file: `apps/api/src/listings/listings-config.ts`
  severity: low
  Đề xuất: known-limits

- **listingItem.city is validated at the boundary and then silently dropped**
  Người dùng thấy gì: Thông tin tỉnh, thành từ sàn nhatot được gửi lên nhưng không được lưu vào hồ sơ cá nhân, dữ liệu này mất đi mà không có cảnh báo.
  file: `packages/validation/src/listing-ingest.ts`
  severity: low
  Đề xuất: known-limits

- **Lượt chạy live không chia lô — vượt 500 mục là mất trắng cả lượt cào**
  Người dùng thấy gì: Một lượt cào thật không giới hạn số lượng có thể chạy nhiều giờ rồi mất sạch toàn bộ kết quả ở bước cuối cùng, không có gì được lưu lại.
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: high
  Đề xuất: new-contract

- **Ô tìm kiếm trong màn chiến dịch thay luôn q của góc nhìn, kéo người ngoài phân khúc vào danh sách gọi**
  Người dùng thấy gì: Gõ tìm kiếm trong bảng thành viên chiến dịch có thể hiện cả người ngoài phân khúc đã chọn, và kết quả gọi có thể bị ghi nhầm cho họ.
  file: `apps/api/src/campaigns/campaigns.service.ts`
  severity: medium
  Đề xuất: new-contract

- **Một trường của bộ cào bị lưu trữ (archive) là cổng tiếp nhận chết hẳn với lỗi 500 mờ**
  Người dùng thấy gì: Nếu một trường dữ liệu của sàn bị lưu trữ trong màn Trường, mọi lượt tiếp nhận dữ liệu sàn sau đó có thể báo lỗi hệ thống cho tới khi trường được bỏ lưu trữ.
  file: `apps/api/src/listings/listing-fields.service.ts`
  severity: medium
  Đề xuất: known-limits

- **savedViews.list nay chạy một truy vấn contacts đầy đủ cho mỗi góc nhìn, và nuốt mọi lỗi thành null**
  Người dùng thấy gì: Cỡ phân khúc có thể lặng lẽ biến mất khỏi hộp tạo chiến dịch khi có lỗi, mà không có thông báo nào cho người dùng biết vì sao.
  file: `apps/api/src/saved-views/saved-views.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Truy vấn chiến dịch hỏng thì màn hình quay vòng mãi mãi, không báo lỗi**
  Người dùng thấy gì: Mở một chiến dịch không tồn tại hoặc đã bị xoá có thể khiến màn hình quay vòng mãi mãi mà không có thông báo lỗi hay đường quay lại.
  file: `apps/app/app/(app)/[slug]/campaigns/[campaignId]/campaign-detail.tsx`
  severity: medium
  Đề xuất: known-limits

- **Bật "chỉ chưa gọi" không đưa trang về 1 — bảng rỗng dù còn dữ liệu**
  Người dùng thấy gì: Bật bộ lọc chỉ xem người chưa gọi khi đang ở trang sau có thể hiện bảng trống dù thực ra vẫn còn người chưa gọi.
  file: `apps/app/app/(app)/[slug]/campaigns/[campaignId]/campaign-detail.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — chân 'be-rong' in trước ma trận 7 cột nhưng chỉ assert trên những tiêu đề tình cờ có trong DOM**
  Người dùng thấy gì: Bảng thành viên chiến dịch có thể mất một cột, đổi nhãn cột, hoặc ẩn sai kích thước màn hình mà không có phép đo nào phát hiện ra.
  file: `_acceptance/tiep-thi-tuyen-doi-tac/rang/chien-dich.mjs`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/22 lỗi rơi vào file không bộ đo nào phủ (_acceptance/tiep-thi-tuyen-doi-tac/evidence/live-batch.json, apps/api/test/campaign-schema.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
