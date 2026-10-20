# Review findings: chu-may-sinh-ten-moi (round 1)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Sau khi gộp, khoảng diff của vòng tính so với đỉnh onehub chứ không so với merge-base, nên E11 và E12 sẽ đỏ giả**
  Người dùng thấy gì: Sau khi tính năng được gộp, lần kiểm lại hồ sơ này có thể báo đỏ vì lẫn thay đổi của việc khác, dù chữ người dùng thấy vẫn đúng. Người dùng không thấy gì khác đi, chỉ người giữ hồ sơ phải xem kỹ khi đỏ.
  Căn cứ: Không ảnh hưởng người dùng cuối và không mất dữ liệu; chỉ gây báo động giả cho người giữ hồ sơ, sửa thước đo sau gộp là việc nhỏ làm sau được.
  file: `_acceptance/chu-may-sinh-ten-moi/rang/dai.mjs`
  severity: medium
  Đề xuất: known-limits

- **eval-soan.mjs ghi tệp tóm tắt trước khi thoát mã 2 vì không có đề xuất, và so-eval-soan không kiểm soDeXuat, nên vế «Kara không viết chữ cũ» của AC-7 có thể qua mà không đo gì**
  Người dùng thấy gì: Nếu một lần chấm sau này không thu được đề xuất nào của Kara, kết luận «Kara không viết chữ cũ» vẫn có thể hiện xanh dù chưa đo gì. Lần chấm hiện tại có đủ đề xuất nên kết luận đang đúng.
  Căn cứ: Kết luận hôm nay đúng và có số liệu thật; rủi ro chỉ xuất hiện ở lần chấm lỗi sau này và người kiểm tra chạy lại là thấy, không hại gì cho người dùng.
  file: `_acceptance/chu-may-sinh-ten-moi/rang/eval-soan.mjs`
  severity: medium
  Đề xuất: known-limits

- **So tiêu chí judge bỏ qua mà không báo khi lượt sau có giá trị null hoặc thiếu phần tử; số judge hỏng không được so**
  Người dùng thấy gì: Nếu bộ chấm chất lượng lời Kara hỏng ở vài ca, phép so sánh trước và sau có thể bỏ qua mà không báo, nên chất lượng tụt nhẹ có thể lọt. Người dùng có thể thấy lời Kara kém đi mà không có cảnh báo.
  Căn cứ: Hậu quả nhẹ và tự lộ khi chạy lại bộ chấm; không mất dữ liệu, người dùng chỉ thấy chất lượng lời soạn dao động.
  file: `_acceptance/chu-may-sinh-ten-moi/rang/so-eval-soan.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, kèm hình dạng 2): AC-7 «Kara không viết chữ cũ trong đề xuất» chỉ dựa vào sau.chuCu rỗng, bộ trích chưa từng được thấy bắt trúng**
  Người dùng thấy gì: Chưa có bằng chứng rằng bộ dò chữ cũ trong lời Kara thật sự bắt được chữ cũ khi nó xuất hiện. Nếu nó dò hụt, Kara có thể vẫn nói «căn chỉnh» hay «hỏi ý» với người dùng mà không ai biết.
  Căn cứ: Chữ cũ chỉ là chữ gọi sai tên, không mất dữ liệu; người dùng gặp thì chỉ thấy tên lệch với màn hình, và thêm một ca đối chứng sau này là rẻ.
  file: `_acceptance/chu-may-sinh-ten-moi/rang/eval-soan.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E9(b) chỉ grep dòng import soatTenCu, còn bài API lọc bỏ ba trong năm cụm cấm**
  Người dùng thấy gì: Nếu sau này ai đó đưa lại các cụm như «toàn công ty» vào câu báo lỗi, bài kiểm có thể vẫn xanh nên chữ cũ quay lại mà không ai hay. Hiện tại các câu người dùng thấy đang đúng.
  Căn cứ: Chỉ ảnh hưởng nguy cơ tái phát chữ gọi sai tên về sau, không mất dữ liệu và dễ sửa khi phát hiện; bù bằng bài kiểm chặt hơn cũng rẻ.
  file: `packages/validation/test/ten-cu-okr.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (thiếu ma trận toàn phần viết trước): mẫu số của GOC_MOI_CHO lấy từ mã nguồn HEAD bằng regex phụ thuộc tên biến**
  Người dùng thấy gì: Có thể còn một chỗ nào đó hiển thị tên đơn vị gốc theo kiểu cũ mà bài kiểm không đếm tới, nên ở chỗ đó tên không gian làm việc có thể không hiện đúng. Chưa thấy chỗ nào như vậy cụ thể.
  Căn cứ: Nếu có thì chỉ là tên hiển thị lệch ở một màn, người dùng tự nhận ra ngay và không mất dữ liệu; chưa có chỗ nào được chỉ ra.
  file: `apps/api/test/chu-may-sinh-ten-moi-goc.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (lời hứa là quan hệ giữa các giá trị, mã chỉ đọc con số): nen-lap được dùng để nới dải mà không kiểm cùng điều kiện với nen**
  Người dùng thấy gì: Dải cho phép chất lượng lời Kara dao động có thể rộng hơn thực tế, nên một sự tụt nhẹ có thể được chấp nhận nhầm. Người dùng có thể thấy lời Kara kém đi chút ít.
  Căn cứ: Hậu quả chỉ là chất lượng lời soạn lệch nhẹ, không hỏng dữ liệu, và chủ kho vẫn quyết dải ở Cổng Phạm vi nên người ký đã thấy mức nới.
  file: `_acceptance/chu-may-sinh-ten-moi/rang/so-eval-soan.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/7 lỗi rơi vào file không bộ đo nào phủ (_acceptance/chu-may-sinh-ten-moi/rang/eval-soan.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
