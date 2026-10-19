# Review findings: cua-toi-ba-phan (round 2)

## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Thêm chú thích trong code, trái luật «Never add code comments» của kho**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào: màn «Của tôi» chạy đúng như đã hứa. Chỉ là mã phía sau có vài dòng ghi chú trái quy ước của đội, ảnh hưởng người bảo trì chứ không ảnh hưởng người dùng.
  file: `apps/app/app/(app)/[slug]/okr/phan-can-cap-nhat.tsx`
  severity: medium
  Đề xuất: known-limits

- **Thêm chú thích trong mã sản phẩm, trái luật «Never add code comments» (r1)**
  Người dùng thấy gì: Người dùng không thấy gì khác đi. Chỉ là mã có thêm vài dòng ghi chú trái nếp của đội, ảnh hưởng người bảo trì chứ không ảnh hưởng màn hình.
  file: `apps/app/app/(app)/[slug]/okr/phan-don-vi-dan.tsx`
  severity: medium
  Đề xuất: wont-fix

- **LoiPhan tự dựng khung lỗi tải riêng thay vì dùng VungTaiLoi (r1)**
  Người dùng thấy gì: Khi một phần của Của tôi không tải được, khung báo lỗi trông hơi khác kiểu báo lỗi ở phần dưới cùng màn, nhưng vẫn có câu báo và nút thử lại.
  file: `apps/app/app/(app)/[slug]/okr/loi-phan.tsx`
  severity: medium
  Đề xuất: known-limits

