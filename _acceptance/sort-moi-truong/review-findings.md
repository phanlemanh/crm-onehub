# Review findings: sort-moi-truong (round 3)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **evals.yaml vẫn tả khuôn năm bản ghi ở vài chỗ, dù test đã lên sáu bản ghi**
  Người dùng thấy gì: Một vài câu trong tệp mô tả phép kiểm vẫn nói bộ dữ liệu thử có năm bản ghi, trong khi thực tế đã là sáu. Người dùng cuối không thấy gì khác; chỉ người đọc hồ sơ nghiệm thu có thể thấy lời mô tả lệch với lỗi đỏ thật.
  Căn cứ: Hậu quả nhẹ: không mất dữ liệu, không ảnh hưởng người dùng, chỉ làm người ký đọc hồ sơ phải đối chiếu thêm, và có thể chỉnh lại câu chữ bất cứ lúc nào với chi phí rất thấp.
  file: `_acceptance/sort-moi-truong/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Lời expected của E1/E2/E4 vẫn ghi chuỗi đỏ và số bản ghi của khuôn năm bản ghi cũ**
  Người dùng thấy gì: Phần mô tả kết quả đỏ mong đợi của ba phép kiểm vẫn ghi theo bộ dữ liệu cũ, nên không khớp từng chữ với câu lỗi thật. Sản phẩm chạy đúng như cũ; chỉ hồ sơ nghiệm thu hơi lệch chữ.
  Căn cứ: Hậu quả nhẹ và không động tới người dùng hay dữ liệu: màu xanh đỏ của phép kiểm không đổi, người ký chỉ cần đọc kỹ hơn, và có thể sửa câu chữ sau mà không cần dựng lại gì.
  file: `_acceptance/sort-moi-truong/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Changing a deal field definition does not refresh the Kanban board, so card fields go stale (r2)**
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

⚠ Cụm ngoài vùng phủ: 2/2 lỗi rơi vào file không bộ đo nào phủ (_acceptance/sort-moi-truong/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
