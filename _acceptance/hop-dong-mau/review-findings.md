# Review findings: hop-dong-mau (round 2)

## Trong hợp đồng

- **Hình dạng 3 (đếm thay cho quan hệ): đo «không Blob mồ côi» và «Blob ngoài không đổi» bằng số lượng Blob, không so tên pathname**
  AC: AC-4
  file: `apps/api/test/hop-dong-mau.spec.ts:446`
  severity: medium
  source: measurement
  detail: Dòng 446 (`if (kho.daPut.size !== BO.length)`) và dòng 383 (`if (kho.daPut.size !== BO.length + 1)`) chỉ đếm số Blob còn trong kho giả sau `donHangCho`. Lời hứa của AC-4 là một quan hệ: những Blob còn lại phải đúng là các Blob mà hàng FieldFile đang trỏ tới (`blobPathname`), cộng thêm Blob của người dùng ngoài. Mỗi lần chạy lại hay chạy dở đều PUT thêm Blob có cùng byte với tệp mẫu, rồi để chúng thành Blob mồ côi. Giả sử lượt dọn xoá nhầm Blob đang được tham chiếu, hay xoá Blob `ngoai.pdf`, và giữ lại một Blob mồ côi: số đếm vẫn ra 6 (hay 7), bài vẫn xanh. `anhChup` (dòng 274-288) cũng không cứu được, vì nó đọc `tepTheoTruong` từ DB chứ không đọc kho Blob. Muốn đo đúng thì phải so tập `kho.daPut.keys()` với tập `blobPathname` của FieldFile (cộng pathname của tệp ngoài).
  rationale: AC-4 hứa kho Blob giả giữ đúng sáu Blob của bộ mẫu và tệp ngoài không đổi sau chạy lại; phép đo chỉ đếm nên không chứng minh được lời hứa đó.

- **Hình dạng 4 (chỉ có assert âm): ca chạy dở chỉ đòi lần chạy đầu thoát khác 0, không ghim thông điệp hay trạng thái bị ngắt**
  AC: AC-4
  file: `apps/api/test/hop-dong-mau.spec.ts:427`
  severity: medium
  source: measurement
  detail: Dòng 427-428 (`if (r1.ma === 0) throw ...`) là phép kiểm duy nhất trên lần chạy bị ngắt. Bài không xét `r1.loi` có chứa câu `putHong` (ca put-503) hay `hdm thu: ngat truoc complete` (ca truoc-complete) không. Bài cũng không xét sau r1 có đúng ba tệp đã gắn, `kho.soPut()` bằng 4, và một BlobChoXoa dở hay chưa. Hậu quả: nếu lệnh hỏng vì một lý do khác ngay từ đầu, trước mọi PUT, thì r1 vẫn khác 0, r2 chạy như lần đầu sạch, `daPut.size` vẫn ra 6, và bài xanh mà chưa hề đo kịch bản «ngắt sau tệp thứ ba rồi dọn Blob dở» của AC-4.
  rationale: AC-4 có điều kiện Given là lần chạy bị ngắt sau tệp thứ ba rồi chạy lại; bài không chứng minh được lượt ngắt đúng kiểu đó đã xảy ra.

- **Hình dạng 5 (tuyên cả lớp, đo một điểm): «kiemDuocNap đứng trước MỌI import động» chỉ kiểm một chuỗi import cụ thể bằng indexOf**
  AC: AC-5
  file: `apps/api/test/hop-dong-mau.spec.ts:651`
  severity: medium
  source: measurement
  detail: E5 hứa: «quét AST tệp vào, lời gọi kiemDuocNap phải đứng trước mọi import động của phần nạp». Dòng 651-653 dùng `nguon.indexOf(...)` để so đúng một chuỗi `'await import("./hop-dong-mau/lenh")'` với chuỗi `kiemDuocNapHopDong(process.env)`. Không có AST, không liệt kê các import động. Bộ đi đồ thị cũng không đỡ được chỗ này: `dsNhapTinh` (dòng 556) lọc `i.kind === "import-statement"`, tức là bỏ qua mọi `dynamic-import`. Nếu thêm `await import("@crm/db")` (hay một tệp kéo theo Prisma hoặc @vercel/blob) vào tệp vào, đặt trước bộ chặn, thì cả phép kiểm thứ tự lẫn phép kiểm đồ thị vẫn xanh. Đây là một ca điểm được trình bày như một phép quét cả lớp.
  rationale: AC-5 đòi bộ chặn chạy trước khi mô-đun kho và Blob được nạp, kể cả qua import bắc cầu; phép quét không thấy import động nên không bảo đảm được điều đó.

