# Review findings: bo-okr-chi-don-vi

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **RongBoPhan bỏ mất nhánh «chưa có trưởng» và nút «Gán trưởng» của khối**
  Người dùng thấy gì: Khi một khối chưa có trưởng và chưa có mục tiêu riêng, quản trị viên không còn thấy câu báo «chưa có trưởng» và nút đi tới trang gán trưởng như trước. Họ vẫn gán được trưởng ở Cài đặt, nhưng phải tự biết chỗ đó.
  Căn cứ: Hậu quả nhẹ: không mất dữ liệu, chỉ mất một lối tắt, và quản trị viên vẫn gán được trưởng từ Cài đặt; việc phục hồi lối tắt có thể làm riêng sau.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx`
  severity: low
  Đề xuất: known-limits

- **Thêm một bản `demMucTieu` thứ hai, lệch cách xử lý số 0 so với bản trong okr.ts**
  Người dùng thấy gì: Người dùng không thấy gì sai hôm nay. Về sau, câu chữ «n mục tiêu» ở menu và ở các chỗ khác có thể lệch nhau nếu chỉ sửa một nơi.
  Căn cứ: Không ảnh hưởng người dùng lúc này và không mất dữ liệu; chỉ là rủi ro bảo trì, dọn lúc nào tiện cũng được.
  file: `apps/app/lib/messages/okr-vo-khu.ts`
  severity: low
  Đề xuất: wont-fix

- **E9: kiểm «thẻ con không có mục tiêu của phòng ban con» đậu suông khi thẻ chưa tải xong, lỗi tải, hoặc không có tên nào để dò**
  Người dùng thấy gì: Bằng chứng nghiệm thu trên màn có thể báo đạt dù thẻ con chưa hiện nội dung, nên nếu mục tiêu của phòng con còn lẫn vào bộ của khối thì người ký có thể không biết.
  Căn cứ: Không ảnh hưởng người dùng cuối trực tiếp, nhưng làm giảm độ tin của chữ ký nghiệm thu; kiểm lại bằng mắt ở phiên đo là đủ, sửa thước rẻ và có thể làm sau.
  file: `_acceptance/bo-okr-chi-don-vi/rang/man-bo-okr-chi-don-vi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính đứng một mình): bcd-hop-tuan-goc kiểm 'không có [data-don-vi-co-kr]' trong khi toanCanh giả treo mãi, nên chốt chặn này không bao giờ đỏ được**
  Người dùng thấy gì: Nếu danh sách «Đơn vị có KR» của Họp tuần vô tình quay lại, một chốt của bài kiểm sẽ không bắt được, dù các chốt khác vẫn có thể bắt.
  Căn cứ: Người dùng không bị ảnh hưởng hôm nay; chỉ làm lưới an toàn chống hồi quy mỏng hơn đã khai, và có thể bù về sau.
  file: `apps/app/test/bo-okr-chi-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên ma trận lớp nhưng ô không đo được): bcd-gon tuyên 12 ô với 'tRPC giả theo đầu ra thật', nhưng 9 ô hop-tuan/viec/cham chỉ đo trên khung xương đang tải**
  Người dùng thấy gì: Phần lớn thẻ Họp tuần, Việc, Chấm điểm chưa được bài kiểm tự động xem ở trạng thái có dữ liệu, nên lưới, mục gập hay ô chọn đơn vị có thể quay lại mà không bị bắt.
  Căn cứ: Không hỏng gì cho người dùng hôm nay; chỉ là kiểm tra phủ ít hơn lời khai, và lỗi nếu có sẽ hiện ra ở phiên đo trên màn thật.
  file: `apps/app/test/bo-okr-chi-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính đứng một mình): rang demTheKhac kết luận 'không có phòng ban con' chỉ vì thiếu chữ, không có đối chứng dương rằng nội dung thẻ đã tải**
  Người dùng thấy gì: Phép kiểm trên màn cho ba thẻ con còn lại có thể báo đạt khi thẻ chưa tải xong, nên việc phòng con có lẫn mục tiêu vào hay không chưa chắc được xác nhận.
  Căn cứ: Không ảnh hưởng người dùng cuối trực tiếp; chỉ làm bằng chứng nghiệm thu yếu hơn, kiểm lại bằng mắt được và sửa thước là việc rẻ, làm sau.
  file: `_acceptance/bo-okr-chi-don-vi/rang/man-bo-okr-chi-don-vi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (lời hứa là quan hệ ba nguồn, nhưng phép so lặng lẽ rớt còn hai nguồn): quanHe coi ô số thiếu là khớp**
  Người dùng thấy gì: Nếu ô số đầu thẻ chưa đọc được lúc đo, bằng chứng vẫn báo «khớp ba nguồn» dù mới so hai nguồn, nên một con số lệch ở ô đó có thể lọt qua lúc ký.
  Căn cứ: Người dùng chưa thấy số sai nào; đây chỉ là chỗ bằng chứng có thể yếu hơn lời khai, kiểm lại bằng mắt ở phiên đo là đủ và sửa thước rẻ.
  file: `_acceptance/bo-okr-chi-don-vi/rang/man-bo-okr-chi-don-vi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): khung-cho-don-vi dùng hàng công cụ tự dựng có [data-chon-don-vi] mà production không còn sinh ra**
  Người dùng thấy gì: Một số bài kiểm khung chờ vẫn xanh nhưng đang đo một ô chọn đơn vị mà màn thật không còn có, nên chúng không nói gì về khung chờ người dùng thật thấy.
  Căn cứ: Không ảnh hưởng người dùng; chỉ là bài kiểm cũ kém ý nghĩa, dọn khi sửa khu này lần sau là đủ.
  file: `apps/app/test/khung-cho-don-vi.dom.tsx`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 4 (thông điệp đỏ ghim trong CHIEU DO không tới được): bcd-da-bo với bản sao useState đỏ ở chỗ khác, không ra «tai lai mat trang thai»**
  Người dùng thấy gì: Nếu nút «Đã bỏ» không giữ trạng thái khi tải lại thì bài kiểm vẫn bắt được, chỉ là dòng báo lỗi không đúng như đã ghi trong hồ sơ.
  Căn cứ: Không ảnh hưởng người dùng và bài kiểm vẫn đỏ đúng chiều; chỉ lệch một dòng chữ báo lỗi, không đáng tốn công sửa.
  file: `apps/app/test/bo-okr-chi-don-vi.dom.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
