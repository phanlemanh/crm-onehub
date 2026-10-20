# Review findings: lo-trinh-nhieu-san-pham (round 3)

## Trong hợp đồng

Không có finding nào map được vào AC trong round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The fetch loop can still save the old source's roadmap snapshot if the source is edited mid-run**
  Người dùng thấy gì: Neu quan tri sua kho cua mot san pham dung vao luc he thong dang lay lo trinh, trang Lo trinh co the con hien them mot ban chup cua kho cu thay vi de trong. Ban do van duoc danh dau «nguon vua doi» va tu duoc thay bang ban cua kho moi o lan lay tiep theo.
  Căn cứ: Hau qua nhe: chi xay ra khi sua nguon trung dung vao vai phan nghin giay cua mot lan lay, khong mat hay lo du lieu, trang van hien dong bao nguon vua doi, va lan lay ke tiep tu sua; sua dat hon nhieu so voi hau qua.
  file: `apps/agent/agent/lib/lo-trinh-san-pham.ts`
  severity: low
  Đề xuất: wont-fix

- **Router sanPhamLoTrinh vào phạm vi «chung» mà không khai trong bài ghim vai «chỉ OKR» — bài vai-chi-okr đỏ (r1)**
  Người dùng thấy gì: Người chỉ có vai OKR vẫn gọi được các thao tác về sản phẩm nhưng không thấy dữ liệu sản phẩm nào, và thao tác ghi bị từ chối. Điều lệch là bài kiểm giữ danh sách việc vai này được làm chưa cập nhật nên đỏ.
  Căn cứ: Người dùng không bị lộ dữ liệu hay mất gì, chỉ một bài kiểm nội bộ đỏ và sửa chỉ là một dòng khai thêm, nhưng phải làm trước khi đẩy lên.
  file: `apps/api/src/lo-trinh/san-pham.router.ts`
  severity: high
  Đề xuất: known-limits

- **Danh sách Cài đặt › Sản phẩm không hỏi lại trong khi tác nhân ghi trạng thái lấy ở nền (r1)**
  Người dùng thấy gì: Sau khi thêm sản phẩm, dòng sản phẩm cứ hiện «đang chờ lần lấy đầu» cho tới khi người dùng tải lại trang, dù nền đã lấy xong.
  Căn cứ: Chỉ gây hiểu nhầm nhẹ, tải lại trang là hết, không mất dữ liệu, và sửa không đắt.
  file: `apps/app/app/(app)/[slug]/settings/san-pham/san-pham-settings.tsx`
  severity: medium
  Đề xuất: known-limits

- **.env.example chỉ tới kịch bản github-gia-chay.ts không có trong kho (r1)**
  Người dùng thấy gì: Người tự cài đặt làm theo ghi chú sẽ tìm một tệp không tồn tại để lấy giá trị cấu hình mẫu.
  Căn cứ: Chỉ làm người cài đặt bực mình, không ảnh hưởng người dùng cuối và không mất dữ liệu, sửa rất rẻ.
  file: `.env.example`
  severity: low
  Đề xuất: known-limits

- **Luật «quản trị» chép tay ở trang Lộ trình thay vì dùng canManageSettings (r1)**
  Người dùng thấy gì: Nếu sau này đổi định nghĩa vai quản trị, nút mở Cài đặt › Sản phẩm trên trang Lộ trình có thể lệch với quyền thật.
  Căn cứ: Hiện chưa gây hậu quả nào cho người dùng, chỉ rủi ro khi sửa vai về sau, và quyền thật vẫn do máy chủ chặn.
  file: `apps/app/lib/lo-trinh/san-pham.ts`
  severity: low
  Đề xuất: wont-fix

