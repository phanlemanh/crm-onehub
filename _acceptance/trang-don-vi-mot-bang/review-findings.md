# Review findings: trang-don-vi-mot-bang (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Thêm khoảng 47 khối chú thích vào mã sản phẩm, trái luật «Never add code comments»**
  Người dùng thấy gì: Mã của trang có thêm nhiều dòng chú thích trái nếp của kho. Người dùng cuối không thấy gì, chỉ ảnh hưởng người bảo trì về sau.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/bang-don-vi.ts`
  severity: medium
  Đề xuất: known-limits
- **Chép chuỗi lớp khung hàng công cụ của DataTable sang apps/app thay vì xuất một thành phần từ packages/ui**
  Người dùng thấy gì: Khung hàng công cụ của ba cách xem được chép tay nên sau này nếu đổi giao diện bảng thì các trang này có thể lệch nhau. Hiện tại trang vẫn hiển thị đúng.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/hang-cong-cu.tsx`
  severity: low
  Đề xuất: known-limits
- **Đổi một bộ lọc máy chủ làm cả bảng bị gỡ ra thay bằng khung xương: menu «Lọc» chọn nhiều tự đóng sau mỗi lần tích**
  Người dùng thấy gì: Khi người dùng tích chọn nhiều ô trong menu «Lọc», mỗi lần tích bảng chuyển sang khung xương và menu tự đóng, nên phải mở lại menu để tích tiếp. Trên điện thoại khối «Lọc» cũng gập lại sau mỗi lựa chọn.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx`
  severity: medium
  Đề xuất: new-contract
- **Ô chọn đơn vị: hai lựa chọn trùng tên (vd. bộ phận «Marketing» và phòng ban «Marketing» bên dưới) không đi được bằng bàn phím**
  Người dùng thấy gì: Khi hai đơn vị trùng tên, người dùng dùng bàn phím trong ô chọn đơn vị sẽ bị kẹt ở đơn vị đầu và bấm Enter chọn nhầm sang đơn vị khác.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/chon-don-vi.tsx`
  severity: medium
  Đề xuất: new-contract
- **E3 trả pha chu kỳ thất bại thì bị nuốt im lặng, kho đo kẹt vĩnh viễn ở «cham-diem»**
  Người dùng thấy gì: Nếu bước trả lại trạng thái chu kỳ của bộ kiểm hỏng thì các lần kiểm sau chạy trên dữ liệu sai mà không ai được báo. Người dùng cuối không bị ảnh hưởng.
  file: `_acceptance/trang-don-vi-mot-bang/rang/man-don-vi.mjs`
  severity: low
  Đề xuất: known-limits
- **ghim-nam coi dòng repin thiếu suites_exit/evals_exit là «xanh»**
  Người dùng thấy gì: Bộ kiểm ghim lại có thể báo xanh khi bản ghi thiếu số liệu, nên màu xanh đó chưa chắc chứng minh gì. Người dùng cuối không thấy ảnh hưởng.
  file: `_acceptance/trang-don-vi-mot-bang/rang/ghim-nam.mjs`
  severity: low
  Đề xuất: known-limits
- **E5: dòng CHON có thể là SAI nhưng không mang tiền tố «AC-1», nên dòng chấm vẫn in «DUNG AC-1»**
  Người dùng thấy gì: Báo cáo của bộ kiểm có thể in cùng lúc dòng «đúng» và dòng «sai» cho một mục, gây khó đọc nhưng kết luận cuối vẫn đúng.
  file: `_acceptance/trang-don-vi-mot-bang/rang/man-don-vi.mjs`
  severity: low
  Đề xuất: wont-fix
- **Hình dạng 3 (assert «có mặt» thay QUAN HỆ) + 5 (ma trận 8 ô chỉ là một cấu hình): dvb-hang-cong-cu không bao giờ so cách xem đang hiện với xemOkr được yêu cầu**
  Người dùng thấy gì: Bài kiểm chuyển cách xem có thể vẫn xanh dù trang bỏ qua lựa chọn cách xem và luôn hiện Danh sách. Nếu trang hỏng kiểu đó thì bài kiểm sẽ không báo.
  file: `apps/app/test/okr-trang-don-vi.dom.tsx`
  severity: high
  Đề xuất: known-limits
