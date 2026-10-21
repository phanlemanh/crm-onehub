# Review findings: gon-dau-trang-lay-y-kien (round 2)

## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hằng số chỉnh được và ngưỡng khổ khai ngay cạnh chỗ dùng, ngưỡng khổ lặp ở ba nơi (r1)**
  Người dùng thấy gì: Người dùng không thấy gì khác đi. Về sau, ai muốn đổi ngưỡng khổ màn hay độ chừa chỗ của hàng Gửi dính đáy có thể phải sửa nhiều chỗ và dễ quên một chỗ, làm ô nhập bị che.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, kho đã có nhiều chỗ làm tương tự, và dọn lại tốn công hơn nhiều so với rủi ro nhỏ về sau.
  file: `packages/ui/src/components/hang-hanh-dong-bam-day.tsx`
  severity: low
  Đề xuất: wont-fix

- **E6: lỗi chờ trang của hai ca phủ định bị nuốt, trang không tải vẫn tính là DUNG (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép kiểm cho người đã góp đủ 3 ý và người không có quyền góp có thể báo đạt dù trang chưa mở được. Sản phẩm vẫn chạy đúng, nhưng bằng chứng cho hai trường hợp này yếu hơn vẻ ngoài.
  Căn cứ: Chỉ làm bằng chứng nghiệm thu kém chắc, người dùng không gặp lỗi nào; kiểm lại bằng tay hai trường hợp này là đủ và có thể làm sau.
  file: `_acceptance/gon-dau-trang-lay-y-kien/rang/man-gui.mjs`
  severity: medium
  Đề xuất: known-limits

- **E3 ca «cham» đo trên ô đã có tiêu điểm từ ca «tab» trước, nên không đo đường chạm vào một ô chưa có tiêu điểm (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi người dùng chạm vào một ô chưa được chọn trên điện thoại, chưa có phép kiểm tự động xác nhận hàng Gửi dính đáy không che ô đó. Phép kiểm hiện chỉ xác nhận trường hợp ô đã được chọn sẵn.
  Căn cứ: Người dùng nếu gặp chỉ cần cuộn nhẹ là thấy lại ô, không mất dữ liệu; chỗ này nên dò thử tay trên máy thật là nhanh nhất.
  file: `_acceptance/gon-dau-trang-lay-y-kien/rang/man-gui.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4: hai ca phủ định của E6 không có mốc dương riêng cho từng ca, và lỗi hết giờ chờ bị nuốt (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép kiểm xác nhận không có hàng Gửi dính đáy cho người đủ 3 ý và người không có quyền chưa chứng minh được trang của họ đã hiện đúng trạng thái. Trang lỗi cũng có thể bị tính là đạt.
  Căn cứ: Chỉ làm bằng chứng yếu hơn, không gây hại cho người dùng và kết quả sai chỉ lộ ra khi trang hỏng hẳn, khi đó người dùng tự thấy ngay.
  file: `_acceptance/gon-dau-trang-lay-y-kien/rang/man-gui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4/5: «khong che o nao» của E2 bỏ qua lặng lẽ những ô không đo được (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép kiểm có thể báo hàng Gửi không che ô nào trong khi chưa đo đủ ba ô Ý, Vì sao, Đo bằng gì. Nếu có ô bị che thì phép kiểm có thể không phát hiện ra.
  Căn cứ: Rủi ro thấp vì ba ô này đã được đo ở các phép kiểm khác cùng hồ sơ; người dùng nếu gặp ô bị che chỉ cần cuộn thêm.
  file: `_acceptance/gon-dau-trang-lay-y-kien/rang/man-gui.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (ghim thông điệp): mẫu ghim chiều đỏ của E2 trong evals.yaml không khớp chuỗi thước thật sự in (r1 · tệp đã đổi)**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng. Người làm sau tái lập phép kiểm lỗi cố ý theo đúng câu đã ghi trong hồ sơ sẽ thấy không khớp và phải đoán câu thật.
  Căn cứ: Không đụng tới người dùng, chỉ gây vướng nhỏ cho người bảo trì và sửa lại có thể làm khi hồ sơ được mở lần sau.
  file: `_acceptance/gon-dau-trang-lay-y-kien/rang/man-gui-chieu-do.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 1: bài DOM của HangHanhDongBamDay đo chuỗi lớp Tailwind thay vì kiểu đã tính (r1)**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng, vì việc hàng Gửi dính đáy ở điện thoại và không dính ở máy tính đã được kiểm bằng trình duyệt thật. Bài kiểm nhỏ này chỉ không đủ sức bắt lỗi nếu kiểu dáng bị đè mà tên lớp vẫn còn.
  Căn cứ: Đã có phép đo trình duyệt thật bảo đảm đúng điều quan trọng, nên sửa bài nhỏ này tốn công mà ít thêm giá trị.
  file: `packages/ui/test/hang-hanh-dong-bam-day.dom.tsx`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Không có.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
