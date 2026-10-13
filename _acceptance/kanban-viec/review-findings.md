# Review findings: kanban-viec (round 3)

## Trong hợp đồng

Không có finding nào map được vào AC ở round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 1 — đo chỉ dẫn thay vì đầu ra: «thẻ đang chờ máy chủ khoá tay kéo» chỉ đọc prop pendingIds truyền cho Board**
  Người dùng thấy gì: Bài kiểm tự động chưa chứng minh được rằng một thẻ đang chờ máy chủ xác nhận thì không kéo tiếp được. Nếu ai đó vô tình gỡ cơ chế khoá này, bài kiểm vẫn báo xanh, và người dùng có thể kéo một thẻ hai lần liên tiếp khi mạng chậm.
  file: `apps/app/test/viec-bang.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **viec.bang và viec.con đọc tiêu đề việc cha mà không qua dieuKienXemViec, nên lộ tiêu đề của việc riêng (r1)**
  Người dùng thấy gì: Sau khi người giao gỡ việc cha khỏi thoả thuận, người được giao việc con vẫn thấy tiêu đề của việc cha dù đó đã thành việc riêng họ không được xem. Bấm vào tiêu đề đó thì báo không tìm thấy.
  file: `apps/api/src/viec/viec-bang.service.ts`
  severity: high
  Đề xuất: new-contract

- **Số việc con trên thẻ bảng (con.tong, conMo) đếm cả việc con người xem không thấy, lệch với viec.con (r1)**
  Người dùng thấy gì: Thẻ trên bảng có thể ghi số việc con nhiều hơn số người xem thật sự thấy trong khung việc, và hộp hỏi lại khi đóng việc cha có thể nói «còn n việc con» lệch với danh sách. Con số này còn tiết lộ có việc riêng của người khác.
  file: `apps/api/src/viec/viec-bang.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Danh sách cột bảng và nguồn kéo được khai ba chỗ, không theo luật một nguồn hằng cho mỗi khu (r1)**
  Người dùng thấy gì: Danh sách bốn cột của bảng và hai nguồn kéo được viết lặp ở nhiều nơi trong mã. Người dùng không thấy khác gì, nhưng sau này đổi thứ tự cột phải nhớ sửa đủ các chỗ.
  file: `apps/api/src/viec/viec.contracts.ts`
  severity: low
  Đề xuất: wont-fix

- **className đổi khoảng cách của ItemGroup ở chỗ gọi (r1)**
  Người dùng thấy gì: Một vài chỗ trên màn Việc được dựng tay thay vì dùng thành phần chung. Người dùng nhìn không khác, chỉ làm giao diện khó giữ đồng nhất về sau.
  file: `apps/app/components/viec/muc-viec-con.tsx`
  severity: low
  Đề xuất: wont-fix

- **Đóng hay huỷ việc cha trong khung việc bỏ qua bước hỏi lại khi truy vấn việc con còn đang chờ hoặc bị lỗi (r1)**
  Người dùng thấy gì: Nếu bấm «Xong» hoặc «Huỷ» ngay lúc danh sách việc con chưa kịp tải hoặc tải lỗi, việc cha bị đóng luôn mà không hỏi lại dù còn việc con đang mở.
  file: `apps/app/components/viec/khung-viec.tsx`
  severity: low
  Đề xuất: known-limits

- **MucViecCon nuốt lỗi tải: truy vấn việc con lỗi thì cả mục biến mất, không báo gì (r1)**
  Người dùng thấy gì: Khi mạng hỏng lúc mở khung việc, mục «Việc con» và nút «Thêm việc con» biến mất mà không báo lỗi hay nút thử lại, người dùng dễ tưởng việc này không có việc con.
  file: `apps/app/components/viec/muc-viec-con.tsx`
  severity: low
  Đề xuất: known-limits

- **Kéo thả trong cột có hơn 200 thẻ bị zod từ chối, mất luôn cả bước đổi trạng thái (r1)**
  Người dùng thấy gì: Với người có cột trên 200 việc, mọi lần kéo thẻ vào cột đó đều lỗi, thẻ bật về chỗ cũ và hiện thông báo kỹ thuật khó hiểu. Chỉ gặp ở người có rất nhiều việc.
  file: `apps/api/src/viec/viec.contracts.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm-tính-một-mình): «mặc định là danh sách» chỉ kiểm không có bảng, không kiểm danh sách hiện ra (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm tự động cho việc mở Việc của tôi mà không chọn gì thì ra danh sách còn lỏng: trang trắng hay lỗi vẫn có thể qua. Sản phẩm có thể vẫn đúng, chỉ là chưa có bằng chứng chặt.
  file: `apps/app/test/viec-bang.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét ma trận toàn phần viết trước, nhưng đáp án sinh lại theo đúng luật của sản phẩm; số assert = 100 luôn đúng) (r1)**
  Người dùng thấy gì: Bài kiểm tự động cho 100 tổ hợp người và trạng thái tính đáp án bằng chính luật của sản phẩm, nên nếu luật sai thì bài kiểm sai theo. Chưa thấy hành vi sai nào ở người dùng, chỉ là bằng chứng chưa độc lập.
  file: `apps/api/test/viec-bang.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
