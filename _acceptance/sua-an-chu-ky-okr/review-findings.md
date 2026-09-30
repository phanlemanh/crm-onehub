# Review findings — sua-an-chu-ky-okr (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E17 chấm vế «chữ trên màn nói rõ hệ quả» từ mã, không từ màn hay tệp chữ thật**
  Người dùng thấy gì: Khi anh ẩn hoặc gỡ một chu kỳ, dòng chữ trên màn giải thích chuyện gì sẽ xảy ra (ẩn thì chu kỳ biến khỏi ô chọn, gỡ thì vết vẫn còn) hiện chưa được kiểm bằng chính chữ đã hiện trên màn. Nếu dòng giải thích ấy viết sai hoặc mơ hồ thì vòng kiểm này vẫn có thể cho qua, nên anh nên tự liếc qua chữ trên hộp ẩn và hộp gỡ khi thử.
  file: `_acceptance/sua-an-chu-ky-okr/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **The five action flags are defined twice: a hand-written type and a separate Zod schema (r1)**
  Người dùng thấy gì: Hôm nay năm nút ở menu chu kỳ hiện đúng. Nhưng nếu sau này thêm nút thứ sáu, phía máy chủ tính ra mà màn hình không nhận được, nút mới sẽ lặng lẽ không xuất hiện.
  file: `apps/api/src/okr/okr.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **The hide input is in the closing-cycle module while its sibling cycle inputs are in okr-chu-ky (r1)**
  Người dùng thấy gì: Người dùng không thấy gì khác: ẩn chu kỳ vẫn chạy đúng. Chỉ là luật kiểm tra mã chu kỳ nằm ở hai chỗ, người sửa sau phải nhớ cả hai.
  file: `packages/validation/src/okr-khep.ts`
  severity: low
  Đề xuất: wont-fix

- **Some screens skip `kyTrongOChon` and filter hidden cycles inline (r1)**
  Người dùng thấy gì: Hôm nay các ô chọn chu kỳ đều không hiện chu kỳ đã ẩn. Nếu sau này đổi định nghĩa thế nào là đã ẩn, ba màn này phải sửa riêng nên dễ sót một màn.
  file: `apps/app/components/okr/hop-chuyen-okr.tsx`
  severity: low
  Đề xuất: known-limits

- **`assertKyChuaAn` is called outside a transaction, so its row lock does nothing (r1)**
  Người dùng thấy gì: Nếu một quản trị ẩn chu kỳ đúng lúc người khác nhờ trợ lý soạn đề xuất cho chu kỳ đó, trợ lý vẫn có thể làm việc trên chu kỳ vừa ẩn. Tình huống trùng khít thời điểm này hiếm.
  file: `apps/api/src/okr/tro-ly.service.ts`
  severity: low
  Đề xuất: known-limits

- **Failed hide leaves the menu stuck on 'hide', so the dialog reopens by itself later (r1)**
  Người dùng thấy gì: Khi ẩn một chu kỳ bị lỗi vì người khác vừa đổi nó, về sau hộp thoại ẩn có thể tự bật lên dù người dùng chưa bấm gì. Đóng hộp thoại đi là xong, không mất dữ liệu.
  file: `apps/app/app/(app)/[slug]/settings/okr/hop-thoai-an-chu-ky.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
