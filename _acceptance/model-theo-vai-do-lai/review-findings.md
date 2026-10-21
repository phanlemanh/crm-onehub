# Review findings: model-theo-vai-do-lai (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Chi phí phần ứng viên giờ dựa vào cacheReadTokens, nhưng khuôn vẫn để cột này optional/nullable nên thiếu cột thì ngầm thành 0**
  Người dùng thấy gì: Bảng kiến nghị hiện tại đúng. Nhưng nếu một lượt đo sau này thiếu số liệu đọc cache thì bảng vẫn ra số mà không báo lỗi, có thể làm kiến nghị chọn model lệch.
  Căn cứ: Hiện chưa sai số nào và chỉ có thể gây hại khi có lượt đo mới thiếu dữ liệu, mà người dùng không mất dữ liệu gì; sửa sau vẫn rẻ vì chưa có lượt đo nào bị ảnh hưởng.
  file: `_acceptance/model-theo-vai-do-lai/rang/khuon.ts`
  severity: medium
  Đề xuất: known-limits

- **Gateway tính tiền ds gấp đúng 4 lần giá ghim, nên ds không phải ứng viên Tác nhân rẻ nhất như bảng ghi**
  Người dùng thấy gì: Bảng kiến nghị chọn DeepSeek cho Tác nhân vì rẻ nhất theo giá niêm yết, nhưng số tiền Gateway tính thật cho DeepSeek cao hơn khoảng 4 lần. Khi đổi model mặc định dựa vào bảng này, chi phí thật có thể cao hơn dự tính và model rẻ nhất thật sự có thể là GLM.
  Căn cứ: Hậu quả là chọn nhầm model đắt hơn nhưng không mất dữ liệu, và người dùng đổi lại được ngay bằng ô Cài đặt; cần ghi rõ lệch giá này vào bảng để người quyết định đổi mặc định không bị dẫn sai.
  file: `_acceptance/model-theo-vai-do-lai/evidence/bang-kien-nghi.json`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5: ma trận biên của E5 không có ô nào cho số hạng đọc cache, mà đó chính là chỗ sửa của vòng này**
  Người dùng thấy gì: Bộ kiểm hiện không tự phát hiện nếu cách tính tiền đọc cache bị sửa sai sau này, nên bảng vẫn có thể xanh dù số sai. Số liệu hôm nay đã được tính lại bằng tay và khớp.
  Căn cứ: Không có số nào sai hiện nay và rủi ro chỉ xuất hiện khi ai đó sửa công thức sau này; thêm ô kiểm sau vẫn rẻ và không ảnh hưởng người dùng.
  file: `_acceptance/model-theo-vai-do-lai/rang/so-do.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1: công thức chi phí trong nguong.json là chỉ dẫn được kiểm khuôn nhưng không bộ tính nào đọc**
  Người dùng thấy gì: Dòng mô tả công thức trong tệp ngưỡng chỉ là chữ ghi chú, nên sửa chữ mà không sửa cách tính sẽ không bị bắt. Số trong bảng hiện đúng với công thức hợp đồng.
  Căn cứ: Chỉ là lệch giữa chữ mô tả và cách tính, không làm sai kết quả nào hiện nay và người dùng không bị ảnh hưởng; bộ kiểm hiện có đã đủ để chấp nhận ghi vết.
  file: `_acceptance/model-theo-vai-do-lai/rang/khuon.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

