# Review findings: viec-rieng-chi-nguoi-trong-cuoc (round 2)

## Trong hợp đồng

Không có mục nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E10 thêm ca «biến vắng hẳn» trong bài kiểm nhưng lời ghim E10 trong evals.yaml không đổi**
  Người dùng thấy gì: Lệnh đếm việc riêng vẫn chạy và báo lỗi đúng khi thiếu cấu hình kết nối. Chỉ có điều bản mô tả của phép kiểm chưa nhắc tới một trường hợp thiếu mà bài kiểm đã kiểm, nên người đọc mô tả sẽ không biết trường hợp đó có được kiểm.
  Căn cứ: Người dùng không bị ảnh hưởng gì, không mất hay lộ dữ liệu. Chỗ lệch chỉ nằm ở tài liệu nghiệm thu và sửa lúc nào cũng được, rẻ.
  file: `_acceptance/viec-rieng-chi-nguoi-trong-cuoc/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): fixture viec.get của DA4 thiếu aiThay, nên DA11 đổi mã khung-viec.tsx để chiều fixture thay vì sửa fixture**
  Người dùng thấy gì: Bài kiểm cũ của màn dự án dùng dữ liệu thử thiếu một trường mà hệ thống thật luôn có. Vì vậy bài kiểm đó xanh dù đo trên dữ liệu không có thật, và một việc trong dự án có thể bị bài kiểm đó tính nhầm là «Việc riêng».
  Căn cứ: Với dữ liệu thật, người dùng thấy đúng chữ và không mất dữ liệu; rủi ro chỉ là bài kiểm cũ bỏ sót lỗi hiển thị về sau. Người dùng không tự gặp lỗi này, và sửa dữ liệu thử sau cũng rẻ.
  file: `apps/app/test/khung-viec-lich.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **vetCheRa chép tay năm biến thể của vetViec; z.union khớp biến thể đầu và cắt khoá lạ, nên các khoá thêm sau này sẽ mất im lặng (r1)**
  Người dùng thấy gì: Hiện lịch sử việc hiển thị đúng. Nhưng nếu sau này ai thêm thông tin vào một loại dòng lịch sử mà quên sửa chỗ chép tay, thông tin đó sẽ lặng lẽ biến mất khỏi lịch sử người dùng thấy.
  Căn cứ: Chưa có hậu quả với người dùng hôm nay, chỉ phát sinh khi sửa sau này, không mất dữ liệu đã lưu; ghi lại để người sửa sau biết, sửa lúc đó vẫn rẻ.
  file: `apps/api/src/viec/viec.contracts.ts`
  severity: low
  Đề xuất: known-limits

- **Lịch sử che tên bằng cách sửa chuỗi của bản dịch («{viec}» → {viec}): bản dịch đổi dấu ngoặc thì phép che lặng lẽ thôi tác dụng (r1)**
  Người dùng thấy gì: Hôm nay dòng lịch sử hiện đúng «một việc bạn không có quyền xem». Nếu sau này ai đổi kiểu dấu ngoặc trong bản dịch, câu có thể hiện lệch hoặc còn dấu ngoặc thừa, nhưng tiêu đề việc bị che vẫn không lộ.
  Căn cứ: Chỉ làm câu xấu đi về hình thức khi sửa bản dịch, không lộ dữ liệu và không mất dữ liệu; người dùng thấy ngay và sửa chữ rất rẻ.
  file: `apps/app/components/viec/lich-su-viec.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không có đối chứng chống rỗng): E5 vrc-tu-doi bỏ qua vết tự dời mà người xem X không còn thấy (r1)**
  Người dùng thấy gì: Bài kiểm tự động có thể báo xanh dù dòng tự dời hạn trong lịch sử của người ngoài cuộc bị bỏ mất hoặc hiện sai, nên lời hứa «tên việc bị che» ở chỗ này chưa được máy canh chắc chắn.
  Căn cứ: Không ảnh hưởng trực tiếp người dùng hôm nay và không lộ dữ liệu; chỉ làm giảm độ tin của bằng chứng, có thể bù bằng bước nhìn tay hoặc siết bài kiểm sau.
  file: `apps/api/test/viec-rieng-trong-cuoc.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính không ghim thông điệp): ô 'cam' của vai okr trong ma trận E1 nhận mọi lỗi (r1)**
  Người dùng thấy gì: Người có vai chỉ OKR bị từ chối xem việc, đúng như hứa, nhưng máy không phân biệt được bị từ chối đúng cách hay do hệ thống lỗi.
  Căn cứ: Hợp đồng chỉ đòi có lỗi và người dùng vẫn không xem được việc; không lộ dữ liệu, rủi ro chỉ là bỏ sót hồi quy về loại lỗi.
  file: `apps/api/test/viec-rieng-trong-cuoc.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính không ghim): E3 vrc-chuyen chỉ kiểm X 'không đọc được' sau khi rút, trong khi AC-3 hứa X nhận lại 404 (r1)**
  Người dùng thấy gì: Sau khi bỏ việc khỏi dự án, người ngoài cuộc không đọc được việc. Máy chưa kiểm chắc là họ nhận đúng thông báo «không có việc này» thay vì một lỗi khác.
  Căn cứ: Việc vẫn được giấu khỏi người ngoài cuộc, không lộ dữ liệu; chỉ thông báo lỗi có thể khác đi và gặp thì tải lại là biết.
  file: `apps/api/test/viec-rieng-trong-cuoc.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): ô 'ban-ghi' của E2 và V2 của E11 chỉ kiểm vắng chữ «Việc riêng», không đối chứng tên thoả thuận (r1)**
  Người dùng thấy gì: Máy chưa kiểm chặt rằng ô «Gắn với» của việc gắn thoả thuận hiện đúng tên thoả thuận; nếu sai chữ thì chỉ phát hiện khi nhìn màn hình.
  Căn cứ: Lỗi nếu có chỉ là chữ hiển thị sai, không lộ hay mất dữ liệu, và có bước nhìn ảnh màn hình bổ sung.
  file: `apps/app/test/viec-rieng-trong-cuoc.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): E2/E3b/E7 ghi là «round-trip qua bộ đọc thật, không dựng tay», nhưng bản giả lập là literal viết tay (r1)**
  Người dùng thấy gì: Bài kiểm màn hình dùng dữ liệu viết tay thay vì dữ liệu do hệ thống thật tạo ra, nên khó bắt lỗi khi hai phía lệch nhau; ghi chú trong hồ sơ nói quá lên về mức đó.
  Căn cứ: Không đổi gì với người dùng hôm nay; chỉ là chú thích hồ sơ nói hơi quá, ghi nhận giới hạn là đủ.
  file: `apps/app/test/viec-rieng-trong-cuoc.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): quet-do 8, 9, 11 chỉ khẳng định `dich.has(X) === false`, không kiểm mỏ neo dương trong cùng kho (r1)**
  Người dùng thấy gì: Vài bài kiểm của công cụ phân loại tài liệu có thể báo xanh dù công cụ không nhận ra gì. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Chỉ là công cụ nội bộ của CI, không chạm người dùng cuối; lỗi nếu có chỉ làm bước kiểm tự động kém chặt.
  file: `packages/ui/test/t1-ma-doc.spec.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/2 lỗi rơi vào file không bộ đo nào phủ (_acceptance/viec-rieng-chi-nguoi-trong-cuoc/evals.yaml, apps/app/test/khung-viec-lich.dom.tsx) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
