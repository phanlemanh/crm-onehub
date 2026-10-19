# Review findings: viec-rieng-chi-nguoi-trong-cuoc (round 1)

## Trong hợp đồng

- **viec:dem-rieng: chặn «thiếu DATABASE_URL» không chạy, vì đã nạp .env gốc trước khi kiểm**
  AC: AC-10
  file: `packages/db/scripts/dem-viec-rieng.ts:67`
  severity: medium
  source: conventions
  detail: Tệp mở đầu bằng `import "@crm/env/load"`. `loadRootEnv` (packages/env/src/index.ts) điền mọi khoá `process.env[key] === undefined` từ `.env` ở gốc kho. `.env.example` đặt `DATABASE_URL=...localhost:5432/crm`, và máy chủ kho có `.env` mang `DATABASE_URL`. Vì vậy khi chủ kho quên tiền tố `DATABASE_URL=<production>`, kiểm `if (!process.env.DATABASE_URL)` ở dòng 67 không bao giờ đúng: lệnh lặng lẽ đếm trên kho dev `crm`, in một dòng JSON trông hợp lệ, và người chạy dán dòng đó vào #375 như số của production. Khi đó docs/production.md hứa «Thiếu DATABASE_URL thì lệnh thoát 2», nhưng lời hứa sai. Bài kiểm AC-10 (packages/db/test/dem-viec-rieng.spec.ts:217) chỉ thử `DATABASE_URL: ""`: chuỗi rỗng khác `undefined` nên loader không ghi đè và nhánh thoát 2 có chạy. Bài kiểm xanh, còn đường thật (biến chưa đặt) thì không được bảo vệ. Đây là chỗ thiếu kiểm ở biên cho một lệnh mà mục đích duy nhất là chạy trên production. Cách sửa: đọc `DATABASE_URL` trước khi nạp `@crm/env/load` (hoặc bỏ hẳn loader); hoặc đòi cờ hay tên kho tường minh, rồi in tên host/kho được đếm kèm JSON.
  rationale: AC-10 hứa «thiếu DATABASE_URL thì lệnh thoát 2 với lời nêu biến thiếu»; finding chỉ ra khi biến chưa đặt mà có .env gốc thì lệnh không thoát 2 mà đếm trên kho dev, tức vế này của AC-10 sai trên đường thật.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **vetCheRa chép tay năm biến thể của vetViec; z.union khớp biến thể đầu và cắt khoá lạ, nên các khoá thêm sau này sẽ mất im lặng**
  Người dùng thấy gì: Hiện lịch sử việc hiển thị đúng. Nhưng nếu sau này ai thêm thông tin vào một loại dòng lịch sử mà quên sửa chỗ chép tay, thông tin đó sẽ lặng lẽ biến mất khỏi lịch sử người dùng thấy.
  Căn cứ: Chưa có hậu quả với người dùng hôm nay, chỉ phát sinh khi sửa sau này, không mất dữ liệu đã lưu; ghi lại để người sửa sau biết, sửa lúc đó vẫn rẻ.
  file: `apps/api/src/viec/viec.contracts.ts`
  severity: low
  Đề xuất: known-limits

- **Lịch sử che tên bằng cách sửa chuỗi của bản dịch («{viec}» → {viec}): bản dịch đổi dấu ngoặc thì phép che lặng lẽ thôi tác dụng**
  Người dùng thấy gì: Hôm nay dòng lịch sử hiện đúng «một việc bạn không có quyền xem». Nếu sau này ai đổi kiểu dấu ngoặc trong bản dịch, câu có thể hiện lệch hoặc còn dấu ngoặc thừa, nhưng tiêu đề việc bị che vẫn không lộ.
  Căn cứ: Chỉ làm câu xấu đi về hình thức khi sửa bản dịch, không lộ dữ liệu và không mất dữ liệu; người dùng thấy ngay và sửa chữ rất rẻ.
  file: `apps/app/components/viec/lich-su-viec.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không có đối chứng chống rỗng): E5 vrc-tu-doi bỏ qua vết tự dời mà người xem X không còn thấy**
  Người dùng thấy gì: Bài kiểm tự động có thể báo xanh dù dòng tự dời hạn trong lịch sử của người ngoài cuộc bị bỏ mất hoặc hiện sai, nên lời hứa «tên việc bị che» ở chỗ này chưa được máy canh chắc chắn.
  Căn cứ: Không ảnh hưởng trực tiếp người dùng hôm nay và không lộ dữ liệu; chỉ làm giảm độ tin của bằng chứng, có thể bù bằng bước nhìn tay hoặc siết bài kiểm sau.
  file: `apps/api/test/viec-rieng-trong-cuoc.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính không ghim thông điệp): ô 'cam' của vai okr trong ma trận E1 nhận mọi lỗi**
  Người dùng thấy gì: Người có vai chỉ OKR bị từ chối xem việc, đúng như hứa, nhưng máy không phân biệt được bị từ chối đúng cách hay do hệ thống lỗi.
  Căn cứ: Hợp đồng chỉ đòi có lỗi và người dùng vẫn không xem được việc; không lộ dữ liệu, rủi ro chỉ là bỏ sót hồi quy về loại lỗi.
  file: `apps/api/test/viec-rieng-trong-cuoc.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính không ghim): E3 vrc-chuyen chỉ kiểm X 'không đọc được' sau khi rút, trong khi AC-3 hứa X nhận lại 404**
  Người dùng thấy gì: Sau khi bỏ việc khỏi dự án, người ngoài cuộc không đọc được việc. Máy chưa kiểm chắc là họ nhận đúng thông báo «không có việc này» thay vì một lỗi khác.
  Căn cứ: Việc vẫn được giấu khỏi người ngoài cuộc, không lộ dữ liệu; chỉ thông báo lỗi có thể khác đi và gặp thì tải lại là biết.
  file: `apps/api/test/viec-rieng-trong-cuoc.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): ô 'ban-ghi' của E2 và V2 của E11 chỉ kiểm vắng chữ «Việc riêng», không đối chứng tên thoả thuận**
  Người dùng thấy gì: Máy chưa kiểm chặt rằng ô «Gắn với» của việc gắn thoả thuận hiện đúng tên thoả thuận; nếu sai chữ thì chỉ phát hiện khi nhìn màn hình.
  Căn cứ: Lỗi nếu có chỉ là chữ hiển thị sai, không lộ hay mất dữ liệu, và có bước nhìn ảnh màn hình bổ sung.
  file: `apps/app/test/viec-rieng-trong-cuoc.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): E2/E3b/E7 ghi là «round-trip qua bộ đọc thật, không dựng tay», nhưng bản giả lập là literal viết tay**
  Người dùng thấy gì: Bài kiểm màn hình dùng dữ liệu viết tay thay vì dữ liệu do hệ thống thật tạo ra, nên khó bắt lỗi khi hai phía lệch nhau; ghi chú trong hồ sơ nói quá lên về mức đó.
  Căn cứ: Không đổi gì với người dùng hôm nay; chỉ là chú thích hồ sơ nói hơi quá, ghi nhận giới hạn là đủ.
  file: `apps/app/test/viec-rieng-trong-cuoc.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): quet-do 8, 9, 11 chỉ khẳng định `dich.has(X) === false`, không kiểm mỏ neo dương trong cùng kho**
  Người dùng thấy gì: Vài bài kiểm của công cụ phân loại tài liệu có thể báo xanh dù công cụ không nhận ra gì. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Chỉ là công cụ nội bộ của CI, không chạm người dùng cuối; lỗi nếu có chỉ làm bước kiểm tự động kém chặt.
  file: `packages/ui/test/t1-ma-doc.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