- **Hình dạng 3 (kiểm «chuỗi có mặt» thay cho quan hệ): đoạn viết và giá trị đáp án được kiểm tách rời, không kiểm đoạn viết có biểu diễn đúng giá trị**
  AC: AC-2
  file: `apps/agent/test/hop-dong-mau.spec.ts:166`
  severity: medium
  source: measurement
  detail: Mục đích của bộ mẫu là mang đáp án để DA23 đo độ đúng khi trích. Lời hứa thật vì thế là một quan hệ: chữ trong tệp nói đúng giá trị ghi trong đáp án. Bài kiểm hai việc riêng. Dòng 147-148 so `t[k]` (giá trị ở dap-an.json) với BANG_GIA_TRI. Dòng 166 kiểm `kq.chu.includes(t.doan[k])`, mà `doan` cũng lấy từ dap-an.json. Không chỗ nào kiểm `doan` có phải là cách viết của `t[k]` hay không, ví dụ «ngày 05 tháng 03 năm 2026» ứng với 2026-03-05, hay «1.250.000.000 đồng» ứng với 1250000000. Nếu bộ dựng in vào PDF «ngày 06 tháng 03 năm 2026» và ghi đúng đoạn đó vào `doan`, trong khi `ngayKy` vẫn là 2026-03-05, thì cả hai phép kiểm đều xanh, và DA23 sẽ chấm điểm theo một đáp án sai. Đối chứng tráo byte HD2 vào ô HD1 chỉ chứng minh thước đọc được đúng tệp, không chứng minh quan hệ giữa đoạn viết và giá trị.
  rationale: AC-2 đòi chữ trong tệp chứa nguyên văn đoạn viết của từng thuộc tính và giá trị đúng bảng; đoạn viết không được ràng với giá trị nên đáp án sai vẫn qua.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **chan.ts sửa chữ của okr-mau bằng cách chép một chuỗi literal rồi cắt ghép chuỗi, thay vì truyền tham số cho bộ chặn**
  Người dùng thấy gì: Lệnh nạp mẫu vẫn từ chối đúng khi trỏ vào production. Nếu sau này ai đổi câu từ chối của bộ OKR mẫu, câu hiện ra cho người chạy lệnh hợp đồng mẫu có thể đọc lủng củng hoặc lặp ý.
  Căn cứ: Chỉ ảnh hưởng chữ của một câu báo lỗi trên lệnh dành cho lập trình viên, không mất dữ liệu và sửa lúc nào cũng được.
  file: `apps/api/scripts/hop-dong-mau/chan.ts`
  severity: low
  Đề xuất: known-limits

- **@crm/validation/hop-dong-mau kéo node:fs vào packages/validation, nơi đến nay chỉ chứa khuôn Zod thuần**
  Người dùng thấy gì: Hôm nay không người dùng nào thấy gì. Nếu sau này một màn hình trong app import nhầm module này thì bản dựng của app sẽ hỏng, và lập trình viên phải sửa trước khi giao.
  Căn cứ: Hậu quả chỉ xảy ra lúc dựng bản, được báo ngay trước khi tới người dùng, nên không có rủi ro mất dữ liệu và sửa lúc đó vẫn rẻ.
  file: `packages/validation/src/hop-dong-mau.ts`
  severity: low
  Đề xuất: known-limits

- **Số chỉnh được viết thẳng trong anhQuet dù đã có BO_DUNG.quet**
  Người dùng thấy gì: Người dựng lại bộ hợp đồng mẫu phải tìm số độ tương phản của bản quét ở trong mã thay vì ở bảng cấu hình. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ là chuyện tiện tay của người sửa bộ dựng hiếm khi chạy; không ảnh hưởng người dùng nên không đáng bỏ công sửa.
  file: `apps/agent/scripts/sinh-hop-dong-mau.ts`
  severity: low
  Đề xuất: wont-fix

- **Biến môi trường mới PHONG_HOP_DONG_MAU không được ghi ở đâu**
  Người dùng thấy gì: Người dựng lại bộ hợp đồng mẫu trên máy không phải Mac sẽ không biết có cách chỉ phông chữ khác, nên phải tự đọc mã mới dựng được.
  Căn cứ: Chỉ chạm người sửa bộ mẫu trên máy lạ, không mất dữ liệu, và bổ sung một dòng tài liệu lúc nào cũng được.
  file: `apps/agent/scripts/sinh-hop-dong-mau.ts`
  severity: low
  Đề xuất: known-limits

- **Lệnh nạp hỏng trên workspace có trường tự tạo bắt buộc ở Công ty hay Thoả thuận, và để lại bản ghi dở**
  Người dùng thấy gì: Trên kho thử đã có trường bắt buộc ở Công ty hay Thoả thuận, lệnh nạp mẫu dừng giữa chừng với câu lỗi tiếng Anh, để lại công ty và người dùng mẫu dở dang, và chạy lại vẫn hỏng.
  Căn cứ: Chỉ gặp trên kho thử của lập trình viên có cấu hình trường đặc biệt, bản ghi mẫu dở dang chỉ là dữ liệu giả có nhãn, không đụng dữ liệu thật; đổi cấu hình trường rồi chạy lại là gỡ được.
  file: `apps/api/scripts/hop-dong-mau/nap.ts`
  severity: low
  Đề xuất: known-limits

