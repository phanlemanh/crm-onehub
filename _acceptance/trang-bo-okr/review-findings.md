# Review findings: trang-bo-okr (round 3)

## Trong hợp đồng

Không có phát hiện trong hợp đồng ở vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **okr.viecCuaBo trộn việc của mục tiêu «Đã bỏ» vào danh sách chính, trái luật vòng đời**
  Người dùng thấy gì: Ở thẻ Việc của một bộ OKR, việc của mục tiêu đã bỏ vẫn hiện lẫn với việc của mục tiêu đang chạy, nên người xem có thể tưởng những việc đó vẫn cần làm.
  Căn cứ: Chỉ gây nhầm lẫn khi đọc, không mất hay sai dữ liệu, người dùng tự nhận ra qua tên mục tiêu, và sửa sau không đắt.
  file: `apps/api/src/okr/okr-xem.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Hàng việc của bộ OKR tự dựng lại select và cách map đã có, mất daRoi và quaHan**
  Người dùng thấy gì: Ở thẻ Việc của bộ OKR, người làm đã rời workspace và việc quá hạn không được đánh dấu, trong khi màn Cạnh KR có đánh dấu cho cùng các việc đó.
  Căn cứ: Người dùng chỉ thiếu một dấu cảnh báo phụ, vẫn thấy đủ việc, hạn và người làm, và có thể xem màn Cạnh KR để đối chiếu.
  file: `apps/api/src/okr/bo-okr.ts`
  severity: low
  Đề xuất: known-limits

- **Danh sách Bộ OKR đè khoảng cách TableCell bằng className thay vì dùng SimpleTableCell hay SimpleTableRow sub**
  Người dùng thấy gì: Chữ trong các cột của bảng Bộ OKR lệch nhẹ so với tiêu đề cột, nhìn hơi không thẳng hàng nhưng vẫn đọc được.
  Căn cứ: Chỉ là lệch nhỏ về thị giác, không ảnh hưởng thao tác hay dữ liệu, và có thể dọn khi chỉnh giao diện lần sau.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/danh-sach-bo.tsx`
  severity: low
  Đề xuất: wont-fix

- **khong-doi-hinh: an eval that cannot run on origin/onehub (exit 2 or timeout) is counted as 'already red' and does not fail the check**
  Người dùng thấy gì: Phép kiểm tra rằng vòng này không làm hỏng các màn cũ có thể báo đạt dù thật ra không đo được trên bản gốc, nên một hồi quy có thể lọt mà không ai biết.
  Căn cứ: Không ảnh hưởng người dùng cuối trực tiếp nhưng làm mất lưới an toàn của người ký, và sửa công cụ đo không đắt.
  file: `_acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs`
  severity: medium
  Đề xuất: new-contract

- **Danh sách Bộ OKR: a division row's objective count covers only the division, while its progress and low-confidence count include its departments**
  Người dùng thấy gì: Ở danh sách Bộ OKR, một bộ phận có thể hiện 0 mục tiêu nhưng vẫn có tiến độ và số KR tự tin thấp, vì các con số này tính theo phạm vi khác nhau, và bấm vào lại thấy bộ có mục tiêu của phòng ban con.
  Căn cứ: Người dùng thấy số liệu mâu thuẫn trên cùng một hàng gây hoang mang, nhưng không mất dữ liệu và bấm vào bộ là thấy đúng nội dung.
  file: `apps/api/src/okr/bo-okr.ts`
  severity: low
  Đề xuất: new-contract

- **Đo CHỈ DẪN thay vì ĐẦU RA: tbo-lien-ket lấy href của the-con.tsx từ hàm hrefThe với đường gốc do chính bài truyền vào, không đọc href TheConBo thật sự dựng ra**
  Người dùng thấy gì: Bài kiểm liên kết của các thẻ con chưa đo đường dẫn thật mà trang dựng ra, nên nếu sau này đường dẫn thẻ con bị sai thì bài kiểm vẫn xanh.
  Căn cứ: Không có lỗi nào đang xảy ra với người dùng, chỉ là lưới kiểm thưa ở một chỗ, và bổ sung sau không đắt.
  file: `apps/app/test/trang-bo-okr.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Fixture VIẾT TAY đúng khuôn bên đọc: ca DonViCon cho bộ OneHub dựng một hàng con khoa "goc" mà bên ghi conTrucTiep không bao giờ sinh ra**
  Người dùng thấy gì: Một bài kiểm về liên kết Đơn vị con của bộ OneHub dùng dữ liệu mà thực tế không bao giờ xuất hiện, nên chưa chứng minh được liên kết thật đúng.
  Căn cứ: Người dùng không gặp lỗi nào, chỉ là bài kiểm đo một tình huống không có thật, và sửa sau không đắt.
  file: `apps/app/test/trang-bo-okr.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Assert «chuỗi có mặt» trong khi lời hứa là QUAN HỆ: câu rỗng theo lọc chỉ được đo bằng một giá trị lọc (Tôi dẫn)**
  Người dùng thấy gì: Chỉ kiểm được câu thông báo rỗng khi bật Tôi dẫn, nên nếu câu này không đổi theo lọc Đang theo dõi thì chưa ai phát hiện.
  Căn cứ: Nếu có lỗi thì chỉ là một câu thông báo hiện sai tên lọc, người dùng nhìn là biết và không mất dữ liệu.
  file: `_acceptance/trang-bo-okr/rang/man-bo-okr-do.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

