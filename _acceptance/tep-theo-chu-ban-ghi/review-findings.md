# Review findings: tep-theo-chu-ban-ghi (round 2)

## Trong hợp đồng

Không có finding nào trong hợp đồng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bài DOM dựng ô DEAL × «chua-co-phu-trach» từ dữ liệu không thể tồn tại: bản ghi có chủ nhưng quyền lại tính như chưa có chủ**
  Người dùng thấy gì: Hai trong số các ô kiểm màn hình của thoả thuận kiểm một tình huống không bao giờ xảy ra ngoài đời, nên chúng không bảo vệ thêm được gì. Người dùng không gặp lỗi nào, chỉ là lời «chưa có người phụ trách» được chứng minh bằng công ty và cá nhân chứ không bằng thoả thuận.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu: thoả thuận luôn có người phụ trách nên tình huống này không có thật, chỉ làm bộ kiểm yếu đi một chút và sửa sau cũng rẻ.
  file: `apps/app/test/tep-theo-chu.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình, không đối chứng): vế «không tải lại byId của loại khác» khớp đúng từng khoá nên không bao giờ bắt được**
  Người dùng thấy gì: Khi mở tệp bị từ chối, màn có thể tải lại cả dữ liệu của các loại bản ghi khác chứ không chỉ loại đang xem, và bài kiểm không phát hiện ra. Người dùng chỉ có thể thấy màn tải lại thừa một chút, không sai quyền và không mất gì.
  Căn cứ: Hậu quả nhẹ: chỉ tốn thêm một lượt tải dữ liệu, người dùng không mất gì và tải lại trang là xong; bài kiểm yếu này sửa sau không đắt.
  file: `apps/app/test/tep-theo-chu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): banGhi chép lại phép ánh xạ lyDoKhongMo của máy chủ, ghép owner và phuTrachId độc lập**
  Người dùng thấy gì: Bài kiểm màn hình tự dựng lại lý do vì sao tệp bị khoá thay vì lấy từ máy chủ thật. Nếu sau này máy chủ đổi cách báo lý do, bài kiểm này vẫn xanh và người dùng có thể thấy dòng lý do sai mà không ai hay trước.
  Căn cứ: Hiện chưa có lỗi nào với người dùng, chỉ là lưới an toàn phía màn thưa hơn; phần máy chủ đã có bài kiểm riêng bắt thay đổi, và có thể bổ sung sau mà không đụng dữ liệu.
  file: `apps/app/test/tep-theo-chu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Schema tepTrongO nới `lyDoKhongMo` bằng `.default(null)`, để fixture thiếu trường vẫn parse qua (r1)**
  Người dùng thấy gì: Người dùng không thấy gì khác đi hôm nay vì máy chủ luôn gửi lý do. Nếu sau này có chỗ quên gửi, ô Tệp sẽ lặng lẽ coi như mở được thay vì báo lỗi.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, không mất hay lộ dữ liệu, và sửa sau vẫn rẻ vì chỉ là siết lại khai báo dữ liệu.
  file: `packages/validation/src/tep-truong.ts`
  severity: medium
  Đề xuất: known-limits

- **Danh sách lý do không mở tệp được khai tay ở ba nơi, hằng xuất ra ở @crm/auth không ai dùng (r1)**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng. Chỉ khi sau này thêm một lý do mới mà quên sửa đủ ba nơi thì màn hình mới có thể hiện sai lý do.
  Căn cứ: Hiện chưa gây hại nào cho người dùng, và việc dọn chỉ có giá trị khi thêm lý do mới, nên ghi vết là đủ.
  file: `packages/auth/src/quyen-tep.ts`
  severity: low
  Đề xuất: wont-fix

- **Xoá tệp khi đã mất quyền phụ trách: lỗi FORBIDDEN bị nuốt, hộp thoại đứng im, không báo gì (r1)**
  Người dùng thấy gì: Người phụ trách cũ bấm «Xoá» trên phiếu mở từ trước khi bị đổi sẽ thấy hộp xác nhận đứng im, không có lời báo nào. Tệp không bị xoá nhầm; tải lại phiếu là hết kẹt.
  Căn cứ: Không mất hay lộ dữ liệu và tải lại là tự gỡ được, nhưng người dùng sẽ tưởng nút hỏng nên đáng làm thành một việc nhỏ riêng.
  file: `apps/app/components/crm/fields/o-tep.tsx`
  severity: medium
  Đề xuất: new-contract

- **Lỗi mở tệp không phải FORBIDDEN bị ném lại vào lời gọi `void`, người dùng không thấy gì (r1)**
  Người dùng thấy gì: Khi tệp vừa bị người khác xoá, kho tệp đang tắt hoặc mất mạng, bấm «Mở» không có chuyện gì xảy ra và không có lời báo.
  Căn cứ: Hành vi này có từ trước, không mất hay lộ dữ liệu, người dùng thử lại hoặc tải lại là xong, và các tình huống này hiếm.
  file: `apps/app/components/crm/fields/o-tep.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên đếm đủ ô nhưng phép đếm là hằng): 'thieu o 18' của tcb-xoa không thể đỏ (r1 · tệp đã đổi)**
  Người dùng thấy gì: Người dùng không thấy gì khác. Chỉ là bài kiểm xoá có một câu kiểm đếm ô không bao giờ đỏ, nên nếu thiếu một ô trong ma trận thì phần đếm này không báo.
  Căn cứ: Hành vi xoá thật vẫn được kiểm ở các câu khác, không ảnh hưởng người dùng, và sửa sau rẻ.
  file: `apps/api/test/tep-theo-chu.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

