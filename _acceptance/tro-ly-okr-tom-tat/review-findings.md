# Review findings — tro-ly-okr-tom-tat (round 2)

## Trong hợp đồng

- **Unit-multiplier table and 15-digit precision constant copied instead of shared from the existing module**
  file: `packages/validation/src/okr-kiem-tom-tat.ts:55`
  severity: medium
  AC: AC-15
  source: conventions
  detail: This round adds `CHU_SO_CHINH_XAC = 15` and `HE_SO_DON_VI` (tỷ/tỉ 1e9, triệu 1e6, nghìn/ngàn 1e3, k 1e3) to okr-kiem-tom-tat.ts. The sibling module packages/validation/src/okr-kiem-de-xuat.ts already has the same table as `HE_SO` (lines 45-52: tỷ, tỉ, triệu, nghìn, ngàn) and the same `CHU_SO_CHINH_XAC = 15` (line 58). okr-kiem-tom-tat.ts already imports `chuanHoa` and `docSo` from that module, and it also keeps `NGHIN = 1000`, so the 1e3 value for «k» now lives in three places. AGENTS.md says «Constants belong in one file per area, not beside their first use»: never write the same value twice, and use one convention for the whole codebase. The risk is drift. The proposal checker (docSo) and the summary checker (heSoDonVi) must scale «tỷ đồng» the same way, and the test 'bo kiem va so-lech-lot doc cung ket qua' depends on that. If someone adds a unit such as «trăm» or fixes a value in one table, the other table will not change. Fix: export one multiplier table and one precision constant from a single place (okr-kiem-de-xuat.ts, or TRO_LY_OKR_TRAN in okr-tro-ly.ts), then import them here and add «k» as a derived entry.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Kiểm tra «kỳ vọng không đổi» để lọt dòng chèn vào giữa ca cũ, nên có thể vô hiệu một kỳ vọng mà vẫn xanh**
  Người dùng thấy gì: Công cụ canh việc không ai được sửa kết quả mong đợi của các bài kiểm cũ có một kẽ hở: ai đó chèn một dòng làm một bài cũ bỏ qua toàn bộ phép kiểm mà công cụ vẫn báo yên. Hiện chưa có bài nào bị vô hiệu theo cách này, nhưng người chấm không nên tin tuyệt đối vào dòng «kỳ vọng không đổi».
  file: `_acceptance/tro-ly-okr-tom-tat/rang/ky-vong-khong-doi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — nói là quét cả lớp «đơn vị có hệ số» nhưng chỉ có ca điểm cho «tỷ»**
  Người dùng thấy gì: Kiểm tra số lệch khi KR tính bằng đơn vị có hệ số chỉ được thử với «tỷ đồng» và «đồng». Nếu bảng hệ số cho triệu, nghìn hay k bị gõ sai, một câu tóm tắt đúng vẫn có thể bị bỏ oan hoặc một con số lệch vẫn lọt, mà bài kiểm vẫn xanh.
  file: `apps/api/test/tro-ly-okr-tom-tat-thuoc.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — gói kiểm có `donVi` viết tay đúng khuôn bên đọc, không có đường đi vòng qua bên ghi**
  Người dùng thấy gì: Không có bài kiểm cố định nào cho thấy đơn vị của KR (ví dụ «tỷ đồng») được đọc từ kho đúng rồi mới tới bước kiểm câu. Nếu khâu đó quên điền đơn vị, một câu đúng như «2,9 tỷ đồng» có thể bị bỏ oan khi chạy thật, và chỉ thử nghiệm bằng model thật mới có thể phát hiện, không chắc chắn.
  file: `packages/validation/test/okr-kiem-tom-tat.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Two identical functions were added to the same file (r1)**
  Người dùng thấy gì: Có hai đoạn mã làm cùng một việc là kiểm tra việc này đã có bản tóm tắt chưa. Hôm nay người dùng không thấy khác biệt; chỉ khi sửa một nơi mà quên nơi kia mới lệch.
  file: `apps/agent/agent/lib/okr/doc.ts`
  severity: low
  Đề xuất: wont-fix

- **Job kind constants in the summary scheduler are not checked against the task-kind list (r1)**
  Người dùng thấy gì: Nếu sau này ai đổi tên loại việc tóm tắt ở nơi khác, lịch tóm tắt mỗi sáng có thể âm thầm tạo ra việc không ai xử lý và các phòng ban sẽ không có bản tóm tắt mà không báo lỗi.
  file: `apps/agent/agent/lib/okr/lich-tom-tat.ts`
  severity: low
  Đề xuất: known-limits

- **Screen copy repeats tunable values from the summary config (r1)**
  Người dùng thấy gì: Màn hình đang ghi cứng «hai phút» và «06:00». Nếu sau này chỉnh thời gian chờ hoặc giờ chạy, màn hình vẫn hiện con số cũ và làm người xem hiểu sai.
  file: `apps/app/lib/messages/okr-toan-canh.ts`
  severity: low
  Đề xuất: known-limits

- **The date schema is defined again when an existing one is available (r1)**
  Người dùng thấy gì: Định dạng ngày của bản tóm tắt được viết lại một lần nữa thay vì dùng bản có sẵn. Người dùng không thấy khác biệt nào.
  file: `packages/validation/src/okr-tom-tat.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 1 — Đo CHỈ DẪN thay vì ĐẦU RA: E6 kiểm danh sách khai báo DANH_SACH_DOC, không kiểm các lệnh đọc thật của đường tóm tắt (r1)**
  Người dùng thấy gì: Bài kiểm cách ly dữ liệu chỉ soi danh sách khai báo chứ không soi những gì Trợ lý thực sự đọc. Nếu sau này Trợ lý đọc thêm dữ liệu khách hàng trong lúc tóm tắt, bài kiểm vẫn báo an toàn.
  file: `apps/agent/test/tro-ly-okr-cach-ly.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — Tuyên bố quét cả LỚP nhưng danh sách viết tay: 'không bảng đối tác nào' so với 22 tên chép tay (r1)**
  Người dùng thấy gì: Bài kiểm chặn Trợ lý đọc dữ liệu đối tác chỉ biết một danh sách bảng gõ tay, nên một số loại dữ liệu như trường tuỳ chỉnh của khách hàng có thể lọt mà không bị bắt.
  file: `apps/agent/test/tro-ly-okr-cach-ly.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — Assertion âm tính một mình: E17 chốt 'không câu nào chứa họ tên' mà không đối chứng danh sách tên khác rỗng (r1)**
  Người dùng thấy gì: Phép kiểm «không câu tóm tắt nào nêu họ tên» sẽ báo đạt nếu danh sách tên lấy về bị rỗng, nên có thể không phát hiện được khi Trợ lý nêu tên một người.
  file: `_acceptance/tro-ly-okr-tom-tat/rang/eval-tom-tat.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — Assertion âm tính một mình: E1 đòi 'không còn hop-tuan.ts' mà không chứng đường dẫn trỏ đúng thư mục có thật (r1)**
  Người dùng thấy gì: Một bài kiểm xác nhận tệp cũ đã bị dời đi có thể báo đạt dù đường dẫn sai. Người dùng không bị ảnh hưởng.
  file: `packages/db/test/okr-hop-tuan.spec.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
