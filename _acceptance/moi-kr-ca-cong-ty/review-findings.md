# Review findings: moi-kr-ca-cong-ty (vòng 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Kiểu trả về của okr.objective viết tay thay vì lấy từ contract z.infer**
  Người dùng thấy gì: Người dùng không thấy gì khác đi. Chỉ là một bài kiểm nội bộ khai kiểu dữ liệu theo cách dễ lệch nếu sau này đổi tên một trường.
  Căn cứ: Không ảnh hưởng tới người dùng và không mất dữ liệu; chỉ là nợ gọn gàng trong bài kiểm, sửa lúc nào cũng rẻ nên không cần mở việc riêng.
  file: `apps/api/test/okr-moi-kr.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **docBang vẫn đọc nhãn tổng [data-tong-kr] nhưng sau vòng này không còn chỗ nào dùng**
  Người dùng thấy gì: Người dùng không thấy gì khác đi. Công cụ đo màn còn đọc một con số nhãn tổng mà không dùng tới, có thể làm người bảo trì tưởng nó vẫn được đối chiếu.
  Căn cứ: Không tác động tới người dùng cuối hay dữ liệu; chỉ gây hiểu nhầm nhẹ cho người bảo trì và gỡ đi rất rẻ bất cứ lúc nào.
  file: `_acceptance/moi-kr-ca-cong-ty/rang/do-man.mjs`
  severity: low
  Đề xuất: wont-fix

- **Phép đối chiếu vạch của KR ngoài khối «của tôi» tự đúng khi okr.moiKr trả expected=null**
  Người dùng thấy gì: Nếu sau này danh sách Mọi KR làm mất vạch kỳ vọng của một số KR nằm ngoài mục «KR của tôi», bài kiểm hiện tại có thể không báo đỏ. Hiện chưa có bằng chứng số liệu đang sai.
  Căn cứ: Hôm nay người dùng không bị ảnh hưởng, rủi ro chỉ là một lỗi tương lai lọt qua kiểm tra; ghi lại để biết thước này còn lỏng, sửa lúc nào cũng được.
  file: `apps/api/test/okr-moi-kr.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (lời hứa là quan hệ giữa các giá trị, nhưng assert so vạch của KR ngoài khối «KR của tôi» với chính giá trị cùng nguồn): muon-k1 vẫn không có vạch nào bị ghim**
  Người dùng thấy gì: Vạch kỳ vọng tính từ ngày công bố của một số KR chưa có giá trị viết trước để so, nên nếu cách tính bị đổi sang ngày tạo thì bài kiểm này có thể vẫn xanh. Hôm nay chưa thấy số nào sai trên màn.
  Căn cứ: Không làm người dùng thấy số sai ngay bây giờ, chỉ làm lưới an toàn mỏng ở một chỗ; có thể ghi vào hạn chế đã biết và bổ sung giá trị đối chiếu khi có dịp.
  file: `apps/api/test/okr-moi-kr.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Ô «KR trượt» hiện 0 khi truy vấn okr.moiKr lỗi (r1)**
  Người dùng thấy gì: Khi tải số KR trượt bị lỗi (mất mạng, máy chủ lỗi), ô «KR trượt» ở Sức khoẻ vẫn hiện số 0. Người xem có thể tưởng không có KR nào trượt.
  Căn cứ: Số sai chỉ xuất hiện lúc tải lỗi và tự đúng lại khi tải lại trang; không mất dữ liệu, nhưng có thể làm lãnh đạo hiểu nhầm trong lúc đó.
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/o-kr-truot.tsx`
  severity: medium
  Đề xuất: known-limits

- **Cách suy tình trạng KR (mốc xong/chưa, nhịp) bị chép thêm một bản thay vì dùng chung (r1)**
  Người dùng thấy gì: Hiện người dùng thấy tình trạng KR giống nhau ở mọi màn. Nhưng nếu sau này đổi ngưỡng mà sót một chỗ thì hai màn có thể báo tình trạng khác nhau cho cùng một KR.
  Căn cứ: Chưa gây hại gì cho người dùng hôm nay; rủi ro chỉ xuất hiện khi ai đó đổi luật sau này, và dọn gọn thuộc việc bảo trì riêng.
  file: `apps/api/src/okr/moi-kr.ts`
  severity: low
  Đề xuất: wont-fix

- **Bảng nhãn tình trạng chép lại bảng của PaceIndicator (r1)**
  Người dùng thấy gì: Nhãn tình trạng ở chip lọc hiện đúng. Nếu sau này đổi tên một nhãn ở một nơi mà quên nơi kia, chip lọc và chấm trạng thái có thể gọi cùng một tình trạng bằng hai tên khác nhau.
  Căn cứ: Không ảnh hưởng người dùng hôm nay và sửa lúc nào cũng được; chi phí sửa lớn hơn hậu quả hiện có.
  file: `apps/app/app/(app)/[slug]/okr/moi-kr/moi-kr.tsx`
  severity: low
  Đề xuất: wont-fix

- **Ô «KR trượt» hiện 0 khi truy vấn moiKr lỗi (lỗi bị nuốt thành số đẹp) (r1)**
  Người dùng thấy gì: Khi không tải được số KR trượt, ô vẫn hiện 0 và vẫn bấm sang trang danh sách, không có dấu hiệu lỗi hay nút thử lại. Người xem dễ hiểu là công ty không có KR nào trượt.
  Căn cứ: Chỉ sai trong lúc lỗi tải và tự hết khi tải lại; không mất dữ liệu, nhưng số 0 trông như kết quả thật nên dễ gây hiểu nhầm.
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/o-kr-truot.tsx`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

