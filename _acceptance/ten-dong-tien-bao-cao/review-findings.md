## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E4 tells the reviewer to look at an old screenshot, and its new screenshot lands in another project's run folder**
  Người dùng thấy gì: Người xem lại minh chứng cho bước gõ số tiền khi lỗi tải có thể vẫn thấy ảnh chụp màn hình cũ mang tên gọi trước khi đổi, dễ hiểu nhầm là việc đổi tên chưa xong; ảnh mới của vòng này cũng không nằm cùng chỗ với các minh chứng khác của tính năng để dễ đối chiếu.
  file: `_acceptance/ten-dong-tien-bao-cao/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **This change touches screen checks of two signed-off projects, but AC-5/E5 only re-run the automated checks**
  Người dùng thấy gì: Hai tính năng cũ có màn báo lỗi liên quan đã đổi tên trong mã, nhưng vòng này không xem lại màn hình thật của chúng để chắc lời báo lỗi và ảnh minh chứng đã khớp tên mới — hồ sơ đã ký của hai tính năng đó có thể vẫn còn giữ tên cũ.
  file: `_acceptance/ten-dong-tien-bao-cao/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận P105 chỉ trên danh nghĩa): phép so số khẳng định 18 trong quet-chu.mjs không bao giờ đỏ**
  Người dùng thấy gì: Phép đếm dùng để bảo đảm việc quét chữ đã chạy đủ sẽ luôn khớp bất kể nội dung thật ra sao, nên nếu việc đổi tên có sai sót ở đâu đó, phép kiểm này sẽ không bắt được và vẫn báo qua.
  file: `_acceptance/ten-dong-tien-bao-cao/rang/quet-chu.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm không có đối chứng dương trên cùng đường đọc): lượt quét cụm cũ và phép kiểm có mặt đọc tệp theo hai đường khác nhau**
  Người dùng thấy gì: Phép kiểm 'không còn tên cũ' và phép kiểm 'đã có tên mới' đọc danh sách tệp theo hai cách khác nhau, nên nếu một tệp đáng lẽ phải đổi tên bị bỏ sót khỏi lượt quét, cả hai phép kiểm vẫn báo qua dù tệp đó còn giữ tên cũ.
  file: `_acceptance/ten-dong-tien-bao-cao/rang/quet-chu.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (kiểm «có mặt» trong khi lời hứa là quan hệ): mục từ điển chỉ được kiểm là có hai chữ «Cài đặt» và «Tiền tệ» ở bất kỳ đâu**
  Người dùng thấy gì: Mục từ điển chỉ cần chứa rời rạc hai chữ 'Cài đặt' và 'Tiền tệ' ở bất kỳ đâu là được xem là đạt, nên một mục ghi sai chỗ đặt thật vẫn có thể lọt qua kiểm tra.
  file: `_acceptance/ten-dong-tien-bao-cao/rang/quet-chu.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).