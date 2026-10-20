# Review findings: chu-may-sinh-ten-moi (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **git diff lỗi bị nuốt thành 'không đổi tệp nào', và thế là bộ so nới dải theo nen-lap**
  Người dùng thấy gì: Nếu kho git của máy chấm bị hỏng hoặc thiếu lịch sử, phép so chất lượng lời Kara có thể âm thầm châm chước hơn mức định, nên một lần Kara tụt chất lượng có thể lọt qua mà không ai biết. Với cách chạy hiện nay thì phép so vẫn đúng.
  Căn cứ: Chỉ xảy ra khi môi trường chấm hỏng, người dùng cuối không bị ảnh hưởng trực tiếp, và lần chạy hôm nay đã cho kết quả đúng; sửa sau rẻ và chạy lại là biết ngay.
  file: `_acceptance/chu-may-sinh-ten-moi/rang/so-eval-soan.mjs`
  severity: medium
  Đề xuất: known-limits

- **Tệp tóm tắt đọc bằng JSON.parse trần, thiếu trường judgeHong thì phép so ra NaN và lặng lẽ qua**
  Người dùng thấy gì: Nếu tệp kết quả chấm Kara bị thiếu một số liệu, một điều kiện kiểm chất lượng sẽ im lặng bỏ qua thay vì báo lỗi. Hai tệp hiện tại vẫn đủ số liệu nên chưa ảnh hưởng.
  Căn cứ: Không ảnh hưởng người dùng cuối và chỉ lộ khi tệp kết quả bị hỏng hay cũ; người làm thấy ngay khi chạy lại, sửa rẻ.
  file: `_acceptance/chu-may-sinh-ten-moi/rang/so-eval-soan.mjs`
  severity: low
  Đề xuất: known-limits

- **demChuCu chép lại logic chuẩn hoá của soatTenCu thay vì dùng luật chung ở packages/validation**
  Người dùng thấy gì: Hai chỗ cùng dò chữ tên cũ bằng hai đoạn mã riêng, nên sau này sửa cách dò ở một chỗ mà quên chỗ kia thì kết quả có thể lệch nhau. Hiện hai chỗ cho kết quả giống nhau.
  Căn cứ: Nguy cơ chỉ là lệch dần trong tương lai, không làm người dùng thấy tên cũ ngay bây giờ; thêm dòng ghi chú là đủ, gom lại có thể làm khi có việc liên quan.
  file: `_acceptance/chu-may-sinh-ten-moi/rang/eval-soan-chung.mjs`
  severity: low
  Đề xuất: known-limits

- **Tóm tắt eval-soan-sau.json mà E7 đọc vẫn do bộ trích cũ (chưa NFC) ghi, không phải demChuCu đã đối chứng ở E8**
  Người dùng thấy gì: Kết quả chấm lời Kara đã lưu được đếm bằng cách dò chữ cũ chưa kỹ, nên nếu Kara có viết chữ «căn chỉnh» theo dạng mã hoá lạ thì lần đếm đó có thể bỏ sót. Chưa có dấu hiệu Kara viết như vậy.
  Căn cứ: Rủi ro nhỏ: nếu có sót thì chỉ là một câu chữ cũ hiện cho người đọc và sửa được ở lần chạy sau; chạy lại bộ chấm tốn tiền model nên ghi rõ giới hạn thay vì chạy lại.
  file: `_acceptance/chu-may-sinh-ten-moi/evidence/eval-soan-sau.json`
  severity: low
  Đề xuất: known-limits

