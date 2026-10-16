# Review findings: mau-trang-thai-chung (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **laViPham still takes a `chat` parameter, but after this round every caller passes false, so its two `chat &&` branches can never run**
  Người dùng thấy gì: Có một đoạn thừa trong công cụ kiểm tra nội bộ, không ảnh hưởng gì đến màu hay màn hình người dùng thấy. Không cần làm gì thêm.
  file: `packages/ui/test/quet-mau-trang-thai.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 (tuyên quét cả lớp nhưng chỉ có ca điểm): đối chứng của luật chặt chỉ là năm dạng chép từ phát hiện vòng 1, và một prop JSX không tên `tone` vẫn lọt**
  Người dùng thấy gì: Công cụ kiểm tra tự động chưa bắt được trường hợp ai đó đưa màu trạng thái viết tay trở lại qua một thành phần bọc trung gian. Hiện chưa có chỗ nào sai màu, nhưng về sau một khu có thể lệch màu mà kiểm tra vẫn báo xanh.
  file: `apps/app/test/mau-trang-thai-anh-xa.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Các bảng NGHIA_* mới được export nhưng không mã nào import, chỉ bài kiểm đọc chúng theo tên trên cây cú pháp (r1)**
  Người dùng thấy gì: Một số bảng nội bộ được khai ở dạng chia sẻ dù không nơi nào dùng. Người dùng không thấy gì khác, chỉ là mã thừa một chút và công cụ dọn mã có thể báo.
  file: `apps/app/app/(app)/[slug]/okr/soan/danh-sach-cuoc.tsx`
  severity: low
  Đề xuất: wont-fix

- **docs/design.md nói bài quét bắt mọi bảng màu riêng, nhưng bài quét chỉ đọc tệp có nhắc StatusIndicator, IndicatorDot hay StatusTone (r1)**
  Người dùng thấy gì: Tài liệu thiết kế hứa rằng mọi bảng màu trạng thái tự khai đều bị bắt, nhưng thực tế chỉ bắt những tệp có dùng chấm trạng thái. Người đọc tài liệu có thể tin là được bảo vệ rộng hơn thật sự.
  file: `docs/design.md`
  severity: low
  Đề xuất: known-limits

- **The color-string scan skips enrichment-status.ts entirely, so the strict 13-file check passes there no matter what the file contains (r1 · tệp đã đổi)**
  Người dùng thấy gì: Màu của trạng thái làm giàu dữ liệu hiện đúng, nhưng bài kiểm tự động không còn nhìn vào khu này. Nếu sau này ai đó viết lại bảng màu riêng ở đó, sẽ không có gì báo đỏ.
  file: `packages/ui/test/quet-mau-trang-thai.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E3 đọc bảng NGHIA_* khai trong mã nguồn, không đọc màu thành phần thật sự truyền cho chấm (r1 · tệp đã đổi)**
  Người dùng thấy gì: Ở bảy khu, bài kiểm chỉ xác nhận bảng nghĩa khai đúng chứ không xác nhận chấm vẽ ra đúng màu. Nếu có chỗ gán sai nghĩa khi vẽ, người dùng có thể thấy màu lệch mà không bài kiểm nào báo.
  file: `apps/app/test/mau-trang-thai-anh-xa.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (thiếu ma trận viết trước): E1 tuyên «đúng 6 khoá, ketThuc = neutral» nhưng số đếm lấy từ chính bảng đang kiểm và không ghim giá trị nào (r1)**
  Người dùng thấy gì: Bài kiểm không tự khoá chặt rằng có đúng sáu nghĩa và nghĩa đã kết thúc là màu xám. Nếu ai đổi cả bảng lẫn tài liệu cùng lúc, màu sẽ đổi mà không ai bị báo.
  file: `packages/ui/test/status-tone.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **nghiaPhanHoi tra khoá bằng `in` rồi ép kiểu, nên khoá của Object.prototype lọt qua (r1)**
  Người dùng thấy gì: Nếu lịch bên ngoài trả về một giá trị phản hồi bất thường, chấm của người dự họp đó có thể mất màu thay vì hiện màu nháp. Giá trị như vậy gần như không xuất hiện trong thực tế.
  file: `packages/ui/src/components/attendee-list.tsx`
  severity: low
  Đề xuất: wont-fix

- **Non-strict scan flags non-color status values (case labels, state/type properties) as 'khai bang mau rieng' (r1 · tệp đã đổi)**
  Người dùng thấy gì: Về sau, một người viết mã hợp lệ có thể bị bài kiểm báo đỏ nhầm với thông báo gây khó hiểu, và phải gỡ rối mất thời gian. Người dùng cuối không bị ảnh hưởng.
  file: `packages/ui/test/quet-mau-trang-thai.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): AC-3 đọc bảng NGHIA_* mà khu khai, không đo màu khu thật sự vẽ (r1 · tệp đã đổi)**
  Người dùng thấy gì: Một số màn có thể về sau vẽ chấm trạng thái sai màu mà bài kiểm vẫn xanh, vì bài kiểm chỉ so bảng khai chứ không nhìn màu thực sự hiện ra. Hiện chưa thấy màn nào sai.
  file: `apps/app/test/mau-trang-thai-anh-xa.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (thiếu ma trận viết trước): E1 duyệt chính TONE_THEO_NGHIA đang bị kiểm, không ghim sáu khoá hay ketThuc = neutral (r1)**
  Người dùng thấy gì: Nếu ai đó đổi màu của trạng thái đã kết thúc, hoặc thêm bớt một nghĩa, và sửa cả tài liệu theo, bài kiểm vẫn xanh. Khi đó màu hiển thị cho người dùng có thể đổi mà không ai được báo.
  file: `packages/ui/test/status-tone.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
