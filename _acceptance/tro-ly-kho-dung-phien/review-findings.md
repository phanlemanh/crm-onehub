# Review findings — tro-ly-kho-dung-phien (round 2)

## Trong hợp đồng

Không có phát hiện nào map vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Single-pass marker strip in loiDanCo can be bypassed, so a question can close the data block; the existing xoaDau already handles this**
  Người dùng thấy gì: Người đặt câu hỏi cố tình viết theo một kiểu đặc biệt có thể làm trợ lý kho coi một phần câu hỏi của họ là lệnh chứ không phải nội dung cần trả lời. Câu hỏi bình thường không bị ảnh hưởng.
  file: `apps/agent/agent/subagents/tro_ly_kho/instructions.ts`
  severity: high
  Đề xuất: new-contract

- **ghiSaiCho logs any moHoi failure as 'sai chỗ', including in a real kho or Zalo session, so dem-sai-phien over-counts**
  Người dùng thấy gì: Số liệu đếm lượt gọi trợ lý kho sai chỗ có thể cao hơn thực tế, vì đôi khi một câu hỏi kho hoặc Zalo hợp lệ gặp lỗi cũng bị tính là gọi sai chỗ. Chỉ báo cáo đếm bị lệch, người dùng không thấy gì khác.
  file: `apps/agent/agent/subagents/tro_ly_kho/instructions.ts`
  severity: low
  Đề xuất: known-limits

- **A wrong-place tro_ly_kho call does not stop: eve swallows the error from session.started and the subagent still runs model steps**
  Người dùng thấy gì: Khi một trợ lý khác gọi nhầm trợ lý kho, hệ thống vẫn chạy tiếp và vẫn tốn tiền mô hình dù mô tả nói là từ chối ngay. Việc đếm được số lần gọi nhầm vẫn hoạt động, nhưng khoản tiền tốn vô ích chưa hết hẳn.
  file: `apps/agent/agent/subagents/tro_ly_kho/instructions.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 (tuyên quét LỚP nhưng chỉ có điểm-case): ma trận 6 purpose của kd-tu-choi là 6 lần chạy cùng một ca, purpose không phải đầu vào**
  Người dùng thấy gì: Bài kiểm nói là thử sáu loại hội thoại khác nhau nhưng thực chất chạy cùng một tình huống sáu lần. Nếu sau này chỉ một loại hội thoại bị lỗi thì bài kiểm này có thể không phát hiện ra.
  file: `apps/agent/test/tro-ly-kho-dung-phien.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (assertion âm tính một mình): nhánh khoá «chung» của kd-zdr là phủ định không thể đỏ, không ghim «không có apiKey»**
  Người dùng thấy gì: Bài kiểm về việc dùng khoá chung cho câu hỏi kho khó bắt được lỗi nếu hệ thống lỡ dùng nhầm một khoá khác. Hiện chưa có lỗi thật, chỉ là lưới an toàn hơi lỏng.
  file: `apps/agent/test/tro-ly-kho-dung-phien.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (assert có mặt thay vì QUAN HỆ): kd-zdr không bắt mã model ở đường step.started, lời hứa «cùng mã model với tro_ly_kho» chưa được đo**
  Người dùng thấy gì: Chưa có bài kiểm nào xác nhận câu hỏi kho dùng đúng cùng loại mô hình bảo mật như trợ lý kho. Nếu ai đó đổi nhầm mô hình thì bài kiểm vẫn báo ổn.
  file: `apps/agent/test/tro-ly-kho-dung-phien.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 1 (đo bộ phận thay vì ĐẦU RA): kd-cam-goi đo research và okr-soan qua chiDanNghienCuu, không qua resolver session.started thật**
  Người dùng thấy gì: Với hai loại hội thoại nghiên cứu, bài kiểm chỉ xem một phần lời dặn chứ không xem lời dặn đầy đủ cuối cùng. Nếu sau này câu cấm gọi trợ lý kho biến mất ở bản đầy đủ thì bài kiểm vẫn có thể báo ổn.
  file: `apps/agent/test/tro-ly-kho-dung-phien.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