- **Chặn nới dải theo nen-lap bỏ qua mã thoát của git diff: git hỏng thì dải vẫn nới mà không báo gì**
  Người dùng thấy gì: Nếu kho git hỏng, phép so chất lượng lời Kara có thể cho phép dao động rộng hơn mức định mà không báo. Với cách chạy hiện tại, phép so vẫn đúng.
  Căn cứ: Chỉ lộ khi môi trường chấm hỏng, người dùng cuối không gặp, và kết quả hôm nay đã đúng; sửa rẻ và gộp cùng t1.
  file: `_acceptance/chu-may-sinh-ten-moi/rang/so-eval-soan.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E9(b) vừa thêm lời hứa «bài API có ca soatTenCu(LA) rỗng với cả năm cụm, không lọc theo cụm», nhưng phép đo vẫn chỉ grep dòng import**
  Người dùng thấy gì: Hiện máy vẫn kiểm đủ năm cụm chữ cũ trên các câu của API, nhưng nếu sau này ai xoá phép kiểm đó thì bộ nghiệm thu vẫn báo xanh. Hôm nay phép kiểm còn nguyên.
  Căn cứ: Không có hậu quả nào cho người dùng hôm nay, chỉ là lưới an toàn có lỗ hổng cho lần sửa sau; thêm một dòng ghi chú giới hạn là đủ.
  file: `packages/validation/test/ten-cu-okr.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): đối chứng dương của demChuCu kiểm bộ trích mới, nhưng sau.chuCu rỗng mà E7 đọc là do bộ trích cũ ghi ra**
  Người dùng thấy gì: Kết luận «Kara không viết chữ cũ» dựa trên số đếm do cách dò cũ ghi lại, nên chưa được kiểm bằng cách dò đã vá. Chưa có dấu hiệu Kara thực sự viết chữ cũ.
  Căn cứ: Rủi ro nhỏ và người dùng tự thấy, báo lại được nếu Kara viết chữ cũ; chạy lại bộ chấm tốn tiền model nên ghi rõ giới hạn là hợp lý.
  file: `_acceptance/chu-may-sinh-ten-moi/rang/so-eval-soan-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có ca điểm): E7 giao chiều đỏ của soSanh cho E8, nhưng ma trận CA của E8 chỉ phủ 2 trên 4 điều kiện chặn nới dải của lapDung, và thiếu vài vế khác**
  Người dùng thấy gì: Bộ kiểm cho phép so chất lượng lời Kara mới thử một phần các tình huống nên nếu ai sửa nhầm điều kiện còn lại thì bộ nghiệm thu có thể vẫn xanh. Hôm nay chưa có sai sót nào.
  Căn cứ: Chỉ là lưới an toàn thưa cho lần sửa thước sau, không ảnh hưởng người dùng, thêm ca sau rẻ.
  file: `_acceptance/chu-may-sinh-ten-moi/rang/so-eval-soan-do.mjs`
  severity: low
  Đề xuất: known-limits

- **Sau khi gộp, khoảng diff của vòng tính so với đỉnh onehub chứ không so với merge-base, nên E11 và E12 sẽ đỏ giả (r1 · tệp đã đổi)**
  Người dùng thấy gì: Sau khi tính năng được gộp, lần kiểm lại hồ sơ này có thể báo đỏ vì lẫn thay đổi của việc khác, dù chữ người dùng thấy vẫn đúng. Người dùng không thấy gì khác đi, chỉ người giữ hồ sơ phải xem kỹ khi đỏ.
  Căn cứ: Không ảnh hưởng người dùng cuối và không mất dữ liệu; chỉ gây báo động giả cho người giữ hồ sơ, sửa thước đo sau gộp là việc nhỏ làm sau được.
  file: `_acceptance/chu-may-sinh-ten-moi/rang/dai.mjs`
  severity: medium
  Đề xuất: known-limits

- **eval-soan.mjs ghi tệp tóm tắt trước khi thoát mã 2 vì không có đề xuất, và so-eval-soan không kiểm soDeXuat, nên vế «Kara không viết chữ cũ» của AC-7 có thể qua mà không đo gì (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu một lần chấm sau này không thu được đề xuất nào của Kara, kết luận «Kara không viết chữ cũ» vẫn có thể hiện xanh dù chưa đo gì. Lần chấm hiện tại có đủ đề xuất nên kết luận đang đúng.
  Căn cứ: Kết luận hôm nay đúng và có số liệu thật; rủi ro chỉ xuất hiện ở lần chấm lỗi sau này và người kiểm tra chạy lại là thấy, không hại gì cho người dùng.
  file: `_acceptance/chu-may-sinh-ten-moi/rang/eval-soan.mjs`
  severity: medium
  Đề xuất: known-limits

- **So tiêu chí judge bỏ qua mà không báo khi lượt sau có giá trị null hoặc thiếu phần tử; số judge hỏng không được so (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu bộ chấm chất lượng lời Kara hỏng ở vài ca, phép so sánh trước và sau có thể bỏ qua mà không báo, nên chất lượng tụt nhẹ có thể lọt. Người dùng có thể thấy lời Kara kém đi mà không có cảnh báo.
  Căn cứ: Hậu quả nhẹ và tự lộ khi chạy lại bộ chấm; không mất dữ liệu, người dùng chỉ thấy chất lượng lời soạn dao động.
  file: `_acceptance/chu-may-sinh-ten-moi/rang/so-eval-soan.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, kèm hình dạng 2): AC-7 «Kara không viết chữ cũ trong đề xuất» chỉ dựa vào sau.chuCu rỗng, bộ trích chưa từng được thấy bắt trúng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Chưa có bằng chứng rằng bộ dò chữ cũ trong lời Kara thật sự bắt được chữ cũ khi nó xuất hiện. Nếu nó dò hụt, Kara có thể vẫn nói «căn chỉnh» hay «hỏi ý» với người dùng mà không ai biết.
  Căn cứ: Chữ cũ chỉ là chữ gọi sai tên, không mất dữ liệu; người dùng gặp thì chỉ thấy tên lệch với màn hình, và thêm một ca đối chứng sau này là rẻ.
  file: `_acceptance/chu-may-sinh-ten-moi/rang/eval-soan.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E9(b) chỉ grep dòng import soatTenCu, còn bài API lọc bỏ ba trong năm cụm cấm (r1)**
  Người dùng thấy gì: Nếu sau này ai đó đưa lại các cụm như «toàn công ty» vào câu báo lỗi, bài kiểm có thể vẫn xanh nên chữ cũ quay lại mà không ai hay. Hiện tại các câu người dùng thấy đang đúng.
  Căn cứ: Chỉ ảnh hưởng nguy cơ tái phát chữ gọi sai tên về sau, không mất dữ liệu và dễ sửa khi phát hiện; bù bằng bài kiểm chặt hơn cũng rẻ.
  file: `packages/validation/test/ten-cu-okr.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (thiếu ma trận toàn phần viết trước): mẫu số của GOC_MOI_CHO lấy từ mã nguồn HEAD bằng regex phụ thuộc tên biến (r1 · tệp đã đổi)**
  Người dùng thấy gì: Có thể còn một chỗ nào đó hiển thị tên đơn vị gốc theo kiểu cũ mà bài kiểm không đếm tới, nên ở chỗ đó tên không gian làm việc có thể không hiện đúng. Chưa thấy chỗ nào như vậy cụ thể.
  Căn cứ: Nếu có thì chỉ là tên hiển thị lệch ở một màn, người dùng tự nhận ra ngay và không mất dữ liệu; chưa có chỗ nào được chỉ ra.
  file: `apps/api/test/chu-may-sinh-ten-moi-goc.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (lời hứa là quan hệ giữa các giá trị, mã chỉ đọc con số): nen-lap được dùng để nới dải mà không kiểm cùng điều kiện với nen (r1 · tệp đã đổi)**
  Người dùng thấy gì: Dải cho phép chất lượng lời Kara dao động có thể rộng hơn thực tế, nên một sự tụt nhẹ có thể được chấp nhận nhầm. Người dùng có thể thấy lời Kara kém đi chút ít.
  Căn cứ: Hậu quả chỉ là chất lượng lời soạn lệch nhẹ, không hỏng dữ liệu, và chủ kho vẫn quyết dải ở Cổng Phạm vi nên người ký đã thấy mức nới.
  file: `_acceptance/chu-may-sinh-ten-moi/rang/so-eval-soan.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
