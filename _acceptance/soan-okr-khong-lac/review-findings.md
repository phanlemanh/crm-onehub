# Review findings: soan-okr-khong-lac (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Mã lý do nội bộ của agent hiện nguyên văn trên màn, cả vi lẫn en, bỏ qua bản đồ thông điệp**
  Người dùng thấy gì: Khi Kara nộp bản nháp bị từ chối, người dùng thấy lý do dưới dạng mã không dấu như «chu ky khong o pha lap ke hoach», kể cả khi dùng giao diện tiếng Anh. Câu vẫn hiểu được phần nào nhưng trông như lỗi chưa hoàn thiện.
  file: `apps/app/app/(app)/[slug]/okr/soan/hoi-thoai-soan.tsx`
  severity: high
  Đề xuất: new-contract

- **Schema kết quả nộp có hai bản: bản đầy đủ ở agent, bản rút gọn viết tay ở packages/validation**
  Người dùng thấy gì: Nếu sau này cách Kara báo kết quả nộp đổi hình dạng, màn soạn sẽ không báo lỗi lúc dựng mà chỉ hiện «không đọc được kết quả» cho người dùng. Hiện tại không ảnh hưởng ai.
  file: `packages/validation/src/okr-cuoc-soan.ts`
  severity: medium
  Đề xuất: known-limits

- **E5 hứa output dựng bằng ketQuaNop thật của agent, nhưng bài kiểm viết tay**
  Người dùng thấy gì: Các bài kiểm dùng kết quả nộp giả tự soạn, nên nếu cách Kara báo kết quả đổi, bài kiểm vẫn xanh trong khi màn có thể hiển thị sai. Người dùng không thấy ngay, nhưng lỗi có thể lọt qua.
  file: `apps/app/test/soan-okr-khong-lac.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét lớp nhưng một nhánh quét rỗng: glob soan/ trong mot-nguon.mjs khớp 0 tệp**
  Người dùng thấy gì: Bộ kiểm dùng để ngăn ai khai lại danh sách trạng thái nộp ở phía màn thực ra không quét phần màn. Nếu có người khai trùng lần nữa, hai nơi có thể lệch nhau và người dùng thấy trạng thái nộp sai mà không ai được cảnh báo.
  file: `_acceptance/soan-okr-khong-lac/rang/mot-nguon.mjs`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 5 — ma trận DOM của E6 chỉ có một ô: ca lỗi công cụ ('loi') không có bài DOM, và lệnh k2b_moc_hong không chạy DOM**
  Người dùng thấy gì: Dòng báo «Kara nộp bản nháp chưa được» khi công cụ nộp bị lỗi chưa được thử trên màn thật, chỉ thử ở tầng dựng dữ liệu. Nếu dòng này hiển thị sai thì chưa có bài kiểm nào bắt được.
  file: `_acceptance/soan-okr-khong-lac/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — chiều đỏ E6 khai «vết (e) → ca (a) đỏ 'goc so sanh sai'» nhưng dot-bien.mjs không chạy ô đó**
  Người dùng thấy gì: Một nhánh kiểm về việc so sánh bản nháp sau lần nộp lỗi chưa được chứng minh là bắt được lỗi khi cố ý phá. Người dùng có thể thấy số KR thêm bị tính sai mà bài kiểm vẫn xanh.
  file: `_acceptance/soan-okr-khong-lac/rang/dot-bien.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — kết quả nộp viết tay theo khuôn bên đọc, không lấy từ ketQuaNop của agent như E5 hứa**
  Người dùng thấy gì: Bài kiểm chỉ chứng minh màn đọc được thứ do chính bài kiểm tự tạo, không chứng minh đọc được kết quả Kara thật. Nếu Kara đổi cách báo kết quả, người dùng có thể thấy màn hỏng mà bài kiểm không cảnh báo.
  file: `apps/app/test/soan-okr-khong-lac.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — bài gioNopCuoi chỉ có vế âm «không theo lần bị từ chối», thiếu đối chứng «theo lần đã ghi CUỐI»**
  Người dùng thấy gì: Giờ «sửa lúc HH:MM» của bản nháp hiện đúng, nhưng nếu sau này có người lỡ đổi sang lấy giờ lần nộp đầu tiên thì bài kiểm không bắt được và người dùng sẽ thấy giờ cũ.
  file: `apps/app/test/soan-okr-khong-lac.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — mốc chỉ được kiểm «thuộc tập {n1, n3}» trong khi lời hứa là cặp thứ tự [lần 1, lần 3]**
  Người dùng thấy gì: Bài kiểm có thể không phân biệt được hai mốc nếu chúng bị đảo thứ tự hoặc trùng nhau. Khả năng xảy ra thấp và người dùng chỉ thấy lộn xộn nhẹ trong hội thoại.
  file: `apps/app/test/soan-okr-khong-lac.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 — round-trip trong mot-nguon.mjs đưa object viết tay qua parse, không dùng tuChoi thật như E7 hứa**
  Người dùng thấy gì: Bài thử đọc-ghi kết quả bị từ chối dùng dữ liệu tự viết thay vì dữ liệu Kara thật tạo ra. Chi phí sửa lớn hơn hậu quả vì AC-10 đã chạy đường thật từ Kara tới màn.
  file: `_acceptance/soan-okr-khong-lac/rang/mot-nguon.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