- **Hình dạng 4 (assert âm một mình): «0 nút tạo/nhập/soạn trong thân» đo trên fixture đã cấm tạo**
  Người dùng thấy gì: Bài kiểm nói không có nút tạo trong thân trang, nhưng dữ liệu thử đã cấm tạo từ đầu nên nếu nút tạo bị đưa lại cho người có quyền thì bài kiểm vẫn không phát hiện.
  file: `apps/app/test/okr-trang-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits
- **Hình dạng 4 (assert âm một mình): đếm 0 trên dấu cũ mà không mã nào còn phát ra**
  Người dùng thấy gì: Vài bài kiểm đếm các phần tử cũ không còn tồn tại nên luôn xanh, không có giá trị bắt lỗi. Người dùng cuối không thấy ảnh hưởng.
  file: `apps/app/test/okr-theo-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits
- **Hình dạng 1 (đo lời tự khai thay vì đầu ra): ghim-nam.mjs miễn dòng kiểm bị xoá nếu tác giả thêm chú thích «// AC-14 cach-toi|loi-hua-moi»**
  Người dùng thấy gì: Bộ kiểm tra việc xoá dòng kiểm có thể bị qua mặt chỉ bằng một dòng chú thích tự khai, nên việc xoá bớt điều khẳng định có thể lọt mà không bị báo.
  file: `_acceptance/trang-don-vi-mot-bang/rang/ghim-nam.mjs`
  severity: high
  Đề xuất: known-limits
- **Hình dạng 5 (tuyên quét LỚP «dòng kiểm» nhưng chỉ liệt ba từ khoá): ho-so-da-ky.mjs không thấy soCa/phai/kiem hay khoá trong toEqual**
  Người dùng thấy gì: Bộ kiểm xem có xoá dòng kiểm hay không chỉ nhận ra vài dạng viết, nên một số kiểu xoá điều khẳng định có thể không bị bắt.
  file: `_acceptance/trang-don-vi-mot-bang/rang/ho-so-da-ky.mjs`
  severity: medium
  Đề xuất: known-limits
- **Hình dạng 6 (đo bản chụp cố định thay vì cây đang kiểm): soi-ma.mjs đọc nội dung tệp tại sha cứng 679432a0f**
  Người dùng thấy gì: Một bộ kiểm giao diện của hồ sơ khác đọc mã tại một mốc cố định, nên lỗi mới thêm vào sau đó sẽ không làm nó đỏ. Người dùng cuối không thấy ảnh hưởng trực tiếp.
  file: `_acceptance/okr-soat-anh-luot-3/rang/soi-ma.mjs`
  severity: medium
  Đề xuất: known-limits
- **Hình dạng 3 (đếm sự có mặt thay QUAN HỆ): toan-canh E5 «đúng một mục trong thứ tự Tab» giờ đếm chính một nút**
  Người dùng thấy gì: Bài kiểm thứ tự Tab của ô chọn đơn vị giờ chỉ đếm một nút nên luôn xanh, không còn phát hiện được lỗi dùng bàn phím.
  file: `_acceptance/toan-canh-okr/rang/man-toan-canh.mjs`
  severity: medium
  Đề xuất: known-limits
- **Hình dạng 3 (chuỗi có mặt thay QUAN HỆ cột): dvb-dong-mo (f) kiểm nội dung bằng includes trên cả dòng**
  Người dùng thấy gì: Bài kiểm dòng mục tiêu chỉ xem các chữ có mặt trong dòng, nên nếu các cột bị đảo thứ tự hoặc dồn vào một ô thì bài kiểm vẫn xanh.
  file: `apps/app/test/okr-trang-don-vi.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
