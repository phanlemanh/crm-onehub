## Trong hợp đồng

- **docLocTruong ở server page không lọc được gì khi không biết kiểu trường**
  file: `apps/app/components/data-table/list-search-params.ts:44`
  severity: low
  AC: AC-8
  source: conventions
  detail: `hopLe(gia)` khi không có `type` sẽ trả `CACH_LOC.some((cach) => laGiaTriHopLe(cach, gia))`. Nhưng `docMotGia` cho cách `luaChon`/`nguoi` nhận mọi chuỗi không rỗng, nên điều kiện này đúng với mọi giá trị khác chuỗi trắng. Mà `load` (dòng 209) gọi `docLocTruong(nguon, values.fields)` không truyền `truong`. Kết quả là server page đẩy nguyên giá trị sai cú pháp trên đường dẫn (ví dụ `field:so=abc` cho trường Số) sang `list.queryOptions`: API trả 400, lượt prefetch hỏng, server ghi thêm một lỗi vào nhật ký. Phía khách thì lọc theo kiểu thật, nên query key khác đi và dữ liệu prefetch không được dùng. Bước kiểm ở biên này trông như đang chặn giá trị hỏng nhưng thực tế không chặn gì. Căn cứ hợp đồng: AC-8 đòi giá trị hỏng trên đường dẫn bị bỏ trước khi gọi API, ở máy chủ và máy khách như nhau; ở máy chủ giá trị sai cú pháp vẫn lọt sang API.

- **Mốc «Đã qua» của trường Ngày tự tạo tính cả ngày hôm nay (lt: now thay vì lt: đầu ngày hôm nay)**
  file: `apps/api/src/fields/moc-ngay.ts:12`
  severity: medium
  AC: AC-3
  source: bugs
  detail: khoangMoc('overdue') trả về { lt: now } và lấy luôn thời điểm hiện tại. Trong khi đó giá trị DATE chỉ có ngày được ghi ở nửa đêm UTC (packages/db/src/fields.ts:155, `${raw}T00:00:00.000Z`). Với máy chủ chạy Asia/Ho_Chi_Minh, kể từ 07:00 sáng giờ địa phương, bản ghi có ngày đúng hôm nay thỏa `date < now` nên bị xếp vào «Đã qua», và cũng bị đếm vào số đếm overdue của demGiaTriMenu. Điều này trái với hợp đồng AC-3 («`overdue` của trường Ngày tự tạo là trước hôm nay») và quyết định Hỏi-1. Bài E3 không phát hiện được vì fixture không có bản ghi mang ngày hôm nay (đồng hồ đặt 10:00 ngày 15, chỉ có hôm qua, ngày 1, cuối tháng, ...). Với trường tự tạo, ranh nên là đầu ngày hôm nay (trường chuẩn Ngày chốt có thể giữ nguyên như cũ), và cần thêm một ca 'hôm nay' vào bài kiểm. Căn cứ hợp đồng: AC-3 quy định overdue của trường Ngày tự tạo là trước hôm nay; tính cả hôm nay là sai trực tiếp.

- **Hình dạng 4 (âm tính một mình, không đối chứng dương): vế (a) lmt-api-khoa-chet không phân biệt được khoá bị bỏ qua với khoá vẫn lọc, ở trường đã lưu trữ và ở cả cột contacts.list**
  file: `apps/api/test/loc-moi-truong.spec.ts:634`
  severity: high
  AC: AC-6
  source: measurement
  detail: Vế (a) chỉ assert `cungTap(ra, mong)`, tức tập có fields bằng tập không có fields (dòng 694). Fixture làm phép so này đạt dù khoá có bị bỏ qua hay không. (1) Dòng 620 ghi `[k.luu]: "x"` cho CẢ năm thoả thuận B1..B5, nên nếu trường đã lưu trữ `k.luu` vẫn được lọc `has:x` ở deals.list hay deals.board thì kết quả vẫn đủ năm bản ghi, đúng bằng `goc`. Lời hứa «trường đã lưu trữ bị bỏ qua» vì vậy không được đo. (2) beforeAll của describe này (602-625) không tạo liên hệ nào, nên `contacts.list({q: tienTo})` trả tập rỗng cả khi có lẫn khi không có fields. Bốn ô contacts.list trong 16 ô vì thế đạt rỗng, kể cả ô `k.lh`, mà `k.lh` là trường CONTACT đang sống, lẽ ra phải lọc ở contacts.list. Đối chứng dương duy nhất là `k.song [has:x]` (725-727), chỉ chạy trên deals.list với một khoá sống, không chứng được ô nào trong bốn khoá bỏ qua. Đếm `soO !== 16` chỉ đếm số lần chạy, không đếm số ô có sức phân biệt. Căn cứ hợp đồng: bài kiểm này là bằng chứng cho lời hứa AC-6 rằng khoá chết bị bỏ qua, nhưng không phân biệt được bỏ qua với vẫn lọc nên AC-6 chưa được chứng.

