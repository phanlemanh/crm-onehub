# Review findings: hop-tuan-tren-bang (round 2)

## Trong hợp đồng

Không có phát hiện nào trong hợp đồng còn mở ở round này. Phát hiện AC-4 của round trước (dòng KR vừa gửi mất khỏi Còn lại đang gập, mất focus) đã sửa ở f5bcf73dd và các eval E4, E7, E11 đều đạt.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

Không có mục mới ở round này. Mười hai mục của round trước được máy chuyển sang, mang nhãn (r1), không in lại ở đây.

- **The hopTuanOutput response schema was loosened with .default() so that old test fixtures still parse (r1)**
  Người dùng thấy gì: Hiện bảng Họp tuần vẫn hiện đúng ghi chú và mức đổi. Nhưng nếu sau này máy chủ lỡ bỏ sót một trường, màn hình sẽ lặng lẽ hiện «Chưa cập nhật» hay ô đơn vị trống thay vì báo lỗi.
  Căn cứ: Hôm nay người dùng không thấy gì sai, rủi ro chỉ xuất hiện khi có lỗi khác về sau; sửa buộc phải đụng bài kiểm đã ký nên đắt, nên ghi lại để người ký quyết.
  file: `apps/api/src/okr/okr-xem.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **giaTri moved to gia-tri-kr.ts but bang-kr.tsx still re-exports it, and theo-don-vi/bang.tsx still imports it from the old place (r1)**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào. Chỉ là mã còn hai đường nhập cho cùng một hàm, dễ lệch về sau.
  Căn cứ: Không ảnh hưởng gì tới màn hình hay dữ liệu, và sửa sau rất rẻ khi có người chạm vào vùng này.
  file: `apps/app/app/(app)/[slug]/okr/bang-kr.tsx`
  severity: low
  Đề xuất: known-limits

- **muc-doi.tsx adds a third ngayThang (YYYY-MM-DD to DD/MM) for the OKR area when cap-nhat-tuan.tsx already exports one (r1)**
  Người dùng thấy gì: Người dùng không gặp gì. Ngày vẫn hiện đúng dạng dd/mm; chỉ có nguy cơ ba bản hàm đổi ngày lệch nhau về sau.
  Căn cứ: Không có hậu quả nhìn thấy được, không mất dữ liệu, và gộp lại sau rất rẻ.
  file: `apps/app/app/(app)/[slug]/okr/hop-tuan/muc-doi.tsx`
  severity: low
  Đề xuất: known-limits

- **Moving to the next or previous KR in board order keeps the first KR's objective underneath, so the back button opens the wrong objective (r1)**
  Người dùng thấy gì: Trưởng đơn vị đi họp bấm sang KR kế thuộc mục tiêu khác, rồi bấm «Về khung mục tiêu» thì mở nhầm mục tiêu của KR đầu tiên, không phải mục tiêu của KR đang xem.
  Căn cứ: Không mất dữ liệu và người dùng tự thoát được bằng cách đóng ngăn rồi mở lại, nhưng lỗi dễ gặp khi họp qua nhiều mục tiêu và gây khó hiểu giữa buổi họp.
  file: `apps/app/components/crm/record-sheet/kr-sheet.tsx`
  severity: medium
  Đề xuất: new-contract

- **Schema đầu ra dongHop nới bằng .default() để mồi thử cũ thiếu khoá vẫn parse — trái luật «schema tả cái thật sự có» (r1)**
  Người dùng thấy gì: Màn Họp tuần vẫn hiện đúng cho người dùng. Chỉ là nếu sau này máy chủ lỡ thiếu thông tin đơn vị của một KR, màn sẽ hiện trống thay vì báo lỗi rõ ràng.
  Căn cứ: Người dùng không gặp hậu quả nào hôm nay vì dữ liệu luôn đầy đủ; chỉ làm khó phát hiện lỗi sau này, và sửa lúc này buộc phải đụng bài kiểm đã ký.
  file: `apps/api/src/okr/okr-xem.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **Làm mới cache bằng cách liệt khoá okr.hopTuan ngay ở chỗ gọi, thay vì qua useCrmCache, và trùng với lần làm mới cache.okr đã có (r1 · tệp đã đổi)**
  Người dùng thấy gì: Sau khi cập nhật một KR, bảng Họp tuần bị tải lại hai lần thay vì một. Người dùng chỉ có thể thấy bảng cập nhật chậm hơn một chút.
  Căn cứ: Nhẹ: dữ liệu cuối cùng vẫn đúng, không mất gì, chỉ tốn thêm một lượt tải; sửa thì động vào cách làm mới chung nên không đáng.
  file: `apps/app/app/(app)/[slug]/okr/hop-tuan.tsx`
  severity: medium
  Đề xuất: wont-fix