- **Giá trị trạng thái lấy lạ trong DB bị nuốt thành «chua-lay» thay vì báo lỗi (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu dữ liệu trạng thái bị hỏng, sản phẩm hiện như «đang chờ lần lấy đầu» thay vì báo dữ liệu hỏng.
  Căn cứ: Chỉ xảy ra khi dữ liệu nội bộ bị lệch, không mất dữ liệu người dùng, chỉ che mất dấu hiệu lỗi.
  file: `packages/db/src/san-pham-lo-trinh.ts`
  severity: low
  Đề xuất: known-limits

- **Nhật ký service sản phẩm dùng chuỗi ghép thay vì một object có trường (r1)**
  Người dùng thấy gì: Người vận hành khó lọc nhật ký production theo người hay mã sản phẩm. Người dùng không thấy khác biệt.
  Căn cứ: Không ảnh hưởng người dùng cuối, chỉ làm tra cứu nhật ký kém tiện, nên không đáng mở việc riêng.
  file: `apps/api/src/lo-trinh/san-pham.service.ts`
  severity: low
  Đề xuất: wont-fix

- **Số nhân 4 và hằng API GitHub đặt rải trong tệp thay vì trong cấu hình LO_TRINH_SAN_PHAM (r1 · tệp đã đổi)**
  Người dùng thấy gì: Người muốn chỉnh các con số này phải biết tìm ở nhiều tệp. Người dùng không thấy khác biệt.
  Căn cứ: Chỉ là nợ gọn gàng của mã, không đổi hành vi, không mất dữ liệu.
  file: `apps/agent/agent/lib/lo-trinh-san-pham.ts`
  severity: low
  Đề xuất: wont-fix

- **Snapshot read error or corrupt snapshot shows as 'No roadmap yet' with status 'Fetched', and the error reason is thrown away (r1)**
  Người dùng thấy gì: Khi kho dữ liệu lỗi hoặc bản chụp lưu bị hỏng, trang báo «chưa có lộ trình» trong khi trạng thái ghi «đã lấy», hai câu mâu thuẫn và không để lại dấu vết vì sao.
  Căn cứ: Hiếm gặp và tải lại thường hết, nhưng người dùng sẽ bối rối và người vận hành khó tìm nguyên nhân.
  file: `apps/app/lib/lo-trinh/san-pham.ts`
  severity: medium
  Đề xuất: known-limits

- **Agent catch-all reports every exception as 'GitHub did not answer', keeps only the error name, and logs nothing (r1 · tệp đã đổi)**
  Người dùng thấy gì: Một lỗi lâu dài ở phía CRM sẽ hiện như «GitHub chưa trả lời, thử lại sau» và cứ thử lại mãi mà không ai biết nguyên nhân thật.
  Căn cứ: Không mất dữ liệu và bản chụp cũ vẫn hiện, nhưng lỗi thật bị che nên khó phát hiện và sửa.
  file: `apps/agent/agent/lib/lo-trinh-san-pham.ts`
  severity: medium
  Đề xuất: known-limits

- **An in-flight fetch can clear a source change the admin just made, so the old repository's data stays labelled as the new source (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu quản trị đổi kho đúng lúc nền đang lấy dữ liệu, trang có thể hiện dữ liệu kho cũ dưới tên kho mới và mất dòng «nguồn vừa đổi».
  Căn cứ: Hiếm gặp, chỉ sai tạm thời và tự hết khi lần lấy sau kịp, nhưng trong ca xấu dữ liệu cũ có thể ở lại lâu.
  file: `packages/db/src/san-pham-lo-trinh.ts`
  severity: low
  Đề xuất: known-limits

- **Return value of ghiBanChupLoTrinh is ignored: a rejected ('cu-hon') snapshot is still recorded as da-lay and the file is downloaded again every tick (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi nhánh bị đẩy lùi về commit cũ, trang vẫn giữ nội dung cũ mà Cài đặt ghi «đã lấy», và nền cứ tải lại tệp mỗi 5 phút mà không báo gì.
  Căn cứ: Là ca hiếm và đã khai là ngoài phạm vi, dữ liệu hiện vẫn đúng bản mới nhất đã biết, chỉ thiếu lời báo.
  file: `apps/agent/agent/lib/lo-trinh-san-pham.ts`
  severity: low
  Đề xuất: known-limits

- **Viewers sheet shows an endless skeleton when its query fails (r1)**
  Người dùng thấy gì: Nếu việc tải danh sách người xem lỗi, ngăn cứ hiện khung chờ mãi, không có thông báo và nút lưu bị khoá.
  Căn cứ: Chỉ gặp khi lỗi mạng hay đổi quyền giữa chừng, đóng và mở lại ngăn là thử được, không mất dữ liệu.
  file: `apps/app/app/(app)/[slug]/settings/san-pham/sheet-nguoi-xem.tsx`
  severity: low
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình (hình 4): B bị FORBIDDEN ở thủ tục chỉ quản trị mới gọi được, nên không đo quyền được cấp (r1)**
  Người dùng thấy gì: Bài kiểm nói thành viên không được cấp không đọc được sản phẩm, nhưng thực ra chỉ chứng minh thành viên không phải quản trị, nên bài sẽ xanh dù việc cấp quyền có hỏng.
  Căn cứ: Sản phẩm có thể vẫn đúng, nhưng lưới an toàn cho việc rò dữ liệu giữa thành viên yếu hơn vẻ ngoài.
  file: `apps/api/test/san-pham-lo-trinh.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình, không ghim thông điệp (hình 4): ma trận khai sai chỉ kiểm mã BAD_REQUEST, không kiểm đúng ô (r1)**
  Người dùng thấy gì: Bài kiểm không chứng minh lời báo lỗi chỉ đúng ô nhập sai, nên lỗi báo nhầm ô vẫn có thể lọt qua.
  Căn cứ: Người dùng chỉ gặp lời báo hơi sai chỗ nếu có hồi quy, không mất dữ liệu và tự sửa được.
  file: `apps/api/test/san-pham-lo-trinh.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình (hình 4): dòng o-*-2 của do-man không có đối chứng dương, chờ cả `main`, và người được cấp A không được đo (r1)**
  Người dùng thấy gì: Phép đo màn không chứng minh người được cấp quyền thật sự thấy sản phẩm, và một trang lỗi hay rỗng vẫn có thể bị tính là thành công.
  Căn cứ: Sản phẩm có thể vẫn đúng nhưng bằng chứng cho quyền xem theo sản phẩm chưa đủ chắc, bù được bằng một lần nghiệm thu tay.
  file: `_acceptance/lo-trinh-nhieu-san-pham/rang/do-man.mjs`
  severity: high
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình (hình 4): «sản phẩm đã lưu trữ không được lấy» chỉ đếm 0 lời gọi, không có đối chứng dương (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm có thể xanh chỉ vì nền không lấy gì cả, chứ không phải vì sản phẩm đã lưu trữ được bỏ qua.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, chỉ làm bài kiểm kém sức bắt lỗi.
  file: `apps/agent/test/lo-trinh-san-pham.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình (hình 4): «ghi một chiều trở lại» không chứng minh nhịp thứ ba đã thật sự kiểm nhánh (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm về việc giữ bản mới hơn khi nhánh lùi có thể xanh dù nền chưa từng kiểm nhánh.
  Căn cứ: Ca nhánh lùi đã khai ngoài phạm vi và hiếm, nên rủi ro cho người dùng thấp.
  file: `apps/agent/test/lo-trinh-san-pham.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Tuyên quét LỚP nhưng chỉ có điểm-case (hình 5): rò khoá chỉ dò một cửa sổ 20 ký tự cố định (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm chỉ dò một đoạn nhỏ của khoá riêng trong nhật ký, nên một đoạn khác bị lộ sẽ không bị bắt.
  Căn cứ: Chưa có dấu hiệu khoá bị lộ, nhưng nếu lộ thì hậu quả nặng và chỉ khắc phục được bằng cách đổi khoá.
  file: `apps/agent/test/lo-trinh-san-pham.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Tuyên quét LỚP nhưng chỉ có điểm-case (hình 5) và điều 2 không có chiều đỏ (hình 4): quet-khoa chỉ bắt đúng một cách viết header (r1)**
  Người dùng thấy gì: Phép quét chỉ bắt một vài cách viết việc dùng khoá cá nhân, nên một cách viết khác sẽ lọt mà không ai biết.
  Căn cứ: Hiện chưa có đường dùng khoá cá nhân nào được tìm thấy, nên chỉ là lưới bắt hẹp hơn lời tuyên.
  file: `_acceptance/lo-trinh-nhieu-san-pham/rang/quet-khoa.mjs`
  severity: medium
  Đề xuất: known-limits

- **Assert «có mặt» thay cho QUAN HỆ (hình 3): ngăn hồ sơ của sản phẩm chỉ kiểm có tiêu đề và có thẻ, không so với bản CRM (r1)**
  Người dùng thấy gì: Bài kiểm chỉ xác nhận ngăn hồ sơ có tiêu đề và thẻ, chưa chứng minh nó giống hệt ngăn hồ sơ của CRM.
  Căn cứ: Sản phẩm có thể vẫn đúng, chỉ thiếu bằng chứng so sánh, và có thể xem bằng mắt.
  file: `apps/app/test/lo-trinh-san-pham.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Assert «có mặt» thay cho QUAN HỆ giá trị (hình 3): tiến độ và số lộ trình hứa BẰNG khối gốc nhưng chỉ so tập tên tệp (r1)**
  Người dùng thấy gì: Phép đo không so con số tiến độ với dữ liệu gốc, nên tiến độ hiện sai vẫn có thể qua bài kiểm.
  Căn cứ: Chưa có bằng chứng tiến độ sai, nhưng nếu sai người xem sẽ tin nhầm số liệu và khó tự phát hiện.
  file: `_acceptance/lo-trinh-nhieu-san-pham/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Ma trận viết-trước thiếu phần tử (hình 5): form Thêm sản phẩm bỏ ca «tên sinh mã crm» của ma trận E8 (r1)**
  Người dùng thấy gì: Chưa có bài kiểm xác nhận form báo lỗi khi tên sinh ra mã «crm»; máy chủ vẫn chặn trường hợp này.
  Căn cứ: Ca rất hiếm và máy chủ đã chặn nên không mất dữ liệu, thêm một ca kiểm chỉ để đủ số.
  file: `apps/app/test/san-pham-lo-trinh.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **The Products settings list does not poll while the agent fills in fetch status in the background (r2)**
  Người dùng thấy gì: Sau khi thêm một sản phẩm, dòng sản phẩm cứ báo «Đang chờ lấy» cho tới khi quản trị tải lại trang, dù hệ thống đã lấy xong lộ trình.
  Căn cứ: Chỉ làm người xem tưởng chưa xong trong chốc lát, không mất dữ liệu và tải lại trang là thấy đúng; sửa rẻ nhưng không chặn việc dùng.
  file: `apps/app/app/(app)/[slug]/settings/san-pham/san-pham-settings.tsx`
  severity: medium
  Đề xuất: known-limits

- **The product service logs plain sentences instead of the field object the API logging rule requires (r2)**
  Người dùng thấy gì: Nhật ký máy chủ khi tạo hay sửa sản phẩm ghi thành câu văn thay vì các trường tách riêng, nên khó lọc khi tra sự cố.
  Căn cứ: Người dùng không thấy gì, không mất dữ liệu; chỉ làm việc tra nhật ký của người vận hành kém tiện.
  file: `apps/api/src/lo-trinh/san-pham.service.ts`
  severity: low
  Đề xuất: wont-fix

- **The server still lets an archived product be edited and its viewers changed (r2)**
  Người dùng thấy gì: Một quản trị gọi thẳng vào máy chủ vẫn sửa được sản phẩm đã lưu trữ hoặc đổi người xem của nó, dù trên màn các nút đó đã ẩn.
  Căn cứ: Chỉ quản trị mới làm được, màn hình bình thường không dẫn tới đó, và sửa lại được; hậu quả nhẹ.
  file: `apps/api/src/lo-trinh/san-pham.service.ts`
  severity: low
  Đề xuất: known-limits

- **The same product constants are declared twice, in the app's roadmap config and the shared package (r2)**
  Người dùng thấy gì: Một vài giá trị cố định như mã CRM và tên tệp lộ trình được khai ở hai nơi; hiện chúng đang khớp nhau nên người dùng không thấy khác biệt.
  Căn cứ: Không ảnh hưởng người dùng lúc này; chỉ có nguy cơ lệch nhau nếu sau này ai đó đổi một nơi mà quên nơi kia.
  file: `apps/app/lib/lo-trinh/cau-hinh.ts`
  severity: low
  Đề xuất: wont-fix

- **The background fetch turns every error into 'GitHub did not answer', keeps only the error name, and logs nothing (r2 · tệp đã đổi)**
  Người dùng thấy gì: Nếu khoá của ứng dụng GitHub đặt sai, sản phẩm cứ báo «GitHub chưa trả lời, sẽ thử lại» mãi và không để lại dấu vết nào cho người vận hành biết lỗi thật.
  Căn cứ: Không mất dữ liệu và lộ trình CRM vẫn chạy, nhưng người cài sẽ mất thời gian đoán lỗi; chỉ gặp một lần lúc cài đặt nên chấp nhận được tạm.
  file: `apps/agent/agent/lib/lo-trinh-san-pham.ts`
  severity: medium
  Đề xuất: known-limits

- **An unreadable or corrupt product snapshot is shown as 'no roadmap yet', with no log (r2)**
  Người dùng thấy gì: Nếu bản lộ trình đã lưu của một sản phẩm bị lỗi khi đọc, trang chỉ báo «chưa có lộ trình» và vẫn ghi «Đã lấy», nên người xem tưởng sản phẩm chưa có gì.
  Căn cứ: Tình huống hiếm, không mất dữ liệu gốc và không ảnh hưởng CRM; chỉ gây hiểu lầm ngắn cho người xem.
  file: `apps/app/lib/lo-trinh/san-pham.ts`
  severity: medium
  Đề xuất: known-limits

- **The viewers sheet shows a skeleton forever when loading viewers fails (r2)**
  Người dùng thấy gì: Nếu không tải được danh sách người xem (ví dụ bị đổi quyền hoặc sản phẩm vừa bị xoá), ngăn cứ hiện khung chờ mãi, không báo lỗi và không có nút thử lại.
  Căn cứ: Chỉ xảy ra khi có lỗi hiếm, đóng ngăn rồi mở lại là thử lại được và không mất dữ liệu.
  file: `apps/app/app/(app)/[slug]/settings/san-pham/sheet-nguoi-xem.tsx`
  severity: medium
  Đề xuất: known-limits

- **An 'older commit' result from ghiBanChupLoTrinh is ignored, and the status still says Fetched (r2 · tệp đã đổi)**
  Người dùng thấy gì: Khi nhánh của sản phẩm bị đưa về một commit cũ hơn, trang vẫn hiện lộ trình của commit mới hơn và báo «Đã lấy», không cho quản trị biết trang đã lệch nhánh.
  Căn cứ: Hợp đồng đã chủ động loại trường hợp này; hiếm gặp và không mất dữ liệu.
  file: `apps/agent/agent/lib/lo-trinh-san-pham.ts`
  severity: low
  Đề xuất: known-limits

- **A mistyped repository is reported as 'app not installed', never as 'repository not found' (r2)**
  Người dùng thấy gì: Nếu quản trị gõ sai tên kho, màn Cài đặt bảo cài ứng dụng GitHub vào kho thay vì bảo kiểm tra lại tên kho.
  Căn cứ: Chỉ gợi ý sai một chút, người dùng tự sửa được sau khi thử; không mất dữ liệu.
  file: `apps/agent/agent/lib/lo-trinh-github.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (kiểm âm tính đứng một mình): dòng o-*-2 chỉ kiểm người không được cấp, người được cấp A dựng ra rồi bỏ không dùng (r2)**
  Người dùng thấy gì: Phép đo màn chỉ kiểm người không được cấp không thấy sản phẩm, chưa kiểm người được cấp thấy được; nếu sản phẩm bị ẩn với mọi người thì phép đo vẫn báo đạt.
  Căn cứ: Không phải lỗi người dùng gặp mà là lưới kiểm lỏng; các bài kiểm khác có thể phủ chiều được cấp, sửa phép đo khá rẻ.
  file: `_acceptance/lo-trinh-nhieu-san-pham/rang/do-man.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (kiểm âm tính đứng một mình): B nhận FORBIDDEN từ thủ tục nguoiXem vốn chặn mọi người không phải quản trị, không liên quan đến quyền được cấp (r2)**
  Người dùng thấy gì: Bài kiểm quyền xem dùng một thủ tục vốn chặn mọi thành viên, nên nó không chứng minh được việc cấp quyền cho một người có tác dụng.
  Căn cứ: Người dùng không bị ảnh hưởng; chỉ làm bằng chứng kiểm thử yếu hơn lời hứa, bổ sung bài kiểm là rẻ.
  file: `apps/api/test/san-pham-lo-trinh.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chỉ kiểm có mặt trong khi lời hứa là quan hệ): ma trận khai sai chỉ kiểm mã BAD_REQUEST, không kiểm lỗi trỏ đúng ô (r2)**
  Người dùng thấy gì: Bài kiểm khai sai chỉ xác nhận máy chủ từ chối, chưa xác nhận lời báo lỗi chỉ đúng ô nhập sai.
  Căn cứ: Nếu lời báo lệch ô thì người dùng chỉ bối rối ngắn, tự sửa được; nhẹ và rẻ để bổ sung bài kiểm.
  file: `apps/api/test/san-pham-lo-trinh.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét cả lớp nhưng chỉ có một điểm): «không chuỗi 20 ký tự nào của khoá riêng» chỉ được kiểm bằng một cửa sổ cố định (r2 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm chỉ dò một đoạn của khoá riêng trong nhật ký và dữ liệu lưu, nên một phần khác của khoá bị rò thì bài kiểm sẽ không bắt được.
  Căn cứ: Khoá lộ là hậu quả nặng nếu xảy ra, nhưng hiện chưa thấy rò thật; sửa bài kiểm rẻ nên nên làm sớm.
  file: `apps/agent/test/lo-trinh-san-pham.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chỉ kiểm có mặt trong khi lời hứa là quan hệ): AC-1-lo-trinh chỉ so tập tệp, không so tiến độ với tien_do của khối (r2)**
  Người dùng thấy gì: Phép đo màn chỉ xác nhận mọi lộ trình xuất hiện, chưa xác nhận ô tiến độ đúng với dữ liệu; tiến độ sai hoặc để trống vẫn có thể qua.
  Căn cứ: Chưa có dấu hiệu trang hiện sai tiến độ; đây là lưới kiểm lỏng, sửa vừa phải.
  file: `_acceptance/lo-trinh-nhieu-san-pham/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét cả lớp nhưng chỉ có một điểm): quét «khoá cá nhân» chỉ bắt đúng một cách viết header (r2)**
  Người dùng thấy gì: Công cụ quét tìm chỗ dùng khoá cá nhân của người chỉ nhận ra một cách viết, nên cách viết khác có thể lọt nếu ai đó thêm sau này.
  Căn cứ: Hiện chưa có chỗ nào dùng khoá cá nhân; rủi ro chỉ ở tương lai và người rà code còn bắt được.
  file: `_acceptance/lo-trinh-nhieu-san-pham/rang/quet-khoa.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (kiểm âm tính đứng một mình): sản phẩm đã lưu trữ «0 lời gọi GitHub» mà không có sản phẩm lành cùng nhịp (r2 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm sản phẩm đã lưu trữ không có sản phẩm bình thường cùng nhịp để chứng tỏ nhịp thật sự đã chạy, nên có thể xanh dù nhịp không làm gì.
  Căn cứ: Không ảnh hưởng người dùng; các bài khác trong tệp đã chạy nhịp thật nên rủi ro bỏ sót thấp.
  file: `apps/agent/test/lo-trinh-san-pham.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (kiểm âm tính đứng một mình): «không chứa tên sản phẩm» trên nội dung do bài tự ghép từ dữ liệu CRM (r2)**
  Người dùng thấy gì: Bài kiểm trang không lộ tên sản phẩm cho người không có quyền tự dựng dữ liệu không bao giờ chứa tên đó, nên nó không chứng minh được gì thêm.
  Căn cứ: Không ảnh hưởng người dùng; việc không lộ tên đã được kiểm ở tầng máy chủ và phép đo màn.
  file: `apps/app/test/lo-trinh-san-pham.dom.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
