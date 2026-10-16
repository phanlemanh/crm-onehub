# Review findings: tac-nhan-glm-5-3-cham (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Chặn BAM GOC đọc agent.ts ở tip cây đang chạy, nhưng tệp này không khai trong paths của E1/E2**
  Người dùng thấy gì: Hôm nay bài kiểm vẫn xanh. Nhưng khi ai đó sửa cấu hình bộ dựng của Tác nhân (việc kế đã được đề xuất), lần kiểm lại sau này sẽ báo đỏ dù kết quả đo không đổi, và hệ thống không nói rõ vì sao.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/so-tac-nhan.ts`
  severity: medium
  Đề xuất: known-limits

- **Lệch múi giờ của bản kết xuất aiChiPhi được vá ở chỗ đọc, không sửa ở biên ghi**
  Người dùng thấy gì: Giờ ghi trong dữ liệu đo bị lệch 7 giờ nhưng trông như giờ chuẩn, nên ai đọc sau phải tự biết cộng thêm. Các con số về thời gian chạy của Tác nhân vẫn đúng. Chạy lại bài đo ở máy khác múi giờ có thể báo đỏ sai.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/so-tac-nhan.ts`
  severity: medium
  Đề xuất: known-limits

- **Phép kiểm BAM GOC đọc agent.ts đang sống trong cây, không đọc bản lúc đo, và tệp này không có trong paths của E1/E2**
  Người dùng thấy gì: Bài kiểm sẽ tự đỏ khi cấu hình bộ dựng Tác nhân được sửa sau này, dù bằng chứng đo không đổi một byte, và hồ sơ không tự đánh dấu là đã cũ. Hiện chưa gây lỗi.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/so-tac-nhan.ts`
  severity: medium
  Đề xuất: known-limits

- **PHIEN CON CHAY SAU HUY gần như không thể bắn: bản kết xuất aiChiPhi được lấy ngay sau ket_thuc, rồi kho bị xoá**
  Người dùng thấy gì: Với các lượt bị cắt ở 180 giây, dòng xanh không chứng minh được phiên con của Tác nhân đã dừng hẳn, vì dữ liệu được chụp ngay lúc cắt rồi kho bị xoá.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/do-tac-nhan.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): nhãn «AICHIPHI TRUOC BAT DAU» không có chiều đỏ nào chứng minh nó bắn được**
  Người dùng thấy gì: Một kiểm tra giờ ghi sớm bất thường chưa từng được thử xem có báo đỏ đúng lúc không. Nếu nó hỏng thầm, bài đo vẫn báo xanh như thường.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/so-tac-nhan.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): nhãn «BAM GOC KHONG KHOP AGENT.TS» không có chiều đỏ**
  Người dùng thấy gì: Kiểm tra rằng cấu hình Tác nhân lúc đo đúng là bản đã lưu chưa được thử bằng ca cố ý sai. Nếu nó hỏng thầm, một lượt đo sai bản vẫn có thể được tính.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/so-tac-nhan.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): đường lỗi git «KHONG DO DUOC PHAM VI» của E5 không có chiều đỏ**
  Người dùng thấy gì: Phần kiểm tra rằng nhánh không sửa tệp nào ngoài thư mục hồ sơ chưa được thử khi git bị lỗi. Nếu git lỗi thầm, kiểm tra có thể báo là không có tệp nào bị đổi.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/so-tac-nhan.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết theo khuôn bên đọc): chiều đỏ «sau ket_thuc» dựng giờ bằng chính hằng lệch 7 giờ của bộ đọc**
  Người dùng thấy gì: Ca thử giờ ghi trễ dùng đúng giả định về độ lệch 7 giờ của chính bộ đọc, nên nếu giả định đó sai thì ca thử vẫn xanh. Trên dữ liệu thật, hai chặn trước và sau vẫn kẹp giờ trong cửa sổ từng lượt, hậu quả nhỏ.
  file: `_acceptance/tac-nhan-glm-5-3-cham/rang/so-tac-nhan.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

