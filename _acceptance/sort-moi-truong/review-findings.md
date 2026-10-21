## Trong hợp đồng

- **Hình dạng 3 (khẳng định chuỗi trong khi lời hứa là QUAN HỆ): đổi tên ở round 1 làm luật hoà-theo-tên trùng đúng thứ tự id asc mà mã đang dùng làm khoá cuối**
  file: `apps/api/test/sort-moi-truong.spec.ts:76`
  severity: high
  AC: AC-1
  source: measurement
  detail: Round 1 đổi TEN thành T1 'An', T4 'Bình' (dòng 76-79) và đáp án thành TANG = [T2,T1,T4,T5,T3], GIAM = [T5,T1,T4,T2,T3] (dòng 83-84). T1 được tạo trước T4, mà Deal/Contact/Company dùng @default(cuid()) (packages/db/prisma/schema.prisma:1042, 459), tức id tăng theo thời gian tạo. Trong FieldsService.sapTheoTruong, khoá cuối của orderBy là `{ [column]: "asc" }` (apps/api/src/fields/fields.service.ts:540), nghĩa là id asc. Vì vậy khi hoà, cả 'tên A→Z' lẫn 'id asc / createdAt asc' đều cho T1 trước T4, ở cả hai chiều. Nếu bỏ phần TEN_BAN_GHI khỏi orderBy thì các phép so `ra.join(",") !== dapAn.join(",")` ở smt-api-sap (dòng 265, 18 ô), smt-api-cty-lh (12 ô trường tự tạo) và smt-api-board (dòng 841) vẫn xanh. Lời hứa trong evals.yaml E1/E3 là 'hoà theo tên A→Z như sort chuẩn', một quan hệ giữa tên và thứ tự, nhưng bộ dữ liệu không còn tách được quan hệ đó khỏi thứ tự tạo. Round 0 (T4 'An' tạo sau) tách được id asc. Round 1 chỉ đổi sang tách được createdAt desc, đúng như evals ghi 'một luật hoà theo createdAt giảm dần sẽ đỏ'. Còn chính khoá cuối mà mã đang có thì không phép đo nào bắt được nữa.
  lý do vào hợp đồng: AC-1 hứa «hoà giá trị thì theo tên bản ghi A→Z rồi id», nhưng bộ dữ liệu thử không tách được luật theo tên khỏi thứ tự id nên vế này của AC-1 (và AC-2 cho Công ty, Liên hệ) không được đo thật.

- **Hình dạng 3: hoà ở ô trống của sort 'phone' theo lastName trùng thứ tự tạo, và evals ghi sai là 'ngược thứ tự tạo'**
  file: `apps/api/test/sort-moi-truong.spec.ts:626`
  severity: medium
  AC: AC-2
  source: measurement
  detail: Round 1 đặt T3 'Dung' và T5 'Em' cùng trống phone (SO, dòng 614-620), đáp án PHONE_TANG/PHONE_GIAM đều kết thúc bằng [T3, T5] (dòng 626-627). Các liên hệ được tạo theo vòng T1..T5 nên T3 tạo trước T5: T3-trước-T5 chính là thứ tự tạo và thứ tự id. Evals.yaml E3 lại ghi '(T3 trước T5, ngược thứ tự tạo)', điều này sai. SORTABLE.phone trong contacts.service.ts là [{phone nulls last}, {lastName asc}]. Nếu bỏ {lastName: 'asc'} thì Postgres trả các hàng hoà theo thứ tự vật lý, thường là thứ tự chèn, nên vẫn ra T3,T5 và phép so `raChuan.join(",") !== dapAn.join(",")` vẫn xanh. Phép đối chứng 'hoa lech chuan' chỉ so thứ tự của field:smt_dt với thứ tự của 'phone'. Phía trường tự tạo cũng kết thúc bằng id asc (banGhiTrong, fields.service.ts:589), nên hai bên vẫn khớp nhau mà không cần đến luật hoà theo lastName. Như vậy quan hệ 'hoà theo lastName' được tuyên trong evals nhưng không phép đo nào đo được.
  lý do vào hợp đồng: AC-2 nêu rõ `sort=phone` phải «hoà theo `lastName`», nhưng dữ liệu thử cho kết quả giống nhau dù có hay không luật hoà theo `lastName`, nên vế này của AC-2 không được đo.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Changing a deal field definition does not refresh the Kanban board, so card fields go stale**
  Người dùng thấy gì: Sau khi đổi thứ tự, lưu trữ hoặc bật «Hiện trong bảng» cho một trường thoả thuận, thẻ trên bảng Kanban có thể còn hiện các trường cũ trong khoảng nửa phút. Mở lại hoặc tải lại trang là thấy đúng.
  Căn cứ: Chỉ lệch tạm thời vài chục giây, không mất hay sai dữ liệu, và người dùng tự khỏi bằng cách tải lại trang.
  file: `apps/app/lib/trpc/cache.ts`
  severity: low
  Đề xuất: known-limits

- **Hằng tiền tố `field:` mới thành bản sao thứ ba, trong khi hai hằng cùng giá trị đã có sẵn (r1)**
  Người dùng thấy gì: Người dùng không thấy gì khác. Về sau nếu ai đổi cách gọi tên trường ở chỗ sắp mà quên chỗ lọc thì hai chỗ có thể lệch nhau.
  Căn cứ: Không ảnh hưởng người dùng hôm nay, không mất dữ liệu, và dọn gộp có thể làm cùng đợt với việc lọc theo trường sau này nên không đáng mở việc riêng.
  file: `packages/db/src/fields-shape.ts`
  severity: medium
  Đề xuất: wont-fix

- **Cột Tên miền của Công ty khai hai kiểu khác nhau: ẩn theo URL, vẽ theo TEXT (r1)**
  Người dùng thấy gì: Cột Tên miền của Công ty hiện như chữ thường, không bấm được, dù được coi là liên kết khi ẩn theo khổ màn hình. Hôm nay nhìn không khác trước.
  Căn cứ: Chỉ lệch nhỏ về cách hiện, không mất dữ liệu và người dùng không bị cản trở; sửa rẻ nhưng thuộc việc thống nhất cách hiện của vòng trước.
  file: `apps/app/app/(app)/[slug]/companies/companies-table.tsx`
  severity: low
  Đề xuất: known-limits

- **Thẻ Kanban tự ráp ô trường thay vì đi qua đường có sẵn, và nhãn trường người nhập không mang `translate="no"` (r1)**
  Người dùng thấy gì: Trên thẻ Kanban, tên trường do quản trị tự đặt có thể bị trình duyệt tự dịch sang ngôn ngữ khác. Thẻ vẫn hiện đúng giá trị.
  Căn cứ: Hậu quả nhẹ, chỉ xảy ra với người bật dịch tự động, không mất dữ liệu và tắt dịch là hết; sửa rẻ nhưng không chặn việc giao.
  file: `apps/app/app/(app)/[slug]/deals/deals-board.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay theo khuôn bên đọc): giá trị trường trên thẻ trong E7b và danh sách trường trong E5/E6 viết tay rồi parse, không rút từ writer (r1)**
  Người dùng thấy gì: Bài kiểm thẻ Kanban dùng dữ liệu viết tay hơi khác dữ liệu hệ thống thật. Hiện thẻ vẫn hiện đúng, nhưng nếu cách đọc ngày đổi sau này thì bài kiểm có thể không phát hiện.
  Căn cứ: Chưa gây lỗi nào cho người dùng và chỉ là rủi ro phát hiện chậm về sau; sửa sau không đắt.
  file: `apps/app/test/sort-moi-truong.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
