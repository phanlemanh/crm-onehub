# Review findings: ngan-kr-mot-cho (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hand-styled `<a>` copies the Link from packages/ui instead of using it**
  Người dùng thấy gì: Liên kết về mục tiêu trong ngăn KR hoạt động bình thường, chỉ khác góc bo một chút so với các liên kết khác trong ứng dụng.
  Căn cứ: Chỉ là chênh lệch nhỏ về hình thức, không ảnh hưởng thao tác hay dữ liệu, và dễ chỉnh về sau.
  file: `apps/app/components/crm/record-sheet/kr-sheet.tsx:339`
  severity: medium
  Đề xuất: known-limits

- **Hand-rolled `<h3 className={SECTION_TITLE}>` with fixed padding instead of the existing section heading**
  Người dùng thấy gì: Các mục trong ngăn KR hiển thị đủ và đúng thứ tự, chỉ là tiêu đề mục được dựng riêng thay vì dùng thành phần chung.
  Căn cứ: Người dùng không thấy khác biệt đáng kể, không mất dữ liệu, và sửa sau không tốn kém.
  file: `apps/app/components/crm/record-sheet/kr-sheet.tsx:470`
  severity: low
  Đề xuất: known-limits

- **API test runs a 'use client' component file from apps/app to reach payload logic**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng; chỉ là một bài kiểm tự động của đội phát triển dựng theo lối hơi vòng.
  Căn cứ: Không chạm tới người dùng cuối, còn sửa thì phải dời mã giữa các gói nên tốn công hơn lợi ích.
  file: `apps/api/test/ngan-kr-mot-cho.spec.ts:38`
  severity: medium
  Đề xuất: wont-fix