- **ngayThang viết lại hàm đã export ở cap-nhat-tuan.tsx (r1)**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào; ngày tháng trên bảng vẫn hiện đúng.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; chỉ là dọn mã cho gọn, làm sau cũng rẻ nên không cần mở việc riêng.
  file: `apps/app/app/(app)/[slug]/okr/hop-tuan/muc-doi.tsx`
  severity: low
  Đề xuất: wont-fix

- **Chuyển giaTri sang gia-tri-kr.ts nhưng vẫn re-export ở bang-kr, để lại hai đường import (r1)**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào; các con số trên bảng vẫn in đúng.
  Căn cứ: Không có hậu quả nào với người dùng; chỉ là dọn mã, sửa lúc nào cũng rẻ.
  file: `apps/app/app/(app)/[slug]/okr/bang-kr.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (âm tính một mình, đối chứng dương rỗng): «trước khi gửi Còn lại gập» được đo bằng việc phần Còn lại KHÔNG tồn tại (r1 · tệp đã đổi)**
  Người dùng thấy gì: Một lỗi sau này khiến phần «Còn lại» luôn mở sẵn có thể lọt qua bài kiểm mà không ai biết. Hôm nay người dùng thấy đúng.
  Căn cứ: Không gây hại cho người dùng ngay; chỉ làm lưới an toàn thủng một lỗ, và việc này vẫn có thể bổ sung sau khi gộp.
  file: `apps/app/test/hop-tuan-tren-bang.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không đối chứng dương): «đóng ngăn thì URL hết tham số nguồn» chỉ kiểm khoá chữ cứng `thuTuKr` vắng mặt, chưa từng kiểm nó có mặt (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu sau này đổi cách ghi nhớ nguồn mở ngăn, bài kiểm vẫn xanh dù ngăn có thể đi sai thứ tự. Hôm nay người dùng không thấy lỗi.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, tự khắc phục được bằng tải lại trang; chỉ là kiểm thử yếu.
  file: `apps/app/test/hop-tuan-tren-bang.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (đối chứng dương rỗng): DOI CHUNG DEM ở khổ 375 nhân bản một ghi chú đang hiện, nên luôn đếm ra 2 (r1)**
  Người dùng thấy gì: Phép đo trên màn điện thoại không chứng minh được rằng mỗi ghi chú chỉ hiện một lần. Người dùng điện thoại vẫn thấy đúng, nhưng bằng chứng yếu hơn.
  Căn cứ: Không gây hại cho người dùng; chỉ làm bằng chứng ở khổ 375 kém chắc, có thể bổ sung sau.
  file: `_acceptance/hop-tuan-tren-bang/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): ca «bảng một KR thì không có đếm, không có ‹ ›» chỉ kiểm vắng mặt dưới `[data-dau-ngan-kr]`, không ghim đầu ngăn có mặt (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu đầu ngăn KR không dựng được, bài kiểm vẫn có thể báo đạt. Người dùng hiện không gặp lỗi.
  Căn cứ: Không ảnh hưởng người dùng hôm nay; chỉ làm bài kiểm kém chắc cho trường hợp bảng chỉ có một KR.
  file: `apps/app/test/hop-tuan-tren-bang.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
