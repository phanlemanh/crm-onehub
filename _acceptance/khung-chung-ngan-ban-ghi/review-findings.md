## Trong hợp đồng

- **bk1_chup: $APP_URL bị shell ngoài mở rộng trước khi do:man dựng phiên đo, nên chup-proto chụp sai máy chủ hoặc URL rỗng**
  AC: AC-10
  file: `_acceptance/config.yaml:2449`
  severity: medium
  source: bugs
  detail: Executor là `PROTO_ROUTE=1 bun run do:man --chay "PROTO_URL=$APP_URL node .../chup-proto.mjs"`. Vì `$APP_URL` nằm trong ngoặc kép, shell chạy lệnh executor (bắt buộc là shell, do có tiền tố gán biến `PROTO_ROUTE=1`) mở rộng nó ngay, trước khi phien-do.mjs khởi động. Mà chỉ sau đó phien-do.mjs mới đặt APP_URL của phiên đo (dòng 308/359) rồi chạy `bash -c lenh`. Có hai hậu quả. (1) Môi trường ngoài không có APP_URL: PROTO_URL thành chuỗi rỗng. Trong chup-proto.mjs, `process.env.PROTO_URL ?? "http://localhost:3300"` không bắt được chuỗi rỗng, nên coSo = "", rồi setCookie/goto với URL tương đối "/proto/..." ném lỗi. (2) Môi trường ngoài có APP_URL, ví dụ localhost:3000 của bản dev ở checkout chính: 46 ảnh bị chụp từ cây khác mà vẫn in «xong; 46 anh; ...» và thoát 0. Đây đúng là lỗi im lặng mà CLAUDE.md cảnh báo. Mọi executor do:man/tien-de khác đều để răng tự đọc process.env.APP_URL ở bên trong. Cách sửa: dùng ngoặc đơn hoặc `\$APP_URL` để biến được mở rộng trong bash -c của phiên đo, hoặc cho chup-proto.mjs đọc APP_URL trực tiếp. Đồng thời đổi `??` thành `||` để chuỗi rỗng không lọt qua.

- **Hình dạng 2 (fixture/giàn viết tay theo khuôn bên đọc): ca bản mẫu tuyên «dựng không bọc DetailSheet» nhưng hàm dung luôn bọc DetailSheet**
  AC: AC-8
  file: `_acceptance/khung-chung-ngan-ban-ghi/rang/khung-ngan.dom.tsx:28`
  severity: medium
  source: measurement
  detail: `async function dung(man: ReactElement, trongNgan = true)` nhận tham số `trongNgan` nhưng không dùng tới. Dòng 38 luôn bọc `<DetailSheet open onOpenChange={() => {}}>{man}</DetailSheet>`. Các ca bk1-proto (dòng 185–190) và bk1-doi-chung-am gọi `dung(<KhungChungNganBanGhiMau .../>, false)`, nên vẫn dựng bên trong DetailSheet. AC-8 và E9 hứa «dựng từng trạng thái mà không bọc ngăn nào từ ngoài». Mục Notes của contract.md giải thích lời hứa đó có là vì «bài DOM luôn bọc DetailSheet» nên đã không thấy trang lỗi của Next. Giàn hiện tại vẫn cấp ngữ cảnh DetailSheet cho bản mẫu, tức là đúng lỗi Notes nói đã sửa vẫn còn. Một bản mẫu phải dựa vào ngữ cảnh của DetailSheet mới dựng được vẫn qua E9, còn trên route thật thì hỏng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Lỗi tải của ngăn Số KR không dùng VungTaiLoi, trái với luật mất kết nối vòng này vừa viết**
  Người dùng thấy gì: Khi ngăn Số KR tải lỗi vì mất kết nối, nút Thử lại trông và cư xử hơi khác các ngăn khác (không khoá nút lúc đang tải lại). Người dùng vẫn bấm thử lại được.
  Căn cứ: Nhẹ: chỉ lệch về hình thức nút thử lại, không mất dữ liệu, người dùng vẫn tự thử lại được.
  file: `apps/app/components/crm/record-sheet/so-kr-sheet.tsx`
  severity: medium
  Đề xuất: known-limits

- **SoKrSheet: lỗi có message rỗng làm ngăn trống trơn, không chờ tải, không lỗi**
  Người dùng thấy gì: Nếu máy chủ trả lỗi mà không kèm lời nhắn, ngăn Số KR có thể hiện trống trơn, không báo lỗi cũng không có nút thử lại. Đóng và mở lại ngăn thường giải quyết được.
  Căn cứ: Nhẹ và hiếm: chỉ xảy ra khi lỗi không có lời nhắn, không mất dữ liệu, người dùng tự mở lại ngăn được.
  file: `apps/app/components/crm/record-sheet/so-kr-sheet.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp, không có ma trận viết trước): 23 trạng thái bản mẫu lấy ra từ chính PROTO_CATALOG, chỉ đếm số**
  Người dùng thấy gì: Bài kiểm bản mẫu có thể vẫn xanh nếu sau này ai đó gõ sai hoặc trùng tên một trạng thái trong bản mẫu. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Nhẹ: chỉ làm bài kiểm lỏng hơn cần thiết, không ảnh hưởng người dùng, sửa sau rẻ.
  file: `_acceptance/khung-chung-ngan-ban-ghi/rang/khung-ngan.dom.tsx`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
