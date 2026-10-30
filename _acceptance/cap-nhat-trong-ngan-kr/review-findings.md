# Review findings: cap-nhat-trong-ngan-kr (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Răng thuoc-da-ky bỏ sót khi chỉ mất một trong các khẳng định trùng chữ, và bỏ sót phần thân của expect nhiều dòng**
  Người dùng thấy gì: Công cụ canh việc mất bài kiểm có thể im lặng khi ai đó xoá bớt các câu kiểm giống hệt nhau, hoặc sửa nội dung bên trong một câu kiểm nhiều dòng. Người dùng cuối không bị ảnh hưởng trực tiếp; rủi ro là một bài kiểm cũ bị yếu đi mà không ai được báo.
  Căn cứ: Không ảnh hưởng người dùng cuối và không mất dữ liệu; chỉ làm lưới an toàn cho bài kiểm kém nhạy hơn trong một số kiểu xoá, nên ghi lại là giới hạn đã biết, sửa sau vẫn rẻ.
  file: `_acceptance/cap-nhat-trong-ngan-kr/rang/thuoc-da-ky.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (claims to sweep a class, has only point cases): the thuoc-da-ky tooth no longer extracts kiem(...)/dat(...) assertions, so the signed screen-ruler files in the matrix are not tracked**
  Người dùng thấy gì: Công cụ canh không theo dõi các thước đo màn đã ký viết theo kiểu khác, nên nếu ai xoá câu kiểm ở đó thì không có cảnh báo tự động. Hiện chưa thấy câu kiểm nào bị mất, nên người dùng chưa gặp ảnh hưởng nào.
  Căn cứ: Chưa có hậu quả nhìn thấy với người dùng và không mất dữ liệu; lỗ hổng chỉ nằm ở lưới canh tự động, mỗi thay đổi thước vẫn qua duyệt tay nên nên ghi lại là giới hạn đã biết.
  file: `_acceptance/cap-nhat-trong-ngan-kr/rang/thuoc-da-ky.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 (asserts a string is present while the promise is a relation between values): the eval promises comparing assertion counts between merge-base and HEAD, but the tooth compares a Set of unique strings**
  Người dùng thấy gì: Công cụ canh so các câu kiểm theo chữ chứ không theo số lần xuất hiện, nên xoá bớt bản trùng không bị phát hiện. Người dùng cuối không thấy gì khác; chỉ là bài kiểm có thể yếu đi âm thầm.
  Căn cứ: Không đụng tới dữ liệu hay màn hình của người dùng; hậu quả chỉ là lưới canh bài kiểm bỏ sót một kiểu xoá, và có thể bổ sung sau với chi phí nhỏ.
  file: `_acceptance/cap-nhat-trong-ngan-kr/rang/thuoc-da-ky.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hằng số ngày/tuần đặt rời ở đầu tệp và quy tắc «đầu tuần VN» bị viết lại lần nữa phía client (r1 · tệp đã đổi)**
  Người dùng thấy gì: Hôm nay khối cập nhật vẫn quyết đúng mở hay thu theo tuần. Nhưng nếu sau này luật «tuần này» đổi ở một nơi mà quên nơi kia, khối có thể mở hay thu sai so với dữ liệu thật.
  Căn cứ: Chưa gây sai gì cho người dùng bây giờ, chỉ tăng nguy cơ lệch về sau; sửa lúc đó vẫn rẻ và không mất dữ liệu.
  file: `apps/app/components/crm/record-sheet/khoi-cap-nhat-kr.tsx`
  severity: medium
  Đề xuất: known-limits

- **Gợi ý phím tắt là chữ phụ tự vẽ bằng span text-muted-foreground text-xs (r1 · tệp đã đổi)**
  Người dùng thấy gì: Dòng gợi ý phím tắt dưới form trông và hoạt động đúng, chỉ khác cách dựng so với chuẩn của kho nên hình dáng có thể lệch nhẹ với các màn khác.
  Căn cứ: Chỉ là lệch nếp giao diện, người dùng không mất gì và vẫn dùng được bình thường; sửa sau vẫn rẻ.
  file: `apps/app/components/crm/record-sheet/khoi-cap-nhat-kr.tsx`
  severity: low
  Đề xuất: wont-fix

- **Clicking the objective link in the KR sheet header throws away an unsent update without asking (r1)**
  Người dùng thấy gì: Đang gõ dở một cập nhật KR mà bấm tên mục tiêu ở đầu ngăn thì ngăn chuyển sang mục tiêu và phần đã gõ mất, không hỏi lại.
  Căn cứ: Mất phần nháp chưa gửi nhưng chỉ vài ô gõ tay, người dùng gõ lại được và không ảnh hưởng dữ liệu đã lưu; tuy vậy sửa không đắt nên nên cân nhắc.
  file: `apps/app/components/crm/record-sheet/kr-sheet.tsx`
  severity: medium
  Đề xuất: known-limits

- **Cancelling the ‹ › guard leaves CHUYEN_KR.huong set, so the next KR sheet moves focus to a nav button (r1)**
  Người dùng thấy gì: Trong một chuỗi thao tác hiếm, lần mở KR kế tiếp có thể đặt con trỏ vào nút ‹ › thay vì ô giá trị, người dùng phải bấm vào ô giá trị.
  Căn cứ: Chỉ lệch vị trí con trỏ một lần, không mất dữ liệu và người dùng tự bấm vào ô là xong.
  file: `apps/app/components/crm/record-sheet/kr-sheet.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): ô (c) «biên tuần VN» của E1 tự ghi sẵn trường tuan, không tính từ luc (r1)**
  Người dùng thấy gì: Sát ranh giới tuần (khuya Chủ nhật, sáng Thứ hai giờ VN), nếu máy chủ tính tuần lệch thì khối có thể mở hay thu sai mà bài kiểm hiện tại không bắt được.
  Căn cứ: Chỉ ảnh hưởng một khoảng giờ hẹp mỗi tuần, nhầm chỉ làm khối mở hay thu sai chứ không mất dữ liệu, người dùng bấm mở lại được.
  file: `apps/app/test/cap-nhat-trong-ngan-kr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): bản ghi giả guiCapNhat bỏ note, nên «dòng đầu Lịch sử mang ghi chú» luôn là chữ fixture tự sinh (r1)**
  Người dùng thấy gì: Nếu ghi chú gõ vào không hiện đúng ở dòng đầu Lịch sử, bài kiểm hiện tại sẽ không báo.
  Căn cứ: Đường lưu ghi chú đã được kiểm riêng nên rủi ro thấp; nếu có sai chỉ là hiển thị và người dùng tải lại là thấy bản thật.
  file: `apps/app/test/cap-nhat-trong-ngan-kr.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (assert âm tính một mình): E11 bước 9 «gửi → khối thu» chỉ kiểm khối "mo" biến mất, rồi điều hướng đi (r1)**
  Người dùng thấy gì: Nếu sau khi gửi ngăn KR đóng hẳn thay vì thu lại, thước màn cũ này vẫn báo xanh.
  Căn cứ: Lỗi sẽ không bị bắt ở thước này nhưng thước riêng của tính năng vẫn đo gửi xong ngăn còn mở; người dùng không bị ảnh hưởng thêm.
  file: `_acceptance/canh-kr-okr/rang/man-canh-kr.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assert âm tính một mình): E18 bước 5 «hộp đóng → khối thu» chỉ kiểm khối "mo" vắng, rồi veSheetMucTieu tự mở lại ngăn (r1)**
  Người dùng thấy gì: Nếu sau khi gửi từ lối cập nhật tuần mà khối không thu lại đúng, hoặc ngăn đóng, thước màn cũ này vẫn báo xanh.
  Căn cứ: Là chỗ hở của một bài kiểm cũ, thước riêng của tính năng vẫn đo trạng thái sau gửi; không tác động trực tiếp đến người dùng.
  file: `_acceptance/cap-nhat-tuan-okr/rang/man-cap-nhat.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
