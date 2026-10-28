# Review findings: cua-toi-chi-liet-kr (round 1)

## Trong hợp đồng

(không có finding nào map được vào AC)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **New route builder hardcodes OKR paths instead of using the DUONG table, so it slips past the tbo-lien-ket guard**
  Người dùng thấy gì: Đường dẫn tới bộ OKR được viết lặp ở một chỗ mới nên bài kiểm tự động quét liên kết không soi tới nó. Người dùng bấm KR vẫn tới đúng nơi, nhưng nếu sau này ai đó sửa đường dẫn thì lỗi có thể lọt mà không ai biết.
  Căn cứ: Hiện tại người dùng không bị ảnh hưởng gì, chỉ là lưới an toàn cho lần sửa sau mỏng hơn, và có thể bổ sung sau với chi phí thấp.
  file: `apps/app/lib/okr-duong-kr.ts`
  severity: medium
  Đề xuất: known-limits

- **giaiDichKr swallows every error with no log**
  Người dùng thấy gì: Khi máy chủ gặp sự cố, người dùng bấm một KR sẽ bị đưa về Của tôi với thông báo không thấy KR, giống như KR đã bị xoá. Người vận hành cũng không có dòng nhật ký nào để biết máy chủ đang hỏng.
  Căn cứ: Không mất dữ liệu và người dùng tải lại hoặc thử lại sau khi hệ thống ổn là xong, nhưng thông báo dễ gây hiểu nhầm trong lúc sự cố nên nên ghi vào các hạn chế đã biết.
  file: `apps/app/lib/okr-duong-kr.ts`
  severity: low
  Đề xuất: known-limits

- **ngayVN copied verbatim from cap-nhat-tuan.tsx with the timezone hardcoded again**
  Người dùng thấy gì: Nhãn ngày lần cập nhật trước ở Của tôi dùng một bản sao của cách định dạng ngày. Hiện hai nơi cho kết quả giống nhau, chỉ có nguy cơ lệch nếu sau này đổi múi giờ.
  Căn cứ: Không ảnh hưởng người dùng hôm nay, và nếu có lệch thì chỉ là một nhãn ngày, sửa sau rất rẻ.
  file: `apps/app/app/(app)/[slug]/okr/phan-can-cap-nhat.tsx`
  severity: low
  Đề xuất: wont-fix

- **Code orphaned after removing «Đang theo dõi» and `?tu=`**
  Người dùng thấy gì: Một số đoạn mã và nhãn chữ của mục Đang theo dõi cũ vẫn nằm lại dù không còn hiện ra. Người dùng không thấy gì khác.
  Căn cứ: Không ảnh hưởng người dùng, chỉ để lại mã chết; nên gom vào việc dọn dẹp riêng đã được hợp đồng hoãn.
  file: `apps/app/app/(app)/[slug]/okr/nhom-da-bo.tsx`
  severity: low
  Đề xuất: new-contract

- **giaiDichKr swallows every viTriKr error with no log, so a broken API looks the same as "KR not found"**
  Người dùng thấy gì: Khi máy chủ gặp sự cố, mọi lần bấm KR hay bấm tin nhắc 08:30 đều rơi về Của tôi thay vì tới đúng bộ OKR, không báo lỗi gì. Người dùng tưởng KR biến mất còn đội vận hành không có dấu vết để tra.
  Căn cứ: Chỉ xảy ra khi hệ thống đang sự cố, không mất dữ liệu và người dùng bấm lại được sau khi hệ thống ổn, nhưng lúc sự cố sẽ khó chẩn đoán.
  file: `apps/app/lib/okr-duong-kr.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp, chỉ có điểm-case): E7 ctlk-nhac-dong hứa ma trận 2 người × 2 kênh nhưng chỉ đo đường chéo**
  Người dùng thấy gì: Tin nhắc 08:30 qua Zalo cho người nhiều KR và qua Slack cho người một KR chưa được kiểm thử trọn vẹn từ đầu đến cuối. Nếu hai trường hợp này có lỗi thì người dùng có thể nhận liên kết sai mà không ai phát hiện sớm.
  Căn cứ: Không có bằng chứng liên kết đang sai, chỉ là việc kiểm chưa đủ rộng; nếu lỗi xảy ra thì người dùng chỉ cần mở Của tôi bằng tay, không mất dữ liệu.
  file: `apps/agent/test/ctlk-nhac-dong.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): chiều đỏ con-bang của E1 cài một dấu giả, bộ chọn ST-capnhat- chưa bao giờ được chứng minh là bắt được**
  Người dùng thấy gì: Bài kiểm xác nhận Của tôi không còn bảng cập nhật hàng loạt chưa được chứng minh là sẽ bắt được bảng thật nếu nó quay lại. Người dùng có thể thấy lại bảng cũ mà bài kiểm vẫn báo xanh.
  Căn cứ: Hiện không có dấu hiệu bảng cũ còn tồn tại và bảng quay lại là điều hiếm, nên rủi ro thấp; cần ghi nhận rằng bài kiểm này yếu hơn lời hứa.
  file: `_acceptance/cua-toi-chi-liet-kr/rang/hai-chieu.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert «chuỗi có mặt» trong khi lời hứa là quan hệ): mọi dòng của E1 mang cùng số hiện tại và cùng ngày lần trước**
  Người dùng thấy gì: Nếu Của tôi gán nhầm số hiện tại hay ngày lần trước của KR này cho KR khác thì bài kiểm vẫn xanh. Người dùng có thể thấy số sai ở một dòng KR.
  Căn cứ: Rủi ro thấp vì mỗi dòng lấy dữ liệu từ chính KR của nó, và nếu sai người dùng tải lại hoặc mở KR là thấy số đúng; sửa chỉ là đổi dữ liệu mẫu nên có thể để sau.
  file: `apps/app/test/cua-toi-chi-liet-kr.dom.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
