# Review findings: tro-ly-okr-de-xuat (round 1)

## Trong hợp đồng

- **Hình dạng 4 — âm-tính-một-mình: tai-lieu.mjs không có đối chứng dương cho danh sách thủ tục rút từ router và bỏ qua im lặng phần chỗ rẽ 9b**
  file: `_acceptance/tro-ly-okr-de-xuat/rang/tai-lieu.mjs:66`
  severity: medium
  AC: AC-15
  source: measurement
  detail: Hai chỗ trong cùng thước E27. (1) `tenThuTucTuRouter` (dòng 63–70) grep nguồn bằng regex `^\t(troLy[A-Za-z]+|xuHuongKr)\(` — hiện khớp đúng 7 dòng, nhưng không có khẳng định `ten.size > 0` hay `ten.size === 7`; nếu định dạng router đổi (thụt bằng khoảng trắng, decorator cùng dòng, đổi tên tiền tố) thì tập rỗng, `kiemApiMd` trả `[]`, thước xanh trong khi docs/api.md có thể thiếu hết. Lời hứa «bản sao docs/api.md xoá một tên → 'tai lieu thieu thu tuc: <ten>'» chỉ đúng khi regex còn khớp — không có gì ghim điều đó. (2) `tapTepHangTrongDiff` (dòng 96–103) bắt mọi lỗi git rồi trả `null`, và dòng 119 `if (tapDiff === null) return []` — thiếu `origin/onehub` hoặc `origin/release` là phần kiểm chỗ rẽ 9b bị bỏ qua, thoát 0 với dòng «du» ở cuối. Cả hai đều là khẳng định «không thiếu» mà không có bằng chứng «có thứ để so».
  rationale: AC-15 đòi docs/api.md nêu bảy thủ tục mới và docs/agent.md liệt kê tệp chỗ rẽ; thước kiểm này có thể xanh trống khi định dạng router đổi hoặc thiếu ref.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Biến môi trường TDX_* mới không được khai trong .env.example**
  Người dùng thấy gì: Ba núm chỉnh chỉ dùng khi chạy bài đo góp ý chưa được ghi chú ở nơi mọi người tra cứu cấu hình. Người mới chạy bài đo sẽ không biết các núm này tồn tại, nhưng người dùng cuối không bị ảnh hưởng.
  file: `apps/agent/agent/lib/okr/config.ts`
  severity: medium
  Đề xuất: known-limits

- **Payload của việc okr-de-xuat bị parse hai lần bằng hai khuôn khác nhau trong cùng đường đọc**
  Người dùng thấy gì: Số đo góp ý bật hay ẩn trên thẻ quản trị hiện đúng. Nhưng nếu sau này ai đó đổi mặc định của chế độ bật/ẩn ở một chỗ mà quên chỗ kia, số trên thẻ có thể lệch mà không ai hay.
  file: `apps/api/src/okr/tro-ly-so-do.ts`
  severity: medium
  Đề xuất: known-limits

- **Tiền tố ghi chú vết «tro-ly-okr:» được đúc lại bằng regex ở client thay vì dùng chung một nguồn**
  Người dùng thấy gì: Nhãn «theo đề xuất của Trợ lý OKR» trên tab Vết hiện đúng bây giờ. Nếu sau này chuỗi đánh dấu bị đổi ở một phía, nhãn này sẽ biến mất trên màn mà không có cảnh báo nào.
  file: `apps/app/app/(app)/[slug]/okr/bang-vet.tsx`
  severity: medium
  Đề xuất: known-limits

- **KIEU_KR bị chép lại trong @crm/db thay vì có một nguồn duy nhất**
  Người dùng thấy gì: Danh sách sáu kiểu KR được khai ở hai nơi. Hiện tại chúng khớp nhau và có bài kiểm canh, nên người dùng không thấy khác biệt nào.
  file: `packages/db/src/okr-xu-huong.ts`
  severity: low
  Đề xuất: wont-fix

- **okr.troLyAn tải toàn bộ lượt trong tháng rồi lọc và cắt 50 trong bộ nhớ**
  Người dùng thấy gì: Khi quản trị mở thẻ «Góp ý của Trợ lý OKR», hệ thống đọc cả tháng dữ liệu rồi mới cắt bớt. Với lượng dùng hiện nay vẫn đúng, nhưng thẻ có thể mở chậm dần khi số lượt ẩn trong tháng lớn lên.
  file: `apps/api/src/okr/tro-ly.service.ts`
  severity: low
  Đề xuất: known-limits

- **okr.troLyDanhSach là @Query (GET) nhưng ghi okrDeXuat (het-han, hienLuc)**
  Người dùng thấy gì: Việc mở cột góp ý có ghi dấu «đã hiện» và đánh dấu hết hạn ngay khi đọc danh sách, thay vì qua một thao tác ghi riêng. Người dùng không thấy khác biệt; chỉ là cách làm không giống chỗ khác trong màn OKR.
  file: `packages/db/src/okr-de-xuat.ts`
  severity: low
  Đề xuất: wont-fix

- **Ba truy vấn JSON-path theo payload.nac không thấy AgentTask cũ (payload chưa có khoá nac)**
  Người dùng thấy gì: Lượt góp ý cũ tạo trước bản này có thể không được nhận ra là đang chạy, nên người dùng có thể bị tạo thêm một lượt song song ngay lúc triển khai. Chỉ xảy ra nếu còn lượt cũ đang chạy đúng thời điểm đó.
  file: `packages/db/src/okr-tro-ly.ts`
  severity: low
  Đề xuất: wont-fix

- **kichLuotAn nuốt thông điệp lỗi, chỉ ghi tên lớp lỗi**
  Người dùng thấy gì: Nếu việc xếp lượt góp ý ẩn hỏng lặp đi lặp lại, người lưu Mục tiêu không bị chặn nhưng nhật ký chỉ nói loại lỗi chứ không nói lý do. Người vận hành sẽ khó tìm nguyên nhân khi chế độ ẩn im lặng không chạy.
  file: `apps/api/src/okr/okr.service.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — fixture viết tay đúng khuôn bên đọc: `goiTuCa` tự dựng GoiKiem thay vì đi qua bên ghi `goiKiemTu`**
  Người dùng thấy gì: Bài kiểm bộ lọc góp ý dùng gói dữ liệu dựng tay chứ không đi qua đoạn mã dựng gói thật. Nếu đoạn dựng thật ánh xạ sai một trường, bài kiểm vẫn xanh nhưng bộ lọc có thể chạy trên dữ liệu lệch ngoài đời.
  file: `packages/validation/test/okr-kiem-de-xuat.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — âm-tính-một-mình: ca «không thấy dòng ẩn» ở nấc an khẳng định tập rỗng khi API về cấu trúc đã luôn trả rỗng**
  Người dùng thấy gì: Một bài kiểm việc «người dùng không thấy góp ý ẩn» luôn xanh vì hệ thống ở chế độ đó vốn trả danh sách rỗng. Nếu bộ lọc ẩn bị gỡ nhầm thì bài này không bắt được, dù một bài khác trong cùng tệp vẫn canh phần đó.
  file: `apps/api/test/tro-ly-okr-che-do-an.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét lớp «một mỗi mã» nhưng danh sách 10 mã chép cứng, không rút từ MA_LOAI_DE_XUAT**
  Người dùng thấy gì: Bài kiểm nộp mười dòng bị loại dùng danh sách mười mã viết cứng. Nếu sau này thêm mã loại thứ mười một, bài này vẫn xanh mà không kiểm mã mới.
  file: `apps/agent/test/tro-ly-okr-nop.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
