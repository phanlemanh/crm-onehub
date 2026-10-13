# Review findings: viec-chung

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Xoá việc làm mới viec.get của chính việc vừa xoá, nên khung đang đóng đọc phải 404 (trái luật cache.removed)**
  Người dùng thấy gì: Khi người giao xoá một việc, khung việc đang trượt đóng có thể thoáng báo lỗi «không tìm thấy». Việc vẫn bị xoá đúng, chỉ là lỗi hiện ra ngắn ngủi.
  file: `apps/app/components/viec/khung-viec.tsx`
  severity: medium
  Đề xuất: known-limits

- **«Chuyển việc 30 ngày» nay chuyển cả Viec nhưng cache.workTransferred không làm mới truy vấn viec.* và Tổng quan**
  Người dùng thấy gì: Sau khi quản trị chuyển việc của một người sang người khác, màn «Việc của tôi» và Tổng quan của người nhận có thể vẫn hiện số liệu cũ khoảng nửa phút. Tải lại trang là thấy đúng. Tương tự khi xoá vĩnh viễn công ty, cá nhân hay thoả thuận.
  file: `apps/app/lib/trpc/cache.ts`
  severity: medium
  Đề xuất: known-limits

- **chayNhac nuốt lỗi mã hoá mục vào daGui làm lệch số thứ tự mà «xong n» dựa vào**
  Người dùng thấy gì: Nếu một dòng trong tin nhắc buổi sáng bị hỏng dữ liệu, các dòng sau đó bị đánh số lệch so với tin người dùng thấy. Khi họ trả lời «xong 3», hệ thống có thể đóng nhầm việc khác. Chỉ xảy ra khi dữ liệu một mục bị hỏng.
  file: `apps/agent/agent/lib/nhac-ke-hoach.ts`
  severity: medium
  Đề xuất: known-limits

- **nguonCua tự kiểm chuỗi nguồn bằng tay, chép lại danh sách NGUON_VIEC thay vì parse ở module sở hữu shape**
  Người dùng thấy gì: Danh sách các nguồn tạo việc (web, Zalo, API, chuyển việc) được chép ở hai chỗ. Hôm nay không ảnh hưởng gì, nhưng sau này thêm một nguồn mới mà quên sửa chỗ còn lại thì lịch sử việc sẽ báo lỗi.
  file: `apps/api/src/viec/viec.service.ts`
  severity: low
  Đề xuất: wont-fix

- **chayNhac bỏ mục mã hoá hỏng khỏi daGui làm lệch số thứ tự, «xong n» có thể đóng nhầm việc hay bước**
  Người dùng thấy gì: Nếu một mục trong tin nhắc bị hỏng dữ liệu, số thứ tự các dòng sau lệch đi một. Người dùng trả lời «xong 5» có thể đóng nhầm việc hoặc bước thứ 6, và hệ thống không báo gì.
  file: `apps/agent/agent/lib/nhac-ke-hoach.ts`
  severity: medium
  Đề xuất: known-limits

- **Chuyển việc ở màn Thành viên không làm mới cache của Việc và Tổng quan**
  Người dùng thấy gì: Sau khi chuyển việc ở màn Thành viên, các màn Việc của tôi, khối Việc trên thẻ bản ghi và Tổng quan có thể hiện người thực hiện cũ tới khoảng 30 giây. Tải lại là đúng.
  file: `apps/app/lib/trpc/cache.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): ba «ca người xem» và nút Xoá của E4b là quyen gõ tay, không lấy từ phép tính quyen thật của viec.get**
  Người dùng thấy gì: Bài kiểm tra việc hiện đúng nút theo vai người xem dùng dữ liệu gõ tay, nên chưa chứng minh được người giao, người thực hiện, người xem thấy đúng bộ nút. Sản phẩm có thể vẫn đúng nhưng chưa được kiểm tra chắc.
  file: `apps/app/test/viec-khung.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính đứng một mình): sàn thiết kế E13b chỉ chạy chiều xanh, không có đối chứng dương nào chứng tỏ bộ quét bắt được vi phạm**
  Người dùng thấy gì: Bộ kiểm tra giao diện có dùng đúng bo góc và màu hay không chưa từng được thử với một ca vi phạm cố ý, nên báo «sạch» có thể chưa đáng tin. Người dùng không thấy khác biệt.
  file: `_acceptance/viec-chung/rang/san-thiet-ke.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận khai 70 ô nhưng có ô rỗng nghĩa): 5 ô cuaBanGhi × việc riêng R không thể đỏ dưới bất kỳ lỗi xem nào**
  Người dùng thấy gì: Bài kiểm tra quyền xem việc báo phủ 70 tình huống nhưng 5 tình huống trong đó không thể phát hiện lỗi. Độ phủ thật thấp hơn con số báo, còn quyền xem của người dùng không bị ảnh hưởng.
  file: `apps/api/test/viec-quyen.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): lời 400 «chỉ OKR» chỉ được kiểm bằng tiền tố tên chung, không ghim đúng người vai okr**
  Người dùng thấy gì: Bài kiểm tra lời từ chối khi giao việc cho người chỉ dùng OKR không phân biệt được nếu lời lỗi nêu nhầm tên người. Nếu có lỗi như vậy, người dùng sẽ thấy tên sai trong thông báo.
  file: `apps/api/test/viec-quyen.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính đứng một mình): «tin Slack tới vai okr không mang tên đối tác» không có đối chứng dương trên kênh Slack**
  Người dùng thấy gì: Chưa có bài kiểm tra chứng minh tin nhắc qua Slack vẫn hiện tên đối tác cho người được phép. Việc ẩn tên với người chỉ dùng OKR có thể được báo đạt khi thật ra kênh Slack chưa được thử kỹ.
  file: `apps/agent/test/nhac-viec.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): «nhắc việc dùng luật vai của DA0a» đo bằng grep chuỗi import và chuỗi lời gọi trong mã nguồn**
  Người dùng thấy gì: Việc nhắc việc dùng đúng luật vai chỉ được kiểm bằng cách tìm chữ trong mã, không bằng chạy thật. Hành vi thật đã được kiểm ở chỗ khác nên rủi ro cho người dùng thấp.
  file: `apps/agent/test/nhac-viec.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay): ca «51 việc xong cắt 50 theo việc khép gần nhất» chèn thẳng bảng viec với khepLuc tự đặt, không đi qua doiTrangThai**
  Người dùng thấy gì: Thứ tự các việc đã xong trong Việc của tôi được kiểm bằng dữ liệu gõ tay chứ không bằng việc thật vừa đóng. Nếu lúc đóng việc quên ghi thời điểm, bài kiểm tra vẫn xanh.
  file: `apps/api/test/viec-cua-toi.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): bước 1 của E13 chỉ kiểm «có một dòng mang data-tone=error», không kiểm đó là dòng quá hạn**
  Người dùng thấy gì: Phép kiểm màn Việc của tôi chỉ xác nhận có một dòng đỏ, chưa xác nhận đó đúng là dòng quá hạn. Nếu dòng hạn hôm nay đỏ mà dòng quá hạn không đỏ, phép kiểm vẫn báo đạt.
  file: `_acceptance/viec-chung/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/14 lỗi rơi vào file không bộ đo nào phủ (apps/app/lib/trpc/cache.ts, _acceptance/viec-chung/rang/san-thiet-ke.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
