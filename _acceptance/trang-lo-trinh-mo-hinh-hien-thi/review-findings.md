# Review findings: trang-lo-trinh-mo-hinh-hien-thi (round 2)

## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

Không có finding mới ở round này.

- **«Trễ» still uses the old rule (any past milestone listing the code) while the milestone now comes from viec_hien, so the two disagree when the keys diverge (r1)**
  Người dùng thấy gì: Khi khối dữ liệu xếp một việc sang mốc sau mà mốc cũ vẫn liệt việc ấy, trang có thể ghi «Trễ N ngày» cho một việc thật ra còn N ngày, và đếm nó vào bộ lọc «Trễ mốc». Dữ liệu thật hiện tại không rơi vào ca này.
  Căn cứ: Hậu quả nhẹ: chỉ nhãn trễ lệch ở ca khoá lệch mà dữ liệu thật hôm nay chưa có, không mất dữ liệu, và người dùng đọc lại mốc thật ngay trên cùng dòng.
  file: `apps/app/components/lo-trinh/viec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): bộ lọc mốc chỉ được kiểm là «không chứa C», không có đối chứng dương (r1)**
  Người dùng thấy gì: Bài kiểm không chứng minh được rằng bộ lọc mốc liệt đủ các mốc hiện, chỉ chứng minh mốc không hiện thì vắng mặt. Nếu sau này bộ lọc rỗng đi, bài kiểm vẫn xanh và người dùng sẽ gặp bộ lọc thiếu mốc.
  Căn cứ: Không ảnh hưởng người dùng hôm nay vì màn Mốc đã có đối chứng dương riêng; rủi ro chỉ là bỏ sót hồi quy sau này, và thêm một dòng kiểm sau này rất rẻ.
  file: `apps/app/test/lo-trinh-mo-hinh.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (không ghim thông điệp): ca phá-thử E5 ghim tiền tố dùng chung cho hai kiểu hỏng (r1)**
  Người dùng thấy gì: Ca thử cố ý làm hỏng trang có thể đỏ vì một lý do khác với lý do dự định, nên ít chắc hơn về việc bài đối chiếu bắt được đúng lỗi lệch việc giữa các mốc. Người dùng không thấy gì thay đổi.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; chỉ làm bằng chứng của bài đối chiếu kém sắc một chút, mà bài đối chiếu chính vẫn chạy trên dữ liệu thật.
  file: `apps/app/test/lo-trinh-mo-hinh.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 (kiểm «chuỗi có mặt» thay cho quan hệ bằng): tên việc ở ca đối chiếu E5 (r1)**
  Người dùng thấy gì: Bài đối chiếu chỉ kiểm tên việc có nằm trong dòng, không kiểm dòng hiện đúng tên ấy; nếu trang hiện thêm chữ thừa vào tên, bài kiểm vẫn xanh. Người dùng có thể thấy tên việc dài hơn tên trên LO-TRINH.html mà không bị báo.
  Căn cứ: Hậu quả nhẹ và tự nhìn thấy được trên màn; dữ liệu không mất và hôm nay trang đang hiện đúng tên.
  file: `apps/app/test/lo-trinh-mo-hinh.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): đếm «tên rỗng = 0» ở bảng cột và ngăn hồ sơ không nhắm trúng phần tử tên của các chỗ ấy (r1)**
  Người dùng thấy gì: Bài kiểm không thật sự soi tên việc trên bảng cột và ngăn hồ sơ, nên nếu hai chỗ đó hiện dòng tên trống thì bài kiểm vẫn xanh. Người dùng sẽ thấy thẻ không tên mà không có bài kiểm nào báo trước.
  Căn cứ: Rủi ro chỉ là hồi quy sau này chưa có lưới bắt; hôm nay các chỗ đó được kiểm ở các bài khác và người dùng tự thấy, tải lại không mất dữ liệu.
  file: `apps/app/test/lo-trinh-mo-hinh.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
