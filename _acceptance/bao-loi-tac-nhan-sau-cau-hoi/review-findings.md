# Review findings: bao-loi-tac-nhan-sau-cau-hoi (round 1)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Chèn tin giữa lúc dựng giờ có thể sinh HAI thông báo «xong» (hồi quy so với mã cũ), và AC-7 xếp thứ tự bước nên không bắt được**
  Người dùng thấy gì: Nếu người dùng gửi thêm một tin trò chuyện từ tab khác trong lúc Kara đang dựng, họ có thể nhận hai thông báo «xong» cho cùng một lần dựng. Không mất dữ liệu và không thiếu thông báo, chỉ bị báo trùng một lần.
  Căn cứ: Hậu quả nhẹ: chỉ thừa một thông báo trong hộp thông báo, không mất gì và người dùng bỏ qua được; ca chỉ xảy ra khi gửi tin chen giữa đúng lúc đang dựng, và sửa có thể đăng thành việc riêng khi thấy người dùng than.
  file: `apps/agent/agent/lib/thong-bao-tac-nhan.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