- **Mở phiên cập nhật (moCapNhat) thất bại thì không báo gì, mất đường lỗi mà trang cũ có (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu hệ thống không mở được bảng cập nhật khi bạn bấm nút hoặc bấm từ tin nhắc Zalo, bạn không thấy thông báo nào và không biết phải thử lại, nên tưởng như nút không chạy.
  file: `apps/app/app/(app)/[slug]/okr/phan-can-cap-nhat.tsx`
  severity: medium
  Đề xuất: new-contract

- **Lệnh đo so `entry` với chuỗi "sheet" viết cứng, không neo vào LOI_VAO (r1)**
  Người dùng thấy gì: Nếu sau này đổi tên một lối vào cập nhật tuần, con số tỉ lệ dùng để quyết định có giữ tính năng hay không có thể sai lặng lẽ. Hiện tại số liệu vẫn đúng.
  file: `apps/api/scripts/okr/do-cap-nhat-cua-toi.ts`
  severity: low
  Đề xuất: known-limits

- **Trang cũ thành redirect nhưng CapNhatTuan, DangTaiCapNhat và nhánh VeCuaToi vẫn còn, chỉ test giữ chúng sống (r1)**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng. Trong mã còn sót vài thành phần của trang cũ không ai dùng, chỉ làm mã nặng hơn.
  file: `apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan.tsx`
  severity: low
  Đề xuất: wont-fix

- **Lỗi mở phiên cập nhật (moCapNhat) bị nuốt im lặng, kể cả khi vào từ tin nhắc Zalo (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bấm vào link nhắc cập nhật từ Zalo mà hệ thống mở bảng bị lỗi thì người dùng chỉ thấy bảng tóm tắt, không có thông báo, và tải lại trang cũng không mở lại được bảng.
  file: `apps/app/app/(app)/[slug]/okr/phan-can-cap-nhat.tsx`
  severity: high
  Đề xuất: new-contract

- **Lỗi refetch nền của okr.capNhatTuan gỡ bảng đang điền hoặc màn xác nhận vừa gửi (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu mạng chập chờn đúng lúc bạn đang điền số cập nhật, bảng có thể biến mất kèm báo lỗi và số chưa gửi bị mất, hoặc màn «Đã gửi» đổi thành báo lỗi dù đã gửi xong.
  file: `apps/app/app/(app)/[slug]/okr/phan-can-cap-nhat.tsx`
  severity: medium
  Đề xuất: new-contract

- **Lỗi tải org.tree bị bỏ qua, thẻ đơn vị hiện tiêu đề rỗng (r1)**
  Người dùng thấy gì: Khi danh sách cơ cấu tổ chức không tải được, các thẻ «Đơn vị bạn dẫn» hiện không có tên đơn vị và không có thông báo lỗi hay nút thử lại.
  file: `apps/app/app/(app)/[slug]/okr/phan-don-vi-dan.tsx`
  severity: medium
  Đề xuất: new-contract

- **Răng AC-4 chạy nhầm nhóm ca, không ca nào thực thi khẳng định đường /okr?tu=nhac (r1)**
  Người dùng thấy gì: Bài kiểm tra tự động có thể báo xanh dù link trong tin nhắc Zalo bị đổi sai, nên một lỗi như vậy có thể lọt qua mà không ai biết.
  file: `_acceptance/cua-toi-ba-phan/rang/lien-ket-cu.mjs`
  severity: medium
  Đề xuất: known-limits

- **Đo CHỈ DẪN thay vì ĐẦU RA: E6 không chạy assertion «/okr?tu=nhac», chỉ grep mã nguồn của test (r1)**
  Người dùng thấy gì: Lời hứa «tin nhắc dẫn đúng về Của tôi» chưa có bài kiểm tra tự động thật sự chạm tới, nên nếu link bị đổi sai thì hệ thống vẫn báo ổn.
  file: `_acceptance/cua-toi-ba-phan/rang/lien-ket-cu.mjs`
  severity: high
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: chiều đỏ của E13 kết luận chỉ từ mã thoát, không ghim thông điệp, đối chứng dương chạy trên cây khác (r1)**
  Người dùng thấy gì: Bài kiểm tra bảo vệ các hồ sơ cũ có thể báo «đã chứng minh đỏ» dù thật ra chỉ do môi trường thử hỏng, nên độ tin cậy của nó thấp hơn vẻ ngoài.
  file: `_acceptance/cua-toi-ba-phan/rang/ho-so-da-ky.mjs`
  severity: medium
  Đề xuất: known-limits

- **Tuyên quét LỚP nhưng thiếu ma trận viết trước: E13 không kiểm danh sách eval DH1 «bắt buộc có mặt» (r1)**
  Người dùng thấy gì: Bài kiểm tra các hồ sơ cũ có thể bỏ sót một bài mà không báo, nên số bài thật sự được chạy có thể ít hơn người đọc tưởng.
  file: `_acceptance/cua-toi-ba-phan/rang/ho-so-da-ky.mjs`
  severity: medium
  Đề xuất: known-limits

- **Tuyên quét LỚP nhưng thiếu ma trận viết trước: E3 lặp trên LOI_VAO lấy từ chính vật đang đo (r1)**
  Người dùng thấy gì: Nếu ai đó vô tình xoá một lối vào cập nhật tuần, bài kiểm tra tự động vẫn có thể xanh và không cảnh báo.
  file: `apps/api/test/cua-toi-ba-phan.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Tuyên quét LỚP nhưng thiếu ô của ma trận: E11 không có ca «guiCapNhat lỗi 500» (r1 · tệp đã đổi)**
  Người dùng thấy gì: Việc giữ nguyên số đã nhập và hiện nút «Gửi lại» khi gửi cập nhật bị lỗi chưa có bài kiểm tra tự động, nên nếu hỏng thì không ai biết trước.
  file: `apps/app/test/okr-cua-toi-ba-phan.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Assert có mặt trong khi lời hứa là QUAN HỆ: E7 không phân biệt chu kỳ đang chọn với chu kỳ đang chạy (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm tra chưa phân biệt được việc thẻ đơn vị lấy theo chu kỳ bạn chọn hay chu kỳ đang chạy, nên một lỗi chọn nhầm chu kỳ có thể lọt qua.
  file: `apps/app/test/okr-cua-toi-ba-phan.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Assert có mặt trong khi lời hứa là QUAN HỆ: «hợp bằng mine» của E8 có một vế viết cứng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm tra «không mục tiêu nào rời khỏi Của tôi» có một phần viết sẵn đáp án, nên chưa chắc bắt được lỗi làm mất mục tiêu khỏi màn.
  file: `apps/app/test/okr-cua-toi-ba-phan.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Đo CHỈ DẪN thay vì ĐẦU RA: ô chu kỳ của E1 dùng fixture không phụ thuộc đầu vào (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm tra chưa chứng minh được phần «Cần cập nhật» hiện đúng KR của từng chu kỳ, nhưng điều này không làm sai màn hình hiện tại.
  file: `apps/app/test/okr-cua-toi-ba-phan.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Assertion âm-tính-một-mình: «chỉ đọc» của E12 chỉ so số dòng, không có chiều đỏ (r1)**
  Người dùng thấy gì: Bài kiểm tra xác nhận lệnh đo không sửa dữ liệu chỉ đếm số dòng, nên nếu lệnh lỡ sửa nội dung một dòng thì vẫn không bị phát hiện.
  file: `apps/api/test/do-cap-nhat-cua-toi.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Đo CHỈ DẪN thay vì ĐẦU RA: «làm mới» của E2 đếm lời gọi vào một hàm cache giả rỗng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm tra chỉ xác nhận hệ thống có gọi lệnh làm mới sau khi gửi, chưa chứng minh danh sách «Cần cập nhật» thật sự cập nhật lại trên màn.
  file: `apps/app/test/okr-cua-toi-ba-phan.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
