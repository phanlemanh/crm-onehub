# Review findings: sua-giao-dien-tin-hieu (round 1)

## Trong hợp đồng

- **Hình dạng 5 (tuyên ma trận nhưng thiếu ô) — lệnh E14 gọi một nhóm bài DOM «sgt-cau-sau-gom» không tồn tại, nên E14 luôn đỏ và mục 2 của E14 không có bài nào đo**
  file: `_acceptance/config.yaml:1772`
  severity: high
  AC: AC-12
  source: measurement
  detail: Lệnh sgt_cau_sau_gom = `bun test ./test/sua-giao-dien-tin-hieu-cau.spec.ts && ... sua-giao-dien-tin-hieu.dom.tsx -t sgt-cau-sau-gom`. Tệp apps/app/test/sua-giao-dien-tin-hieu.dom.tsx không có describe hay test nào tên «sgt-cau-sau-gom». Các describe trong tệp chỉ có sgt-bang, sgt-loi, sgt-gio, sgt-ma, sgt-tieu-diem, sgt-cham, sgt-dong, sgt-ten-man, sgt-chu. Chạy thật vế thứ hai in `error: regex "sgt-cau-sau-gom" matched 0 tests` và thoát mã 1. Vế spec thì xanh (4 pass). Hậu quả: E14 không bao giờ ra mã 0. Mục 2 của E14 («phần tử hiện chung mang translate=no (bài DOM một dòng)») cũng không được bài nào đo: chưa có khẳng định nào rằng tên nhóm, lý do và tên việc nằm trong phần tử translate="no". Lượt phá-thử ở pha-thu.py dòng 27 chỉ chạy vế spec nên không lộ ra lỗi này.
  rationale: AC-12 đòi tên nhóm, lý do và tên việc được đánh dấu không dịch; phép đo của nó luôn đỏ và phần đánh dấu không dịch không có bài nào kiểm, nên AC-12 không thể chứng minh được.

- **Hình dạng 4 (khẳng định âm tính một mình) — khi đủ chữ, bài «aria-describedby không trỏ tới dòng lý do» không bao giờ đỏ được**
  file: `apps/app/test/sua-giao-dien-tin-hieu.dom.tsx:625`
  severity: high
  AC: AC-6
  source: measurement
  detail: Ở tổ hợp đủ chữ, bài sgt-cham kiểm `expect(moTa).not.toContain("ly-do")`. Nhưng id của dòng lý do là `useId()` (hop-gui-tin-hieu.tsx dòng 94: `const idLyDo = useId()`), có dạng «r3» hoặc :r3:, không bao giờ chứa chuỗi "ly-do". Vì vậy khẳng định này đúng trong mọi trường hợp. Giả sử bản sao giữ aria-describedby={idLyDo} cả khi đủ chữ (ví dụ `khoaVi = khoaTran ? idLoi : idLyDo`), bài vẫn xanh. Lời hứa của E6 («khi đủ chữ ... aria-describedby không trỏ tới nó») là quan hệ giữa id của dòng và thuộc tính của nút. Bài phải ghim id lấy từ lần render khoá trước đó, rồi khẳng định id đó không có trong moTa (và có đối chứng dương ở ô khoá).
  rationale: AC-6 hứa nút trỏ tới dòng lý do và dòng ẩn khi đủ chữ; bài đo vế «đủ chữ thì không trỏ» không thể đỏ nên vế này của AC-6 chưa được bảo đảm.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Second Zod schema for the roadmap JSON in apps/app; a parse failure is silently turned into an empty Map**
  Người dùng thấy gì: Nếu dữ liệu lộ trình bị hỏng, trang vẫn hiện câu gốc của đội sản phẩm thay vì câu song ngữ, và không ai được báo vì sao. Người gửi chỉ thấy câu trạng thái bằng một thứ tiếng.
  file: `apps/app/lib/tin-hieu/trang-thai.ts`
  severity: medium
  Đề xuất: known-limits

- **Boundary check measures the diff against origin/onehub, so after the merge it passes with 0 files checked**
  Người dùng thấy gì: Sau khi bản này được gộp, phép kiểm không đụng tới phần dùng chung có thể báo xanh mà không kiểm tra gì. Người dùng không thấy ngay, nhưng một thay đổi lỡ chạm vào phần dùng chung sau này có thể lọt qua.
  file: `_acceptance/sua-giao-dien-tin-hieu/rang/ranh-gioi.mjs`
  severity: low
  Đề xuất: known-limits

- **Hop xac nhan xoa luon chan tra tieu diem: bam «Giu lai» hay xoa hong thi tieu diem roi ve body**
  Người dùng thấy gì: Người dùng bàn phím hoặc trình đọc màn hình bấm «Giữ lại» hay gặp lỗi khi xoá sẽ mất chỗ đang đứng và phải dò lại từ đầu trang.
  file: `apps/app/components/tin-hieu/danh-sach-tin-hieu.tsx`
  severity: medium
  Đề xuất: new-contract

