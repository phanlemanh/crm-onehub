# Review findings — the-gop-y-okr (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **New compact-card check fails E1, E11 and E13 together whenever the model returns no alignment card, which the E13 contract never asks for**
  Người dùng thấy gì: Nếu Trợ lý không đưa ra đề xuất căn chỉnh trong lần chạy kiểm thử, bài kiểm màn hình sẽ báo đỏ dù giao diện vẫn đúng. Người dùng thật không bị ảnh hưởng, chỉ có thể gặp báo đỏ giả khi nghiệm thu.
  file: `_acceptance/the-gop-y-okr/rang/man-the-gop-y.mjs`
  severity: medium
  Đề xuất: known-limits

- **E1 retry loop ignores the okr.troLyDeXuat result, so a refused request (bat:false) turns the retry into a silent no-op**
  Người dùng thấy gì: Khi Trợ lý hết lượt trong ngày, bài kiểm thử cứ thử lại mà không nói rõ lý do và cuối cùng báo lỗi ở chỗ khác. Chỉ người chạy nghiệm thu bị mất thời gian tìm nguyên nhân, người dùng thật không thấy gì.
  file: `_acceptance/the-gop-y-okr/rang/man-the-gop-y.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 1 (đo đường thay thế thay vì đầu ra đã hứa): nhánh thử lại của E1 gọi thẳng tRPC okr.troLyDeXuat, không bấm nút «Nhờ Trợ lý OKR góp ý», mà khẳng định vẫn ghi 'sau khi nho gop y'**
  Người dùng thấy gì: Nếu nút «Nhờ Trợ lý OKR góp ý» bị hỏng, bài kiểm thử vẫn có thể tự gọi Trợ lý qua đường khác rồi báo đạt. Nghĩa là một lỗi nút bấm có thể lọt qua nghiệm thu mà không ai thấy.
  file: `_acceptance/the-gop-y-okr/rang/man-the-gop-y.mjs`
  severity: medium
  Đề xuất: known-limits

- **A question card shows the 'Save the objective changes before opening the KR' lock even when there is no Open-KR button (r1)**
  Người dùng thấy gì: Trong hộp Sửa KR, sau khi người dùng sửa một ô, thẻ câu hỏi có thể hiện dòng nhắc «Lưu thay đổi của Mục tiêu trước khi mở KR» dù thẻ đó không có nút mở KR nào. Dòng nhắc thừa gây khó hiểu nhưng không chặn việc nào.
  file: `apps/app/app/(app)/[slug]/okr/the-gop-y-props.ts`
  severity: medium
  Đề xuất: known-limits

- **khung-gop-y.tsx is a ~400-line copy of the tro-ly-okr-gop-y.dom.tsx harness, not an extraction (r1)**
  Người dùng thấy gì: Hai bộ dữ liệu mẫu dùng để kiểm thử có thể lệch nhau về sau. Người dùng cuối không bị ảnh hưởng.
  file: `apps/app/test/khung-gop-y.tsx`
  severity: low
  Đề xuất: wont-fix

- **ProposedChange takes the `id` prop but never puts it on the DOM (r1)**
  Người dùng thấy gì: Hiện chưa có màn nào bị ảnh hưởng. Nếu sau này ai đó gắn mã định danh cho thẻ duyệt, mã đó sẽ không xuất hiện trên trang.
  file: `packages/ui/src/components/proposed-change.tsx`
  severity: low
  Đề xuất: known-limits

- **Deleting suggestion.tsx breaks tro-ly-okr-de-xuat E29: its executor still targets the removed file and exits 1 (r1)**
  Người dùng thấy gì: Một phép kiểm của chương trình trước sẽ báo đỏ cho đến khi cập nhật lại, và chưa thể ghim lại hồ sơ đó. Không ảnh hưởng người dùng cuối.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **A question card in the KR dialog shows the lock text 'Lưu thay đổi của Mục tiêu trước khi mở KR' while there is no 'Mở KR này' button (r1)**
  Người dùng thấy gì: Khi đang sửa KR, thẻ câu hỏi có thể hiện lời nhắc lưu Mục tiêu trong khi màn này không có Mục tiêu nào để lưu và không có nút nào bị khoá. Người dùng có thể bối rối nhưng vẫn làm việc bình thường.
  file: `apps/app/app/(app)/[slug]/okr/the-gop-y-props.ts`
  severity: medium
  Đề xuất: known-limits

- **The 'Bỏ qua' button is no longer disabled while another row is being saved; clicking it silently does nothing (r1)**
  Người dùng thấy gì: Trong lúc một đề xuất khác đang được lưu, bấm «Bỏ qua» hoặc «Mở KR này» có thể không có phản ứng gì và không báo gì. Người dùng chỉ cần bấm lại sau khi lưu xong.
  file: `apps/app/app/(app)/[slug]/okr/the-gop-y-props.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp, thiếu ma trận viết trước): E8 khong-dong đếm ca bằng ngưỡng > 20 và lặng lẽ bỏ đích thiếu (r1)**
  Người dùng thấy gì: Phép kiểm chống hộp tự đóng có thể bỏ sót một vài kiểu bấm mà vẫn báo xanh. Sản phẩm hiện không được chứng minh là hỏng, chỉ là độ chắc của phép kiểm thấp hơn lời hứa.
  file: `apps/app/test/the-gop-y-okr.dom.tsx`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 4 (khẳng định âm tính một mình): bước tái hiện trên merge-base của E8 là một console.log viết cứng, không chạy thật (r1)**
  Người dùng thấy gì: Dòng báo «không tái hiện được lỗi cũ» là lời khai viết sẵn, không phải kết quả đo thật. Người ký cần biết điều này khi đọc báo cáo.
  file: `apps/app/test/the-gop-y-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt thay cho quan hệ): E5 so data-slot của thẻ căn chỉnh với thẻ viết lại, một phép so luôn đúng (r1)**
  Người dùng thấy gì: Phép kiểm việc thẻ căn chỉnh thu gọn thành một dòng sau khi quyết có thể xanh dù thẻ không thu gọn. Hành vi thật của sản phẩm chưa bị chứng minh là sai.
  file: `apps/app/test/the-gop-y-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert có mặt thay cho quan hệ thứ tự): E10 không đo 'hàng nút sau khối giá trị và bằng chứng' (r1)**
  Người dùng thấy gì: Phép kiểm thẻ thông tin ở tab Tổng quan chưa kiểm được hàng nút nằm dưới giá trị và bằng chứng. Nếu bố cục đổi thứ tự thì phép kiểm vẫn báo xanh.
  file: `apps/app/test/the-gop-y-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): bài ba-tang của E2 khẳng định câu dài bẻ được bằng cách tìm tên class wrap-anywhere (r1)**
  Người dùng thấy gì: Chưa có phép đo nào xác nhận một câu rất dài không có dấu cách thật sự xuống dòng trong thẻ. Trường hợp này hiếm.
  file: `packages/ui/test/proposed-change.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): dialog-assist.dom.tsx khẳng định 'thân hai cột' bằng chuỗi className (r1)**
  Người dùng thấy gì: Một bài kiểm nhỏ về bố cục hai cột chỉ nhìn tên kiểu chữ chứ không nhìn bố cục thật. Bố cục thật vẫn được đo riêng ở trình duyệt.
  file: `packages/ui/test/dialog-assist.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 (assert chuỗi có mặt thay cho quan hệ import): cầu nối mới trong mo-coi.mjs dò bao đóng bằng regex trên văn bản gộp (r1)**
  Người dùng thấy gì: Công cụ phát hiện thành phần không ai dùng có thể nhầm là có người dùng chỉ vì một chuỗi tên xuất hiện trong test. Không ảnh hưởng người dùng cuối.
  file: `_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