- **Each KR row runs a full okr.objective query just to decide whether to show the Update button**
  Người dùng thấy gì: Trên trang đơn vị, nút Cập nhật của từng dòng KR có thể hiện chậm hơn một chút so với phần còn lại, làm dòng nhích nhẹ khi nút xuất hiện.
  Căn cứ: Nút vẫn hiện đúng và bấm được, chỉ trễ thoáng chốc; tải lại là hết, không mất dữ liệu.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/bang.tsx:258`
  severity: medium
  Đề xuất: known-limits

- **Module-level mutable singleton passes focus intent between renders**
  Người dùng thấy gì: Việc nhớ hướng chuyển KR được giữ ở mức toàn trang thay vì từng ngăn, nên trong tình huống hiếm tiêu điểm bàn phím có thể nhảy sai chỗ.
  Căn cứ: Chỉ xảy ra ở tình huống hiếm, hậu quả là tiêu điểm nhảy lệch, không mất dữ liệu và người dùng bấm lại là xong.
  file: `apps/app/components/crm/record-sheet/kr-sheet.tsx:330`
  severity: low
  Đề xuất: known-limits

- **kr-sheet.tsx grows from 332 to 911 lines, over the 800-line cap**
  Người dùng thấy gì: Người dùng không thấy gì khác; chỉ là tệp mã của ngăn KR đã dài hơn mức đội đặt ra, khó bảo trì hơn.
  Căn cứ: Không ảnh hưởng người dùng, và tách tệp có thể làm lúc nào cũng được.
  file: `apps/app/components/crm/record-sheet/kr-sheet.tsx`
  severity: low
  Đề xuất: known-limits

- **Chart heights are inline magic numbers or local constants, not in one config per area**
  Người dùng thấy gì: Chiều cao đồ thị được ghi thẳng trong mã; người dùng thấy đồ thị bình thường.
  Căn cứ: Hoàn toàn vô hình với người dùng, sửa không đem lại giá trị tương xứng.
  file: `apps/app/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr.tsx:78`
  severity: low
  Đề xuất: wont-fix

- **Lỗi tải diễn biến trong hộp Cập nhật bị nuốt im: phần xem trước biến mất, không báo gì**
  Người dùng thấy gì: Nếu việc tải lịch sử cho phần xem trước bị lỗi, hộp Cập nhật không hiện đồ thị xem trước và không báo gì, nhưng vẫn nhập và gửi được.
  Căn cứ: Chỉ mất phần xem trước chứ việc cập nhật vẫn chạy và không mất dữ liệu; tải lại hộp là thử lại được.
  file: `apps/app/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr.tsx:117`
  severity: low
  Đề xuất: known-limits

- **Nút Thử lại của ngăn KR lấy trạng thái đang tải của nhầm truy vấn khi canhKr hỏng**
  Người dùng thấy gì: Khi ngăn KR báo lỗi tải, bấm Thử lại vẫn tải lại nhưng nút không báo là đang chạy, nên người dùng có thể bấm thêm lần nữa.
  Căn cứ: Chỉ gây bấm thừa, không mất hay sai dữ liệu, và sửa chỉ là chỉnh một chỉ báo nhỏ.
  file: `apps/app/components/crm/record-sheet/kr-sheet.tsx:761`
  severity: low
  Đề xuất: known-limits

- **Cờ chuyển tiêu điểm CHUYEN_KR là biến toàn module: có thể bị bỏ sót rồi cướp tiêu điểm của một ngăn KR mở về sau**
  Người dùng thấy gì: Trong tình huống hiếm, sau khi bấm sang KR đã bị xoá hoặc tải lỗi, lần mở ngăn KR kế tiếp có thể tự đưa tiêu điểm vào nút mũi tên.
  Căn cứ: Hiếm gặp và chỉ lệch tiêu điểm bàn phím, không mất dữ liệu, người dùng tự đi tiếp được.
  file: `apps/app/components/crm/record-sheet/kr-sheet.tsx:330`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (negative assertion alone, message not pinned): the E1 positive control for the scanner only counts output lines**
  Người dùng thấy gì: Phép kiểm tự động dò lối mở ngăn cũ có thể cho qua nhầm trong một kiểu hồi quy hiếm; người dùng hiện không bị ảnh hưởng.
  Căn cứ: Hiện tại kết quả vẫn đúng, rủi ro chỉ là bỏ sót một lỗi trong tương lai, nên ghi nhận là giới hạn đã biết.
  file: `_acceptance/config.yaml:2077`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (claims a sweep over a class but uses a hand-written point list): the 'every new message key' check in vk7-trang-thai**
  Người dùng thấy gì: Hai dòng chữ mới của hộp Cập nhật chưa được bài kiểm tự động soát bản tiếng Anh, nên nếu sai thì sẽ không bị bắt tự động.
  Căn cứ: Chỉ làm lưới kiểm lỏng hơn, người dùng chưa gặp lỗi nào, và nếu có sai thì chỉ là nhãn chữ, dễ sửa.
  file: `apps/app/test/ngan-kr-mot-cho.dom.tsx:1029`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (asserts presence or a constant where the promise is a relation): confidence 'mức vừa bấm' is tested with a single value that is both the input and the expected**
  Người dùng thấy gì: Bài kiểm tự động chỉ thử một mức tự tin, nên nếu nút mức khác gửi nhầm giá trị thì bài kiểm này có thể không phát hiện.
  Căn cứ: Không có bằng chứng sản phẩm sai; rủi ro chỉ là lưới kiểm thưa, và người dùng sẽ thấy ngay nếu chọn sai mức.
  file: `apps/app/test/ngan-kr-mot-cho.dom.tsx:1749`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (negative assertion alone): the 'muc-tieu-bo' case in row-level vk7-trang-thai never renders a KR row**
  Người dùng thấy gì: Bài kiểm tự động chưa chứng minh chắc rằng mục tiêu đã bỏ hay kỳ đã khép không hiện nút Cập nhật; sản phẩm thật chưa thấy lỗi.
  Căn cứ: Chưa có lỗi nào ngoài thực tế, rủi ro nằm ở lưới kiểm, và nếu nút hiện nhầm thì người dùng gửi sẽ bị máy chủ từ chối.
  file: `apps/app/test/ngan-kr-mot-cho.dom.tsx:1934`
  severity: low
  Đề xuất: known-limits

- **Shape 3 (asserts change or presence where the promise is a relation between values): E12 checks 'Hiện tại' after sending from the sheet only for a change, and history rows with >=**
  Người dùng thấy gì: Phép đo trên màn chỉ xác nhận ô Hiện tại đã đổi chứ chưa chắc nó đúng bằng số vừa gửi, và số dòng lịch sử có tăng một hay không.
  Căn cứ: Giá trị đã gửi được đọc lại đúng từ máy chủ, nên chỉ là bằng chứng màn hình hơi lỏng, không có dữ liệu bị mất.
  file: `_acceptance/ngan-kr-mot-cho/rang/man.mjs:374`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (assertion that cannot fail): the 'host bi go' counter uses a Profiler wrapped around RecordSheetHost**
  Người dùng thấy gì: Một phép kiểm phụ trong bài kiểm tự động luôn qua; việc ngăn không bị đóng khi sang KR kế vẫn được kiểm bằng cách khác.
  Căn cứ: Không ảnh hưởng người dùng và ý chính đã có bằng chứng khác, nên sửa không đáng công.
  file: `apps/app/test/ngan-kr-mot-cho.dom.tsx:801`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

