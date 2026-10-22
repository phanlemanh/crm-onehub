# Review findings: hop-dong-mau

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bộ chặn hợp đồng mẫu viết lại câu lỗi của okr-mau bằng cách cắt chuỗi theo một tiền tố chép tay**
  Người dùng thấy gì: Câu từ chối khi trỏ nhầm vào máy thật hiện vẫn ra đúng. Nhưng nếu sau này câu của lệnh OKR mẫu được đổi chữ, câu của lệnh hợp đồng mẫu có thể ra lủng củng hoặc hai câu từ chối nói khác kiểu nhau.
  Căn cứ: Hậu quả chỉ là câu báo lỗi xấu đi, lệnh vẫn chặn đúng và không mất hay lộ dữ liệu; sửa lúc nào cũng rẻ khi có người đổi câu bên kia.
  file: `apps/api/scripts/hop-dong-mau/chan.ts`
  severity: low
  Đề xuất: known-limits

- **Lệnh nạp mẫu dựng nguyên AppModule nên tự kích hoạt xả hàng đợi agent lúc khởi động**
  Người dùng thấy gì: Chạy lệnh nạp hợp đồng mẫu trên máy dev đã bật khoá agent có thể làm agent tự xử lý luôn các việc đang chờ trên máy đó, dù người chạy chỉ muốn gắn sáu tệp mẫu.
  Căn cứ: Chỉ xảy ra trên máy dev đã bật agent thật, không chạm production, nhưng đã từng xả hàng tồn ngoài ý muốn nên nên ghi rõ để người chạy đếm việc chờ trước.
  file: `apps/api/scripts/hop-dong-mau/lenh.ts`
  severity: low
  Đề xuất: known-limits

- **Thiếu migration kiểu Tệp thì lệnh đã ghi bản ghi rồi mới hỏng, trái với docs «không ghi gì»**
  Người dùng thấy gì: Nếu kho chưa chạy bản cập nhật cho kiểu Tệp, lệnh sẽ báo lỗi khó hiểu của máy và để lại một số bản ghi mẫu dở dang, trong khi tài liệu hứa là không ghi gì.
  Căn cứ: Chỉ gặp ở kho dev chưa cập nhật, người dùng tự xử được bằng cách chạy lệnh cập nhật rồi nạp lại, và các bản ghi mẫu dở dang không làm mất dữ liệu thật.
  file: `apps/api/scripts/hop-dong-mau/nap.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3: chỉ kiểm chuỗi `doan` có trong chữ, không kiểm quan hệ đoạn chữ ↔ giá trị đáp án**
  Người dùng thấy gì: Bài kiểm chưa tự bắt được trường hợp đáp án và chữ trong hợp đồng mẫu cùng ghi sai một kiểu, ví dụ đảo ngày với tháng. Khi đó bài đo độ đúng của Kara đọc hợp đồng sau này sẽ chấm theo đáp án sai.
  Căn cứ: Sai sót chỉ có thể do người sinh bộ mẫu ghi nhầm một lần và sẽ lộ ra khi đo Kara; bộ mẫu nhỏ, sáu tệp, người đọc soát lại bằng mắt được và sửa rẻ.
  file: `apps/agent/test/hop-dong-mau.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4: ca «cho chạy» của hdm-chan chỉ có assertion âm tính**
  Người dùng thấy gì: Nếu lệnh hỏng vì một lý do khác trước khi tới bước nạp trên máy cục bộ, bài kiểm vẫn báo xanh. Người dùng có thể tưởng lệnh chạy được trên máy mình trong khi nó dừng sớm.
  Căn cứ: Không mất hay lộ dữ liệu, và nếu lệnh hỏng thật người chạy thấy ngay khi dùng và chạy lại được; phần quan trọng là việc chặn máy xa vẫn được đo đúng.
  file: `apps/api/test/hop-dong-mau.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: ca «chạy dở» chỉ kiểm r1.ma khác 0, không ghim chỗ hỏng**
  Người dùng thấy gì: Bài kiểm chưa chứng minh chắc rằng lần chạy bị ngắt thật sự dừng đúng sau tệp thứ ba. Nếu nó dừng sớm hơn thì tình huống chạy dở rồi chạy tiếp vẫn chưa được thử thật.
  Căn cứ: Kết quả cuối vẫn được kiểm là không nhân đôi tệp, nên người dùng không bị mất hay thừa dữ liệu; chỉ là độ tin cậy của một tình huống hiếm kém hơn mức mong muốn.
  file: `apps/api/test/hop-dong-mau.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: đối chứng dương của khoTat đổi cả fixture, không phải bật lại khoá trên cùng đường**
  Người dùng thấy gì: Bài kiểm chưa chứng minh được rằng nó phân biệt đúng giữa có khoá và không có khoá trên cùng một cách chạy. Một lỗi nhận diện khoá có thể lọt qua mà vẫn báo xanh.
  Căn cứ: Hậu quả nhẹ: nếu nhận diện khoá sai, người chạy sẽ thấy lệnh báo thiếu khoá khi đã đặt và tự sửa được; không ghi gì vào kho.
  file: `apps/api/test/hop-dong-mau.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5/3: kiểm thứ tự «chặn trước mọi import động» chỉ bằng indexOf của một chuỗi cố định**
  Người dùng thấy gì: Bài kiểm chỉ canh vị trí của một dòng cố định. Nếu sau này ai thêm một bước nạp kho trước bộ chặn bằng cách khác, bài vẫn xanh và lệnh có thể chạm kho trước khi bị chặn.
  Căn cứ: Hiện lệnh chặn đúng và các ca chạy thật vẫn đo việc chặn; rủi ro chỉ xuất hiện nếu ai đó sửa mã sau này, và lúc đó các ca chạy thật có thể bắt được.
  file: `apps/api/test/hop-dong-mau.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: bộ quét ghi thẳng tuyên bắt cả lớp nhưng đối chứng dương chỉ có một điểm**
  Người dùng thấy gì: Bộ quét cấm ghi thẳng vào kho mới được chứng minh biết báo đỏ ở một dạng ghi. Một số dạng ghi lén khác nếu có ai thêm sau này có thể lọt qua.
  Căn cứ: Hiện không có dạng ghi thẳng nào bị phát hiện, nên người dùng không thấy ảnh hưởng; chỉ là lưới an toàn cho thay đổi tương lai còn thưa.
  file: `apps/api/test/hop-dong-mau.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2: kho Blob giả viết theo khuôn của lệnh nạp, bỏ qua hợp đồng URL ký thật của DA19**
  Người dùng thấy gì: Bài kiểm dùng kho tệp giả dễ tính hơn kho thật, nên nếu lệnh gửi tệp sai loại hay sai kích thước so với luật của kho thật thì bài kiểm không phát hiện. Lỗi đó chỉ lộ khi chạy lệnh trên kho tệp thật.
  Căn cứ: Đường ghi lên kho thật đã được đo ở hàng DA19, và nếu lỗi lộ ra khi chạy thật thì người dùng chỉ cần chạy lại sau khi sửa, không mất dữ liệu.
  file: `apps/api/test/hop-dong-mau-san.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
