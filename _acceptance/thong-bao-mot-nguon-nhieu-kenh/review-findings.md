# Review findings: thong-bao-mot-nguon-nhieu-kenh (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **One unreadable notification row stops event pushes for every user**
  Người dùng thấy gì: Nếu có một thông báo sự kiện bị ghi hỏng nội dung, trong tối đa 30 phút không ai nhận được tin đẩy qua Zalo hay Slack cho các thông báo sự kiện. Chuông vẫn đủ thông báo.
  Căn cứ: Thông báo do chính hệ thống ghi nên hỏng nội dung hiếm, chuông không mất gì, và tự hết sau 30 phút; sửa sau cũng rẻ nên ghi hạn chế đã biết là đủ.
  file: `apps/agent/agent/lib/thong-bao-day.ts`
  severity: medium
  Đề xuất: known-limits

- **New save updates the cache by key in the component instead of through useCrmCache**
  Người dùng thấy gì: Người dùng không thấy khác biệt ở màn này; chỉ nếu sau này có chỗ khác đọc cùng cài đặt thì chỗ đó có thể hiện giá trị cũ cho tới khi tải lại trang.
  Căn cứ: Hiện chưa có màn nào khác đọc cài đặt này và tải lại trang là hết, nên hậu quả gần như bằng không; sửa khi có màn thứ hai còn rẻ hơn sửa bây giờ.
  file: `apps/app/components/thong-bao/khoi-loai-thong-bao.tsx`
  severity: low
  Đề xuất: wont-fix

- **Push window stored in minutes and converted with a new local minute constant**
  Người dùng thấy gì: Người dùng không thấy gì khác: tin vẫn chỉ đẩy cho thông báo trong vòng 30 phút. Chỉ là người sửa mã sau này phải nhớ thêm một chỗ đổi đơn vị.
  Căn cứ: Không ảnh hưởng người dùng, không mất dữ liệu; chỉ là việc dọn mã nên ghi vết rồi bỏ qua.
  file: `packages/validation/src/thong-bao.ts`
  severity: low
  Đề xuất: wont-fix

- **Turning off channel push for an AI alert leaves it unmarked, so it comes back every morning and later goes out late**
  Người dùng thấy gì: Khi quản trị tắt đẩy qua Zalo hay Slack cho cảnh báo của trợ lý AI, cảnh báo đó vẫn hiện lại trong chuông mỗi sáng đến hết tháng, và nếu bật lại giữa tháng thì tin cũ có thể gửi muộn nhiều ngày.
  Căn cứ: Không mất dữ liệu và người dùng tự gỡ được bằng cách bật lại hoặc đánh dấu đã đọc; chỉ gây phiền nhẹ ở một nhóm loại cảnh báo, và sửa sau không đắt.
  file: `apps/agent/agent/lib/nhac-ke-hoach.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt thay cho quan hệ): ca lệch của tbk-doi-chieu không phân biệt được kênh lệch với mục mất cũ**
  Người dùng thấy gì: Lệnh đối chiếu của chủ kho có thể bị hỏng phần đếm thông báo lệch kênh mà bài kiểm vẫn xanh, nên con số lệch đó chưa được kiểm chứng chắc chắn.
  Căn cứ: Không ảnh hưởng người dùng cuối và không mất dữ liệu; rủi ro là chủ kho tin một con số lệch chưa được kiểm kỹ, nhưng thêm ca kiểm sau này rẻ.
  file: `apps/agent/test/thong-bao-doi-chieu.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận không có cột kỳ vọng viết trước): tbk-api e so kênh với chính hàm mà dịch vụ gọi**
  Người dùng thấy gì: Bài kiểm có thể vẫn xanh nếu màn Cài đặt thông báo báo sai kênh đang dùng hoặc sai lý do không có kênh, nên phần này chưa được chứng minh chắc.
  Căn cứ: Người dùng chỉ thấy nhầm một dòng chữ về kênh, không mất dữ liệu và công tắc vẫn hoạt động; thêm kỳ vọng viết sẵn sau này rẻ.
  file: `apps/api/test/thong-bao-cai-dat.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (dữ liệu viết tay đúng khuôn bên đọc): tbk-man f tự truyền href rồi assert lại đúng chuỗi đó**
  Người dùng thấy gì: Nếu ai đó sửa nhầm đường dẫn của nút «Cài đặt thông báo» trong chuông, bài kiểm vẫn xanh và người dùng có thể bấm vào không tới đúng mục Loại thông báo.
  Căn cứ: Hiện đường dẫn thật chạy đúng theo bản đo màn, và nếu sai thì người dùng chỉ cần vào trang Nhắc buổi sáng bằng tay; sửa bài kiểm sau không đắt.
  file: `apps/app/test/thong-bao-cai-dat.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo bản ráp trong bài thay cho đầu ra thật): tbk-mac-dinh a so bản chụp với dungTin do bài tự bọc, không qua đường gửi**
  Người dùng thấy gì: Chưa có bài kiểm nào so tin Zalo và Slack buổi sáng thật sự được gửi với bản chụp trước vòng này, nên nếu chữ tin đổi nhẹ thì có thể không ai phát hiện ngay.
  Căn cứ: Bài kiểm khác vẫn kiểm tin gửi thật theo cách dựng lại, nên rủi ro thấp; nếu có đổi chữ thì chỉ là tin hơi khác, không mất dữ liệu, và bổ sung sau rẻ.
  file: `apps/agent/test/thong-bao-kenh.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assert âm tính đứng một mình): tbk-su-kien g xanh cả khi thông báo không bao giờ vào vòng gửi**
  Người dùng thấy gì: Bài kiểm cho trường hợp người dùng không có kênh nào có thể xanh dù hệ thống chưa thật sự xét tới người đó, nên chưa chắc chắn rằng nó không gây lỗi.
  Căn cứ: Người dùng không thấy gì khác và không mất dữ liệu; chỉ là bằng chứng kiểm chưa chắc, thêm một dòng đối chứng sau này rẻ.
  file: `apps/agent/test/thong-bao-kenh.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