- **nguoiMau chỉ kiểm hàng user, không kiểm membership, nên người mẫu mất tư cách thành viên thì không được tạo lại**
  Người dùng thấy gì: Nếu tổ chức bị xoá rồi tạo lại trên kho thử, lệnh nạp mẫu hỏng giữa chừng sau khi tạo xong một phần bản ghi và chạy lại vẫn không lành.
  Căn cứ: Chỉ xảy ra khi xoá tổ chức trên kho thử cục bộ, không đụng dữ liệu thật; xoá kho thử đi nạp lại là xong.
  file: `apps/api/scripts/hop-dong-mau/nap.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (chỉ có assert âm): kiểm «goi blob» và «da ket noi» không có đối chứng dương; ca cho chạy chỉ kiểm việc không bị chặn**
  Người dùng thấy gì: Bài kiểm chặn production có thể vẫn xanh khi tiến trình con chết vì một lý do khác, nên độ tin vào bộ chặn dựa trên bằng chứng yếu hơn bề ngoài.
  Căn cứ: Hành vi chặn production vẫn được đo ở các ca từ chối; phần thiếu chỉ là đối chứng, không làm lộ dữ liệu, và bổ sung bài kiểm sau này rẻ.
  file: `apps/api/test/hop-dong-mau.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assert âm không thể đỏ): ô «blob» của ca khoTat là hằng số 0**
  Người dùng thấy gì: Một ô kiểm trong bài thử ca kho tệp tắt luôn ra không, nên không bao giờ đỏ. Hành vi thật không bị ảnh hưởng vì ca này không có kho tệp để ghi vào.
  Căn cứ: Ca này vốn không thể ghi tệp nên ô đo thừa không che mất lỗi nào đáng kể, bỏ qua không có hậu quả với người dùng.
  file: `apps/api/test/hop-dong-mau.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Bộ chặn hợp đồng mẫu viết lại câu lỗi của okr-mau bằng cách cắt chuỗi theo một tiền tố chép tay (r1)**
  Người dùng thấy gì: Câu từ chối khi trỏ nhầm vào máy thật hiện vẫn ra đúng. Nhưng nếu sau này câu của lệnh OKR mẫu được đổi chữ, câu của lệnh hợp đồng mẫu có thể ra lủng củng hoặc hai câu từ chối nói khác kiểu nhau.
  Căn cứ: Hậu quả chỉ là câu báo lỗi xấu đi, lệnh vẫn chặn đúng và không mất hay lộ dữ liệu; sửa lúc nào cũng rẻ khi có người đổi câu bên kia.
  file: `apps/api/scripts/hop-dong-mau/chan.ts`
  severity: low
  Đề xuất: known-limits

- **Lệnh nạp mẫu dựng nguyên AppModule nên tự kích hoạt xả hàng đợi agent lúc khởi động (r1)**
  Người dùng thấy gì: Chạy lệnh nạp hợp đồng mẫu trên máy dev đã bật khoá agent có thể làm agent tự xử lý luôn các việc đang chờ trên máy đó, dù người chạy chỉ muốn gắn sáu tệp mẫu.
  Căn cứ: Chỉ xảy ra trên máy dev đã bật agent thật, không chạm production, nhưng đã từng xả hàng tồn ngoài ý muốn nên nên ghi rõ để người chạy đếm việc chờ trước.
  file: `apps/api/scripts/hop-dong-mau/lenh.ts`
  severity: low
  Đề xuất: known-limits

- **Thiếu migration kiểu Tệp thì lệnh đã ghi bản ghi rồi mới hỏng, trái với docs «không ghi gì» (r1)**
  Người dùng thấy gì: Nếu kho chưa chạy bản cập nhật cho kiểu Tệp, lệnh sẽ báo lỗi khó hiểu của máy và để lại một số bản ghi mẫu dở dang, trong khi tài liệu hứa là không ghi gì.
  Căn cứ: Chỉ gặp ở kho dev chưa cập nhật, người dùng tự xử được bằng cách chạy lệnh cập nhật rồi nạp lại, và các bản ghi mẫu dở dang không làm mất dữ liệu thật.
  file: `apps/api/scripts/hop-dong-mau/nap.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3: chỉ kiểm chuỗi `doan` có trong chữ, không kiểm quan hệ đoạn chữ ↔ giá trị đáp án (r1)**
  Người dùng thấy gì: Bài kiểm chưa tự bắt được trường hợp đáp án và chữ trong hợp đồng mẫu cùng ghi sai một kiểu, ví dụ đảo ngày với tháng. Khi đó bài đo độ đúng của Kara đọc hợp đồng sau này sẽ chấm theo đáp án sai.
  Căn cứ: Sai sót chỉ có thể do người sinh bộ mẫu ghi nhầm một lần và sẽ lộ ra khi đo Kara; bộ mẫu nhỏ, sáu tệp, người đọc soát lại bằng mắt được và sửa rẻ.
  file: `apps/agent/test/hop-dong-mau.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4: ca «cho chạy» của hdm-chan chỉ có assertion âm tính (r1)**
  Người dùng thấy gì: Nếu lệnh hỏng vì một lý do khác trước khi tới bước nạp trên máy cục bộ, bài kiểm vẫn báo xanh. Người dùng có thể tưởng lệnh chạy được trên máy mình trong khi nó dừng sớm.
  Căn cứ: Không mất hay lộ dữ liệu, và nếu lệnh hỏng thật người chạy thấy ngay khi dùng và chạy lại được; phần quan trọng là việc chặn máy xa vẫn được đo đúng.
  file: `apps/api/test/hop-dong-mau.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: ca «chạy dở» chỉ kiểm r1.ma khác 0, không ghim chỗ hỏng (r1)**
  Người dùng thấy gì: Bài kiểm chưa chứng minh chắc rằng lần chạy bị ngắt thật sự dừng đúng sau tệp thứ ba. Nếu nó dừng sớm hơn thì tình huống chạy dở rồi chạy tiếp vẫn chưa được thử thật.
  Căn cứ: Kết quả cuối vẫn được kiểm là không nhân đôi tệp, nên người dùng không bị mất hay thừa dữ liệu; chỉ là độ tin cậy của một tình huống hiếm kém hơn mức mong muốn.
  file: `apps/api/test/hop-dong-mau.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: đối chứng dương của khoTat đổi cả fixture, không phải bật lại khoá trên cùng đường (r1)**
  Người dùng thấy gì: Bài kiểm chưa chứng minh được rằng nó phân biệt đúng giữa có khoá và không có khoá trên cùng một cách chạy. Một lỗi nhận diện khoá có thể lọt qua mà vẫn báo xanh.
  Căn cứ: Hậu quả nhẹ: nếu nhận diện khoá sai, người chạy sẽ thấy lệnh báo thiếu khoá khi đã đặt và tự sửa được; không ghi gì vào kho.
  file: `apps/api/test/hop-dong-mau.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5/3: kiểm thứ tự «chặn trước mọi import động» chỉ bằng indexOf của một chuỗi cố định (r1)**
  Người dùng thấy gì: Bài kiểm chỉ canh vị trí của một dòng cố định. Nếu sau này ai thêm một bước nạp kho trước bộ chặn bằng cách khác, bài vẫn xanh và lệnh có thể chạm kho trước khi bị chặn.
  Căn cứ: Hiện lệnh chặn đúng và các ca chạy thật vẫn đo việc chặn; rủi ro chỉ xuất hiện nếu ai đó sửa mã sau này, và lúc đó các ca chạy thật có thể bắt được.
  file: `apps/api/test/hop-dong-mau.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: bộ quét ghi thẳng tuyên bắt cả lớp nhưng đối chứng dương chỉ có một điểm (r1)**
  Người dùng thấy gì: Bộ quét cấm ghi thẳng vào kho mới được chứng minh biết báo đỏ ở một dạng ghi. Một số dạng ghi lén khác nếu có ai thêm sau này có thể lọt qua.
  Căn cứ: Hiện không có dạng ghi thẳng nào bị phát hiện, nên người dùng không thấy ảnh hưởng; chỉ là lưới an toàn cho thay đổi tương lai còn thưa.
  file: `apps/api/test/hop-dong-mau.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2: kho Blob giả viết theo khuôn của lệnh nạp, bỏ qua hợp đồng URL ký thật của DA19 (r1)**
  Người dùng thấy gì: Bài kiểm dùng kho tệp giả dễ tính hơn kho thật, nên nếu lệnh gửi tệp sai loại hay sai kích thước so với luật của kho thật thì bài kiểm không phát hiện. Lỗi đó chỉ lộ khi chạy lệnh trên kho tệp thật.
  Căn cứ: Đường ghi lên kho thật đã được đo ở hàng DA19, và nếu lỗi lộ ra khi chạy thật thì người dùng chỉ cần chạy lại sau khi sửa, không mất dữ liệu.
  file: `apps/api/test/hop-dong-mau-san.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/12 lỗi rơi vào file không bộ đo nào phủ (apps/agent/scripts/sinh-hop-dong-mau.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
