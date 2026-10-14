# Review findings: lich-su-va-luu-tru-trang (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đường nguồn tài liệu vẫn tạo được đề xuất nội dung trên trang đã lưu trữ, lách luật chặn của propose**
  Người dùng thấy gì: Nếu có người tải nguồn cập nhật lên một trang đã lưu trữ, hệ thống vẫn soạn ra một đề xuất sửa nằm trong Chờ duyệt mà không ai duyệt được. Nó chỉ gây rối danh sách chờ chứ không làm đổi nội dung trang.
  file: `apps/api/src/tai-lieu/tai-lieu-nguon.service.ts:264`
  severity: medium
  Đề xuất: known-limits

- **Ngưỡng lỗi máy chủ 500 viết tay ở chỗ dùng, mỗi tệp một hằng riêng**
  Người dùng thấy gì: Không ảnh hưởng gì tới người dùng; chỉ là cách tổ chức mã bên trong khiến việc chỉnh một ngưỡng sau này phải sửa nhiều chỗ.
  file: `apps/app/app/(app)/[slug]/tai-lieu/[trang]/lich-su/[so]/ban-cu.tsx:75`
  severity: low
  Đề xuất: wont-fix

- **Trang đọc đếm và trỏ «Xem bản chờ» vào đề xuất lưu trữ/khôi phục**
  Người dùng thấy gì: Trên trang đang có đề xuất lưu trữ hoặc khôi phục chờ, người đọc có thể thấy thêm nút «Xem bản chờ» dẫn sang màn duyệt lưu trữ, và số bản chờ có thể bị đếm dư một. Dễ gây nhầm nhưng không làm mất dữ liệu.
  file: `apps/app/app/(app)/[slug]/tai-lieu/[trang]/page.tsx:46`
  severity: medium
  Đề xuất: known-limits

- **Trang đã lưu trữ vẫn nhận nguồn cập nhật; máy soạn tạo ra đề xuất NOI_DUNG không bao giờ duyệt được**
  Người dùng thấy gì: Nếu một nguồn đang được soạn đúng lúc trang được lưu trữ, hệ thống vẫn nộp một đề xuất sửa cho trang đã lưu trữ và đề xuất đó kẹt mãi trong Chờ duyệt. Màn đọc cũng có thể còn báo trang đang có bản chờ.
  file: `apps/api/src/tai-lieu/tai-lieu-nguon.service.ts:264`
  severity: medium
  Đề xuất: known-limits

- **Không quay lại được phiên bản chỉ khác bản đang dùng ở tên**
  Người dùng thấy gì: Muốn quay lại một phiên bản cũ mà chỉ khác ở tên trang thì nút «Quay lại» vẫn hiện nhưng bấm ra lỗi «chưa có thay đổi». Người dùng phải đổi tên bằng cách sửa trang thường.
  file: `apps/api/src/tai-lieu/tai-lieu-lich-su.service.ts:138`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — khẳng định âm đứng một mình: spy Prisma «0 truy vấn» luôn bằng 0, kể cả khi DB bị gọi thật**
  Người dùng thấy gì: Một bài kiểm tự động tưởng là đang chắc chắn rằng số phiên bản vô lệ bị chặn trước khi chạm cơ sở dữ liệu, nhưng thực ra không đo được điều đó. Người dùng không thấy khác biệt, chỉ là lưới an toàn mỏng hơn vẻ ngoài.
  file: `apps/api/test/tai-lieu-lich-su.spec.ts:253`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 — chiều đỏ «giữ ngày lưu trữ đầu» luôn đúng, còn vế chính gọi hàm phụ chứ không gọi hàm duyệt**
  Người dùng thấy gì: Bài kiểm về việc lưu trữ lại một trang vẫn giữ ngày lưu trữ đầu tiên đang gọi một hàm phụ chứ không phải đường duyệt thật, nên nếu sau này đường duyệt đổi cách ghi ngày thì bài kiểm vẫn không báo.
  file: `apps/api/test/tai-lieu-luu-tru.spec.ts:265`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — «không có DiffTrang» được đo trên một thành phần không bao giờ vẽ DiffTrang**
  Người dùng thấy gì: Bài kiểm tự động khẳng định màn duyệt lưu trữ không hiện phần so sánh chữ, nhưng nó kiểm trên một màn vốn không bao giờ có phần đó, nên không bắt được lỗi nếu hai loại đề xuất bị đưa nhầm màn.
  file: `apps/app/test/tai-lieu-luu-tru.dom.tsx:360`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — chốt «số khẳng định = số dòng bảng» là phép tính trên hằng**
  Người dùng thấy gì: Bài kiểm kiểm tra các nơi trang đã lưu trữ phải vắng mặt có phép đếm chốt chỉ là con số viết tay, nên nếu ai đó bỏ bớt một kiểm tra thì chốt vẫn không báo thiếu.
  file: `apps/api/test/tai-lieu-luu-tru-loc.spec.ts:190`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
