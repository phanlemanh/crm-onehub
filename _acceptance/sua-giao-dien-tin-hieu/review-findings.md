# Review findings — sua-giao-dien-tin-hieu (round 2)

## Trong hợp đồng

Không có finding nào trong hợp đồng ở vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Câu lỗi mới gán nguyên nhân «mạng hoặc máy chủ gián đoạn» cho cả những lỗi không phải lỗi mạng**
  Người dùng thấy gì: Nếu tín hiệu đã bị xoá ở một tab khác hoặc phiên đăng nhập đã hết hạn, người dùng vẫn thấy câu «mạng hoặc máy chủ đang gián đoạn, thử lại» dù nguyên nhân khác, và thử lại sẽ không giúp được gì. Chỉ xảy ra ở các ca hiếm này; ca đội sản phẩm đã lấy về và ca mất mạng vẫn báo đúng.
  file: `apps/app/lib/messages/tin-hieu.ts`
  severity: medium
  Đề xuất: known-limits

- **Delete-failure copy now claims a network or server outage for every non-409 error, including 404 (signal already deleted)**
  Người dùng thấy gì: Khi tín hiệu đã bị xoá ở nơi khác, người dùng được báo sai là mạng gián đoạn trong khi dòng đó thực ra đã biến mất khỏi danh sách. Tương tự với người đã hết phiên đăng nhập khi bấm Gửi. Chỉ là câu báo chưa đúng nguyên nhân ở các ca hiếm, không làm mất dữ liệu.
  file: `apps/app/lib/messages/tin-hieu.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay theo khuôn bên đọc): bài DOM «sgt-cau-sau-gom» tự điền khongDich: true thay vì lấy từ bộ dựng trạng thái, nên vế translate="no" của E14 không đo đầu ra thật**
  Người dùng thấy gì: Việc đánh dấu «không dịch» cho tên nhóm, lý do và tên việc hiện chưa được bài kiểm tự động kiểm bằng dữ liệu thật. Nếu sau này có thay đổi làm mất dấu đó, trình trình duyệt có thể tự dịch tên người dùng đặt mà không bài kiểm nào báo.
  file: `apps/app/test/sua-giao-dien-tin-hieu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Second Zod schema for the roadmap JSON in apps/app; a parse failure is silently turned into an empty Map (r1)**
  Người dùng thấy gì: Nếu dữ liệu lộ trình bị hỏng, trang vẫn hiện câu gốc của đội sản phẩm thay vì câu song ngữ, và không ai được báo vì sao. Người gửi chỉ thấy câu trạng thái bằng một thứ tiếng.
  file: `apps/app/lib/tin-hieu/trang-thai.ts`
  severity: medium
  Đề xuất: known-limits

- **Boundary check measures the diff against origin/onehub, so after the merge it passes with 0 files checked (r1)**
  Người dùng thấy gì: Sau khi bản này được gộp, phép kiểm không đụng tới phần dùng chung có thể báo xanh mà không kiểm tra gì. Người dùng không thấy ngay, nhưng một thay đổi lỡ chạm vào phần dùng chung sau này có thể lọt qua.
  file: `_acceptance/sua-giao-dien-tin-hieu/rang/ranh-gioi.mjs`
  severity: low
  Đề xuất: known-limits

- **Hop xac nhan xoa luon chan tra tieu diem: bam «Giu lai» hay xoa hong thi tieu diem roi ve body (r1)**
  Người dùng thấy gì: Người dùng bàn phím hoặc trình đọc màn hình bấm «Giữ lại» hay gặp lỗi khi xoá sẽ mất chỗ đang đứng và phải dò lại từ đầu trang.
  file: `apps/app/components/tin-hieu/danh-sach-tin-hieu.tsx`
  severity: medium
  Đề xuất: new-contract

