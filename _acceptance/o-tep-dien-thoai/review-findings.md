# Review findings: o-tep-dien-thoai

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Chặn NaN của xetKhung không await nên phép đo chạy tiếp; ở khung nguon 375 thì NaN lọt qua im lặng**
  Người dùng thấy gì: Màn phiếu và hộp tải nguồn không bị ảnh hưởng. Chỉ có điều: nếu phép đo kích thước ở khổ điện thoại gặp số hỏng thì có thể báo đạt nhầm hoặc báo sai nguyên nhân.
  Căn cứ: Người dùng không gặp gì ở màn hình, chỉ là lần kiểm tra sau này có thể kém tin cậy ở một trường hợp hiếm; tai lại phép đo và sửa sau đều rẻ, không mất dữ liệu.
  file: `_acceptance/o-tep-dien-thoai/rang/do-man.mjs:298`
  severity: medium
  Đề xuất: known-limits

- **Chặn «bài cũ bị sửa» của otdt_dom thành no-op khi merge-base hỏng, và không thấy sửa chưa commit**
  Người dùng thấy gì: Người dùng vẫn thấy ô Tệp chạy như cũ. Rủi ro là nếu ai đó lỡ sửa bài kiểm thử của ô Tệp mà chưa lưu vào lịch sử thì cổng có thể không phát hiện ra.
  Căn cứ: Chỉ ảnh hưởng khả năng bắt lỗi của người làm việc trong những tình huống hiếm, không đụng tới dữ liệu hay màn hình người dùng, và sửa sau rất rẻ.
  file: `_acceptance/config.yaml:2233`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (kiểm âm tính đứng một mình): đối chứng dương 1280 của E2/E4 lặng lẽ qua khi không tìm thấy hàng nhãn**
  Người dùng thấy gì: Màn phiếu hiện tại vẫn đúng. Nếu sau này nhãn của hàng Tệp bị mất ở khổ máy tính thì phép đo vẫn có thể báo đạt, nên người dùng có thể thấy phiếu thiếu nhãn mà không ai được báo trước.
  Căn cứ: Hậu quả nhẹ vì chỉ xảy ra khi có thay đổi sai về sau và người dùng tự thấy ngay, tải lại không mất dữ liệu; sửa lúc đó vẫn rẻ.
  file: `_acceptance/o-tep-dien-thoai/rang/do-man.mjs:354`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
