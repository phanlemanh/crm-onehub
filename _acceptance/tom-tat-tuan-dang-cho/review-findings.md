# Review findings: tom-tat-tuan-dang-cho

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Trạng thái «Kara đang xếp» vẽ bằng <p> trần thay vì KaraState kind="working" (vi phạm docs/ai-ux.md §7)**
  Người dùng thấy gì: Khi Kara đang xếp bản tóm tắt đầu tiên, dòng thông báo hiện đúng chữ nhưng trông và được đọc khác với chỗ «Kara đang soạn». Người dùng đọc bằng trình đọc màn hình có thể không được báo là đang chờ.
  Căn cứ: Chữ hiện đúng và tự cập nhật nên người dùng vẫn thấy kết quả; chỉ lệch về hình thức và hỗ trợ tiếp cận, không mất dữ liệu, sửa sau rẻ.
  file: `apps/app/app/(app)/[slug]/okr/khoi-tom-tat.tsx`
  severity: medium
  Đề xuất: known-limits

- **Mã khách tự suy lại luật «ngày cập nhật = hôm trước ngày xếp» thay vì nhận dữ liệu đã tính từ máy chủ**
  Người dùng thấy gì: Hiện tại câu trên màn nêu đúng thứ cập nhật. Nếu sau này đổi giờ xếp ở máy chủ mà quên đổi chỗ này, câu trên màn sẽ ghi sai ngày cập nhật.
  Căn cứ: Chưa gây sai gì cho người dùng hôm nay, chỉ là rủi ro khi đổi luật về sau; sửa sau không mất dữ liệu.
  file: `apps/app/app/(app)/[slug]/okr/khoi-tom-tat.tsx`
  severity: low
  Đề xuất: known-limits

- **PHA_XEP = "dang-chay" là chuỗi trần, không có kiểm kiểu**
  Người dùng thấy gì: Hiện không có tác động lên người dùng. Chỉ khi ai đó đổi tên pha chu kỳ mà quên chỗ này thì dòng chờ sẽ lặng lẽ biến mất ở mọi phòng.
  Căn cứ: Không gây lỗi nào hôm nay, và bài kiểm sẽ báo ngay nếu pha bị đổi; chi phí và hậu quả đều nhỏ.
  file: `packages/db/src/okr-tom-tat.ts`
  severity: low
  Đề xuất: wont-fix

- **Hẹn hỏi lại ở «toi-luc» dừng hẳn khi đồng hồ máy khách chạy nhanh hơn máy chủ**
  Người dùng thấy gì: Nếu đồng hồ máy người xem chạy nhanh hơn máy chủ và họ để mở trang qua giờ xếp, dòng «Kara gửi bản tóm tắt đầu tiên vào khoảng…» có thể đứng nguyên dù giờ đã qua. Tải lại trang hoặc quay lại tab sẽ cập nhật.
  Căn cứ: Chỉ xảy ra khi đồng hồ máy lệch và người dùng để trang mở đúng lúc đó, không mất dữ liệu và tự gỡ bằng cách tải lại trang.
  file: `apps/app/app/(app)/[slug]/okr/khoi-tom-tat.tsx`
  severity: medium
  Đề xuất: known-limits

- **batDauXep không bao giờ được đặt lại, nên lần «dang-xep» sau trên cùng trang không hỏi lại nữa**
  Người dùng thấy gì: Nếu người dùng để một trang mở suốt nhiều tuần và Kara phải xếp lần hai, dòng «Kara đang xếp…» có thể không tự đổi sang bản tóm tắt. Tải lại trang là thấy.
  Căn cứ: Chỉ gặp khi để trang mở rất lâu, hậu quả là một dòng chờ cũ, không mất dữ liệu và tải lại là hết.
  file: `apps/app/app/(app)/[slug]/okr/khoi-tom-tat.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

