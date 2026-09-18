---
slug: truong-tu-tao-o-cai-dat
at: 2026-09-18T01:35:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | evals | Bảng mười lăm gợi ý người ký đã chốt không có ma trận toàn phần ở đâu cả. E1 chỉ ghim số của nhóm Công ty; E2 tuyên lời hứa LỚP nhưng chỉ khẳng định mỗi nhóm bốn trở lên, nhãn có dấu, lựa chọn từ hai trở lên — số khẳng định không bằng số phần tử của lớp; E9 so trường vừa tạo với chính module gợi ý nên tự tham chiếu. Tái phạm [man-xin-quyen-co-rang#F1] | Người viết code ship Cá nhân bốn gợi ý thay vì năm, rơi «Kênh liên lạc quen», và bộ lựa chọn «Phân khúc chuyên» mất «Đất nền» cùng «Dự án». E2 xanh vì bốn vẫn lớn hơn bốn trừ một, E1 xanh vì chỉ đo Công ty, E3 xanh vì không trùng khoá bộ cào, E9 xanh vì so với chính module đã ship. Mọi thước xanh, phạm vi người ký co lại lặng lẽ | Đóng băng bảng mười lăm dòng thành hằng viết tay trong tệp thước; so từng dòng ba vế, lựa chọn so hai chiều đúng thứ tự; khẳng định tổng mười lăm và không dòng nào ngoài bảng; chiều đỏ ba lần cho ba lớp lỗi khác nhau | fixed: thêm AC-15 và E16 — hằng mười lăm dòng nằm trong tệp thước, không nạp từ module bị đo; ba chiều đỏ ghim nhãn, ghim tên kiểu, ghim tên lựa chọn |
| P0 | contract | Trạng thái chính của trang mới, ba nhóm trường chuẩn và đang dùng và đã lưu trữ, không có tiêu chí nào. Trục nguồn gốc trường khai là do AC-8 và AC-12 phủ, nhưng AC-8 chỉ nói chín khoá không trùng và AC-12 chỉ nói trạng thái rỗng với lỗi | Trang mới truyền thiếu dữ liệu trường chuẩn nên chỉ hiện nhóm đang dùng; trên thẻ Cá nhân người quản trị không thấy chín trường bộ cào lẫn nhóm chuẩn, tưởng dữ liệu mất. E6 xanh vì chỉ đếm thẻ, E12 xanh vì đo thực thể rỗng, E10 xanh vì khẳng định lưu trữ bằng API chứ không đọc nhóm trên màn | Thêm tiêu chí ba nhóm với tiêu đề đọc được, nhóm chuẩn có ít nhất một phần tử, nhóm đang dùng chứa đủ chín khoá bộ cào, và trường vừa lưu trữ chuyển nhóm; đối chứng số phần tử từng nhóm với API | fixed: thêm AC-14 và E15, đối chứng số phần tử hai đường API, nhập LISTING chứ không chép tay chín khoá |
| P1 | contract | AC-11 tuyên lời hứa LỚP «mọi việc như trước» mà không liệt kê lớp, không mang nhãn xuyên tầng dù mọi việc trong khay đều gọi API, và E11 chỉ khẳng định ba điều ở tầng giao diện. Thêm nữa vòng này thay trọn bộ gợi ý mà khay cũng đọc bộ đó, nên khay bị đổi nội dung chứ không bất động. Tái phạm [man-xin-quyen-co-rang#F1] | Khoá gợi ý mới sinh ra khoá đã tồn tại trên một khu làm việc thật nên khối gợi ý trong khay ném khi dựng, hoặc nút xếp lại trong khay hồi quy vì thứ tự gợi ý đổi. E11 vẫn xanh vì ba điều nó đo đều còn đúng | Viết sáu việc của trục việc-người-quản-trị thành sáu khẳng định trong E11, mỗi việc xác nhận ở tầng sau; gắn nhãn xuyên tầng cho AC-11 và lớp tác-động-tầng-sau cho E11 | fixed: AC-11 viết lại thành sáu việc có tên, mang nhãn xuyên tầng; E11 thêm lớp tác-động-tầng-sau và sáu khẳng định, trong đó xếp lại so nguyên cả dãy |
| P1 | evals | Điều khoản chung chỉ ràng buộc các thước chạy trên máy chủ. Các thước đọc tệp nằm ngoài, mà chính chúng là chỗ có cặp hai chiều trên bản sao — không dòng nào nói bản sao ở đâu và cấm hardcode gốc kho. Tái phạm [ma-tran-phai-co-chieu-song#F1] | Thước bộ gợi ý giải đường dẫn theo gốc kho cố định. Lượt đột biến chèn «Territory» với «AMER» vào bản sao, script lại nhập module của checkout chính chưa đột biến: không thấy «AMER» nên thoát 0. Hồ sơ ghi cặp hai chiều đã chạy, thực tế thước chưa bao giờ đọc mã đã đột biến | Mở điều khoản ra toàn bộ thước, kể cả thước đọc tệp; thêm khẳng định tự khai in đường dẫn tuyệt đối của mọi module vừa nạp, khác gốc cây thì thoát mã hai; chiều đỏ phải khẳng định THẤY chuỗi chứ không chỉ khẳng định đỏ | fixed: điều khoản chung viết lại sáu điều, áp E1 đến E16; điều hai buộc in đường dẫn và so gốc cây; điều năm buộc chiều đỏ gọi tên vật bị phá |
| P1 | contract | Dòng thứ ba của Đường đo đổi vị ngữ của ngưỡng: ngưỡng nói «người quản trị tạo», hợp đồng đếm «loại chín khoá bộ cào». Hồ sơ cơ hội tự ghi «chưa có dấu phân biệt, là việc bước thiết kế phải quyết», mà sổ quyết định không có dòng nào quyết việc đó | Bốn tuần sau khi bật, phép đếm ra bốn trường, ba trong đó là trường rác do thước E9 và E10 để lại trên cùng cơ sở dữ liệu khi một lượt bị cắt ngang. Không cột nào nói ai tạo nên không phân biệt được, Cổng Giá trị không ký được theo đúng ngưỡng đã ký | Ghi một quyết định về dấu phân biệt, rồi hoặc thêm tiêu chí ghi danh tính người tạo, hoặc sửa lại dòng ngưỡng trước khi ký chứ không để hai tệp nói hai vị ngữ | fixed: ghi quyết định KHÔNG thêm cột ai tạo, vì chạm lược đồ dữ liệu là đường T3 và thêm một cổng; phép đếm khai rõ là xấp xỉ bằng loại trừ, có mục giới hạn riêng trong hợp đồng để người ký thấy trước khi ký; thước đo buộc đặt tiền tố nhãn để loại được trường rác của chính nó |

## Ngoài bảng, mức thấp, đã định đoạt

- Bàn phím và khổ hẹp của trang mới không có tiêu chí nào. rejected: ba thẻ và
  thanh cuộn ngang dùng nguyên nếp thanh bên Cài đặt đã chạy, không có hình thái
  mới; đã khai ở đặc tả UX mục bốn và ghi vào Notes để người duyệt soi bằng mắt.
- Ảnh chụp mà các thước đòi không kèm khẳng định nào trên ảnh. fixed: thước ba
  thẻ thêm khẳng định hình học, mỗi thẻ phải có hộp khác không và nằm trong khung
  nhìn. Phần còn lại giữ ảnh làm bằng chứng cho người, đúng như quyết định bỏ
  phiên thiết kế đã khai đánh đổi.
- Ngưỡng ba phút đo trên Cá nhân mà thước tạo-từ-gợi-ý lại đo trên Thoả thuận.
  fixed: E9 chạy hai lượt, một trên Cá nhân để khớp ngưỡng, một trên Thoả thuận
  vì nhóm đó trước vòng này không có gợi ý nào.