- **Hình dạng 4 (âm tính một mình): vòng lưu currentView → applyView ở lmt-duong-dan (e) đạt rỗng nếu setFilter bị nuốt**
  file: `apps/app/test/loc-moi-truong.dom.tsx:452`
  severity: high
  AC: AC-8
  source: measurement
  detail: Mỗi kiểu chạy `setFilter(`field:${key}`, GIA[type])`, chụp `view = currentView`, applyView lên bảng mới, rồi chỉ so `JSON.stringify(hienTai?.currentView) !== JSON.stringify(view)`. Không chỗ nào assert `view.filters[`field:${key}`]` bằng `GIA[type]`. Nếu một kiểu bị bộ kiểm phía khách loại (ví dụ `has:@x.vn`, `has:0903`, `gte:1.5`) hoặc currentView bỏ khoá field:, thì `view` là khuôn mặc định rỗng. Khuôn rỗng qua `savedViewFilters.safeParse` (dòng 440) vẫn đạt, và vòng lưu so rỗng với rỗng cũng đạt. Thiếu đối chứng dương rằng giá trị thật sự đã vào khuôn lưu, nên «vong luu <kieu>» không ném cho đúng loại hỏng mà nó tuyên bắt. `expect(truong.length).toBe(FIELD_TYPES.length)` ở dòng 456 là phép so lặp lại chính nó, vì `truong` sinh ra từ FIELD_TYPES. Căn cứ hợp đồng: AC-8 đòi currentView rồi applyView giữ nguyên mọi kiểu giá trị; bài kiểm đạt cả khi khuôn rỗng nên không chứng được điều đó.

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): vế (e) 'lot vao chien dich' grep mã nguồn create-campaign-sheet.tsx thay vì dựng danh sách chọn đoạn**
  file: `apps/app/test/loc-moi-truong.dom.tsx:607`
  severity: high
  AC: AC-9
  source: measurement
  detail: Lời hứa của E9 (e) là danh sách chọn đoạn của chiến dịch không liệt kê bộ lọc DEAL. Test chỉ đọc chữ của tệp bằng `Bun.file(...create-campaign-sheet.tsx).text()` rồi khớp regex `/savedViews\.list\.queryOptions\(\{\s*entity:\s*"CONTACT"\s*\}\)/`. Nó không dựng CreateCampaignSheet với kho giả trả cả bộ lọc DEAL lẫn CONTACT để đếm mục hiện ra. Nếu thành phần gọi thêm một truy vấn khác, gộp nguồn khác, hay máy chủ bỏ qua tham số entity, regex vẫn khớp và vế (e) vẫn xanh. Đây là đo câu chỉ dẫn trong mã, không đo đầu ra mà người dùng thấy. Căn cứ hợp đồng: AC-9 đòi bộ lọc Thoả thuận không có trong danh sách chọn đoạn của chiến dịch; bài kiểm chỉ soi chữ trong mã nên không đo đầu ra thật.

