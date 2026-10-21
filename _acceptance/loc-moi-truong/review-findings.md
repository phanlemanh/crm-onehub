# Review findings: loc-moi-truong (round 2)

## Trong hợp đồng

- **Server page và máy khách vẫn ra hai input khác nhau khi đường dẫn có khoá field: không nằm trong fields.filters**
  AC: AC-8
  file: `apps/app/components/data-table/list-search-params.ts:74`
  severity: medium
  source: conventions
  detail: Round này truyền `truong` (lấy từ `fields.filters`) vào `load` ở ba page.tsx để kiểm giá trị theo kiểu, nhưng `docLocTruong` (dòng 74-79) vẫn gom MỌI khoá `field:<x>` trên đường dẫn. Khoá nào không có trong `truong` (trường đã lưu trữ, trường đã tắt «Hiện trong bộ lọc», hay khoá gõ sai) đi vào `hopLe(gia, undefined)`, tức kiểm lỏng `CACH_LOC.some(...)`, mà kiểm này đúng với mọi chuỗi không rỗng. Phía máy khách thì `useTableQuery` (apps/app/components/data-table/use-table-query.ts:108-112) chỉ đọc `field:<key>` của các key nằm trong `truongLoc`, nên khoá lạ bị bỏ hẳn. Ví dụ với `?field:da_luu_tru=x`: máy chủ prefetch `deals.list({fields:{da_luu_tru:["x"]}})`, còn máy khách gọi với `fields:{}`. Query key lệch nhau nên dữ liệu prefetch bị bỏ phí và máy khách phải gọi lại. Lỗi này vẫn trái AC-8 («máy chủ và máy khách như nhau»), đúng loại lỗi mà finding r1 về docLocTruong đã nêu, chỉ là nay còn ở nhánh khoá không biết kiểu. Giờ máy chủ đã có `truong` trong tay, nên ở máy chủ cũng nên bỏ khoá không có trong `truong`, giống cách máy khách làm. Bài `mayChuHong` ở apps/app/test/loc-moi-truong.dom.tsx chỉ thử các khoá có trong `truong`, nên không bắt được chỗ này.
  rationale: AC-8 đòi lượt tải danh sách từ đường dẫn mang đúng `fields` ở máy chủ và máy khách như nhau; khoá lạ được máy chủ giữ còn máy khách bỏ nên hai bên lệch.