- **Bam «Bo» o hop hoi lai khong xoa chu da nhap: mo lai hop van con nguyen hai o**
  Người dùng thấy gì: Bấm «Bỏ» khi được hỏi có muốn bỏ những gì vừa nhập, rồi mở lại hộp, người gửi vẫn thấy chữ cũ còn nguyên dù câu hỏi đã báo là sẽ mất.
  file: `apps/app/components/tin-hieu/nut-gui-tin-hieu.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (khẳng định «chuỗi có mặt» thay cho quan hệ) — so aria-describedby với id bằng toContain, rỗng khớp rỗng**
  Người dùng thấy gì: Nếu sau này liên kết giữa nút Gửi và dòng báo lỗi bị mất, bài kiểm hiện tại có thể không phát hiện. Hiện người dùng chưa gặp lỗi nào.
  file: `apps/app/test/sua-giao-dien-tin-hieu.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc) — lỗi tRPC giả là một class tự viết đúng đường `data.httpStatus` mà mã đọc**
  Người dùng thấy gì: Các bài kiểm câu báo «đã quá số lần gửi hôm nay» và «đội sản phẩm đã lấy về» dùng lỗi giả tự dựng, nên chưa chứng minh đường lỗi thật từ máy chủ hiện đúng câu. Lỗi thật có thể vẫn hiện sai mà bài kiểm không thấy.
  file: `apps/app/test/sua-giao-dien-tin-hieu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (thông điệp ghim không thật sự ghim) — phá-thử E9b ghim «dong da lay ve», chuỗi này nằm sẵn trong tên test**
  Người dùng thấy gì: Bản ghi phá-thử cho thấy bài kiểm dòng đã được đội sản phẩm lấy về bắt được lỗi, nhưng bằng chứng yếu hơn vẻ ngoài. Người dùng không bị ảnh hưởng trực tiếp.
  file: `_acceptance/sua-giao-dien-tin-hieu/rang/pha-thu.py`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng bỏ sót) — quét chữ nội bộ của AC-9 bỏ qua khoá cauSauGom, nơi chứa câu trạng thái CRM mới tự viết**
  Người dùng thấy gì: Phép quét từ nội bộ chưa kiểm các câu trạng thái mới trên trang Tín hiệu đã gửi. Hiện chưa có câu nào dùng từ khó hiểu, nhưng sau này có thể lọt.
  file: `apps/app/test/sua-giao-dien-tin-hieu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên lớp nhưng chỉ đo một điểm) — răng ranh giới tuyên «bài của LT2 không bớt khẳng định» nhưng chỉ đếm một tệp, trong khi vòng này làm yếu một tệp kiểm khác của LT2**
  Người dùng thấy gì: Một bài kiểm cũ của tính năng gửi tín hiệu đã bị nới lỏng mà phép kiểm ranh giới không báo. Người dùng chưa thấy khác biệt, nhưng một lỗi cũ có thể lọt lại khó phát hiện hơn.
  file: `_acceptance/sua-giao-dien-tin-hieu/rang/ranh-gioi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính một mình) — ma trận chỗ của LT2 chỉ còn kiểm «câu không phải câu kit», không kiểm câu là gì**
  Người dùng thấy gì: Bài kiểm câu trạng thái chỉ chắc rằng câu khác câu gốc, chứ không chắc đúng nội dung. Một câu sai ngôn ngữ hay sai tên nhóm có thể qua bài này.
  file: `apps/app/test/tin-hieu-trang-thai.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận không viết trước) — danh sách màn được miễn của quét tên màn lấy từ chính mã đang bị kiểm**
  Người dùng thấy gì: Nếu có người thêm một màn vào danh sách miễn, màn đó sẽ hiện đường dẫn thô thay vì tên màn mà bài kiểm vẫn xanh. Hiện mọi màn đều có tên.
  file: `apps/app/test/ten-man.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra) — cỡ chạm của nút trên điện thoại đo bằng nhãn data-size, không đo lớp hay kích thước thật của phần tử**
  Người dùng thấy gì: Bài kiểm nhanh chỉ đọc nhãn cỡ nút, nên nếu ai đó thu nhỏ nút ⋮ trên điện thoại thì bài này không thấy. Phép đo trên màn thật vẫn bắt được.
  file: `apps/app/test/sua-giao-dien-tin-hieu.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên lớp nhưng chỉ đo một điểm) — hộp xoá chỉ kiểm vắng một trong hai dòng khác**
  Người dùng thấy gì: Hộp hỏi lại trước khi xoá chỉ được kiểm là không lẫn nội dung của một dòng khác trong ba dòng. Khả năng hộp lẫn tiêu đề dòng kia là rất thấp.
  file: `apps/app/test/sua-giao-dien-tin-hieu.dom.tsx`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/15 lỗi rơi vào file không bộ đo nào phủ (_acceptance/config.yaml, _acceptance/sua-giao-dien-tin-hieu/rang/pha-thu.py, apps/app/test/tin-hieu-trang-thai.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
