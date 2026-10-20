## Trong hợp đồng

- **Tệp lịch không truyền CLAUDE_CODE_OAUTH_TOKEN, trong khi thông báo lỗi và mã đều coi nó là khoá thay thế được**
  file: `.github/workflows/tin-hieu-gom.yml:56`
  severity: medium
  AC: AC-7
  source: bugs
  detail: `GOM.khoaMoHinh` nhận ANTHROPIC_API_KEY hoặc CLAUDE_CODE_OAUTH_TOKEN. `GOM.thongDiep.thieuKhoa` cũng bảo chủ kho «đặt bí mật ANTHROPIC_API_KEY (hoặc CLAUDE_CODE_OAUTH_TOKEN)». Nhưng bước «Gom tín hiệu…» chỉ đưa `ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}` vào env. Chủ kho làm đúng lời thông báo, chỉ đặt bí mật CLAUDE_CODE_OAUTH_TOKEN, thì biến đó không bao giờ tới tiến trình: mọi lượt có tín hiệu vẫn đỏ «thiếu khoá mô hình» mãi, và lời thông báo dẫn người sửa sai chỗ. Cách sửa: thêm `CLAUDE_CODE_OAUTH_TOKEN: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}` vào env của bước, hoặc bỏ phương án OAuth khỏi khoaMoHinh và khỏi thông báo.
  rationale: AC-7 đòi khi thiếu khoá mô hình, lượt in câu nói đúng bí mật nào chủ kho phải đặt; thông báo hiện dẫn chủ kho đặt bí mật mà tệp lịch không bao giờ truyền vào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Phiên gom được phép chạy node tuỳ ý, mà biến môi trường của nó đang chứa token ghi kho và khoá mô hình**
  Người dùng thấy gì: Nội dung tín hiệu do người ngoài nhập có thể cài lời dặn khiến trợ lý gom chạy lệnh tuỳ ý và lấy được chìa khoá ghi vào kho hay chìa khoá dùng mô hình. Bước kiểm sau phiên không phát hiện được kiểu lạm dụng này.
  Căn cứ: Hậu quả nặng nếu bị lợi dụng (lộ chìa khoá, đẩy mã thẳng vào kho) và không tự gỡ được sau khi chìa khoá đã lộ, nhưng cần có người cố ý gửi tín hiệu độc hại; nên làm thành việc gia cố riêng thay vì nhét vào tính năng này.
  file: `scripts/tin-hieu/gom-cau-hinh.ts`
  severity: high
  Đề xuất: new-contract

- **Đọc tệp lộ trình hỏng thì nuốt thành mảng rỗng, và khuôn hàng lộ trình lỏng hơn dữ liệu thật**
  Người dùng thấy gì: Nếu tệp lộ trình bị hỏng, đề xuất vẫn được giao nhưng thân PR ghi mọi nhóm là chưa có hàng đề xuất, khiến chủ kho tưởng máy chưa cắt hàng chứ không biết tệp đọc không được. Số đo thời gian chờ cũng có thể lệch mà không báo.
  Căn cứ: Chỉ làm PR đề xuất kém thông tin chứ không mất dữ liệu, chủ kho nhìn thấy ngay thân PR lạ và chạy lại được; tệp lộ trình hỏng là hiếm vì đã có kiểm tra riêng của kho.
  file: `scripts/tin-hieu/gom-lich.ts`
  severity: medium
  Đề xuất: known-limits

- **Biến môi trường mới của lịch gom chưa được khai trong .env.example**
  Người dùng thấy gì: Người tự dựng kho sẽ không thấy các chìa khoá của lịch gom trong tệp mẫu cấu hình, nên có thể không biết cần đặt gì cho lịch này. Chức năng vẫn chạy bình thường.
  Căn cứ: Chỉ là thiếu một dòng ghi chú, không ảnh hưởng người dùng đang dùng và sửa rất rẻ bất cứ lúc nào, nên ghi nhận rồi bổ sung ở lần chạm tới sau.
  file: `scripts/tin-hieu/gom-lich.ts`
  severity: medium
  Đề xuất: known-limits

