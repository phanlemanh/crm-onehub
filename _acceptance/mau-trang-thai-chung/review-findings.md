# Review findings: mau-trang-thai-chung (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Các bảng NGHIA_* mới được export nhưng không mã nào import, chỉ bài kiểm đọc chúng theo tên trên cây cú pháp**
  Người dùng thấy gì: Một số bảng nội bộ được khai ở dạng chia sẻ dù không nơi nào dùng. Người dùng không thấy gì khác, chỉ là mã thừa một chút và công cụ dọn mã có thể báo.
  file: `apps/app/app/(app)/[slug]/okr/soan/danh-sach-cuoc.tsx`
  severity: low
  Đề xuất: wont-fix

- **docs/design.md nói bài quét bắt mọi bảng màu riêng, nhưng bài quét chỉ đọc tệp có nhắc StatusIndicator, IndicatorDot hay StatusTone**
  Người dùng thấy gì: Tài liệu thiết kế hứa rằng mọi bảng màu trạng thái tự khai đều bị bắt, nhưng thực tế chỉ bắt những tệp có dùng chấm trạng thái. Người đọc tài liệu có thể tin là được bảo vệ rộng hơn thật sự.
  file: `docs/design.md`
  severity: low
  Đề xuất: known-limits

- **The color-string scan skips enrichment-status.ts entirely, so the strict 13-file check passes there no matter what the file contains**
  Người dùng thấy gì: Màu của trạng thái làm giàu dữ liệu hiện đúng, nhưng bài kiểm tự động không còn nhìn vào khu này. Nếu sau này ai đó viết lại bảng màu riêng ở đó, sẽ không có gì báo đỏ.
  file: `packages/ui/test/quet-mau-trang-thai.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E3 đọc bảng NGHIA_* khai trong mã nguồn, không đọc màu thành phần thật sự truyền cho chấm**
  Người dùng thấy gì: Ở bảy khu, bài kiểm chỉ xác nhận bảng nghĩa khai đúng chứ không xác nhận chấm vẽ ra đúng màu. Nếu có chỗ gán sai nghĩa khi vẽ, người dùng có thể thấy màu lệch mà không bài kiểm nào báo.
  file: `apps/app/test/mau-trang-thai-anh-xa.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (thiếu ma trận viết trước): E1 tuyên «đúng 6 khoá, ketThuc = neutral» nhưng số đếm lấy từ chính bảng đang kiểm và không ghim giá trị nào**
  Người dùng thấy gì: Bài kiểm không tự khoá chặt rằng có đúng sáu nghĩa và nghĩa đã kết thúc là màu xám. Nếu ai đổi cả bảng lẫn tài liệu cùng lúc, màu sẽ đổi mà không ai bị báo.
  file: `packages/ui/test/status-tone.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
