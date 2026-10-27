# Review findings: bo-okr-co-so (round 2)

## Trong hợp đồng

Không có phát hiện nào trong hợp đồng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bài kiểm của packages/ui ghi một tệp .tsx giả vào cây nguồn của apps/app**
  Người dùng thấy gì: Người dùng cuối không gặp gì. Chỉ khi bài kiểm bị ngắt giữa chừng, một tệp rác có thể nằm lại trong mã nguồn và làm lượt dựng hay lượt kiểm kế tiếp báo đỏ cho tới khi người làm xoá tay.
  Căn cứ: Chỉ ảnh hưởng người làm, không ảnh hưởng sản phẩm, không mất dữ liệu, và người làm tự xoá tệp rác rồi chạy lại được; hiếm xảy ra nên chấp nhận và ghi lại.
  file: `packages/ui/test/data-table-mo-san.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Bước «trả lại» mock.module không trả lại gì: không gian tên đã bị thay tại chỗ**
  Người dùng thấy gì: Người dùng cuối không gặp gì. Về sau, nếu ai đổi thứ tự hay thêm bài kiểm, một số bài có thể chạy trên dữ liệu giả và báo xanh sai, làm lỗi thật khó bị phát hiện.
  Căn cứ: Chỉ làm bài kiểm kém tin cậy trong tương lai chứ không gây lỗi cho người dùng hôm nay; lượt này vẫn đo đúng và sửa sau không tốn nhiều.
  file: `apps/app/test/bo-okr-co-so.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **The loading skeleton for the numbers row puts a <div> inside a <p> and is server-rendered, which causes a hydration mismatch**
  Người dùng thấy gì: Lần đầu mở thẻ OKR của một bộ, hàng số lúc chờ tải có thể nhấp nháy khi trang dựng lại phía trình duyệt. Người dùng thường chỉ thấy khung chờ chớp một chút rồi hiện số đúng, kèm cảnh báo trong nhật ký trình duyệt.
  Căn cứ: Hậu quả nhẹ: không mất hay sai dữ liệu, trang tự hồi phục và số hiện đúng sau khi tải; sửa sau rẻ nên có thể ship trước và ghi lại.
  file: `packages/ui/src/components/khung-xuong.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): E13 vế (2) so diff thước đã ký với băm do chính tác giả chép từ diff hiện tại, không còn soát lớp cho phép**
  Người dùng thấy gì: Người dùng cuối không gặp gì. Việc chứng minh các bài đo của hồ sơ cũ chỉ bị sửa trong phạm vi được phép dựa nhiều vào việc người duyệt tin con số đã chép, nên một thay đổi ngoài phạm vi có thể lọt mà không ai thấy.
  Căn cứ: Rủi ro nằm ở quy trình nghiệm thu chứ không ở sản phẩm, không mất dữ liệu của người dùng; người ký vẫn xem lại được các thay đổi ấy bằng tay.
  file: `_acceptance/bo-okr-co-so/rang/thuoc-da-ky.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture dựng từ chính danh sách đem so): chiều đỏ tay-thieu lấy danh sách quét từ TEP_TAY, không chạy đường quét thật**
  Người dùng thấy gì: Người dùng cuối không gặp gì. Phép thử cố ý làm đỏ ấy chưa chứng minh được là bộ quét thật sẽ bắt khi người làm quên khai một bài đo cũ, nên sót đó có thể không bị báo.
  Căn cứ: Mức nhẹ, chỉ ở công cụ nghiệm thu nội bộ, không ảnh hưởng người dùng, và sai sót nếu có sẽ lộ ở các lượt soát khác nên chi phí sửa không đáng.
  file: `_acceptance/bo-okr-co-so/rang/thuoc-da-ky.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hàng số tự định dạng ngày bằng Intl.DateTimeFormat dù packages/ui đã có formatDayShort (r1 · tệp đã đổi)**
  Người dùng thấy gì: Người dùng không thấy khác biệt: ngày vẫn hiện đúng dạng ngày/tháng theo ngôn ngữ đang chọn. Chỉ là mã viết lại một đoạn đã có sẵn.
  Căn cứ: Không ảnh hưởng gì đến người dùng và không mất dữ liệu; sửa chỉ để gọn mã nên không đáng mở thêm việc.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/hang-so-bo.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
