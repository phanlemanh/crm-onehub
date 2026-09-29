# Review findings: the-gop-y-okr (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A question card shows the 'Save the objective changes before opening the KR' lock even when there is no Open-KR button**
  Người dùng thấy gì: Trong hộp Sửa KR, sau khi người dùng sửa một ô, thẻ câu hỏi có thể hiện dòng nhắc «Lưu thay đổi của Mục tiêu trước khi mở KR» dù thẻ đó không có nút mở KR nào. Dòng nhắc thừa gây khó hiểu nhưng không chặn việc nào.
  file: `apps/app/app/(app)/[slug]/okr/the-gop-y-props.ts`
  severity: medium
  Đề xuất: known-limits

- **khung-gop-y.tsx is a ~400-line copy of the tro-ly-okr-gop-y.dom.tsx harness, not an extraction**
  Người dùng thấy gì: Hai bộ dữ liệu mẫu dùng để kiểm thử có thể lệch nhau về sau. Người dùng cuối không bị ảnh hưởng.
  file: `apps/app/test/khung-gop-y.tsx`
  severity: low
  Đề xuất: wont-fix

- **ProposedChange takes the `id` prop but never puts it on the DOM**
  Người dùng thấy gì: Hiện chưa có màn nào bị ảnh hưởng. Nếu sau này ai đó gắn mã định danh cho thẻ duyệt, mã đó sẽ không xuất hiện trên trang.
  file: `packages/ui/src/components/proposed-change.tsx`
  severity: low
  Đề xuất: known-limits

- **Deleting suggestion.tsx breaks tro-ly-okr-de-xuat E29: its executor still targets the removed file and exits 1**
  Người dùng thấy gì: Một phép kiểm của chương trình trước sẽ báo đỏ cho đến khi cập nhật lại, và chưa thể ghim lại hồ sơ đó. Không ảnh hưởng người dùng cuối.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **A question card in the KR dialog shows the lock text 'Lưu thay đổi của Mục tiêu trước khi mở KR' while there is no 'Mở KR này' button**
  Người dùng thấy gì: Khi đang sửa KR, thẻ câu hỏi có thể hiện lời nhắc lưu Mục tiêu trong khi màn này không có Mục tiêu nào để lưu và không có nút nào bị khoá. Người dùng có thể bối rối nhưng vẫn làm việc bình thường.
  file: `apps/app/app/(app)/[slug]/okr/the-gop-y-props.ts`
  severity: medium
  Đề xuất: known-limits

- **The 'Bỏ qua' button is no longer disabled while another row is being saved; clicking it silently does nothing**
  Người dùng thấy gì: Trong lúc một đề xuất khác đang được lưu, bấm «Bỏ qua» hoặc «Mở KR này» có thể không có phản ứng gì và không báo gì. Người dùng chỉ cần bấm lại sau khi lưu xong.
  file: `apps/app/app/(app)/[slug]/okr/the-gop-y-props.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp, thiếu ma trận viết trước): E8 khong-dong đếm ca bằng ngưỡng > 20 và lặng lẽ bỏ đích thiếu**
  Người dùng thấy gì: Phép kiểm chống hộp tự đóng có thể bỏ sót một vài kiểu bấm mà vẫn báo xanh. Sản phẩm hiện không được chứng minh là hỏng, chỉ là độ chắc của phép kiểm thấp hơn lời hứa.
  file: `apps/app/test/the-gop-y-okr.dom.tsx`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 4 (khẳng định âm tính một mình): bước tái hiện trên merge-base của E8 là một console.log viết cứng, không chạy thật**
  Người dùng thấy gì: Dòng báo «không tái hiện được lỗi cũ» là lời khai viết sẵn, không phải kết quả đo thật. Người ký cần biết điều này khi đọc báo cáo.
  file: `apps/app/test/the-gop-y-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): chiều đỏ --kiem-do-do của E1/E11 đo HTML tự dựng, cột 292 px cố định, không phụ thuộc data-size**
  Người dùng thấy gì: Phép thử bắt lỗi cột góp ý bị hẹp chỉ chạy trên một trang dựng tay, nên chưa chứng minh nó sẽ bắt được lỗi trên hộp thật. Bản thật hiện vẫn đo đạt.
  file: `_acceptance/the-gop-y-okr/rang/man-the-gop-y.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt thay cho quan hệ): E5 so data-slot của thẻ căn chỉnh với thẻ viết lại, một phép so luôn đúng**
  Người dùng thấy gì: Phép kiểm việc thẻ căn chỉnh thu gọn thành một dòng sau khi quyết có thể xanh dù thẻ không thu gọn. Hành vi thật của sản phẩm chưa bị chứng minh là sai.
  file: `apps/app/test/the-gop-y-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert có mặt thay cho quan hệ thứ tự): E10 không đo 'hàng nút sau khối giá trị và bằng chứng'**
  Người dùng thấy gì: Phép kiểm thẻ thông tin ở tab Tổng quan chưa kiểm được hàng nút nằm dưới giá trị và bằng chứng. Nếu bố cục đổi thứ tự thì phép kiểm vẫn báo xanh.
  file: `apps/app/test/the-gop-y-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): bài ba-tang của E2 khẳng định câu dài bẻ được bằng cách tìm tên class wrap-anywhere**
  Người dùng thấy gì: Chưa có phép đo nào xác nhận một câu rất dài không có dấu cách thật sự xuống dòng trong thẻ. Trường hợp này hiếm.
  file: `packages/ui/test/proposed-change.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): dialog-assist.dom.tsx khẳng định 'thân hai cột' bằng chuỗi className**
  Người dùng thấy gì: Một bài kiểm nhỏ về bố cục hai cột chỉ nhìn tên kiểu chữ chứ không nhìn bố cục thật. Bố cục thật vẫn được đo riêng ở trình duyệt.
  file: `packages/ui/test/dialog-assist.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 (assert chuỗi có mặt thay cho quan hệ): tab Vết ở E13 chỉ tìm nhãn chung trong innerText, không gắn với đề xuất vừa nhận**
  Người dùng thấy gì: Khi lái thử, phép kiểm chỉ xác nhận tab Vết có dòng ghi Trợ lý OKR ở đâu đó, chưa chứng minh dòng ấy đúng là của đề xuất vừa nhận.
  file: `_acceptance/the-gop-y-okr/rang/man-the-gop-y.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt thay cho quan hệ import): cầu nối mới trong mo-coi.mjs dò bao đóng bằng regex trên văn bản gộp**
  Người dùng thấy gì: Công cụ phát hiện thành phần không ai dùng có thể nhầm là có người dùng chỉ vì một chuỗi tên xuất hiện trong test. Không ảnh hưởng người dùng cuối.
  file: `_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/15 lỗi rơi vào file không bộ đo nào phủ (apps/app/test/khung-gop-y.tsx, _acceptance/config.yaml, packages/ui/test/dialog-assist.dom.tsx, _acceptance/nen-chat-ai-elements/rang/mo-coi.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