- **Bộ đọc máy chủ vẫn giữ khoá `field:` của trường không nằm trong fields.filters, còn máy khách thì bỏ, nên ListInput hai bên vẫn lệch**
  AC: AC-8
  file: `apps/app/components/data-table/list-search-params.ts:44`
  severity: medium
  source: bugs
  detail: Bản sửa r1 truyền `truong` vào `docLocTruong`, nhưng chỉ khoá có trong `truong` mới được lọc theo kiểu. Khoá không có trong danh sách thì `kieu.get(key)` trả undefined, và `hopLe(g, undefined)` rơi về `CACH_LOC.some(...)`, tức nhận mọi chuỗi không trắng (vì luaChon/nguoi nhận mọi chuỗi). `docLocTruong` lại gom MỌI tham số `field:*` có trên đường dẫn. Phía khách, `useTableQuery` (use-table-query.ts:107-111) chỉ đọc `field:<key>` cho các key trong `truongLoc`. Tôi đã chạy thử với truong=[{so:NUMBER}] và `?field:so=gte:5&field:tat=gte:abc&field:tat2=maybe`: máy chủ ra {so:[gte:5], tat:[gte:abc], tat2:[maybe]}, máy khách ra {so:[gte:5]}. Đường dẫn có trường đã tắt «Hiện trong bộ lọc» (ca Hỏi-5), trường đã lưu trữ hay khoá không còn tồn tại vì vậy làm server prefetch `deals.list`/`companies.list`/`contacts.list` với query key khác query key máy khách dùng. Dữ liệu prefetch bị bỏ phí, bảng hiện trạng thái chờ rồi tải lại. Hợp đồng AC-8 đòi máy chủ và máy khách cho cùng một kết quả. E8 vế (b) chỉ so các khoá sống nên không bắt được ca này. Cách sửa: `docLocTruong` chỉ giữ khoá có trong `truong` khi `truong` được truyền vào, giống cách máy khách làm.
  rationale: Cùng một lỗi lệch đầu vào máy chủ/máy khách với khoá không có trong danh sách trường, trái vế «ở máy chủ và máy khách như nhau» của AC-8.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **`.catch(() => [])` ở ba trang danh sách nuốt lỗi fields.filters rồi lặng lẽ tắt bước kiểm theo kiểu vừa thêm ở r1**
  Người dùng thấy gì: Nếu việc lấy danh sách trường lọc bị hỏng giữa chừng, trang danh sách có thể vẫn nhận giá trị lọc sai trên đường dẫn và tải chậm hoặc báo lỗi thay vì bỏ qua giá trị đó. Người dùng tải lại trang là hết.
  Căn cứ: Chỉ gặp khi một phần khác của hệ thống đang lỗi, hậu quả là trang tải chậm hoặc báo lỗi tạm thời, không mất dữ liệu và tải lại là xong.
  file: `apps/app/app/(app)/[slug]/deals/page.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc, không round-trip): bảng xem giả của lmt-luu-thoa-thuan không đi qua savedViewOutput thật như E9 hứa**
  Người dùng thấy gì: Bài kiểm tự động của menu bộ lọc đã lưu cho Thoả thuận dùng dữ liệu giả gõ tay, nên nếu sau này máy chủ đổi dạng dữ liệu trả về thì bài kiểm vẫn xanh trong khi menu có thể hỏng. Hiện tại người dùng không thấy gì khác.
  Căn cứ: Không ảnh hưởng người dùng hôm nay, chỉ làm lưới an toàn về sau yếu hơn lời hứa; sửa được sau mà không đụng dữ liệu nào.
  file: `apps/app/test/loc-moi-truong.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Tiền tố bộ lọc has:/gte:/lte: được khai lần thứ hai trong packages/ui thay vì lấy TIEN_TO_LOC (r1 · tệp đã đổi)**
  Người dùng thấy gì: Hôm nay các ô Chứa, Từ, Đến trong menu Bộ lọc vẫn chạy đúng. Nếu sau này ai đổi cách ghi ở một nơi mà quên nơi kia, các ô ấy sẽ ghi giá trị mà máy chủ từ chối hoặc bỏ qua.
  Căn cứ: Chưa gây lỗi nào cho người dùng, chỉ là mối nguy lệch về sau, và sửa lúc nào cũng rẻ nên ghi lại cho người sau biết là đủ.
  file: `packages/ui/src/components/data-table.tsx`
  severity: medium
  Đề xuất: known-limits

- **Bộ giá trị mốc ngày và yes/no được gõ tay ở nhiều nơi thay vì dùng MOC_NGAY và một hằng chung (r1)**
  Người dùng thấy gì: Các mốc ngày và lựa chọn Có/Không đang cho kết quả đúng. Nếu sau này có người đổi tên hay thêm một mốc ở một nơi, menu và máy chủ có thể hiểu khác nhau.
  Căn cứ: Người dùng hôm nay không thấy gì sai, chỉ có nguy cơ lệch khi sửa về sau, và việc gom lại không gấp.
  file: `apps/app/components/crm/fields/field-facets.tsx`
  severity: low
  Đề xuất: known-limits

- **Đổi kiểu trường làm bộ lọc đã lưu cũ ném BAD_REQUEST, khiến chiến dịch dựa trên bộ lọc ấy hỏng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu quản trị đổi kiểu của một trường đang được bộ lọc đã lưu dùng, trang chi tiết và danh sách thành viên của chiến dịch dùng bộ lọc ấy có thể báo lỗi cho tới khi bộ lọc được sửa. Bảng danh sách thì vẫn mở được nhưng cho kết quả khác chiến dịch.
  Căn cứ: Chỉ xảy ra khi đổi kiểu trường đã có bộ lọc lưu và gây lỗi hiển thị chứ không mất dữ liệu, nhưng đụng tới chiến dịch nên đáng làm thành việc riêng có quyết định hành vi.
  file: `apps/api/src/fields/fields.service.ts`
  severity: medium
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
