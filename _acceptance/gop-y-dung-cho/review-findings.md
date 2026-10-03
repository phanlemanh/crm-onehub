# Review findings: gop-y-dung-cho (round 3)

Tổng 9 phát hiện: 0 trong hợp đồng, 9 ngoài hợp đồng (3 mới ở round này, 6 mang sang từ round 1 và round 2 không chấm lại). Không finder nào chết, không có mục chờ phân loại, không có mục thiếu bác bỏ vì refuter chết.

## Trong hợp đồng

Vòng này không có phát hiện nào gắn được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The fix refreshes the list from the open sheet when Kara finishes; docs/api.md says lists must poll during background writes**
  Người dùng thấy gì: Nếu bấm «Nhờ Kara» rồi đóng khung trước khi Kara đọc xong, số «Kara · N góp ý» trên danh sách vẫn là số cũ (hoặc không hiện) cho tới khi người dùng quay lại trang hay mở lại khung. Mở lại khung thì thấy số đúng.
  file: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): số góp ý của danh sách đã thành 2 ngay lúc trả bản «đang soạn», nên ca dong-bo mới không phân biệt được làm mới khi Kara đọc xong với làm mới khi Kara vừa bắt đầu đọc**
  Người dùng thấy gì: Bài kiểm tự động hiện không phân biệt được việc làm mới số góp ý khi Kara đọc xong với việc làm mới ngay lúc Kara vừa bắt đầu. Nếu sau này ai làm hỏng chỗ này, bài vẫn báo xanh và người dùng sẽ thấy số góp ý trên thẻ Mục tiêu đứng yên dù Kara đã tìm ra góp ý.
  file: `apps/app/test/gop-y-dung-cho-ra-soat.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (khai cả lớp nhưng chỉ có một điểm): tên ca nói «chip danh sách VÀ số của Mục tiêu», commit nói thêm «Của tôi» và dòng dẫn hộp Sửa, nhưng bài chỉ kiểm chip**
  Người dùng thấy gì: Khi Kara đọc xong ngay trong khung, bản sửa nói là làm mới cả chip trên danh sách, mục «Của tôi» và dòng dẫn trong hộp Sửa, nhưng bài kiểm tự động chỉ kiểm chip trên danh sách. Nếu dòng dẫn trong hộp Sửa bị hỏng, người dùng mở Sửa sẽ không thấy lối dẫn sang góp ý của Kara mà không bài kiểm nào báo.
  file: `apps/app/test/gop-y-dung-cho-ra-soat.tsx`
  severity: medium
  Đề xuất: known-limits

- **«Thử lại» trong khối lỗi bị khoá mà không nói lý do khi nút Kara đang khoá hoặc ẩn (r2)**
  Người dùng thấy gì: Khi Kara đọc hỏng đúng lúc người dùng đã hết lượt trong ngày (hoặc tính năng đang tạm nghỉ), nút «Thử lại» xám đi mà không nói vì sao và khi nào dùng lại được. Người dùng có thể tưởng màn hình bị treo.
  file: `apps/app/app/(app)/[slug]/okr/nhom-kara.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (khai ma trận toàn phần nhưng có ô rỗng): 4/12 ô của ma trận E3 kỳ vọng null, nên chỉ đo «không có trong okr.mine» chứ không đo soGopYCho (r2)**
  Người dùng thấy gì: Con số «góp ý chờ» cho người chỉ đọc và cho Mục tiêu của đơn vị khác chưa được bài kiểm tra tự động đối chiếu từng số; sản phẩm không có dấu hiệu hiện sai, chỉ là bằng chứng yếu hơn con số 12 ô đã khai.
  file: `apps/api/test/gop-y-dung-cho.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ): E10 hứa note 'tro-ly-okr:<id>' nhưng bài chỉ kiểm tiền tố qua krTheoKara (r2)**
  Người dùng thấy gì: Bài kiểm tra chỉ xác nhận dòng vết có dấu «theo Kara», chưa kiểm dòng đó trỏ đúng đề xuất đã nhận. Người dùng vẫn thấy đúng dấu và đúng chữ trong tab Vết, nên hậu quả rất nhỏ.
  file: `apps/api/test/gop-y-dung-cho.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **okr-theo-kara.ts viết tay kiểu ảnh chụp vết, trùng z.infer okrVetSnapshot có sẵn trong cùng gói (r1)**
  Người dùng thấy gì: Người dùng không thấy gì khác hôm nay; chỉ là mã có hai nơi cùng mô tả dạng bản ghi vết, nếu một nơi đổi mà nơi kia không đổi thì tab Vết có thể hiển thị sai về sau.
  file: `packages/validation/src/okr-theo-kara.ts`
  severity: medium
  Đề xuất: wont-fix

- **bang-vet.tsx vẫn viết cứng tiền tố «tro-ly-okr:» sau khi diff đã tách hằng TIEN_TO_VET_KARA (r1)**
  Người dùng thấy gì: Hôm nay dấu «theo Kara» ở tab Vết và trên khung vẫn đúng; nhưng cách nhận ra «theo Kara» được định nghĩa ở hai nơi, nếu sửa một nơi thì hai chỗ có thể hiện không khớp nhau.
  file: `apps/app/app/(app)/[slug]/okr/bang-vet.tsx`
  severity: low
  Đề xuất: known-limits

- **dem-gop-y.ts tự viết lại hàm dựng DonViCuaMucTieu thay vì dùng donViCua/chonDonVi có sẵn (r1)**
  Người dùng thấy gì: Số góp ý chờ trên danh sách hôm nay vẫn đúng; chỉ là cách tính quyền xem được viết lặp ở hai nơi, nếu luật quyền đổi mà chỉ sửa một nơi thì số trên chip có thể lệch.
  file: `apps/api/src/okr/dem-gop-y.ts`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 2/3 lỗi rơi vào file không bộ đo nào phủ (apps/app/test/gop-y-dung-cho-ra-soat.tsx) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