- **Đẩy ép không có lease: sửa của người làm trong lúc phiên gom chạy (tới 25 phút) bị ghi đè mà không báo**
  Người dùng thấy gì: Nếu chủ kho đẩy sửa lên nhánh đề xuất đúng lúc máy đang gom (có thể kéo dài tới 25 phút), lần đẩy của máy sẽ đè mất sửa đó mà không báo.
  Căn cứ: Chỉ xảy ra khi chủ kho sửa đúng trong khoảng vài chục phút máy đang chạy, bản sửa vẫn còn trong máy chủ kho để lấy lại; hiếm nhưng gây khó chịu, sửa vừa phải.
  file: `scripts/tin-hieu/gom-lich.ts`
  severity: medium
  Đề xuất: known-limits

- **Kiểm sửa của người nuốt lỗi: lệnh fetch nhánh đề xuất và lệnh log không được soát mã thoát**
  Người dùng thấy gì: Khi lệnh lấy nhánh đề xuất về bị hỏng, máy có thể coi như không có sửa của người và đẩy đè lên bản chủ kho đã sửa.
  Căn cứ: Cần lỗi mạng hoặc git đúng lúc có PR mở kèm sửa của người nên hiếm; mất bản sửa thì chủ kho phải làm lại nhưng bản cũ còn trong lịch sử kho..
  file: `scripts/tin-hieu/gom-lich.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên cả lớp mà chỉ có điểm-case): E6 ca 2 hứa «chứa tên MỌI nhóm bị phủ quyết» nhưng chỉ kiểm G1**
  Người dùng thấy gì: Bài kiểm chỉ thử một trong hai nhóm bị phủ quyết, nên nếu máy đánh rơi nhóm còn lại khi dặn lại mô hình thì bài kiểm vẫn báo xanh.
  Căn cứ: Người dùng không gặp gì ngay; rủi ro là một lỗi sau này lọt qua bài kiểm, và bổ sung ca kiểm rất rẻ.
  file: `scripts/tin-hieu/test/gom-lich.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (dữ liệu giả viết tay đúng khuôn bên đọc): bộ vẽ trang lộ trình trong kho tạm là bản giả, dựng sẵn để in đúng cau_giao mà bài kiểm đi tìm**
  Người dùng thấy gì: Bài kiểm trang lộ trình dùng bản vẽ giả nên chưa chứng minh được hàng do mô hình viết sẽ hiện đúng trên trang lộ trình thật; một hàng sai khuôn có thể làm trang thật thành trang báo lỗi mà bài kiểm vẫn xanh.
  Căn cứ: Chủ kho sẽ thấy trang lỗi ngay trên PR nháp và sửa hay đóng được, không mất dữ liệu; thêm một vòng kiểm với bộ vẽ thật là việc vừa phải, nên cân nhắc ở lần chạy thật đầu.
  file: `scripts/tin-hieu/test/gom-kho-tam.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (kiểm «chuỗi có mặt» trong khi lời hứa là quan hệ): E2 dòng 6 không buộc cau_giao vào đúng nhóm của nó**
  Người dùng thấy gì: Bài kiểm không phân biệt được trường hợp hàng đề xuất của nhóm này bị ghi sang dòng của nhóm khác trong thân PR.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, chỉ là bài kiểm chưa đủ chặt để bắt một lỗi có thể xảy ra sau này; sửa rẻ.
  file: `scripts/tin-hieu/test/gom-lich.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên ma trận mà thiếu ô): «ma trận ngưỡng 4 ô giờ × tỉ lệ» chỉ kiểm từng chiều riêng, ô (>48 giờ, ≥1/5) không có**
  Người dùng thấy gì: Bài kiểm lệnh đo chưa thử trường hợp vừa chờ quá lâu vừa bị sửa nhiều, nên lỗi riêng ở trường hợp kép này sẽ không bị bắt.
  Căn cứ: Lệnh đo chỉ để đọc, sai thì chủ kho thấy con số lạ và không mất dữ liệu; thêm một ô kiểm rất rẻ.
  file: `scripts/tin-hieu/test/do-gom.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (kiểm âm tính một mình): đối chứng của E6 (PR đã gộp) chỉ kiểm «không phải thông điệp phủ quyết»**
  Người dùng thấy gì: Bài kiểm trường hợp PR đã gộp chỉ chắc rằng máy không nói là bị phủ quyết, chứ không chắc máy làm tiếp đúng việc, nên một lỗi khác ở nhánh này có thể lọt.
  Căn cứ: Không tác động người dùng ngay; chỉ là bài kiểm đối chứng còn lỏng, bổ sung thêm vài dòng kiểm là xong.
  file: `scripts/tin-hieu/test/gom-lich.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
