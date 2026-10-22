# Review findings: loc-don-vi-khong-tu-dong (round 2)

## Trong hợp đồng

Không có finding nào trong hợp đồng ở vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E8-run.log và E8-step3.png là bằng chứng cũ, không khớp thước và evals.yaml đã sửa ở vòng này**
  Người dùng thấy gì: Bộ ảnh và nhật ký đo lưu trong hồ sơ là của lần đo trước, nên người xem hồ sơ có thể thấy ảnh và số liệu không khớp nhau. Tính năng lọc ở trang Theo đơn vị không bị ảnh hưởng.
  Căn cứ: Chỉ làm hồ sơ nhìn lộn xộn, không ảnh hưởng người dùng thật, và vòng nghiệm thu kế tiếp sẽ tự đo và ghi đè lại.
  file: `_acceptance/loc-don-vi-khong-tu-dong/evidence/E8-run.log`
  severity: medium
  Đề xuất: wont-fix

- **Kiểm 'dong moi' mới của AC-3 so số dòng hiện với số đếm của mặt lọc, mà số đếm đó tính cả mục tiêu đã bỏ còn dòng thì không**
  Người dùng thấy gì: Nếu sau này dữ liệu mẫu hoặc đơn vị được chọn có mục tiêu đã bỏ cùng loại, bài đo có thể báo lỗi dù màn lọc chạy đúng. Người dùng không thấy gì khác lạ.
  Căn cứ: Chỉ gây báo đỏ giả cho người nghiệm thu khi đổi dữ liệu mẫu, không mất dữ liệu và không chạm người dùng; chạy lại hoặc chỉnh dữ liệu là qua.
  file: `_acceptance/loc-don-vi-khong-tu-dong/rang/man-loc.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, đối chứng dương rỗng): chốt «có giữ được truy vấn» của AC-2 đếm tổng số yêu cầu, không đếm yêu cầu bị giữ**
  Người dùng thấy gì: Bài đo khung Lọc trên điện thoại có thể báo đạt dù thực tế chưa chắc màn đã chờ tải lại lúc tích lọc, nên độ chắc chắn của kết luận này thấp hơn vẻ ngoài. Bản thân khung Lọc không bị chỉ ra là thu lại.
  Căn cứ: Hậu quả chỉ là một lần đo yếu hơn mong muốn, người dùng không mất gì, và có thể siết lại bài đo sau mà không ảnh hưởng sản phẩm.
  file: `_acceptance/loc-don-vi-khong-tu-dong/rang/man-loc.mjs`
  severity: low
  Đề xuất: known-limits

- **DataTable bọc bảng trong VungDangTai làm hỏng bố cục layout="fill" (mặc định) khi có refreshing (r1)**
  Người dùng thấy gì: Chưa màn nào bị ảnh hưởng. Nếu sau này một màn khác dùng bảng kiểu lấp đầy chỗ trống và bật chế độ làm mờ khi tải lại, bảng có thể mất thanh cuộn riêng và mất tiêu đề dính, cả trang bị tràn.
  Căn cứ: Hiện chỉ trang Theo đơn vị dùng tính năng này và nó không dính lỗi, nên người dùng chưa thấy gì; lỗi chỉ hiện khi có màn mới và người làm màn đó thấy ngay khi dựng, sửa lúc đó rẻ.
  file: `packages/ui/src/components/data-table.tsx`
  severity: medium
  Đề xuất: known-limits

- **giu-bang.ts tự viết thêm một bản Zod cho DonChonOkr thay vì dùng một schema chung ở packages/validation (r1)**
  Người dùng thấy gì: Hiện người dùng không thấy gì. Nếu sau này thêm một loại đơn vị mới mà quên cập nhật bản sao này, trang Theo đơn vị sẽ lặng lẽ quay lại khung chờ mỗi lần đổi lọc, và menu Lọc lại bị đóng như lỗi ban đầu.
  Căn cứ: Hậu quả chỉ xuất hiện khi có thay đổi sau này, không mất dữ liệu, người dùng tải lại là xong; gom về một nơi là việc dọn dẹp có thể làm riêng khi thêm loại đơn vị.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/giu-bang.ts`
  severity: medium
  Đề xuất: known-limits

- **The new `refreshing` prop breaks the default layout="fill": the wrapper div drops the table container out of the flex chain (r1)**
  Người dùng thấy gì: Chưa màn nào bị ảnh hưởng. Nếu sau này một màn khác dùng bảng kiểu lấp đầy chỗ trống và bật chế độ làm mờ khi tải lại, bảng có thể mất thanh cuộn riêng và mất tiêu đề dính.
  Căn cứ: Hiện không có màn nào dính nên người dùng chưa gặp; lỗi lộ ra ngay lúc dựng màn mới và sửa lúc đó rẻ.
  file: `packages/ui/src/components/data-table.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): queryKey trong bài kiểm giuKhiChiDoiLoc không lấy từ tRPC (r1)**
  Người dùng thấy gì: Nếu thư viện đổi cách đặt khoá truy vấn, bài kiểm nhỏ vẫn xanh trong khi bảng lại bị gỡ mỗi lần đổi lọc. Bài kiểm trên trình duyệt vẫn sẽ bắt được.
  Căn cứ: Có lớp kiểm thứ hai trên trình duyệt chạy qua đường thật nên lỗi này khó lọt tới người dùng; chỉ là bài kiểm nhỏ kém chặt.
  file: `apps/app/test/loc-don-vi-giu-bang.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