- **Hình dạng 3 (assert một con số trong khi lời hứa là quan hệ): bước «đang bật bốn bộ lọc» của do-man.mjs có fixture chỉ một bộ lọc phân biệt được**
  file: `_acceptance/loc-moi-truong/rang/do-man.mjs:437`
  severity: medium
  AC: AC-10
  source: measurement
  detail: Lời hứa ST-loc-dang-bat là bảng chỉ còn hàng khớp CẢ bốn bộ lọc Chữ, Số, Ngày, Ô tích. Phép đo chỉ so `hangBon === mongBon` (mongBon = 2: An, Chi). Với BAN_GHI ở dòng 134-147, bỏ riêng bộ lọc TEXT, NUMBER hay CHECKBOX vẫn ra đúng {An, Chi}. Ví dụ chỉ DATE và CHECKBOX đã cho 2, vì Em có tich false, còn Giang chỉ bị loại nhờ ngày 2099. Chỉ riêng DATE là đổi được số hàng. Vì thế một máy chủ bỏ qua cả bộ lọc Chữ lẫn Số (Số chính là trường bật bằng tay qua màn Cài đặt) vẫn qua 'lmt man: dang bat hang'. Phép so số đếm không chứng quan hệ «mỗi bộ lọc đều tác động». Nút «(4)» chỉ đếm tham số trên đường dẫn, không bù được chỗ này. Căn cứ hợp đồng: AC-10 đòi bảng chỉ còn hàng khớp các bộ lọc đang bật; phép đo với dữ liệu mẫu hiện tại không chứng được từng bộ lọc đều có tác dụng.

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): quet-bang-loc.mjs chỉ soi các hàm chọn tay và hai dạng cú pháp, bỏ lọt `definition.type === "SELECT"`/`"USER"` trong filterFacetCounts của chính fields.service.ts**
  file: `_acceptance/loc-moi-truong/rang/quet-bang-loc.mjs:18`
  severity: medium
  AC: AC-6
  source: measurement
  detail: E6b tuyên rằng mọi quyết định «kiểu nào lọc thế nào» trong bốn tệp phải đi qua bảng chung. Nhưng với fields.service.ts, TEP chỉ soi bốn tên hàm viết sẵn: filterableFieldsFor, fieldFilters, dieuKienLoc, demGiaTriMenu. filterFacetCounts nằm ngoài danh sách, và ở apps/api/src/fields/fields.service.ts:782 và :785 nó có `.filter((definition) => definition.type === "SELECT")` và `=== "USER"`, tức tự khai cách đếm mặt lọc theo kiểu. Máy quét không chạm tới nên vẫn in 'dat'. Bộ soi (dòng 147-172) cũng chỉ nhận `===`/`!==` với chuỗi kiểu và mảng từ hai chuỗi kiểu trở lên, bỏ qua `case "SELECT":` của switch, `Set` một phần tử, hay object khoá theo kiểu. phaThu chỉ thử đúng một dạng (`draft.type === "SELECT"` ở field-editor). Chưa có ma trận viết trước gồm mọi dạng khai × mọi hàm, nên lời tuyên «cả lớp» chưa được chứng. Căn cứ hợp đồng: AC-6 đòi quyết định kiểu nào lọc thế nào đọc từ một bảng dùng chung; máy quét tuyên chứng điều này nhưng bỏ lọt chỗ tự khai theo kiểu.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Tiền tố bộ lọc has:/gte:/lte: được khai lần thứ hai trong packages/ui thay vì lấy TIEN_TO_LOC**
  Người dùng thấy gì: Hôm nay các ô Chứa, Từ, Đến trong menu Bộ lọc vẫn chạy đúng. Nếu sau này ai đổi cách ghi ở một nơi mà quên nơi kia, các ô ấy sẽ ghi giá trị mà máy chủ từ chối hoặc bỏ qua.
  Căn cứ: Chưa gây lỗi nào cho người dùng, chỉ là mối nguy lệch về sau, và sửa lúc nào cũng rẻ nên ghi lại cho người sau biết là đủ.
  file: `packages/ui/src/components/data-table.tsx`
  severity: medium
  Đề xuất: known-limits

- **Bộ giá trị mốc ngày và yes/no được gõ tay ở nhiều nơi thay vì dùng MOC_NGAY và một hằng chung**
  Người dùng thấy gì: Các mốc ngày và lựa chọn Có/Không đang cho kết quả đúng. Nếu sau này có người đổi tên hay thêm một mốc ở một nơi, menu và máy chủ có thể hiểu khác nhau.
  Căn cứ: Người dùng hôm nay không thấy gì sai, chỉ có nguy cơ lệch khi sửa về sau, và việc gom lại không gấp.
  file: `apps/app/components/crm/fields/field-facets.tsx`
  severity: low
  Đề xuất: known-limits

- **Đổi kiểu trường làm bộ lọc đã lưu cũ ném BAD_REQUEST, khiến chiến dịch dựa trên bộ lọc ấy hỏng**
  Người dùng thấy gì: Nếu quản trị đổi kiểu của một trường đang được bộ lọc đã lưu dùng, trang chi tiết và danh sách thành viên của chiến dịch dùng bộ lọc ấy có thể báo lỗi cho tới khi bộ lọc được sửa. Bảng danh sách thì vẫn mở được nhưng cho kết quả khác chiến dịch.
  Căn cứ: Chỉ xảy ra khi đổi kiểu trường đã có bộ lọc lưu và gây lỗi hiển thị chứ không mất dữ liệu, nhưng đụng tới chiến dịch nên đáng làm thành việc riêng có quyết định hành vi.
  file: `apps/api/src/fields/fields.service.ts`
  severity: medium
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
