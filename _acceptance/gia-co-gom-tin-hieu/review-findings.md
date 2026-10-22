# Review findings: gia-co-gom-tin-hieu (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Unreadable session output is silently treated as having no denied tool calls**
  Người dùng thấy gì: Nếu kết quả của phiên gom đổi định dạng và không đọc được, nhật ký sẽ không báo gì về các thao tác bị từ chối, trông y như lượt không có thao tác nào bị chặn. Lượt vẫn giao đề xuất bình thường, chỉ mất một dòng cảnh báo giúp chẩn đoán.
  Căn cứ: Chỉ mất thông tin chẩn đoán trong nhật ký, không lộ khoá hay đẩy sai thứ gì, và người vận hành đọc nhật ký thô vẫn thấy được; sửa sau rẻ.
  file: `scripts/tin-hieu/gom-lich.ts`
  severity: medium
  Đề xuất: known-limits

- **The 64 MB buffer-size number is written inline twice in the same file**
  Người dùng thấy gì: Một vài con số chỉnh được của lịch gom nằm rải trong mã thay vì gom một chỗ, nên người muốn đổi phải tự đi tìm. Người dùng cuối không thấy khác biệt nào.
  Căn cứ: Chỉ là chuyện gọn gàng cho người sửa mã, không ảnh hưởng hành vi hay an toàn, nên chi phí sửa vượt hậu quả.
  file: `scripts/tin-hieu/gom-lich.ts`
  severity: low
  Đề xuất: wont-fix

- **`phienBanToiThieu` is defined in the config but nothing reads it; the version check copies the number instead**
  Người dùng thấy gì: Số phiên bản tối thiểu của công cụ gom được khai ở hai nơi, trong đó một nơi không có tác dụng. Nếu ai nâng mức tối thiểu ở nơi không tác dụng, việc kiểm không đổi theo.
  Căn cứ: Ngưỡng hiện tại vẫn được kiểm đúng, chỉ có nguy cơ nhỏ khi sau này ai đó sửa nhầm chỗ; dọn là việc vài phút lúc nào cũng làm được.
  file: `scripts/tin-hieu/gom-cau-hinh.ts`
  severity: low
  Đề xuất: wont-fix

- **Disk scan for the repo token misses the base64 auth-header form, which is how git and actions/checkout actually store it**
  Người dùng thấy gì: Bước kiểm xem token có nằm sẵn trên đĩa trước khi chạy phiên gom chỉ tìm token ở dạng chữ gốc, nên sẽ bỏ sót trường hợp token được lưu dưới dạng mã hoá trong cấu hình git. Khi đó lượt vẫn chạy dù token nằm trên đĩa trong tầm với của phiên.
  Căn cứ: Hậu quả có thể nặng vì lộ quyền ghi kho, nhưng bước lấy mã đã được đặt để không lưu token nên tình huống này chỉ xảy ra khi tệp lịch bị sửa sai; đây là lưới phụ, sửa rẻ nên nên ghi rõ để chủ kho cân nhắc.
  file: `scripts/tin-hieu/gom-lich.ts`
  severity: medium
  Đề xuất: known-limits

- **quetDia treats any grep failure as 'no token on disk'**
  Người dùng thấy gì: Nếu công cụ tìm chữ trên đĩa không chạy được hoặc bị ngắt giữa chừng, bước kiểm token coi như đĩa sạch và vẫn cho phiên gom chạy. Kiểm an toàn này sẽ im lặng bỏ qua thay vì dừng lượt.
  Căn cứ: Chỉ xảy ra khi máy chạy hỏng bất thường, vốn hiếm trên máy Actions chuẩn, và là lưới phụ chồng lên việc không lưu token; sửa rẻ nhưng không gấp.
  file: `scripts/tin-hieu/gom-lich.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không ghim thông điệp): chiều đỏ của E3 đỏ vì bất kỳ lý do gì**
  Người dùng thấy gì: Một bài kiểm có thể báo đỏ vì lý do khác với lý do nó định chứng, nên khi nó đỏ người đọc không chắc nguyên nhân thật. Sản phẩm giao cho người dùng không đổi.
  Căn cứ: Không ảnh hưởng người dùng hay dữ liệu; chỉ làm kết quả kiểm kém tin cậy hơn một chút và có thể siết sau.
  file: `scripts/tin-hieu/test/gom-gia-co.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không có đối chứng dương): kiểm 'tệp A, B không tồn tại' của E6 chưa bao giờ được chứng là đỏ được**
  Người dùng thấy gì: Bài kiểm khẳng định lệnh do phiên cài vào cấu hình git không chạy chưa từng được thấy đỏ khi lệnh đó thật sự chạy, nên chưa chắc nó bắt được lỗi này. Hành vi thật của lượt không bị chứng minh là sai.
  Căn cứ: Bài kiểm xanh nhưng còn yếu, chưa có hậu quả trực tiếp với người dùng; thêm ca đối chứng sau là việc rẻ.
  file: `scripts/tin-hieu/test/gom-gia-co.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): kiểm 'nhật ký không chứa khoá' của E7 xanh theo cấu tạo**
  Người dùng thấy gì: Bài kiểm nhật ký không lộ khoá dùng cùng cách che với mã thật nên không bắt được lỗi nếu cách che đó bỏ sót một dạng mã hoá. Việc nhật ký có thật sự sạch khoá chưa được chứng độc lập.
  Căn cứ: Lỗi nếu có sẽ làm lộ khoá vào nhật ký, nhưng đây chỉ là khoảng trống bằng chứng chứ chưa thấy lộ thật; thêm kiểm độc lập sau có chi phí vừa phải.
  file: `scripts/tin-hieu/test/gom-gia-co.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): dòng 12 và 13 của E2 xanh rỗng khi bộ đọc không bắt được gì**
  Người dùng thấy gì: Bài kiểm quyền hạn của các skill gom có thể xanh dù không đọc được gì nếu skill đổi cách viết khai báo. Khi đó một thay đổi về quyền của skill có thể lọt qua mà không ai biết.
  Căn cứ: Chỉ xảy ra khi kit đổi cách trình bày, hiện đang bắt được 7 lệnh nên chưa hỏng; lỗi tự lộ ra ở lượt thật vì lượt đỏ và nhật ký ghi công cụ bị từ chối.
  file: `scripts/tin-hieu/test/gom-gia-co.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên bố quét cả lớp nhưng chỉ có một phần tử): 'mọi ref khác trên origin' của E3 chỉ có mỗi onehub**
  Người dùng thấy gì: Bài kiểm nói rằng mọi nhánh và thẻ khác trên kho không bị đổi nhưng thực tế chỉ có một nhánh để so. Một lượt làm đổi thẻ hay nhánh khác vẫn qua bài kiểm này.
  Căn cứ: Khả năng lượt đẩy sang ref khác rất thấp vì các lệnh đẩy đã bị giới hạn, và thêm dữ liệu mẫu chỉ làm bài kiểm đầy đủ hơn chứ không đổi hành vi.
  file: `scripts/tin-hieu/test/gom-gia-co.test.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