- **Bam «Bo» o hop hoi lai khong xoa chu da nhap: mo lai hop van con nguyen hai o (r1)**
  Người dùng thấy gì: Bấm «Bỏ» khi được hỏi có muốn bỏ những gì vừa nhập, rồi mở lại hộp, người gửi vẫn thấy chữ cũ còn nguyên dù câu hỏi đã báo là sẽ mất.
  file: `apps/app/components/tin-hieu/nut-gui-tin-hieu.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (khẳng định «chuỗi có mặt» thay cho quan hệ) — so aria-describedby với id bằng toContain, rỗng khớp rỗng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu sau này liên kết giữa nút Gửi và dòng báo lỗi bị mất, bài kiểm hiện tại có thể không phát hiện. Hiện người dùng chưa gặp lỗi nào.
  file: `apps/app/test/sua-giao-dien-tin-hieu.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc) — lỗi tRPC giả là một class tự viết đúng đường `data.httpStatus` mà mã đọc (r1 · tệp đã đổi)**
  Người dùng thấy gì: Các bài kiểm câu báo «đã quá số lần gửi hôm nay» và «đội sản phẩm đã lấy về» dùng lỗi giả tự dựng, nên chưa chứng minh đường lỗi thật từ máy chủ hiện đúng câu. Lỗi thật có thể vẫn hiện sai mà bài kiểm không thấy.
  file: `apps/app/test/sua-giao-dien-tin-hieu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (thông điệp ghim không thật sự ghim) — phá-thử E9b ghim «dong da lay ve», chuỗi này nằm sẵn trong tên test (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bản ghi phá-thử cho thấy bài kiểm dòng đã được đội sản phẩm lấy về bắt được lỗi, nhưng bằng chứng yếu hơn vẻ ngoài. Người dùng không bị ảnh hưởng trực tiếp.
  file: `_acceptance/sua-giao-dien-tin-hieu/rang/pha-thu.py`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng bỏ sót) — quét chữ nội bộ của AC-9 bỏ qua khoá cauSauGom, nơi chứa câu trạng thái CRM mới tự viết (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép quét từ nội bộ chưa kiểm các câu trạng thái mới trên trang Tín hiệu đã gửi. Hiện chưa có câu nào dùng từ khó hiểu, nhưng sau này có thể lọt.
  file: `apps/app/test/sua-giao-dien-tin-hieu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên lớp nhưng chỉ đo một điểm) — răng ranh giới tuyên «bài của LT2 không bớt khẳng định» nhưng chỉ đếm một tệp, trong khi vòng này làm yếu một tệp kiểm khác của LT2 (r1)**
  Người dùng thấy gì: Một bài kiểm cũ của tính năng gửi tín hiệu đã bị nới lỏng mà phép kiểm ranh giới không báo. Người dùng chưa thấy khác biệt, nhưng một lỗi cũ có thể lọt lại khó phát hiện hơn.
  file: `_acceptance/sua-giao-dien-tin-hieu/rang/ranh-gioi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính một mình) — ma trận chỗ của LT2 chỉ còn kiểm «câu không phải câu kit», không kiểm câu là gì (r1)**
  Người dùng thấy gì: Bài kiểm câu trạng thái chỉ chắc rằng câu khác câu gốc, chứ không chắc đúng nội dung. Một câu sai ngôn ngữ hay sai tên nhóm có thể qua bài này.
  file: `apps/app/test/tin-hieu-trang-thai.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận không viết trước) — danh sách màn được miễn của quét tên màn lấy từ chính mã đang bị kiểm (r1)**
  Người dùng thấy gì: Nếu có người thêm một màn vào danh sách miễn, màn đó sẽ hiện đường dẫn thô thay vì tên màn mà bài kiểm vẫn xanh. Hiện mọi màn đều có tên.
  file: `apps/app/test/ten-man.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra) — cỡ chạm của nút trên điện thoại đo bằng nhãn data-size, không đo lớp hay kích thước thật của phần tử (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm nhanh chỉ đọc nhãn cỡ nút, nên nếu ai đó thu nhỏ nút ⋮ trên điện thoại thì bài này không thấy. Phép đo trên màn thật vẫn bắt được.
  file: `apps/app/test/sua-giao-dien-tin-hieu.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên lớp nhưng chỉ đo một điểm) — hộp xoá chỉ kiểm vắng một trong hai dòng khác (r1 · tệp đã đổi)**
  Người dùng thấy gì: Hộp hỏi lại trước khi xoá chỉ được kiểm là không lẫn nội dung của một dòng khác trong ba dòng. Khả năng hộp lẫn tiêu đề dòng kia là rất thấp.
  file: `apps/app/test/sua-giao-dien-tin-hieu.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
