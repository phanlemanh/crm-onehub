# Review findings: trang-don-vi-mot-bang (round 3)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Khung xương đang tải của bảng đơn vị vẽ tay trong apps/app, lệch với KhungXuong "bang" mà page.tsx dùng làm fallback**
  Người dùng thấy gì: Khi mở trang Theo đơn vị, người dùng có thể thấy hai khung chờ có hình dạng hơi khác nhau nối tiếp nhau trước khi bảng hiện ra, nên cảm giác chờ hơi giật. Bảng vẫn hiện đúng sau đó.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/hang-cong-cu.tsx`
  severity: medium
  Đề xuất: new-contract

- **translate="no" phủ lên cả chữ giao diện «Thuộc»/«In», không chỉ lên dữ liệu người nhập**
  Người dùng thấy gì: Nếu người dùng bật dịch tự động của trình duyệt, một số chữ giao diện như «Thuộc», «Đơn vị», «Tìm đơn vị…» sẽ không được dịch dù lẽ ra phải dịch. Tên đơn vị vẫn giữ nguyên như mong muốn.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/chan-bang.tsx`
  severity: low
  Đề xuất: known-limits

- **Moi lan chon gia tri trong menu Bo loc, ca bang bi go ra nen menu chon-nhieu tu dong lai (va khung loc tren mobile thu lai)**
  Người dùng thấy gì: Khi tick một giá trị trong menu Lọc, bảng chuyển sang khung chờ và menu tự đóng, nên muốn chọn hai giá trị phải mở menu lại. Trên điện thoại khung Lọc cũng tự thu lại, gây khó chịu nhưng lọc vẫn ra đúng kết quả.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx`
  severity: medium
  Đề xuất: new-contract

- **Loc nhanh «Cần bàn»/«Chưa góp» van dem va hien muc tieu da bo khi bo loc trang thai co «đã bỏ»**
  Người dùng thấy gì: Khi người dùng đang lọc xem cả mục tiêu đã bỏ, các ô «Cần bàn» và «Chưa góp vào đâu» có thể đếm và hiện cả mục tiêu đã bỏ, làm số đếm lớn hơn thực tế cần bàn. Ở trường hợp thường dùng thì không bị.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/bang-don-vi.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3: «chuỗi có mặt» thay QUAN HỆ. Phép đếm điểm dừng Tab giờ đếm chính ô chọn, nên luôn bằng 1**
  Người dùng thấy gì: Bài kiểm tự động về thứ tự phím Tab cho ô chọn đơn vị yếu hơn trước, nên nếu sau này ô chọn bị hỏng thứ tự Tab thì bài kiểm này có thể vẫn báo xanh. Giao diện hiện tại không bị ảnh hưởng.
  file: `_acceptance/toan-canh-okr/rang/man-toan-canh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3/4: tính `xemHien` nhưng không bao giờ so; `expect(xemHien).toBeTruthy()` là assert rỗng**
  Người dùng thấy gì: Bài kiểm tự động không thực sự xác nhận cách xem đang bật khớp với đường dẫn, nên một lỗi bật nhầm cách xem có thể lọt qua mà không bị báo đỏ. Người dùng hiện chưa gặp lỗi như vậy.
  file: `apps/app/test/okr-trang-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: so-bằng-nhau không sống. Nhánh theo-don-vi của «so hang B giu nguyen» là 1 === 1 theo cấu tạo**
  Người dùng thấy gì: Bài kiểm tự động về việc số dòng của một mục tiêu không đổi khi có chip góp ý ở trang đơn vị luôn cho kết quả giống nhau, nên không phát hiện được nếu có dòng thừa chen vào. Giao diện hiện tại không bị ảnh hưởng.
  file: `apps/app/test/gop-y-dung-cho-danh-sach.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: tuyên quét LỚP «dòng kiểm bị xoá» nhưng regex chỉ nhận it/test/expect, bỏ sót soCa/kiemCa/phai**
  Người dùng thấy gì: Phép kiểm tự động "không xoá dòng kiểm nào" bỏ sót một số kiểu viết bài kiểm, nên có thể có dòng kiểm bị xoá mà không ai hay. Hiện chưa thấy bằng chứng việc đó đã xảy ra.
  file: `_acceptance/trang-don-vi-mot-bang/rang/ho-so-da-ky.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2: đột biến chiều đỏ viết tay đúng khuôn bên đọc, không dựng lại cây thật như evals khai**
  Người dùng thấy gì: Phép thử giả lập việc cây đơn vị cũ quay lại chỉ là bản giả đơn giản, nên có thể không bắt được trường hợp cây thật quay lại dưới hình dạng khác. Trang hiện tại không có cây đơn vị.
  file: `_acceptance/trang-don-vi-mot-bang/rang/hai-chieu.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
